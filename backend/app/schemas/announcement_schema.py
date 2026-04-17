from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AnnouncementBase(BaseModel):
    title: str
    message: str
    type: str  # "general" or "student"
    priority: str = "normal"  # "high" or "normal"

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementResponse(AnnouncementBase):
    id: int
    client_id: int
    created_at: datetime

    class Config:
        from_attributes = True
