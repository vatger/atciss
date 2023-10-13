"""Application configuration - FastAPI."""
from pydantic import PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

from ..version import __version__


class Application(BaseSettings):
    """Define application configuration model."""

    model_config = SettingsConfigDict(env_prefix="ATCISS_", case_sensitive=False)

    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    PROJECT_NAME: str = "atciss"
    VERSION: str = __version__
    DOCS_URL: str = "/"
    BASE_URL: str = "http://localhost:8000"
    SECRET_KEY: str = "dc3101ed2074e87e3bf2b158fd0934cc538a5d667a96e0d400d8b4f6f572c33d"
    VATSIM_AUTH_URL: str = "https://auth-dev.vatsim.net"
    VATSIM_CLIENT_ID: str = "592"
    VATSIM_CLIENT_SECRET: str = "UR3n0xnjzP4KAbB3enMDCGVD4qbyLvIoSAQtzVm2"
    VATSIM_REDIRECT_URL: str = "http://localhost:5173/auth/callback"

    DATABASE_DSN: PostgresDsn = "postgresql+asyncpg://atciss:fnord@localhost/atciss"

    # check https://github.com/lennycolton/vatglasses-data/tree/main/data
    # TODO add poland and switzerland when available
    SECTOR_REGIONS: list[str] = [
        "ed",
        "lo",
        "li",
        "lk",
        "lf",
        "eb-el",
        "eg",
        "eh",
        "ek",
        "ep",
        "es",
    ]


settings = Application()
