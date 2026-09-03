import uuid
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_async_session
from models import YuktiFirm, YuktiUser, UserRole, YuktiAuditEvent
from src.auth.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    require_role,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


class SignupRequest(BaseModel):
    firm_name: str
    full_name: str
    email: EmailStr
    password: str
    pan: Optional[str] = None
    gstin: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class InviteRequest(BaseModel):
    full_name: str
    email: EmailStr
    role: str = "senior"  # senior, junior, viewer
    temp_password: Optional[str] = "Yukti@2026"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    firm: Dict[str, Any]


@router.post("/signup", response_model=TokenResponse)
async def signup(
    req: SignupRequest,
    session: AsyncSession = Depends(get_async_session)
):
    # Check if user email already exists
    existing = await session.execute(select(YuktiUser).where(YuktiUser.email == req.email.lower()))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Create new Firm
    firm_id = str(uuid.uuid4())
    firm = YuktiFirm(
        id=firm_id,
        name=req.firm_name,
        pan=req.pan,
        gstin=req.gstin,
        subscription_tier="pilot",
        subscription_status="active"
    )
    session.add(firm)

    # Create Principal User
    user_id = str(uuid.uuid4())
    user = YuktiUser(
        id=user_id,
        firm_id=firm_id,
        email=req.email.lower(),
        full_name=req.full_name,
        role=UserRole.PRINCIPAL.value,
        password_hash=get_password_hash(req.password),
        is_active=True
    )
    session.add(user)

    # Log audit event
    audit = YuktiAuditEvent(
        firm_id=firm_id,
        actor_user_id=user_id,
        actor_type="user",
        action="FIRM_SIGNUP",
        entity_type="firm",
        entity_id=firm_id,
        details={"firm_name": req.firm_name, "principal_email": req.email}
    )
    session.add(audit)
    await session.commit()

    token_data = {"sub": user.id, "firm_id": firm.id, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user.to_dict(),
        firm=firm.to_dict()
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    session: AsyncSession = Depends(get_async_session)
):
    res = await session.execute(select(YuktiUser).where(YuktiUser.email == req.email.lower()))
    user = res.scalars().first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated."
        )

    firm_res = await session.execute(select(YuktiFirm).where(YuktiFirm.id == user.firm_id))
    firm = firm_res.scalars().first()
    firm_dict = firm.to_dict() if firm else {"id": user.firm_id, "name": "Rajnish & Associates"}

    token_data = {"sub": user.id, "firm_id": user.firm_id, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Log audit event
    audit = YuktiAuditEvent(
        firm_id=user.firm_id,
        actor_user_id=user.id,
        actor_type="user",
        action="USER_LOGIN",
        entity_type="user",
        entity_id=user.id,
        details={"email": user.email}
    )
    session.add(audit)
    await session.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user.to_dict(),
        firm=firm_dict
    )


@router.get("/me")
async def get_me(
    current_user: YuktiUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    firm_res = await session.execute(select(YuktiFirm).where(YuktiFirm.id == current_user.firm_id))
    firm = firm_res.scalars().first()
    return {
        "user": current_user.to_dict(),
        "firm": firm.to_dict() if firm else {"id": current_user.firm_id, "name": "Rajnish & Associates"}
    }


@router.post("/invite")
async def invite_team_member(
    req: InviteRequest,
    current_user: YuktiUser = Depends(require_role([UserRole.PRINCIPAL.value])),
    session: AsyncSession = Depends(get_async_session)
):
    existing = await session.execute(select(YuktiUser).where(YuktiUser.email == req.email.lower()))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    new_user = YuktiUser(
        id=str(uuid.uuid4()),
        firm_id=current_user.firm_id,
        email=req.email.lower(),
        full_name=req.full_name,
        role=req.role,
        password_hash=get_password_hash(req.temp_password or "Yukti@2026"),
        is_active=True
    )
    session.add(new_user)

    audit = YuktiAuditEvent(
        firm_id=current_user.firm_id,
        actor_user_id=current_user.id,
        actor_type="user",
        action="INVITE_USER",
        entity_type="user",
        entity_id=new_user.id,
        details={"invited_email": req.email, "role": req.role}
    )
    session.add(audit)
    await session.commit()

    return {
        "success": True,
        "message": f"Invitation created for {req.full_name} ({req.email}) with role '{req.role}'.",
        "user": new_user.to_dict()
    }
