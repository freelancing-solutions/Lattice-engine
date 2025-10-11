from typing import List, Dict, Optional

try:
    from neo4j import GraphDatabase
except Exception:  # pragma: no cover - optional dependency
    GraphDatabase = None

from src.models.spec_graph_models import Node, Edge, NodeType, Status, RelationshipType, GraphSnapshot


class Neo4jGraphRepository:
    def __init__(self, uri: str, user: str, password: str):
        if GraphDatabase is None:
            raise ImportError("neo4j driver not installed. Please install neo4j in requirements.")
        self._driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self._driver.close()

    # Node operations
    def create_node(self, node: Node) -> Node:
        with self._driver.session() as session:
            session.execute_write(
                lambda tx: tx.run(
                    """
                    MERGE (n:SpecNode {id: $id})
                    SET n += {
                        name: $name,
                        type: $type,
                        description: $description,
                        content: $content,
                        spec_source: $spec_source,
                        metadata: $metadata,
                        status: $status,
                        created_at: $created_at,
                        updated_at: $updated_at
                    }
                    """,
                    id=node.id,
                    name=node.name,
                    type=node.type.value,
                    description=node.description,
                    content=node.content,
                    spec_source=node.spec_source,
                    metadata=node.metadata,
                    status=node.status.value,
                    created_at=node.created_at.isoformat(),
                    updated_at=node.updated_at.isoformat(),
                )
            )
        return node

    def get_node(self, node_id: str) -> Optional[Node]:
        with self._driver.session() as session:
            result = session.execute_read(
                lambda tx: tx.run(
                    "MATCH (n:SpecNode {id: $id}) RETURN n", id=node_id
                ).single()
            )
            if not result:
                return None
            n = result[0]
            props = dict(n)
            return Node(
                id=props.get("id"),
                name=props.get("name"),
                type=NodeType(props.get("type")),
                description=props.get("description"),
                content=props.get("content"),
                spec_source=props.get("spec_source"),
                metadata=props.get("metadata") or {},
                status=Status(props.get("status")),
            )

    def update_node(self, node_id: str, updates: Dict) -> Optional[Node]:
        with self._driver.session() as session:
            session.execute_write(
                lambda tx: tx.run(
                    """
                    MATCH (n:SpecNode {id: $id})
                    SET n += $updates
                    RETURN n
                    """,
                    id=node_id,
                    updates=_serialize_updates(updates),
                )
            )
        return self.get_node(node_id)

    def delete_node(self, node_id: str) -> bool:
        with self._driver.session() as session:
            result = session.execute_write(
                lambda tx: tx.run(
                    "MATCH (n:SpecNode {id: $id}) DETACH DELETE n", id=node_id
                ).consume()
            )
        return result.summary.counters.nodes_deleted > 0

    # Edge operations
    def create_edge(self, edge: Edge) -> Edge:
        with self._driver.session() as session:
            session.execute_write(
                lambda tx: tx.run(
                    """
                    MATCH (a:SpecNode {id: $source_id})
                    MATCH (b:SpecNode {id: $target_id})
                    MERGE (a)-[r:SPEC_REL {id: $id}]->(b)
                    SET r += { type: $type, metadata: $metadata }
                    """,
                    id=edge.id,
                    source_id=edge.source_id,
                    target_id=edge.target_id,
                    type=edge.type.value,
                    metadata=edge.metadata,
                )
            )
        return edge

    def get_edges_for_node(self, node_id: str) -> List[Edge]:
        with self._driver.session() as session:
            results = session.execute_read(
                lambda tx: tx.run(
                    """
                    MATCH (a:SpecNode {id: $id})-[r:SPEC_REL]->(b:SpecNode)
                    RETURN r, a.id AS source_id, b.id AS target_id
                    UNION
                    MATCH (a:SpecNode)-[r:SPEC_REL]->(b:SpecNode {id: $id})
                    RETURN r, a.id AS source_id, b.id AS target_id
                    """,
                    id=node_id,
                ).data()
            )
        edges: List[Edge] = []
        for rec in results:
            r = rec["r"]
            props = dict(r)
            edges.append(
                Edge(
                    id=props.get("id"),
                    source_id=rec["source_id"],
                    target_id=rec["target_id"],
                    type=RelationshipType(props.get("type")) if props.get("type") else None,
                    metadata=props.get("metadata") or {},
                )
            )
        return edges

    def query_edges(self, relationship_type: Optional[RelationshipType] = None, filters: Optional[Dict[str, str]] = None) -> List[Edge]:
        """Query edges with optional relationship type and filters"""
        cypher = "MATCH (a:SpecNode)-[r:SPEC_REL]->(b:SpecNode)"
        conditions = []
        params: Dict[str, any] = {}

        if relationship_type:
            conditions.append("r.type = $rel_type")
            params["rel_type"] = relationship_type.value

        if filters:
            source_id = filters.get("source_id")
            if source_id:
                conditions.append("a.id = $source_id")
                params["source_id"] = source_id

            target_id = filters.get("target_id")
            if target_id:
                conditions.append("b.id = $target_id")
                params["target_id"] = target_id

            confidence_min = filters.get("confidence_min")
            if confidence_min:
                conditions.append("r.confidence >= $confidence_min")
                params["confidence_min"] = float(confidence_min)

        if conditions:
            cypher += " WHERE " + " AND ".join(conditions)

        cypher += " RETURN r, a.id AS source_id, b.id AS target_id"

        with self._driver.session() as session:
            results = session.execute_read(lambda tx: tx.run(cypher, **params).data())

        edges: List[Edge] = []
        for rec in results:
            r = rec["r"]
            props = dict(r)
            try:
                edge_type = RelationshipType(props.get("type")) if props.get("type") else None
            except (ValueError, TypeError):
                edge_type = None

            edges.append(
                Edge(
                    id=props.get("id"),
                    source_id=rec["source_id"],
                    target_id=rec["target_id"],
                    type=edge_type,
                    metadata=props.get("metadata") or {},
                )
            )
        return edges

    def list_edges(self) -> List[Edge]:
        """Return list of all edges"""
        return self.query_edges()

    def delete_edge(self, edge_id: str) -> bool:
        """Delete edge by ID"""
        with self._driver.session() as session:
            result = session.execute_write(
                lambda tx: tx.run(
                    "MATCH ()-[r:SPEC_REL {id: $edge_id}]-() DELETE r",
                    edge_id=edge_id
                ).consume()
            )
        return result.summary.counters.relationships_deleted > 0

    def update_edge(self, edge_id: str, updates: Dict) -> Optional[Edge]:
        """Update edge with given updates"""
        with self._driver.session() as session:
            session.execute_write(
                lambda tx: tx.run(
                    "MATCH ()-[r:SPEC_REL {id: $edge_id}]-() SET r += $updates",
                    edge_id=edge_id,
                    updates=_serialize_updates(updates)
                )
            )
        return self.get_edge_by_id(edge_id)

    def get_edge_by_id(self, edge_id: str) -> Optional[Edge]:
        """Get edge by ID"""
        with self._driver.session() as session:
            result = session.execute_read(
                lambda tx: tx.run(
                    """
                    MATCH (a:SpecNode)-[r:SPEC_REL {id: $edge_id}]->(b:SpecNode)
                    RETURN r, a.id AS source_id, b.id AS target_id
                    """,
                    edge_id=edge_id
                ).single()
            )
            if not result:
                return None

            r = result[0]
            props = dict(r)
            try:
                edge_type = RelationshipType(props.get("type")) if props.get("type") else None
            except (ValueError, TypeError):
                edge_type = None

            return Edge(
                id=props.get("id"),
                source_id=result["source_id"],
                target_id=result["target_id"],
                type=edge_type,
                metadata=props.get("metadata") or {},
            )

    # Query operations
    def query_nodes(self, node_type: Optional[NodeType] = None, filters: Optional[Dict[str, str]] = None) -> List[Node]:
        cypher = "MATCH (n:SpecNode)"
        conditions = []
        params: Dict[str, any] = {}
        if node_type:
            conditions.append("n.type = $type")
            params["type"] = node_type.value
        if filters:
            status = filters.get("status")
            if status:
                conditions.append("n.status = $status")
                params["status"] = status
            name_contains = filters.get("name_contains")
            if name_contains:
                conditions.append("toLower(n.name) CONTAINS toLower($name_contains)")
                params["name_contains"] = name_contains
        if conditions:
            cypher += " WHERE " + " AND ".join(conditions)
        cypher += " RETURN n"

        with self._driver.session() as session:
            results = session.execute_read(lambda tx: tx.run(cypher, **params).data())
        nodes: List[Node] = []
        for rec in results:
            n = rec["n"]
            props = dict(n)
            nodes.append(
                Node(
                    id=props.get("id"),
                    name=props.get("name"),
                    type=NodeType(props.get("type")),
                    description=props.get("description"),
                    content=props.get("content"),
                    spec_source=props.get("spec_source"),
                    metadata=props.get("metadata") or {},
                    status=Status(props.get("status")),
                )
            )
        return nodes

    def semantic_search(self, query: str, top_k: int = 5) -> List[Node]:
        # Fallback semantic search using naive contains over name/description
        with self._driver.session() as session:
            results = session.execute_read(
                lambda tx: tx.run(
                    """
                    MATCH (n:SpecNode)
                    WHERE toLower(n.name) CONTAINS toLower($q)
                       OR toLower(n.description) CONTAINS toLower($q)
                    RETURN n LIMIT $k
                    """,
                    q=query,
                    k=top_k,
                ).data()
            )
        nodes: List[Node] = []
        for rec in results:
            n = rec["n"]
            props = dict(n)
            nodes.append(
                Node(
                    id=props.get("id"),
                    name=props.get("name"),
                    type=NodeType(props.get("type")),
                    description=props.get("description"),
                    content=props.get("content"),
                    spec_source=props.get("spec_source"),
                    metadata=props.get("metadata") or {},
                    status=Status(props.get("status")),
                )
            )
        return nodes

    def snapshot(self, updated_node_ids: List[str], updated_edge_ids: List[str]) -> GraphSnapshot:
        return GraphSnapshot(nodes_updated=updated_node_ids, edges_updated=updated_edge_ids)


def _serialize_updates(updates: Dict) -> Dict:
    ser = {}
    for k, v in updates.items():
        if hasattr(v, "value"):
            ser[k] = v.value
        else:
            ser[k] = v
    return ser