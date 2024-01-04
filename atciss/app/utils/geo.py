from math import copysign
from typing import Tuple, TypedDict, cast

from geoalchemy2 import WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from pydantic import SerializationInfo
from shapely import LineString, Point, Polygon


Coordinate = Tuple[float, float]
LatLonDict = TypedDict("LatLonDict", {"lat": float, "lon": float})


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


def postgis_polygon_validate(
    data: list[tuple[str, str]] | list[LatLonDict] | str | WKBElement | WKTElement,
) -> WKTElement | WKBElement:
    if isinstance(data, (WKTElement, WKBElement)):
        return data

    if isinstance(data, str):
        it = iter(data.split(" "))
        data = cast(list[tuple[str, str]], zip(it, it))

    if len(data) and isinstance(data[0], dict):
        polygon = ",".join(f"{p['lon']} {p['lat']}" for p in cast(list[LatLonDict], data))
    else:
        polygon = ",".join(f"{p[1]} {p[0]}" for p in cast(list[tuple[str, str]], data))

    return WKTElement(f"POLYGON(({polygon}))")


def postgis_polygon_serialize(
    loc: WKBElement | WKTElement, _info: SerializationInfo
) -> list[tuple[float, float]]:
    polygon: Polygon = to_shape(loc)

    return [(point[1], point[0]) for point in polygon.exterior.coords]
