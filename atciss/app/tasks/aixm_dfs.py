import io
from typing import Any
from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import create_async_engine

from atciss.app.models import Aerodrome, Navaid, Runway
from atciss.app.utils.aiohttp_client import AiohttpClient
from atciss.app.utils.aixm_parser import AIXMData, AIXMFeature
from .utils import create_or_update
from ..utils.dfs import get_dfs_aixm_datasets, get_dfs_aixm_url
from ...config import settings


async def fetch_dfs_aixm_data():
    datasets = await get_dfs_aixm_datasets(0)

    ad_url = get_dfs_aixm_url(datasets, 0, "ED AirportHeliport")
    runway_url = get_dfs_aixm_url(datasets, 0, "ED Runway")
    navaid_url = get_dfs_aixm_url(datasets, 0, "ED Navaids")
    waypoint_url = get_dfs_aixm_url(datasets, 0, "ED Waypoints")

    if ad_url is None:
        logger.error("Could not retrieve ADHP URL, aborting.")
        return

    if runway_url is None:
        logger.error("Could not retrieve RWY URL, aborting.")
        return

    if navaid_url is None:
        logger.error("Could not retrieve Navaid URL, aborting.")
        return

    if waypoint_url is None:
        logger.error("Could not retrieve WPT URL, aborting.")
        return

    async with AiohttpClient.get() as aiohttp_client:
        ad_res = await aiohttp_client.get(ad_url)
        ad_bytes = io.BytesIO(await ad_res.read())
        runway_res = await aiohttp_client.get(runway_url)
        runway_bytes = io.BytesIO(await runway_res.read())
        navaid_res = await aiohttp_client.get(navaid_url)
        navaid_bytes = io.BytesIO(await navaid_res.read())
        waypoint_res = await aiohttp_client.get(waypoint_url)
        waypoint_bytes = io.BytesIO(await waypoint_res.read())

        aixm_data = [ad_bytes, runway_bytes, navaid_bytes, waypoint_bytes]

    aixm = AIXMData(aixm_data)

    engine = create_async_engine(
        url=str(settings.DATABASE_DSN),
    )

    await process_aerodromes(aixm, engine)
    await process_runways(aixm, engine)
    await process_waypoints(aixm, engine)
    await process_navaids(aixm, engine)


async def process_aerodromes(aixm: AIXMData, engine: Any):
    logger.info("Processing DFS ADHP data")

    for ad in aixm.type("AirportHeliport"):
        # Filter out ADs without ICAO
        if ad["aixm:locationIndicatorICAO"].get() is None:
            continue

        ifr = False  # TODO
        raw_pos = ad["aixm:ARP", "aixm:ElevatedPoint", "gml:pos"].get()

        if raw_pos is None:
            logger.warning(f"AD {ad.id} is missing an ARP position, skipping.")
            continue
        pos = raw_pos.split(" ")

        ad_data = {
            "name": ad["aixm:name"].get(),
            "type": ad["aixm:type"].get(),
            "local_designator": ad["aixm:designator"].get(),
            "icao_designator": ad["aixm:locationIndicatorICAO"].get(),
            "iata_designator": ad["aixm:designatorIATA"].get(),
            "elevation": ad["aixm:fieldElevation", "#text"].float(),
            "arp_location": f"POINT({pos[1]} {pos[0]})",
            "arp_elevation": ad[
                "aixm:ARP", "aixm:ElevatedPoint", "aixm:elevation", "#text"
            ].float(),
            "mag_variation": ad["aixm:magneticVariation"].float(),
            "ifr": ifr,
        }
        logger.trace(f"Processing AD: {ad_data}")

        await create_or_update(engine, Aerodrome, UUID(ad.id), ad_data)


async def process_runways(aixm: AIXMData, engine: Any):
    logger.info("Processing DFS RWY data")

    rwy_map = {}

    for feature in aixm.type("RunwayDirection"):
        rwy = feature["aixm:usedRunway", "@xlink:href"].get()

        if rwy not in rwy_map:
            rwy_map[rwy] = []

        rwy_map[rwy].append(feature)

    for rwy_id, _ in rwy_map.items():
        rwy = aixm.id(rwy_id)

        ad = UUID(rwy["aixm:associatedAirportHeliport", "@xlink:href"].get()[9:])

        rwy_data = {
            "designator": rwy["aixm:designator"].get(),
            "length": rwy["aixm:nominalLength", "#text"].float(),
            "aerodrome_id": ad,
            "width": rwy["aixm:nominalWidth", "#text"].float(),
            "surface": rwy[
                "aixm:surfaceProperties",
                "aixm:SurfaceCharacteristics",
                "aixm:composition",
            ].get(),
        }

        await create_or_update(engine, Runway, UUID(rwy.id), rwy_data)


async def process_waypoints(aixm: AIXMData, engine: Any):
    logger.info("Processing DFS waypoint data")

    for wpt in aixm.type("DesignatedPoint"):
        wpt_id = UUID(wpt.id)

        navaid_type = wpt["aixm:type"].get()
        if navaid_type is None:
            logger.warning("Waypoint {wpt_id} has no type, discarding.")
            continue

        navaid_type = navaid_type.replace("OTHER:ADHP", "TERMINAL")

        wpt_data = {
            "designator": wpt["aixm:designator"].get(),
            "name": wpt["aixm:name"].get(),
            "type": navaid_type,
            "location": wpt["aixm:location", "aixm:Point", "gml:pos"].get(),
        }

        if wpt_data["name"] is None:
            wpt_data["name"] = wpt_data["designator"]

        ad_id = wpt["aixm:airportHeliport", "@xlink:href"].get()
        # urn:uuid check filters foreign ADs (ELLX)
        if ad_id is not None and ad_id.startswith("urn:uuid:"):
            wpt_data["aerodrome_id"] = UUID(ad_id[9:])

        remark = wpt[
            "aixm:annotation",
            "aixm:Note",
            "aixm:translatedNote",
            "aixm:LinguisticNote",
            "aixm:note",
            "#text",
        ].get()
        if remark is str:  # TODO: VRP/Multiple remarks
            wpt_data["remark"] = remark

        await create_or_update(engine, Navaid, wpt_id, wpt_data)


async def process_navaids(aixm: AIXMData, engine: Any):
    logger.info("Processing DFS Navaid data")

    for aid in aixm.type("Navaid"):
        aid_type = aid["aixm:type"].get()

        if aid_type is None:
            continue

        if aid_type == "DME":
            await process_navaid(aixm, aid, engine)
        elif aid_type.startswith("ILS"):
            continue
        else:
            await process_navaid(aixm, aid, engine)


async def process_navaid(aixm: AIXMData, feature: AIXMFeature, engine: Any):
    data = {
        "designator": feature["aixm:designator"].get(),
        "name": feature["aixm:name"].get() or feature["aixm:designator"].get(),
        "type": feature["aixm:type"].get(),
        "location": feature["aixm:location", "aixm:ElevatedPoint", "gml:pos"].get(),
    }

    equipments = ensure_list(feature["aixm:navaidEquipment"].get())

    for equipment in equipments:
        eq_id = equipment["aixm:NavaidComponent"]["aixm:theNavaidEquipment"]["@xlink:href"]
        eq = aixm.id(eq_id)

        if eq["aixm:frequency", "#text"].float() is not None:
            data["frequency"] = eq["aixm:frequency", "#text"].float()  # type: ignore

        if eq["aixm:ghostFrequency", "#text"].float() is not None:
            data["frequency"] = eq["aixm:ghostFrequency", "#text"].float()  # type: ignore

        if eq["aixm:channel", "#text"].get() is not None:
            data["channel"] = eq["aixm:channel", "#text"].get()

    await create_or_update(engine, Navaid, UUID(feature.id), data)


def ensure_list(thing: Any | list[Any]) -> list[Any]:
    if isinstance(thing, list):
        return thing

    return [thing]
