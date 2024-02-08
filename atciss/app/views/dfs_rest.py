from pydantic import BaseModel, Field


class ContentItem(BaseModel):
    type: str
    value: str


class Checksum(BaseModel):
    type: str
    value: str


class Release(BaseModel):
    type: str
    content: list[ContentItem]
    published_date: str = Field(alias="publishedDate")
    effective_date: str = Field(alias="effectiveDate")
    filename: str
    checksum: Checksum


class BaseItem(BaseModel):
    type: str
    name: str
    name_de: str


class GroupItem(BaseItem):
    items: list["LeafItem"]


class LeafItem(BaseItem):
    description: str | None
    description_de: str | None
    releases: list[Release]


class Metadata(BaseModel):
    dataset_published: str
    airac: str | None = None
    dataset_type: str | None = None
    datasets: list[GroupItem]


class Amdt(BaseModel):
    amdt: int = Field(alias="Amdt")
    amdt_date: str = Field(alias="AmdtDate")
    amdt_numeric: str = Field(alias="AmdtNumeric")
    metadata: Metadata = Field(alias="Metadata")


class DFSDataset(BaseModel):
    description: str = Field(alias="Description")
    api_version: str = Field(alias="API_Version")
    copyright: str = Field(alias="Copyright")
    timestamp: str = Field(alias="Timestamp")
    amdts: list[Amdt] = Field(alias="Amdts")
