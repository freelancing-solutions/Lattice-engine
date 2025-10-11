from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, WebSocket, Response, Header
from fastapi import APIRouter
from fastapi import WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.api.graph_endpoints import router as graph_router
from src.api.spec_endpoints import router as spec_router
from src.api.task_endpoints import router as task_router
from src.api.spec_sync_endpoints import router as spec_sync_router
from src.api.deployment_endpoints import router as deployment_router
from src.api.mcp_endpoints import router as mcp_router
from typing import Dict, Any, Optional, List
import json
import asyncio
import uuid
import logging
from datetime import datetime
from pydantic import BaseModel

from src.core.dependencies import (
    get_orchestrator,
    get_approval_manager, 
    get_mutation_store,
    get_health_status,
    HealthStatus
)

from src.models.mutation_models import MutationRequest
from src.models.mutation_models import MutationProposal, MutationResult
from src.models.approval_models import ApprovalResponse
from src.utils.errors import ValidationError
from src.main import init_engine, shutdown_engine
from src.config.settings import config as engine_config
from src.observability.metrics import mutations_proposed, websocket_connections, metrics_response
from src.celery_queue.celery_app import make_celery
from src.celery_queue.tasks import execute_mutation_workflow_task
from src.auth import (
    get_current_user, 
    get_current_user_optional, 
    TenantContext, 
    verify_api_key,
    rate_limit,
    init_auth_service
)

logger = logging.getLogger(__name__)

# Response Models
class MutationResponse(BaseModel):
    """Response model for mutation operations"""
    mutation_id: str
    status: str
    message: str
    timestamp: datetime

class MutationListResponse(BaseModel):
    """Response model for listing mutations"""
    mutations: List[Dict[str, Any]]
    total: int

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    timestamp: datetime
    version: str

class RiskAssessmentRequest(BaseModel):
    """Request model for risk assessment"""
    spec_id: str
    operation_type: str
    changes: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None

class RiskAssessmentResponse(BaseModel):
    """Response model for risk assessment"""
    risk_level: str
    confidence: float
    factors: List[str]
    recommendations: List[str]

# FastAPI app configuration
app = FastAPI(
    title="Lattice Mutation Engine API",
    description="API for the Lattice Mutation Engine",
    version="1.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=engine_config.cors_origins.split(",") if hasattr(engine_config, "cors_origins") and engine_config.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global components storage
components = {}

# Static files and router setup
app.mount("/demo", StaticFiles(directory="demo"), name="demo")

# Main API router
api_router = APIRouter(prefix="/api", tags=["api"])

# Include sub-routers
app.include_router(graph_router)
app.include_router(spec_router)
app.include_router(task_router)
app.include_router(spec_sync_router)
app.include_router(deployment_router)
app.include_router(mcp_router)

api_router.include_router(graph_router)
api_router.include_router(spec_router)
api_router.include_router(task_router)
api_router.include_router(spec_sync_router)
api_router.include_router(deployment_router)
api_router.include_router(mcp_router)

# Lifecycle events
@app.on_event("startup")
async def startup_event():
    """Initialize the engine components on startup"""
    logger.info("Starting Lattice Mutation Engine API...")
    try:
        global components
        components = await init_engine()
        
        # Initialize auth service
        await init_auth_service()
        
        # Start background task to keep engine running
        asyncio.create_task(_keep_engine_running())
        
        logger.info("Lattice Mutation Engine API started successfully")
    except Exception as e:
        logger.error(f"Failed to start engine: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Lattice Mutation Engine API...")
    await shutdown_engine(components)

async def _keep_engine_running():
    """Background task to keep the engine running"""
    while True:
        await asyncio.sleep(60)

def verify_api_key_header(x_api_key: Optional[str] = Header(None)):
    """Verify API key from header"""
    return verify_api_key(x_api_key)

# Mutation endpoints
@api_router.post("/mutations/propose", response_model=MutationResponse)
@rate_limit(requests_per_minute=30)
async def propose_mutation(
    request: MutationRequest,
    background_tasks: BackgroundTasks,
    current_user: TenantContext = Depends(get_current_user),
    orchestrator=Depends(get_orchestrator),
    mutation_store=Depends(get_mutation_store),
) -> MutationResponse:
    """Propose a new mutation"""
    try:
        logger.info(f"Received mutation request: {request.operation}")
        
        # Generate unique mutation ID
        mutation_id = str(uuid.uuid4())
        
        # Create mutation proposal
        proposal = MutationProposal(
            mutation_id=mutation_id,
            operation=request.operation,
            target_spec=request.target_spec,
            changes=request.changes,
            context=request.context or {},
            tenant_id=current_user.tenant_id,
            user_id=current_user.user_id,
            timestamp=datetime.utcnow()
        )
        
        # Store the proposal
        mutation_store.store_proposal(proposal)
        
        # Execute mutation workflow in background
        if engine_config.use_celery:
            execute_mutation_workflow_task.delay(
                mutation_id=mutation_id,
                proposal_data=proposal.dict()
            )
        else:
            background_tasks.add_task(
                orchestrator.execute_mutation_workflow,
                proposal
            )
        
        # Update metrics
        mutations_proposed.inc()
        
        logger.info(f"Mutation {mutation_id} queued for processing")
        
        return MutationResponse(
            mutation_id=mutation_id,
            status="queued",
            message="Mutation proposal submitted successfully",
            timestamp=datetime.utcnow()
        )
        
    except ValidationError as e:
        logger.error(f"Validation error in mutation proposal: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing mutation proposal: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/mutations", response_model=MutationListResponse)
async def list_mutations(
    current_user: TenantContext = Depends(get_current_user),
    mutation_store=Depends(get_mutation_store),
    kind: Optional[str] = None,
) -> MutationListResponse:
    """List mutations for the current tenant"""
    try:
        mutations = mutation_store.list_mutations(
            tenant_id=current_user.tenant_id,
            kind=kind
        )
        return MutationListResponse(
            mutations=mutations,
            total=len(mutations)
        )
    except Exception as e:
        logger.error(f"Error listing mutations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/mutations/{identifier}")
async def get_mutation(
    identifier: str,
    current_user: TenantContext = Depends(get_current_user),
    mutation_store=Depends(get_mutation_store),
) -> Dict[str, Any]:
    """Get a specific mutation by ID"""
    try:
        mutation = mutation_store.get_mutation(identifier, current_user.tenant_id)
        if not mutation:
            raise HTTPException(status_code=404, detail="Mutation not found")
        return mutation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting mutation {identifier}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/mutations/{identifier}/status")
async def get_mutation_status(
    identifier: str,
    current_user: TenantContext = Depends(get_current_user),
    mutation_store=Depends(get_mutation_store),
) -> Dict[str, Any]:
    """Get the status of a specific mutation"""
    try:
        status = mutation_store.get_mutation_status(identifier, current_user.tenant_id)
        if not status:
            raise HTTPException(status_code=404, detail="Mutation not found")
        return {"status": status, "mutation_id": identifier}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting mutation status {identifier}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/mutations/risk-assess", response_model=RiskAssessmentResponse)
async def risk_assess(
    payload: RiskAssessmentRequest,
    current_user: TenantContext = Depends(get_current_user),
    orchestrator=Depends(get_orchestrator),
) -> RiskAssessmentResponse:
    """Assess the risk of a proposed mutation"""
    try:
        logger.info(f"Risk assessment request for spec: {payload.spec_id}")
        
        # Perform risk assessment using orchestrator
        assessment = await orchestrator.assess_mutation_risk(
            spec_id=payload.spec_id,
            operation_type=payload.operation_type,
            changes=payload.changes,
            context=payload.context or {},
            tenant_id=current_user.tenant_id
        )
        
        return RiskAssessmentResponse(
            risk_level=assessment.get("risk_level", "unknown"),
            confidence=assessment.get("confidence", 0.0),
            factors=assessment.get("factors", []),
            recommendations=assessment.get("recommendations", [])
        )
        
    except Exception as e:
        logger.error(f"Error in risk assessment: {e}")
        raise HTTPException(status_code=500, detail="Risk assessment failed")

# Approval endpoints
@api_router.post("/approvals/{request_id}/respond")
async def respond_to_approval(
    request_id: str,
    response: ApprovalResponse,
    approval_manager=Depends(get_approval_manager),
) -> Dict[str, str]:
    """Respond to an approval request"""
    try:
        await approval_manager.respond_to_approval(request_id, response)
        return {"status": "success", "message": "Response recorded"}
    except Exception as e:
        logger.error(f"Error responding to approval {request_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/approvals/pending")
async def get_pending_approvals(
    user_id: str, 
    approval_manager=Depends(get_approval_manager)
) -> Dict[str, List[Dict[str, Any]]]:
    """Get pending approvals for a user"""
    try:
        approvals = await approval_manager.get_pending_approvals(user_id)
        return {"pending_approvals": approvals}
    except Exception as e:
        logger.error(f"Error getting pending approvals for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# WebSocket endpoint
@app.websocket("/ws/{user_id}/{client_type}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, client_type: str):
    """WebSocket endpoint for real-time communication"""
    hub = components.get("websocket_hub")
    if not hub:
        await websocket.close(code=1011, reason="WebSocket hub not available")
        return
    
    await websocket.accept()
    websocket_connections.inc()
    
    try:
        await hub.connect(websocket, user_id, client_type)
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                await hub.handle_message(websocket, user_id, message)
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "error": "Invalid JSON format"
                }))
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        websocket_connections.dec()
        await hub.disconnect(websocket, user_id)

# Health and metrics endpoints
@api_router.get("/health", response_model=HealthResponse)
async def health_check(health_status: HealthStatus = Depends(get_health_status)) -> HealthResponse:
    """
    Health check endpoint that provides system status information.
    
    Returns:
        HealthResponse: Current system health status
    """
    return HealthResponse(
        status=health_status.status,
        timestamp=health_status.timestamp,
        version="1.1.0"
    )

@api_router.get("/metrics")
async def metrics() -> Response:
    """Prometheus metrics endpoint"""
    return metrics_response()

# Include the API router
app.include_router(api_router)