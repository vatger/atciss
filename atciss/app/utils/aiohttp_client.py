from socket import AF_INET

import aiohttp
from aiohttp.client_exceptions import ClientConnectorError
from loguru import logger

__all__ = ["AiohttpClient", "ClientConnectorError"]

SIZE_POOL_AIOHTTP = 100


class AiohttpClient:
    """Aiohttp session client utility."""

    aiohttp_client: aiohttp.ClientSession | None = None

    @classmethod
    def get(cls) -> aiohttp.ClientSession:
        """Create aiohttp client session object instance.

        Returns:
            aiohttp.ClientSession: ClientSession object instance.
        """
        logger.debug("Initialize AiohttpClient session.")
        timeout = aiohttp.ClientTimeout(total=60)
        connector = aiohttp.TCPConnector(
            family=AF_INET,
            limit_per_host=SIZE_POOL_AIOHTTP,
        )
        aiohttp_client = aiohttp.ClientSession(
            timeout=timeout,
            connector=connector,
        )

        return aiohttp_client
