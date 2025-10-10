"""
Logging configuration and utilities.
"""

import sys
from pathlib import Path
from typing import Any, Dict

from loguru import logger

from app.config import settings


def setup_logging():
    """Setup application logging."""
    # Remove default logger
    logger.remove()

    # Add console logger
    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
    )

    # Add file logger for production
    if settings.ENVIRONMENT == "production":
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)

        logger.add(
            log_dir / "bugsage.log",
            level="INFO",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            rotation="10 MB",
            retention="30 days",
            compression="zip",
        )

        logger.add(
            log_dir / "errors.log",
            level="ERROR",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            rotation="10 MB",
            retention="30 days",
            compression="zip",
        )


def get_logger(name: str = None):
    """Get logger instance."""
    if name:
        return logger.bind(name=name)
    return logger


class LoggingMixin:
    """Mixin class to add logging capabilities."""

    @property
    def logger(self):
        """Get logger for this class."""
        return get_logger(self.__class__.__name__)


def log_function_call(func):
    """Decorator to log function calls."""
    import functools
    import inspect

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = get_logger(func.__module__)
        logger.debug(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")

        try:
            result = func(*args, **kwargs)
            logger.debug(f"{func.__name__} returned {result}")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} raised {e}")
            raise

    return wrapper


def log_async_function_call(func):
    """Decorator to log async function calls."""
    import functools

    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        logger = get_logger(func.__module__)
        logger.debug(f"Calling async {func.__name__} with args={args}, kwargs={kwargs}")

        try:
            result = await func(*args, **kwargs)
            logger.debug(f"Async {func.__name__} returned {result}")
            return result
        except Exception as e:
            logger.error(f"Async {func.__name__} raised {e}")
            raise

    return wrapper