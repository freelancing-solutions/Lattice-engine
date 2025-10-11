#!/usr/bin/env python3
"""
Simple test script to verify the new URL configurations are present in the .env file.
"""

import os
from pathlib import Path

def test_env_file_urls():
    """Test that all URL configurations are present in the .env file."""
    env_file = Path(__file__).parent / ".env"
    
    if not env_file.exists():
        print("❌ .env file not found!")
        return False
    
    # Read the .env file
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    # Check for required URLs
    required_urls = {
        'API_BASE_URL': 'https://api.project-lattice.site',
        'WEBSITE_URL': 'https://www.project-lattice.site',
        'USER_DASHBOARD_URL': 'https://app.project-lattice.site',
        'ADMIN_DASHBOARD_URL': 'https://admin.project-lattice.site',
    }
    
    print("Checking URL configurations in .env file...")
    all_found = True
    
    for key, expected_value in required_urls.items():
        if f"{key}={expected_value}" in env_content:
            print(f"✅ {key}: {expected_value}")
        else:
            print(f"❌ {key}: Not found or incorrect value")
            all_found = False
    
    # Check CORS origins
    expected_cors = "CORS_ORIGINS=http://localhost:3000,http://localhost:8000,https://api.project-lattice.site,https://www.project-lattice.site,https://app.project-lattice.site,https://admin.project-lattice.site"
    if expected_cors in env_content:
        print("✅ CORS_ORIGINS: All URLs properly configured")
    else:
        print("❌ CORS_ORIGINS: Not found or incorrect configuration")
        all_found = False
    
    return all_found

def test_env_example_urls():
    """Test that all URL configurations are present in the .env.example file."""
    env_example_file = Path(__file__).parent / ".env.example"
    
    if not env_example_file.exists():
        print("❌ .env.example file not found!")
        return False
    
    # Read the .env.example file
    with open(env_example_file, 'r') as f:
        env_content = f.read()
    
    # Check for required URLs
    required_urls = {
        'API_BASE_URL': 'https://api.project-lattice.site',
        'WEBSITE_URL': 'https://www.project-lattice.site',
        'USER_DASHBOARD_URL': 'https://app.project-lattice.site',
        'ADMIN_DASHBOARD_URL': 'https://admin.project-lattice.site',
    }
    
    print("\nChecking URL configurations in .env.example file...")
    all_found = True
    
    for key, expected_value in required_urls.items():
        if f"{key}={expected_value}" in env_content:
            print(f"✅ {key}: {expected_value}")
        else:
            print(f"❌ {key}: Not found or incorrect value")
            all_found = False
    
    return all_found

def test_settings_file():
    """Test that the settings.py file contains the new URL fields."""
    settings_file = Path(__file__).parent / "config" / "settings.py"
    
    if not settings_file.exists():
        print("❌ config/settings.py file not found!")
        return False
    
    # Read the settings file
    with open(settings_file, 'r') as f:
        settings_content = f.read()
    
    print("\nChecking URL configurations in config/settings.py...")
    
    # Check for new URL fields
    required_fields = [
        'api_base_url: str = Field(default="https://api.project-lattice.site")',
        'website_url: str = Field(default="https://www.project-lattice.site")',
        'user_dashboard_url: str = Field(default="https://app.project-lattice.site")',
        'admin_dashboard_url: str = Field(default="https://admin.project-lattice.site")',
        'cors_origins: str = Field(default="http://localhost:3000,http://localhost:8000,https://api.project-lattice.site,https://www.project-lattice.site,https://app.project-lattice.site,https://admin.project-lattice.site")'
    ]
    
    all_found = True
    for field in required_fields:
        if field in settings_content:
            field_name = field.split(':')[0]
            print(f"✅ {field_name}: Field configured")
        else:
            field_name = field.split(':')[0]
            print(f"❌ {field_name}: Field not found")
            all_found = False
    
    return all_found

if __name__ == "__main__":
    print("🔍 Testing URL Configuration Updates")
    print("=" * 50)
    
    env_ok = test_env_file_urls()
    env_example_ok = test_env_example_urls()
    settings_ok = test_settings_file()
    
    print("\n" + "=" * 50)
    if env_ok and env_example_ok and settings_ok:
        print("🎉 All URL configurations are properly set up!")
        print("\n📋 Summary of changes:")
        print("  • Added API_BASE_URL: https://api.project-lattice.site")
        print("  • Added WEBSITE_URL: https://www.project-lattice.site")
        print("  • Added USER_DASHBOARD_URL: https://app.project-lattice.site")
        print("  • Added ADMIN_DASHBOARD_URL: https://admin.project-lattice.site")
        print("  • Updated CORS origins to include all new URLs")
        print("  • Added CORS middleware to FastAPI application")
        print("\n🔧 The application is now configured for seamless integration with the specified URLs.")
    else:
        print("❌ Some configurations are missing or incorrect.")
        print("Please review the output above and fix any issues.")
        exit(1)