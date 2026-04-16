from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.db import get_db
from app.deps.tenant import get_current_user_for_tenant, get_tenant
from app.models.user import User
from app.services.class_service import ClassService
from app.services.result_service import ResultService

router = APIRouter(tags=["student"])

@router.get("/classes/{course_id}")
async def get_my_classes(
    course_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user_for_tenant(request, db)
    tenant = get_tenant(request)
    
    classes = await ClassService.get_classes_by_course(
        db=db, 
        course_id=course_id, 
        client_id=tenant.id, 
        user_id=user.id, 
        is_admin=False
    )
    return {"classes": classes}

@router.get("/my-results")
async def get_my_results(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user_for_tenant(request, db)
    tenant = get_tenant(request)
    
    results = await ResultService.get_student_results(
        db=db, 
        user_id=user.id, 
        client_id=tenant.id
    )
    return {"results": results}
