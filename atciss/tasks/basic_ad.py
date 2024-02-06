from typing import Annotated

from fastapi import Depends
from loguru import logger
from pydantic import RootModel, TypeAdapter

from atciss.app.utils import AiohttpClient, ClientConnectorError, Redis, get_redis
from atciss.app.views.basic_ad import BasicAD
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "20 4 * * *"}])
async def fetch_basic_ads(
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch basic AD information."""
    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get(
                "https://raw.githubusercontent.com/mwgg/Airports/master/airports.json",
            )
        except ClientConnectorError as e:
            logger.exception(f"Could not connect {e!s}")
            return

        basic_ads = RootModel[dict[str, BasicAD]].model_validate(
            await res.json(content_type="text/plain"),
        )

    logger.info(f"BasicAds Areas: {len(basic_ads.root)} ADs received")

    async with await redis.pipeline() as pipe:
        for icao, data in basic_ads.root.items():
            pipe.set(
                f"basic:ad:{icao}",
                TypeAdapter(BasicAD).dump_json(data),
            )

        await pipe.execute()
