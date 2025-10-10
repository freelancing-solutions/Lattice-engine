"""
Safe import utilities to handle module shadowing issues.
"""

import sys
import os
import importlib
from typing import Any

def safe_import_redis() -> Any:
    """Safely import Redis, handling queue module shadowing."""
    # Create a clean import context
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Temporarily rename the local queue module to avoid shadowing
    queue_init = os.path.join(current_dir, 'queue', '__init__.py')
    queue_init_temp = os.path.join(current_dir, 'queue', '__init__.py.temp')
    
    try:
        # Rename the problematic file temporarily
        if os.path.exists(queue_init):
            os.rename(queue_init, queue_init_temp)
        
        # Now import redis
        from redis.asyncio import Redis
        return Redis
    finally:
        # Restore the original file
        if os.path.exists(queue_init_temp):
            os.rename(queue_init_temp, queue_init)

def safe_import_celery() -> Any:
    """Safely import Celery, handling queue module shadowing."""
    # Create a clean import context
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Temporarily rename the local queue module to avoid shadowing
    queue_init = os.path.join(current_dir, 'queue', '__init__.py')
    queue_init_temp = os.path.join(current_dir, 'queue', '__init__.py.temp')
    
    try:
        # Rename the problematic file temporarily
        if os.path.exists(queue_init):
            os.rename(queue_init, queue_init_temp)
        
        # Now import celery
        from celery import Celery
        return Celery
    finally:
        # Restore the original file
        if os.path.exists(queue_init_temp):
            os.rename(queue_init_temp, queue_init)