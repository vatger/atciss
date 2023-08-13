import csv

from ..utils import RedisClient, AiohttpClient, repeat_every


@repeat_every(seconds=60)
async def fetch_metar() -> None:
    """Periodically fetch METARs."""
    redis_client = await RedisClient.open()
    aiohttp_client = AiohttpClient.get()

    res = await aiohttp_client.get(
        "https://www.aviationweather.gov/adds/dataserver_current/current/"
        + "metars.cache.csv"
    )
    metars_csv = csv.reader((await res.text()).split("\n"), delimiter=",")

    async with redis_client.pipeline() as pipe:
        for m in metars_csv:
            if len(m) >= 2:
                pipe.set("metar:{}".format(m[1]), m[0])
        await pipe.execute()
