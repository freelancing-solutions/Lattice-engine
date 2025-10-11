"""
Test utility for graph algorithms in the Lattice Mutation Engine.

This module provides comprehensive testing for:
- Dependency resolution and circular dependency detection
- Graph traversal algorithms (BFS, DFS, bidirectional)
- Topological sorting and layered analysis
"""

import logging
import sys
from typing import Dict, List, Any, Optional
from pathlib import Path

# Add the parent directory to the path for imports
sys.path.append(str(Path(__file__).parent.parent))

from graph.algorithms import (
    DependencyResolver, CircularDependencyError, DependencyType,
    GraphTraversal, TraversalStrategy,
    TopologicalSorter, SortAlgorithm
)
from models.spec_graph_models import Node, Edge, RelationshipType, NodeType
from repositories.in_memory_graph_repository import InMemoryGraphRepository

logger = logging.getLogger(__name__)


def create_test_repository() -> InMemoryGraphRepository:
    """Create a test repository with sample nodes and dependencies"""
    repo = InMemoryGraphRepository()
    
    # Create test nodes representing a software system
    nodes = [
        Node(id="database", node_type=NodeType.COMPONENT, name="Database Layer", 
             content="Core database functionality", metadata={"layer": "data"}),
        Node(id="api", node_type=NodeType.COMPONENT, name="API Layer",
             content="REST API endpoints", metadata={"layer": "service"}),
        Node(id="auth", node_type=NodeType.COMPONENT, name="Authentication",
             content="User authentication system", metadata={"layer": "service"}),
        Node(id="frontend", node_type=NodeType.COMPONENT, name="Frontend",
             content="User interface", metadata={"layer": "presentation"}),
        Node(id="logging", node_type=NodeType.COMPONENT, name="Logging Service",
             content="Application logging", metadata={"layer": "infrastructure"}),
        Node(id="config", node_type=NodeType.COMPONENT, name="Configuration",
             content="Application configuration", metadata={"layer": "infrastructure"}),
        Node(id="cache", node_type=NodeType.COMPONENT, name="Cache Layer",
             content="Caching functionality", metadata={"layer": "data"}),
        Node(id="queue", node_type=NodeType.COMPONENT, name="Message Queue",
             content="Async message processing", metadata={"layer": "infrastructure"}),
    ]
    
    # Add nodes to repository
    for node in nodes:
        repo.add_node(node)
    
    # Create dependency relationships
    dependencies = [
        # API depends on database, auth, logging, config
        ("api", "database", RelationshipType.DEPENDS_ON),
        ("api", "auth", RelationshipType.DEPENDS_ON),
        ("api", "logging", RelationshipType.DEPENDS_ON),
        ("api", "config", RelationshipType.DEPENDS_ON),
        
        # Frontend depends on API
        ("frontend", "api", RelationshipType.DEPENDS_ON),
        
        # Auth depends on database, config, logging
        ("auth", "database", RelationshipType.DEPENDS_ON),
        ("auth", "config", RelationshipType.DEPENDS_ON),
        ("auth", "logging", RelationshipType.DEPENDS_ON),
        
        # Cache depends on config
        ("cache", "config", RelationshipType.DEPENDS_ON),
        
        # API also uses cache
        ("api", "cache", RelationshipType.DEPENDS_ON),
        
        # Queue depends on config and logging
        ("queue", "config", RelationshipType.DEPENDS_ON),
        ("queue", "logging", RelationshipType.DEPENDS_ON),
        
        # API uses queue for async operations
        ("api", "queue", RelationshipType.DEPENDS_ON),
    ]
    
    # Add edges to repository
    for source, target, rel_type in dependencies:
        edge = Edge(
            id=f"{source}-{target}",
            source_id=source,
            target_id=target,
            relationship_type=rel_type,
            metadata={"dependency_type": "compile_time"}
        )
        repo.add_edge(edge)
    
    return repo


def create_cyclic_test_repository() -> InMemoryGraphRepository:
    """Create a test repository with circular dependencies"""
    repo = InMemoryGraphRepository()
    
    # Create nodes that will have circular dependencies
    nodes = [
        Node(id="a", node_type=NodeType.COMPONENT, name="Component A", content="Component A"),
        Node(id="b", node_type=NodeType.COMPONENT, name="Component B", content="Component B"),
        Node(id="c", node_type=NodeType.COMPONENT, name="Component C", content="Component C"),
        Node(id="d", node_type=NodeType.COMPONENT, name="Component D", content="Component D"),
    ]
    
    for node in nodes:
        repo.add_node(node)
    
    # Create circular dependencies: A -> B -> C -> A, and D -> A
    circular_deps = [
        ("a", "b", RelationshipType.DEPENDS_ON),
        ("b", "c", RelationshipType.DEPENDS_ON),
        ("c", "a", RelationshipType.DEPENDS_ON),  # Creates cycle
        ("d", "a", RelationshipType.DEPENDS_ON),
    ]
    
    for source, target, rel_type in circular_deps:
        edge = Edge(
            id=f"{source}-{target}",
            source_id=source,
            target_id=target,
            relationship_type=rel_type,
            metadata={}
        )
        repo.add_edge(edge)
    
    return repo


def test_dependency_resolver():
    """Test the dependency resolver functionality"""
    print("\n=== Testing Dependency Resolver ===")
    
    # Test with acyclic graph
    print("\n1. Testing with acyclic dependencies...")
    repo = create_test_repository()
    resolver = DependencyResolver(repo)
    resolver.build_dependency_graph()
    
    try:
        # Test dependency resolution
        dependencies = resolver.resolve_dependencies("frontend")
        print(f"Dependencies for 'frontend': {dependencies}")
        
        # Test build order
        build_order = resolver.get_build_order(["frontend", "api", "auth"])
        print(f"Build order for components: {build_order}")
        
        # Test impact analysis
        impact = resolver.analyze_change_impact("database")
        print(f"Impact of changing 'database': {impact}")
        
        print("✓ Dependency resolver tests passed")
        
    except CircularDependencyError as e:
        print(f"✗ Unexpected circular dependency: {e}")
        return False
    
    # Test with cyclic graph
    print("\n2. Testing with circular dependencies...")
    cyclic_repo = create_cyclic_test_repository()
    cyclic_resolver = DependencyResolver(cyclic_repo)
    cyclic_resolver.build_dependency_graph()
    
    try:
        dependencies = cyclic_resolver.resolve_dependencies("a")
        print(f"✗ Expected circular dependency error, but got: {dependencies}")
        return False
    except CircularDependencyError as e:
        print(f"✓ Correctly detected circular dependency: {e.cycles}")
    
    return True


def test_graph_traversal():
    """Test graph traversal algorithms"""
    print("\n=== Testing Graph Traversal ===")
    
    repo = create_test_repository()
    traversal = GraphTraversal(repo)
    traversal.build_graph_cache()
    
    # Test BFS
    print("\n1. Testing Breadth-First Search...")
    bfs_result = traversal.breadth_first_search("config", "frontend")
    print(f"BFS path from 'config' to 'frontend': {bfs_result.path}")
    print(f"BFS distance: {bfs_result.distance}")
    
    # Test DFS
    print("\n2. Testing Depth-First Search...")
    dfs_result = traversal.depth_first_search("config", "frontend")
    print(f"DFS path from 'config' to 'frontend': {dfs_result.path}")
    
    # Test shortest path
    print("\n3. Testing Shortest Path...")
    shortest = traversal.find_shortest_path("config", "frontend")
    print(f"Shortest path: {shortest.path}, distance: {shortest.distance}, cost: {shortest.cost}")
    
    # Test reachability
    print("\n4. Testing Reachability...")
    reachable = traversal.is_reachable("config", "frontend")
    print(f"Is 'frontend' reachable from 'config': {reachable}")
    
    # Test all paths
    print("\n5. Testing All Paths...")
    all_paths = traversal.find_all_paths("config", "frontend", max_length=6)
    print(f"All paths from 'config' to 'frontend' (max 6 hops): {len(all_paths)} paths found")
    for i, path in enumerate(all_paths[:3]):  # Show first 3 paths
        print(f"  Path {i+1}: {path.path} (cost: {path.cost})")
    
    # Test reachable nodes
    print("\n6. Testing Reachable Nodes...")
    reachable_nodes = traversal.get_reachable_nodes("config", max_depth=3)
    print(f"Nodes reachable from 'config' (max depth 3): {reachable_nodes}")
    
    # Test strongly connected components
    print("\n7. Testing Strongly Connected Components...")
    components = traversal.find_strongly_connected_components()
    print(f"Strongly connected components: {len(components)} found")
    for i, component in enumerate(components):
        print(f"  Component {i+1}: {component}")
    
    # Test traversal statistics
    print("\n8. Testing Traversal Statistics...")
    stats = traversal.get_traversal_stats()
    print(f"Graph statistics: {stats}")
    
    print("✓ Graph traversal tests completed")
    return True


def test_topological_sorting():
    """Test topological sorting algorithms"""
    print("\n=== Testing Topological Sorting ===")
    
    # Test with acyclic graph
    print("\n1. Testing with acyclic graph...")
    repo = create_test_repository()
    sorter = TopologicalSorter(repo)
    sorter.build_dependency_graph()
    
    # Test Kahn's algorithm
    print("\n  a. Kahn's Algorithm...")
    kahn_result = sorter.kahn_topological_sort()
    print(f"     Sorted order: {kahn_result.sorted_nodes}")
    print(f"     Is acyclic: {kahn_result.is_acyclic}")
    print(f"     Cycles found: {len(kahn_result.cycles)}")
    
    # Test DFS-based algorithm
    print("\n  b. DFS-based Algorithm...")
    dfs_result = sorter.dfs_topological_sort()
    print(f"     Sorted order: {dfs_result.sorted_nodes}")
    print(f"     Is acyclic: {dfs_result.is_acyclic}")
    
    # Test layered sorting
    print("\n  c. Layered Topological Sort...")
    layered_result = sorter.layered_topological_sort()
    print(f"     Is acyclic: {layered_result.is_acyclic}")
    print(f"     Number of layers: {len(layered_result.layers) if layered_result.layers else 0}")
    if layered_result.layers:
        for i, layer in enumerate(layered_result.layers):
            print(f"     Layer {i}: {layer}")
    
    # Test dependency levels
    print("\n  d. Dependency Levels...")
    levels = sorter.get_dependency_levels()
    print(f"     Dependency levels: {levels}")
    
    # Test critical path
    print("\n  e. Critical Path...")
    critical_path = sorter.get_critical_path()
    print(f"     Critical path: {critical_path}")
    
    # Test structural analysis
    print("\n  f. Dependency Structure Analysis...")
    analysis = sorter.analyze_dependency_structure()
    print(f"     Structure analysis: {analysis}")
    
    # Test with cyclic graph
    print("\n2. Testing with cyclic graph...")
    cyclic_repo = create_cyclic_test_repository()
    cyclic_sorter = TopologicalSorter(cyclic_repo)
    cyclic_sorter.build_dependency_graph()
    
    cyclic_result = cyclic_sorter.kahn_topological_sort()
    print(f"   Is acyclic: {cyclic_result.is_acyclic}")
    print(f"   Cycles detected: {cyclic_result.cycles}")
    
    # Test cycle detection
    print("\n  g. All Cycles Detection...")
    all_cycles = cyclic_sorter.detect_all_cycles()
    print(f"     All cycles found: {len(all_cycles)}")
    for i, cycle in enumerate(all_cycles):
        print(f"     Cycle {i+1}: {cycle.nodes} (type: {cycle.cycle_type})")
    
    print("✓ Topological sorting tests completed")
    return True


def test_integration():
    """Test integration between different algorithms"""
    print("\n=== Testing Algorithm Integration ===")
    
    repo = create_test_repository()
    
    # Initialize all algorithms
    resolver = DependencyResolver(repo)
    traversal = GraphTraversal(repo)
    sorter = TopologicalSorter(repo)
    
    # Build graphs
    resolver.build_dependency_graph()
    traversal.build_graph_cache()
    sorter.build_dependency_graph()
    
    print("\n1. Cross-validating results...")
    
    # Compare dependency resolution with topological sort
    try:
        frontend_deps = resolver.resolve_dependencies("frontend")
        topo_order = sorter.kahn_topological_sort().sorted_nodes
        
        print(f"Frontend dependencies: {frontend_deps}")
        print(f"Topological order: {topo_order}")
        
        # Verify that dependencies appear before frontend in topo order
        frontend_idx = topo_order.index("frontend")
        for dep in frontend_deps:
            if dep in topo_order:
                dep_idx = topo_order.index(dep)
                if dep_idx >= frontend_idx:
                    print(f"✗ Dependency ordering violation: {dep} should come before frontend")
                    return False
        
        print("✓ Dependency ordering is consistent with topological sort")
        
    except Exception as e:
        print(f"✗ Integration test failed: {e}")
        return False
    
    print("\n2. Testing path finding vs dependency resolution...")
    
    # Check if shortest path matches dependency chain
    shortest_path = traversal.find_shortest_path("config", "frontend")
    if shortest_path.exists:
        print(f"Shortest path from config to frontend: {shortest_path.path}")
        
        # Verify this represents a valid dependency chain
        for i in range(len(shortest_path.path) - 1):
            current = shortest_path.path[i]
            next_node = shortest_path.path[i + 1]
            
            # Check if there's a dependency relationship
            if next_node not in traversal.adjacency_list.get(current, set()):
                print(f"✗ Invalid dependency in path: {current} -> {next_node}")
                return False
        
        print("✓ Shortest path represents valid dependency chain")
    
    print("✓ Algorithm integration tests passed")
    return True


def run_performance_tests():
    """Run performance tests with larger graphs"""
    print("\n=== Performance Tests ===")
    
    # Create a larger test graph
    repo = InMemoryGraphRepository()
    
    # Create 100 nodes with random dependencies
    import random
    random.seed(42)  # For reproducible results
    
    nodes = []
    for i in range(100):
        node = Node(
            id=f"node_{i:03d}",
            node_type=NodeType.COMPONENT,
            name=f"Component {i}",
            content=f"Test component {i}",
            metadata={"level": i // 10}
        )
        nodes.append(node)
        repo.add_node(node)
    
    # Create dependencies (ensuring no cycles for this test)
    edges = []
    for i in range(100):
        # Each node depends on 1-3 previous nodes
        num_deps = random.randint(1, min(3, i))
        for _ in range(num_deps):
            dep_idx = random.randint(0, max(0, i - 1))
            if dep_idx != i:  # Avoid self-dependency
                edge = Edge(
                    id=f"edge_{i}_{dep_idx}",
                    source_id=f"node_{i:03d}",
                    target_id=f"node_{dep_idx:03d}",
                    relationship_type=RelationshipType.DEPENDS_ON,
                    metadata={}
                )
                edges.append(edge)
                repo.add_edge(edge)
    
    print(f"Created test graph with {len(nodes)} nodes and {len(edges)} edges")
    
    # Test performance of each algorithm
    import time
    
    # Dependency resolver performance
    start_time = time.time()
    resolver = DependencyResolver(repo)
    resolver.build_dependency_graph()
    build_time = time.time() - start_time
    
    start_time = time.time()
    try:
        deps = resolver.resolve_dependencies("node_099")
        resolve_time = time.time() - start_time
        print(f"Dependency resolver: build={build_time:.3f}s, resolve={resolve_time:.3f}s")
    except CircularDependencyError:
        print("Dependency resolver: detected circular dependency (expected for random graph)")
    
    # Graph traversal performance
    start_time = time.time()
    traversal = GraphTraversal(repo)
    traversal.build_graph_cache()
    build_time = time.time() - start_time
    
    start_time = time.time()
    bfs_result = traversal.breadth_first_search("node_000", "node_099")
    search_time = time.time() - start_time
    print(f"Graph traversal: build={build_time:.3f}s, BFS={search_time:.3f}s")
    
    # Topological sorting performance
    start_time = time.time()
    sorter = TopologicalSorter(repo)
    sorter.build_dependency_graph()
    build_time = time.time() - start_time
    
    start_time = time.time()
    topo_result = sorter.kahn_topological_sort()
    sort_time = time.time() - start_time
    print(f"Topological sorter: build={build_time:.3f}s, sort={sort_time:.3f}s")
    
    print("✓ Performance tests completed")
    return True


def main():
    """Run all graph algorithm tests"""
    print("Starting Graph Algorithms Test Suite...")
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    tests = [
        ("Dependency Resolver", test_dependency_resolver),
        ("Graph Traversal", test_graph_traversal),
        ("Topological Sorting", test_topological_sorting),
        ("Algorithm Integration", test_integration),
        ("Performance Tests", run_performance_tests),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            print(f"\n{'='*60}")
            result = test_func()
            results[test_name] = result
            if result:
                print(f"✓ {test_name} - PASSED")
            else:
                print(f"✗ {test_name} - FAILED")
        except Exception as e:
            print(f"✗ {test_name} - ERROR: {e}")
            results[test_name] = False
    
    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "PASSED" if result else "FAILED"
        print(f"{test_name:.<40} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print("❌ Some tests failed!")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)