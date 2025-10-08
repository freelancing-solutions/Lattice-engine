from pydantic import BaseModel
from typing import Literal, Optional, List, Dict, Any
from datetime import datetime


class ApprovalRequest(BaseModel):
    request_id: str
    proposal_id: str
    user_id: str
    spec_id: str
    mutation_type: str
    current_content: str
    proposed_content: str
    diff: Dict[str, Any]
    reasoning: str
    confidence: float
    impact_analysis: Dict[str, Any]
    priority: Literal['critical', 'high', 'normal', 'low']
    timeout_seconds: int = 300
    created_at: datetime
    expires_at: datetime
    preferred_channel: Literal['vscode', 'web', 'auto'] = 'auto'
    fallback_channels: List[str] = ['web']


class ApprovalResponse(BaseModel):
    request_id: str
    decision: Literal['approved', 'rejected', 'modified']
    modified_content: Optional[str] = None
    user_notes: Optional[str] = None
    responded_via: Literal['vscode', 'web', 'mcp_agent', 'system']
    timestamp: datetime


class WebSocketConnection(BaseModel):
    user_id: str
    client_type: Literal['vscode', 'web', 'cli']
    websocket_id: str
    metadata: Dict[str, Any]
    connected_at: datetime