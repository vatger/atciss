from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from vatsim.types import Pilot


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
