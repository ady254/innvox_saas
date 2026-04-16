import os
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt


def _get_settings() -> tuple[str, str, int]:
    secret_key = os.getenv("SECRET_KEY")
    algorithm = os.getenv("ALGORITHM", "HS256")
    expire_minutes_str = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

    if not secret_key:
        raise RuntimeError("SECRET_KEY environment variable is required")

    try:
        expire_minutes = int(expire_minutes_str)
    except ValueError as e:
        raise RuntimeError("ACCESS_TOKEN_EXPIRE_MINUTES must be an integer") from e

    return secret_key, algorithm, expire_minutes


def create_access_token(data: dict[str, Any]) -> str:
    secret_key, algorithm, expire_minutes = _get_settings()

    to_encode = dict(data)
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, secret_key, algorithm=algorithm)


def verify_token(token: str) -> dict[str, Any]:
    secret_key, algorithm, _ = _get_settings()
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        return payload
    except JWTError as e:
        raise ValueError("Invalid or expired token") from e
