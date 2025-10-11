import sys
import os
from pathlib import Path

# Import safe import utility
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Get Celery using safe import


from src.config.settings import config


def make_celery() -> Celery:
    app = Celery(
        "src",
        broker=config.celery_broker,
        backend=config.celery_backend,
    )
    app.conf.update(
        task_routes={
            "src.celery_queue.tasks.execute_mutation_workflow_task": {"queue": "mutations"}
        },
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
    )
    return app

# Global Celery app for CLI usage
celery = make_celery()