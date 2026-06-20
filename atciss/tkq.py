# pyright: reportMissingTypeStubs=false, reportUninitializedInstanceVariable=false
import asyncio
import os
import time
from pathlib import Path
from tempfile import gettempdir
from typing import Any

import taskiq_fastapi
from prometheus_client import Counter, Gauge, Histogram
from redis.asyncio import Redis
from taskiq import (
    PrometheusMiddleware,
    TaskiqMessage,
    TaskiqMiddleware,
    TaskiqResult,
    TaskiqScheduler,
)
from taskiq.schedule_sources import LabelScheduleSource
from taskiq_redis import ListQueueBroker
from typing_extensions import override

from atciss.config import settings

TASK_STATUS_REDIS_KEY = "worker:task_status"
QUEUE_POLL_INTERVAL_SECONDS = 5


class TaskStatusMiddleware(TaskiqMiddleware):
    """Tracks last-run status per task and current queue depth for the admin UI."""

    def __init__(self) -> None:
        super().__init__()
        self._poll_task: asyncio.Task[None] | None = None

    @override
    def startup(self) -> None:
        if self.broker.is_worker_process:
            # Multiple worker processes all observe (roughly) the same global queue
            # depth, so summing per-process values would multiply it; "max" avoids
            # that without needing a single elected updater process.
            # self.broker isn't wired up yet in __init__ (set_broker runs after), and
            # is_worker_process isn't known until startup either, so queue_length
            # can't be initialized any earlier than here.
            self.queue_length = Gauge(  # pylint: disable=attribute-defined-outside-init
                "queue_length",
                "Number of messages currently queued",
                multiprocess_mode="max",
            )
            self._poll_task = asyncio.ensure_future(self._poll_queue_length())

    @override
    def shutdown(self) -> None:
        if self._poll_task is not None:
            self._poll_task.cancel()

    async def _poll_queue_length(self) -> None:
        assert isinstance(self.broker, ListQueueBroker)
        # pylint: disable=import-outside-toplevel
        from atciss.app.utils.redis import redis_pool

        async with Redis(connection_pool=redis_pool) as redis:
            while True:
                self.queue_length.set(await redis.llen(self.broker.queue_name))
                await asyncio.sleep(QUEUE_POLL_INTERVAL_SECONDS)

    @override
    # base method is plain `def` returning `None | Coroutine[...]`, so pylint can't
    # tell that an async override is one of the types it's allowed to return
    async def post_execute(  # pylint: disable=invalid-overridden-method
        self,
        message: TaskiqMessage,
        result: TaskiqResult[Any],
    ) -> None:
        if not self.broker.is_worker_process:
            return
        # pylint: disable=import-outside-toplevel
        from atciss.app.utils.redis import redis_pool
        from atciss.app.views.admin import TaskStatus

        status = TaskStatus(
            name=message.task_name,
            status="error" if result.is_err else "success",
            finished_at=time.time(),
            execution_time=result.execution_time,
        )
        async with Redis(connection_pool=redis_pool) as redis:
            await redis.hset(
                TASK_STATUS_REDIS_KEY,
                message.task_name,
                status.model_dump_json(),
            )


class PrometheusWorkerMiddleware(PrometheusMiddleware):
    def __init__(  # pylint: disable=super-init-not-called,non-parent-init-called
        self,
        metrics_path: Path | None = None,
        server_port: int = 9000,
        server_addr: str = "0.0.0.0",
    ) -> None:
        # Original PrometheusMiddleware.__init__() is broken. Defer some stuff to startup().
        TaskiqMiddleware.__init__(self)
        self.metrics_path = metrics_path or Path(gettempdir()) / "taskiq_worker"
        self.server_port = server_port
        self.server_addr = server_addr

    @override
    def startup(self) -> None:
        if self.broker.is_worker_process:
            # From the original PrometheusMiddleware.__init__(). Only set up prometheus metrics
            # if we're in a worker or we break prometheus instrumentation in the main fastapi app.
            if not self.metrics_path.exists():
                self.metrics_path.mkdir(parents=True)

            os.environ["PROMETHEUS_MULTIPROC_DIR"] = str(self.metrics_path)

            self.found_errors = Counter(
                "found_errors",
                "Number of found errors",
                ["task_name"],
            )
            self.received_tasks = Counter(
                "received_tasks",
                "Number of received tasks",
                ["task_name"],
            )
            self.success_tasks = Counter(
                "success_tasks",
                "Number of successfully executed tasks",
                ["task_name"],
            )
            self.saved_results = Counter(
                "saved_results",
                "Number of saved results in result backend",
                ["task_name"],
            )
            self.execution_time = Histogram(
                "execution_time",
                "Time of function execution",
                ["task_name"],
            )

        super().startup()


broker = ListQueueBroker(
    url=str(settings.REDIS_URL),
).with_middlewares(
    TaskStatusMiddleware(),
    PrometheusWorkerMiddleware(metrics_path=Path("/tmp")),
)

scheduler = TaskiqScheduler(
    broker=broker,
    sources=[LabelScheduleSource(broker)],
)

taskiq_fastapi.init(broker, "atciss.app.asgi:get_application")
