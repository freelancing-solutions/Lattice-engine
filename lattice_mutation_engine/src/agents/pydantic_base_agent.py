"""PydanticAI Base Agent for the Lattice Mutation Engine.
This module provides the base class for all PydanticAI-based agents.
"""

import logging
from typing import Any, Dict, Optional, Type, TypeVar, Generic
from abc import ABC, abstractmethod
from datetime import datetime
from pydantic import BaseModel
from pydantic_ai import Agent
from anthropic import Anthropic
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.models.agent_models import AgentRegistration, AgentTask
from src.agents.base_agent import BaseAgent
from src.config.settings import config
from src.config.claude_config import claude_config, get_claude_client

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=BaseModel)


class AgentContext(BaseModel):
    """Context passed to PydanticAI agents during execution"""
    task_id: str
    agent_id: str
    operation: str
    input_data: Dict[str, Any]
    timestamp: datetime
    retry_count: int = 0


class PydanticBaseAgent(BaseAgent, Generic[T], ABC):
    """
    Base class for PydanticAI-based agents in the Lattice Mutation Engine.
    
    This class provides:
    - Integration with PydanticAI for structured LLM interactions
    - Anthropic Claude client management
    - Structured input/output handling
    - Error handling and fallback mechanisms
    """
    
    def __init__(self, registration: AgentRegistration):
        super().__init__(registration)
        self.claude_client = get_claude_client()
        self.agent_type = registration.agent_type.value if hasattr(registration.agent_type, 'value') else str(registration.agent_type)
        
        # Initialize PydanticAI agent with Claude
        self.pydantic_agent = self._create_pydantic_agent()
        
        logger.info(f"Initialized PydanticBaseAgent: {registration.agent_id}")
    
    def _create_pydantic_agent(self) -> Optional[Agent]:
        """Create a PydanticAI agent with Claude integration"""
        try:
            if not self.claude_client:
                logger.warning(f"Claude client not available for {self.registration.agent_id}")
                return None
            
            # Get agent-specific model configuration
            model_config = claude_config.get_model_config(self.agent_type)
            
            # Create PydanticAI agent with system prompt and response model
            agent = Agent(
                model=self.claude_client,
                result_type=self.get_response_model(),
                system_prompt=self.get_system_prompt()
            )
            
            return agent
            
        except Exception as e:
            logger.error(f"Failed to create PydanticAI agent for {self.registration.agent_id}: {e}")
            return None
    
    @abstractmethod
    def get_response_model(self) -> Type[BaseModel]:
        """Get the Pydantic model for structured responses"""
        pass
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get the system prompt for the agent"""
        pass
    
    @abstractmethod
    def prepare_user_message(self, task: AgentTask) -> str:
        """Prepare the user message based on the task"""
        pass
    
    @abstractmethod
    def handle_fallback(self, task: AgentTask, error: Exception) -> Dict[str, Any]:
        """Handle fallback when PydanticAI fails"""
        pass
    
    async def execute_task(self, task: AgentTask) -> Dict[str, Any]:
        """
        Execute a task using PydanticAI with fallback to rule-based processing.
        """
        try:
            # Try PydanticAI first
            if self.pydantic_agent and claude_config.is_configured():
                return await self._execute_with_pydantic(task)
            else:
                logger.info(f"PydanticAI not available for {self.registration.agent_id}, using fallback")
                return self.handle_fallback(task, Exception("PydanticAI not configured"))
                
        except Exception as e:
            logger.error(f"Error in PydanticAI execution for {self.registration.agent_id}: {e}")
            return self.handle_fallback(task, e)
    
    async def _execute_with_pydantic(self, task: AgentTask) -> Dict[str, Any]:
        """Execute task using PydanticAI"""
        try:
            # Prepare the user message
            user_message = self.prepare_user_message(task)
            
            # Run the PydanticAI agent
            result = await self.pydantic_agent.run(user_message)
            
            # Convert result to dictionary
            if hasattr(result.data, 'model_dump'):
                return result.data.model_dump()
            else:
                return {"result": str(result.data)}
                
        except Exception as e:
            logger.error(f"PydanticAI execution failed for {self.registration.agent_id}: {e}")
            raise


class MockLLMAgent(PydanticBaseAgent[T]):
    """
    Mock agent for development and testing without LLM API keys.
    Provides basic rule-based responses for each agent type.
    """
    
    def _get_system_prompt(self) -> str:
        return f"You are a mock {self.registration.agent_type} agent for development purposes."
    
    def _prepare_user_message(self, task: AgentTask) -> str:
        return f"Mock execution of {task.operation} with data: {task.input_data}"
    
    async def execute_task(self, task: AgentTask) -> Dict[str, Any]:
        """Provide mock responses based on agent type"""
        await asyncio.sleep(0.1)  # Simulate processing time
        
        return {
            "success": True,
            "agent_id": self.registration.agent_id,
            "task_id": task.task_id,
            "mock_response": True,
            "operation": task.operation,
            "timestamp": datetime.utcnow().isoformat()
        }