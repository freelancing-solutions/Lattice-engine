"""
Semantic Validator for Lattice Mutation Engine

This module provides semantic validation capabilities for spec nodes and relationships,
ensuring business logic consistency and semantic correctness.
"""

from typing import List, Dict, Any, Optional, Set, Tuple
from dataclasses import dataclass
from enum import Enum
import re
import logging
from datetime import datetime

from src.models.validation_models import ValidationRule, ValidationResult
from src.models.spec_graph_models import Node, Edge, NodeType, RelationshipType


logger = logging.getLogger(__name__)


class SemanticRuleType(Enum):
    """Types of semantic validation rules"""
    NAMING_CONVENTION = "naming_convention"
    BUSINESS_LOGIC = "business_logic"
    CONSISTENCY = "consistency"
    COMPLETENESS = "completeness"
    COHERENCE = "coherence"


@dataclass
class SemanticContext:
    """Context for semantic validation"""
    node: Node
    related_nodes: List[Node]
    incoming_edges: List[Edge]
    outgoing_edges: List[Edge]
    graph_metadata: Dict[str, Any]


class SemanticValidationError(Exception):
    """Exception raised for semantic validation errors"""
    pass


class NamingConventionValidator:
    """Validates naming conventions for different node types"""
    
    def __init__(self):
        self.conventions = {
            NodeType.SPEC: {
                'pattern': r'^[A-Z][a-zA-Z0-9_]*Spec$',
                'description': 'Spec names should be PascalCase ending with "Spec"'
            },
            NodeType.MODULE: {
                'pattern': r'^[a-z][a-z0-9_]*$',
                'description': 'Module names should be snake_case'
            },
            NodeType.CLASS: {
                'pattern': r'^[A-Z][a-zA-Z0-9]*$',
                'description': 'Class names should be PascalCase'
            },
            NodeType.FUNCTION: {
                'pattern': r'^[a-z][a-z0-9_]*$',
                'description': 'Function names should be snake_case'
            },
            NodeType.INTERFACE: {
                'pattern': r'^I[A-Z][a-zA-Z0-9]*$',
                'description': 'Interface names should start with "I" followed by PascalCase'
            }
        }
    
    def validate(self, node: Node) -> List[ValidationResult]:
        """Validate naming convention for a node"""
        results = []
        
        if node.type not in self.conventions:
            return results
        
        convention = self.conventions[node.type]
        pattern = convention['pattern']
        description = convention['description']
        
        if not re.match(pattern, node.name):
            results.append(ValidationResult(
                rule_id=f"naming_convention_{node.type.value}",
                severity="WARNING",
                message=f"Node name '{node.name}' does not follow convention: {description}",
                node_id=node.id,
                metadata={
                    'expected_pattern': pattern,
                    'actual_name': node.name,
                    'convention': description
                }
            ))
        
        return results


class BusinessLogicValidator:
    """Validates business logic rules and constraints"""
    
    def __init__(self):
        self.business_rules = {
            'spec_must_have_description': self._validate_spec_description,
            'module_must_have_functions': self._validate_module_functions,
            'class_must_have_methods': self._validate_class_methods,
            'interface_must_define_contracts': self._validate_interface_contracts,
            'function_must_have_parameters': self._validate_function_parameters,
            'no_circular_inheritance': self._validate_no_circular_inheritance,
            'consistent_return_types': self._validate_consistent_return_types,
            'proper_access_modifiers': self._validate_access_modifiers
        }
    
    def validate(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate business logic rules"""
        results = []
        
        for rule_name, validator_func in self.business_rules.items():
            try:
                rule_results = validator_func(context)
                results.extend(rule_results)
            except Exception as e:
                logger.error(f"Error in business rule {rule_name}: {e}")
                results.append(ValidationResult(
                    rule_id=f"business_logic_error_{rule_name}",
                    severity="ERROR",
                    message=f"Failed to validate business rule {rule_name}: {str(e)}",
                    node_id=context.node.id,
                    metadata={'rule_name': rule_name, 'error': str(e)}
                ))
        
        return results
    
    def _validate_spec_description(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate that specs have meaningful descriptions"""
        results = []
        node = context.node
        
        if node.type == NodeType.SPEC:
            description = node.description or ""
            if len(description.strip()) < 10:
                results.append(ValidationResult(
                    rule_id="spec_description_required",
                    severity="WARNING",
                    message="Spec should have a meaningful description (at least 10 characters)",
                    node_id=node.id,
                    metadata={'description_length': len(description)}
                ))
        
        return results
    
    def _validate_module_functions(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate that modules contain functions"""
        results = []
        node = context.node
        
        if node.type == NodeType.MODULE:
            function_edges = [
                edge for edge in context.outgoing_edges
                if edge.type == RelationshipType.CONTAINS
            ]
            function_nodes = [
                related for related in context.related_nodes
                if related.type == NodeType.FUNCTION and
                any(edge.target_id == related.id for edge in function_edges)
            ]
            
            if not function_nodes:
                results.append(ValidationResult(
                    rule_id="module_functions_required",
                    severity="INFO",
                    message="Module should contain at least one function",
                    node_id=node.id,
                    metadata={'function_count': 0}
                ))
        
        return results
    
    def _validate_class_methods(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate that classes have methods"""
        results = []
        node = context.node
        
        if node.type == NodeType.CLASS:
            method_edges = [
                edge for edge in context.outgoing_edges
                if edge.type == RelationshipType.CONTAINS
            ]
            method_nodes = [
                related for related in context.related_nodes
                if related.type == NodeType.FUNCTION and
                any(edge.target_id == related.id for edge in method_edges)
            ]
            
            if not method_nodes:
                results.append(ValidationResult(
                    rule_id="class_methods_recommended",
                    severity="INFO",
                    message="Class should contain at least one method",
                    node_id=node.id,
                    metadata={'method_count': 0}
                ))
        
        return results
    
    def _validate_interface_contracts(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate that interfaces define proper contracts"""
        results = []
        node = context.node
        
        if node.type == NodeType.INTERFACE:
            contract_metadata = node.metadata.get('contracts', [])
            if not contract_metadata:
                results.append(ValidationResult(
                    rule_id="interface_contracts_required",
                    severity="WARNING",
                    message="Interface should define contracts in metadata",
                    node_id=node.id,
                    metadata={'contracts_defined': False}
                ))
        
        return results
    
    def _validate_function_parameters(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate function parameter definitions"""
        results = []
        node = context.node
        
        if node.type == NodeType.FUNCTION:
            parameters = node.metadata.get('parameters', [])
            for param in parameters:
                if not isinstance(param, dict) or 'name' not in param or 'type' not in param:
                    results.append(ValidationResult(
                        rule_id="function_parameter_definition",
                        severity="WARNING",
                        message=f"Function parameter should have 'name' and 'type' defined",
                        node_id=node.id,
                        metadata={'invalid_parameter': param}
                    ))
        
        return results
    
    def _validate_no_circular_inheritance(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate no circular inheritance relationships"""
        results = []
        node = context.node
        
        if node.type in [NodeType.CLASS, NodeType.INTERFACE]:
            visited = set()
            path = []
            
            def has_circular_inheritance(current_node_id: str) -> bool:
                if current_node_id in visited:
                    return current_node_id in path
                
                visited.add(current_node_id)
                path.append(current_node_id)
                
                # Find inheritance edges
                inheritance_edges = [
                    edge for edge in context.outgoing_edges
                    if edge.source_id == current_node_id and 
                    edge.type == RelationshipType.INHERITS
                ]
                
                for edge in inheritance_edges:
                    if has_circular_inheritance(edge.target_id):
                        return True
                
                path.pop()
                return False
            
            if has_circular_inheritance(node.id):
                results.append(ValidationResult(
                    rule_id="circular_inheritance_detected",
                    severity="ERROR",
                    message="Circular inheritance detected",
                    node_id=node.id,
                    metadata={'inheritance_path': path}
                ))
        
        return results
    
    def _validate_consistent_return_types(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate consistent return types in function overloads"""
        results = []
        node = context.node
        
        if node.type == NodeType.FUNCTION:
            return_type = node.metadata.get('return_type')
            overloads = node.metadata.get('overloads', [])
            
            for overload in overloads:
                overload_return_type = overload.get('return_type')
                if return_type and overload_return_type and return_type != overload_return_type:
                    results.append(ValidationResult(
                        rule_id="inconsistent_return_types",
                        severity="WARNING",
                        message=f"Inconsistent return types: {return_type} vs {overload_return_type}",
                        node_id=node.id,
                        metadata={
                            'base_return_type': return_type,
                            'overload_return_type': overload_return_type
                        }
                    ))
        
        return results
    
    def _validate_access_modifiers(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate proper use of access modifiers"""
        results = []
        node = context.node
        
        if node.type in [NodeType.FUNCTION, NodeType.CLASS]:
            access_modifier = node.metadata.get('access_modifier', 'public')
            valid_modifiers = ['public', 'private', 'protected', 'internal']
            
            if access_modifier not in valid_modifiers:
                results.append(ValidationResult(
                    rule_id="invalid_access_modifier",
                    severity="ERROR",
                    message=f"Invalid access modifier: {access_modifier}",
                    node_id=node.id,
                    metadata={
                        'invalid_modifier': access_modifier,
                        'valid_modifiers': valid_modifiers
                    }
                ))
        
        return results


class ConsistencyValidator:
    """Validates consistency across related nodes"""
    
    def validate(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate consistency rules"""
        results = []
        
        # Validate type consistency
        results.extend(self._validate_type_consistency(context))
        
        # Validate relationship consistency
        results.extend(self._validate_relationship_consistency(context))
        
        # Validate metadata consistency
        results.extend(self._validate_metadata_consistency(context))
        
        return results
    
    def _validate_type_consistency(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate type consistency across relationships"""
        results = []
        node = context.node
        
        for edge in context.outgoing_edges:
            target_node = next(
                (n for n in context.related_nodes if n.id == edge.target_id),
                None
            )
            
            if target_node:
                # Validate relationship type compatibility
                if not self._is_relationship_valid(node.type, edge.type, target_node.type):
                    results.append(ValidationResult(
                        rule_id="invalid_relationship_type",
                        severity="ERROR",
                        message=f"Invalid relationship {edge.type.value} between {node.type.value} and {target_node.type.value}",
                        node_id=node.id,
                        metadata={
                            'source_type': node.type.value,
                            'relationship_type': edge.type.value,
                            'target_type': target_node.type.value,
                            'edge_id': edge.id
                        }
                    ))
        
        return results
    
    def _validate_relationship_consistency(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate relationship consistency"""
        results = []
        
        # Check for duplicate relationships
        edge_signatures = set()
        for edge in context.outgoing_edges:
            signature = (edge.source_id, edge.target_id, edge.type)
            if signature in edge_signatures:
                results.append(ValidationResult(
                    rule_id="duplicate_relationship",
                    severity="WARNING",
                    message=f"Duplicate relationship detected: {edge.type.value}",
                    node_id=context.node.id,
                    metadata={'edge_signature': signature}
                ))
            edge_signatures.add(signature)
        
        return results
    
    def _validate_metadata_consistency(self, context: SemanticContext) -> List[ValidationResult]:
        """Validate metadata consistency"""
        results = []
        node = context.node
        
        # Validate required metadata fields
        required_fields = self._get_required_metadata_fields(node.type)
        for field in required_fields:
            if field not in node.metadata:
                results.append(ValidationResult(
                    rule_id="missing_required_metadata",
                    severity="WARNING",
                    message=f"Missing required metadata field: {field}",
                    node_id=node.id,
                    metadata={'missing_field': field}
                ))
        
        return results
    
    def _is_relationship_valid(self, source_type: NodeType, rel_type: RelationshipType, target_type: NodeType) -> bool:
        """Check if a relationship type is valid between two node types"""
        valid_relationships = {
            (NodeType.SPEC, RelationshipType.CONTAINS, NodeType.MODULE),
            (NodeType.MODULE, RelationshipType.CONTAINS, NodeType.CLASS),
            (NodeType.MODULE, RelationshipType.CONTAINS, NodeType.FUNCTION),
            (NodeType.CLASS, RelationshipType.CONTAINS, NodeType.FUNCTION),
            (NodeType.CLASS, RelationshipType.INHERITS, NodeType.CLASS),
            (NodeType.CLASS, RelationshipType.IMPLEMENTS, NodeType.INTERFACE),
            (NodeType.FUNCTION, RelationshipType.DEPENDS_ON, NodeType.FUNCTION),
            (NodeType.FUNCTION, RelationshipType.CALLS, NodeType.FUNCTION),
        }
        
        return (source_type, rel_type, target_type) in valid_relationships
    
    def _get_required_metadata_fields(self, node_type: NodeType) -> List[str]:
        """Get required metadata fields for a node type"""
        required_fields = {
            NodeType.SPEC: ['version', 'author'],
            NodeType.MODULE: ['file_path'],
            NodeType.CLASS: ['access_modifier'],
            NodeType.FUNCTION: ['parameters', 'return_type'],
            NodeType.INTERFACE: ['contracts']
        }
        
        return required_fields.get(node_type, [])


class SemanticValidator:
    """Main semantic validator that orchestrates all semantic validation rules"""
    
    def __init__(self):
        self.naming_validator = NamingConventionValidator()
        self.business_validator = BusinessLogicValidator()
        self.consistency_validator = ConsistencyValidator()
        
        logger.info("Semantic validator initialized")
    
    def validate_node(self, node: Node, related_nodes: List[Node] = None, 
                     edges: List[Edge] = None) -> List[ValidationResult]:
        """Validate a single node with semantic rules"""
        results = []
        
        try:
            # Create semantic context
            related_nodes = related_nodes or []
            edges = edges or []
            
            incoming_edges = [e for e in edges if e.target_id == node.id]
            outgoing_edges = [e for e in edges if e.source_id == node.id]
            
            context = SemanticContext(
                node=node,
                related_nodes=related_nodes,
                incoming_edges=incoming_edges,
                outgoing_edges=outgoing_edges,
                graph_metadata={}
            )
            
            # Run naming convention validation
            results.extend(self.naming_validator.validate(node))
            
            # Run business logic validation
            results.extend(self.business_validator.validate(context))
            
            # Run consistency validation
            results.extend(self.consistency_validator.validate(context))
            
            logger.debug(f"Semantic validation completed for node {node.id}: {len(results)} issues found")
            
        except Exception as e:
            logger.error(f"Error during semantic validation of node {node.id}: {e}")
            results.append(ValidationResult(
                rule_id="semantic_validation_error",
                severity="ERROR",
                message=f"Semantic validation failed: {str(e)}",
                node_id=node.id,
                metadata={'error': str(e)}
            ))
        
        return results
    
    def validate_graph_semantics(self, nodes: List[Node], edges: List[Edge]) -> List[ValidationResult]:
        """Validate semantic consistency across the entire graph"""
        results = []
        
        try:
            # Validate each node in context
            for node in nodes:
                node_results = self.validate_node(node, nodes, edges)
                results.extend(node_results)
            
            # Validate global semantic rules
            results.extend(self._validate_global_semantics(nodes, edges))
            
            logger.info(f"Graph semantic validation completed: {len(results)} total issues found")
            
        except Exception as e:
            logger.error(f"Error during graph semantic validation: {e}")
            results.append(ValidationResult(
                rule_id="graph_semantic_validation_error",
                severity="ERROR",
                message=f"Graph semantic validation failed: {str(e)}",
                node_id="",
                metadata={'error': str(e)}
            ))
        
        return results
    
    def _validate_global_semantics(self, nodes: List[Node], edges: List[Edge]) -> List[ValidationResult]:
        """Validate global semantic rules across the entire graph"""
        results = []
        
        # Check for orphaned nodes
        connected_node_ids = set()
        for edge in edges:
            connected_node_ids.add(edge.source_id)
            connected_node_ids.add(edge.target_id)
        
        for node in nodes:
            if node.id not in connected_node_ids and node.type != NodeType.SPEC:
                results.append(ValidationResult(
                    rule_id="orphaned_node",
                    severity="INFO",
                    message=f"Node {node.name} is not connected to any other nodes",
                    node_id=node.id,
                    metadata={'node_type': node.type.value}
                ))
        
        # Check for naming conflicts
        name_groups = {}
        for node in nodes:
            key = (node.name, node.type)
            if key not in name_groups:
                name_groups[key] = []
            name_groups[key].append(node)
        
        for (name, node_type), node_list in name_groups.items():
            if len(node_list) > 1:
                for node in node_list:
                    results.append(ValidationResult(
                        rule_id="naming_conflict",
                        severity="WARNING",
                        message=f"Multiple {node_type.value} nodes with name '{name}'",
                        node_id=node.id,
                        metadata={
                            'conflicting_name': name,
                            'node_type': node_type.value,
                            'conflicting_nodes': [n.id for n in node_list]
                        }
                    ))
        
        return results
    
    def get_validation_rules(self) -> List[ValidationRule]:
        """Get all semantic validation rules"""
        rules = []
        
        # Naming convention rules
        for node_type, convention in self.naming_validator.conventions.items():
            rules.append(ValidationRule(
                id=f"naming_convention_{node_type.value}",
                name=f"Naming Convention - {node_type.value}",
                description=convention['description'],
                severity="WARNING",
                category="semantic",
                enabled=True,
                metadata={'pattern': convention['pattern']}
            ))
        
        # Business logic rules
        for rule_name in self.business_validator.business_rules.keys():
            rules.append(ValidationRule(
                id=rule_name,
                name=rule_name.replace('_', ' ').title(),
                description=f"Business logic validation: {rule_name}",
                severity="WARNING",
                category="semantic",
                enabled=True,
                metadata={'rule_type': 'business_logic'}
            ))
        
        # Consistency rules
        consistency_rules = [
            "type_consistency", "relationship_consistency", "metadata_consistency",
            "orphaned_node", "naming_conflict"
        ]
        
        for rule_name in consistency_rules:
            rules.append(ValidationRule(
                id=rule_name,
                name=rule_name.replace('_', ' ').title(),
                description=f"Consistency validation: {rule_name}",
                severity="WARNING",
                category="semantic",
                enabled=True,
                metadata={'rule_type': 'consistency'}
            ))
        
        return rules