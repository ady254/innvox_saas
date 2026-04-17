from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, DateTime, Integer, String, func
from sqlalchemy import Boolean, Column, DateTime, Integer, String, func, JSON
from sqlalchemy.orm import relationship

from app.config.db import Base

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.enrollment import Enrollment
    from app.models.user import User
    from app.models.class_model import ClassSession


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=False, unique=True, index=True)
    primary_color = Column(String(50), nullable=False)
    logo = Column(String(1024), nullable=True)
    is_active = Column(Boolean, nullable=False, server_default="true")
    plan = Column(String(50), nullable=False, server_default="starter")  # starter, growth, premium
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    razorpay_key = Column(String(255), nullable=False)
    razorpay_secret = Column(String(255), nullable=False)
    allowed_languages = Column(JSON, default=lambda: ["en", "hi", "ur"])
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Relationships
    users = relationship("User", back_populates="client", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="client", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="client", cascade="all, delete-orphan")
    classes = relationship("ClassSession", back_populates="client", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Client id={self.id!r} name={self.name!r} domain={self.domain!r} active={self.is_active!r}>"

