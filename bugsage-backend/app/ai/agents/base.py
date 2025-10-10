"""
Base AI agent classes.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import asyncio
import logging

from app.ai.models.config import ModelConfig, AIRequest, AIResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)


class BaseAIAgent(ABC):
    """Base class for AI agents."""

    def __init__(self, config: ModelConfig, system_prompt: str):
        self.config = config
        self.system_prompt = system_prompt
        self.model = None
        self.agent = None
        self._setup_model()

    @abstractmethod
    def _setup_model(self):
        """Setup AI model based on configuration."""
        pass

    @abstractmethod
    def _create_agent(self):
        """Create PydanticAI agent."""
        pass

    @abstractmethod
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process input and return result."""
        pass

    async def run_with_fallback(
        self,
        input_data: Dict[str, Any],
        context: Dict[str, Any],
        fallback_agent: Optional['BaseAIAgent'] = None
    ) -> Dict[str, Any]:
        """Run AI agent with fallback handling."""
        try:
            logger.info(f"Running {self.__class__.__name__} with {self.config.provider}")

            start_time = datetime.utcnow()
            result = await self.process(input_data, context)
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000

            # Add processing time to result
            result['processing_time_ms'] = int(processing_time)
            result['model_used'] = self.config.model_name
            result['provider_used'] = self.config.provider.value
            result['fallback_used'] = False

            # Validate result
            validated_result = self.validate_result(result)
            return validated_result

        except Exception as e:
            logger.error(f"AI agent failed: {e}")

            if fallback_agent:
                logger.info("Attempting fallback agent")
                try:
                    return await fallback_agent.process(input_data, context)
                except Exception as fallback_error:
                    logger.error(f"Fallback agent also failed: {fallback_error}")

            # Return graceful degradation result
            return self.get_fallback_result(input_data, context, str(e))

    @abstractmethod
    def validate_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate AI result."""
        pass

    @abstractmethod
    def get_fallback_result(self, input_data: Dict[str, Any], context: Dict[str, Any], error: str) -> Dict[str, Any]:
        """Get fallback result when AI fails."""
        pass

    def get_request_id(self) -> str:
        """Generate unique request ID."""
        import uuid
        return str(uuid.uuid4())

    def log_request_start(self, request_id: str, input_data: Dict[str, Any]):
        """Log request start."""
        logger.info(f"[{request_id}] Starting {self.__class__.__name__} request")

    def log_request_end(self, request_id: str, success: bool, processing_time_ms: int):
        """Log request end."""
        status = "SUCCESS" if success else "FAILED"
        logger.info(f"[{request_id}] {self.__class__.__name__} request {status} in {processing_time_ms}ms")

    def log_error(self, request_id: str, error: str, context: Dict[str, Any] = None):
        """Log error."""
        logger.error(f"[{request_id}] {self.__class__.__name__} error: {error}")
        if context:
            logger.debug(f"[{request_id}] Context: {context}")

    def prepare_input_data(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Prepare input data for AI model."""
        return str(input_data)

    def parse_ai_response(self, raw_response: Any) -> Dict[str, Any]:
        """Parse AI response."""
        if isinstance(raw_response, dict):
            return raw_response
        elif isinstance(raw_response, str):
            try:
                import json
                return json.loads(raw_response)
            except json.JSONDecodeError:
                return {"response": raw_response}
        else:
            return {"response": str(raw_response)}

    def add_metadata(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Add metadata to result."""
        metadata = {
            "model_used": self.config.model_name,
            "provider": self.config.provider.value,
            "processing_timestamp": datetime.utcnow().isoformat(),
            "agent_version": "1.0.0",
        }

        if "metadata" not in result:
            result["metadata"] = {}

        result["metadata"].update(metadata)
        return result

    def handle_rate_limit(self, error: Exception) -> Dict[str, Any]:
        """Handle rate limiting errors."""
        return {
            "error": "Rate limit exceeded",
            "error_type": "rate_limit",
            "retry_after": 60,  # seconds
            "metadata": {
                "provider": self.config.provider.value,
                "model": self.config.model_name,
                "suggestion": "Please wait before making another request"
            }
        }

    def handle_quota_exceeded(self, error: Exception) -> Dict[str, Any]:
        """Handle quota exceeded errors."""
        return {
            "error": "API quota exceeded",
            "error_type": "quota_exceeded",
            "metadata": {
                "provider": self.config.provider.value,
                "model": self.config.model_name,
                "suggestion": "Please check your API usage limits"
            }
        }

    def handle_authentication_error(self, error: Exception) -> Dict[str, Any]:
        """Handle authentication errors."""
        return {
            "error": "Authentication failed",
            "error_type": "authentication",
            "metadata": {
                "provider": self.config.provider.value,
                "suggestion": "Please check your API credentials"
            }
        }

    def handle_timeout(self, error: Exception) -> Dict[str, Any]:
        """Handle timeout errors."""
        return {
            "error": "Request timeout",
            "error_type": "timeout",
            "metadata": {
                "provider": self.config.provider.value,
                "model": self.config.model_name,
                "timeout_seconds": self.config.timeout,
                "suggestion": "Try again with a shorter request or increase timeout"
            }
        }

    def is_retryable_error(self, error: Exception) -> bool:
        """Check if error is retryable."""
        error_str = str(error).lower()

        retryable_errors = [
            "timeout",
            "connection",
            "network",
            "rate limit",
            "temporary",
            "unavailable",
            "busy"
        ]

        return any(retryable in error_str for retryable in retryable_errors)

    def calculate_confidence(self, result: Dict[str, Any]) -> float:
        """Calculate confidence score for result."""
        # Base confidence
        confidence = 0.5

        # Boost confidence if result has structured data
        if isinstance(result, dict) and len(result) > 1:
            confidence += 0.2

        # Boost confidence if result has expected fields
        expected_fields = self.get_expected_fields()
        if expected_fields:
            field_match_count = sum(1 for field in expected_fields if field in result)
            confidence += (field_match_count / len(expected_fields)) * 0.3

        return min(confidence, 1.0)

    def get_expected_fields(self) -> List[str]:
        """Get expected fields for result validation."""
        return []

    def validate_data_types(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate data types in result."""
        type_hints = self.get_type_hints()
        if not type_hints:
            return result

        validated_result = {}
        for field, field_type in type_hints.items():
            if field in result:
                value = result[field]
                try:
                    if field_type == str:
                        validated_result[field] = str(value)
                    elif field_type == int:
                        validated_result[field] = int(value)
                    elif field_type == float:
                        validated_result[field] = float(value)
                    elif field_type == bool:
                        validated_result[field] = bool(value)
                    elif field_type == list:
                        validated_result[field] = list(value) if not isinstance(value, list) else value
                    elif field_type == dict:
                        validated_result[field] = dict(value) if not isinstance(value, dict) else value
                    else:
                        validated_result[field] = value
                except (ValueError, TypeError) as e:
                    logger.warning(f"Type validation failed for field {field}: {e}")
                    validated_result[field] = value
            else:
                validated_result[field] = None

        return validated_result

    def get_type_hints(self) -> Dict[str, type]:
        """Get expected data types for fields."""
        return {}