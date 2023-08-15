from collections import defaultdict
from dataclasses import dataclass
import logging
from typing import List, Literal, Optional
from pydantic import TypeAdapter

from ..utils import AiohttpClient, RedisClient, repeat_every

log = logging.getLogger(__name__)

@dataclass
class LoaItem:
    aerodrome: str # FIXME: should be List[str]
    adep_ades: Literal["ADEP"] | Literal["ADES"] | None
    cop: str
    level: int
    feet: bool
    xc: Optional[str]
    special_conditions: str
    from_sector: str
    to_sector: str
    from_fir: str
    to_fir: str


@repeat_every(seconds=3600, logger=log)
async def fetch_loas() -> None:
    """Periodically fetch loa data."""
    redis_client = await RedisClient.open()
    aiohttp_client = AiohttpClient.get()

    res = await aiohttp_client.get("https://loa.vatsim-germany.org/api/v1/conditions")

    loas_per_fir = defaultdict(list)
    for loa in TypeAdapter(List[LoaItem]).validate_python(await res.json()):
        loas_per_fir[loa.from_fir].append(loa)
        loas_per_fir[loa.to_fir].append(loa)

    async with redis_client.pipeline() as pipe:
        for fir, loas in loas_per_fir.items():
            pipe.set(f"loa:{fir}", TypeAdapter(List[LoaItem]).dump_json(loas))
        await pipe.execute()
