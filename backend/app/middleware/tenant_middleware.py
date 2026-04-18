from __future__ import annotations

import os
from datetime import datetime
from typing import Callable, Awaitable

from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from starlette.middleware.base import BaseHTTPMiddleware

from app.config.db import SessionLocal
from app.models.client import Client
from app.schemas.tenant import TenantState
import time

# Simple In-Memory Cache for Scalability
# host -> (timestamp, client_row, features)
_CLIENT_CACHE: dict[str, tuple[float, Client, set[str]]] = {}
CACHE_TTL = 300  # 5 minutes

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
        # For local development or master domain, we might hit localhost
        if host in ("localhost", "127.0.0.1", "::1"):
            default_id = os.getenv("DEFAULT_CLIENT_ID")
            if default_id:
                res = await session.execute(select(Client).where(Client.id == int(default_id)))
                row = res.scalar_one_or_none()
                if row is not None:
                    return row
            
            # Fallback to the first available client for dev convenience
            res = await session.execute(
                select(Client).order_by(Client.id).limit(1)
            )
            return res.scalar_one_or_none()

        res = await session.execute(
            select(Client).where(Client.domain == host) # Fetch even if inactive to throw structured error
        )
        return res.scalar_one_or_none()


from app.models.feature_toggle import Feature, PlanFeature, ClientFeature

def _to_tenant_state(client: Client) -> TenantState:
    return TenantState(
        id=client.id,
        name=client.name,
        domain=client.domain,
        primary_color=client.primary_color,
        logo=client.logo,
        plan=client.plan,
        expiry_date=client.expiry_date,
        allowed_languages=client.allowed_languages or ["en", "hi", "ur"]
    )

async def _resolve_active_features(client_id: int, plan: str) -> set[str]:
    async with SessionLocal() as session:
        # 1. Get Plan Defaults
        res = await session.execute(
            select(PlanFeature.feature_name).where(PlanFeature.plan == plan)
        )
        features = set(res.scalars().all())

        # 2. Apply Client Overrides
        res = await session.execute(
            select(ClientFeature).where(ClientFeature.client_id == client_id)
        )
        overrides = res.scalars().all()
        for o in overrides:
            if o.is_enabled:
                features.add(o.feature_name)
            else:
                features.discard(o.feature_name)
        
        return features

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable]):
        request.state.client = None
        request.state.active_features = set()

        # Bypass for health check or root if needed
        if request.url.path == "/":
            return await call_next(request)

        host = _host_from_request(request)
        
        # 🏎️ Check Cache First
        now_ts = time.time()
        if host in _CLIENT_CACHE:
            ts, cached_client, cached_features = _CLIENT_CACHE[host]
            if now_ts - ts < CACHE_TTL:
                request.state.client = _to_tenant_state(cached_client)
                request.state.active_features = cached_features
                return await call_next(request)

        client_row = await _resolve_client_row(host)

        if client_row is None:
            return JSONResponse(
                status_code=404,
                content={"detail": f"Unknown tenant for host: {host}"},
            )

        # Implementation of Kill Switch (Adjusted for Structured Error)
        from datetime import timezone
        now = datetime.now(timezone.utc)
        is_expired = client_row.expiry_date and client_row.expiry_date < now
        
        if not client_row.is_active or is_expired:
            return JSONResponse(
                status_code=403,
                content={
                    "code": "SUBSCRIPTION_EXPIRED",
                    "message": "Subscription inactive or expired. Please contact support."
                }
            )

        active_features = await _resolve_active_features(
            client_row.id, client_row.plan
        )

        # 🏎️ Update Cache
        _CLIENT_CACHE[host] = (now_ts, client_row, active_features)

        request.state.client = _to_tenant_state(client_row)
        request.state.active_features = active_features
        
        return await call_next(request)
