"""
Deployment API Endpoints for Lattice Mutation Engine
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from typing import Optional, List
import logging
import uuid
from datetime import datetime, timedelta
import asyncio

from src.models.deployment_models import (
    DeploymentRequest,
    DeploymentResponse,
    DeploymentListResponse,
    DeploymentStatusResponse,
    DeploymentRollbackRequest,
    DeploymentStatus,
    DeploymentEnvironment,
    DeploymentStrategy
)
from src.auth import verify_api_key, get_current_user, TenantContext

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/deployments", tags=["deployments"])

# In-memory storage for deployments
deployments_store: Dict[str, DeploymentResponse] = {}


def _validate_deployment_request(request: DeploymentRequest) -> None:
    """Validate deployment request parameters"""
    if not request.mutation_id or not request.mutation_id.strip():
        raise HTTPException(status_code=400, detail="Mutation ID is required")
    
    if not request.spec_id or not request.spec_id.strip():
        raise HTTPException(status_code=400, detail="Spec ID is required")
    
    if request.environment not in DeploymentEnvironment:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid environment. Must be one of: {[e.value for e in DeploymentEnvironment]}"
        )
    
    if request.strategy not in DeploymentStrategy:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid strategy. Must be one of: {[s.value for s in DeploymentStrategy]}"
        )


def _get_components():
    from src.api.endpoints import components
    return components


@router.post("/", response_model=DeploymentResponse)
async def create_deployment(
    request: DeploymentRequest,
    background_tasks: BackgroundTasks,
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Create a new deployment"""
    try:
        # Validate request
        _validate_deployment_request(request)
        
        # Check permissions
        if not current_user.has_permission("deployment:create"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Validate mutation exists
        components = _get_components()
        repo = components.get("repository")
        if not repo:
            raise HTTPException(status_code=503, detail="Repository service unavailable")
        
        mutation = repo.get_node(request.mutation_id)
        if not mutation:
            raise HTTPException(status_code=404, detail="Mutation not found")
        
        # Validate spec exists
        spec = repo.get_node(request.spec_id)
        if not spec:
            raise HTTPException(status_code=404, detail="Spec not found")
        
        # Check if deployment already exists for this mutation
        existing_deployments = [
            d for d in deployments_store.values() 
            if d.mutation_id == request.mutation_id and d.status in [DeploymentStatus.PENDING, DeploymentStatus.RUNNING]
        ]
        if existing_deployments:
            raise HTTPException(
                status_code=409, 
                detail=f"Active deployment already exists for mutation {request.mutation_id}"
            )
        
        # Create deployment
        deployment_id = str(uuid.uuid4())
        deployment = DeploymentResponse(
            deployment_id=deployment_id,
            mutation_id=request.mutation_id,
            spec_id=request.spec_id,
            environment=request.environment,
            strategy=request.strategy,
            status=DeploymentStatus.PENDING,
            created_at=datetime.utcnow(),
            created_by=current_user.user_id,
            config=request.config
        )
        
        deployments_store[deployment_id] = deployment
        
        # Start deployment in background
        background_tasks.add_task(_execute_deployment, deployment_id, request)
        
        logger.info(f"Deployment {deployment_id} created for mutation {request.mutation_id}")
        
        return deployment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating deployment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create deployment: {str(e)}")


@router.get("/", response_model=DeploymentListResponse)
async def list_deployments(
    environment: Optional[str] = Query(None, description="Filter by environment"),
    status: Optional[str] = Query(None, description="Filter by deployment status"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """List deployments with optional filtering"""
    try:
        if not current_user.has_permission("deployment:read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Filter deployments
        deployments = list(deployments_store.values())
        
        if environment:
            if environment not in [e.value for e in DeploymentEnvironment]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid environment. Must be one of: {[e.value for e in DeploymentEnvironment]}"
                )
            deployments = [d for d in deployments if d.environment == environment]
        
        if status:
            if status not in [s.value for s in DeploymentStatus]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid status. Must be one of: {[s.value for s in DeploymentStatus]}"
                )
            deployments = [d for d in deployments if d.status == status]
        
        # Apply pagination
        total = len(deployments)
        deployments = deployments[offset:offset + limit]
        
        return DeploymentListResponse(
            deployments=deployments,
            total=total,
            limit=limit,
            offset=offset
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing deployments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list deployments: {str(e)}")


@router.get("/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(
    deployment_id: str,
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Get deployment details"""
    try:
        if not current_user.has_permission("deployment:read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        if not deployment_id or not deployment_id.strip():
            raise HTTPException(status_code=400, detail="Deployment ID is required")
        
        deployment = deployments_store.get(deployment_id)
        if not deployment:
            raise HTTPException(status_code=404, detail="Deployment not found")
        
        return deployment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting deployment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get deployment: {str(e)}")


@router.get("/{deployment_id}/status", response_model=DeploymentStatusResponse)
async def get_deployment_status(
    deployment_id: str,
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Get deployment status with progress information"""
    try:
        if not current_user.has_permission("deployment:read"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        if not deployment_id or not deployment_id.strip():
            raise HTTPException(status_code=400, detail="Deployment ID is required")
        
        deployment = deployments_store.get(deployment_id)
        if not deployment:
            raise HTTPException(status_code=404, detail="Deployment not found")
        
        # Calculate progress and estimated time remaining
        progress = _calculate_deployment_progress(deployment)
        estimated_remaining_seconds = _estimate_remaining_time(deployment, progress)
        
        return DeploymentStatusResponse(
            deployment_id=deployment_id,
            status=deployment.status,
            progress_percentage=progress,
            current_step="deployment_in_progress",  # Simplified
            estimated_remaining_seconds=estimated_remaining_seconds,
            started_at=deployment.created_at,
            completed_at=deployment.completed_at,
            error_message=deployment.error_message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting deployment status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get deployment status: {str(e)}")


@router.post("/{deployment_id}/rollback", response_model=DeploymentResponse)
async def rollback_deployment(
    deployment_id: str,
    request: DeploymentRollbackRequest,
    current_user: TenantContext = Depends(get_current_user),
    _auth: bool = Depends(verify_api_key)
):
    """Rollback a deployment"""
    try:
        if not current_user.has_permission("deployment:rollback"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        if not deployment_id or not deployment_id.strip():
            raise HTTPException(status_code=400, detail="Deployment ID is required")
        
        deployment = deployments_store.get(deployment_id)
        if not deployment:
            raise HTTPException(status_code=404, detail="Deployment not found")
        
        # Check if deployment can be rolled back
        if deployment.status not in [DeploymentStatus.COMPLETED, DeploymentStatus.FAILED]:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot rollback deployment in {deployment.status} status"
            )
        
        # Check if rollback reason is provided
        if not request.reason or not request.reason.strip():
            raise HTTPException(status_code=400, detail="Rollback reason is required")
        
        # Create rollback deployment
        rollback_id = str(uuid.uuid4())
        rollback_deployment = DeploymentResponse(
            deployment_id=rollback_id,
            mutation_id=deployment.mutation_id,
            spec_id=deployment.spec_id,
            environment=deployment.environment,
            strategy=DeploymentStrategy.ROLLBACK,
            status=DeploymentStatus.PENDING,
            created_at=datetime.utcnow(),
            created_by=current_user.user_id,
            config=deployment.config,
            rollback_for=deployment_id,
            rollback_reason=request.reason
        )
        
        deployments_store[rollback_id] = rollback_deployment
        
        # Update original deployment
        deployment.rollback_id = rollback_id
        
        logger.info(f"Rollback deployment {rollback_id} created for deployment {deployment_id}")
        
        return rollback_deployment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rolling back deployment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to rollback deployment: {str(e)}")


def _calculate_deployment_progress(deployment: DeploymentResponse) -> float:
    """Calculate deployment progress percentage"""
    if deployment.status == DeploymentStatus.COMPLETED:
        return 100.0
    elif deployment.status == DeploymentStatus.FAILED:
        return 0.0
    elif deployment.status == DeploymentStatus.PENDING:
        return 0.0
    elif deployment.status == DeploymentStatus.RUNNING:
        # Simplified progress calculation based on time elapsed
        time_elapsed = (datetime.utcnow() - deployment.created_at).total_seconds()
        estimated_duration = 300  # 5 minutes estimated
        progress = min((time_elapsed / estimated_duration) * 100, 95.0)  # Cap at 95% while running
        return progress
    else:
        return 0.0


def _estimate_remaining_time(deployment: DeploymentResponse, progress: float) -> Optional[int]:
    """Estimate remaining time in seconds"""
    if deployment.status == DeploymentStatus.RUNNING and progress > 0:
        time_elapsed = (datetime.utcnow() - deployment.created_at).total_seconds()
        estimated_total_time = time_elapsed / (progress / 100)
        remaining_time = max(0, int(estimated_total_time - time_elapsed))
        return remaining_time
    return None


async def _execute_deployment(deployment_id: str, request: DeploymentRequest):
    """Execute deployment in background"""
    try:
        deployment = deployments_store.get(deployment_id)
        if not deployment:
            logger.error(f"Deployment {deployment_id} not found for execution")
            return
        
        # Update status to running
        deployment.status = DeploymentStatus.RUNNING
        deployment.started_at = datetime.utcnow()
        
        logger.info(f"Starting deployment {deployment_id}")
        
        # Simulate deployment steps
        steps = [
            "Validating environment",
            "Preparing infrastructure",
            "Deploying changes",
            "Running health checks",
            "Finalizing deployment"
        ]
        
        for i, step in enumerate(steps):
            logger.info(f"Deployment {deployment_id}: {step}")
            await asyncio.sleep(2)  # Simulate work
            
            # Simulate occasional failures (10% chance)
            if i == 3 and deployment_id.endswith('1'):  # Simulate failure for specific deployments
                deployment.status = DeploymentStatus.FAILED
                deployment.error_message = "Health check failed"
                deployment.completed_at = datetime.utcnow()
                logger.error(f"Deployment {deployment_id} failed: {deployment.error_message}")
                return
        
        # Deployment completed successfully
        deployment.status = DeploymentStatus.COMPLETED
        deployment.completed_at = datetime.utcnow()
        
        logger.info(f"Deployment {deployment_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Error executing deployment {deployment_id}: {str(e)}")
        if deployment:
            deployment.status = DeploymentStatus.FAILED
            deployment.error_message = str(e)
            deployment.completed_at = datetime.utcnow()