#!/usr/bin/env python3
"""
Test script to verify that all imports work correctly.
"""

import sys
import os
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(current_dir))

print("Testing imports...")

try:
    # Test basic imports
    from config.settings import config as engine_config
    print("✓ config.settings imported successfully")
    
    from utils.logging import setup_logging
    print("✓ utils.logging imported successfully")
    
    # Test if config loads properly
    print(f"✓ Engine config loaded - Redis URL: {engine_config.redis_url}")
    print(f"✓ API Base URL: {engine_config.api_base_url}")
    print(f"✓ Website URL: {engine_config.website_url}")
    print(f"✓ User Dashboard URL: {engine_config.user_dashboard_url}")
    print(f"✓ Admin Dashboard URL: {engine_config.admin_dashboard_url}")
    print(f"✓ CORS Origins: {engine_config.cors_origins}")
    
    print("\nAll imports successful! You can now run the engine with:")
    print("python run.py")
    
except ImportError as e:
    print(f"✗ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)