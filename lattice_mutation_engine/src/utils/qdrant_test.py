"""
Qdrant Integration Test Utility for the Lattice Mutation Engine.
This module provides utilities to test and demonstrate Qdrant-based semantic search.
"""

import logging
import asyncio
from typing import List, Dict, Any

from lattice_mutation_engine.models.spec_graph_models import Node, NodeType, Status
from lattice_mutation_engine.graph.semantic_index_factory import SemanticIndexFactory, EnhancedSemanticIndex
from lattice_mutation_engine.graph.repository import InMemoryGraphRepository
from lattice_mutation_engine.config.settings import config

logger = logging.getLogger(__name__)


def create_sample_nodes() -> List[Node]:
    """Create sample nodes for testing semantic search"""
    return [
        Node(
            id="api-auth",
            name="Authentication API",
            type=NodeType.API,
            description="REST API for user authentication and authorization",
            content="Handles login, logout, token refresh, and user session management",
            spec_source="auth-api.md",
            metadata={"version": "1.0", "team": "security"},
            status=Status.ACTIVE
        ),
        Node(
            id="user-service",
            name="User Management Service",
            type=NodeType.SERVICE,
            description="Microservice for managing user profiles and preferences",
            content="CRUD operations for user data, profile updates, and preference management",
            spec_source="user-service.md",
            metadata={"version": "2.1", "team": "backend"},
            status=Status.ACTIVE
        ),
        Node(
            id="payment-gateway",
            name="Payment Processing Gateway",
            type=NodeType.SERVICE,
            description="Service for handling payment transactions and billing",
            content="Integrates with Stripe, PayPal, and other payment providers",
            spec_source="payment-gateway.md",
            metadata={"version": "1.5", "team": "payments"},
            status=Status.ACTIVE
        ),
        Node(
            id="notification-system",
            name="Notification System",
            type=NodeType.SYSTEM,
            description="Real-time notification delivery system",
            content="Handles email, SMS, push notifications, and in-app messages",
            spec_source="notifications.md",
            metadata={"version": "3.0", "team": "platform"},
            status=Status.ACTIVE
        ),
        Node(
            id="analytics-dashboard",
            name="Analytics Dashboard",
            type=NodeType.COMPONENT,
            description="Business intelligence dashboard for metrics and reporting",
            content="Visualizes KPIs, user behavior, and system performance metrics",
            spec_source="analytics.md",
            metadata={"version": "2.0", "team": "data"},
            status=Status.DRAFT
        )
    ]


def test_backend_availability():
    """Test which semantic search backends are available"""
    print("=== Testing Backend Availability ===")
    
    backends = SemanticIndexFactory.get_available_backends()
    print(f"Available backends: {backends}")
    
    for backend in backends:
        print(f"✓ {backend.upper()} is available")
    
    return backends


def test_semantic_search_basic(repo: InMemoryGraphRepository):
    """Test basic semantic search functionality"""
    print("\n=== Testing Basic Semantic Search ===")
    
    # Create enhanced semantic index
    semantic_index = EnhancedSemanticIndex(repo)
    
    # Test queries
    test_queries = [
        "authentication login user",
        "payment billing transaction",
        "notification email message",
        "dashboard analytics metrics",
        "service microservice backend"
    ]
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        results = semantic_index.search(query, top_k=3)
        
        if results:
            for i, node in enumerate(results, 1):
                print(f"  {i}. {node.name} ({node.type.value})")
                print(f"     {node.description}")
        else:
            print("  No results found")
    
    return semantic_index


def test_semantic_search_with_filters(repo: InMemoryGraphRepository):
    """Test semantic search with metadata filters (Qdrant only)"""
    print("\n=== Testing Semantic Search with Filters ===")
    
    semantic_index = EnhancedSemanticIndex(repo)
    
    # Test with team filter
    query = "service management"
    filters = {"team": "backend"}
    
    print(f"Query: '{query}' with filter: {filters}")
    
    # Check if primary backend supports filters
    if hasattr(semantic_index.primary_index, '_is_available') and semantic_index.primary_index._is_available():
        try:
            results = semantic_index.search(query, top_k=5, filters=filters)
            if results:
                for i, node in enumerate(results, 1):
                    team = node.metadata.get("team", "unknown")
                    print(f"  {i}. {node.name} (team: {team})")
            else:
                print("  No results found with filters")
        except Exception as e:
            print(f"  Filter search failed: {e}")
    else:
        print("  Filters not supported by current backend")


def test_index_refresh(repo: InMemoryGraphRepository):
    """Test index refresh functionality"""
    print("\n=== Testing Index Refresh ===")
    
    semantic_index = EnhancedSemanticIndex(repo)
    
    # Add a new node
    new_node = Node(
        id="cache-service",
        name="Redis Cache Service",
        type=NodeType.SERVICE,
        description="High-performance caching layer using Redis",
        content="Provides distributed caching for improved application performance",
        spec_source="cache-service.md",
        metadata={"version": "1.0", "team": "infrastructure"},
        status=Status.ACTIVE
    )
    
    repo.create_node(new_node)
    print("Added new node: Redis Cache Service")
    
    # Refresh index
    semantic_index.refresh()
    print("Index refreshed")
    
    # Search for the new node
    results = semantic_index.search("redis cache performance", top_k=3)
    found_new_node = any(node.id == "cache-service" for node in results)
    
    if found_new_node:
        print("✓ New node found in search results after refresh")
    else:
        print("✗ New node not found in search results")


def test_search_statistics(semantic_index: EnhancedSemanticIndex):
    """Test search statistics and monitoring"""
    print("\n=== Testing Search Statistics ===")
    
    # Perform some searches to generate stats
    queries = ["auth", "payment", "notification", "invalid query xyz"]
    
    for query in queries:
        semantic_index.search(query, top_k=2)
    
    # Get statistics
    stats = semantic_index.get_stats()
    
    print("Search Statistics:")
    for key, value in stats.items():
        if isinstance(value, dict):
            print(f"  {key}:")
            for sub_key, sub_value in value.items():
                print(f"    {sub_key}: {sub_value}")
        else:
            print(f"  {key}: {value}")


async def run_comprehensive_test():
    """Run comprehensive Qdrant integration tests"""
    print("🚀 Starting Qdrant Integration Tests")
    print("=" * 50)
    
    # Test backend availability
    backends = test_backend_availability()
    
    # Create test repository with sample data
    repo = InMemoryGraphRepository()
    sample_nodes = create_sample_nodes()
    
    for node in sample_nodes:
        repo.create_node(node)
    
    print(f"\nCreated test repository with {len(sample_nodes)} nodes")
    
    # Test basic semantic search
    semantic_index = test_semantic_search_basic(repo)
    
    # Test filters (if Qdrant is available)
    if "qdrant" in backends:
        test_semantic_search_with_filters(repo)
    
    # Test index refresh
    test_index_refresh(repo)
    
    # Test statistics
    test_search_statistics(semantic_index)
    
    print("\n" + "=" * 50)
    print("✅ Qdrant Integration Tests Completed")


def main():
    """Main function for running tests"""
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run tests
    asyncio.run(run_comprehensive_test())


if __name__ == "__main__":
    main()