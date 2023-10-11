from dataclasses import dataclass, field
from typing import Any, Optional, Tuple, cast
from loguru import logger

from pydantic import BaseModel, field_validator, model_validator

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
    id: str
    name: str
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


def reformat_airspace(
    airspaces: list[dict[str, Any]], region: str | None
) -> dict[str, Any]:
    result = {}
    for airspace in airspaces:
        key = f"{region}/{airspace.get('remark', airspace['id'])}"
        owners = []
        for owner in airspace["owner"]:
            if "/" in owner or region is None:
                owners.append(owner)
            else:
                owners.append(f"{region}/{owner}")
        airspace["owner"] = owners
        if key not in result:
            result[key] = airspace
        else:
            for i in range(2, 10):
                if f"{key}{i}" not in result:
                    result[f"{key}{i}"] = airspace
                    break
            else:
                logger.warning(f"Too many airspaces with id: {key}")

    return result


def reformat_position(
    positions: dict[str, dict[str, Any]], region: str | None
) -> dict[str, Any]:
    return {
        f"{region}/{id}": pos | {"name": id, "id": f"{region}/{id}"}
        for id, pos in positions.items()
        if id not in ["GGC", "MMC", "WWC"]
    }


def reformat_filter_airports(
    airports: dict[str, Any], region: str | None
) -> dict[str, Any]:
    result = {}
    for icao, airport in airports.items():
        if isinstance(airport, Airport):
            result[icao] = airport
            continue
        if len(icao) != 4 or len(airport.get("topdown", [])) == 0:
            continue

        topdown = []
        for pos in airport.get("topdown", []):
            if isinstance(pos, str):
                if "/" in pos or region is None:
                    topdown.append(pos)
                else:
                    topdown.append(f"{region}/{pos}")
            else:
                rwy_dependent_topdown = []
                for real_pos in pos["topdown"]:
                    if "/" in real_pos or region is None:
                        rwy_dependent_topdown.append(real_pos)
                    else:
                        rwy_dependent_topdown.append(f"{region}/{real_pos}")
                pos["topdown"] = rwy_dependent_topdown

        airport["topdown"] = topdown
        result[icao] = airport

    return result


class SectorData(BaseModel):
    airspace: dict[str, Airspace]
    groups: dict[str, SectorGroup]
    positions: dict[str, Position]
    callsigns: dict[str, dict[str, str]]
    airports: dict[str, Airport]
    region: str | None = None

    @model_validator(mode="before")
    @classmethod
    def add_region_and_unique_airspace_identifier(cls, data: Any) -> Any:
        if isinstance(data, dict) and isinstance(data["airspace"], list):
            data["airspace"] = reformat_airspace(
                data.get("airspace", []), data["region"]
            )
        if (
            isinstance(data, dict)
            and isinstance(data["positions"], dict)
            and "/" not in next(iter(data["positions"]))
        ):
            data["positions"] = reformat_position(
                data.get("positions", {}), data["region"]
            )
        if isinstance(data, dict) and isinstance(data["airports"], dict):
            data["airports"] = reformat_filter_airports(
                data.get("airports", {}), data.get("region")
            )

        return data
