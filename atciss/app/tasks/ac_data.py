from typing import Any, Dict, Optional, Sequence
from uuid import UUID
import os.path

from loguru import logger
from pydantic import TypeAdapter
from sqlalchemy.ext.asyncio import create_async_engine

from atciss.app.models import AircraftPerformanceData
from atciss.app.views.ac_data import AcdbAcType, AcdbManufacturer
from .utils import create_or_update
from ...config import settings


async def fetch_ac_data():
    logger.info("Processing AC data...")
    wtc_overrides = read_wtc_overrides()
    mf_data = {mf.id: mf for mf in read_manufacturers()}
    ac_types = read_ac_types()
    own_ac_types = read_own_types()

    engine = create_async_engine(
        url=str(settings.DATABASE_DSN),
    )

    await process(engine, mf_data, ac_types, wtc_overrides)
    await process_own_data(engine, own_ac_types)


async def process(
    engine: Any,
    mfs: dict[str, AcdbManufacturer],
    acts: Sequence[AcdbAcType],
    wtc_data: Dict[str, Sequence[str]],
):
    for ac in acts:
        props = {pr.property: pr.value for pr in ac.propertyValues}
        manufacturer = None
        if ac.manufacturer in mfs:
            manufacturer = mfs[ac.manufacturer].name

        ac_data = {
            "id": UUID(ac.id),
            "manufacturer": manufacturer,
            "model": ac.name,
            "iata_designator": ac.iataCode,
            "icao_designator": ac.icaoCode,
            "type": ac.aircraftFamily,
            "engine_type": ac.engineFamily,
            "engine_count": ac.engineCount,
            "fuel_capacity": get_float(props.get("1ec96f9c-4371-6098-9933-2d909f93f3cd")),
            "service_ceiling": get_float(props.get("1ec989bb-f1f3-68c6-9933-d379390912fd")),
            "wingspan": get_float(props.get("1ec96f97-2526-643a-9933-d748a416ba2f")),
            "length": get_float(props.get("1ec85ab4-c080-6d48-b99a-377e0c86c3f3")),
            "height": get_float(props.get("1ec85ab3-da18-6a9a-b99a-331ba92f259f")),
            "max_speed_indicated": get_float(props.get("1ec96fa2-ebe3-6f04-9933-fd26352c594f")),
            "max_speed_mach": get_float(props.get("1ec96fa3-9b42-6be4-9933-8d57c1daa4aa")),
            "max_weight_taxi": get_float(props.get("1ec96f93-c3a5-62d6-9933-a7c5e7bf89fc")),
            "max_weight_takeoff": get_float(props.get("1ec96f93-22b5-66f0-9933-45bd403e4df0")),
            "max_weight_landing": get_float(props.get("1ec96f94-5471-66de-9933-a93eae676780")),
            "max_weight_zerofuel": get_float(props.get("1ec96f95-27d9-6530-9933-1d3ea0db018c")),
            "v_at": None,
            "remarks": None,
        }

        ac_data["cat_wtc"] = get_wtc(
            wtc_data,
            ac.icaoCode,
            ac_data["max_weight_takeoff"],  # type: ignore
        )
        ac_data["cat_recat"] = get_recat(
            wtc_data,
            ac.icaoCode,
            ac_data["wingspan"],  # type: ignore
            ac_data["max_weight_takeoff"],  # type: ignore
        )
        ac_data["cat_arc"] = get_arc(get_float(ac_data["wingspan"]))
        ac_data["cat_app"] = get_app_code(get_float(ac_data["v_at"]))

        await create_or_update(engine, AircraftPerformanceData, ac_data)


async def process_own_data(engine: Any, data: Sequence[AircraftPerformanceData]):
    for ac in data:
        ac_data = {
            "id": ac.id,
            "manufacturer": ac.manufacturer,
            "model": ac.model,
            "iata_designator": ac.iata_designator,
            "icao_designator": ac.icao_designator,
            "type": ac.type,
            "engine_type": ac.engine_type,
            "engine_count": ac.engine_count,
            "fuel_capacity": ac.fuel_capacity,
            "service_ceiling": ac.service_ceiling,
            "wingspan": ac.wingspan,
            "length": ac.length,
            "height": ac.height,
            "max_speed_indicated": ac.max_speed_indicated,
            "max_speed_mach": ac.max_speed_mach,
            "max_weight_taxi": ac.max_weight_taxi,
            "max_weight_takeoff": ac.max_weight_takeoff,
            "max_weight_landing": ac.max_weight_landing,
            "max_weight_zerofuel": ac.max_weight_zerofuel,
            "v_at": ac.v_at,
            "remarks": ac.remarks,
            "cat_wtc": ac.cat_wtc,
            "cat_recat": ac.cat_recat,
            "cat_arc": get_arc(get_float(ac.wingspan)),
            "cat_app": get_app_code(get_float(ac.v_at)),
        }

        await create_or_update(engine, AircraftPerformanceData, ac_data)


def get_wtc(
    wtc_data: Dict[str, Sequence[str]], icao: Optional[str], mtow: Optional[float]
) -> Optional[str]:
    if icao in wtc_data:
        return wtc_data[icao][0]

    if mtow is None:
        return None

    if mtow <= 7_000:
        return "L"

    if mtow < 136_000:
        return "M"

    return "H"


def get_arc(
    span: Optional[float],
) -> Optional[str]:
    # pylint: disable=too-many-return-statements
    if span is None:
        return None

    if span < 15:
        return "A"
    if span < 24:
        return "B"
    if span < 36:
        return "C"
    if span < 52:
        return "D"
    if span < 65:
        return "E"
    if span < 80:
        return "F"

    return "?"


def get_app_code(vat: Optional[float]) -> Optional[str]:
    if vat is None:
        return None

    if vat < 91:
        return "A"
    if vat < 121:
        return "B"
    if vat < 141:
        return "C"
    if vat < 166:
        return "D"

    return "E"


def get_recat(
    wtc_data: Dict[str, Sequence[str]],
    icao: Optional[str],
    span: Optional[float],
    mtow: Optional[float],
) -> Optional[str]:
    # pylint: disable=too-many-return-statements
    if icao in wtc_data:
        return wtc_data[icao][1]

    if mtow is None or span is None:
        return None

    if mtow < 15_000:
        return "F"

    if mtow < 100_000:
        if span < 32:
            return "E"

        return "D"

    if span < 52:
        return "C"

    if span < 60:
        return None  # needs analysis

    if span < 72:
        return "B"

    return "A"


def contrib_ac_path(*pa: Sequence[str]) -> str:
    return os.path.join(settings.CONTRIB_PATH, "ac-data", *pa)


def read_manufacturers() -> Sequence[AcdbManufacturer]:
    with open(contrib_ac_path("aircraft-db", "manufacturers.json"), "rb") as mf:
        return TypeAdapter(Sequence[AcdbManufacturer]).validate_json(mf.read())


def read_ac_types() -> Sequence[AcdbAcType]:
    with open(contrib_ac_path("aircraft-db", "aircraft-types.json"), "rb") as tf:
        return TypeAdapter(Sequence[AcdbAcType]).validate_json(tf.read())


def read_wtc_overrides() -> dict[str, Sequence[str]]:
    data = {}

    with open(contrib_ac_path("wtc-overrides.txt"), "r", encoding="utf-8") as of:
        for line in of.readlines():
            [icao, wtc, recat] = line.split(",")
            data[icao] = [wtc.strip(), recat.strip()]

    return data


def read_own_types() -> Sequence[AircraftPerformanceData]:
    with open(contrib_ac_path("ac-data.json"), "rb") as df:
        return TypeAdapter(Sequence[AircraftPerformanceData]).validate_json(df.read())


def get_float(in_val: Any) -> Optional[float]:
    if in_val is None:
        return None

    return float(in_val)
