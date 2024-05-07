from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import ORJSONResponse

from atciss.app.controllers.auth import get_admin
from atciss.app.models import User
from atciss.tkq import broker

router = APIRouter()


@router.get(
    "/admin/tasks",
    response_class=ORJSONResponse,
)
def get_tasks(
    user: Annotated[User, Depends(get_admin)],
) -> list[str]:
    return list(broker.get_all_tasks().keys())


@router.post(
    "/admin/task/{task}",
    response_class=ORJSONResponse,
)
async def trigger_task(
    task: str,
    user: Annotated[User, Depends(get_admin)],
):
    _ = await broker.get_all_tasks()[task].kiq()
