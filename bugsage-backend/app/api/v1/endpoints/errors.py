"""
Error endpoints.
"""

from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_async_session
from app.services.error_service import ErrorService
from app.services.analysis_service import AnalysisService
from app.api.dependencies import get_current_user, get_pagination_params
from app.schemas.error import (
    ErrorCreate,
    ErrorUpdate,
    ErrorListParams,
    ErrorResponse,
    ErrorList,
    ErrorAnalysis,
    ErrorAnalysisResponse,
    ErrorStatistics,
    ErrorMetrics,
    ErrorBulkAction,
    ErrorResolve,
    ErrorAssign,
    ErrorIgnore,
    ErrorWebhook,
    ErrorAlert,
)
from app.schemas.base import PaginatedResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/", response_model=List[ErrorResponse])
async def get_errors(
    params: ErrorListParams = Depends(),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Get errors with filtering and pagination."""
    error_service = ErrorService(db)

    # Apply filters
    filters = {}
    if params.project_id:
        filters["project_id"] = params.project_id
    if params.severity:
        filters["severity"] = params.severity
    if params.status:
        filters["status"] = params.status
    if params.category:
        filters["category"] = params.category
    if params.source:
        filters["source"] = params.source
    if params.environment:
        filters["environment"] = params.environment
    if params.assigned_to_id:
        filters["assigned_to_id"] = params.assigned_to_id
    if params.is_assigned is not None:
        filters["is_assigned"] = params.is_assigned
    if params.has_ai_analysis is not None:
        filters["has_ai_analysis"] = params.has_ai_analysis
    if params.tag:
        filters["tag"] = params.tag

    # Apply date filters
    if params.created_from:
        filters["created_at_from"] = params.created_from
    if params.created_to:
        filters["created_at_to"] = params.created_to

    # Apply search
    if params.search:
        filters["search"] = params.search

    # Get paginated results
    result = await error_service.get_errors(
        skip=params.offset,
        limit=params.size,
        sort_by=params.sort_by,
        sort_order=params.sort_order,
        filters=filters,
    )

    return result.items


@router.get("/count")
async def get_errors_count(
    params: ErrorListParams = Depends(),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Get total count of errors matching filters."""
    error_service = ErrorService(db)

    # Apply same filters as get_errors
    filters = {}
    if params.project_id:
        filters["project_id"] = params.project_id
    if params.severity:
        filters["severity"] = params.severity
    if params.status:
        filters["status"] = params.status
    # ... add other filters as needed

    total = await error_service.get_errors_count(filters)
    return {"total": total}


@router.get("/paginated", response_model=PaginatedResponse)
async def get_errors_paginated(
    params: ErrorListParams = Depends(),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Get paginated errors response."""
    error_service = ErrorService(db)

    # Apply filters
    filters = {}
    if params.project_id:
        filters["project_id"] = params.project_id
    if params.severity:
        filters["severity"] = params.severity
    if params.status:
        filters["status"] = params.status
    if params.search:
        filters["search"] = params.search

    # Get paginated results
    result = await error_service.get_errors(
        skip=params.offset,
        limit=params.size,
        filters=filters,
    )

    return PaginatedResponse.create(
        items=result.items,
        total=result.total,
        page=params.page,
        size=params.size,
    )


@router.get("/{error_id}", response_model=ErrorResponse)
async def get_error(
    error_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Get error by ID."""
    error_service = ErrorService(db)
    error = await error_service.get_error(error_id)
    return error


@router.post("/", response_model=ErrorResponse)
async def create_error(
    error_data: ErrorCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Create a new error."""
    error_service = ErrorService(db)

    # Create error
    error = await error_service.create_error(error_data.dict())

    # Trigger AI analysis in background
    try:
        analysis_service = AnalysisService(db)
        background_tasks.add_task(
            analysis_service.trigger_analysis,
            error_id=error.id,
            user_id=current_user["id"],
        )
    except Exception as e:
        logger.error(f"Failed to trigger analysis: {e}")

    return error


@router.put("/{error_id}", response_model=ErrorResponse)
async def update_error(
    error_id: int,
    error_update: ErrorUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Update error."""
    error_service = ErrorService(db)

    # Check permissions
    error = await error_service.get_error(error_id)
    if error.project_id != current_user["current_organization_id"]:
        # TODO: Check user permissions for project
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update error
    updated_error = await error_service.update_error(error_id, error_update.dict(exclude_unset=True))
    return updated_error


@router.delete("/{error_id}")
async def delete_error(
    error_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Delete error."""
    error_service = ErrorService(db)

    # Check permissions
    error = await error_service.get_error(error_id)
    if error.project_id != current_user["current_organization_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Delete error
    await error_service.delete_error(error_id)
    return {"message": "Error deleted successfully"}


@router.post("/{error_id}/analyze", response_model=ErrorAnalysisResponse)
async def analyze_error(
    error_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Trigger AI analysis for error."""
    error_service = ErrorService(db)
    analysis_service = AnalysisService(db)

    # Get error
    error = await error_service.get_error(error_id)
    if error.project_id != current_user["current_organization_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Trigger analysis
    try:
        analysis_result = await analysis_service.analyze_error(error, current_user["id"])
        return ErrorAnalysisResponse(
            error_id=error_id,
            analysis=analysis_result,
            processing_time_ms=analysis_result.get("processing_time_ms", 0),
            model_used=analysis_result.get("model_used", "unknown"),
            analysis_timestamp=datetime.utcnow(),
        )
    except Exception as e:
        logger.error(f"Failed to analyze error {error_id}: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")


@router.get("/{error_id}/analysis", response_model=ErrorAnalysis)
async def get_error_analysis(
    error_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Get AI analysis for error."""
    error_service = ErrorService(db)

    # Get error
    error = await error_service.get_error(error_id)
    if error.project_id != current_user["current_organization_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if analysis exists
    if not error.ai_analysis:
        raise HTTPException(status_code=404, detail="Analysis not available")

    return ErrorAnalysis(**error.ai_analysis)


@router.post("/{error_id}/resolve")
async def resolve_error(
    error_id: int,
    resolution: ErrorResolve,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Resolve error."""
    error_service = ErrorService(db)

    # Get error
    error = await error_service.get_error(error_id)
    if error.project_id != current_user["current_organization_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Resolve error
    resolved_error = await error_service.resolve_error(
        error_id,
        resolution.dict(),
        current_user["id"]
    )
    return resolved_error


@router.post("/{error_id}/assign")
async def assign_error(
    error_id: int,
    assignment: ErrorAssign,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Assign error to user."""
    error_service = ErrorService(db)

    # Get error
    error = await error_service.get_error(error_id)
    if error.project_id != current_user["current_organization_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Assign error
    assigned_error = await error_service.assign_error(
        error_id,
        assignment.dict(),
        current_user["id"]
    )
    return assigned_error


@router.post("/{error_id}/ignore")
async def ignore_error(
    error_id: int,
    ignore_data: ErrorIgnore,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Ignore error."""
    error_service = ErrorService(db)

    # Get error
    error = await error_service.get_error(error_id)
    if error.project_id != current_user["current_organization_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Ignore error
    ignored_error = await error_service.ignore_error(
        error_id,
        ignore_data.dict(),
        current_user["id"]
    )
    return ignored_error


@router.post("/bulk-action")
async def bulk_action(
    action: ErrorBulkAction,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Perform bulk action on errors."""
    error_service = ErrorService(db)

    # Verify user permissions for all errors
    for error_id in action.error_ids:
        error = await error_service.get_error(error_id)
        if error.project_id != current_user["current_organization_id"]:
            raise HTTPException(
                status_code=403,
                detail=f"Not authorized for error {error_id}"
            )

    # Perform bulk action
    result = await error_service.bulk_action(
        action.error_ids,
        action.action,
        action.params,
        current_user["id"]
    )
    return result


@router.get("/statistics", response_model=ErrorStatistics)
async def get_error_statistics(
    days: int = Query(30, ge=1, le=365, description="Number of days"),
    project_id: Optional[int] = Query(None, description="Project ID filter"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Get error statistics."""
    error_service = ErrorService(db)

    stats = await error_service.get_statistics(
        days=days,
        project_id=project_id or current_user["current_organization_id"]
    )
    return stats


@router.get("/metrics", response_model=List[ErrorMetrics])
async def get_error_metrics(
    days: int = Query(30, ge=1, le=365, description="Number of days"),
    project_id: Optional[int] = Query(None, description="Project ID filter"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Get error metrics over time."""
    error_service = ErrorService(db)

    metrics = await error_service.get_metrics(
        days=days,
        project_id=project_id or current_user["current_organization_id"]
    )
    return metrics


@router.post("/webhook")
async def handle_error_webhook(
    webhook_data: ErrorWebhook,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_async_session),
):
    """Handle error webhook from external services."""
    error_service = ErrorService(db)

    # Process webhook
    try:
        error = await error_service.process_webhook(webhook_data.dict())

        # Trigger AI analysis if applicable
        if error:
            analysis_service = AnalysisService(db)
            background_tasks.add_task(
                analysis_service.trigger_analysis,
                error_id=error.id,
                user_id=None,  # Webhook may not have user context
            )

        return {"status": "processed", "error_id": error.id if error else None}

    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")


@router.post("/alert")
async def create_error_alert(
    alert: ErrorAlert,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Create error alert configuration."""
    # TODO: Implement alert management
    return {"message": "Error alert created successfully", "alert_id": "placeholder"}


@router.get("/export")
async def export_errors(
    format: str = Query("csv", regex="^(csv|json|xlsx)$"),
    filters: str = Query("{}", description="JSON-encoded filters"),
    fields: List[str] = Query([], description="Fields to include"),
    include_code: bool = Query(False, description="Include code snippets"),
    include_tests: bool = Query(True, description="Include test results"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    """Export errors."""
    error_service = ErrorService(db)

    # Parse filters
    try:
        import json
        parsed_filters = json.loads(filters) if filters else {}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid filters JSON")

    # Perform export
    export_data = await error_service.export_errors(
        format=format,
        filters=parsed_filters,
        fields=fields,
        include_code=include_code,
        include_tests=include_tests,
        organization_id=current_user["current_organization_id"]
    )

    return export_data