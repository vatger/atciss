"""Application configuration - Redis."""

from pydantic_settings import BaseSettings


class Redis(BaseSettings):
    """Define Redis configuration model.

    Constructor will attempt to determine the values of any fields not passed
    as keyword arguments by reading from the environment. Default values will
    still be used if the matching environment variable is not set.

    Environment variables:
        * ATCISS_REDIS_HOST
        * ATCISS_REDIS_PORT
        * ATCISS_REDIS_USERNAME
        * ATCISS_REDIS_PASSWORD
        * ATCISS_REDIS_USE_SENTINEL

    Attributes:
        REDIS_HOTS (str): Redis host.
        REDIS_PORT (int): Redis port.
        REDIS_USERNAME (typing.Optional[str]): Redis username.
        REDIS_PASSWORD (typing.Optional[str]): Redis password.
        REDIS_USE_SENTINEL (bool): If provided Redis config is for Sentinel.
    """

    REDIS_HOST: str = "127.0.0.1"
    REDIS_PORT: int = 6379
    REDIS_USERNAME: str | None = None
    REDIS_PASSWORD: str | None = None
    REDIS_USE_SENTINEL: bool = False

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


redis = Redis()
