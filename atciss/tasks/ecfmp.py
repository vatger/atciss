from collections import defaultdict
from typing import Annotated

from fastapi import Depends
from loguru import logger
from pydantic import TypeAdapter

from atciss.app.utils import AiohttpClient, ClientConnectorError, Redis, get_redis
from atciss.app.views.ecfmp import ECFMP, Event, FlowMeasure
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/1 * * * *"}])
async def fetch_ecfmp(
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch ECFMP flow measures."""
    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get(
                "https://ecfmp.vatsim.net/api/v1/plugin",
            )
        except ClientConnectorError as e:
            logger.exception(f"Could not connect {e!s}")
            return

        try:
            ecfmp = ECFMP.model_validate(await res.json())
        except ValueError as e:
            logger.exception(f"Could not parse {e!s}")
            return

    logger.info(f"ECFMP: {len(ecfmp.flow_measures)} flow measures received")
    logger.info(f"ECFMP: {len(ecfmp.events)} events received")

    async with await redis.pipeline() as pipe:
        flow_measures_by_fir = defaultdict(list)
        for flow_measure in ecfmp.flow_measures:
            for fir in flow_measure.notified_firs:
                flow_measures_by_fir[fir].append(flow_measure)
        events_by_fir = defaultdict(list)
        for event in ecfmp.events:
            events_by_fir[event.fir].append(event)

        for fir, flow_measures in flow_measures_by_fir.items():
            pipe.set(
                f"ecfmp:flow_measures:{fir}",
                TypeAdapter(list[FlowMeasure]).dump_json(flow_measures),
            )
        for fir, events in events_by_fir.items():
            pipe.set(f"ecfmp:events:{fir}", TypeAdapter(list[Event]).dump_json(events))

        await pipe.execute()
