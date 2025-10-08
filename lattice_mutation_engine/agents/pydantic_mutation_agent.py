"""
PydanticAI-based Mutation Generator Agent for the Lattice Mutation Engine.
This agent generates intelligent mutations and changes to specifications.
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from .pydantic_base_agent import PydanticBaseAgent, AgentContext
from ..models.agent_models import AgentRegistration, AgentTask


logger = logging.getLogger(__name__)


class MutationStep(BaseModel):
    """Represents a single step in a mutation sequence"""
    step_id: str = Field(description="Unique identifier for this mutation step")
    operation: str = Field(description="Type of operation: add, modify, delete, move")
    target: str = Field(description="Target element or path for the mutation")
    content: Dict[str, Any] = Field(description="Content or changes to apply")
    dependencies: List[str] = Field(default_factory=list, description="Step IDs this step depends on")
    rationale: str = Field(description="Explanation for why this step is needed")


class MutationPlan(BaseModel):
    """Represents a complete mutation plan"""
    plan_id: str = Field(description="Unique identifier for this mutation plan")
    description: str = Field(description="High-level description of the mutation")
    steps: List[MutationStep] = Field(description="Ordered list of mutation steps")
    estimated_impact: str = Field(description="Estimated impact level: low, medium, high")
    risk_assessment: str = Field(description="Risk assessment and mitigation strategies")
    rollback_plan: List[Dict[str, Any]] = Field(default_factory=list, description="Steps to rollback if needed")


class MutationResponse(BaseModel):
    """Structured response from the mutation generator agent"""
    success: bool = Field(description="Whether mutation generation was successful")
    mutation_plan: Optional[MutationPlan] = Field(default=None, description="Generated mutation plan")
    alternative_plans: List[MutationPlan] = Field(default_factory=list, description="Alternative mutation approaches")
    feasibility_score: float = Field(ge=0.0, le=1.0, description="Feasibility score of the primary plan")
    complexity_score: float = Field(ge=0.0, le=1.0, description="Complexity score of the mutation")
    risk_factors: List[Dict[str, Any]] = Field(default_factory=list, description="Identified risk factors")
    prerequisites: List[str] = Field(default_factory=list, description="Prerequisites before applying mutation")
    validation_criteria: List[str] = Field(default_factory=list, description="Criteria to validate mutation success")
    reasoning: str = Field(description="Explanation of the mutation generation process")


class PydanticMutationAgent(PydanticBaseAgent[MutationResponse]):
    """
    Mutation Generator agent that uses PydanticAI for intelligent mutation planning.
    
    This agent can:
    - Generate mutation plans for specification changes
    - Create step-by-step mutation sequences
    - Assess mutation feasibility and complexity
    - Identify risks and mitigation strategies
    - Generate rollback plans for safe mutations
    """
    
    def __init__(self, registration: AgentRegistration):
        super().__init__(registration, MutationResponse)
    
    def _get_system_prompt(self) -> str:
        return """You are a Mutation Generator Agent for the Lattice Mutation Engine.

Your role is to generate intelligent, safe, and effective mutations for specifications.

Key responsibilities:
1. Generate comprehensive mutation plans for specification changes
2. Break down complex changes into manageable steps
3. Assess mutation feasibility and complexity
4. Identify risks and create mitigation strategies
5. Generate rollback plans for safe mutation application

Mutation Planning Principles:

1. ATOMIC OPERATIONS:
   - Each step should be atomic and reversible
   - Clear dependencies between steps
   - Fail-fast approach with early validation
   - Minimal blast radius for each change

2. SAFETY FIRST:
   - Always generate rollback plans
   - Identify potential breaking changes
   - Suggest validation checkpoints
   - Consider backward compatibility

3. INTELLIGENT SEQUENCING:
   - Order steps to minimize conflicts
   - Handle dependencies correctly
   - Batch related changes efficiently
   - Optimize for minimal disruption

4. RISK ASSESSMENT:
   - Identify high-risk operations
   - Suggest mitigation strategies
   - Estimate impact on dependent systems
   - Plan for failure scenarios

Mutation Types:
- STRUCTURAL: Changes to spec structure, relationships, or hierarchy
- CONTENT: Updates to descriptions, requirements, or constraints
- METADATA: Changes to tags, categories, or administrative data
- BEHAVIORAL: Modifications to business logic or workflows

Risk Levels:
- LOW: Simple content updates, metadata changes
- MEDIUM: Structural changes, new relationships
- HIGH: Breaking changes, major refactoring

Output Requirements:
- Detailed step-by-step mutation plan
- Clear rationale for each step
- Comprehensive risk assessment
- Rollback procedures for each step
- Validation criteria and checkpoints"""

    def _prepare_user_message(self, task: AgentTask) -> str:
        """Prepare mutation generation request for the LLM"""
        operation = task.operation
        input_data = task.input_data
        
        if operation == "generate_mutation":
            change_request = input_data.get("change_request", {})
            current_spec = input_data.get("current_spec", {})
            context = input_data.get("context", {})
            
            return f"""Please generate a mutation plan for this change request:

Change Request: {change_request}
Current Specification: {current_spec}
Context: {context}

Generate a comprehensive mutation plan:
1. Analyze the requested changes and their implications
2. Break down the changes into atomic, ordered steps
3. Identify dependencies between steps
4. Assess risks and complexity
5. Create rollback procedures
6. Define validation criteria

Focus on creating a safe, efficient, and reversible mutation plan."""

        elif operation == "optimize_mutation":
            mutation_plan = input_data.get("mutation_plan", {})
            constraints = input_data.get("constraints", {})
            
            return f"""Please optimize this mutation plan:

Current Mutation Plan: {mutation_plan}
Constraints: {constraints}

Optimize the plan for:
1. Reduced complexity and risk
2. Better step sequencing and batching
3. Improved rollback procedures
4. Enhanced validation checkpoints
5. Minimized system impact

Provide the optimized plan with explanations for improvements."""

        elif operation == "assess_mutation_risk":
            mutation_plan = input_data.get("mutation_plan", {})
            system_context = input_data.get("system_context", {})
            
            return f"""Please assess the risks of this mutation plan:

Mutation Plan: {mutation_plan}
System Context: {system_context}

Provide a comprehensive risk assessment:
1. Identify all potential risk factors
2. Assess impact on dependent systems
3. Evaluate rollback complexity
4. Suggest risk mitigation strategies
5. Recommend additional safeguards

Focus on preventing failures and minimizing disruption."""

        elif operation == "generate_rollback":
            applied_mutation = input_data.get("applied_mutation", {})
            current_state = input_data.get("current_state", {})
            
            return f"""Please generate a rollback plan for this applied mutation:

Applied Mutation: {applied_mutation}
Current State: {current_state}

Generate a comprehensive rollback plan:
1. Identify all changes that need to be reverted
2. Create step-by-step rollback procedures
3. Handle data consistency and integrity
4. Validate rollback completeness
5. Consider partial rollback scenarios

Ensure the rollback plan is safe and complete."""

        else:
            return f"Unknown mutation operation: {operation}. Please provide guidance on how to handle this request."

    async def execute_task(self, task: AgentTask) -> Dict[str, Any]:
        """Execute mutation generation task with fallback to template-based generation"""
        try:
            # Try PydanticAI first
            result = await super().execute_task(task)
            return result
        except Exception as e:
            logger.warning(f"PydanticAI mutation generation failed, falling back to template-based: {e}")
            return await self._fallback_mutation_generation(task)

    async def _fallback_mutation_generation(self, task: AgentTask) -> Dict[str, Any]:
        """Fallback template-based mutation generation when LLM is unavailable"""
        if task.operation == "generate_mutation":
            return await self._generate_mutation_fallback(task.input_data)
        elif task.operation == "optimize_mutation":
            return await self._optimize_mutation_fallback(task.input_data)
        elif task.operation == "assess_mutation_risk":
            return await self._assess_risk_fallback(task.input_data)
        elif task.operation == "generate_rollback":
            return await self._generate_rollback_fallback(task.input_data)
        else:
            return {
                "success": False,
                "error": f"Unknown operation: {task.operation}",
                "agent_id": self.registration.agent_id
            }

    async def _generate_mutation_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Template-based mutation generation fallback"""
        change_request = input_data.get("change_request", {})
        current_spec = input_data.get("current_spec", {})
        
        # Generate basic mutation plan based on change type
        change_type = change_request.get("type", "modify")
        target = change_request.get("target", "unknown")
        
        steps = []
        
        if change_type == "add":
            steps.append(MutationStep(
                step_id="add_001",
                operation="add",
                target=target,
                content=change_request.get("content", {}),
                dependencies=[],
                rationale=f"Add new {target} as requested"
            ))
        elif change_type == "modify":
            steps.append(MutationStep(
                step_id="modify_001",
                operation="modify",
                target=target,
                content=change_request.get("content", {}),
                dependencies=[],
                rationale=f"Modify existing {target} as requested"
            ))
        elif change_type == "delete":
            steps.append(MutationStep(
                step_id="delete_001",
                operation="delete",
                target=target,
                content={},
                dependencies=[],
                rationale=f"Delete {target} as requested"
            ))
        
        mutation_plan = MutationPlan(
            plan_id=f"plan_{change_type}_{target}",
            description=f"Basic {change_type} operation for {target}",
            steps=steps,
            estimated_impact="medium",
            risk_assessment="Standard risk - requires validation",
            rollback_plan=[{
                "step": "revert_changes",
                "description": "Revert all changes to previous state",
                "method": "restore_from_backup"
            }]
        )
        
        return {
            "success": True,
            "mutation_plan": mutation_plan.model_dump(),
            "alternative_plans": [],
            "feasibility_score": 0.7,
            "complexity_score": 0.5,
            "risk_factors": [
                {
                    "type": "validation_required",
                    "description": "Changes require validation before application",
                    "mitigation": "Run validation checks before applying"
                }
            ],
            "prerequisites": ["backup_current_state", "validate_permissions"],
            "validation_criteria": ["structure_integrity", "content_validity", "relationship_consistency"],
            "reasoning": "Template-based mutation plan generated - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _optimize_mutation_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback mutation optimization"""
        mutation_plan = input_data.get("mutation_plan", {})
        
        return {
            "success": True,
            "mutation_plan": mutation_plan,  # Return original plan
            "alternative_plans": [],
            "feasibility_score": 0.6,
            "complexity_score": 0.6,
            "risk_factors": [],
            "prerequisites": [],
            "validation_criteria": [],
            "reasoning": "Basic mutation plan returned - optimization requires LLM analysis",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _assess_risk_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback risk assessment"""
        return {
            "success": True,
            "mutation_plan": None,
            "alternative_plans": [],
            "feasibility_score": 0.5,
            "complexity_score": 0.5,
            "risk_factors": [
                {
                    "type": "unknown_impact",
                    "description": "Impact assessment requires detailed analysis",
                    "mitigation": "Perform thorough testing before deployment"
                }
            ],
            "prerequisites": ["comprehensive_testing", "backup_creation"],
            "validation_criteria": ["basic_functionality", "data_integrity"],
            "reasoning": "Basic risk assessment - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _generate_rollback_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rollback plan generation"""
        rollback_plan = MutationPlan(
            plan_id="rollback_basic",
            description="Basic rollback to previous state",
            steps=[
                MutationStep(
                    step_id="rollback_001",
                    operation="restore",
                    target="full_state",
                    content={"method": "restore_from_backup"},
                    dependencies=[],
                    rationale="Restore system to previous known good state"
                )
            ],
            estimated_impact="medium",
            risk_assessment="Standard rollback risk",
            rollback_plan=[]  # No rollback for rollback
        )
        
        return {
            "success": True,
            "mutation_plan": rollback_plan.model_dump(),
            "alternative_plans": [],
            "feasibility_score": 0.8,
            "complexity_score": 0.3,
            "risk_factors": [],
            "prerequisites": ["backup_availability"],
            "validation_criteria": ["state_restoration", "data_consistency"],
            "reasoning": "Basic rollback plan generated - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }