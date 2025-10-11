"""
PydanticAI-based Impact Analysis Agent for the Lattice Mutation Engine.
This agent analyzes the impact of proposed changes across the specification ecosystem.
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from lattice_mutation_engine.agents.pydantic_base_agent import PydanticBaseAgent, AgentContext
from lattice_mutation_engine.models.agent_models import AgentRegistration, AgentTask


logger = logging.getLogger(__name__)


class ImpactedEntity(BaseModel):
    """Represents an entity impacted by a change"""
    entity_id: str = Field(description="Unique identifier of the impacted entity")
    entity_type: str = Field(description="Type of entity: spec, component, interface, etc.")
    impact_type: str = Field(description="Type of impact: breaking, compatible, enhancement")
    impact_severity: str = Field(description="Severity: critical, high, medium, low")
    description: str = Field(description="Description of the impact")
    affected_attributes: List[str] = Field(default_factory=list, description="Specific attributes affected")
    mitigation_required: bool = Field(description="Whether mitigation actions are required")
    mitigation_suggestions: List[str] = Field(default_factory=list, description="Suggested mitigation actions")


class RippleEffect(BaseModel):
    """Represents a ripple effect through the system"""
    source_entity: str = Field(description="Entity where the change originates")
    target_entity: str = Field(description="Entity affected by the ripple")
    relationship_type: str = Field(description="Type of relationship causing the ripple")
    propagation_path: List[str] = Field(description="Path of propagation through the system")
    effect_strength: float = Field(ge=0.0, le=1.0, description="Strength of the ripple effect")
    delay_estimate: str = Field(description="Estimated time for effect to manifest")


class ImpactAnalysisResponse(BaseModel):
    """Structured response from the impact analysis agent"""
    overall_impact_score: float = Field(ge=0.0, le=1.0, description="Overall impact score")
    impact_classification: str = Field(description="Classification: minimal, moderate, significant, major")
    impacted_entities: List[ImpactedEntity] = Field(default_factory=list)
    ripple_effects: List[RippleEffect] = Field(default_factory=list)
    breaking_changes: List[Dict[str, Any]] = Field(default_factory=list)
    compatibility_issues: List[Dict[str, Any]] = Field(default_factory=list)
    performance_implications: List[Dict[str, Any]] = Field(default_factory=list)
    security_implications: List[Dict[str, Any]] = Field(default_factory=list)
    migration_requirements: List[Dict[str, Any]] = Field(default_factory=list)
    testing_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    deployment_considerations: List[Dict[str, Any]] = Field(default_factory=list)
    confidence_score: float = Field(ge=0.0, le=1.0, description="Confidence in the impact analysis")
    reasoning: str = Field(description="Detailed reasoning for the impact assessment")


class PydanticImpactAgent(PydanticBaseAgent[ImpactAnalysisResponse]):
    """
    Impact Analysis agent that uses PydanticAI for comprehensive change impact assessment.
    
    This agent can:
    - Analyze direct and indirect impacts of proposed changes
    - Identify ripple effects through the system
    - Assess breaking changes and compatibility issues
    - Evaluate performance and security implications
    - Generate migration and testing recommendations
    """
    
    def __init__(self, registration: AgentRegistration):
        super().__init__(registration, ImpactAnalysisResponse)
    
    def _get_system_prompt(self) -> str:
        return """You are an Impact Analysis Agent for the Lattice Mutation Engine.

Your role is to comprehensively analyze the impact of proposed changes across the entire specification ecosystem.

Key responsibilities:
1. Analyze direct and indirect impacts of proposed changes
2. Identify ripple effects and cascading consequences
3. Assess breaking changes and compatibility issues
4. Evaluate performance, security, and operational implications
5. Generate actionable recommendations for safe change implementation

Impact Analysis Framework:

1. DIRECT IMPACT ANALYSIS:
   - Immediate effects on target specifications
   - Changes to interfaces, contracts, and APIs
   - Modifications to data structures and schemas
   - Updates to business rules and constraints

2. INDIRECT IMPACT ANALYSIS:
   - Ripple effects through dependent systems
   - Cascading changes in related specifications
   - Impact on downstream consumers and integrations
   - Effects on shared resources and services

3. COMPATIBILITY ASSESSMENT:
   - Backward compatibility implications
   - Forward compatibility considerations
   - Version compatibility matrix
   - Migration path requirements

4. RISK EVALUATION:
   - Breaking change identification
   - Performance degradation risks
   - Security vulnerability introduction
   - Operational complexity increases

Impact Categories:

BREAKING CHANGES:
- Interface signature modifications
- Required field additions/removals
- Behavioral contract changes
- Data format incompatibilities

COMPATIBLE CHANGES:
- Optional field additions
- Behavioral enhancements
- Performance improvements
- Documentation updates

ENHANCEMENT CHANGES:
- New feature additions
- Capability extensions
- Integration improvements
- User experience enhancements

Severity Levels:
- CRITICAL: System-breaking changes requiring immediate attention
- HIGH: Significant changes requiring careful planning and migration
- MEDIUM: Moderate changes with manageable impact
- LOW: Minor changes with minimal system impact

Analysis Output Requirements:
- Comprehensive impact scoring and classification
- Detailed entity-by-entity impact assessment
- Ripple effect mapping and propagation analysis
- Breaking change identification with mitigation strategies
- Testing and deployment recommendations
- Migration planning guidance"""

    def _prepare_user_message(self, task: AgentTask) -> str:
        """Prepare impact analysis request for the LLM"""
        operation = task.operation
        input_data = task.input_data
        
        if operation == "analyze_change_impact":
            proposed_change = input_data.get("proposed_change", {})
            current_system = input_data.get("current_system", {})
            context = input_data.get("context", {})
            
            return f"""Please analyze the impact of this proposed change:

Proposed Change: {proposed_change}
Current System State: {current_system}
Context: {context}

Perform a comprehensive impact analysis:
1. Identify all directly impacted entities and their specific impacts
2. Map ripple effects and cascading consequences
3. Assess breaking changes and compatibility issues
4. Evaluate performance, security, and operational implications
5. Generate testing and deployment recommendations

Focus on providing actionable insights for safe change implementation."""

        elif operation == "assess_ripple_effects":
            change_source = input_data.get("change_source", {})
            system_graph = input_data.get("system_graph", {})
            
            return f"""Please assess the ripple effects of changes from this source:

Change Source: {change_source}
System Dependency Graph: {system_graph}

Analyze ripple effects:
1. Trace propagation paths through the dependency graph
2. Assess effect strength at each propagation step
3. Identify amplification and dampening factors
4. Estimate timing and sequence of effect manifestation
5. Recommend monitoring and mitigation strategies

Focus on understanding how changes cascade through the system."""

        elif operation == "evaluate_breaking_changes":
            proposed_changes = input_data.get("proposed_changes", [])
            compatibility_matrix = input_data.get("compatibility_matrix", {})
            
            return f"""Please evaluate breaking changes in these proposals:

Proposed Changes: {proposed_changes}
Compatibility Matrix: {compatibility_matrix}

Evaluate breaking changes:
1. Identify all potential breaking changes
2. Assess severity and scope of each breaking change
3. Analyze compatibility implications across versions
4. Generate migration strategies and timelines
5. Recommend phased rollout approaches

Focus on minimizing disruption while enabling necessary changes."""

        elif operation == "generate_migration_plan":
            breaking_changes = input_data.get("breaking_changes", [])
            system_constraints = input_data.get("system_constraints", {})
            
            return f"""Please generate a migration plan for these breaking changes:

Breaking Changes: {breaking_changes}
System Constraints: {system_constraints}

Generate comprehensive migration plan:
1. Sequence changes to minimize disruption
2. Identify migration dependencies and prerequisites
3. Create rollback procedures for each migration step
4. Estimate migration timeline and resource requirements
5. Define success criteria and validation checkpoints

Focus on safe, efficient migration with minimal downtime."""

        else:
            return f"Unknown impact analysis operation: {operation}. Please provide guidance on how to handle this request."

    async def execute_task(self, task: AgentTask) -> Dict[str, Any]:
        """Execute impact analysis task with fallback to graph-based analysis"""
        try:
            # Try PydanticAI first
            result = await super().execute_task(task)
            return result
        except Exception as e:
            logger.warning(f"PydanticAI impact analysis failed, falling back to graph-based: {e}")
            return await self._fallback_impact_analysis(task)

    async def _fallback_impact_analysis(self, task: AgentTask) -> Dict[str, Any]:
        """Fallback graph-based impact analysis when LLM is unavailable"""
        if task.operation == "analyze_change_impact":
            return await self._analyze_impact_fallback(task.input_data)
        elif task.operation == "assess_ripple_effects":
            return await self._assess_ripple_fallback(task.input_data)
        elif task.operation == "evaluate_breaking_changes":
            return await self._evaluate_breaking_fallback(task.input_data)
        elif task.operation == "generate_migration_plan":
            return await self._generate_migration_fallback(task.input_data)
        else:
            return {
                "success": False,
                "error": f"Unknown operation: {task.operation}",
                "agent_id": self.registration.agent_id
            }

    async def _analyze_impact_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Graph-based impact analysis fallback"""
        proposed_change = input_data.get("proposed_change", {})
        current_system = input_data.get("current_system", {})
        
        # Basic impact analysis based on change type
        change_type = proposed_change.get("type", "modify")
        target_id = proposed_change.get("target_id", "unknown")
        
        impacted_entities = []
        ripple_effects = []
        breaking_changes = []
        
        # Analyze direct impact
        if change_type in ["delete", "modify"]:
            impacted_entities.append(ImpactedEntity(
                entity_id=target_id,
                entity_type="specification",
                impact_type="direct",
                impact_severity="medium",
                description=f"Direct {change_type} operation on {target_id}",
                affected_attributes=["content", "structure"],
                mitigation_required=True,
                mitigation_suggestions=["Validate changes", "Test dependent systems"]
            ))
        
        # Check for potential breaking changes
        if change_type == "delete":
            breaking_changes.append({
                "type": "entity_removal",
                "entity": target_id,
                "severity": "high",
                "description": f"Deletion of {target_id} may break dependent systems"
            })
        
        # Estimate overall impact
        impact_score = 0.3 if change_type == "add" else 0.6 if change_type == "modify" else 0.8
        impact_classification = "minimal" if impact_score < 0.4 else "moderate" if impact_score < 0.7 else "significant"
        
        return {
            "success": True,
            "overall_impact_score": impact_score,
            "impact_classification": impact_classification,
            "impacted_entities": [entity.model_dump() for entity in impacted_entities],
            "ripple_effects": [effect.model_dump() for effect in ripple_effects],
            "breaking_changes": breaking_changes,
            "compatibility_issues": [],
            "performance_implications": [],
            "security_implications": [],
            "migration_requirements": self._generate_basic_migration_requirements(change_type),
            "testing_recommendations": self._generate_basic_testing_recommendations(change_type),
            "deployment_considerations": self._generate_basic_deployment_considerations(change_type),
            "confidence_score": 0.6,
            "reasoning": "Graph-based impact analysis completed - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    def _generate_basic_migration_requirements(self, change_type: str) -> List[Dict[str, Any]]:
        """Generate basic migration requirements based on change type"""
        if change_type == "delete":
            return [
                {
                    "type": "dependency_cleanup",
                    "description": "Remove or update references to deleted entity",
                    "priority": "high"
                }
            ]
        elif change_type == "modify":
            return [
                {
                    "type": "compatibility_check",
                    "description": "Verify compatibility with existing integrations",
                    "priority": "medium"
                }
            ]
        return []

    def _generate_basic_testing_recommendations(self, change_type: str) -> List[Dict[str, Any]]:
        """Generate basic testing recommendations"""
        return [
            {
                "type": "integration_testing",
                "description": "Test integration points affected by the change",
                "scope": "affected_systems"
            },
            {
                "type": "regression_testing",
                "description": "Ensure existing functionality remains intact",
                "scope": "full_system"
            }
        ]

    def _generate_basic_deployment_considerations(self, change_type: str) -> List[Dict[str, Any]]:
        """Generate basic deployment considerations"""
        return [
            {
                "type": "rollback_plan",
                "description": "Prepare rollback procedures in case of issues",
                "importance": "critical"
            },
            {
                "type": "monitoring",
                "description": "Monitor system health during and after deployment",
                "importance": "high"
            }
        ]

    async def _assess_ripple_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback ripple effect assessment"""
        return {
            "success": True,
            "overall_impact_score": 0.5,
            "impact_classification": "moderate",
            "impacted_entities": [],
            "ripple_effects": [],
            "breaking_changes": [],
            "compatibility_issues": [],
            "performance_implications": [],
            "security_implications": [],
            "migration_requirements": [],
            "testing_recommendations": [],
            "deployment_considerations": [],
            "confidence_score": 0.4,
            "reasoning": "Basic ripple effect assessment - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _evaluate_breaking_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback breaking change evaluation"""
        return {
            "success": True,
            "overall_impact_score": 0.7,
            "impact_classification": "significant",
            "impacted_entities": [],
            "ripple_effects": [],
            "breaking_changes": [
                {
                    "type": "potential_breaking_change",
                    "description": "Changes may introduce breaking changes - detailed analysis required",
                    "severity": "medium"
                }
            ],
            "compatibility_issues": [],
            "performance_implications": [],
            "security_implications": [],
            "migration_requirements": [],
            "testing_recommendations": [],
            "deployment_considerations": [],
            "confidence_score": 0.3,
            "reasoning": "Basic breaking change evaluation - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _generate_migration_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback migration plan generation"""
        return {
            "success": True,
            "overall_impact_score": 0.6,
            "impact_classification": "moderate",
            "impacted_entities": [],
            "ripple_effects": [],
            "breaking_changes": [],
            "compatibility_issues": [],
            "performance_implications": [],
            "security_implications": [],
            "migration_requirements": [
                {
                    "type": "basic_migration",
                    "description": "Basic migration steps - detailed planning requires LLM analysis",
                    "priority": "medium"
                }
            ],
            "testing_recommendations": [],
            "deployment_considerations": [],
            "confidence_score": 0.4,
            "reasoning": "Basic migration plan generated - detailed planning requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }