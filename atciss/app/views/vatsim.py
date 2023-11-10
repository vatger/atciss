from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from pydantic import AwareDatetime, BaseModel, field_validator

from atciss.app.views.atis import Atis


class Controller(BaseModel):
    cid: int
    name: str
    callsign: str
    frequency: str
    facility: int
    rating: int
    server: str
    visual_range: int
    logon_time: AwareDatetime
    last_updated: AwareDatetime
    text_atis: str

    @field_validator("text_atis", mode="before")
    @classmethod
    def atis_validator(cls, v: Optional[list[str]]) -> str:
        if v is None:
            return ""
        return "\n".join(v)


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
    pilots: list[Pilot]
    controllers: list[Controller]
    atis: list[Atis]
    servers: list[Server]
    prefiles: list[Prefile]
    facilities: list[Facility]
    ratings: list[Rating]
    pilot_ratings: list[PilotRating]
    military_ratings: list[MilitaryRating]


@dataclass
class Traffic:
    callsign: str
    departure_icao: str
    departure: str
    destination_icao: str
    destination: str
    ac_type: str
    eta: Optional[datetime]
    groundspeed: int

    def __lt__(self, other):
        return self.eta < other.eta

    def __le__(self, other):
        return self.eta <= other.eta

    @classmethod
    def from_pilot(
        cls, pilot: Pilot, eta: Optional[datetime], dep: Optional[str], arr: Optional[str]
    ) -> "Traffic":
        return Traffic(
            callsign=pilot.callsign,
            departure_icao=pilot.flight_plan.departure,
            departure=dep or pilot.flight_plan.departure,
            destination_icao=pilot.flight_plan.arrival,
            destination=arr or pilot.flight_plan.arrival,
            ac_type=pilot.flight_plan.aircraft_short,
            groundspeed=pilot.groundspeed,
            eta=eta,
        )


class AerodromeTraffic(BaseModel):
    aerodrome: str
    arrivals: list[Traffic]
    departures: list[Traffic]
