"""
Fix endpoints for the BugSage API
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.fix_service import FixService
from app.schemas.fix import (
    FixCreate,
    FixUpdate,
    FixResponse,
    FixListResponse,
    FixApplicationRequest,
    FixApplicationResponse,
    FixStatisticsResponse
)
from app.core.exceptions import (
    FixNotFoundError,
    FixAlreadyAppliedError,
    FixNotApplicableError,
    ValidationError
)
from app.core.logger import logger

router = APIRouter()


@router.post("/", response_model=FixResponse)
async def create_fix(
    fix_data: FixCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new fix"""
    try:
        service = FixService(db)
        return await service.create_fix(fix_data)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating fix: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=FixListResponse)
async def get_fixes(
    error_id: Optional[int] = Query(None, description="Filter by error ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    min_confidence: Optional[float] = Query(None, ge=0, le=1, description="Minimum confidence score"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: AsyncSession = Depends(get_db)
):
    """Get fixes with filtering"""
    try:
        service = FixService(db)
        return await service.get_fixes(
            error_id=error_id,
            status=status,
            risk_level=risk_level,
            min_confidence=min_confidence,
            tag=tag,
            skip=skip,
            limit=limit
        )
    except Exception as e:
        logger.error(f"Error getting fixes: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{fix_id}", response_model=FixResponse)
async def get_fix(
    fix_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific fix by ID"""
    try:
        service = FixService(db)
        return await service.get_fix(fix_id)
    except FixNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting fix: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{fix_id}", response_model=FixResponse)
async def update_fix(
    fix_id: int,
    fix_data: FixUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a fix record"""
    try:
        service = FixService(db)
        return await service.update_fix(fix_id, fix_data)
    except FixNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating fix: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{fix_id}")
async def delete_fix(
    fix_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a fix record"""
    try:
        service = FixService(db)
        await service.delete_fix(fix_id)
        return {"message": "Fix deleted successfully"}
    except FixNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting fix: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{fix_id}/apply", response_model=FixApplicationResponse)
async def apply_fix(
    fix_id: int,
    application_data: FixApplicationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Apply a fix to resolve an error"""
    try:
        service = FixService(db)
        return await service.apply_fix(fix_id, application_data)
    except FixNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except FixAlreadyAppliedError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except FixNotApplicableError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error applying fix: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{fix_id}/reject", response_model=FixResponse)
async def reject_fix(
    fix_id: int,
    rejection_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Reject a fix"""
    try:
        rejection_reason = rejection_data.get("reason")
        rejected_by = rejection_data.get("rejected_by")

        if not rejection_reason or not rejected_by:
            raise HTTPException(status_code=400, detail="Reason and rejected_by are required")

        service = FixService(db)
        return await service.reject_fix(fix_id, rejection_reason, rejected_by)
    except FixNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error rejecting fix: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/statistics/overview", response_model=FixStatisticsResponse)
async def get_fix_statistics(
    error_id: Optional[int] = Query(None, description="Filter by error ID"),
    db: AsyncSession = Depends(get_db)
):
    """Get fix statistics"""
    try:
        service = FixService(db)
        return await service.get_fix_statistics(error_id=error_id)
    except Exception as e:
        logger.error(f"Error getting fix statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/search", response_model=FixListResponse)
async def search_fixes(
    q: str = Query(..., min_length=1, description="Search query"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: AsyncSession = Depends(get_db)
):
    """Search fixes by text query"""
    try:
        service = FixService(db)
        return await service.search_fixes(q, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error searching fixes: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{fix_id}/similar", response_model=List[FixResponse])
async def get_similar_fixes(
    fix_id: int,
    limit: int = Query(10, ge=1, le=100, description="Maximum number of similar fixes"),
    db: AsyncSession = Depends(get_db)
):
    """Get similar fixes based on error patterns"""
    try:
        service = FixService(db)
        return await service.get_similar_fixes(fix_id, limit=limit)
    except FixNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting similar fixes: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")