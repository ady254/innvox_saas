from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.db import Base, engine
from contextlib import asynccontextmanager
import json
import time

# Import models (VERY IMPORTANT to ensure they are registered with Base.metadata)
from app.models import client, user, course, enrollment, class_model, result

from app.middleware.auth_middleware import AuthMiddleware
from app.middleware.tenant_middleware import TenantMiddleware
from app.routes.auth_routes import router as auth_router
from app.routes.course_routes import router as course_router
from app.routes.enrollment_routes import router as enrollment_router
from app.routes.payment_routes import router as payment_router
from app.routes.tenant_routes import router as tenant_router
from app.routes.admin_routes import router as admin_router
from app.routes.student_routes import router as student_router
from app.routes.page_routes import router as page_router
from app.routes.lead_routes import router as lead_router
from app.routes.testimonial_routes import router as testimonial_router

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
# #endregion agent log

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables automatically on startup
    _agent_log("H_STARTUP", "app/main.py:BEFORE_CREATE_ALL", "About to run Base.metadata.create_all() (async)", {})
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        _agent_log("H_STARTUP", "app/main.py:AFTER_CREATE_ALL", "create_all() succeeded", {})
    except Exception as e:
        _agent_log("H_DB_AUTH", "app/main.py:CREATE_ALL_FAILED", "create_all() raised exception", {"error": repr(e), "type": type(e).__name__})
        print(f"Database initialization failed: {e}")
    yield

app = FastAPI(lifespan=lifespan)

# Order: last added runs first (inner). CORS outermost → Tenant → Auth.
app.add_middleware(AuthMiddleware)
app.add_middleware(TenantMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://abc.localhost:3000",
        "http://xyz.localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(course_router)
app.include_router(tenant_router)
app.include_router(enrollment_router)
app.include_router(payment_router)
app.include_router(admin_router, prefix="/admin")
app.include_router(student_router)
app.include_router(page_router)
app.include_router(lead_router)
app.include_router(testimonial_router)

@app.get("/")
def home():
    return {"message": "Innvox SaaS Backend Running 🚀"}