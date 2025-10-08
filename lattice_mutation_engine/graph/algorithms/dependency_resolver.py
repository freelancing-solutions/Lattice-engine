"""
Dependency Resolution Algorithm for the Lattice Mutation Engine.

This module provides algorithms for:
- Building dependency graphs
- Detecting circular dependencies using DFS
- Resolving dependency order using topological sorting
- Analyzing dependency impact and change propagation
"""

import logging
from typing import List, Dict, Set, Optional, Tuple, Any
from collections import defaultdict, deque
from dataclasses import dataclass
from enum import Enum

from ...models.spec_graph_models import Node, Edge, RelationshipType

logger = logging.getLogger(__name__)


class DependencyType(Enum):
    """Types of dependencies in the spec graph"""
    DIRECT = "direct"
    TRANSITIVE = "transitive"
    CIRCULAR = "circular"


@dataclass
class DependencyNode:
    """Represents a node in the dependency graph"""
    id: str
    name: str
    node_type: str
    dependencies: Set[str]
    dependents: Set[str]
    depth: int = 0
    
    def __hash__(self):
        return hash(self.id)


@dataclass
class CircularDependency:
    """Represents a circular dependency in the graph"""
    cycle: List[str]
    cycle_type: str
    severity: str
    description: str
    
    @property
    def cycle_length(self) -> int:
        return len(self.cycle)


class CircularDependencyError(Exception):
    """Exception raised when circular dependencies are detected"""
    
    def __init__(self, cycles: List[CircularDependency]):
        self.cycles = cycles
        cycle_descriptions = [f"Cycle: {' -> '.join(cycle.cycle)}" for cycle in cycles]
        super().__init__(f"Circular dependencies detected:\n" + "\n".join(cycle_descriptions))


class DependencyResolver:
    """
    Advanced dependency resolution with circular dependency detection.
    
    Features:
    - DFS-based cycle detection
    - Topological sorting for dependency order
    - Impact analysis for change propagation
    - Multiple dependency relationship types
    """
    
    def __init__(self, repository):
        self.repository = repository
        self.dependency_graph: Dict[str, DependencyNode] = {}
        self.adjacency_list: Dict[str, Set[str]] = defaultdict(set)
        self.reverse_adjacency: Dict[str, Set[str]] = defaultdict(set)
        
        # Relationship types that create dependencies
        self.dependency_relationships = {
            RelationshipType.DEPENDS_ON,
            RelationshipType.IMPLEMENTS,
            RelationshipType.REFINES,
            RelationshipType.TESTED_BY
        }
    
    def build_dependency_graph(self, nodes: Optional[List[Node]] = None) -> Dict[str, DependencyNode]:
        """
        Build the dependency graph from spec nodes and edges.
        
        Args:
            nodes: Optional list of nodes to analyze. If None, uses all nodes.
            
        Returns:
            Dictionary mapping node IDs to DependencyNode objects
        """
        logger.info("Building dependency graph...")
        
        # Get nodes and edges
        if nodes is None:
            try:
                nodes = self.repository.query_nodes()
            except TypeError:
                nodes = self.repository.query_nodes(node_type=None, filters=None)
        
        try:
            edges = self.repository.query_edges()
        except TypeError:
            edges = self.repository.query_edges(relationship_type=None, filters=None)
        
        # Initialize dependency nodes
        self.dependency_graph = {}
        self.adjacency_list = defaultdict(set)
        self.reverse_adjacency = defaultdict(set)
        
        for node in nodes:
            dep_node = DependencyNode(
                id=node.id,
                name=node.name,
                node_type=node.type.value,
                dependencies=set(),
                dependents=set()
            )
            self.dependency_graph[node.id] = dep_node
        
        # Build adjacency lists from edges
        for edge in edges:
            if edge.relationship_type in self.dependency_relationships:
                source_id = edge.source_id
                target_id = edge.target_id
                
                # Add to adjacency lists
                self.adjacency_list[source_id].add(target_id)
                self.reverse_adjacency[target_id].add(source_id)
                
                # Update dependency nodes
                if source_id in self.dependency_graph:
                    self.dependency_graph[source_id].dependencies.add(target_id)
                if target_id in self.dependency_graph:
                    self.dependency_graph[target_id].dependents.add(source_id)
        
        # Calculate dependency depths
        self._calculate_dependency_depths()
        
        logger.info(f"Built dependency graph with {len(self.dependency_graph)} nodes")
        return self.dependency_graph
    
    def _calculate_dependency_depths(self):
        """Calculate the depth of each node in the dependency graph"""
        visited = set()
        
        def dfs_depth(node_id: str, current_depth: int = 0) -> int:
            if node_id in visited:
                return self.dependency_graph[node_id].depth
            
            visited.add(node_id)
            max_depth = current_depth
            
            # Check all dependencies
            for dep_id in self.adjacency_list.get(node_id, set()):
                if dep_id in self.dependency_graph:
                    dep_depth = dfs_depth(dep_id, current_depth + 1)
                    max_depth = max(max_depth, dep_depth)
            
            self.dependency_graph[node_id].depth = max_depth
            return max_depth
        
        for node_id in self.dependency_graph:
            if node_id not in visited:
                dfs_depth(node_id)
    
    def detect_circular_dependencies(self) -> List[CircularDependency]:
        """
        Detect circular dependencies using DFS with cycle detection.
        
        Returns:
            List of CircularDependency objects representing detected cycles
        """
        logger.info("Detecting circular dependencies...")
        
        cycles = []
        visited = set()
        rec_stack = set()
        path = []
        
        def dfs_cycle_detection(node_id: str) -> bool:
            """DFS with recursion stack to detect cycles"""
            if node_id in rec_stack:
                # Found a cycle - extract it from the path
                cycle_start = path.index(node_id)
                cycle = path[cycle_start:] + [node_id]
                
                # Create CircularDependency object
                circular_dep = CircularDependency(
                    cycle=cycle,
                    cycle_type=self._classify_cycle(cycle),
                    severity=self._assess_cycle_severity(cycle),
                    description=self._describe_cycle(cycle)
                )
                cycles.append(circular_dep)
                return True
            
            if node_id in visited:
                return False
            
            visited.add(node_id)
            rec_stack.add(node_id)
            path.append(node_id)
            
            # Visit all dependencies
            for dep_id in self.adjacency_list.get(node_id, set()):
                if dfs_cycle_detection(dep_id):
                    # Continue to find all cycles, don't return immediately
                    pass
            
            rec_stack.remove(node_id)
            path.pop()
            return False
        
        # Check all nodes for cycles
        for node_id in self.dependency_graph:
            if node_id not in visited:
                dfs_cycle_detection(node_id)
        
        logger.info(f"Detected {len(cycles)} circular dependencies")
        return cycles
    
    def _classify_cycle(self, cycle: List[str]) -> str:
        """Classify the type of circular dependency"""
        if len(cycle) <= 3:
            return "direct"
        elif len(cycle) <= 5:
            return "short_chain"
        else:
            return "long_chain"
    
    def _assess_cycle_severity(self, cycle: List[str]) -> str:
        """Assess the severity of a circular dependency"""
        # Consider cycle length and node types
        cycle_length = len(cycle) - 1  # Exclude duplicate node
        
        if cycle_length == 2:
            return "high"  # Direct circular dependency
        elif cycle_length <= 4:
            return "medium"  # Short cycle
        else:
            return "low"  # Long cycle, might be acceptable
    
    def _describe_cycle(self, cycle: List[str]) -> str:
        """Generate a human-readable description of the cycle"""
        cycle_names = []
        for node_id in cycle[:-1]:  # Exclude duplicate last node
            if node_id in self.dependency_graph:
                node = self.dependency_graph[node_id]
                cycle_names.append(f"{node.name} ({node.node_type})")
            else:
                cycle_names.append(node_id)
        
        return f"Circular dependency: {' → '.join(cycle_names)} → {cycle_names[0]}"
    
    def resolve_dependencies(self, target_nodes: Optional[List[str]] = None) -> List[str]:
        """
        Resolve dependencies using topological sorting.
        
        Args:
            target_nodes: Optional list of specific nodes to resolve. If None, resolves all.
            
        Returns:
            List of node IDs in dependency order (dependencies first)
            
        Raises:
            CircularDependencyError: If circular dependencies are detected
        """
        logger.info("Resolving dependency order...")
        
        # First check for circular dependencies
        cycles = self.detect_circular_dependencies()
        if cycles:
            raise CircularDependencyError(cycles)
        
        # Perform topological sort
        if target_nodes:
            # Resolve only specified nodes and their dependencies
            return self._topological_sort_subset(target_nodes)
        else:
            # Resolve all nodes
            return self._topological_sort_all()
    
    def _topological_sort_all(self) -> List[str]:
        """Topological sort of all nodes"""
        in_degree = defaultdict(int)
        
        # Calculate in-degrees
        for node_id in self.dependency_graph:
            in_degree[node_id] = len(self.reverse_adjacency[node_id])
        
        # Initialize queue with nodes having no dependencies
        queue = deque([node_id for node_id in self.dependency_graph if in_degree[node_id] == 0])
        result = []
        
        while queue:
            node_id = queue.popleft()
            result.append(node_id)
            
            # Update in-degrees of dependent nodes
            for dependent_id in self.adjacency_list[node_id]:
                in_degree[dependent_id] -= 1
                if in_degree[dependent_id] == 0:
                    queue.append(dependent_id)
        
        return result
    
    def _topological_sort_subset(self, target_nodes: List[str]) -> List[str]:
        """Topological sort of a subset of nodes and their dependencies"""
        # Find all nodes that need to be included (targets + their dependencies)
        required_nodes = set()
        
        def collect_dependencies(node_id: str):
            if node_id in required_nodes or node_id not in self.dependency_graph:
                return
            required_nodes.add(node_id)
            for dep_id in self.adjacency_list[node_id]:
                collect_dependencies(dep_id)
        
        for target in target_nodes:
            collect_dependencies(target)
        
        # Perform topological sort on the subset
        in_degree = defaultdict(int)
        for node_id in required_nodes:
            in_degree[node_id] = len([dep for dep in self.reverse_adjacency[node_id] if dep in required_nodes])
        
        queue = deque([node_id for node_id in required_nodes if in_degree[node_id] == 0])
        result = []
        
        while queue:
            node_id = queue.popleft()
            result.append(node_id)
            
            for dependent_id in self.adjacency_list[node_id]:
                if dependent_id in required_nodes:
                    in_degree[dependent_id] -= 1
                    if in_degree[dependent_id] == 0:
                        queue.append(dependent_id)
        
        return result
    
    def analyze_change_impact(self, changed_nodes: List[str]) -> Dict[str, Any]:
        """
        Analyze the impact of changes to specific nodes.
        
        Args:
            changed_nodes: List of node IDs that have changed
            
        Returns:
            Dictionary containing impact analysis results
        """
        logger.info(f"Analyzing impact of changes to {len(changed_nodes)} nodes")
        
        directly_affected = set()
        transitively_affected = set()
        
        # Find all nodes affected by the changes
        def collect_affected(node_id: str, visited: Set[str]):
            if node_id in visited:
                return
            visited.add(node_id)
            
            for dependent_id in self.reverse_adjacency[node_id]:
                if dependent_id not in changed_nodes:
                    if any(dep in changed_nodes for dep in self.adjacency_list[dependent_id]):
                        directly_affected.add(dependent_id)
                    else:
                        transitively_affected.add(dependent_id)
                    collect_affected(dependent_id, visited)
        
        visited = set()
        for changed_node in changed_nodes:
            collect_affected(changed_node, visited)
        
        # Calculate impact metrics
        total_nodes = len(self.dependency_graph)
        impact_ratio = (len(directly_affected) + len(transitively_affected)) / total_nodes if total_nodes > 0 else 0
        
        return {
            "changed_nodes": changed_nodes,
            "directly_affected": list(directly_affected),
            "transitively_affected": list(transitively_affected),
            "total_affected": len(directly_affected) + len(transitively_affected),
            "impact_ratio": impact_ratio,
            "severity": self._assess_impact_severity(impact_ratio),
            "recommended_actions": self._generate_impact_recommendations(
                changed_nodes, directly_affected, transitively_affected
            )
        }
    
    def _assess_impact_severity(self, impact_ratio: float) -> str:
        """Assess the severity of change impact"""
        if impact_ratio >= 0.5:
            return "high"
        elif impact_ratio >= 0.2:
            return "medium"
        else:
            return "low"
    
    def _generate_impact_recommendations(self, changed: List[str], direct: Set[str], transitive: Set[str]) -> List[str]:
        """Generate recommendations based on impact analysis"""
        recommendations = []
        
        if len(direct) > 10:
            recommendations.append("Consider breaking changes into smaller batches")
        
        if len(transitive) > 20:
            recommendations.append("Review transitive dependencies for potential decoupling")
        
        if len(changed) == 1 and len(direct) > 5:
            recommendations.append("This node has high fan-out - consider interface stability")
        
        return recommendations
    
    def get_dependency_stats(self) -> Dict[str, Any]:
        """Get statistics about the dependency graph"""
        if not self.dependency_graph:
            return {"error": "Dependency graph not built"}
        
        # Calculate statistics
        total_nodes = len(self.dependency_graph)
        total_edges = sum(len(deps) for deps in self.adjacency_list.values())
        
        dependency_counts = [len(node.dependencies) for node in self.dependency_graph.values()]
        dependent_counts = [len(node.dependents) for node in self.dependency_graph.values()]
        
        max_depth = max((node.depth for node in self.dependency_graph.values()), default=0)
        
        return {
            "total_nodes": total_nodes,
            "total_dependencies": total_edges,
            "max_dependency_depth": max_depth,
            "avg_dependencies_per_node": sum(dependency_counts) / total_nodes if total_nodes > 0 else 0,
            "avg_dependents_per_node": sum(dependent_counts) / total_nodes if total_nodes > 0 else 0,
            "nodes_with_no_dependencies": len([c for c in dependency_counts if c == 0]),
            "nodes_with_no_dependents": len([c for c in dependent_counts if c == 0]),
            "highly_connected_nodes": len([c for c in dependency_counts if c > 5])
        }