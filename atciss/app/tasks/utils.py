from typing import Any
from loguru import logger

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel


async def create_or_update(engine: Any, db_model: type[SQLModel], data: dict[str, Any]):
    async with AsyncSession(engine) as session:
        try:
            model = db_model.model_validate(data)

            _ = await session.merge(model)
            await session.commit()
        except ValueError as e:
            logger.exception(e)
            raise e
