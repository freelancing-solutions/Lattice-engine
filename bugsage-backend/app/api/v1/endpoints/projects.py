"""
Project endpoints for the BugSage API
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.project_service import ProjectService
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    ProjectStatisticsResponse
)
from app.core.exceptions import (
    ProjectNotFoundError,
    ProjectAlreadyExistsError,
    ValidationError
)
from app.core.logger import logger

router = APIRouter()


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new project"""
    try:
        service = ProjectService(db)
        return await service.create_project(project_data)
    except ProjectAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating project: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=ProjectListResponse)
async def get_projects(
    owner_id: Optional[int] = Query(None, description="Filter by owner ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    tech_stack: Optional[str] = Query(None, description="Filter by technology stack"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: AsyncSession = Depends(get_db)
):
    """Get projects with filtering"""
    try:
        service = ProjectService(db)
        return await service.get_projects(
            owner_id=owner_id,
            is_active=is_active,
            tech_stack=tech_stack,
            skip=skip,
            limit=limit
        )
    except Exception as e:
        logger.error(f"Error getting projects: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific project by ID"""
    try:
        service = ProjectService(db)
        return await service.get_project(project_id)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting project: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/name/{name}", response_model=ProjectResponse)
async def get_project_by_name(
    name: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific project by name"""
    try:
        service = ProjectService(db)
        return await service.get_project_by_name(name)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting project by name: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update project record"""
    try:
        service = ProjectService(db)
        return await service.update_project(project_id, project_data)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ProjectAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating project: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete project"""
    try:
        service = ProjectService(db)
        await service.delete_project(project_id)
        return {"message": "Project deleted successfully"}
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting project: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{project_id}/statistics", response_model=ProjectStatisticsResponse)
async def get_project_statistics(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get project statistics"""
    try:
        service = ProjectService(db)
        return await service.get_project_statistics(project_id=project_id)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting project statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/statistics/overview", response_model=ProjectStatisticsResponse)
async def get_all_projects_statistics(db: AsyncSession = Depends(get_db)):
    """Get overall project statistics"""
    try:
        service = ProjectService(db)
        return await service.get_project_statistics()
    except Exception as e:
        logger.error(f"Error getting projects statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/search", response_model=ProjectListResponse)
async def search_projects(
    q: str = Query(..., min_length=1, description="Search query"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: AsyncSession = Depends(get_db)
):
    """Search projects by text query"""
    try:
        service = ProjectService(db)
        return await service.search_projects(q, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error searching projects: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{project_id}/activity")
async def get_project_activity(
    project_id: int,
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    db: AsyncSession = Depends(get_db)
):
    """Get project activity over time"""
    try:
        service = ProjectService(db)
        return await service.get_project_activity(project_id, days=days)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting project activity: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{project_id}/health")
async def get_project_health(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get project health metrics"""
    try:
        service = ProjectService(db)
        return await service.get_project_health(project_id)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting project health: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")