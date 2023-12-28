from loguru import logger

from atciss.app.utils.redis import RedisClient

from ..utils import AiohttpClient, ClientConnectorError
from ...config import settings


async def fetch_aliases() -> None:
    """Periodically fetch loa data."""
    redis_client = await RedisClient.get()

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

            async with redis_client.pipeline() as pipe:
                pipe.set(f"aliases:{fir}", "\n".join([fir_aliases, aliases]))

                await pipe.execute()
