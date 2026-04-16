from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.course import Course
from app.models.enrollment import Enrollment, PaymentStatus
from app.models.user import User


class EnrollmentService:
    @staticmethod
    async def enroll_user(db: AsyncSession, user: User, course_id: int) -> Enrollment:
        course_res = await db.execute(select(Course).where(Course.id == course_id))
        course = course_res.scalar_one_or_none()
        if course is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        if course.client_id != user.client_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cross-tenant access denied")

        existing_res = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == user.id,
                Enrollment.course_id == course_id,
                Enrollment.client_id == user.client_id,
            )
        )
        if existing_res.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already enrolled in this course")

        enrollment = Enrollment(
            user_id=user.id,
            course_id=course_id,
            client_id=user.client_id,
            payment_status=PaymentStatus.success,
        )
        db.add(enrollment)
        await db.commit()
        await db.refresh(enrollment)
        return enrollment

    @staticmethod
    async def get_user_courses(db: AsyncSession, user: User) -> list[Course]:
        res = await db.execute(
            select(Course)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .where(
                Enrollment.user_id == user.id,
                Enrollment.client_id == user.client_id,
                Course.client_id == user.client_id,
            )
            .order_by(Course.id.desc())
        )
        return list(res.scalars().all())

    @staticmethod
    async def validate_enrollment_access(db: AsyncSession, user_id: int, course_id: int, client_id: int) -> bool:
        res = await db.execute(
            select(Enrollment).where(
                Enrollment.user_id == user_id,
                Enrollment.course_id == course_id,
                Enrollment.client_id == client_id,
            )
        )
        return res.scalar_one_or_none() is not None

