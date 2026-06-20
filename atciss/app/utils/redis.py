from redis.asyncio import ConnectionPool, Redis

from atciss.config import settings

redis_pool = ConnectionPool.from_url(
    str(settings.REDIS_URL),
    decode_responses=True,
    socket_connect_timeout=10,
    socket_timeout=10,
)


async def get_redis():
    async with Redis(connection_pool=redis_pool) as client:
        # FastAPI's yield-dependency pattern: Starlette drives this generator
        # to completion via AsyncExitStack, so cleanup isn't left to chance.
        yield client  # noqa: ASYNC119
