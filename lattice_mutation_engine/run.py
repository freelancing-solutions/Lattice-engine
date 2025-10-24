#!/usr/bin/env python3
"""
Entry point script for running the Lattice Mutation Engine.
This script properly handles imports and provides a clean way to start the engine.
"""

import sys
import os
import logging
from pathlib import Path

# Add the project root to Python path for absolute imports
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Setup basic logging for the entry point
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting Lattice Mutation Engine API Server...")
    
    # Import uvicorn and the FastAPI app
    import uvicorn
    from src.api.endpoints import app
    
    # Get port from environment variable (Railway sets this)
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    logger.info(f"Starting server on {host}:{port}")
    
    try:
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("Shutting down Lattice Mutation Engine...")
    except Exception as e:
        logger.error(f"Error running Lattice Mutation Engine: {e}")
        sys.exit(1)