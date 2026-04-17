from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List

from app.config.db import get_db
from app.deps.tenant import get_tenant
from app.models.announcement import Announcement
from app.schemas.announcement_schema import AnnouncementResponse

router = APIRouter(tags=["announcements"])

@router.get("/announcements/general", response_model=List[AnnouncementResponse])
async def get_general_announcements(request: Request, db: AsyncSession = Depends(get_db)):
    tenant = get_tenant(request)
    # Fetch latest 5 general announcements
    res = await db.execute(
        select(Announcement)
        .where(Announcement.client_id == tenant.id, Announcement.type == "general")
        .order_by(desc(Announcement.created_at))
        .limit(5)
    )
    return res.scalars().all()

@router.get("/announcements/student", response_model=List[AnnouncementResponse])
async def get_student_announcements(request: Request, db: AsyncSession = Depends(get_db)):
    # 🔒 Security: Check if user is logged in
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Login required")
    
    tenant = get_tenant(request)
    # Fetch latest 5 student announcements
    res = await db.execute(
        select(Announcement)
        .where(Announcement.client_id == tenant.id, Announcement.type == "student")
        .order_by(desc(Announcement.created_at))
        .limit(5)
    )
    return res.scalars().all()
