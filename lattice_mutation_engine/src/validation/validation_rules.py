"""
Validation Rules Registry and Definitions

This module provides a centralized registry for validation rules and their definitions.
"""

from typing import Dict, List, Any, Callable, Optional, Set
from pydantic import BaseModel, Field
from enum import Enum
from dataclasses import dataclass
import re
import json
from datetime import datetime

from src.models.spec_graph_models import Node, Edge, NodeType, RelationshipType, Status
from src.models.validation_models import ValidationRule, ValidationResult


class RuleSeverity(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class RuleCategory(str, Enum):
    SCHEMA = "schema"
    DEPENDENCY = "dependency"
    SEMANTIC = "semantic"
    BUSINESS = "business"
    NAMING = "naming"
    STRUCTURE = "structure"
    CONSISTENCY = "consistency"


@dataclass
class ValidationContext:
    """Context information for validation"""
    node: Optional[Node] = None
    edge: Optional[Edge] = None
    graph_nodes: Optional[Dict[str, Node]] = None
    graph_edges: Optional[Dict[str, Edge]] = None
    metadata: Optional[Dict[str, Any]] = None


class ValidationRuleDefinition(BaseModel):
    """Definition of a validation rule"""
    rule_id: str
    name: str
    description: str
    category: RuleCategory
    severity: RuleSeverity
    enabled: bool = True
    node_types: Optional[Set[NodeType]] = None
    edge_types: Optional[Set[RelationshipType]] = None
    validator_func: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    error_message_template: str
    suggestion_template: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ValidationRuleRegistry:
    """Registry for managing validation rules"""
    
    def __init__(self):
        self._rules: Dict[str, ValidationRuleDefinition] = {}
        self._validators: Dict[str, Callable] = {}
        self._initialize_default_rules()
    
    def register_rule(self, rule: ValidationRuleDefinition, validator_func: Callable):
        """Register a validation rule with its validator function"""
        self._rules[rule.rule_id] = rule
        self._validators[rule.validator_func] = validator_func
    
    def get_rule(self, rule_id: str) -> Optional[ValidationRuleDefinition]:
        """Get a validation rule by ID"""
        return self._rules.get(rule_id)
    
    def get_rules_by_category(self, category: RuleCategory) -> List[ValidationRuleDefinition]:
        """Get all rules in a specific category"""
        return [rule for rule in self._rules.values() if rule.category == category]
    
    def get_rules_for_node_type(self, node_type: NodeType) -> List[ValidationRuleDefinition]:
        """Get all rules applicable to a specific node type"""
        return [
            rule for rule in self._rules.values()
            if rule.node_types is None or node_type in rule.node_types
        ]
    
    def get_rules_for_edge_type(self, edge_type: RelationshipType) -> List[ValidationRuleDefinition]:
        """Get all rules applicable to a specific edge type"""
        return [
            rule for rule in self._rules.values()
            if rule.edge_types is None or edge_type in rule.edge_types
        ]
    
    def get_enabled_rules(self) -> List[ValidationRuleDefinition]:
        """Get all enabled validation rules"""
        return [rule for rule in self._rules.values() if rule.enabled]
    
    def enable_rule(self, rule_id: str):
        """Enable a validation rule"""
        if rule_id in self._rules:
            self._rules[rule_id].enabled = True
            self._rules[rule_id].updated_at = datetime.utcnow()
    
    def disable_rule(self, rule_id: str):
        """Disable a validation rule"""
        if rule_id in self._rules:
            self._rules[rule_id].enabled = False
            self._rules[rule_id].updated_at = datetime.utcnow()
    
    def get_validator(self, validator_func_name: str) -> Optional[Callable]:
        """Get validator function by name"""
        return self._validators.get(validator_func_name)
    
    def _initialize_default_rules(self):
        """Initialize default validation rules"""
        
        # Schema validation rules
        self.register_rule(
            ValidationRuleDefinition(
                rule_id="schema_required_fields",
                name="Required Fields Validation",
                description="Validates that all required fields are present",
                category=RuleCategory.SCHEMA,
                severity=RuleSeverity.ERROR,
                validator_func="validate_required_fields",
                error_message_template="Missing required field: {field_name}",
                suggestion_template="Add the required field '{field_name}' to the specification"
            ),
            self._validate_required_fields
        )
        
        self.register_rule(
            ValidationRuleDefinition(
                rule_id="schema_field_types",
                name="Field Type Validation",
                description="Validates that field types match expected schema",
                category=RuleCategory.SCHEMA,
                severity=RuleSeverity.ERROR,
                validator_func="validate_field_types",
                error_message_template="Invalid type for field {field_name}: expected {expected_type}, got {actual_type}",
                suggestion_template="Change field '{field_name}' to type {expected_type}"
            ),
            self._validate_field_types
        )
        
        # Naming convention rules
        self.register_rule(
            ValidationRuleDefinition(
                rule_id="naming_snake_case",
                name="Snake Case Naming",
                description="Validates that identifiers use snake_case naming convention",
                category=RuleCategory.NAMING,
                severity=RuleSeverity.WARNING,
                validator_func="validate_snake_case",
                error_message_template="Identifier '{identifier}' should use snake_case naming convention",
                suggestion_template="Rename '{identifier}' to use snake_case format"
            ),
            self._validate_snake_case
        )
        
        # Dependency validation rules
        self.register_rule(
            ValidationRuleDefinition(
                rule_id="dependency_circular",
                name="Circular Dependency Detection",
                description="Detects circular dependencies in the spec graph",
                category=RuleCategory.DEPENDENCY,
                severity=RuleSeverity.ERROR,
                validator_func="validate_no_circular_dependencies",
                error_message_template="Circular dependency detected: {cycle_path}",
                suggestion_template="Break the circular dependency by removing or restructuring one of the dependencies"
            ),
            self._validate_no_circular_dependencies
        )
        
        # Semantic validation rules
        self.register_rule(
            ValidationRuleDefinition(
                rule_id="semantic_consistency",
                name="Semantic Consistency",
                description="Validates semantic consistency across related specifications",
                category=RuleCategory.SEMANTIC,
                severity=RuleSeverity.WARNING,
                validator_func="validate_semantic_consistency",
                error_message_template="Semantic inconsistency detected: {inconsistency_description}",
                suggestion_template="Review and align the semantic meaning across related specifications"
            ),
            self._validate_semantic_consistency
        )
        
        # Business rule validation
        self.register_rule(
            ValidationRuleDefinition(
                rule_id="business_rule_compliance",
                name="Business Rule Compliance",
                description="Validates compliance with business rules and constraints",
                category=RuleCategory.BUSINESS,
                severity=RuleSeverity.ERROR,
                validator_func="validate_business_rules",
                error_message_template="Business rule violation: {rule_description}",
                suggestion_template="Modify the specification to comply with business rule: {rule_description}"
            ),
            self._validate_business_rules
        )
    
    # Default validator implementations
    def _validate_required_fields(self, context: ValidationContext) -> List[Dict[str, Any]]:
        """Validate required fields are present"""
        errors = []
        if not context.node:
            return errors
        
        required_fields = ['id', 'name', 'type']
        for field in required_fields:
            if not hasattr(context.node, field) or getattr(context.node, field) is None:
                errors.append({
                    'field_name': field,
                    'message': f"Missing required field: {field}"
                })
        
        return errors
    
    def _validate_field_types(self, context: ValidationContext) -> List[Dict[str, Any]]:
        """Validate field types match schema"""
        errors = []
        if not context.node:
            return errors
        
        # Example type validations
        if hasattr(context.node, 'id') and not isinstance(context.node.id, str):
            errors.append({
                'field_name': 'id',
                'expected_type': 'string',
                'actual_type': type(context.node.id).__name__,
                'message': f"Invalid type for field id: expected string, got {type(context.node.id).__name__}"
            })
        
        return errors
    
    def _validate_snake_case(self, context: ValidationContext) -> List[Dict[str, Any]]:
        """Validate snake_case naming convention"""
        errors = []
        if not context.node:
            return errors
        
        snake_case_pattern = re.compile(r'^[a-z][a-z0-9_]*$')
        
        if hasattr(context.node, 'id') and not snake_case_pattern.match(context.node.id):
            errors.append({
                'identifier': context.node.id,
                'message': f"Identifier '{context.node.id}' should use snake_case naming convention"
            })
        
        return errors
    
    def _validate_no_circular_dependencies(self, context: ValidationContext) -> List[Dict[str, Any]]:
        """Validate no circular dependencies exist"""
        errors = []
        # This would be implemented with graph traversal algorithms
        # For now, return empty list
        return errors
    
    def _validate_semantic_consistency(self, context: ValidationContext) -> List[Dict[str, Any]]:
        """Validate semantic consistency"""
        errors = []
        # This would use semantic analysis and NLP
        # For now, return empty list
        return errors
    
    def _validate_business_rules(self, context: ValidationContext) -> List[Dict[str, Any]]:
        """Validate business rule compliance"""
        errors = []
        # This would check against configured business rules
        # For now, return empty list
        return errors


# Global registry instance
validation_rule_registry = ValidationRuleRegistry()