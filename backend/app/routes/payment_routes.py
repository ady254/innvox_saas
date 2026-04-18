from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.deps.tenant import get_current_user_for_tenant, get_tenant
from app.models.course import Course
from app.schemas.payment_schema import VerifyPaymentRequest
from app.services.enrollment_service import EnrollmentService
from app.services.payment_service import PaymentService


router = APIRouter(tags=["payments"])


@router.post("/create-order/{course_id}")
async def create_order(course_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user_for_tenant(request, db)
    tenant = get_tenant(request)

    course_res = await db.execute(
        select(Course).where(Course.id == course_id, Course.client_id == tenant.id)
    )
    course = course_res.scalar_one_or_none()
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    order = await PaymentService.create_order(db=db, user=user, course=course)
    return {
        "order_id": order.order_id,
        "amount": order.amount,
        "currency": order.currency,
        "key_id": order.key_id,
        "course": {"id": course.id, "title": course.title, "price": course.price, "client_id": course.client_id},
    }


@router.post("/verify-payment", status_code=status.HTTP_201_CREATED)
async def verify_payment(payload: VerifyPaymentRequest, request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user_for_tenant(request, db)
    tenant = get_tenant(request)

    course_res = await db.execute(
        select(Course).where(Course.id == payload.course_id, Course.client_id == tenant.id)
    )
    course = course_res.scalar_one_or_none()
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if course.client_id != user.client_id or user.client_id != tenant.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cross-tenant access denied")

    ok = await PaymentService.verify_payment(
        db=db,
        client_id=user.client_id,
        payment_id=payload.payment_id,
        order_id=payload.order_id,
        signature=payload.signature,
    )
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment verification failed")

    enrollment = await EnrollmentService.enroll_user(db=db, user=user, course_id=course.id)
    return {
        "message": "Payment verified and enrollment completed",
        "enrollment": {
            "id": enrollment.id,
            "user_id": enrollment.user_id,
            "course_id": enrollment.course_id,
            "client_id": enrollment.client_id,
            "payment_status": enrollment.payment_status.value,
        },
    }

@router.post("/enroll-free/{course_id}", status_code=status.HTTP_201_CREATED)
async def enroll_free(course_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user_for_tenant(request, db)
    tenant = get_tenant(request)

    course_res = await db.execute(
        select(Course).where(Course.id == course_id, Course.client_id == tenant.id)
    )
    course = course_res.scalar_one_or_none()
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if course.client_id != user.client_id or user.client_id != tenant.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cross-tenant access denied")

    if not course.is_free:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This course requires payment")

    enrollment = await EnrollmentService.enroll_user(db=db, user=user, course_id=course.id)
    return {
        "message": "Enrolled in free course successfully",
        "enrollment": {
            "id": enrollment.id,
            "user_id": enrollment.user_id,
            "course_id": enrollment.course_id,
            "client_id": enrollment.client_id,
            "payment_status": enrollment.payment_status.value,
        },
    }


