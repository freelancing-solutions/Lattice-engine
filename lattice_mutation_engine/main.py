import asyncio
import logging
from contextlib import asynccontextmanager
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.logging import setup_logging
from approval.websocket_hub import WebSocketHub
from approval.approval_manager import ApprovalManager
from agents.orchestrator import AgentOrchestrator
from agents.agent_factory import AgentFactory
from models.agent_models import AgentRegistration, AgentCapability, AgentType
from config.settings import config as engine_config
from graph.repository import InMemoryGraphRepository
from graph.neo4j_repository import Neo4jGraphRepository
from graph.semantic_index import TfidfSemanticIndex
from tasks.manager import TaskManager
from spec_sync.daemon import SpecSyncDaemon


setup_logging()
logger = logging.getLogger(__name__)


async def init_engine():
    websocket_hub = WebSocketHub(redis_url=engine_config.redis_url or None)
    # Initialize mutation store and pass into approval manager for persistence
    from mutations.store import InMemoryMutationStore
    mutation_store = InMemoryMutationStore()
    approval_manager = ApprovalManager(websocket_hub, mutation_store=mutation_store)
    orchestrator = AgentOrchestrator(approval_manager, websocket_hub=websocket_hub)
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
    task_manager = TaskManager(websocket_hub)

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
            logger.info(f"Spec sync daemon started for directory: {engine_config.spec_sync_dir}")
        except Exception as e:
            logger.error(f"Failed to start spec sync daemon: {e}")
    logger.info("Lattice Mutation Engine started")

    # Initialize semantic index with factory (supports TF-IDF, Qdrant, etc.)
    try:
        from graph.semantic_index_factory import EnhancedSemanticIndex
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

    # Wire index refresh callback into spec sync daemon
    if semantic_index and spec_sync_daemon:
        def refresh_index():
            semantic_index.refresh()
        spec_sync_daemon.index_rebuild_callback = refresh_index

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
    try:
        await components["orchestrator"].stop()
    except Exception:
        pass
    try:
        daemon = components.get("spec_sync_daemon")
        if daemon:
            daemon.stop()
            logger.info("Spec sync daemon stopped")
    except Exception:
        pass
    logger.info("Lattice Mutation Engine stopped")


async def main():
    components = await init_engine()
    try:
        while True:
            await asyncio.sleep(1)
    finally:
        await shutdown_engine(components)


if __name__ == "__main__":
    asyncio.run(main())