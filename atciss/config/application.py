"""Application configuration - FastAPI."""
from pydantic_settings import BaseSettings

from ..version import __version__


class Application(BaseSettings):
    """Define application configuration model.

    Constructor will attempt to determine the values of any fields not passed
    as keyword arguments by reading from the environment. Default values will
    still be used if the matching environment variable is not set.

    Environment variables:
        * ATCISS_DEBUG
        * ATCISS_PROJECT_NAME
        * ATCISS_VERSION
        * ATCISS_DOCS_URL
        * ATCISS_USE_REDIS

    Attributes:
        DEBUG (bool): FastAPI logging level. You should disable this for
            production.
        PROJECT_NAME (str): FastAPI project name.
        VERSION (str): Application version.
        DOCS_URL (str): Path where swagger ui will be served at.
    """

    DEBUG: bool = True
    PROJECT_NAME: str = "atciss"
    VERSION: str = __version__
    DOCS_URL: str = "/"
    SECRET_KEY: str = "dc3101ed2074e87e3bf2b158fd0934cc538a5d667a96e0d400d8b4f6f572c33d"
    VATSIM_AUTH_URL: str = "https://auth-dev.vatsim.net"
    VATSIM_CLIENT_ID: str = "592"
    VATSIM_CLIENT_SECRET: str = "UR3n0xnjzP4KAbB3enMDCGVD4qbyLvIoSAQtzVm2"
    VATSIM_REDIRECT_URL: str = "http://localhost:5173/auth/callback"

    POSTGRES_HOST: str = "db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "fnord"
    POSTGRES_DB: str = "atciss"

    class Config:
        """Config sub-class needed to customize BaseSettings settings.

        Attributes:
            case_sensitive (bool): When case_sensitive is True, the environment
                variable names must match field names (optionally with a prefix)
            env_prefix (str): The prefix for environment variable.

        Resources:
            https://pydantic-docs.helpmanual.io/usage/settings/
        """

        case_sensitive = True
        env_prefix = "ATCISS_"


settings = Application()
