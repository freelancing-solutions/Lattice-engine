"""Tests for LLM configuration endpoints."""

import pytest
import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from bugsage_backend.main import app


client = TestClient(app)


class TestLLMConfig:
    """Test class for LLM configuration endpoints."""

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_get_current_llm_config(self, mock_redis):
        """Test getting current LLM configuration."""
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

        response = client.get("/api/llm/config")
        
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "openai"
        assert data["model"] == "gpt-4-turbo"
        mock_redis.get.assert_called_once_with("llm_config")

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_get_current_llm_config_not_found(self, mock_redis):
        """Test getting current LLM configuration when not set."""
        # Setup mock Redis to return None
        mock_redis.get.return_value = None

        response = client.get("/api/llm/config")
        
        assert response.status_code == 404
        data = response.json()
        assert "No LLM configuration found" in data["detail"]
        mock_redis.get.assert_called_once_with("llm_config")

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_update_llm_config(self, mock_redis):
        """Test updating LLM configuration."""
        # Setup mock Redis
        mock_redis.set.return_value = True

        new_config = {
            "provider": "anthropic",
            "model": "claude-3-opus",
            "api_key": "sk-ant-test-key",
            "base_url": "https://api.anthropic.com",
            "temperature": 0.5,
            "max_tokens": 8000,
            "timeout": 90
        }

        response = client.put("/api/llm/config", json=new_config)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["message"] == "LLM configuration updated successfully"
        assert data["provider"] == "anthropic"
        assert data["model"] == "claude-3-opus"
        mock_redis.set.assert_called_once()

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_update_llm_config_invalid_provider(self, mock_redis):
        """Test updating LLM configuration with invalid provider."""
        # Setup mock Redis
        mock_redis.set.return_value = True

        new_config = {
            "provider": "invalid-provider",
            "model": "test-model",
            "api_key": "sk-test-key"
        }

        response = client.put("/api/llm/config", json=new_config)
        
        assert response.status_code == 400
        data = response.json()
        assert "Invalid provider" in data["detail"]
        mock_redis.set.assert_not_called()

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_update_llm_config_missing_required_fields(self, mock_redis):
        """Test updating LLM configuration with missing required fields."""
        # Setup mock Redis
        mock_redis.set.return_value = True

        # Missing provider field
        new_config = {
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key"
        }

        response = client.put("/api/llm/config", json=new_config)
        
        assert response.status_code == 422  # Validation error
        mock_redis.set.assert_not_called()

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_delete_llm_config(self, mock_redis):
        """Test deleting LLM configuration."""
        # Setup mock Redis
        mock_redis.delete.return_value = 1

        response = client.delete("/api/llm/config")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["message"] == "LLM configuration deleted successfully"
        mock_redis.delete.assert_called_once_with("llm_config")

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_delete_llm_config_not_found(self, mock_redis):
        """Test deleting LLM configuration when not set."""
        # Setup mock Redis to return 0 (no key deleted)
        mock_redis.delete.return_value = 0

        response = client.delete("/api/llm/config")
        
        assert response.status_code == 404
        data = response.json()
        assert "No LLM configuration found" in data["detail"]
        mock_redis.delete.assert_called_once_with("llm_config")

    def test_get_available_providers(self):
        """Test getting list of available LLM providers."""
        response = client.get("/api/llm/providers")
        
        assert response.status_code == 200
        data = response.json()
        assert "providers" in data
        assert len(data["providers"]) > 0
        
        # Check for expected providers
        provider_names = [p["name"] for p in data["providers"]]
        assert "openai" in provider_names
        assert "anthropic" in provider_names
        assert "groq" in provider_names
        assert "deepseek" in provider_names

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_switch_llm_provider(self, mock_redis):
        """Test switching LLM provider."""
        # Setup mock Redis for getting current config
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo",
            "api_key": "sk-test-key",
            "base_url": "https://api.openai.com/v1",
            "temperature": 0.7,
            "max_tokens": 4000,
            "timeout": 60
        })
        mock_redis.set.return_value = True

        switch_data = {
            "provider": "anthropic",
            "model": "claude-3-sonnet"
        }

        response = client.post("/api/llm/switch", json=switch_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["message"] == "LLM provider switched successfully"
        assert data["provider"] == "anthropic"
        assert data["model"] == "claude-3-sonnet"
        mock_redis.get.assert_called_once_with("llm_config")
        mock_redis.set.assert_called_once()

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_switch_llm_provider_no_existing_config(self, mock_redis):
        """Test switching LLM provider when no existing config."""
        # Setup mock Redis to return None
        mock_redis.get.return_value = None

        switch_data = {
            "provider": "anthropic",
            "model": "claude-3-sonnet"
        }

        response = client.post("/api/llm/switch", json=switch_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "No existing LLM configuration found" in data["detail"]
        mock_redis.get.assert_called_once_with("llm_config")
        mock_redis.set.assert_not_called()

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_switch_llm_provider_invalid_provider(self, mock_redis):
        """Test switching to an invalid LLM provider."""
        # Setup mock Redis for getting current config
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo"
        })

        switch_data = {
            "provider": "invalid-provider",
            "model": "test-model"
        }

        response = client.post("/api/llm/switch", json=switch_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "Invalid provider" in data["detail"]
        mock_redis.get.assert_called_once_with("llm_config")
        mock_redis.set.assert_not_called()

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_switch_llm_provider_invalid_model(self, mock_redis):
        """Test switching to an invalid model for the provider."""
        # Setup mock Redis for getting current config
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo"
        })

        switch_data = {
            "provider": "openai",
            "model": "invalid-model"
        }

        response = client.post("/api/llm/switch", json=switch_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "Invalid model" in data["detail"]
        mock_redis.get.assert_called_once_with("llm_config")
        mock_redis.set.assert_not_called()

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_switch_llm_provider_missing_fields(self, mock_redis):
        """Test switching LLM provider with missing required fields."""
        # Setup mock Redis for getting current config
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo"
        })

        # Missing model field
        switch_data = {
            "provider": "anthropic"
        }

        response = client.post("/api/llm/switch", json=switch_data)
        
        assert response.status_code == 422  # Validation error
        mock_redis.get.assert_not_called()
        mock_redis.set.assert_not_called()

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_test_llm_config(self, mock_redis):
        """Test testing LLM configuration."""
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

        response = client.post("/api/llm/test")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "message" in data
        mock_redis.get.assert_called_once_with("llm_config")

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_test_llm_config_no_config(self, mock_redis):
        """Test testing LLM configuration when not set."""
        # Setup mock Redis to return None
        mock_redis.get.return_value = None

        response = client.post("/api/llm/test")
        
        assert response.status_code == 404
        data = response.json()
        assert "No LLM configuration found" in data["detail"]
        mock_redis.get.assert_called_once_with("llm_config")

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_test_llm_config_with_custom_config(self, mock_redis):
        """Test testing LLM configuration with custom config."""
        # Setup mock Redis (won't be called since we're providing custom config)
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo"
        })

        custom_config = {
            "provider": "anthropic",
            "model": "claude-3-opus",
            "api_key": "sk-ant-test-key",
            "base_url": "https://api.anthropic.com"
        }

        response = client.post("/api/llm/test", json=custom_config)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "message" in data
        # Redis should not be called when providing custom config
        mock_redis.get.assert_not_called()

    @patch("bugsage_backend.routers.llm_config.redis_client")
    def test_test_llm_config_invalid_custom_config(self, mock_redis):
        """Test testing LLM configuration with invalid custom config."""
        # Setup mock Redis (won't be called since we're providing custom config)
        mock_redis.get.return_value = json.dumps({
            "provider": "openai",
            "model": "gpt-4-turbo"
        })

        # Invalid provider
        custom_config = {
            "provider": "invalid-provider",
            "model": "test-model",
            "api_key": "sk-test-key"
        }

        response = client.post("/api/llm/test", json=custom_config)
        
        assert response.status_code == 400
        data = response.json()
        assert "Invalid provider" in data["detail"]
        # Redis should not be called when providing custom config
        mock_redis.get.assert_not_called()