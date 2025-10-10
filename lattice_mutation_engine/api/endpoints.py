from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, WebSocket, Response, Header
from fastapi import APIRouter
from fastapi import WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .graph_endpoints import router as graph_router
from .spec_endpoints import router as spec_router
from .task_endpoints import router as task_router
from .spec_sync_endpoints import router as spec_sync_router
from .deployment_endpoints import router as deployment_router
from .mcp_endpoints import router as mcp_router
from typing import Dict, Any, Optional
import json
import asyncio
import uuid
import logging
from datetime import datetime

from ..models.mutation_models import MutationRequest
from ..models.mutation_models import MutationProposal, MutationResult
from ..models.approval_models import ApprovalResponse
from ..utils.errors import ValidationError
from ..main import init_engine, shutdown_engine
from ..config.settings import config as engine_config
from ..observability.metrics import mutations_proposed, websocket_connections, metrics_response
from ..queue.celery_app import make_celery
from ..queue.tasks import execute_mutation_workflow_task
from ..auth import (
    get_current_user, 
    get_current_user_optional, 
    TenantContext, 
    verify_api_key,
    rate_limit,
    init_auth_service
)


logger = logging.getLogger(__name__)

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

components = {}

# Serve demo static files
app.mount("/demo", StaticFiles(directory="demo"), name="demo")
app.include_router(graph_router)
app.include_router(spec_router)
app.include_router(task_router)
app.include_router(spec_sync_router)
app.include_router(deployment_router)
app.include_router(mcp_router)

# Mirror all routers under '/api' for CLI/extension compatibility
api_router = APIRouter(prefix="/api")
api_router.include_router(graph_router)
api_router.include_router(spec_router)
api_router.include_router(task_router)
api_router.include_router(spec_sync_router)
api_router.include_router(deployment_router)
api_router.include_router(mcp_router)


@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    try:
        # Initialize authentication service
        await init_auth_service()
        
        # Initialize mutation engine
        global components
        components = await init_engine()
        
        # Initialize Celery if configured
        if engine_config.celery_enabled:
            components["celery_app"] = make_celery()
            
        asyncio.create_task(_keep_engine_running())
        logger.info("Lattice Engine API started successfully")
    except Exception as e:
        logger.error(f"Failed to start Lattice Engine API: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    await shutdown_engine(components)


async def _keep_engine_running():
    while True:
        await asyncio.sleep(1)


def get_orchestrator():
    if not components:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    return components["orchestrator"]


def get_websocket_hub():
    if not components:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    return components["websocket_hub"]


def get_approval_manager():
    if not components:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    return components["approval_manager"]


def get_mutation_store():
    if not components:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    return components["mutation_store"]


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if engine_config.api_keys and x_api_key not in engine_config.api_keys:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


@app.post("/mutations/propose")
@rate_limit(requests_per_minute=30)
async def propose_mutation(
    request: MutationRequest,
    background_tasks: BackgroundTasks,
    current_user: TenantContext = Depends(get_current_user),
    orchestrator=Depends(get_orchestrator),
    mutation_store=Depends(get_mutation_store),
):
    """Propose a mutation with multi-tenant context and persist proposal."""
    try:
        # Check permissions
        if not current_user.has_permission("mutations:write"):
            raise HTTPException(status_code=403, detail="Insufficient permissions to propose mutations")

        # Generate a proposal via orchestrator
        proposal: MutationProposal = await orchestrator._generate_proposal(
            spec_id=request.spec_id,
            operation=request.operation_type,
            changes=request.changes,
        )

        # Validate and analyze impact
        validation = await orchestrator._validate_proposal(proposal)
        if not validation.is_valid:
            raise ValidationError("Proposal validation failed")
        impact = await orchestrator._analyze_impact(proposal)
        proposal.impact_analysis = impact

        # Determine approval requirement
        proposal.requires_approval = orchestrator._needs_user_approval(proposal)

        # Persist proposal
        mutation_store.save_proposal(proposal)
        mutations_proposed.inc()

        # Check permissions
        # Execute in background if auto-approved (no approval required)
        if not proposal.requires_approval:
            async def _execute_and_store():
                try:
                    result: MutationResult = await orchestrator.execute_mutation_workflow(
                        spec_id=request.spec_id,
                        operation=request.operation_type,
                        changes=request.changes,
                        user_id=str(current_user.user_id),
                    )
                    mutation_store.save_result(result)
                except Exception as e:
                    logger.error(f"Background mutation workflow failed: {e}")

            asyncio.create_task(_execute_and_store())

        else:
            # Request approval via approval manager
            approval_manager = get_approval_manager()
            await approval_manager.request_approval(
                proposal=proposal,
                user_id=str(current_user.user_id),
                priority="normal",
            )

        return {"status": "proposed", "proposal": proposal.dict()}
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error proposing mutation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Expose propose endpoint under '/api'
api_router.add_api_route("/mutations/propose", propose_mutation, methods=["POST"])


# ------------------- Mutation Query Endpoints -------------------

@api_router.get("/mutations")
async def list_mutations(
    current_user: TenantContext = Depends(get_current_user),
    mutation_store=Depends(get_mutation_store),
    kind: Optional[str] = None,
):
    if not current_user.has_permission("mutations:read"):
        raise HTTPException(status_code=403, detail="Insufficient permissions to read mutations")
    kind = (kind or "proposal").lower()
    if kind == "result":
        return {"results": [r.dict() for r in mutation_store.list_results()]}
    if kind == "all":
        return {
            "proposals": [p.dict() for p in mutation_store.list_proposals()],
            "results": [r.dict() for r in mutation_store.list_results()],
        }
    return {"proposals": [p.dict() for p in mutation_store.list_proposals()]}


@api_router.get("/mutations/{identifier}")
async def get_mutation(
    identifier: str,
    current_user: TenantContext = Depends(get_current_user),
    mutation_store=Depends(get_mutation_store),
):
    if not current_user.has_permission("mutations:read"):
        raise HTTPException(status_code=403, detail="Insufficient permissions to read mutations")
    result = mutation_store.get_result(identifier)
    if result:
        return {"kind": "result", "result": result.dict()}
    proposal = mutation_store.get_proposal(identifier)
    if proposal:
        return {"kind": "proposal", "proposal": proposal.dict()}
    raise HTTPException(status_code=404, detail="Mutation not found")


@api_router.get("/mutations/{identifier}/status")
async def get_mutation_status(
    identifier: str,
    current_user: TenantContext = Depends(get_current_user),
    mutation_store=Depends(get_mutation_store),
):
    if not current_user.has_permission("mutations:read"):
        raise HTTPException(status_code=403, detail="Insufficient permissions to read mutations")
    status = mutation_store.get_status(identifier)
    if status["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Mutation not found")
    return status


# ------------------- Risk Assessment Endpoint -------------------
from pydantic import BaseModel
class RiskAssessmentRequest(BaseModel):
    spec_id: str
    operation_type: str
    changes: Dict[str, Any]
    context: Optional[Dict[str, Any]] = None


@api_router.post("/mutations/risk-assess")
async def risk_assess(
    payload: RiskAssessmentRequest,
    current_user: TenantContext = Depends(get_current_user),
    orchestrator=Depends(get_orchestrator),
):
    if not current_user.has_permission("mutations:read"):
        raise HTTPException(status_code=403, detail="Insufficient permissions to assess risk")

    # Use first registered impact agent
    from ..models.agent_models import AgentType, AgentTask
    impact_ids = orchestrator.agent_types.get(AgentType.IMPACT, [])
    if not impact_ids:
        raise HTTPException(status_code=503, detail="Impact agent not available")
    agent_id = impact_ids[0]
    agent = orchestrator.agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=503, detail="Impact agent not available")

    task = AgentTask(
        task_id=f"task_{datetime.now().timestamp()}",
        agent_id=agent_id,
        operation="analyze_change_impact",
        input_data={
            "proposed_change": payload.changes,
            "current_system": {"spec_id": payload.spec_id},
            "context": payload.context or {},
        },
        status="pending",
        created_at=datetime.now(),
    )

    await agent.assign_task(task)
    while task.status in ["pending", "running"]:
        await asyncio.sleep(0.05)

    if task.status == "failed":
        raise HTTPException(status_code=500, detail=task.error or "Risk assessment failed")
    return {"risk_assessment": task.result}


@app.post("/approvals/{request_id}/respond")
async def respond_to_approval(
    request_id: str,
    response: ApprovalResponse,
    approval_manager=Depends(get_approval_manager),
):
    try:
        result = await approval_manager.handle_response(response)
        return {"status": "processed", "result": result.dict()}
    except Exception as e:
        logger.error(f"Error processing approval response: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Expose approvals respond under '/api'
api_router.add_api_route("/approvals/{request_id}/respond", respond_to_approval, methods=["POST"])


@app.get("/approvals/pending")
async def get_pending_approvals(user_id: str, approval_manager=Depends(get_approval_manager)):
    try:
        pending = [
            req.dict() for req in approval_manager.pending_approvals.values() if req.user_id == user_id
        ]
        return {"pending_approvals": pending}
    except Exception as e:
        logger.error(f"Error getting pending approvals: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Expose approvals pending under '/api'
api_router.add_api_route("/approvals/pending", get_pending_approvals, methods=["GET"])


@app.websocket("/ws/{user_id}/{client_type}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, client_type: str):
    websocket_hub = get_websocket_hub()
    # Simple token-based auth via query parameter 'token'
    token = websocket.query_params.get("token")
    if engine_config.api_keys and token not in engine_config.api_keys:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    websocket_connections.inc()
    websocket_id = str(uuid.uuid4())
    await websocket_hub.register_client(
        user_id=user_id,
        client_type=client_type,
        websocket_id=websocket_id,
        metadata={"connected_at": str(datetime.now())},
        socket=websocket,
    )
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            event = message.get("event")
            payload = message.get("data", {})
            if event == "approval:response":
                response = ApprovalResponse(**payload)
                await components["approval_manager"].handle_response(response)
    except WebSocketDisconnect:
        await websocket_hub.unregister_client(user_id, websocket_id)
        websocket_connections.dec()
        logger.info(f"WebSocket disconnected: {websocket_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "engine_initialized": bool(components)}

# Expose health under '/api'
api_router.add_api_route("/health", health_check, methods=["GET"])


@app.get("/metrics")
async def metrics():
    content, content_type = metrics_response()
    return Response(content=content, media_type=content_type)

# Expose metrics under '/api'
api_router.add_api_route("/metrics", metrics, methods=["GET"])

# Finally include the '/api' router
app.include_router(api_router)