"""
Model Context Protocol (MCP) API Endpoints for Lattice Mutation Engine
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Optional, Dict, Any
import logging
import uuid
from datetime import datetime
import asyncio

from lattice_mutation_engine.models.mcp_models import (
    MCPStatusResponse,
    MCPSyncRequest,
    MCPSyncResponse,
    MCPSyncStatus,
    MCPStatus,
    MCPHealthCheck
)
from lattice_mutation_engine.auth import verify_api_key, get_current_user, TenantContext

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/mcp", tags=["mcp"])

# In-memory storage for MCP servers and sync operations
mcp_servers: Dict[str, Dict[str, Any]] = {}
sync_operations: Dict[str, MCPSyncResponse] = {}


def _get_components():
    from lattice_mutation_engine.api.endpoints import components
    return components


@router.get("/status/{server_id}", response_model=MCPStatusResponse)
async def get_mcp_status(
    server_id: str,
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Get MCP server status"""
    try:
        if not current_user.has_permission("mcp:read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        server_info = mcp_servers.get(server_id)
        if not server_info:
            raise HTTPException(status_code=404, detail="MCP server not found")
        
        return MCPStatusResponse(
            server_id=server_id,
            status=server_info.get("status", MCPStatus.DISCONNECTED),
            last_sync_at=server_info.get("last_sync_at"),
            last_error=server_info.get("last_error"),
            connected_clients=server_info.get("connected_clients", 0),
            active_contexts=server_info.get("active_contexts", 0),
            server_info=server_info.get("server_info", {}),
            version=server_info.get("version")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting MCP status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get MCP status")


@router.post("/sync", response_model=MCPSyncResponse)
async def sync_mcp(
    request: MCPSyncRequest,
    background_tasks: BackgroundTasks,
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Synchronize with MCP server"""
    try:
        if not current_user.has_permission("mcp:write"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        server_info = mcp_servers.get(request.server_id)
        if not server_info:
            raise HTTPException(status_code=404, detail="MCP server not found")
        
        # Create sync operation
        sync_id = str(uuid.uuid4())
        sync_response = MCPSyncResponse(
            sync_id=sync_id,
            server_id=request.server_id,
            status=MCPSyncStatus.IN_PROGRESS,
            started_at=datetime.utcnow()
        )
        
        sync_operations[sync_id] = sync_response
        background_tasks.add_task(_execute_sync, sync_id, request)
        
        return sync_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initiating MCP sync: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initiate sync")


@router.get("/health/{server_id}", response_model=MCPHealthCheck)
async def get_mcp_health(
    server_id: str,
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Get MCP server health status"""
    try:
        if not current_user.has_permission("mcp:read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        server_info = mcp_servers.get(server_id)
        if not server_info:
            raise HTTPException(status_code=404, detail="MCP server not found")
        
        status = server_info.get("status", MCPStatus.DISCONNECTED)
        
        # Perform basic health checks
        checks = {
            "server_responsive": status == MCPStatus.CONNECTED,
            "authentication_valid": True,  # Simplified check
            "context_management_active": server_info.get("active_contexts", 0) > 0,
            "sync_enabled": server_info.get("sync_enabled", True)
        }
        
        overall_status = "healthy" if all(checks.values()) else "unhealthy"
        
        return MCPHealthCheck(
            status=overall_status,
            server_status=status,
            last_health_check=datetime.utcnow(),
            checks=checks,
            response_time_ms=server_info.get("response_time_ms", 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting MCP health: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get MCP health")


@router.post("/servers/{server_id}/register")
async def register_mcp_server(
    server_id: str,
    server_config: Dict[str, Any],
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Register a new MCP server"""
    try:
        if not current_user.has_permission("mcp:admin"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        mcp_servers[server_id] = {
            "server_id": server_id,
            "server_name": server_config.get("server_name", server_id),
            "endpoint_url": server_config.get("endpoint_url", ""),
            "status": MCPStatus.INITIALIZING,
            "connected_clients": 0,
            "active_contexts": 0,
            "sync_enabled": True,
            "registered_at": datetime.utcnow(),
            "last_sync_at": None,
            "last_error": None,
            "server_info": server_config.get("metadata", {}),
            "version": server_config.get("version", "unknown")
        }
        
        return {"message": f"MCP server {server_id} registered successfully"}
        
    except Exception as e:
        logger.error(f"Error registering MCP server: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to register MCP server")


@router.get("/servers")
async def list_mcp_servers(
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """List all registered MCP servers"""
    try:
        if not current_user.has_permission("mcp:read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        servers = []
        for server_id, server_info in mcp_servers.items():
            servers.append({
                "server_id": server_id,
                "server_name": server_info.get("server_name", server_id),
                "status": server_info.get("status", MCPStatus.DISCONNECTED),
                "last_sync_at": server_info.get("last_sync_at"),
                "connected_clients": server_info.get("connected_clients", 0),
                "active_contexts": server_info.get("active_contexts", 0),
                "registered_at": server_info.get("registered_at"),
                "version": server_info.get("version", "unknown")
            })
        
        return {"servers": servers, "total": len(servers)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing MCP servers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list MCP servers")


@router.post("/servers/{server_id}/connect")
async def connect_mcp_server(
    server_id: str,
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Connect to an MCP server"""
    try:
        if not current_user.has_permission("mcp:write"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        server_info = mcp_servers.get(server_id)
        if not server_info:
            raise HTTPException(status_code=404, detail="MCP server not found")
        
        # Simulate connection process
        server_info["status"] = MCPStatus.CONNECTING
        
        # Simulate connection success after delay
        await asyncio.sleep(1)
        
        server_info["status"] = MCPStatus.CONNECTED
        server_info["last_sync_at"] = datetime.utcnow()
        
        return {
            "message": f"MCP server {server_id} connected successfully",
            "status": MCPStatus.CONNECTED
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error connecting to MCP server: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to connect to MCP server")


@router.post("/servers/{server_id}/disconnect")
async def disconnect_mcp_server(
    server_id: str,
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Disconnect from an MCP server"""
    try:
        if not current_user.has_permission("mcp:write"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        server_info = mcp_servers.get(server_id)
        if not server_info:
            raise HTTPException(status_code=404, detail="MCP server not found")
        
        # Update server status
        server_info["status"] = MCPStatus.DISCONNECTED
        server_info["last_sync_at"] = datetime.utcnow()
        
        return {
            "message": f"MCP server {server_id} disconnected successfully",
            "status": MCPStatus.DISCONNECTED
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disconnecting from MCP server: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to disconnect from MCP server")


async def _execute_sync(sync_id: str, request: MCPSyncRequest):
    """Execute MCP sync in background"""
    try:
        sync_response = sync_operations[sync_id]
        
        # Simulate sync work
        await asyncio.sleep(2)
        
        # Update server info
        server_info = mcp_servers.get(request.server_id)
        if server_info:
            server_info["status"] = MCPStatus.SYNCING
            server_info["last_sync_at"] = datetime.utcnow()
        
        # Simulate sync completion
        await asyncio.sleep(1)
        
        sync_response.status = MCPSyncStatus.COMPLETED
        sync_response.completed_at = datetime.utcnow()
        sync_response.items_synced = 10  # Simplified
        sync_response.items_failed = 0
        
        # Update server status
        if server_info:
            server_info["status"] = MCPStatus.CONNECTED
        
    except Exception as e:
        sync_response.status = MCPSyncStatus.FAILED
        sync_response.error_message = str(e)
        sync_response.completed_at = datetime.utcnow()
        
        # Update server error
        server_info = mcp_servers.get(request.server_id)
        if server_info:
            server_info["last_error"] = str(e)