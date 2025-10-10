import sys
import os
from pathlib import Path

# Import safe import utility
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from safe_imports import safe_import_celery

# Get Celery using safe import
Celery = safe_import_celery()

from config.settings import config


def make_celery() -> Celery:
    app = Celery(
        "lattice_mutation_engine",
        broker=config.celery_broker,
        backend=config.celery_backend,
    )
    app.conf.update(
        task_routes={
            "lattice_mutation_engine.celery_queue.tasks.execute_mutation_workflow_task": {"queue": "mutations"}
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