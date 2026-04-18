from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.config.db import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    
    file_url = Column(String(500), nullable=False)
    issued_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relationships
    client = relationship("Client")
    user = relationship("User")
    course = relationship("Course")

    def __repr__(self) -> str:
        return f"<Certificate id={self.id} user_id={self.user_id} course_id={self.course_id}>"
