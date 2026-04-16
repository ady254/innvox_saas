from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class LeadBase(BaseModel):
    name: str
    email: EmailStr
    message: str

class LeadCreate(LeadBase):
    pass

class LeadResponse(LeadBase):
    id: int
    client_id: int
    created_at: datetime

    class Config:
        from_attributes = True
