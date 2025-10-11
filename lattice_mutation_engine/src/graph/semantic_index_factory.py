"""
Semantic Index Factory for the Lattice Mutation Engine.
This module provides a factory to create the appropriate semantic search implementation
based on configuration and available dependencies.
"""

import logging
from typing import Protocol, List, Optional, Dict, Any

from lattice_mutation_engine.models.spec_graph_models import Node
from lattice_mutation_engine.config.settings import config
from lattice_mutation_engine.graph.semantic_index import TfidfSemanticIndex
from lattice_mutation_engine.graph.qdrant_semantic_index import QdrantSemanticIndex

logger = logging.getLogger(__name__)


class SemanticIndexProtocol(Protocol):
    """Protocol defining the interface for semantic search implementations"""
    
    def search(self, query: str, top_k: int = 5) -> List[Node]:
        """Search for similar nodes"""
        ...
    
    def refresh(self) -> None:
        """Refresh the search index"""
        ...


class SemanticIndexFactory:
    """Factory for creating semantic search implementations"""
    
    @staticmethod
    def create_semantic_index(repo) -> SemanticIndexProtocol:
        """
        Create the appropriate semantic search implementation based on configuration.
        
        Priority order:
        1. Qdrant (if configured and available)
        2. TF-IDF (fallback)
        
        Args:
            repo: The graph repository instance
            
        Returns:
            A semantic search implementation
        """
        backend = config.embeddings_backend.lower()
        
        if backend == "qdrant":
            return SemanticIndexFactory._create_qdrant_index(repo)
        elif backend == "pgvector":
            # TODO: Implement PgVector support
            logger.warning("PgVector not yet implemented, falling back to TF-IDF")
            return SemanticIndexFactory._create_tfidf_index(repo)
        else:
            # Default to TF-IDF
            return SemanticIndexFactory._create_tfidf_index(repo)
    
    @staticmethod
    def _create_qdrant_index(repo) -> SemanticIndexProtocol:
        """Create Qdrant-based semantic search"""
        try:
            qdrant_index = QdrantSemanticIndex(repo)
            
            # Test if Qdrant is actually available
            if qdrant_index._is_available():
                logger.info("Created Qdrant semantic index")
                return qdrant_index
            else:
                logger.warning("Qdrant not available, falling back to TF-IDF")
                return SemanticIndexFactory._create_tfidf_index(repo)
                
        except Exception as e:
            logger.error(f"Failed to create Qdrant index: {e}")
            logger.info("Falling back to TF-IDF semantic index")
            return SemanticIndexFactory._create_tfidf_index(repo)
    
    @staticmethod
    def _create_tfidf_index(repo) -> SemanticIndexProtocol:
        """Create TF-IDF based semantic search"""
        logger.info("Created TF-IDF semantic index")
        return TfidfSemanticIndex(repo)
    
    @staticmethod
    def get_available_backends() -> List[str]:
        """Get list of available semantic search backends"""
        backends = ["tfidf"]  # Always available
        
        # Check Qdrant availability
        try:
            from qdrant_client import QdrantClient
            from sentence_transformers import SentenceTransformer
            backends.append("qdrant")
        except ImportError:
            pass
        
        # Check PgVector availability (future)
        # try:
        #     import pgvector
        #     backends.append("pgvector")
        # except ImportError:
        #     pass
        
        return backends


class EnhancedSemanticIndex:
    """
    Enhanced semantic search with multiple backend support and intelligent fallback.
    
    This wrapper provides:
    - Automatic backend selection
    - Graceful fallback between backends
    - Performance monitoring
    - Caching capabilities
    """
    
    def __init__(self, repo):
        self.repo = repo
        self.primary_index = SemanticIndexFactory.create_semantic_index(repo)
        self.fallback_index = None
        
        # Create fallback if primary is not TF-IDF
        if not isinstance(self.primary_index, TfidfSemanticIndex):
            self.fallback_index = TfidfSemanticIndex(repo)
        
        self._search_stats = {
            "total_searches": 0,
            "primary_successes": 0,
            "fallback_uses": 0,
            "errors": 0
        }
    
    def search(self, query: str, top_k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Node]:
        """
        Search with intelligent fallback between backends.
        
        Args:
            query: Search query
            top_k: Number of results
            filters: Optional metadata filters (Qdrant only)
        
        Returns:
            List of matching nodes
        """
        self._search_stats["total_searches"] += 1
        
        try:
            # Try primary index first
            if hasattr(self.primary_index, 'search'):
                if filters and hasattr(self.primary_index, '_is_available') and self.primary_index._is_available():
                    # Qdrant supports filters
                    results = self.primary_index.search(query, top_k, filters)
                else:
                    # Standard search
                    results = self.primary_index.search(query, top_k)
                
                if results:
                    self._search_stats["primary_successes"] += 1
                    return results
            
        except Exception as e:
            logger.warning(f"Primary semantic search failed: {e}")
            self._search_stats["errors"] += 1
        
        # Fallback to secondary index
        if self.fallback_index:
            try:
                self._search_stats["fallback_uses"] += 1
                return self.fallback_index.search(query, top_k)
            except Exception as e:
                logger.error(f"Fallback semantic search also failed: {e}")
                self._search_stats["errors"] += 1
        
        # Last resort: empty results
        return []
    
    def refresh(self) -> None:
        """Refresh all search indices"""
        try:
            self.primary_index.refresh()
        except Exception as e:
            logger.error(f"Failed to refresh primary index: {e}")
        
        if self.fallback_index:
            try:
                self.fallback_index.refresh()
            except Exception as e:
                logger.error(f"Failed to refresh fallback index: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get search statistics and backend information"""
        stats = {
            "search_stats": self._search_stats.copy(),
            "primary_backend": type(self.primary_index).__name__,
            "fallback_backend": type(self.fallback_index).__name__ if self.fallback_index else None,
            "available_backends": SemanticIndexFactory.get_available_backends()
        }
        
        # Add backend-specific stats if available
        if hasattr(self.primary_index, 'get_stats'):
            stats["primary_backend_stats"] = self.primary_index.get_stats()
        
        return stats