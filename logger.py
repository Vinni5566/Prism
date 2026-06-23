"""
logger.py — Centralised logging setup.

All modules import logger from here:
    from logger import get_logger
    log = get_logger(__name__)
    log.info("Something happened")

Logs to both console AND a rotating file at data/logs/app.log
"""

import logging
import os
from logging.handlers import RotatingFileHandler
from config import DATA_DIR

LOG_DIR  = os.path.join(DATA_DIR, "logs")
LOG_FILE = os.path.join(LOG_DIR, "app.log")
os.makedirs(LOG_DIR, exist_ok=True)

# ── Format ─────────────────────────────────────────────────────────────────────
_FMT  = "%(asctime)s | %(levelname)-8s | %(name)-25s | %(message)s"
_DATE = "%Y-%m-%d %H:%M:%S"


def _setup_root_logger():
    root = logging.getLogger()
    if root.handlers:
        return   # already configured

    root.setLevel(logging.INFO)

    # Console handler
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    ch.setFormatter(logging.Formatter(_FMT, datefmt=_DATE))

    # Rotating file handler (5 MB × 3 backups)
    fh = RotatingFileHandler(
        LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter(_FMT, datefmt=_DATE))

    root.addHandler(ch)
    root.addHandler(fh)


_setup_root_logger()


def get_logger(name: str) -> logging.Logger:
    """Return a named logger. Call at module level: log = get_logger(__name__)"""
    return logging.getLogger(name)
