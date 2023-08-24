"""Application configuration - root APIRouter.

Defines all FastAPI application endpoints.

Resources:
    1. https://fastapi.tiangolo.com/tutorial/bigger-applications
"""
from fastapi import APIRouter

from .controllers import ready, metar, notam, atis, ad


root_api_router = APIRouter(prefix="/api")

root_api_router.include_router(ready.router, tags=["ready"])
root_api_router.include_router(metar.router, tags=["wx"])
root_api_router.include_router(notam.router, tags=["notam"])
root_api_router.include_router(atis.router, tags=["wx"])
root_api_router.include_router(ad.router, tags=["wx"])
