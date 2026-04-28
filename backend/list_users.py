import asyncio
from sqlalchemy import select
from app.config.db import engine
from app.models.user import User

async def main():
    async with engine.connect() as conn:
        res = await conn.execute(select(User))
        users = res.all()
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}, ClientID: {u.client_id}")

if __name__ == "__main__":
    asyncio.run(main())
