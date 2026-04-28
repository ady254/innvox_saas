from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, func
from sqlalchemy.orm import relationship
from app.config.db import Base
import enum

class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"

class TicketPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True) # The admin who raised it
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.open, nullable=False)
    priority = Column(Enum(TicketPriority), default=TicketPriority.medium, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    client = relationship("Client")
    user = relationship("User")
    responses = relationship("SupportTicketResponse", back_populates="ticket", cascade="all, delete-orphan")

class SupportTicketResponse(Base):
    __tablename__ = "support_ticket_responses"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Can be Super Admin or Tenant Admin
    message = Column(Text, nullable=False)
    is_internal = Column(Integer, default=0) # If super admins want to leave internal notes (0=public, 1=internal)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ticket = relationship("SupportTicket", back_populates="responses")
    user = relationship("User")
