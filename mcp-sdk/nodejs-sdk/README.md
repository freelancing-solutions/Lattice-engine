# Lattice MCP SDK for Node.js

A comprehensive TypeScript/JavaScript SDK for interacting with the Lattice Engine API. This SDK provides full support for authentication, project management, mutation operations, and real-time updates.

## Features

- 🔐 **Authentication Management** - API key and token-based authentication with automatic refresh
- 📁 **Project Management** - Create, read, update, and list projects
- 🔄 **Mutation Operations** - Propose, approve, reject, and track mutations
- 🚀 **TypeScript Support** - Full type definitions for enhanced developer experience
- 🔄 **Automatic Retries** - Built-in retry logic with exponential backoff
- 📊 **Error Handling** - Comprehensive error types and handling
- ⚡ **Modern Async/Await** - Promise-based API with async/await support

## Installation

```bash
npm install @lattice/mcp-sdk
# or
yarn add @lattice/mcp-sdk
# or
pnpm add @lattice/mcp-sdk
```

## Quick Start

```typescript
import { LatticeClient } from '@lattice/mcp-sdk';

// Initialize the client
const client = new LatticeClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.lattice-engine.com' // optional, defaults to production
});

// Authenticate and get user info
const user = await client.authenticate();
console.log('Authenticated as:', user.email);

// List available projects
const projects = await client.listProjects();
console.log('Available projects:', projects.length);

// Create a new project
const newProject = await client.createProject({
  name: 'My New Project',
  description: 'A project created via the SDK',
  spec_content: '# Project Specification\n\nThis is my project spec.'
});

// Propose a mutation
const mutation = await client.proposeMutation({
  project_id: newProject.id,
  operation_type: 'update',
  changes: {
    files: {
      'src/main.ts': 'console.log("Hello, Lattice!");'
    }
  },
  description: 'Add main entry point'
});

console.log('Mutation proposed:', mutation.id);
```

## Configuration

The SDK can be configured with various options:

```typescript
import { LatticeClient, SDKConfig } from '@lattice/mcp-sdk';

const config: SDKConfig = {
  apiKey: 'your-api-key',           // Required: Your Lattice API key
  baseUrl: 'https://api.lattice-engine.com', // Optional: API base URL
  timeout: 30000,                   // Optional: Request timeout in ms (default: 30000)
  maxRetries: 3,                    // Optional: Max retry attempts (default: 3)
  retryDelay: 1000                  // Optional: Base retry delay in ms (default: 1000)
};

const client = new LatticeClient(config);
```

### Environment Variables

You can also configure the SDK using environment variables:

```bash
export LATTICE_API_KEY="your-api-key-here"
export LATTICE_BASE_URL="https://api.lattice-engine.com"
```

## API Reference

### Authentication

```typescript
// Authenticate with API key
const user = await client.authenticate();

// Get current user
const currentUser = client.getCurrentUser();

// Get current organization
const organization = client.getCurrentOrganization();
```

### Project Management

```typescript
// List all projects
const projects = await client.listProjects();

// Get a specific project
const project = await client.getProject('project-id');

// Create a new project
const newProject = await client.createProject({
  name: 'Project Name',
  description: 'Project description',
  spec_content: 'Project specification content'
});

// Update an existing project
const updatedProject = await client.updateProject('project-id', {
  name: 'Updated Name',
  description: 'Updated description'
});

// Set current project context
client.setCurrentProject(project);
const currentProject = client.getCurrentProject();
```

### Mutation Operations

```typescript
// Propose a mutation
const mutation = await client.proposeMutation({
  project_id: 'project-id',
  operation_type: 'create',
  changes: {
    files: {
      'new-file.ts': 'export const hello = "world";'
    }
  },
  description: 'Add new file'
});

// Get a specific mutation
const mutation = await client.getMutation('mutation-id');

// List mutations with filtering
const mutations = await client.listMutations({
  projectId: 'project-id',
  status: 'pending',
  limit: 10
});

// Approve a mutation
const approvedMutation = await client.approveMutation('mutation-id');

// Reject a mutation
const rejectedMutation = await client.rejectMutation('mutation-id', 'Reason for rejection');
```

### Utility Methods

```typescript
// Health check
const health = await client.healthCheck();

// Get system metrics
const metrics = await client.getMetrics();

// Update client configuration
client.updateConfig({
  timeout: 60000,
  maxRetries: 5
});

// Get current configuration
const config = client.getConfig();
```

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
import {
  LatticeError,
  AuthenticationError,
  AuthorizationError,
  ProjectNotFoundError,
  MutationError,
  ValidationError,
  NetworkError,
  RateLimitError,
  isLatticeError
} from '@lattice/mcp-sdk';

try {
  const user = await client.authenticate();
} catch (error) {
  if (isLatticeError(error)) {
    console.error('Lattice API Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('Context:', error.context);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { User, Project, Mutation, MutationStatus } from '@lattice/mcp-sdk';

// All API responses are fully typed
const projects: Project[] = await client.listProjects();
const user: User = await client.authenticate();

// Enums are available for type safety
const status: MutationStatus = MutationStatus.PENDING;
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/lattice-engine/mcp-sdk.git
cd mcp-sdk/nodejs-sdk

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Project Structure

```
nodejs-sdk/
├── src/
│   ├── auth.ts          # Authentication management
│   ├── client.ts        # Main client class
│   ├── exceptions.ts    # Error handling
│   ├── models.ts        # Type definitions
│   └── index.ts         # Main exports
├── dist/                # Compiled JavaScript
├── tests/               # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.lattice-engine.com)
- 💬 [Discord Community](https://discord.gg/lattice-engine)
- 🐛 [Issue Tracker](https://github.com/lattice-engine/mcp-sdk/issues)
- 📧 [Email Support](mailto:support@lattice-engine.com)

## Changelog

### v1.0.0
- Initial release
- Full API coverage for authentication, projects, and mutations
- TypeScript support with complete type definitions
- Comprehensive error handling
- Automatic retry logic with exponential backoff
- Authentication token management with automatic refresh