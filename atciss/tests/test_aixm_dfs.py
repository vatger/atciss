import io
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

from atciss.app.views.airway import Airway, AirwaySegment
from atciss.app.views.dfs_aixm import Aerodrome, Navaid, Runway, RunwayDirection
from atciss.app.views.dfs_rest import LeafItem
from atciss.tasks import aixm_dfs
from atciss.tests.fixtures import FakeAsyncSession

FIXTURE_DIR = Path(__file__).parent / "data" / "aixm"

FIXTURE_FILES = {
    "ED AirportHeliport": FIXTURE_DIR / "airport_heliport.xml",
    "ED Runway": FIXTURE_DIR / "runway.xml",
    "ED Navaids": FIXTURE_DIR / "navaids.xml",
    "ED Waypoints": FIXTURE_DIR / "waypoints.xml",
    "ED Routes": FIXTURE_DIR / "routes.xml",
}


@pytest.mark.asyncio
async def test_fetch_dfs_aixm_data_persists_expected_rows(monkeypatch: pytest.MonkeyPatch) -> None:
    def fake_get_dfs_aixm_url(
        _datasets: dict[str, LeafItem], _amdt_id: int, dataset_name: str
    ) -> str:
        return f"fixture://{dataset_name}"

    monkeypatch.setattr(aixm_dfs, "get_dfs_aixm_datasets", AsyncMock(return_value={}))
    monkeypatch.setattr(aixm_dfs, "get_dfs_aixm_url", fake_get_dfs_aixm_url)

    async def fake_http_get_bytesio(url: str, _http_client: object) -> io.BytesIO:  # noqa: RUF029
        dataset_name = url.removeprefix("fixture://")
        return io.BytesIO(FIXTURE_FILES[dataset_name].read_bytes())

    monkeypatch.setattr(aixm_dfs, "http_get_bytesio", fake_http_get_bytesio)

    session = FakeAsyncSession()
    await aixm_dfs.fetch_dfs_aixm_data(http_client=MagicMock(), db_session=session)  # type: ignore[arg-type]

    aerodromes = session.merged_of(Aerodrome)
    assert {a.icao_designator for a in aerodromes} == {"EDRN", "EDQA"}

    runways = session.merged_of(Runway)
    assert [(r.designator, r.length) for r in runways] == [("05/23", 560.0)]

    runway_directions = session.merged_of(RunwayDirection)
    assert {d.designator for d in runway_directions} == {"05", "23"}

    navaids = session.merged_of(Navaid)
    assert {n.designator for n in navaids} == {"KPT", "ATMAX", "BEMKI"}

    airways = session.merged_of(Airway)
    assert [(a.designatorSecondLetter, a.designatorNumber) for a in airways] == [("Z", "999")]

    segments = session.merged_of(AirwaySegment)
    assert len(segments) == 2
    for segment in segments:
        # exercises postgis_line_validate parsing a real gml:posList string
        assert segment.curve_extent is not None
