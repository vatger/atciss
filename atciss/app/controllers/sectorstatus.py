"""Application controllers - metar."""

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from atciss.app.utils.db import get_session

from ..controllers.auth import get_controller, get_user
from ..models import User
from ..views.sectorstatus import SectorStatus, Status

router = APIRouter()


@router.get(
    "/sectorstatus",
)
async def sectorstatus_get(
    sectors: Annotated[Sequence[str], Query(alias="id")],
    _: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, SectorStatus]:
    """Get status for multiple sectors."""

    stmt = select(SectorStatus).where(SectorStatus.id.in_(sectors))
    sector_rows = await session.scalars(stmt)
    found_sectors = {s.id: s for s in sector_rows}
    defaults = {
        sector_id: SectorStatus(
            id=sector_id,
            status=Status.green,
            changed_by_cid="unset",
            updated_at=datetime.now(UTC),
        )
        for sector_id in sectors
    }
    return defaults | found_sectors


@dataclass
class StatusData:
    id: str
    status: Status


@router.post(
    "/sectorstatus",
)
async def sectorstatus_post(
    status_data: StatusData,
    user: Annotated[User, Depends(get_controller)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> SectorStatus:
    """Set status for a sector."""

    stmt = select(SectorStatus).where(SectorStatus.id == status_data.id)
    sector = await session.scalar(stmt)

    if sector is None:
        sector = SectorStatus(
            id=status_data.id,
            status=status_data.status,
            changed_by_cid=str(user.cid),
            updated_at=datetime.now(UTC),
        )
    else:
        sector.status = status_data.status
        sector.changed_by_cid = str(user.cid)
        sector.updated_at = datetime.now(UTC)

    sector = await session.merge(sector)
    await session.commit()

    return sector
