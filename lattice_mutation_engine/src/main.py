import asyncio
import logging
from contextlib import asynccontextmanager
import sys
import os
from pathlib import Path

# Add project root to Python path for absolute imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.utils.logging import setup_logging
from src.approval.websocket_hub import WebSocketHub
from src.approval.approval_manager import ApprovalManager
from src.agents.orchestrator import AgentOrchestrator
from src.agents.agent_factory import AgentFactory
from src.models.agent_models import AgentRegistration, AgentCapability, AgentType
from src.config.settings import config as engine_config
from src.graph.repository import InMemoryGraphRepository
from src.graph.neo4j_repository import Neo4jGraphRepository
from src.graph.semantic_index import TfidfSemanticIndex
from src.tasks.manager import TaskManager
from src.spec_sync.daemon import SpecSyncDaemon
from src.core.dependencies import (
    container, 
    register_service_singleton, 
    service_lifespan
)

setup_logging()
logger = logging.getLogger(__name__)


async def init_engine():
    """
    Initialize the Lattice Mutation Engine with proper dependency injection.
    
    Returns:
        dict: Dictionary of initialized components for backward compatibility
    """
    logger.info("Initializing Lattice Mutation Engine...")
    
    # Initialize core services
    websocket_hub = WebSocketHub(redis_url=engine_config.redis_url or None)
    register_service_singleton("websocket_hub", websocket_hub)
    
    # Initialize mutation store and pass into approval manager for persistence
    from src.mutations.store import InMemoryMutationStore
    mutation_store = InMemoryMutationStore()
    register_service_singleton("mutation_store", mutation_store)
    
    approval_manager = ApprovalManager(websocket_hub, mutation_store=mutation_store)
    register_service_singleton("approval_manager", approval_manager)
    
    orchestrator = AgentOrchestrator(approval_manager, websocket_hub=websocket_hub)
    register_service_singleton("orchestrator", orchestrator)
    
    # Select graph backend
    if engine_config.graph_backend == "neo4j":
        try:
            graph_repo = Neo4jGraphRepository(
                uri=engine_config.graph_db_url,
                user=engine_config.graph_db_user or "neo4j",
                password=engine_config.graph_db_password or "password",
            )
            logger.info("Using Neo4jGraphRepository")
        except Exception as e:
            logger.error(f"Failed to initialize Neo4j backend: {e}. Falling back to in-memory repository.")
            graph_repo = InMemoryGraphRepository()
    else:
        graph_repo = InMemoryGraphRepository()
    
    register_service_singleton("graph", graph_repo)
    
    task_manager = TaskManager(websocket_hub)
    register_service_singleton("task_manager", task_manager)

    # Register PydanticAI agents with orchestrator
    AgentFactory.register_agents_with_orchestrator(orchestrator)

    # Start orchestrator
    await orchestrator.start()

    # Start spec sync daemon if enabled
    spec_sync_daemon = None
    if engine_config.spec_sync_enabled:
        try:
            spec_sync_daemon = SpecSyncDaemon(graph_repo, engine_config.spec_sync_dir)
            spec_sync_daemon.start()
            register_service_singleton("spec_sync_daemon", spec_sync_daemon)
            logger.info(f"Spec sync daemon started for directory: {engine_config.spec_sync_dir}")
        except Exception as e:
            logger.error(f"Failed to start spec sync daemon: {e}")
    
    logger.info("Lattice Mutation Engine core services initialized")

    # Initialize semantic index with factory (supports TF-IDF, Qdrant, etc.)
    semantic_index = None
    try:
        from src.graph.semantic_index_factory import EnhancedSemanticIndex
        semantic_index = EnhancedSemanticIndex(graph_repo)
        logger.info(f"Initialized semantic search with backend: {semantic_index.primary_index.__class__.__name__}")
    except Exception as e:
        logger.warning(f"Failed to initialize enhanced semantic index: {e}")
        # Fallback to basic TF-IDF
        try:
            semantic_index = TfidfSemanticIndex(graph_repo)
            logger.info("Fallback to TF-IDF semantic index")
        except Exception:
            semantic_index = None
            logger.error("No semantic search available")
    
    if semantic_index:
        register_service_singleton("semantic_index", semantic_index)

    # Wire index refresh callback into spec sync daemon
    if semantic_index and spec_sync_daemon:
        def refresh_index():
            semantic_index.refresh()
        spec_sync_daemon.index_rebuild_callback = refresh_index

    # Initialize the dependency injection container
    await container.initialize()
    
    logger.info("Lattice Mutation Engine fully initialized")

    # Return components for backward compatibility
    return {
        "orchestrator": orchestrator,
        "websocket_hub": websocket_hub,
        "approval_manager": approval_manager,
        "mutation_store": mutation_store,
        "graph_repo": graph_repo,
        "task_manager": task_manager,
        "semantic_index": semantic_index,
        "spec_sync_daemon": spec_sync_daemon,
        "config": engine_config,
    }


async def shutdown_engine(components):
    """
    Gracefully shutdown the Lattice Mutation Engine.
    
    Args:
        components: Dictionary of components (for backward compatibility)
    """
    logger.info("Shutting down Lattice Mutation Engine...")
    
    # Use dependency injection container for graceful shutdown
    await container.shutdown()
    
    # Fallback to manual shutdown for backward compatibility
    try:
        if "orchestrator" in components:
            await components["orchestrator"].stop()
    except Exception as e:
        logger.error(f"Error stopping orchestrator: {e}")
    
    try:
        daemon = components.get("spec_sync_daemon")
        if daemon:
            daemon.stop()
            logger.info("Spec sync daemon stopped")
    except Exception as e:
        logger.error(f"Error stopping spec sync daemon: {e}")
    
    logger.info("Lattice Mutation Engine shutdown complete")


async def main():
    components = await init_engine()
    try:
        while True:
            await asyncio.sleep(1)
    finally:
        await shutdown_engine(components)


if __name__ == "__main__":
    asyncio.run(main())