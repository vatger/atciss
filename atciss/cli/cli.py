"""Command-line interface - root."""

from typing import Any

import click

from .scheduler import scheduler
from .serve import serve
from .worker import worker

CMD_HELP = "ATCISS CLI root."


@click.group(help=CMD_HELP)
def cli(**_: dict[str, Any]) -> None:
    """Define command-line interface root."""


cli.add_command(serve)
cli.add_command(worker)
cli.add_command(scheduler)
