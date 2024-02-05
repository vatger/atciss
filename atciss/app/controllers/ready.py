"""Application controllers - ready."""

from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from loguru import logger
from redis.exceptions import RedisError

from ..utils import RedisClient
from ..views.ready import ReadyResponse

router = APIRouter()


@router.get(
    "/ready",
    response_model=ReadyResponse,
    summary="Simple health check.",
    status_code=200,
    responses={503: {}},
)
async def readiness_check() -> ReadyResponse:
    """Check if application is ready."""
    logger.info("Started GET /ready")

    try:
        if not await RedisClient.open().ping():
            logger.error("Redis ping failed")
            raise HTTPException(status_code=503, detail="Redis ping failed")
    except RedisError as e:
        logger.error("Could not connect to redis")
        raise HTTPException(
            status_code=503,
            detail=f"Redis connection failed: {e!s}",
        ) from e

    return ReadyResponse(status="ok")
