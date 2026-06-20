import aiohttp
from aiohttp import ClientSession


def create_aiohttp_client_session():
    return ClientSession(
        timeout=aiohttp.ClientTimeout(total=60),
        connector=aiohttp.TCPConnector(
            limit_per_host=100,
        ),
    )


async def get_aiohttp_client():
    async with create_aiohttp_client_session() as client:
        # FastAPI's yield-dependency pattern: Starlette drives this generator
        # to completion via AsyncExitStack, so cleanup isn't left to chance.
        yield client  # noqa: ASYNC119
