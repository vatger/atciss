from typing import Any

from shapely import Polygon as ShapelyPolygon

from atciss.app.views.sector import Sector, reformat_airspace

# CW square with each vertex doubled
_CW_DUP_POINTS = [
    (0.0, 0.0),
    (0.0, 0.0),
    (1.0, 0.0),
    (1.0, 0.0),
    (1.0, 1.0),
    (1.0, 1.0),
    (0.0, 1.0),
    (0.0, 1.0),
]


def test_point_validator_removes_consecutive_duplicates() -> None:
    sector = Sector(points=_CW_DUP_POINTS)
    for a, b in zip(sector.points, sector.points[1:], strict=False):
        assert a != b


def test_point_validator_closes_ring() -> None:
    sector = Sector(points=_CW_DUP_POINTS)
    assert sector.points[0] == sector.points[-1]


def test_point_validator_winds_ccw() -> None:
    sector = Sector(points=_CW_DUP_POINTS)
    poly = ShapelyPolygon([(lng, lat) for lat, lng in sector.points])
    assert poly.exterior.is_ccw


def _raw_airspace(
    id_: str,
    owner: list[str],
    sectors: list[dict[str, Any]],
    remark: str | None = None,
) -> dict[str, Any]:
    airspace: dict[str, Any] = {"id": id_, "group": "ACC", "owner": owner, "sectors": sectors}
    if remark is not None:
        airspace["remark"] = remark
    return airspace


def test_reformat_airspace_merges_same_id_and_owner_pieces() -> None:
    piece1 = {"points": _CW_DUP_POINTS, "min": None, "max": None, "runways": []}
    piece2 = {"points": _CW_DUP_POINTS, "min": None, "max": None, "runways": []}
    airspaces = [
        _raw_airspace("W2", ["lo/VCW"], [piece1]),
        _raw_airspace("W2", ["lo/VCW"], [piece2]),
    ]

    result = reformat_airspace(airspaces, "lo")

    assert list(result.keys()) == ["lo/W2"]
    assert result["lo/W2"]["sectors"] == [piece1, piece2]


def test_reformat_airspace_merges_same_id_pieces_with_differing_owners() -> None:
    high_band = {"points": _CW_DUP_POINTS, "min": 245, "max": 305, "runways": []}
    low_band = {"points": _CW_DUP_POINTS, "min": 125, "max": 245, "runways": []}
    airspaces = [
        _raw_airspace(
            "West Low (WL)",
            ["lo/LKAA_W_CTR", "fss/EUCEN"],
            [high_band],
            remark="W1L",
        ),
        _raw_airspace(
            "West Low (WL)",
            ["lo/LKAA_W_CTR"],
            [low_band],
            remark="W1L",
        ),
    ]

    result = reformat_airspace(airspaces, "lo")

    assert list(result.keys()) == ["lo/W1L"]
    assert result["lo/W1L"]["sectors"] == [high_band, low_band]
    assert result["lo/W1L"]["owner"] == ["lo/LKAA_W_CTR", "fss/EUCEN"]


def test_reformat_airspace_keeps_distinct_ids_with_same_key_separate() -> None:
    piece1 = {"points": _CW_DUP_POINTS, "min": None, "max": None, "runways": []}
    piece2 = {"points": _CW_DUP_POINTS, "min": None, "max": None, "runways": []}
    airspaces = [
        _raw_airspace("West Low (WL)", ["lo/VCW"], [piece1], remark="W2"),
        _raw_airspace("Some Other Sector", ["lo/VCX"], [piece2], remark="W2"),
    ]

    result = reformat_airspace(airspaces, "lo")

    assert sorted(result.keys()) == ["lo/W2", "lo/W22"]
    assert result["lo/W2"]["sectors"] == [piece1]
    assert result["lo/W22"]["sectors"] == [piece2]
