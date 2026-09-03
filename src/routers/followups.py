import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models import YuktiVendorFollowup, YuktiUser, YuktiAuditEvent
from src.auth.security import get_current_user
from src.services.email_service import send_vendor_followup_email

router = APIRouter(prefix="/api/v1/followups", tags=["Vendor Follow-up System"])


class FollowupCreateRequest(BaseModel):
    client_id: str = "c1"
    vendor_gstin: str
    vendor_name: str
    vendor_email: Optional[str] = None
    vendor_phone: Optional[str] = None
    invoice_no: str
    tax_amount: float
    discrepancy_type: str = "MISSING_IN_2B"
    drafted_message: str
    channel: str = "email"


class FollowupSendRequest(BaseModel):
    channel: Optional[str] = "email"
    override_message: Optional[str] = None


@router.get("")
async def list_followups(
    client_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    stmt = select(YuktiVendorFollowup).where(YuktiVendorFollowup.firm_id == current_user.firm_id)
    if client_id:
        stmt = stmt.where(YuktiVendorFollowup.client_id == client_id)
    if status_filter:
        stmt = stmt.where(YuktiVendorFollowup.status == status_filter)
    stmt = stmt.order_by(YuktiVendorFollowup.created_at.desc())
    res = await session.execute(stmt)
    items = res.scalars().all()
    return [item.to_dict() for item in items]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_followup(
    req: FollowupCreateRequest,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    followup_id = str(uuid.uuid4())
    followup = YuktiVendorFollowup(
        id=followup_id,
        firm_id=current_user.firm_id,
        client_id=req.client_id,
        vendor_gstin=req.vendor_gstin,
        vendor_name=req.vendor_name,
        vendor_email=req.vendor_email,
        vendor_phone=req.vendor_phone,
        invoice_no=req.invoice_no,
        tax_amount=req.tax_amount,
        discrepancy_type=req.discrepancy_type,
        drafted_message=req.drafted_message,
        channel=req.channel,
        status="drafted"
    )
    session.add(followup)

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="CREATE_VENDOR_FOLLOWUP",
        entity_type="vendor_followup",
        entity_id=followup_id,
        details={"vendor": req.vendor_name, "invoice_no": req.invoice_no}
    )
    session.add(audit)
    await session.commit()
    return followup.to_dict()


@router.post("/{followup_id}/send")
async def send_followup(
    followup_id: str,
    req: FollowupSendRequest,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiVendorFollowup).where(
            YuktiVendorFollowup.id == followup_id,
            YuktiVendorFollowup.firm_id == current_user.firm_id
        )
    )
    followup = res.scalars().first()
    if not followup:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    message_text = req.override_message or followup.drafted_message
    recipient_email = followup.vendor_email or f"accounts@{followup.vendor_name.lower().replace(' ', '')}.com"

    dispatch_res = await send_vendor_followup_email(
        to_email=recipient_email,
        vendor_name=followup.vendor_name,
        client_name="Reliance Logistics Pvt Ltd",
        invoice_no=followup.invoice_no,
        tax_amount=followup.tax_amount,
        body_text=message_text
    )

    followup.status = "sent"
    followup.sent_at = datetime.utcnow()

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="SEND_VENDOR_FOLLOWUP",
        entity_type="vendor_followup",
        entity_id=followup.id,
        details={"channel": req.channel, "recipient": recipient_email}
    )
    session.add(audit)
    await session.commit()

    return {
        "success": True,
        "message": f"Follow-up dispatched successfully to {followup.vendor_name}.",
        "delivery": dispatch_res,
        "followup": followup.to_dict()
    }


@router.patch("/{followup_id}/resolve")
async def resolve_followup(
    followup_id: str,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiVendorFollowup).where(
            YuktiVendorFollowup.id == followup_id,
            YuktiVendorFollowup.firm_id == current_user.firm_id
        )
    )
    followup = res.scalars().first()
    if not followup:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    followup.status = "resolved"

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="RESOLVE_VENDOR_FOLLOWUP",
        entity_type="vendor_followup",
        entity_id=followup.id,
        details={"vendor": followup.vendor_name, "invoice_no": followup.invoice_no}
    )
    session.add(audit)
    await session.commit()

    return {"success": True, "followup": followup.to_dict()}
