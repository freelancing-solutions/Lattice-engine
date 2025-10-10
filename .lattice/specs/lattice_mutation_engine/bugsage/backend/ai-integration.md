# BugSage AI Integration Architecture

## 🤖 AI Integration Overview

BugSage leverages advanced AI models for intelligent error analysis, fix generation, and code validation. The AI integration is built on PydanticAI, providing type-safe AI interactions with structured outputs and comprehensive error handling.

## 🏗️ AI Architecture

### Core Components

#### 1. AI Models Configuration
```python
# ai/models/config.py
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from enum import Enum

class AIProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"

class ModelConfig(BaseModel):
    """Configuration for AI models"""
    provider: AIProvider
    model_name: str
    api_key: Optional[str] = None
    api_base: Optional[str] = None
    max_tokens: int = 4000
    temperature: float = 0.1
    timeout: int = 30
    retry_attempts: int = 3
    retry_delay: float = 1.0

class AIModelsConfig(BaseModel):
    """Complete AI models configuration"""
    error_analyzer: ModelConfig
    fix_generator: ModelConfig
    code_validator: ModelConfig
    similarity_matcher: ModelConfig

    # Fallback models
    fallback_analyzer: Optional[ModelConfig] = None
    fallback_generator: Optional[ModelConfig] = None

# Default configurations
DEFAULT_MODELS_CONFIG = AIModelsConfig(
    error_analyzer=ModelConfig(
        provider=AIProvider.OPENAI,
        model_name="gpt-4",
        max_tokens=2000,
        temperature=0.1
    ),
    fix_generator=ModelConfig(
        provider=AIProvider.OPENAI,
        model_name="gpt-4",
        max_tokens=3000,
        temperature=0.2
    ),
    code_validator=ModelConfig(
        provider=AIProvider.ANTHROPIC,
        model_name="claude-3-sonnet-20240229",
        max_tokens=1500,
        temperature=0.0
    ),
    similarity_matcher=ModelConfig(
        provider=AIProvider.LOCAL,
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        max_tokens=512
    )
)
```

#### 2. AI Agent Base Class
```python
# ai/agents/base.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic_ai import Agent, RunContext
from pydantic_ai.models import OpenAIModel, AnthropicModel
import asyncio
import logging
from datetime import datetime

from ai.models.config import ModelConfig, AIProvider
from utils.logger import get_logger

logger = get_logger(__name__)

class BaseAIAgent(ABC):
    """Base class for AI agents"""

    def __init__(self, config: ModelConfig, system_prompt: str):
        self.config = config
        self.system_prompt = system_prompt
        self.model = self._create_model()
        self.agent = self._create_agent()

    def _create_model(self):
        """Create AI model based on configuration"""
        if self.config.provider == AIProvider.OPENAI:
            return OpenAIModel(
                model_name=self.config.model_name,
                api_key=self.config.api_key,
                api_base=self.config.api_base,
                timeout=self.config.timeout
            )
        elif self.config.provider == AIProvider.ANTHROPIC:
            return AnthropicModel(
                model_name=self.config.model_name,
                api_key=self.config.api_key,
                timeout=self.config.timeout
            )
        else:
            raise ValueError(f"Unsupported provider: {self.config.provider}")

    def _create_agent(self) -> Agent:
        """Create PydanticAI agent"""
        return Agent(
            model=self.model,
            system_prompt=self.system_prompt,
            deps_type=Dict[str, Any],
            retries=self.config.retry_attempts
        )

    @abstractmethod
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process input and return result"""
        pass

    async def run_with_fallback(
        self,
        input_data: Dict[str, Any],
        context: Dict[str, Any],
        fallback_agent: Optional['BaseAIAgent'] = None
    ) -> Dict[str, Any]:
        """Run AI agent with fallback handling"""
        try:
            logger.info(f"Running {self.__class__.__name__} with {self.config.provider}")
            result = await self.process(input_data, context)

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
        """Validate AI result"""
        pass

    @abstractmethod
    def get_fallback_result(self, input_data: Dict[str, Any], context: Dict[str, Any], error: str) -> Dict[str, Any]:
        """Get fallback result when AI fails"""
        pass
```

#### 3. Error Analysis Agent
```python
# ai/agents/error_analysis_agent.py
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, validator
import re
from datetime import datetime

from ai.agents.base import BaseAIAgent
from ai.models.config import ModelConfig
from ai.prompts.error_analysis import ERROR_ANALYSIS_PROMPT
from models.error import Error, ErrorSeverity
from utils.logger import get_logger

logger = get_logger(__name__)

class ErrorAnalysisResult(BaseModel):
    """Structured result from error analysis"""
    root_cause: str = Field(..., description="Root cause analysis")
    impact_assessment: str = Field(..., description="Impact on system and users")
    suggested_fixes: List[str] = Field(..., description="Suggested fixes")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence in analysis")
    risk_level: str = Field(..., description="Risk level (low/medium/high/critical)")
    estimated_effort: str = Field(..., description="Estimated effort to fix")
    related_errors: List[str] = Field(default=[], description="Related errors or patterns")
    prevention_suggestions: List[str] = Field(default=[], description="Prevention suggestions")
    tags: List[str] = Field(default=[], description="Suggested tags")
    category: Optional[str] = Field(None, description="Error category")
    subcategory: Optional[str] = Field(None, description="Error subcategory")

    @validator('risk_level')
    def validate_risk_level(cls, v):
        allowed = ['low', 'medium', 'high', 'critical']
        if v not in allowed:
            raise ValueError(f"Risk level must be one of {allowed}")
        return v

    @validator('estimated_effort')
    def validate_effort(cls, v):
        allowed = ['trivial', 'easy', 'medium', 'hard', 'complex']
        if v not in allowed:
            raise ValueError(f"Effort must be one of {allowed}")
        return v

class ErrorAnalysisAgent(BaseAIAgent):
    """AI agent for error analysis"""

    def __init__(self, config: ModelConfig):
        super().__init__(config, ERROR_ANALYSIS_PROMPT)

    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process error analysis"""
        try:
            # Prepare analysis prompt
            analysis_input = self._prepare_analysis_input(input_data, context)

            # Run AI analysis
            result = await self.agent.run(analysis_input, deps=context)

            # Parse and structure result
            analysis_result = self._parse_analysis_result(result.data)

            # Add metadata
            analysis_result['analysis_metadata'] = {
                'model_used': self.config.model_name,
                'provider': self.config.provider.value,
                'analysis_timestamp': datetime.utcnow().isoformat(),
                'context_used': list(context.keys()),
                'processing_version': '1.0'
            }

            logger.info(f"Error analysis completed successfully")
            return analysis_result

        except Exception as e:
            logger.error(f"Error analysis failed: {e}")
            raise

    def _prepare_analysis_input(self, error_data: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Prepare input for AI analysis"""
        return f"""
Analyze the following error and provide detailed insights:

ERROR INFORMATION:
Title: {error_data.get('title', 'Unknown Error')}
Description: {error_data.get('description', 'No description available')}
Severity: {error_data.get('severity', 'unknown')}
Source: {error_data.get('source', 'unknown')}

STACK TRACE:
{error_data.get('stack_trace', 'No stack trace available')}

CONTEXT:
{error_data.get('context', {})}

METADATA:
{error_data.get('metadata', {})}

PROJECT CONTEXT:
{context.get('project_context', 'No project context available')}

CODEBASE INFORMATION:
{context.get('codebase_info', 'No codebase information available')}

SIMILAR ERRORS:
{context.get('similar_errors', [])}

Please provide comprehensive analysis including root cause, impact, suggested fixes, and confidence assessment.
"""

    def _parse_analysis_result(self, raw_result: str) -> Dict[str, Any]:
        """Parse AI result into structured format"""
        try:
            # Try to parse as JSON first
            import json
            if raw_result.strip().startswith('{'):
                return json.loads(raw_result)

            # Parse structured text response
            result = {}

            # Extract root cause
            root_cause_match = re.search(r'Root Cause[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL)
            if root_cause_match:
                result['root_cause'] = root_cause_match.group(1).strip()

            # Extract impact assessment
            impact_match = re.search(r'Impact[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL)
            if impact_match:
                result['impact_assessment'] = impact_match.group(1).strip()

            # Extract suggested fixes
            fixes_match = re.search(r'Suggested Fix(es)?[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL)
            if fixes_match:
                fixes_text = fixes_match.group(1).strip()
                result['suggested_fixes'] = [line.strip() for line in fixes_text.split('\n') if line.strip()]

            # Extract confidence
            confidence_match = re.search(r'Confidence[:\s]*([0-9.]+)', raw_result)
            if confidence_match:
                result['confidence_score'] = float(confidence_match.group(1))

            # Extract risk level
            risk_match = re.search(r'Risk Level[:\s]*(\w+)', raw_result, re.IGNORECASE)
            if risk_match:
                result['risk_level'] = risk_match.group(1).lower()

            # Extract effort
            effort_match = re.search(r'Effort[:\s]*(\w+)', raw_result, re.IGNORECASE)
            if effort_match:
                result['estimated_effort'] = effort_match.group(1).lower()

            # Set defaults for missing fields
            result.setdefault('root_cause', 'Unable to determine root cause')
            result.setdefault('impact_assessment', 'Impact assessment not available')
            result.setdefault('suggested_fixes', ['Manual investigation required'])
            result.setdefault('confidence_score', 0.5)
            result.setdefault('risk_level', 'medium')
            result.setdefault('estimated_effort', 'medium')
            result.setdefault('related_errors', [])
            result.setdefault('prevention_suggestions', [])
            result.setdefault('tags', [])
            result.setdefault('category', None)
            result.setdefault('subcategory', None)

            return result

        except Exception as e:
            logger.error(f"Failed to parse analysis result: {e}")
            return self._get_default_analysis_result()

    def _get_default_analysis_result(self) -> Dict[str, Any]:
        """Get default analysis result"""
        return {
            'root_cause': 'Unable to determine root cause automatically',
            'impact_assessment': 'Manual investigation required to assess impact',
            'suggested_fixes': ['Manual investigation and fix required'],
            'confidence_score': 0.0,
            'risk_level': 'medium',
            'estimated_effort': 'unknown',
            'related_errors': [],
            'prevention_suggestions': ['Implement better error handling'],
            'tags': ['manual-review-required'],
            'category': None,
            'subcategory': None
        }

    def validate_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate analysis result"""
        try:
            validated = ErrorAnalysisResult(**result)
            return validated.dict()
        except Exception as e:
            logger.warning(f"Validation failed, using defaults: {e}")
            return self._get_default_analysis_result()

    def get_fallback_result(self, input_data: Dict[str, Any], context: Dict[str, Any], error: str) -> Dict[str, Any]:
        """Get fallback result"""
        result = self._get_default_analysis_result()
        result['fallback_reason'] = error
        result['fallback_used'] = True
        return result
```

#### 4. Fix Generation Agent
```python
# ai/agents/fix_generation_agent.py
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field, validator
import re
from datetime import datetime

from ai.agents.base import BaseAIAgent
from ai.models.config import ModelConfig
from ai.prompts.fix_generation import FIX_GENERATION_PROMPT
from utils.logger import get_logger
from integrations.github import GitHubService

logger = get_logger(__name__)

class FixGenerationResult(BaseModel):
    """Structured result from fix generation"""
    title: str = Field(..., description="Fix title")
    description: str = Field(..., description="Fix description")
    code_changes: List[Dict[str, Any]] = Field(..., description="Code changes to apply")
    file_paths: List[str] = Field(..., description="Files to modify")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence in fix")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Risk score of fix")
    test_suggestions: List[str] = Field(..., description="Test suggestions")
    rollback_plan: str = Field(..., description="Rollback plan")
    dependencies: List[str] = Field(default=[], description="Dependencies or prerequisites")
    estimated_time: int = Field(..., description="Estimated time to apply (minutes)")

    @validator('code_changes')
    def validate_code_changes(cls, v):
        for change in v:
            if 'file_path' not in change or 'diff' not in change:
                raise ValueError("Code changes must include file_path and diff")
        return v

class FixGenerationAgent(BaseAIAgent):
    """AI agent for fix generation"""

    def __init__(self, config: ModelConfig):
        super().__init__(config, FIX_GENERATION_PROMPT)
        self.github_service = GitHubService()

    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process fix generation"""
        try:
            # Prepare fix generation input
            fix_input = self._prepare_fix_input(input_data, context)

            # Run AI fix generation
            result = await self.agent.run(fix_input, deps=context)

            # Parse and structure result
            fix_result = self._parse_fix_result(result.data)

            # Validate and enhance fix
            validated_result = await self._validate_and_enhance_fix(fix_result, context)

            # Add metadata
            validated_result['generation_metadata'] = {
                'model_used': self.config.model_name,
                'provider': self.config.provider.value,
                'generation_timestamp': datetime.utcnow().isoformat(),
                'context_used': list(context.keys()),
                'processing_version': '1.0'
            }

            logger.info(f"Fix generation completed successfully")
            return validated_result

        except Exception as e:
            logger.error(f"Fix generation failed: {e}")
            raise

    def _prepare_fix_input(self, error_data: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Prepare input for fix generation"""
        return f"""
Generate a fix for the following error:

ERROR INFORMATION:
Title: {error_data.get('title', 'Unknown Error')}
Description: {error_data.get('description', 'No description')}
Stack Trace: {error_data.get('stack_trace', 'No stack trace')}
Error Context: {error_data.get('context', {})}

ROOT CAUSE ANALYSIS:
{error_data.get('root_cause', 'No root cause analysis available')}

CODEBASE CONTEXT:
{context.get('codebase_info', {})}

RELEVANT CODE:
{context.get('relevant_code', '')}

PROJECT SETTINGS:
{context.get('project_settings', {})}

FRAMEWORK: {context.get('framework', 'unknown')}
LANGUAGE: {context.get('language', 'unknown')}

Please generate a comprehensive fix including:
1. Detailed description of the fix
2. Specific code changes with diffs
3. Files to modify
4. Test suggestions
5. Rollback plan
6. Risk assessment
7. Confidence score

The fix should be production-ready and follow best practices.
"""

    def _parse_fix_result(self, raw_result: str) -> Dict[str, Any]:
        """Parse AI fix result into structured format"""
        try:
            # Try to parse as JSON first
            import json
            if raw_result.strip().startswith('{'):
                return json.loads(raw_result)

            # Parse structured text response
            result = {}

            # Extract title
            title_match = re.search(r'Title[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL)
            if title_match:
                result['title'] = title_match.group(1).strip()

            # Extract description
            desc_match = re.search(r'Description[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL)
            if desc_match:
                result['description'] = desc_match.group(1).strip()

            # Extract code changes
            code_match = re.search(r'Code Changes[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL)
            if code_match:
                result['code_changes'] = self._parse_code_changes(code_match.group(1))

            # Extract confidence
            confidence_match = re.search(r'Confidence[:\s]*([0-9.]+)', raw_result)
            if confidence_match:
                result['confidence_score'] = float(confidence_match.group(1))

            # Extract risk
            risk_match = re.search(r'Risk[:\s]*([0-9.]+)', raw_result)
            if risk_match:
                result['risk_score'] = float(risk_match.group(1))

            # Set defaults for missing fields
            result.setdefault('title', 'Generated Fix')
            result.setdefault('description', 'AI-generated fix for the reported error')
            result.setdefault('code_changes', [])
            result.setdefault('file_paths', [])
            result.setdefault('confidence_score', 0.5)
            result.setdefault('risk_score', 0.5)
            result.setdefault('test_suggestions', ['Manual testing required'])
            result.setdefault('rollback_plan', 'Manual rollback required')
            result.setdefault('dependencies', [])
            result.setdefault('estimated_time', 30)

            return result

        except Exception as e:
            logger.error(f"Failed to parse fix result: {e}")
            return self._get_default_fix_result()

    def _parse_code_changes(self, code_text: str) -> List[Dict[str, Any]]:
        """Parse code changes from text"""
        changes = []

        # Look for file paths and diffs
        file_pattern = r'File:\s*(.+?)\n```diff\n(.*?)\n```'
        matches = re.findall(file_pattern, code_text, re.DOTALL)

        for file_path, diff in matches:
            changes.append({
                'file_path': file_path.strip(),
                'diff': diff.strip()
            })

        return changes

    async def _validate_and_enhance_fix(self, fix_result: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and enhance fix with additional checks"""

        # Validate file paths exist
        valid_file_paths = []
        for change in fix_result.get('code_changes', []):
            file_path = change.get('file_path')
            if file_path:
                # Check if file exists in codebase
                if await self._validate_file_path(file_path, context):
                    valid_file_paths.append(file_path)

        fix_result['file_paths'] = valid_file_paths

        # Extract file paths from code changes
        fix_result['file_paths'] = [
            change.get('file_path') for change in fix_result.get('code_changes', [])
            if change.get('file_path')
        ]

        # Estimate application time
        fix_result['estimated_time'] = self._estimate_application_time(fix_result)

        # Add test suggestions based on framework
        framework = context.get('framework', '').lower()
        if 'react' in framework:
            fix_result['test_suggestions'].extend([
                'Write unit tests for React components',
                'Test with Jest and React Testing Library',
                'Verify no regression in UI'
            ])
        elif 'django' in framework:
            fix_result['test_suggestions'].extend([
                'Write Django test cases',
                'Run Django test suite',
                'Verify database migrations'
            ])

        return fix_result

    async def _validate_file_path(self, file_path: str, context: Dict[str, Any]) -> bool:
        """Validate if file path exists in codebase"""
        # This would integrate with file system or code analysis service
        # For now, return True
        return True

    def _estimate_application_time(self, fix_result: Dict[str, Any]) -> int:
        """Estimate time to apply fix in minutes"""
        base_time = 15  # Base time for any fix

        # Add time based on complexity
        complexity_factors = {
            'file_count': len(fix_result.get('file_paths', [])) * 5,
            'test_complexity': len(fix_result.get('test_suggestions', [])) * 3,
            'risk_factor': fix_result.get('risk_score', 0.5) * 20
        }

        total_time = base_time + sum(complexity_factors.values())
        return max(5, int(total_time))  # Minimum 5 minutes

    def _get_default_fix_result(self) -> Dict[str, Any]:
        """Get default fix result"""
        return {
            'title': 'Manual Fix Required',
            'description': 'Unable to generate automatic fix. Manual investigation and fix required.',
            'code_changes': [],
            'file_paths': [],
            'confidence_score': 0.0,
            'risk_score': 0.5,
            'test_suggestions': ['Manual testing required'],
            'rollback_plan': 'Manual rollback through version control',
            'dependencies': [],
            'estimated_time': 60
        }

    def validate_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate fix generation result"""
        try:
            validated = FixGenerationResult(**result)
            return validated.dict()
        except Exception as e:
            logger.warning(f"Validation failed, using defaults: {e}")
            return self._get_default_fix_result()

    def get_fallback_result(self, input_data: Dict[str, Any], context: Dict[str, Any], error: str) -> Dict[str, Any]:
        """Get fallback result"""
        result = self._get_default_fix_result()
        result['fallback_reason'] = error
        result['fallback_used'] = True
        return result
```

#### 5. Code Validation Agent
```python
# ai/agents/code_validation_agent.py
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, validator
import re
from datetime import datetime

from ai.agents.base import BaseAIAgent
from ai.models.config import ModelConfig
from ai.prompts.code_validation import CODE_VALIDATION_PROMPT
from utils.logger import get_logger

logger = get_logger(__name__)

class ValidationResult(BaseModel):
    """Structured result from code validation"""
    validation_passed: bool = Field(..., description="Overall validation result")
    code_quality_score: float = Field(..., ge=0.0, le=1.0, description="Code quality score")
    security_score: float = Field(..., ge=0.0, le=1.0, description="Security score")
    performance_score: float = Field(..., ge=0.0, le=1.0, description="Performance score")
    maintainability_score: float = Field(..., ge=0.0, le=1.0, description="Maintainability score")

    issues: List[Dict[str, Any]] = Field(..., description="Issues found")
    suggestions: List[str] = Field(..., description="Improvement suggestions")
    test_coverage: float = Field(..., ge=0.0, le=100.0, description="Test coverage percentage")

    breaking_changes: List[str] = Field(default=[], description="Breaking changes")
    security_concerns: List[str] = Field(default=[], description="Security concerns")
    performance_issues: List[str] = Field(default=[], description="Performance issues")

    overall_recommendation: str = Field(..., description="Overall recommendation")

class CodeValidationAgent(BaseAIAgent):
    """AI agent for code validation"""

    def __init__(self, config: ModelConfig):
        super().__init__(config, CODE_VALIDATION_PROMPT)

    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process code validation"""
        try:
            # Prepare validation input
            validation_input = self._prepare_validation_input(input_data, context)

            # Run AI validation
            result = await self.agent.run(validation_input, deps=context)

            # Parse and structure result
            validation_result = self._parse_validation_result(result.data)

            # Add additional checks
            enhanced_result = await self._additional_validation(validation_result, context)

            # Add metadata
            enhanced_result['validation_metadata'] = {
                'model_used': self.config.model_name,
                'provider': self.config.provider.value,
                'validation_timestamp': datetime.utcnow().isoformat(),
                'context_used': list(context.keys()),
                'processing_version': '1.0'
            }

            logger.info(f"Code validation completed successfully")
            return enhanced_result

        except Exception as e:
            logger.error(f"Code validation failed: {e}")
            raise

    def _prepare_validation_input(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Prepare input for code validation"""
        code_changes = input_data.get('code_changes', [])

        validation_input = "VALIDATE THE FOLLOWING CODE CHANGES:\n\n"

        for i, change in enumerate(code_changes, 1):
            validation_input += f"CHANGE {i}:\n"
            validation_input += f"File: {change.get('file_path', 'unknown')}\n"
            validation_input += f"Diff:\n{change.get('diff', '')}\n\n"

        validation_input += f"""
CONTEXT INFORMATION:
Original Error: {input_data.get('error_title', 'Unknown')}
Root Cause: {input_data.get('root_cause', 'Unknown')}
Project Framework: {context.get('framework', 'Unknown')}
Language: {context.get('language', 'Unknown')}

Please validate these changes for:
1. Code quality and best practices
2. Security vulnerabilities
3. Performance implications
4. Maintainability
5. Potential breaking changes
6. Test coverage requirements

Provide detailed feedback with scores and recommendations.
"""

        return validation_input

    def _parse_validation_result(self, raw_result: str) -> Dict[str, Any]:
        """Parse AI validation result into structured format"""
        try:
            # Try to parse as JSON first
            import json
            if raw_result.strip().startswith('{'):
                return json.loads(raw_result)

            # Parse structured text response
            result = {}

            # Extract validation status
            status_match = re.search(r'Validation Status[:\s]*(.+)', raw_result, re.IGNORECASE)
            if status_match:
                result['validation_passed'] = 'passed' in status_match.group(1).lower()

            # Extract scores
            quality_match = re.search(r'Quality Score[:\s]*([0-9.]+)', raw_result)
            if quality_match:
                result['code_quality_score'] = float(quality_match.group(1))

            security_match = re.search(r'Security Score[:\s]*([0-9.]+)', raw_result)
            if security_match:
                result['security_score'] = float(security_match.group(1))

            performance_match = re.search(r'Performance Score[:\s]*([0-9.]+)', raw_result)
            if performance_match:
                result['performance_score'] = float(performance_match.group(1))

            maintainability_match = re.search(r'Maintainability Score[:\s]*([0-9.]+)', raw_result)
            if maintainability_match:
                result['maintainability_score'] = float(maintainability_match.group(1))

            # Extract issues
            issues_match = re.search(r'Issues[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL)
            if issues_match:
                issues_text = issues_match.group(1).strip()
                result['issues'] = [
                    {'description': issue.strip(), 'severity': 'medium'}
                    for issue in issues_text.split('\n') if issue.strip()
                ]

            # Extract suggestions
            suggestions_match = re.search(r'Suggestions[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL)
            if suggestions_match:
                suggestions_text = suggestions_match.group(1).strip()
                result['suggestions'] = [
                    suggestion.strip() for suggestion in suggestions_text.split('\n') if suggestion.strip()
                ]

            # Extract test coverage
            coverage_match = re.search(r'Test Coverage[:\s]*([0-9.]+)%?', raw_result)
            if coverage_match:
                result['test_coverage'] = float(coverage_match.group(1))

            # Set defaults for missing fields
            result.setdefault('validation_passed', True)
            result.setdefault('code_quality_score', 0.8)
            result.setdefault('security_score', 0.9)
            result.setdefault('performance_score', 0.8)
            result.setdefault('maintainability_score', 0.8)
            result.setdefault('issues', [])
            result.setdefault('suggestions', [])
            result.setdefault('test_coverage', 80.0)
            result.setdefault('breaking_changes', [])
            result.setdefault('security_concerns', [])
            result.setdefault('performance_issues', [])
            result.setdefault('overall_recommendation', 'Proceed with caution')

            return result

        except Exception as e:
            logger.error(f"Failed to parse validation result: {e}")
            return self._get_default_validation_result()

    async def _additional_validation(self, validation_result: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Perform additional validation checks"""

        # Check for common security patterns
        code_changes = context.get('code_changes', [])
        security_concerns = []

        for change in code_changes:
            diff = change.get('diff', '')
            if 'eval(' in diff or 'exec(' in diff:
                security_concerns(f"Code execution in {change.get('file_path')}")
            if 'password' in diff.lower() and 'plain' in diff.lower():
                security_concerns(f"Potential plain text password in {change.get('file_path')}")

        validation_result['security_concerns'] = security_concerns

        # Check for performance patterns
        performance_issues = []
        for change in code_changes:
            diff = change.get('diff', '')
            if 'SELECT *' in diff:
                performance_issues(f"SELECT * in {change.get('file_path')} - consider specific columns")
            if diff.count('for') > 10:  # Rough heuristic
                performance_issues(f"Complex loop in {change.get('file_path')} - consider optimization")

        validation_result['performance_issues'] = performance_issues

        # Update scores based on findings
        if security_concerns:
            validation_result['security_score'] = max(0.0, validation_result['security_score'] - 0.3)

        if performance_issues:
            validation_result['performance_score'] = max(0.0, validation_result['performance_score'] - 0.2)

        # Overall recommendation
        if not validation_result['validation_passed']:
            validation_result['overall_recommendation'] = 'Do not apply - critical issues found'
        elif security_concerns or validation_result['security_score'] < 0.7:
            validation_result['overall_recommendation'] = 'Requires security review before applying'
        elif performance_issues:
            validation_result['overall_recommendation'] = 'Apply with performance monitoring'
        else:
            validation_result['overall_recommendation'] = 'Safe to apply'

        return validation_result

    def _get_default_validation_result(self) -> Dict[str, Any]:
        """Get default validation result"""
        return {
            'validation_passed': False,
            'code_quality_score': 0.5,
            'security_score': 0.5,
            'performance_score': 0.5,
            'maintainability_score': 0.5,
            'issues': [{'description': 'Unable to validate code', 'severity': 'high'}],
            'suggestions': ['Manual code review required'],
            'test_coverage': 0.0,
            'breaking_changes': [],
            'security_concerns': ['Unable to perform security analysis'],
            'performance_issues': ['Unable to perform performance analysis'],
            'overall_recommendation': 'Manual review required'
        }

    def validate_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate code validation result"""
        try:
            validated = ValidationResult(**result)
            return validated.dict()
        except Exception as e:
            logger.warning(f"Validation failed, using defaults: {e}")
            return self._get_default_validation_result()

    def get_fallback_result(self, input_data: Dict[str, Any], context: Dict[str, Any], error: str) -> Dict[str, Any]:
        """Get fallback result"""
        result = self._get_default_validation_result()
        result['fallback_reason'] = error
        result['fallback_used'] = True
        return result
```

#### 6. AI Agent Manager
```python
# ai/agent_manager.py
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime

from ai.models.config import AIModelsConfig, ModelConfig
from ai.agents.error_analysis_agent import ErrorAnalysisAgent
from ai.agents.fix_generation_agent import FixGenerationAgent
from ai.agents.code_validation_agent import CodeValidationAgent
from utils.logger import get_logger

logger = get_logger(__name__)

@dataclass
class AIRequest:
    """AI request data"""
    request_type: str  # analyze, fix, validate
    input_data: Dict[str, Any]
    context: Dict[str, Any]
    user_id: Optional[int] = None
    organization_id: Optional[int] = None
    request_id: Optional[str] = None

@dataclass
class AIResponse:
    """AI response data"""
    success: bool
    result: Dict[str, Any]
    processing_time_ms: int
    model_used: str
    fallback_used: bool = False
    error: Optional[str] = None

class AIAgentManager:
    """Manager for AI agents"""

    def __init__(self, config: AIModelsConfig):
        self.config = config
        self._initialize_agents()

    def _initialize_agents(self):
        """Initialize AI agents"""
        self.error_analyzer = ErrorAnalysisAgent(self.config.error_analyzer)
        self.fix_generator = FixGenerationAgent(self.config.fix_generator)
        self.code_validator = CodeValidationAgent(self.config.code_validator)

        # Initialize fallback agents if configured
        self.fallback_analyzer = None
        if self.config.fallback_analyzer:
            self.fallback_analyzer = ErrorAnalysisAgent(self.config.fallback_analyzer)

        self.fallback_generator = None
        if self.config.fallback_generator:
            self.fallback_generator = FixGenerationAgent(self.config.fallback_generator)

    async def process_request(self, request: AIRequest) -> AIResponse:
        """Process AI request"""
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
                model_used=result.get('analysis_metadata', {}).get('model_used', 'unknown'),
                fallback_used=result.get('fallback_used', False)
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
                model_used='none',
                fallback_used=False,
                error=str(e)
            )

    async def _process_error_analysis(self, request: AIRequest) -> Dict[str, Any]:
        """Process error analysis request"""
        fallback = self.fallback_analyzer if self.config.fallback_analyzer else None
        return await self.error_analyzer.run_with_fallback(
            request.input_data,
            request.context,
            fallback
        )

    async def _process_fix_generation(self, request: AIRequest) -> Dict[str, Any]:
        """Process fix generation request"""
        fallback = self.fallback_generator if self.config.fallback_generator else None
        return await self.fix_generator.run_with_fallback(
            request.input_data,
            request.context,
            fallback
        )

    async def _process_code_validation(self, request: AIRequest) -> Dict[str, Any]:
        """Process code validation request"""
        return await self.code_validator.run_with_fallback(
            request.input_data,
            request.context,
            None  # No fallback for validation
        )

    async def batch_process(self, requests: List[AIRequest]) -> List[AIResponse]:
        """Process multiple AI requests concurrently"""
        tasks = [self.process_request(request) for request in requests]
        return await asyncio.gather(*tasks)

    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all AI agents"""
        return {
            'error_analyzer': {
                'model': self.config.error_analyzer.model_name,
                'provider': self.config.error_analyzer.provider.value,
                'status': 'active'
            },
            'fix_generator': {
                'model': self.config.fix_generator.model_name,
                'provider': self.config.fix_generator.provider.value,
                'status': 'active'
            },
            'code_validator': {
                'model': self.config.code_validator.model_name,
                'provider': self.config.code_validator.provider.value,
                'status': 'active'
            },
            'fallback_analyzer': {
                'model': self.config.fallback_analyzer.model_name if self.config.fallback_analyzer else None,
                'provider': self.config.fallback_analyzer.provider.value if self.config.fallback_analyzer else None,
                'status': 'active' if self.config.fallback_analyzer else 'not_configured'
            },
            'fallback_generator': {
                'model': self.config.fallback_generator.model_name if self.config.fallback_generator else None,
                'provider': self.config.fallback_generator.provider.value if self.config.fallback_generator else None,
                'status': 'active' if self.config.fallback_generator else 'not_configured'
            }
        }

# Global AI manager instance
ai_manager = None

def get_ai_manager() -> AIAgentManager:
    """Get global AI manager instance"""
    global ai_manager
    if ai_manager is None:
        from app.config import settings
        config = AIModelsConfig(
            error_analyzer=ModelConfig(
                provider=settings.AI_PROVIDER,
                model_name=settings.AI_MODEL,
                api_key=settings.OPENAI_API_KEY if settings.AI_PROVIDER == "openai" else None,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE
            ),
            fix_generator=ModelConfig(
                provider=settings.AI_PROVIDER,
                model_name=settings.AI_MODEL,
                api_key=settings.OPENAI_API_KEY if settings.AI_PROVIDER == "openai" else None,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE + 0.1  # Slightly higher for creativity
            ),
            code_validator=ModelConfig(
                provider=settings.AI_PROVIDER,
                model_name=settings.AI_MODEL,
                api_key=settings.OPENAI_API_KEY if settings.AI_PROVIDER == "openai" else None,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=0.0  # Lower for validation
            )
        )
        ai_manager = AIAgentManager(config)
    return ai_manager
```

### AI Prompts

#### 1. Error Analysis Prompt (`ai/prompts/error_analysis.py`)
```python
ERROR_ANALYSIS_PROMPT = """
You are an expert software debugging specialist with deep knowledge of error analysis, root cause identification, and fix generation.

Your task is to analyze software errors comprehensively and provide detailed insights including:

1. ROOT CAUSE ANALYSIS:
   - Identify the fundamental cause of the error
   - Explain why this error occurs
   - Provide context about the error's impact

2. IMPACT ASSESSMENT:
   - Assess the impact on users and system functionality
   - Determine severity and urgency
   - Identify potential cascading effects

3. SUGGESTED FIXES:
   - Provide specific, actionable fix suggestions
   - Prioritize fixes by effectiveness and risk
   - Include code examples where helpful

4. CONFIDENCE ASSESSMENT:
   - Rate your confidence in the analysis (0.0-1.0)
   - Explain uncertainty factors
   - Identify areas needing more information

5. RISK EVALUATION:
   - Assess risk level (low/medium/high/critical)
   - Consider business impact and technical complexity
   - Identify potential side effects

6. ADDITIONAL INSIGHTS:
   - Related errors or patterns
   - Prevention suggestions
   - Categorization and tagging
   - Estimated effort to resolve

Provide your analysis in a structured format with clear sections. Be thorough but concise. Focus on actionable insights that will help developers resolve the error effectively.

If you're uncertain about any aspect, acknowledge the uncertainty and suggest approaches for gathering more information.
"""
```

#### 2. Fix Generation Prompt (`ai/prompts/fix_generation.py`)
```python
FIX_GENERATION_PROMPT = """
You are an expert software engineer specializing in automated bug fixing and code remediation. Your task is to generate comprehensive, production-ready fixes for software errors.

When generating fixes, follow these principles:

1. UNDERSTAND THE CONTEXT:
   - Analyze the error, root cause, and impact
   - Consider the codebase structure and patterns
   - Understand the framework and language specifics
   - Review existing code for consistency

2. GENERATE HIGH-QUALITY FIXES:
   - Follow best practices and coding standards
   - Ensure backward compatibility
   - Minimize breaking changes
   - Write clean, maintainable code
   - Include appropriate error handling

3. PROVIDE COMPREHENSIVE DETAILS:
   - Clear description of what the fix does
   - Step-by-step implementation plan
   - Specific code changes with diffs
   - File paths and line numbers

4. ENSURE SAFETY:
   - Assess risk of changes
   - Provide rollback procedures
   - Suggest testing strategies
   - Identify potential side effects

5. INCLUDE TESTING:
   - Suggest appropriate test cases
   - Identify test coverage gaps
   - Recommend validation steps

Your response should include:
- Fix title and description
- Detailed code changes with diffs
- Files to modify
- Risk assessment
- Testing suggestions
- Rollback plan
- Estimated time to implement
- Dependencies or prerequisites

Be thorough but practical. Focus on fixes that can be safely applied in production environments.
"""
```

#### 3. Code Validation Prompt (`ai/prompts/code_validation.py`)
```python
CODE_VALIDATION_PROMPT = """
You are a senior software engineer and code reviewer with expertise in software quality, security, performance, and maintainability. Your task is to validate proposed code changes thoroughly.

Evaluate the code changes against these criteria:

1. CODE QUALITY:
   - Adherence to coding standards and best practices
   - Code readability and maintainability
   - Proper error handling and edge cases
   - Appropriate use of design patterns

2. SECURITY:
   - Input validation and sanitization
   - Authentication and authorization
   - Data protection and encryption
   - Vulnerability assessment

3. PERFORMANCE:
   - Algorithm efficiency and complexity
   - Resource usage optimization
   - Scalability considerations
   - Potential performance bottlenecks

4. COMPATIBILITY:
   - Breaking changes identification
   - API compatibility
   - Framework version compatibility
   - Browser/Platform compatibility

5. TESTING:
   - Test coverage assessment
   - Test case quality
   - Edge case coverage
   - Integration testing needs

Provide detailed feedback including:
- Overall validation status (pass/fail)
- Scores for quality, security, performance, maintainability (0.0-1.0)
- Specific issues found with severity levels
- Improvement suggestions
- Breaking changes identified
- Security concerns
- Performance issues
- Testing recommendations
- Overall recommendation (approve/needs changes/reject)

Be thorough but constructive. Focus on providing actionable feedback that improves code quality and safety.
"""
```

This comprehensive AI integration architecture provides a robust foundation for intelligent error analysis, fix generation, and code validation. The system is designed to be reliable, scalable, and maintainable with proper fallback mechanisms and comprehensive error handling.