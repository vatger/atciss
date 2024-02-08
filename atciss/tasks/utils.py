from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel


async def create_or_update(session: AsyncSession, db_model: type[SQLModel], data: dict[str, Any]):
    model = db_model.model_validate(data)
    _ = await session.merge(model)
