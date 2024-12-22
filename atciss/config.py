from typing import cast

from pydantic import PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

from atciss.version import __version__


class Application(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ATCISS_", case_sensitive=False)

    DEBUG: bool = True
    DEBUG_SQL: bool = False
    LOG_LEVEL: str = "DEBUG"
    PROJECT_NAME: str = "atciss"
    VERSION: str = __version__
    CONTRIB_PATH: str = "./contrib"
    ALEMBIC_CFG_PATH: str = "alembic.ini"
    DOCS_URL: str = "/"
    BASE_URL: str = "http://localhost:8000"
    LOA_URL: str = "https://loa.vatsim-germany.org/api/v1/conditions"
    SECRET_KEY: str = "dc3101ed2074e87e3bf2b158fd0934cc538a5d667a96e0d400d8b4f6f572c33d"
    VATSIM_AUTH_URL: str = "https://auth-dev.vatsim.net"
    VATSIM_AUTH_SCOPES: str = "full_name email vatsim_details country"
    VATSIM_AUTH_USERINFO_PATH: str = "api/user"
    VATSIM_CLIENT_ID: str = "592"
    VATSIM_CLIENT_SECRET: str = "UR3n0xnjzP4KAbB3enMDCGVD4qbyLvIoSAQtzVm2"
    VATSIM_REDIRECT_URL: str = "http://localhost:5173/auth/callback"
    ROSTER_API_URL: str = "https://vatsim-germany.org/api/vateud/roster"
    ROSTER_API_TOKEN: str = "invalid"
    GDPR_API_TOKEN: str = "invalid"

    DATABASE_DSN: PostgresDsn = cast(
        PostgresDsn, "postgresql+asyncpg://postgres:fnord@localhost/atciss"
    )
    REDIS_URL: RedisDsn = cast(RedisDsn, "redis://localhost:6379")

    ADMINS: list[str] = [
        "10000009",  # dev SUP
        "10000010",  # dev ADM
        "1519114",  # RG
        "1586741",  # AL
        "1532450",  # FN
        "1432304",  # JV
    ]

    FIR_ADMINS: dict[str, list[str]] = {
        "EDMM": [
            "10000009",  # dev SUP
            "10000010",  # dev ADM
            "1519114",  # RG
            "1586741",  # AL
            "1532450",  # FN
            "1432304",  # JV
            "1441619",  # MM
            "1593864",  # MG
            "1378091",  # JD
            "1626019",  # LG
            "1470223",  # ML
        ],
        "EDGG": [
            "10000009",  # dev SUP
            "10000010",  # dev ADM
        ],
        "EDWW": [
            "10000009",  # dev SUP
            "10000010",  # dev ADM
        ],
    }

    FIRS: list[str] = ["EDGG", "EDMM", "EDWW"]

    # check https://github.com/lennycolton/vatglasses-data/tree/main/data
    SECTOR_REGIONS: list[str] = [
        "ed",
        "lo",
        "li",
        "lk",
        "lf",
        "ls",
        "eb-el",
        "eg",
        "eh",
        "ek",
        "ep",
        "es",
    ]


settings = Application()
