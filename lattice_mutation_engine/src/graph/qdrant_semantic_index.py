"""
Qdrant-based semantic search implementation for the Lattice Mutation Engine.
This module provides production-grade vector search capabilities using Qdrant.
"""

import logging
import uuid
from typing import List, Optional, Dict, Any
from dataclasses import asdict

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
    from sentence_transformers import SentenceTransformer
    import numpy as np
except ImportError as e:
    QdrantClient = None
    SentenceTransformer = None
    logging.warning(f"Qdrant dependencies not available: {e}")

from lattice_mutation_engine.models.spec_graph_models import Node
from lattice_mutation_engine.config.settings import config

logger = logging.getLogger(__name__)


class QdrantSemanticIndex:
    """
    Production-grade semantic search using Qdrant vector database.
    
    Features:
    - High-performance vector similarity search
    - Persistent storage with metadata filtering
    - Scalable to millions of documents
    - Support for real-time updates
    """
    
    def __init__(self, repo, collection_name: str = "lattice_specs"):
        self.repo = repo
        self.collection_name = collection_name
        self.client: Optional[QdrantClient] = None
        self.encoder: Optional[SentenceTransformer] = None
        self.vector_size = 384  # all-MiniLM-L6-v2 dimension
        
        # Initialize if dependencies are available
        if self._dependencies_available():
            self._initialize_client()
            self._initialize_encoder()
            self._ensure_collection()
        else:
            logger.warning("Qdrant dependencies not available, falling back to TF-IDF")
    
    def _dependencies_available(self) -> bool:
        """Check if Qdrant dependencies are available"""
        return QdrantClient is not None and SentenceTransformer is not None
    
    def _initialize_client(self) -> None:
        """Initialize Qdrant client"""
        try:
            # Parse Qdrant URL from config
            qdrant_url = config.vector_db_url
            if qdrant_url.startswith("qdrant://"):
                # Remove protocol and parse host:port
                host_port = qdrant_url.replace("qdrant://", "")
                if ":" in host_port:
                    host, port = host_port.split(":", 1)
                    port = int(port)
                else:
                    host = host_port
                    port = 6333
                
                self.client = QdrantClient(host=host, port=port)
            else:
                # Assume it's a full URL or local path
                self.client = QdrantClient(url=qdrant_url)
            
            logger.info(f"Initialized Qdrant client for {qdrant_url}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant client: {e}")
            self.client = None
    
    def _initialize_encoder(self) -> None:
        """Initialize sentence transformer encoder"""
        try:
            # Use a lightweight but effective model
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Initialized sentence transformer encoder")
        except Exception as e:
            logger.error(f"Failed to initialize encoder: {e}")
            self.encoder = None
    
    def _ensure_collection(self) -> None:
        """Ensure the Qdrant collection exists"""
        if not self.client:
            return
        
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if self.collection_name not in collection_names:
                # Create collection with vector configuration
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Created Qdrant collection: {self.collection_name}")
            else:
                logger.info(f"Qdrant collection already exists: {self.collection_name}")
                
        except Exception as e:
            logger.error(f"Failed to ensure collection: {e}")
    
    def _extract_text(self, node: Node) -> str:
        """Extract searchable text from a node"""
        parts = []
        
        if node.name:
            parts.append(node.name)
        if node.description:
            parts.append(node.description)
        if node.content:
            parts.append(str(node.content))
        
        return " ".join(parts)
    
    def _node_to_payload(self, node: Node) -> Dict[str, Any]:
        """Convert node to Qdrant payload"""
        return {
            "node_id": node.id,
            "name": node.name or "",
            "description": node.description or "",
            "node_type": node.type or "",
            "spec_id": getattr(node, 'spec_id', ''),
            "version": getattr(node, 'version', ''),
            "text_content": self._extract_text(node)
        }
    
    def index_node(self, node: Node) -> bool:
        """Index a single node in Qdrant"""
        if not self._is_available():
            return False
        
        try:
            # Extract text and encode
            text = self._extract_text(node)
            if not text.strip():
                logger.warning(f"No text content for node {node.id}")
                return False
            
            vector = self.encoder.encode(text).tolist()
            payload = self._node_to_payload(node)
            
            # Create point
            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload=payload
            )
            
            # Upsert to Qdrant
            self.client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
            
            logger.debug(f"Indexed node {node.id} in Qdrant")
            return True
            
        except Exception as e:
            logger.error(f"Failed to index node {node.id}: {e}")
            return False
    
    def index_nodes(self, nodes: List[Node]) -> int:
        """Index multiple nodes in batch"""
        if not self._is_available():
            return 0
        
        indexed_count = 0
        points = []
        
        try:
            for node in nodes:
                text = self._extract_text(node)
                if not text.strip():
                    continue
                
                vector = self.encoder.encode(text).tolist()
                payload = self._node_to_payload(node)
                
                point = PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload=payload
                )
                points.append(point)
            
            if points:
                # Batch upsert
                self.client.upsert(
                    collection_name=self.collection_name,
                    points=points
                )
                indexed_count = len(points)
                logger.info(f"Batch indexed {indexed_count} nodes in Qdrant")
            
        except Exception as e:
            logger.error(f"Failed to batch index nodes: {e}")
        
        return indexed_count
    
    def search(self, query: str, top_k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Node]:
        """
        Search for similar nodes using vector similarity.
        
        Args:
            query: Search query text
            top_k: Number of results to return
            filters: Optional metadata filters (e.g., {"node_type": "api_spec"})
        
        Returns:
            List of matching nodes sorted by similarity
        """
        if not self._is_available():
            # Fallback to repository's semantic search
            return self._fallback_search(query, top_k)
        
        try:
            # Encode query
            query_vector = self.encoder.encode(query).tolist()
            
            # Build filter if provided
            qdrant_filter = None
            if filters:
                conditions = []
                for key, value in filters.items():
                    conditions.append(
                        FieldCondition(key=key, match=MatchValue(value=value))
                    )
                if conditions:
                    qdrant_filter = Filter(must=conditions)
            
            # Search in Qdrant
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=qdrant_filter,
                limit=top_k,
                score_threshold=0.3  # Minimum similarity threshold
            )
            
            # Convert results back to Node objects
            nodes = []
            for result in search_results:
                payload = result.payload
                
                # Reconstruct Node from payload
                node = Node(
                    id=payload.get("node_id", ""),
                    name=payload.get("name", ""),
                    description=payload.get("description", ""),
                    type=payload.get("node_type", ""),
                    content=payload.get("text_content", "")
                )
                
                # Add similarity score as metadata
                node.similarity_score = result.score
                nodes.append(node)
            
            logger.debug(f"Qdrant search returned {len(nodes)} results for query: {query}")
            return nodes
            
        except Exception as e:
            logger.error(f"Qdrant search failed: {e}")
            return self._fallback_search(query, top_k)
    
    def _fallback_search(self, query: str, top_k: int) -> List[Node]:
        """Fallback to repository's built-in search"""
        try:
            return self.repo.semantic_search(query=query, top_k=top_k)
        except Exception as e:
            logger.error(f"Fallback search also failed: {e}")
            return []
    
    def refresh(self) -> None:
        """Refresh the index by reindexing all nodes"""
        if not self._is_available():
            return
        
        try:
            # Clear existing collection
            self.client.delete_collection(self.collection_name)
            self._ensure_collection()
            
            # Reindex all nodes
            nodes = self._get_all_nodes()
            if nodes:
                indexed_count = self.index_nodes(nodes)
                logger.info(f"Refreshed Qdrant index with {indexed_count} nodes")
            
        except Exception as e:
            logger.error(f"Failed to refresh Qdrant index: {e}")
    
    def _get_all_nodes(self) -> List[Node]:
        """Get all nodes from the repository"""
        try:
            return self.repo.query_nodes()
        except TypeError:
            # Some repos may require explicit args
            return self.repo.query_nodes(node_type=None, filters=None)
        except Exception as e:
            logger.error(f"Failed to get nodes from repository: {e}")
            return []
    
    def _is_available(self) -> bool:
        """Check if Qdrant is available and properly configured"""
        return (
            self._dependencies_available() and 
            self.client is not None and 
            self.encoder is not None
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the Qdrant collection"""
        if not self._is_available():
            return {"available": False, "error": "Qdrant not configured"}
        
        try:
            collection_info = self.client.get_collection(self.collection_name)
            return {
                "available": True,
                "collection_name": self.collection_name,
                "vector_count": collection_info.points_count,
                "vector_size": self.vector_size,
                "encoder_model": "all-MiniLM-L6-v2"
            }
        except Exception as e:
            return {"available": False, "error": str(e)}