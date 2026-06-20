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


def _patch_file_watcher() -> None:
    # taskiq's FileWatcher only ignores the "opened" and "closed" watchdog
    # event types, missing "closed_no_write", emitted whenever something
    # merely reads a file (an LSP, mypy, an editor) without modifying it,
    # which otherwise triggers a reload on every such read.
    #
    # Imported locally: taskiq's reload extra (gitignore_parser, watchdog)
    # is a dev-only dependency, not installed in production, so this must
    # only run when reload is actually enabled.
    # pylint: disable=import-outside-toplevel
    from taskiq.cli.watcher import FileWatcher
    from watchdog.events import FileSystemEvent

    original_dispatch = FileWatcher.dispatch

    def _dispatch_ignoring_reads(self: FileWatcher, event: FileSystemEvent) -> None:
        if event.event_type == "closed_no_write":
            return
        original_dispatch(self, event)

    FileWatcher.dispatch = _dispatch_ignoring_reads  # type: ignore[method-assign]


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

    if settings.DEBUG:
        _patch_file_watcher()

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
            reload_dirs=["atciss"],
        )
    )
