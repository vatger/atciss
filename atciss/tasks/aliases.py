from typing import Annotated

from fastapi import Depends
from loguru import logger

from atciss.app.utils import AiohttpClient, ClientConnectorError, Redis, get_redis
from atciss.config import settings
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/60 * * * *"}])
async def fetch_aliases(
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch loa data."""

    async with AiohttpClient.get() as aiohttp_client:
        for fir in settings.FIRS:
            try:
                res_fir = await aiohttp_client.get(
                    f"https://raw.githubusercontent.com/VATGER-Nav/aliases/{fir}/{fir}.txt",
                )
                fir_aliases = await res_fir.text() if res_fir.ok else ""
            except ClientConnectorError as e:
                logger.exception(f"Could not connect {e!s}")
                fir_aliases = ""

            try:
                res = await aiohttp_client.get(
                    f"https://raw.githubusercontent.com/VATGER-Nav/aliases/{fir}/alias.txt",
                )
                aliases = await res.text()
            except ClientConnectorError as e:
                logger.exception(f"Could not connect {e!s}")
                return

            async with redis.pipeline() as pipe:
                pipe.set(f"aliases:{fir}", "\n".join([fir_aliases, aliases]))

                await pipe.execute()
