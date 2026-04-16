from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PageContentBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    content: Optional[str] = None
    banner_image: Optional[str] = None
    cta_text: Optional[str] = "Enroll Now"

class PageContentUpdate(PageContentBase):
    pass

class PageContentResponse(PageContentBase):
    id: int
    client_id: int
    page_name: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
