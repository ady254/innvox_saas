from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.config.db import Base

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.course import Course
    from app.models.user import User


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    marks = Column(Float, nullable=False)
    grade = Column(String(50), nullable=True)
    remarks = Column(Text, nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_result_user_course"),
    )

    # Relationships
    user = relationship("User", back_populates="results")
    course = relationship("Course", back_populates="results")
    client = relationship("Client")

    def __repr__(self) -> str:
        return (
            f"<Result id={self.id!r} marks={self.marks!r} "
            f"user_id={self.user_id!r} course_id={self.course_id!r}>"
        )
