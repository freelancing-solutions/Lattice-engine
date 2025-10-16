"""Tests for LLM service endpoints."""

import pytest
import json
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

from bugsage_backend.main import app
from bugsage_backend.routers.llm import LLMProvider


client = TestClient(app)


class TestLLMService:
    """Test class for LLM service endpoints."""

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    @patch("bugsage_backend.routers.llm.AnthropicLLM")
    @patch("bugsage_backend.routers.llm.GroqLLM")
    @patch("bugsage_backend.routers.llm.DeepSeekLLM")
    def test_generate_text_openai(self, mock_deepseek, mock_groq, mock_anthropic, mock_openai, mock_redis):
        """Test generating text with OpenAI provider."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1",
            "temperature": 0.7,
            "max_tokens": 4000,
            "timeout": 60
        })

        # Setup mock OpenAI LLM
        mock_llm_instance = AsyncMock()
        mock_llm_instance.generate_text.return_value = "This is a test response from OpenAI."
        mock_openai.return_value = mock_llm_instance

        # Test data
        request_data = {
            "prompt": "Write a short story about a robot learning to feel emotions.",
            "temperature": 0.8,
            "max_tokens": 1000
        }

        response = client.post("/api/llm/generate", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "openai"
        assert data["model"] == "gpt-4-turbo"
        assert data["text"] == "This is a test response from OpenAI."
        assert "response_time_ms" in data
        assert "tokens_used" in data
        
        mock_openai.assert_called_once()
        mock_anthropic.assert_not_called()
        mock_groq.assert_not_called()
        mock_deepseek.assert_not_called()
        mock_llm_instance.generate_text.assert_called_once_with(
            prompt="Write a short story about a robot learning to feel emotions.",
            temperature=0.8,
            max_tokens=1000
        )

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    @patch("bugsage_backend.routers.llm.AnthropicLLM")
    @patch("bugsage_backend.routers.llm.GroqLLM")
    @patch("bugsage_backend.routers.llm.DeepSeekLLM")
    def test_generate_text_anthropic(self, mock_deepseek, mock_groq, mock_anthropic, mock_openai, mock_redis):
        """Test generating text with Anthropic provider."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "anthropic",
            "model": "claude-3-opus",
            "api_key": "sk-ant-test-key",
            "base_url": "https://api.anthropic.com",
            "temperature": 0.5,
            "max_tokens": 8000,
            "timeout": 90
        })

        # Setup mock Anthropic LLM
        mock_llm_instance = AsyncMock()
        mock_llm_instance.generate_text.return_value = "This is a test response from Anthropic."
        mock_anthropic.return_value = mock_llm_instance

        # Test data
        request_data = {
            "prompt": "Explain quantum computing in simple terms.",
            "temperature": 0.5,
            "max_tokens": 500
        }

        response = client.post("/api/llm/generate", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "anthropic"
        assert data["model"] == "claude-3-opus"
        assert data["text"] == "This is a test response from Anthropic."
        
        mock_openai.assert_not_called()
        mock_anthropic.assert_called_once()
        mock_groq.assert_not_called()
        mock_deepseek.assert_not_called()
        mock_llm_instance.generate_text.assert_called_once_with(
            prompt="Explain quantum computing in simple terms.",
            temperature=0.5,
            max_tokens=500
        )

    @patch("bugsage_backend.routers.llm.redis_client")
    def test_generate_text_no_config(self, mock_redis):
        """Test generating text when no LLM configuration is set."""
        # Setup mock Redis to return None
        mock_redis.get.return_value = None

        # Test data
        request_data = {
            "prompt": "Write a short story.",
            "temperature": 0.7,
            "max_tokens": 1000
        }

        response = client.post("/api/llm/generate", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "No LLM configuration found" in data["detail"]

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    @patch("bugsage_backend.routers.llm.AnthropicLLM")
    @patch("bugsage_backend.routers.llm.GroqLLM")
    @patch("bugsage_backend.routers.llm.DeepSeekLLM")
    def test_generate_text_with_custom_config(self, mock_deepseek, mock_groq, mock_anthropic, mock_openai, mock_redis):
        """Test generating text with custom configuration."""
        # Setup mock Redis (won't be called since we're providing custom config)
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo"
        })

        # Setup mock Anthropic LLM
        mock_llm_instance = AsyncMock()
        mock_llm_instance.generate_text.return_value = "This is a test response with custom config."
        mock_anthropic.return_value = mock_llm_instance

        # Test data with custom config
        request_data = {
            "prompt": "Write a poem about artificial intelligence.",
            "temperature": 0.9,
            "max_tokens": 300,
            "config": {
                "provider": "anthropic",
                "model": "claude-3-sonnet",
                "api_key": "sk-ant-test-key",
                "base_url": "https://api.anthropic.com"
            }
        }

        response = client.post("/api/llm/generate", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "anthropic"
        assert data["model"] == "claude-3-sonnet"
        assert data["text"] == "This is a test response with custom config."
        
        # Redis should not be called when providing custom config
        mock_redis.get.assert_not_called()
        mock_openai.assert_not_called()
        mock_anthropic.assert_called_once()
        mock_groq.assert_not_called()
        mock_deepseek.assert_not_called()

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    def test_generate_text_llm_error(self, mock_openai, mock_redis):
        """Test handling of LLM generation errors."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1"
        })

        # Setup mock OpenAI LLM to raise an exception
        mock_llm_instance = AsyncMock()
        mock_llm_instance.generate_text.side_effect = Exception("API rate limit exceeded")
        mock_openai.return_value = mock_llm_instance

        # Test data
        request_data = {
            "prompt": "Write a short story.",
            "temperature": 0.7,
            "max_tokens": 1000
        }

        response = client.post("/api/llm/generate", json=request_data)
        
        assert response.status_code == 500
        data = response.json()
        assert "Error generating text" in data["detail"]
        assert "API rate limit exceeded" in data["detail"]

    @patch("bugsage_backend.routers.llm.redis_client")
    def test_generate_text_invalid_custom_config(self, mock_redis):
        """Test generating text with invalid custom configuration."""
        # Setup mock Redis (won't be called since we're providing custom config)
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo"
        })

        # Test data with invalid custom config
        request_data = {
            "prompt": "Write a short story.",
            "temperature": 0.7,
            "max_tokens": 1000,
            "config": {
                "provider": "invalid-provider",
                "model": "test-model",
                "api_key": "sk-test-key"
            }
        }

        response = client.post("/api/llm/generate", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "Invalid provider" in data["detail"]
        
        # Redis should not be called when providing custom config
        mock_redis.get.assert_not_called()

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    def test_generate_text_missing_prompt(self, mock_openai, mock_redis):
        """Test generating text with missing prompt."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1"
        })

        # Test data with missing prompt
        request_data = {
            "temperature": 0.7,
            "max_tokens": 1000
        }

        response = client.post("/api/llm/generate", json=request_data)
        
        assert response.status_code == 422  # Validation error
        mock_openai.assert_not_called()

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    def test_generate_text_invalid_temperature(self, mock_openai, mock_redis):
        """Test generating text with invalid temperature."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1"
        })

        # Test data with invalid temperature (outside 0-2 range)
        request_data = {
            "prompt": "Write a short story.",
            "temperature": 3.0,  # Invalid: > 2.0
            "max_tokens": 1000
        }

        response = client.post("/api/llm/generate", json=request_data)
        
        assert response.status_code == 422  # Validation error
        mock_openai.assert_not_called()

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    def test_generate_text_invalid_max_tokens(self, mock_openai, mock_redis):
        """Test generating text with invalid max_tokens."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1"
        })

        # Test data with invalid max_tokens (negative)
        request_data = {
            "prompt": "Write a short story.",
            "temperature": 0.7,
            "max_tokens": -100  # Invalid: negative
        }

        response = client.post("/api/llm/generate", json=request_data)
        
        assert response.status_code == 422  # Validation error
        mock_openai.assert_not_called()

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    def test_stream_text_openai(self, mock_openai, mock_redis):
        """Test streaming text with OpenAI provider."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1",
            "temperature": 0.7,
            "max_tokens": 4000,
            "timeout": 60
        })

        # Setup mock OpenAI LLM with streaming
        mock_llm_instance = AsyncMock()
        # Mock the async generator for streaming
        async def mock_stream_generator():
            yield {"type": "token", "content": "This "}
            yield {"type": "token", "content": "is "}
            yield {"type": "token", "content": "a "}
            yield {"type": "token", "content": "test "}
            yield {"type": "token", "content": "stream "}
            yield {"type": "done", "content": "", "tokens_used": 5}
        
        mock_llm_instance.stream_text.return_value = mock_stream_generator()
        mock_openai.return_value = mock_llm_instance

        # Test data
        request_data = {
            "prompt": "Write a short sentence.",
            "temperature": 0.7,
            "max_tokens": 100
        }

        response = client.post("/api/llm/stream", json=request_data)
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream"
        
        # Read the streaming response
        content = b""
        for chunk in response.iter_bytes():
            content += chunk
        
        content_str = content.decode("utf-8")
        assert "data: " in content_str
        assert "This is a test stream" in content_str
        assert "DONE" in content_str
        
        mock_openai.assert_called_once()

    @patch("bugsage_backend.routers.llm.redis_client")
    def test_stream_text_no_config(self, mock_redis):
        """Test streaming text when no LLM configuration is set."""
        # Setup mock Redis to return None
        mock_redis.get.return_value = None

        # Test data
        request_data = {
            "prompt": "Write a short sentence.",
            "temperature": 0.7,
            "max_tokens": 100
        }

        response = client.post("/api/llm/stream", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "No LLM configuration found" in data["detail"]

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    def test_stream_text_llm_error(self, mock_openai, mock_redis):
        """Test handling of LLM streaming errors."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1"
        })

        # Setup mock OpenAI LLM to raise an exception
        mock_llm_instance = AsyncMock()
        mock_llm_instance.stream_text.side_effect = Exception("API connection error")
        mock_openai.return_value = mock_llm_instance

        # Test data
        request_data = {
            "prompt": "Write a short sentence.",
            "temperature": 0.7,
            "max_tokens": 100
        }

        response = client.post("/api/llm/stream", json=request_data)
        
        assert response.status_code == 500
        data = response.json()
        assert "Error streaming text" in data["detail"]
        assert "API connection error" in data["detail"]

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    def test_get_current_llm_status(self, mock_openai, mock_redis):
        """Test getting current LLM status."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1",
            "temperature": 0.7,
            "max_tokens": 4000,
            "timeout": 60
        })

        response = client.get("/api/llm/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "openai"
        assert data["model"] == "gpt-4-turbo"
        assert data["configured"] is True

    @patch("bugsage_backend.routers.llm.redis_client")
    def test_get_current_llm_status_no_config(self, mock_redis):
        """Test getting current LLM status when no configuration is set."""
        # Setup mock Redis to return None
        mock_redis.get.return_value = None

        response = client.get("/api/llm/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data["configured"] is False
        assert "No LLM configuration found" in data["message"]

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    @patch("bugsage_backend.routers.llm.AnthropicLLM")
    def test_get_model_info(self, mock_anthropic, mock_openai, mock_redis):
        """Test getting model information."""
        # Setup mock Redis
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1"
        })

        # Setup mock OpenAI LLM
        mock_llm_instance = AsyncMock()
        mock_llm_instance.get_model_info.return_value = {
            "name": "gpt-4-turbo",
            "description": "OpenAI's GPT-4 Turbo model",
            "context_length": 128000,
            "input_cost": 0.01,
            "output_cost": 0.03
        }
        mock_openai.return_value = mock_llm_instance

        response = client.get("/api/llm/model-info")
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "gpt-4-turbo"
        assert data["context_length"] == 128000
        assert data["input_cost"] == 0.01
        assert data["output_cost"] == 0.03
        
        mock_openai.assert_called_once()
        mock_anthropic.assert_not_called()

    @patch("bugsage_backend.routers.llm.redis_client")
    def test_get_model_info_no_config(self, mock_redis):
        """Test getting model information when no configuration is set."""
        # Setup mock Redis to return None
        mock_redis.get.return_value = None

        response = client.get("/api/llm/model-info")
        
        assert response.status_code == 400
        data = response.json()
        assert "No LLM configuration found" in data["detail"]

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    def test_get_model_info_with_custom_config(self, mock_openai, mock_redis):
        """Test getting model information with custom configuration."""
        # Setup mock Redis (won't be called since we're providing custom config)
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo"
        })

        # Setup mock Anthropic LLM
        mock_llm_instance = AsyncMock()
        mock_llm_instance.get_model_info.return_value = {
            "name": "claude-3-opus",
            "description": "Anthropic's Claude 3 Opus model",
            "context_length": 200000,
            "input_cost": 0.015,
            "output_cost": 0.075
        }
        mock_openai.return_value = mock_llm_instance

        # Test with custom config
        params = {
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1"
        }

        response = client.get("/api/llm/model-info", params=params)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "gpt-4-turbo"
        assert data["context_length"] == 128000
        
        # Redis should not be called when providing custom config
        mock_redis.get.assert_not_called()

    @patch("bugsage_backend.routers.llm.redis_client")
    @patch("bugsage_backend.routers.llm.OpenAILLM")
    def test_get_usage_stats(self, mock_openai, mock_redis):
        """Test getting usage statistics."""
        # Setup mock Redis for config
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1"
        })

        # Setup mock OpenAI LLM
        mock_llm_instance = AsyncMock()
        mock_llm_instance.get_usage_stats.return_value = {
            "total_requests": 150,
            "total_tokens": 75000,
            "total_cost": 2.34,
            "average_response_time_ms": 1200
        }
        mock_openai.return_value = mock_llm_instance

        response = client.get("/api/llm/usage-stats")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_requests"] == 150
        assert data["total_tokens"] == 75000
        assert data["total_cost"] == 2.34
        assert data["average_response_time_ms"] == 1200
        
        mock_openai.assert_called_once()

    @patch("bugsage_backend.routers.llm.redis_client")
    def test_get_usage_stats_no_config(self, mock_redis):
        """Test getting usage statistics when no configuration is set."""
        # Setup mock Redis to return None
        mock_redis.get.return_value = None

        response = client.get("/api/llm/usage-stats")
        
        assert response.status_code == 400
        data = response.json()
        assert "No LLM configuration found" in data["detail"]