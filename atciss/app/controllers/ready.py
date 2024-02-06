"""Application controllers - ready."""

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from loguru import logger
from redis.exceptions import RedisError

from atciss.app.utils import Redis, get_redis
from atciss.app.views.ready import ReadyResponse

router = APIRouter()


@router.get(
    "/ready",
    response_model=ReadyResponse,
    summary="Simple health check.",
    status_code=200,
    responses={503: {}},
)
async def readiness_check(
    redis: Annotated[Redis, Depends(get_redis)],
) -> ReadyResponse:
    """Check if application is ready."""
    logger.info("Started GET /ready")

    try:
        if not await redis.ping():
            logger.error("Redis ping failed")
            raise HTTPException(status_code=503, detail="Redis ping failed")
    except RedisError as e:
        logger.error("Could not connect to redis")
        raise HTTPException(
            status_code=503,
            detail=f"Redis connection failed: {e!s}",
        ) from e

    return ReadyResponse(status="ok")
