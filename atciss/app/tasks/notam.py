from typing import Optional

from loguru import logger
from bs4 import BeautifulSoup
from pynotam import Notam
from parsimonious import ParseError

from ..utils import AiohttpClient, ClientConnectorError, RedisClient

NOTAM_ICAO = [
    "EDGG",
    "EDMM",
    "EDWW",
    "EDUU",
    "EDYY",
    "EDDC",
    "EDDE",
    "EDDM",
    "EDDN",
    "EDDP",
    "EDAB",
    "EDAC",
    "EDJA",
    "EDMA",
    "EDME",
    "EDMO",
    "EDMS",
    "EDPR",
    "EDQA",
    "EDQC",
    "EDQD",
    "EDQM",
    "EDNY",
    "EDTM",
    "ETEB",
    "ETHL",
    "ETIC",
    "ETSI",
    "ETSL",
    "ETSN",
    "EDDF",
    "EDDK",
    "EDDL",
    "EDDS",
    "EDFM",
    "EDLN",
    "ETAR",
    "ETNN",
    "ETNG",
]


def convert_notam(n: str) -> Optional[Notam]:
    try:
        return Notam.from_str(f"({n.strip()})")
    except ParseError as e:
        logger.error(f"could not parse notam: {n}\n{e}")

    return None


async def fetch_notam() -> None:
    """Periodically fetch relevant NOTAMs."""
    redis_client = await RedisClient.get()

    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get(
                "https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do"
                + f"?reportType=Raw&retrieveLocId={'+'.join(NOTAM_ICAO)}"
                + "&actionType=notamRetrievalByICAOs&submit=View+NOTAMs"
            )
        except ClientConnectorError as e:
            logger.error(f"Could not connect {str(e)}")
            return

        notam_html = BeautifulSoup(await res.text(), "html.parser")
        notams = []
        for notam_elem in notam_html.find_all("pre"):
            notam = convert_notam(notam_elem.string)
            if notam is not None and len(notam.location) > 0:
                notams.append(notam)

    async with redis_client.pipeline() as pipe:
        for notam in notams:
            for location in notam.location:
                pipe.set(f"notam:{location}:{notam.notam_id}", notam.full_text)
        logger.info(f"NOTAMs: {len(notams)} received")
        await pipe.execute()
