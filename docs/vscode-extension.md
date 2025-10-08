# VSCode Extension v1.5.2

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Code Completion & IntelliSense](#code-completion--intellisense)
3. [Real-time Validation](#real-time-validation)
4. [Debugging Tools](#debugging-tools)
5. [Custom Workflows](#custom-workflows)

---

## Installation & Setup

### Requirements

- **VSCode** version 1.74.0 or higher
- **Node.js** version 16.0 or higher (for JavaScript projects)
- **Python** version 3.8 or higher (for Python projects)
- **Lattice Engine API key** (free tier available)

### Installation Methods

#### Method 1: VSCode Marketplace (Recommended)

1. Open VSCode
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for "**Lattice Engine**"
4. Click **Install** on the official extension
5. Wait for installation to complete

#### Method 2: Manual Installation

1. Download the latest `.vsix` file from [GitHub Releases](https://github.com/lattice-engine/vscode-extension/releases)
2. Open VSCode
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "**Extensions: Install from VSIX...**"
5. Select the downloaded `.vsix` file

### Initial Setup

#### 1. Configure API Key

After installation, you'll be prompted to configure your API key:

```json
{
  "lattice.apiKey": "your-api-key-here",
  "lattice.projectId": "your-project-id-here"
}
```

**To get your API key:**
1. Visit [lattice.dev/dashboard](https://lattice.dev/dashboard)
2. Go to **Settings** → **API Keys**
3. Click "**Generate New Key**"
4. Copy the key and paste it in VSCode

#### 2. Configure Workspace

Create a `.lattice` folder in your project root with the following files:

**`.lattice/config.json`**
```json
{
  "project": {
    "id": "your-project-id",
    "name": "Your Project Name",
    "type": "javascript" // or "python"
  },
  "specs": {
    "auto_sync": true,
    "validation": "strict"
  },
  "notifications": {
    "enabled": true,
    "types": ["mutation_created", "review_requested"]
  }
}
```

**`.lattice/settings.json`**
```json
{
  "vscode": {
    "auto_complete": true,
    "real_time_validation": true,
    "show_status_bar": true,
    "integrations": {
      "git": true,
      "eslint": true,
      "prettier": true
    }
  }
}
```

#### 3. Verify Installation

Open the Command Palette (`Ctrl+Shift+P`) and type "**Lattice: Status**". You should see:

```
✅ Lattice Engine Extension: Active
✅ API Connection: Connected
✅ Project: Your Project Name
✅ Specifications: Synced
```

### Extension Features Overview

- **Status Bar Integration**: Shows connection status and pending mutations
- **Command Palette Commands**: Quick access to all Lattice features
- **Sidebar Panel**: Dedicated Lattice panel for project management
- **Code Lenses**: Inline actions for mutations and specifications
- **Diagnostic Integration**: Real-time validation errors and warnings
- **Snippets**: Pre-built code templates for common patterns

---

## Code Completion & IntelliSense

### Basic Autocomplete

The extension provides intelligent code completion for all Lattice Engine APIs:

```javascript
// Type 'lattice.' to see available methods
lattice. // Shows: mutations, specs, deploy, etc.

// Example completion suggestions:
lattice.mutations.create({
  spec_id: "", // Auto-complete spec IDs
  title: "",
  changes: {} // Context-aware completion
});
```

### Dynamic Completion

The extension analyzes your project to provide context-aware suggestions:

#### Specification Completion
```javascript
// Auto-complete available specifications
const mutation = await lattice.mutations.create({
  spec_id: "user-auth", // Shows: ["user-auth", "api-endpoints", "database-schema"]
  // ...
});
```

#### Property Completion
```typescript
interface MutationRequest {
  spec_id: string;     // Auto-complete from available specs
  title: string;       // Smart suggestions based on changes
  description: string; // Context-aware templates
  changes: {
    type: string;      // Enum: ["security", "feature", "bugfix", "refactor"]
    files_modified: FileChange[];
    metadata: object;  // Dynamic based on project type
  };
}
```

### Custom Snippets

The extension includes powerful code snippets for common patterns:

#### Mutation Creation Snippet
Type `lattice-mutation` and press `Tab`:

```javascript
// Generated snippet
const mutation = await lattice.mutations.create({
  spec_id: "${1:spec-id}",
  title: "${2:descriptive title}",
  description: "${3:what this change does}",
  changes: {
    type: "${4:security|feature|bugfix|refactor}",
    files_modified: [
      {
        path: "${5:file-path}",
        diff: "${6:git-diff}"
      }
    ]
  },
  metadata: {
    author: "${7:author}",
    ticket_id: "${8:ticket-id}"
  }
});
```

#### Specification Snippet
Type `lattice-spec` and press `Tab`:

```typescript
// Generated snippet
export const ${1:SpecName} = {
  name: "${2:spec-name}",
  version: "${3:1.0.0}",
  description: "${4:specification description}",

  requirements: [
    "${5:requirement-1}",
    "${6:requirement-2}"
  ],

  validation: {
    test_coverage: ${7:80},
    security_scan: true,
    automated_tests: true
  },

  examples: {
    valid: "${8:valid example}",
    invalid: "${9:invalid example}"
  }
};
```

### IntelliSense Configuration

Customize IntelliSense behavior in your VSCode settings:

```json
{
  "lattice.intelliSense": {
    "enabled": true,
    "showSnippets": true,
    "autoImport": true,
    "completionDelay": 100,
    "maxSuggestions": 10
  },

  "lattice.suggestions": {
    "includeDeprecated": false,
    "sortAlphabetically": false,
    "showDocumentation": true
  }
}
```

---

## Real-time Validation

### Live Error Checking

The extension provides real-time validation as you type:

#### Syntax Validation
```javascript
// ❌ Error detected immediately
const mutation = await lattice.mutations.create({
  spec_id: "invalid-spec", // Red underline: "Spec ID not found"
  title: "", // Warning: "Title is required"
  // ...
});
```

#### Type Safety
```typescript
// ✅ TypeScript integration
interface MutationResponse {
  id: string;
  status: "pending" | "approved" | "rejected" | "deployed";
  // Auto-completion and type checking
}

const response: MutationResponse = await lattice.mutations.create(/*...*/);
```

### Diagnostic Integration

Validation errors appear directly in your editor:

```javascript
// Example with diagnostics
const mutation = await lattice.mutations.create({
  spec_id: "user-auth",           // ✅ Valid spec
  title: "Fix login bug",         // ⚠️ Warning: "Consider more descriptive title"
  description: "",                // ❌ Error: "Description is required"
  changes: {
    type: "invalid-type",         // ❌ Error: "Invalid mutation type"
    files_modified: []            // ⚠️ Warning: "No files specified"
  }
});
```

### Real-time Status Updates

The status bar shows real-time information:

```
Lattice: Connected | 3 Pending | Last Sync: 2 min ago
```

**Status indicators:**
- **🟢 Green**: All systems operational
- **🟡 Yellow**: Warnings or minor issues
- **🔴 Red**: Connection issues or errors
- **🔄 Blue**: Syncing in progress

### Validation Rules

#### Specification Validation
- **Required Fields**: All required fields must be present
- **Field Types**: Correct data types for all fields
- **Business Logic**: Project-specific validation rules
- **Security**: Security policy compliance

#### Mutation Validation
- **Risk Assessment**: Automated risk scoring
- **Test Coverage**: Minimum test coverage requirements
- **Security Scan**: Security vulnerability detection
- **Dependencies**: Dependency conflict checking

### Custom Validation Rules

Create custom validation rules in `.lattice/validation.json`:

```json
{
  "rules": [
    {
      "name": "require_ticket_id",
      "type": "required",
      "field": "metadata.ticket_id",
      "message": "All mutations must reference a ticket"
    },
    {
      "name": "min_description_length",
      "type": "length",
      "field": "description",
      "min": 20,
      "message": "Description must be at least 20 characters"
    },
    {
      "name": "security_review_required",
      "type": "conditional",
      "condition": "changes.type === 'security'",
      "required": "metadata.security_review",
      "message": "Security changes require security review metadata"
    }
  ]
}
```

---

## Debugging Tools

### Integrated Debugging

The extension provides powerful debugging capabilities:

#### Mutation Debugger
```javascript
// Set breakpoints in mutation creation
const mutation = await lattice.mutations.create({
  spec_id: "user-auth",
  title: "Add password hashing",
  // Breakpoint can be set here
  changes: { /*...*/ }
});

// Debug panel shows:
// - API request/response
// - Risk assessment details
// - Validation results
// - Dependencies analysis
```

#### Specification Debugger
```typescript
// Debug specification validation
const userAuthSpec = {
  name: "user-auth",
  requirements: [
    "Passwords must be hashed using bcrypt", // ✅ Valid
    "All auth events must be logged",        // ✅ Valid
    "Invalid requirement"                    // ❌ Debug this
  ]
};
```

### Debug Console

Access the debug console with `Ctrl+Shift+P` → "**Lattice: Open Debug Console**":

```javascript
// Debug commands available
> lattice.status
// Shows: Connection status, project info, last sync

> lattice.mutations.list({status: "pending"})
// Shows: List of pending mutations

> lattice.validate.mutation("mut_123")
// Shows: Detailed validation results

> lattice.risk.assess({changes: {...}})
// Shows: Risk assessment with factors and scores
```

### Error Investigation

#### Error Details Panel
When an error occurs, click on it to see detailed information:

```json
{
  "error": "validation_failed",
  "message": "Mutation validation failed",
  "details": {
    "field": "changes.type",
    "issue": "Invalid mutation type",
    "allowed_values": ["security", "feature", "bugfix", "refactor"],
    "suggestion": "Use 'security' for security-related changes"
  },
  "context": {
    "mutation_id": "mut_abc123",
    "spec_id": "user-auth",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Quick Fix Actions
Right-click on errors to see quick fix options:

- **Fix Field**: Automatically fix common issues
- **Create Spec**: Create missing specification
- **Add Metadata**: Add required metadata fields
- **Request Review**: Open review request

### Performance Profiling

Monitor extension performance:

```javascript
// Performance metrics available in debug console
> lattice.performance.stats()

{
  "api_requests": {
    "total": 45,
    "average_response_time": "120ms",
    "success_rate": "98%"
  },
  "validation": {
    "average_time": "15ms",
    "cache_hit_rate": "75%"
  },
  "sync": {
    "last_sync": "2 minutes ago",
    "sync_time": "250ms"
  }
}
```

---

## Custom Workflows

### Workflow Configuration

Create custom workflows in `.lattice/workflows.json`:

```json
{
  "workflows": [
    {
      "name": "security_review",
      "trigger": "mutation.type === 'security'",
      "actions": [
        {
          "type": "assign_reviewer",
          "reviewer": "security-team@company.com",
          "message": "Security review required"
        },
        {
          "type": "run_security_scan",
          "tools": ["snyk", "semgrep"]
        },
        {
          "type": "require_approval",
          "count": 2,
          "roles": ["security_lead", "team_lead"]
        }
      ]
    },
    {
      "name": "auto_deploy_low_risk",
      "trigger": "mutation.risk_score === 'low' && mutation.test_coverage >= 90",
      "actions": [
        {
          "type": "auto_approve",
          "reason": "Low risk with high test coverage"
        },
        {
          "type": "deploy",
          "environment": "staging",
          "rollback_on_failure": true
        }
      ]
    }
  ]
}
```

### Command Palette Integration

Add custom commands to the VSCode Command Palette:

```json
{
  "lattice.commands": {
    "create_security_mutation": {
      "title": "Lattice: Create Security Mutation",
      "command": "lattice.createMutation",
      "args": {
        "template": "security",
        "spec_id": "security-policy"
      }
    },
    "sync_all_specs": {
      "title": "Lattice: Sync All Specifications",
      "command": "lattice.syncSpecs",
      "args": {
        "force": true
      }
    },
    "approve_all_pending": {
      "title": "Lattice: Approve All Pending (Admin)",
      "command": "lattice.bulkApprove",
      "args": {
        "status": "pending"
      }
    }
  }
}
```

### Custom Extensions

Extend the extension with custom functionality:

#### Custom Validators
```typescript
// .lattice/extensions/custom-validator.ts
import { Validator, ValidationResult } from '@lattice/vscode-api';

export class CustomSecurityValidator implements Validator {
  validate(mutation: any): ValidationResult {
    // Custom validation logic
    if (mutation.changes.type === 'security') {
      // Check for security patterns
      const hasSecurityReview = mutation.metadata?.security_review;

      if (!hasSecurityReview) {
        return {
          valid: false,
          errors: ['Security changes require security review metadata'],
          severity: 'error'
        };
      }
    }

    return { valid: true };
  }
}
```

#### Custom Actions
```typescript
// .lattice/extensions/custom-actions.ts
import { Action, Context } from '@lattice/vscode-api';

export class SlackNotificationAction implements Action {
  async execute(context: Context): Promise<void> {
    if (context.mutation.status === 'approved') {
      await this.sendSlackNotification({
        channel: '#deployments',
        message: `✅ Mutation approved: ${context.mutation.title}`,
        actions: [
          {
            type: 'button',
            text: 'View Details',
            url: context.mutation.url
          }
        ]
      });
    }
  }

  private async sendSlackNotification(payload: any): Promise<void> {
    // Slack API integration
  }
}
```

### Integration with Other Extensions

#### Git Integration
```json
{
  "lattice.integrations": {
    "git": {
      "auto_commit": true,
      "commit_template": "feat: ${mutation.title}\n\n${mutation.description}\n\nCloses: ${metadata.ticket_id}",
      "branch_naming": "lattice/${mutation.id}-${mutation.title}"
    }
  }
}
```

#### ESLint Integration
```json
{
  "lattice.integrations": {
    "eslint": {
      "auto_fix": true,
      "rules": {
        "lattice/require-mutation-id": "error",
        "lattice/validate-spec-compliance": "warn"
      }
    }
  }
}
```

#### Docker Integration
```json
{
  "lattice.integrations": {
    "docker": {
      "auto_build": true,
      "build_context": ".",
      "dockerfile": "Dockerfile",
      "tag_template": "lattice-${mutation.id}"
    }
  }
}
```

### Keyboard Shortcuts

Customize keyboard shortcuts in VSCode settings:

```json
{
  "keybindings": [
    {
      "key": "ctrl+shift+l m",
      "command": "lattice.createMutation",
      "when": "editorTextFocus"
    },
    {
      "key": "ctrl+shift+l s",
      "command": "lattice.syncSpecs"
    },
    {
      "key": "ctrl+shift+l d",
      "command": "lattice.deploy",
      "when": "editorTextFocus"
    },
    {
      "key": "ctrl+shift+l v",
      "command": "lattice.validateCurrent"
    }
  ]
}
```

### Workspace Settings

Configure extension behavior per workspace:

**`.vscode/settings.json`**
```json
{
  "lattice.autoSave": true,
  "lattice.autoSync": true,
  "lattice.showDiagnostics": true,
  "lattice.enableIntelliSense": true,
  "lattice.debugMode": false,

  "lattice.notifications": {
    "showSuccess": true,
    "showWarnings": true,
    "showErrors": true,
    "soundEnabled": false
  },

  "lattice.ui": {
    "showStatusBar": true,
    "showActivityBar": true,
    "theme": "auto" // "light", "dark", "auto"
  }
}
```

---

## Troubleshooting

### Common Issues

#### Extension Not Loading
1. Check VSCode version compatibility (1.74+)
2. Restart VSCode
3. Disable/enable the extension
4. Check Extension Host logs (`Help > Toggle Developer Tools`)

#### API Connection Issues
1. Verify API key is correct and active
2. Check network connectivity
3. Confirm project ID is valid
4. Check API status at [status.lattice.dev](https://status.lattice.dev)

#### IntelliSense Not Working
1. Ensure TypeScript/JavaScript language features are enabled
2. Check that `.lattice/config.json` exists and is valid
3. Restart the TypeScript server (`Ctrl+Shift+P` → "TypeScript: Restart TS server")
4. Verify file associations in VSCode settings

### Debug Mode

Enable debug mode for detailed logging:

```json
{
  "lattice.debug": {
    "enabled": true,
    "logLevel": "debug", // "error", "warn", "info", "debug"
    "logToFile": true,
    "logFile": "/tmp/lattice-debug.log"
  }
}
```

### Getting Help

- **Documentation**: [docs.lattice.dev/vscode](https://docs.lattice.dev/vscode)
- **Issues**: [GitHub Issues](https://github.com/lattice-engine/vscode-extension/issues)
- **Community**: [Discord #vscode-extension](https://discord.gg/lattice)
- **Support**: vscode-support@lattice.dev

---

## Updates & Changelog

### Version 1.5.2 (Current)
- ✅ Improved IntelliSense performance
- ✅ Added custom workflow support
- ✅ Enhanced debugging capabilities
- ✅ Fixed memory leak in real-time validation

### Recent Updates
- **v1.5.1**: Improved error handling and user feedback
- **v1.5.0**: Added MCP server integration
- **v1.4.2**: Enhanced Git integration
- **v1.4.0**: Introduced real-time validation

---

*VSCode Extension Documentation v1.5.2 - Last updated: January 15, 2024*