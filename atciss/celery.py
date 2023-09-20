from celery import Celery
from celery.schedules import crontab
from asgiref.sync import async_to_sync

from .config import redis

app = Celery(__name__)

app.conf.broker_url = f"redis://{redis.REDIS_HOST}:{redis.REDIS_PORT}"
app.conf.result_backend = f"redis://{redis.REDIS_HOST}:{redis.REDIS_PORT}"
app.conf.broker_connection_retry_on_startup = False

app.conf.beat_schedule = {
    "update_notam": {"task": "update_notam", "schedule": crontab(minute="*/2")},
    "update_los": {"task": "update_loa", "schedule": crontab(minute="*/60")},
    "update_sectors": {"task": "update_sectors", "schedule": crontab(minute="*/60")},
    "update_vatsim": {"task": "update_vatsim", "schedule": crontab(minute="*/1")},
    "update_metar": {"task": "update_metar", "schedule": crontab(minute="*/1")},
}


@app.task(name="update_notam")
def update_notam() -> bool:
    from atciss.app.tasks.notam import fetch_notam

    async_to_sync(fetch_notam)()
    return True


@app.task(name="update_loa")
def update_loa() -> bool:
    from atciss.app.tasks.loa import fetch_loas

    async_to_sync(fetch_loas)()
    return True


@app.task(name="update_sectors")
def update_sectors() -> bool:
    from atciss.app.tasks.sectors import fetch_sector_data

    async_to_sync(fetch_sector_data)()
    return True


@app.task(name="update_vatsim")
def update_vatsim() -> bool:
    from atciss.app.tasks.vatsim import fetch_vatsim_data

    async_to_sync(fetch_vatsim_data)()
    return True


@app.task(name="update_metar")
def update_metar() -> bool:
    from atciss.app.tasks.metar import fetch_metar

    async_to_sync(fetch_metar)()
    return True
