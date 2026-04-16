from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, func
from sqlalchemy.orm import relationship

from app.config.db import Base

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.course import Course
    from app.models.user import User


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)

    payment_status = Column(Enum(PaymentStatus, name="payment_status"), nullable=False, server_default=PaymentStatus.pending.value)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    client = relationship("Client", back_populates="enrollments")

    def __repr__(self) -> str:
        return (
            f"<Enrollment id={self.id!r} user_id={self.user_id!r} course_id={self.course_id!r} "
            f"client_id={self.client_id!r} payment_status={self.payment_status!r}>"
        )

