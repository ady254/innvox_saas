from fastapi import APIRouter, Depends, Request, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc
from typing import List

from ..config.db import get_db
from ..deps.roles import require_admin, require_feature
from ..deps.tenant import get_tenant
from ..models.user import User
from ..models.enrollment import Enrollment
from ..models.announcement import Announcement
from ..models.contact_settings import ContactSettings
from ..models.certificate import Certificate
from ..models.course import Course
from ..models.lead import Lead
from ..schemas.admin_schema import AdminCourseCreate, AdminCourseUpdate, CertificateCreate
from ..schemas.class_schema import ClassCreate
from ..schemas.result_schema import ResultCreate
from ..schemas.announcement_schema import AnnouncementCreate, AnnouncementResponse
from ..schemas.contact_schema import ContactSettingsCreate, ContactSettingsResponse
from ..schemas.lead_schema import LeadResponse
from ..services.admin_service import AdminService
from ..services.class_service import ClassService
from ..services.result_service import ResultService
from ..services.enrollment_service import EnrollmentService

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
        cover_image_url=payload.cover_image_url,
        is_free=payload.is_free,
        currency=payload.currency,
        duration=payload.duration,
        level=payload.level,
        instructor_name=payload.instructor_name,
        type=payload.type,
        has_certificate=payload.has_certificate
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


@router.get("/courses")
async def admin_list_courses(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(Course).where(Course.client_id == tenant.id).order_by(Course.id.desc())
    )
    rows = res.scalars().all()
    return {
        "courses": [
            {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "price": c.price,
                "cover_image_url": c.cover_image_url,
                "is_free": c.is_free,
                "currency": c.currency,
                "duration": c.duration,
                "level": c.level,
                "instructor_name": c.instructor_name,
                "type": c.type,
                "has_certificate": c.has_certificate,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in rows
        ]
    }


@router.put("/course/{course_id}")
async def admin_update_course(
    course_id: int,
    payload: AdminCourseUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(Course).where(Course.id == course_id, Course.client_id == tenant.id)
    )
    course = res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    await db.commit()
    await db.refresh(course)
    return {
        "message": "Course updated successfully",
        "course": {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "price": course.price,
        },
    }


@router.delete("/course/{course_id}")
async def admin_delete_course(
    course_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(Course).where(Course.id == course_id, Course.client_id == tenant.id)
    )
    course = res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    await db.delete(course)
    await db.commit()
    return {"message": "Course deleted successfully"}


@router.post("/certificate", status_code=status.HTTP_201_CREATED, dependencies=[require_feature("certificates")])
async def admin_create_certificate(
    payload: CertificateCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    certificate = Certificate(
        client_id=tenant.id,
        user_id=payload.user_id,
        course_id=payload.course_id,
        file_url=payload.file_url
    )
    db.add(certificate)
    await db.commit()
    return {"message": "Certificate assigned successfully"}

@router.get("/certificates", dependencies=[require_feature("certificates")])
async def admin_get_certificates(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(Certificate).where(Certificate.client_id == tenant.id).order_by(desc(Certificate.issued_at))
    )
    certs = res.scalars().all()
    return {
        "certificates": [
            {
                "id": c.id,
                "user_id": c.user_id,
                "course_id": c.course_id,
                "file_url": c.file_url,
                "issued_at": c.issued_at.isoformat() if c.issued_at else None
            } for c in certs
        ]
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

# --- Leads / Inquiries Management ---

@router.get("/leads", response_model=List[LeadResponse])
async def admin_list_leads(
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(Lead)
        .where(Lead.client_id == tenant.id)
        .order_by(desc(Lead.created_at))
    )
    return res.scalars().all()

@router.delete("/leads/{lead_id}")
async def admin_delete_lead(
    lead_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.client_id == tenant.id)
    )
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    await db.delete(lead)
    await db.commit()
    return {"message": "Lead deleted successfully"}

