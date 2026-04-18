from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User, UserRole


class AdminService:
    @staticmethod
    async def create_course(
        db: AsyncSession, *, client_id: int, title: str, description: str, price: int,
        cover_image_url: str | None = None,
        is_free: bool = False,
        currency: str = "INR",
        duration: str | None = None,
        level: str | None = None,
        instructor_name: str | None = None,
        type: str = "self-paced",
        has_certificate: bool = False
    ) -> Course:
        course = Course(
            title=title,
            description=description,
            price=price,
            client_id=client_id,
            cover_image_url=cover_image_url,
            is_free=is_free,
            currency=currency,
            duration=duration,
            level=level,
            instructor_name=instructor_name,
            type=type,
            has_certificate=has_certificate
        )
        db.add(course)
        await db.commit()
        await db.refresh(course)
        return course


    @staticmethod
    async def list_students(db: AsyncSession, client_id: int) -> list[User]:
        res = await db.execute(
            select(User)
            .where(User.client_id == client_id, User.role == UserRole.student)
            .order_by(User.id.desc())
        )
        return list(res.scalars().all())

    @staticmethod
    async def list_enrollments(db: AsyncSession, client_id: int) -> list[Enrollment]:
        res = await db.execute(
            select(Enrollment)
            .where(Enrollment.client_id == client_id)
            .options(selectinload(Enrollment.user), selectinload(Enrollment.course))
            .order_by(Enrollment.id.desc())
        )
        return list(res.scalars().unique().all())

    @staticmethod
    async def list_payment_records(db: AsyncSession, client_id: int) -> list[Enrollment]:
        """Payment history derived from enrollments (includes course price as amount)."""
        res = await db.execute(
            select(Enrollment)
            .where(Enrollment.client_id == client_id)
            .options(selectinload(Enrollment.user), selectinload(Enrollment.course))
            .order_by(Enrollment.id.desc())
        )
        return list(res.scalars().unique().all())
