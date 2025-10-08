"""
Graph Traversal Algorithms for the Lattice Mutation Engine.

This module provides various graph traversal strategies for:
- Breadth-first search (BFS)
- Depth-first search (DFS)
- Bidirectional search
- Path finding and reachability analysis
"""

import logging
from typing import List, Dict, Set, Optional, Callable, Any, Tuple
from collections import deque
from enum import Enum
from dataclasses import dataclass

from ...models.spec_graph_models import Node, Edge, RelationshipType

logger = logging.getLogger(__name__)


class TraversalStrategy(Enum):
    """Graph traversal strategies"""
    BFS = "breadth_first"
    DFS = "depth_first"
    BIDIRECTIONAL = "bidirectional"
    DIJKSTRA = "dijkstra"


@dataclass
class TraversalResult:
    """Result of a graph traversal operation"""
    visited_nodes: List[str]
    path: Optional[List[str]]
    distance: Optional[int]
    metadata: Dict[str, Any]


@dataclass
class PathResult:
    """Result of a path-finding operation"""
    path: List[str]
    distance: int
    cost: float
    exists: bool


class GraphTraversal:
    """
    Advanced graph traversal algorithms for spec graph analysis.
    
    Features:
    - Multiple traversal strategies (BFS, DFS, bidirectional)
    - Path finding with custom cost functions
    - Reachability analysis
    - Subgraph extraction
    - Custom filtering and visiting functions
    """
    
    def __init__(self, repository):
        self.repository = repository
        self.adjacency_list: Dict[str, Set[str]] = {}
        self.reverse_adjacency: Dict[str, Set[str]] = {}
        self.edge_weights: Dict[Tuple[str, str], float] = {}
        self.nodes_cache: Dict[str, Node] = {}
        
    def build_graph_cache(self, relationship_types: Optional[Set[RelationshipType]] = None):
        """
        Build adjacency lists and cache for efficient traversal.
        
        Args:
            relationship_types: Optional set of relationship types to include
        """
        logger.info("Building graph cache for traversal...")
        
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
        
        # Build adjacency lists
        self.adjacency_list = {node.id: set() for node in nodes}
        self.reverse_adjacency = {node.id: set() for node in nodes}
        self.edge_weights = {}
        
        for edge in edges:
            if relationship_types is None or edge.relationship_type in relationship_types:
                source_id = edge.source_id
                target_id = edge.target_id
                
                self.adjacency_list[source_id].add(target_id)
                self.reverse_adjacency[target_id].add(source_id)
                
                # Default weight is 1, can be customized based on relationship type
                weight = self._get_edge_weight(edge.relationship_type)
                self.edge_weights[(source_id, target_id)] = weight
        
        logger.info(f"Built graph cache with {len(nodes)} nodes and {len(edges)} edges")
    
    def _get_edge_weight(self, relationship_type: RelationshipType) -> float:
        """Get weight for an edge based on relationship type"""
        weights = {
            RelationshipType.DEPENDS_ON: 1.0,
            RelationshipType.IMPLEMENTS: 0.8,
            RelationshipType.REFINES: 0.6,
            RelationshipType.TESTED_BY: 0.4,
            RelationshipType.OWNED_BY: 0.2,
            RelationshipType.PRODUCES: 1.2,
            RelationshipType.CONSUMES: 1.2,
            RelationshipType.MONITORS: 0.3,
            RelationshipType.CONFLICTS_WITH: 2.0
        }
        return weights.get(relationship_type, 1.0)
    
    def breadth_first_search(
        self,
        start_node: str,
        target_node: Optional[str] = None,
        max_depth: Optional[int] = None,
        visit_fn: Optional[Callable[[str, int], bool]] = None
    ) -> TraversalResult:
        """
        Perform breadth-first search from a starting node.
        
        Args:
            start_node: Starting node ID
            target_node: Optional target node to find
            max_depth: Maximum depth to traverse
            visit_fn: Optional function called for each visited node
            
        Returns:
            TraversalResult with visited nodes and path information
        """
        if start_node not in self.adjacency_list:
            return TraversalResult([], None, None, {"error": "Start node not found"})
        
        visited = set()
        queue = deque([(start_node, 0, [start_node])])
        visited_order = []
        target_path = None
        
        while queue:
            current_node, depth, path = queue.popleft()
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            visited_order.append(current_node)
            
            # Call visit function if provided
            if visit_fn and not visit_fn(current_node, depth):
                break
            
            # Check if we found the target
            if target_node and current_node == target_node:
                target_path = path
                break
            
            # Check depth limit
            if max_depth is not None and depth >= max_depth:
                continue
            
            # Add neighbors to queue
            for neighbor in self.adjacency_list.get(current_node, set()):
                if neighbor not in visited:
                    queue.append((neighbor, depth + 1, path + [neighbor]))
        
        return TraversalResult(
            visited_nodes=visited_order,
            path=target_path,
            distance=len(target_path) - 1 if target_path else None,
            metadata={"strategy": "BFS", "max_depth": max_depth}
        )
    
    def depth_first_search(
        self,
        start_node: str,
        target_node: Optional[str] = None,
        max_depth: Optional[int] = None,
        visit_fn: Optional[Callable[[str, int], bool]] = None
    ) -> TraversalResult:
        """
        Perform depth-first search from a starting node.
        
        Args:
            start_node: Starting node ID
            target_node: Optional target node to find
            max_depth: Maximum depth to traverse
            visit_fn: Optional function called for each visited node
            
        Returns:
            TraversalResult with visited nodes and path information
        """
        if start_node not in self.adjacency_list:
            return TraversalResult([], None, None, {"error": "Start node not found"})
        
        visited = set()
        visited_order = []
        target_path = None
        
        def dfs_recursive(node: str, depth: int, path: List[str]) -> bool:
            nonlocal target_path
            
            if node in visited:
                return False
            
            visited.add(node)
            visited_order.append(node)
            
            # Call visit function if provided
            if visit_fn and not visit_fn(node, depth):
                return True  # Stop traversal
            
            # Check if we found the target
            if target_node and node == target_node:
                target_path = path
                return True  # Found target, stop
            
            # Check depth limit
            if max_depth is not None and depth >= max_depth:
                return False
            
            # Visit neighbors
            for neighbor in self.adjacency_list.get(node, set()):
                if dfs_recursive(neighbor, depth + 1, path + [neighbor]):
                    return True
            
            return False
        
        dfs_recursive(start_node, 0, [start_node])
        
        return TraversalResult(
            visited_nodes=visited_order,
            path=target_path,
            distance=len(target_path) - 1 if target_path else None,
            metadata={"strategy": "DFS", "max_depth": max_depth}
        )
    
    def find_shortest_path(self, start_node: str, target_node: str) -> PathResult:
        """
        Find the shortest path between two nodes using BFS.
        
        Args:
            start_node: Starting node ID
            target_node: Target node ID
            
        Returns:
            PathResult with path information
        """
        if start_node not in self.adjacency_list or target_node not in self.adjacency_list:
            return PathResult([], 0, 0.0, False)
        
        if start_node == target_node:
            return PathResult([start_node], 0, 0.0, True)
        
        visited = set()
        queue = deque([(start_node, [start_node], 0.0)])
        
        while queue:
            current_node, path, cost = queue.popleft()
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            
            for neighbor in self.adjacency_list.get(current_node, set()):
                if neighbor == target_node:
                    final_path = path + [neighbor]
                    edge_cost = self.edge_weights.get((current_node, neighbor), 1.0)
                    final_cost = cost + edge_cost
                    return PathResult(final_path, len(final_path) - 1, final_cost, True)
                
                if neighbor not in visited:
                    edge_cost = self.edge_weights.get((current_node, neighbor), 1.0)
                    queue.append((neighbor, path + [neighbor], cost + edge_cost))
        
        return PathResult([], 0, 0.0, False)
    
    def find_all_paths(
        self,
        start_node: str,
        target_node: str,
        max_length: Optional[int] = None
    ) -> List[PathResult]:
        """
        Find all paths between two nodes.
        
        Args:
            start_node: Starting node ID
            target_node: Target node ID
            max_length: Maximum path length to consider
            
        Returns:
            List of PathResult objects for all found paths
        """
        if start_node not in self.adjacency_list or target_node not in self.adjacency_list:
            return []
        
        all_paths = []
        
        def dfs_all_paths(current: str, path: List[str], visited: Set[str], cost: float):
            if current == target_node:
                all_paths.append(PathResult(path, len(path) - 1, cost, True))
                return
            
            if max_length and len(path) >= max_length:
                return
            
            for neighbor in self.adjacency_list.get(current, set()):
                if neighbor not in visited:
                    edge_cost = self.edge_weights.get((current, neighbor), 1.0)
                    new_visited = visited.copy()
                    new_visited.add(neighbor)
                    dfs_all_paths(neighbor, path + [neighbor], new_visited, cost + edge_cost)
        
        dfs_all_paths(start_node, [start_node], {start_node}, 0.0)
        
        # Sort by path length and cost
        all_paths.sort(key=lambda p: (p.distance, p.cost))
        return all_paths
    
    def is_reachable(self, start_node: str, target_node: str, max_hops: Optional[int] = None) -> bool:
        """
        Check if target node is reachable from start node.
        
        Args:
            start_node: Starting node ID
            target_node: Target node ID
            max_hops: Maximum number of hops to consider
            
        Returns:
            True if target is reachable, False otherwise
        """
        if start_node == target_node:
            return True
        
        result = self.breadth_first_search(start_node, target_node, max_hops)
        return result.path is not None
    
    def get_reachable_nodes(self, start_node: str, max_depth: Optional[int] = None) -> Set[str]:
        """
        Get all nodes reachable from a starting node.
        
        Args:
            start_node: Starting node ID
            max_depth: Maximum depth to traverse
            
        Returns:
            Set of reachable node IDs
        """
        result = self.breadth_first_search(start_node, max_depth=max_depth)
        return set(result.visited_nodes)
    
    def extract_subgraph(self, node_ids: Set[str]) -> Dict[str, Any]:
        """
        Extract a subgraph containing only the specified nodes.
        
        Args:
            node_ids: Set of node IDs to include in subgraph
            
        Returns:
            Dictionary representing the subgraph
        """
        subgraph_nodes = {nid: self.nodes_cache[nid] for nid in node_ids if nid in self.nodes_cache}
        subgraph_edges = []
        
        for source in node_ids:
            for target in self.adjacency_list.get(source, set()):
                if target in node_ids:
                    weight = self.edge_weights.get((source, target), 1.0)
                    subgraph_edges.append({
                        "source": source,
                        "target": target,
                        "weight": weight
                    })
        
        return {
            "nodes": subgraph_nodes,
            "edges": subgraph_edges,
            "node_count": len(subgraph_nodes),
            "edge_count": len(subgraph_edges)
        }
    
    def find_strongly_connected_components(self) -> List[List[str]]:
        """
        Find strongly connected components using Tarjan's algorithm.
        
        Returns:
            List of strongly connected components (each is a list of node IDs)
        """
        index_counter = [0]
        stack = []
        lowlinks = {}
        index = {}
        on_stack = {}
        components = []
        
        def strongconnect(node: str):
            index[node] = index_counter[0]
            lowlinks[node] = index_counter[0]
            index_counter[0] += 1
            stack.append(node)
            on_stack[node] = True
            
            for neighbor in self.adjacency_list.get(node, set()):
                if neighbor not in index:
                    strongconnect(neighbor)
                    lowlinks[node] = min(lowlinks[node], lowlinks[neighbor])
                elif on_stack.get(neighbor, False):
                    lowlinks[node] = min(lowlinks[node], index[neighbor])
            
            if lowlinks[node] == index[node]:
                component = []
                while True:
                    w = stack.pop()
                    on_stack[w] = False
                    component.append(w)
                    if w == node:
                        break
                components.append(component)
        
        for node in self.adjacency_list:
            if node not in index:
                strongconnect(node)
        
        return components
    
    def get_traversal_stats(self) -> Dict[str, Any]:
        """Get statistics about the graph structure"""
        if not self.adjacency_list:
            return {"error": "Graph cache not built"}
        
        total_nodes = len(self.adjacency_list)
        total_edges = sum(len(neighbors) for neighbors in self.adjacency_list.values())
        
        # Calculate degree statistics
        out_degrees = [len(neighbors) for neighbors in self.adjacency_list.values()]
        in_degrees = [len(neighbors) for neighbors in self.reverse_adjacency.values()]
        
        return {
            "total_nodes": total_nodes,
            "total_edges": total_edges,
            "avg_out_degree": sum(out_degrees) / total_nodes if total_nodes > 0 else 0,
            "avg_in_degree": sum(in_degrees) / total_nodes if total_nodes > 0 else 0,
            "max_out_degree": max(out_degrees) if out_degrees else 0,
            "max_in_degree": max(in_degrees) if in_degrees else 0,
            "isolated_nodes": len([d for d in out_degrees if d == 0 and in_degrees[out_degrees.index(d)] == 0]),
            "strongly_connected_components": len(self.find_strongly_connected_components())
        }