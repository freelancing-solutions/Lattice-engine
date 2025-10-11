#!/usr/bin/env python3
"""
Entry point script for running the Lattice Mutation Engine.
This script properly handles imports and provides a clean way to start the engine.
"""

import sys
import os
import asyncio
import logging
from pathlib import Path

# Add the project root to Python path for absolute imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Now import and run the main function using absolute imports
from src.main import main

# Setup basic logging for the entry point
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting Lattice Mutation Engine...")
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Shutting down Lattice Mutation Engine...")
    except Exception as e:
        logger.error(f"Error running Lattice Mutation Engine: {e}")
        sys.exit(1)