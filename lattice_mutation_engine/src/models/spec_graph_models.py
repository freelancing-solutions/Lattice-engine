from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class NodeType(str, Enum):
    SPEC = "SPEC"
    MODULE = "MODULE"
    CONTROLLER = "CONTROLLER"
    MODEL = "MODEL"
    ROUTE_API = "ROUTE/API"
    TASK = "TASK"
    TEST = "TEST"
    AGENT = "AGENT"
    GOAL = "GOAL"
    CONSTRAINT = "CONSTRAINT"
    DOCUMENTATION = "DOCUMENTATION"


class Status(str, Enum):
    ACTIVE = "ACTIVE"
    DRAFT = "DRAFT"
    DEPRECATED = "DEPRECATED"
    PENDING = "PENDING"


class RelationshipType(str, Enum):
    DEPENDS_ON = "depends_on"
    IMPLEMENTS = "implements"
    REFINES = "refines"
    TESTED_BY = "tested_by"
    OWNED_BY = "owned_by"
    PRODUCES = "produces"
    CONSUMES = "consumes"
    MONITORS = "monitors"
    CONFLICTS_WITH = "conflicts_with"


class Node(BaseModel):
    id: str
    name: str
    type: NodeType
    description: Optional[str] = None
    content: Optional[str] = None
    spec_source: Optional[str] = None
    embeddings: Optional[List[float]] = None
    metadata: Dict[str, str] = Field(default_factory=dict)
    status: Status = Status.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Edge(BaseModel):
    id: str
    source_id: str
    target_id: str
    type: RelationshipType
    description: Optional[str] = None
    confidence: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class GraphSnapshot(BaseModel):
    nodes_updated: List[str] = Field(default_factory=list)
    edges_updated: List[str] = Field(default_factory=list)


class SpecUpdatePayload(BaseModel):
    spec_id: str
    file_path: Optional[str] = None
    diff_summary: Optional[str] = None
    user_context: Dict[str, str] = Field(default_factory=dict)


class SpecGraph(BaseModel):
    """
    A graph structure containing nodes and edges for specifications.
    Provides helper methods for graph operations and validation.
    """
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)
    metadata: Dict[str, any] = Field(default_factory=dict)

    def get_node(self, node_id: str) -> Optional[Node]:
        """Find node by id in the graph"""
        for node in self.nodes:
            if node.id == node_id:
                return node
        return None

    def get_related_nodes(self, node_id: str) -> List[Node]:
        """Find all nodes connected via edges (both incoming and outgoing)"""
        related_ids = set()
        for edge in self.edges:
            if edge.source_id == node_id:
                related_ids.add(edge.target_id)
            elif edge.target_id == node_id:
                related_ids.add(edge.source_id)

        return [node for node in self.nodes if node.id in related_ids]

    def get_node_edges(self, node_id: str) -> List[Edge]:
        """Return edges where source_id or target_id matches node_id"""
        return [edge for edge in self.edges if edge.source_id == node_id or edge.target_id == node_id]

    def add_node(self, node: Node) -> None:
        """Add node to graph if not already present"""
        if not self.get_node(node.id):
            self.nodes.append(node)

    def add_edge(self, edge: Edge) -> None:
        """Add edge to graph if not already present"""
        existing_edge_ids = [e.id for e in self.edges]
        if edge.id not in existing_edge_ids:
            self.edges.append(edge)

    def remove_node(self, node_id: str) -> bool:
        """Remove node and associated edges"""
        node_removed = False
        # Remove node
        self.nodes = [n for n in self.nodes if n.id != node_id]
        node_removed = len(self.nodes) < len(self.nodes) + 1

        # Remove associated edges
        self.edges = [e for e in self.edges if e.source_id != node_id and e.target_id != node_id]

        return node_removed

    def remove_edge(self, edge_id: str) -> bool:
        """Remove edge by id"""
        initial_count = len(self.edges)
        self.edges = [e for e in self.edges if e.id != edge_id]
        return len(self.edges) < initial_count

    def validate_structure(self) -> bool:
        """Check that all edge source_id and target_id reference existing nodes"""
        node_ids = {node.id for node in self.nodes}
        for edge in self.edges:
            if edge.source_id not in node_ids or edge.target_id not in node_ids:
                return False
        return True