import os
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from typing import AsyncGenerator, Dict, Any
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.connection import get_session
from app.models import Base
from app.config import settings
from app.ai.agent import AIProvider


# Override settings for testing
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["ENVIRONMENT"] = "testing"
os.environ["DEBUG"] = "true"
os.environ["OPENAI_API_KEY"] = "test-key"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def engine():
    """Create a test database engine."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///./test.db",
        echo=False,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    
    # Create tables
    async def create_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    asyncio.run(create_tables())
    yield engine
    
    # Clean up
    async def drop_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    
    asyncio.run(drop_tables())
    os.remove("./test.db")


@pytest.fixture
async def session(engine):
    """Create a test database session."""
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session


@pytest.fixture
def client(session):
    """Create a test client."""
    def override_get_session():
        return session
    
    app.dependency_overrides[get_session] = override_get_session
    
    with TestClient(app) as c:
        yield c
    
    app.dependency_overrides.clear()


@pytest.fixture
def mock_openai():
    """Mock OpenAI API for testing."""
    mock = AsyncMock()
    mock.return_value = {
        "choices": [{
            "message": {"content": "Mock AI response"}
        }],
        "usage": {"total_tokens": 100}
    }
    return mock


@pytest.fixture
def mock_claude():
    """Mock Claude API for testing."""
    mock = AsyncMock()
    mock.return_value = {
        "content": [{
            "type": "text",
            "text": "Mock AI response"
        }],
        "usage": {"input_tokens": 50, "output_tokens": 50}
    }
    return mock


@pytest.fixture
def mock_groq():
    """Mock Groq API for testing."""
    mock = AsyncMock()
    mock.return_value = {
        "choices": [{
            "message": {"content": "Mock AI response"}
        }],
        "usage": {"total_tokens": 100}
    }
    return mock


@pytest.fixture
def mock_deepseek():
    """Mock DeepSeek API for testing."""
    mock = AsyncMock()
    mock.return_value = {
        "choices": [{
            "message": {"content": "Mock AI response"}
        }],
        "usage": {"total_tokens": 100}
    }
    return mock


@pytest.fixture
def sample_code():
    """Sample code for testing."""
    return """
def add(a, b):
    # This function adds two numbers
    return a + b

def multiply(a, b):
    # This function multiplies two numbers
    return a * b

# Main function
def main():
    x = 5
    y = 10
    result = add(x, y)
    print(f"The sum is {result}")
    return result

if __name__ == "__main__":
    main()
"""


@pytest.fixture
def sample_bug_report():
    """Sample bug report for testing."""
    return {
        "title": "Function returns wrong result",
        "description": "The multiply function returns incorrect values",
        "steps_to_reproduce": [
            "Call multiply(2, 3)",
            "Expected result: 6",
            "Actual result: Something else"
        ],
        "expected_behavior": "multiply(2, 3) should return 6",
        "actual_behavior": "multiply(2, 3) returns a different value",
        "environment": {
            "os": "Linux",
            "python_version": "3.9",
            "dependencies": ["pytest==7.0.0"]
        }
    }


@pytest.fixture
def mock_agent_response():
    """Mock agent response for testing."""
    return {
        "analysis": {
            "root_cause": "The function implementation is incorrect",
            "severity": "high",
            "files_affected": ["app/main.py"]
        },
        "fix": {
            "strategy": "Replace the multiplication logic with correct implementation",
            "code_changes": [
                {
                    "file": "app/main.py",
                    "line": 8,
                    "original": "return a * b",
                    "replacement": "return a * b  # Fixed multiplication"
                }
            ],
            "test_cases": [
                {
                    "name": "test_multiply_function",
                    "code": "def test_multiply_function():\n    assert multiply(2, 3) == 6"
                }
            ]
        },
        "explanation": "The issue was in the multiplication function implementation. By fixing this, the function will now correctly multiply two numbers."
    }


@pytest.fixture
def mock_llm_provider_response():
    """Mock LLM provider response for testing."""
    return {
        "status": "success",
        "message": "LLM provider updated successfully",
        "provider": "openai",
        "model": "gpt-4-turbo",
        "timestamp": "2024-01-15T12:00:00Z"
    }


@pytest.fixture
def sample_llm_provider_config():
    """Sample LLM provider configuration for testing."""
    return {
        "provider": "openai",
        "model": "gpt-4-turbo",
        "api_key": "sk-test-key",
        "base_url": "https://api.openai.com/v1",
        "temperature": 0.7,
        "max_tokens": 4000,
        "timeout": 60
    }


@pytest.fixture
def available_llm_providers():
    """Sample list of available LLM providers for testing."""
    return {
        "providers": [
            {
                "name": "openai",
                "display_name": "OpenAI",
                "models": ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
                "description": "OpenAI's GPT models"
            },
            {
                "name": "anthropic",
                "display_name": "Anthropic",
                "models": ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
                "description": "Anthropic's Claude models"
            },
            {
                "name": "groq",
                "display_name": "Groq",
                "models": ["llama2-70b-4096", "mixtral-8x7b-32768"],
                "description": "Groq's fast inference models"
            },
            {
                "name": "deepseek",
                "display_name": "DeepSeek",
                "models": ["deepseek-coder", "deepseek-chat"],
                "description": "DeepSeek's specialized models"
            }
        ]
    }


@pytest.fixture
def mock_redis_for_llm_config():
    """Mock Redis for LLM configuration testing."""
    mock = MagicMock()
    mock.get.return_value = json.dumps({
        "provider": "openai",
        "model": "gpt-4-turbo",
        "api_key": "sk-test-key",
        "base_url": "https://api.openai.com/v1",
        "temperature": 0.7,
        "max_tokens": 4000,
        "timeout": 60
    })
    mock.set.return_value = True
    mock.delete.return_value = 1
    return mock