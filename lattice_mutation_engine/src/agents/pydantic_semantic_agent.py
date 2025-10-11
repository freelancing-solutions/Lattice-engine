"""
PydanticAI-based Semantic Coherence Agent for the Lattice Mutation Engine.
This agent ensures semantic consistency and coherence across specifications.
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from lattice_mutation_engine.agents.pydantic_base_agent import PydanticBaseAgent, AgentContext
from lattice_mutation_engine.models.agent_models import AgentRegistration, AgentTask


logger = logging.getLogger(__name__)


class SemanticInconsistency(BaseModel):
    """Represents a semantic inconsistency between specifications"""
    type: str = Field(description="Type of inconsistency: terminology, concept, constraint, etc.")
    severity: str = Field(description="Severity level: critical, warning, info")
    description: str = Field(description="Description of the inconsistency")
    affected_specs: List[str] = Field(description="List of specification IDs affected")
    conflicting_elements: List[Dict[str, Any]] = Field(description="Specific conflicting elements")
    suggested_resolution: str = Field(description="Suggested way to resolve the inconsistency")


class SemanticCoherenceResponse(BaseModel):
    """Structured response from the semantic coherence agent"""
    is_coherent: bool = Field(description="Whether the specifications are semantically coherent")
    inconsistencies: List[SemanticInconsistency] = Field(default_factory=list)
    terminology_conflicts: List[Dict[str, Any]] = Field(default_factory=list)
    concept_overlaps: List[Dict[str, Any]] = Field(default_factory=list)
    constraint_violations: List[Dict[str, Any]] = Field(default_factory=list)
    coherence_suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    confidence_score: float = Field(ge=0.0, le=1.0, description="Confidence in the coherence analysis")
    reasoning: str = Field(description="Explanation of the coherence analysis")


class PydanticSemanticAgent(PydanticBaseAgent[SemanticCoherenceResponse]):
    """
    Semantic Coherence agent that uses PydanticAI for intelligent consistency checking.
    
    This agent can:
    - Analyze semantic consistency across multiple specifications
    - Detect terminology conflicts and inconsistencies
    - Identify concept overlaps and redundancies
    - Check constraint compatibility and violations
    - Suggest improvements for semantic coherence
    """
    
    def __init__(self, registration: AgentRegistration):
        super().__init__(registration, SemanticCoherenceResponse)
    
    def _get_system_prompt(self) -> str:
        return """You are a Semantic Coherence Agent for the Lattice Mutation Engine.

Your role is to ensure semantic consistency and coherence across specifications.

Key responsibilities:
1. Analyze semantic consistency across multiple specifications
2. Detect terminology conflicts and inconsistent definitions
3. Identify concept overlaps, redundancies, and gaps
4. Check constraint compatibility and logical violations
5. Suggest improvements for better semantic coherence

Semantic Analysis Areas:

1. TERMINOLOGY CONSISTENCY:
   - Same terms used consistently across specs
   - No conflicting definitions for the same concept
   - Clear disambiguation of similar terms
   - Consistent naming conventions

2. CONCEPT COHERENCE:
   - Logical relationships between concepts
   - No contradictory business rules
   - Consistent abstraction levels
   - Clear concept boundaries

3. CONSTRAINT COMPATIBILITY:
   - Business rules don't conflict with each other
   - Data constraints are compatible across specs
   - Interface contracts are consistent
   - Performance requirements are achievable together

4. SEMANTIC RELATIONSHIPS:
   - Proper use of inheritance and composition
   - Consistent interface definitions
   - Logical data flow patterns
   - Clear responsibility boundaries

Inconsistency Types:
- CRITICAL: Logical contradictions that prevent implementation
- WARNING: Ambiguities that may cause confusion
- INFO: Style inconsistencies or improvement opportunities

Analysis Output:
- Overall coherence assessment
- Detailed inconsistency findings with specific examples
- Terminology conflict analysis
- Concept overlap identification
- Constraint violation detection
- Actionable coherence improvement suggestions
- Confidence score based on analysis depth"""

    def _prepare_user_message(self, task: AgentTask) -> str:
        """Prepare semantic coherence analysis request for the LLM"""
        operation = task.operation
        input_data = task.input_data
        
        if operation == "analyze_coherence":
            specs = input_data.get("specs", [])
            context = input_data.get("context", {})
            
            return f"""Please analyze the semantic coherence of these specifications:

Operation: {operation}
Specifications: {specs}
Context: {context}

Perform a comprehensive semantic coherence analysis:
1. Check terminology consistency across all specifications
2. Identify concept overlaps and potential conflicts
3. Analyze constraint compatibility and logical consistency
4. Detect semantic relationships and dependencies
5. Suggest improvements for better coherence

Focus on finding inconsistencies that could lead to implementation problems or user confusion."""

        elif operation == "check_mutation_coherence":
            proposed_change = input_data.get("change", {})
            existing_specs = input_data.get("existing_specs", [])
            
            return f"""Please check if this proposed change maintains semantic coherence:

Proposed Change: {proposed_change}
Existing Specifications: {existing_specs}

Analyze the coherence impact:
1. Does the change introduce terminology conflicts?
2. Are there new concept overlaps or contradictions?
3. Do constraints remain compatible?
4. Are semantic relationships preserved?
5. What coherence issues might arise?

Provide specific recommendations to maintain coherence."""

        elif operation == "resolve_inconsistency":
            inconsistency = input_data.get("inconsistency", {})
            affected_specs = input_data.get("affected_specs", [])
            
            return f"""Please suggest resolution strategies for this semantic inconsistency:

Inconsistency: {inconsistency}
Affected Specifications: {affected_specs}

Provide resolution strategies:
1. Root cause analysis of the inconsistency
2. Multiple resolution approaches with trade-offs
3. Recommended approach with implementation steps
4. Impact assessment of each resolution option
5. Validation criteria to ensure resolution success

Focus on maintaining overall system coherence while resolving the specific issue."""

        else:
            return f"Unknown semantic operation: {operation}. Please provide guidance on how to handle this request."

    async def execute_task(self, task: AgentTask) -> Dict[str, Any]:
        """Execute semantic coherence task with fallback to rule-based analysis"""
        try:
            # Try PydanticAI first
            result = await super().execute_task(task)
            return result
        except Exception as e:
            logger.warning(f"PydanticAI semantic analysis failed, falling back to rule-based: {e}")
            return await self._fallback_semantic_analysis(task)

    async def _fallback_semantic_analysis(self, task: AgentTask) -> Dict[str, Any]:
        """Fallback rule-based semantic analysis when LLM is unavailable"""
        if task.operation == "analyze_coherence":
            return await self._analyze_coherence_fallback(task.input_data)
        elif task.operation == "check_mutation_coherence":
            return await self._check_mutation_coherence_fallback(task.input_data)
        elif task.operation == "resolve_inconsistency":
            return await self._resolve_inconsistency_fallback(task.input_data)
        else:
            return {
                "success": False,
                "error": f"Unknown operation: {task.operation}",
                "agent_id": self.registration.agent_id
            }

    async def _analyze_coherence_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based coherence analysis fallback"""
        specs = input_data.get("specs", [])
        
        # Basic terminology analysis
        terminology_conflicts = []
        concept_overlaps = []
        inconsistencies = []
        
        # Check for duplicate titles or IDs
        titles = {}
        ids = {}
        
        for spec in specs:
            spec_id = spec.get("id", "")
            title = spec.get("title", "")
            
            if spec_id in ids:
                inconsistencies.append(SemanticInconsistency(
                    type="duplicate_id",
                    severity="critical",
                    description=f"Duplicate specification ID: {spec_id}",
                    affected_specs=[spec_id, ids[spec_id]],
                    conflicting_elements=[{"field": "id", "value": spec_id}],
                    suggested_resolution="Ensure all specification IDs are unique"
                ))
            else:
                ids[spec_id] = spec_id
            
            if title in titles:
                terminology_conflicts.append({
                    "type": "duplicate_title",
                    "title": title,
                    "specs": [spec_id, titles[title]],
                    "severity": "warning"
                })
            else:
                titles[title] = spec_id
        
        # Check for missing required fields
        for spec in specs:
            required_fields = ["id", "type", "title", "description"]
            for field in required_fields:
                if not spec.get(field):
                    inconsistencies.append(SemanticInconsistency(
                        type="missing_required_field",
                        severity="critical",
                        description=f"Missing required field '{field}' in spec {spec.get('id', 'unknown')}",
                        affected_specs=[spec.get("id", "unknown")],
                        conflicting_elements=[{"field": field, "missing": True}],
                        suggested_resolution=f"Add the required '{field}' field"
                    ))
        
        is_coherent = len(inconsistencies) == 0
        confidence = 0.7 if is_coherent else 0.5
        
        return {
            "success": True,
            "is_coherent": is_coherent,
            "inconsistencies": [inc.model_dump() for inc in inconsistencies],
            "terminology_conflicts": terminology_conflicts,
            "concept_overlaps": concept_overlaps,
            "constraint_violations": [],
            "coherence_suggestions": self._generate_coherence_suggestions(inconsistencies),
            "confidence_score": confidence,
            "reasoning": "Rule-based semantic coherence analysis completed",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    def _generate_coherence_suggestions(self, inconsistencies: List[SemanticInconsistency]) -> List[Dict[str, Any]]:
        """Generate coherence improvement suggestions"""
        suggestions = []
        
        if inconsistencies:
            suggestions.append({
                "type": "resolve_inconsistencies",
                "description": f"Resolve {len(inconsistencies)} semantic inconsistencies found",
                "priority": "high",
                "action": "Review and fix all identified inconsistencies"
            })
        
        suggestions.append({
            "type": "terminology_standardization",
            "description": "Establish and maintain a consistent terminology glossary",
            "priority": "medium",
            "action": "Create a shared glossary of terms and definitions"
        })
        
        suggestions.append({
            "type": "semantic_review_process",
            "description": "Implement regular semantic coherence reviews",
            "priority": "low",
            "action": "Schedule periodic reviews of specification coherence"
        })
        
        return suggestions

    async def _check_mutation_coherence_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback mutation coherence check"""
        return {
            "success": True,
            "is_coherent": True,
            "inconsistencies": [],
            "terminology_conflicts": [],
            "concept_overlaps": [],
            "constraint_violations": [],
            "coherence_suggestions": [],
            "confidence_score": 0.5,
            "reasoning": "Basic mutation coherence check - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _resolve_inconsistency_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback inconsistency resolution"""
        return {
            "success": True,
            "is_coherent": False,
            "inconsistencies": [],
            "terminology_conflicts": [],
            "concept_overlaps": [],
            "constraint_violations": [],
            "coherence_suggestions": [
                {
                    "type": "manual_review",
                    "description": "Manual review required for inconsistency resolution",
                    "priority": "high",
                    "action": "Review the inconsistency manually and apply appropriate fixes"
                }
            ],
            "confidence_score": 0.3,
            "reasoning": "Basic inconsistency resolution suggestions - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }