from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config.db import get_db
from app.deps.roles import require_super_admin
from app.models.client import Client
from app.models.user import User, UserRole
from app.models.platform_announcement import PlatformAnnouncement
from app.schemas.super_admin_schema import (
    SuperAdminClientCreate, 
    SuperAdminClientUpdate, 
    SuperAdminResetPassword,
    PlatformAnnouncementCreate
)
from app.models.feature_toggle import Feature, ClientFeature
from pydantic import BaseModel
from app.utils.hash import hash_password

router = APIRouter(tags=["super-admin"])

@router.get("/clients")
async def super_admin_list_clients(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    res = await db.execute(select(Client).order_by(Client.id))
    clients = res.scalars().all()
    return {
        "clients": [
            {
                "id": c.id,
                "name": c.name,
                "domain": c.domain,
                "plan": c.plan,
                "is_active": c.is_active,
                "expiry_date": c.expiry_date.isoformat() if c.expiry_date else None,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in clients
        ]
    }

@router.post("/client")
async def super_admin_create_client(
    payload: SuperAdminClientCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    # Check if domain exists
    existing_domain = await db.execute(select(Client).where(Client.domain == payload.domain))
    if existing_domain.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Domain already exists")

    # 1. Create Client
    new_client = Client(
        name=payload.name,
        domain=payload.domain,
        primary_color=payload.primary_color,
        plan=payload.plan,
        razorpay_key="TBD",
        razorpay_secret="TBD",
        is_active=True
    )
    db.add(new_client)
    await db.flush() # flush to get client id

    # 2. Check if admin email already exists for this client (it shouldn't)
    existing_user = await db.execute(select(User).where(User.email == payload.admin_email.lower().strip(), User.client_id == new_client.id))
    if existing_user.scalar_one_or_none():
         raise HTTPException(status_code=400, detail="User email already exists for this tenant")

    # 3. Create Admin User
    admin_user = User(
        name=payload.admin_name,
        email=payload.admin_email.lower().strip(),
        password=hash_password(payload.admin_password),
        role=UserRole.admin,
        client_id=new_client.id
    )
    db.add(admin_user)
    
    await db.commit()
    
    return {"message": "Client and Admin created successfully", "client_id": new_client.id}

@router.put("/client/{client_id}")
async def super_admin_update_client(
    client_id: int,
    payload: SuperAdminClientUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    res = await db.execute(select(Client).where(Client.id == client_id))
    client = res.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if payload.plan is not None:
        client.plan = payload.plan
    if payload.is_active is not None:
        client.is_active = payload.is_active
    if payload.expiry_date is not None:
        client.expiry_date = payload.expiry_date

    await db.commit()
    return {"message": "Client updated successfully"}

@router.post("/reset-admin-password")
async def super_admin_reset_password(
    payload: SuperAdminResetPassword,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    res = await db.execute(select(User).where(User.id == payload.user_id, User.role == UserRole.admin))
    user = res.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")
        
    user.password = hash_password(payload.new_password)
    await db.commit()
    return {"message": "Password reset successfully"}

@router.post("/announcement")
async def super_admin_create_announcement(
    payload: PlatformAnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    announcement = PlatformAnnouncement(
        message=payload.message,
        type=payload.type,
        priority=payload.priority,
        target=payload.target
    )
    db.add(announcement)
    await db.commit()
    return {"message": "Platform announcement created"}

@router.get("/announcements") # this route will be required by tenant
async def get_platform_announcements(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # This route is public or tenant-scope but reads from global announcements
    # We should filter by target if necessary.
    res = await db.execute(select(PlatformAnnouncement).order_by(PlatformAnnouncement.created_at.desc()).limit(10))
    announcements = res.scalars().all()
    
        ]
    }

class ClientFeatureOverride(BaseModel):
    client_id: int
    feature_name: str
    is_enabled: bool

@router.get("/features")
async def super_admin_list_features(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    res = await db.execute(select(Feature).order_by(Feature.name))
    features = res.scalars().all()
    return {
        "features": [
            {"id": f.id, "name": f.name, "display_name": f.display_name} for f in features
        ]
    }

@router.get("/client-feature/{client_id}")
async def super_admin_get_client_features(
    client_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    res = await db.execute(select(ClientFeature).where(ClientFeature.client_id == client_id))
    overrides = res.scalars().all()
    return {
        "overrides": [
            {"id": o.id, "feature_name": o.feature_name, "is_enabled": o.is_enabled} for o in overrides
        ]
    }

@router.post("/client-feature")
async def super_admin_set_client_feature(
    payload: ClientFeatureOverride,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    # Check if feature exists
    res = await db.execute(select(Feature).where(Feature.name == payload.feature_name))
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Feature not found")
        
    # Check for existing override
    res = await db.execute(
        select(ClientFeature).where(
            ClientFeature.client_id == payload.client_id,
            ClientFeature.feature_name == payload.feature_name
        )
    )
    override = res.scalar_one_or_none()
    
    if override:
        override.is_enabled = payload.is_enabled
    else:
        override = ClientFeature(
            client_id=payload.client_id,
            feature_name=payload.feature_name,
            is_enabled=payload.is_enabled
        )
        db.add(override)
        
    await db.commit()
    return {"message": "Feature override updated successfully"}
