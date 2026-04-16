from __future__ import annotations

from typing import Callable, Awaitable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.jwt import verify_token


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable]):
        request.state.user = None
        request.state.token_payload = None

        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            if token:
                try:
                    payload = verify_token(token)
                    request.state.token_payload = payload
                    request.state.user = {
                        "id": payload.get("sub"),
                        "email": payload.get("email"),
                        "role": payload.get("role"),
                        "client_id": payload.get("client_id"),
                    }
                except Exception:
                    # Keep request unauthenticated if token invalid
                    request.state.user = None
                    request.state.token_payload = None

        return await call_next(request)

