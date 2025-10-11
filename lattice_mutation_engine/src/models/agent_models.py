from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class AgentType(str, Enum):
    VALIDATOR = "validator"
    DEPENDENCY = "dependency"
    SEMANTIC = "semantic"
    MUTATION = "mutation"
    IMPACT = "impact"
    CONFLICT = "conflict"


class AgentCapability(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]


class AgentRegistration(BaseModel):
    agent_id: str
    agent_type: AgentType
    capabilities: List[AgentCapability]
    priority: int = Field(ge=0, le=10, default=5)
    max_concurrent_tasks: int = 1


class AgentTask(BaseModel):
    task_id: str
    agent_id: str
    operation: str
    input_data: Dict[str, Any]
    status: Literal['pending', 'running', 'completed', 'failed']
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    retry_count: int = 0