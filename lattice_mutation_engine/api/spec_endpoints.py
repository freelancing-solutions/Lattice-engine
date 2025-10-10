from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Dict, Any, Optional
from datetime import datetime
import uuid
import json

from lattice_mutation_engine.models.spec_graph_models import Node, NodeType, Status, SpecUpdatePayload
from lattice_mutation_engine.config.settings import config as engine_config
from lattice_mutation_engine.api.endpoints import verify_api_key


router = APIRouter(prefix="/specs", tags=["specs"])


def get_repo(components):
    repo = components.get("graph_repo")
    if not repo:
        raise HTTPException(status_code=500, detail="Graph repository not initialized")
    return repo


@router.get("/{project_id}")
async def list_specs(
    project_id: str, 
    status: Optional[str] = None,
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    _auth=Depends(verify_api_key)
):
    """List specs with filtering and pagination"""
    try:
        from lattice_mutation_engine.api.endpoints import components
        repo = get_repo(components)
        
        # Get all specs
        specs = repo.query_nodes(node_type=NodeType.SPEC)
        
        # Apply status filter if provided
        if status:
            specs = [s for s in specs if s.status.value == status]
        
        # Apply pagination
        total = len(specs)
        if offset:
            specs = specs[offset:]
        if limit:
            specs = specs[:limit]
        
        return {
            "project_id": project_id, 
            "specs": [s.dict() for s in specs],
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list specs: {str(e)}")


@router.post("/create")
async def create_spec(payload: Dict[str, Any], _auth=Depends(verify_api_key)):
    """Create a new spec with validation"""
    try:
        from lattice_mutation_engine.api.endpoints import components
        repo = get_repo(components)
        
        # Validate required fields
        name = payload.get("name")
        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Spec name is required")
        
        node = Node(
            id=str(uuid.uuid4()),
            name=name.strip(),
            type=NodeType.SPEC,
            description=payload.get("description", ""),
            content=payload.get("content", ""),
            spec_source=payload.get("spec_source"),
            metadata=payload.get("metadata", {}),
            status=Status.DRAFT,
        )
        repo.create_node(node)
        return {"created": node.dict()}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create spec: {str(e)}")


@router.patch("/update")
async def update_spec(payload: SpecUpdatePayload, _auth=Depends(verify_api_key)):
    """Update an existing spec with validation"""
    try:
        from lattice_mutation_engine.api.endpoints import components
        repo = get_repo(components)
        
        if not payload.spec_id:
            raise HTTPException(status_code=400, detail="Spec ID is required")
        
        node = repo.get_node(payload.spec_id)
        if not node:
            raise HTTPException(status_code=404, detail="Spec not found")
        
        # Apply updates with validation
        if payload.diff_summary:
            desc = node.description or ""
            node.description = f"{desc}\nUpdate: {payload.diff_summary}".strip()
        
        if payload.content is not None:
            node.content = payload.content
        
        node.updated_at = datetime.utcnow()
        
        # Update in repository
        update_data = {"description": node.description, "updated_at": node.updated_at}
        if payload.content is not None:
            update_data["content"] = node.content
        
        repo.update_node(node.id, update_data)
        snapshot = repo.snapshot([node.id], [])
        
        return {
            "graph_snapshot": snapshot.dict(),
            "message": f"Spec {payload.spec_id} updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update spec: {str(e)}")


@router.post("/approve")
async def approve_spec(payload: Dict[str, Any], _auth=Depends(verify_api_key)):
    """Approve a spec and mark it as ACTIVE"""
    try:
        from lattice_mutation_engine.api.endpoints import components
        repo = get_repo(components)
        
        spec_id = payload.get("spec_id")
        if not spec_id:
            raise HTTPException(status_code=400, detail="Spec ID is required")
        
        node = repo.get_node(spec_id)
        if not node:
            raise HTTPException(status_code=404, detail="Spec not found")
        
        # Check if already approved
        if node.status == Status.ACTIVE:
            return {"status": "already_approved", "spec_id": spec_id, "message": "Spec is already approved"}
        
        repo.update_node(spec_id, {"status": Status.ACTIVE})
        
        return {
            "status": "approved", 
            "spec_id": spec_id,
            "message": f"Spec {spec_id} approved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve spec: {str(e)}")


@router.delete("/{spec_id}")
async def delete_spec(spec_id: str, _auth=Depends(verify_api_key)):
    """Delete a spec with validation"""
    try:
        from lattice_mutation_engine.api.endpoints import components
        repo = get_repo(components)
        
        if not spec_id or not spec_id.strip():
            raise HTTPException(status_code=400, detail="Spec ID is required")
        
        node = repo.get_node(spec_id)
        if not node:
            raise HTTPException(status_code=404, detail="Spec not found")
        
        # Check if spec is active (prevent deletion of active specs)
        if node.status == Status.ACTIVE:
            raise HTTPException(status_code=400, detail="Cannot delete active spec. Please deactivate first.")
        
        ok = repo.delete_node(spec_id)
        if not ok:
            raise HTTPException(status_code=500, detail="Failed to delete spec")
        
        return {
            "deleted": spec_id,
            "message": f"Spec {spec_id} deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete spec: {str(e)}")


@router.post("/generate")
async def generate_spec(
    payload: Dict[str, Any],
    background_tasks: BackgroundTasks,
    _auth=Depends(verify_api_key)
):
    """Generate a new spec from a template or existing spec"""
    try:
        from lattice_mutation_engine.api.endpoints import components
        repo = get_repo(components)
        
        template_id = payload.get("template_id")
        template_type = payload.get("template_type", "default")
        parameters = payload.get("parameters", {})
        
        # If template_id provided, use existing spec as template
        if template_id:
            template_node = repo.get_node(template_id)
            if not template_node:
                raise HTTPException(status_code=404, detail="Template spec not found")
            
            # Create new spec from template
            new_spec = Node(
                id=str(uuid.uuid4()),
                name=f"Generated from {template_node.name}",
                type=NodeType.SPEC,
                description=f"Generated spec based on {template_node.name}",
                content=template_node.content,
                spec_source="generated",
                metadata={
                    "template_id": template_id,
                    "generation_type": "from_template",
                    "parameters": parameters
                },
                status=Status.DRAFT,
            )
        else:
            # Generate from scratch based on template_type
            template_content = _get_spec_template(template_type)
            new_spec = Node(
                id=str(uuid.uuid4()),
                name=payload.get("name", f"Generated {template_type} Spec"),
                type=NodeType.SPEC,
                description=payload.get("description", f"Generated {template_type} specification"),
                content=template_content,
                spec_source="generated",
                metadata={
                    "template_type": template_type,
                    "generation_type": "from_scratch",
                    "parameters": parameters
                },
                status=Status.DRAFT,
            )
        
        repo.create_node(new_spec)
        
        return {
            "generated": new_spec.dict(),
            "message": f"Spec generated successfully from {template_type}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate spec: {str(e)}")


@router.post("/validate")
async def validate_spec(
    payload: Dict[str, Any],
    _auth=Depends(verify_api_key)
):
    """Validate a spec for correctness and completeness"""
    try:
        spec_content = payload.get("content")
        spec_format = payload.get("format", "json")
        
        if not spec_content:
            raise HTTPException(status_code=400, detail="Spec content is required")
        
        validation_results = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "suggestions": []
        }
        
        # Basic content validation
        if spec_format == "json":
            try:
                if isinstance(spec_content, str):
                    json.loads(spec_content)
                elif isinstance(spec_content, dict):
                    json.dumps(spec_content)  # Verify it's JSON-serializable
            except (json.JSONDecodeError, TypeError) as e:
                validation_results["is_valid"] = False
                validation_results["errors"].append(f"Invalid JSON format: {str(e)}")
        
        # Content structure validation
        if isinstance(spec_content, dict):
            required_fields = payload.get("required_fields", ["name", "description"])
            for field in required_fields:
                if field not in spec_content:
                    validation_results["warnings"].append(f"Missing recommended field: {field}")
        
        # Validate against schema if provided
        schema = payload.get("schema")
        if schema:
            try:
                # Simplified schema validation
                if isinstance(spec_content, dict) and isinstance(schema, dict):
                    for key, value_type in schema.items():
                        if key not in spec_content:
                            validation_results["warnings"].append(f"Schema field missing: {key}")
                        elif not isinstance(spec_content[key], value_type):
                            validation_results["errors"].append(f"Schema type mismatch for field: {key}")
            except Exception as e:
                validation_results["warnings"].append(f"Schema validation error: {str(e)}")
        
        return validation_results
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


def _get_spec_template(template_type: str) -> str:
    """Get default spec template content"""
    templates = {
        "api": json.dumps({
            "name": "API Specification",
            "description": "API endpoint specification",
            "endpoints": [],
            "version": "1.0.0"
        }, indent=2),
        "database": json.dumps({
            "name": "Database Schema",
            "description": "Database schema specification",
            "tables": [],
            "relationships": []
        }, indent=2),
        "service": json.dumps({
            "name": "Service Specification",
            "description": "Microservice specification",
            "dependencies": [],
            "endpoints": [],
            "configuration": {}
        }, indent=2),
        "default": json.dumps({
            "name": "Default Specification",
            "description": "Default specification template",
            "content": {}
        }, indent=2)
    }
    
    return templates.get(template_type, templates["default"])