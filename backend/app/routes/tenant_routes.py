from fastapi import APIRouter, Request

from app.deps.tenant import get_tenant

router = APIRouter(tags=["tenant"])


@router.get("/client-config")
async def get_client_config(request: Request):
    tenant = getattr(request.state, "client", None)
    if not tenant:
        return {}

    return {
        "id": tenant.id,
        "name": tenant.name,
        "primary_color": tenant.primary_color,
        "logo": tenant.logo,
        "plan": tenant.plan,
        "expiry_date": tenant.expiry_date.isoformat() if tenant.expiry_date else None,
        "allowed_languages": tenant.allowed_languages,
        "active_features": list(getattr(request.state, "active_features", set())),
    }
