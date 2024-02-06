"""Command-line interface - scheduler command."""

import asyncio

import click
from taskiq.cli.common_args import LogLevel
from taskiq.cli.scheduler.args import SchedulerArgs
from taskiq.cli.scheduler.run import run_scheduler

from ..config import settings
from ..log import setup_logging

CMD_HELP = """\
Run taskiq scheduler.
"""


@click.command(
    help=CMD_HELP,
)
def scheduler() -> int | None:
    """Define command-line interface serve command."""
    setup_logging()

    return asyncio.run(
        run_scheduler(
            SchedulerArgs(
                scheduler="atciss.tkq:scheduler",
                modules=["atciss.tasks"],
                configure_logging=False,
                log_level=LogLevel(settings.LOG_LEVEL),
                skip_first_run=False,
            )
        )
    )
