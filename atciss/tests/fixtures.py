from typing import cast

from atciss.app.utils.geo import LatLonDict

# Real (trimmed) shape captured from the live AWC isigmet feed for FCBB
# SIGMET D2: 3 real rings plus AWC's bogus trailing ring (a single point
# missing lon), which must be dropped by postgis_multipolygon_validate.
AREAS_RINGS_WITH_BOGUS_RING: list[list[LatLonDict]] = [
    [
        {"lon": 14.15, "lat": 8.0},
        {"lon": 14.15, "lat": 1.45},
        {"lon": 16.15, "lat": 1.45},
        {"lon": 16.15, "lat": 8.0},
    ],
    [
        {"lon": 13.58, "lat": 6.38},
        {"lon": 13.58, "lat": 0.78},
        {"lon": 11.58, "lat": 0.78},
        {"lon": 11.58, "lat": 6.38},
    ],
    [
        {"lon": 17.32, "lat": 1.45},
        {"lon": 16.33, "lat": -1.53},
        {"lon": 18.33, "lat": -1.53},
        {"lon": 19.32, "lat": 1.45},
    ],
    cast("list[LatLonDict]", [{"lon": None, "lat": 6.7}]),
]
