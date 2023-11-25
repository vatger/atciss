from typing import Any
from pydantic import TypeAdapter

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel


async def create_or_update(engine: Any, klass: type[SQLModel], pk: Any, data: dict[str, Any]):
    async with AsyncSession(engine) as session:
        data = { 'id': pk, **data }
        model = TypeAdapter(klass).validate_python(data)

        _ = await session.merge(model)
        await session.commit()
