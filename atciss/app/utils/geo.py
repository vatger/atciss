from math import copysign
from typing import Tuple, cast

from geoalchemy2 import WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from pydantic import SerializationInfo
from shapely import Point


Coordinate = Tuple[float, float]


def convert_degsecmin_coordinate(coordinate: str) -> float:
    sec = float(coordinate[-2:])
    minutes = float(coordinate[-4:-2])
    deg = float(coordinate[:-4])

    return deg + copysign(minutes, deg) / 60 + copysign(sec, deg) / 3600


def postgis_coordinate_validate(input: Coordinate | tuple[str, str] | str | WKBElement | WKTElement) -> WKTElement | WKBElement:
    if isinstance(input, WKTElement) or isinstance(input, WKBElement):
        return input

    if isinstance(input, str):
        input = cast(tuple[str, str], input.split(" "))

    return WKTElement(f"POINT({input[1]} {input[0]})")

def postgis_coordinate_serialize(loc: WKBElement | WKTElement, _info: SerializationInfo) -> tuple[float, float]:
    point: Point = to_shape(loc)

    return (point.y, point.x)
