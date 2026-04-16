from datetime import datetime
from pydantic import BaseModel, Field

class ClassCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    meeting_link: str = Field(..., min_length=1, max_length=1024)
    date_time: datetime
    course_id: int

class ClassResponse(BaseModel):
    id: int
    title: str
    meeting_link: str
    date_time: datetime
    course_id: int
    client_id: int

    class Config:
        from_attributes = True
