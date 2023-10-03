from collections import defaultdict
from loguru import logger
from pydantic import TypeAdapter

from atciss.app.utils.redis import RedisClient

from ..views.ecfmp import ECFMP, Event, FlowMeasure

from ..utils import AiohttpClient, ClientConnectorError


async def fetch_ecfmp() -> None:
    """Periodically fetch ECFMP flow measures."""
    redis_client = await RedisClient.get()

    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get(
                "https://ecfmp.vatsim.net/api/v1/plugin",
            )
        except ClientConnectorError as e:
            logger.exception(f"Could not connect {e!s}")
            return

        ecfmp = ECFMP.model_validate(await res.json())

    logger.info(f"ECFMP: {len(ecfmp.flow_measures)} flow measures received")
    logger.info(f"ECFMP: {len(ecfmp.events)} events received")

    async with redis_client.pipeline() as pipe:
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
