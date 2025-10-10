#!/usr/bin/env python3
"""
Diagnostic script to help identify import issues on the remote server.
"""

import sys
import os
from pathlib import Path

def diagnose_imports():
    """Diagnose import issues and provide solutions."""
    print("=== Lattice Mutation Engine Remote Diagnostic ===")
    print(f"Python version: {sys.version}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Script location: {__file__}")
    print(f"Python path: {sys.path}")
    
    # Check if queue directory exists
    current_dir = Path(__file__).parent
    queue_dir = current_dir / "queue"
    celery_queue_dir = current_dir / "celery_queue"
    
    print(f"\n=== Directory Check ===")
    print(f"Queue directory exists: {queue_dir.exists()}")
    print(f"Celery queue directory exists: {celery_queue_dir.exists()}")
    
    if queue_dir.exists():
        print("WARNING: Found 'queue' directory that shadows standard library!")
        print("Solution: Rename 'queue' to 'celery_queue'")
        
    # Try importing standard library queue
    try:
        import queue
        print(f"\n=== Import Test ===")
        print("✓ Standard library 'queue' imported successfully")
        print(f"  queue.Empty: {queue.Empty}")
    except ImportError as e:
        print(f"\n=== Import Error ===")
        print(f"✗ Failed to import standard library 'queue': {e}")
        
    # Check for Redis import issues
    try:
        import redis
        print("✓ Redis imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import redis: {e}")
        
    # Check Redis asyncio import specifically
    try:
        from redis.asyncio import Redis
        print("✓ Redis asyncio imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import redis.asyncio: {e}")
        
    # Check for pydantic_ai import issues
    try:
        import pydantic_ai
        print("✓ pydantic_ai imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import pydantic_ai: {e}")
        
    print("\n=== Recommendations ===")
    if queue_dir.exists():
        print("1. Rename 'queue' directory to 'celery_queue':")
        print("   mv queue celery_queue")
        
    print("2. Ensure all imports use absolute paths")
    print("3. Check that sys.path includes the project root")

if __name__ == "__main__":
    diagnose_imports()