from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models import (
    YuktiInvoice,
    YuktiVendorPattern,
    YuktiUser,
    YuktiAuditEvent,
    InvoiceStatus,
)
from src.auth.security import get_current_user

router = APIRouter(prefix="/api/v1/invoices", tags=["Invoice Review Queue"])


class InvoiceUpdateRequest(BaseModel):
    supplier_name: Optional[str] = None
    supplier_gstin: Optional[str] = None
    invoice_no: Optional[str] = None
    invoice_date: Optional[str] = None
    taxable_value: Optional[float] = None
    cgst: Optional[float] = None
    sgst: Optional[float] = None
    igst: Optional[float] = None
    grand_total: Optional[float] = None
    suggested_ledger: Optional[str] = None
    hsn_code: Optional[str] = None
    supply_type: Optional[str] = None
    save_as_pattern: Optional[bool] = True


@router.get("")
async def list_invoices(
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    stmt = select(YuktiInvoice).where(YuktiInvoice.firm_id == current_user.firm_id)
    if client_id:
        stmt = stmt.where(YuktiInvoice.client_id == client_id)
    if status and status != "all":
        try:
            status_enum = InvoiceStatus(status.lower())
            stmt = stmt.where(YuktiInvoice.status == status_enum)
        except ValueError:
            pass

    stmt = stmt.order_by(YuktiInvoice.created_at.desc())
    res = await session.execute(stmt)
    invoices = res.scalars().all()
    return [inv.to_dict() for inv in invoices]


@router.patch("/{invoice_id}/approve")
async def approve_invoice(
    invoice_id: str,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiInvoice).where(
            YuktiInvoice.id == invoice_id,
            YuktiInvoice.firm_id == current_user.firm_id
        )
    )
    invoice = res.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.status = InvoiceStatus.APPROVED
    invoice.routing_decision = "APPROVED"

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="APPROVE_INVOICE",
        entity_type="invoice",
        entity_id=invoice.id,
        details={"invoice_no": invoice.invoice_no, "supplier": invoice.supplier_name}
    )
    session.add(audit)
    await session.commit()
    return {"success": True, "invoice": invoice.to_dict()}


@router.patch("/{invoice_id}/reject")
async def reject_invoice(
    invoice_id: str,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiInvoice).where(
            YuktiInvoice.id == invoice_id,
            YuktiInvoice.firm_id == current_user.firm_id
        )
    )
    invoice = res.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.status = InvoiceStatus.FLAGGED
    invoice.routing_decision = "REJECTED"

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="REJECT_INVOICE",
        entity_type="invoice",
        entity_id=invoice.id,
        details={"invoice_no": invoice.invoice_no, "supplier": invoice.supplier_name}
    )
    session.add(audit)
    await session.commit()
    return {"success": True, "invoice": invoice.to_dict()}


@router.put("/{invoice_id}")
async def update_invoice(
    invoice_id: str,
    req: InvoiceUpdateRequest,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiInvoice).where(
            YuktiInvoice.id == invoice_id,
            YuktiInvoice.firm_id == current_user.firm_id
        )
    )
    invoice = res.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if req.supplier_name is not None:
        invoice.supplier_name = req.supplier_name
    if req.supplier_gstin is not None:
        invoice.supplier_gstin = req.supplier_gstin.upper()
    if req.invoice_no is not None:
        invoice.invoice_no = req.invoice_no
    if req.invoice_date is not None:
        invoice.invoice_date = req.invoice_date
    if req.taxable_value is not None:
        invoice.taxable_value = req.taxable_value
    if req.cgst is not None:
        invoice.cgst = req.cgst
    if req.sgst is not None:
        invoice.sgst = req.sgst
    if req.igst is not None:
        invoice.igst = req.igst
    if req.grand_total is not None:
        invoice.grand_total = req.grand_total
    if req.suggested_ledger is not None:
        invoice.suggested_ledger = req.suggested_ledger
    if req.hsn_code is not None:
        invoice.hsn_code = req.hsn_code
    if req.supply_type is not None:
        invoice.supply_type = req.supply_type

    invoice.status = InvoiceStatus.APPROVED
    invoice.routing_decision = "AUTO_POSTED"

    # Learn vendor pattern flywheel
    if req.save_as_pattern and invoice.supplier_gstin:
        gstin_clean = invoice.supplier_gstin.strip().upper()
        pat_res = await session.execute(
            select(YuktiVendorPattern).where(
                YuktiVendorPattern.supplier_gstin == gstin_clean,
                YuktiVendorPattern.firm_id == current_user.firm_id
            )
        )
        pattern = pat_res.scalars().first()
        if pattern:
            pattern.supplier_name = invoice.supplier_name
            pattern.default_ledger = invoice.suggested_ledger
            pattern.hsn_override = invoice.hsn_code
            pattern.corrections_count += 1
            pattern.last_corrected = "Today"
        else:
            new_pat = YuktiVendorPattern(
                supplier_gstin=gstin_clean,
                firm_id=current_user.firm_id,
                supplier_name=invoice.supplier_name,
                default_ledger=invoice.suggested_ledger,
                default_gst_rate=18.0 if invoice.cgst > 0 else 5.0,
                hsn_override=invoice.hsn_code,
                corrections_count=1,
                last_corrected="Today"
            )
            session.add(new_pat)

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="EDIT_AND_POST_INVOICE",
        entity_type="invoice",
        entity_id=invoice.id,
        details={"invoice_no": invoice.invoice_no, "vendor_pattern_saved": bool(req.save_as_pattern)}
    )
    session.add(audit)
    await session.commit()
    return {"success": True, "invoice": invoice.to_dict()}
