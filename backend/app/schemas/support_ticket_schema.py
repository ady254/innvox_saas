from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models.support_ticket import TicketStatus, TicketPriority

class SupportTicketResponseBase(BaseModel):
    message: str

class SupportTicketResponseCreate(SupportTicketResponseBase):
    is_internal: Optional[int] = 0

class SupportTicketResponse(SupportTicketResponseBase):
    id: int
    ticket_id: int
    user_id: int
    user_name: Optional[str]
    is_internal: int
    created_at: datetime

    class Config:
        from_attributes = True

class SupportTicketBase(BaseModel):
    subject: str
    description: str
    priority: TicketPriority = TicketPriority.medium

class SupportTicketCreate(SupportTicketBase):
    pass

class SupportTicketUpdate(BaseModel):
    status: Optional[TicketStatus]
    priority: Optional[TicketPriority]

class SupportTicket(SupportTicketBase):
    id: int
    client_id: int
    user_id: int
    status: TicketStatus
    created_at: datetime
    updated_at: Optional[datetime]
    client_name: Optional[str]
    user_name: Optional[str]
    responses: List[SupportTicketResponse] = []

    class Config:
        from_attributes = True
