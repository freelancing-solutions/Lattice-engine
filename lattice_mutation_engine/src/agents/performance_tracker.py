"""
Performance Tracker for Lattice Engine Agents

This module provides a decorator to automatically track agent task execution
performance metrics and record them in the database.
"""

import logging
import functools
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Optional, Callable

from src.agents.agent_service import AgentService
from src.core.database import get_db


logger = logging.getLogger(__name__)


def track_agent_performance(agent_id: str, organization_id: str):
    """
    Decorator to automatically track agent task execution performance.

    This decorator measures execution time, captures success/failure status,
    extracts confidence scores from results, and records metrics in the database.

    Args:
        agent_id: Agent UUID string
        organization_id: Organization UUID string

    Returns:
        Decorated function with performance tracking

    Usage:
        @track_agent_performance(agent_id="123", organization_id="456")
        async def execute_task(self, task_data):
            # Agent task execution logic
            pass
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            task_id = str(uuid.uuid4())
            operation = func.__name__
            success = False
            response_time_ms = 0.0
            confidence_score = None
            error_message = None

            try:
                # Execute the original function
                result = await func(*args, **kwargs)
                success = True

                # Extract confidence score from result if available
                if isinstance(result, dict):
                    confidence_score = result.get('confidence_score')
                elif hasattr(result, 'confidence_score'):
                    confidence_score = result.confidence_score

                return result

            except Exception as e:
                error_message = str(e)
                logger.error(f"Agent task execution failed: {error_message}")
                raise

            finally:
                # Calculate response time
                end_time = time.time()
                response_time_ms = (end_time - start_time) * 1000

                # Record performance metrics
                try:
                    db = next(get_db())
                    agent_service = get_agent_service(db)

                    agent_service.record_task_execution(
                        agent_id=agent_id,
                        task_id=task_id,
                        operation=operation,
                        success=success,
                        response_time_ms=response_time_ms,
                        confidence_score=confidence_score,
                        error_message=error_message,
                        organization_id=organization_id
                    )

                    logger.debug(
                        f"Performance tracked for agent {agent_id}: "
                        f"operation={operation}, success={success}, "
                        f"response_time_ms={response_time_ms:.2f}"
                    )

                except Exception as e:
                    # Don't let tracking errors affect the main function
                    logger.error(f"Failed to record performance metrics: {str(e)}")

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            task_id = str(uuid.uuid4())
            operation = func.__name__
            success = False
            response_time_ms = 0.0
            confidence_score = None
            error_message = None

            try:
                # Execute the original function
                result = func(*args, **kwargs)
                success = True

                # Extract confidence score from result if available
                if isinstance(result, dict):
                    confidence_score = result.get('confidence_score')
                elif hasattr(result, 'confidence_score'):
                    confidence_score = result.confidence_score

                return result

            except Exception as e:
                error_message = str(e)
                logger.error(f"Agent task execution failed: {error_message}")
                raise

            finally:
                # Calculate response time
                end_time = time.time()
                response_time_ms = (end_time - start_time) * 1000

                # Record performance metrics
                try:
                    db = next(get_db())
                    agent_service = get_agent_service(db)

                    agent_service.record_task_execution(
                        agent_id=agent_id,
                        task_id=task_id,
                        operation=operation,
                        success=success,
                        response_time_ms=response_time_ms,
                        confidence_score=confidence_score,
                        error_message=error_message,
                        organization_id=organization_id
                    )

                    logger.debug(
                        f"Performance tracked for agent {agent_id}: "
                        f"operation={operation}, success={success}, "
                        f"response_time_ms={response_time_ms:.2f}"
                    )

                except Exception as e:
                    # Don't let tracking errors affect the main function
                    logger.error(f"Failed to record performance metrics: {str(e)}")

        # Return appropriate wrapper based on whether function is async
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


def get_agent_service(db, orchestrator=None) -> AgentService:
    """
    Create an AgentService instance for performance tracking.

    Args:
        db: Database session
        orchestrator: Optional AgentOrchestrator instance

    Returns:
        AgentService: Agent service instance
    """
    try:
        # Import here to avoid circular imports
        from src.core.dependencies import get_orchestrator

        if orchestrator is None:
            orchestrator = get_orchestrator()

        return AgentService(db, orchestrator)

    except Exception as e:
        logger.error(f"Failed to create agent service for performance tracking: {str(e)}")
        # Return a minimal service that won't crash the application
        return None


def track_agent_registration(agent_id: str, agent_type: str, organization_id: str):
    """
    Track agent registration events.

    Args:
        agent_id: Agent UUID string
        agent_type: Agent type
        organization_id: Organization UUID string
    """
    try:
        logger.info(
            f"Agent registration tracked: agent_id={agent_id}, "
            f"agent_type={agent_type}, organization_id={organization_id}"
        )

        # Here you could emit WebSocket events or other notifications
        # This is a placeholder for future registration tracking

    except Exception as e:
        logger.error(f"Failed to track agent registration: {str(e)}")


def track_agent_unregistration(agent_id: str, organization_id: str):
    """
    Track agent unregistration events.

    Args:
        agent_id: Agent UUID string
        organization_id: Organization UUID string
    """
    try:
        logger.info(
            f"Agent unregistration tracked: agent_id={agent_id}, "
            f"organization_id={organization_id}"
        )

        # Here you could emit WebSocket events or other notifications
        # This is a placeholder for future unregistration tracking

    except Exception as e:
        logger.error(f"Failed to track agent unregistration: {str(e)}")


# Import asyncio for async function detection
import asyncio