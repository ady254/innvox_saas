from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.config.db import Base

if TYPE_CHECKING:
    from app.models.client import Client
    from app.models.course import Course


class ClassSession(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    meeting_link = Column(String(1024), nullable=False)
    date_time = Column(DateTime(timezone=True), nullable=False)

    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    course = relationship("Course", back_populates="classes")
    client = relationship("Client", back_populates="classes")

    def __repr__(self) -> str:
        return (
            f"<ClassSession id={self.id!r} title={self.title!r} date_time={self.date_time!r} "
            f"course_id={self.course_id!r} client_id={self.client_id!r}>"
        )

