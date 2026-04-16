from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.config.db import get_db
from app.deps.tenant import get_tenant
from app.schemas.page_schema import PageContentUpdate, PageContentResponse
from app.services.page_service import get_page, create_or_update_page, get_all_pages

router = APIRouter(tags=["pages"])

VALID_PAGES = {"home", "about", "contact"}

@router.get("/page-content/{page_name}")
async def fetch_page_content(request: Request, page_name: str, db: AsyncSession = Depends(get_db)):
    if page_name not in VALID_PAGES:
        raise HTTPException(status_code=400, detail="Invalid page name")
    
    tenant = request.state.client
    page = await get_page(db, tenant.id, page_name)
    
    if not page:
        # UX Saver: Return a fallback object instead of empty
        return {
            "title": f"Welcome to {tenant.name}",
            "subtitle": "Discover our quality courses and learning resources.",
            "content": "Start your journey with us today. Our platform offers a wide range of topics tailored to your needs.",
            "cta_text": "Enroll Now",
            "banner_image": None,
            "page_name": page_name
        }
    
    return page

@router.post("/admin/page-content/{page_name}", response_model=PageContentResponse)
async def update_page_content(
    request: Request, 
    page_name: str, 
    data: PageContentUpdate, 
    db: AsyncSession = Depends(get_db)
):
    if page_name not in VALID_PAGES:
        raise HTTPException(status_code=400, detail="Invalid page name")
    
    # 🔒 Enforce Admin + Tenant on write routes
    user = getattr(request.state, "user", None)
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not allowed - admin only")
    
    tenant = request.state.client
    return await create_or_update_page(db, tenant.id, page_name, data)

@router.get("/admin/page-content", response_model=List[PageContentResponse])
async def list_admin_pages(request: Request, db: AsyncSession = Depends(get_db)):
    # 🔒 Enforce Admin
    user = getattr(request.state, "user", None)
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not allowed - admin only")
    
    tenant = request.state.client
    return await get_all_pages(db, tenant.id)
