from pydantic import BaseModel, Field


class VerifyPaymentRequest(BaseModel):
    course_id: int = Field(..., gt=0)
    payment_id: str = Field(..., min_length=3, max_length=255)
    order_id: str = Field(..., min_length=3, max_length=255)
    signature: str = Field(..., min_length=3, max_length=2048)

