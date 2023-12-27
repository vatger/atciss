from math import copysign
from typing import Tuple, cast

from geoalchemy2 import WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from pydantic import SerializationInfo
from shapely import LineString, Point


Coordinate = Tuple[float, float]


def convert_degsecmin_coordinate(coordinate: str) -> float:
    sec = float(coordinate[-2:])
    minutes = float(coordinate[-4:-2])
    deg = float(coordinate[:-4])

    return deg + copysign(minutes, deg) / 60 + copysign(sec, deg) / 3600


def postgis_coordinate_validate(
    data: Coordinate | tuple[str, str] | str | WKBElement | WKTElement,
) -> WKTElement | WKBElement:
    if isinstance(data, (WKTElement, WKBElement)):
        return data

    if isinstance(data, str):
        data = cast(tuple[str, str], data.split(" "))

    return WKTElement(f"POINT({data[1]} {data[0]})")


def postgis_coordinate_serialize(
    loc: WKBElement | WKTElement, _info: SerializationInfo
) -> tuple[float, float]:
    point: Point = to_shape(loc)

    return (point.y, point.x)


def postgis_line_validate(
    data: list[tuple[str, str]] | str | WKBElement | WKTElement,
) -> WKTElement | WKBElement:
    if isinstance(data, (WKTElement, WKBElement)):
        return data

    if isinstance(data, str):
        it = iter(data.split(" "))
        data = cast(list[tuple[str, str]], zip(it, it))

    line = ",".join(f"{p[1]} {p[0]}" for p in data)

    return WKTElement(f"LINESTRING({line})")


def postgis_line_serialize(
    loc: WKBElement | WKTElement, _info: SerializationInfo
) -> list[tuple[float, float]]:
    line: LineString = to_shape(loc)

    return [(point[1], point[0]) for point in line.coords]
