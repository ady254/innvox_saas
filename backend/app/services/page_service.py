from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.page_content import PageContent
from app.schemas.page_schema import PageContentUpdate

async def get_page(db: AsyncSession, client_id: int, page_name: str) -> PageContent | None:
    res = await db.execute(
        select(PageContent).where(
            PageContent.client_id == client_id,
            PageContent.page_name == page_name
        )
    )
    return res.scalar_one_or_none()

async def create_or_update_page(db: AsyncSession, client_id: int, page_name: str, data: PageContentUpdate) -> PageContent:
    page = await get_page(db, client_id, page_name)

    if page:
        # Update existing
        update_data = data.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(page, k, v)
    else:
        # Create new
        page = PageContent(
            client_id=client_id,
            page_name=page_name,
            **data.model_dump()
        )
        db.add(page)

    await db.commit()
    await db.refresh(page)
    return page

async def get_all_pages(db: AsyncSession, client_id: int):
    res = await db.execute(
        select(PageContent).where(PageContent.client_id == client_id)
    )
    return res.scalars().all()
