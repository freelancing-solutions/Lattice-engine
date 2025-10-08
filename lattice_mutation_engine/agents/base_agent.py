import abc
import asyncio
from typing import Any

from ..models.agent_models import AgentRegistration, AgentTask


class BaseAgent(abc.ABC):
    def __init__(self, registration: AgentRegistration):
        self.registration = registration

    @abc.abstractmethod
    async def execute_task(self, task: AgentTask) -> Any:
        raise NotImplementedError

    async def assign_task(self, task: AgentTask) -> Any:
        return await self.execute_task(task)