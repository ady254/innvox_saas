from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.config.db import get_db
from app.deps.tenant import get_tenant
from app.models.lead import Lead
from app.schemas.lead_schema import LeadCreate, LeadResponse

router = APIRouter(tags=["leads"])

@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    request: Request,
    payload: LeadCreate,
    db: AsyncSession = Depends(get_db)
):
    tenant = get_tenant(request)
    new_lead = Lead(
        client_id=tenant.id,
        name=payload.name,
        email=payload.email,
        message=payload.message
    )
    db.add(new_lead)
    await db.commit()
    await db.refresh(new_lead)
    return new_lead
