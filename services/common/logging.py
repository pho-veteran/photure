import logging
import sys

from .config import get_settings


def configure_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)

    logger.addHandler(handler)

    settings = get_settings()
    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    logger.setLevel(level)
    logger.propagate = False
    return logger

