from typing import List
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config.db import get_db
from app.deps.tenant import get_tenant
from app.models.testimonial import Testimonial
from app.schemas.testimonial_schema import TestimonialCreate, TestimonialResponse

router = APIRouter(tags=["testimonials"])

@router.get("/testimonials", response_model=List[TestimonialResponse])
async def list_testimonials(request: Request, db: AsyncSession = Depends(get_db)):
    tenant = get_tenant(request)
    res = await db.execute(
        select(Testimonial).where(Testimonial.client_id == tenant.id).order_by(Testimonial.created_at.desc())
    )
    return res.scalars().all()

@router.post("/admin/testimonials", response_model=TestimonialResponse, status_code=status.HTTP_201_CREATED)
async def create_testimonial(
    request: Request,
    payload: TestimonialCreate,
    db: AsyncSession = Depends(get_db)
):
    # Auth Check
    user = getattr(request.state, "user", None)
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    tenant = get_tenant(request)
    new_testimonial = Testimonial(
        client_id=tenant.id,
        name=payload.name,
        course_name=payload.course_name,
        content=payload.content,
        avatar_url=payload.avatar_url
    )
    db.add(new_testimonial)
    await db.commit()
    await db.refresh(new_testimonial)
    return new_testimonial

@router.delete("/admin/testimonials/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_testimonial(
    testimonial_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Auth Check
    user = getattr(request.state, "user", None)
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    tenant = get_tenant(request)
    res = await db.execute(
        select(Testimonial).where(Testimonial.id == testimonial_id, Testimonial.client_id == tenant.id)
    )
    testimonial = res.scalar_one_or_none()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    await db.delete(testimonial)
    await db.commit()
    return None
