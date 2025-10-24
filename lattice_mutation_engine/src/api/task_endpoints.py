from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from src.api.endpoints import verify_api_key
from src.models.task_models import (
    TaskRequestPayload,
    TaskClarificationPayload,
    TaskCompletionPayload,
    TaskStatus,
)


router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_task_manager(components):
    tm = components.get("task_manager")
    if not tm:
        raise HTTPException(status_code=500, detail="Task manager not initialized")
    return tm


@router.get("")
async def list_tasks(
    requester_id: Optional[str] = Query(None, description="Filter by requester ID"),
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    operation: Optional[str] = Query(None, description="Filter by operation type"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    _auth=Depends(verify_api_key)
):
    from src.api.endpoints import components
    tm = get_task_manager(components)

    # Get all tasks for the requester
    all_tasks = tm.list_tasks(requester_id) if requester_id else []

    # Filter by status if provided
    if status:
        all_tasks = [task for task in all_tasks if task.status == status]

    # Filter by operation if provided
    if operation:
        all_tasks = [task for task in all_tasks if task.operation == operation]

    # Apply pagination
    total = len(all_tasks)
    paginated_tasks = all_tasks[offset:offset + limit]

    return {
        "tasks": [task.dict() for task in paginated_tasks],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.post("/request")
async def request_task(payload: TaskRequestPayload, _auth=Depends(verify_api_key)):
    from src.api.endpoints import components
    tm = get_task_manager(components)
    record = tm.request_task(payload)
    return {"status": "requested", "task": record.dict()}


@router.post("/clarify")
async def clarify_task(payload: TaskClarificationPayload, _auth=Depends(verify_api_key)):
    from src.api.endpoints import components
    tm = get_task_manager(components)
    record = tm.clarify_task(payload)
    if not record:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "clarification_requested", "task": record.dict()}


@router.post("/complete")
async def complete_task(payload: TaskCompletionPayload, _auth=Depends(verify_api_key)):
    from src.api.endpoints import components
    tm = get_task_manager(components)
    record = tm.complete_task(payload)
    if not record:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"status": "completed" if payload.success else "failed", "task": record.dict()}


@router.get("/status/{task_id}")
async def task_status(task_id: str, _auth=Depends(verify_api_key)):
    from src.api.endpoints import components
    tm = get_task_manager(components)
    record = tm.get_status(task_id)
    if not record:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"task": record.dict()}