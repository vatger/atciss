from collections.abc import AsyncIterator

import alembic.command
import alembic.config
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from ...config import settings

engine = create_async_engine(
    str(settings.DATABASE_DSN),
    echo=settings.DEBUG_SQL,
    echo_pool=settings.DEBUG_SQL,
    pool_size=10,
)
async_sessionmaker = sessionmaker(
    bind=engine,  # type: ignore
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncIterator[AsyncSession]:
    session = async_sessionmaker()
    async with session.begin():  # type: ignore
        yield session  # type: ignore


def run_migrations(connection: AsyncSession, cfg: alembic.config.Config):
    cfg.attributes["connection"] = connection
    alembic.command.upgrade(cfg, "head")


async def run_async_migrations():
    alembic_cfg = alembic.config.Config(settings.ALEMBIC_CFG_PATH)
    async with engine.begin() as conn:
        await conn.run_sync(run_migrations, alembic_cfg)
