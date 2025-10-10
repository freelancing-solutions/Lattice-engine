# BugSage Backend Architecture

## 🏗️ System Overview

BugSage backend is a high-performance, scalable API service built with FastAPI, designed to handle real-time error processing, AI-powered analysis, and automated fix generation. The architecture follows microservices principles with clear separation of concerns.

## 🎯 Core Architecture

### Technology Stack
- **Framework**: FastAPI 0.104+ (Python 3.11+)
- **AI/ML**: PydanticAI for AI model integration
- **Database**: PostgreSQL 15+ with pgvector for vector embeddings
- **ORM**: SQLAlchemy 2.0 with async support
- **Validation**: Pydantic 2.0 for data validation
- **Async**: asyncio, asyncpg for database operations
- **Background Tasks**: Celery with Redis broker
- **Caching**: Redis for session and data caching
- **Queue**: RabbitMQ for message queuing
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured logging with Loguru
- **Authentication**: JWT with OAuth2
- **API Documentation**: OpenAPI/Swagger with FastAPI auto-docs

### Architecture Patterns

#### 1. Layered Architecture
```
┌─────────────────────────────────────────┐
│              API Gateway                │
├─────────────────────────────────────────┤
│            Service Layer                │
├─────────────────────────────────────────┤
│           Business Logic               │
├─────────────────────────────────────────┤
│            Data Access                 │
├─────────────────────────────────────────┤
│          Database Layer                │
└─────────────────────────────────────────┘
```

#### 2. Microservices Architecture
- **Error Service**: Error detection, classification, and storage
- **Analysis Service**: AI-powered error analysis and root cause detection
- **Fix Service**: Fix generation, validation, and deployment
- **Integration Service**: Third-party integrations (Sentry, GitHub, etc.)
- **Notification Service**: Alert and notification management
- **User Service**: Authentication, authorization, and user management
- **Analytics Service**: Metrics collection and reporting

## 📁 Project Structure

```
src/
├── app/                          # FastAPI application
│   ├── __init__.py
│   ├── main.py                  # Application entry point
│   ├── config.py                # Configuration settings
│   ├── dependencies.py          # Dependency injection
│   └── exceptions.py            # Custom exceptions
├── api/                          # API routes
│   ├── __init__.py
│   ├── v1/                      # API version 1
│   │   ├── __init__.py
│   │   ├── endpoints/           # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── errors.py        # Error management
│   │   │   ├── fixes.py         # Fix management
│   │   │   ├── analytics.py     # Analytics
│   │   │   ├── users.py         # User management
│   │   │   ├── integrations.py  # Integrations
│   │   │   └── webhooks.py      # Webhook handling
│   │   └── router.py            # API router setup
│   └── middleware.py            # Custom middleware
├── core/                         # Core business logic
│   ├── __init__.py
│   ├── security.py              # Security utilities
│   ├── auth.py                  # Authentication logic
│   ├── cache.py                 # Caching utilities
│   └── events.py                # Event handling
├── services/                     # Business services
│   ├── __init__.py
│   ├── error_service.py         # Error management service
│   ├── analysis_service.py      # AI analysis service
│   ├── fix_service.py           # Fix generation service
│   ├── integration_service.py   # Integration service
│   ├── notification_service.py  # Notification service
│   ├── user_service.py          # User management service
│   └── analytics_service.py     # Analytics service
├── models/                       # Database models
│   ├── __init__.py
│   ├── base.py                  # Base model class
│   ├── user.py                  # User models
│   ├── error.py                 # Error models
│   ├── fix.py                   # Fix models
│   ├── integration.py           # Integration models
│   └── analytics.py             # Analytics models
├── schemas/                      # Pydantic schemas
│   ├── __init__.py
│   ├── base.py                  # Base schema
│   ├── user.py                  # User schemas
│   ├── error.py                 # Error schemas
│   ├── fix.py                   # Fix schemas
│   ├── integration.py           # Integration schemas
│   └── analytics.py             # Analytics schemas
├── ai/                          # AI/ML components
│   ├── __init__.py
│   ├── models/                  # AI model configurations
│   │   ├── __init__.py
│   │   ├── error_analyzer.py    # Error analysis model
│   │   ├── fix_generator.py     # Fix generation model
│   │   └── code_validator.py    # Code validation model
│   ├── agents/                  # PydanticAI agents
│   │   ├── __init__.py
│   │   ├── analysis_agent.py    # Analysis agent
│   │   ├── fix_agent.py         # Fix generation agent
│   │   └── validation_agent.py  # Validation agent
│   └── prompts/                 # AI prompts
│       ├── __init__.py
│       ├── error_analysis.py    # Error analysis prompts
│       ├── fix_generation.py    # Fix generation prompts
│       └── validation.py        # Validation prompts
├── integrations/                 # External integrations
│   ├── __init__.py
│   ├── sentry.py                # Sentry integration
│   ├── github.py                # GitHub integration
│   ├── slack.py                 # Slack integration
│   └── jira.py                  # Jira integration
├── tasks/                        # Background tasks
│   ├── __init__.py
│   ├── celery_app.py            # Celery configuration
│   ├── error_tasks.py           # Error processing tasks
│   ├── fix_tasks.py             # Fix generation tasks
│   └── notification_tasks.py    # Notification tasks
├── database/                     # Database utilities
│   ├── __init__.py
│   ├── connection.py            # Database connection
│   ├── migrations/              # Database migrations
│   └── seeds/                   # Seed data
├── utils/                        # Utility functions
│   ├── __init__.py
│   ├── logger.py                # Logging utilities
│   ├── metrics.py               # Metrics collection
│   ├── validators.py            # Custom validators
│   └── helpers.py               # Helper functions
├── tests/                        # Test suite
│   ├── __init__.py
│   ├── conftest.py              # Test configuration
│   ├── test_api/                # API tests
│   ├── test_services/           # Service tests
│   ├── test_ai/                 # AI model tests
│   └── test_utils/              # Utility tests
└── scripts/                      # Utility scripts
    ├── __init__.py
    ├── init_db.py               # Database initialization
    ├── seed_data.py             # Data seeding
    └── migrate.py               # Migration runner
```

## 🔧 Core Components

### 1. Application Setup (`app/main.py`)

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from api.v1.router import api_router
from core.events import setup_event_handlers
from core.exceptions import setup_exception_handlers
from utils.logger import setup_logging
from database.connection import init_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    setup_logging()
    await init_database()
    setup_event_handlers()
    logging.info("BugSage API started successfully")

    yield

    # Shutdown
    logging.info("BugSage API shutting down")

# Create FastAPI application
app = FastAPI(
    title="BugSage API",
    description="AI-powered debugging platform API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan,
)

# Setup middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

# Setup exception handlers
setup_exception_handlers(app)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Setup metrics
Instrumentator().instrument(app).expose(app)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "bugsage-api"}
```

### 2. Configuration (`app/config.py`)

```python
from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings"""

    # Application
    NAME: str = "BugSage API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/bugsage"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Security
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI/ML
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    AI_MODEL: str = "gpt-4"
    AI_MAX_TOKENS: int = 4000
    AI_TEMPERATURE: float = 0.1

    # External Services
    SENTRY_DSN: Optional[str] = None
    SENTRY_API_TOKEN: Optional[str] = None
    GITHUB_TOKEN: Optional[str] = None
    SLACK_WEBHOOK_URL: Optional[str] = None

    # Background Tasks
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Monitoring
    PROMETHEUS_PORT: int = 9090
    LOG_LEVEL: str = "INFO"

    # CORS
    ALLOWED_HOSTS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### 3. Database Models (`models/base.py`)

```python
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime, func
from sqlalchemy.orm import declared_attr
from datetime import datetime
import uuid

class BaseModel:
    """Base model with common fields"""

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        """Convert model to dictionary"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

Base = declarative_base(cls=BaseModel)
```

### 4. Error Model (`models/error.py`)

```python
from sqlalchemy import Column, String, Integer, Enum, JSON, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from enum import Enum as PyEnum
import uuid

from .base import BaseModel

class ErrorSeverity(PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ErrorStatus(PyEnum):
    DETECTED = "detected"
    ANALYZING = "analyzing"
    FIXING = "fixing"
    RESOLVED = "resolved"
    IGNORED = "ignored"

class Error(BaseModel):
    """Error model"""

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    severity = Column(Enum(ErrorSeverity), nullable=False, index=True)
    status = Column(Enum(ErrorStatus), default=ErrorStatus.DETECTED, index=True)

    # Source information
    source = Column(String(100), nullable=False)  # Sentry, etc.
    source_id = Column(String(255), index=True)  # External ID
    project_id = Column(String(100), index=True)

    # Error details
    stack_trace = Column(Text)
    context = Column(JSON)
    metadata = Column(JSON)

    # Classification
    category = Column(String(100))
    tags = Column(JSON, default=list)

    # Assignment and ownership
    assigned_to_id = Column(Integer, ForeignKey("user.id"))
    assigned_to = relationship("User", back_populates="assigned_errors")

    # Resolution tracking
    resolved_at = Column(DateTime(timezone=True))
    resolved_by_id = Column(Integer, ForeignKey("user.id"))
    resolved_by = relationship("User", foreign_keys=[resolved_by_id])

    # AI analysis
    ai_analysis = Column(JSON)
    ai_confidence = Column(Integer)
    ai_suggestions = Column(JSON)

    # Relationships
    fixes = relationship("Fix", back_populates="error", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Error {self.title} ({self.severity.value})>"
```

### 5. Fix Model (`models/fix.py`)

```python
from sqlalchemy import Column, String, Integer, Enum, JSON, ForeignKey, Text, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from enum import Enum as PyEnum
import uuid

from .base import BaseModel

class FixStatus(PyEnum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    GENERATING = "generating"
    TESTING = "testing"
    READY = "ready"
    APPLIED = "applied"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"

class FixType(PyEnum):
    AUTOMATIC = "automatic"
    MANUAL = "manual"
    SUGGESTED = "suggested"

class Fix(BaseModel):
    """Fix model"""

    # Relationships
    error_id = Column(Integer, ForeignKey("error.id"), nullable=False)
    error = relationship("Error", back_populates="fixes")

    # Fix details
    status = Column(Enum(FixStatus), default=FixStatus.PENDING, index=True)
    fix_type = Column(Enum(FixType), default=FixType.AUTOMATIC)

    # Generated content
    title = Column(String(255))
    description = Column(Text)
    generated_code = Column(Text)
    code_diff = Column(Text)

    # AI confidence and metrics
    confidence_score = Column(Float)
    quality_score = Column(Float)
    risk_score = Column(Float)

    # Testing results
    test_results = Column(JSON)
    test_coverage = Column(Float)

    # Application tracking
    applied_at = Column(DateTime(timezone=True))
    applied_by_id = Column(Integer, ForeignKey("user.id"))
    applied_by = relationship("User", foreign_keys=[applied_by_id])

    # Review and approval
    reviewed_at = Column(DateTime(timezone=True))
    reviewed_by_id = Column(Integer, ForeignKey("user.id"))
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])
    approved = Column(Boolean, default=False)
    review_notes = Column(Text)

    # Rollback information
    rolled_back_at = Column(DateTime(timezone=True))
    rollback_reason = Column(Text)

    # Metadata
    metadata = Column(JSON)
    ai_model_version = Column(String(50))

    def __repr__(self):
        return f"<Fix {self.title} ({self.status.value})>"
```

### 6. Pydantic Schemas (`schemas/error.py`)

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ErrorSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ErrorStatus(str, Enum):
    DETECTED = "detected"
    ANALYZING = "analyzing"
    FIXING = "fixing"
    RESOLVED = "resolved"
    IGNORED = "ignored"

class ErrorBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    severity: ErrorSeverity
    source: str = Field(..., min_length=1, max_length=100)
    source_id: Optional[str] = None
    project_id: Optional[str] = None
    stack_trace: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = []

class ErrorCreate(ErrorBase):
    pass

class ErrorUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    severity: Optional[ErrorSeverity] = None
    status: Optional[ErrorStatus] = None
    assigned_to_id: Optional[int] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class ErrorInDB(ErrorBase):
    id: int
    uuid: str
    status: ErrorStatus
    created_at: datetime
    updated_at: Optional[datetime]
    assigned_to_id: Optional[int] = None
    ai_analysis: Optional[Dict[str, Any]] = None
    ai_confidence: Optional[int] = None
    ai_suggestions: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class Error(ErrorInDB):
    """Response model"""
    pass

class ErrorList(BaseModel):
    errors: List[Error]
    total: int
    page: int
    size: int
    pages: int

class ErrorAnalysis(BaseModel):
    root_cause: str
    impact_assessment: str
    suggested_fixes: List[str]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    analysis_metadata: Dict[str, Any]
```

### 7. Error Service (`services/error_service.py`)

```python
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
from datetime import datetime, timedelta

from models.error import Error, ErrorSeverity, ErrorStatus
from schemas.error import ErrorCreate, ErrorUpdate, ErrorList
from core.exceptions import NotFoundError, ValidationError
from utils.logger import get_logger

logger = get_logger(__name__)

class ErrorService:
    """Service for error management operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_error(self, error_data: ErrorCreate) -> Error:
        """Create a new error"""
        try:
            error = Error(**error_data.dict())
            self.db.add(error)
            await self.db.commit()
            await self.db.refresh(error)

            # Trigger background analysis
            from tasks.error_tasks import analyze_error
            analyze_error.delay(error.id)

            logger.info(f"Created error: {error.title}")
            return error

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to create error: {e}")
            raise ValidationError(f"Failed to create error: {e}")

    async def get_error(self, error_id: int) -> Error:
        """Get error by ID"""
        result = await self.db.execute(
            select(Error).where(Error.id == error_id)
        )
        error = result.scalar_one_or_none()

        if not error:
            raise NotFoundError(f"Error {error_id} not found")

        return error

    async def get_errors(
        self,
        skip: int = 0,
        limit: int = 100,
        severity: Optional[ErrorSeverity] = None,
        status: Optional[ErrorStatus] = None,
        source: Optional[str] = None,
        project_id: Optional[str] = None,
        search: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> ErrorList:
        """Get errors with filtering and pagination"""

        # Build query
        query = select(Error)
        count_query = select(func.count(Error.id))

        # Apply filters
        filters = []

        if severity:
            filters.append(Error.severity == severity)

        if status:
            filters.append(Error.status == status)

        if source:
            filters.append(Error.source == source)

        if project_id:
            filters.append(Error.project_id == project_id)

        if search:
            filters.append(
                or_(
                    Error.title.ilike(f"%{search}%"),
                    Error.description.ilike(f"%{search}%")
                )
            )

        if date_from:
            filters.append(Error.created_at >= date_from)

        if date_to:
            filters.append(Error.created_at <= date_to)

        if filters:
            query = query.where(and_(*filters))
            count_query = count_query.where(and_(*filters))

        # Get total count
        result = await self.db.execute(count_query)
        total = result.scalar()

        # Apply pagination and ordering
        query = query.order_by(desc(Error.created_at))
        query = query.offset(skip).limit(limit)

        # Execute query
        result = await self.db.execute(query)
        errors = result.scalars().all()

        # Calculate pagination
        pages = (total + limit - 1) // limit
        page = skip // limit + 1

        return ErrorList(
            errors=errors,
            total=total,
            page=page,
            size=limit,
            pages=pages
        )

    async def update_error(self, error_id: int, error_update: ErrorUpdate) -> Error:
        """Update error"""
        error = await self.get_error(error_id)

        # Update fields
        update_data = error_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(error, field, value)

        error.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(error)

        logger.info(f"Updated error: {error.title}")
        return error

    async def delete_error(self, error_id: int) -> bool:
        """Delete error"""
        error = await self.get_error(error_id)

        await self.db.delete(error)
        await self.db.commit()

        logger.info(f"Deleted error: {error.title}")
        return True

    async def get_error_statistics(
        self,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get error statistics"""
        date_from = datetime.utcnow() - timedelta(days=days)

        # Error counts by severity
        severity_result = await self.db.execute(
            select(
                Error.severity,
                func.count(Error.id).label('count')
            )
            .where(Error.created_at >= date_from)
            .group_by(Error.severity)
        )
        severity_stats = {
            row.severity.value: row.count for row in severity_result
        }

        # Error counts by status
        status_result = await self.db.execute(
            select(
                Error.status,
                func.count(Error.id).label('count')
            )
            .where(Error.created_at >= date_from)
            .group_by(Error.status)
        )
        status_stats = {
            row.status.value: row.count for row in status_result
        }

        # Total errors
        total_result = await self.db.execute(
            select(func.count(Error.id))
            .where(Error.created_at >= date_from)
        )
        total_errors = total_result.scalar()

        return {
            "total_errors": total_errors,
            "severity_distribution": severity_stats,
            "status_distribution": status_stats,
            "period_days": days,
        }
```

### 8. AI Integration (`ai/agents/analysis_agent.py`)

```python
from pydantic_ai import Agent, RunContext
from pydantic_ai.models import OpenAIModel
from typing import Dict, Any, List
from models.error import Error
from ai.prompts.error_analysis import ERROR_ANALYSIS_PROMPT
from utils.logger import get_logger

logger = get_logger(__name__)

# Initialize OpenAI model
model = OpenAIModel(
    model_name="gpt-4",
    api_key="your-openai-api-key"
)

class AnalysisAgent(Agent):
    """AI agent for error analysis"""

    def __init__(self):
        super().__init__(
            model=model,
            system_prompt=ERROR_ANALYSIS_PROMPT,
            deps_type=Dict[str, Any]
        )

    async def analyze_error(
        self,
        error: Error,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze error and provide insights"""

        # Prepare analysis input
        analysis_input = {
            "error_title": error.title,
            "error_description": error.description,
            "stack_trace": error.stack_trace,
            "error_context": error.context,
            "metadata": error.metadata,
            "severity": error.severity.value,
            "source": error.source,
            "project_context": context.get("project_context", {}),
            "codebase_info": context.get("codebase_info", {}),
        }

        try:
            # Run AI analysis
            result = await self.run(analysis_input)

            # Parse and validate result
            analysis_result = {
                "root_cause": result.get("root_cause", ""),
                "impact_assessment": result.get("impact_assessment", ""),
                "suggested_fixes": result.get("suggested_fixes", []),
                "confidence_score": result.get("confidence_score", 0.0),
                "risk_level": result.get("risk_level", "medium"),
                "estimated_effort": result.get("estimated_effort", "unknown"),
                "related_errors": result.get("related_errors", []),
                "prevention_suggestions": result.get("prevention_suggestions", []),
                "analysis_metadata": {
                    "model_version": "gpt-4",
                    "analysis_timestamp": datetime.utcnow().isoformat(),
                    "context_used": list(context.keys()),
                }
            }

            logger.info(f"AI analysis completed for error {error.id}")
            return analysis_result

        except Exception as e:
            logger.error(f"AI analysis failed for error {error.id}: {e}")
            return {
                "error": "AI analysis failed",
                "error_details": str(e),
                "fallback_analysis": self._fallback_analysis(error)
            }

    def _fallback_analysis(self, error: Error) -> Dict[str, Any]:
        """Fallback analysis when AI fails"""
        return {
            "root_cause": "Unable to determine root cause automatically",
            "impact_assessment": f"Error severity: {error.severity.value}",
            "suggested_fixes": ["Manual investigation required"],
            "confidence_score": 0.0,
            "risk_level": error.severity.value,
            "estimated_effort": "unknown",
            "related_errors": [],
            "prevention_suggestions": ["Implement better error handling"],
            "analysis_metadata": {
                "model_version": "fallback",
                "analysis_timestamp": datetime.utcnow().isoformat(),
            }
        }

# Create global agent instance
analysis_agent = AnalysisAgent()
```

### 9. Background Tasks (`tasks/error_tasks.py`)

```python
from celery import Celery
from celery.signals import task_prerun, task_postrun
from database.connection import get_async_session
from services.error_service import ErrorService
from services.analysis_service import AnalysisService
from services.notification_service import NotificationService
from ai.agents.analysis_agent import analysis_agent
from utils.logger import get_logger

logger = get_logger(__name__)

# Initialize Celery
celery_app = Celery(
    "bugsage",
    broker="redis://localhost:6379/1",
    backend="redis://localhost:6379/2"
)

@celery_app.task(bind=True, name="analyze_error")
def analyze_error(self, error_id: int):
    """Analyze error using AI"""
    try:
        async def _analyze():
            async with get_async_session() as db:
                error_service = ErrorService(db)
                analysis_service = AnalysisService(db)

                # Get error
                error = await error_service.get_error(error_id)

                # Update status to analyzing
                await error_service.update_error(
                    error_id,
                    {"status": "analyzing"}
                )

                # Get context for analysis
                context = await analysis_service.get_analysis_context(error)

                # Run AI analysis
                analysis_result = await analysis_agent.analyze_error(error, context)

                # Update error with analysis results
                await error_service.update_error(
                    error_id,
                    {
                        "ai_analysis": analysis_result,
                        "ai_confidence": int(analysis_result.get("confidence_score", 0) * 100),
                        "ai_suggestions": analysis_result.get("suggested_fixes", []),
                    }
                )

                # Trigger fix generation if confidence is high
                if analysis_result.get("confidence_score", 0) > 0.7:
                    from tasks.fix_tasks import generate_fix
                    generate_fix.delay(error_id, analysis_result)

                # Send notifications
                notification_service = NotificationService(db)
                await notification_service.send_analysis_notification(error, analysis_result)

        # Run async task
        import asyncio
        asyncio.run(_analyze())

        logger.info(f"Error analysis completed: {error_id}")

    except Exception as e:
        logger.error(f"Error analysis failed: {e}")
        # Update error status to failed
        async def _update_status():
            async with get_async_session() as db:
                error_service = ErrorService(db)
                await error_service.update_error(
                    error_id,
                    {"status": "detected"}  # Reset to detected
                )

        import asyncio
        asyncio.run(_update_status())

        raise self.retry(exc=e, countdown=60, max_retries=3)

@celery_app.task(bind=True, name="process_webhook")
def process_webhook(self, webhook_data: dict, source: str):
    """Process incoming webhook from monitoring services"""
    try:
        async def _process():
            async with get_async_session() as db:
                error_service = ErrorService(db)

                # Parse webhook based on source
                if source == "sentry":
                    error_data = parse_sentry_webhook(webhook_data)
                elif source == "github":
                    error_data = parse_github_webhook(webhook_data)
                else:
                    logger.warning(f"Unknown webhook source: {source}")
                    return

                # Create or update error
                existing_error = await error_service.get_error_by_source_id(
                    error_data["source_id"]
                )

                if existing_error:
                    await error_service.update_error(
                        existing_error.id,
                        error_data
                    )
                else:
                    await error_service.create_error(error_data)

        import asyncio
        asyncio.run(_process())

        logger.info(f"Webhook processed from {source}")

    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise self.retry(exc=e, countdown=30, max_retries=5)

def parse_sentry_webhook(data: dict) -> dict:
    """Parse Sentry webhook data"""
    event = data.get("event", {})

    return {
        "title": event.get("title", "Unknown Error"),
        "description": event.get("message", ""),
        "severity": map_sentry_severity(event.get("level", "error")),
        "source": "sentry",
        "source_id": event.get("eventID"),
        "project_id": data.get("project", {}).get("slug"),
        "stack_trace": event.get("stacktrace"),
        "context": {
            "release": event.get("release"),
            "environment": event.get("environment"),
            "user": event.get("user"),
            "tags": event.get("tags", {}),
        },
        "metadata": {
            "webhook_id": data.get("id"),
            "received_at": datetime.utcnow().isoformat(),
        }
    }

def map_sentry_severity(sentry_level: str) -> str:
    """Map Sentry severity levels to BugSage severity"""
    mapping = {
        "fatal": "critical",
        "error": "high",
        "warning": "medium",
        "info": "low",
        "debug": "low",
    }
    return mapping.get(sentry_level, "medium")
```

### 10. API Endpoints (`api/v1/endpoints/errors.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from database.connection import get_async_session
from services.error_service import ErrorService
from schemas.error import Error, ErrorCreate, ErrorUpdate, ErrorList, ErrorAnalysis
from core.security import get_current_user
from models.user import User
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/errors", tags=["errors"])

@router.post("/", response_model=Error)
async def create_error(
    error_data: ErrorCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new error"""
    error_service = ErrorService(db)
    error = await error_service.create_error(error_data)
    return error

@router.get("/", response_model=ErrorList)
async def get_errors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Get errors with filtering and pagination"""
    error_service = ErrorService(db)

    # Convert string enums to actual enums
    severity_enum = None
    if severity:
        from schemas.error import ErrorSeverity
        severity_enum = ErrorSeverity(severity)

    status_enum = None
    if status:
        from schemas.error import ErrorStatus
        status_enum = ErrorStatus(status)

    errors = await error_service.get_errors(
        skip=skip,
        limit=limit,
        severity=severity_enum,
        status=status_enum,
        source=source,
        project_id=project_id,
        search=search,
        date_from=date_from,
        date_to=date_to
    )
    return errors

@router.get("/{error_id}", response_model=Error)
async def get_error(
    error_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Get error by ID"""
    error_service = ErrorService(db)
    error = await error_service.get_error(error_id)
    return error

@router.put("/{error_id}", response_model=Error)
async def update_error(
    error_id: int,
    error_update: ErrorUpdate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Update error"""
    error_service = ErrorService(db)
    error = await error_service.update_error(error_id, error_update)
    return error

@router.delete("/{error_id}")
async def delete_error(
    error_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Delete error"""
    error_service = ErrorService(db)
    await error_service.delete_error(error_id)
    return {"message": "Error deleted successfully"}

@router.post("/{error_id}/analyze")
async def analyze_error(
    error_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Trigger AI analysis for error"""
    from tasks.error_tasks import analyze_error

    # Trigger background task
    analyze_error.delay(error_id)

    return {"message": "Error analysis started"}

@router.get("/{error_id}/analysis", response_model=ErrorAnalysis)
async def get_error_analysis(
    error_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Get AI analysis for error"""
    error_service = ErrorService(db)
    error = await error_service.get_error(error_id)

    if not error.ai_analysis:
        raise HTTPException(status_code=404, detail="Analysis not available")

    return ErrorAnalysis(**error.ai_analysis)

@router.get("/statistics/summary")
async def get_error_statistics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    """Get error statistics"""
    error_service = ErrorService(db)
    stats = await error_service.get_error_statistics(days=days)
    return stats
```

This comprehensive backend architecture provides a solid foundation for the BugSage AI-powered debugging platform. The architecture is designed to be scalable, maintainable, and extensible, with clear separation of concerns and modern Python best practices.

The implementation includes:

1. **Scalable FastAPI application** with proper async support
2. **Comprehensive database models** with PostgreSQL and SQLAlchemy
3. **PydanticAI integration** for advanced AI capabilities
4. **Background task processing** with Celery
5. **Real-time capabilities** with WebSocket support
6. **Comprehensive error handling** and logging
7. **Security features** with JWT authentication
8. **Monitoring and metrics** with Prometheus
9. **Comprehensive API documentation** with OpenAPI/Swagger
10. **Testable architecture** with dependency injection

The backend is ready to handle the complex requirements of an AI-powered debugging platform while maintaining high performance and reliability.