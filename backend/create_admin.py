import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash

async def create_admin():
    async with AsyncSessionLocal() as db:
        admin = User(
            email='employee@enterprise.com',
            hashed_password=get_password_hash('enterprise123'),
            name='Test Employee',
            role='ADMIN',
            department='Engineering',
            employeeId='EMP-00001'
        )
        db.add(admin)
        await db.commit()
        print('Admin created!')

if __name__ == '__main__':
    asyncio.run(create_admin())
