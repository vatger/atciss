from __future__ import annotations

import logging
import sys

import loguru
from loguru import logger
import asgiref

from .config import settings


class InterceptHandler(logging.Handler):
    loglevel_mapping = {
        50: "CRITICAL",
        40: "ERROR",
        30: "WARNING",
        20: "INFO",
        10: "DEBUG",
        0: "NOTSET",
    }

    def emit(self, record: loguru.Record) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = self.loglevel_mapping[record.levelno * 10]

        frame, depth = logging.currentframe().f_back, 2
        while frame is not None and (
            frame.f_code.co_filename == logging.__file__
            or frame.f_code.co_filename == asgiref.__file__
        ):
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging() -> None:
    logger.remove()
    _ = logger.add(
        sys.stdout,
        enqueue=True,
        level=settings.LOG_LEVEL,
        format=(
            "<green>{elapsed}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
    )

    logging.basicConfig(handlers=[InterceptHandler()], level=0)
    for name in logging.root.manager.loggerDict.keys():
        _logger = logging.getLogger(name)
        _logger.handlers = [InterceptHandler()]
        _logger.propagate = False
