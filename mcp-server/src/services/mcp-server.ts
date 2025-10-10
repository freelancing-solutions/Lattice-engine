import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { LatticeEngineClient } from './lattice-client.js';
import { componentLoggers } from '../utils/logger.js';
import { config } from '../config/index.js';
import type { McpServer, McpTool, McpResource, McpPrompt } from '../types/index.js';
import type {
  AgentOrchestrationRequest,
  SpecNode,
  SpecEdge,
  ApprovalRequest,
  ValidationResult,
  LatticeEngineError,
} from '../types/index.js';

const logger = componentLoggers.mcp;

// Input schemas for tools
const GetSpecGraphSchema = z.object({});

const GetNodeSchema = z.object({
  nodeId: z.string().min(1, 'Node ID is required'),
});

const CreateNodeSchema = z.object({
  type: z.enum(['SPEC', 'MODULE', 'FUNCTION', 'CLASS', 'INTERFACE', 'ENUM', 'TYPE']),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  properties: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
  status: z.enum(['ACTIVE', 'DEPRECATED', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  version: z.string().default('1.0.0'),
});

const UpdateNodeSchema = z.object({
  nodeId: z.string().min(1, 'Node ID is required'),
  updates: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    properties: z.record(z.unknown()).optional(),
    metadata: z.record(z.unknown()).optional(),
    status: z.enum(['ACTIVE', 'DEPRECATED', 'DRAFT', 'ARCHIVED']).optional(),
    version: z.string().optional(),
  }),
});

const DeleteNodeSchema = z.object({
  nodeId: z.string().min(1, 'Node ID is required'),
});

const CreateEdgeSchema = z.object({
  sourceId: z.string().min(1, 'Source ID is required'),
  targetId: z.string().min(1, 'Target ID is required'),
  type: z.enum(['DEPENDS_ON', 'IMPLEMENTS', 'EXTENDS', 'USES', 'CONTAINS', 'REFERENCES']),
  properties: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
});

const OrchestrationRequestSchema = z.object({
  type: z.enum(['mutation', 'validation', 'conflict_resolution', 'impact_analysis', 'semantic_analysis']),
  payload: z.record(z.unknown()),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  context: z.record(z.unknown()).optional(),
});

const ApprovalActionSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  action: z.enum(['approve', 'reject']),
  comment: z.string().optional(),
  reason: z.string().optional(),
});

const ValidationRequestSchema = z.object({
  target: z.enum(['graph', 'node', 'edge']),
  targetId: z.string().optional(),
});

export class LatticeEngineServer {
  private server: Server;
  private latticeClient: LatticeEngineClient;
  private isRunning = false;

  constructor() {
    this.server = new Server(
      {
        name: config.mcpConfig.serverName,
        version: config.mcpConfig.serverVersion,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.latticeClient = new LatticeEngineClient();
    this.setupHandlers();
    this.setupLatticeClientEvents();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_spec_graph',
            description: 'Retrieve the complete specification graph with all nodes and edges',
            inputSchema: GetSpecGraphSchema,
          },
          {
            name: 'get_node',
            description: 'Get details of a specific node by ID',
            inputSchema: GetNodeSchema,
          },
          {
            name: 'create_node',
            description: 'Create a new node in the specification graph',
            inputSchema: CreateNodeSchema,
          },
          {
            name: 'update_node',
            description: 'Update an existing node in the specification graph',
            inputSchema: UpdateNodeSchema,
          },
          {
            name: 'delete_node',
            description: 'Delete a node from the specification graph',
            inputSchema: DeleteNodeSchema,
          },
          {
            name: 'create_edge',
            description: 'Create a new edge (relationship) between nodes',
            inputSchema: CreateEdgeSchema,
          },
          {
            name: 'orchestrate_agents',
            description: 'Request agent orchestration for complex operations like mutation, validation, or analysis',
            inputSchema: OrchestrationRequestSchema,
          },
          {
            name: 'get_approval_requests',
            description: 'Get all pending approval requests',
            inputSchema: z.object({}),
          },
          {
            name: 'handle_approval',
            description: 'Approve or reject an approval request',
            inputSchema: ApprovalActionSchema,
          },
          {
            name: 'validate_spec',
            description: 'Validate the specification graph, nodes, or edges',
            inputSchema: ValidationRequestSchema,
          },
          {
            name: 'get_health_status',
            description: 'Get the health status of the Lattice Engine',
            inputSchema: z.object({}),
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        logger.info('Tool call received', { name, args });

        switch (name) {
          case 'get_spec_graph':
            return await this.handleGetSpecGraph();

          case 'get_node':
            return await this.handleGetNode(args);

          case 'create_node':
            return await this.handleCreateNode(args);

          case 'update_node':
            return await this.handleUpdateNode(args);

          case 'delete_node':
            return await this.handleDeleteNode(args);

          case 'create_edge':
            return await this.handleCreateEdge(args);

          case 'orchestrate_agents':
            return await this.handleOrchestrationRequest(args);

          case 'get_approval_requests':
            return await this.handleGetApprovalRequests();

          case 'handle_approval':
            return await this.handleApprovalAction(args);

          case 'validate_spec':
            return await this.handleValidationRequest(args);

          case 'get_health_status':
            return await this.handleHealthStatus();

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error('Tool call failed', { name, error });
        
        if (error instanceof LatticeEngineError) {
          throw new McpError(
            error.statusCode >= 500 ? ErrorCode.InternalError : ErrorCode.InvalidRequest,
            error.message
          );
        }
        
        throw new McpError(ErrorCode.InternalError, 'Internal server error');
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'lattice://spec-graph',
            name: 'Specification Graph',
            description: 'Complete specification graph with nodes and edges',
            mimeType: 'application/json',
          },
          {
            uri: 'lattice://approval-queue',
            name: 'Approval Queue',
            description: 'Current pending approval requests',
            mimeType: 'application/json',
          },
          {
            uri: 'lattice://validation-results',
            name: 'Validation Results',
            description: 'Latest validation results for the specification graph',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'lattice://spec-graph':
            const graph = await this.latticeClient.getSpecGraph();
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(graph, null, 2),
                },
              ],
            };

          case 'lattice://approval-queue':
            const requests = await this.latticeClient.getApprovalRequests();
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(requests, null, 2),
                },
              ],
            };

          case 'lattice://validation-results':
            const validationResults = await this.latticeClient.validateGraph();
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(validationResults, null, 2),
                },
              ],
            };

          default:
            throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
        }
      } catch (error) {
        logger.error('Resource read failed', { uri, error });
        throw new McpError(ErrorCode.InternalError, 'Failed to read resource');
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'analyze_spec_impact',
            description: 'Analyze the impact of proposed changes to the specification',
            arguments: [
              {
                name: 'changes',
                description: 'Description of the proposed changes',
                required: true,
              },
              {
                name: 'scope',
                description: 'Scope of analysis (node, edge, graph)',
                required: false,
              },
            ],
          },
          {
            name: 'suggest_spec_improvements',
            description: 'Suggest improvements for the specification graph',
            arguments: [
              {
                name: 'focus_area',
                description: 'Area to focus on (structure, dependencies, naming, etc.)',
                required: false,
              },
            ],
          },
          {
            name: 'resolve_conflicts',
            description: 'Help resolve conflicts in the specification',
            arguments: [
              {
                name: 'conflict_type',
                description: 'Type of conflict to resolve',
                required: true,
              },
              {
                name: 'context',
                description: 'Additional context about the conflict',
                required: false,
              },
            ],
          },
        ],
      };
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_spec_impact':
            return await this.handleImpactAnalysisPrompt(args);

          case 'suggest_spec_improvements':
            return await this.handleImprovementSuggestionsPrompt(args);

          case 'resolve_conflicts':
            return await this.handleConflictResolutionPrompt(args);

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown prompt: ${name}`);
        }
      } catch (error) {
        logger.error('Prompt request failed', { name, error });
        throw new McpError(ErrorCode.InternalError, 'Failed to process prompt');
      }
    });
  }

  private setupLatticeClientEvents(): void {
    this.latticeClient.on('connected', () => {
      logger.info('Connected to Lattice Engine');
    });

    this.latticeClient.on('disconnected', (info) => {
      logger.warn('Disconnected from Lattice Engine', info);
    });

    this.latticeClient.on('error', (error) => {
      logger.error('Lattice Engine client error', { error });
    });

    this.latticeClient.on('approvalUpdate', (update) => {
      logger.info('Approval update received', update);
      // Could emit notifications to connected MCP clients
    });

    this.latticeClient.on('validationUpdate', (update) => {
      logger.info('Validation update received', update);
    });

    this.latticeClient.on('graphUpdate', (update) => {
      logger.info('Graph update received', update);
    });
  }

  // Tool handlers
  private async handleGetSpecGraph() {
    const graph = await this.latticeClient.getSpecGraph();
    return {
      content: [
        {
          type: 'text',
          text: `Retrieved specification graph with ${graph.nodes.length} nodes and ${graph.edges.length} edges.\n\nGraph metadata:\n${JSON.stringify(graph.metadata, null, 2)}`,
        },
      ],
    };
  }

  private async handleGetNode(args: unknown) {
    const { nodeId } = GetNodeSchema.parse(args);
    const node = await this.latticeClient.getNode(nodeId);
    return {
      content: [
        {
          type: 'text',
          text: `Node details:\n${JSON.stringify(node, null, 2)}`,
        },
      ],
    };
  }

  private async handleCreateNode(args: unknown) {
    const nodeData = CreateNodeSchema.parse(args);
    const node = await this.latticeClient.createNode(nodeData);
    return {
      content: [
        {
          type: 'text',
          text: `Created node successfully:\n${JSON.stringify(node, null, 2)}`,
        },
      ],
    };
  }

  private async handleUpdateNode(args: unknown) {
    const { nodeId, updates } = UpdateNodeSchema.parse(args);
    const node = await this.latticeClient.updateNode(nodeId, updates);
    return {
      content: [
        {
          type: 'text',
          text: `Updated node successfully:\n${JSON.stringify(node, null, 2)}`,
        },
      ],
    };
  }

  private async handleDeleteNode(args: unknown) {
    const { nodeId } = DeleteNodeSchema.parse(args);
    await this.latticeClient.deleteNode(nodeId);
    return {
      content: [
        {
          type: 'text',
          text: `Node ${nodeId} deleted successfully.`,
        },
      ],
    };
  }

  private async handleCreateEdge(args: unknown) {
    const edgeData = CreateEdgeSchema.parse(args);
    const edge = await this.latticeClient.createEdge(edgeData);
    return {
      content: [
        {
          type: 'text',
          text: `Created edge successfully:\n${JSON.stringify(edge, null, 2)}`,
        },
      ],
    };
  }

  private async handleOrchestrationRequest(args: unknown) {
    const { type, payload, priority, context } = OrchestrationRequestSchema.parse(args);
    
    const request: AgentOrchestrationRequest = {
      id: uuidv4(),
      type,
      payload,
      priority,
      requester: 'mcp-client',
      timestamp: new Date().toISOString(),
      context,
    };

    const response = await this.latticeClient.requestAgentOrchestration(request);
    
    return {
      content: [
        {
          type: 'text',
          text: `Agent orchestration completed:\n${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  }

  private async handleGetApprovalRequests() {
    const requests = await this.latticeClient.getApprovalRequests();
    return {
      content: [
        {
          type: 'text',
          text: `Found ${requests.length} pending approval requests:\n${JSON.stringify(requests, null, 2)}`,
        },
      ],
    };
  }

  private async handleApprovalAction(args: unknown) {
    const { requestId, action, comment, reason } = ApprovalActionSchema.parse(args);
    
    let result: ApprovalRequest;
    if (action === 'approve') {
      result = await this.latticeClient.approveRequest(requestId, comment);
    } else {
      if (!reason) {
        throw new McpError(ErrorCode.InvalidRequest, 'Reason is required for rejection');
      }
      result = await this.latticeClient.rejectRequest(requestId, reason);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Request ${action}d successfully:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async handleValidationRequest(args: unknown) {
    const { target, targetId } = ValidationRequestSchema.parse(args);
    
    let results: ValidationResult[];
    switch (target) {
      case 'graph':
        results = await this.latticeClient.validateGraph();
        break;
      case 'node':
        if (!targetId) {
          throw new McpError(ErrorCode.InvalidRequest, 'Target ID required for node validation');
        }
        results = await this.latticeClient.validateNode(targetId);
        break;
      case 'edge':
        if (!targetId) {
          throw new McpError(ErrorCode.InvalidRequest, 'Target ID required for edge validation');
        }
        results = await this.latticeClient.validateEdge(targetId);
        break;
    }

    const errorCount = results.filter(r => r.severity === 'error').length;
    const warningCount = results.filter(r => r.severity === 'warning').length;

    return {
      content: [
        {
          type: 'text',
          text: `Validation completed for ${target}${targetId ? ` ${targetId}` : ''}:\n- ${errorCount} errors\n- ${warningCount} warnings\n\nResults:\n${JSON.stringify(results, null, 2)}`,
        },
      ],
    };
  }

  private async handleHealthStatus() {
    const health = await this.latticeClient.healthCheck();
    const wsConnected = this.latticeClient.isWebSocketConnected();
    
    return {
      content: [
        {
          type: 'text',
          text: `Lattice Engine Health Status:\n- API: ${health.status}\n- WebSocket: ${wsConnected ? 'connected' : 'disconnected'}\n- Timestamp: ${health.timestamp}`,
        },
      ],
    };
  }

  // Prompt handlers
  private async handleImpactAnalysisPrompt(args: Record<string, unknown>) {
    const changes = args['changes'] as string;
    const scope = (args['scope'] as string) || 'graph';

    const request: AgentOrchestrationRequest = {
      id: uuidv4(),
      type: 'impact_analysis',
      payload: { changes, scope },
      priority: 'medium',
      requester: 'mcp-prompt',
      timestamp: new Date().toISOString(),
    };

    const response = await this.latticeClient.requestAgentOrchestration(request);

    return {
      description: 'Impact analysis for proposed specification changes',
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text',
            text: `Please analyze the impact of the following changes to the specification:\n\n${changes}\n\nScope: ${scope}\n\nAnalysis results:\n${JSON.stringify(response.result, null, 2)}`,
          },
        },
      ],
    };
  }

  private async handleImprovementSuggestionsPrompt(args: Record<string, unknown>) {
    const focusArea = (args.focus_area as string) || 'general';

    const request: AgentOrchestrationRequest = {
      id: uuidv4(),
      type: 'semantic_analysis',
      payload: { analysis_type: 'improvement_suggestions', focus_area: focusArea },
      priority: 'low',
      requester: 'mcp-prompt',
      timestamp: new Date().toISOString(),
    };

    const response = await this.latticeClient.requestAgentOrchestration(request);

    return {
      description: 'Suggestions for improving the specification graph',
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text',
            text: `Here are suggestions for improving the specification graph (focus: ${focusArea}):\n\n${JSON.stringify(response.result, null, 2)}`,
          },
        },
      ],
    };
  }

  private async handleConflictResolutionPrompt(args: Record<string, unknown>) {
    const conflictType = args.conflict_type as string;
    const context = args.context as string;

    const request: AgentOrchestrationRequest = {
      id: uuidv4(),
      type: 'conflict_resolution',
      payload: { conflict_type: conflictType, context },
      priority: 'high',
      requester: 'mcp-prompt',
      timestamp: new Date().toISOString(),
    };

    const response = await this.latticeClient.requestAgentOrchestration(request);

    return {
      description: 'Conflict resolution assistance',
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text',
            text: `Conflict resolution for ${conflictType}:\n\nContext: ${context}\n\nResolution suggestions:\n${JSON.stringify(response.result, null, 2)}`,
          },
        },
      ],
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }

    logger.info('Starting Lattice MCP Server', {
      name: mcpConfig.serverName,
      version: mcpConfig.serverVersion,
    });

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    this.isRunning = true;
    logger.info('Lattice MCP Server started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.info('Stopping Lattice MCP Server');
    
    this.latticeClient.disconnect();
    await this.server.close();
    
    this.isRunning = false;
    logger.info('Lattice MCP Server stopped');
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }
}