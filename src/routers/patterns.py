from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models import YuktiVendorPattern, YuktiUser, YuktiAuditEvent
from src.auth.security import get_current_user

router = APIRouter(prefix="/api/v1/vendor-patterns", tags=["Vendor Pattern Learning Memory"])


class VendorPatternCreateRequest(BaseModel):
    supplier_gstin: str
    supplier_name: str
    default_ledger: Optional[str] = "General Purchase Account"
    default_gst_rate: Optional[float] = 18.0
    hsn_override: Optional[str] = None
    date_format_hint: Optional[str] = "YYYY-MM-DD"
    invoice_regex: Optional[str] = None
    notes: Optional[str] = None


@router.get("")
async def list_vendor_patterns(
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    stmt = select(YuktiVendorPattern).where(
        YuktiVendorPattern.firm_id == current_user.firm_id
    )
    res = await session.execute(stmt)
    patterns = res.scalars().all()
    return [p.to_dict() for p in patterns]


@router.post("")
async def create_or_update_vendor_pattern(
    req: VendorPatternCreateRequest,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    gstin_clean = req.supplier_gstin.strip().upper()
    pat_res = await session.execute(
        select(YuktiVendorPattern).where(
            YuktiVendorPattern.supplier_gstin == gstin_clean,
            YuktiVendorPattern.firm_id == current_user.firm_id
        )
    )
    pattern = pat_res.scalars().first()
    if pattern:
        pattern.supplier_name = req.supplier_name
        pattern.default_ledger = req.default_ledger or pattern.default_ledger
        pattern.default_gst_rate = req.default_gst_rate or pattern.default_gst_rate
        pattern.hsn_override = req.hsn_override or pattern.hsn_override
        pattern.corrections_count += 1
        pattern.last_corrected = "Today"
    else:
        pattern = YuktiVendorPattern(
            supplier_gstin=gstin_clean,
            firm_id=current_user.firm_id,
            supplier_name=req.supplier_name,
            default_ledger=req.default_ledger or "General Purchase Account",
            default_gst_rate=req.default_gst_rate or 18.0,
            hsn_override=req.hsn_override,
            date_format_hint=req.date_format_hint or "YYYY-MM-DD",
            invoice_regex=req.invoice_regex,
            corrections_count=1,
            last_corrected="Today",
            notes=req.notes
        )
        session.add(pattern)

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="SAVE_VENDOR_PATTERN",
        entity_type="vendor_pattern",
        entity_id=gstin_clean,
        details={"vendor": req.supplier_name}
    )
    session.add(audit)
    await session.commit()
    return {"success": True, "pattern": pattern.to_dict()}


@router.delete("/{supplier_gstin}")
async def delete_vendor_pattern(
    supplier_gstin: str,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    gstin_clean = supplier_gstin.strip().upper()
    pat_res = await session.execute(
        select(YuktiVendorPattern).where(
            YuktiVendorPattern.supplier_gstin == gstin_clean,
            YuktiVendorPattern.firm_id == current_user.firm_id
        )
    )
    pattern = pat_res.scalars().first()
    if not pattern:
        raise HTTPException(status_code=404, detail="Vendor pattern rule not found")

    await session.delete(pattern)

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="DELETE_VENDOR_PATTERN",
        entity_type="vendor_pattern",
        entity_id=gstin_clean,
        details={"gstin": gstin_clean}
    )
    session.add(audit)
    await session.commit()
    return {"success": True, "message": f"Pattern for {gstin_clean} removed."}
