"""
PydanticAI-based Dependency Resolver Agent for the Lattice Mutation Engine.
This agent analyzes dependencies, detects circular dependencies, and resolves dependency conflicts.
"""

import logging
from typing import Dict, Any, List, Set, Optional
from pydantic import BaseModel, Field

from .pydantic_base_agent import PydanticBaseAgent, AgentContext
from ..models.agent_models import AgentRegistration, AgentTask


logger = logging.getLogger(__name__)


class DependencyNode(BaseModel):
    """Represents a node in the dependency graph"""
    id: str
    type: str
    title: str
    dependencies: List[str] = Field(default_factory=list)
    dependents: List[str] = Field(default_factory=list)


class CircularDependency(BaseModel):
    """Represents a circular dependency cycle"""
    cycle: List[str] = Field(description="List of node IDs forming the cycle")
    severity: str = Field(description="Severity level: critical, warning, info")
    impact: str = Field(description="Description of the impact")
    suggested_resolution: str = Field(description="Suggested way to resolve the cycle")


class DependencyAnalysisResponse(BaseModel):
    """Structured response from the dependency resolver agent"""
    dependency_graph: List[DependencyNode] = Field(default_factory=list)
    circular_dependencies: List[CircularDependency] = Field(default_factory=list)
    dependency_violations: List[Dict[str, Any]] = Field(default_factory=list)
    resolution_suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    is_valid: bool = Field(description="Whether the dependency structure is valid")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Confidence in the analysis")
    reasoning: str = Field(description="Explanation of the dependency analysis")


class PydanticDependencyAgent(PydanticBaseAgent[DependencyAnalysisResponse]):
    """
    Dependency Resolver agent that uses PydanticAI for intelligent dependency analysis.
    
    This agent can:
    - Build dependency graphs from specifications
    - Detect circular dependencies and cycles
    - Analyze dependency impact of proposed changes
    - Suggest dependency resolution strategies
    - Validate dependency constraints
    """
    
    def __init__(self, registration: AgentRegistration):
        super().__init__(registration, DependencyAnalysisResponse)
    
    def _get_system_prompt(self) -> str:
        return """You are a Dependency Resolver Agent for the Lattice Mutation Engine.

Your role is to analyze dependencies between specifications and ensure dependency integrity.

Key responsibilities:
1. Build and analyze dependency graphs from specification relationships
2. Detect circular dependencies and dependency cycles
3. Analyze the impact of proposed changes on dependency chains
4. Suggest resolution strategies for dependency conflicts
5. Validate dependency constraints and rules

Dependency Analysis Rules:
- Critical dependencies: depends_on, implements relationships
- Soft dependencies: uses, contains relationships  
- Conflicting dependencies: conflicts_with relationships
- Inheritance dependencies: derives_from relationships

Circular Dependency Detection:
- CRITICAL: Hard cycles in depends_on/implements chains that prevent execution
- WARNING: Soft cycles that may cause issues but don't block execution
- INFO: Potential cycles that should be monitored

Resolution Strategies:
- Dependency inversion: Introduce abstractions to break cycles
- Layered architecture: Organize dependencies in clear layers
- Interface segregation: Split large dependencies into smaller ones
- Temporal decoupling: Use events/messages to break direct dependencies

Analysis Output:
- Complete dependency graph with all relationships
- All circular dependencies with severity levels
- Dependency violations and constraint breaches
- Actionable resolution suggestions
- Confidence score based on analysis completeness
- Clear reasoning for all findings"""

    def _prepare_user_message(self, task: AgentTask) -> str:
        """Prepare dependency analysis request for the LLM"""
        operation = task.operation
        input_data = task.input_data
        
        if operation == "analyze_dependencies":
            specs = input_data.get("specs", [])
            relationships = input_data.get("relationships", [])
            
            return f"""Please analyze the dependency structure of these specifications:

Operation: {operation}
Specifications: {specs}
Relationships: {relationships}

Perform a comprehensive dependency analysis:
1. Build the complete dependency graph
2. Identify all circular dependencies
3. Classify dependency types and severity
4. Check for dependency constraint violations
5. Suggest resolution strategies for any issues found

Provide a structured analysis with detailed findings and recommendations."""

        elif operation == "analyze_change_impact":
            proposed_change = input_data.get("change", {})
            current_graph = input_data.get("current_graph", {})
            
            return f"""Please analyze the dependency impact of this proposed change:

Proposed Change: {proposed_change}
Current Dependency Graph: {current_graph}

Analyze the impact:
1. Which dependencies will be affected by this change?
2. Are any new circular dependencies introduced?
3. Are existing dependency constraints violated?
4. What is the blast radius of this change?
5. What mitigation strategies are recommended?

Provide a structured impact analysis with risk assessment."""

        elif operation == "resolve_circular_dependency":
            cycle_info = input_data.get("cycle", {})
            context = input_data.get("context", {})
            
            return f"""Please suggest resolution strategies for this circular dependency:

Circular Dependency: {cycle_info}
Context: {context}

Provide resolution strategies:
1. Root cause analysis of the circular dependency
2. Multiple resolution approaches with pros/cons
3. Recommended approach with implementation steps
4. Risk assessment for each resolution strategy
5. Validation criteria to ensure resolution success

Focus on practical, implementable solutions."""

        else:
            return f"Unknown dependency operation: {operation}. Please provide guidance on how to handle this request."

    async def execute_task(self, task: AgentTask) -> Dict[str, Any]:
        """Execute dependency analysis task with fallback to graph-based analysis"""
        try:
            # Try PydanticAI first
            result = await super().execute_task(task)
            return result
        except Exception as e:
            logger.warning(f"PydanticAI dependency analysis failed, falling back to graph-based: {e}")
            return await self._fallback_dependency_analysis(task)

    async def _fallback_dependency_analysis(self, task: AgentTask) -> Dict[str, Any]:
        """Fallback graph-based dependency analysis when LLM is unavailable"""
        if task.operation == "analyze_dependencies":
            return await self._analyze_dependencies_fallback(task.input_data)
        elif task.operation == "analyze_change_impact":
            return await self._analyze_change_impact_fallback(task.input_data)
        elif task.operation == "resolve_circular_dependency":
            return await self._resolve_circular_dependency_fallback(task.input_data)
        else:
            return {
                "success": False,
                "error": f"Unknown operation: {task.operation}",
                "agent_id": self.registration.agent_id
            }

    async def _analyze_dependencies_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Graph-based dependency analysis fallback"""
        specs = input_data.get("specs", [])
        relationships = input_data.get("relationships", [])
        
        # Build dependency graph
        dependency_graph = []
        node_map = {}
        
        # Initialize nodes
        for spec in specs:
            node = DependencyNode(
                id=spec.get("id", ""),
                type=spec.get("type", ""),
                title=spec.get("title", "")
            )
            dependency_graph.append(node)
            node_map[node.id] = node
        
        # Add relationships
        for rel in relationships:
            source_id = rel.get("source_id", "")
            target_id = rel.get("target_id", "")
            rel_type = rel.get("type", "")
            
            if source_id in node_map and target_id in node_map:
                if rel_type in ["depends_on", "implements", "uses"]:
                    node_map[source_id].dependencies.append(target_id)
                    node_map[target_id].dependents.append(source_id)
        
        # Detect circular dependencies using DFS
        circular_dependencies = self._detect_cycles(node_map)
        
        is_valid = len(circular_dependencies) == 0
        confidence = 0.8 if is_valid else 0.6
        
        return {
            "success": True,
            "dependency_graph": [node.model_dump() for node in dependency_graph],
            "circular_dependencies": [cycle.model_dump() for cycle in circular_dependencies],
            "dependency_violations": [],
            "resolution_suggestions": self._generate_resolution_suggestions(circular_dependencies),
            "is_valid": is_valid,
            "confidence_score": confidence,
            "reasoning": "Graph-based dependency analysis completed",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    def _detect_cycles(self, node_map: Dict[str, DependencyNode]) -> List[CircularDependency]:
        """Detect circular dependencies using DFS"""
        visited = set()
        rec_stack = set()
        cycles = []
        
        def dfs(node_id: str, path: List[str]) -> None:
            if node_id in rec_stack:
                # Found a cycle
                cycle_start = path.index(node_id)
                cycle_path = path[cycle_start:] + [node_id]
                
                cycles.append(CircularDependency(
                    cycle=cycle_path,
                    severity="critical" if len(cycle_path) <= 3 else "warning",
                    impact=f"Circular dependency involving {len(cycle_path)-1} components",
                    suggested_resolution="Consider dependency inversion or interface segregation"
                ))
                return
            
            if node_id in visited:
                return
            
            visited.add(node_id)
            rec_stack.add(node_id)
            
            if node_id in node_map:
                for dep_id in node_map[node_id].dependencies:
                    dfs(dep_id, path + [node_id])
            
            rec_stack.remove(node_id)
        
        for node_id in node_map:
            if node_id not in visited:
                dfs(node_id, [])
        
        return cycles

    def _generate_resolution_suggestions(self, cycles: List[CircularDependency]) -> List[Dict[str, Any]]:
        """Generate resolution suggestions for circular dependencies"""
        suggestions = []
        
        for cycle in cycles:
            suggestions.append({
                "type": "dependency_inversion",
                "description": f"Introduce an interface to break the cycle: {' -> '.join(cycle.cycle)}",
                "priority": "high" if cycle.severity == "critical" else "medium",
                "implementation": "Create an abstract interface that both components can depend on"
            })
        
        return suggestions

    async def _analyze_change_impact_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback change impact analysis"""
        return {
            "success": True,
            "dependency_graph": [],
            "circular_dependencies": [],
            "dependency_violations": [],
            "resolution_suggestions": [],
            "is_valid": True,
            "confidence_score": 0.5,
            "reasoning": "Basic change impact analysis - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }

    async def _resolve_circular_dependency_fallback(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback circular dependency resolution"""
        return {
            "success": True,
            "dependency_graph": [],
            "circular_dependencies": [],
            "dependency_violations": [],
            "resolution_suggestions": [
                {
                    "type": "dependency_inversion",
                    "description": "Introduce interfaces to break circular dependencies",
                    "priority": "high",
                    "implementation": "Create abstract interfaces that components can depend on"
                }
            ],
            "is_valid": False,
            "confidence_score": 0.4,
            "reasoning": "Basic resolution suggestions - detailed analysis requires LLM",
            "agent_id": self.registration.agent_id,
            "fallback_mode": True
        }