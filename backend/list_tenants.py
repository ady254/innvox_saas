import asyncio
from app.config.db import SessionLocal
from app.models.client import Client
from sqlalchemy import select

async def run():
    async with SessionLocal() as s:
        res = await s.execute(select(Client))
        clients = res.scalars().all()
        print("\n=== Registered Tenants ===")
        for c in clients:
            print(f"ID: {c.id} | Name: {c.name} | Domain: {c.domain} | IsActive: {c.is_active}")
        print("==========================\n")

if __name__ == "__main__":
    asyncio.run(run())
