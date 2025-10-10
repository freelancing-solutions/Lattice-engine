# Lattice MCP Server

A Model Context Protocol (MCP) server that provides agent orchestration capabilities for the Lattice Mutation Engine. This server enables coding agents to interact with the Lattice Engine for specification management, validation, approval workflows, and intelligent agent orchestration.

## Features

### Core Capabilities
- **Agent Orchestration**: Request and coordinate complex operations across multiple AI agents
- **Specification Management**: Create, read, update, and delete nodes and edges in the specification graph
- **Real-time Communication**: WebSocket integration for live updates and notifications
- **Approval Workflow**: Handle approval requests for specification changes
- **Validation**: Comprehensive validation of specifications, nodes, and edges
- **Health Monitoring**: Built-in health checks and system monitoring

### MCP Integration
- **Tools**: 11 comprehensive tools for specification and agent management
- **Resources**: Access to specification graph, approval queue, and validation results
- **Prompts**: AI-assisted prompts for impact analysis, improvements, and conflict resolution

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- Access to a running Lattice Mutation Engine instance
- Valid API key for the Lattice Engine

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LATTICE_ENGINE_URL` | Lattice Engine API URL | `http://localhost:8000` |
| `LATTICE_ENGINE_WS_URL` | Lattice Engine WebSocket URL | `ws://localhost:8000/ws` |
| `LATTICE_API_KEY` | API key for authentication | Required |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging level | `info` |
| `JWT_SECRET` | JWT signing secret | Required |
| `HTTP_PROXY` / `HTTPS_PROXY` | Proxy for outbound HTTP(S) requests | unset |

See `.env.example` for all available configuration options.

## MCP Tools

### Specification Management
- `get_spec_graph` - Retrieve the complete specification graph
- `get_node` - Get details of a specific node
- `create_node` - Create a new node in the specification graph
- `update_node` - Update an existing node
- `delete_node` - Delete a node from the specification graph
- `create_edge` - Create relationships between nodes

### Agent Orchestration
- `orchestrate_agents` - Request complex operations from AI agents
  - Mutation analysis and execution
  - Validation and compliance checking
  - Conflict resolution
  - Impact analysis
  - Semantic analysis

### Approval Workflow
- `get_approval_requests` - Get all pending approval requests
- `handle_approval` - Approve or reject approval requests

### Validation & Health
- `validate_spec` - Validate specifications, nodes, or edges
- `get_health_status` - Get system health status

## MCP Resources

### Available Resources
- `lattice://spec-graph` - Complete specification graph data
- `lattice://approval-queue` - Current pending approval requests
- `lattice://validation-results` - Latest validation results

## MCP Prompts

### AI-Assisted Operations
- `analyze_spec_impact` - Analyze impact of proposed changes
- `suggest_spec_improvements` - Get improvement suggestions
- `resolve_conflicts` - Get help resolving specification conflicts

## Usage Examples

### Basic Specification Management

```typescript
// Get the specification graph
const graph = await mcpClient.callTool('get_spec_graph', {});

// Create a new node
const newNode = await mcpClient.callTool('create_node', {
  type: 'FUNCTION',
  name: 'calculateTotal',
  description: 'Calculates the total sum of items',
  properties: {
    parameters: ['items: number[]'],
    returnType: 'number'
  }
});

// Create a relationship
const edge = await mcpClient.callTool('create_edge', {
  sourceId: 'module-1',
  targetId: newNode.id,
  type: 'CONTAINS'
});
```

### Agent Orchestration

```typescript
// Request mutation analysis
const mutationResult = await mcpClient.callTool('orchestrate_agents', {
  type: 'mutation',
  payload: {
    operation: 'refactor_function',
    targetId: 'func-123',
    changes: {
      name: 'calculateTotalWithTax',
      parameters: ['items: number[]', 'taxRate: number']
    }
  },
  priority: 'high'
});

// Request impact analysis
const impactResult = await mcpClient.callTool('orchestrate_agents', {
  type: 'impact_analysis',
  payload: {
    changes: 'Adding new parameter to calculateTotal function',
    scope: 'function'
  },
  priority: 'medium'
});
```

### Approval Workflow

```typescript
// Get pending approvals
const approvals = await mcpClient.callTool('get_approval_requests', {});

// Approve a request
const approved = await mcpClient.callTool('handle_approval', {
  requestId: 'req-123',
  action: 'approve',
  comment: 'Changes look good, approved for implementation'
});

// Reject a request
const rejected = await mcpClient.callTool('handle_approval', {
  requestId: 'req-456',
  action: 'reject',
  reason: 'Breaking changes detected, needs revision'
});
```

### Validation

```typescript
// Validate entire graph
const graphValidation = await mcpClient.callTool('validate_spec', {
  target: 'graph'
});

// Validate specific node
const nodeValidation = await mcpClient.callTool('validate_spec', {
  target: 'node',
  targetId: 'node-123'
});
```

## Architecture

### Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │◄──►│   MCP Server     │◄──►│ Lattice Engine  │
│  (AI Agent)     │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │ Health Monitor   │
                       └──────────────────┘
```

### Key Services
- **LatticeEngineClient**: HTTP and WebSocket client for Lattice Engine communication
- **LatticeEngineServer**: Main MCP server implementation
- **HealthMonitor**: System health monitoring and metrics collection

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run clean` - Clean build artifacts

### Project Structure
```
src/
├── config/           # Configuration management
├── services/         # Core services
│   ├── lattice-client.ts    # Lattice Engine client
│   ├── mcp-server.ts        # MCP server implementation
│   └── health-monitor.ts    # Health monitoring
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
│   └── logger.ts     # Logging utilities
└── index.ts          # Application entry point
```

## Logging

The server uses structured logging with Winston:

- **Console**: Colorized output for development
- **File**: JSON logs for production (when `NODE_ENV=production`)
- **Components**: Separate loggers for different components
- **Levels**: error, warn, info, debug

### Log Categories
- `server` - Server lifecycle and general operations
- `mcp` - MCP protocol operations
- `lattice` - Lattice Engine communication
- `websocket` - WebSocket events
- `health` - Health monitoring
- `auth` - Authentication events

## Health Monitoring

The server includes comprehensive health monitoring:

### Health Endpoints
- System uptime and memory usage
- Service connectivity status
- Request/response metrics
- Error rates and performance data

### Alerts
- Automatic alerts for service degradation
- Configurable thresholds
- Event-based notifications

## Security

### Authentication
- JWT-based authentication
- API key validation
- Secure WebSocket connections

### Rate Limiting
- Configurable request limits
- Per-client rate limiting
- DDoS protection

### Security Headers
- Helmet.js integration
- CORS configuration
- Secure defaults

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify Lattice Engine is running
   - Check API key configuration
   - Validate network connectivity

2. **WebSocket Disconnections**
   - Check firewall settings
   - Verify WebSocket URL
   - Review reconnection logs

3. **Authentication Errors**
   - Validate API key
   - Check JWT secret configuration
   - Review token expiration

### Debug Mode
Set `LOG_LEVEL=debug` for detailed logging:

```bash
LOG_LEVEL=debug npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [lattice-engine/issues](https://github.com/lattice/lattice-engine/issues)
- Documentation: [lattice-engine.dev](https://lattice-engine.dev)
- Email: support@lattice-engine.dev