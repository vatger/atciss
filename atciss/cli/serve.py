"""Command-line interface - serve command."""
from typing import Dict, Any
from multiprocessing import cpu_count

import click

from .. import ApplicationLoader
from ..app import get_application


CMD_SHORT_HELP = "Run production server."
CMD_HELP = """\
Run production gunicorn (WSGI) server with uvicorn (ASGI) workers.
"""


@click.command(
    help=CMD_HELP,
    short_help=CMD_SHORT_HELP,
)
@click.option(
    "--bind",
    help="""\
    The socket to bind.
    A string of the form: 'HOST', 'HOST:PORT', 'unix:PATH'.
    An IP is a valid HOST.
    """,
    type=click.STRING,
    required=False,
)
@click.option(
    "-w",
    "--workers",
    help="The number of worker processes for handling requests.",
    type=click.IntRange(min=1, max=cpu_count()),
    required=False,
)
@click.option(
    "-D",
    "--daemon",
    help="Daemonize the Gunicorn process.",
    is_flag=True,
    required=False,
)
@click.option(
    "-e",
    "--env",
    "raw_env",
    help="Set environment variables in the execution environment.",
    type=click.STRING,
    multiple=True,
    required=False,
)
@click.pass_context
def serve(ctx: click.Context, **options: Dict[str, Any]) -> None:
    """Define command-line interface serve command.

    Args:
        ctx (click.Context): Click Context class object instance.
        options (typing.Dict[str, typing.Any]): Map of command option names to
            their parsed values.
    """
    overrides = {}

    for key, value in options.items():
        source = ctx.get_parameter_source(key)
        if source and source.name == "COMMANDLINE":
            overrides[key] = value

    ApplicationLoader(
        application=get_application(),
        overrides=overrides,
    ).run()
