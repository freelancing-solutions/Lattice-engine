from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class AIProvider(str, Enum):
    """Available AI providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"


class AnalysisRequest(BaseModel):
    """Request model for bug analysis."""
    title: str = Field(..., description="Title of the bug report")
    description: str = Field(..., description="Description of the bug")
    steps_to_reproduce: Optional[str] = Field(None, description="Steps to reproduce the bug")
    expected_behavior: Optional[str] = Field(None, description="Expected behavior")
    actual_behavior: Optional[str] = Field(None, description="Actual behavior")
    environment: Optional[Dict[str, Any]] = Field(None, description="Environment information")
    provider: AIProvider = Field(AIProvider.OPENAI, description="AI provider to use")


class AnalysisResponse(BaseModel):
    """Response model for bug analysis."""
    analysis: str = Field(..., description="Root cause analysis")
    fix: str = Field(..., description="Fix suggestion")
    explanation: str = Field(..., description="Explanation of the fix")
    provider: AIProvider = Field(..., description="AI provider used")


class CodeAnalysisRequest(BaseModel):
    """Request model for code analysis."""
    code: str = Field(..., description="Code to analyze")
    language: str = Field(..., description="Programming language")
    file_path: Optional[str] = Field(None, description="File path")
    context: Optional[str] = Field(None, description="Additional context")
    provider: AIProvider = Field(AIProvider.OPENAI, description="AI provider to use")


class CodeAnalysisResponse(BaseModel):
    """Response model for code analysis."""
    bugs: List[Dict[str, Any]] = Field(..., description="List of identified bugs")
    fixes: List[Dict[str, Any]] = Field(..., description="List of fix suggestions")
    explanation: str = Field(..., description="Explanation of the issues and fixes")
    provider: AIProvider = Field(..., description="AI provider used")


class BugReportRequest(BaseModel):
    """Request model for bug report generation."""
    title: str = Field(..., description="Title of the bug")
    description: str = Field(..., description="Description of the bug")
    code: Optional[str] = Field(None, description="Code related to the bug")
    error_message: Optional[str] = Field(None, description="Error message")
    additional_context: Optional[str] = Field(None, description="Additional context")
    provider: AIProvider = Field(AIProvider.OPENAI, description="AI provider to use")


class BugReportResponse(BaseModel):
    """Response model for bug report generation."""
    bug_report: Dict[str, Any] = Field(..., description="Generated bug report")
    provider: AIProvider = Field(..., description="AI provider used")


class ChatRequest(BaseModel):
    """Request model for chat with AI agent."""
    message: str = Field(..., description="Message to send to the agent")
    provider: AIProvider = Field(AIProvider.OPENAI, description="AI provider to use")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")


class ChatResponse(BaseModel):
    """Response model for chat with AI agent."""
    response: str = Field(..., description="Agent's response")
    conversation_id: Optional[str] = Field(None, description="Conversation ID")
    provider: AIProvider = Field(..., description="AI provider used")