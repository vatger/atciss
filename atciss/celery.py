from typing import Any

from celery import Celery
from celery.schedules import crontab
import celery.signals
from asgiref.sync import async_to_sync

from .config import settings, redis
from .log import setup_logging

from .app.tasks.notam import fetch_notam
from .app.tasks.loa import fetch_loas
from .app.tasks.sectors import fetch_sector_data
from .app.tasks.vatsim import fetch_vatsim_data
from .app.tasks.taf_metar import fetch_taf_metar
from .app.tasks.dfs_ad import fetch_dfs_ad_data
from .app.tasks.ecfmp import fetch_ecfmp
from .app.tasks.areas import fetch_areas


app = Celery(__name__)


@celery.signals.after_setup_logger.connect
def setup_logging_hook(loglevel: str, **_: dict[Any, Any]) -> None:
    settings.LOG_LEVEL = loglevel
    setup_logging()


@celery.signals.after_setup_task_logger.connect
def setup_task_logging_hook(loglevel: str, **_: dict[Any, Any]) -> None:
    settings.LOG_LEVEL = loglevel
    setup_logging()


app.conf.broker_url = f"redis://{redis.REDIS_HOST}:{redis.REDIS_PORT}"
app.conf.result_backend = f"redis://{redis.REDIS_HOST}:{redis.REDIS_PORT}"
app.conf.broker_connection_retry_on_startup = False

app.conf.beat_schedule = {
    "update_notam": {"task": "update_notam", "schedule": crontab(minute="*/30")},
    "update_loa": {"task": "update_loa", "schedule": crontab(minute="*/60")},
    "update_sectors": {"task": "update_sectors", "schedule": crontab(minute="*/60")},
    "update_vatsim": {"task": "update_vatsim", "schedule": crontab(minute="*")},
    "update_taf_metar": {"task": "update_taf_metar", "schedule": crontab(minute="*")},
    "update_ecfmp": {"task": "update_ecfmp", "schedule": crontab(minute="*")},
    "update_areas": {"task": "update_areas", "schedule": crontab(minute="*/10")},
    "update_dfs_ad_data": {
        "task": "update_dfs_ad_data",
        "schedule": crontab(day_of_week="1"),
    },
}


@app.task(name="update_notam")
def update_notam() -> None:
    async_to_sync(fetch_notam)()


@app.task(name="update_loa")
def update_loa() -> None:
    async_to_sync(fetch_loas)()


@app.task(name="update_sectors")
def update_sectors() -> None:
    async_to_sync(fetch_sector_data)()


@app.task(name="update_vatsim")
def update_vatsim() -> None:
    async_to_sync(fetch_vatsim_data)()


@app.task(name="update_taf_metar")
def update_taf_metar() -> None:
    async_to_sync(fetch_taf_metar)()


@app.task(name="update_dfs_ad_data")
def update_dfs_ad_data() -> None:
    async_to_sync(fetch_dfs_ad_data)()


@app.task(name="update_ecfmp")
def update_ecfmp() -> None:
    async_to_sync(fetch_ecfmp)()


@app.task(name="update_areas")
def update_areas() -> None:
    async_to_sync(fetch_areas)()
