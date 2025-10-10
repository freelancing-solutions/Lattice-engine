"""
API v1 router setup.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    errors,
    fixes,
    projects,
    analytics,
    health,
    webhooks,
)

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(errors.router, prefix="/errors", tags=["Errors"])
api_router.include_router(fixes.router, prefix="/fixes", tags=["Fixes"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])