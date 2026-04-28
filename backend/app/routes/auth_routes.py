from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.db import get_db
from ..deps.tenant import get_current_user_for_tenant, get_tenant
from ..schemas.auth_schema import TokenResponse, UserLogin, UserSignup, ForgotPasswordRequest, ResetPasswordRequest
from ..services.auth_service import AuthService


router = APIRouter(tags=["auth"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(
    request: Request,
    payload: UserSignup,
    db: AsyncSession = Depends(get_db),
):
    tenant = get_tenant(request)
    user = await AuthService.signup_user(db=db, payload=payload, client_id=tenant.id)
    return {
        "success": True, 
        "id": user.id, 
        "name": user.name, 
        "email": user.email, 
        "client_id": user.client_id, 
        "role": user.role.value
    }



@router.post("/login", response_model=TokenResponse)

async def login(
    request: Request,
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    tenant = get_tenant(request)
    return await AuthService.login_user(db=db, payload=payload, client_id=tenant.id)


@router.post("/forgot-password")
async def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    tenant = get_tenant(request)
    return await AuthService.forgot_password(db=db, payload=payload, client_id=tenant.id)


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    return await AuthService.reset_password(db=db, payload=payload)


@router.get("/me")
async def me(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user_for_tenant(request, db)
    return {
        "success": True,
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "client_id": user.client_id,
    }
