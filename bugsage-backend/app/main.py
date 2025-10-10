"""
Main FastAPI application entry point.
"""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.database.connection import init_database, close_database
from app.core.exceptions import setup_exception_handlers
from app.core.events import setup_event_handlers
from app.core.middleware import setup_middleware
from app.api.v1.router import api_router
from app.utils.logger import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    setup_logging()
    logging.info("Starting BugSage API...")

    # Initialize database
    await init_database()

    # Setup event handlers
    setup_event_handlers()

    # Initialize AI manager
    from app.ai.agent_manager import get_ai_manager
    ai_manager = get_ai_manager()
    logging.info(f"AI manager initialized with models: {list(ai_manager.get_agent_status().keys())}")

    logging.info("BugSage API started successfully")

    yield

    # Shutdown
    logging.info("Shutting down BugSage API...")
    await close_database()
    logging.info("BugSage API shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.NAME,
    description="AI-powered debugging platform API",
    version=settings.VERSION,
    docs_url=settings.DOCS_URL if settings.DEBUG else None,
    redoc_url=settings.REDOC_URL if settings.DEBUG else None,
    lifespan=lifespan,
)

# Setup middleware
setup_middleware(app)

# Setup exception handlers
setup_exception_handlers(app)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Setup metrics
if settings.ENVIRONMENT != "development":
    instrumentator = Instrumentator(
        should_group_status_codes=False,
        should_group_untemplated=True,
        should_ignore_untemplated=True,
        should_instrument_requests_inprogress=True,
        should_instrument_requests_latency=True,
        excluded_handlers=["/metrics"],
        env_var_name="METRICS_ENABLED",
        inprogress_name="fastapi_inprogress",
        inprogress_labels=True,
    )
    instrumentator.instrument(app).expose(app, include_default=True, should_gzip=True)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.NAME}",
        "version": settings.VERSION,
        "docs": settings.DOCS_URL,
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )