"""
PydanticAI-based Validator Agent for the Lattice Mutation Engine.
This agent validates specification mutations and ensures schema compliance.
"""

import logging
from typing import Dict, Any, List
from pydantic import BaseModel, Field
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agents.pydantic_base_agent import PydanticBaseAgent, AgentContext
from models.agent_models import AgentRegistration, AgentTask
from models.validation_models import ValidationResult


logger = logging.getLogger(__name__)


class ValidationResponse(BaseModel):
    """Structured response from the validation agent"""
    is_valid: bool = Field(description="Whether the validation passed")
    errors: List[Dict[str, Any]] = Field(default_factory=list, description="List of validation errors")
    warnings: List[Dict[str, Any]] = Field(default_factory=list, description="List of validation warnings")
    suggestions: List[Dict[str, Any]] = Field(default_factory=list, description="List of improvement suggestions")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Confidence in the validation result")
    reasoning: str = Field(description="Explanation of the validation decision")


class PydanticValidatorAgent(PydanticBaseAgent[ValidationResponse]):
    """
    Validator agent that uses PydanticAI for intelligent spec validation.
    
    This agent can:
    - Validate mutation proposals against schema rules
    - Check semantic consistency
    - Identify potential issues and suggest improvements
    - Provide confidence scores for validation decisions
    """
    
    def __init__(self, registration: AgentRegistration):
        super().__init__(registration, ValidationResponse)
        self.validation_rules = self._load_validation_rules()
    
    def _get_system_prompt(self) -> str:
        return """You are a Specification Validator Agent for the Lattice Mutation Engine.

Your role is to validate specification mutations and ensure they comply with the schema and best practices.

Key responsibilities:
1. Validate mutation proposals against the spec-graph schema
2. Check for semantic consistency and logical coherence
3. Identify potential issues, conflicts, or improvements
4. Provide clear reasoning for validation decisions
5. Assign confidence scores based on validation certainty

Schema Rules:
- Nodes must have valid types: requirement, component, interface, data_model, business_rule, constraint
- Relationships must be valid: depends_on, implements, uses, contains, conflicts_with, derives_from
- All nodes must have required fields: id, type, title, description
- Relationships must reference existing nodes
- No circular dependencies in critical paths
- Business rules must be testable and measurable

Validation Levels:
- ERROR: Critical issues that prevent acceptance
- WARNING: Issues that should be addressed but don't block acceptance  
- SUGGESTION: Improvements that would enhance quality

Always provide:
- Clear error/warning messages
- Specific field references where applicable
- Actionable suggestions for fixes
- Confidence score (0.0-1.0) based on validation certainty
- Detailed reasoning for your decision"""

    def _prepare_user_message(self, task: AgentTask) -> str:
        """Prepare validation request for the LLM"""
        operation = task.operation
        input_data = task.input_data
        
        if operation == "validate_proposal":
            proposal = input_data.get("proposal", {})
            return f"""Please validate this mutation proposal:

Operation: {operation}
Proposal: {proposal}

Analyze the proposal for:
1. Schema compliance
2. Required field presence
3. Relationship validity
4. Semantic consistency
5. Potential conflicts or issues

Provide a structured validation response with errors, warnings, suggestions, and your confidence level."""

        elif operation == "validate_spec":
            spec_content = input_data.get("content", "")
            spec_id = input_data.get("spec_id", "unknown")
            
            return f"""Please validate this specification:

Spec ID: {spec_id}
Content: {spec_content}

Analyze the specification for:
1. Structural validity
2. Required sections and fields
3. Internal consistency
4. Compliance with schema rules
5. Best practice adherence

Provide a structured validation response with detailed feedback."""

        else:
            return f"Unknown validation operation: {operation}. Please provide guidance on how to handle this request."

    def _load_validation_rules(self) -> Dict[str, Any]:
        """Load validation rules and schema constraints"""
        return {
            "required_node_fields": ["id", "type", "title", "description"],
            "valid_node_types": [
                "requirement", "component", "interface", 
                "data_model", "business_rule", "constraint"
            ],
            "valid_relationship_types": [
                "depends_on", "implements", "uses", "contains", 
                "conflicts_with", "derives_from"
            ],
            "max_title_length": 100,
            "max_description_length": 1000,
            "forbidden_patterns": [
                r"TODO",
                r"FIXME", 
                r"XXX",
                r"HACK"
            ]
        }

    async def execute_task(self, task: AgentTask) -> Dict[str, Any]:
        """Execute validation task with fallback to rule-based validation"""
        try:
            # Try PydanticAI first
            result = await super().execute_task(task)
            return result
        except Exception as e:
            logger.warning(f"PydanticAI validation failed, falling back to rule-based: {e}")
            return await self._fallback_validation(task)

    async def _fallback_validation(self, task: AgentTask) -> Dict[str, Any]:
        """Fallback rule-based validation when LLM is unavailable"""
        if task.operation == "validate_proposal":
            return await self._validate_proposal_fallback(task.input_data)
        elif task.operation == "validate_spec":
            return await self._validate_spec_fallback(task.input_data)
        else:
            return {
                "success": False,
                "error": f"Unknown operation: {task.operation}",
                "agent_id": self.registration.agent_id
            }

    async def _validate_proposal_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based proposal validation"""
        proposal = input_data.get("proposal", {})
        errors = []
        warnings = []
        suggestions = []

        # Check required fields
        if not proposal.get("spec_id"):
            errors.append({
                "type": "required_field",
                "message": "Spec ID is required",
                "field": "spec_id"
            })

        if not proposal.get("reasoning"):
            warnings.append({
                "type": "missing_reasoning", 
                "message": "No reasoning provided for the mutation",
                "field": "reasoning"
            })

        # Check mutation type
        mutation_type = proposal.get("mutation_type")
        if mutation_type not in ["create", "update", "delete"]:
            errors.append({
                "type": "invalid_mutation_type",
                "message": f"Invalid mutation type: {mutation_type}",
                "field": "mutation_type"
            })

        is_valid = len(errors) == 0
        confidence = 0.8 if is_valid else 0.6

        return {
            "success": True,
            "is_valid": is_valid,
            "errors": errors,
            "warnings": warnings,
            "suggestions": suggestions,
            "confidence_score": confidence,
            "reasoning": "Rule-based validation completed",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _validate_spec_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based spec validation"""
        content = input_data.get("content", "")
        errors = []
        warnings = []

        # Basic content checks
        if len(content.strip()) == 0:
            errors.append({
                "type": "empty_content",
                "message": "Specification content is empty"
            })

        # Check for forbidden patterns
        for pattern in self.validation_rules["forbidden_patterns"]:
            if pattern in content:
                warnings.append({
                    "type": "forbidden_pattern",
                    "message": f"Found development placeholder: {pattern}",
                    "pattern": pattern
                })

        is_valid = len(errors) == 0
        confidence = 0.7 if is_valid else 0.5

        return {
            "success": True,
            "is_valid": is_valid,
            "errors": errors,
            "warnings": warnings,
            "suggestions": [],
            "confidence_score": confidence,
            "reasoning": "Rule-based spec validation completed",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }