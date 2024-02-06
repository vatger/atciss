from __future__ import annotations

import logging
import sys
from typing import ClassVar

import asgiref
import loguru
from loguru import logger
from typing_extensions import override

from .config import settings


class InterceptHandler(logging.Handler):
    loglevel_mapping: ClassVar[dict[int, str]] = {
        50: "CRITICAL",
        40: "ERROR",
        30: "WARNING",
        20: "INFO",
        10: "DEBUG",
        0: "NOTSET",
    }

    @override
    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = self.loglevel_mapping[record.levelno * 10]

        frame, depth = logging.currentframe().f_back, 2
        while frame is not None and frame.f_code.co_filename in (
            logging.__file__,
            asgiref.__file__,
        ):
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def formatter(record: loguru.Record) -> str:
    corid = record["extra"].get("id", None)
    corid_part = f"<i><blue>{corid}</blue></i> | " if corid is not None else ""
    exc_part = "{exception}\n" if record["exception"] is not None else ""
    return (
        "<green>{elapsed}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        f"{corid_part}"
        "<level>{message}</level>\n"
        f"{exc_part}"
    )


def setup_logging() -> None:
    logger.remove()
    _ = logger.add(
        sys.stdout,
        enqueue=True,
        level=settings.LOG_LEVEL,
        format=formatter,
        colorize=True,
    )

    logging.basicConfig(handlers=[InterceptHandler()], level=0)

    # sqlalchemy prints queries on info level when we have DEBUG enabled
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DEBUG else logging.WARN,
    )

    for name in logging.root.manager.loggerDict:  # pylint: disable=no-member
        _logger = logging.getLogger(name)
        _logger.handlers = [InterceptHandler()]
        _logger.propagate = False
