import asyncio
from sqlalchemy import text
from app.config.db import engine

async def main():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);"))
            print("Added reset_token")
        except Exception as e:
            print(f"Error adding reset_token: {e}")
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP WITH TIME ZONE;"))
            print("Added reset_token_expiry")
        except Exception as e:
            print(f"Error adding reset_token_expiry: {e}")

asyncio.run(main())
