from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class GraphQueryType(str, Enum):
    """Types of graph queries that can be executed."""
    CYPHER = "cypher"
    TRAVERSAL = "traversal"
    NEIGHBORS = "neighbors"


class GraphQuery(BaseModel):
    """
    Represents a graph query request with different query types and parameters.

    This model defines the structure for querying the graph database, supporting
    multiple query types including Cypher queries, graph traversals, and neighbor lookups.
    """
    query_type: GraphQueryType = Field(
        ...,
        description="Type of query to execute (cypher, traversal, or neighbors)"
    )
    query: Optional[str] = Field(
        None,
        description="Cypher query string (required for cypher queries)"
    )
    parameters: Optional[Dict[str, Any]] = Field(
        None,
        description="Parameters for Cypher queries (key-value pairs)"
    )
    start_node: Optional[str] = Field(
        None,
        description="Starting node ID for traversal queries"
    )
    node_id: Optional[str] = Field(
        None,
        description="Target node ID for neighbors queries"
    )
    relationship_types: Optional[List[str]] = Field(
        None,
        description="Filter relationships by type during traversal or neighbor queries"
    )
    max_depth: Optional[int] = Field(
        3,
        description="Maximum depth for traversal queries (default: 3)"
    )

    class Config:
        """Pydantic configuration."""
        extra = "forbid"


class SemanticSearchRequest(BaseModel):
    """
    Represents a semantic search request for finding similar nodes in the graph.

    This model defines the structure for semantic search operations that use
    vector similarity to find nodes with similar content or properties.
    """
    query: str = Field(
        ...,
        description="Search query text or content"
    )
    limit: Optional[int] = Field(
        10,
        description="Maximum number of results to return (default: 10)"
    )
    similarity_threshold: Optional[float] = Field(
        0.7,
        description="Minimum similarity score for results (0.0 to 1.0, default: 0.7)"
    )
    filters: Optional[Dict[str, Any]] = Field(
        None,
        description="Filters to apply to search results (node_type, status, tags, etc.)"
    )

    class Config:
        """Pydantic configuration."""
        extra = "forbid"