import asyncio
from sqlalchemy import select
from app.config.db import engine
from app.models.user import User, UserRole

async def main():
    async with engine.begin() as conn:
        res = await conn.execute(select(User).where(User.email == "super@admin.com"))
        user = res.scalars().first()
        if user:
            # We use an UPDATE statement because we are using a Connection object in engine.begin()
            from sqlalchemy import update
            await conn.execute(
                update(User).where(User.id == user.id).values(role=UserRole.super_admin)
            )
            print(f"Promoted {user.email} to super_admin")
        else:
            print("User super@admin.com not found")

if __name__ == "__main__":
    asyncio.run(main())
