from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
import logging

from src.core.dependencies import (
    get_graph_service,
    get_semantic_index
)

from src.auth import verify_api_key
from src.models.graph_models import GraphQuery, SemanticSearchRequest

logger = logging.getLogger(__name__)

# Response Models
class GraphQueryResponse(BaseModel):
    """Response model for graph queries"""
    results: List[Dict[str, Any]]
    query_time_ms: float
    total_results: int

class SemanticSearchResponse(BaseModel):
    """Response model for semantic search"""
    results: List[Dict[str, Any]]
    query: str
    similarity_threshold: float
    search_time_ms: float

class SemanticSearchStatsResponse(BaseModel):
    """Response model for semantic search statistics"""
    available: bool
    backend: str
    total_documents: Optional[int] = None
    index_size_mb: Optional[float] = None
    last_updated: Optional[str] = None

# Router configuration
router = APIRouter(prefix="/graph", tags=["graph"])

def get_components():
    """Get the global components - dependency injection"""
    from src.api.endpoints import components
    if not components:
        raise HTTPException(status_code=503, detail="Engine components not initialized")
    return components

@router.post("/query", response_model=GraphQueryResponse)
async def query_graph(
    query: GraphQuery,
    _auth=Depends(verify_api_key),
    components=Depends(get_components)
) -> GraphQueryResponse:
    """Execute a graph query and return results"""
    try:
        logger.info(f"Executing graph query: {query.query_type}")
        
        graph = components.get("graph")
        if not graph:
            raise HTTPException(status_code=503, detail="Graph service not available")
        
        # Execute the query based on type
        start_time = time.time()
        
        if query.query_type == "cypher":
            results = await graph.execute_cypher(query.query, query.parameters or {})
        elif query.query_type == "traversal":
            results = await graph.traverse(
                start_node=query.start_node,
                relationship_types=query.relationship_types,
                max_depth=query.max_depth or 3
            )
        elif query.query_type == "neighbors":
            results = await graph.get_neighbors(
                node_id=query.node_id,
                relationship_types=query.relationship_types
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported query type: {query.query_type}")
        
        query_time_ms = (time.time() - start_time) * 1000
        
        return GraphQueryResponse(
            results=results,
            query_time_ms=query_time_ms,
            total_results=len(results)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing graph query: {e}")
        raise HTTPException(status_code=500, detail="Graph query execution failed")

@router.post("/semantic-search", response_model=SemanticSearchResponse)
async def semantic_search(
    request: SemanticSearchRequest,
    _auth=Depends(verify_api_key),
    components=Depends(get_components)
) -> SemanticSearchResponse:
    """Perform semantic search on the graph"""
    try:
        logger.info(f"Performing semantic search: {request.query[:50]}...")
        
        index = components.get("semantic_index")
        if not index:
            raise HTTPException(status_code=503, detail="Semantic search not available")
        
        start_time = time.time()
        
        # Perform the semantic search
        results = await index.search(
            query=request.query,
            limit=request.limit or 10,
            similarity_threshold=request.similarity_threshold or 0.7,
            filters=request.filters or {}
        )
        
        search_time_ms = (time.time() - start_time) * 1000
        
        return SemanticSearchResponse(
            results=results,
            query=request.query,
            similarity_threshold=request.similarity_threshold or 0.7,
            search_time_ms=search_time_ms
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in semantic search: {e}")
        raise HTTPException(status_code=500, detail="Semantic search failed")

@router.get("/semantic-search/stats", response_model=SemanticSearchStatsResponse)
async def get_semantic_search_stats(
    _auth=Depends(verify_api_key),
    components=Depends(get_components)
) -> SemanticSearchStatsResponse:
    """Get semantic search statistics and backend information"""
    try:
        index = components.get("semantic_index")
        
        if not index:
            return SemanticSearchStatsResponse(
                available=False,
                backend="none"
            )
        
        # Get statistics from the index if available
        if hasattr(index, 'get_stats'):
            stats = index.get_stats()
            return SemanticSearchStatsResponse(
                available=True,
                backend=stats.get("backend", "unknown"),
                total_documents=stats.get("total_documents"),
                index_size_mb=stats.get("index_size_mb"),
                last_updated=stats.get("last_updated")
            )
        else:
            return SemanticSearchStatsResponse(
                available=True,
                backend="unknown"
            )
            
    except Exception as e:
        logger.error(f"Error getting semantic search stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get search statistics")