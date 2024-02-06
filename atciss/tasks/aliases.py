from typing import Annotated

from aiohttp import ClientConnectorError, ClientSession
from fastapi import Depends
from loguru import logger

from atciss.app.utils import Redis, get_aiohttp_client, get_redis
from atciss.config import settings
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/60 * * * *"}])
async def fetch_aliases(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch loa data."""

    for fir in settings.FIRS:
        try:
            async with http_client.get(
                f"https://raw.githubusercontent.com/VATGER-Nav/aliases/{fir}/{fir}.txt",
            ) as res_fir:
                fir_aliases = await res_fir.text() if res_fir.ok else ""
        except ClientConnectorError as e:
            logger.exception(f"Could not connect {e!s}")
            fir_aliases = ""

        try:
            async with http_client.get(
                f"https://raw.githubusercontent.com/VATGER-Nav/aliases/{fir}/alias.txt",
            ) as res:
                aliases = await res.text()
        except ClientConnectorError as e:
            logger.exception(f"Could not connect {e!s}")
            return

        async with redis.pipeline() as pipe:
            pipe.set(f"aliases:{fir}", "\n".join([fir_aliases, aliases]))

            await pipe.execute()
