from typing import Annotated

from fastapi import APIRouter, Depends
from redis.exceptions import RedisError

from atciss.app.controllers.auth import get_admin
from atciss.app.models import User
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.admin import TaskStatus, WorkerStatusResponse
from atciss.tkq import TASK_STATUS_REDIS_KEY, broker

router = APIRouter()


@router.get(
    "/admin/tasks",
)
def get_tasks(
    _user: Annotated[User, Depends(get_admin)],
) -> list[str]:
    return list(broker.get_all_tasks().keys())


@router.post(
    "/admin/task/{task}",
)
async def trigger_task(
    task: str,
    _user: Annotated[User, Depends(get_admin)],
):
    _ = await broker.get_all_tasks()[task].kiq()


@router.get(
    "/admin/worker-status",
)
async def get_worker_status(
    _user: Annotated[User, Depends(get_admin)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> WorkerStatusResponse:
    try:
        redis_ok = bool(await redis.ping())
        queue_length = await redis.llen(broker.queue_name)
        raw_statuses = await redis.hgetall(TASK_STATUS_REDIS_KEY)
    except RedisError:
        redis_ok = False
        queue_length = 0
        raw_statuses = {}

    tasks = []
    for name in broker.get_all_tasks():
        raw = raw_statuses.get(name)
        if raw is None:
            tasks.append(TaskStatus(name=name))
            continue

        tasks.append(TaskStatus.model_validate_json(raw))

    return WorkerStatusResponse(
        queue_length=queue_length,
        redis_ok=redis_ok,
        tasks=tasks,
    )
