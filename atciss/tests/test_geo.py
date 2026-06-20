import shapely.wkt
from shapely import LineString, MultiPolygon, Polygon

from atciss.app.utils.geo import (
    LatLonDict,
    postgis_line_validate,
    postgis_multipolygon_validate,
    postgis_polygon_validate,
)
from atciss.tests.fixtures import AREAS_RINGS_WITH_BOGUS_RING


def test_postgis_polygon_validate_closes_open_ring() -> None:
    open_ring: list[LatLonDict] = [
        {"lon": -9.717, "lat": -19.883},
        {"lon": -5.483, "lat": -23.883},
        {"lon": 2.967, "lat": -26.65},
        {"lon": -9.833, "lat": -19.933},
    ]

    element = postgis_polygon_validate(open_ring)
    polygon: Polygon = shapely.wkt.loads(element.data)

    assert polygon.exterior.coords[0] == polygon.exterior.coords[-1]
    assert len(polygon.exterior.coords) == len(open_ring) + 1


def test_postgis_polygon_validate_already_closed_ring_unchanged() -> None:
    closed_ring: list[LatLonDict] = [
        {"lon": 0.0, "lat": 0.0},
        {"lon": 1.0, "lat": 0.0},
        {"lon": 1.0, "lat": 1.0},
        {"lon": 0.0, "lat": 0.0},
    ]

    element = postgis_polygon_validate(closed_ring)
    polygon: Polygon = shapely.wkt.loads(element.data)

    assert len(polygon.exterior.coords) == len(closed_ring)


def test_postgis_polygon_validate_tuple_input() -> None:
    open_ring = [("0", "0"), ("0", "1"), ("1", "1")]

    element = postgis_polygon_validate(open_ring)
    polygon: Polygon = shapely.wkt.loads(element.data)

    assert polygon.exterior.coords[0] == polygon.exterior.coords[-1]


def test_postgis_line_validate_dict_input() -> None:
    line: list[LatLonDict] = [
        {"lon": 164.2, "lat": -4.5},
        {"lon": 162.667, "lat": -0.017},
    ]

    element = postgis_line_validate(line)
    linestring: LineString = shapely.wkt.loads(element.data)

    assert list(linestring.coords) == [(164.2, -4.5), (162.667, -0.017)]


def test_postgis_multipolygon_validate_drops_invalid_ring() -> None:
    element = postgis_multipolygon_validate(AREAS_RINGS_WITH_BOGUS_RING)
    multipolygon: MultiPolygon = shapely.wkt.loads(element.data)

    assert len(multipolygon.geoms) == 3
    for polygon in multipolygon.geoms:
        assert polygon.exterior.coords[0] == polygon.exterior.coords[-1]
