#!/usr/bin/env python3
"""
Entry point script for running the Lattice Mutation Engine.
This script properly handles imports and provides a clean way to start the engine.
"""

import sys
import os
from pathlib import Path

# Add the current directory to Python path to handle imports correctly
current_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(current_dir))

# Now import and run the main function
from main import main
import asyncio

if __name__ == "__main__":
    print("Starting Lattice Mutation Engine...")
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down Lattice Mutation Engine...")
    except Exception as e:
        print(f"Error running Lattice Mutation Engine: {e}")
        sys.exit(1)