from dataclasses import dataclass, field
from typing import Optional, Tuple, cast

from pydantic import BaseModel, field_validator

from ..utils.geo import Coordinate, convert_degsecmin_coordinate


def convert_point(point: Tuple[str, str] | Coordinate) -> Coordinate:
    if isinstance(point[0], float):
        return cast(Coordinate, point)

    return cast(
        Coordinate, [convert_degsecmin_coordinate(cast(str, coord)) for coord in point]
    )


@dataclass
class Runway:
    icao: str
    runway: str


class Sector(BaseModel):
    points: list[Coordinate]
    min: Optional[int] = None
    max: Optional[int] = None
    runways: list[Runway] = field(default_factory=list)

    @field_validator("points", mode="before")
    @classmethod
    def point_validator(
        cls, input: list[Tuple[str, str] | Coordinate]
    ) -> list[Coordinate]:
        return [convert_point(point) for point in input]


@dataclass
class Airspace:
    id: str
    group: str
    owner: list[str]
    remark: Optional[str] = None
    sectors: list[Sector] = field(default_factory=list)


@dataclass
class SectorGroup:
    name: str


@dataclass
class Colour:
    hex: str


@dataclass
class Position:
    pre: list[str]
    type: str
    frequency: str
    callsign: str
    colours: list[Colour] = field(default_factory=list)


@dataclass
class RwyDependentTopDown:
    runway: Runway
    topdown: list[str]


@dataclass
class Airport:
    callsign: str
    coord: Coordinate | None = None
    runways: list[str] = field(default_factory=list)
    topdown: list[str | RwyDependentTopDown] = field(default_factory=list)


@dataclass
class SectorData:
    airspace: list[Airspace]
    groups: dict[str, SectorGroup]
    positions: dict[str, Position]
    callsigns: dict[str, dict[str, str]]
    airports: dict[str, Airport]
