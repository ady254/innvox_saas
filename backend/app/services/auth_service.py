from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.schemas.auth_schema import TokenResponse, UserLogin, UserSignup
from app.utils.hash import hash_password, verify_password
from app.utils.jwt import create_access_token


class AuthService:
    @staticmethod
    async def signup_user(db: AsyncSession, payload: UserSignup, client_id: int) -> User:
        existing = await db.execute(
            select(User).where(
                User.email == payload.email.lower().strip(),
                User.client_id == client_id,
            )
        )
        if existing.scalar_one_or_none() is not None:
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
        super_admin = res_super.scalar_one_or_none()
        
        if super_admin and verify_password(payload.password, super_admin.password):
            user = super_admin
        else:
            res = await db.execute(
                select(User).where(User.email == payload.email.lower().strip(), User.client_id == client_id)
            )
            user = res.scalar_one_or_none()
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
        return TokenResponse(access_token=token)

