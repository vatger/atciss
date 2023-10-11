from loguru import logger

from atciss.app.utils.redis import RedisClient

from ..utils import AiohttpClient, ClientConnectorError


async def fetch_aliases() -> None:
    """Periodically fetch loa data."""
    redis_client = await RedisClient.get()

    async with AiohttpClient.get() as aiohttp_client:
        try:
            res_edmm = await aiohttp_client.get(
                "https://raw.githubusercontent.com/VATGER-Nav/aliases/EDMM/EDMM.txt",
            )
            res = await aiohttp_client.get(
                "https://raw.githubusercontent.com/VATGER-Nav/aliases/EDMM/alias.txt",
            )
        except ClientConnectorError as e:
            logger.exception(f"Could not connect {e!s}")
            return

        aliases = await res_edmm.text() + "\n" + await res.text()

    async with redis_client.pipeline() as pipe:
        pipe.set("aliases", aliases)

        await pipe.execute()
