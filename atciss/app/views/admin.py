from pydantic import BaseModel


class TaskStatus(BaseModel):
    name: str
    status: str | None = None
    finished_at: float | None = None
    execution_time: float | None = None


class WorkerStatusResponse(BaseModel):
    queue_length: int
    redis_ok: bool
    tasks: list[TaskStatus]
