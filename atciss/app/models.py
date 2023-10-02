from sqlmodel import SQLModel, Field

from .views.booking import Booking  # noqa: F401


class UserBase(SQLModel):
    cid: int = Field(default=None, nullable=False, primary_key=True)
    name: str
    rating: str


class User(UserBase, table=True):
    pass
