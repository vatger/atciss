"""Command-line interface - worker command."""

import logging
from multiprocessing import cpu_count

import click
from taskiq.cli.common_args import LogLevel
from taskiq.cli.worker.args import WorkerArgs
from taskiq.cli.worker.run import run_worker

from ..config import settings
from ..log import setup_logging

CMD_HELP = """\
Run taskiq worker.
"""


@click.command(
    help=CMD_HELP,
)
@click.option(
    "-w",
    "--workers",
    help="The number of worker processes for handling requests.",
    type=click.IntRange(min=1, max=cpu_count()),
    required=False,
    default=cpu_count(),
)
def worker(workers: int) -> int | None:
    """Define command-line interface serve command."""
    setup_logging()

    return run_worker(
        WorkerArgs(
            broker="atciss.tkq:broker",
            modules=["atciss.tasks"],
            configure_logging=False,
            log_level=LogLevel(
                logging.getLevelNamesMapping().get(settings.LOG_LEVEL) or LogLevel.DEBUG
            ),
            workers=workers,
            reload=settings.DEBUG,
        )
    )
