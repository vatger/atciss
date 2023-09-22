from loguru import logger
from redis import asyncio as aioredis

from ...config import redis as redis_conf


class RedisClient:
    """Handling redis database connection."""

    redis_client: aioredis.Redis | None = None

    @classmethod
    def get(cls) -> aioredis.Redis:
        logger.debug("Open Redis client")
        redis_init_kwargs = {
            "encoding": "utf-8",
            "port": redis_conf.REDIS_PORT,
            "decode_responses": True,
        }

        if redis_conf.REDIS_USERNAME and redis_conf.REDIS_PASSWORD:
            redis_init_kwargs.update(
                {
                    "username": redis_conf.REDIS_USERNAME,
                    "password": redis_conf.REDIS_PASSWORD,
                }
            )

        if redis_conf.REDIS_USE_SENTINEL:
            sentinel = aioredis.Sentinel(
                [(redis_conf.REDIS_HOST, redis_conf.REDIS_PORT)],
                sentinel_kwargs=redis_init_kwargs,
            )
            return sentinel.master_for("mymaster")
        return aioredis.from_url(
            f"redis://{redis_conf.REDIS_HOST}", **redis_init_kwargs
        )

    @classmethod
    def open(cls) -> aioredis.Redis:
        """Create redis client object instance."""
        if cls.redis_client is None:
            cls.redis_client = cls.get()
        return cls.redis_client

    @classmethod
    async def close(cls) -> None:
        """Close redis client."""
        if cls.redis_client:
            logger.debug("Close Redis client")
            await cls.redis_client.close()
