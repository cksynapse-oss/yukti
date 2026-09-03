import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_async_session
from models import (
    YuktiClient,
    YuktiInvoice,
    YuktiGstr2bRecord,
    YuktiUser,
    YuktiAuditEvent,
    InvoiceStatus,
)
from src.auth.security import get_current_user
from reconciliation import parse_tally_file, parse_gstr2b_file

router = APIRouter(prefix="/api/v1/clients", tags=["Client Management"])


class ClientCreateRequest(BaseModel):
    business_name: str
    primary_gstin: str
    pan: Optional[str] = None
    industry: Optional[str] = "Logistics & Transport"
    turnover: Optional[str] = "₹10 Cr - ₹25 Cr"
    assigned_senior_id: Optional[str] = None
    assigned_junior_id: Optional[str] = None


class ClientUpdateRequest(BaseModel):
    business_name: Optional[str] = None
    primary_gstin: Optional[str] = None
    pan: Optional[str] = None
    industry: Optional[str] = None
    turnover: Optional[str] = None
    status: Optional[str] = None
    assigned_senior_id: Optional[str] = None
    assigned_junior_id: Optional[str] = None


@router.get("")
async def list_clients(
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiClient).where(YuktiClient.firm_id == current_user.firm_id)
    )
    clients = res.scalars().all()
    results = []
    for client in clients:
        c_dict = client.to_dict()
        # Count pending exceptions
        count_res = await session.execute(
            select(func.count(YuktiInvoice.id))
            .where(
                YuktiInvoice.client_id == client.id,
                YuktiInvoice.status == InvoiceStatus.PENDING
            )
        )
        c_dict["exceptions_count"] = count_res.scalar() or 0
        results.append(c_dict)
    return results


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_client(
    req: ClientCreateRequest,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    client_id = str(uuid.uuid4())
    client = YuktiClient(
        id=client_id,
        firm_id=current_user.firm_id,
        business_name=req.business_name,
        primary_gstin=req.primary_gstin.upper(),
        pan=req.pan.upper() if req.pan else req.primary_gstin[2:12].upper(),
        industry=req.industry or "General Business",
        turnover=req.turnover or "₹5 Cr - ₹10 Cr",
        assigned_senior_id=req.assigned_senior_id,
        assigned_junior_id=req.assigned_junior_id,
        status="active",
        gstr1_status="Ready to Review",
        gstr3b_status="Pending Recon",
        auto_post_pct=85.0,
        itc_at_risk=0.0
    )
    session.add(client)

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="CREATE_CLIENT",
        entity_type="client",
        entity_id=client_id,
        details={"business_name": req.business_name, "gstin": req.primary_gstin}
    )
    session.add(audit)
    await session.commit()
    return client.to_dict()


@router.get("/{client_id}")
async def get_client(
    client_id: str,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiClient).where(
            YuktiClient.id == client_id,
            YuktiClient.firm_id == current_user.firm_id
        )
    )
    client = res.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    count_res = await session.execute(
        select(func.count(YuktiInvoice.id))
        .where(
            YuktiInvoice.client_id == client.id,
            YuktiInvoice.status == InvoiceStatus.PENDING
        )
    )
    c_dict = client.to_dict()
    c_dict["exceptions_count"] = count_res.scalar() or 0
    return c_dict


@router.put("/{client_id}")
async def update_client(
    client_id: str,
    req: ClientUpdateRequest,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiClient).where(
            YuktiClient.id == client_id,
            YuktiClient.firm_id == current_user.firm_id
        )
    )
    client = res.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    for k, v in req.dict(exclude_unset=True).items():
        setattr(client, k, v)

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="UPDATE_CLIENT",
        entity_type="client",
        entity_id=client_id,
        details={"updated_fields": req.dict(exclude_unset=True)}
    )
    session.add(audit)
    await session.commit()
    return client.to_dict()


@router.post("/{client_id}/import-tally")
async def import_tally_purchase_register(
    client_id: str,
    file: UploadFile = File(...),
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiClient).where(
            YuktiClient.id == client_id,
            YuktiClient.firm_id == current_user.firm_id
        )
    )
    client = res.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    content = await file.read()
    parsed_invoices = parse_tally_file(content, file.filename)
    if not parsed_invoices:
        raise HTTPException(status_code=400, detail="Could not parse any purchase records from file.")

    imported_count = 0
    for item in parsed_invoices:
        inv = YuktiInvoice(
            id=str(uuid.uuid4()),
            firm_id=current_user.firm_id,
            client_id=client.id,
            customer_name=client.business_name,
            direction="purchase",
            supplier_name=item.get("vendor_name", "Supplier"),
            supplier_gstin=item.get("vendor_gstin", "27AAAAA0000A1Z5"),
            invoice_no=item.get("invoice_number", f"INV-{imported_count+1}"),
            invoice_date=item.get("invoice_date", "2026-07-15"),
            grand_total=float(item.get("total", 0.0)),
            taxable_value=float(item.get("taxable_value", 0.0)),
            cgst=float(item.get("cgst", 0.0)),
            sgst=float(item.get("sgst", 0.0)),
            igst=float(item.get("igst", 0.0)),
            confidence_score=95.0,
            routing_decision="AUTO_POSTED",
            status=InvoiceStatus.APPROVED,
            suggested_ledger="General Purchase Account",
            supply_type="INTERSTATE" if float(item.get("igst", 0.0)) > 0 else "INTRASTATE",
        )
        session.add(inv)
        imported_count += 1

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="IMPORT_TALLY_REGISTER",
        entity_type="client",
        entity_id=client_id,
        details={"count": imported_count, "filename": file.filename}
    )
    session.add(audit)
    await session.commit()

    return {
        "success": True,
        "message": f"Successfully imported {imported_count} purchase vouchers into client books.",
        "count": imported_count
    }


@router.post("/{client_id}/import-gstr2b")
async def import_gstr2b_statement(
    client_id: str,
    filing_period: str = Form("072026"),
    file: UploadFile = File(...),
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiClient).where(
            YuktiClient.id == client_id,
            YuktiClient.firm_id == current_user.firm_id
        )
    )
    client = res.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    content = await file.read()
    parsed_records = parse_gstr2b_file(content, file.filename)
    if not parsed_records:
        raise HTTPException(status_code=400, detail="Could not parse any GSTR-2B records from file.")

    imported_count = 0
    for item in parsed_records:
        g2b = YuktiGstr2bRecord(
            id=str(uuid.uuid4()),
            firm_id=current_user.firm_id,
            client_id=client.id,
            filing_period=filing_period,
            vendor_gstin=item.get("vendor_gstin", "27AAAAA0000A1Z5"),
            vendor_name=item.get("vendor_name", "Supplier"),
            invoice_number=item.get("invoice_number", ""),
            invoice_date=item.get("invoice_date", ""),
            taxable_value=float(item.get("taxable_value", 0.0)),
            cgst=float(item.get("cgst", 0.0)),
            sgst=float(item.get("sgst", 0.0)),
            igst=float(item.get("igst", 0.0)),
            total_amount=float(item.get("total", 0.0)),
            itc_available=item.get("itc_available", True),
        )
        session.add(g2b)
        imported_count += 1

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="IMPORT_GSTR2B",
        entity_type="client",
        entity_id=client_id,
        details={"count": imported_count, "period": filing_period, "filename": file.filename}
    )
    session.add(audit)
    await session.commit()

    return {
        "success": True,
        "message": f"Successfully ingested {imported_count} portal records for period {filing_period}.",
        "count": imported_count
    }
