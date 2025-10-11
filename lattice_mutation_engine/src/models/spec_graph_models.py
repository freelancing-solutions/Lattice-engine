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