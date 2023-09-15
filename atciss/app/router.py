"""Application configuration - root APIRouter."""
from fastapi import APIRouter

from .controllers import ready, metar, notam, atis, ad, auth, airspace, controller


root_api_router = APIRouter(prefix="/api")

root_api_router.include_router(ready.router, tags=["ready"])
root_api_router.include_router(metar.router, tags=["wx"])
root_api_router.include_router(notam.router, tags=["notam"])
root_api_router.include_router(atis.router, tags=["wx"])
root_api_router.include_router(ad.router, tags=["wx"])
root_api_router.include_router(auth.router, tags=["user"])
root_api_router.include_router(airspace.router, tags=["airspace"])
root_api_router.include_router(controller.router, tags=["airspace"])
