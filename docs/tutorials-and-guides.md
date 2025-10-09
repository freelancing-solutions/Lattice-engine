# Tutorials & Guides

## Table of Contents
1. [Getting Started Guide](#getting-started-guide)
2. [Advanced Workflows](#advanced-workflows)
3. [Team Collaboration](#team-collaboration)
4. [CI/CD Integration](#ci/cd-integration)
5. [Best Practices](#best-practices)

---

## Getting Started Guide

### Welcome to Lattice Engine

This guide will walk you through setting up Lattice Engine and creating your first project. By the end of this tutorial, you'll have a fully functional Lattice Engine project with living specifications and intelligent mutation management.

### Prerequisites

Before you begin, ensure you have:

- **Node.js 16+** or **Python 3.8+**
- **Git** installed and configured
- **VSCode** (recommended) or your preferred IDE
- **Text editor** or IDE of your choice
- **Command line** interface

### Step 1: Installation

#### Option A: JavaScript/TypeScript (Recommended)

```bash
# Install the Lattice CLI globally
npm install -g @lattice/cli

# Verify installation
lattice --version
# Should output: Lattice CLI v2.1.0

# Install the JavaScript SDK in your project
npm install @lattice/engine
```

#### Option B: Python

```bash
# Install the Python package
pip install lattice-engine

# Install CLI tools
pip install lattice-cli

# Verify installation
lattice --version
```

### Step 2: Account Setup

1. **Create Account**: Visit [lattice.dev/signup](https://lattice.dev/signup) to create your free account
2. **Generate API Key**:
   - Go to [lattice.dev/dashboard](https://lattice.dev/dashboard)
   - Navigate to **Settings** → **API Keys**
   - Click **Generate New Key**
   - Give it a descriptive name (e.g., "My First Project")
   - Copy the key for the next step

### Step 3: Project Initialization

#### Create a New Project

```bash
# Create a new directory for your project
mkdir my-first-lattice-project
cd my-first-lattice-project

# Initialize a new Lattice project
lattice init

# Follow the prompts:
# ? Project name: My First Lattice Project
# ? Project type: JavaScript
# ? Template: Web Application
# ? Initialize git repository: Yes
# ? Install VSCode extension: Yes
```

#### Project Structure

Your new project will have the following structure:

```
my-first-lattice-project/
├── .lattice/
│   ├── config.json          # Lattice configuration
│   └── specs/               # Living specifications
├── src/
│   ├── components/
│   ├── utils/
│   └── index.js
├── tests/
├── package.json
└── README.md
```

### Step 4: Configure Your Project

#### Update Configuration

Edit `.lattice/config.json`:

```json
{
  "project": {
    "id": "your-project-id-here",
    "name": "My First Lattice Project",
    "type": "javascript"
  },
  "api": {
    "endpoint": "https://api.lattice.dev",
    "key": "your-api-key-here"
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

#### Install VSCode Extension

1. Open VSCode
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for "**Lattice Engine**"
4. Click **Install**
5. Configure your API key when prompted

### Step 5: Create Your First Specification

Specifications define how your application should behave. Let's create a user authentication specification.

```bash
# Create a new specification
lattice spec create --name user-auth --template authentication
```

This creates `.lattice/specs/user-auth.json`:

```json
{
  "name": "user-auth",
  "version": "1.0.0",
  "description": "User authentication specification",
  "requirements": [
    "Users can register with email and password",
    "Passwords must be at least 8 characters",
    "Email addresses must be validated",
    "Sessions expire after 24 hours",
    "Failed login attempts are rate limited"
  ],
  "validation": {
    "test_coverage": 90,
    "security_scan": true,
    "automated_tests": true
  },
  "examples": {
    "valid_registration": {
      "email": "user@example.com",
      "password": "SecurePass123!"
    },
    "invalid_registration": {
      "email": "invalid-email",
      "password": "123"
    }
  }
}
```

### Step 6: Implement the Feature

Now let's implement the user authentication feature:

```javascript
// src/auth.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserAuth {
  constructor() {
    this.users = [];
    this.sessions = new Map();
  }

  async register(email, password) {
    // Validate email
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }

    // Validate password
    if (!this.isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    if (this.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: this.generateId(),
      email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    };

    this.users.push(user);
    return { id: user.id, email: user.email };
  }

  async login(email, password) {
    // Find user
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Create session token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store session
    this.sessions.set(token, {
      userId: user.id,
      created_at: new Date().toISOString()
    });

    return { token, user: { id: user.id, email: user.email } };
  }

  logout(token) {
    this.sessions.delete(token);
  }

  validateToken(token) {
    const session = this.sessions.get(token);
    if (!session) {
      throw new Error('Invalid token');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      this.sessions.delete(token);
      throw new Error('Invalid token');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPassword(password) {
    return password.length >= 8;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

module.exports = UserAuth;
```

### Step 7: Create Tests

```javascript
// tests/auth.test.js
const UserAuth = require('../src/auth');

describe('User Authentication', () => {
  let auth;

  beforeEach(() => {
    auth = new UserAuth();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Registration', () => {
    test('should register user with valid email and password', async () => {
      const result = await auth.register('user@example.com', 'SecurePass123!');

      expect(result.id).toBeDefined();
      expect(result.email).toBe('user@example.com');
    });

    test('should reject invalid email', async () => {
      await expect(
        auth.register('invalid-email', 'SecurePass123!')
      ).rejects.toThrow('Invalid email address');
    });

    test('should reject short password', async () => {
      await expect(
        auth.register('user@example.com', '123')
      ).rejects.toThrow('Password must be at least 8 characters');
    });

    test('should reject duplicate email', async () => {
      await auth.register('user@example.com', 'SecurePass123!');

      await expect(
        auth.register('user@example.com', 'AnotherPass123!')
      ).rejects.toThrow('User already exists');
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      await auth.register('user@example.com', 'SecurePass123!');
    });

    test('should login with correct credentials', async () => {
      const result = await auth.login('user@example.com', 'SecurePass123!');

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('user@example.com');
    });

    test('should reject incorrect password', async () => {
      await expect(
        auth.login('user@example.com', 'WrongPassword')
      ).rejects.toThrow('Invalid credentials');
    });

    test('should reject non-existent user', async () => {
      await expect(
        auth.login('nonexistent@example.com', 'SecurePass123!')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Token Validation', () => {
    let token;

    beforeEach(async () => {
      const result = await auth.login('user@example.com', 'SecurePass123!');
      token = result.token;
    });

    test('should validate valid token', () => {
      const decoded = auth.validateToken(token);
      expect(decoded.email).toBe('user@example.com');
    });

    test('should reject invalid token', () => {
      expect(() => {
        auth.validateToken('invalid-token');
      }).toThrow('Invalid token');
    });
  });
});
```

### Step 8: Create Your First Mutation

Now let's create a mutation to add rate limiting to our authentication:

```javascript
// First, update the auth.js file to add rate limiting
// (Make the changes in your editor)

// Then create a mutation
lattice mutation create \
  --spec user-auth \
  --title "Add rate limiting to login attempts" \
  --description "Implement rate limiting to prevent brute force attacks" \
  --files src/auth.js
```

### Step 9: Review and Deploy

#### Check Mutation Status

```bash
# Check if AI analysis is complete
lattice mutation status

# View risk assessment
lattice mutation risk-assessment <mutation-id>
```

#### Approve and Deploy

```bash
# Approve the mutation (if auto-approve is disabled)
lattice mutation approve <mutation-id>

# Deploy to staging
lattice deploy --mutation <mutation-id> --environment staging

# Deploy to production
lattice deploy --mutation <mutation-id> --environment production
```

### Step 10: Verify Everything Works

```bash
# Run tests
npm test

# Check deployment status
lattice deployment status <deployment-id>

# View project dashboard
lattice dashboard
```

### Congratulations! 🎉

You've successfully:
- ✅ Set up a Lattice Engine project
- ✅ Created living specifications
- ✅ Implemented a feature with proper validation
- ✅ Created and deployed your first mutation
- ✅ Integrated automated testing and deployment

### Next Steps

1. **Explore Advanced Features**: Learn about custom workflows and automation
2. **Team Collaboration**: Invite team members and set up collaboration features
3. **CI/CD Integration**: Integrate with your existing CI/CD pipeline
4. **Monitor and Scale**: Set up monitoring and scale your deployment

---

## Advanced Workflows

### Custom Mutation Workflows

Create sophisticated workflows for different types of changes:

#### Security Enhancement Workflow

```javascript
// .lattice/workflows/security-enhancement.json
{
  "name": "Security Enhancement",
  "trigger": {
    "mutation_type": "security",
    "spec_patterns": ["*-auth", "*-security", "*-permissions"]
  },
  "steps": [
    {
      "name": "Security Scan",
      "type": "automated",
      "tools": ["snyk", "semgrep", "eslint-plugin-security"],
      "conditions": {
        "required": true,
        "failure_action": "block"
      }
    },
    {
      "name": "Security Team Review",
      "type": "manual",
      "assignees": ["security-team@company.com"],
      "timeout": "24h",
      "escalation": {
        "timeout": "48h",
        "escalate_to": ["cto@company.com"]
      }
    },
    {
      "name": "Penetration Testing",
      "type": "automated",
      "conditions": {
        "risk_score": "high",
        "required": true
      }
    },
    {
      "name": "Documentation Update",
      "type": "automated",
      "action": "update_security_docs",
      "conditions": {
        "api_changes": true
      }
    }
  ],
  "deployment": {
    "strategy": "canary",
    "canary_percentage": 10,
    "monitoring_period": "2h",
    "rollback_triggers": ["error_rate > 1%", "response_time > 500ms"]
  }
}
```

#### Feature Workflow

```javascript
// .lattice/workflows/feature-development.json
{
  "name": "Feature Development",
  "trigger": {
    "mutation_type": "feature",
    "labels": ["feature"]
  },
  "steps": [
    {
      "name": "Code Review",
      "type": "manual",
      "assignees": ["team-lead", "senior-developer"],
      "requirements": {
        "min_reviewers": 2,
        "require_comments": true
      }
    },
    {
      "name": "Integration Testing",
      "type": "automated",
      "test_suites": ["integration", "e2e"],
      "coverage_threshold": 85
    },
    {
      "name": "Performance Testing",
      "type": "automated",
      "conditions": {
        "api_changes": true,
        "database_changes": true
      },
      "benchmarks": {
        "response_time": "< 200ms",
        "throughput": "> 1000 req/s"
      }
    },
    {
      "name": "Documentation",
      "type": "automated",
      "action": "generate_docs",
      "validation": {
        "api_docs_required": true,
        "readme_updated": true
      }
    }
  ],
  "deployment": {
    "strategy": "blue_green",
    "health_checks": ["/health", "/api/health"],
    "rollback_on_failure": true
  }
}
```

### Custom Specifications

Create sophisticated specifications for complex systems:

#### API Specification

```json
{
  "name": "user-management-api",
  "version": "2.1.0",
  "type": "api",
  "description": "User management REST API specification",

  "endpoints": [
    {
      "path": "/api/v1/users",
      "method": "POST",
      "description": "Create new user",
      "authentication": "required",
      "authorization": "admin_only",
      "request": {
        "schema": {
          "email": {
            "type": "string",
            "format": "email",
            "required": true
          },
          "password": {
            "type": "string",
            "min_length": 8,
            "required": true
          },
          "role": {
            "type": "string",
            "enum": ["user", "admin"],
            "default": "user"
          }
        }
      },
      "response": {
        "status_codes": [201, 400, 401, 403, 409],
        "schema": {
          "id": "string",
          "email": "string",
          "role": "string",
          "created_at": "datetime"
        }
      }
    }
  ],

  "validation": {
    "request_validation": "strict",
    "response_validation": "strict",
    "error_handling": "standardized",
    "rate_limiting": {
      "enabled": true,
      "requests_per_minute": 60
    }
  },

  "security": {
    "authentication": "jwt",
    "authorization": "rbac",
    "input_validation": true,
    "output_sanitization": true,
    "cors": {
      "enabled": true,
      "allowed_origins": ["https://app.example.com"]
    }
  },

  "testing": {
    "unit_tests": {
      "coverage": "> 90%",
      "required": true
    },
    "integration_tests": {
      "coverage": "> 80%",
      "required": true
    },
    "contract_tests": {
      "provider": "pact",
      "required": true
    }
  }
}
```

#### Database Schema Specification

```json
{
  "name": "user-database-schema",
  "version": "1.5.0",
  "type": "database",
  "description": "User database schema specification",

  "tables": [
    {
      "name": "users",
      "description": "User accounts",
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "primary_key": true,
          "default": "gen_random_uuid()"
        },
        {
          "name": "email",
          "type": "varchar(255)",
          "unique": true,
          "not_null": true,
          "index": true
        },
        {
          "name": "password_hash",
          "type": "varchar(255)",
          "not_null": true,
          "sensitive": true
        },
        {
          "name": "role",
          "type": "varchar(50)",
          "default": "user",
          "check": "role IN ('user', 'admin', 'moderator')"
        },
        {
          "name": "created_at",
          "type": "timestamp",
          "default": "now()",
          "not_null": true
        },
        {
          "name": "updated_at",
          "type": "timestamp",
          "default": "now()",
          "not_null": true
        }
      ],
      "indexes": [
        {
          "name": "idx_users_email",
          "columns": ["email"],
          "unique": true
        },
        {
          "name": "idx_users_role",
          "columns": ["role"]
        }
      ],
      "constraints": [
        {
          "name": "chk_users_role",
          "type": "check",
          "condition": "role IN ('user', 'admin', 'moderator')"
        }
      ]
    }
  ],

  "migrations": {
    "strategy": "incremental",
    "rollback_enabled": true,
    "backup_before_migration": true,
    "downtime_threshold": "30s"
  },

  "performance": {
    "query_timeout": "5s",
    "connection_pool_size": 20,
    "index_hints": true,
    "query_optimization": true
  },

  "security": {
    "encryption_at_rest": true,
    "encryption_in_transit": true,
    "access_logging": true,
    "policies": {
      "row_level_security": true,
      "column_level_masking": ["password_hash"]
    }
  }
}
```

### Advanced Automation

#### Automated Testing Pipeline

```yaml
# .lattice/pipelines/testing.yml
name: Automated Testing Pipeline

trigger:
  events: ["mutation.created", "mutation.updated"]
  conditions:
    - mutation.status == "pending"

jobs:
  - name: Linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run ESLint
        run: npm run lint
      - name: Run Prettier
        run: npm run format:check

  - name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Coverage report
        run: npm run test:coverage

  - name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  - name: Security Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk
        run: npx snyk test
      - name: Run Semgrep
        run: semgrep --config=auto .

  - name: Performance Testing
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run load tests
        run: npm run test:performance
      - name: Benchmark
        run: npm run benchmark

outputs:
  test_results:
    type: object
    properties:
      unit_tests:
        type: object
        properties:
          passed: number
          failed: number
          coverage: number
      integration_tests:
        type: object
        properties:
          passed: number
          failed: number
      security_scan:
        type: object
        properties:
          vulnerabilities: number
          severity: string
```

#### Custom Mutation Hooks

```javascript
// .lattice/hooks/pre-mutation.js
module.exports = async function(context) {
  const { mutation, spec, config } = context;

  console.log(`Processing mutation: ${mutation.title}`);

  // Validate mutation against specification
  const validationResult = await validateAgainstSpec(mutation, spec);
  if (!validationResult.valid) {
    throw new Error(`Specification validation failed: ${validationResult.errors.join(', ')}`);
  }

  // Check if mutation requires additional reviewers
  if (mutation.risk_score === 'high' && mutation.reviewers.length < 2) {
    // Automatically assign security team
    mutation.reviewers.push('security-team@company.com');
  }

  // Add required metadata
  if (!mutation.metadata.ticket_id) {
    throw new Error('Ticket ID is required for all mutations');
  }

  return mutation;
};

async function validateAgainstSpec(mutation, spec) {
  // Custom validation logic
  const errors = [];

  // Check if mutation files are allowed
  const allowedFiles = spec.allowed_files || ['src/**/*'];
  for (const file of mutation.files_modified) {
    if (!matchesPattern(file.path, allowedFiles)) {
      errors.push(`File ${file.path} is not allowed in this specification`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function matchesPattern(path, patterns) {
  return patterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(path);
  });
}
```

```javascript
// .lattice/hooks/post-mutation.js
module.exports = async function(context) {
  const { mutation, result } = context;

  if (result.status === 'approved') {
    // Send notifications
    await sendSlackNotification({
      channel: '#deployments',
      message: `✅ Mutation approved: ${mutation.title}`,
      color: 'good'
    });

    // Update documentation
    if (mutation.documentation_required) {
      await generateDocumentation(mutation);
    }

    // Create deployment ticket
    await createDeploymentTicket(mutation);
  }

  // Log metrics
  await logMetrics({
    mutation_id: mutation.id,
    processing_time: result.processing_time,
    risk_score: mutation.risk_score,
    reviewers: mutation.reviewers.length
  });
};

async function sendSlackNotification({ channel, message, color }) {
  // Slack API integration
}

async function generateDocumentation(mutation) {
  // Automatic documentation generation
}

async function createDeploymentTicket(mutation) {
  // Create deployment ticket in your ticketing system
}

async function logMetrics(metrics) {
  // Send metrics to your monitoring system
}
```

---

## Team Collaboration

### Setting Up Your Team

#### Team Roles and Permissions

Define clear roles for your team members:

```json
// .lattice/team/roles.json
{
  "roles": {
    "owner": {
      "description": "Project owner with full access",
      "permissions": [
        "project:manage",
        "team:manage",
        "mutations:create",
        "mutations:approve",
        "mutations:deploy",
        "specs:create",
        "specs:edit",
        "settings:manage"
      ]
    },
    "admin": {
      "description": "Administrator with most permissions",
      "permissions": [
        "mutations:create",
        "mutations:approve",
        "mutations:deploy",
        "specs:create",
        "specs:edit",
        "team:invite"
      ]
    },
    "developer": {
      "description": "Developer with standard permissions",
      "permissions": [
        "mutations:create",
        "specs:view",
        "specs:comment",
        "deploy:staging"
      ]
    },
    "reviewer": {
      "description": "Code reviewer with approval permissions",
      "permissions": [
        "mutations:review",
        "mutations:approve",
        "specs:view",
        "specs:comment"
      ]
    },
    "viewer": {
      "description": "Read-only access",
      "permissions": [
        "mutations:view",
        "specs:view",
        "deployments:view"
      ]
    }
  }
}
```

#### Invite Team Members

```bash
# Invite team members
lattice team invite \
  --email john.doe@company.com \
  --role developer \
  --specs user-auth,api-endpoints

lattice team invite \
  --email jane.smith@company.com \
  --role reviewer \
  --specs security,performance

# List team members
lattice team list

# Update team member role
lattice team update \
  --email john.doe@company.com \
  --role senior-developer

# Remove team member
lattice team remove --email john.doe@company.com
```

### Collaborative Workflows

#### Code Review Process

Set up an efficient code review workflow:

```json
// .lattice/workflows/code-review.json
{
  "name": "Code Review Process",
  "description": "Standard code review workflow for all mutations",

  "auto_assignment": {
    "enabled": true,
    "rules": [
      {
        "condition": "mutation.spec_id == 'user-auth'",
        "assignees": ["security-team@company.com", "backend-team@company.com"]
      },
      {
        "condition": "mutation.risk_score == 'high'",
        "assignees": ["tech-lead@company.com"]
      },
      {
        "condition": "mutation.author != 'tech-lead@company.com'",
        "assignees": ["tech-lead@company.com"]
      }
    ]
  },

  "review_requirements": {
    "min_reviewers": 2,
    "require_comments": true,
    "require_test_coverage": true,
    "min_test_coverage": 80,
    "approval_types": ["approve", "approve_with_suggestions"]
  },

  "review_timeout": {
    "default": "48h",
    "urgent": "4h",
    "high_priority": "24h"
  },

  "escalation": {
    "enabled": true,
    "rules": [
      {
        "condition": "review.age > '48h'",
        "action": "notify_manager",
        "recipient": "manager@company.com"
      },
      {
        "condition": "review.age > '72h'",
        "action": "escalate_to_cto",
        "recipient": "cto@company.com"
      }
    ]
  }
}
```

#### Collaborative Specification Editing

Enable real-time collaboration on specifications:

```javascript
// .lattice/collaboration/spec-collaboration.json
{
  "real_time_editing": {
    "enabled": true,
    "conflict_resolution": "operational_transform",
    "auto_save": true,
    "auto_save_interval": 30
  },

  "presence": {
    "show_cursors": true,
    "show_selections": true,
    "show_active_users": true,
    "user_colors": true
  },

  "notifications": {
    "on_spec_update": true,
    "on_comment_added": true,
    "on_approval_requested": true,
    "channels": ["email", "slack"]
  },

  "version_control": {
    "auto_version": true,
    "comment_required": true,
    "major_version_threshold": "breaking_changes",
    "minor_version_threshold": "new_requirements"
  }
}
```

### Team Communication

#### Slack Integration

Set up comprehensive Slack integration:

```yaml
# .lattice/integrations/slack.yml
slack:
  bot_token: "xoxb-your-bot-token"
  channel_mappings:
    "#general":
      events: ["mutation.approved", "deployment.started", "deployment.completed"]
    "#security":
      events: ["mutation.created", "security.scan.failed"]
    "#deployments":
      events: ["deployment.*"]
    "#code-reviews":
      events: ["mutation.review_requested", "mutation.approved", "mutation.rejected"]

  notifications:
    mutation_created:
      template: |
        📝 New mutation created: *{mutation.title}*
        Author: {mutation.author}
        Spec: {mutation.spec_id}
        Risk: {mutation.risk_score}
        <{mutation.url}|View Details>

    mutation_approved:
      template: |
        ✅ Mutation approved: *{mutation.title}*
        Approved by: {approval.reviewer}
        <{mutation.url}|View Details>

    deployment_started:
      template: |
        🚀 Deployment started: {deployment.environment}
        Mutations: {deployment.mutations_count}
        <{deployment.url}|Track Progress>

    deployment_completed:
      template: |
        ✅ Deployment completed successfully
        Environment: {deployment.environment}
        Duration: {deployment.duration}
        <{deployment.url}|View Details>
```

#### Email Notifications

Configure email notifications for important events:

```json
// .lattice/notifications/email.json
{
  "smtp": {
    "host": "smtp.company.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "lattice@company.com",
      "pass": "${SMTP_PASSWORD}"
    }
  },

  "templates": {
    "review_requested": {
      "subject": "Review requested: {mutation.title}",
      "template": "review-requested.html",
      "variables": {
        "mutation": "{mutation}",
        "reviewer": "{reviewer}",
        "due_date": "{review.due_date}"
      }
    },

    "mutation_approved": {
      "subject": "Your mutation was approved: {mutation.title}",
      "template": "mutation-approved.html",
      "variables": {
        "mutation": "{mutation}",
        "approver": "{approval.reviewer}",
        "next_steps": "{deployment.instructions}"
      }
    }
  },

  "preferences": {
    "batch_notifications": true,
    "batch_interval": "1h",
    "digest_schedule": "daily",
    "quiet_hours": {
      "start": "22:00",
      "end": "08:00",
      "timezone": "America/New_York"
    }
  }
}
```

### Knowledge Sharing

#### Documentation Generation

Automatically generate documentation from your specifications:

```javascript
// .lattice/docs/generation.js
module.exports = {
  generateApiDocs: async function(specs) {
    const apiDocs = {
      title: "API Documentation",
      version: "2.1.0",
      baseUrl: "https://api.example.com",
      endpoints: []
    };

    for (const spec of specs) {
      if (spec.type === 'api') {
        for (const endpoint of spec.endpoints) {
          apiDocs.endpoints.push({
            path: endpoint.path,
            method: endpoint.method,
            description: endpoint.description,
            parameters: endpoint.request.schema,
            responses: endpoint.response,
            examples: endpoint.examples
          });
        }
      }
    }

    // Generate OpenAPI spec
    const openApiSpec = generateOpenApiSpec(apiDocs);

    // Save to documentation
    await saveToFile('docs/api/openapi.json', JSON.stringify(openApiSpec, null, 2));
    await generateMarkdownDocs(apiDocs);
    await generateHtmlDocs(apiDocs);
  },

  generateSecurityGuidelines: async function(securitySpecs) {
    const guidelines = {
      introduction: "Security Guidelines for Development",
      principles: [],
      practices: [],
      tools: []
    };

    for (const spec of securitySpecs) {
      guidelines.principles.push(...spec.principles);
      guidelines.practices.push(...spec.practices);
      guidelines.tools.push(...spec.tools);
    }

    await generateSecurityDocs(guidelines);
  }
};
```

#### Team Wiki Integration

Integrate with your team wiki (Confluence, Notion, etc.):

```javascript
// .lattice/integrations/wiki.js
module.exports = {
  syncToWiki: async function(mutation) {
    if (mutation.documentation_required) {
      const wikiPage = {
        title: `Feature: ${mutation.title}`,
        content: generateWikiContent(mutation),
        space: 'DEV',
        labels: ['feature', mutation.spec_id, mutation.type]
      };

      // Create or update wiki page
      await updateWikiPage(wikiPage);

      // Add link to mutation
      mutation.wiki_url = wikiPage.url;
      await updateMutation(mutation.id, { wiki_url: wikiPage.url });
    }
  },

  createRunbook: async function(deployment) {
    const runbook = {
      title: `Deployment Runbook: ${deployment.environment}`,
      content: generateRunbookContent(deployment),
      space: 'OPS',
      labels: ['runbook', 'deployment', deployment.environment]
    };

    await createWikiPage(runbook);
  }
};
```

### Performance Monitoring

#### Team Metrics Dashboard

Monitor team performance and collaboration metrics:

```javascript
// .lattice/metrics/team-performance.js
module.exports = {
  generateTeamMetrics: async function(teamId, timeRange) {
    const metrics = {
      team_id: teamId,
      period: timeRange,

      // Productivity metrics
      mutations: {
        created: await countMutations(teamId, 'created', timeRange),
        approved: await countMutations(teamId, 'approved', timeRange),
        deployed: await countMutations(teamId, 'deployed', timeRange),
        average_review_time: await calculateAverageReviewTime(teamId, timeRange),
        average_deploy_time: await calculateAverageDeployTime(teamId, timeRange)
      },

      // Collaboration metrics
      collaboration: {
        reviews_per_member: await calculateReviewsPerMember(teamId, timeRange),
        comments_per_mutation: await calculateCommentsPerMutation(teamId, timeRange),
        cross_team_collaboration: await calculateCrossTeamCollaboration(teamId, timeRange),
        knowledge_sharing: await calculateKnowledgeSharing(teamId, timeRange)
      },

      // Quality metrics
      quality: {
        bug_rate: await calculateBugRate(teamId, timeRange),
        rollback_rate: await calculateRollbackRate(teamId, timeRange),
        test_coverage: await getAverageTestCoverage(teamId, timeRange),
        security_issues: await countSecurityIssues(teamId, timeRange)
      }
    };

    return metrics;
  },

  generateTeamReport: async function(teamId, timeRange) {
    const metrics = await this.generateTeamMetrics(teamId, timeRange);

    const report = `
# Team Performance Report

## Period: ${timeRange}
## Team: ${teamId}

## 📊 Summary
- Mutations Created: ${metrics.mutations.created}
- Mutations Approved: ${metrics.mutations.approved}
- Mutations Deployed: ${metrics.mutations.deployed}
- Average Review Time: ${metrics.mutations.average_review_time}
- Average Deploy Time: ${metrics.mutations.average_deploy_time}

## 👥 Collaboration
- Reviews per Member: ${metrics.collaboration.reviews_per_member}
- Comments per Mutation: ${metrics.collaboration.comments_per_mutation}
- Cross-team Collaboration: ${metrics.collaboration.cross_team_collaboration}%

## 🔍 Quality
- Bug Rate: ${metrics.quality.bug_rate}%
- Rollback Rate: ${metrics.quality.rollback_rate}%
- Test Coverage: ${metrics.quality.test_coverage}%
- Security Issues: ${metrics.quality.security_issues}

## 📈 Trends
${await generateTrendAnalysis(teamId, timeRange)}

## 🎯 Recommendations
${await generateRecommendations(metrics)}
    `;

    return report;
  }
};
```

---

## CI/CD Integration

### GitHub Actions Integration

Create comprehensive CI/CD pipelines with GitHub Actions:

```yaml
# .github/workflows/lattice-ci.yml
name: Lattice CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      mutation_id:
        description: 'Lattice Mutation ID'
        required: true
        type: string

env:
  LATTICE_API_KEY: ${{ secrets.LATTICE_API_KEY }}
  LATTICE_PROJECT_ID: ${{ secrets.LATTICE_PROJECT_ID }}

jobs:
  # Mutation Validation
  validate-mutation:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Lattice CLI
        run: npm install -g @lattice/cli

      - name: Validate mutation
        run: |
          lattice mutation validate ${{ github.event.inputs.mutation_id }} \
            --context github-actions \
            --commit ${{ github.sha }}

  # Linting and Formatting
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Run TypeScript check
        run: npm run type-check

  # Security Scanning
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/owasp-top-ten

  # Testing
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  # Build and Deploy
  deploy:
    needs: [lint, security, test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Install Lattice CLI
        run: npm install -g @lattice/cli

      - name: Create deployment mutation
        id: create-mutation
        run: |
          MUTATION_ID=$(lattice mutation create \
            --spec deployment \
            --title "Deploy to production" \
            --description "Automated deployment from GitHub Actions" \
            --environment production \
            --commit ${{ github.sha }} \
            --build-url ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }} \
            --output json | jq -r '.id')

          echo "mutation_id=$MUTATION_ID" >> $GITHUB_OUTPUT
          echo "Created mutation: $MUTATION_ID"

      - name: Deploy to staging
        run: |
          npm run deploy:staging

      - name: Run smoke tests
        run: |
          npm run test:smoke -- --environment staging

      - name: Approve and deploy to production
        run: |
          lattice mutation approve ${{ steps.create-mutation.outputs.mutation_id }} \
            --auto-approve \
            --reason "Automated deployment passed all tests"

          lattice deploy \
            --mutation ${{ steps.create-mutation.outputs.mutation_id }} \
            --environment production

      - name: Run production health checks
        run: |
          npm run test:health -- --environment production

      - name: Notify team
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          text: |
            Deployment ${{ job.status }}!
            Mutation: ${{ steps.create-mutation.outputs.mutation_id }}
            Commit: ${{ github.sha }}
            Run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Jenkins Integration

Configure Jenkins for Lattice Engine workflows:

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        LATTICE_API_KEY = credentials('lattice-api-key')
        LATTICE_PROJECT_ID = credentials('lattice-project-id')
        NODE_VERSION = '18'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup') {
            steps {
                sh 'npm ci'
                sh 'npm install -g @lattice/cli'
            }
        }

        stage('Validate against Lattice') {
            steps {
                script {
                    def validationResult = sh(
                        script: 'lattice validate --strict',
                        returnStatus: true
                    )

                    if (validationResult != 0) {
                        error('Lattice validation failed')
                    }
                }
            }
        }

        stage('Security Scan') {
            parallel {
                stage('Snyk') {
                    steps {
                        sh 'npm run security:snyk'
                    }
                }
                stage('Semgrep') {
                    steps {
                        sh 'npm run security:semgrep'
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit -- --coverage'
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
            }
        }

        stage('Create Lattice Mutation') {
            when {
                branch 'main'
            }
            steps {
                script {
                    env.MUTATION_ID = sh(
                        script: '''
                            lattice mutation create \
                                --spec deployment \
                                --title "Deploy from Jenkins" \
                                --description "Automated deployment via Jenkins pipeline" \
                                --environment production \
                                --build-url ${env.BUILD_URL} \
                                --output json | jq -r '.id'
                        ''',
                        returnStdout: true
                    ).trim()

                    echo "Created mutation: ${env.MUTATION_ID}"
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm run build'
                sh 'npm run deploy:production'

                script {
                    sh """
                        lattice mutation approve ${env.MUTATION_ID} \
                            --auto-approve \
                            --reason "Jenkins deployment successful"

                        lattice deploy \
                            --mutation ${env.MUTATION_ID} \
                            --environment production
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                sh 'npm run health:check'
            }
        }
    }

    post {
        always {
            junit 'test-results/**/*.xml'
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }

        success {
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ Deployment successful!\nMutation: ${env.MUTATION_ID}\nBuild: ${env.BUILD_URL}"
            )
        }

        failure {
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ Deployment failed!\nBuild: ${env.BUILD_URL}"
            )
        }
    }
}
```

### GitLab CI/CD Integration

Configure GitLab CI/CD with Lattice Engine:

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - test
  - security
  - build
  - deploy

variables:
  LATTICE_API_KEY: $LATTICE_API_KEY
  LATTICE_PROJECT_ID: $LATTICE_PROJECT_ID

# Lattice Validation
validate:
  stage: validate
  image: node:18
  before_script:
    - npm ci
    - npm install -g @lattice/cli
  script:
    - lattice validate --strict
    - lattice spec validate --all
  artifacts:
    reports:
      junit: test-results.xml

# Testing
unit-tests:
  stage: test
  image: node:18
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  before_script:
    - npm ci
  script:
    - npm run test:unit -- --coverage --reporter=junit
  artifacts:
    reports:
      junit: test-results.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

integration-tests:
  stage: test
  image: node:18
  services:
    - postgres:14
  variables:
    POSTGRES_DB: test
    POSTGRES_USER: test
    POSTGRES_PASSWORD: test
  before_script:
    - npm ci
  script:
    - npm run test:integration

# Security Scanning
security-scan:
  stage: security
  image: node:18
  before_script:
    - npm ci
  script:
    - npm run security:snyk
    - npm run security:semgrep
  artifacts:
    reports:
      sast: gl-sast-report.json
    paths:
      - security-reports/
    expire_in: 1 week

# Build
build:
  stage: build
  image: node:18
  before_script:
    - npm ci
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

# Deploy to Production
deploy-production:
  stage: deploy
  image: node:18
  environment:
    name: production
    url: https://app.example.com
  before_script:
    - npm ci
    - npm install -g @lattice/cli
  script:
    - |
      MUTATION_ID=$(lattice mutation create \
        --spec deployment \
        --title "Deploy to production via GitLab CI" \
        --description "Automated deployment from GitLab pipeline" \
        --environment production \
        --commit $CI_COMMIT_SHA \
        --pipeline-url $CI_PIPELINE_URL \
        --output json | jq -r '.id')

      echo "Created mutation: $MUTATION_ID"

      # Deploy application
      npm run deploy:production

      # Approve mutation and finalize deployment
      lattice mutation approve $MUTATION_ID \
        --auto-approve \
        --reason "GitLab CI deployment successful"

      lattice deploy \
        --mutation $MUTATION_ID \
        --environment production

      # Health check
      npm run health:check

      # Notify team
      curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Production deployment successful!\\nMutation: $MUTATION_ID\\nPipeline: $CI_PIPELINE_URL\"}" \
        $SLACK_WEBHOOK_URL
  only:
    - main
  when: manual

# Deploy to Staging
deploy-staging:
  stage: deploy
  image: node:18
  environment:
    name: staging
    url: https://staging.example.com
  before_script:
    - npm ci
  script:
    - npm run deploy:staging
    - npm run health:check -- --environment staging
  only:
    - develop
```

### Terraform Integration

Infrastructure as Code with Terraform and Lattice:

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    lattice = {
      source  = "lattice-engine/lattice"
      version = "~> 2.0"
    }
  }
}

provider "lattice" {
  api_key    = var.lattice_api_key
  project_id = var.lattice_project_id
}

# Create Lattice project
resource "lattice_project" "main" {
  name        = var.project_name
  description = var.project_description

  settings {
    auto_approve {
      enabled        = true
      risk_threshold = "low"
    }

    test_coverage {
      required = true
      minimum = 80
    }

    notifications {
      email = ["team@company.com"]
      slack  = "#deployments"
    }
  }
}

# Create specifications
resource "lattice_specification" "user_auth" {
  name        = "user-auth"
  description = "User authentication specification"
  version     = "1.0.0"

  requirements = [
    "Users can register with email and password",
    "Passwords must be at least 8 characters",
    "Email addresses must be validated",
    "Sessions expire after 24 hours"
  ]

  validation {
    test_coverage     = 90
    security_scan     = true
    automated_tests   = true
    performance_tests = true
  }
}

resource "lattice_specification" "api_endpoints" {
  name        = "api-endpoints"
  description = "REST API endpoints specification"
  version     = "1.0.0"

  requirements = [
    "All endpoints must be versioned",
    "API responses must be consistent",
    "Rate limiting must be implemented",
    "API documentation must be updated"
  ]

  validation {
    test_coverage     = 85
    security_scan     = true
    automated_tests   = true
    contract_tests    = true
  }
}

# Create workflows
resource "lattice_workflow" "security_review" {
  name = "Security Review"

  trigger {
    mutation_types = ["security"]
    spec_ids       = [lattice_specification.user_auth.id]
  }

  steps {
    name        = "Security Scan"
    type        = "automated"
    tools       = ["snyk", "semgrep"]
    required    = true

    conditions {
      failure_action = "block"
    }
  }

  steps {
    name        = "Security Team Review"
    type        = "manual"
    assignees   = ["security-team@company.com"]
    timeout     = "24h"

    escalation {
      timeout     = "48h"
      escalate_to = ["cto@company.com"]
    }
  }
}

# Set up team
resource "lattice_team_member" "developer" {
  for_each = var.developers

  email  = each.value.email
  role   = "developer"
  specs  = [lattice_specification.user_auth.id, lattice_specification.api_endpoints.id]
}

resource "lattice_team_member" "reviewer" {
  for_each = var.reviewers

  email  = each.value.email
  role   = "reviewer"
  specs  = [lattice_specification.user_auth.id]
}

# Variables
variable "lattice_api_key" {
  description = "Lattice Engine API key"
  type        = string
  sensitive   = true
}

variable "lattice_project_id" {
  description = "Lattice Engine project ID"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "My Lattice Project"
}

variable "project_description" {
  description = "Project description"
  type        = string
  default     = "A project managed with Lattice Engine"
}

variable "developers" {
  description = "List of developers"
  type = map(object({
    email = string
  }))
  default = {}
}

variable "reviewers" {
  description = "List of reviewers"
  type = map(object({
    email = string
  }))
  default = {}
}

# Outputs
output "project_id" {
  description = "Lattice project ID"
  value       = lattice_project.main.id
}

output "specification_ids" {
  description = "Specification IDs"
  value = {
    user_auth     = lattice_specification.user_auth.id
    api_endpoints = lattice_specification.api_endpoints.id
  }
}

output "workflow_ids" {
  description = "Workflow IDs"
  value = {
    security_review = lattice_workflow.security_review.id
  }
}
```

---

## Best Practices

### Code Organization

#### Project Structure Best Practices

Follow this recommended project structure:

```
my-lattice-project/
├── .lattice/                    # Lattice configuration
│   ├── config.json             # Main configuration
│   ├── specs/                  # Living specifications
│   │   ├── user-auth.json
│   │   ├── api-endpoints.json
│   │   └── database-schema.json
│   ├── workflows/              # Custom workflows
│   │   ├── security-review.json
│   │   └── feature-development.json
│   ├── hooks/                  # Mutation hooks
│   │   ├── pre-mutation.js
│   │   └── post-mutation.js
│   └── team/                   # Team configuration
│       ├── roles.json
│       └── permissions.json
├── src/                        # Source code
│   ├── components/            # UI components
│   ├── services/              # Business logic
│   ├── utils/                 # Utilities
│   └── types/                 # TypeScript types
├── tests/                      # Tests
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests
├── docs/                       # Documentation
│   ├── api/                   # API documentation
│   ├── guides/                # User guides
│   └── architecture/          # Architecture docs
├── scripts/                    # Build and deployment scripts
├── infrastructure/             # Infrastructure as code
└── tools/                      # Development tools
```

#### Specification Design Patterns

##### Single Responsibility Principle

Each specification should focus on one aspect of your system:

```json
// Good: Focused on authentication
{
  "name": "user-authentication",
  "requirements": [
    "Users can register with email and password",
    "Passwords must be hashed",
    "Sessions expire after 24 hours"
  ]
}

// Bad: Too broad
{
  "name": "user-management",
  "requirements": [
    "Users can register",
    "Users can login",
    "Users can update profile",
    "Users can delete account",
    "Admin can manage users",
    "Users can upload files",
    "Users can send messages"
  ]
}
```

##### Testable Requirements

Write requirements that can be automatically validated:

```json
{
  "name": "password-policy",
  "requirements": [
    {
      "description": "Password must be at least 8 characters",
      "validation": {
        "type": "length",
        "min": 8,
        "test": "password.length >= 8"
      }
    },
    {
      "description": "Password must contain uppercase letters",
      "validation": {
        "type": "regex",
        "pattern": "[A-Z]",
        "test": "/[A-Z]/.test(password)"
      }
    }
  ],
  "test_cases": [
    {
      "input": "weak",
      "expected": false,
      "description": "Short password should fail"
    },
    {
      "input": "StrongPass123",
      "expected": true,
      "description": "Strong password should pass"
    }
  ]
}
```

### Mutation Best Practices

#### Atomic Mutations

Keep mutations focused and atomic:

```javascript
// Good: Single focused change
const mutation = await lattice.mutations.create({
  spec_id: "user-auth",
  title: "Add password hashing with bcrypt",
  changes: {
    type: "security",
    files_modified: ["src/auth.js"],
    description: "Implement secure password hashing"
  }
});

// Bad: Multiple unrelated changes
const mutation = await lattice.mutations.create({
  spec_id: "user-auth",
  title: "Various security and UI improvements",
  changes: {
    type: "feature",
    files_modified: [
      "src/auth.js",
      "src/components/Login.js",
      "src/styles/auth.css",
      "docs/api.md"
    ],
    description: "Multiple improvements across the application"
  }
});
```

#### Descriptive Titles and Descriptions

Provide clear and descriptive information:

```javascript
// Good
const mutation = await lattice.mutations.create({
  title: "Implement JWT token refresh mechanism",
  description: "Add automatic token refresh to prevent session expiration during active user sessions. Includes refresh token storage and renewal logic.",
  // ...
});

// Bad
const mutation = await lattice.mutations.create({
  title: "Auth fix",
  description: "Fixed auth issues",
  // ...
});
```

#### Link to External Resources

Always link mutations to related resources:

```javascript
const mutation = await lattice.mutations.create({
  title: "Fix password reset vulnerability",
  description: "Address security issue in password reset flow",
  metadata: {
    ticket_id: "SEC-123",
    pull_request: "https://github.com/company/repo/pull/456",
    security_advisory: "CVE-2024-1234",
    related_documentation: "https://confluence.company.com/security/password-reset"
  }
});
```

### Testing Best Practices

#### Test Coverage Requirements

Always meet the minimum test coverage requirements:

```javascript
// .lattice/config.json
{
  "testing": {
    "coverage": {
      "minimum": 80,
      "per_file": 70,
      "exclude_patterns": ["*.test.js", "*.spec.js", "dist/"]
    },
    "requirements": {
      "unit_tests": true,
      "integration_tests": true,
      "e2e_tests": "for_critical_paths"
    }
  }
}
```

#### Test Organization

Organize tests to match your specifications:

```javascript
// tests/unit/auth/user-authentication.test.js
describe('User Authentication', () => {
  describe('Registration', () => {
    // Tests for user registration requirements
  });

  describe('Login', () => {
    // Tests for login requirements
  });

  describe('Session Management', () => {
    // Tests for session requirements
  });
});

// tests/integration/auth/user-auth-flows.test.js
describe('User Authentication Flows', () => {
  describe('Registration Flow', () => {
    // Integration tests for complete registration flow
  });

  describe('Login Flow', () => {
    // Integration tests for complete login flow
  });
});
```

#### Automated Test Generation

Use specifications to generate test templates:

```javascript
// tools/generate-tests.js
const spec = require('../.lattice/specs/user-auth.json');

function generateTestSuite(spec) {
  const testSuite = `
describe('${spec.name}', () => {
${spec.requirements.map(req => `
  it('should satisfy: ${req}', async () => {
    // TODO: Implement test for requirement
    expect(true).toBe(true);
  });
`).join('')}
});
`;

  return testSuite;
}

// Generate test file
const testContent = generateTestSuite(spec);
require('fs').writeFileSync(
  `tests/unit/${spec.name}.generated.test.js`,
  testContent
);
```

### Security Best Practices

#### Security-First Specifications

Always include security requirements in your specifications:

```json
{
  "name": "api-security",
  "security_requirements": [
    {
      "description": "All API endpoints must be authenticated",
      "implementation": "JWT middleware on all routes",
      "validation": "test_unauthenticated_access_returns_401"
    },
    {
      "description": "Input validation must prevent injection attacks",
      "implementation": "Input sanitization and validation",
      "validation": "test_sql_injection_attempts_fail"
    },
    {
      "description": "Rate limiting must prevent brute force attacks",
      "implementation": "Rate limiting middleware",
      "validation": "test_rate_limiting_blocks_excessive_requests"
    }
  ]
}
```

#### Security Scanning Integration

Integrate automated security scanning into your workflows:

```json
{
  "name": "security-review",
  "steps": [
    {
      "name": "Static Analysis",
      "tools": ["semgrep", "eslint-plugin-security"],
      "required": true
    },
    {
      "name": "Dependency Scanning",
      "tools": ["snyk", "npm-audit"],
      "required": true
    },
    {
      "name": "Container Scanning",
      "tools": ["trivy", "clair"],
      "condition": "containerized_application"
    },
    {
      "name": "Manual Security Review",
      "assignees": ["security-team@company.com"],
      "required_for": "high_risk_changes"
    }
  ]
}
```

### Performance Best Practices

#### Performance Specifications

Include performance requirements in your specifications:

```json
{
  "name": "api-performance",
  "performance_requirements": [
    {
      "endpoint": "/api/v1/users",
      "method": "GET",
      "max_response_time": "200ms",
      "max_throughput": "1000 req/s",
      "max_memory_usage": "512MB"
    },
    {
      "endpoint": "/api/v1/auth/login",
      "method": "POST",
      "max_response_time": "500ms",
      "max_throughput": "100 req/s",
      "max_cpu_usage": "80%"
    }
  ],
  "monitoring": {
    "metrics": ["response_time", "throughput", "error_rate", "memory_usage"],
    "alerts": [
      {
        "metric": "response_time",
        "threshold": "500ms",
        "action": "alert_team"
      }
    ]
  }
}
```

#### Performance Testing

Include performance tests in your CI/CD pipeline:

```yaml
# .github/workflows/performance.yml
name: Performance Testing

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Start application
        run: npm start &

      - name: Wait for application
        run: sleep 30

      - name: Run performance tests
        run: npm run test:performance

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: performance-results/
```

### Documentation Best Practices

#### Living Documentation

Keep documentation synchronized with your code:

```json
{
  "name": "api-documentation",
  "documentation_requirements": [
    {
      "type": "api_docs",
      "format": "openapi",
      "auto_generate": true,
      "sync_with_code": true
    },
    {
      "type": "readme",
      "sections": ["installation", "usage", "contributing"],
      "auto_update": true
    },
    {
      "type": "changelog",
      "auto_generate": true,
      "include_mutations": true
    }
  ]
}
```

#### Documentation Generation

Automatically generate documentation from specifications:

```javascript
// tools/generate-docs.js
const fs = require('fs');
const path = require('path');

async function generateApiDocs() {
  const specsDir = path.join(__dirname, '../.lattice/specs');
  const docsDir = path.join(__dirname, '../docs/api');

  const specs = fs.readdirSync(specsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(path.join(specsDir, file))));

  const apiDocs = {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '2.1.0',
      description: 'Auto-generated API documentation'
    },
    paths: {}
  };

  for (const spec of specs) {
    if (spec.type === 'api' && spec.endpoints) {
      for (const endpoint of spec.endpoints) {
        apiDocs.paths[endpoint.path] = {
          [endpoint.method.toLowerCase()]: {
            summary: endpoint.description,
            requestBody: endpoint.request,
            responses: endpoint.responses
          }
        };
      }
    }
  }

  fs.writeFileSync(
    path.join(docsDir, 'openapi.json'),
    JSON.stringify(apiDocs, null, 2)
  );
}

generateApiDocs();
```

### Monitoring and Observability

#### Monitoring Specifications

Include monitoring requirements in your specifications:

```json
{
  "name": "monitoring",
  "monitoring_requirements": [
    {
      "metric": "response_time",
      "type": "histogram",
      "buckets": [10, 50, 100, 200, 500, 1000],
      "alert_threshold": "500ms"
    },
    {
      "metric": "error_rate",
      "type": "counter",
      "alert_threshold": "5%"
    },
    {
      "metric": "active_sessions",
      "type": "gauge",
      "alert_threshold": {
        "max": 10000,
        "min": 1
      }
    }
  ],
  "logging": {
    "level": "info",
    "format": "json",
    "fields": ["timestamp", "level", "message", "user_id", "request_id"]
  }
}
```

#### Health Checks

Implement comprehensive health checks:

```javascript
// src/health.js
class HealthChecker {
  constructor() {
    this.checks = {
      database: this.checkDatabase.bind(this),
      redis: this.checkRedis.bind(this),
      external_api: this.checkExternalApi.bind(this)
    };
  }

  async checkHealth() {
    const results = {};

    for (const [name, check] of Object.entries(this.checks)) {
      try {
        const start = Date.now();
        await check();
        results[name] = {
          status: 'healthy',
          response_time: Date.now() - start
        };
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    const overallStatus = Object.values(results)
      .every(result => result.status === 'healthy') ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results
    };
  }

  async checkDatabase() {
    // Database health check
  }

  async checkRedis() {
    // Redis health check
  }

  async checkExternalApi() {
    // External API health check
  }
}

module.exports = HealthChecker;
```

These best practices will help you build robust, maintainable, and scalable applications with Lattice Engine. Remember to adapt these guidelines to your specific project requirements and team workflows.

---

*This concludes the comprehensive tutorials and guides for Lattice Engine. For more specific information, refer to the individual documentation sections or contact our support team.*