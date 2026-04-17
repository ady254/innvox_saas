from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ContactSettingsBase(BaseModel):
    phones: List[str] = []
    emails: List[str] = []
    address: Optional[str] = None

class ContactSettingsCreate(ContactSettingsBase):
    pass

class ContactSettingsResponse(ContactSettingsBase):
    id: int
    client_id: int
    updated_at: datetime

    class Config:
        from_attributes = True
