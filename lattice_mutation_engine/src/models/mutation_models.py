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
    tenant_id: Optional[str] = None
    user_id: Optional[str] = None
    reviews: List[Dict[str, Any]] = []
    deleted: bool = False
    deleted_at: Optional[str] = None


class MutationResult(BaseModel):
    mutation_id: str
    status: Literal['success', 'failed', 'rolled_back']
    applied_changes: Dict[str, Any]
    new_version: str
    validation_errors: List[str] = []
    warnings: List[str] = []
    execution_time_ms: int


class MutationUpdate(BaseModel):
    """Model for updating mutation proposals"""
    operation_type: Optional[Literal[
        'create', 'update', 'delete',
        'merge', 'split', 'refactor'
    ]] = None
    proposed_changes: Optional[Dict[str, Any]] = None
    reasoning: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    impact_analysis: Optional[Dict[str, Any]] = None


class MutationReview(BaseModel):
    """Model for reviewing mutation proposals"""
    reviewer_id: str
    decision: Literal['approve', 'reject', 'request_changes']
    comment: Optional[str] = None
    conditions: Optional[List[str]] = None