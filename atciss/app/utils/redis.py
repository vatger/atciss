from redis.asyncio import ConnectionPool, Redis

from atciss.config import settings

redis_pool = ConnectionPool.from_url(str(settings.REDIS_URL), decode_responses=True)


async def get_redis():
    async with Redis(connection_pool=redis_pool) as client:
        yield client
