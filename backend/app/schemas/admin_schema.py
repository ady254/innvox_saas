from typing import Optional
from pydantic import BaseModel, Field

class AdminCourseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    price: int = Field(..., ge=0)
    cover_image_url: Optional[str] = None
    is_free: bool = False
    currency: str = "INR"
    duration: Optional[str] = None
    level: Optional[str] = None
    instructor_name: Optional[str] = None
    type: str = "self-paced"
    has_certificate: bool = False

class CertificateCreate(BaseModel):
    user_id: int
    course_id: int
    file_url: str
