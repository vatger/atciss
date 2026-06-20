from typing import Annotated

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import or_, select
from taskiq_dependencies import Depends

from atciss.app.utils.db import get_session
from atciss.app.views.airway import AirwaySegment
from atciss.app.views.dfs_aixm import Aerodrome, Navaid
from atciss.tkq import broker


@broker.task()
async def clear_sct_navdata(
    db_session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    for navaid in await db_session.scalars(select(Navaid).where(Navaid.source == "SCT")):
        for segment in await db_session.scalars(
            select(AirwaySegment).where(
                or_(AirwaySegment.start_id == navaid.id, AirwaySegment.end_id == navaid.id)
            )
        ):
            _ = await db_session.delete(segment)
        _ = await db_session.delete(navaid)
    for ad in await db_session.scalars(select(Aerodrome).where(Aerodrome.source == "SCT")):
        _ = await db_session.delete(ad)
    logger.info("SCT navdata removed")
