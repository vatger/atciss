# pyright: reportMissingTypeStubs=false, reportUninitializedInstanceVariable=false
import os
from pathlib import Path
from tempfile import gettempdir

import taskiq_fastapi
from prometheus_client import Counter, Histogram
from taskiq import PrometheusMiddleware, TaskiqMiddleware, TaskiqScheduler
from taskiq.schedule_sources import LabelScheduleSource
from taskiq_redis import ListQueueBroker
from typing_extensions import override

from atciss.config import settings


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
    PrometheusWorkerMiddleware(metrics_path=Path("/tmp")),
)

scheduler = TaskiqScheduler(
    broker=broker,
    sources=[LabelScheduleSource(broker)],
)

taskiq_fastapi.init(broker, "atciss.app.asgi:get_application")
