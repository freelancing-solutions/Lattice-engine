"""
Test utility for Claude integration in the Lattice Mutation Engine.
This module provides functions to test and validate Claude/PydanticAI integration.
"""

import asyncio
import logging
from typing import Dict, Any
from pydantic import BaseModel

from lattice_mutation_engine.config.claude_config import claude_config, get_claude_client, is_claude_available
from lattice_mutation_engine.agents.agent_factory import AgentFactory
from lattice_mutation_engine.models.agent_models import AgentTask

logger = logging.getLogger(__name__)


class TestValidationRequest(BaseModel):
    """Test validation request for Claude integration"""
    spec_id: str
    spec_content: Dict[str, Any]
    validation_type: str = "basic"


async def test_claude_connection() -> Dict[str, Any]:
    """Test basic Claude API connection"""
    try:
        if not is_claude_available():
            return {
                "success": False,
                "error": "Claude not configured - missing API key",
                "configured": False
            }
        
        client = get_claude_client()
        if not client:
            return {
                "success": False,
                "error": "Failed to create Claude client",
                "configured": True
            }
        
        # Test basic API call
        response = client.messages.create(
            model=claude_config.default_model,
            max_tokens=100,
            temperature=0.3,
            messages=[{
                "role": "user",
                "content": "Respond with 'Claude connection successful' if you can read this."
            }]
        )
        
        return {
            "success": True,
            "response": response.content[0].text if response.content else "No response",
            "model": claude_config.default_model,
            "configured": True
        }
        
    except Exception as e:
        logger.error(f"Claude connection test failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "configured": is_claude_available()
        }


async def test_pydantic_validator_agent() -> Dict[str, Any]:
    """Test the PydanticAI validator agent"""
    try:
        # Create validator agent
        validator_agent = AgentFactory.create_validator_agent()
        
        # Create test task
        test_task = AgentTask(
            task_id="test_validation_001",
            agent_id=validator_agent.registration.agent_id,
            operation="validate_proposal",
            input_data={
                "proposal": {
                    "id": "test_spec_001",
                    "title": "Test Specification",
                    "description": "A test specification for validation",
                    "version": "1.0.0",
                    "type": "api_spec"
                },
                "context": {
                    "validation_level": "strict",
                    "check_dependencies": True
                }
            }
        )
        
        # Execute task
        result = await validator_agent.execute_task(test_task)
        
        return {
            "success": True,
            "agent_id": validator_agent.registration.agent_id,
            "result": result,
            "used_llm": "pydantic_agent" in str(result)
        }
        
    except Exception as e:
        logger.error(f"PydanticAI validator test failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "agent_id": "pydantic_validator"
        }


async def test_all_agents() -> Dict[str, Any]:
    """Test all PydanticAI agents"""
    results = {}
    
    # Test each agent type
    agent_tests = [
        ("validator", test_pydantic_validator_agent),
        # Add more agent tests as needed
    ]
    
    for agent_name, test_func in agent_tests:
        try:
            results[agent_name] = await test_func()
        except Exception as e:
            results[agent_name] = {
                "success": False,
                "error": str(e)
            }
    
    return results


async def run_claude_integration_test() -> Dict[str, Any]:
    """Run comprehensive Claude integration test"""
    print("🧪 Testing Claude Integration for Lattice Mutation Engine")
    print("=" * 60)
    
    # Test 1: Basic Claude connection
    print("1. Testing Claude API connection...")
    connection_result = await test_claude_connection()
    print(f"   ✅ Success: {connection_result['success']}")
    if connection_result.get('error'):
        print(f"   ❌ Error: {connection_result['error']}")
    
    # Test 2: PydanticAI agent integration
    print("\n2. Testing PydanticAI Validator Agent...")
    validator_result = await test_pydantic_validator_agent()
    print(f"   ✅ Success: {validator_result['success']}")
    if validator_result.get('error'):
        print(f"   ❌ Error: {validator_result['error']}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary:")
    print(f"   Claude API: {'✅ Working' if connection_result['success'] else '❌ Failed'}")
    print(f"   Validator Agent: {'✅ Working' if validator_result['success'] else '❌ Failed'}")
    print(f"   Claude Configured: {'✅ Yes' if is_claude_available() else '❌ No'}")
    
    return {
        "claude_connection": connection_result,
        "validator_agent": validator_result,
        "overall_success": connection_result['success'] and validator_result['success']
    }


if __name__ == "__main__":
    # Run the test when executed directly
    asyncio.run(run_claude_integration_test())