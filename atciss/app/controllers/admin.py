from typing import Annotated
from fastapi import APIRouter, Depends
from atciss.app.controllers.auth import get_admin

from atciss.app.models import User

import atciss.celery as ac
import celery

router = APIRouter()

@router.get("/admin/tasks")
async def get_tasks(
    user: Annotated[User, Depends(get_admin)],
) -> list[str]:
    return [task for task in dir(ac) if isinstance(getattr(ac, task), celery.Task)]

@router.post("/admin/task/{task}")
async def trigger_task(
    task: str,
    user: Annotated[User, Depends(get_admin)],
):
    getattr(ac, task).apply_async()
