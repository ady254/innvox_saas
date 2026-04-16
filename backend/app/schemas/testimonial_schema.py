from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TestimonialBase(BaseModel):
    name: str
    course_name: Optional[str] = None
    content: str
    avatar_url: Optional[str] = None

class TestimonialCreate(TestimonialBase):
    pass

class TestimonialUpdate(TestimonialBase):
    name: Optional[str] = None
    content: Optional[str] = None

class TestimonialResponse(TestimonialBase):
    id: int
    client_id: int
    created_at: datetime

    class Config:
        from_attributes = True
