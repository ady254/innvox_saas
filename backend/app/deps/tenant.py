from fastapi import HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.tenant import TenantState
from app.models.user import User


def get_tenant(request: Request) -> TenantState:
    client = getattr(request.state, "client", None)
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Tenant context missing",
        )
    return client


async def get_current_user_for_tenant(request: Request, db: AsyncSession) -> User:
    """Load User from JWT and enforce JWT tenant matches Host-resolved tenant."""
    tenant = get_tenant(request)
    state_user = getattr(request.state, "user", None)
    if not state_user or not state_user.get("id"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = int(state_user["id"])
    jwt_client_id = state_user.get("client_id")
    if jwt_client_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if int(jwt_client_id) != tenant.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token does not match this tenant",
        )

    res = await db.execute(select(User).where(User.id == user_id, User.client_id == tenant.id))
    user = res.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user
