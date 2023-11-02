from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel


async def create_or_update(engine: Any, klass: type[SQLModel], pk: Any, data: dict[str, Any]):
    async with AsyncSession(engine) as session:
        model = await session.get(klass, pk)

        if model is None:
            model = klass(id=pk, **data)  # type: ignore
        else:
            for k, v in data.items():
                setattr(model, k, v)

        session.add(model)
        await session.commit()
