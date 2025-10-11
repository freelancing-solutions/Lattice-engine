import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code, 
  Download, 
  Play, 
  BookOpen, 
  Package, 
  Info, 
  Zap, 
  CheckCircle, 
  Settings, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  Lightbulb 
} from 'lucide-react';

export default function PythonSDKPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Code className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Python SDK</h1>
            <p className="text-gray-600">Complete Python SDK for Lattice Engine integration</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
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
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Package className="h-4 w-4" />
        <AlertDescription>
          <strong>Installation:</strong> <code className="bg-white px-2 py-1 rounded text-sm">pip install lattice-engine</code>
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
                <Zap className="h-5 w-5 text-blue-600" />
                Python SDK Features
              </CardTitle>
              <CardDescription>
                Comprehensive Python SDK for building applications with Lattice Engine
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
                    <li>• Async/await support with asyncio</li>
                    <li>• Type hints and Pydantic models</li>
                    <li>• Real-time WebSocket connections</li>
                    <li>• Automatic retry and backoff</li>
                    <li>• Built-in request/response logging</li>
                    <li>• Context managers for resources</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    Advanced Capabilities
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Custom authentication providers</li>
                    <li>• Middleware and interceptors</li>
                    <li>• Streaming data processing</li>
                    <li>• Batch operations support</li>
                    <li>• Comprehensive error handling</li>
                    <li>• Performance monitoring</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Python Version Support</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Python 3.8+</Badge>
                  <Badge variant="secondary">Python 3.9</Badge>
                  <Badge variant="secondary">Python 3.10</Badge>
                  <Badge variant="secondary">Python 3.11</Badge>
                  <Badge variant="secondary">Python 3.12</Badge>
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
                <h3 className="font-semibold">Pip Installation</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Install the SDK</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>pip install lattice-engine</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Poetry Installation</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Using Poetry</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>poetry add lattice-engine</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Development Installation</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Install with development dependencies</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>pip install lattice-engine[dev]</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Optional Dependencies</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Install with optional features</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`pip install lattice-engine[async,websockets,validation]`}</pre>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The SDK requires Python 3.8+ and supports both synchronous and asynchronous operations.
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
                    <span className="text-green-400"># Initialize Lattice Engine client</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`from lattice_engine import LatticeEngine
import os

# Synchronous client
client = LatticeEngine(
    api_key=os.getenv('LATTICE_API_KEY'),
    base_url='https://api.lattice-engine.com',
    version='v1'
)

# Asynchronous client
async_client = LatticeEngine(
    api_key=os.getenv('LATTICE_API_KEY'),
    async_mode=True
)`}</pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">2. Create a Specification</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Create your first specification</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`# Synchronous version
spec = client.specifications.create({
    'name': 'User Management API',
    'description': 'API for managing user accounts',
    'version': '1.0.0',
    'schema': {
        'type': 'object',
        'properties': {
            'users': {
                'type': 'array',
                'items': {'$ref': '#/definitions/User'}
            }
        }
    }
})

print(f"Specification created: {spec.id}")

# Asynchronous version
async def create_spec():
    spec = await async_client.specifications.create({
        'name': 'User Management API',
        'description': 'API for managing user accounts',
        'version': '1.0.0'
    })
    return spec`}</pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">3. Listen for Events</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Subscribe to real-time events</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`import asyncio

async def handle_events():
    # Event handlers
    @async_client.on('specification.updated')
    async def on_spec_updated(event):
        print(f"Specification updated: {event.data}")
    
    @async_client.on('validation.completed')
    async def on_validation_completed(event):
        print(f"Validation result: {event.data.result}")
    
    # Connect to real-time events
    await async_client.connect()
    
    # Keep the connection alive
    await asyncio.sleep(3600)  # Run for 1 hour

# Run the event handler
asyncio.run(handle_events())`}</pre>
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
                    <TabsTrigger value="async">Async/Await</TabsTrigger>
                    <TabsTrigger value="validation">Validation</TabsTrigger>
                    <TabsTrigger value="streaming">Streaming</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`# Basic CRUD operations
from lattice_engine import LatticeEngine
import os

client = LatticeEngine(api_key=os.getenv('LATTICE_API_KEY'))

def basic_example():
    try:
        # Create a specification
        spec = client.specifications.create({
            'name': 'Product Catalog',
            'schema': {
                'type': 'object',
                'properties': {
                    'products': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'string'},
                                'name': {'type': 'string'},
                                'price': {'type': 'number'}
                            }
                        }
                    }
                }
            }
        })
        
        # Update the specification
        updated = client.specifications.update(spec.id, {
            'description': 'Updated product catalog'
        })
        
        # List all specifications
        specs = client.specifications.list(limit=10, offset=0)
        
        # Get a specific specification
        retrieved = client.specifications.get(spec.id)
        
        # Delete a specification
        client.specifications.delete(spec.id)
        
        print("Basic operations completed successfully")
        
    except Exception as error:
        print(f"Error: {error}")

if __name__ == "__main__":
    basic_example()`}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="async">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`# Asynchronous operations
import asyncio
from lattice_engine import LatticeEngine
import os

async_client = LatticeEngine(
    api_key=os.getenv('LATTICE_API_KEY'),
    async_mode=True
)

async def async_example():
    try:
        # Event handlers
        @async_client.on('connected')
        async def on_connected():
            print('Connected to Lattice Engine')
        
        @async_client.on('specification.created')
        async def on_spec_created(event):
            print(f'New specification: {event.data}')
            await update_ui(event.data)
        
        @async_client.on('specification.updated')
        async def on_spec_updated(event):
            print(f'Specification updated: {event.data}')
            await refresh_specification(event.data.id)
        
        @async_client.on('validation.started')
        async def on_validation_started(event):
            await show_validation_progress(event.data.spec_id)
        
        @async_client.on('validation.completed')
        async def on_validation_completed(event):
            await hide_validation_progress()
            await display_validation_results(event.data)
        
        @async_client.on('error')
        async def on_error(error):
            print(f'Real-time error: {error}')
            await show_error_notification(str(error))
        
        # Connect to real-time events
        await async_client.connect()
        
        # Concurrent operations
        tasks = [
            async_client.specifications.create({'name': f'Spec {i}'})
            for i in range(5)
        ]
        
        specs = await asyncio.gather(*tasks)
        print(f"Created {len(specs)} specifications concurrently")
        
        # Subscribe to specific specification
        await async_client.subscribe('specification', 'spec-123')
        
        # Keep connection alive
        await asyncio.sleep(60)
        
    except Exception as error:
        print(f"Error: {error}")
    finally:
        await async_client.close()

async def update_ui(specification):
    # Update your application UI
    print(f"Updating UI for specification: {specification.id}")

async def refresh_specification(spec_id):
    spec = await async_client.specifications.get(spec_id)
    print(f"Refreshed specification: {spec.name}")

if __name__ == "__main__":
    asyncio.run(async_example())`}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="validation">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`# Validation and testing
from lattice_engine import LatticeEngine
from lattice_engine.validation import ValidationRule
import os

client = LatticeEngine(api_key=os.getenv('LATTICE_API_KEY'))

def validation_example():
    spec_id = 'spec-123'
    
    # Validate specification syntax
    syntax_result = client.validation.validate_syntax(spec_id)
    print(f'Syntax validation: {syntax_result}')
    
    # Validate against schema
    schema_result = client.validation.validate_schema(spec_id, {
        'data': {
            'users': [
                {'id': '1', 'name': 'John Doe', 'email': 'john@example.com'},
                {'id': '2', 'name': 'Jane Smith', 'email': 'jane@example.com'}
            ]
        }
    })
    
    # Run performance tests
    perf_result = client.testing.run_performance_test(spec_id, {
        'duration': 60,  # seconds
        'concurrency': 10,
        'ramp_up': 5
    })
    
    # Custom validation rules
    def unique_emails_validator(data):
        emails = [user['email'] for user in data['users']]
        return len(emails) == len(set(emails))
    
    custom_rule = ValidationRule(
        name='unique-emails',
        description='Ensure all emails are unique',
        validator=unique_emails_validator
    )
    
    custom_result = client.validation.validate_custom(spec_id, {
        'rules': [custom_rule]
    })
    
    # Batch validation
    datasets = [
        {'spec_id': 'spec-1', 'data': dataset1},
        {'spec_id': 'spec-2', 'data': dataset2},
        {'spec_id': 'spec-3', 'data': dataset3}
    ]
    
    batch_result = client.validation.validate_batch(datasets)
    
    print('Validation results:', {
        'syntax': syntax_result.valid,
        'schema': schema_result.valid,
        'performance': perf_result.passed,
        'custom': custom_result.valid,
        'batch': batch_result.summary
    })

# Async validation example
async def async_validation_example():
    async_client = LatticeEngine(
        api_key=os.getenv('LATTICE_API_KEY'),
        async_mode=True
    )
    
    spec_id = 'spec-123'
    
    # Run validations concurrently
    syntax_task = async_client.validation.validate_syntax(spec_id)
    schema_task = async_client.validation.validate_schema(spec_id, test_data)
    perf_task = async_client.testing.run_performance_test(spec_id, perf_config)
    
    syntax_result, schema_result, perf_result = await asyncio.gather(
        syntax_task, schema_task, perf_task
    )
    
    print("All validations completed concurrently")

if __name__ == "__main__":
    validation_example()`}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="streaming">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`# Streaming data processing
import asyncio
from lattice_engine import LatticeEngine
import os

async_client = LatticeEngine(
    api_key=os.getenv('LATTICE_API_KEY'),
    async_mode=True
)

async def streaming_example():
    try:
        # Stream specifications
        async for batch in async_client.specifications.stream(
            filter={'status': 'active'},
            batch_size=50
        ):
            print(f'Processing batch of {len(batch)} specifications')
            await process_batch(batch)
        
        # Stream validation results
        async for result in async_client.validation.stream_results(
            spec_id='spec-123'
        ):
            print(f'Validation result: {result.status}')
            if result.status == 'completed':
                await handle_validation_complete(result)
        
        # Real-time event streaming
        async for event in async_client.events.stream():
            await handle_event(event)
    
    except Exception as error:
        print(f"Streaming error: {error}")

async def process_batch(specifications):
    # Process each specification in the batch
    tasks = [process_specification(spec) for spec in specifications]
    await asyncio.gather(*tasks)

async def process_specification(spec):
    # Custom processing logic
    print(f"Processing specification: {spec.name}")
    
    # Validate the specification
    result = await async_client.validation.validate_syntax(spec.id)
    
    if not result.valid:
        print(f"Validation failed for {spec.name}: {result.errors}")
    else:
        print(f"Specification {spec.name} is valid")

async def handle_validation_complete(result):
    print(f"Validation completed: {result.summary}")
    
    # Send notification
    await send_notification({
        'type': 'validation_complete',
        'spec_id': result.spec_id,
        'status': result.status
    })

async def handle_event(event):
    print(f"Received event: {event.type}")
    
    # Route event to appropriate handler
    handlers = {
        'specification.created': handle_spec_created,
        'specification.updated': handle_spec_updated,
        'validation.completed': handle_validation_complete
    }
    
    handler = handlers.get(event.type)
    if handler:
        await handler(event.data)

# Context manager for resource management
async def context_manager_example():
    async with LatticeEngine(
        api_key=os.getenv('LATTICE_API_KEY'),
        async_mode=True
    ) as client:
        # Client is automatically connected and cleaned up
        specs = await client.specifications.list()
        print(f"Found {len(specs)} specifications")
        
        # Real-time connection is automatically closed when exiting

if __name__ == "__main__":
    asyncio.run(streaming_example())`}</pre>
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
                    <pre className="text-sm">{`class LatticeEngine:
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.lattice-engine.com",
        version: str = "v1",
        timeout: int = 30,
        retries: int = 3,
        async_mode: bool = False,
        middleware: List[Middleware] = None,
        cache_config: CacheConfig = None
    )`}</pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Specifications API</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-green-600">client.specifications.create(data: dict) → Specification</h4>
                      <p className="text-sm text-gray-600 mt-1">Create a new specification</p>
                      <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                        <strong>Async:</strong> await client.specifications.create(data)
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-blue-600">client.specifications.get(id: str) → Specification</h4>
                      <p className="text-sm text-gray-600 mt-1">Retrieve a specification by ID</p>
                      <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                        <strong>Async:</strong> await client.specifications.get(id)
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-yellow-600">client.specifications.update(id: str, data: dict) → Specification</h4>
                      <p className="text-sm text-gray-600 mt-1">Update an existing specification</p>
                      <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                        <strong>Async:</strong> await client.specifications.update(id, data)
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-red-600">client.specifications.delete(id: str) → None</h4>
                      <p className="text-sm text-gray-600 mt-1">Delete a specification</p>
                      <div className="bg-gray-50 p-2 rounded mt-2 text-sm">
                        <strong>Async:</strong> await client.specifications.delete(id)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Validation API</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-purple-600">client.validation.validate_syntax(spec_id: str) → ValidationResult</h4>
                      <p className="text-sm text-gray-600 mt-1">Validate specification syntax</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-purple-600">client.validation.validate_schema(spec_id: str, data: dict) → ValidationResult</h4>
                      <p className="text-sm text-gray-600 mt-1">Validate data against specification schema</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Events API</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-orange-600">@client.on(event: str)</h4>
                      <p className="text-sm text-gray-600 mt-1">Decorator for event handlers</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-orange-600">await client.connect()</h4>
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
                    <pre>{`# Create custom middleware
from lattice_engine.middleware import Middleware
import time

class RateLimitMiddleware(Middleware):
    def __init__(self, max_requests=100, window=60):
        self.max_requests = max_requests
        self.window = window
        self.requests = []
    
    async def process_request(self, request, next_handler):
        now = time.time()
        window_start = now - self.window
        
        # Clean old requests
        self.requests = [req_time for req_time in self.requests 
                        if req_time > window_start]
        
        # Check rate limit
        if len(self.requests) >= self.max_requests:
            raise Exception('Rate limit exceeded')
        
        self.requests.append(now)
        return await next_handler(request)

# Use middleware
client = LatticeEngine(
    api_key=os.getenv('LATTICE_API_KEY'),
    middleware=[RateLimitMiddleware(max_requests=50)]
)`}</pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Error Handling</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`# Comprehensive error handling
from lattice_engine.exceptions import (
    NetworkError,
    AuthenticationError,
    ValidationError,
    RateLimitError
)

async def handle_errors():
    try:
        spec = await client.specifications.create(spec_data)
    except NetworkError as e:
        # Handle network issues
        await show_offline_mode()
        logger.error(f"Network error: {e}")
    except AuthenticationError as e:
        # Handle authentication issues
        await redirect_to_login()
        logger.error(f"Auth error: {e}")
    except ValidationError as e:
        # Handle validation errors
        await display_errors(e.details)
        logger.error(f"Validation error: {e}")
    except RateLimitError as e:
        # Handle rate limiting
        await asyncio.sleep(e.retry_after)
        logger.warning(f"Rate limited, retrying after {e.retry_after}s")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise

# Global error handler
@client.on('error')
async def on_error(error):
    if isinstance(error, NetworkError):
        await handle_network_error(error)
    elif isinstance(error, ValidationError):
        await handle_validation_error(error)
    else:
        await handle_generic_error(error)`}</pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Performance Optimization</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-sm">
                      <li>• Use async/await for concurrent operations</li>
                      <li>• Enable connection pooling for HTTP requests</li>
                      <li>• Implement caching for frequently accessed data</li>
                      <li>• Use batch operations for multiple requests</li>
                      <li>• Configure appropriate timeout values</li>
                      <li>• Monitor memory usage with streaming operations</li>
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
                      <li>• Use type hints for better code clarity</li>
                      <li>• Implement proper async/await patterns</li>
                      <li>• Use context managers for resource cleanup</li>
                      <li>• Handle exceptions gracefully</li>
                      <li>• Use environment variables for API keys</li>
                      <li>• Log important operations and errors</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-600">❌ Don'ts</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Don't hardcode API keys in source code</li>
                      <li>• Don't ignore async/await in async functions</li>
                      <li>• Don't forget to close connections</li>
                      <li>• Don't block the event loop</li>
                      <li>• Don't skip input validation</li>
                      <li>• Don't ignore rate limit responses</li>
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
                <div className="font-medium">JavaScript SDK</div>
                <div className="text-sm text-gray-600">JavaScript integration guide</div>
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