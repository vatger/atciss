from dataclasses import dataclass
from datetime import datetime
import logging
from typing import List, Optional
from pydantic import TypeAdapter

from ..views.atis import Atis
from ..views.controller import Controller

from ..utils import AiohttpClient, RedisClient, repeat_every

log = logging.getLogger(__name__)


@dataclass
class Facility:
    id: int
    short: str
    long: str


@dataclass
class Rating:
    id: int
    short: str
    long: str


@dataclass
class PilotRating:
    id: int
    short_name: str
    long_name: str


@dataclass
class MilitaryRating:
    id: int
    short_name: str
    long_name: str


@dataclass
class FlightPlan:
    flight_rules: str
    aircraft: str
    aircraft_faa: str
    aircraft_short: str
    departure: str
    arrival: str
    alternate: str
    deptime: str
    enroute_time: str
    fuel_time: str
    remarks: str
    route: str
    revision_id: int
    assigned_transponder: str


@dataclass
class Pilot:
    cid: int
    name: str
    callsign: str
    server: str
    pilot_rating: int
    military_rating: int
    latitude: float
    longitude: float
    altitude: int
    groundspeed: int
    transponder: str
    heading: int
    qnh_i_hg: float
    qnh_mb: int
    flight_plan: Optional[FlightPlan]
    logon_time: datetime
    last_updated: datetime


@dataclass
class Server:
    ident: str
    hostname_or_ip: str
    location: str
    name: str
    clients_connection_allowed: int
    client_connections_allowed: bool
    is_sweatbox: bool


@dataclass
class Prefile:
    cid: int
    name: str
    callsign: str
    name: str
    flight_plan: FlightPlan
    last_updated: datetime


@dataclass
class General:
    version: int
    reload: int
    update: str
    update_timestamp: datetime
    connected_clients: int
    unique_users: int


@dataclass
class VatsimData:
    general: General
    pilots: List[Pilot]
    controllers: List[Controller]
    atis: List[Atis]
    servers: List[Server]
    prefiles: List[Prefile]
    facilities: List[Facility]
    ratings: List[Rating]
    pilot_ratings: List[PilotRating]
    military_ratings: List[MilitaryRating]
    facilities: List[Facility]


@repeat_every(seconds=30, logger=log)
async def fetch_vatsim_data() -> None:
    """Periodically fetch sector data."""
    redis_client = await RedisClient.open()
    aiohttp_client = AiohttpClient.get()

    res = await aiohttp_client.get("https://data.vatsim.net/v3/vatsim-data.json")
    data = TypeAdapter(VatsimData).validate_python(await res.json())

    controllers = [c for c in data.controllers if c.facility > 0]
    atis = data.atis

    log.info(f"Vatsim data received: {len(controllers)} controllers, {len(atis)} ATIS")

    async with redis_client.pipeline() as pipe:
        keys = await redis_client.keys("vatsim:atis:*")

        if len(keys):
            await redis_client.delete(*keys)

        for a in atis:
            pipe.set(f"vatsim:atis:{a.callsign}", TypeAdapter(Atis).dump_json(a))

        await pipe.execute()
