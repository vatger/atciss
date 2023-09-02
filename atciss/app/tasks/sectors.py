import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, cast

from pydantic import TypeAdapter, BaseModel, field_validator

from ..utils import AiohttpClient, RedisClient, repeat_every

log = logging.getLogger(__name__)

# check https://github.com/lennycolton/vatglasses-data/tree/main/data
SECTOR_REGIONS = [ "czechia", "germany" ]
# TODO: LOWZ has rwy-dependent config "austria",
# TODO add italy, poland and switzerland when available

Coordinate = Tuple[float, float]


def convert_coordinate(input: str) -> float:
    sec = int(input[-2:], 10)
    min = int(input[-4:-2], 10)
    deg = int(input[:-4], 10)

    return deg + min / 60 + sec / 3600


def convert_point(point: Tuple[str, str] | Coordinate) -> Coordinate:
    if isinstance(point[0], float):
        return point

    return cast(Coordinate, [convert_coordinate(coord) for coord in point])


class Sector(BaseModel):
    points: List[Coordinate]
    min: Optional[int] = None
    max: Optional[int] = None

    @field_validator("points", mode="before")
    @classmethod
    def point_validator(cls, input: List[Tuple[str, str] | Coordinate]) -> List[Coordinate]:
        return [convert_point(point) for point in input]


@dataclass
class Airspace:
    id: str
    group: str
    owner: List[str]
    sectors: List[Sector] = field(default_factory=list)


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
    topdown: List[str] = field(default_factory=list)


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
            "https://raw.githubusercontent.com/lennycolton/vatglasses-data/main/data"
            + f"/{region}.json"
        )
        data[region] = TypeAdapter(SectorData).validate_python(
            await res.json(content_type="text/plain")
        )

    log.info("Sector data received")

    async with redis_client.pipeline() as pipe:
        for region, region_data in data.items():
            pipe.set(
                f"sector:airports:{region}", TypeAdapter(Dict[str, Airport]).dump_json(region_data.airports)
            )
            pipe.set(
                f"sector:positions:{region}",
                TypeAdapter(Dict[str, Position]).dump_json(region_data.positions),
            )
            pipe.set(
                f"sector:airspaces:{region}",
                TypeAdapter(List[Airspace]).dump_json(region_data.airspace),
            )
        await pipe.execute()
