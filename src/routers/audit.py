from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models import YuktiAuditEvent, YuktiUser
from src.auth.security import get_current_user

router = APIRouter(prefix="/api/v1/audit", tags=["Audit Log & Governance"])


@router.get("/events")
async def list_audit_events(
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 50,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    stmt = select(YuktiAuditEvent).where(YuktiAuditEvent.firm_id == current_user.firm_id)
    if entity_type:
        stmt = stmt.where(YuktiAuditEvent.entity_type == entity_type)
    if action:
        stmt = stmt.where(YuktiAuditEvent.action == action)
    stmt = stmt.order_by(YuktiAuditEvent.created_at.desc()).limit(limit)
    res = await session.execute(stmt)
    events = res.scalars().all()
    return [e.to_dict() for e in events]
