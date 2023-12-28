from collections import defaultdict
import io
from typing import Any
from uuid import UUID

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlmodel import select

from atciss.app.utils.aiohttp_client import AiohttpClient
from atciss.app.utils.aixm_parser import AIXMData, AIXMFeature
from atciss.app.views.aerodrome import Aerodrome
from atciss.app.views.airway import Airway, AirwaySegment
from atciss.app.views.navaid import Navaid
from atciss.app.views.runway import Runway, RunwayDirection
from .utils import create_or_update
from ..utils.dfs import get_dfs_aixm_datasets, get_dfs_aixm_url
from ...config import settings


async def fetch_dfs_aixm_data():
    datasets = await get_dfs_aixm_datasets(0)

    ad_url = get_dfs_aixm_url(datasets, 0, "ED AirportHeliport")
    runway_url = get_dfs_aixm_url(datasets, 0, "ED Runway")
    navaid_url = get_dfs_aixm_url(datasets, 0, "ED Navaids")
    waypoint_url = get_dfs_aixm_url(datasets, 0, "ED Waypoints")
    route_url = get_dfs_aixm_url(datasets, 0, "ED Routes")

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

    if route_url is None:
        logger.error("Could not retrieve Routes URL, aborting.")
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
        route_res = await aiohttp_client.get(route_url)
        route_bytes = io.BytesIO(await route_res.read())

        aixm_data = [ad_bytes, runway_bytes, navaid_bytes, waypoint_bytes, route_bytes]

    aixm = AIXMData(aixm_data)

    engine = create_async_engine(
        url=str(settings.DATABASE_DSN),
    )

    await process_aerodromes(aixm, engine)
    await process_runways(aixm, engine)
    await process_waypoints(aixm, engine)
    await process_navaids(aixm, engine)
    await process_routes(aixm, engine)


async def process_aerodromes(aixm: AIXMData, engine: Any):
    logger.info("Processing DFS ADHP data")

    for ad in aixm.type("AirportHeliport"):
        # Filter out ADs without ICAO
        if ad["aixm:locationIndicatorICAO"].get() is None:
            continue

        ifr = False  # TODO
        pos = ad["aixm:ARP", "aixm:ElevatedPoint", "gml:pos"].get()

        if pos is None:
            logger.warning(f"AD {ad.id} is missing an ARP position, skipping.")
            continue

        ad_data = {
            "id": UUID(ad.id),
            "name": ad["aixm:name"].get(),
            "type": ad["aixm:type"].get(),
            "local_designator": ad["aixm:designator"].get(),
            "icao_designator": ad["aixm:locationIndicatorICAO"].get(),
            "iata_designator": ad["aixm:designatorIATA"].get(),
            "elevation": ad["aixm:fieldElevation", "#text"].float(),
            "arp_location": pos,
            "arp_elevation": ad[
                "aixm:ARP", "aixm:ElevatedPoint", "aixm:elevation", "#text"
            ].float(),
            "mag_variation": ad["aixm:magneticVariation"].float(),
            "ifr": ifr,
            "source": "DFS",
        }
        logger.trace(f"Processing AD: {ad_data}")
        await create_or_update(engine, Aerodrome, ad_data)


async def process_runways(aixm: AIXMData, engine: Any):
    logger.info("Processing DFS RWY data")

    rwy_map = defaultdict(list)

    for feature in aixm.type("RunwayDirection"):
        rwy = feature["aixm:usedRunway", "@xlink:href"].get()
        rwy_direction = {
            "id": UUID(feature.id),
            "runway_id": UUID(rwy[9:]),
            "designator": feature["aixm:designator"].get(),
            "true_bearing": feature["aixm:trueBearing"].float(),
            "magnetic_bearing": feature["aixm:magneticBearing"].float(),
            "guidance": feature["aixm:precisionApproachGuidance"].get(),
        }

        rwy_map[rwy].append(rwy_direction)

    for rwy_id, rwy_directions in rwy_map.items():
        rwy = aixm.id(rwy_id)

        ad = UUID(rwy["aixm:associatedAirportHeliport", "@xlink:href"].get()[9:])

        rwy_data = {
            "id": UUID(rwy.id),
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

        await create_or_update(engine, Runway, rwy_data)
        for rwy_direction in rwy_directions:
            await create_or_update(engine, RunwayDirection, rwy_direction)


async def process_waypoints(aixm: AIXMData, engine: Any):
    logger.info("Processing DFS waypoint data")

    for wpt in aixm.type("DesignatedPoint"):
        navaid_type = wpt["aixm:type"].get()
        if navaid_type is None:
            logger.warning("Waypoint {wpt_id} has no type, discarding.")
            continue

        navaid_type = navaid_type.replace("OTHER:ADHP", "TERMINAL")

        wpt_data = {
            "id": UUID(wpt.id),
            "designator": wpt["aixm:designator"].get(),
            "name": wpt["aixm:name"].get(),
            "type": navaid_type,
            "location": wpt["aixm:location", "aixm:Point", "gml:pos"].get(),
            "source": "DFS",
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

        await create_or_update(engine, Navaid, wpt_data)


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
        "id": UUID(feature.id),
        "designator": feature["aixm:designator"].get(),
        "name": feature["aixm:name"].get() or feature["aixm:designator"].get(),
        "type": feature["aixm:type"].get(),
        "location": feature["aixm:location", "aixm:ElevatedPoint", "gml:pos"].get(),
        "source": "DFS",
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

    await create_or_update(engine, Navaid, data)


async def process_routes(aixm: AIXMData, engine: Any):
    logger.info("Processing DFS route data")

    routes = []

    for route in aixm.type("Route"):
        routes.append(
            {
                "id": UUID(route.id),
                "designatorPrefix": route["aixm:designatorPrefix"].get(),
                "designatorSecondLetter": route["aixm:designatorSecondLetter"].get(),
                "designatorNumber": route["aixm:designatorNumber"].get(),
                "locationDesignator": route["aixm:locationDesignator"].get(),
            }
        )

    route_segments = []

    for route_segment in aixm.type("RouteSegment"):
        upper_limit = route_segment["aixm:upperLimit", "#text"].int()
        upper_limit_uom = route_segment["aixm:upperLimit", "@uom"].get()
        lower_limit = route_segment["aixm:lowerLimit", "#text"].int()
        lower_limit_uom = route_segment["aixm:lowerLimit", "@uom"].get()
        start_dict = route_segment["aixm:start", "aixm:EnRouteSegmentPoint"].get()
        start = start_dict.get(
            "aixm:pointChoice_fixDesignatedPoint", start_dict.get("aixm:pointChoice_navaidSystem")
        )
        try:
            start_id = UUID(start["@xlink:href"][9:])
        except ValueError:
            # non-ED: gml urn, not uuid
            stmt = select(Navaid).where(Navaid.designator == start["@xlink:title"])
            async with AsyncSession(engine) as session:
                wpt = await session.scalar(stmt)
                start_id = wpt.id
        end_dict = route_segment["aixm:end", "aixm:EnRouteSegmentPoint"].get()
        end = end_dict.get(
            "aixm:pointChoice_fixDesignatedPoint", end_dict.get("aixm:pointChoice_navaidSystem")
        )
        try:
            end_id = UUID(end["@xlink:href"][9:])
        except ValueError:
            # non-ED: gml urn, not uuid
            stmt = select(Navaid).where(Navaid.designator == end["@xlink:title"])
            async with AsyncSession(engine) as session:
                wpt = await session.scalar(stmt)
                end_id = wpt.id

        route_segments.append(
            {
                "id": UUID(route_segment.id),
                "level": route_segment["aixm:level"].get(),
                "true_track": route_segment["aixm:trueTrack"].float(),
                "reverse_true_track": route_segment["aixm:reverseTrueTrack"].float(),
                "length": route_segment["aixm:length", "#text"].float(),
                "upper_limit": upper_limit,
                "upper_limit_uom": upper_limit_uom,
                "lower_limit": lower_limit,
                "lower_limit_uom": lower_limit_uom,
                "start_id": start_id,
                "end_id": end_id,
                "airway_id": UUID(route_segment["aixm:routeFormed", "@xlink:href"].get()[9:]),
                "curve_extent": route_segment[
                    "aixm:curveExtent",
                    "aixm:Curve",
                    "gml:segments",
                    "gml:LineStringSegment",
                    "gml:posList",
                ].get(),
            }
        )

    for route in routes:
        await create_or_update(engine, Airway, route)

    for route_segment in route_segments:
        await create_or_update(engine, AirwaySegment, route_segment)


def ensure_list(thing: Any | list[Any]) -> list[Any]:
    if isinstance(thing, list):
        return thing

    return [thing]
