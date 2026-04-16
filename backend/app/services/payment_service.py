from __future__ import annotations

from dataclasses import dataclass

import razorpay
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client
from app.models.course import Course
from app.models.user import User


@dataclass(frozen=True)
class RazorpayOrderResult:
    order_id: str
    amount: int
    currency: str
    key_id: str


class PaymentService:
    @staticmethod
    async def _get_client_credentials(db: AsyncSession, client_id: int) -> tuple[str, str]:
        res = await db.execute(select(Client).where(Client.id == client_id, Client.is_active == True))  # noqa: E712
        client = res.scalar_one_or_none()
        if client is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found or inactive")
        return client.razorpay_key, client.razorpay_secret

    @staticmethod
    async def create_order(db: AsyncSession, user: User, course: Course) -> RazorpayOrderResult:
        if user.client_id != course.client_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cross-tenant access denied")

        # Upgrade 1: Prevent duplicate enrollment
        from app.services.enrollment_service import EnrollmentService
        is_enrolled = await EnrollmentService.validate_enrollment_access(
            db, user_id=user.id, course_id=course.id, client_id=user.client_id
        )
        if is_enrolled:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already enrolled in this course")

        key_id, key_secret = await PaymentService._get_client_credentials(db=db, client_id=user.client_id)

        amount_paise = int(course.price) * 100
        if amount_paise <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid course price")

        client = razorpay.Client(auth=(key_id, key_secret))
        try:
            order = client.order.create(
                {
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": f"course_{course.id}_user_{user.id}",
                    "payment_capture": 1,
                    "notes": {"course_id": str(course.id), "user_id": str(user.id), "client_id": str(user.client_id)},
                }
            )
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Failed to create Razorpay order") from e

        order_id = order.get("id")
        if not order_id:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Razorpay order creation failed")

        return RazorpayOrderResult(order_id=order_id, amount=amount_paise, currency="INR", key_id=key_id)

    @staticmethod
    async def verify_payment(
        db: AsyncSession,
        client_id: int,
        payment_id: str,
        order_id: str,
        signature: str,
    ) -> bool:
        key_id, key_secret = await PaymentService._get_client_credentials(db=db, client_id=client_id)
        client = razorpay.Client(auth=(key_id, key_secret))
        try:
            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": payment_id,
                    "razorpay_signature": signature,
                }
            )
            return True
        except Exception:
            return False

