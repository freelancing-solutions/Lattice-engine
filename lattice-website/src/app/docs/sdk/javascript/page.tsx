
import React from "react";
import {
  Code,
  Download,
  Play,
  CheckCircle,
  Settings,
  Zap,
  Info,
  Package,
  BookOpen,
  Copy,
  ExternalLink,
  ArrowRight,
  Lightbulb
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function JavaScriptSDKPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Code className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">JavaScript SDK</h1>
            <p className="text-gray-600">Complete JavaScript SDK for Lattice Engine integration</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button className="bg-yellow-600 hover:bg-yellow-700">
            <Download className="h-4 w-4 mr-2" />
            Install SDK
          </Button>
          <Button variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Quick Start
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            API Reference
          </Button>
        </div>
      </div>

      {/* Installation Alert */}
      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <Package className="h-4 w-4" />
        <AlertDescription>
          <strong>Installation:</strong> <code className="bg-white px-2 py-1 rounded text-sm">npm install @lattice-engine/sdk</code>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                JavaScript SDK Features
              </CardTitle>
              <CardDescription>
                Comprehensive JavaScript SDK for building applications with Lattice Engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Core Features
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Real-time specification management</li>
                    <li>• Event-driven architecture</li>
                    <li>• Type-safe API client</li>
                    <li>• WebSocket support</li>
                    <li>• Automatic reconnection</li>
                    <li>• Built-in caching</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    Advanced Capabilities
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Custom middleware support</li>
                    <li>• Request/response interceptors</li>
                    <li>• Error handling & retry logic</li>
                    <li>• Performance monitoring</li>
                    <li>• Debug mode</li>
                    <li>• Plugin architecture</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Browser & Node.js Support</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Chrome 60+</Badge>
                  <Badge variant="secondary">Firefox 55+</Badge>
                  <Badge variant="secondary">Safari 12+</Badge>
                  <Badge variant="secondary">Edge 79+</Badge>
                  <Badge variant="secondary">Node.js 14+</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Installation Tab */}
        <TabsContent value="installation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                Installation Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">NPM Installation</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Install the SDK</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>npm install @lattice-engine/sdk</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Yarn Installation</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Using Yarn</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>yarn add @lattice-engine/sdk</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">CDN Installation</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Via CDN</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>&lt;script src="https://cdn.lattice-engine.com/sdk/latest/lattice.min.js"&gt;&lt;/script&gt;</div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The SDK requires Node.js 14+ or a modern browser with ES2018 support.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Start Tab */}
        <TabsContent value="quickstart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">1. Initialize the Client</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400">// Initialize Lattice Engine client</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`import { LatticeEngine } from '@lattice-engine/sdk';

const client = new LatticeEngine({
  apiKey: 'your-api-key',
  baseURL: 'https://api.lattice-engine.com',
  version: 'v1'
});`}</pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">2. Create a Specification</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400">// Create your first specification</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`const spec = await client.specifications.create({
  name: 'User Management API',
  description: 'API for managing user accounts',
  version: '1.0.0',
  schema: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: { $ref: '#/definitions/User' }
      }
    }
  }
});

console.log('Specification created:', spec.id);`}</pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">3. Listen for Events</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400">// Subscribe to real-time events</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`// Listen for specification changes
client.on('specification.updated', (event) => {
  console.log('Specification updated:', event.data);
});

// Listen for validation events
client.on('validation.completed', (event) => {
  console.log('Validation result:', event.data.result);
});

// Connect to real-time events
await client.connect();`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  Complete Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Usage</TabsTrigger>
                    <TabsTrigger value="realtime">Real-time</TabsTrigger>
                    <TabsTrigger value="validation">Validation</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`// Basic CRUD operations
import { LatticeEngine } from '@lattice-engine/sdk';

const client = new LatticeEngine({
  apiKey: process.env.LATTICE_API_KEY
});

async function basicExample() {
  try {
    // Create a specification
    const spec = await client.specifications.create({
      name: 'Product Catalog',
      schema: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                price: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Update the specification
    const updated = await client.specifications.update(spec.id, {
      description: 'Updated product catalog'
    });

    // List all specifications
    const specs = await client.specifications.list({
      limit: 10,
      offset: 0
    });

    // Delete a specification
    await client.specifications.delete(spec.id);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

basicExample();`}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="realtime">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`// Real-time event handling
import { LatticeEngine } from '@lattice-engine/sdk';

const client = new LatticeEngine({
  apiKey: process.env.LATTICE_API_KEY,
  realtime: true
});

async function realtimeExample() {
  // Event listeners
  client.on('connected', () => {
    console.log('Connected to Lattice Engine');
  });

  client.on('specification.created', (event) => {
    console.log('New specification:', event.data);
    updateUI(event.data);
  });

  client.on('specification.updated', (event) => {
    console.log('Specification updated:', event.data);
    refreshSpecification(event.data.id);
  });

  client.on('validation.started', (event) => {
    showValidationProgress(event.data.specId);
  });

  client.on('validation.completed', (event) => {
    hideValidationProgress();
    displayValidationResults(event.data);
  });

  client.on('error', (error) => {
    console.error('Real-time error:', error);
    showErrorNotification(error.message);
  });

  // Connect to real-time events
  await client.connect();

  // Subscribe to specific specification
  await client.subscribe('specification', 'spec-123');
}

function updateUI(specification) {
  // Update your application UI
  document.getElementById('spec-list').appendChild(
    createSpecificationElement(specification)
  );
}

realtimeExample();`}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="validation">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`// Validation and testing
import { LatticeEngine } from '@lattice-engine/sdk';

const client = new LatticeEngine({
  apiKey: process.env.LATTICE_API_KEY
});

async function validationExample() {
  const specId = 'spec-123';

  // Validate specification syntax
  const syntaxResult = await client.validation.validateSyntax(specId);
  console.log('Syntax validation:', syntaxResult);

  // Validate against schema
  const schemaResult = await client.validation.validateSchema(specId, {
    data: {
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ]
    }
  });

  // Run performance tests
  const perfResult = await client.testing.runPerformanceTest(specId, {
    duration: 60, // seconds
    concurrency: 10,
    rampUp: 5
  });

  // Custom validation rules
  const customResult = await client.validation.validateCustom(specId, {
    rules: [
      {
        name: 'unique-emails',
        description: 'Ensure all emails are unique',
        validator: (data) => {
          const emails = data.users.map(u => u.email);
          return emails.length === new Set(emails).size;
        }
      }
    ]
  });

  // Batch validation
  const batchResult = await client.validation.validateBatch([
    { specId: 'spec-1', data: dataset1 },
    { specId: 'spec-2', data: dataset2 },
    { specId: 'spec-3', data: dataset3 }
  ]);

  console.log('Validation results:', {
    syntax: syntaxResult.valid,
    schema: schemaResult.valid,
    performance: perfResult.passed,
    custom: customResult.valid,
    batch: batchResult.summary
  });
}

validationExample();`}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`// Advanced features and middleware
import { LatticeEngine } from '@lattice-engine/sdk';

// Custom middleware
const authMiddleware = (request, next) => {
  request.headers['Authorization'] = \`Bearer \${getToken()}\`;
  return next(request);
};

const loggingMiddleware = (request, next) => {
  console.log('Request:', request.method, request.url);
  const start = Date.now();
  
  return next(request).then(response => {
    console.log('Response:', response.status, \`\${Date.now() - start}ms\`);
    return response;
  });
};

const client = new LatticeEngine({
  apiKey: process.env.LATTICE_API_KEY,
  middleware: [authMiddleware, loggingMiddleware],
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 'exponential'
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 100
  }
});

async function advancedExample() {
  // Batch operations
  const results = await client.batch([
    { method: 'POST', endpoint: '/specifications', data: spec1 },
    { method: 'POST', endpoint: '/specifications', data: spec2 },
    { method: 'PUT', endpoint: '/specifications/123', data: updates }
  ]);

  // Streaming data
  const stream = client.specifications.stream({
    filter: { status: 'active' },
    batchSize: 50
  });

  for await (const batch of stream) {
    console.log('Processing batch:', batch.length);
    await processBatch(batch);
  }

  // Plugin system
  client.use('analytics', {
    trackEvents: true,
    endpoint: 'https://analytics.example.com'
  });

  // Custom error handling
  client.on('error', (error) => {
    if (error.code === 'RATE_LIMIT') {
      console.log('Rate limited, retrying in', error.retryAfter);
    } else if (error.code === 'VALIDATION_ERROR') {
      displayValidationErrors(error.details);
    }
  });

  // Performance monitoring
  client.on('performance', (metrics) => {
    console.log('Performance metrics:', {
      requestTime: metrics.duration,
      cacheHitRate: metrics.cacheHitRate,
      errorRate: metrics.errorRate
    });
  });
}

advancedExample();`}</pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                API Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Client Configuration</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm">{`interface LatticeEngineConfig {
  apiKey: string;
  baseURL?: string;
  version?: string;
  timeout?: number;
  retries?: number;
  realtime?: boolean;
  middleware?: Middleware[];
  cache?: CacheConfig;
}`}</pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Specifications API</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-green-600">client.specifications.create(data)</h4>
                      <p className="text-sm text-gray-600 mt-1">Create a new specification</p>
                      <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                        <strong>Returns:</strong> Promise&lt;Specification&gt;
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-blue-600">client.specifications.get(id)</h4>
                      <p className="text-sm text-gray-600 mt-1">Retrieve a specification by ID</p>
                      <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                        <strong>Returns:</strong> Promise&lt;Specification&gt;
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-yellow-600">client.specifications.update(id, data)</h4>
                      <p className="text-sm text-gray-600 mt-1">Update an existing specification</p>
                      <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                        <strong>Returns:</strong> Promise&lt;Specification&gt;
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-red-600">client.specifications.delete(id)</h4>
                      <p className="text-sm text-gray-600 mt-1">Delete a specification</p>
                      <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                        <strong>Returns:</strong> Promise&lt;void&gt;
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Validation API</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-purple-600">client.validation.validateSyntax(specId)</h4>
                      <p className="text-sm text-gray-600 mt-1">Validate specification syntax</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-purple-600">client.validation.validateSchema(specId, data)</h4>
                      <p className="text-sm text-gray-600 mt-1">Validate data against specification schema</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Events API</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-orange-600">client.on(event, callback)</h4>
                      <p className="text-sm text-gray-600 mt-1">Listen for events</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-orange-600">client.connect()</h4>
                      <p className="text-sm text-gray-600 mt-1">Connect to real-time events</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Advanced Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Custom Middleware</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`// Create custom middleware
const rateLimitMiddleware = (request, next) => {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  // Check rate limit
  if (getRateLimit(windowStart) > 100) {
    throw new Error('Rate limit exceeded');
  }
  
  return next(request);
};

// Use middleware
client.use(rateLimitMiddleware);`}</pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Error Handling</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`// Global error handler
client.on('error', (error) => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      // Handle network issues
      showOfflineMode();
      break;
    case 'AUTH_ERROR':
      // Handle authentication issues
      redirectToLogin();
      break;
    case 'VALIDATION_ERROR':
      // Handle validation errors
      displayErrors(error.details);
      break;
    default:
      console.error('Unexpected error:', error);
  }
});`}</pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Performance Optimization</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-sm">
                      <li>• Enable caching for frequently accessed data</li>
                      <li>• Use batch operations for multiple requests</li>
                      <li>• Implement request deduplication</li>
                      <li>• Configure appropriate timeout values</li>
                      <li>• Use streaming for large datasets</li>
                      <li>• Monitor performance metrics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600">✅ Do's</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Always handle errors gracefully</li>
                      <li>• Use TypeScript for better type safety</li>
                      <li>• Implement proper authentication</li>
                      <li>• Cache frequently used data</li>
                      <li>• Use environment variables for API keys</li>
                      <li>• Monitor API usage and performance</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-600">❌ Don'ts</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Don't hardcode API keys in client code</li>
                      <li>• Don't ignore error responses</li>
                      <li>• Don't make unnecessary API calls</li>
                      <li>• Don't block the main thread</li>
                      <li>• Don't skip input validation</li>
                      <li>• Don't forget to handle rate limits</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Python SDK</div>
                <div className="text-sm text-gray-600">Python integration guide</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">API Documentation</div>
                <div className="text-sm text-gray-600">Complete API reference</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Troubleshooting</div>
                <div className="text-sm text-gray-600">Common issues & solutions</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
