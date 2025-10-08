from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from ..models.spec_graph_models import NodeType
from .endpoints import verify_api_key


router = APIRouter(prefix="/graph", tags=["graph"])


def get_repo(components):
    repo = components.get("graph_repo")
    if not repo:
        raise HTTPException(status_code=500, detail="Graph repository not initialized")
    return repo


@router.post("/query")
async def query_graph(body: Dict[str, Any], _auth=Depends(verify_api_key)):
    from ..api.endpoints import components
    repo = get_repo(components)
    node_type_val = body.get("node_type")
    node_type = NodeType(node_type_val) if node_type_val else None
    filters = body.get("filters", {})
    nodes = repo.query_nodes(node_type=node_type, filters=filters)
    return {"nodes": [n.dict() for n in nodes]}


@router.post("/semantic-search")
async def semantic_search(body: Dict[str, Any], _auth=Depends(verify_api_key)):
    from ..api.endpoints import components
    repo = get_repo(components)
    query = body.get("query")
    top_k = int(body.get("top_k", 5))
    filters = body.get("filters")  # Support metadata filters for Qdrant
    
    # Use enhanced semantic index if available
    index = components.get("semantic_index")
    if index:
        # Enhanced index supports filters
        if filters and hasattr(index, 'search'):
            nodes = index.search(query=query or "", top_k=top_k, filters=filters)
        else:
            nodes = index.search(query=query or "", top_k=top_k)
    else:
        # Fallback to basic repo search
        nodes = repo.semantic_search(query=query or "", top_k=top_k)
    
    return {"results": [n.dict() for n in nodes]}


@router.get("/semantic-search/stats")
async def get_semantic_search_stats(_auth=Depends(verify_api_key)):
    """Get semantic search statistics and backend information"""
    from ..api.endpoints import components
    
    index = components.get("semantic_index")
    if index and hasattr(index, 'get_stats'):
        return index.get_stats()
    else:
        return {"available": False, "backend": "none"}