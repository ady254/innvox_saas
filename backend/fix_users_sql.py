import asyncio
from sqlalchemy import text
from app.config.db import engine

async def main():
    async with engine.begin() as conn:
        # Promote super@admin.com
        res = await conn.execute(text("UPDATE users SET role = 'super_admin' WHERE email = 'super@admin.com'"))
        print(f"Update result: {res.rowcount} row(s) updated.")
        
        # Also fix the admin@abc.com issue if it exists
        res2 = await conn.execute(text("UPDATE users SET email = 'admin@abc.com' WHERE email = 'admin@abc'"))
        print(f"Update result (email fix): {res2.rowcount} row(s) updated.")

if __name__ == "__main__":
    asyncio.run(main())
