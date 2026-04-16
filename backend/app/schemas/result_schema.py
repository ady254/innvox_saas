from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ResultCreate(BaseModel):
    user_id: int
    course_id: int
    marks: float = Field(..., ge=0)
    grade: Optional[str] = Field(None, max_length=50)
    remarks: Optional[str] = None

class ResultResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    marks: float
    grade: Optional[str]
    remarks: Optional[str]
    client_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ResultWithStudentResponse(ResultResponse):
    student_name: str
    student_email: str
