import os
import json
import time
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.engine.url import make_url
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get DATABASE_URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# #region agent log
def _agent_log(hypothesisId: str, location: str, message: str, data: dict | None = None, runId: str = "pre-fix") -> None:
    try:
        payload = {
            "sessionId": "c66275",
            "runId": runId,
            "hypothesisId": hypothesisId,
            "location": location,
            "message": message,
            "data": data or {},
            "timestamp": int(time.time() * 1000),
        }
        with open("debug-c66275.log", "a", encoding="utf-8") as f:
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")
    except Exception:
        pass

def _safe_url_parts(url_str: str | None) -> dict:
    if not url_str:
        return {"present": False}
    try:
        u = make_url(url_str)
        return {
            "present": True,
            "drivername": u.drivername,
            "username": u.username,
            "host": u.host,
            "port": u.port,
            "database": u.database,
            "has_password": u.password is not None,
        }
    except Exception as e:
        return {"present": True, "parse_error": repr(e)}

_agent_log(
    hypothesisId="H_ENV",
    location="app/config/db.py:DB_URL_LOAD",
    message="Loaded DATABASE_URL (sanitized parts)",
    data=_safe_url_parts(DATABASE_URL),
)
# #endregion agent log

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create async session factory
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

# Base model
Base = declarative_base()


async def get_db():
    async with SessionLocal() as session:
        yield session