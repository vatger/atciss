"""Application controllers - ready."""

import logging

from fastapi import APIRouter
from fastapi.exceptions import HTTPException

from ..utils import RedisClient
from ..views.ready import ReadyResponse


router = APIRouter()
log = logging.getLogger(__name__)


@router.get(
    "/ready",
    tags=["ready"],
    response_model=ReadyResponse,
    summary="Simple health check.",
    status_code=200,
    responses={503: {}},
)
async def readiness_check() -> ReadyResponse:
    """Check if application is ready."""
    log.info("Started GET /ready")

    try:
        if not await RedisClient.open().ping():
            log.error("Redis ping failed")
            raise HTTPException(status_code=503, detail="Redis ping failed")
    except Exception as e:
        log.error("Could not connect to redis")
        raise HTTPException(
            status_code=503, detail="Redis connection failed: {}".format(str(e))
        )

    return ReadyResponse(status="ok")
