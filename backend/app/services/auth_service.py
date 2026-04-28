import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from ..models.user import User, UserRole
from ..schemas.auth_schema import TokenResponse, UserLogin, UserSignup, ForgotPasswordRequest, ResetPasswordRequest
from ..utils.hash import hash_password, verify_password
from ..utils.jwt import create_access_token


class AuthService:
    @staticmethod
    async def signup_user(db: AsyncSession, payload: UserSignup, client_id: int) -> User:
        existing = await db.execute(
            select(User).where(
                User.email == payload.email.lower().strip(),
                User.client_id == client_id,
            )
        )
        if existing.scalars().first() is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered for this tenant")

        n_users = await db.scalar(select(func.count()).select_from(User).where(User.client_id == client_id)) or 0
        role = UserRole.admin if n_users == 0 else UserRole.student

        user = User(
            name=payload.name,
            email=payload.email.lower().strip(),
            password=hash_password(payload.password),
            role=role,
            client_id=client_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def login_user(db: AsyncSession, payload: UserLogin, client_id: int) -> TokenResponse:
        res_super = await db.execute(
            select(User).where(
                User.email == payload.email.lower().strip(), 
                User.role == UserRole.super_admin
            )
        )
        super_admin = res_super.scalars().first()
        
        if super_admin and verify_password(payload.password, super_admin.password):
            user = super_admin
        else:
            res = await db.execute(
                select(User).where(
                    User.email == payload.email.lower().strip(), 
                    User.client_id == client_id
                )
            )
            user = res.scalars().first()
            if user is None or not verify_password(payload.password, user.password):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        token = create_access_token(
            data={
                "sub": str(user.id),
                "client_id": user.client_id,
                "email": user.email,
                "role": user.role.value,
            }
        )
        return TokenResponse(
            success=True, 
            token=token, 
            access_token=token, 
            token_type="bearer", 
            role=user.role.value
        )

    @staticmethod
    async def forgot_password(db: AsyncSession, payload: ForgotPasswordRequest, client_id: int) -> dict:
        res = await db.execute(
            select(User).where(
                User.email == payload.email.lower().strip(),
                User.client_id == client_id
            )
        )
        user = res.scalars().first()
        if user:
            token = secrets.token_urlsafe(32)
            user.reset_token = token
            user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(minutes=15)
            await db.commit()
            
            # TODO: Integrate with an email service provider
            print(f"--- RESET PASSWORD LINK FOR {user.email} ---")
            print(f"Token: {token}")
            print("---------------------------------------------")

        return {"success": True, "message": "Password reset link sent to your email"}

    @staticmethod
    async def reset_password(db: AsyncSession, payload: ResetPasswordRequest) -> dict:
        res = await db.execute(
            select(User).where(
                User.reset_token == payload.token
            )
        )
        user = res.scalars().first()
        
        if not user or user.reset_token != payload.token or user.reset_token_expiry is None or user.reset_token_expiry < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired link")

        user.password = hash_password(payload.new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        await db.commit()
        
        return {"success": True, "message": "Password updated successfully"}
