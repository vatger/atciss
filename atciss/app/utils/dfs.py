from typing import List, Optional

from loguru import logger

from atciss.app.utils.aiohttp_client import AiohttpClient
from atciss.app.views.dfs import DFSDataset, Item


async def get_dfs_aixm_url(amdt_id: int, dataset_name: str) -> Optional[str]:
    async with AiohttpClient.get() as aiohttp_client:
        res = await aiohttp_client.get("https://aip.dfs.de/datasets/rest/")
        available_datasets = {}

        try:
            dataset = DFSDataset.model_validate(
                await res.json(content_type="text/html")
            )
            for amdt in dataset.amdts:
                if not amdt.amdt == amdt_id:
                    continue

                data = []
                for dataset in amdt.metadata.datasets:
                    data.extend(get_leaf_datasets(dataset))
                logger.info(f"Received {len(data)} AIXM datasets from DFS")

                for d in data:
                    available_datasets[d.name] = d
        except ValueError as err:
            logger.error(err)

        if not available_datasets[dataset_name]:
            return None

        for release in available_datasets[dataset_name].releases:
            if release.type.startswith("AIXM"):
                return f"https://aip.dfs.de/datasets/rest/{amdt_id}/{release.filename}"

    # Nothing found, return None
    return None


def get_leaf_datasets(item: Item) -> List[Item]:
    result = []

    if item.type == "group":
        if item.items:
            for child_item in item.items:
                result.extend(get_leaf_datasets(child_item))
    else:
        if item.releases:
            result.append(item)

    return result
