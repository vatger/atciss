"""Command-line interface - serve command."""
import os.path
from multiprocessing import cpu_count

import uvicorn
import click

import atciss
from ..app import get_application
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
    default=cpu_count() if settings.DEBUG else 1,
)
def serve(host: str, port: int, workers: int) -> None:
    """Define command-line interface serve command."""
    config = uvicorn.Config(
        get_application(),
        host=host,
        port=port,
        # workers=workers,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
        proxy_headers=True,
        forwarded_allow_ips=["*"],
    )
    setup_logging(level="DEBUG" if settings.DEBUG else "INFO")
    server = uvicorn.Server(config)
    server.run()
