from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from loa import Agreement
from loguru import logger
from pydantic import TypeAdapter
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlmodel import select

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.db import get_session
from atciss.app.views.loa import LoaItem
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "23 2 * * *"}])
async def fetch_loas(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    db_session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    """Periodically fetch loa data."""
    async with http_client.get(
        "https://raw.githubusercontent.com/"
        + "VATGER-Nav/loa/refs/heads/production/dist/agreements.json",
    ) as res:
        json = (await res.json(content_type="text/plain"))["agreements"]
    loas = TypeAdapter(list[Agreement]).validate_python(json)

    prev_loa_items = await db_session.execute(select(LoaItem))
    for (loa_item,) in prev_loa_items.all():
        _ = await db_session.delete(loa_item)

    for idx, loa_item in enumerate(loas):
        db_session.add(LoaItem.model_validate({"id": idx, **loa_item.model_dump()}))

    logger.info(f"LoAs: {len(loas)} received")
