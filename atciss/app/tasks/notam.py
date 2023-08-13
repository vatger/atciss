import logging

from bs4 import BeautifulSoup
from pynotam import Notam

from ..utils import AiohttpClient, RedisClient, repeat_every

log = logging.getLogger(__name__)

NOTAM_ICAO = [
    "EDMM",
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
]


@repeat_every(seconds=300, logger=log)
async def fetch_notam() -> None:
    """Periodically fetch relevant NOTAMs."""
    redis_client = await RedisClient.open()
    aiohttp_client = AiohttpClient.get()

    res = await aiohttp_client.get(
        "https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do"
        + f"?reportType=Raw&retrieveLocId={'+'.join(NOTAM_ICAO)}"
        + "&actionType=notamRetrievalByICAOs&submit=View+NOTAMs"
    )
    notam_html = BeautifulSoup(await res.text(), "html.parser")
    notams = [notam_elem.string for notam_elem in notam_html.find_all("pre")]

    async with redis_client.pipeline() as pipe:
        for n in notams:
            try:
                notam = Notam.from_str(f"({n})")
                if notam.location is not None and len(notam.location):
                    for location in notam.location:
                        pipe.set(f"notam:{location}:{notam.notam_id}", notam.full_text)
            except Exception as e:
                log.error(f"could not parse notam: {n}\n{e}")
        log.info(f"NOTAMs: {len(notams)} received")
        await pipe.execute()
