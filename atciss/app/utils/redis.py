import logging

from redis import asyncio as aioredis

from ...config import redis as redis_conf


class RedisClient(object):
    """Handling redis database connection."""

    redis_client: aioredis.Redis | None = None
    log: logging.Logger = logging.getLogger(__name__)

    @classmethod
    def open(cls) -> aioredis.Redis:
        """Create redis client object instance."""
        if cls.redis_client is None:
            cls.log.debug("Open Redis client")
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
                cls.redis_client = sentinel.master_for("mymaster")
            cls.redis_client = aioredis.from_url(
                f"redis://{redis_conf.REDIS_HOST}", **redis_init_kwargs
            )

        return cls.redis_client

    @classmethod
    async def close(cls) -> None:
        """Close redis client."""
        if cls.redis_client:
            cls.log.debug("Close Redis client")
            await cls.redis_client.close()
