from dataclasses import dataclass, field
import logging
from typing import Dict, List, Tuple
from pydantic import TypeAdapter

from ..utils import AiohttpClient, RedisClient, repeat_every

log = logging.getLogger(__name__)

# check https://github.com/lennycolton/vatglasses-data/tree/main/data
SECTOR_REGIONS = [
    "germany"
]

Coordinate = Tuple[str, str] | Tuple[float, float]

@dataclass
class Sector:
    max: int
    min: int
    points: List[Coordinate]

@dataclass
class Airspace:
    id: str
    group: str
    owner: List[str]
    sectors = List[Sector]

@dataclass
class SectorGroup:
    name: str

@dataclass
class Colour:
    hex: str

@dataclass
class Position:
    pre: List[str]
    type: str
    frequency: str
    callsign: str
    colours: List[Colour] = field(default_factory=list)


@dataclass
class Airport:
    callsign: str
    coord: Coordinate
    topdown: List[str]

@dataclass
class SectorData:
    airspace: List[Airspace]
    groups: Dict[str, SectorGroup]
    positions: Dict[str, Position]
    callsigns: Dict[str, Dict[str, str]]
    airports: Dict[str, Airport]


@repeat_every(seconds=3600, logger=log)
async def fetch_sector_data() -> None:
    """Periodically fetch sector data."""
    redis_client = await RedisClient.open()
    aiohttp_client = AiohttpClient.get()

    data: Dict[str, SectorData] = {}
    for region in SECTOR_REGIONS:
        res = await aiohttp_client.get(
            f"https://raw.githubusercontent.com/lennycolton/vatglasses-data/main/data/{region}.json"
        )
        data[region] = TypeAdapter(SectorData).validate_python(await res.json(content_type="text/plain"))


    async with redis_client.pipeline() as pipe:
        for region in data:
            for airport, ap_data in data[region].airports.items():
                pipe.set(f"sector:airport:{airport}", TypeAdapter(Airport).dump_json(ap_data))
            for position, pos_data in data[region].positions.items():
                pipe.set(f"sector:position:{position}", TypeAdapter(Position).dump_json(pos_data))
            for airspace in data[region].airspace:
                pipe.set(f"sector:airspace:{airspace.id}", TypeAdapter(Airspace).dump_json(airspace))
        await pipe.execute()
