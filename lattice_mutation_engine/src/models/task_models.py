from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    CLARIFICATION_REQUESTED = "clarification_requested"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskRequestPayload(BaseModel):
    requester_id: str = Field(..., description="ID of the requesting user or client")
    operation: str = Field(..., description="The operation/task to perform (e.g., validate_spec)")
    input_data: Dict[str, Any] = Field(default_factory=dict, description="Task input payload")
    target_agent_type: Optional[str] = Field(
        default=None, description="Optional agent type to route task to (e.g., validator)"
    )
    priority: int = Field(default=5, ge=0, le=10, description="Priority of the task")


class TaskRecord(BaseModel):
    task_id: str
    requester_id: str
    operation: str
    input_data: Dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_agent_id: Optional[str] = None
    target_agent_type: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    clarification_notes: List[Dict[str, Any]] = Field(default_factory=list)


class TaskClarificationPayload(BaseModel):
    task_id: str
    note: str
    from_user_id: Optional[str] = None


class TaskCompletionPayload(BaseModel):
    task_id: str
    success: bool
    result: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None