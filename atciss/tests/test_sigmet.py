from typing import Any

import pytest
from pydantic import ValidationError

from atciss.app.views.sigmet import Sigmet
from atciss.tests.fixtures import AREAS_RINGS_WITH_BOGUS_RING

AREA_SIGMET: dict[str, Any] = {
    "icaoId": "FAOR",
    "firId": "FAJA",
    "firName": "FAJA JOHANNESBURG",
    "receiptTime": "2026-06-20T10:13:30.633Z",
    "validTimeFrom": 1781978400,
    "validTimeTo": 1781992800,
    "seriesId": "D01",
    "hazard": "TURB",
    "qualifier": "SEV",
    "base": 0,
    "top": 6500,
    "geom": "AREA",
    "coords": [
        {"lon": 28.75, "lat": -31.083},
        {"lon": 30.9, "lat": -32.25},
        {"lon": 30.85, "lat": -32.35},
        {"lon": 28.65, "lat": -31.133},
    ],
    "dir": None,
    "spd": None,
    "chng": None,
    "rawSigmet": (
        "WSZA21 FAOR 201746\nFAJA SIGMET D01 VALID 201800/202200 FAOR-\n"
        "FAJA JOHANNESBURG FIR SEV TURB FCST WI\n"
        "S3105 E02845 - S3215 E03054 - S3221 E03051 - S3108 E02839 SFC/FL065="
    ),
}

LINE_SIGMET: dict[str, Any] = {
    "icaoId": "AYPY",
    "firId": "AYPM",
    "firName": "AYPM PORT MORESBY",
    "receiptTime": "2026-06-20T20:40:59.932Z",
    "validTimeFrom": 1781987460,
    "validTimeTo": 1782001860,
    "seriesId": "3C",
    "hazard": "TS",
    "qualifier": "EMBD",
    "base": None,
    "top": 52000,
    "geom": "LINE",
    "coords": [
        {"lon": 164.2, "lat": -4.5},
        {"lon": 162.667, "lat": -0.017},
    ],
    "dir": "W",
    "spd": "25",
    "chng": "NC",
    "rawSigmet": (
        "WSNG20 AYPY 202040\nAYPM SIGMET 3C VALID 202031/210031 AYPY-\n"
        "AYPM PORT MORESBY FIR EMBD TS OBS WI N0033 E17000 - N0000 E17000 -\n"
        "S0431 E17000 - S0430 E16412 - S0001 E16240 - N0033 E17000 TOP FL520\n"
        "MOV W 25KT NC="
    ),
}

AREAS_SIGMET: dict[str, Any] = {
    "icaoId": "FCBB",
    "firId": "FCCC",
    "firName": "FCCC BRAZZAVILLE",
    "receiptTime": "2026-06-20T20:16:44.951Z",
    "validTimeFrom": 1781986500,
    "validTimeTo": 1782000900,
    "seriesId": "D2",
    "hazard": "TS",
    "qualifier": "EMBD",
    "base": None,
    "top": 43000,
    "geom": "AREAS",
    "coords": AREAS_RINGS_WITH_BOGUS_RING,
    "dir": "W",
    "spd": "UNK",
    "chng": "NC",
    "rawSigmet": (
        "WSCG31 FCBB 202015\nFCCC SIGMET D2 VALID 202015/210015 FCBB-\n"
        "FCCC BRAZZAVILLE FIR/UIR EMBD TS OBS AT 1945Z\n"
        "E OF LINE N0800 E01409 - N0127 E01409\n"
        "W OF LINE N0623 E01335 - N0047 E01335\n"
        "E OF LINE N0127 E01719 - S0132 E01620\n"
        "TOP FL430 MOV W 05KT NC="
    ),
}

EMPTY_SIGMET: dict[str, Any] = {}


def test_isigmet_id_synthesized_from_fir_and_series() -> None:
    sigmet = Sigmet.model_validate(AREA_SIGMET)

    assert sigmet.isigmetId == "FAJA-D01"


def test_isigmet_id_passed_through_when_present() -> None:
    sigmet = Sigmet.model_validate({**AREA_SIGMET, "isigmetId": "explicit-id"})

    assert sigmet.isigmetId == "explicit-id"


def test_missing_fir_or_series_and_no_isigmet_id_raises() -> None:
    with pytest.raises(ValidationError):
        _ = Sigmet.model_validate(EMPTY_SIGMET)


def test_area_geom_validates_and_dumps_closed_ring() -> None:
    sigmet = Sigmet.model_validate(AREA_SIGMET)
    coords = sigmet.model_dump(mode="json")["coords"]

    assert coords[0] == coords[-1]
    assert len(coords) == len(AREA_SIGMET["coords"]) + 1


def test_line_geom_validates_and_dumps_flat_ring() -> None:
    sigmet = Sigmet.model_validate(LINE_SIGMET)
    coords = sigmet.model_dump(mode="json")["coords"]

    assert coords == [[-4.5, 164.2], [-0.017, 162.667]]


def test_areas_geom_validates_and_drops_invalid_ring() -> None:
    sigmet = Sigmet.model_validate(AREAS_SIGMET)
    coords = sigmet.model_dump(mode="json")["coords"]

    assert len(coords) == 3
    for ring in coords:
        assert ring[0] == ring[-1]


def test_unrecognized_geom_raises() -> None:
    with pytest.raises(ValidationError):
        _ = Sigmet.model_validate({**AREA_SIGMET, "geom": "WEIRD"})


def test_missing_geom_raises() -> None:
    bad = {k: v for k, v in AREA_SIGMET.items() if k != "geom"}
    with pytest.raises(ValidationError):
        _ = Sigmet.model_validate(bad)


@pytest.mark.parametrize(
    ("spd", "expected"),
    [("UNK", None), ("25", 25), (None, None), (5, 5)],
)
def test_spd_unknown_to_none(spd: str | int | None, expected: int | None) -> None:
    sigmet = Sigmet.model_validate({**AREA_SIGMET, "spd": spd})

    assert sigmet.spd == expected


def test_valid_time_epoch_int_parses_to_aware_utc() -> None:
    sigmet = Sigmet.model_validate(AREA_SIGMET)

    assert sigmet.validTimeFrom.tzinfo is not None
    assert sigmet.validTimeFrom.utcoffset() is not None
    assert sigmet.validTimeFrom.utcoffset().total_seconds() == 0  # type: ignore[union-attr]


def test_receipt_time_iso_string_parses_to_aware_utc() -> None:
    sigmet = Sigmet.model_validate(AREA_SIGMET)

    assert sigmet.receiptTime.tzinfo is not None
    assert sigmet.receiptTime.utcoffset().total_seconds() == 0  # type: ignore[union-attr]
