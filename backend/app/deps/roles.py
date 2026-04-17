from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.deps.tenant import get_current_user_for_tenant
from app.models.user import User, UserRole

PLAN_FEATURES = {
    "starter": {"courses", "payments"},
    "growth": {"courses", "payments", "classes", "results"},
    "premium": {"all"},
}

async def require_super_admin(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    user = await get_current_user_for_tenant(request, db)
    if user.role != UserRole.super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin access required",
        )
    return user

async def require_admin(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    user = await get_current_user_for_tenant(request, db)
    if user.role not in [UserRole.admin, UserRole.super_admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user

def require_feature(feature: str):
    def dep(request: Request):
        # Super Admins bypass feature gating
        user_data = getattr(request.state, "user", None)
        if user_data and user_data.get("role") == UserRole.super_admin:
            return

        active_features = getattr(request.state, "active_features", set())
        
        if "all" in active_features or feature in active_features:
            return
            
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "FEATURE_LOCKED",
                "message": f"Please upgrade your plan to access {feature}"
            }
        )
    return Depends(dep)
