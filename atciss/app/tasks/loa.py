import logging
from collections import defaultdict
from typing import List

from pydantic import TypeAdapter

from ..views.loa import LoaItem
from ..utils import AiohttpClient, ClientConnectorError, RedisClient

log = logging.getLogger(__name__)


# @repeat_every(seconds=3600, logger=log)
async def fetch_loas() -> None:
    """Periodically fetch loa data."""
    redis_client = await RedisClient.open()
    aiohttp_client = AiohttpClient.get()

    try:
        res = await aiohttp_client.get(
            "https://loa.vatsim-germany.org/api/v1/conditions",
        )
    except ClientConnectorError as e:
        log.exception(f"Could not connect {e!s}")
        return

    loas = TypeAdapter(List[LoaItem]).validate_python(await res.json())
    loas_per_fir_or_sector = defaultdict(list)
    for loa in loas:
        if loa.from_sector:
            loas_per_fir_or_sector[loa.from_sector].append(loa)
        loas_per_fir_or_sector[loa.from_fir].append(loa)
        if loa.to_sector:
            loas_per_fir_or_sector[loa.to_sector].append(loa)
        loas_per_fir_or_sector[loa.to_fir].append(loa)

    log.info(f"LoAs: {len(loas)} received")

    async with redis_client.pipeline() as pipe:
        for fir, loas in loas_per_fir_or_sector.items():
            pipe.set(f"loa:{fir}", TypeAdapter(List[LoaItem]).dump_json(loas))
        await pipe.execute()
