"""
Claude Configuration for the Lattice Mutation Engine.
This module handles Anthropic API configuration and model settings.
"""

import os
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from anthropic import Anthropic


class ClaudeConfig(BaseModel):
    """Configuration for Claude/Anthropic integration"""
    
    # API Configuration
    api_key: Optional[str] = Field(default=None)
    base_url: Optional[str] = Field(default=None)
    timeout: int = Field(default=60)
    max_retries: int = Field(default=3)
    
    # Model Configuration
    default_model: str = Field(default="claude-3-5-sonnet-20241022")
    fallback_model: str = Field(default="claude-3-haiku-20240307")
    
    # Generation Parameters
    temperature: float = Field(default=0.7)
    max_tokens: int = Field(default=4000)
    top_p: float = Field(default=1.0)
    top_k: int = Field(default=40)
    
    # Agent-specific configurations
    validator_temperature: float = Field(default=0.3)  # Lower for more consistent validation
    mutation_temperature: float = Field(default=0.8)   # Higher for more creative mutations
    semantic_temperature: float = Field(default=0.5)   # Balanced for semantic analysis
    
    def get_api_key(self) -> Optional[str]:
        """Get API key from config or environment"""
        return self.api_key or os.getenv("ANTHROPIC_API_KEY")
    
    def create_client(self) -> Optional[Anthropic]:
        """Create an Anthropic client with current configuration"""
        api_key = self.get_api_key()
        if not api_key:
            return None
            
        client_kwargs = {
            "api_key": api_key,
            "timeout": self.timeout,
            "max_retries": self.max_retries
        }
        
        if self.base_url:
            client_kwargs["base_url"] = self.base_url
            
        return Anthropic(**client_kwargs)
    
    def get_model_config(self, agent_type: str = "default") -> Dict[str, Any]:
        """Get model configuration for specific agent type"""
        base_config = {
            "model": self.default_model,
            "max_tokens": self.max_tokens,
            "top_p": self.top_p,
            "top_k": self.top_k
        }
        
        # Agent-specific temperature settings
        temperature_map = {
            "validator": self.validator_temperature,
            "mutation": self.mutation_temperature,
            "semantic": self.semantic_temperature,
            "dependency": self.temperature,
            "impact": self.temperature,
            "conflict": self.temperature
        }
        
        base_config["temperature"] = temperature_map.get(agent_type, self.temperature)
        return base_config
    
    def is_configured(self) -> bool:
        """Check if Claude is properly configured"""
        return self.get_api_key() is not None


# Global Claude configuration instance
claude_config = ClaudeConfig()


def get_claude_client() -> Optional[Anthropic]:
    """Get a configured Claude client"""
    return claude_config.create_client()


def update_claude_config(**kwargs) -> None:
    """Update Claude configuration"""
    global claude_config
    for key, value in kwargs.items():
        if hasattr(claude_config, key):
            setattr(claude_config, key, value)


def is_claude_available() -> bool:
    """Check if Claude is available and configured"""
    return claude_config.is_configured()