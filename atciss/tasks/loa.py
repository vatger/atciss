from collections import defaultdict
from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from loguru import logger
from pydantic import TypeAdapter

from atciss.app.utils import Redis, get_aiohttp_client, get_redis
from atciss.app.views.loa import LoaItem
from atciss.config import settings
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/60 * * * *"}])
async def fetch_loas(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch loa data."""
    async with http_client.get(settings.LOA_URL) as res:
        loas = TypeAdapter(list[LoaItem]).validate_python(await res.json())

    loas_per_fir_or_sector = defaultdict(list)
    for loa in loas:
        if loa.from_sector:
            loas_per_fir_or_sector[loa.from_sector].append(loa)
        loas_per_fir_or_sector[loa.from_fir].append(loa)
        if loa.to_sector:
            loas_per_fir_or_sector[loa.to_sector].append(loa)
        loas_per_fir_or_sector[loa.to_fir].append(loa)

    logger.info(f"LoAs: {len(loas)} received")

    async with redis.pipeline() as pipe:
        for fir, loas in loas_per_fir_or_sector.items():
            pipe.set(f"loa:{fir}", TypeAdapter(list[LoaItem]).dump_json(loas))
        await pipe.execute()
