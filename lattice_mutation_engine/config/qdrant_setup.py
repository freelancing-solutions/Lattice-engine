"""
Qdrant Setup and Configuration Utility for the Lattice Mutation Engine.
This module provides utilities to set up and configure Qdrant for production use.
"""

import logging
import os
import time
from typing import Dict, Any, Optional

try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams
    import docker
except ImportError as e:
    QdrantClient = None
    docker = None
    logging.warning(f"Qdrant setup dependencies not available: {e}")

from .settings import config

logger = logging.getLogger(__name__)


class QdrantSetup:
    """Utility class for setting up Qdrant"""
    
    def __init__(self):
        self.client = None
        self.docker_client = None
        
    def check_dependencies(self) -> Dict[str, bool]:
        """Check if required dependencies are available"""
        return {
            "qdrant_client": QdrantClient is not None,
            "docker": docker is not None,
            "sentence_transformers": self._check_sentence_transformers()
        }
    
    def _check_sentence_transformers(self) -> bool:
        """Check if sentence-transformers is available"""
        try:
            import sentence_transformers
            return True
        except ImportError:
            return False
    
    def start_qdrant_docker(self, port: int = 6333, persist_data: bool = True) -> bool:
        """
        Start Qdrant using Docker.
        
        Args:
            port: Port to expose Qdrant on
            persist_data: Whether to persist data to disk
            
        Returns:
            True if successful, False otherwise
        """
        if not docker:
            logger.error("Docker client not available")
            return False
        
        try:
            self.docker_client = docker.from_env()
            
            # Check if container already exists
            container_name = "qdrant-lattice"
            try:
                existing_container = self.docker_client.containers.get(container_name)
                if existing_container.status == "running":
                    logger.info(f"Qdrant container '{container_name}' is already running")
                    return True
                else:
                    logger.info(f"Starting existing Qdrant container '{container_name}'")
                    existing_container.start()
                    return True
            except docker.errors.NotFound:
                pass
            
            # Create new container
            volumes = {}
            if persist_data:
                data_dir = os.path.join(os.getcwd(), "qdrant_data")
                os.makedirs(data_dir, exist_ok=True)
                volumes[data_dir] = {"bind": "/qdrant/storage", "mode": "rw"}
            
            logger.info(f"Creating new Qdrant container '{container_name}'")
            container = self.docker_client.containers.run(
                "qdrant/qdrant:latest",
                name=container_name,
                ports={6333: port},
                volumes=volumes,
                detach=True,
                remove=False
            )
            
            # Wait for container to be ready
            logger.info("Waiting for Qdrant to be ready...")
            for i in range(30):  # Wait up to 30 seconds
                try:
                    test_client = QdrantClient(url=f"http://localhost:{port}")
                    test_client.get_collections()
                    logger.info("Qdrant is ready!")
                    return True
                except Exception:
                    time.sleep(1)
            
            logger.error("Qdrant failed to start within timeout")
            return False
            
        except Exception as e:
            logger.error(f"Failed to start Qdrant Docker container: {e}")
            return False
    
    def test_connection(self, url: Optional[str] = None) -> bool:
        """Test connection to Qdrant"""
        test_url = url or config.qdrant_url
        
        try:
            client = QdrantClient(url=test_url)
            collections = client.get_collections()
            logger.info(f"Successfully connected to Qdrant at {test_url}")
            logger.info(f"Found {len(collections.collections)} collections")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Qdrant at {test_url}: {e}")
            return False
    
    def create_collection(self, collection_name: Optional[str] = None) -> bool:
        """Create the Lattice collection in Qdrant"""
        if not QdrantClient:
            logger.error("Qdrant client not available")
            return False
        
        collection_name = collection_name or config.qdrant_collection_name
        
        try:
            client = QdrantClient(url=config.qdrant_url)
            
            # Check if collection already exists
            try:
                existing = client.get_collection(collection_name)
                logger.info(f"Collection '{collection_name}' already exists with {existing.points_count} points")
                return True
            except Exception:
                pass
            
            # Create new collection
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=config.embedding_dimension,
                    distance=Distance.COSINE
                )
            )
            
            logger.info(f"Created collection '{collection_name}' with dimension {config.embedding_dimension}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
            return False
    
    def setup_complete_environment(self, start_docker: bool = True) -> Dict[str, Any]:
        """Set up complete Qdrant environment"""
        results = {
            "dependencies": self.check_dependencies(),
            "docker_started": False,
            "connection_test": False,
            "collection_created": False,
            "ready": False
        }
        
        # Check dependencies
        deps = results["dependencies"]
        if not all(deps.values()):
            missing = [k for k, v in deps.items() if not v]
            logger.error(f"Missing dependencies: {missing}")
            return results
        
        # Start Docker container if requested
        if start_docker:
            results["docker_started"] = self.start_qdrant_docker()
            if not results["docker_started"]:
                return results
        
        # Test connection
        results["connection_test"] = self.test_connection()
        if not results["connection_test"]:
            return results
        
        # Create collection
        results["collection_created"] = self.create_collection()
        if not results["collection_created"]:
            return results
        
        results["ready"] = True
        logger.info("✅ Qdrant environment setup complete!")
        return results
    
    def get_status(self) -> Dict[str, Any]:
        """Get current Qdrant status"""
        status = {
            "dependencies_available": self.check_dependencies(),
            "connection_ok": False,
            "collection_exists": False,
            "collection_info": None
        }
        
        # Test connection
        try:
            client = QdrantClient(url=config.qdrant_url)
            collections = client.get_collections()
            status["connection_ok"] = True
            
            # Check collection
            try:
                collection_info = client.get_collection(config.qdrant_collection_name)
                status["collection_exists"] = True
                status["collection_info"] = {
                    "name": config.qdrant_collection_name,
                    "points_count": collection_info.points_count,
                    "vector_size": collection_info.config.params.vectors.size,
                    "distance": collection_info.config.params.vectors.distance.name
                }
            except Exception:
                pass
                
        except Exception as e:
            status["connection_error"] = str(e)
        
        return status


def main():
    """Main function for interactive setup"""
    print("🚀 Qdrant Setup for Lattice Mutation Engine")
    print("=" * 50)
    
    setup = QdrantSetup()
    
    # Check current status
    print("Checking current status...")
    status = setup.get_status()
    
    print("\nDependencies:")
    for dep, available in status["dependencies_available"].items():
        status_icon = "✅" if available else "❌"
        print(f"  {status_icon} {dep}")
    
    if not all(status["dependencies_available"].values()):
        print("\n❌ Missing dependencies. Please install:")
        print("  pip install qdrant-client sentence-transformers docker")
        return
    
    print(f"\nConnection: {'✅' if status['connection_ok'] else '❌'}")
    print(f"Collection: {'✅' if status['collection_exists'] else '❌'}")
    
    if status["collection_info"]:
        info = status["collection_info"]
        print(f"  Points: {info['points_count']}")
        print(f"  Vector size: {info['vector_size']}")
        print(f"  Distance: {info['distance']}")
    
    # Offer to set up if not ready
    if not (status["connection_ok"] and status["collection_exists"]):
        print("\n🔧 Setting up Qdrant environment...")
        results = setup.setup_complete_environment()
        
        if results["ready"]:
            print("✅ Setup completed successfully!")
        else:
            print("❌ Setup failed. Check logs for details.")
    else:
        print("\n✅ Qdrant is already configured and ready!")


if __name__ == "__main__":
    main()