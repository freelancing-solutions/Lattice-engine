from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, WebSocket, Response, Header
from fastapi import WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from .graph_endpoints import router as graph_router
from .spec_endpoints import router as spec_router
from .task_endpoints import router as task_router
from .spec_sync_endpoints import router as spec_sync_router
from typing import Dict, Any, Optional
import json
import asyncio
import uuid
import logging
from datetime import datetime

from ..models.mutation_models import MutationRequest
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

components = {}

# Serve demo static files
app.mount("/demo", StaticFiles(directory="demo"), name="demo")
app.include_router(graph_router)
app.include_router(spec_router)
app.include_router(task_router)
app.include_router(spec_sync_router)


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
    mutation_engine=Depends(get_mutation_engine),
):
    """Propose a mutation with multi-tenant context"""
    try:
        # Add user and organization context to the request
        request_dict = request.dict()
        request_dict.update({
            "user_id": str(current_user.user_id),
            "organization_id": str(current_user.organization_id) if current_user.organization_id else None,
            "project_id": str(current_user.project_id) if current_user.project_id else None
        })
        
        # Check permissions
        if not current_user.has_permission("mutations:write"):
            raise HTTPException(status_code=403, detail="Insufficient permissions to propose mutations")
        
        proposal = await mutation_engine.propose_mutation(request_dict)
        mutations_proposed.inc()
        
        # Execute in background if auto-approved
        if not proposal.requires_approval:
            background_tasks.add_task(
                execute_mutation_workflow_task.delay,
                proposal.proposal_id
            )
        
        return {"status": "proposed", "proposal": proposal.dict()}
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error proposing mutation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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


@app.get("/metrics")
async def metrics():
    content, content_type = metrics_response()
    return Response(content=content, media_type=content_type)