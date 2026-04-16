from fastapi import APIRouter, Request

from app.deps.tenant import get_tenant

router = APIRouter(tags=["tenant"])


@router.get("/client-config")
async def get_client_config(request: Request):
    tenant = request.state.client

    return {
        "name": tenant.name,
        "primary_color": tenant.primary_color,
        "logo": tenant.logo,
    }
