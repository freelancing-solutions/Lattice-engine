"""
Topological Sorting Algorithms for the Lattice Mutation Engine.

This module provides topological sorting capabilities for:
- Dependency ordering
- Build order determination
- Cycle detection in directed graphs
- Layered graph analysis
"""

import logging
from typing import List, Dict, Set, Optional, Tuple, Any
from collections import deque, defaultdict
from enum import Enum
from dataclasses import dataclass

from ...models.spec_graph_models import Node, Edge, RelationshipType

logger = logging.getLogger(__name__)


class SortAlgorithm(Enum):
    """Topological sorting algorithms"""
    KAHN = "kahn"
    DFS = "dfs"
    LAYERED = "layered"


@dataclass
class TopologicalResult:
    """Result of topological sorting operation"""
    sorted_nodes: List[str]
    is_acyclic: bool
    cycles: List[List[str]]
    layers: Optional[List[List[str]]]
    metadata: Dict[str, Any]


@dataclass
class CycleInfo:
    """Information about a detected cycle"""
    nodes: List[str]
    edges: List[Tuple[str, str]]
    length: int
    cycle_type: str  # "simple", "complex"


class TopologicalSorter:
    """
    Advanced topological sorting with cycle detection and layered analysis.
    
    Features:
    - Multiple sorting algorithms (Kahn's, DFS-based)
    - Cycle detection and reporting
    - Layered topological sorting
    - Dependency level analysis
    - Custom relationship type filtering
    """
    
    def __init__(self, repository):
        self.repository = repository
        self.adjacency_list: Dict[str, Set[str]] = {}
        self.reverse_adjacency: Dict[str, Set[str]] = {}
        self.in_degree: Dict[str, int] = {}
        self.out_degree: Dict[str, int] = {}
        self.nodes_cache: Dict[str, Node] = {}
        
    def build_dependency_graph(self, relationship_types: Optional[Set[RelationshipType]] = None):
        """
        Build dependency graph for topological sorting.
        
        Args:
            relationship_types: Optional set of relationship types to consider
        """
        logger.info("Building dependency graph for topological sorting...")
        
        # Default to dependency relationships if not specified
        if relationship_types is None:
            relationship_types = {
                RelationshipType.DEPENDS_ON,
                RelationshipType.IMPLEMENTS,
                RelationshipType.REFINES
            }
        
        # Get all nodes and edges
        try:
            nodes = self.repository.query_nodes()
        except TypeError:
            nodes = self.repository.query_nodes(node_type=None, filters=None)
        
        try:
            edges = self.repository.query_edges()
        except TypeError:
            edges = self.repository.query_edges(relationship_type=None, filters=None)
        
        # Cache nodes
        self.nodes_cache = {node.id: node for node in nodes}
        
        # Initialize structures
        self.adjacency_list = {node.id: set() for node in nodes}
        self.reverse_adjacency = {node.id: set() for node in nodes}
        self.in_degree = {node.id: 0 for node in nodes}
        self.out_degree = {node.id: 0 for node in nodes}
        
        # Build adjacency lists and degree counts
        for edge in edges:
            if edge.relationship_type in relationship_types:
                source_id = edge.source_id
                target_id = edge.target_id
                
                self.adjacency_list[source_id].add(target_id)
                self.reverse_adjacency[target_id].add(source_id)
                self.in_degree[target_id] += 1
                self.out_degree[source_id] += 1
        
        logger.info(f"Built dependency graph with {len(nodes)} nodes and "
                   f"{sum(len(adj) for adj in self.adjacency_list.values())} dependency edges")
    
    def kahn_topological_sort(self) -> TopologicalResult:
        """
        Perform topological sorting using Kahn's algorithm.
        
        Returns:
            TopologicalResult with sorted nodes and cycle information
        """
        if not self.adjacency_list:
            return TopologicalResult([], True, [], None, {"error": "Graph not built"})
        
        # Copy in-degree for modification
        in_degree_copy = self.in_degree.copy()
        queue = deque([node for node, degree in in_degree_copy.items() if degree == 0])
        sorted_nodes = []
        processed_edges = 0
        total_edges = sum(len(adj) for adj in self.adjacency_list.values())
        
        while queue:
            current = queue.popleft()
            sorted_nodes.append(current)
            
            # Remove edges from current node
            for neighbor in self.adjacency_list[current]:
                in_degree_copy[neighbor] -= 1
                processed_edges += 1
                
                if in_degree_copy[neighbor] == 0:
                    queue.append(neighbor)
        
        # Check for cycles
        is_acyclic = processed_edges == total_edges
        cycles = []
        
        if not is_acyclic:
            cycles = self._detect_cycles_from_remaining_nodes(
                [node for node, degree in in_degree_copy.items() if degree > 0]
            )
        
        return TopologicalResult(
            sorted_nodes=sorted_nodes,
            is_acyclic=is_acyclic,
            cycles=cycles,
            layers=None,
            metadata={
                "algorithm": "kahn",
                "processed_edges": processed_edges,
                "total_edges": total_edges
            }
        )
    
    def dfs_topological_sort(self) -> TopologicalResult:
        """
        Perform topological sorting using DFS-based algorithm.
        
        Returns:
            TopologicalResult with sorted nodes and cycle information
        """
        if not self.adjacency_list:
            return TopologicalResult([], True, [], None, {"error": "Graph not built"})
        
        WHITE, GRAY, BLACK = 0, 1, 2
        color = {node: WHITE for node in self.adjacency_list}
        sorted_nodes = []
        cycles = []
        
        def dfs_visit(node: str, path: List[str]) -> bool:
            """DFS visit with cycle detection"""
            if color[node] == GRAY:
                # Found a back edge - cycle detected
                cycle_start = path.index(node)
                cycle = path[cycle_start:] + [node]
                cycles.append(cycle)
                return False
            
            if color[node] == BLACK:
                return True
            
            color[node] = GRAY
            current_path = path + [node]
            
            for neighbor in self.adjacency_list[node]:
                if not dfs_visit(neighbor, current_path):
                    return False
            
            color[node] = BLACK
            sorted_nodes.append(node)
            return True
        
        # Visit all nodes
        for node in self.adjacency_list:
            if color[node] == WHITE:
                dfs_visit(node, [])
        
        # Reverse to get correct topological order
        sorted_nodes.reverse()
        
        return TopologicalResult(
            sorted_nodes=sorted_nodes,
            is_acyclic=len(cycles) == 0,
            cycles=cycles,
            layers=None,
            metadata={"algorithm": "dfs", "cycles_found": len(cycles)}
        )
    
    def layered_topological_sort(self) -> TopologicalResult:
        """
        Perform layered topological sorting to identify dependency levels.
        
        Returns:
            TopologicalResult with sorted nodes organized in layers
        """
        if not self.adjacency_list:
            return TopologicalResult([], True, [], [], {"error": "Graph not built"})
        
        # Use Kahn's algorithm with layer tracking
        in_degree_copy = self.in_degree.copy()
        current_layer = [node for node, degree in in_degree_copy.items() if degree == 0]
        layers = []
        all_sorted = []
        processed_edges = 0
        total_edges = sum(len(adj) for adj in self.adjacency_list.values())
        
        while current_layer:
            layers.append(current_layer.copy())
            all_sorted.extend(current_layer)
            next_layer = []
            
            for node in current_layer:
                for neighbor in self.adjacency_list[node]:
                    in_degree_copy[neighbor] -= 1
                    processed_edges += 1
                    
                    if in_degree_copy[neighbor] == 0:
                        next_layer.append(neighbor)
            
            current_layer = next_layer
        
        # Check for cycles
        is_acyclic = processed_edges == total_edges
        cycles = []
        
        if not is_acyclic:
            remaining_nodes = [node for node, degree in in_degree_copy.items() if degree > 0]
            cycles = self._detect_cycles_from_remaining_nodes(remaining_nodes)
        
        return TopologicalResult(
            sorted_nodes=all_sorted,
            is_acyclic=is_acyclic,
            cycles=cycles,
            layers=layers,
            metadata={
                "algorithm": "layered",
                "layer_count": len(layers),
                "max_layer_size": max(len(layer) for layer in layers) if layers else 0
            }
        )
    
    def _detect_cycles_from_remaining_nodes(self, remaining_nodes: List[str]) -> List[List[str]]:
        """
        Detect cycles from nodes that couldn't be processed in topological sort.
        
        Args:
            remaining_nodes: Nodes that still have incoming edges
            
        Returns:
            List of cycles (each cycle is a list of node IDs)
        """
        cycles = []
        visited = set()
        
        def find_cycle_from_node(start_node: str) -> Optional[List[str]]:
            """Find a cycle starting from a specific node"""
            path = []
            current = start_node
            path_set = set()
            
            while current not in visited:
                if current in path_set:
                    # Found cycle
                    cycle_start = path.index(current)
                    return path[cycle_start:] + [current]
                
                path.append(current)
                path_set.add(current)
                
                # Find next node in potential cycle
                next_nodes = [n for n in self.adjacency_list[current] if n in remaining_nodes]
                if not next_nodes:
                    break
                
                current = next_nodes[0]  # Take first available
            
            return None
        
        for node in remaining_nodes:
            if node not in visited:
                cycle = find_cycle_from_node(node)
                if cycle:
                    cycles.append(cycle)
                    visited.update(cycle)
        
        return cycles
    
    def detect_all_cycles(self) -> List[CycleInfo]:
        """
        Detect all cycles in the graph using Johnson's algorithm (simplified).
        
        Returns:
            List of CycleInfo objects describing all cycles
        """
        cycles = []
        visited_global = set()
        
        def dfs_cycles(node: str, path: List[str], visited_local: Set[str]) -> None:
            """DFS to find cycles"""
            if node in visited_local:
                if node in path:
                    # Found a cycle
                    cycle_start = path.index(node)
                    cycle_nodes = path[cycle_start:]
                    cycle_edges = [(cycle_nodes[i], cycle_nodes[(i + 1) % len(cycle_nodes)]) 
                                 for i in range(len(cycle_nodes))]
                    
                    cycle_info = CycleInfo(
                        nodes=cycle_nodes,
                        edges=cycle_edges,
                        length=len(cycle_nodes),
                        cycle_type="simple" if len(cycle_nodes) <= 3 else "complex"
                    )
                    cycles.append(cycle_info)
                return
            
            visited_local.add(node)
            new_path = path + [node]
            
            for neighbor in self.adjacency_list.get(node, set()):
                dfs_cycles(neighbor, new_path, visited_local.copy())
        
        for node in self.adjacency_list:
            if node not in visited_global:
                dfs_cycles(node, [], set())
                visited_global.add(node)
        
        return cycles
    
    def get_dependency_levels(self) -> Dict[str, int]:
        """
        Get the dependency level for each node (0 = no dependencies).
        
        Returns:
            Dictionary mapping node IDs to their dependency levels
        """
        result = self.layered_topological_sort()
        
        if not result.layers:
            return {}
        
        levels = {}
        for level, layer in enumerate(result.layers):
            for node in layer:
                levels[node] = level
        
        return levels
    
    def get_critical_path(self) -> List[str]:
        """
        Find the critical path (longest path) through the dependency graph.
        
        Returns:
            List of node IDs representing the critical path
        """
        levels = self.get_dependency_levels()
        if not levels:
            return []
        
        max_level = max(levels.values())
        
        # Find nodes at the maximum level
        end_nodes = [node for node, level in levels.items() if level == max_level]
        
        if not end_nodes:
            return []
        
        # Trace back the longest path
        def trace_longest_path(node: str, current_level: int) -> List[str]:
            if current_level == 0:
                return [node]
            
            best_path = [node]
            max_length = 0
            
            for predecessor in self.reverse_adjacency.get(node, set()):
                if levels.get(predecessor, -1) == current_level - 1:
                    path = trace_longest_path(predecessor, current_level - 1)
                    if len(path) > max_length:
                        max_length = len(path)
                        best_path = path + [node]
            
            return best_path
        
        # Find the longest path among all end nodes
        longest_path = []
        for end_node in end_nodes:
            path = trace_longest_path(end_node, levels[end_node])
            if len(path) > len(longest_path):
                longest_path = path
        
        return longest_path
    
    def analyze_dependency_structure(self) -> Dict[str, Any]:
        """
        Analyze the overall dependency structure of the graph.
        
        Returns:
            Dictionary with structural analysis results
        """
        if not self.adjacency_list:
            return {"error": "Graph not built"}
        
        # Get topological sort results
        kahn_result = self.kahn_topological_sort()
        layered_result = self.layered_topological_sort()
        
        # Calculate metrics
        total_nodes = len(self.adjacency_list)
        total_edges = sum(len(adj) for adj in self.adjacency_list.values())
        
        # Dependency statistics
        in_degrees = list(self.in_degree.values())
        out_degrees = list(self.out_degree.values())
        
        # Find root and leaf nodes
        root_nodes = [node for node, degree in self.in_degree.items() if degree == 0]
        leaf_nodes = [node for node, degree in self.out_degree.items() if degree == 0]
        
        # Critical path analysis
        critical_path = self.get_critical_path()
        dependency_levels = self.get_dependency_levels()
        
        return {
            "total_nodes": total_nodes,
            "total_edges": total_edges,
            "is_acyclic": kahn_result.is_acyclic,
            "cycle_count": len(kahn_result.cycles),
            "layer_count": len(layered_result.layers) if layered_result.layers else 0,
            "root_nodes": len(root_nodes),
            "leaf_nodes": len(leaf_nodes),
            "max_in_degree": max(in_degrees) if in_degrees else 0,
            "max_out_degree": max(out_degrees) if out_degrees else 0,
            "avg_in_degree": sum(in_degrees) / len(in_degrees) if in_degrees else 0,
            "avg_out_degree": sum(out_degrees) / len(out_degrees) if out_degrees else 0,
            "critical_path_length": len(critical_path),
            "max_dependency_level": max(dependency_levels.values()) if dependency_levels else 0,
            "dependency_distribution": self._calculate_dependency_distribution(dependency_levels)
        }
    
    def _calculate_dependency_distribution(self, levels: Dict[str, int]) -> Dict[int, int]:
        """Calculate distribution of nodes across dependency levels"""
        distribution = defaultdict(int)
        for level in levels.values():
            distribution[level] += 1
        return dict(distribution)
    
    def sort(self, algorithm: SortAlgorithm = SortAlgorithm.KAHN) -> TopologicalResult:
        """
        Perform topological sorting using the specified algorithm.
        
        Args:
            algorithm: Sorting algorithm to use
            
        Returns:
            TopologicalResult with sorting results
        """
        if algorithm == SortAlgorithm.KAHN:
            return self.kahn_topological_sort()
        elif algorithm == SortAlgorithm.DFS:
            return self.dfs_topological_sort()
        elif algorithm == SortAlgorithm.LAYERED:
            return self.layered_topological_sort()
        else:
            raise ValueError(f"Unknown sorting algorithm: {algorithm}")