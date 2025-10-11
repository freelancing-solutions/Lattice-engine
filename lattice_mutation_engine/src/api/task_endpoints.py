from fastapi import APIRouter, Depends, HTTPException

from lattice_mutation_engine.api.endpoints import verify_api_key
from lattice_mutation_engine.models.task_models import (
    TaskRequestPayload,
    TaskClarificationPayload,
    TaskCompletionPayload,
)


router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_task_manager(components):
    tm = components.get("task_manager")
    if not tm:
        raise HTTPException(status_code=500, detail="Task manager not initialized")
    return tm


@router.post("/request")
async def request_task(payload: TaskRequestPayload, _auth=Depends(verify_api_key)):
    from lattice_mutation_engine.api.endpoints import components
    tm = get_task_manager(components)
    record = tm.request_task(payload)
    return {"status": "requested", "task": record.dict()}


@router.post("/clarify")
async def clarify_task(payload: TaskClarificationPayload, _auth=Depends(verify_api_key)):
    from lattice_mutation_engine.api.endpoints import components
    tm = get_task_manager(components)
    record = tm.clarify_task(payload)
    if not record:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "clarification_requested", "task": record.dict()}


@router.post("/complete")
async def complete_task(payload: TaskCompletionPayload, _auth=Depends(verify_api_key)):
    from lattice_mutation_engine.api.endpoints import components
    tm = get_task_manager(components)
    record = tm.complete_task(payload)
    if not record:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "completed" if payload.success else "failed", "task": record.dict()}


@router.get("/status/{task_id}")
async def task_status(task_id: str, _auth=Depends(verify_api_key)):
    from lattice_mutation_engine.api.endpoints import components
    tm = get_task_manager(components)
    record = tm.get_status(task_id)
    if not record:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"task": record.dict()}