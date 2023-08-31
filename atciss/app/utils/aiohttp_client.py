import logging
from typing import Optional
from socket import AF_INET

import aiohttp


SIZE_POOL_AIOHTTP = 100


class AiohttpClient:
    """Aiohttp session client utility."""

    aiohttp_client: Optional[aiohttp.ClientSession] = None
    log: logging.Logger = logging.getLogger(__name__)

    @classmethod
    def get(cls) -> aiohttp.ClientSession:
        """Create aiohttp client session object instance.

        Returns:
            aiohttp.ClientSession: ClientSession object instance.
        """
        if cls.aiohttp_client is None:
            cls.log.debug("Initialize AiohttpClient session.")
            timeout = aiohttp.ClientTimeout(total=15)
            connector = aiohttp.TCPConnector(
                family=AF_INET,
                limit_per_host=SIZE_POOL_AIOHTTP,
            )
            cls.aiohttp_client = aiohttp.ClientSession(
                timeout=timeout,
                connector=connector,
            )

        return cls.aiohttp_client

    @classmethod
    async def close(cls) -> None:
        """Close aiohttp client session."""
        if cls.aiohttp_client:
            cls.log.debug("Close AiohttpClient session.")
            await cls.aiohttp_client.close()
            cls.aiohttp_client = None
