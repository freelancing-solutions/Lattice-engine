"""Agent Factory for the Lattice Mutation Engine.
This module provides factory methods to create and configure PydanticAI-based agents.
"""

import logging
from typing import Dict, Any, List

from .pydantic_validator_agent import PydanticValidatorAgent
from .pydantic_dependency_agent import PydanticDependencyAgent
from .pydantic_semantic_agent import PydanticSemanticAgent
from .pydantic_mutation_agent import PydanticMutationAgent
from .pydantic_impact_agent import PydanticImpactAgent
from .pydantic_conflict_agent import PydanticConflictAgent
from ..models.agent_models import AgentRegistration, AgentType, AgentCapability


logger = logging.getLogger(__name__)


class AgentFactory:
    """Factory for creating and configuring PydanticAI-based agents"""
    
    @staticmethod
    def create_validator_agent() -> PydanticValidatorAgent:
        """Create a PydanticAI-based validator agent"""
        registration = AgentRegistration(
            agent_id="pydantic_validator_001",
            agent_type=AgentType.VALIDATOR,
            capabilities=[
                AgentCapability(
                    name="validate_proposal",
                    description="Validate mutation proposals against schema and business rules",
                    input_schema={
                        "type": "object",
                        "properties": {
                            "proposal": {
                                "type": "object",
                                "description": "The mutation proposal to validate"
                            }
                        },
                        "required": ["proposal"]
                    },
                    output_schema={
                        "type": "object",
                        "properties": {
                            "is_valid": {"type": "boolean"},
                            "errors": {"type": "array"},
                            "warnings": {"type": "array"},
                            "suggestions": {"type": "array"},
                            "confidence_score": {"type": "number"},
                            "reasoning": {"type": "string"}
                        }
                    }
                ),
                AgentCapability(
                    name="validate_spec",
                    description="Validate specification content and structure",
                    input_schema={
                        "type": "object",
                        "properties": {
                            "content": {"type": "string"},
                            "spec_id": {"type": "string"}
                        },
                        "required": ["content"]
                    },
                    output_schema={
                        "type": "object",
                        "properties": {
                            "is_valid": {"type": "boolean"},
                            "errors": {"type": "array"},
                            "warnings": {"type": "array"},
                            "suggestions": {"type": "array"},
                            "confidence_score": {"type": "number"},
                            "reasoning": {"type": "string"}
                        }
                    }
                )
            ],
            priority=8,  # High priority for validation
            max_concurrent_tasks=3
        )
        
        return PydanticValidatorAgent(registration)
    
    @staticmethod
    def create_dependency_agent() -> PydanticDependencyAgent:
        """Create a PydanticAI-based dependency resolver agent"""
        registration = AgentRegistration(
            agent_id="pydantic_dependency_resolver_001",
            agent_type=AgentType.DEPENDENCY_RESOLVER,
            capabilities=[
                AgentCapability(
                    name="analyze_dependencies",
                    description="Analyze dependencies between specifications",
                    input_schema={
                        "type": "object",
                        "properties": {
                            "specs": {"type": "array"},
                            "context": {"type": "object"}
                        },
                        "required": ["specs"]
                    },
                    output_schema={
                        "type": "object",
                        "properties": {
                            "dependency_graph": {"type": "object"},
                            "circular_dependencies": {"type": "array"},
                            "resolution_order": {"type": "array"}
                        }
                    }
                )
            ],
            priority=7,
            max_concurrent_tasks=2
        )
        
        return PydanticDependencyAgent(registration)
    
    @staticmethod
    def create_semantic_agent() -> PydanticSemanticAgent:
        """Create a PydanticAI-based semantic coherence agent"""
        registration = AgentRegistration(
            agent_id="pydantic_semantic_coherence_001",
            agent_type=AgentType.SEMANTIC_COHERENCE,
            capabilities=[
                AgentCapability(
                    name="analyze_coherence",
                    description="Analyze semantic coherence across specifications",
                    input_schema={
                        "type": "object",
                        "properties": {
                            "specs": {"type": "array"},
                            "context": {"type": "object"}
                        },
                        "required": ["specs"]
                    },
                    output_schema={
                        "type": "object",
                        "properties": {
                            "is_coherent": {"type": "boolean"},
                            "inconsistencies": {"type": "array"},
                            "suggestions": {"type": "array"}
                        }
                    }
                )
            ],
            priority=6,
            max_concurrent_tasks=2
        )
        
        return PydanticSemanticAgent(registration)
    
    @staticmethod
    def create_mutation_agent() -> PydanticMutationAgent:
        """Create a PydanticAI-based mutation generator agent"""
        registration = AgentRegistration(
            agent_id="pydantic_mutation_generator_001",
            agent_type=AgentType.MUTATION_GENERATOR,
            capabilities=[
                AgentCapability(
                    name="generate_mutation",
                    description="Generate mutation proposals for specifications",
                    input_schema={
                        "type": "object",
                        "properties": {
                            "change_request": {"type": "object"},
                            "current_spec": {"type": "object"},
                            "context": {"type": "object"}
                        },
                        "required": ["change_request", "current_spec"]
                    },
                    output_schema={
                        "type": "object",
                        "properties": {
                            "mutation_plan": {"type": "object"},
                            "feasibility_score": {"type": "number"},
                            "risk_assessment": {"type": "object"}
                        }
                    }
                )
            ],
            priority=5,
            max_concurrent_tasks=3
        )
        
        return PydanticMutationAgent(registration)
    
    @staticmethod
    def create_impact_agent() -> PydanticImpactAgent:
        """Create a PydanticAI-based impact analysis agent"""
        registration = AgentRegistration(
            agent_id="pydantic_impact_analyzer_001",
            agent_type=AgentType.IMPACT,
            capabilities=[
                AgentCapability(
                    name="analyze_change_impact",
                    description="Analyze the impact of proposed changes",
                    input_schema={
                        "type": "object",
                        "properties": {
                            "proposed_change": {"type": "object"},
                            "current_system": {"type": "object"},
                            "context": {"type": "object"}
                        },
                        "required": ["proposed_change", "current_system"]
                    },
                    output_schema={
                        "type": "object",
                        "properties": {
                            "impact_score": {"type": "number"},
                            "affected_entities": {"type": "array"},
                            "risk_factors": {"type": "array"}
                        }
                    }
                )
            ],
            priority=6,
            max_concurrent_tasks=2
        )
        
        return PydanticImpactAgent(registration)
    
    @staticmethod
    def create_conflict_agent() -> PydanticConflictAgent:
        """Create a PydanticAI-based conflict resolution agent"""
        registration = AgentRegistration(
            agent_id="pydantic_conflict_resolver_001",
            agent_type=AgentType.CONFLICT_RESOLVER,
            capabilities=[
                AgentCapability(
                    name="detect_conflicts",
                    description="Detect conflicts between different changes",
                    input_schema={
                        "type": "object",
                        "properties": {
                            "base_version": {"type": "object"},
                            "local_changes": {"type": "object"},
                            "remote_changes": {"type": "object"}
                        },
                        "required": ["base_version", "local_changes", "remote_changes"]
                    },
                    output_schema={
                        "type": "object",
                        "properties": {
                            "conflicts": {"type": "array"},
                            "auto_resolvable": {"type": "boolean"},
                            "resolution_strategies": {"type": "array"}
                        }
                    }
                )
            ],
            priority=7,
            max_concurrent_tasks=2
        )
        
        return PydanticConflictAgent(registration)
    
    @staticmethod
    def create_all_agents() -> List[Any]:
        """Create all available PydanticAI agents"""
        agents = []
        
        # Create all specialized agents
        agent_creators = [
            ("validator", AgentFactory.create_validator_agent),
            ("dependency", AgentFactory.create_dependency_agent),
            ("semantic", AgentFactory.create_semantic_agent),
            ("mutation", AgentFactory.create_mutation_agent),
            ("impact", AgentFactory.create_impact_agent),
            ("conflict", AgentFactory.create_conflict_agent)
        ]
        
        for agent_name, creator_func in agent_creators:
            try:
                agent = creator_func()
                agents.append(agent)
                logger.info(f"Created {agent_name} agent: {agent.registration.agent_id}")
            except Exception as e:
                logger.error(f"Failed to create {agent_name} agent: {e}")
        
        return agents
    
    @staticmethod
    def register_agents_with_orchestrator(orchestrator, agents: List[Any] = None):
        """Register all agents with the orchestrator"""
        if agents is None:
            agents = AgentFactory.create_all_agents()
        
        registered_count = 0
        for agent in agents:
            try:
                orchestrator.register_agent(agent)
                registered_count += 1
                logger.info(f"Registered agent: {agent.registration.agent_id}")
            except Exception as e:
                logger.error(f"Failed to register agent {agent.registration.agent_id}: {e}")
        
        logger.info(f"Successfully registered {registered_count} agents with orchestrator")
        return registered_count