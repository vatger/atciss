from math import copysign
from typing import TYPE_CHECKING, TypedDict, cast

from geoalchemy2 import WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from pydantic import SerializationInfo
from shapely import LineString, MultiPolygon, Polygon

if TYPE_CHECKING:
    from shapely import Point

Coordinate = tuple[float, float]


class LatLonDict(TypedDict):
    lat: float
    lon: float


def convert_degsecmin_coordinate(coordinate: str) -> float:
    sec = float(coordinate[-2:])
    minutes = float(coordinate[-4:-2])
    deg = float(coordinate[:-4])

    return deg + copysign(minutes, deg) / 60 + copysign(sec, deg) / 3600


def postgis_coordinate_validate(
    data: Coordinate | tuple[str, str] | str | WKBElement | WKTElement,
) -> WKTElement | WKBElement:
    if isinstance(data, WKTElement | WKBElement):
        return data

    if isinstance(data, str):
        data = cast("tuple[str, str]", data.split(" "))

    return WKTElement(f"POINT({data[1]} {data[0]})")


def postgis_coordinate_serialize(
    loc: WKBElement | WKTElement,
    _info: SerializationInfo,
) -> tuple[float, float]:
    point: Point = to_shape(loc)

    return (point.y, point.x)


def postgis_line_validate(
    data: list[tuple[str, str]] | list[LatLonDict] | str | WKBElement | WKTElement,
) -> WKTElement | WKBElement:
    if isinstance(data, WKTElement | WKBElement):
        return data

    if isinstance(data, str):
        it = iter(data.split(" "))
        data = cast("list[tuple[str, str]]", zip(it, it, strict=False))

    if len(data) and isinstance(data[0], dict):
        line = ",".join(f"{p['lon']} {p['lat']}" for p in cast("list[LatLonDict]", data))
    else:
        line = ",".join(f"{p[1]} {p[0]}" for p in cast("list[tuple[str, str]]", data))

    return WKTElement(f"LINESTRING({line})")


def postgis_line_serialize(
    loc: WKBElement | WKTElement,
    _info: SerializationInfo,
) -> list[tuple[float, float]]:
    line: LineString = to_shape(loc)

    return [(point[1], point[0]) for point in line.coords]


def _closed_ring_wkt(ring: list[tuple[str, str]] | list[LatLonDict]) -> str:
    points: list[tuple[float, float]]
    if isinstance(ring[0], dict):
        points = [(p["lon"], p["lat"]) for p in cast("list[LatLonDict]", ring)]
    else:
        points = [(float(p[1]), float(p[0])) for p in cast("list[tuple[str, str]]", ring)]

    if points[0] != points[-1]:
        points.append(points[0])

    return ",".join(f"{lon} {lat}" for lon, lat in points)


def postgis_polygon_validate(
    data: list[tuple[str, str]] | list[LatLonDict] | str | WKBElement | WKTElement,
) -> WKTElement | WKBElement:
    if isinstance(data, WKTElement | WKBElement):
        return data

    if isinstance(data, str):
        it = iter(data.split(" "))
        data = list(zip(it, it, strict=False))

    return WKTElement(f"POLYGON(({_closed_ring_wkt(data)}))")


def postgis_polygon_serialize(
    loc: WKBElement | WKTElement,
    _info: SerializationInfo,
) -> list[tuple[float, float]]:
    polygon: Polygon = to_shape(loc)

    return [(point[1], point[0]) for point in polygon.exterior.coords]


def postgis_multipolygon_validate(
    data: list[list[LatLonDict]] | str | WKBElement | WKTElement,
) -> WKTElement | WKBElement:
    if isinstance(data, WKTElement | WKBElement):
        return data

    rings = [
        _closed_ring_wkt(ring)
        for ring in cast("list[list[LatLonDict]]", data)
        if len(ring) >= 3
        and all(
            p.get("lat") is not None and p.get("lon") is not None
            for p in cast("list[dict[str, float | None]]", ring)
        )
    ]

    return WKTElement(f"MULTIPOLYGON({','.join(f'(({ring}))' for ring in rings)})")


def postgis_geometry_serialize(
    loc: WKBElement | WKTElement,
    info: SerializationInfo,
) -> list[tuple[float, float]] | list[list[tuple[float, float]]]:
    shape = to_shape(loc)

    if isinstance(shape, Polygon):
        return postgis_polygon_serialize(loc, info)
    if isinstance(shape, LineString):
        return postgis_line_serialize(loc, info)
    if isinstance(shape, MultiPolygon):
        return [[(point[1], point[0]) for point in geom.exterior.coords] for geom in shape.geoms]

    raise ValueError(f"Unsupported geometry type: {shape.geom_type}")
