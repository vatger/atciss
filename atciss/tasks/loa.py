from pathlib import Path
from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from loa import Agreement, Doc
from loguru import logger
from pydantic import TypeAdapter
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlmodel import select

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.db import get_session
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.loa import LoaItem
from atciss.config import settings
from atciss.tkq import broker

BASE_URI = "https://raw.githubusercontent.com/VATGER-Nav/loa/refs/heads/production/dist/"


@broker.task(schedule=[{"cron": "23 2 * * *"}])
async def fetch_loas(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    db_session: Annotated[AsyncSession, Depends(get_session)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch loa data."""
    async with http_client.get(BASE_URI + "agreements.json") as res:
        json = (await res.json(content_type="text/plain"))["agreements"]
    loas = TypeAdapter(list[Agreement]).validate_python(json)

    prev_loa_items = await db_session.execute(select(LoaItem))
    for (loa_item,) in prev_loa_items.all():
        await db_session.delete(loa_item)
    await db_session.flush()

    for idx, loa_item in enumerate(loas):
        db_session.add(LoaItem.model_validate({"id": idx, **loa_item.model_dump()}))

    await db_session.flush()
    await db_session.commit()

    logger.info(f"LoAs: {len(loas)} received")

    async with http_client.get(BASE_URI + "docs.json") as res:
        json = (await res.json(content_type="text/plain"))["docs"]
    docs = TypeAdapter(list[Doc]).validate_python(json)

    target_path = Path(settings.LOA_DOCS_PATH)
    for doc in docs:
        async with http_client.get(BASE_URI + "/docs/" + doc.filename) as res:
            if res.status == 200:
                with (target_path / doc.filename).open("wb") as f:
                    async for chunk in res.content.iter_chunked(1024 * 64):
                        _ = f.write(chunk)
            else:
                logger.error(f"Fetching LoA doc {doc.filename} has failed with HTTP {res.status}")

    async with await redis.pipeline() as pipe:
        _ = pipe.set("loa-docs:index", TypeAdapter(list[Doc]).dump_json(docs))
        _ = await pipe.execute()

    logger.info(f"LoAs: {len(docs)} documents received")
