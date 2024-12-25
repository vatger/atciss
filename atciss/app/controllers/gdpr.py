from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import ORJSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from atciss.app.models import User
from atciss.app.utils.db import get_session
from atciss.app.views.initials import Initials
from atciss.config import settings

router = APIRouter()
token_scheme = HTTPBearer()


@router.delete(
    "/admin/userdata/{cid}",
    response_class=ORJSONResponse,
)
async def delete_user(
    bearer_token: Annotated[HTTPAuthorizationCredentials, Depends(token_scheme)],
    cid: int,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, str]:
    if settings.GDPR_API_TOKEN == "invalid":
        raise HTTPException(status_code=503, detail="No API token configured, refusing to continue")

    if not bearer_token.credentials == settings.GDPR_API_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user = await session.scalar(select(User).where(User.cid == str(cid)))
    user_deleted = False
    if user is not None:
        user_deleted = True
        await session.delete(user)

    initial = await session.scalar(select(Initials).where(Initials.cid == str(cid)))
    initial_deleted = False
    if initial is not None:
        initial_deleted = True
        await session.delete(initial)

    logger.info(f"GDPR done. CID: {cid}, User: {user_deleted}, Initials: {initial_deleted}")
    return {"status": "ok", "data_removed": "true" if user_deleted or initial_deleted else "false"}
