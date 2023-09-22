"""Application controllers - ready."""

from loguru import logger
from fastapi import APIRouter
from fastapi.exceptions import HTTPException

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
    except Exception as e:
        logger.error("Could not connect to redis")
        raise HTTPException(
            status_code=503,
            detail=f"Redis connection failed: {str(e)}",
        )

    return ReadyResponse(status="ok")
