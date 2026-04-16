from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.deps.tenant import get_tenant
from app.models.course import Course

router = APIRouter(tags=["courses"])


@router.get("/courses")
async def list_courses(request: Request, db: AsyncSession = Depends(get_db)):
    tenant = get_tenant(request)
    res = await db.execute(
        select(Course).where(Course.client_id == tenant.id).order_by(Course.id.desc())
    )
    rows = list(res.scalars().all())

    # Check enrollment if user is logged in
    enrolled_ids = set()
    user_state = getattr(request.state, "user", None)
    if user_state and user_state.get("id"):
        from app.models.enrollment import Enrollment
        enroll_res = await db.execute(
            select(Enrollment.course_id).where(
                Enrollment.user_id == int(user_state["id"]),
                Enrollment.client_id == tenant.id
            )
        )
        enrolled_ids = set(enroll_res.scalars().all())

    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "price": c.price,
            "client_id": c.client_id,
            "is_enrolled": c.id in enrolled_ids,
        }
        for c in rows
    ]
