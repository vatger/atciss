"""Application implementation - utilities."""

import redis.asyncio as redis

from atciss.config import settings

from .aiohttp_client import AiohttpClient, ClientConnectorError

redis_pool = redis.ConnectionPool.from_url(str(settings.REDIS_URL), decode_responses=True)


async def get_redis():
    client = redis.Redis(connection_pool=redis_pool)
    try:
        yield client
    finally:
        await client.close()


Redis = redis.Redis


__all__ = ("AiohttpClient", "ClientConnectorError", "Redis", "get_redis", "redis_pool")
