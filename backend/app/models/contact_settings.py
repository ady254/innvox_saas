from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, JSON
from sqlalchemy.orm import relationship
from app.config.db import Base

class ContactSettings(Base):
    __tablename__ = "contact_settings"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), unique=True, nullable=False)
    phones = Column(JSON, nullable=True)  # List of strings
    emails = Column(JSON, nullable=True)  # List of strings
    address = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    client = relationship("Client")
