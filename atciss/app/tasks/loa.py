from collections import defaultdict

from loguru import logger
from pydantic import TypeAdapter

from ...config import settings
from ..utils import AiohttpClient, ClientConnectorError, RedisClient
from ..views.loa import LoaItem


async def fetch_loas() -> None:
    """Periodically fetch loa data."""
    redis_client = await RedisClient.get()

    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get(settings.LOA_URL)
        except ClientConnectorError as e:
            logger.exception(f"Could not connect {e!s}")
            return

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

    async with redis_client.pipeline() as pipe:
        for fir, loas in loas_per_fir_or_sector.items():
            pipe.set(f"loa:{fir}", TypeAdapter(list[LoaItem]).dump_json(loas))
        await pipe.execute()
