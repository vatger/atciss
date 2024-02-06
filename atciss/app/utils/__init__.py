"""Application implementation - utilities."""

import aiohttp
from aiohttp import ClientSession
from redis.asyncio import ConnectionPool, Redis

from atciss.config import settings

redis_pool = ConnectionPool.from_url(str(settings.REDIS_URL), decode_responses=True)


async def get_redis():
    async with Redis(connection_pool=redis_pool) as client:
        yield client


def aiohttp_client_session():
    return ClientSession(
        timeout=aiohttp.ClientTimeout(total=60),
        connector=aiohttp.TCPConnector(
            limit_per_host=100,
        ),
    )


async def get_aiohttp_client():
    async with aiohttp_client_session() as client:
        yield client


__all__ = ("Redis", "get_aiohttp_client", "get_redis")
