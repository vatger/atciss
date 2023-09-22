from typing import Any

from celery import Celery
from celery.schedules import crontab
import celery.signals
from asgiref.sync import async_to_sync

from .config import redis
from .log import setup_logging

app = Celery(__name__)


@celery.signals.setup_logging.connect
def setup_logging_hook(**_: dict[Any, Any]) -> None:
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
    "update_dfs_ad_data": {
        "task": "update_dfs_ad_data",
        "schedule": crontab(day_of_week="1"),
    },
}


@app.task(name="update_notam")
def update_notam():
    from atciss.app.tasks.notam import fetch_notam

    async_to_sync(fetch_notam)()


@app.task(name="update_loa")
def update_loa():
    from atciss.app.tasks.loa import fetch_loas

    async_to_sync(fetch_loas)()


@app.task(name="update_sectors")
def update_sectors():
    from atciss.app.tasks.sectors import fetch_sector_data

    async_to_sync(fetch_sector_data)()


@app.task(name="update_vatsim")
def update_vatsim():
    from atciss.app.tasks.vatsim import fetch_vatsim_data

    async_to_sync(fetch_vatsim_data)()


@app.task(name="update_taf_metar")
def update_taf_metar():
    from atciss.app.tasks.taf_metar import fetch_taf_metar

    async_to_sync(fetch_taf_metar)()


@app.task(name="update_dfs_ad_data")
def update_dfs_ad_data():
    from atciss.app.tasks.dfs_ad import fetch_dfs_ad_data

    async_to_sync(fetch_dfs_ad_data)()
