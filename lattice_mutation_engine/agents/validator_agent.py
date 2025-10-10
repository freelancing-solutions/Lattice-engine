from typing import Dict, Any, List
import logging
import re
from datetime import datetime

from lattice_mutation_engine.agents.base_agent import BaseAgent
from lattice_mutation_engine.models.agent_models import AgentTask
from lattice_mutation_engine.models.validation_models import ValidationResult
from lattice_mutation_engine.models.mutation_models import MutationProposal


logger = logging.getLogger(__name__)


class ValidatorAgent(BaseAgent):
    def __init__(self, registration):
        super().__init__(registration)
        self.validation_rules = self._load_validation_rules()

    async def execute_task(self, task: AgentTask) -> Dict[str, Any]:
        """Execute a validation task"""
        if task.operation == "validate_proposal":
            return await self._validate_proposal(task.input_data)
        elif task.operation == "validate_spec":
            return await self._validate_spec(task.input_data)
        else:
            raise ValueError(f"Unknown operation: {task.operation}")

    async def _validate_proposal(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a mutation proposal"""
        proposal_data = input_data.get("proposal", {})
        proposal = MutationProposal(**proposal_data)

        errors: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        suggestions: List[Dict[str, Any]] = []

        # Check required fields
        if not proposal.spec_id:
            errors.append({
                "type": "required_field",
                "message": "Spec ID is required",
                "field": "spec_id"
            })

        if not proposal.reasoning:
            warnings.append({
                "type": "missing_reasoning",
                "message": "No reasoning provided for the mutation",
                "field": "reasoning"
            })

        # Check confidence level
        if proposal.confidence < 0.5:
            warnings.append({
                "type": "low_confidence",
                "message": f"Low confidence score: {proposal.confidence}",
                "field": "confidence"
            })

        # Validate proposed changes
        if "content" in proposal.proposed_changes:
            content = proposal.proposed_changes["content"]
            content_errors = self._validate_content(content)
            errors.extend(content_errors)

        # Check for breaking changes
        if proposal.impact_analysis.get("breaking_changes", False):
            warnings.append({
                "type": "breaking_change",
                "message": "This mutation includes breaking changes",
                "field": "impact_analysis"
            })

        # Generate suggestions
        if not errors and not warnings:
            suggestions.append({
                "type": "optimization",
                "message": "Consider adding tests for the new functionality",
                "confidence": 0.8
            })

        result = ValidationResult(
            spec_id=proposal.spec_id,
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
            validation_timestamp=datetime.now()
        )

        return result.dict()

    async def _validate_spec(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a spec"""
        spec_id = input_data.get("spec_id", "")
        content = input_data.get("content", "")

        errors: List[Dict[str, Any]] = []
        warnings: List[Dict[str, Any]] = []
        suggestions: List[Dict[str, Any]] = []

        # Validate content
        content_errors = self._validate_content(content)
        errors.extend(content_errors)

        # Check for common issues
        if "TODO" in content:
            warnings.append({
                "type": "todo_found",
                "message": "TODO items found in the spec",
                "field": "content"
            })

        # Generate suggestions
        if len(content) < 100:
            suggestions.append({
                "type": "content_length",
                "message": "Consider adding more detail to the spec",
                "confidence": 0.6
            })

        result = ValidationResult(
            spec_id=spec_id,
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
            validation_timestamp=datetime.now()
        )

        return result.dict()

    def _validate_content(self, content: str) -> List[Dict[str, Any]]:
        """Validate the content of a spec"""
        errors: List[Dict[str, Any]] = []

        # Check for required sections
        if not re.search(r'#+\s*(Overview|Summary)', content, re.IGNORECASE):
            errors.append({
                "type": "missing_section",
                "message": "Missing Overview section",
                "field": "content"
            })

        if not re.search(r'#+\s*(Implementation|Details)', content, re.IGNORECASE):
            errors.append({
                "type": "missing_section",
                "message": "Missing Implementation section",
                "field": "content"
            })

        return errors

    def _load_validation_rules(self) -> Dict[str, Any]:
        """Load validation rules"""
        return {
            "required_sections": ["Overview", "Implementation"],
            "min_content_length": 50,
            "max_content_length": 10000,
        }