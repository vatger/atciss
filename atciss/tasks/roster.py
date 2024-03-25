from datetime import datetime
from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from loguru import logger
from pydantic import BaseModel, TypeAdapter, ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from atciss.app.models import User
from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.db import get_session
from atciss.config import settings
from atciss.tkq import broker


class RosterController(BaseModel):
    id: int
    firstname: str
    lastname: str
    email: str
    setup_completed: int
    created_at: datetime
    updated_at: datetime


class RosterControllerPermit(BaseModel):
    user_cid: int
    permitted_upto: str


@broker.task(schedule=[{"cron": "*/30 * * * *"}])
async def fetch_roster(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    db_session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    """Periodically fetch controller roster."""

    req = await http_client.get(
        settings.ROSTER_API_URL, headers={"Authorization": f"Token {settings.ROSTER_API_TOKEN}"}
    )

    if req.status == 401:
        logger.error("ROSTER_API_TOKEN invalid")
        if not settings.DEBUG:
            return
        rostered_cids = [10000009, 10000010]
    else:
        rostered_controllers_json = await req.json()
        try:
            data = TypeAdapter(list[RosterController]).validate_python(rostered_controllers_json)
            rostered_cids = [o.id for o in data]
        except ValidationError:
            data = TypeAdapter(list[RosterControllerPermit]).validate_python(
                rostered_controllers_json
            )
            rostered_cids = [o.user_cid for o in data]

    logger.info(f"Fetched {len(rostered_cids)} rostered controllers")

    for cid in rostered_cids:
        user = await db_session.scalar(select(User).where(User.cid == cid))

        if user is None:
            logger.debug(f"adding dummy user {cid}")
            user = User(cid=cid, name="", rating="OBS")

        if not user.rostered:
            logger.info(f"{cid} is now rostered")
            user.rostered = True
            db_session.add(user)

    # don't remove rostered users if we don't have the complete list due invalid api token
    if req.status == 200:
        removed_from_roster_stmt = select(User).where(
            User.cid.notin_(rostered_cids),  # pyright: ignore[reportAttributeAccessIssue]  # pylint: disable=no-member
            User.rostered == True,  # noqa: E712  # pylint: disable=singleton-comparison
        )
        for user in await db_session.scalars(removed_from_roster_stmt):
            logger.info(f"{user.cid} is not rostered anymore")
            user.rostered = False
            db_session.add(user)
