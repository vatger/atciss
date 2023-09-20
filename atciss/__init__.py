"""ATCISS."""
import logging

from .version import __version__
from .wsgi import ApplicationLoader

import atciss.celery

# initialize logging
log = logging.getLogger(__name__)
log.addHandler(logging.NullHandler())

__all__ = ("ApplicationLoader", "__version__", "celery")
