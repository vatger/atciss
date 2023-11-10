from typing import Dict

from loguru import logger
from pydantic import TypeAdapter, RootModel

from atciss.app.utils.redis import RedisClient
from ..utils import AiohttpClient, ClientConnectorError
from ..views.basic_ad import BasicAD


async def fetch_basic_ads() -> None:
    """Periodically fetch basic AD information."""
    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get(
                "https://raw.githubusercontent.com/mwgg/Airports/master/airports.json"
            )
        except ClientConnectorError as e:
            logger.exception(f"Could not connect {e!s}")
            return

        basic_ads = RootModel[Dict[str, BasicAD]].model_validate(
            await res.json(content_type="text/plain")
        )

    logger.info(f"BasicAds Areas: {len(basic_ads.root)} ADs received")

    async with await RedisClient.get().pipeline() as pipe:
        for icao, data in basic_ads.root.items():
            pipe.set(
                f"basic:ad:{icao}",
                TypeAdapter(BasicAD).dump_json(data),
            )

        await pipe.execute()
