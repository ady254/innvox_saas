from __future__ import annotations

import os
from typing import Callable, Awaitable

from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from starlette.middleware.base import BaseHTTPMiddleware

from app.config.db import SessionLocal
from app.models.client import Client
from app.schemas.tenant import TenantState


def _host_from_request(request: Request) -> str:
    # 1. 🔥 PRIORITY: custom header from frontend
    tenant_header = request.headers.get("x-tenant-domain")
    if tenant_header:
        return tenant_header

    # 2. fallback to normal host
    host = request.headers.get("host", "")
    return host.split(":")[0] if host else ""


async def _resolve_client_row(host: str) -> Client | None:
    async with SessionLocal() as session:
        if host in ("localhost", "127.0.0.1", "::1"):
            default_id = os.getenv("DEFAULT_CLIENT_ID")
            if default_id:
                res = await session.execute(select(Client).where(Client.id == int(default_id)))
                row = res.scalar_one_or_none()
                if row is not None:
                    return row
            res = await session.execute(
                select(Client).where(Client.is_active.is_(True)).order_by(Client.id).limit(1)
            )
            return res.scalar_one_or_none()

        res = await session.execute(
            select(Client).where(Client.domain == host, Client.is_active.is_(True))
        )
        return res.scalar_one_or_none()


def _to_tenant_state(client: Client) -> TenantState:
    return TenantState(
        id=client.id,
        name=client.name,
        domain=client.domain,
        primary_color=client.primary_color,
        logo=client.logo,
    )


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable]):
        request.state.client = None

        host = _host_from_request(request)
        client_row = await _resolve_client_row(host)

        if client_row is None:
            return JSONResponse(
                status_code=404,
                content={"detail": f"Unknown tenant for host: {host}"},
            )

        request.state.client = _to_tenant_state(client_row)
        return await call_next(request)
