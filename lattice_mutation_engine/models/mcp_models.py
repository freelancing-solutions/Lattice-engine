"""
Model Context Protocol (MCP) Models for Lattice Mutation Engine
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class MCPStatus(str, Enum):
    """MCP connection status"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    SYNCING = "syncing"
    ERROR = "error"
    INITIALIZING = "initializing"


class MCPSyncStatus(str, Enum):
    """MCP synchronization status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class MCPServerConfig(BaseModel):
    """MCP server configuration"""
    server_id: str = Field(..., description="Unique MCP server identifier")
    server_name: str = Field(..., description="Human-readable server name")
    endpoint_url: str = Field(..., description="MCP server endpoint URL")
    api_key: Optional[str] = Field(None, description="API key for authentication")
    timeout_seconds: int = Field(default=30, description="Request timeout in seconds")
    retry_attempts: int = Field(default=3, description="Number of retry attempts")
    enabled: bool = Field(default=True, description="Whether the server is enabled")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional server metadata")


class MCPStatusResponse(BaseModel):
    """MCP status response"""
    server_id: str = Field(..., description="MCP server identifier")
    status: MCPStatus = Field(..., description="Current connection status")
    last_sync_at: Optional[datetime] = Field(None, description="Last successful sync timestamp")
    last_error: Optional[str] = Field(None, description="Last error message if any")
    connected_clients: int = Field(default=0, description="Number of connected clients")
    active_contexts: int = Field(default=0, description="Number of active contexts")
    server_info: Optional[Dict[str, Any]] = Field(None, description="Server information")
    version: Optional[str] = Field(None, description="MCP server version")


class MCPSyncRequest(BaseModel):
    """MCP sync request"""
    server_id: str = Field(..., description="MCP server identifier to sync with")
    force_full_sync: bool = Field(default=False, description="Force full synchronization")
    sync_types: Optional[List[str]] = Field(default=None, description="Specific types to sync (None = all)")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional sync metadata")


class MCPSyncResponse(BaseModel):
    """MCP sync response"""
    sync_id: str = Field(..., description="Unique sync operation identifier")
    server_id: str = Field(..., description="MCP server identifier")
    status: MCPSyncStatus = Field(..., description="Sync operation status")
    started_at: datetime = Field(..., description="Sync start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Sync completion timestamp")
    items_synced: int = Field(default=0, description="Number of items synchronized")
    items_failed: int = Field(default=0, description="Number of items that failed to sync")
    error_message: Optional[str] = Field(None, description="Error message if sync failed")
    warnings: Optional[List[str]] = Field(default_factory=list, description="Sync warnings")


class MCPContext(BaseModel):
    """MCP context information"""
    context_id: str = Field(..., description="Unique context identifier")
    context_type: str = Field(..., description="Type of context (e.g., 'spec', 'mutation', 'deployment')")
    content: Dict[str, Any] = Field(..., description="Context content")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context metadata")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Context creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")


class MCPHealthCheck(BaseModel):
    """MCP health check response"""
    status: str = Field(..., description="Overall health status")
    server_status: MCPStatus = Field(..., description="Server connection status")
    last_health_check: datetime = Field(..., description="Last health check timestamp")
    checks: Dict[str, bool] = Field(default_factory=dict, description="Individual health check results")
    response_time_ms: Optional[int] = Field(None, description="Response time in milliseconds")