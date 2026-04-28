import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.db import engine
from app.models.user import User
from app.schemas.auth_schema import ForgotPasswordRequest
from app.services.auth_service import AuthService

async def main():
    async with AsyncSession(engine) as db:
        async with db.begin():
            # Trigger forgot password for the test user
            payload = ForgotPasswordRequest(email="testuser@gmail.com")
            # client_id 1 is localhost based on list_clients.py
            result = await AuthService.forgot_password(db, payload, client_id=1)
            print(f"Forgot Password Result: {result}")
            
            # Verify token in DB
            res = await db.execute(select(User).where(User.email == "testuser@gmail.com"))
            user = res.scalars().first()
            print(f"User Reset Token: {user.reset_token}")
            print(f"User Reset Token Expiry: {user.reset_token_expiry}")

if __name__ == "__main__":
    asyncio.run(main())
