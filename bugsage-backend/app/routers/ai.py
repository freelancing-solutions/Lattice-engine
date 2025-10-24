from typing import Dict, Any, List, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_session
from app.ai.agent import AIAgent, AIProvider
from app.ai.models import AnalysisRequest, CodeAnalysisRequest, BugReportRequest, AnalysisResponse, CodeAnalysisResponse, BugReportResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])


class AgentResponse(BaseModel):
    """Response model for AI agent operations."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    provider: Optional[str] = None


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_bug(
    request: AnalysisRequest,
    session: AsyncSession = Depends(get_session)
) -> AnalysisResponse:
    """
    Analyze a bug report and provide root cause analysis and fix suggestions.
    
    Args:
        request: Analysis request containing bug report details
        session: Database session
        
    Returns:
        Analysis response with root cause, fix suggestions, and explanation
    """
    try:
        # Initialize AI agent with the specified provider
        agent = AIAgent(provider=request.provider)
        
        # Perform bug analysis
        analysis_result = await agent.analyze_bug(
            title=request.title,
            description=request.description,
            steps_to_reproduce=request.steps_to_reproduce,
            expected_behavior=request.expected_behavior,
            actual_behavior=request.actual_behavior,
            environment=request.environment
        )
        
        # Convert to response model
        return AnalysisResponse(
            analysis=analysis_result["analysis"],
            fix=analysis_result["fix"],
            explanation=analysis_result["explanation"],
            provider=request.provider
        )
        
    except Exception as e:
        logger.error(f"Error analyzing bug: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze bug: {str(e)}"
        )


@router.post("/analyze-code", response_model=CodeAnalysisResponse)
async def analyze_code(
    request: CodeAnalysisRequest,
    session: AsyncSession = Depends(get_session)
) -> CodeAnalysisResponse:
    """
    Analyze code and provide bug identification and fix suggestions.
    
    Args:
        request: Code analysis request containing code and context
        session: Database session
        
    Returns:
        Code analysis response with identified bugs, fixes, and explanation
    """
    try:
        # Initialize AI agent with the specified provider
        agent = AIAgent(provider=request.provider)
        
        # Perform code analysis
        analysis_result = await agent.analyze_code(
            code=request.code,
            language=request.language,
            file_path=request.file_path,
            context=request.context
        )
        
        # Convert to response model
        return CodeAnalysisResponse(
            bugs=analysis_result["bugs"],
            fixes=analysis_result["fixes"],
            explanation=analysis_result["explanation"],
            provider=request.provider
        )
        
    except Exception as e:
        logger.error(f"Error analyzing code: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze code: {str(e)}"
        )


@router.post("/report-bug", response_model=BugReportResponse)
async def report_bug(
    request: BugReportRequest,
    session: AsyncSession = Depends(get_session)
) -> BugReportResponse:
    """
    Generate a comprehensive bug report based on issue description.
    
    Args:
        request: Bug report request containing issue details
        session: Database session
        
    Returns:
        Bug report response with structured bug report
    """
    try:
        # Initialize AI agent with the specified provider
        agent = AIAgent(provider=request.provider)
        
        # Generate bug report
        report_result = await agent.generate_bug_report(
            title=request.title,
            description=request.description,
            code=request.code,
            error_message=request.error_message,
            additional_context=request.additional_context
        )
        
        # Convert to response model
        return BugReportResponse(
            bug_report=report_result["bug_report"],
            provider=request.provider
        )
        
    except Exception as e:
        logger.error(f"Error generating bug report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate bug report: {str(e)}"
        )


@router.get("/providers", response_model=List[str])
async def get_providers() -> List[str]:
    """
    Get list of available AI providers.
    
    Returns:
        List of provider names
    """
    return [provider.value for provider in AIProvider]


@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(
    message: str,
    provider: AIProvider = AIProvider.OPENAI,
    session: AsyncSession = Depends(get_session)
) -> AgentResponse:
    """
    Chat with the AI agent.
    
    Args:
        message: Message to send to the agent
        provider: AI provider to use
        session: Database session
        
    Returns:
        Agent response with the agent's reply
    """
    try:
        # Initialize AI agent with the specified provider
        agent = AIAgent(provider=provider)
        
        # Get agent response
        response = await agent.chat(message)
        
        return AgentResponse(
            success=True,
            message="Response generated successfully",
            data={"response": response},
            provider=provider.value
        )
        
    except Exception as e:
        logger.error(f"Error in chat with agent: {str(e)}")
        return AgentResponse(
            success=False,
            message=f"Failed to generate response: {str(e)}",
            provider=provider.value
        )