import asyncio
from sqlalchemy import select, insert
from app.config.db import engine, SessionLocal
from app.models.feature_toggle import Feature

async def main():
    async with SessionLocal() as session:
        res = await session.execute(select(Feature).where(Feature.name == "website_settings"))
        feature = res.scalar_one_or_none()
        if not feature:
            session.add(Feature(name="website_settings", display_name="Website Settings"))
            await session.commit()
            print("Added website_settings feature.")
        else:
            print("website_settings already exists.")

if __name__ == "__main__":
    asyncio.run(main())
