"""
Main API router for the BugSage v1 API
"""
from fastapi import APIRouter

from app.api.v1.endpoints import errors, fixes, users, projects, health

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"]
)

api_router.include_router(
    errors.router,
    prefix="/errors",
    tags=["Errors"]
)

api_router.include_router(
    fixes.router,
    prefix="/fixes",
    tags=["Fixes"]
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)

api_router.include_router(
    projects.router,
    prefix="/projects",
    tags=["Projects"]
)