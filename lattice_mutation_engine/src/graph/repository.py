import uuid
import re
from typing import List, Dict, Optional

from src.models.spec_graph_models import Node, Edge, NodeType, RelationshipType, Status, GraphSnapshot


class InMemoryGraphRepository:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: Dict[str, Edge] = {}

    # Node operations
    def create_node(self, node: Node) -> Node:
        self.nodes[node.id] = node
        return node

    def get_node(self, node_id: str) -> Optional[Node]:
        return self.nodes.get(node_id)

    def update_node(self, node_id: str, updates: Dict) -> Optional[Node]:
        node = self.nodes.get(node_id)
        if not node:
            return None
        for k, v in updates.items():
            setattr(node, k, v)
        self.nodes[node_id] = node
        return node

    def delete_node(self, node_id: str) -> bool:
        return self.nodes.pop(node_id, None) is not None

    # Edge operations
    def create_edge(self, edge: Edge) -> Edge:
        self.edges[edge.id] = edge
        return edge

    def get_edges_for_node(self, node_id: str) -> List[Edge]:
        return [e for e in self.edges.values() if e.source_id == node_id or e.target_id == node_id]

    def query_edges(self, relationship_type: Optional[RelationshipType] = None, filters: Optional[Dict[str, str]] = None) -> List[Edge]:
        """Query edges with optional relationship type and filters"""
        edges = list(self.edges.values())

        # Filter by relationship type
        if relationship_type:
            edges = [e for e in edges if e.type == relationship_type]

        # Apply additional filters
        if filters:
            source_id = filters.get("source_id")
            if source_id:
                edges = [e for e in edges if e.source_id == source_id]

            target_id = filters.get("target_id")
            if target_id:
                edges = [e for e in edges if e.target_id == target_id]

            confidence_min = filters.get("confidence_min")
            if confidence_min:
                try:
                    min_conf = float(confidence_min)
                    edges = [e for e in edges if e.confidence >= min_conf]
                except (ValueError, TypeError):
                    pass

        return edges

    def list_edges(self) -> List[Edge]:
        """Return list of all edges"""
        return list(self.edges.values())

    def delete_edge(self, edge_id: str) -> bool:
        """Delete edge by ID"""
        return self.edges.pop(edge_id, None) is not None

    def update_edge(self, edge_id: str, updates: Dict) -> Optional[Edge]:
        """Update edge with given updates"""
        edge = self.edges.get(edge_id)
        if not edge:
            return None
        for k, v in updates.items():
            setattr(edge, k, v)
        self.edges[edge_id] = edge
        return edge

    # Query operations
    def query_nodes(
        self,
        node_type: Optional[NodeType] = None,
        filters: Optional[Dict[str, str]] = None,
    ) -> List[Node]:
        results = list(self.nodes.values())
        if node_type:
            results = [n for n in results if n.type == node_type]
        if filters:
            # Basic filters: status, name contains, related_to
            status = filters.get("status")
            if status:
                try:
                    st = Status(status)
                    results = [n for n in results if n.status == st]
                except Exception:
                    pass
            name_contains = filters.get("name_contains")
            if name_contains:
                pattern = re.compile(re.escape(name_contains), re.IGNORECASE)
                results = [n for n in results if pattern.search(n.name) or pattern.search(n.description or "")]
            related_to = filters.get("related_to")
            if related_to:
                # keep nodes that have an edge to or from a node with this name
                related_ids = [n.id for n in self.nodes.values() if n.name == related_to]
                keep_ids = set()
                for e in self.edges.values():
                    if e.source_id in related_ids:
                        keep_ids.add(e.target_id)
                    if e.target_id in related_ids:
                        keep_ids.add(e.source_id)
                results = [n for n in results if n.id in keep_ids]
        return results

    def semantic_search(self, query: str, top_k: int = 5) -> List[Node]:
        # Placeholder: simple keyword search over name and description
        pattern = re.compile(re.escape(query), re.IGNORECASE)
        matches = [n for n in self.nodes.values() if pattern.search(n.name) or pattern.search(n.description or "")]
        return matches[:top_k]

    def snapshot(self, updated_node_ids: List[str], updated_edge_ids: List[str]) -> GraphSnapshot:
        return GraphSnapshot(nodes_updated=updated_node_ids, edges_updated=updated_edge_ids)