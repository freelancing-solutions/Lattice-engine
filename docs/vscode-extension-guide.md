# Lattice VSCode Extension Guide

## Overview

The Lattice VSCode Extension provides seamless integration between your development environment and the Lattice Engine. It enables developers to propose mutations, manage projects, and collaborate on code changes directly from within Visual Studio Code.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [Project Management](#project-management)
5. [Mutation Workflows](#mutation-workflows)
6. [Features](#features)
7. [Configuration](#configuration)
8. [Commands](#commands)
9. [Views and Panels](#views-and-panels)
10. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Visual Studio Code 1.74.0 or higher
- Node.js 16.0 or higher (for development)
- Active Lattice Engine account

### Install from Marketplace

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Lattice Engine"
4. Click "Install"

### Install from VSIX

1. Download the latest `.vsix` file from releases
2. Open VSCode
3. Press Ctrl+Shift+P and run "Extensions: Install from VSIX..."
4. Select the downloaded file

## Getting Started

### 1. Authentication

After installation, you'll need to authenticate with your Lattice account:

1. Open Command Palette (Ctrl+Shift+P)
2. Run "Lattice: Authenticate"
3. Enter your API key when prompted
4. The extension will verify your credentials and show your user info

### 2. Select or Create a Project

1. Open Command Palette (Ctrl+Shift+P)
2. Run "Lattice: Select Project" to choose an existing project
3. Or run "Lattice: Create Project" to create a new one

### 3. Start Proposing Mutations

1. Make changes to your code
2. Right-click in the editor and select "Propose Mutation"
3. Fill in the mutation details
4. Submit for review

## Authentication

The extension supports secure authentication using API keys.

### Setting Up Authentication

#### Method 1: Command Palette

1. Press Ctrl+Shift+P
2. Type "Lattice: Authenticate"
3. Enter your API key
4. The extension will store it securely

#### Method 2: Settings

1. Go to File > Preferences > Settings
2. Search for "Lattice"
3. Enter your API URL and other settings
4. Use the authenticate command to enter your API key

#### Method 3: Environment Variable

Set the `LATTICE_API_KEY` environment variable before starting VSCode:

```bash
export LATTICE_API_KEY=lk_live_your_api_key_here
code .
```

### API Key Management

- API keys are stored securely using VSCode's SecretStorage API
- Keys are encrypted and tied to your VSCode installation
- Use "Lattice: Sign Out" to clear stored credentials

### Authentication Status

The extension shows your authentication status in:
- Status bar (bottom of VSCode)
- Lattice Projects view
- Command palette commands

## Project Management

### Creating Projects

1. **From Command Palette:**
   - Run "Lattice: Create Project"
   - Enter project name and description
   - Choose visibility (private/public)

2. **Auto-detection:**
   - The extension can auto-detect project settings from your workspace
   - It reads `package.json`, `README.md`, and other files to suggest project details

### Selecting Projects

1. **From Projects View:**
   - Expand the Lattice Projects panel
   - Click on any project to select it

2. **From Command Palette:**
   - Run "Lattice: Select Project"
   - Choose from the list of available projects

### Project Synchronization

The extension automatically syncs your project specification:

- **Auto-sync on save:** When you save `lattice.spec`, it's automatically uploaded
- **Manual sync:** Use "Lattice: Sync Project Spec" command
- **Conflict resolution:** The extension handles conflicts between local and remote specs

### Project Views

The **Lattice Projects** view shows:
- Current active project
- Project specifications
- Recent mutations
- Project members (if you have access)

## Mutation Workflows

### Proposing Mutations

#### Method 1: Context Menu

1. Right-click in the editor
2. Select "Propose Mutation"
3. Fill in the mutation form:
   - **Description:** What changes you're making
   - **Risk Level:** Low, Medium, or High
   - **Operation Type:** Create, Update, Delete, or Refactor

#### Method 2: Command Palette

1. Press Ctrl+Shift+P
2. Run "Lattice: Propose Mutation"
3. Follow the same form process

#### Method 3: File Explorer

1. Right-click on files/folders in the Explorer
2. Select "Propose Mutation for Selection"
3. The extension will include the selected files in the mutation

### Mutation Details

When proposing a mutation, you can specify:

- **Files to include:** Select which changed files to include
- **Description:** Detailed explanation of changes
- **Risk level:** Assessment of potential impact
- **Metadata:** Additional context like branch name, issue number

### Viewing Mutations

#### Mutations Panel

The extension provides a dedicated view for mutations:
- **Pending:** Mutations awaiting approval
- **Approved:** Mutations ready for execution
- **Executed:** Completed mutations
- **Rejected:** Declined mutations

#### Mutation Details

Click on any mutation to see:
- Full description and metadata
- File changes (diff view)
- Approval status and comments
- Execution logs (if executed)

### Approval Workflow

If you have approval permissions:

1. **View pending mutations** in the Mutations panel
2. **Click on a mutation** to review details
3. **Use the approve/reject buttons** in the mutation view
4. **Add comments** to provide feedback

### Monitoring Execution

For approved mutations:
- Real-time execution status in the status bar
- Detailed logs in the Output panel
- Notifications for completion or errors

## Features

### 1. Code Intelligence

- **Syntax highlighting** for Lattice specification files
- **Auto-completion** for common mutation patterns
- **Error detection** for invalid specifications

### 2. File Watching

- **Auto-detection** of file changes
- **Smart filtering** to exclude irrelevant files (node_modules, .git, etc.)
- **Batch change detection** for related file modifications

### 3. Diff Visualization

- **Side-by-side diff** for proposed changes
- **Inline diff** markers in the editor
- **Change summary** showing additions, deletions, and modifications

### 4. Notifications

- **Toast notifications** for important events
- **Status bar updates** for ongoing operations
- **Progress indicators** for long-running tasks

### 5. Integration Features

- **Git integration:** Detect branch names and commit hashes
- **Workspace awareness:** Understand project structure
- **Multi-root workspace support:** Handle multiple projects

## Configuration

### Extension Settings

Access settings via File > Preferences > Settings, then search for "Lattice":

#### Basic Settings

```json
{
    "lattice.apiUrl": "https://api.lattice.dev",
    "lattice.autoSync": true,
    "lattice.showNotifications": true,
    "lattice.defaultRiskLevel": "medium"
}
```

#### Advanced Settings

```json
{
    "lattice.timeout": 30000,
    "lattice.maxRetries": 3,
    "lattice.enableDebugLogging": false,
    "lattice.excludePatterns": [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**"
    ]
}
```

### Workspace Settings

You can also configure settings per workspace in `.vscode/settings.json`:

```json
{
    "lattice.apiUrl": "https://api-dev.lattice.dev",
    "lattice.defaultRiskLevel": "low",
    "lattice.autoSync": false
}
```

### Environment Variables

The extension respects these environment variables:

- `LATTICE_API_KEY`: Default API key
- `LATTICE_API_URL`: Default API URL
- `LATTICE_DEBUG`: Enable debug logging

## Commands

### Authentication Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `lattice.authenticate` | Authenticate with Lattice | - |
| `lattice.signOut` | Sign out and clear credentials | - |

### Project Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `lattice.createProject` | Create a new project | - |
| `lattice.selectProject` | Select active project | - |
| `lattice.refreshProjects` | Refresh projects list | - |
| `lattice.syncProjectSpec` | Sync project specification | - |

### Mutation Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `lattice.proposeMutation` | Propose a mutation | Ctrl+Shift+M |
| `lattice.proposeMutationFromContext` | Propose mutation for selection | - |
| `lattice.viewMutations` | Open mutations panel | - |
| `lattice.approveMutation` | Approve selected mutation | - |
| `lattice.rejectMutation` | Reject selected mutation | - |

### Utility Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `lattice.openSettings` | Open Lattice settings | - |
| `lattice.showLogs` | Show extension logs | - |
| `lattice.reportIssue` | Report an issue | - |

## Views and Panels

### 1. Lattice Projects View

Located in the Explorer sidebar, this view shows:

```
📁 Lattice Projects
├── 🏠 Current Project: My App
│   ├── 📄 lattice.spec
│   ├── 👥 Members (3)
│   └── 📊 Statistics
├── 📋 Recent Projects
│   ├── Project A
│   ├── Project B
│   └── Project C
└── ➕ Create New Project
```

### 2. Mutations Panel

Shows all mutations with filtering options:

```
🔄 Mutations
├── 📥 Pending (2)
│   ├── Fix authentication bug
│   └── Add new feature
├── ✅ Approved (1)
│   └── Update dependencies
├── 🚀 Executed (5)
└── ❌ Rejected (1)
```

### 3. Status Bar Integration

The status bar shows:
- Authentication status
- Active project name
- Mutation count
- Sync status

### 4. Output Panel

Dedicated output channel for:
- Extension logs
- API responses
- Error messages
- Mutation execution logs

## Troubleshooting

### Common Issues

#### 1. Authentication Failures

**Problem:** "Authentication failed" error

**Solutions:**
- Verify your API key is correct
- Check if your account has the necessary permissions
- Ensure the API URL is correct
- Try signing out and authenticating again

#### 2. Project Not Found

**Problem:** "Project not found" error

**Solutions:**
- Refresh the projects list
- Verify you have access to the project
- Check if the project was deleted or moved
- Ensure you're authenticated with the correct account

#### 3. Sync Issues

**Problem:** Project spec won't sync

**Solutions:**
- Check your internet connection
- Verify the `lattice.spec` file is valid
- Look for conflicts in the Output panel
- Try manual sync with "Lattice: Sync Project Spec"

#### 4. Performance Issues

**Problem:** Extension is slow or unresponsive

**Solutions:**
- Check if you have large files in your workspace
- Review exclude patterns in settings
- Disable auto-sync temporarily
- Restart VSCode

### Debug Mode

Enable debug logging to troubleshoot issues:

1. Open settings
2. Set `lattice.enableDebugLogging` to `true`
3. Restart VSCode
4. Check the Output panel for detailed logs

### Log Files

Extension logs are available in:
- **Output Panel:** View > Output > Lattice Extension
- **Developer Console:** Help > Toggle Developer Tools

### Getting Help

If you encounter issues:

1. **Check the logs** in the Output panel
2. **Search existing issues** on GitHub
3. **Report a bug** using "Lattice: Report Issue" command
4. **Contact support** through the Lattice dashboard

### Known Limitations

- **Large files:** Files over 10MB are excluded from mutations
- **Binary files:** Only text files are supported for diff viewing
- **Network:** Requires stable internet connection for real-time features
- **Permissions:** Some features require specific organization roles

## Advanced Usage

### Custom Workflows

#### Automated Mutation Proposals

Create a task in `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Propose Mutation",
            "type": "shell",
            "command": "${command:lattice.proposeMutation}",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}
```

#### Git Integration

Use Git hooks to automatically propose mutations:

```bash
#!/bin/sh
# .git/hooks/pre-commit
code --command lattice.proposeMutation
```

### API Integration

The extension exposes an API for other extensions:

```typescript
// In another extension
const latticeExt = vscode.extensions.getExtension('lattice.vscode-extension');
if (latticeExt) {
    const api = latticeExt.exports;
    await api.proposeMutation({
        description: "Automated change",
        files: ["src/index.js"],
        riskLevel: "low"
    });
}
```

### Keyboard Shortcuts

Customize shortcuts in `keybindings.json`:

```json
[
    {
        "key": "ctrl+shift+m",
        "command": "lattice.proposeMutation",
        "when": "editorTextFocus"
    },
    {
        "key": "ctrl+shift+l",
        "command": "lattice.viewMutations"
    }
]
```

## Migration Guide

### From Manual Workflow

If you're currently using the Lattice web interface:

1. **Install the extension** and authenticate
2. **Import your projects** using "Select Project"
3. **Start using VSCode commands** instead of web interface
4. **Configure auto-sync** to keep specs updated

### From Other Tools

If you're migrating from other code review tools:

1. **Map your workflows** to Lattice mutation concepts
2. **Update your team processes** to use VSCode integration
3. **Configure notifications** to match your current setup
4. **Train team members** on the new workflow

## Best Practices

### 1. Project Organization

- Keep `lattice.spec` files up to date
- Use descriptive project names
- Organize projects by team or feature area

### 2. Mutation Proposals

- Write clear, descriptive mutation descriptions
- Include relevant context and reasoning
- Use appropriate risk levels
- Test changes before proposing

### 3. Code Review

- Review mutations promptly
- Provide constructive feedback
- Use the diff view to understand changes
- Ask questions when unclear

### 4. Team Collaboration

- Establish mutation approval workflows
- Set up notification preferences
- Use consistent naming conventions
- Document team-specific processes

## Future Features

Planned enhancements include:

- **Real-time collaboration:** Live editing with team members
- **Advanced diff tools:** Better visualization of complex changes
- **Integration plugins:** Support for popular development tools
- **Custom templates:** Predefined mutation templates
- **Automated testing:** Integration with CI/CD pipelines

Stay updated with the latest features by following our [changelog](./changelog.md).