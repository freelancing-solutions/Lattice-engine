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
  Terminal, 
  Download, 
  Play, 
  BookOpen, 
  Settings, 
  Info, 
  Zap, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  Lightbulb,
  Command,
  FileText,
  Database,
  Globe,
  Shield,
  Monitor
} from 'lucide-react';

export default function CLIPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Terminal className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lattice CLI</h1>
            <p className="text-gray-600">Command-line interface for Lattice Engine</p>
          </div>
        </div>        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Install CLI
          </Button>
          <Button variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Quick Start
          </Button>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Command Reference
          </Button>
        </div>
      </div>
      {/* Installation Alert */}
      <Alert className="mb-6 border-green-200 bg-green-50">
        <Terminal className="h-4 w-4" />
        <AlertDescription>
          <strong>Installation:</strong> <code className="bg-white px-2 py-1 rounded text-sm">npm install -g @lattice-engine/cli</code>
        </AlertDescription>
      </Alert>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                CLI Features
              </CardTitle>
              <CardDescription>
                Powerful command-line tools for managing Lattice Engine projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Core Commands
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Project initialization and scaffolding</li>
                    <li>• Specification management (CRUD operations)</li>
                    <li>• Real-time validation and testing</li>
                    <li>• Code generation and templates</li>
                    <li>• Deployment and publishing</li>
                    <li>• Environment management</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    Advanced Features
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Interactive prompts and wizards</li>
                    <li>• Batch operations and scripting</li>
                    <li>• Plugin system and extensions</li>
                    <li>• CI/CD integration hooks</li>
                    <li>• Performance monitoring</li>
                    <li>• Multi-environment support</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Platform Support</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Windows</Badge>
                  <Badge variant="secondary">macOS</Badge>
                  <Badge variant="secondary">Linux</Badge>
                  <Badge variant="secondary">Docker</Badge>
                  <Badge variant="secondary">CI/CD</Badge>
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
                <Download className="h-5 w-5 text-green-600" />
                Installation Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">NPM Installation (Recommended)</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Install globally</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>npm install -g @lattice-engine/cli</div>
                  <div className="mt-2 text-gray-400"># Verify installation</div>
                  <div>lattice --version</div>
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
                  <div>yarn global add @lattice-engine/cli</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Docker Installation</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Pull Docker image</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>docker pull lattice-engine/cli:latest</div>
                  <div className="mt-2 text-gray-400"># Run CLI in container</div>
                  <div>docker run -it --rm -v $(pwd):/workspace lattice-engine/cli</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Binary Installation</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Download binary (Linux/macOS)</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`curl -L https://github.com/lattice-engine/cli/releases/latest/download/lattice-linux -o lattice
chmod +x lattice
sudo mv lattice /usr/local/bin/`}</pre>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The CLI requires Node.js 16+ for NPM installation. Binary versions have no dependencies.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commands Tab */}
        <TabsContent value="commands" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Command className="h-5 w-5 text-blue-600" />
                Command Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="project" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="project">Project</TabsTrigger>
                  <TabsTrigger value="spec">Specifications</TabsTrigger>
                  <TabsTrigger value="validate">Validation</TabsTrigger>
                  <TabsTrigger value="deploy">Deploy</TabsTrigger>
                  <TabsTrigger value="utility">Utilities</TabsTrigger>
                </TabsList>

                <TabsContent value="project">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Project Management</h3>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-600">lattice init [project-name]</h4>
                        <Badge variant="outline">Core</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Initialize a new Lattice Engine project</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Interactive initialization</div>
                        <div>lattice init</div>
                        <div className="mt-2 text-green-400"># With project name</div>
                        <div>lattice init my-api-project</div>
                        <div className="mt-2 text-green-400"># With template</div>
                        <div>lattice init --template=rest-api my-project</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-600">lattice status</h4>
                        <Badge variant="outline">Info</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Show project status and health</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div>lattice status</div>
                        <div className="mt-2 text-green-400"># Detailed status</div>
                        <div>lattice status --verbose</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-600">lattice config</h4>
                        <Badge variant="outline">Config</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Manage project configuration</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># View configuration</div>
                        <div>lattice config list</div>
                        <div className="mt-2 text-green-400"># Set configuration</div>
                        <div>lattice config set api.endpoint https://api.example.com</div>
                        <div className="mt-2 text-green-400"># Get configuration</div>
                        <div>lattice config get api.endpoint</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="spec">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Specification Management</h3>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-600">lattice spec create [name]</h4>
                        <Badge variant="outline">CRUD</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Create a new specification</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Interactive creation</div>
                        <div>lattice spec create</div>
                        <div className="mt-2 text-green-400"># With name and template</div>
                        <div>lattice spec create user-api --template=crud</div>
                        <div className="mt-2 text-green-400"># From file</div>
                        <div>lattice spec create --from-file=./spec.json</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-600">lattice spec list</h4>
                        <Badge variant="outline">Read</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">List all specifications</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div>lattice spec list</div>
                        <div className="mt-2 text-green-400"># With filters</div>
                        <div>lattice spec list --status=active --format=table</div>
                        <div className="mt-2 text-green-400"># JSON output</div>
                        <div>lattice spec list --output=json</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-yellow-600">lattice spec update [id]</h4>
                        <Badge variant="outline">Update</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Update an existing specification</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Update from file</div>
                        <div>lattice spec update spec-123 --file=./updated-spec.json</div>
                        <div className="mt-2 text-green-400"># Interactive update</div>
                        <div>lattice spec update spec-123 --interactive</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-orange-600">lattice spec export [id]</h4>
                        <Badge variant="outline">Export</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Export specification to file</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Export to JSON</div>
                        <div>lattice spec export spec-123 --format=json --output=./spec.json</div>
                        <div className="mt-2 text-green-400"># Export to YAML</div>
                        <div>lattice spec export spec-123 --format=yaml</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="validate">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Validation & Testing</h3>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-600">lattice validate [spec-id]</h4>
                        <Badge variant="outline">Validation</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Validate specification syntax and schema</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Validate specific spec</div>
                        <div>lattice validate spec-123</div>
                        <div className="mt-2 text-green-400"># Validate all specs</div>
                        <div>lattice validate --all</div>
                        <div className="mt-2 text-green-400"># Validate with data</div>
                        <div>lattice validate spec-123 --data=./test-data.json</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-600">lattice test [spec-id]</h4>
                        <Badge variant="outline">Testing</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Run comprehensive tests on specifications</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Run all tests</div>
                        <div>lattice test spec-123</div>
                        <div className="mt-2 text-green-400"># Performance tests</div>
                        <div>lattice test spec-123 --performance --duration=60s</div>
                        <div className="mt-2 text-green-400"># Custom test suite</div>
                        <div>lattice test --suite=./custom-tests.js</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-600">lattice lint [path]</h4>
                        <Badge variant="outline">Quality</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Lint specifications for best practices</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Lint current project</div>
                        <div>lattice lint</div>
                        <div className="mt-2 text-green-400"># Lint specific files</div>
                        <div>lattice lint ./specs/*.json</div>
                        <div className="mt-2 text-green-400"># Auto-fix issues</div>
                        <div>lattice lint --fix</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="deploy">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Deployment & Publishing</h3>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-600">lattice deploy [environment]</h4>
                        <Badge variant="outline">Deploy</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Deploy specifications to environment</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Deploy to staging</div>
                        <div>lattice deploy staging</div>
                        <div className="mt-2 text-green-400"># Deploy specific spec</div>
                        <div>lattice deploy production --spec=spec-123</div>
                        <div className="mt-2 text-green-400"># Dry run</div>
                        <div>lattice deploy production --dry-run</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-600">lattice publish [spec-id]</h4>
                        <Badge variant="outline">Publish</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Publish specification to registry</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Publish to default registry</div>
                        <div>lattice publish spec-123</div>
                        <div className="mt-2 text-green-400"># Publish with version</div>
                        <div>lattice publish spec-123 --version=1.2.0</div>
                        <div className="mt-2 text-green-400"># Publish to custom registry</div>
                        <div>lattice publish spec-123 --registry=https://my-registry.com</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-orange-600">lattice rollback [deployment-id]</h4>
                        <Badge variant="outline">Rollback</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Rollback to previous deployment</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Rollback latest deployment</div>
                        <div>lattice rollback</div>
                        <div className="mt-2 text-green-400"># Rollback specific deployment</div>
                        <div>lattice rollback deploy-456</div>
                        <div className="mt-2 text-green-400"># Rollback to version</div>
                        <div>lattice rollback --to-version=1.1.0</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="utility">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Utility Commands</h3>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-600">lattice generate [type]</h4>
                        <Badge variant="outline">Generate</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Generate code, docs, and templates</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Generate API client</div>
                        <div>lattice generate client --spec=spec-123 --language=javascript</div>
                        <div className="mt-2 text-green-400"># Generate documentation</div>
                        <div>lattice generate docs --output=./docs</div>
                        <div className="mt-2 text-green-400"># Generate tests</div>
                        <div>lattice generate tests --spec=spec-123</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-600">lattice watch [path]</h4>
                        <Badge variant="outline">Watch</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Watch files for changes and auto-validate</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Watch current directory</div>
                        <div>lattice watch</div>
                        <div className="mt-2 text-green-400"># Watch specific files</div>
                        <div>lattice watch ./specs/*.json</div>
                        <div className="mt-2 text-green-400"># Watch with custom command</div>
                        <div>lattice watch --exec="npm test"</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-600">lattice auth [command]</h4>
                        <Badge variant="outline">Auth</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Manage authentication and credentials</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                        <div className="text-green-400"># Login interactively</div>
                        <div>lattice auth login</div>
                        <div className="mt-2 text-green-400"># Login with token</div>
                        <div>lattice auth login --token=your-api-token</div>
                        <div className="mt-2 text-green-400"># Check auth status</div>
                        <div>lattice auth status</div>
                        <div className="mt-2 text-green-400"># Logout</div>
                        <div>lattice auth logout</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Configuration File</h3>
                <p className="text-sm text-gray-600">
                  The CLI uses a <code className="bg-gray-100 px-2 py-1 rounded">lattice.config.json</code> file for project configuration.
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Example lattice.config.json</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`{
  "version": "1.0.0",
  "project": {
    "name": "my-api-project",
    "description": "My awesome API project",
    "author": "Your Name"
  },
  "api": {
    "endpoint": "https://api.lattice-engine.com",
    "version": "v1",
    "timeout": 30000,
    "retries": 3
  },
  "environments": {
    "development": {
      "endpoint": "https://dev-api.lattice-engine.com",
      "debug": true
    },
    "staging": {
      "endpoint": "https://staging-api.lattice-engine.com"
    },
    "production": {
      "endpoint": "https://api.lattice-engine.com",
      "debug": false
    }
  },
  "validation": {
    "strict": true,
    "rules": ["syntax", "schema", "performance"],
    "customRules": "./custom-rules.js"
  },
  "deployment": {
    "strategy": "rolling",
    "healthCheck": {
      "enabled": true,
      "timeout": 30,
      "retries": 3
    }
  },
  "plugins": [
    "@lattice-engine/plugin-typescript",
    "@lattice-engine/plugin-openapi"
  ]
}`}</pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Environment Variables</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400"># Environment variables</span>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre>{`# API Configuration
LATTICE_API_KEY=your-api-key
LATTICE_API_ENDPOINT=https://api.lattice-engine.com
LATTICE_API_VERSION=v1

# Environment
LATTICE_ENV=development
LATTICE_DEBUG=true

# Logging
LATTICE_LOG_LEVEL=info
LATTICE_LOG_FORMAT=json

# Performance
LATTICE_TIMEOUT=30000
LATTICE_RETRIES=3
LATTICE_CACHE_TTL=300`}</pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Global Configuration</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    Global CLI configuration is stored in your home directory:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <strong>Windows:</strong> <code>%USERPROFILE%\.lattice\config.json</code></li>
                    <li>• <strong>macOS/Linux:</strong> <code>~/.lattice/config.json</code></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Common Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="development" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="development">Development</TabsTrigger>
                    <TabsTrigger value="testing">Testing</TabsTrigger>
                    <TabsTrigger value="deployment">Deployment</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="development">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Development Workflow</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`# 1. Initialize new project
lattice init my-api-project
cd my-api-project

# 2. Create your first specification
lattice spec create user-management --template=crud

# 3. Start development server with watch mode
lattice watch --exec="lattice validate --all"

# 4. Generate client code
lattice generate client --spec=user-management --language=typescript

# 5. Run tests
lattice test --all

# 6. Lint and fix issues
lattice lint --fix`}</pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="testing">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Testing Workflow</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`# 1. Validate all specifications
lattice validate --all --verbose

# 2. Run syntax and schema validation
lattice validate user-management --data=./test-data.json

# 3. Run performance tests
lattice test user-management --performance --duration=60s --concurrency=10

# 4. Generate and run custom tests
lattice generate tests --spec=user-management
lattice test --suite=./generated-tests.js

# 5. Run integration tests
lattice test --integration --environment=staging

# 6. Generate test report
lattice test --all --report=./test-report.html`}</pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="deployment">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Deployment Workflow</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`# 1. Pre-deployment validation
lattice validate --all --strict
lattice test --all --performance

# 2. Deploy to staging
lattice deploy staging --dry-run
lattice deploy staging

# 3. Run smoke tests on staging
lattice test --environment=staging --smoke

# 4. Deploy to production
lattice deploy production --strategy=rolling

# 5. Monitor deployment
lattice status --environment=production --watch

# 6. Rollback if needed
lattice rollback --environment=production`}</pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="maintenance">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Maintenance Workflow</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`# 1. Check project health
lattice status --verbose
lattice validate --all

# 2. Update specifications
lattice spec list --status=outdated
lattice spec update spec-123 --file=./updated-spec.json

# 3. Clean up old deployments
lattice deploy cleanup --keep=5

# 4. Update CLI and plugins
npm update -g @lattice-engine/cli
lattice plugin update --all

# 5. Backup specifications
lattice spec export --all --output=./backup/

# 6. Generate fresh documentation
lattice generate docs --output=./docs --format=html`}</pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Custom Scripts and Hooks</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`# package.json scripts integration
{
  "scripts": {
    "lattice:validate": "lattice validate --all",
    "lattice:test": "lattice test --all --performance",
    "lattice:deploy:staging": "lattice deploy staging",
    "lattice:deploy:prod": "lattice deploy production",
    "precommit": "lattice lint --fix && lattice validate --all"
  }
}

# Git hooks integration
# .git/hooks/pre-commit
#!/bin/sh
lattice validate --all --strict
if [ $? -ne 0 ]; then
  echo "Validation failed. Commit aborted."
  exit 1
fi`}</pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Plugin Development</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`// Custom plugin example
// lattice-plugin-custom.js
module.exports = {
  name: 'custom-plugin',
  version: '1.0.0',
  
  commands: {
    'custom:hello': {
      description: 'Custom hello command',
      handler: async (args, options) => {
        console.log('Hello from custom plugin!');
      }
    }
  },
  
  hooks: {
    'before:validate': async (context) => {
      console.log('Running custom pre-validation logic');
    },
    'after:deploy': async (context) => {
      console.log('Running custom post-deployment logic');
    }
  },
  
  middleware: [
    async (context, next) => {
      console.log('Custom middleware executing');
      await next();
    }
  ]
};

// Install and use plugin
lattice plugin install ./lattice-plugin-custom.js
lattice custom:hello`}</pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">CI/CD Integration</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`# GitHub Actions example
# .github/workflows/lattice.yml
name: Lattice CI/CD
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @lattice-engine/cli
      - run: lattice auth login --token=\${{ secrets.LATTICE_TOKEN }}
      - run: lattice validate --all --strict
      - run: lattice test --all --performance
  
  deploy:
    needs: validate
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @lattice-engine/cli
      - run: lattice auth login --token=\${{ secrets.LATTICE_TOKEN }}
      - run: lattice deploy production`}</pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Performance Optimization</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-sm">
                      <li>• Use <code>--parallel</code> flag for concurrent operations</li>
                      <li>• Enable caching with <code>--cache</code> for faster builds</li>
                      <li>• Use <code>--incremental</code> for incremental validation</li>
                      <li>• Configure connection pooling in config file</li>
                      <li>• Use <code>--quiet</code> to reduce output overhead</li>
                      <li>• Enable compression for large specification transfers</li>
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
                      <li>• Use version control for all specifications</li>
                      <li>• Validate before every deployment</li>
                      <li>• Use environment-specific configurations</li>
                      <li>• Implement proper error handling</li>
                      <li>• Use descriptive specification names</li>
                      <li>• Keep configurations in version control</li>
                      <li>• Use CI/CD for automated deployments</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-600">❌ Don'ts</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Don't hardcode API keys in configurations</li>
                      <li>• Don't skip validation in production</li>
                      <li>• Don't deploy without testing</li>
                      <li>• Don't ignore linting warnings</li>
                      <li>• Don't use production data in development</li>
                      <li>• Don't bypass authentication</li>
                      <li>• Don't ignore performance metrics</li>
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
                <div className="font-medium">API Documentation</div>
                <div className="text-sm text-gray-600">Complete API reference</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">SDK Documentation</div>
                <div className="text-sm text-gray-600">JavaScript & Python SDKs</div>
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
  )
}