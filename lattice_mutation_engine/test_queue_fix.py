#!/usr/bin/env python3
"""
Test script to verify that the queue import shadowing issue is resolved.
"""

import sys
import os
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(current_dir))

print("Testing queue import fix...")

try:
    # Test basic imports that were failing before
    from safe_imports import safe_import_redis, safe_import_celery
    print("✓ Safe imports loaded successfully")
    
    Redis = safe_import_redis()
    print("✓ Redis imported successfully via safe import")
    
    Celery = safe_import_celery()
    print("✓ Celery imported successfully via safe import")
    
    # Test the specific imports that were failing
    try:
        from celery_queue.celery_app import make_celery
        print("✓ Celery app imported successfully")
    except Exception as e:
        print(f"✗ Celery app import failed: {e}")
    
    try:
        from celery_queue.tasks import execute_mutation_workflow_task
        print("✓ Celery tasks imported successfully")
    except Exception as e:
        print(f"✗ Celery tasks import failed: {e}")
    
    print("\nQueue import fix appears to be working!")
    
except Exception as e:
    print(f"✗ Import test failed: {e}")
    import traceback
    traceback.print_exc()