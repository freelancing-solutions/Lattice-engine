"""
Application configuration settings.
"""

from typing import List, Optional
from pydantic_settings import BaseSettings, Field
import os


class Settings(BaseSettings):
    """Application settings"""

    # Application
    NAME: str = "BugSage API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")

    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    WORKERS: int = Field(default=1, env="WORKERS")

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:password@localhost/bugsage",
        env="DATABASE_URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=20, env="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=30, env="DATABASE_MAX_OVERFLOW")

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")

    # Security
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        env="SECRET_KEY"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI/ML
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    AI_MODEL: str = Field(default="gpt-4", env="AI_MODEL")
    AI_MAX_TOKENS: int = Field(default=4000, env="AI_MAX_TOKENS")
    AI_TEMPERATURE: float = Field(default=0.1, env="AI_TEMPERATURE")

    # External Services
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    SENTRY_API_TOKEN: Optional[str] = Field(default=None, env="SENTRY_API_TOKEN")
    GITHUB_TOKEN: Optional[str] = Field(default=None, env="GITHUB_TOKEN")
    SLACK_WEBHOOK_URL: Optional[str] = Field(default=None, env="SLACK_WEBHOOK_URL")

    # Background Tasks
    CELERY_BROKER_URL: str = Field(
        default="redis://localhost:6379/1",
        env="CELERY_BROKER_URL"
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://localhost:6379/2",
        env="CELERY_RESULT_BACKEND"
    )

    # Monitoring
    PROMETHEUS_PORT: int = Field(default=9090, env="PROMETHEUS_PORT")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")

    # CORS
    ALLOWED_HOSTS: List[str] = Field(default=["*"], env="ALLOWED_HOSTS")

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_PERIOD: int = Field(default=60, env="RATE_LIMIT_PERIOD")

    # File Upload
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=[".txt", ".log", ".json", ".py", ".js", ".ts"],
        env="ALLOWED_FILE_TYPES"
    )

    # Pagination
    DEFAULT_PAGE_SIZE: int = Field(default=20, env="DEFAULT_PAGE_SIZE")
    MAX_PAGE_SIZE: int = Field(default=100, env="MAX_PAGE_SIZE")

    # Cache
    CACHE_TTL: int = Field(default=300, env="CACHE_TTL")  # 5 minutes
    CACHE_MAX_SIZE: int = Field(default=1000, env="CACHE_MAX_SIZE")

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()


# Database configuration
DATABASE_CONFIG = {
    "pool_size": settings.DATABASE_POOL_SIZE,
    "max_overflow": settings.DATABASE_MAX_OVERFLOW,
    "pool_pre_ping": True,
    "pool_recycle": 3600,
}

# AI Model configuration
AI_MODELS_CONFIG = {
    "error_analyzer": {
        "provider": "openai" if settings.OPENAI_API_KEY else "local",
        "model_name": settings.AI_MODEL,
        "api_key": settings.OPENAI_API_KEY,
        "max_tokens": 2000,
        "temperature": 0.1,
        "timeout": 30,
        "retry_attempts": 3,
        "retry_delay": 1.0,
    },
    "fix_generator": {
        "provider": "openai" if settings.OPENAI_API_KEY else "local",
        "model_name": settings.AI_MODEL,
        "api_key": settings.OPENAI_API_KEY,
        "max_tokens": 3000,
        "temperature": 0.2,
        "timeout": 60,
        "retry_attempts": 3,
        "retry_delay": 1.0,
    },
    "code_validator": {
        "provider": "anthropic" if settings.ANTHROPIC_API_KEY else "openai",
        "model_name": "claude-3-sonnet-20240229" if settings.ANTHROPIC_API_KEY else settings.AI_MODEL,
        "api_key": settings.ANTHROPIC_API_KEY or settings.OPENAI_API_KEY,
        "max_tokens": 1500,
        "temperature": 0.0,
        "timeout": 30,
        "retry_attempts": 3,
        "retry_delay": 1.0,
    }
}

# Celery configuration
CELERY_CONFIG = {
    "broker_url": settings.CELERY_BROKER_URL,
    "result_backend": settings.CELERY_RESULT_BACKEND,
    "task_serializer": "json",
    "accept_content": ["json"],
    "result_serializer": "json",
    "timezone": "UTC",
    "enable_utc": True,
    "task_track_started": True,
    "task_time_limit": 30 * 60,  # 30 minutes
    "task_soft_time_limit": 25 * 60,  # 25 minutes
    "worker_prefetch_multiplier": 1,
    "worker_max_tasks_per_child": 1000,
}