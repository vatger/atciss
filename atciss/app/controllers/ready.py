"""Application controllers - ready."""

import logging

from fastapi import APIRouter

from ..views.ready import ReadyResponse


router = APIRouter()
log = logging.getLogger(__name__)


@router.get(
    "/ready",
    tags=["ready"],
    response_model=ReadyResponse,
    summary="Simple health check.",
    status_code=200,
)
async def readiness_check() -> ReadyResponse:
    """Check if application is ready."""
    log.info("Started GET /ready")
    return ReadyResponse(status="ok")
