"""
Schema Validator

This module provides comprehensive schema validation for spec compliance,
including JSON schema validation, field type checking, and structural validation.
"""

import json
import jsonschema
from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, ValidationError
from datetime import datetime

from ..models.spec_graph_models import Node, Edge, NodeType, RelationshipType, Status
from ..models.validation_models import ValidationResult
from .validation_rules import ValidationContext, RuleSeverity


class SchemaValidationError(Exception):
    """Exception raised for schema validation errors"""
    
    def __init__(self, message: str, field_path: str = None, expected_type: str = None, actual_value: Any = None):
        self.message = message
        self.field_path = field_path
        self.expected_type = expected_type
        self.actual_value = actual_value
        super().__init__(self.message)


class SchemaDefinition(BaseModel):
    """Schema definition for validation"""
    schema_id: str
    name: str
    description: str
    node_types: List[NodeType]
    json_schema: Dict[str, Any]
    required_fields: List[str]
    optional_fields: List[str]
    field_constraints: Dict[str, Dict[str, Any]] = {}
    custom_validators: List[str] = []


class SchemaValidator:
    """Comprehensive schema validator for spec compliance"""
    
    def __init__(self):
        self.schemas: Dict[str, SchemaDefinition] = {}
        self.custom_validators: Dict[str, callable] = {}
        self._initialize_default_schemas()
    
    def register_schema(self, schema: SchemaDefinition):
        """Register a schema definition"""
        self.schemas[schema.schema_id] = schema
    
    def register_custom_validator(self, name: str, validator_func: callable):
        """Register a custom validator function"""
        self.custom_validators[name] = validator_func
    
    def validate_node(self, node: Node) -> ValidationResult:
        """Validate a node against its schema"""
        errors = []
        warnings = []
        suggestions = []
        
        try:
            # Get applicable schemas for the node type
            applicable_schemas = self._get_schemas_for_node_type(node.type)
            
            if not applicable_schemas:
                warnings.append({
                    'code': 'NO_SCHEMA',
                    'message': f'No schema defined for node type {node.type}',
                    'field_path': 'type',
                    'severity': RuleSeverity.WARNING
                })
            
            for schema in applicable_schemas:
                schema_errors, schema_warnings, schema_suggestions = self._validate_against_schema(node, schema)
                errors.extend(schema_errors)
                warnings.extend(schema_warnings)
                suggestions.extend(schema_suggestions)
            
            # Perform additional validations
            additional_errors, additional_warnings, additional_suggestions = self._perform_additional_validations(node)
            errors.extend(additional_errors)
            warnings.extend(additional_warnings)
            suggestions.extend(additional_suggestions)
            
        except Exception as e:
            errors.append({
                'code': 'VALIDATION_ERROR',
                'message': f'Validation failed: {str(e)}',
                'severity': RuleSeverity.ERROR
            })
        
        return ValidationResult(
            spec_id=node.id,
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
            validation_timestamp=datetime.utcnow()
        )
    
    def validate_edge(self, edge: Edge, source_node: Node = None, target_node: Node = None) -> ValidationResult:
        """Validate an edge against its schema"""
        errors = []
        warnings = []
        suggestions = []
        
        try:
            # Validate edge structure
            edge_errors, edge_warnings, edge_suggestions = self._validate_edge_structure(edge)
            errors.extend(edge_errors)
            warnings.extend(edge_warnings)
            suggestions.extend(edge_suggestions)
            
            # Validate edge relationships
            if source_node and target_node:
                rel_errors, rel_warnings, rel_suggestions = self._validate_edge_relationships(
                    edge, source_node, target_node
                )
                errors.extend(rel_errors)
                warnings.extend(rel_warnings)
                suggestions.extend(rel_suggestions)
            
        except Exception as e:
            errors.append({
                'code': 'EDGE_VALIDATION_ERROR',
                'message': f'Edge validation failed: {str(e)}',
                'severity': RuleSeverity.ERROR
            })
        
        return ValidationResult(
            spec_id=edge.id,
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
            validation_timestamp=datetime.utcnow()
        )
    
    def validate_json_schema(self, data: Dict[str, Any], schema: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Validate data against JSON schema"""
        errors = []
        
        try:
            jsonschema.validate(instance=data, schema=schema)
        except jsonschema.ValidationError as e:
            errors.append({
                'code': 'JSON_SCHEMA_ERROR',
                'message': e.message,
                'field_path': '.'.join(str(p) for p in e.absolute_path),
                'severity': RuleSeverity.ERROR,
                'schema_path': '.'.join(str(p) for p in e.schema_path)
            })
        except jsonschema.SchemaError as e:
            errors.append({
                'code': 'INVALID_SCHEMA',
                'message': f'Invalid schema: {e.message}',
                'severity': RuleSeverity.ERROR
            })
        
        return errors
    
    def _get_schemas_for_node_type(self, node_type: NodeType) -> List[SchemaDefinition]:
        """Get all schemas applicable to a node type"""
        return [
            schema for schema in self.schemas.values()
            if node_type in schema.node_types
        ]
    
    def _validate_against_schema(self, node: Node, schema: SchemaDefinition) -> tuple:
        """Validate node against a specific schema"""
        errors = []
        warnings = []
        suggestions = []
        
        # Convert node to dict for JSON schema validation
        node_dict = node.dict()
        
        # Validate against JSON schema
        json_errors = self.validate_json_schema(node_dict, schema.json_schema)
        errors.extend(json_errors)
        
        # Validate required fields
        for field in schema.required_fields:
            if field not in node_dict or node_dict[field] is None:
                errors.append({
                    'code': 'MISSING_REQUIRED_FIELD',
                    'message': f'Missing required field: {field}',
                    'field_path': field,
                    'severity': RuleSeverity.ERROR
                })
        
        # Validate field constraints
        for field, constraints in schema.field_constraints.items():
            if field in node_dict:
                field_errors, field_warnings = self._validate_field_constraints(
                    field, node_dict[field], constraints
                )
                errors.extend(field_errors)
                warnings.extend(field_warnings)
        
        # Run custom validators
        for validator_name in schema.custom_validators:
            if validator_name in self.custom_validators:
                try:
                    validator_result = self.custom_validators[validator_name](node, schema)
                    if isinstance(validator_result, list):
                        errors.extend(validator_result)
                except Exception as e:
                    errors.append({
                        'code': 'CUSTOM_VALIDATOR_ERROR',
                        'message': f'Custom validator {validator_name} failed: {str(e)}',
                        'severity': RuleSeverity.ERROR
                    })
        
        return errors, warnings, suggestions
    
    def _validate_field_constraints(self, field_name: str, field_value: Any, constraints: Dict[str, Any]) -> tuple:
        """Validate field against its constraints"""
        errors = []
        warnings = []
        
        # Length constraints
        if 'min_length' in constraints and hasattr(field_value, '__len__'):
            if len(field_value) < constraints['min_length']:
                errors.append({
                    'code': 'MIN_LENGTH_VIOLATION',
                    'message': f'Field {field_name} must have at least {constraints["min_length"]} characters',
                    'field_path': field_name,
                    'severity': RuleSeverity.ERROR
                })
        
        if 'max_length' in constraints and hasattr(field_value, '__len__'):
            if len(field_value) > constraints['max_length']:
                errors.append({
                    'code': 'MAX_LENGTH_VIOLATION',
                    'message': f'Field {field_name} must have at most {constraints["max_length"]} characters',
                    'field_path': field_name,
                    'severity': RuleSeverity.ERROR
                })
        
        # Pattern constraints
        if 'pattern' in constraints and isinstance(field_value, str):
            import re
            if not re.match(constraints['pattern'], field_value):
                errors.append({
                    'code': 'PATTERN_VIOLATION',
                    'message': f'Field {field_name} does not match required pattern',
                    'field_path': field_name,
                    'severity': RuleSeverity.ERROR
                })
        
        # Enum constraints
        if 'enum' in constraints:
            if field_value not in constraints['enum']:
                errors.append({
                    'code': 'ENUM_VIOLATION',
                    'message': f'Field {field_name} must be one of: {constraints["enum"]}',
                    'field_path': field_name,
                    'severity': RuleSeverity.ERROR
                })
        
        return errors, warnings
    
    def _perform_additional_validations(self, node: Node) -> tuple:
        """Perform additional validations beyond schema"""
        errors = []
        warnings = []
        suggestions = []
        
        # Validate node ID format
        if not node.id or not isinstance(node.id, str):
            errors.append({
                'code': 'INVALID_NODE_ID',
                'message': 'Node ID must be a non-empty string',
                'field_path': 'id',
                'severity': RuleSeverity.ERROR
            })
        
        # Validate timestamps
        if node.created_at and node.updated_at:
            if node.created_at > node.updated_at:
                warnings.append({
                    'code': 'INVALID_TIMESTAMPS',
                    'message': 'Created timestamp is after updated timestamp',
                    'severity': RuleSeverity.WARNING
                })
        
        # Validate metadata structure
        if node.metadata and not isinstance(node.metadata, dict):
            errors.append({
                'code': 'INVALID_METADATA',
                'message': 'Metadata must be a dictionary',
                'field_path': 'metadata',
                'severity': RuleSeverity.ERROR
            })
        
        return errors, warnings, suggestions
    
    def _validate_edge_structure(self, edge: Edge) -> tuple:
        """Validate edge structure"""
        errors = []
        warnings = []
        suggestions = []
        
        # Validate required fields
        if not edge.id:
            errors.append({
                'code': 'MISSING_EDGE_ID',
                'message': 'Edge ID is required',
                'field_path': 'id',
                'severity': RuleSeverity.ERROR
            })
        
        if not edge.source_id:
            errors.append({
                'code': 'MISSING_SOURCE_ID',
                'message': 'Edge source_id is required',
                'field_path': 'source_id',
                'severity': RuleSeverity.ERROR
            })
        
        if not edge.target_id:
            errors.append({
                'code': 'MISSING_TARGET_ID',
                'message': 'Edge target_id is required',
                'field_path': 'target_id',
                'severity': RuleSeverity.ERROR
            })
        
        # Validate confidence score
        if edge.confidence < 0.0 or edge.confidence > 1.0:
            warnings.append({
                'code': 'INVALID_CONFIDENCE',
                'message': 'Edge confidence should be between 0.0 and 1.0',
                'field_path': 'confidence',
                'severity': RuleSeverity.WARNING
            })
        
        return errors, warnings, suggestions
    
    def _validate_edge_relationships(self, edge: Edge, source_node: Node, target_node: Node) -> tuple:
        """Validate edge relationships make sense"""
        errors = []
        warnings = []
        suggestions = []
        
        # Define valid relationship combinations
        valid_relationships = {
            (NodeType.SPEC, NodeType.MODULE): [RelationshipType.DEPENDS_ON, RelationshipType.IMPLEMENTS],
            (NodeType.MODULE, NodeType.CONTROLLER): [RelationshipType.IMPLEMENTS],
            (NodeType.CONTROLLER, NodeType.ROUTE_API): [RelationshipType.IMPLEMENTS],
            (NodeType.MODEL, NodeType.CONTROLLER): [RelationshipType.CONSUMES],
            (NodeType.TEST, NodeType.MODULE): [RelationshipType.TESTED_BY],
            # Add more valid combinations as needed
        }
        
        relationship_key = (source_node.type, target_node.type)
        if relationship_key in valid_relationships:
            if edge.type not in valid_relationships[relationship_key]:
                warnings.append({
                    'code': 'UNUSUAL_RELATIONSHIP',
                    'message': f'Unusual relationship {edge.type} between {source_node.type} and {target_node.type}',
                    'severity': RuleSeverity.WARNING
                })
        
        # Check for self-references
        if edge.source_id == edge.target_id:
            if edge.type not in [RelationshipType.REFINES]:  # Self-references might be valid for refinement
                warnings.append({
                    'code': 'SELF_REFERENCE',
                    'message': 'Edge creates a self-reference',
                    'severity': RuleSeverity.WARNING
                })
        
        return errors, warnings, suggestions
    
    def _initialize_default_schemas(self):
        """Initialize default schemas for different node types"""
        
        # SPEC node schema
        spec_schema = SchemaDefinition(
            schema_id="spec_node_schema",
            name="Specification Node Schema",
            description="Schema for SPEC type nodes",
            node_types=[NodeType.SPEC],
            json_schema={
                "type": "object",
                "properties": {
                    "id": {"type": "string", "minLength": 1},
                    "name": {"type": "string", "minLength": 1},
                    "type": {"type": "string", "enum": ["SPEC"]},
                    "description": {"type": ["string", "null"]},
                    "content": {"type": ["string", "null"]},
                    "spec_source": {"type": ["string", "null"]},
                    "status": {"type": "string", "enum": ["ACTIVE", "DRAFT", "DEPRECATED", "PENDING"]},
                    "metadata": {
                        "type": "object",
                        "properties": {
                            "version": {"type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$"},
                            "author": {"type": "string"},
                            "tags": {"type": "array", "items": {"type": "string"}},
                            "dependencies": {"type": "array", "items": {"type": "string"}},
                            "created_date": {"type": "string", "format": "date-time"}
                        }
                    }
                },
                "required": ["id", "name", "type"]
            },
            required_fields=["id", "name", "type"],
            optional_fields=["description", "content", "spec_source", "status", "metadata"],
            field_constraints={
                "id": {"pattern": r"^[a-zA-Z0-9_-]+$", "min_length": 1, "max_length": 100},
                "name": {"min_length": 1, "max_length": 200}
            }
        )
        self.register_schema(spec_schema)
        
        # MODULE node schema
        module_schema = SchemaDefinition(
            schema_id="module_node_schema",
            name="Module Node Schema",
            description="Schema for MODULE type nodes",
            node_types=[NodeType.MODULE],
            json_schema={
                "type": "object",
                "properties": {
                    "id": {"type": "string", "minLength": 1},
                    "name": {"type": "string", "minLength": 1},
                    "type": {"type": "string", "enum": ["MODULE"]},
                    "description": {"type": ["string", "null"]},
                    "content": {"type": ["string", "null"]},
                    "status": {"type": "string", "enum": ["ACTIVE", "DRAFT", "DEPRECATED", "PENDING"]},
                    "metadata": {
                        "type": "object",
                        "properties": {
                            "file_path": {"type": "string", "minLength": 1},
                            "language": {"type": "string", "enum": ["python", "javascript", "typescript", "java", "csharp", "go", "rust"]},
                            "dependencies": {"type": "array", "items": {"type": "string"}},
                            "exports": {"type": "array", "items": {"type": "string"}},
                            "imports": {"type": "array", "items": {"type": "string"}},
                            "size": {"type": "integer", "minimum": 0},
                            "complexity": {"type": "integer", "minimum": 0}
                        }
                    }
                },
                "required": ["id", "name", "type"]
            },
            required_fields=["id", "name", "type"],
            optional_fields=["description", "content", "status", "metadata"],
            field_constraints={
                "id": {"pattern": r"^[a-zA-Z0-9_-]+$", "min_length": 1, "max_length": 100},
                "name": {"min_length": 1, "max_length": 200}
            }
        )
        self.register_schema(module_schema)
        
        # CLASS node schema
        class_schema = SchemaDefinition(
            schema_id="class_node_schema",
            name="Class Node Schema",
            description="Schema for CLASS type nodes",
            node_types=[NodeType.CLASS],
            json_schema={
                "type": "object",
                "properties": {
                    "id": {"type": "string", "minLength": 1},
                    "name": {"type": "string", "pattern": "^[A-Z][a-zA-Z0-9_]*$"},
                    "type": {"type": "string", "enum": ["CLASS"]},
                    "description": {"type": ["string", "null"]},
                    "content": {"type": ["string", "null"]},
                    "status": {"type": "string", "enum": ["ACTIVE", "DRAFT", "DEPRECATED", "PENDING"]},
                    "metadata": {
                        "type": "object",
                        "properties": {
                            "access_modifier": {"type": "string", "enum": ["public", "private", "protected", "internal"]},
                            "is_abstract": {"type": "boolean"},
                            "is_static": {"type": "boolean"},
                            "is_final": {"type": "boolean"},
                            "base_classes": {"type": "array", "items": {"type": "string"}},
                            "interfaces": {"type": "array", "items": {"type": "string"}},
                            "methods": {"type": "array", "items": {"type": "string"}},
                            "properties": {"type": "array", "items": {"type": "string"}},
                            "complexity": {"type": "integer", "minimum": 0}
                        }
                    }
                },
                "required": ["id", "name", "type"]
            },
            required_fields=["id", "name", "type"],
            optional_fields=["description", "content", "status", "metadata"],
            field_constraints={
                "id": {"pattern": r"^[a-zA-Z0-9_-]+$", "min_length": 1, "max_length": 100},
                "name": {"pattern": r"^[A-Z][a-zA-Z0-9_]*$"}
            }
        )
        self.register_schema(class_schema)
        
        # FUNCTION node schema
        function_schema = SchemaDefinition(
            schema_id="function_node_schema",
            name="Function Node Schema",
            description="Schema for FUNCTION type nodes",
            node_types=[NodeType.FUNCTION],
            json_schema={
                "type": "object",
                "properties": {
                    "id": {"type": "string", "minLength": 1},
                    "name": {"type": "string", "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"},
                    "type": {"type": "string", "enum": ["FUNCTION"]},
                    "description": {"type": ["string", "null"]},
                    "content": {"type": ["string", "null"]},
                    "status": {"type": "string", "enum": ["ACTIVE", "DRAFT", "DEPRECATED", "PENDING"]},
                    "metadata": {
                        "type": "object",
                        "properties": {
                            "parameters": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "type": {"type": "string"},
                                        "default": {"type": ["string", "number", "boolean", "null"]},
                                        "required": {"type": "boolean"}
                                    },
                                    "required": ["name", "type"]
                                }
                            },
                            "return_type": {"type": "string"},
                            "access_modifier": {"type": "string", "enum": ["public", "private", "protected", "internal"]},
                            "is_static": {"type": "boolean"},
                            "is_async": {"type": "boolean"},
                            "complexity": {"type": "integer", "minimum": 0, "maximum": 20},
                            "lines_of_code": {"type": "integer", "minimum": 0}
                        }
                    }
                },
                "required": ["id", "name", "type"]
            },
            required_fields=["id", "name", "type"],
            optional_fields=["description", "content", "status", "metadata"],
            field_constraints={
                "id": {"pattern": r"^[a-zA-Z0-9_-]+$", "min_length": 1, "max_length": 100},
                "name": {"pattern": r"^[a-zA-Z_][a-zA-Z0-9_]*$"}
            }
        )
        self.register_schema(function_schema)