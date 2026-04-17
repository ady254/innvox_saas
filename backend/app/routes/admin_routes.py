from fastapi import APIRouter, Depends, Request, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc
from typing import List

from app.config.db import get_db
from app.deps.roles import require_admin, require_feature
from app.deps.tenant import get_tenant
from app.models.user import User
from app.models.enrollment import Enrollment
from app.models.announcement import Announcement
from app.models.contact_settings import ContactSettings
from app.schemas.admin_schema import AdminCourseCreate
from app.schemas.class_schema import ClassCreate
from app.schemas.result_schema import ResultCreate
from app.schemas.announcement_schema import AnnouncementCreate, AnnouncementResponse
from app.schemas.contact_schema import ContactSettingsCreate, ContactSettingsResponse
from app.services.admin_service import AdminService
from app.services.class_service import ClassService
from app.services.result_service import ResultService
from app.services.enrollment_service import EnrollmentService

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

@router.post("/class", status_code=status.HTTP_201_CREATED, dependencies=[require_feature("classes")])
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

@router.get("/classes/{course_id}", dependencies=[require_feature("classes")])
async def admin_get_classes(
    course_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    classes = await ClassService.get_classes_by_course(db=db, course_id=course_id, client_id=tenant.id, is_admin=True)
    return {"classes": classes}

@router.post("/result", status_code=status.HTTP_201_CREATED, dependencies=[require_feature("results")])
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

@router.get("/results/{course_id}", dependencies=[require_feature("results")])
async def admin_get_results(
    course_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    results = await ResultService.get_results_by_course(db=db, course_id=course_id, client_id=tenant.id)
    return {"results": results}

# --- Announcement Admin ---

@router.post("/announcement", status_code=status.HTTP_201_CREATED)
async def admin_create_announcement(
    payload: AnnouncementCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    new_announcement = Announcement(
        client_id=tenant.id,
        title=payload.title,
        message=payload.message,
        type=payload.type,
        priority=payload.priority
    )
    db.add(new_announcement)
    await db.commit()
    await db.refresh(new_announcement)
    return {"message": "Announcement created", "announcement_id": new_announcement.id}

@router.get("/announcements", response_model=List[AnnouncementResponse])
async def admin_get_announcements(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(Announcement)
        .where(Announcement.client_id == tenant.id)
        .order_by(desc(Announcement.created_at))
    )
    return res.scalars().all()

@router.delete("/announcement/{announcement_id}")
async def admin_delete_announcement(
    announcement_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    await db.execute(
        delete(Announcement).where(Announcement.id == announcement_id, Announcement.client_id == tenant.id)
    )
    await db.commit()
    return {"message": "Announcement deleted"}

# --- Contact Settings Admin ---

@router.get("/contact-info", response_model=ContactSettingsResponse)
async def admin_get_contact_info(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(ContactSettings).where(ContactSettings.client_id == tenant.id)
    )
    contact = res.scalar_one_or_none()
    if not contact:
        # Return empty defaults if not found
        return {
            "id": 0,
            "client_id": tenant.id,
            "phones": [],
            "emails": [],
            "address": "",
            "updated_at": None
        }
    return contact

@router.post("/contact-info", response_model=ContactSettingsResponse)
async def admin_update_contact_info(
    payload: ContactSettingsCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(ContactSettings).where(ContactSettings.client_id == tenant.id)
    )
    contact = res.scalar_one_or_none()

    if contact:
        contact.phones = payload.phones
        contact.emails = payload.emails
        contact.address = payload.address
    else:
        contact = ContactSettings(
            client_id=tenant.id,
            phones=payload.phones,
            emails=payload.emails,
            address=payload.address
        )
        db.add(contact)

    await db.commit()
    await db.refresh(contact)
    return contact
