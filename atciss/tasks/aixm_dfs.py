import asyncio
import io
import re
from collections import defaultdict
from typing import Annotated, Any
from uuid import UUID

from aiohttp import ClientSession
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from taskiq_dependencies import Depends

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.aixm_parser import AIXMData, AIXMFeature
from atciss.app.utils.db import get_session
from atciss.app.utils.dfs import get_dfs_aixm_datasets, get_dfs_aixm_url
from atciss.app.views.airway import Airway, AirwaySegment
from atciss.app.views.dfs_aixm import Aerodrome, Navaid, Runway, RunwayDirection
from atciss.tasks.utils import create_or_update
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "0 3 1 * *"}])
async def fetch_dfs_aixm_data(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    db_session: Annotated[AsyncSession, Depends(get_session)],
):
    datasets = await get_dfs_aixm_datasets(0, http_client)

    ad_url = get_dfs_aixm_url(datasets, 0, "ED AirportHeliport")
    runway_url = get_dfs_aixm_url(datasets, 0, "ED Runway")
    navaid_url = get_dfs_aixm_url(datasets, 0, "ED Navaids")
    waypoint_url = get_dfs_aixm_url(datasets, 0, "ED Waypoints")
    route_url = get_dfs_aixm_url(datasets, 0, "ED Routes")

    if ad_url is None:
        logger.error("Could not retrieve ADHP URL, aborting.")
        return
    logger.debug(f"ADHP URL: {ad_url}")

    if runway_url is None:
        logger.error("Could not retrieve RWY URL, aborting.")
        return
    logger.debug(f"Runway URL: {runway_url}")

    if navaid_url is None:
        logger.error("Could not retrieve Navaid URL, aborting.")
        return
    logger.debug(f"Navaid URL: {navaid_url}")

    if waypoint_url is None:
        logger.error("Could not retrieve WPT URL, aborting.")
        return
    logger.debug(f"Waypoint URL: {waypoint_url}")

    if route_url is None:
        logger.error("Could not retrieve Routes URL, aborting.")
        return
    logger.debug(f"Route URL: {route_url}")

    aixm_data = await asyncio.gather(
        *(
            http_get_bytesio(url, http_client)
            for url in [ad_url, runway_url, navaid_url, waypoint_url, route_url]
        )
    )

    aixm = AIXMData(aixm_data)

    await process_aerodromes(aixm, db_session)
    await process_runways(aixm, db_session)
    await process_waypoints(aixm, db_session)
    await process_navaids(aixm, db_session)
    await process_routes(aixm, db_session)


async def http_get_bytesio(url: str, http_client: ClientSession):
    async with http_client.get(url) as res:
        return io.BytesIO(await res.read())


async def process_aerodromes(aixm: AIXMData, session: AsyncSession):
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
                "aixm:ARP",
                "aixm:ElevatedPoint",
                "aixm:elevation",
                "#text",
            ].float(),
            "mag_variation": ad["aixm:magneticVariation"].float(),
            "ifr": ifr,
            "source": "DFS",
        }
        logger.trace(f"Processing AD: {ad_data}")
        await create_or_update(session, Aerodrome, ad_data)


async def process_runways(aixm: AIXMData, session: AsyncSession):
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

        await create_or_update(session, Runway, rwy_data)
        for rwy_direction in rwy_directions:
            await create_or_update(session, RunwayDirection, rwy_direction)


async def process_waypoints(aixm: AIXMData, session: AsyncSession):
    logger.info("Processing DFS waypoint data")

    for wpt in aixm.type("DesignatedPoint"):
        navaid_type = wpt["aixm:type"].get()
        if navaid_type is None:
            logger.warning(f"Waypoint {wpt.id} has no type, discarding.")
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
            ad_uuid = UUID(ad_id[9:])
            stmt = select(Aerodrome).where(Aerodrome.id == ad_uuid)
            ad = await session.scalar(stmt)
            if ad is not None:
                wpt_data["aerodrome_id"] = ad_uuid
            else:
                logger.warning(
                    f"Waypoint {wpt_data['designator']} {wpt.id}: Aerodrome {ad_uuid} not found!"
                )

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

        await create_or_update(session, Navaid, wpt_data)


async def process_navaids(aixm: AIXMData, session: AsyncSession):
    logger.info("Processing DFS Navaid data")

    for aid in aixm.type("Navaid"):
        aid_type = aid["aixm:type"].get()

        if aid_type is None:
            continue

        if aid_type == "DME":
            await process_navaid(aixm, aid, session)
        elif aid_type.startswith("ILS"):
            continue
        else:
            await process_navaid(aixm, aid, session)


async def process_navaid(aixm: AIXMData, feature: AIXMFeature, session: AsyncSession):
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

    await create_or_update(session, Navaid, data)


async def process_routes(aixm: AIXMData, session: AsyncSession):
    async def navaid_from_fixDesignatedPoint(point: dict) -> UUID | None:
        title = point["@xlink:title"]
        uuid = UUID(point["@xlink:href"][9:])

        stmt = select(Navaid).where(Navaid.id == uuid)
        navaid = await session.scalar(stmt)

        if navaid is None:
            if title.startswith("urn:aixm:"):
                _ = await create_or_update(
                    session,
                    Navaid,
                    {
                        "id": uuid,
                        "designator": re.search(r"aixm:designator=([A-Z]+);", title).groups()[0],
                        "type": re.search(r"aixm:type=([A-Z]+);", title).groups()[0],
                        "location": re.search(r"gml:pos=([0-9. ]+)", title).groups()[0],
                        "source": "DFS",
                    },
                )
            else:
                logger.error(f"Navaid not found: {uuid}: {title}")
                return None

        return uuid

    logger.info("Processing DFS route data")

    routes = []

    for route in aixm.type("Route"):
        routes.append({
            "id": UUID(route.id),
            "designatorPrefix": route["aixm:designatorPrefix"].get(),
            "designatorSecondLetter": route["aixm:designatorSecondLetter"].get(),
            "designatorNumber": route["aixm:designatorNumber"].get(),
            "locationDesignator": route["aixm:locationDesignator"].get(),
        })

    route_segments = []

    for route_segment in aixm.type("RouteSegment"):
        upper_limit = route_segment["aixm:upperLimit", "#text"].int()
        upper_limit_uom = route_segment["aixm:upperLimit", "@uom"].get()
        lower_limit = route_segment["aixm:lowerLimit", "#text"].int()
        lower_limit_uom = route_segment["aixm:lowerLimit", "@uom"].get()

        start_dict = route_segment["aixm:start", "aixm:EnRouteSegmentPoint"].get()
        start_point = start_dict.get(
            "aixm:pointChoice_fixDesignatedPoint",
            start_dict.get("aixm:pointChoice_navaidSystem"),
        )
        start_id = await navaid_from_fixDesignatedPoint(start_point)

        end_dict = route_segment["aixm:end", "aixm:EnRouteSegmentPoint"].get()
        end_point = end_dict.get(
            "aixm:pointChoice_fixDesignatedPoint",
            end_dict.get("aixm:pointChoice_navaidSystem"),
        )
        end_id = await navaid_from_fixDesignatedPoint(end_point)

        if start_id is None or end_id is None:
            logger.error(f"No start or end point found for {route_segment.id}, ignoring")
            continue

        route_segments.append({
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
        })

    for route in routes:
        await create_or_update(session, Airway, route)

    for route_segment in route_segments:
        await create_or_update(session, AirwaySegment, route_segment)


def ensure_list(thing: Any | list[Any]) -> list[Any]:
    if isinstance(thing, list):
        return thing

    return [thing]
