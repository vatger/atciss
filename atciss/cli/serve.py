"""Command-line interface - serve command."""
from multiprocessing import cpu_count
import uvicorn
import click

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
    default="0.0.0.0",
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
def serve(host: str, port: int, workers: int) -> None:
    """Define command-line interface serve command."""
    setup_logging()

    uvicorn.run(
        "atciss.app.asgi:get_application",
        factory=True,
        host=host,
        port=port,
        workers=None if settings.DEBUG else workers,
        log_level=settings.LOG_LEVEL.lower(),
        log_config=None,
        proxy_headers=True,
        forwarded_allow_ips=["*"],
        reload=settings.DEBUG,
    )
