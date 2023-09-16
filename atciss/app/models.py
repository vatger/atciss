from sqlmodel import SQLModel, Field


class UserBase(SQLModel):
    cid: int = Field(default=None, nullable=False, primary_key=True)
    name: str
    rating: str


class User(UserBase, table=True):
    pass
