"""
AI agent manager for coordinating AI operations.
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from datetime import datetime
import asyncio
import logging

from app.ai.models.config import AIModelsConfig, ModelConfig, AIRequest, AIResponse
from app.ai.agents.error_analysis_agent import ErrorAnalysisAgent
from app.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class AIRequest:
    """AI request data."""

    request_type: str  # analyze, fix, validate
    input_data: Dict[str, Any]
    context: Dict[str, Any]
    user_id: Optional[int] = None
    organization_id: Optional[int] = None
    request_id: Optional[str] = None
    priority: str = "normal"  # low, normal, high, critical
    timeout: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AIResponse:
    """AI response data."""

    success: bool
    result: Dict[str, Any]
    processing_time_ms: int
    model_used: str
    provider_used: str
    fallback_used: bool = False
    error: Optional[str] = None
    confidence_score: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class AIAgentManager:
    """Manager for AI agents."""

    def __init__(self, config: AIModelsConfig):
        self.config = config
        self._initialize_agents()

    def _initialize_agents(self):
        """Initialize AI agents."""
        try:
            self.error_analyzer = ErrorAnalysisAgent(self.config.error_analyzer)
        except Exception as e:
            logger.error(f"Failed to initialize error analyzer: {e}")
            self.error_analyzer = None

        # Initialize fallback agents if configured
        self.fallback_analyzer = None
        if self.config.fallback_analyzer:
            try:
                self.fallback_analyzer = ErrorAnalysisAgent(self.config.fallback_analyzer)
                logger.info("Fallback analyzer initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize fallback analyzer: {e}")

    async def process_request(self, request: AIRequest) -> AIResponse:
        """Process AI request."""
        start_time = datetime.utcnow()

        try:
            logger.info(f"Processing AI request: {request.request_type}")

            # Route to appropriate agent
            if request.request_type == "analyze":
                result = await self._process_error_analysis(request)
            elif request.request_type == "fix":
                result = await self._process_fix_generation(request)
            elif request.request_type == "validate":
                result = await self._process_code_validation(request)
            else:
                raise ValueError(f"Unknown request type: {request.request_type}")

            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000

            response = AIResponse(
                success=True,
                result=result,
                processing_time_ms=int(processing_time),
                model_used=result.get("metadata", {}).get("model_used", "unknown"),
                provider_used=result.get("metadata", {}).get("provider", "unknown"),
                fallback_used=result.get("fallback_used", False),
                confidence_score=result.get("confidence_score"),
                metadata=result.get("metadata", {}),
            )

            logger.info(f"AI request completed successfully in {processing_time:.2f}ms")
            return response

        except Exception as e:
            logger.error(f"AI request failed: {e}")
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000

            return AIResponse(
                success=False,
                result={},
                processing_time_ms=int(processing_time),
                model_used="none",
                provider_used="none",
                fallback_used=False,
                error=str(e),
            )

    async def _process_error_analysis(self, request: AIRequest) -> Dict[str, Any]:
        """Process error analysis request."""
        if not self.error_analyzer:
            raise RuntimeError("Error analyzer not available")

        fallback = self.fallback_analyzer if self.config.fallback_analyzer and self.config.enable_fallback else None
        return await self.error_analyzer.run_with_fallback(
            request.input_data,
            request.context,
            fallback
        )

    async def _process_fix_generation(self, request: AIRequest) -> Dict[str, Any]:
        """Process fix generation request."""
        # TODO: Implement fix generation agent
        return {
            "error": "Fix generation not yet implemented",
            "fallback_used": True,
        }

    async def _process_code_validation(self, request: AIRequest) -> Dict[str, Any]:
        """Process code validation request."""
        # TODO: Implement code validation agent
        return {
            "error": "Code validation not yet implemented",
            "fallback_used": True,
        }

    async def batch_process(self, requests: List[AIRequest]) -> List[AIResponse]:
        """Process multiple AI requests concurrently."""
        tasks = [self.process_request(request) for request in requests]
        return await asyncio.gather(*tasks)

    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all AI agents."""
        status = {
            "error_analyzer": {
                "model": self.config.error_analyzer.model_name,
                "provider": self.config.error_analyzer.provider.value,
                "status": "active" if self.error_analyzer else "not_initialized",
            },
        }

        # Add fallback analyzer status
        if self.config.fallback_analyzer:
            status["fallback_analyzer"] = {
                "model": self.config.fallback_analyzer.model_name,
                "provider": self.config.fallback_analyzer.provider.value,
                "status": "active" if self.fallback_analyzer else "not_initialized",
            }
        else:
            status["fallback_analyzer"] = {
                "model": None,
                "provider": None,
                "status": "not_configured",
            }

        return status

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on AI agents."""
        health = {
            "status": "healthy",
            "agents": {},
            "config": {
                "fallback_enabled": self.config.enable_fallback,
                "confidence_threshold": self.config.confidence_threshold,
                "max_processing_time": self.config.max_processing_time,
                "cache_enabled": self.config.cache_enabled,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Check error analyzer
        if self.error_analyzer:
            try:
                # Test with a simple request
                test_result = await self.error_analyzer.get_fallback_result(
                    {"title": "test error", "description": "test"},
                    {},
                    "test"
                )
                health["agents"]["error_analyzer"] = {
                    "status": "healthy",
                    "last_check": datetime.utcnow().isoformat(),
                    "test_result": "success",
                }
            except Exception as e:
                health["agents"]["error_analyzer"] = {
                    "status": "unhealthy",
                    "error": str(e),
                    "last_check": datetime.utcnow().isoformat(),
                }
                health["status"] = "degraded"
        else:
            health["agents"]["error_analyzer"] = {
                "status": "not_initialized",
                "last_check": None,
            }
            health["status"] = "degraded"

        # Check fallback analyzer
        if self.fallback_analyzer:
            try:
                test_result = await self.fallback_analyzer.get_fallback_result(
                    {"title": "test error", "description": "test"},
                    {},
                    "test"
                )
                health["agents"]["fallback_analyzer"] = {
                    "status": "healthy",
                    "last_check": datetime.utcnow().isoformat(),
                    "test_result": "success",
                }
            except Exception as e:
                health["agents"]["fallback_analyzer"] = {
                    "status": "unhealthy",
                    "error": str(e),
                    "last_check": datetime.utcnow().isoformat(),
                }
        else:
            health["agents"]["fallback_analyzer"] = {
                "status": "not_configured",
                "last_check": None,
            }

        return health

    def get_usage_stats(self) -> Dict[str, Any]:
        """Get usage statistics."""
        # TODO: Implement usage tracking
        return {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "avg_response_time_ms": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "error_rates": {},
            "model_usage": {},
        }

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about AI models."""
        info = {
            "error_analyzer": {
                "provider": self.config.error_analyzer.provider.value,
                "model": self.config.error_analyzer.model_name,
                "max_tokens": self.config.error_analyzer.max_tokens,
                "temperature": self.config.error_analyzer.temperature,
                "timeout": self.config.error_analyzer.timeout,
                "retry_attempts": self.config.error_analyzer.retry_attempts,
            },
        }

        if self.config.fallback_analyzer:
            info["fallback_analyzer"] = {
                "provider": self.config.fallback_analyzer.provider.value,
                "model": self.config.fallback_analyzer.model_name,
                "max_tokens": self.config.fallback_analyzer.max_tokens,
                "temperature": self.config.fallback_analyzer.temperature,
                "timeout": self.config.fallback_analyzer.timeout,
                "retry_attempts": self.config.fallback_analyzer.retry_attempts,
            }

        return info

    def update_config(self, new_config: AIModelsConfig):
        """Update configuration."""
        self.config = new_config
        self._initialize_agents()
        logger.info("AI manager configuration updated")

    def reload_agents(self):
        """Reload AI agents."""
        logger.info("Reloading AI agents")
        self._initialize_agents()

    async def cleanup(self):
        """Cleanup resources."""
        # TODO: Implement cleanup logic
        logger.info("AI manager cleanup completed")


# Global AI manager instance
_ai_manager = None


def get_ai_manager() -> AIAgentManager:
    """Get global AI manager instance."""
    global _ai_manager
    if _ai_manager is None:
        from app.config import settings, AI_MODELS_CONFIG

        # Override config with environment variables
        config = AI_MODELS_CONFIG.copy()

        # Update with environment variables if available
        if settings.OPENAI_API_KEY:
            config.error_analyzer.api_key = settings.OPENAI_API_KEY
            config.error_analyzer.provider = "openai"
            config.error_analyzer.model_name = settings.AI_MODEL
            config.error_analyzer.max_tokens = settings.AI_MAX_TOKENS
            config.error_analyzer.temperature = settings.AI_TEMPERATURE

        if settings.ANTHROPIC_API_KEY:
            config.code_validator.api_key = settings.ANTHROPIC_API_KEY
            config.code_validator.provider = "anthropic"

        _ai_manager = AIAgentManager(config)
    return _ai_manager


def create_ai_request(
    request_type: str,
    input_data: Dict[str, Any],
    context: Dict[str, Any],
    user_id: Optional[int] = None,
    organization_id: Optional[int] = None,
    priority: str = "normal",
    timeout: Optional[int] = None,
) -> AIRequest:
    """Create AI request."""
    return AIRequest(
        request_type=request_type,
        input_data=input_data,
        context=context,
        user_id=user_id,
        organization_id=organization_id,
        priority=priority,
        timeout=timeout,
    )


async def analyze_error(
    error_data: Dict[str, Any],
    context: Dict[str, Any],
    user_id: Optional[int] = None,
    organization_id: Optional[int] = None,
) -> AIResponse:
    """Analyze error with AI."""
    manager = get_ai_manager()
    request = create_ai_request(
        request_type="analyze",
        input_data=error_data,
        context=context,
        user_id=user_id,
        organization_id=organization_id,
    )
    return await manager.process_request(request)


async def generate_fix(
    error_data: Dict[str, Any],
    context: Dict[str, Any],
    user_id: Optional[int] = None,
    organization_id: Optional[int] = None,
) -> AIResponse:
    """Generate fix with AI."""
    manager = get_ai_manager()
    request = create_ai_request(
        request_type="fix",
        input_data=error_data,
        context=context,
        user_id=user_id,
        organization_id=organization_id,
    )
    return await manager.process_request(request)


async def validate_code(
    code_data: Dict[str, Any],
    context: Dict[str, Any],
    user_id: Optional[int] = None,
    organization_id: Optional[int] = None,
) -> AIResponse:
    """Validate code with AI."""
    manager = get_ai_manager()
    request = create_ai_request(
        request_type="validate",
        input_data=code_data,
        context=context,
        user_id=user_id,
        organization_id=organization_id,
    )
    return await manager.process_request(request)