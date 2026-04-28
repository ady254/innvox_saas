import asyncio
from sqlalchemy import select, update
from app.config.db import engine
from app.models.user import User, UserRole
from app.utils.hash import hash_password

async def main():
    email = "super@admin.com"
    new_password = "admin123"
    
    async with engine.begin() as conn:
        res = await conn.execute(select(User).where(User.email == email))
        user = res.fetchone()
        
        if user:
            await conn.execute(
                update(User)
                .where(User.email == email)
                .values(
                    password=hash_password(new_password),
                    role=UserRole.super_admin
                )
            )
            print(f"User {email} password reset to '{new_password}' and role set to super_admin.")
        else:
            print(f"User {email} not found. Creating...")
            # We need a client_id 1 which is usually the default tenant
            from app.models.client import Client
            res = await conn.execute(select(Client).limit(1))
            client = res.fetchone()
            client_id = client.id if client else 1
            
            from sqlalchemy import insert
            await conn.execute(
                insert(User).values(
                    name="Super Admin",
                    email=email,
                    password=hash_password(new_password),
                    role=UserRole.super_admin,
                    client_id=client_id
                )
            )
            print(f"User {email} created with password '{new_password}' and role super_admin.")

if __name__ == "__main__":
    asyncio.run(main())
