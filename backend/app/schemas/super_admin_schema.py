from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class SuperAdminClientCreate(BaseModel):
    name: str
    domain: str
    primary_color: str
    plan: str
    admin_name: str
    admin_email: EmailStr
    admin_password: str

class SuperAdminClientUpdate(BaseModel):
    plan: Optional[str] = None
    is_active: Optional[bool] = None
    is_maintenance: Optional[bool] = None
    expiry_date: Optional[datetime] = None
    razorpay_key: Optional[str] = None
    razorpay_secret: Optional[str] = None

class SuperAdminResetPassword(BaseModel):
    user_id: int
    new_password: str

class PlatformAnnouncementCreate(BaseModel):
    message: str
    type: str
    priority: str = "normal"
    target: str = "all"
