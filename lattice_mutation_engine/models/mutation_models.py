from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any


class MutationRequest(BaseModel):
    spec_id: str
    operation_type: Literal[
        'create', 'update', 'delete',
        'merge', 'split', 'refactor'
    ]
    changes: Dict[str, Any]
    reason: str
    initiated_by: str  # user_id or agent_id
    priority: int = 5


class MutationProposal(BaseModel):
    proposal_id: str
    spec_id: str
    operation_type: Literal[
        'create', 'update', 'delete',
        'merge', 'split', 'refactor'
    ]
    current_version: str
    proposed_changes: Dict[str, Any]
    reasoning: str
    confidence: float = Field(ge=0.0, le=1.0)
    impact_analysis: Dict[str, Any] = {}
    requires_approval: bool = True
    affected_specs: List[str] = []


class MutationResult(BaseModel):
    mutation_id: str
    status: Literal['success', 'failed', 'rolled_back']
    applied_changes: Dict[str, Any]
    new_version: str
    validation_errors: List[str] = []
    warnings: List[str] = []
    execution_time_ms: int