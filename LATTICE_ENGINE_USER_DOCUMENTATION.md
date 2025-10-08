# Lattice Engine User Documentation

## Table of Contents
1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [Installation & Setup](#installation--setup)
4. [Developer Tools](#developer-tools)
5. [API Documentation](#api-documentation)
6. [Workflow Guide](#workflow-guide)
7. [Troubleshooting](#troubleshooting)
8. [Support](#support)

---

## Getting Started

### Welcome to Lattice Engine

Lattice Engine is an AI-powered development platform that revolutionizes how you build, deploy, and scale software applications. Our platform combines intelligent mutation management, spec-driven development, and collaborative code evolution to accelerate your development workflow.

### Key Features

- **Agentic Coding**: AI-powered code generation and intelligent automation
- **Spec-Driven Development**: Living specifications that evolve with your codebase
- **Intelligent Mutations**: Smart change tracking with AI-powered risk assessment
- **Seamless Integration**: Works with your existing tools and workflows

### Quick Start

1. **Install the tools** - Choose your preferred development environment
2. **Initialize your project** - Set up Lattice in your existing codebase
3. **Create your first specification** - Define your application behavior
4. **Propose changes** - Start using intelligent mutations
5. **Deploy with confidence** - Let Lattice handle the deployment process

---

## Core Concepts

### Mutations

Mutations are tracked code changes that go through an intelligent approval workflow:

- **Risk Assessment**: AI analyzes changes for potential impact
- **Smart Routing**: Changes are routed to appropriate reviewers based on type and complexity
- **Automated Testing**: Tests run automatically before deployment
- **Audit Trail**: Every change is tracked and documented

### Specifications

Living specifications define your application behavior:

- **Version Control**: Specs are versioned alongside your code
- **Real-time Sync**: Specifications stay in sync with your codebase
- **Collaborative Editing**: Team members can contribute to specifications
- **Automated Validation**: Specs are validated against your code automatically

### Approval Workflow

Intelligent approval system that streamlines code review:

- **Risk-based Routing**: Low-risk changes may be auto-approved
- **Team Collaboration**: Appropriate team members are notified for review
- **Automated Checks**: Tests and security scans run automatically
- **Deployment Automation**: Approved changes are deployed automatically

---

## Installation & Setup

### Prerequisites

- Node.js 16+ or Python 3.8+
- Git version control
- VSCode (recommended) or your preferred IDE
- Account with Lattice Engine (free tier available)

### Installation Options

#### Option 1: JavaScript/TypeScript SDK

```bash
# Install the JavaScript SDK
npm install @lattice/engine

# Install the CLI globally
npm install -g @lattice/cli

# Initialize a new project
npx lattice init
```

#### Option 2: Python SDK

```bash
# Install from PyPI
pip install lattice-engine

# Install with async support
pip install lattice-engine[async]

# Install CLI tools
pip install lattice-cli
```

#### Option 3: VSCode Extension

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Lattice Engine"
4. Click Install

### Initial Setup

After installation, configure your environment:

```bash
# Authenticate with Lattice
lattice auth login

# Configure your project
lattice project init

# Set up your first specification
lattice spec create --name "user-auth" --template "authentication"
```

---

## Developer Tools

### CLI Tools

The Lattice CLI provides powerful command-line tools for automation:

#### Basic Commands

```bash
# Propose a new mutation
lattice mutation propose --spec user-auth

# List pending mutations
lattice mutation list --status pending

# Review a specific mutation
lattice mutation review <mutation-id>

# Deploy approved changes
lattice deploy --environment production

# Sync specifications with codebase
lattice sync specs
```

#### Advanced Commands

```bash
# Batch operations
lattice mutation batch --file changes.json

# Risk assessment
lattice risk assess --changes ./src/

# Generate reports
lattice report generate --type weekly --format json

# CI/CD integration
lattice ci validate --pipeline github-actions
```

### VSCode Extension

The VSCode extension provides native IDE integration:

#### Features

- **IntelliSense Support**: Auto-complete for Lattice APIs
- **Real-time Validation**: Live code checking as you type
- **Integrated Debugging**: Debug mutations directly in your IDE
- **Git Integration**: Seamless Git workflow integration
- **Live Preview**: See changes before committing

#### Usage

```typescript
// Auto-complete for Lattice APIs
lattice.mutation.create({
  spec: "user-auth",
  changes: {
    type: "security-enhancement",
    description: "Add password hashing"
  }
})

// Real-time validation shows issues as you type
if (spec.isValid()) {
  deploy();
}
```

### MCP Servers

Model Context Protocol (MCP) servers provide real-time synchronization:

#### Configuration

```json
{
  "mcp": {
    "servers": {
      "lattice-specs": {
        "command": "mcp-server-lattice",
        "args": ["--project", "./"],
        "env": {
          "LATTICE_API_KEY": "your-api-key"
        }
      }
    }
  }
}
```

#### Features

- **Real-time Sync**: Live synchronization across multiple clients
- **Event Streaming**: Real-time updates for mutations and specifications
- **State Management**: Centralized state management for your project
- **Multi-client Support**: Multiple developers can work simultaneously

---

## API Documentation

### REST API

#### Authentication

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

#### Mutations

```http
# Create a new mutation
POST /api/v1/mutations
Content-Type: application/json
Authorization: Bearer <token>

{
  "spec_id": "user-auth",
  "changes": {
    "type": "security-enhancement",
    "description": "Add password hashing",
    "code_diff": "..."
  },
  "priority": "medium"
}

# List mutations
GET /api/v1/mutations?status=pending&limit=10

# Get mutation details
GET /api/v1/mutations/{mutation_id}

# Approve/reject mutation
POST /api/v1/mutations/{mutation_id}/review
{
  "action": "approve",
  "comment": "Looks good, approved for deployment"
}
```

#### Specifications

```http
# Create specification
POST /api/v1/specs
{
  "name": "user-auth",
  "description": "User authentication specification",
  "content": {
    "requirements": [
      "Passwords must be hashed using bcrypt",
      "All auth events must be logged"
    ]
  }
}

# Get specification
GET /api/v1/specs/{spec_id}

# Update specification
PUT /api/v1/specs/{spec_id}
{
  "version": "2.1",
  "content": {
    "requirements": [...]
  }
}
```

### JavaScript SDK

```javascript
import { Lattice } from '@lattice/engine';

// Initialize client
const lattice = new Lattice({
  apiKey: 'your-api-key',
  projectId: 'your-project-id'
});

// Create mutation
const mutation = await lattice.mutations.create({
  specId: 'user-auth',
  changes: {
    type: 'security-enhancement',
    description: 'Add password hashing',
    code: updatedCode
  }
});

// Review mutation
const review = await lattice.mutations.review(mutation.id, {
  action: 'approve',
  comment: 'Security improvements approved'
});

// Deploy changes
const deployment = await lattice.deploy.create({
  mutationIds: [mutation.id],
  environment: 'production'
});
```

### Python SDK

```python
import lattice
import asyncio

# Initialize client
client = lattice.Lattice(
    api_key='your-api-key',
    project_id='your-project-id'
)

# Create mutation
mutation = await client.mutations.create(
    spec_id='user-auth',
    changes={
        'type': 'security-enhancement',
        'description': 'Add password hashing',
        'code': updated_code
    }
)

# Review mutation
review = await client.mutations.review(
    mutation.id,
    action='approve',
    comment='Security improvements approved'
)

# Deploy changes
deployment = await client.deploy.create(
    mutation_ids=[mutation.id],
    environment='production'
)
```

---

## Workflow Guide

### Typical Development Workflow

1. **Define Specification**
   - Create or update specification for the feature
   - Validate specification against existing code
   - Get team feedback on specification

2. **Implement Changes**
   - Write code following the specification
   - Use Lattice tools to track changes
   - Run automated tests

3. **Propose Mutation**
   - Create a mutation with your changes
   - AI analyzes changes for risk and compatibility
   - Automatic routing to appropriate reviewers

4. **Review Process**
   - Team reviews proposed changes
   - Automated checks pass/fail
   - Approval or rejection with feedback

5. **Deployment**
   - Approved changes are queued for deployment
   - Automated deployment to staging
   - Production deployment after validation

### Example: Security Enhancement

```bash
# 1. Create specification for authentication security
lattice spec create --name auth-security --template security

# 2. Implement password hashing in code
# (Edit your authentication module)

# 3. Propose the change as a mutation
lattice mutation propose \
  --spec auth-security \
  --description "Add secure password hashing" \
  --files ./src/auth.ts

# 4. Check mutation status
lattice mutation status <mutation-id>

# 5. Once approved, deploy
lattice deploy --mutation <mutation-id> --environment production
```

### Best Practices

#### Specifications

- Keep specifications focused and specific
- Use version control for specification changes
- Collaborate with team members on specifications
- Validate specifications against existing code

#### Mutations

- Break large changes into smaller, focused mutations
- Provide clear descriptions for each change
- Link mutations to specifications
- Use risk assessment to prioritize reviews

#### Reviews

- Review mutations promptly
- Provide constructive feedback
- Consider security implications
- Test changes before approval

---

## Troubleshooting

### Common Issues

#### Installation Problems

**Issue**: CLI installation fails
```bash
# Solution: Clear npm cache and reinstall
npm cache clean --force
npm install -g @lattice/cli
```

**Issue**: VSCode extension not connecting
1. Check your API key configuration
2. Verify network connectivity
3. Restart VSCode
4. Check extension logs for errors

#### Authentication Issues

**Issue**: Invalid API key
```bash
# Solution: Re-authenticate
lattice auth logout
lattice auth login
```

**Issue**: Permission denied
```bash
# Solution: Check user permissions
lattice user permissions
# Contact admin if permissions are insufficient
```

#### Mutation Issues

**Issue**: Mutation stuck in pending status
1. Check if reviewers have been assigned
2. Verify automated tests are passing
3. Check for dependency conflicts
4. Contact support if issue persists

**Issue**: Risk assessment failing
```bash
# Solution: Review risk assessment details
lattice risk assess --mutation <mutation-id> --verbose

# Address identified issues:
# - Add test coverage
# - Update documentation
# - Fix security vulnerabilities
```

#### Sync Issues

**Issue**: Specifications not syncing with code
```bash
# Force sync specifications
lattice sync specs --force

# Check for conflicts
lattice sync status

# Resolve conflicts manually if needed
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export LATTICE_DEBUG=true

# Run commands with verbose output
lattice mutation list --verbose
```

### Log Files

Check log files for detailed error information:

```bash
# View CLI logs
lattice logs --tail 100

# View VSCode extension logs
# Help > Toggle Developer Tools > Console
```

---

## Support

### Getting Help

#### Documentation
- [API Documentation](docs/api-documentation.md)
- [VSCode Extension Guide](docs/vscode-extension.md)
- [MCP Servers Documentation](docs/mcp-servers.md)
- [Tutorials & Guides](docs/tutorials-and-guides.md)

#### Community
- [Community Forum](https://community.lattice.dev)
- [Discord Server](https://discord.gg/lattice)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/lattice-engine)

#### Contact Support
- Email: support@lattice.dev
- Response Time: Usually within 24 hours
- Business Hours: Mon-Fri, 9AM-6PM EST

### System Status

Check the status of Lattice services:
- [Status Page](https://status.lattice.dev)
- [Incident History](https://status.lattice.dev/incidents)

### Contributing

We welcome contributions from the community:
- [GitHub Repository](https://github.com/lattice-engine/lattice)
- [Contributing Guidelines](https://github.com/lattice-engine/lattice/blob/main/CONTRIBUTING.md)
- [Bug Reports](https://github.com/lattice-engine/lattice/issues)
- [Feature Requests](https://github.com/lattice-engine/discussions)

### Additional Resources

#### Documentation Files
- [API Documentation v2.1.0](docs/api-documentation.md) - Complete REST API reference with examples and SDKs
- [VSCode Extension v1.5.2](docs/vscode-extension.md) - Native IDE integration guide
- [MCP Servers v2.0.0](docs/mcp-servers.md) - Model Context Protocol integration documentation
- [Tutorials & Guides](docs/tutorials-and-guides.md) - Step-by-step guides and best practices

#### Blog & Tutorials
- [Official Blog](https://blog.lattice.dev)
- [Video Tutorials](https://youtube.com/c/latticeengine)
- [Webinar Recordings](https://lattice.dev/webinars)

#### Training & Certification
- [Developer Certification](https://learn.lattice.dev/certification)
- [Workshop Schedule](https://lattice.dev/workshops)
- [Enterprise Training](https://lattice.dev/enterprise-training)

---

## Quick Reference

### CLI Commands

```bash
# Authentication
lattice auth login
lattice auth logout
lattice auth status

# Project Management
lattice project init
lattice project info
lattice project settings

# Specifications
lattice spec create --name <name> --template <template>
lattice spec list
lattice spec validate <spec-id>

# Mutations
lattice mutation propose --spec <spec-id>
lattice mutation list --status <status>
lattice mutation review <mutation-id>
lattice mutation approve <mutation-id>
lattice mutation reject <mutation-id>

# Deployment
lattice deploy --mutation <mutation-id> --environment <env>
lattice deploy status <deployment-id>
lattice deploy rollback <deployment-id>

# Sync
lattice sync specs
lattice sync status
lattice sync force

# Risk Assessment
lattice risk assess --changes <path>
lattice risk report <mutation-id>
```

### API Endpoints

```http
# Authentication
POST /api/v1/auth/login
POST /api/v1/auth/refresh
DELETE /api/v1/auth/logout

# Mutations
GET    /api/v1/mutations
POST   /api/v1/mutations
GET    /api/v1/mutations/{id}
POST   /api/v1/mutations/{id}/review
DELETE /api/v1/mutations/{id}

# Specifications
GET    /api/v1/specs
POST   /api/v1/specs
GET    /api/v1/specs/{id}
PUT    /api/v1/specs/{id}
DELETE /api/v1/specs/{id}

# Deployment
GET    /api/v1/deployments
POST   /api/v1/deployments
GET    /api/v1/deployments/{id}
POST   /api/v1/deployments/{id}/rollback

# Risk Assessment
POST   /api/v1/risk/assess
GET    /api/v1/risk/report/{mutation_id}
```

### Configuration Files

#### `.lattice/config.json`
```json
{
  "project": {
    "id": "your-project-id",
    "name": "Your Project",
    "description": "Project description"
  },
  "api": {
    "endpoint": "https://api.lattice.dev",
    "version": "v1"
  },
  "workflows": {
    "auto_approve": {
      "enabled": true,
      "risk_threshold": "low"
    },
    "require_test_coverage": true,
    "min_test_coverage": 80
  }
}
```

#### `.lattice/specs/user-auth.json`
```json
{
  "name": "user-auth",
  "version": "2.1",
  "description": "User authentication specification",
  "requirements": [
    "Passwords must be hashed using bcrypt",
    "All authentication events must be logged",
    "Rate limiting applies to login attempts",
    "Session timeout: 24 hours"
  ],
  "validation": {
    "test_coverage": 90,
    "security_scan": true
  }
}
```

---

*This documentation covers all the core features and workflows hinted at on the Lattice Engine website. For the most up-to-date information, visit the official documentation at [docs.lattice.dev](https://docs.lattice.dev).*