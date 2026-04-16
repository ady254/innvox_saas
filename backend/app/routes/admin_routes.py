from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.deps.roles import require_admin
from app.deps.tenant import get_tenant
from app.models.user import User
from app.schemas.admin_schema import AdminCourseCreate
from app.services.admin_service import AdminService
from app.services.class_service import ClassService
from app.services.result_service import ResultService
from app.schemas.class_schema import ClassCreate
from app.schemas.result_schema import ResultCreate
from app.services.enrollment_service import EnrollmentService
from sqlalchemy import select
from app.models.enrollment import Enrollment

router = APIRouter(tags=["admin"])


@router.post("/course", status_code=status.HTTP_201_CREATED)
async def admin_create_course(
    request: Request,
    payload: AdminCourseCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    course = await AdminService.create_course(
        db,
        client_id=tenant.id,
        title=payload.title,
        description=payload.description,
        price=payload.price,
    )
    return {
        "message": "Course created",
        "course": {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "price": course.price,
            "client_id": course.client_id,
        },
    }


@router.get("/students")
async def admin_students(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    students = await AdminService.list_students(db, client_id=tenant.id)
    return {
        "count": len(students),
        "students": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role.value,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in students
        ],
    }


@router.get("/enrollments")
async def admin_enrollments(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    rows = await AdminService.list_enrollments(db, client_id=tenant.id)
    return {
        "count": len(rows),
        "enrollments": [
            {
                "id": e.id,
                "payment_status": e.payment_status.value,
                "created_at": e.created_at.isoformat() if e.created_at else None,
                "student": {
                    "id": e.user.id,
                    "name": e.user.name,
                    "email": e.user.email,
                },
                "course": {
                    "id": e.course.id,
                    "title": e.course.title,
                    "price": e.course.price,
                },
            }
            for e in rows
        ],
    }


@router.get("/payments")
async def admin_payments(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    rows = await AdminService.list_payment_records(db, client_id=tenant.id)
    return {
        "count": len(rows),
        "payments": [
            {
                "enrollment_id": e.id,
                "amount": e.course.price,
                "currency": "INR",
                "payment_status": e.payment_status.value,
                "created_at": e.created_at.isoformat() if e.created_at else None,
                "student": {
                    "id": e.user.id,
                    "name": e.user.name,
                    "email": e.user.email,
                },
                "course": {
                    "id": e.course.id,
                    "title": e.course.title,
                },
            }
            for e in rows
        ],
    }

@router.get("/course/{course_id}/students")
async def admin_get_enrolled_students(
    course_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    # Fetch students enrolled in this specific course
    res = await db.execute(
        select(User).join(Enrollment, User.id == Enrollment.user_id)
        .where(Enrollment.course_id == course_id, User.client_id == tenant.id, Enrollment.client_id == tenant.id)
    )
    students = res.scalars().all()
    return {
        "count": len(students),
        "students": [
            {"id": u.id, "name": u.name, "email": u.email} for u in students
        ]
    }

@router.post("/class", status_code=status.HTTP_201_CREATED)
async def admin_create_class(
    payload: ClassCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    new_class = await ClassService.create_class(
        db=db,
        client_id=tenant.id,
        title=payload.title,
        meeting_link=payload.meeting_link,
        date_time=payload.date_time,
        course_id=payload.course_id
    )
    return {"message": "Class created", "class_id": new_class.id}

@router.get("/classes/{course_id}")
async def admin_get_classes(
    course_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    classes = await ClassService.get_classes_by_course(db=db, course_id=course_id, client_id=tenant.id, is_admin=True)
    return {"classes": classes}

@router.post("/result", status_code=status.HTTP_201_CREATED)
async def admin_create_result(
    payload: ResultCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await ResultService.create_result(
        db=db,
        client_id=tenant.id,
        user_id=payload.user_id,
        course_id=payload.course_id,
        marks=payload.marks,
        grade=payload.grade,
        remarks=payload.remarks
    )
    return {"message": "Result added successfully", "result_id": res.id}

@router.get("/results/{course_id}")
async def admin_get_results(
    course_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    results = await ResultService.get_results_by_course(db=db, course_id=course_id, client_id=tenant.id)
    return {"results": results}
