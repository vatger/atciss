from collections.abc import Iterator

from aiohttp import ClientSession
from loguru import logger

from atciss.app.views.dfs_rest import BaseItem, DFSDataset, GroupItem, LeafItem


async def get_dfs_aixm_datasets(
    amdt_id: int,
    http_client: ClientSession,
) -> dict[str, LeafItem]:
    """Retrieves the available DFS AIXM datasets"""
    async with http_client.get("https://aip.dfs.de/datasets/rest/") as res:
        available_datasets = {}
        try:
            dataset = DFSDataset.model_validate(await res.json(content_type="text/html"))
            for amdt in filter(lambda ds: ds.amdt == amdt_id, dataset.amdts):
                for ds in amdt.metadata.datasets:
                    for ld in get_leaf_datasets(ds):
                        available_datasets[ld.name] = ld
                logger.info(f"Received {len(amdt.metadata.datasets)} AIXM datasets from DFS")
        except ValueError as err:
            logger.error(err)

    return available_datasets


def get_dfs_aixm_url(datasets: dict[str, LeafItem], amdt_id: int, dataset_name: str) -> str | None:
    """Returns the proper AIXM URL for the given datsets, amendment and dataset name"""
    if dataset_name in datasets:
        for release in datasets[dataset_name].releases:
            if release.type.startswith("AIXM"):
                return f"https://aip.dfs.de/datasets/rest/{amdt_id}/{release.filename}"

    return None


def get_leaf_datasets(item: BaseItem) -> Iterator[LeafItem]:
    if item.type == "group":
        assert isinstance(item, GroupItem)
        if item.items:
            for child_item in item.items:
                yield from get_leaf_datasets(child_item)
    else:
        assert isinstance(item, LeafItem)
        if item.releases:
            yield item
