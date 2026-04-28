from fastapi import APIRouter, Depends, Request, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List

from ..config.db import get_db
from ..deps.roles import require_admin, require_super_admin
from ..deps.tenant import get_tenant
from ..models.user import User, UserRole
from ..models.support_ticket import SupportTicket, SupportTicketResponse, TicketStatus, TicketPriority
from ..schemas.support_ticket_schema import (
    SupportTicketCreate, 
    SupportTicketUpdate, 
    SupportTicket as SupportTicketSchema,
    SupportTicketResponseCreate
)

router = APIRouter(prefix="/support", tags=["support"])

# --- Tenant Admin Endpoints ---

@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_ticket(
    request: Request,
    payload: SupportTicketCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    new_ticket = SupportTicket(
        client_id=tenant.id,
        user_id=user.id,
        subject=payload.subject,
        description=payload.description,
        priority=payload.priority,
        status=TicketStatus.open
    )
    db.add(new_ticket)
    await db.commit()
    await db.refresh(new_ticket)
    return {"message": "Ticket raised successfully", "ticket_id": new_ticket.id}

@router.get("/tickets")
async def get_my_tickets(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(SupportTicket)
        .where(SupportTicket.client_id == tenant.id)
        .order_by(desc(SupportTicket.created_at))
    )
    tickets = res.scalars().all()
    return {
        "tickets": [
            {
                "id": t.id,
                "subject": t.subject,
                "status": t.status,
                "priority": t.priority,
                "created_at": t.created_at.isoformat() if t.created_at else None
            } for t in tickets
        ]
    }

@router.get("/tickets/{ticket_id}")
async def get_ticket_details(
    ticket_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(SupportTicket)
        .where(SupportTicket.id == ticket_id, SupportTicket.client_id == tenant.id)
    )
    ticket = res.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Fetch responses
    resp_res = await db.execute(
        select(SupportTicketResponse, User.name)
        .join(User, SupportTicketResponse.user_id == User.id)
        .where(SupportTicketResponse.ticket_id == ticket_id)
        .order_by(SupportTicketResponse.created_at.asc())
    )
    responses = resp_res.all()

    return {
        "ticket": {
            "id": ticket.id,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        },
        "responses": [
            {
                "id": r.SupportTicketResponse.id,
                "message": r.SupportTicketResponse.message,
                "user_name": r.name,
                "created_at": r.SupportTicketResponse.created_at.isoformat(),
            } for r in responses if r.SupportTicketResponse.is_internal == 0
        ]
    }

@router.post("/tickets/{ticket_id}/respond")
async def respond_to_ticket(
    ticket_id: int,
    payload: SupportTicketResponseCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_admin),
):
    tenant = get_tenant(request)
    res = await db.execute(
        select(SupportTicket)
        .where(SupportTicket.id == ticket_id, SupportTicket.client_id == tenant.id)
    )
    ticket = res.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    new_response = SupportTicketResponse(
        ticket_id=ticket_id,
        user_id=user.id,
        message=payload.message,
        is_internal=0
    )
    db.add(new_response)
    
    # Re-open if closed? Maybe.
    if ticket.status == TicketStatus.closed:
        ticket.status = TicketStatus.in_progress

    await db.commit()
    return {"message": "Response added"}


# --- Super Admin Endpoints ---

@router.get("/admin/tickets")
async def super_admin_get_all_tickets(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    res = await db.execute(
        select(SupportTicket, User.name.label("user_name"))
        .join(User, SupportTicket.user_id == User.id)
        .order_by(desc(SupportTicket.created_at))
    )
    tickets = res.all()
    return {
        "tickets": [
            {
                "id": t.SupportTicket.id,
                "client_id": t.SupportTicket.client_id,
                "user_name": t.user_name,
                "subject": t.SupportTicket.subject,
                "status": t.SupportTicket.status,
                "priority": t.SupportTicket.priority,
                "created_at": t.SupportTicket.created_at.isoformat() if t.SupportTicket.created_at else None
            } for t in tickets
        ]
    }

@router.get("/admin/tickets/{ticket_id}")
async def super_admin_get_ticket_details(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    res = await db.execute(
        select(SupportTicket)
        .where(SupportTicket.id == ticket_id)
    )
    ticket = res.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Fetch responses (including internal ones)
    resp_res = await db.execute(
        select(SupportTicketResponse, User.name)
        .join(User, SupportTicketResponse.user_id == User.id)
        .where(SupportTicketResponse.ticket_id == ticket_id)
        .order_by(SupportTicketResponse.created_at.asc())
    )
    responses = resp_res.all()

    return {
        "ticket": {
            "id": ticket.id,
            "client_id": ticket.client_id,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        },
        "responses": [
            {
                "id": r.SupportTicketResponse.id,
                "message": r.SupportTicketResponse.message,
                "user_name": r.name,
                "is_internal": r.SupportTicketResponse.is_internal,
                "created_at": r.SupportTicketResponse.created_at.isoformat(),
            } for r in responses
        ]
    }

@router.post("/admin/tickets/{ticket_id}/respond")
async def super_admin_respond_to_ticket(
    ticket_id: int,
    payload: SupportTicketResponseCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    res = await db.execute(
        select(SupportTicket)
        .where(SupportTicket.id == ticket_id)
    )
    ticket = res.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    new_response = SupportTicketResponse(
        ticket_id=ticket_id,
        user_id=user.id,
        message=payload.message,
        is_internal=payload.is_internal
    )
    db.add(new_response)
    
    # Update status to in_progress if it was open
    if ticket.status == TicketStatus.open:
        ticket.status = TicketStatus.in_progress

    await db.commit()
    return {"message": "Response added"}

@router.put("/admin/tickets/{ticket_id}/status")
async def super_admin_update_ticket_status(
    ticket_id: int,
    payload: SupportTicketUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    res = await db.execute(
        select(SupportTicket)
        .where(SupportTicket.id == ticket_id)
    )
    ticket = res.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if payload.status:
        ticket.status = payload.status
    if payload.priority:
        ticket.priority = payload.priority

    await db.commit()
    return {"message": "Ticket updated"}
