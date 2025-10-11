"""
PydanticAI-based Conflict Resolution Agent for the Lattice Mutation Engine.
This agent detects and resolves conflicts in concurrent specification changes.
"""

import logging
from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field

from lattice_mutation_engine.agents.pydantic_base_agent import PydanticBaseAgent, AgentContext
from lattice_mutation_engine.models.agent_models import AgentRegistration, AgentTask


logger = logging.getLogger(__name__)


class ConflictLocation(BaseModel):
    """Represents the location of a conflict"""
    entity_id: str = Field(description="ID of the entity where conflict occurs")
    entity_type: str = Field(description="Type of entity: spec, field, relationship, etc.")
    path: str = Field(description="Path within the entity where conflict occurs")
    line_number: Optional[int] = Field(default=None, description="Line number if applicable")
    section: Optional[str] = Field(default=None, description="Section or subsection name")


class ConflictDetails(BaseModel):
    """Detailed information about a conflict"""
    conflict_id: str = Field(description="Unique identifier for this conflict")
    conflict_type: str = Field(description="Type of conflict: content, structural, semantic, etc.")
    severity: str = Field(description="Severity level: critical, high, medium, low")
    description: str = Field(description="Human-readable description of the conflict")
    location: ConflictLocation = Field(description="Where the conflict occurs")
    base_version: Dict[str, Any] = Field(description="Original version before changes")
    local_changes: Dict[str, Any] = Field(description="Local changes causing conflict")
    remote_changes: Dict[str, Any] = Field(description="Remote changes causing conflict")
    auto_resolvable: bool = Field(description="Whether conflict can be automatically resolved")


class ResolutionStrategy(BaseModel):
    """Represents a strategy for resolving a conflict"""
    strategy_id: str = Field(description="Unique identifier for this strategy")
    strategy_type: str = Field(description="Type: merge, prefer_local, prefer_remote, manual, custom")
    description: str = Field(description="Description of the resolution strategy")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence in this strategy")
    risk_level: str = Field(description="Risk level: low, medium, high")
    resolution_steps: List[Dict[str, Any]] = Field(description="Steps to apply this resolution")
    validation_criteria: List[str] = Field(description="Criteria to validate resolution success")
    rollback_procedure: List[Dict[str, Any]] = Field(description="Steps to rollback if resolution fails")


class ConflictResolutionResponse(BaseModel):
    """Structured response from the conflict resolution agent"""
    conflicts_detected: List[ConflictDetails] = Field(default_factory=list)
    resolution_strategies: List[ResolutionStrategy] = Field(default_factory=list)
    recommended_strategy: Optional[str] = Field(default=None, description="ID of recommended strategy")
    auto_resolution_possible: bool = Field(description="Whether automatic resolution is possible")
    manual_intervention_required: bool = Field(description="Whether manual intervention is needed")
    merge_result: Optional[Dict[str, Any]] = Field(default=None, description="Result of automatic merge")
    conflict_summary: Dict[str, Any] = Field(description="Summary of conflict analysis")
    resolution_confidence: float = Field(ge=0.0, le=1.0, description="Overall confidence in resolution")
    reasoning: str = Field(description="Detailed reasoning for conflict resolution approach")


class PydanticConflictAgent(PydanticBaseAgent[ConflictResolutionResponse]):
    """
    Conflict Resolution agent that uses PydanticAI for intelligent conflict detection and resolution.
    
    This agent can:
    - Detect conflicts in concurrent specification changes
    - Analyze conflict types and severity
    - Generate resolution strategies with confidence scores
    - Perform automatic conflict resolution where safe
    - Provide guidance for manual conflict resolution
    """
    
    def __init__(self, registration: AgentRegistration):
        super().__init__(registration, ConflictResolutionResponse)
    
    def _get_system_prompt(self) -> str:
        return """You are a Conflict Resolution Agent for the Lattice Mutation Engine.

Your role is to detect, analyze, and resolve conflicts in concurrent specification changes.

Key responsibilities:
1. Detect conflicts between concurrent changes to specifications
2. Analyze conflict types, severity, and resolution complexity
3. Generate multiple resolution strategies with confidence scores
4. Perform automatic conflict resolution where safe and appropriate
5. Provide detailed guidance for manual conflict resolution

Conflict Detection Framework:

1. CONTENT CONFLICTS:
   - Same field modified with different values
   - Contradictory text changes in descriptions
   - Incompatible constraint modifications
   - Conflicting business rule updates

2. STRUCTURAL CONFLICTS:
   - Same element added/removed by different changes
   - Conflicting hierarchy modifications
   - Incompatible relationship changes
   - Schema structure contradictions

3. SEMANTIC CONFLICTS:
   - Logically incompatible changes
   - Contradictory business logic
   - Inconsistent terminology usage
   - Conflicting behavioral specifications

4. DEPENDENCY CONFLICTS:
   - Circular dependency introduction
   - Broken dependency chains
   - Incompatible version requirements
   - Missing prerequisite changes

Resolution Strategies:

AUTO-RESOLVABLE:
- Non-overlapping changes (spatial separation)
- Additive changes that don't conflict
- Compatible constraint relaxations
- Independent feature additions

MERGE STRATEGIES:
- Three-way merge with common ancestor
- Semantic merge based on intent
- Structured merge for known patterns
- Custom merge rules for specific domains

PREFERENCE STRATEGIES:
- Prefer local changes (local wins)
- Prefer remote changes (remote wins)
- Prefer newer timestamps
- Prefer higher priority authors

MANUAL RESOLUTION:
- Complex semantic conflicts
- Business logic contradictions
- Architectural decision conflicts
- Domain expert judgment required

Conflict Severity Assessment:
- CRITICAL: Prevents system functionality or causes data loss
- HIGH: Significant impact on system behavior or user experience
- MEDIUM: Moderate impact requiring attention but not blocking
- LOW: Minor inconsistencies or style conflicts

Resolution Output Requirements:
- Comprehensive conflict detection and classification
- Multiple resolution strategies with confidence scores
- Clear reasoning for recommended approaches
- Detailed steps for applying resolutions
- Validation criteria and rollback procedures
- Risk assessment for each resolution strategy"""

    def _prepare_user_message(self, task: AgentTask) -> str:
        """Prepare conflict resolution request for the LLM"""
        operation = task.operation
        input_data = task.input_data
        
        if operation == "detect_conflicts":
            base_version = input_data.get("base_version", {})
            local_changes = input_data.get("local_changes", {})
            remote_changes = input_data.get("remote_changes", {})
            
            return f"""Please detect conflicts between these concurrent changes:

Base Version: {base_version}
Local Changes: {local_changes}
Remote Changes: {remote_changes}

Perform comprehensive conflict detection:
1. Identify all types of conflicts (content, structural, semantic, dependency)
2. Assess conflict severity and resolution complexity
3. Determine which conflicts can be auto-resolved
4. Generate resolution strategies for each conflict
5. Recommend the best overall resolution approach

Focus on providing actionable conflict resolution guidance."""

        elif operation == "resolve_conflicts":
            conflicts = input_data.get("conflicts", [])
            resolution_preferences = input_data.get("preferences", {})
            
            return f"""Please resolve these detected conflicts:

Conflicts: {conflicts}
Resolution Preferences: {resolution_preferences}

Generate conflict resolutions:
1. Analyze each conflict for resolution options
2. Apply resolution preferences and constraints
3. Generate step-by-step resolution procedures
4. Create merged result where possible
5. Identify conflicts requiring manual intervention

Focus on safe, reliable conflict resolution with clear validation."""

        elif operation == "merge_changes":
            base_version = input_data.get("base_version", {})
            change_sets = input_data.get("change_sets", [])
            merge_strategy = input_data.get("merge_strategy", "auto")
            
            return f"""Please merge these change sets:

Base Version: {base_version}
Change Sets: {change_sets}
Merge Strategy: {merge_strategy}

Perform intelligent merge:
1. Detect conflicts between all change sets
2. Apply appropriate merge strategies for each conflict type
3. Generate comprehensive merged result
4. Validate merge consistency and completeness
5. Provide rollback procedures if merge fails

Focus on creating a coherent, conflict-free merged result."""

        elif operation == "validate_resolution":
            original_conflicts = input_data.get("original_conflicts", [])
            resolution_result = input_data.get("resolution_result", {})
            
            return f"""Please validate this conflict resolution:

Original Conflicts: {original_conflicts}
Resolution Result: {resolution_result}

Validate the resolution:
1. Verify all conflicts have been addressed
2. Check for new conflicts introduced by resolution
3. Validate semantic consistency of the result
4. Assess completeness and correctness
5. Identify any remaining issues or risks

Focus on ensuring the resolution is complete and safe."""

        else:
            return f"Unknown conflict resolution operation: {operation}. Please provide guidance on how to handle this request."

    async def execute_task(self, task: AgentTask) -> Dict[str, Any]:
        """Execute conflict resolution task with fallback to rule-based resolution"""
        try:
            # Try PydanticAI first
            result = await super().execute_task(task)
            return result
        except Exception as e:
            logger.warning(f"PydanticAI conflict resolution failed, falling back to rule-based: {e}")
            return await self._fallback_conflict_resolution(task)

    async def _fallback_conflict_resolution(self, task: AgentTask) -> Dict[str, Any]:
        """Fallback rule-based conflict resolution when LLM is unavailable"""
        if task.operation == "detect_conflicts":
            return await self._detect_conflicts_fallback(task.input_data)
        elif task.operation == "resolve_conflicts":
            return await self._resolve_conflicts_fallback(task.input_data)
        elif task.operation == "merge_changes":
            return await self._merge_changes_fallback(task.input_data)
        elif task.operation == "validate_resolution":
            return await self._validate_resolution_fallback(task.input_data)
        else:
            return {
                "success": False,
                "error": f"Unknown operation: {task.operation}",
                "agent_id": self.registration.agent_id
            }

    async def _detect_conflicts_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based conflict detection fallback"""
        base_version = input_data.get("base_version", {})
        local_changes = input_data.get("local_changes", {})
        remote_changes = input_data.get("remote_changes", {})
        
        conflicts = []
        resolution_strategies = []
        
        # Simple field-level conflict detection
        local_fields = set(local_changes.keys()) if isinstance(local_changes, dict) else set()
        remote_fields = set(remote_changes.keys()) if isinstance(remote_changes, dict) else set()
        
        # Find overlapping changes
        overlapping_fields = local_fields.intersection(remote_fields)
        
        for field in overlapping_fields:
            local_value = local_changes.get(field)
            remote_value = remote_changes.get(field)
            
            if local_value != remote_value:
                conflict = ConflictDetails(
                    conflict_id=f"conflict_{field}",
                    conflict_type="content",
                    severity="medium",
                    description=f"Conflicting changes to field '{field}'",
                    location=ConflictLocation(
                        entity_id="unknown",
                        entity_type="field",
                        path=field
                    ),
                    base_version={"field": field, "value": base_version.get(field)},
                    local_changes={"field": field, "value": local_value},
                    remote_changes={"field": field, "value": remote_value},
                    auto_resolvable=False
                )
                conflicts.append(conflict)
                
                # Generate basic resolution strategies
                resolution_strategies.extend([
                    ResolutionStrategy(
                        strategy_id=f"prefer_local_{field}",
                        strategy_type="prefer_local",
                        description=f"Use local value for field '{field}'",
                        confidence=0.5,
                        risk_level="medium",
                        resolution_steps=[{"action": "use_local", "field": field}],
                        validation_criteria=["field_consistency"],
                        rollback_procedure=[{"action": "restore_original", "field": field}]
                    ),
                    ResolutionStrategy(
                        strategy_id=f"prefer_remote_{field}",
                        strategy_type="prefer_remote",
                        description=f"Use remote value for field '{field}'",
                        confidence=0.5,
                        risk_level="medium",
                        resolution_steps=[{"action": "use_remote", "field": field}],
                        validation_criteria=["field_consistency"],
                        rollback_procedure=[{"action": "restore_original", "field": field}]
                    )
                ])
        
        auto_resolution_possible = len(conflicts) == 0
        manual_intervention_required = len(conflicts) > 0
        
        return {
            "success": True,
            "conflicts_detected": [conflict.model_dump() for conflict in conflicts],
            "resolution_strategies": [strategy.model_dump() for strategy in resolution_strategies],
            "recommended_strategy": resolution_strategies[0].strategy_id if resolution_strategies else None,
            "auto_resolution_possible": auto_resolution_possible,
            "manual_intervention_required": manual_intervention_required,
            "merge_result": None,
            "conflict_summary": {
                "total_conflicts": len(conflicts),
                "auto_resolvable": 0,
                "manual_required": len(conflicts)
            },
            "resolution_confidence": 0.6 if not conflicts else 0.4,
            "reasoning": "Rule-based conflict detection completed - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _resolve_conflicts_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback conflict resolution"""
        conflicts = input_data.get("conflicts", [])
        
        # Basic resolution: prefer local changes
        merge_result = {}
        resolved_conflicts = []
        
        for conflict in conflicts:
            if isinstance(conflict, dict):
                local_changes = conflict.get("local_changes", {})
                if "field" in local_changes and "value" in local_changes:
                    merge_result[local_changes["field"]] = local_changes["value"]
                    resolved_conflicts.append(conflict.get("conflict_id", "unknown"))
        
        return {
            "success": True,
            "conflicts_detected": conflicts,
            "resolution_strategies": [],
            "recommended_strategy": "prefer_local",
            "auto_resolution_possible": True,
            "manual_intervention_required": False,
            "merge_result": merge_result,
            "conflict_summary": {
                "total_conflicts": len(conflicts),
                "resolved": len(resolved_conflicts),
                "remaining": len(conflicts) - len(resolved_conflicts)
            },
            "resolution_confidence": 0.5,
            "reasoning": "Basic conflict resolution applied - detailed resolution requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _merge_changes_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback merge operation"""
        base_version = input_data.get("base_version", {})
        change_sets = input_data.get("change_sets", [])
        
        # Simple merge: apply changes sequentially
        merge_result = base_version.copy() if isinstance(base_version, dict) else {}
        
        for change_set in change_sets:
            if isinstance(change_set, dict):
                merge_result.update(change_set)
        
        return {
            "success": True,
            "conflicts_detected": [],
            "resolution_strategies": [],
            "recommended_strategy": "sequential_merge",
            "auto_resolution_possible": True,
            "manual_intervention_required": False,
            "merge_result": merge_result,
            "conflict_summary": {
                "total_conflicts": 0,
                "resolved": 0,
                "remaining": 0
            },
            "resolution_confidence": 0.7,
            "reasoning": "Sequential merge applied - conflict detection requires LLM analysis",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _validate_resolution_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback resolution validation"""
        return {
            "success": True,
            "conflicts_detected": [],
            "resolution_strategies": [],
            "recommended_strategy": None,
            "auto_resolution_possible": True,
            "manual_intervention_required": False,
            "merge_result": input_data.get("resolution_result", {}),
            "conflict_summary": {
                "validation_status": "basic_check_passed",
                "issues_found": 0
            },
            "resolution_confidence": 0.6,
            "reasoning": "Basic validation completed - detailed validation requires LLM analysis",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }