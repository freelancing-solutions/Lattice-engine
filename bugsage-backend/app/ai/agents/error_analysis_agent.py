"""
Error analysis AI agent.
"""

from typing import Dict, Any, List, Optional
import re
from datetime import datetime

from app.ai.agents.base import BaseAIAgent
from app.ai.models.config import ModelConfig
from app.ai.prompts.error_analysis import ERROR_ANALYSIS_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ErrorAnalysisResult:
    """Structured result from error analysis."""

    def __init__(
        self,
        root_cause: str,
        impact_assessment: str,
        suggested_fixes: List[str],
        confidence_score: float,
        risk_level: str,
        estimated_effort: str,
        related_errors: List[str],
        prevention_suggestions: List[str],
        tags: List[str],
        category: Optional[str],
        subcategory: Optional[str],
    ):
        self.root_cause = root_cause
        self.impact_assessment = impact_assessment
        self.suggested_fixes = suggested_fixes
        self.confidence_score = confidence_score
        self.risk_level = risk_level
        self.estimated_effort = estimated_effort
        self.related_errors = related_errors
        self.prevention_suggestions = prevention_suggestions
        self.tags = tags
        self.category = category
        self.subcategory = subcategory

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "root_cause": self.root_cause,
            "impact_assessment": self.impact_assessment,
            "suggested_fixes": self.suggested_fixes,
            "confidence_score": self.confidence_score,
            "risk_level": self.risk_level,
            "estimated_effort": self.estimated_effort,
            "related_errors": self.related_errors,
            "prevention_suggestions": self.prevention_suggestions,
            "tags": self.tags,
            "category": self.category,
            "subcategory": self.subcategory,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ErrorAnalysisResult":
        """Create from dictionary."""
        return cls(
            root_cause=data.get("root_cause", ""),
            impact_assessment=data.get("impact_assessment", ""),
            suggested_fixes=data.get("suggested_fixes", []),
            confidence_score=data.get("confidence_score", 0.0),
            risk_level=data.get("risk_level", "medium"),
            estimated_effort=data.get("estimated_effort", "unknown"),
            related_errors=data.get("related_errors", []),
            prevention_suggestions=data.get("prevention_suggestions", []),
            tags=data.get("tags", []),
            category=data.get("category"),
            subcategory=data.get("subcategory"),
        )

    def validate(self) -> List[str]:
        """Validate result and return list of issues."""
        issues = []

        if not self.root_cause:
            issues.append("Root cause is required")
        if not self.impact_assessment:
            issues.append("Impact assessment is required")
        if not self.suggested_fixes:
            issues.append("At least one suggested fix is required")
        if not 0 <= self.confidence_score <= 1:
            issues.append("Confidence score must be between 0 and 1")
        if self.risk_level not in ["low", "medium", "high", "critical"]:
            issues.append("Risk level must be one of: low, medium, high, critical")

        return issues


class ErrorAnalysisAgent(BaseAIAgent):
    """AI agent for error analysis."""

    def __init__(self, config: ModelConfig):
        super().__init__(config, ERROR_ANALYSIS_PROMPT)

    def _setup_model(self):
        """Setup OpenAI model."""
        try:
            from pydantic_ai.models.openai import OpenAIModel

            self.model = OpenAIModel(
                model_name=self.config.model_name,
                api_key=self.config.api_key,
                api_base=self.config.api_base,
                timeout=self.config.timeout,
            )
        except ImportError as e:
            logger.error(f"Failed to import OpenAI model: {e}")
            raise

    def _create_agent(self):
        """Create PydanticAI agent."""
        try:
            from pydantic_ai import Agent

            self.agent = Agent(
                model=self.model,
                system_prompt=self.system_prompt,
                deps_type=Dict[str, Any],
                retries=self.config.retry_attempts,
            )
        except Exception as e:
            logger.error(f"Failed to create agent: {e}")
            raise

    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process error analysis."""
        request_id = self.get_request_id()
        self.log_request_start(request_id, input_data)

        try:
            # Prepare analysis prompt
            analysis_input = self._prepare_analysis_input(input_data, context)

            # Run AI analysis
            result = await self.agent.run(analysis_input, deps=context)

            # Parse and structure result
            analysis_result = self._parse_analysis_result(result.data)

            # Validate result
            validation_issues = analysis_result.validate()
            if validation_issues:
                logger.warning(f"Validation issues: {validation_issues}")
                # Try to fix common issues
                analysis_result = self._fix_validation_issues(analysis_result, validation_issues)

            # Convert to dictionary
            result_dict = analysis_result.to_dict()

            # Add metadata
            result_dict = self.add_metadata(result_dict)

            self.log_request_end(request_id, True, result_dict.get("processing_time_ms", 0))
            return result_dict

        except Exception as e:
            self.log_error(request_id, str(e), context)
            raise

    def _prepare_analysis_input(self, error_data: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Prepare input for AI analysis."""
        return f"""
Analyze the following error and provide detailed insights:

ERROR INFORMATION:
Title: {error_data.get('title', 'Unknown Error')}
Description: {error_data.get('description', 'No description available')}
Severity: {error_data.get('severity', 'unknown')}
Source: {error_data.get('source', 'unknown')}
Stack Trace: {error_data.get('stack_trace', 'No stack trace available')}
Error Type: {error_data.get('error_type', 'Unknown')}
Error Message: {error_data.get('error_message', 'No error message')}

CONTEXT INFORMATION:
{error_data.get('context', {})}

METADATA:
{error_data.get('metadata', {})}

PROJECT CONTEXT:
{context.get('project_context', 'No project context available')}

CODEBASE INFORMATION:
{context.get('codebase_info', 'No codebase information available')}

SIMILAR ERRORS:
{context.get('similar_errors', [])}

Please provide comprehensive analysis including:
1. Root cause analysis
2. Impact assessment
3. Suggested fixes (at least 1)
4. Confidence score (0.0-1.0)
5. Risk level (low/medium/high/critical)
6. Estimated effort (trivial/easy/medium/hard/complex)
7. Related errors or patterns
8. Prevention suggestions
9. Suggested tags
10. Category and subcategory

Format your response as a JSON object with these fields:
{
  "root_cause": "...",
  "impact_assessment": "...",
  "suggested_fixes": ["...", "..."],
  "confidence_score": 0.0,
  "risk_level": "...",
  "estimated_effort": "...",
  "related_errors": ["...", "..."],
  "prevention_suggestions": ["...", "..."],
  "tags": ["...", "..."],
  "category": "...",
  "subcategory": "..."
}
"""

    def _parse_analysis_result(self, raw_result: str) -> ErrorAnalysisResult:
        """Parse AI result into structured format."""
        try:
            # Try to parse as JSON first
            import json
            if raw_result.strip().startswith('{'):
                data = json.loads(raw_result)
                return ErrorAnalysisResult.from_dict(data)

            # Parse structured text response
            result = self._parse_text_response(raw_result)

            # Create ErrorAnalysisResult from parsed data
            return ErrorAnalysisResult.from_dict(result)

        except Exception as e:
            logger.error(f"Failed to parse analysis result: {e}")
            return self._get_default_analysis_result()

    def _parse_text_response(self, raw_result: str) -> Dict[str, Any]:
        """Parse structured text response."""
        result = {}

        # Extract root cause
        root_cause_match = re.search(
            r'Root Cause[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL | re.IGNORECASE
        )
        if root_cause_match:
            result["root_cause"] = root_cause_match.group(1).strip()

        # Extract impact assessment
        impact_match = re.search(
            r'Impact[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL | re.IGNORECASE
        )
        if impact_match:
            result["impact_assessment"] = impact_match.group(1).strip()

        # Extract suggested fixes
        fixes_match = re.search(
            r'Suggested Fix(es)?[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL | re.IGNORECASE
        )
        if fixes_match:
            fixes_text = fixes_match.group(1).strip()
            result["suggested_fixes"] = [
                line.strip() for line in fixes_text.split('\n') if line.strip()
            ]

        # Extract confidence
        confidence_match = re.search(r'Confidence[:\s]*([0-9.]+)', raw_result, re.IGNORECASE)
        if confidence_match:
            try:
                result["confidence_score"] = float(confidence_match.group(1))
            except ValueError:
                result["confidence_score"] = 0.5

        # Extract risk level
        risk_match = re.search(r'Risk Level[:\s]*(\w+)', raw_result, re.IGNORECASE)
        if risk_match:
            result["risk_level"] = risk_match.group(1).lower()

        # Extract estimated effort
        effort_match = re.search(r'Effort[:\s]*(\w+)', raw_result, re.IGNORECASE)
        if effort_match:
            result["estimated_effort"] = effort_match.group(1).lower()

        # Extract tags
        tags_match = re.search(r'Tags?:?\s*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.IGNORECASE)
        if tags_match:
            tags_text = tags_match.group(1).strip()
            result["tags"] = [
                tag.strip().replace('#', '') for tag in tags_text.split(',') if tag.strip()
            ]

        # Extract category
        category_match = re.search(r'Categor(?:y|y)[:\s]*(\w+)', raw_result, re.IGNORECASE)
        if category_match:
            result["category"] = category_match.group(1).lower()

        # Extract subcategory
        subcategory_match = re.search(r'Subcategor(?:y|y)[:\s]*(\w+)', raw_result, re.IGNORECASE)
        if subcategory_match:
            result["subcategory"] = subcategory_match.group(1).lower()

        # Extract prevention suggestions
        prevention_match = re.search(
            r'Prevention Suggestion(s)?[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL | re.IGNORECASE
        )
        if prevention_match:
            prevention_text = prevention_match.group(1).strip()
            result["prevention_suggestions"] = [
                line.strip() for line in prevention_text.split('\n') if line.strip()
            ]

        # Extract related errors
        related_match = re.search(
            r'Related Errors?[:\s]*\n?(.*?)(?=\n\n|\n[A-Z]|\Z)', raw_result, re.DOTALL | re.IGNORECASE
        )
        if related_match:
            related_text = related_match.group(1).strip()
            result["related_errors"] = [
                error.strip() for error in related_text.split('\n') if error.strip()
            ]

        # Set defaults for missing fields
        result.setdefault("root_cause", "Unable to determine root cause")
        result.setdefault("impact_assessment", "Manual investigation required")
        result.setdefault("suggested_fixes", ["Manual investigation required"])
        result.setdefault("confidence_score", 0.5)
        result.setdefault("risk_level", "medium")
        result.setdefault("estimated_effort", "unknown")
        result.setdefault("related_errors", [])
        result.setdefault("prevention_suggestions", ["Implement better error handling"])
        result.setdefault("tags", ["manual-review-required"])
        result.setdefault("category", None)
        result.setdefault("subcategory", None)

        return result

    def _get_default_analysis_result(self) -> ErrorAnalysisResult:
        """Get default analysis result."""
        return ErrorAnalysisResult(
            root_cause="Unable to determine root cause automatically",
            impact_assessment="Manual investigation required to assess impact",
            suggested_fixes=["Manual investigation and fix required"],
            confidence_score=0.0,
            risk_level="medium",
            estimated_effort="unknown",
            related_errors=[],
            prevention_suggestions=["Implement better error handling"],
            tags=["manual-review-required"],
            category=None,
            subcategory=None,
        )

    def _fix_validation_issues(self, result: ErrorAnalysisResult, issues: List[str]) -> ErrorAnalysisResult:
        """Fix common validation issues."""
        # Fix confidence score
        if result.confidence_score < 0 or result.confidence_score > 1:
            result.confidence_score = max(0.0, min(1.0, result.confidence_score))

        # Fix risk level
        if result.risk_level not in ["low", "medium", "high", "critical"]:
            result.risk_level = "medium"

        # Fix suggested fixes
        if not result.suggested_fixes:
            result.suggested_fixes = ["Manual investigation required"]

        # Fix estimated effort
        if result.estimated_effort not in ["trivial", "easy", "medium", "hard", "complex"]:
            if result.risk_level == "low":
                result.estimated_effort = "easy"
            elif result.risk_level == "medium":
                result.estimated_effort = "medium"
            elif result.risk_level == "high":
                result.estimated_effort = "hard"
            else:
                result.estimated_effort = "complex"

        return result

    def validate_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate analysis result."""
        try:
            # Create ErrorAnalysisResult instance
            analysis_result = ErrorAnalysisResult.from_dict(result)

            # Validate and fix issues
            issues = analysis_result.validate()
            if issues:
                analysis_result = self._fix_validation_issues(analysis_result, issues)

            # Convert back to dictionary
            return analysis_result.to_dict()

        except Exception as e:
            logger.warning(f"Validation failed, using defaults: {e}")
            return self._get_default_analysis_result().to_dict()

    def get_fallback_result(self, input_data: Dict[str, Any], context: Dict[str, Any], error: str) -> Dict[str, Any]:
        """Get fallback result."""
        result = self._get_default_analysis_result().to_dict()
        result["fallback_reason"] = error
        result["fallback_used"] = True
        result["error_details"] = str(error)

        # Add error context
        if "error" in input_data:
            result["original_error"] = {
                "title": input_data["error"].get("title"),
                "message": input_data["error"].get("message"),
                "type": input_data["error"].get("type"),
            }

        return result

    def get_expected_fields(self) -> List[str]:
        """Get expected fields for result validation."""
        return [
            "root_cause",
            "impact_assessment",
            "suggested_fixes",
            "confidence_score",
            "risk_level",
            "estimated_effort",
            "related_errors",
            "prevention_suggestions",
            "tags",
            "category",
            "subcategory",
        ]

    def get_type_hints(self) -> Dict[str, type]:
        """Get expected data types for fields."""
        return {
            "root_cause": str,
            "impact_assessment": str,
            "suggested_fixes": list,
            "confidence_score": float,
            "risk_level": str,
            "estimated_effort": str,
            "related_errors": list,
            "prevention_suggestions": list,
            "tags": list,
            "category": str,
            "subcategory": str,
        }