"""
Comprehensive Validator for Lattice Mutation Engine

This module provides a unified validation interface that orchestrates all
validation types including semantic, business rules, and schema validation.
"""

from typing import List, Dict, Any, Optional, Set, Union
from dataclasses import dataclass, field
from enum import Enum
import logging
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio

from ..models.validation_models import ValidationRule, ValidationResult
from ..models.spec_graph_models import Node, Edge, SpecGraph, NodeType, RelationshipType
from .semantic_validator import SemanticValidator
from .business_rules_validator import BusinessRulesValidator
from .schema_validator import SchemaValidator


logger = logging.getLogger(__name__)


class ValidationMode(Enum):
    """Validation execution modes"""
    STRICT = "strict"          # All validations must pass
    LENIENT = "lenient"        # Warnings allowed, only errors block
    ADVISORY = "advisory"      # All validations run, nothing blocks
    FAST = "fast"             # Skip expensive validations
    COMPREHENSIVE = "comprehensive"  # Run all validations including optional ones


class ValidationScope(Enum):
    """Scope of validation"""
    NODE = "node"              # Single node validation
    EDGE = "edge"              # Single edge validation
    SUBGRAPH = "subgraph"      # Partial graph validation
    FULL_GRAPH = "full_graph"  # Complete graph validation
    INCREMENTAL = "incremental" # Only changed elements


@dataclass
class ValidationConfig:
    """Configuration for comprehensive validation"""
    mode: ValidationMode = ValidationMode.STRICT
    scope: ValidationScope = ValidationScope.NODE
    enable_semantic: bool = True
    enable_business_rules: bool = True
    enable_schema: bool = True
    enable_parallel: bool = True
    max_workers: int = 4
    timeout_seconds: int = 30
    fail_fast: bool = False
    include_warnings: bool = True
    include_info: bool = False
    custom_rules: List[str] = field(default_factory=list)
    excluded_rules: List[str] = field(default_factory=list)


@dataclass
class ValidationSummary:
    """Summary of validation results"""
    total_nodes_validated: int = 0
    total_edges_validated: int = 0
    total_violations: int = 0
    error_count: int = 0
    warning_count: int = 0
    info_count: int = 0
    validation_time_ms: float = 0
    passed: bool = False
    blocked_by_errors: bool = False
    validation_rules_applied: int = 0
    skipped_validations: List[str] = field(default_factory=list)


class ComprehensiveValidator:
    """Unified validator that orchestrates all validation types"""
    
    def __init__(self, config: ValidationConfig = None):
        self.config = config or ValidationConfig()
        
        # Initialize component validators
        self.semantic_validator = SemanticValidator()
        self.business_rules_validator = BusinessRulesValidator()
        self.schema_validator = SchemaValidator()
        
        # Validation state
        self.validation_cache: Dict[str, List[ValidationResult]] = {}
        self.last_validation_time: Optional[datetime] = None
        
        logger.info(f"Comprehensive validator initialized with mode: {self.config.mode.value}")
    
    def validate_node(self, node: Node, related_nodes: List[Node] = None,
                     edges: List[Edge] = None, graph_metadata: Dict[str, Any] = None) -> List[ValidationResult]:
        """Validate a single node comprehensively"""
        start_time = datetime.now()
        results = []
        
        try:
            # Check cache first
            cache_key = f"node_{node.id}_{hash(str(node.metadata))}"
            if cache_key in self.validation_cache and not self._should_revalidate(node):
                logger.debug(f"Using cached validation results for node {node.id}")
                return self.validation_cache[cache_key]
            
            validation_tasks = []
            
            # Schema validation (always first)
            if self.config.enable_schema:
                validation_tasks.append(("schema", self._validate_node_schema, node))
            
            # Semantic validation
            if self.config.enable_semantic:
                validation_tasks.append(("semantic", self._validate_node_semantic, node, related_nodes, edges, graph_metadata))
            
            # Business rules validation
            if self.config.enable_business_rules:
                validation_tasks.append(("business_rules", self._validate_node_business_rules, node, related_nodes, edges, graph_metadata))
            
            # Execute validations
            if self.config.enable_parallel and len(validation_tasks) > 1:
                results = self._execute_parallel_validations(validation_tasks)
            else:
                results = self._execute_sequential_validations(validation_tasks)
            
            # Filter results based on configuration
            results = self._filter_results(results)
            
            # Cache results
            self.validation_cache[cache_key] = results
            
            # Check if validation should block
            if self._should_block(results):
                logger.warning(f"Node {node.id} validation blocked due to errors")
            
            validation_time = (datetime.now() - start_time).total_seconds() * 1000
            logger.debug(f"Node {node.id} validation completed in {validation_time:.2f}ms with {len(results)} violations")
            
        except Exception as e:
            logger.error(f"Error during comprehensive validation of node {node.id}: {e}")
            results.append(ValidationResult(
                rule_id="comprehensive_validation_error",
                severity="ERROR",
                message=f"Comprehensive validation failed: {str(e)}",
                node_id=node.id,
                metadata={'error': str(e), 'validation_type': 'comprehensive'}
            ))
        
        return results
    
    def validate_edge(self, edge: Edge, source_node: Node = None, target_node: Node = None) -> List[ValidationResult]:
        """Validate a single edge comprehensively"""
        start_time = datetime.now()
        results = []
        
        try:
            # Schema validation for edge
            if self.config.enable_schema:
                schema_results = self.schema_validator.validate_edge(edge)
                results.extend(schema_results)
            
            # Semantic validation for edge relationships
            if self.config.enable_semantic and source_node and target_node:
                semantic_results = self.semantic_validator.validate_edge_semantics(edge, source_node, target_node)
                results.extend(semantic_results)
            
            # Filter results
            results = self._filter_results(results)
            
            validation_time = (datetime.now() - start_time).total_seconds() * 1000
            logger.debug(f"Edge {edge.id} validation completed in {validation_time:.2f}ms with {len(results)} violations")
            
        except Exception as e:
            logger.error(f"Error during comprehensive validation of edge {edge.id}: {e}")
            results.append(ValidationResult(
                rule_id="edge_validation_error",
                severity="ERROR",
                message=f"Edge validation failed: {str(e)}",
                node_id=edge.source_id,
                metadata={'error': str(e), 'edge_id': edge.id}
            ))
        
        return results
    
    def validate_graph(self, graph: SpecGraph) -> ValidationSummary:
        """Validate an entire spec graph comprehensively"""
        start_time = datetime.now()
        summary = ValidationSummary()
        all_results = []
        
        try:
            logger.info(f"Starting comprehensive graph validation with {len(graph.nodes)} nodes and {len(graph.edges)} edges")
            
            # Validate all nodes
            node_results = []
            if self.config.enable_parallel:
                node_results = self._validate_nodes_parallel(graph)
            else:
                node_results = self._validate_nodes_sequential(graph)
            
            all_results.extend(node_results)
            summary.total_nodes_validated = len(graph.nodes)
            
            # Validate all edges
            edge_results = []
            for edge in graph.edges:
                source_node = graph.get_node(edge.source_id)
                target_node = graph.get_node(edge.target_id)
                edge_validation = self.validate_edge(edge, source_node, target_node)
                edge_results.extend(edge_validation)
            
            all_results.extend(edge_results)
            summary.total_edges_validated = len(graph.edges)
            
            # Graph-level validations
            if self.config.enable_semantic:
                graph_semantic_results = self.semantic_validator.validate_graph_consistency(graph)
                all_results.extend(graph_semantic_results)
            
            # Compile summary
            summary.total_violations = len(all_results)
            summary.error_count = len([r for r in all_results if r.severity == "ERROR"])
            summary.warning_count = len([r for r in all_results if r.severity == "WARNING"])
            summary.info_count = len([r for r in all_results if r.severity == "INFO"])
            summary.validation_time_ms = (datetime.now() - start_time).total_seconds() * 1000
            summary.passed = summary.error_count == 0
            summary.blocked_by_errors = self._should_block(all_results)
            
            # Count applied rules
            applied_rules = set(r.rule_id for r in all_results)
            summary.validation_rules_applied = len(applied_rules)
            
            logger.info(f"Graph validation completed: {summary.total_violations} violations "
                       f"({summary.error_count} errors, {summary.warning_count} warnings) "
                       f"in {summary.validation_time_ms:.2f}ms")
            
        except Exception as e:
            logger.error(f"Error during comprehensive graph validation: {e}")
            summary.error_count += 1
            summary.total_violations += 1
            summary.blocked_by_errors = True
        
        self.last_validation_time = datetime.now()
        return summary
    
    def validate_incremental(self, changed_nodes: List[Node], changed_edges: List[Edge],
                           graph: SpecGraph) -> ValidationSummary:
        """Validate only changed elements and their dependencies"""
        start_time = datetime.now()
        summary = ValidationSummary()
        all_results = []
        
        try:
            logger.info(f"Starting incremental validation for {len(changed_nodes)} nodes and {len(changed_edges)} edges")
            
            # Find dependent nodes that need revalidation
            dependent_nodes = self._find_dependent_nodes(changed_nodes, graph)
            nodes_to_validate = list(set(changed_nodes + dependent_nodes))
            
            # Validate affected nodes
            for node in nodes_to_validate:
                related_nodes = graph.get_related_nodes(node.id)
                node_edges = graph.get_node_edges(node.id)
                node_results = self.validate_node(node, related_nodes, node_edges, graph.metadata)
                all_results.extend(node_results)
            
            summary.total_nodes_validated = len(nodes_to_validate)
            
            # Validate changed edges
            for edge in changed_edges:
                source_node = graph.get_node(edge.source_id)
                target_node = graph.get_node(edge.target_id)
                edge_results = self.validate_edge(edge, source_node, target_node)
                all_results.extend(edge_results)
            
            summary.total_edges_validated = len(changed_edges)
            
            # Compile summary
            summary.total_violations = len(all_results)
            summary.error_count = len([r for r in all_results if r.severity == "ERROR"])
            summary.warning_count = len([r for r in all_results if r.severity == "WARNING"])
            summary.info_count = len([r for r in all_results if r.severity == "INFO"])
            summary.validation_time_ms = (datetime.now() - start_time).total_seconds() * 1000
            summary.passed = summary.error_count == 0
            summary.blocked_by_errors = self._should_block(all_results)
            
            logger.info(f"Incremental validation completed: {summary.total_violations} violations in {summary.validation_time_ms:.2f}ms")
            
        except Exception as e:
            logger.error(f"Error during incremental validation: {e}")
            summary.error_count += 1
            summary.blocked_by_errors = True
        
        return summary
    
    def get_all_validation_rules(self) -> List[ValidationRule]:
        """Get all available validation rules from all validators"""
        all_rules = []
        
        try:
            # Schema validation rules
            if self.config.enable_schema:
                schema_rules = self.schema_validator.get_validation_rules()
                all_rules.extend(schema_rules)
            
            # Semantic validation rules
            if self.config.enable_semantic:
                semantic_rules = self.semantic_validator.get_validation_rules()
                all_rules.extend(semantic_rules)
            
            # Business rules
            if self.config.enable_business_rules:
                business_rules = self.business_rules_validator.get_validation_rules()
                all_rules.extend(business_rules)
            
            # Filter excluded rules
            if self.config.excluded_rules:
                all_rules = [rule for rule in all_rules if rule.id not in self.config.excluded_rules]
            
            logger.debug(f"Retrieved {len(all_rules)} validation rules")
            
        except Exception as e:
            logger.error(f"Error retrieving validation rules: {e}")
        
        return all_rules
    
    def update_config(self, new_config: ValidationConfig):
        """Update validation configuration"""
        self.config = new_config
        self.validation_cache.clear()  # Clear cache when config changes
        logger.info(f"Validation configuration updated to mode: {new_config.mode.value}")
    
    def clear_cache(self):
        """Clear validation cache"""
        self.validation_cache.clear()
        logger.debug("Validation cache cleared")
    
    # Private methods
    
    def _validate_node_schema(self, node: Node) -> List[ValidationResult]:
        """Validate node schema"""
        return self.schema_validator.validate_node(node)
    
    def _validate_node_semantic(self, node: Node, related_nodes: List[Node] = None,
                               edges: List[Edge] = None, graph_metadata: Dict[str, Any] = None) -> List[ValidationResult]:
        """Validate node semantics"""
        return self.semantic_validator.validate_node(node, related_nodes, edges, graph_metadata)
    
    def _validate_node_business_rules(self, node: Node, related_nodes: List[Node] = None,
                                    edges: List[Edge] = None, graph_metadata: Dict[str, Any] = None) -> List[ValidationResult]:
        """Validate node business rules"""
        return self.business_rules_validator.validate_node(node, related_nodes, edges, graph_metadata)
    
    def _execute_parallel_validations(self, validation_tasks: List[tuple]) -> List[ValidationResult]:
        """Execute validations in parallel"""
        results = []
        
        with ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
            future_to_task = {}
            
            for task in validation_tasks:
                task_name = task[0]
                task_func = task[1]
                task_args = task[2:]
                
                future = executor.submit(task_func, *task_args)
                future_to_task[future] = task_name
            
            for future in as_completed(future_to_task, timeout=self.config.timeout_seconds):
                task_name = future_to_task[future]
                try:
                    task_results = future.result()
                    results.extend(task_results)
                    
                    if self.config.fail_fast and any(r.severity == "ERROR" for r in task_results):
                        # Cancel remaining tasks
                        for remaining_future in future_to_task:
                            if not remaining_future.done():
                                remaining_future.cancel()
                        break
                        
                except Exception as e:
                    logger.error(f"Error in parallel validation task {task_name}: {e}")
                    results.append(ValidationResult(
                        rule_id=f"{task_name}_validation_error",
                        severity="ERROR",
                        message=f"{task_name} validation failed: {str(e)}",
                        node_id="unknown",
                        metadata={'error': str(e), 'task': task_name}
                    ))
        
        return results
    
    def _execute_sequential_validations(self, validation_tasks: List[tuple]) -> List[ValidationResult]:
        """Execute validations sequentially"""
        results = []
        
        for task in validation_tasks:
            task_name = task[0]
            task_func = task[1]
            task_args = task[2:]
            
            try:
                task_results = task_func(*task_args)
                results.extend(task_results)
                
                if self.config.fail_fast and any(r.severity == "ERROR" for r in task_results):
                    logger.debug(f"Fail-fast triggered after {task_name} validation")
                    break
                    
            except Exception as e:
                logger.error(f"Error in sequential validation task {task_name}: {e}")
                results.append(ValidationResult(
                    rule_id=f"{task_name}_validation_error",
                    severity="ERROR",
                    message=f"{task_name} validation failed: {str(e)}",
                    node_id="unknown",
                    metadata={'error': str(e), 'task': task_name}
                ))
                
                if self.config.fail_fast:
                    break
        
        return results
    
    def _validate_nodes_parallel(self, graph: SpecGraph) -> List[ValidationResult]:
        """Validate all nodes in parallel"""
        results = []
        
        with ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
            future_to_node = {}
            
            for node in graph.nodes:
                related_nodes = graph.get_related_nodes(node.id)
                node_edges = graph.get_node_edges(node.id)
                
                future = executor.submit(self.validate_node, node, related_nodes, node_edges, graph.metadata)
                future_to_node[future] = node.id
            
            for future in as_completed(future_to_node, timeout=self.config.timeout_seconds):
                node_id = future_to_node[future]
                try:
                    node_results = future.result()
                    results.extend(node_results)
                except Exception as e:
                    logger.error(f"Error validating node {node_id}: {e}")
                    results.append(ValidationResult(
                        rule_id="node_validation_error",
                        severity="ERROR",
                        message=f"Node validation failed: {str(e)}",
                        node_id=node_id,
                        metadata={'error': str(e)}
                    ))
        
        return results
    
    def _validate_nodes_sequential(self, graph: SpecGraph) -> List[ValidationResult]:
        """Validate all nodes sequentially"""
        results = []
        
        for node in graph.nodes:
            try:
                related_nodes = graph.get_related_nodes(node.id)
                node_edges = graph.get_node_edges(node.id)
                node_results = self.validate_node(node, related_nodes, node_edges, graph.metadata)
                results.extend(node_results)
                
                if self.config.fail_fast and any(r.severity == "ERROR" for r in node_results):
                    logger.debug(f"Fail-fast triggered after validating node {node.id}")
                    break
                    
            except Exception as e:
                logger.error(f"Error validating node {node.id}: {e}")
                results.append(ValidationResult(
                    rule_id="node_validation_error",
                    severity="ERROR",
                    message=f"Node validation failed: {str(e)}",
                    node_id=node.id,
                    metadata={'error': str(e)}
                ))
                
                if self.config.fail_fast:
                    break
        
        return results
    
    def _filter_results(self, results: List[ValidationResult]) -> List[ValidationResult]:
        """Filter validation results based on configuration"""
        filtered = []
        
        for result in results:
            # Skip excluded rules
            if result.rule_id in self.config.excluded_rules:
                continue
            
            # Filter by severity
            if result.severity == "ERROR":
                filtered.append(result)
            elif result.severity == "WARNING" and self.config.include_warnings:
                filtered.append(result)
            elif result.severity == "INFO" and self.config.include_info:
                filtered.append(result)
        
        return filtered
    
    def _should_block(self, results: List[ValidationResult]) -> bool:
        """Determine if validation results should block execution"""
        if self.config.mode == ValidationMode.ADVISORY:
            return False
        
        error_count = len([r for r in results if r.severity == "ERROR"])
        
        if self.config.mode == ValidationMode.STRICT:
            return error_count > 0
        elif self.config.mode == ValidationMode.LENIENT:
            return error_count > 0
        
        return False
    
    def _should_revalidate(self, node: Node) -> bool:
        """Determine if a node should be revalidated"""
        if not self.last_validation_time:
            return True
        
        if node.updated_at and node.updated_at > self.last_validation_time:
            return True
        
        return False
    
    def _find_dependent_nodes(self, changed_nodes: List[Node], graph: SpecGraph) -> List[Node]:
        """Find nodes that depend on changed nodes"""
        dependent_nodes = []
        changed_node_ids = {node.id for node in changed_nodes}
        
        # Find nodes that have relationships to changed nodes
        for edge in graph.edges:
            if edge.source_id in changed_node_ids:
                target_node = graph.get_node(edge.target_id)
                if target_node and target_node not in dependent_nodes:
                    dependent_nodes.append(target_node)
            elif edge.target_id in changed_node_ids:
                source_node = graph.get_node(edge.source_id)
                if source_node and source_node not in dependent_nodes:
                    dependent_nodes.append(source_node)
        
        return dependent_nodes