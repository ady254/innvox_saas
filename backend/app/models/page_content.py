from sqlalchemy import Column, Integer, String, Text, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.db import Base

class PageContent(Base):
    __tablename__ = "page_contents"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    page_name = Column(String(50), nullable=False) # home, about, contact
    title = Column(String(255), nullable=False)
    subtitle = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    banner_image = Column(Text, nullable=True)
    cta_text = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    client = relationship("Client")

    __table_args__ = (
        UniqueConstraint("client_id", "page_name", name="uq_client_page"),
    )
