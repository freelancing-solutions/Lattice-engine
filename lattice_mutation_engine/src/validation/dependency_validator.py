"""
Dependency Validator

This module provides comprehensive dependency validation including circular dependency
detection, dependency graph analysis, and dependency constraint validation.
"""

from typing import Dict, List, Set, Tuple, Optional, Any
from collections import defaultdict, deque
from datetime import datetime
import networkx as nx

from src.models.spec_graph_models import Node, Edge, NodeType, RelationshipType, Status
from src.models.validation_models import ValidationResult, DependencyGraph
from src.validation.validation_rules import ValidationContext, RuleSeverity


class CircularDependencyError(Exception):
    """Exception raised when circular dependencies are detected"""
    
    def __init__(self, cycle_path: List[str], message: str = None):
        self.cycle_path = cycle_path
        self.message = message or f"Circular dependency detected: {' -> '.join(cycle_path)}"
        super().__init__(self.message)


class DependencyConstraintViolation(Exception):
    """Exception raised when dependency constraints are violated"""
    
    def __init__(self, constraint: str, violating_nodes: List[str], message: str = None):
        self.constraint = constraint
        self.violating_nodes = violating_nodes
        self.message = message or f"Dependency constraint '{constraint}' violated by nodes: {violating_nodes}"
        super().__init__(self.message)


class DependencyValidator:
    """Comprehensive dependency validator for spec graphs"""
    
    def __init__(self):
        self.dependency_constraints: Dict[str, Dict[str, Any]] = {}
        self.allowed_relationships: Dict[Tuple[NodeType, NodeType], List[RelationshipType]] = {}
        self._initialize_default_constraints()
    
    def add_dependency_constraint(self, constraint_id: str, constraint_config: Dict[str, Any]):
        """Add a dependency constraint"""
        self.dependency_constraints[constraint_id] = constraint_config
    
    def add_allowed_relationship(self, source_type: NodeType, target_type: NodeType, 
                               relationship_types: List[RelationshipType]):
        """Add allowed relationship types between node types"""
        self.allowed_relationships[(source_type, target_type)] = relationship_types
    
    def validate_dependencies(self, nodes: Dict[str, Node], edges: Dict[str, Edge]) -> ValidationResult:
        """Validate all dependencies in the graph"""
        errors = []
        warnings = []
        suggestions = []
        
        try:
            # Build dependency graph
            dependency_graph = self._build_dependency_graph(nodes, edges)
            
            # Check for circular dependencies
            circular_errors = self._detect_circular_dependencies(dependency_graph, nodes)
            errors.extend(circular_errors)
            
            # Validate dependency constraints
            constraint_errors, constraint_warnings = self._validate_dependency_constraints(
                dependency_graph, nodes, edges
            )
            errors.extend(constraint_errors)
            warnings.extend(constraint_warnings)
            
            # Validate relationship types
            relationship_errors, relationship_warnings = self._validate_relationship_types(nodes, edges)
            errors.extend(relationship_errors)
            warnings.extend(relationship_warnings)
            
            # Analyze dependency depth and complexity
            complexity_warnings, complexity_suggestions = self._analyze_dependency_complexity(
                dependency_graph, nodes
            )
            warnings.extend(complexity_warnings)
            suggestions.extend(complexity_suggestions)
            
            # Check for orphaned nodes
            orphan_warnings = self._detect_orphaned_nodes(dependency_graph, nodes)
            warnings.extend(orphan_warnings)
            
        except Exception as e:
            errors.append({
                'code': 'DEPENDENCY_VALIDATION_ERROR',
                'message': f'Dependency validation failed: {str(e)}',
                'severity': RuleSeverity.ERROR
            })
        
        return ValidationResult(
            spec_id="dependency_validation",
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
            validation_timestamp=datetime.utcnow()
        )
    
    def validate_node_dependencies(self, node_id: str, nodes: Dict[str, Node], 
                                 edges: Dict[str, Edge]) -> ValidationResult:
        """Validate dependencies for a specific node"""
        errors = []
        warnings = []
        suggestions = []
        
        if node_id not in nodes:
            errors.append({
                'code': 'NODE_NOT_FOUND',
                'message': f'Node {node_id} not found',
                'severity': RuleSeverity.ERROR
            })
            return ValidationResult(
                spec_id=node_id,
                is_valid=False,
                errors=errors,
                warnings=warnings,
                suggestions=suggestions,
                validation_timestamp=datetime.utcnow()
            )
        
        try:
            # Get node dependencies
            dependencies = self._get_node_dependencies(node_id, edges)
            dependents = self._get_node_dependents(node_id, edges)
            
            # Validate each dependency
            for dep_id in dependencies:
                if dep_id not in nodes:
                    errors.append({
                        'code': 'MISSING_DEPENDENCY',
                        'message': f'Node {node_id} depends on missing node {dep_id}',
                        'node_id': node_id,
                        'dependency_id': dep_id,
                        'severity': RuleSeverity.ERROR
                    })
                else:
                    # Check if dependency is in valid state
                    dep_node = nodes[dep_id]
                    if dep_node.status == Status.DEPRECATED:
                        warnings.append({
                            'code': 'DEPRECATED_DEPENDENCY',
                            'message': f'Node {node_id} depends on deprecated node {dep_id}',
                            'node_id': node_id,
                            'dependency_id': dep_id,
                            'severity': RuleSeverity.WARNING
                        })
            
            # Check for potential circular dependencies involving this node
            circular_paths = self._find_circular_paths_for_node(node_id, nodes, edges)
            for path in circular_paths:
                errors.append({
                    'code': 'CIRCULAR_DEPENDENCY',
                    'message': f'Circular dependency involving node {node_id}: {" -> ".join(path)}',
                    'node_id': node_id,
                    'cycle_path': path,
                    'severity': RuleSeverity.ERROR
                })
            
        except Exception as e:
            errors.append({
                'code': 'NODE_DEPENDENCY_VALIDATION_ERROR',
                'message': f'Node dependency validation failed: {str(e)}',
                'node_id': node_id,
                'severity': RuleSeverity.ERROR
            })
        
        return ValidationResult(
            spec_id=node_id,
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
            validation_timestamp=datetime.utcnow()
        )
    
    def _build_dependency_graph(self, nodes: Dict[str, Node], edges: Dict[str, Edge]) -> nx.DiGraph:
        """Build a NetworkX directed graph from nodes and edges"""
        graph = nx.DiGraph()
        
        # Add nodes
        for node_id, node in nodes.items():
            graph.add_node(node_id, **node.dict())
        
        # Add edges (only dependency relationships)
        dependency_relationships = {
            RelationshipType.DEPENDS_ON,
            RelationshipType.IMPLEMENTS,
            RelationshipType.REFINES,
            RelationshipType.CONSUMES
        }
        
        for edge in edges.values():
            if edge.type in dependency_relationships:
                graph.add_edge(edge.source_id, edge.target_id, **edge.dict())
        
        return graph
    
    def _detect_circular_dependencies(self, graph: nx.DiGraph, nodes: Dict[str, Node]) -> List[Dict[str, Any]]:
        """Detect circular dependencies using DFS"""
        errors = []
        
        try:
            # Find all strongly connected components with more than one node
            sccs = list(nx.strongly_connected_components(graph))
            
            for scc in sccs:
                if len(scc) > 1:  # Circular dependency found
                    # Find the actual cycle path
                    scc_list = list(scc)
                    subgraph = graph.subgraph(scc_list)
                    
                    try:
                        # Find a cycle in the strongly connected component
                        cycle = nx.find_cycle(subgraph, orientation='original')
                        cycle_path = [edge[0] for edge in cycle] + [cycle[-1][1]]
                        
                        errors.append({
                            'code': 'CIRCULAR_DEPENDENCY',
                            'message': f'Circular dependency detected: {" -> ".join(cycle_path)}',
                            'cycle_path': cycle_path,
                            'cycle_nodes': list(scc),
                            'severity': RuleSeverity.ERROR
                        })
                    except nx.NetworkXNoCycle:
                        # This shouldn't happen in an SCC with >1 node, but handle it
                        errors.append({
                            'code': 'CIRCULAR_DEPENDENCY',
                            'message': f'Circular dependency detected in nodes: {", ".join(scc_list)}',
                            'cycle_nodes': scc_list,
                            'severity': RuleSeverity.ERROR
                        })
        
        except Exception as e:
            errors.append({
                'code': 'CIRCULAR_DEPENDENCY_DETECTION_ERROR',
                'message': f'Error detecting circular dependencies: {str(e)}',
                'severity': RuleSeverity.ERROR
            })
        
        return errors
    
    def _validate_dependency_constraints(self, graph: nx.DiGraph, nodes: Dict[str, Node], 
                                       edges: Dict[str, Edge]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Validate dependency constraints"""
        errors = []
        warnings = []
        
        for constraint_id, constraint in self.dependency_constraints.items():
            try:
                constraint_errors, constraint_warnings = self._validate_single_constraint(
                    constraint_id, constraint, graph, nodes, edges
                )
                errors.extend(constraint_errors)
                warnings.extend(constraint_warnings)
            except Exception as e:
                errors.append({
                    'code': 'CONSTRAINT_VALIDATION_ERROR',
                    'message': f'Error validating constraint {constraint_id}: {str(e)}',
                    'constraint_id': constraint_id,
                    'severity': RuleSeverity.ERROR
                })
        
        return errors, warnings
    
    def _validate_single_constraint(self, constraint_id: str, constraint: Dict[str, Any],
                                  graph: nx.DiGraph, nodes: Dict[str, Node], 
                                  edges: Dict[str, Edge]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Validate a single dependency constraint"""
        errors = []
        warnings = []
        
        constraint_type = constraint.get('type')
        
        if constraint_type == 'max_depth':
            # Validate maximum dependency depth
            max_depth = constraint.get('max_depth', 10)
            depth_errors = self._validate_max_depth(graph, nodes, max_depth)
            errors.extend(depth_errors)
        
        elif constraint_type == 'no_cross_layer':
            # Validate no cross-layer dependencies
            layers = constraint.get('layers', {})
            cross_layer_errors = self._validate_no_cross_layer(graph, nodes, layers)
            errors.extend(cross_layer_errors)
        
        elif constraint_type == 'required_dependency':
            # Validate required dependencies
            required_deps = constraint.get('required_dependencies', {})
            required_errors = self._validate_required_dependencies(graph, nodes, required_deps)
            errors.extend(required_errors)
        
        elif constraint_type == 'forbidden_dependency':
            # Validate forbidden dependencies
            forbidden_deps = constraint.get('forbidden_dependencies', {})
            forbidden_errors = self._validate_forbidden_dependencies(graph, nodes, forbidden_deps)
            errors.extend(forbidden_errors)
        
        return errors, warnings
    
    def _validate_relationship_types(self, nodes: Dict[str, Node], 
                                   edges: Dict[str, Edge]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Validate relationship types between nodes"""
        errors = []
        warnings = []
        
        for edge in edges.values():
            if edge.source_id not in nodes or edge.target_id not in nodes:
                continue
            
            source_node = nodes[edge.source_id]
            target_node = nodes[edge.target_id]
            
            relationship_key = (source_node.type, target_node.type)
            
            if relationship_key in self.allowed_relationships:
                allowed_types = self.allowed_relationships[relationship_key]
                if edge.type not in allowed_types:
                    errors.append({
                        'code': 'INVALID_RELATIONSHIP_TYPE',
                        'message': f'Invalid relationship {edge.type} between {source_node.type} and {target_node.type}',
                        'edge_id': edge.id,
                        'source_id': edge.source_id,
                        'target_id': edge.target_id,
                        'relationship_type': edge.type,
                        'allowed_types': [rt.value for rt in allowed_types],
                        'severity': RuleSeverity.ERROR
                    })
            else:
                warnings.append({
                    'code': 'UNSPECIFIED_RELATIONSHIP',
                    'message': f'No relationship rules defined for {source_node.type} -> {target_node.type}',
                    'edge_id': edge.id,
                    'source_type': source_node.type,
                    'target_type': target_node.type,
                    'severity': RuleSeverity.WARNING
                })
        
        return errors, warnings
    
    def _analyze_dependency_complexity(self, graph: nx.DiGraph, 
                                     nodes: Dict[str, Node]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Analyze dependency complexity and suggest improvements"""
        warnings = []
        suggestions = []
        
        # Check for nodes with too many dependencies
        for node_id in graph.nodes():
            in_degree = graph.in_degree(node_id)
            out_degree = graph.out_degree(node_id)
            
            if in_degree > 10:  # Configurable threshold
                warnings.append({
                    'code': 'HIGH_DEPENDENCY_COUNT',
                    'message': f'Node {node_id} has {in_degree} dependencies, consider refactoring',
                    'node_id': node_id,
                    'dependency_count': in_degree,
                    'severity': RuleSeverity.WARNING
                })
                
                suggestions.append({
                    'code': 'REFACTOR_DEPENDENCIES',
                    'message': f'Consider breaking down node {node_id} or using dependency injection patterns',
                    'node_id': node_id
                })
            
            if out_degree > 15:  # Configurable threshold
                warnings.append({
                    'code': 'HIGH_DEPENDENT_COUNT',
                    'message': f'Node {node_id} is depended upon by {out_degree} nodes, consider stability',
                    'node_id': node_id,
                    'dependent_count': out_degree,
                    'severity': RuleSeverity.WARNING
                })
        
        # Check dependency depth
        try:
            longest_path_length = nx.dag_longest_path_length(graph)
            if longest_path_length > 8:  # Configurable threshold
                warnings.append({
                    'code': 'DEEP_DEPENDENCY_CHAIN',
                    'message': f'Dependency chain depth is {longest_path_length}, consider flattening',
                    'depth': longest_path_length,
                    'severity': RuleSeverity.WARNING
                })
        except nx.NetworkXError:
            # Graph has cycles, already handled in circular dependency detection
            pass
        
        return warnings, suggestions
    
    def _detect_orphaned_nodes(self, graph: nx.DiGraph, nodes: Dict[str, Node]) -> List[Dict[str, Any]]:
        """Detect nodes with no dependencies or dependents"""
        warnings = []
        
        for node_id in nodes.keys():
            if node_id not in graph.nodes():
                continue
            
            in_degree = graph.in_degree(node_id)
            out_degree = graph.out_degree(node_id)
            
            if in_degree == 0 and out_degree == 0:
                # Completely isolated node
                warnings.append({
                    'code': 'ORPHANED_NODE',
                    'message': f'Node {node_id} has no dependencies or dependents',
                    'node_id': node_id,
                    'severity': RuleSeverity.WARNING
                })
            elif out_degree == 0 and nodes[node_id].type not in [NodeType.TEST, NodeType.DOCUMENTATION]:
                # Leaf node that's not a test or documentation
                warnings.append({
                    'code': 'UNUSED_NODE',
                    'message': f'Node {node_id} is not used by any other nodes',
                    'node_id': node_id,
                    'severity': RuleSeverity.WARNING
                })
        
        return warnings
    
    def _get_node_dependencies(self, node_id: str, edges: Dict[str, Edge]) -> List[str]:
        """Get all nodes that the given node depends on"""
        dependencies = []
        dependency_relationships = {
            RelationshipType.DEPENDS_ON,
            RelationshipType.IMPLEMENTS,
            RelationshipType.REFINES,
            RelationshipType.CONSUMES
        }
        
        for edge in edges.values():
            if edge.source_id == node_id and edge.type in dependency_relationships:
                dependencies.append(edge.target_id)
        
        return dependencies
    
    def _get_node_dependents(self, node_id: str, edges: Dict[str, Edge]) -> List[str]:
        """Get all nodes that depend on the given node"""
        dependents = []
        dependency_relationships = {
            RelationshipType.DEPENDS_ON,
            RelationshipType.IMPLEMENTS,
            RelationshipType.REFINES,
            RelationshipType.CONSUMES
        }
        
        for edge in edges.values():
            if edge.target_id == node_id and edge.type in dependency_relationships:
                dependents.append(edge.source_id)
        
        return dependents
    
    def _find_circular_paths_for_node(self, node_id: str, nodes: Dict[str, Node], 
                                    edges: Dict[str, Edge]) -> List[List[str]]:
        """Find circular dependency paths involving a specific node"""
        graph = self._build_dependency_graph(nodes, edges)
        circular_paths = []
        
        if node_id not in graph.nodes():
            return circular_paths
        
        # Find strongly connected components containing this node
        sccs = list(nx.strongly_connected_components(graph))
        
        for scc in sccs:
            if node_id in scc and len(scc) > 1:
                # Find cycles in this SCC
                subgraph = graph.subgraph(scc)
                try:
                    cycles = nx.simple_cycles(subgraph)
                    for cycle in cycles:
                        if node_id in cycle:
                            circular_paths.append(cycle + [cycle[0]])  # Close the cycle
                except nx.NetworkXError:
                    pass
        
        return circular_paths
    
    def _validate_max_depth(self, graph: nx.DiGraph, nodes: Dict[str, Node], max_depth: int) -> List[Dict[str, Any]]:
        """Validate maximum dependency depth constraint"""
        errors = []
        
        try:
            # Calculate shortest path lengths from each node to all others
            for node_id in graph.nodes():
                try:
                    lengths = nx.single_source_shortest_path_length(graph, node_id)
                    max_length = max(lengths.values()) if lengths else 0
                    
                    if max_length > max_depth:
                        errors.append({
                            'code': 'MAX_DEPTH_EXCEEDED',
                            'message': f'Node {node_id} exceeds maximum dependency depth of {max_depth} (actual: {max_length})',
                            'node_id': node_id,
                            'actual_depth': max_length,
                            'max_allowed_depth': max_depth,
                            'severity': RuleSeverity.ERROR
                        })
                except nx.NetworkXError:
                    pass  # Skip nodes that can't reach others
        except Exception as e:
            errors.append({
                'code': 'DEPTH_VALIDATION_ERROR',
                'message': f'Error validating dependency depth: {str(e)}',
                'severity': RuleSeverity.ERROR
            })
        
        return errors
    
    def _validate_no_cross_layer(self, graph: nx.DiGraph, nodes: Dict[str, Node], 
                                layers: Dict[str, List[NodeType]]) -> List[Dict[str, Any]]:
        """Validate no cross-layer dependencies"""
        errors = []
        
        # Create layer mapping
        node_to_layer = {}
        for layer_name, node_types in layers.items():
            for node_id in graph.nodes():
                if node_id in nodes and nodes[node_id].type in node_types:
                    node_to_layer[node_id] = layer_name
        
        # Check edges for cross-layer violations
        for edge_data in graph.edges(data=True):
            source_id, target_id = edge_data[0], edge_data[1]
            
            source_layer = node_to_layer.get(source_id)
            target_layer = node_to_layer.get(target_id)
            
            if source_layer and target_layer and source_layer != target_layer:
                # Define allowed cross-layer dependencies
                allowed_cross_layer = {
                    ('presentation', 'business'): True,
                    ('business', 'data'): True,
                    ('presentation', 'data'): False,  # Skip layers not allowed
                }
                
                cross_layer_key = (source_layer, target_layer)
                if cross_layer_key in allowed_cross_layer and not allowed_cross_layer[cross_layer_key]:
                    errors.append({
                        'code': 'CROSS_LAYER_DEPENDENCY',
                        'message': f'Cross-layer dependency not allowed: {source_layer} -> {target_layer}',
                        'source_id': source_id,
                        'target_id': target_id,
                        'source_layer': source_layer,
                        'target_layer': target_layer,
                        'severity': RuleSeverity.ERROR
                    })
        
        return errors
    
    def _validate_required_dependencies(self, graph: nx.DiGraph, nodes: Dict[str, Node], 
                                      required_deps: Dict[str, List[str]]) -> List[Dict[str, Any]]:
        """Validate required dependencies"""
        errors = []
        
        for node_pattern, required_targets in required_deps.items():
            matching_nodes = [nid for nid in nodes.keys() if node_pattern in nid]
            
            for node_id in matching_nodes:
                if node_id not in graph.nodes():
                    continue
                
                successors = set(graph.successors(node_id))
                
                for required_target in required_targets:
                    if required_target not in successors:
                        errors.append({
                            'code': 'MISSING_REQUIRED_DEPENDENCY',
                            'message': f'Node {node_id} missing required dependency on {required_target}',
                            'node_id': node_id,
                            'required_dependency': required_target,
                            'severity': RuleSeverity.ERROR
                        })
        
        return errors
    
    def _validate_forbidden_dependencies(self, graph: nx.DiGraph, nodes: Dict[str, Node], 
                                       forbidden_deps: Dict[str, List[str]]) -> List[Dict[str, Any]]:
        """Validate forbidden dependencies"""
        errors = []
        
        for node_pattern, forbidden_targets in forbidden_deps.items():
            matching_nodes = [nid for nid in nodes.keys() if node_pattern in nid]
            
            for node_id in matching_nodes:
                if node_id not in graph.nodes():
                    continue
                
                successors = set(graph.successors(node_id))
                
                for forbidden_target in forbidden_targets:
                    if forbidden_target in successors:
                        errors.append({
                            'code': 'FORBIDDEN_DEPENDENCY',
                            'message': f'Node {node_id} has forbidden dependency on {forbidden_target}',
                            'node_id': node_id,
                            'forbidden_dependency': forbidden_target,
                            'severity': RuleSeverity.ERROR
                        })
        
        return errors
    
    def _initialize_default_constraints(self):
        """Initialize default dependency constraints"""
        
        # Maximum dependency depth constraint
        self.add_dependency_constraint('max_depth', {
            'type': 'max_depth',
            'max_depth': 10,
            'description': 'Maximum allowed dependency depth'
        })
        
        # Layer-based constraints
        self.add_dependency_constraint('no_cross_layer', {
            'type': 'no_cross_layer',
            'layers': {
                'presentation': [NodeType.CONTROLLER, NodeType.ROUTE_API],
                'business': [NodeType.MODULE, NodeType.AGENT],
                'data': [NodeType.MODEL, NodeType.TASK]
            },
            'description': 'Prevent cross-layer dependencies'
        })
        
        # Define allowed relationships
        self.add_allowed_relationship(NodeType.SPEC, NodeType.MODULE, [RelationshipType.IMPLEMENTS])
        self.add_allowed_relationship(NodeType.MODULE, NodeType.CONTROLLER, [RelationshipType.IMPLEMENTS])
        self.add_allowed_relationship(NodeType.CONTROLLER, NodeType.ROUTE_API, [RelationshipType.IMPLEMENTS])
        self.add_allowed_relationship(NodeType.MODULE, NodeType.MODEL, [RelationshipType.CONSUMES])
        self.add_allowed_relationship(NodeType.TEST, NodeType.MODULE, [RelationshipType.TESTED_BY])
        self.add_allowed_relationship(NodeType.AGENT, NodeType.GOAL, [RelationshipType.IMPLEMENTS])
        self.add_allowed_relationship(NodeType.SPEC, NodeType.CONSTRAINT, [RelationshipType.DEPENDS_ON])