#!/usr/bin/env python3
"""
Test script to verify the new URL configurations are properly loaded.
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path for imports
sys.path.append(str(Path(__file__).parent))

from config.settings import config

def test_url_configurations():
    """Test that all URL configurations are properly loaded."""
    print("Testing URL configurations...")
    
    # Test API Base URL
    print(f"API Base URL: {config.api_base_url}")
    assert config.api_base_url == "https://api.project-lattice.site", f"Expected https://api.project-lattice.site, got {config.api_base_url}"
    
    # Test Website URL
    print(f"Website URL: {config.website_url}")
    assert config.website_url == "https://www.project-lattice.site", f"Expected https://www.project-lattice.site, got {config.website_url}"
    
    # Test User Dashboard URL
    print(f"User Dashboard URL: {config.user_dashboard_url}")
    assert config.user_dashboard_url == "https://app.project-lattice.site", f"Expected https://app.project-lattice.site, got {config.user_dashboard_url}"
    
    # Test Admin Dashboard URL
    print(f"Admin Dashboard URL: {config.admin_dashboard_url}")
    assert config.admin_dashboard_url == "https://admin.project-lattice.site", f"Expected https://admin.project-lattice.site, got {config.admin_dashboard_url}"
    
    # Test CORS Origins
    print(f"CORS Origins: {config.cors_origins}")
    expected_origins = "http://localhost:3000,http://localhost:8000,https://api.project-lattice.site,https://www.project-lattice.site,https://app.project-lattice.site,https://admin.project-lattice.site"
    assert config.cors_origins == expected_origins, f"Expected {expected_origins}, got {config.cors_origins}"
    
    print("✅ All URL configurations are properly loaded!")
    print("\nConfiguration Summary:")
    print(f"  - API Base: {config.api_base_url}")
    print(f"  - Website: {config.website_url}")
    print(f"  - User Dashboard: {config.user_dashboard_url}")
    print(f"  - Admin Dashboard: {config.admin_dashboard_url}")
    print(f"  - CORS Origins: {len(config.cors_origins.split(','))} origins configured")

if __name__ == "__main__":
    try:
        test_url_configurations()
        print("\n🎉 All tests passed! URL configurations are ready for use.")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)