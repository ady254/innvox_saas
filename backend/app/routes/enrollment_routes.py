from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.deps.tenant import get_current_user_for_tenant
from app.services.enrollment_service import EnrollmentService


router = APIRouter(tags=["enrollments"])


@router.post("/enroll/{course_id}", status_code=status.HTTP_410_GONE)
async def enroll_deprecated(course_id: int):
    return {
        "message": "Direct enrollment is disabled. Use /create-order/{course_id} then /verify-payment to enroll.",
        "course_id": course_id,
    }


@router.get("/my-courses")
async def my_courses(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user_for_tenant(request, db)
    courses = await EnrollmentService.get_user_courses(db=db, user=user)
    return {
        "count": len(courses),
        "courses": [
            {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "price": c.price,
                "client_id": c.client_id,
            }
            for c in courses
        ],
    }

