import asyncio
from sqlalchemy import select
from app.config.db import engine
from app.models.client import Client

async def main():
    async with engine.connect() as conn:
        res = await conn.execute(select(Client))
        clients = res.all()
        for c in clients:
            print(f"ID: {c.id}, Name: {c.name}, Domain: {c.domain}")

if __name__ == "__main__":
    asyncio.run(main())
