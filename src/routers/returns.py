import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response, Form
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models import (
    YuktiReturn,
    YuktiReconciliationRun,
    YuktiClient,
    YuktiUser,
    YuktiAuditEvent,
)
from src.auth.security import get_current_user
from src.services.gstn_generator import (
    generate_gstr1_json,
    generate_gstr3b_json,
    run_return_cross_validation,
)

router = APIRouter(prefix="/api/v1/returns", tags=["GST Returns Preparation"])


class ReturnApproveRequest(BaseModel):
    client_id: str = "c1"
    filing_period: str = "072026"
    return_type: str = "all"  # 'gstr1', 'gstr3b', 'all'


class ReturnMarkFiledRequest(BaseModel):
    client_id: str = "c1"
    filing_period: str = "072026"
    acknowledgment_number: str
    return_type: str = "all"


@router.get("/summary")
async def get_return_summary(
    client_id: str = "c1",
    period: str = "072026",
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Fetch client details
    client_res = await session.execute(
        select(YuktiClient).where(YuktiClient.id == client_id)
    )
    client = client_res.scalars().first()
    gstin = client.primary_gstin if client else "27AAACR5055K1Z2"
    client_name = client.business_name if client else "Reliance Logistics Pvt Ltd"

    # Fetch latest reconciliation for eligible ITC
    recon_res = await session.execute(
        select(YuktiReconciliationRun)
        .where(
            YuktiReconciliationRun.firm_id == current_user.firm_id,
            YuktiReconciliationRun.client_id == client_id
        )
        .order_by(YuktiReconciliationRun.run_date.desc())
    )
    latest_recon = recon_res.scalars().first()
    reconciled_eligible_itc = 4256000.0
    if latest_recon and latest_recon.result_json.get("summary"):
        val = float(latest_recon.result_json["summary"].get("totalEligibleITC", 0.0))
        if val > 100000.0:
            reconciled_eligible_itc = val

    # Generate returns and cross-validation
    gstr1_data = generate_gstr1_json(gstin=gstin, fp=period)
    gstr3b_data = generate_gstr3b_json(
        gstin=gstin,
        fp=period,
        reconciled_eligible_itc=reconciled_eligible_itc
    )
    cross_val = run_return_cross_validation(
        gstr1=gstr1_data,
        gstr3b=gstr3b_data,
        reconciled_eligible_itc=reconciled_eligible_itc
    )

    # Check database return record status
    ret_res = await session.execute(
        select(YuktiReturn).where(
            YuktiReturn.firm_id == current_user.firm_id,
            YuktiReturn.client_id == client_id,
            YuktiReturn.filing_period == period
        )
    )
    ret_record = ret_res.scalars().first()
    return_status = ret_record.status if ret_record else "draft"
    filing_ack = ret_record.filing_acknowledgment if ret_record else None

    # Calculate financial totals
    outward_taxable = 3150000.0
    outward_tax = 567000.0
    rule_37_rev = 38850.0
    net_eligible_itc = reconciled_eligible_itc - rule_37_rev
    net_cash = max(0.0, outward_tax - net_eligible_itc)

    return {
        "clientName": client_name,
        "gstin": gstin,
        "period": "July 2026" if period == "072026" else period,
        "periodCode": period,
        "status": return_status,
        "filingAcknowledgment": filing_ack,
        "outwardTaxableTotal": outward_taxable,
        "outwardTaxTotal": outward_tax,
        "eligibleItcTotal": net_eligible_itc,
        "rule37Reversal": rule_37_rev,
        "netCashPayable": net_cash,
        "gstr1": gstr1_data,
        "gstr3b": gstr3b_data,
        "crossValidation": cross_val
    }


@router.post("/approve")
async def approve_returns(
    req: ReturnApproveRequest,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    ret_res = await session.execute(
        select(YuktiReturn).where(
            YuktiReturn.firm_id == current_user.firm_id,
            YuktiReturn.client_id == req.client_id,
            YuktiReturn.filing_period == req.filing_period
        )
    )
    ret_record = ret_res.scalars().first()
    if not ret_record:
        ret_record = YuktiReturn(
            id=str(uuid.uuid4()),
            firm_id=current_user.firm_id,
            client_id=req.client_id,
            return_type=req.return_type,
            filing_period=req.filing_period,
            status="approved",
            generated_json={},
            approved_by=current_user.full_name,
            approved_at=datetime.utcnow()
        )
        session.add(ret_record)
    else:
        ret_record.status = "approved"
        ret_record.approved_by = current_user.full_name
        ret_record.approved_at = datetime.utcnow()

    # Update client return status
    client_res = await session.execute(
        select(YuktiClient).where(YuktiClient.id == req.client_id)
    )
    client = client_res.scalars().first()
    if client:
        client.gstr1_status = "Approved for Filing"
        client.gstr3b_status = "Approved for Filing"

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="APPROVE_RETURNS",
        entity_type="return",
        entity_id=ret_record.id,
        details={"period": req.filing_period, "approved_by": current_user.full_name}
    )
    session.add(audit)
    await session.commit()

    return {
        "success": True,
        "message": f"Returns approved for period {req.filing_period}. Ready for portal submission.",
        "status": "approved"
    }


@router.post("/mark-filed")
async def mark_return_filed(
    req: ReturnMarkFiledRequest,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    ret_res = await session.execute(
        select(YuktiReturn).where(
            YuktiReturn.firm_id == current_user.firm_id,
            YuktiReturn.client_id == req.client_id,
            YuktiReturn.filing_period == req.filing_period
        )
    )
    ret_record = ret_res.scalars().first()
    if not ret_record:
        ret_record = YuktiReturn(
            id=str(uuid.uuid4()),
            firm_id=current_user.firm_id,
            client_id=req.client_id,
            return_type=req.return_type,
            filing_period=req.filing_period,
            status="filed",
            generated_json={},
            filing_acknowledgment=req.acknowledgment_number,
            filed_at=datetime.utcnow()
        )
        session.add(ret_record)
    else:
        ret_record.status = "filed"
        ret_record.filing_acknowledgment = req.acknowledgment_number
        ret_record.filed_at = datetime.utcnow()

    # Update client status
    client_res = await session.execute(
        select(YuktiClient).where(YuktiClient.id == req.client_id)
    )
    client = client_res.scalars().first()
    if client:
        client.gstr1_status = "Filed (ARN: " + req.acknowledgment_number[:10] + "...)"
        client.gstr3b_status = "Filed (ARN: " + req.acknowledgment_number[:10] + "...)"

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="MARK_RETURN_FILED",
        entity_type="return",
        entity_id=ret_record.id,
        details={"period": req.filing_period, "arn": req.acknowledgment_number}
    )
    session.add(audit)
    await session.commit()

    return {
        "success": True,
        "message": f"Filing confirmed with ARN {req.acknowledgment_number}.",
        "status": "filed"
    }


@router.get("/gstr1/download-json")
async def download_gstr1_json(
    client_id: str = "c1",
    period: str = "072026",
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    client_res = await session.execute(
        select(YuktiClient).where(YuktiClient.id == client_id)
    )
    client = client_res.scalars().first()
    gstin = client.primary_gstin if client else "27AAACR5055K1Z2"

    gstr1_data = generate_gstr1_json(gstin=gstin, fp=period)
    json_bytes = json.dumps(gstr1_data, indent=2).encode('utf-8')
    headers = {
        "Content-Disposition": f"attachment; filename=GSTR1_{gstin}_{period}.json"
    }
    return Response(
        content=json_bytes,
        media_type="application/json",
        headers=headers
    )


@router.get("/gstr3b/download-json")
async def download_gstr3b_json(
    client_id: str = "c1",
    period: str = "072026",
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    client_res = await session.execute(
        select(YuktiClient).where(YuktiClient.id == client_id)
    )
    client = client_res.scalars().first()
    gstin = client.primary_gstin if client else "27AAACR5055K1Z2"

    # Fetch latest reconciliation for eligible ITC
    recon_res = await session.execute(
        select(YuktiReconciliationRun)
        .where(
            YuktiReconciliationRun.firm_id == current_user.firm_id,
            YuktiReconciliationRun.client_id == client_id
        )
        .order_by(YuktiReconciliationRun.run_date.desc())
    )
    latest_recon = recon_res.scalars().first()
    reconciled_eligible_itc = 4256000.0
    if latest_recon and latest_recon.result_json.get("summary"):
        val = float(latest_recon.result_json["summary"].get("totalEligibleITC", 0.0))
        if val > 100000.0:
            reconciled_eligible_itc = val

    gstr3b_data = generate_gstr3b_json(
        gstin=gstin,
        fp=period,
        reconciled_eligible_itc=reconciled_eligible_itc
    )
    json_bytes = json.dumps(gstr3b_data, indent=2).encode('utf-8')
    headers = {
        "Content-Disposition": f"attachment; filename=GSTR3B_{gstin}_{period}.json"
    }
    return Response(
        content=json_bytes,
        media_type="application/json",
        headers=headers
    )
