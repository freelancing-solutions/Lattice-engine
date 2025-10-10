"""
AI model configuration.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class AIProvider(str, Enum):
    """AI provider types."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"
    AZURE = "azure"
    BEDROCK = "bedrock"


class ModelConfig(BaseModel):
    """Configuration for AI models."""

    provider: AIProvider
    model_name: str
    api_key: Optional[str] = None
    api_base: Optional[str] = None
    api_version: Optional[str] = None
    max_tokens: int = 4000
    temperature: float = 0.1
    timeout: int = 30
    retry_attempts: int = 3
    retry_delay: float = 1.0
    max_retries: int = 3

    class Config:
        from_attributes = True


class AIModelsConfig(BaseModel):
    """Complete AI models configuration."""

    error_analyzer: ModelConfig
    fix_generator: ModelConfig
    code_validator: ModelConfig

    # Fallback models
    fallback_analyzer: Optional[ModelConfig] = None
    fallback_generator: Optional[ModelConfig] = None

    # General settings
    enable_fallback: bool = True
    confidence_threshold: float = 0.7
    max_processing_time: int = 300  # seconds
    cache_enabled: bool = True
    cache_ttl: int = 3600  # seconds

    class Config:
        from_attributes = True


class AIRequest(BaseModel):
    """AI request data."""

    request_type: str  # analyze, fix, validate
    input_data: dict
    context: dict
    user_id: Optional[int] = None
    organization_id: Optional[int] = None
    request_id: Optional[str] = None
    priority: str = "normal"  # low, normal, high, critical
    timeout: Optional[int] = None

    class Config:
        from_attributes = True


class AIResponse(BaseModel):
    """AI response data."""

    success: bool
    result: dict
    processing_time_ms: int
    model_used: str
    provider_used: str
    fallback_used: bool = False
    error: Optional[str] = None
    confidence_score: Optional[float] = None
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True


class AIModelStatus(BaseModel):
    """AI model status."""

    model_name: str
    provider: AIProvider
    status: str  # active, inactive, error, maintenance
    last_used: Optional[str] = None
    avg_response_time_ms: Optional[float] = None
    success_rate: Optional[float] = None
    error_count: int = 0
    quota_usage: Optional[float] = None
    rate_limit_remaining: Optional[int] = None

    class Config:
        from_attributes = True


class AIPromptTemplate(BaseModel):
    """AI prompt template."""

    name: str
    description: str
    system_prompt: str
    user_prompt_template: str
    version: str
    parameters: dict
    model_type: str  # error_analyzer, fix_generator, code_validator

    class Config:
        from_attributes = True


class AIUsageMetrics(BaseModel):
    """AI usage metrics."""

    date: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time_ms: float
    tokens_used: int
    cost_usd: float
    model_usage: dict

    class Config:
        from_attributes = True


# Default configurations
DEFAULT_MODELS_CONFIG = AIModelsConfig(
    error_analyzer=ModelConfig(
        provider=AIProvider.OPENAI,
        model_name="gpt-4",
        max_tokens=2000,
        temperature=0.1,
        timeout=30
    ),
    fix_generator=ModelConfig(
        provider=AIProvider.OPENAI,
        model_name="gpt-4",
        max_tokens=3000,
        temperature=0.2,
        timeout=60
    ),
    code_validator=ModelConfig(
        provider=AIProvider.ANTHROPIC,
        model_name="claude-3-sonnet-20240229",
        max_tokens=1500,
        temperature=0.0,
        timeout=30
    )
)