"""
Agent Management API Endpoints for Lattice Engine

This module provides comprehensive CRUD operations for agent management,
including agent lifecycle, performance tracking, and metrics visualization.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from src.models.agent_crud_models import (
    Agent, AgentCreate, AgentUpdate, AgentWithMetrics, AgentPerformanceMetric,
    AgentTable, AgentPerformanceMetricTable, ListResponse, calculate_performance
)
from src.models.agent_models import AgentType, AgentStatus
from src.models.user_models import UserRole
from src.core.database import get_db
from src.core.dependencies import get_orchestrator
from src.auth.middleware import get_current_user, TenantContext, require_organization_access
from src.agents.agent_service import AgentService


# Create router with prefix and tags
router = APIRouter(
    prefix="/api/agents",
    tags=["agents"]
)


# Helper functions
def _check_agent_permission(
    current_user: TenantContext,
    required_permission: str,
    resource_owner_id: Optional[str] = None
):
    """Check if user has required permission for agent operations."""
    # Get user permissions based on role
    user_permissions = _get_user_permissions(current_user.role)

    if required_permission not in user_permissions:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient permissions. Required: {required_permission}"
        )


def _get_user_permissions(role: UserRole) -> List[str]:
    """Get permissions based on user role."""
    permissions = {
        UserRole.OWNER: [
            "agents:read", "agents:write", "agents:delete", "agents:manage"
        ],
        UserRole.ADMIN: [
            "agents:read", "agents:write", "agents:delete"
        ],
        UserRole.MANAGER: [
            "agents:read", "agents:write"
        ],
        UserRole.DEVELOPER: [
            "agents:read"
        ],
        UserRole.VIEWER: [
            "agents:read"
        ]
    }
    return permissions.get(role, [])


def _agent_to_dict(agent: AgentTable) -> Dict[str, Any]:
    """Convert AgentTable to dictionary for response serialization."""
    return {
        "id": str(agent.id),
        "organization_id": str(agent.organization_id),
        "name": agent.name,
        "description": agent.description,
        "type": agent.type.value,
        "status": agent.status.value,
        "configuration": agent.configuration,
        "created_by": str(agent.created_by),
        "created_at": agent.created_at.isoformat(),
        "updated_at": agent.updated_at.isoformat(),
        "last_activity_at": agent.last_activity_at.isoformat() if agent.last_activity_at else None,
        "is_system_agent": agent.is_system_agent
    }


# Endpoints
@router.get("/", response_model=Dict[str, Any])
async def list_agents(
    type: Optional[AgentType] = Query(None, description="Filter by agent type"),
    status: Optional[AgentStatus] = Query(None, description="Filter by agent status"),
    limit: int = Query(50, ge=1, le=100, description="Number of agents to return"),
    offset: int = Query(0, ge=0, description="Number of agents to skip"),
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestrator = Depends(get_orchestrator)
):
    """
    List agents for the current organization with optional filtering.

    Requires `agents:read` permission.
    """
    try:
        _check_agent_permission(current_user, "agents:read")

        agent_service = AgentService(db, orchestrator)
        agents = agent_service.list_agents(
            organization_id=str(current_user.organization_id),
            type_filter=type,
            status_filter=status
        )

        # Apply pagination
        total = len(agents)
        paginated_agents = agents[offset:offset + limit]

        return {
            "items": [_agent_to_dict(agent) for agent in paginated_agents],
            "total": total,
            "limit": limit,
            "offset": offset
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list agents: {str(e)}"
        )


@router.post("/", response_model=Dict[str, Any])
async def create_agent(
    agent_data: AgentCreate,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestrator = Depends(get_orchestrator)
):
    """
    Create a new agent.

    Requires `agents:write` permission.
    """
    try:
        _check_agent_permission(current_user, "agents:write")

        # Override organization_id to ensure tenant isolation
        agent_data.organization_id = uuid.UUID(current_user.organization_id)

        agent_service = AgentService(db, orchestrator)
        agent = agent_service.create_agent(
            agent_data=agent_data,
            created_by=current_user.user_id
        )

        return _agent_to_dict(agent)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create agent: {str(e)}"
        )


@router.get("/{agent_id}", response_model=Dict[str, Any])
async def get_agent(
    agent_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestrator = Depends(get_orchestrator)
):
    """
    Get a specific agent by ID.

    Requires `agents:read` permission.
    """
    try:
        _check_agent_permission(current_user, "agents:read")

        agent_service = AgentService(db, orchestrator)
        agent = agent_service.get_agent(
            agent_id=agent_id,
            organization_id=current_user.organization_id
        )

        if not agent:
            raise HTTPException(
                status_code=404,
                detail=f"Agent {agent_id} not found"
            )

        return _agent_to_dict(agent)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get agent: {str(e)}"
        )


@router.put("/{agent_id}", response_model=Dict[str, Any])
async def update_agent(
    agent_id: str,
    updates: AgentUpdate,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestrator = Depends(get_orchestrator)
):
    """
    Update an existing agent.

    Requires `agents:write` permission.
    """
    try:
        _check_agent_permission(current_user, "agents:write")

        agent_service = AgentService(db, orchestrator)
        agent = agent_service.update_agent(
            agent_id=agent_id,
            updates=updates,
            organization_id=current_user.organization_id
        )

        if not agent:
            raise HTTPException(
                status_code=404,
                detail=f"Agent {agent_id} not found"
            )

        return _agent_to_dict(agent)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update agent: {str(e)}"
        )


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: str,
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestrator = Depends(get_orchestrator)
):
    """
    Delete an agent.

    Requires `agents:delete` permission.
    System agents cannot be deleted.
    """
    try:
        _check_agent_permission(current_user, "agents:delete")

        agent_service = AgentService(db, orchestrator)
        success = agent_service.delete_agent(
            agent_id=agent_id,
            organization_id=current_user.organization_id
        )

        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Agent {agent_id} not found or cannot be deleted"
            )

        return {
            "success": True,
            "message": f"Agent {agent_id} deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete agent: {str(e)}"
        )


@router.get("/{agent_id}/performance", response_model=Dict[str, Any])
async def get_agent_performance(
    agent_id: str,
    period: str = Query("30d", description="Time period: 1h, 24h, 7d, 30d"),
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db),
    orchestrator = Depends(get_orchestrator)
):
    """
    Get performance metrics for an agent.

    Requires `agents:read` permission.
    """
    try:
        _check_agent_permission(current_user, "agents:read")

        # Validate period
        valid_periods = ["1h", "24h", "7d", "30d"]
        if period not in valid_periods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid period. Must be one of: {', '.join(valid_periods)}"
            )

        agent_service = AgentService(db, orchestrator)

        # First verify agent exists and user has access
        agent = agent_service.get_agent(
            agent_id=agent_id,
            organization_id=current_user.organization_id
        )

        if not agent:
            raise HTTPException(
                status_code=404,
                detail=f"Agent {agent_id} not found"
            )

        # Get performance metrics
        performance = agent_service.get_agent_performance(
            agent_id=agent_id,
            organization_id=current_user.organization_id,
            period=period
        )

        # Get raw metrics for historical data
        end_time = datetime.utcnow()
        start_time = _calculate_start_time(end_time, period)

        raw_metrics = db.query(AgentPerformanceMetricTable).filter(
            and_(
                AgentPerformanceMetricTable.agent_id == uuid.UUID(agent_id),
                AgentPerformanceMetricTable.organization_id == uuid.UUID(current_user.organization_id),
                AgentPerformanceMetricTable.created_at >= start_time,
                AgentPerformanceMetricTable.created_at <= end_time
            )
        ).order_by(desc(AgentPerformanceMetricTable.created_at)).all()

        return {
            "summary": performance.dict() if performance else None,
            "metrics": [
                {
                    "id": str(metric.id),
                    "agent_id": str(metric.agent_id),
                    "task_id": metric.task_id,
                    "operation": metric.operation,
                    "success": metric.success,
                    "response_time_ms": metric.response_time_ms,
                    "confidence_score": metric.confidence_score,
                    "error_message": metric.error_message,
                    "created_at": metric.created_at.isoformat()
                }
                for metric in raw_metrics
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get agent performance: {str(e)}"
        )


@router.get("/{agent_id}/metrics", response_model=Dict[str, Any])
async def get_agent_metrics(
    agent_id: str,
    limit: int = Query(50, ge=1, le=100, description="Number of metrics to return"),
    offset: int = Query(0, ge=0, description="Number of metrics to skip"),
    current_user: TenantContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get raw performance metrics for an agent with pagination.

    Requires `agents:read` permission.
    """
    try:
        _check_agent_permission(current_user, "agents:read")

        # Query metrics with pagination
        query = db.query(AgentPerformanceMetricTable).filter(
            and_(
                AgentPerformanceMetricTable.agent_id == uuid.UUID(agent_id),
                AgentPerformanceMetricTable.organization_id == uuid.UUID(current_user.organization_id)
            )
        ).order_by(desc(AgentPerformanceMetricTable.created_at))

        total = query.count()
        metrics = query.offset(offset).limit(limit).all()

        return {
            "items": [
                {
                    "id": str(metric.id),
                    "agent_id": str(metric.agent_id),
                    "task_id": metric.task_id,
                    "operation": metric.operation,
                    "success": metric.success,
                    "response_time_ms": metric.response_time_ms,
                    "confidence_score": metric.confidence_score,
                    "error_message": metric.error_message,
                    "created_at": metric.created_at.isoformat()
                }
                for metric in metrics
            ],
            "total": total,
            "limit": limit,
            "offset": offset
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get agent metrics: {str(e)}"
        )


def _calculate_start_time(end_time: datetime, period: str) -> datetime:
    """Calculate start time based on period string."""
    from datetime import timedelta

    if period == '1h':
        return end_time - timedelta(hours=1)
    elif period == '24h':
        return end_time - timedelta(days=1)
    elif period == '7d':
        return end_time - timedelta(days=7)
    elif period == '30d':
        return end_time - timedelta(days=30)
    else:
        # Default to 24h
        return end_time - timedelta(days=1)