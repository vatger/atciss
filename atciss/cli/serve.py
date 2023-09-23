"""Command-line interface - serve command."""
import os.path
from multiprocessing import cpu_count
from typing import Any

import uvicorn
import click

import atciss
from ..config import settings
from ..log import setup_logging


CMD_HELP = """\
Run production uvicorn server. 
"""


@click.command(
    help=CMD_HELP,
)
@click.option(
    "--host",
    help="The host to bind",
    type=click.STRING,
    required=False,
    default="::",
)
@click.option(
    "--port",
    help="The port to bind",
    type=click.INT,
    required=False,
    default=8000,
)
@click.option(
    "-w",
    "--workers",
    help="The number of worker processes for handling requests.",
    type=click.IntRange(min=1, max=cpu_count()),
    required=False,
    default=cpu_count(),
)
@click.option(
    "-l",
    "--log-level",
    help="Log level",
    type=str,
    required=False,
    default=settings.LOG_LEVEL,
)
def serve(host: str, port: int, workers: int, log_level: str) -> None:
    """Define command-line interface serve command."""
    setup_logging(level=log_level.upper())

    options: dict[str, Any] = {}
    if not settings.DEBUG:
        options["workers"] = workers

    config = uvicorn.Config(
        "atciss.app.asgi:get_application",
        factory=True,
        host=host,
        port=port,
        reload=settings.DEBUG,
        reload_dirs=[os.path.dirname(atciss.__file__)],
        log_level=log_level.lower(),
        log_config=None,
        proxy_headers=True,
        forwarded_allow_ips=["*"],
        **options,
    )
    server = uvicorn.Server(config)
    server.run()
