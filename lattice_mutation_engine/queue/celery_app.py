from celery import Celery
from ..config.settings import config


def make_celery() -> Celery:
    app = Celery(
        "lattice_mutation_engine",
        broker=config.celery_broker,
        backend=config.celery_backend,
    )
    app.conf.update(
        task_routes={
            "lattice_mutation_engine.queue.tasks.execute_mutation_workflow_task": {"queue": "mutations"}
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