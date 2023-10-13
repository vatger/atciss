import io
from typing import Any
from uuid import UUID
import pyaixm

from loguru import logger

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from atciss.app.models import Aerodrome
from atciss.app.utils.aiohttp_client import AiohttpClient
from atciss.app.utils.aixm import get_float_or_none, get_or_none
from ..utils.dfs import get_dfs_aixm_url
from ...config import settings


async def fetch_dfs_ad_data() -> None:
    url = await get_dfs_aixm_url(0, "ED AirportHeliport")

    if url is None:
        logger.warning("Cannot get ADHP data feed URL, aborting.")
        return

    logger.debug(f"Getting DFS ADHP data from {url}")

    async with AiohttpClient.get() as aiohttp_client:
        res = await aiohttp_client.get(url)
        byts = io.BytesIO(await res.read())
        aixm = pyaixm.parse(byts, resolve_xlinks=False)

    await process_dfs_ad_data(aixm)


async def process_dfs_ad_data(aixm: list[Any]):
    logger.info("Loading DFS ADHP data")
    engine = create_async_engine(
        url=str(settings.DATABASE_DSN),
    )

    for ad in aixm:
        if not isinstance(ad, pyaixm.aixm_types.feature_types["AirportHeliport"]):
            continue

        # Filter out ADs without ICAO
        if not isinstance(ad.locationIndicatorICAO, str):
            continue

        # wow such crap
        ifr = False
        for definition in ensure_list(ad.availability.usage):
            if not hasattr(definition, "selection"):
                continue

            if not hasattr(definition.selection, "flight"):
                continue

            for flight in ensure_list(definition.selection.flight):
                if "IFR" in ensure_list(flight.rule) or "ALL" in ensure_list(
                    flight.rule
                ):
                    ifr = True
                    break

        pos = ad.ARP.pos.split(" ")

        ad_data = {
            "name": get_first_string(ad.name),
            "type": get_first_string(ad.type),
            "local_designator": get_or_none(ad.designator),
            "icao_designator": get_or_none(ad.locationIndicatorICAO),
            "iata_designator": get_or_none(ad.designatorIATA),
            "elevation": get_float_or_none(ad.fieldElevation),
            "arp_location": f"POINT({pos[1]} {pos[0]})",
            "arp_elevation": get_float_or_none(ad.ARP.elevation),
            "mag_variation": get_float_or_none(ad.magneticVariation),
            "ifr": ifr,
        }
        logger.trace(f"Processing AD: {ad_data}")

        async with AsyncSession(engine) as session:
            ad_id = UUID(ad.gmlidentifier)
            ad_model = await session.get(Aerodrome, ad_id)

            if ad_model is None:
                logger.debug(f"New AD {ad_data['name']}")
                ad_model = Aerodrome(id=ad_id, **ad_data)  # type: ignore
            else:
                for k, v in ad_data.items():
                    setattr(ad_model, k, v)

            session.add(ad_model)
            await session.commit()


def get_first_string(thing: str) -> str:
    if isinstance(thing, list):
        return thing[0]

    return thing


def ensure_list(thing: str | list[Any]) -> list[Any]:
    if isinstance(thing, list):
        return thing

    return [thing]
