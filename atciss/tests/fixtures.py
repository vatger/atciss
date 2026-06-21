from collections import defaultdict
from typing import Any, cast

from sqlmodel import SQLModel
from sqlmodel.sql.expression import SelectOfScalar

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


class FakeAsyncSession:
    """Stands in for `AsyncSession` so AIXM ingestion tasks can be tested without
    a real Postgres+PostGIS instance: `merge()` records rows in memory and
    `scalar()` looks them up, mirroring the subset of session behaviour the
    `atciss.tasks.aixm_dfs` `process_*` functions rely on."""

    def __init__(self) -> None:
        super().__init__()
        self.merged: list[SQLModel] = []
        self._store: dict[type[SQLModel], dict[Any, SQLModel]] = defaultdict(dict)

    async def merge(self, instance: SQLModel) -> SQLModel:
        self._store[type(instance)][instance.id] = instance  # type: ignore[attr-defined]
        self.merged.append(instance)
        return instance

    async def scalar(self, statement: SelectOfScalar[Any]) -> Any:
        entity = statement.column_descriptions[0]["entity"]
        pk = statement.whereclause.right.value  # type: ignore[union-attr]
        return self._store[entity].get(pk)

    def merged_of(self, model: type[SQLModel]) -> list[Any]:
        return [instance for instance in self.merged if isinstance(instance, model)]
