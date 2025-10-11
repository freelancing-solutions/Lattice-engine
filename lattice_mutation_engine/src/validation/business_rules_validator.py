"""
Business Rules Validator for Lattice Mutation Engine

This module provides a flexible business rules validation engine that allows
for custom domain-specific validation logic and rule definitions.
"""

from typing import List, Dict, Any, Optional, Callable, Union
from dataclasses import dataclass, field
from enum import Enum
import re
import json
import logging
from datetime import datetime, timedelta
from abc import ABC, abstractmethod

from src.models.validation_models import ValidationRule, ValidationResult
from src.models.spec_graph_models import Node, Edge, NodeType, RelationshipType


logger = logging.getLogger(__name__)


class RuleOperator(Enum):
    """Operators for business rule conditions"""
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    GREATER_EQUAL = "greater_equal"
    LESS_EQUAL = "less_equal"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    STARTS_WITH = "starts_with"
    ENDS_WITH = "ends_with"
    MATCHES_REGEX = "matches_regex"
    IN_LIST = "in_list"
    NOT_IN_LIST = "not_in_list"
    IS_EMPTY = "is_empty"
    IS_NOT_EMPTY = "is_not_empty"
    EXISTS = "exists"
    NOT_EXISTS = "not_exists"


class RuleAction(Enum):
    """Actions to take when a rule is violated"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    BLOCK = "block"
    SUGGEST = "suggest"
    AUTO_FIX = "auto_fix"


@dataclass
class RuleCondition:
    """Represents a condition in a business rule"""
    field_path: str  # e.g., "metadata.version", "name", "type"
    operator: RuleOperator
    value: Any
    description: Optional[str] = None


@dataclass
class BusinessRule:
    """Represents a business rule definition"""
    id: str
    name: str
    description: str
    conditions: List[RuleCondition]
    action: RuleAction
    message_template: str
    enabled: bool = True
    priority: int = 100
    applies_to: List[NodeType] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


class RuleContext:
    """Context for rule evaluation"""
    
    def __init__(self, node: Node, related_nodes: List[Node] = None, 
                 edges: List[Edge] = None, graph_metadata: Dict[str, Any] = None):
        self.node = node
        self.related_nodes = related_nodes or []
        self.edges = edges or []
        self.graph_metadata = graph_metadata or {}
        self.variables = {}
    
    def get_field_value(self, field_path: str) -> Any:
        """Get value from node using dot notation field path"""
        try:
            parts = field_path.split('.')
            current = self.node
            
            for part in parts:
                if hasattr(current, part):
                    current = getattr(current, part)
                elif isinstance(current, dict) and part in current:
                    current = current[part]
                else:
                    return None
            
            return current
        except Exception as e:
            logger.debug(f"Error getting field value for path {field_path}: {e}")
            return None
    
    def set_variable(self, name: str, value: Any):
        """Set a context variable"""
        self.variables[name] = value
    
    def get_variable(self, name: str) -> Any:
        """Get a context variable"""
        return self.variables.get(name)


class RuleEvaluator:
    """Evaluates business rule conditions"""
    
    def __init__(self):
        self.operators = {
            RuleOperator.EQUALS: self._equals,
            RuleOperator.NOT_EQUALS: self._not_equals,
            RuleOperator.GREATER_THAN: self._greater_than,
            RuleOperator.LESS_THAN: self._less_than,
            RuleOperator.GREATER_EQUAL: self._greater_equal,
            RuleOperator.LESS_EQUAL: self._less_equal,
            RuleOperator.CONTAINS: self._contains,
            RuleOperator.NOT_CONTAINS: self._not_contains,
            RuleOperator.STARTS_WITH: self._starts_with,
            RuleOperator.ENDS_WITH: self._ends_with,
            RuleOperator.MATCHES_REGEX: self._matches_regex,
            RuleOperator.IN_LIST: self._in_list,
            RuleOperator.NOT_IN_LIST: self._not_in_list,
            RuleOperator.IS_EMPTY: self._is_empty,
            RuleOperator.IS_NOT_EMPTY: self._is_not_empty,
            RuleOperator.EXISTS: self._exists,
            RuleOperator.NOT_EXISTS: self._not_exists,
        }
    
    def evaluate_condition(self, condition: RuleCondition, context: RuleContext) -> bool:
        """Evaluate a single condition"""
        try:
            field_value = context.get_field_value(condition.field_path)
            operator_func = self.operators.get(condition.operator)
            
            if not operator_func:
                logger.error(f"Unknown operator: {condition.operator}")
                return False
            
            result = operator_func(field_value, condition.value)
            logger.debug(f"Condition evaluation: {condition.field_path} {condition.operator.value} {condition.value} = {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error evaluating condition {condition.field_path}: {e}")
            return False
    
    def evaluate_rule(self, rule: BusinessRule, context: RuleContext) -> bool:
        """Evaluate all conditions in a rule (AND logic)"""
        if not rule.enabled:
            return False
        
        # Check if rule applies to this node type
        if rule.applies_to and context.node.type not in rule.applies_to:
            return False
        
        # Evaluate all conditions
        for condition in rule.conditions:
            if not self.evaluate_condition(condition, context):
                return False
        
        return True
    
    # Operator implementations
    def _equals(self, field_value: Any, expected_value: Any) -> bool:
        return field_value == expected_value
    
    def _not_equals(self, field_value: Any, expected_value: Any) -> bool:
        return field_value != expected_value
    
    def _greater_than(self, field_value: Any, expected_value: Any) -> bool:
        try:
            return float(field_value) > float(expected_value)
        except (TypeError, ValueError):
            return False
    
    def _less_than(self, field_value: Any, expected_value: Any) -> bool:
        try:
            return float(field_value) < float(expected_value)
        except (TypeError, ValueError):
            return False
    
    def _greater_equal(self, field_value: Any, expected_value: Any) -> bool:
        try:
            return float(field_value) >= float(expected_value)
        except (TypeError, ValueError):
            return False
    
    def _less_equal(self, field_value: Any, expected_value: Any) -> bool:
        try:
            return float(field_value) <= float(expected_value)
        except (TypeError, ValueError):
            return False
    
    def _contains(self, field_value: Any, expected_value: Any) -> bool:
        try:
            return str(expected_value) in str(field_value)
        except (TypeError, AttributeError):
            return False
    
    def _not_contains(self, field_value: Any, expected_value: Any) -> bool:
        return not self._contains(field_value, expected_value)
    
    def _starts_with(self, field_value: Any, expected_value: Any) -> bool:
        try:
            return str(field_value).startswith(str(expected_value))
        except (TypeError, AttributeError):
            return False
    
    def _ends_with(self, field_value: Any, expected_value: Any) -> bool:
        try:
            return str(field_value).endswith(str(expected_value))
        except (TypeError, AttributeError):
            return False
    
    def _matches_regex(self, field_value: Any, pattern: str) -> bool:
        try:
            return bool(re.match(pattern, str(field_value)))
        except (TypeError, re.error):
            return False
    
    def _in_list(self, field_value: Any, expected_list: List[Any]) -> bool:
        try:
            return field_value in expected_list
        except TypeError:
            return False
    
    def _not_in_list(self, field_value: Any, expected_list: List[Any]) -> bool:
        return not self._in_list(field_value, expected_list)
    
    def _is_empty(self, field_value: Any, _: Any) -> bool:
        if field_value is None:
            return True
        if isinstance(field_value, (str, list, dict)):
            return len(field_value) == 0
        return False
    
    def _is_not_empty(self, field_value: Any, _: Any) -> bool:
        return not self._is_empty(field_value, _)
    
    def _exists(self, field_value: Any, _: Any) -> bool:
        return field_value is not None
    
    def _not_exists(self, field_value: Any, _: Any) -> bool:
        return field_value is None


class RuleRepository:
    """Repository for managing business rules"""
    
    def __init__(self):
        self.rules: Dict[str, BusinessRule] = {}
        self._load_default_rules()
    
    def add_rule(self, rule: BusinessRule):
        """Add a business rule"""
        rule.updated_at = datetime.now()
        self.rules[rule.id] = rule
        logger.info(f"Added business rule: {rule.id}")
    
    def remove_rule(self, rule_id: str):
        """Remove a business rule"""
        if rule_id in self.rules:
            del self.rules[rule_id]
            logger.info(f"Removed business rule: {rule_id}")
    
    def get_rule(self, rule_id: str) -> Optional[BusinessRule]:
        """Get a business rule by ID"""
        return self.rules.get(rule_id)
    
    def get_all_rules(self) -> List[BusinessRule]:
        """Get all business rules"""
        return list(self.rules.values())
    
    def get_rules_for_node_type(self, node_type: NodeType) -> List[BusinessRule]:
        """Get rules that apply to a specific node type"""
        return [
            rule for rule in self.rules.values()
            if not rule.applies_to or node_type in rule.applies_to
        ]
    
    def enable_rule(self, rule_id: str):
        """Enable a business rule"""
        if rule_id in self.rules:
            self.rules[rule_id].enabled = True
            self.rules[rule_id].updated_at = datetime.now()
    
    def disable_rule(self, rule_id: str):
        """Disable a business rule"""
        if rule_id in self.rules:
            self.rules[rule_id].enabled = False
            self.rules[rule_id].updated_at = datetime.now()
    
    def _load_default_rules(self):
        """Load default business rules"""
        default_rules = [
            # Spec version rule
            BusinessRule(
                id="spec_version_required",
                name="Spec Version Required",
                description="All specs must have a version in metadata",
                conditions=[
                    RuleCondition("metadata.version", RuleOperator.EXISTS, None)
                ],
                action=RuleAction.ERROR,
                message_template="Spec must have a version defined in metadata",
                applies_to=[NodeType.SPEC]
            ),
            
            # Function complexity rule
            BusinessRule(
                id="function_complexity_limit",
                name="Function Complexity Limit",
                description="Functions should not exceed complexity threshold",
                conditions=[
                    RuleCondition("metadata.complexity", RuleOperator.LESS_EQUAL, 10)
                ],
                action=RuleAction.WARNING,
                message_template="Function complexity ({metadata.complexity}) exceeds recommended limit of 10",
                applies_to=[NodeType.FUNCTION]
            ),
            
            # Class naming convention
            BusinessRule(
                id="class_naming_convention",
                name="Class Naming Convention",
                description="Class names must be PascalCase",
                conditions=[
                    RuleCondition("name", RuleOperator.MATCHES_REGEX, r"^[A-Z][a-zA-Z0-9]*$")
                ],
                action=RuleAction.WARNING,
                message_template="Class name '{name}' should be in PascalCase",
                applies_to=[NodeType.CLASS]
            ),
            
            # Module file path rule
            BusinessRule(
                id="module_file_path_required",
                name="Module File Path Required",
                description="Modules must have a file path in metadata",
                conditions=[
                    RuleCondition("metadata.file_path", RuleOperator.IS_NOT_EMPTY, None)
                ],
                action=RuleAction.ERROR,
                message_template="Module must have a file_path defined in metadata",
                applies_to=[NodeType.MODULE]
            ),
            
            # Interface contract rule
            BusinessRule(
                id="interface_contracts_defined",
                name="Interface Contracts Defined",
                description="Interfaces must define contracts",
                conditions=[
                    RuleCondition("metadata.contracts", RuleOperator.IS_NOT_EMPTY, None)
                ],
                action=RuleAction.WARNING,
                message_template="Interface should define contracts in metadata",
                applies_to=[NodeType.INTERFACE]
            ),
            
            # Description length rule
            BusinessRule(
                id="description_minimum_length",
                name="Description Minimum Length",
                description="Nodes should have meaningful descriptions",
                conditions=[
                    RuleCondition("description", RuleOperator.IS_NOT_EMPTY, None)
                ],
                action=RuleAction.INFO,
                message_template="Node should have a description",
                applies_to=list(NodeType)
            ),
            
            # Deprecated node rule
            BusinessRule(
                id="deprecated_node_warning",
                name="Deprecated Node Warning",
                description="Warn about deprecated nodes",
                conditions=[
                    RuleCondition("metadata.deprecated", RuleOperator.EQUALS, True)
                ],
                action=RuleAction.WARNING,
                message_template="Node '{name}' is marked as deprecated",
                applies_to=list(NodeType)
            ),
            
            # Security sensitive rule
            BusinessRule(
                id="security_sensitive_review",
                name="Security Sensitive Review",
                description="Security sensitive nodes require review",
                conditions=[
                    RuleCondition("metadata.security_sensitive", RuleOperator.EQUALS, True)
                ],
                action=RuleAction.BLOCK,
                message_template="Security sensitive node '{name}' requires security review",
                applies_to=list(NodeType)
            )
        ]
        
        for rule in default_rules:
            self.add_rule(rule)


class BusinessRulesValidator:
    """Main business rules validator"""
    
    def __init__(self, rule_repository: RuleRepository = None):
        self.rule_repository = rule_repository or RuleRepository()
        self.evaluator = RuleEvaluator()
        
        logger.info("Business rules validator initialized")
    
    def validate_node(self, node: Node, related_nodes: List[Node] = None,
                     edges: List[Edge] = None, graph_metadata: Dict[str, Any] = None) -> List[ValidationResult]:
        """Validate a node against business rules"""
        results = []
        
        try:
            # Create rule context
            context = RuleContext(node, related_nodes, edges, graph_metadata)
            
            # Get applicable rules
            applicable_rules = self.rule_repository.get_rules_for_node_type(node.type)
            
            # Evaluate each rule
            for rule in applicable_rules:
                if self.evaluator.evaluate_rule(rule, context):
                    # Rule violated, create validation result
                    message = self._format_message(rule.message_template, context)
                    severity = self._action_to_severity(rule.action)
                    
                    results.append(ValidationResult(
                        rule_id=rule.id,
                        severity=severity,
                        message=message,
                        node_id=node.id,
                        metadata={
                            'rule_name': rule.name,
                            'rule_description': rule.description,
                            'action': rule.action.value,
                            'priority': rule.priority
                        }
                    ))
            
            logger.debug(f"Business rules validation completed for node {node.id}: {len(results)} violations found")
            
        except Exception as e:
            logger.error(f"Error during business rules validation of node {node.id}: {e}")
            results.append(ValidationResult(
                rule_id="business_rules_validation_error",
                severity="ERROR",
                message=f"Business rules validation failed: {str(e)}",
                node_id=node.id,
                metadata={'error': str(e)}
            ))
        
        return results
    
    def validate_custom_rule(self, rule: BusinessRule, node: Node,
                           related_nodes: List[Node] = None, edges: List[Edge] = None) -> Optional[ValidationResult]:
        """Validate a node against a specific custom rule"""
        try:
            context = RuleContext(node, related_nodes, edges)
            
            if self.evaluator.evaluate_rule(rule, context):
                message = self._format_message(rule.message_template, context)
                severity = self._action_to_severity(rule.action)
                
                return ValidationResult(
                    rule_id=rule.id,
                    severity=severity,
                    message=message,
                    node_id=node.id,
                    metadata={
                        'rule_name': rule.name,
                        'custom_rule': True
                    }
                )
        
        except Exception as e:
            logger.error(f"Error validating custom rule {rule.id}: {e}")
        
        return None
    
    def add_custom_rule(self, rule_definition: Dict[str, Any]) -> BusinessRule:
        """Add a custom business rule from definition"""
        try:
            # Parse conditions
            conditions = []
            for cond_def in rule_definition.get('conditions', []):
                condition = RuleCondition(
                    field_path=cond_def['field_path'],
                    operator=RuleOperator(cond_def['operator']),
                    value=cond_def['value'],
                    description=cond_def.get('description')
                )
                conditions.append(condition)
            
            # Parse applies_to
            applies_to = []
            for node_type_str in rule_definition.get('applies_to', []):
                applies_to.append(NodeType(node_type_str))
            
            # Create rule
            rule = BusinessRule(
                id=rule_definition['id'],
                name=rule_definition['name'],
                description=rule_definition['description'],
                conditions=conditions,
                action=RuleAction(rule_definition['action']),
                message_template=rule_definition['message_template'],
                enabled=rule_definition.get('enabled', True),
                priority=rule_definition.get('priority', 100),
                applies_to=applies_to,
                metadata=rule_definition.get('metadata', {})
            )
            
            self.rule_repository.add_rule(rule)
            return rule
            
        except Exception as e:
            logger.error(f"Error adding custom rule: {e}")
            raise ValueError(f"Invalid rule definition: {e}")
    
    def get_validation_rules(self) -> List[ValidationRule]:
        """Get all business rules as validation rules"""
        validation_rules = []
        
        for business_rule in self.rule_repository.get_all_rules():
            validation_rules.append(ValidationRule(
                id=business_rule.id,
                name=business_rule.name,
                description=business_rule.description,
                severity=self._action_to_severity(business_rule.action),
                category="business",
                enabled=business_rule.enabled,
                metadata={
                    'action': business_rule.action.value,
                    'priority': business_rule.priority,
                    'applies_to': [nt.value for nt in business_rule.applies_to],
                    'conditions_count': len(business_rule.conditions)
                }
            ))
        
        return validation_rules
    
    def _format_message(self, template: str, context: RuleContext) -> str:
        """Format message template with context values"""
        try:
            # Simple template formatting using node attributes
            formatted = template.format(
                name=context.node.name,
                type=context.node.type.value,
                id=context.node.id,
                **context.node.metadata
            )
            return formatted
        except (KeyError, AttributeError):
            # Fallback to original template if formatting fails
            return template
    
    def _action_to_severity(self, action: RuleAction) -> str:
        """Convert rule action to validation severity"""
        action_severity_map = {
            RuleAction.ERROR: "ERROR",
            RuleAction.WARNING: "WARNING",
            RuleAction.INFO: "INFO",
            RuleAction.BLOCK: "ERROR",
            RuleAction.SUGGEST: "INFO",
            RuleAction.AUTO_FIX: "WARNING"
        }
        return action_severity_map.get(action, "WARNING")