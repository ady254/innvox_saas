from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.config.db import Base

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(20), nullable=False)  # "general" or "student"
    priority = Column(String(10), nullable=False, server_default="normal")  # "high" or "normal"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client")
