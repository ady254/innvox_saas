from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.models.result import Result
from app.models.course import Course
from app.models.user import User
from app.services.enrollment_service import EnrollmentService

class ResultService:
    @staticmethod
    async def create_result(
        db: AsyncSession, client_id: int, user_id: int, course_id: int, marks: float, grade: str | None, remarks: str | None
    ) -> Result:
        # Crucial Constraint 1: Check enrollment
        has_access = await EnrollmentService.validate_enrollment_access(db, user_id, course_id, client_id)
        if not has_access:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student must be enrolled in course to add a result")

        new_result = Result(
            user_id=user_id,
            course_id=course_id,
            marks=marks,
            grade=grade,
            remarks=remarks,
            client_id=client_id,
        )
        db.add(new_result)
        try:
            await db.commit()
            await db.refresh(new_result)
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A result already exists for this student in this course.")
        
        return new_result

    @staticmethod
    async def get_results_by_course(db: AsyncSession, course_id: int, client_id: int) -> list[Result]:
        course_res = await db.execute(select(Course).where(Course.id == course_id, Course.client_id == client_id))
        if course_res.scalar_one_or_none() is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        # Join User to return student details
        res = await db.execute(
            select(Result, User)
            .join(User, User.id == Result.user_id)
            .where(
                Result.course_id == course_id,
                Result.client_id == client_id,
            )
            .order_by(Result.created_at.desc())
        )
        results = []
        for result, user in res.all():
            setattr(result, "student_name", user.name)
            setattr(result, "student_email", user.email)
            results.append(result)
        return results

    @staticmethod
    async def get_student_results(db: AsyncSession, user_id: int, client_id: int) -> list[Result]:
        res = await db.execute(
            select(Result).where(
                Result.user_id == user_id,
                Result.client_id == client_id,
            ).order_by(Result.created_at.desc())
        )
        return list(res.scalars().all())
