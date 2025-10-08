from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

from ..models.spec_graph_models import Node, NodeType, Status, SpecUpdatePayload
from ..config.settings import config as engine_config
from .endpoints import verify_api_key


router = APIRouter(prefix="/specs", tags=["specs"])


def get_repo(components):
    repo = components.get("graph_repo")
    if not repo:
        raise HTTPException(status_code=500, detail="Graph repository not initialized")
    return repo


@router.get("/{project_id}")
async def list_specs(project_id: str, _auth=Depends(verify_api_key)):
    # For now, return all SPEC nodes; project scoping can be added via metadata filters
    from ..api.endpoints import components
    repo = get_repo(components)
    specs = repo.query_nodes(node_type=NodeType.SPEC)
    return {"project_id": project_id, "specs": [s.dict() for s in specs]}


@router.post("/create")
async def create_spec(payload: Dict[str, Any], _auth=Depends(verify_api_key)):
    from ..api.endpoints import components
    repo = get_repo(components)
    node = Node(
        id=str(uuid.uuid4()),
        name=payload.get("name", "Unnamed Spec"),
        type=NodeType.SPEC,
        description=payload.get("description", ""),
        content=payload.get("content", ""),
        spec_source=payload.get("spec_source"),
        metadata=payload.get("metadata", {}),
        status=Status.DRAFT,
    )
    repo.create_node(node)
    return {"created": node.dict()}


@router.patch("/update")
async def update_spec(payload: SpecUpdatePayload, _auth=Depends(verify_api_key)):
    from ..api.endpoints import components
    repo = get_repo(components)
    node = repo.get_node(payload.spec_id)
    if not node:
        raise HTTPException(status_code=404, detail="Spec not found")
    # Apply a minimal update strategy: update description/content with diff_summary
    desc = node.description or ""
    node.description = f"{desc}\nUpdate: {payload.diff_summary or ''}".strip()
    node.updated_at = datetime.utcnow()
    repo.update_node(node.id, {"description": node.description, "updated_at": node.updated_at})
    snapshot = repo.snapshot([node.id], [])
    return {"graph_snapshot": snapshot.dict()}


@router.post("/approve")
async def approve_spec(payload: Dict[str, Any], _auth=Depends(verify_api_key)):
    # Stub: mark spec as ACTIVE
    from ..api.endpoints import components
    repo = get_repo(components)
    spec_id = payload.get("spec_id")
    node = repo.get_node(spec_id)
    if not node:
        raise HTTPException(status_code=404, detail="Spec not found")
    repo.update_node(spec_id, {"status": Status.ACTIVE})
    return {"status": "approved", "spec_id": spec_id}


@router.delete("/{spec_id}")
async def delete_spec(spec_id: str, _auth=Depends(verify_api_key)):
    from ..api.endpoints import components
    repo = get_repo(components)
    ok = repo.delete_node(spec_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Spec not found")
    return {"deleted": spec_id}