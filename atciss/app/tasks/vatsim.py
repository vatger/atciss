import logging
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from aiohttp import ClientConnectorError

from pydantic import TypeAdapter

from ..utils import AiohttpClient, RedisClient, repeat_every
from ..views.atis import Atis
from ..views.vatsim import Controller

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


@repeat_every(seconds=30, logger=log)
async def fetch_vatsim_data() -> None:
    """Periodically fetch sector data."""
    redis_client = await RedisClient.open()
    aiohttp_client = AiohttpClient.get()

    try:
        res = await aiohttp_client.get("https://data.vatsim.net/v3/vatsim-data.json")
    except ClientConnectorError as e:
        log.error(f"Could not connect {str(e)}")
        return

    data = TypeAdapter(VatsimData).validate_python(await res.json())

    controllers = [c for c in data.controllers if c.facility > 0]

    log.info(
        f"Vatsim data received: {len(controllers)} controllers, {len(data.atis)} ATIS"
    )

    async with redis_client.pipeline() as pipe:
        keys = await redis_client.keys("vatsim:atis:*")
        keys.extend(await redis_client.keys("vatsim:controller:*"))

        if len(keys):
            _ = await redis_client.delete(*keys)

        for atis in data.atis:
            pipe.set(f"vatsim:atis:{atis.callsign}", TypeAdapter(Atis).dump_json(atis))

        for controller in controllers:
            pipe.set(
                f"vatsim:controller:{controller.callsign}",
                TypeAdapter(Controller).dump_json(controller),
            )

        await pipe.execute()
