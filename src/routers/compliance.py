import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models import YuktiComplianceDeadline, YuktiClient, YuktiUser, YuktiAuditEvent
from src.auth.security import get_current_user

router = APIRouter(prefix="/api/v1/compliance", tags=["Compliance Calendar"])


class DeadlineCreateRequest(BaseModel):
    client_id: str
    title: str
    return_type: str  # "GSTR-1", "GSTR-3B", "TDS 26Q", "Advance Tax"
    period: str  # "July 2026"
    due_date: str  # "2026-08-11"


@router.get("/deadlines")
async def list_deadlines(
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    stmt = select(YuktiComplianceDeadline).where(
        YuktiComplianceDeadline.firm_id == current_user.firm_id
    ).order_by(YuktiComplianceDeadline.due_date.asc())
    res = await session.execute(stmt)
    deadlines = res.scalars().all()

    # If empty, seed realistic default deadlines for pilot presentation
    if len(deadlines) == 0:
        seed_items = [
            YuktiComplianceDeadline(
                id=str(uuid.uuid4()),
                firm_id=current_user.firm_id,
                client_id="c1",
                title="GSTR-1 Monthly Return Filing (Reliance Logistics)",
                return_type="GSTR-1",
                period="July 2026",
                due_date="2026-08-11",
                status="completed"
            ),
            YuktiComplianceDeadline(
                id=str(uuid.uuid4()),
                firm_id=current_user.firm_id,
                client_id="c1",
                title="GSTR-3B Monthly Return & Tax Payment (Reliance Logistics)",
                return_type="GSTR-3B",
                period="July 2026",
                due_date="2026-08-20",
                status="pending"
            ),
            YuktiComplianceDeadline(
                id=str(uuid.uuid4()),
                firm_id=current_user.firm_id,
                client_id="c2",
                title="GSTR-3B Monthly Return (Apex Industrial Traders)",
                return_type="GSTR-3B",
                period="July 2026",
                due_date="2026-08-20",
                status="pending"
            ),
            YuktiComplianceDeadline(
                id=str(uuid.uuid4()),
                firm_id=current_user.firm_id,
                client_id="c3",
                title="GSTR-3B Monthly Return (Metro Tech Solutions)",
                return_type="GSTR-3B",
                period="July 2026",
                due_date="2026-08-20",
                status="pending"
            )
        ]
        for s in seed_items:
            session.add(s)
        await session.commit()
        return [s.to_dict() for s in seed_items]

    return [d.to_dict() for d in deadlines]


@router.post("/deadlines", status_code=status.HTTP_201_CREATED)
async def create_deadline(
    req: DeadlineCreateRequest,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    deadline_id = str(uuid.uuid4())
    deadline = YuktiComplianceDeadline(
        id=deadline_id,
        firm_id=current_user.firm_id,
        client_id=req.client_id,
        title=req.title,
        return_type=req.return_type,
        period=req.period,
        due_date=req.due_date,
        status="pending"
    )
    session.add(deadline)

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="CREATE_COMPLIANCE_DEADLINE",
        entity_type="compliance_deadline",
        entity_id=deadline_id,
        details={"title": req.title, "due_date": req.due_date}
    )
    session.add(audit)
    await session.commit()
    return deadline.to_dict()


@router.patch("/deadlines/{deadline_id}/complete")
async def complete_deadline(
    deadline_id: str,
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(
        select(YuktiComplianceDeadline).where(
            YuktiComplianceDeadline.id == deadline_id,
            YuktiComplianceDeadline.firm_id == current_user.firm_id
        )
    )
    deadline = res.scalars().first()
    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")

    deadline.status = "completed"

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="COMPLETE_COMPLIANCE_DEADLINE",
        entity_type="compliance_deadline",
        entity_id=deadline_id,
        details={"title": deadline.title}
    )
    session.add(audit)
    await session.commit()
    return {"success": True, "deadline": deadline.to_dict()}
