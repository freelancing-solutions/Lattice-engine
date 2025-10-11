import logging
import sys
try:
    from pythonjsonlogger import jsonlogger
except Exception:  # Fallback if package not installed
    jsonlogger = None


def setup_logging(log_level: str = "INFO"):
    """Setup structured logging (JSON if available)"""

    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    handler = logging.StreamHandler(sys.stdout)

    if jsonlogger is not None:
        formatter = jsonlogger.JsonFormatter(
            '%(asctime)s %(name)s %(levelname)s %(message)s'
        )
        handler.setFormatter(formatter)
    else:
        formatter = logging.Formatter(
            '%(asctime)s %(name)s %(levelname)s %(message)s'
        )
        handler.setFormatter(formatter)

    logger.handlers.clear()
    logger.addHandler(handler)

    return logger