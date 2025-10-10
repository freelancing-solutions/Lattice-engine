"""
Health check endpoints for the BugSage API
"""
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import get_settings
from app.core.logger import logger

router = APIRouter()


@router.get("/")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "service": "bugsage-api"
    }


@router.get("/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """Detailed health check including dependencies"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "service": "bugsage-api",
        "checks": {}
    }

    # Check database connection
    try:
        result = await db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {
            "status": "healthy",
            "response_time_ms": 0  # Would need to measure actual time
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"

    # Check configuration
    try:
        settings = get_settings()
        health_status["checks"]["configuration"] = {
            "status": "healthy",
            "database_url": "configured" if settings.DATABASE_URL else "missing",
            "openai_api_key": "configured" if settings.OPENAI_API_KEY else "missing",
            "anthropic_api_key": "configured" if settings.ANTHROPIC_API_KEY else "missing"
        }
    except Exception as e:
        logger.error(f"Configuration health check failed: {str(e)}")
        health_status["checks"]["configuration"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "unhealthy"

    return health_status


@router.get("/readiness")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Readiness check for Kubernetes/containers"""
    try:
        # Check if database is ready
        result = await db.execute(text("SELECT 1"))

        return {
            "status": "ready",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service not ready")


@router.get("/liveness")
async def liveness_check():
    """Liveness check for Kubernetes/containers"""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/metrics")
async def get_metrics(db: AsyncSession = Depends(get_db)):
    """Basic application metrics"""
    try:
        # Get database row counts for basic metrics
        error_count_query = text("SELECT COUNT(*) FROM errors")
        error_count_result = await db.execute(error_count_query)
        error_count = error_count_result.scalar() or 0

        fix_count_query = text("SELECT COUNT(*) FROM fixes")
        fix_count_result = await db.execute(fix_count_query)
        fix_count = fix_count_result.scalar() or 0

        user_count_query = text("SELECT COUNT(*) FROM users")
        user_count_result = await db.execute(user_count_query)
        user_count = user_count_result.scalar() or 0

        project_count_query = text("SELECT COUNT(*) FROM projects")
        project_count_result = await db.execute(project_count_query)
        project_count = project_count_result.scalar() or 0

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": {
                "errors": {
                    "total": error_count
                },
                "fixes": {
                    "total": fix_count
                },
                "users": {
                    "total": user_count
                },
                "projects": {
                    "total": project_count
                }
            }
        }
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get metrics")