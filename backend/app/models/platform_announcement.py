from sqlalchemy import Column, DateTime, Integer, String, func
from app.config.db import Base

class PlatformAnnouncement(Base):
    __tablename__ = "platform_announcements"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String(1024), nullable=False)
    type = Column(String(20), nullable=False) # offer, warning, maintenance
    priority = Column(String(10), nullable=False, server_default="normal") # normal, high
    target = Column(String(20), nullable=False, server_default="all") # all, admins, students
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
