from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class AgentType(str, Enum):
    # Existing orchestration types (for backward compatibility)
    VALIDATOR = "validator"
    DEPENDENCY = "dependency"
    SEMANTIC = "semantic"
    MUTATION = "mutation"
    IMPACT = "impact"
    CONFLICT = "conflict"

    # Documentation types (for API layer)
    SPEC_VALIDATOR = "spec_validator"
    DEPENDENCY_RESOLVER = "dependency_resolver"
    SEMANTIC_COHERENCE = "semantic_coherence"
    MUTATION_GENERATOR = "mutation_generator"
    IMPACT_ANALYZER = "impact_analyzer"
    CONFLICT_RESOLVER = "conflict_resolver"


class AgentStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRAINING = "training"
    ERROR = "error"
    MAINTENANCE = "maintenance"


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


class AgentConfiguration(BaseModel):
    model: str
    temperature: float = Field(ge=0.0, le=1.0, default=0.7)
    max_tokens: int = Field(ge=1, default=4000)
    system_prompt: str
    tools: List[str] = Field(default_factory=list)
    constraints: List[Dict[str, Any]] = Field(default_factory=list)
    triggers: List[Dict[str, Any]] = Field(default_factory=list)


class AgentPerformance(BaseModel):
    success_rate: float = Field(ge=0.0, le=1.0)
    average_response_time: float = Field(ge=0.0)
    total_requests: int = Field(ge=0)
    error_rate: float = Field(ge=0.0, le=1.0)
    confidence_score: Optional[float] = Field(ge=0.0, le=1.0)
    last_activity: Optional[datetime] = None