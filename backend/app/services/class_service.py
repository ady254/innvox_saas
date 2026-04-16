from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import datetime

from app.models.class_model import ClassSession
from app.models.course import Course
from app.services.enrollment_service import EnrollmentService

class ClassService:
    @staticmethod
    async def create_class(
        db: AsyncSession, client_id: int, title: str, meeting_link: str, date_time: datetime, course_id: int
    ) -> ClassSession:
        course_res = await db.execute(select(Course).where(Course.id == course_id, Course.client_id == client_id))
        if course_res.scalar_one_or_none() is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found or access denied")

        new_class = ClassSession(
            title=title,
            meeting_link=meeting_link,
            date_time=date_time,
            course_id=course_id,
            client_id=client_id,
        )
        db.add(new_class)
        await db.commit()
        await db.refresh(new_class)
        return new_class

    @staticmethod
    async def get_classes_by_course(db: AsyncSession, course_id: int, client_id: int, user_id: int | None = None, is_admin: bool = False) -> list[ClassSession]:
        course_res = await db.execute(select(Course).where(Course.id == course_id, Course.client_id == client_id))
        if course_res.scalar_one_or_none() is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        if not is_admin and user_id is not None:
            # Student access check
            has_access = await EnrollmentService.validate_enrollment_access(db, user_id, course_id, client_id)
            if not has_access:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Must be enrolled to view classes")

        res = await db.execute(
            select(ClassSession).where(
                ClassSession.course_id == course_id,
                ClassSession.client_id == client_id,
            ).order_by(ClassSession.date_time.asc())
        )
        return list(res.scalars().all())
