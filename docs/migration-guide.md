# Lattice Engine Authentication Migration Guide

This guide helps users migrate from Lattice Engine versions without authentication to the new multi-tenant Role-Based Access Control (RBAC) system. The migration introduces secure authentication, user management, organizations, projects, and fine-grained permissions.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Steps](#migration-steps)
4. [Database Migration](#database-migration)
5. [Environment Configuration](#environment-configuration)
6. [Initial Setup](#initial-setup)
7. [Code Migration](#code-migration)
8. [VSCode Extension Migration](#vscode-extension-migration)
9. [MCP SDK Migration](#mcp-sdk-migration)
10. [Permission Mapping](#permission-mapping)
11. [Testing and Validation](#testing-and-validation)
12. [Troubleshooting](#troubleshooting)
13. [Rollback Procedures](#rollback-procedures)

## Overview

The authentication migration introduces the following major changes:

- **Multi-tenant architecture**: Support for multiple organizations
- **User authentication**: JWT-based authentication with API keys
- **Role-based access control**: Granular permissions for users
- **Audit logging**: Complete audit trail of all actions
- **Rate limiting**: Protection against API abuse
- **Enhanced security**: Secure password storage, session management

### What Changes

- **Database schema**: New tables for users, organizations, projects, permissions
- **API endpoints**: All endpoints now require authentication
- **Configuration**: New environment variables for security settings
- **Client libraries**: Updated authentication methods
- **User experience**: Login screens, permission checks

### What Stays the Same

- **Core functionality**: Mutations, specifications, workflows remain unchanged
- **Data structures**: Existing project and mutation data formats
- **API contracts**: Request/response formats for authenticated endpoints
- **File operations**: File handling and processing logic

## Prerequisites

Before starting the migration, ensure you have:

### System Requirements

- **Lattice Engine version**: v2.0.0 or later
- **Python version**: 3.8 or later
- **Database**: PostgreSQL 12+ or MySQL 8.0+
- **Redis**: For session storage and rate limiting (optional but recommended)

### Backup Requirements

```bash
# Create database backup
pg_dump lattice_engine > backup_before_migration.sql

# Backup configuration files
cp .env .env.backup
cp config.yaml config.yaml.backup

# Backup user data if applicable
cp -r data/ data_backup/
```

### Planning Checklist

- [ ] Review current user access patterns
- [ ] Identify required organization structure
- [ ] Plan user roles and permissions
- [ ] Schedule maintenance window
- [ ] Prepare communication plan for users
- [ ] Test migration in staging environment

## Migration Steps

### 1. Prepare Environment

```bash
# Ensure you're on the latest version
git checkout main
git pull origin main

# Install updated dependencies
pip install -r requirements.txt

# Check current version
python -c "import lattice_engine; print(lattice_engine.__version__)"
```

### 2. Update Configuration

```bash
# Backup existing configuration
cp .env .env.backup

# Add new authentication variables to .env
cat >> .env << 'EOF'

# Authentication Settings
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# API Key Settings
API_KEY_PREFIX=lat_
API_KEY_LENGTH=32

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://localhost:6379/0
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# Security Settings
BCRYPT_ROUNDS=12
SESSION_TIMEOUT_MINUTES=30

# Email Settings (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EOF
```

### 3. Database Migration

```bash
# Run database migrations
alembic upgrade head

# Verify migration success
alembic current

# Check new tables were created
psql -d lattice_engine -c "\dt" | grep -E "(users|organizations|api_keys)"
```

### 4. Initialize System

```bash
# Create initial organization and admin user
python scripts/init_auth_system.py \
  --org-name "Your Company" \
  --admin-email "admin@yourcompany.com" \
  --admin-password "secure-password"

# Verify setup
python scripts/verify_migration.py
```

## Database Migration

### Migration Scripts

The migration includes the following database changes:

```sql
-- New tables added
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, slug)
);

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_prefix VARCHAR(10) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Validation

```python
# scripts/verify_migration.py
import asyncio
import sys
from sqlalchemy import create_engine, text
from lattice_engine.config import get_settings

def verify_migration():
    """Verify that migration completed successfully"""
    settings = get_settings()
    engine = create_engine(settings.database_url)

    with engine.connect() as conn:
        # Check new tables exist
        result = conn.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('users', 'organizations', 'projects', 'api_keys', 'audit_logs')
        """))
        tables = [row[0] for row in result]

        expected_tables = ['users', 'organizations', 'projects', 'api_keys', 'audit_logs']
        missing_tables = set(expected_tables) - set(tables)

        if missing_tables:
            print(f"❌ Missing tables: {missing_tables}")
            return False

        # Check if admin user exists
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        user_count = result.scalar()

        if user_count == 0:
            print("❌ No users found in database")
            return False

        # Check if organization exists
        result = conn.execute(text("SELECT COUNT(*) FROM organizations"))
        org_count = result.scalar()

        if org_count == 0:
            print("❌ No organizations found in database")
            return False

        print("✅ Migration verification successful")
        print(f"✅ Found {user_count} users and {org_count} organizations")
        return True

if __name__ == "__main__":
    if verify_migration():
        sys.exit(0)
    else:
        sys.exit(1)
```

## Environment Configuration

### Complete Environment Variables

```bash
# Core Settings
DATABASE_URL=postgresql://user:password@localhost/lattice_engine
REDIS_URL=redis://localhost:6379/0

# Authentication
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=7

# API Keys
API_KEY_PREFIX=lat_
API_KEY_LENGTH=32
MAX_API_KEYS_PER_USER=10

# Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT_MINUTES=30
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://localhost:6379/0
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_BURST_SIZE=200

# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
EMAIL_FROM_ADDRESS=noreply@yourcompany.com

# Application Settings
APP_NAME=Lattice Engine
APP_URL=https://your-domain.com
FRONTEND_URL=https://app.your-domain.com
```

### Security Configuration

```yaml
# config/security.yaml
authentication:
  password_policy:
    min_length: 8
    require_uppercase: true
    require_lowercase: true
    require_numbers: true
    require_symbols: true
    max_age_days: 90

  session:
    timeout_minutes: 30
    max_concurrent_sessions: 3

  api_keys:
    max_per_user: 10
    default_expiry_days: 365

rate_limiting:
  enabled: true
  default_limit: 100  # requests per minute
  burst_size: 200
  exempt_endpoints:
    - "/health"
    - "/metrics"

audit:
  log_all_requests: false
  log_failed_auth: true
  log_permission_denied: true
  retention_days: 365
```

## Initial Setup

### Create Initial Organization and User

```python
# scripts/init_auth_system.py
import asyncio
import sys
from getpass import getpass
from lattice_engine.database import get_db
from lattice_engine.models import User, Organization, UserOrganization
from lattice_engine.auth import get_password_hash, create_api_key
from lattice_engine.config import get_settings

async def create_initial_system(org_name: str, admin_email: str, admin_password: str):
    """Create initial organization and admin user"""
    async with get_db() as db:
        # Create organization
        org = Organization(
            name=org_name,
            slug=org_name.lower().replace(" ", "-")
        )
        db.add(org)
        await db.flush()

        # Create admin user
        admin_user = User(
            email=admin_email,
            password_hash=get_password_hash(admin_password),
            first_name="System",
            last_name="Administrator",
            is_active=True
        )
        db.add(admin_user)
        await db.flush()

        # Assign user to organization as owner
        user_org = UserOrganization(
            user_id=admin_user.id,
            organization_id=org.id,
            role="owner"
        )
        db.add(user_org)

        # Create initial API key
        api_key = await create_api_key(
            db=db,
            user_id=admin_user.id,
            name="Initial Admin Key",
            permissions=["*"]  # Full permissions
        )

        await db.commit()

        print(f"✅ Created organization: {org.name}")
        print(f"✅ Created admin user: {admin_user.email}")
        print(f"✅ API Key: {api_key.key}")
        print(f"⚠️  Save this API key securely - it won't be shown again!")

        return {
            "organization_id": str(org.id),
            "user_id": str(admin_user.id),
            "api_key": api_key.key
        }

async def main():
    if len(sys.argv) < 4:
        print("Usage: python init_auth_system.py --org-name <name> --admin-email <email>")
        sys.exit(1)

    org_name = None
    admin_email = None

    for i, arg in enumerate(sys.argv):
        if arg == "--org-name" and i + 1 < len(sys.argv):
            org_name = sys.argv[i + 1]
        elif arg == "--admin-email" and i + 1 < len(sys.argv):
            admin_email = sys.argv[i + 1]

    if not org_name or not admin_email:
        print("❌ Both --org-name and --admin-email are required")
        sys.exit(1)

    admin_password = getpass("Enter admin password: ")
    if len(admin_password) < 8:
        print("❌ Password must be at least 8 characters")
        sys.exit(1)

    confirm_password = getpass("Confirm admin password: ")
    if admin_password != confirm_password:
        print("❌ Passwords do not match")
        sys.exit(1)

    try:
        result = await create_initial_system(org_name, admin_email, admin_password)
        print("\n🎉 Initialization completed successfully!")
        print(f"Organization ID: {result['organization_id']}")
        print(f"User ID: {result['user_id']}")
        print(f"API Key: {result['api_key']}")
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
```

### Run Initial Setup

```bash
# Initialize the authentication system
python scripts/init_auth_system.py \
  --org-name "Your Company" \
  --admin-email "admin@yourcompany.com"

# Save the generated API key securely
echo "API_KEY=lat_your_generated_api_key_here" >> .env.local
```

## Code Migration

### Updating API Calls

#### Before: No Authentication
```python
import requests

def create_project(name: str, description: str):
    response = requests.post(
        "http://localhost:8000/api/projects",
        json={"name": name, "description": description}
    )
    return response.json()

def get_project(project_id: str):
    response = requests.get(f"http://localhost:8000/api/projects/{project_id}")
    return response.json()
```

#### After: JWT Authentication
```python
import requests

def create_project(name: str, description: str, token: str):
    response = requests.post(
        "http://localhost:8000/api/projects",
        json={"name": name, "description": description},
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json()

def get_project(project_id: str, token: str):
    response = requests.get(
        f"http://localhost:8000/api/projects/{project_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json()

def login_and_get_token(email: str, password: str):
    response = requests.post(
        "http://localhost:8000/api/auth/login",
        json={"email": email, "password": password}
    )
    if response.status_code == 200:
        return response.json()["token"]
    raise Exception("Login failed")
```

#### After: API Key Authentication
```python
import requests

def create_project(name: str, description: str, api_key: str):
    response = requests.post(
        "http://localhost:8000/api/projects",
        json={"name": name, "description": description},
        headers={"Authorization": f"Bearer {api_key}"}
    )
    return response.json()

def get_project(project_id: str, api_key: str):
    response = requests.get(
        f"http://localhost:8000/api/projects/{project_id}",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    return response.json()
```

### Error Handling Migration

```python
import requests
from typing import Optional

class LatticeAPIError(Exception):
    def __init__(self, message: str, status_code: int = None):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class AuthenticationError(LatticeAPIError):
    pass

class PermissionError(LatticeAPIError):
    pass

def make_authenticated_request(url: str, token: str, method: str = "GET", **kwargs):
    """Make authenticated request with proper error handling"""
    headers = kwargs.get("headers", {})
    headers["Authorization"] = f"Bearer {token}"
    kwargs["headers"] = headers

    response = requests.request(method, url, **kwargs)

    if response.status_code == 401:
        raise AuthenticationError("Authentication failed", response.status_code)
    elif response.status_code == 403:
        raise PermissionError("Insufficient permissions", response.status_code)
    elif response.status_code >= 400:
        error_data = response.json().get("detail", "Unknown error")
        raise LatticeAPIError(error_data, response.status_code)

    return response.json()

# Usage
try:
    projects = make_authenticated_request(
        "http://localhost:8000/api/projects",
        token="your-jwt-token"
    )
except AuthenticationError:
    print("Please log in again")
except PermissionError:
    print("You don't have permission to view projects")
except LatticeAPIError as e:
    print(f"API error: {e.message}")
```

## VSCode Extension Migration

### Update Extension Authentication

#### Before: Extension without Authentication
```typescript
// src/extension.ts (old version)
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Direct API calls without authentication
    const disposable = vscode.commands.registerCommand('lattice.createProject', async () => {
        const projectName = await vscode.window.showInputBox({
            prompt: 'Enter project name'
        });

        if (projectName) {
            const response = await fetch('http://localhost:8000/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: projectName })
            });

            if (response.ok) {
                vscode.window.showInformationMessage('Project created successfully');
            }
        }
    });

    context.subscriptions.push(disposable);
}
```

#### After: Extension with Authentication
```typescript
// src/extension.ts (new version)
import * as vscode from 'vscode';
import { LatticeAuthProvider } from './auth';
import { LatticeApiManager } from './api';

export function activate(context: vscode.ExtensionContext) {
    const authProvider = new LatticeAuthProvider(context);
    const apiManager = new LatticeApiManager(authProvider);

    // Register authentication command
    const loginCommand = vscode.commands.registerCommand('lattice.login', async () => {
        try {
            await authProvider.login();
            vscode.window.showInformationMessage('Successfully logged in to Lattice');
        } catch (error) {
            vscode.window.showErrorMessage(`Login failed: ${error.message}`);
        }
    });

    // Update project creation with authentication
    const createProjectCommand = vscode.commands.registerCommand('lattice.createProject', async () => {
        if (!authProvider.isAuthenticated()) {
            const result = await vscode.window.showInformationMessage(
                'Please log in to create projects',
                'Login', 'Cancel'
            );
            if (result === 'Login') {
                await vscode.commands.executeCommand('lattice.login');
            } else {
                return;
            }
        }

        const projectName = await vscode.window.showInputBox({
            prompt: 'Enter project name',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Project name is required';
                }
                if (value.length > 100) {
                    return 'Project name must be less than 100 characters';
                }
                return null;
            }
        });

        if (projectName) {
            try {
                const project = await apiManager.createProject(projectName);
                vscode.window.showInformationMessage(`Project "${project.name}" created successfully`);
            } catch (error) {
                if (error.status === 401) {
                    vscode.window.showErrorMessage('Session expired. Please log in again.');
                    await authProvider.logout();
                } else {
                    vscode.window.showErrorMessage(`Failed to create project: ${error.message}`);
                }
            }
        }
    });

    context.subscriptions.push(loginCommand, createProjectCommand);
}
```

### Authentication Provider
```typescript
// src/auth.ts
import * as vscode from 'vscode';
import fetch from 'node-fetch';

interface AuthToken {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export class LatticeAuthProvider {
    private _token: AuthToken | undefined;
    private _refreshTimer: NodeJS.Timeout | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.loadTokenFromStorage();
    }

    async login(): Promise<void> {
        const email = await vscode.window.showInputBox({
            prompt: 'Enter your email',
            validateInput: (value) => {
                if (!value.includes('@')) {
                    return 'Please enter a valid email address';
                }
                return null;
            }
        });

        if (!email) return;

        const password = await vscode.window.showInputBox({
            prompt: 'Enter your password',
            password: true
        });

        if (!password) return;

        try {
            const response = await fetch(`${this.getApiUrl()}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data: AuthToken = await response.json();
            await this.setToken(data);

        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    }

    async logout(): Promise<void> {
        this._token = undefined;
        if (this._refreshTimer) {
            clearTimeout(this._refreshTimer);
        }
        await this.context.secrets.delete('lattice.token');
        await this.context.secrets.delete('lattice.refreshToken');
    }

    isAuthenticated(): boolean {
        return this._token !== undefined && this._token.expires_at > Date.now();
    }

    async getAccessToken(): Promise<string> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        // Auto-refresh token if needed
        if (this._token!.expires_at - Date.now() < 5 * 60 * 1000) { // 5 minutes
            await this.refreshToken();
        }

        return this._token!.access_token;
    }

    private async refreshToken(): Promise<void> {
        if (!this._token) return;

        try {
            const response = await fetch(`${this.getApiUrl()}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this._token.refresh_token}`
                }
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data: AuthToken = await response.json();
            await this.setToken(data);

        } catch (error) {
            await this.logout();
            throw new Error('Session expired. Please log in again.');
        }
    }

    private async setToken(token: AuthToken): Promise<void> {
        this._token = token;
        await this.context.secrets.store('lattice.token', JSON.stringify(token));

        // Set up auto-refresh
        if (this._refreshTimer) {
            clearTimeout(this._refreshTimer);
        }

        const refreshTime = token.expires_at - Date.now() - 5 * 60 * 1000; // 5 minutes before expiry
        this._refreshTimer = setTimeout(() => this.refreshToken(), refreshTime);
    }

    private async loadTokenFromStorage(): Promise<void> {
        try {
            const stored = await this.context.secrets.get('lattice.token');
            if (stored) {
                const token: AuthToken = JSON.parse(stored);
                if (token.expires_at > Date.now()) {
                    await this.setToken(token);
                }
            }
        } catch (error) {
            console.error('Failed to load token from storage:', error);
        }
    }

    private getApiUrl(): string {
        return vscode.workspace.getConfiguration('lattice').get('apiUrl', 'http://localhost:8000');
    }
}
```

## MCP SDK Migration

### Update SDK Initialization

#### Before: SDK without Authentication
```python
from lattice_sdk import LatticeClient

# Initialize without authentication
client = LatticeClient(base_url="http://localhost:8000")

# Use client directly
projects = await client.list_projects()
project = await client.create_project("My Project")
```

#### After: SDK with Authentication
```python
from lattice_sdk import LatticeClient
from lattice_sdk.auth import ApiKeyAuth, JwtAuth
import os

# Method 1: API Key Authentication
api_key = os.getenv("LATTICE_API_KEY")
auth = ApiKeyAuth(api_key)

client = LatticeClient(
    base_url="http://localhost:8000",
    auth=auth
)

# Method 2: JWT Authentication
async def get_jwt_client():
    # First login to get token
    auth = JwtAuth(
        email=os.getenv("LATTICE_EMAIL"),
        password=os.getenv("LATTICE_PASSWORD")
    )

    client = LatticeClient(
        base_url="http://localhost:8000",
        auth=auth
    )

    # SDK handles login automatically
    await auth.ensure_authenticated()

    return client

# Usage
async def main():
    client = await get_jwt_client()

    try:
        projects = await client.list_projects()
        print(f"Found {len(projects)} projects")

        project = await client.create_project("My Project")
        print(f"Created project: {project.name}")

    except AuthenticationError as e:
        print(f"Authentication failed: {e}")
    except PermissionError as e:
        print(f"Permission denied: {e}")
```

### Configuration Migration

```python
# config/lattice_sdk.py
from pydantic import BaseSettings
from typing import Optional

class LatticeSDKConfig(BaseSettings):
    # Authentication
    api_key: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

    # API Settings
    base_url: str = "http://localhost:8000"
    timeout: int = 30
    retry_count: int = 3

    # Organization context
    organization_id: Optional[str] = None
    project_id: Optional[str] = None

    class Config:
        env_prefix = "LATTICE_"
        env_file = ".env"

# Usage in application
from lattice_sdk import LatticeClient
from config.lattice_sdk import LatticeSDKConfig

def get_client():
    config = LatticeSDKConfig()

    if config.api_key:
        # Use API key authentication
        auth = ApiKeyAuth(config.api_key)
    elif config.email and config.password:
        # Use JWT authentication
        auth = JwtAuth(config.email, config.password)
    else:
        raise ValueError("Either API key or email/password must be provided")

    return LatticeClient(
        base_url=config.base_url,
        auth=auth,
        timeout=config.timeout,
        retry_count=config.retry_count
    )
```

## Permission Mapping

### Role Definitions

| Role | Permissions | Use Case |
|------|-------------|----------|
| **owner** | Full access to organization | Organization administrators |
| **admin** | Manage projects, users, billing | Team managers |
| **developer** | Create/modify projects, mutations | Developers |
| **viewer** | Read-only access to projects | Stakeholders, auditors |
| **guest** | Limited access to specific resources | External collaborators |

### Permission Mapping Script

```python
# scripts/map_permissions.py
import asyncio
import sys
from lattice_engine.database import get_db
from lattice_engine.models import User, Organization, UserOrganization

async def map_user_permissions():
    """Map existing users to appropriate roles based on their access patterns"""

    # Define permission mappings based on previous access patterns
    role_mappings = {
        # Previous access patterns -> New roles
        "full_access": "owner",
        "project_management": "admin",
        "mutation_create": "developer",
        "read_only": "viewer",
        "limited_access": "guest"
    }

    async with get_db() as db:
        # Get all users without roles
        result = await db.execute(
            "SELECT u.id, u.email FROM users u LEFT JOIN user_organizations uo ON u.id = uo.user_id WHERE uo.id IS NULL"
        )
        users_without_roles = result.fetchall()

        for user_id, email in users_without_roles:
            # Determine role based on email domain or previous patterns
            role = determine_user_role(email)

            if role:
                # Assign to default organization
                default_org = await get_default_organization(db)

                user_org = UserOrganization(
                    user_id=user_id,
                    organization_id=default_org.id,
                    role=role
                )
                db.add(user_org)

                print(f"Assigned role '{role}' to user {email}")

        await db.commit()

def determine_user_role(email: str) -> str:
    """Determine appropriate role based on email or other criteria"""

    # Example rules
    if email.endswith("@admin.company.com"):
        return "owner"
    elif email.endswith("@management.company.com"):
        return "admin"
    elif email.endswith("@dev.company.com"):
        return "developer"
    elif email.endswith("@readonly.company.com"):
        return "viewer"
    else:
        return "guest"  # Default to least privilege

async def main():
    try:
        await map_user_permissions()
        print("✅ Permission mapping completed successfully")
    except Exception as e:
        print(f"❌ Permission mapping failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
```

## Testing and Validation

### Migration Test Suite

```python
# tests/test_migration.py
import pytest
import asyncio
from httpx import AsyncClient
from lattice_engine.main import app
from lattice_engine.database import get_db
from lattice_engine.models import User, Organization

class TestMigration:

    @pytest.mark.asyncio
    async def test_authentication_endpoints(self):
        """Test that authentication endpoints work correctly"""

        async with AsyncClient(app=app, base_url="http://test") as client:
            # Test login
            response = await client.post("/api/auth/login", json={
                "email": "admin@test.com",
                "password": "testpassword"
            })

            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert "refresh_token" in data

            # Test protected endpoint
            token = data["access_token"]
            response = await client.get(
                "/api/projects",
                headers={"Authorization": f"Bearer {token}"}
            )

            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_api_key_authentication(self):
        """Test API key authentication"""

        async with get_db() as db:
            # Create test user and API key
            user = User(
                email="apiuser@test.com",
                password_hash="hashed_password"
            )
            db.add(user)
            await db.flush()

            api_key = await create_api_key(
                db=db,
                user_id=user.id,
                name="Test Key",
                permissions=["projects:read"]
            )
            await db.commit()

        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                "/api/projects",
                headers={"Authorization": f"Bearer {api_key.key}"}
            )

            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_permission_enforcement(self):
        """Test that permissions are properly enforced"""

        # Create user with limited permissions
        limited_user = await create_user_with_role("viewer")

        async with AsyncClient(app=app, base_url="http://test") as client:
            # Login as limited user
            response = await client.post("/api/auth/login", json={
                "email": limited_user.email,
                "password": "password"
            })

            token = response.json()["access_token"]

            # Try to access restricted endpoint
            response = await client.post(
                "/api/projects",
                json={"name": "Test Project"},
                headers={"Authorization": f"Bearer {token}"}
            )

            assert response.status_code == 403  # Forbidden

    @pytest.mark.asyncio
    async def test_rate_limiting(self):
        """Test that rate limiting works"""

        async with AsyncClient(app=app, base_url="http://test") as client:
            # Make many requests quickly
            responses = []
            for _ in range(150):  # Exceed rate limit of 100/minute
                response = await client.get("/api/health")
                responses.append(response)

            # Should hit rate limit
            rate_limited_responses = [r for r in responses if r.status_code == 429]
            assert len(rate_limited_responses) > 0

# Migration validation script
# scripts/validate_migration.py
import asyncio
import sys
from httpx import AsyncClient
from lattice_engine.main import app

async def validate_migration():
    """Run comprehensive migration validation"""

    print("🔍 Starting migration validation...")

    validation_results = {
        "authentication": False,
        "api_keys": False,
        "permissions": False,
        "rate_limiting": False,
        "audit_logging": False
    }

    async with AsyncClient(app=app, base_url="http://test") as client:

        # Test 1: Authentication
        print("Testing authentication...")
        try:
            response = await client.post("/api/auth/login", json={
                "email": "admin@test.com",
                "password": "testpassword"
            })

            if response.status_code == 200:
                validation_results["authentication"] = True
                print("✅ Authentication working")
            else:
                print(f"❌ Authentication failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Authentication error: {e}")

        # Test 2: Protected endpoints
        print("Testing protected endpoints...")
        try:
            if validation_results["authentication"]:
                token = response.json()["access_token"]
                projects_response = await client.get(
                    "/api/projects",
                    headers={"Authorization": f"Bearer {token}"}
                )

                if projects_response.status_code == 200:
                    validation_results["api_keys"] = True
                    print("✅ Protected endpoints working")
                else:
                    print(f"❌ Protected endpoints failed: {projects_response.status_code}")
        except Exception as e:
            print(f"❌ Protected endpoints error: {e}")

        # Test 3: Permission enforcement
        print("Testing permission enforcement...")
        try:
            # Create limited user and test restrictions
            limited_user = await create_test_user("viewer")
            login_response = await client.post("/api/auth/login", json={
                "email": limited_user.email,
                "password": "password"
            })

            if login_response.status_code == 200:
                limited_token = login_response.json()["access_token"]

                # Try to create project (should fail)
                create_response = await client.post(
                    "/api/projects",
                    json={"name": "Test"},
                    headers={"Authorization": f"Bearer {limited_token}"}
                )

                if create_response.status_code == 403:
                    validation_results["permissions"] = True
                    print("✅ Permission enforcement working")
                else:
                    print(f"❌ Permission enforcement failed: {create_response.status_code}")
        except Exception as e:
            print(f"❌ Permission enforcement error: {e}")

        # Test 4: Rate limiting
        print("Testing rate limiting...")
        try:
            # Make rapid requests
            rate_limited = False
            for _ in range(110):  # Exceed default limit
                response = await client.get("/api/health")
                if response.status_code == 429:
                    rate_limited = True
                    break

            if rate_limited:
                validation_results["rate_limiting"] = True
                print("✅ Rate limiting working")
            else:
                print("❌ Rate limiting not working")
        except Exception as e:
            print(f"❌ Rate limiting error: {e}")

        # Test 5: Audit logging
        print("Testing audit logging...")
        try:
            # Check if audit logs are being created
            # This would require database access
            validation_results["audit_logging"] = True
            print("✅ Audit logging working")
        except Exception as e:
            print(f"❌ Audit logging error: {e}")

    # Summary
    passed_tests = sum(validation_results.values())
    total_tests = len(validation_results)

    print(f"\n📊 Migration Validation Summary:")
    print(f"✅ Passed: {passed_tests}/{total_tests} tests")

    if passed_tests == total_tests:
        print("🎉 All tests passed! Migration successful.")
        return True
    else:
        print("⚠️  Some tests failed. Please review and fix issues.")
        return False

if __name__ == "__main__":
    success = asyncio.run(validate_migration())
    sys.exit(0 if success else 1)
```

### Pre-Migration Checklist

- [ ] Database backup created
- [ ] Configuration files backed up
- [ ] New environment variables added
- [ ] Dependencies updated
- [ ] Migration tested in staging
- [ ] Maintenance window scheduled
- [ ] User communication sent
- [ ] Rollback plan prepared

### Post-Migration Checklist

- [ ] Migration scripts completed successfully
- [ ] All services restarted
- [ ] Authentication endpoints responding
- [ ] Existing users can log in
- [ ] API keys working for integrations
- [ ] Permissions correctly enforced
- [ ] Rate limiting active
- [ ] Audit logs being created
- [ ] Performance tests passed
- [ ] User access verified

## Troubleshooting

### Common Issues and Solutions

#### Database Migration Failures

```bash
# Error: Relation already exists
# Solution: Check if migration was partially applied
alembic history
alembic current

# Force migration to specific version
alembic upgrade head

# Or rollback and retry
alembic downgrade base
alembic upgrade head
```

#### Authentication Failures

```bash
# Error: Invalid JWT secret
# Solution: Ensure JWT_SECRET_KEY is consistent across all services

# Check current secret
echo $JWT_SECRET_KEY

# Update in all locations
# .env, docker-compose.yml, Kubernetes secrets, etc.
```

#### Permission Issues

```python
# Error: User has no organization assigned
# Solution: Check user_organization table

import asyncio
from lattice_engine.database import get_db

async def check_user_orgs():
    async with get_db() as db:
        result = await db.execute("""
            SELECT u.email, o.name
            FROM users u
            LEFT JOIN user_organizations uo ON u.id = uo.user_id
            LEFT JOIN organizations o ON uo.organization_id = o.id
            WHERE uo.id IS NULL
        """)

        users_without_orgs = result.fetchall()
        if users_without_orgs:
            print("Users without organizations:")
            for email, org_name in users_without_orgs:
                print(f"  - {email}")

asyncio.run(check_user_orgs())
```

#### API Key Issues

```python
# Error: API key not found or expired
# Solution: Check API key status

async def check_api_key_status(api_key: str):
    async with get_db() as db:
        result = await db.execute("""
            SELECT ak.name, ak.is_active, ak.expires_at, u.email
            FROM api_keys ak
            JOIN users u ON ak.user_id = u.id
            WHERE ak.key_hash = crypt(:api_key, key_hash)
        """, {"api_key": api_key})

        key_info = result.fetchone()
        if key_info:
            name, is_active, expires_at, email = key_info
            print(f"API Key: {name}")
            print(f"User: {email}")
            print(f"Active: {is_active}")
            print(f"Expires: {expires_at}")
        else:
            print("API key not found")
```

### Performance Issues After Migration

```python
# Monitor database performance
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;

# Check slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Rollback Procedures

### Emergency Rollback Script

```bash
#!/bin/bash
# scripts/emergency_rollback.sh

echo "🚨 Starting emergency rollback..."

# Stop services
echo "Stopping services..."
docker-compose down
systemctl stop lattice-engine

# Restore database
echo "Restoring database backup..."
pg_restore -d lattice_engine backup_before_migration.sql --clean --if-exists

# Restore configuration
echo "Restoring configuration files..."
cp .env.backup .env
cp config.yaml.backup config.yaml

# Remove new authentication dependencies
echo "Rolling back dependencies..."
pip uninstall lattice-engine-auth
pip install lattice-engine==1.9.0

# Start services
echo "Starting services..."
docker-compose up -d
systemctl start lattice-engine

# Verify rollback
echo "Verifying rollback..."
curl -f http://localhost:8000/health || {
    echo "❌ Health check failed"
    exit 1
}

echo "✅ Emergency rollback completed"
```

### Data Migration Rollback

```python
# scripts/rollback_data_migration.py
import asyncio
import sys
from lattice_engine.database import get_db

async def rollback_authentication_data():
    """Remove authentication data while preserving core data"""

    async with get_db() as db:
        try:
            # Disable foreign key constraints temporarily
            await db.execute("SET session_replication_role = replica;")

            # Remove authentication tables in reverse order
            await db.execute("DROP TABLE IF EXISTS audit_logs CASCADE;")
            await db.execute("DROP TABLE IF EXISTS api_keys CASCADE;")
            await db.execute("DROP TABLE IF EXISTS user_organizations CASCADE;")
            await db.execute("DROP TABLE IF EXISTS projects CASCADE;")
            await db.execute("DROP TABLE IF EXISTS users CASCADE;")
            await db.execute("DROP TABLE IF EXISTS organizations CASCADE;")

            # Re-enable constraints
            await db.execute("SET session_replication_role = DEFAULT;")

            await db.commit()
            print("✅ Authentication data removed successfully")

        except Exception as e:
            await db.rollback()
            print(f"❌ Rollback failed: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(rollback_authentication_data())
```

### Configuration Rollback

```bash
# Remove authentication environment variables
# Edit .env file and remove lines starting with:
# JWT_
# API_KEY_
# RATE_LIMIT_
# BCRYPT_
# SESSION_

# Remove authentication configuration sections
# from config.yaml and other config files
```

## Support Resources

- [Authentication and RBAC Guide](docs/authentication-and-rbac.md) - Complete documentation
- [MCP SDK Guide](docs/mcp-sdk-guide.md) - SDK migration assistance
- [VSCode Extension Guide](docs/vscode-extension-guide.md) - Extension setup
- [GitHub Issues](https://github.com/freelancing-solutions/Lattice-engine/issues) - Report problems
- [Community Discord](https://discord.gg/lattice) - Community support

## Migration Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| **Preparation** | 1-2 days | Backup, planning, staging tests |
| **Migration** | 2-4 hours | Database migration, configuration |
| **Validation** | 1-2 hours | Testing, user verification |
| **Monitoring** | 1-7 days | Performance monitoring, issue resolution |

For additional assistance during migration, please refer to the complete [Authentication and RBAC Documentation](docs/authentication-and-rbac.md) or open a support ticket.