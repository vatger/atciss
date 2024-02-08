from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from ...config import settings

engine = create_async_engine(
    str(settings.DATABASE_DSN), echo=settings.DEBUG_SQL, echo_pool=settings.DEBUG_SQL, pool_size=10
)
async_sessionmaker = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with async_sessionmaker() as session:
        yield session
