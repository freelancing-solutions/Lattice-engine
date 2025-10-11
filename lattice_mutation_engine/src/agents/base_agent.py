import abc
import asyncio
from typing import Any
from datetime import datetime
import logging
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.models.agent_models import AgentRegistration, AgentTask

logger = logging.getLogger(__name__)


class BaseAgent(abc.ABC):
    def __init__(self, registration: AgentRegistration):
        self.registration = registration

    @abc.abstractmethod
    async def execute_task(self, task: AgentTask) -> Any:
        raise NotImplementedError

    def _set_task_running(self, task: AgentTask) -> None:
        """Set task status to running"""
        task.status = 'running'
        logger.debug(f"Task {task.task_id} set to running for agent {self.registration.agent_id}")

    def _set_task_completed(self, task: AgentTask, result: Any) -> None:
        """Set task status to completed with result"""
        task.status = 'completed'
        task.result = result
        task.completed_at = datetime.utcnow()
        logger.debug(f"Task {task.task_id} completed for agent {self.registration.agent_id}")

    def _set_task_failed(self, task: AgentTask, error: str) -> None:
        """Set task status to failed with error message"""
        task.status = 'failed'
        task.error = error
        task.completed_at = datetime.utcnow()
        logger.debug(f"Task {task.task_id} failed for agent {self.registration.agent_id}: {error}")

    async def assign_task(self, task: AgentTask) -> Any:
        """Assign task to agent with proper lifecycle management"""
        try:
            # Set task to running
            self._set_task_running(task)

            # Execute the task
            result = await self.execute_task(task)

            # Mark task as completed
            self._set_task_completed(task, result)

            # Return result for backward compatibility
            return result

        except Exception as e:
            # Mark task as failed
            self._set_task_failed(task, str(e))

            # Re-raise exception for caller to handle
            raise