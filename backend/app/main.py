from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.db import Base, engine
from contextlib import asynccontextmanager

# Import models (VERY IMPORTANT to ensure they are registered with Base.metadata)
from . import models

from .middleware.auth_middleware import AuthMiddleware
from .middleware.tenant_middleware import TenantMiddleware
from .routes.auth_routes import router as auth_router
from .routes.course_routes import router as course_router
from .routes.enrollment_routes import router as enrollment_router
from .routes.payment_routes import router as payment_router
from .routes.tenant_routes import router as tenant_router
from .routes.admin_routes import router as admin_router
from .routes.student_routes import router as student_router
from .routes.page_routes import router as page_router
from .routes.lead_routes import router as lead_router
from .routes.testimonial_routes import router as testimonial_router
from .routes.announcement_routes import router as announcement_router
from .routes.super_admin_routes import router as super_admin_router
from .routes.support_routes import router as support_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables automatically on startup
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Database initialization FAILED (skipping table creation): {e}")
    yield

app = FastAPI(lifespan=lifespan)

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail or "Something went wrong"},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Invalid input data"},
    )

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
        "http://acme.localhost:3000",
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
app.include_router(announcement_router)
app.include_router(super_admin_router, prefix="/super-admin")
app.include_router(support_router)

@app.get("/")
def home():
    return {"message": "Innvox SaaS Backend Running 🚀"}