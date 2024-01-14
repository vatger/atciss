from typing import List, Optional
from pydantic import BaseModel, Field


class ContentItem(BaseModel):
    type: str
    value: str


class Checksum(BaseModel):
    type: str
    value: str


class Release(BaseModel):
    type: str
    content: List[ContentItem]
    published_date: str = Field(alias="publishedDate")
    effective_date: str = Field(alias="effectiveDate")
    filename: str
    checksum: Checksum


class Item(BaseModel):
    type: str
    name: str
    name_de: str
    description: Optional[str] = None
    description_de: Optional[str] = None
    releases: Optional[List[Release]] = None
    items: Optional[List["Item"]] = None


class Metadata(BaseModel):
    dataset_published: str
    airac: Optional[str] = None
    dataset_type: Optional[str] = None
    datasets: List[Item]


class Amdt(BaseModel):
    amdt: int = Field(alias="Amdt")
    amdt_date: str = Field(alias="AmdtDate")
    amdt_numeric: str = Field(alias="AmdtNumeric")
    metadata: Metadata | None = Field(alias="Metadata")


class DFSDataset(BaseModel):
    description: str = Field(alias="Description")
    api_version: str = Field(alias="API_Version")
    copyright: str = Field(alias="Copyright")
    timestamp: str = Field(alias="Timestamp")
    amdts: List[Amdt] = Field(alias="Amdts")
