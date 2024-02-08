# pyright: reportMissingTypeStubs=false
from pathlib import Path

import taskiq_fastapi
from taskiq import PrometheusMiddleware, TaskiqScheduler
from taskiq.schedule_sources import LabelScheduleSource
from taskiq_redis import ListQueueBroker, RedisAsyncResultBackend

from atciss.config import settings

broker = (
    ListQueueBroker(
        url=str(settings.REDIS_URL),
    )
    .with_result_backend(
        RedisAsyncResultBackend(
            redis_url=str(settings.REDIS_URL),
        )
    )
    .with_middlewares(
        PrometheusMiddleware(metrics_path=Path("/tmp")),
    )
)

scheduler = TaskiqScheduler(
    broker=broker,
    sources=[LabelScheduleSource(broker)],
)

taskiq_fastapi.init(broker, "atciss.app.asgi:get_application")
