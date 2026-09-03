from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models import YuktiFirm, YuktiUser, UserRole, YuktiAuditEvent
from src.auth.security import get_current_user, require_role

router = APIRouter(prefix="/api/v1/firms", tags=["Firm Management"])


class FirmUpdateRequest(BaseModel):
    name: Optional[str] = None
    pan: Optional[str] = None
    gstin: Optional[str] = None


@router.get("/me")
async def get_firm_profile(
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(select(YuktiFirm).where(YuktiFirm.id == current_user.firm_id))
    firm = res.scalars().first()
    if not firm:
        return {"id": current_user.firm_id, "name": "Rajnish & Associates", "subscription_tier": "pilot"}
    return firm.to_dict()


@router.put("/me")
async def update_firm_profile(
    req: FirmUpdateRequest,
    current_user: YuktiUser = Depends(require_role([UserRole.PRINCIPAL.value])),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(select(YuktiFirm).where(YuktiFirm.id == current_user.firm_id))
    firm = res.scalars().first()
    if not firm:
        raise HTTPException(status_code=404, detail="Firm not found")

    if req.name is not None:
        firm.name = req.name
    if req.pan is not None:
        firm.pan = req.pan
    if req.gstin is not None:
        firm.gstin = req.gstin

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="UPDATE_FIRM_PROFILE",
        entity_type="firm",
        entity_id=firm.id,
        details={"updated_fields": req.dict(exclude_unset=True)}
    )
    session.add(audit)
    await session.commit()
    return firm.to_dict()


@router.get("/me/team")
async def list_firm_team(
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiUser).where(YuktiUser.firm_id == current_user.firm_id)
    )
    users = res.scalars().all()
    return [u.to_dict() for u in users]
