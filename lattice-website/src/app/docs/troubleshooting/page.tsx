import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Search,
  Terminal,
  Settings,
  Network,
  Database,
  Code,
  Clock,
  Shield,
  Zap,
  Bug,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Copy,
  RefreshCw,
  FileText,
  Monitor,
  Cpu,
  MemoryStick,
  Wifi,
  Server,
  Key,
  Lock,
  AlertCircle,
  Wrench,
  BookOpen,
  MessageSquare
} from 'lucide-react';

export default function TroubleshootingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <span>Documentation</span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-red-600 font-medium">Troubleshooting</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Troubleshooting Guide
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Common issues, solutions, and debugging techniques for Lattice Engine.
          </p>

          {/* Quick Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for issues, error messages, or symptoms..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button size="sm" variant="outline">
              <Bug className="w-4 h-4 mr-2" />
              Common Errors
            </Button>
            <Button size="sm" variant="outline">
              <Network className="w-4 h-4 mr-2" />
              Connection Issues
            </Button>
            <Button size="sm" variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </Button>
            <Button size="sm" variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Performance
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <Tabs defaultValue="common-issues" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="common-issues">Common Issues</TabsTrigger>
              <TabsTrigger value="installation">Installation</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="debugging">Debugging</TabsTrigger>
              <TabsTrigger value="support">Get Support</TabsTrigger>
            </TabsList>

            {/* Common Issues */}
            <TabsContent value="common-issues" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bug className="w-5 h-5 mr-2" />
                    Most Common Issues
                  </CardTitle>
                  <CardDescription>
                    Frequently encountered problems and their solutions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Authentication Errors */}
                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <XCircle className="w-4 h-4 mr-2 text-red-500" />
                      Authentication Failed
                    </h3>
                    <div className="space-y-3">
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <strong>Error:</strong> "Invalid API key" or "Authentication failed"
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Solutions:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Verify your API key is correct and hasn't expired</li>
                          <li>Check if the API key has the required permissions</li>
                          <li>Ensure you're using the correct environment (staging vs production)</li>
                          <li>Regenerate the API key if necessary</li>
                        </ol>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Quick Fix:</strong> Run <code>lattice auth verify</code> to test your credentials.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connection Timeout */}
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-orange-500" />
                      Connection Timeout
                    </h3>
                    <div className="space-y-3">
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <strong>Error:</strong> "Request timeout" or "Connection refused"
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Troubleshooting Steps:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Check your internet connection</li>
                          <li>Verify firewall settings aren't blocking requests</li>
                          <li>Test with a different network or VPN</li>
                          <li>Check if the Lattice service is experiencing downtime</li>
                        </ol>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm text-green-800">
                          <strong>Status Check:</strong> Visit <a href="#" className="underline">status.lattice.dev</a> for service status.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Validation Errors */}
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                      Specification Validation Failed
                    </h3>
                    <div className="space-y-3">
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <strong>Error:</strong> "Invalid specification format" or "Schema validation failed"
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Common Causes:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Missing required fields in specification</li>
                          <li>Incorrect data types or format</li>
                          <li>Invalid JSON syntax</li>
                          <li>Outdated specification schema version</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Debug Command:</strong> <code>lattice validate --verbose spec.json</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MemoryStick Issues */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <MemoryStick className="w-4 h-4 mr-2 text-purple-500" />
                      Out of Memory Errors
                    </h3>
                    <div className="space-y-3">
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <strong>Error:</strong> "JavaScript heap out of Memory" or "Process killed"
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Solutions:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Increase Node.js Memory limit: <code>--max-old-space-size=4096</code></li>
                          <li>Process data in smaller chunks</li>
                          <li>Optimize your specifications to reduce Memory usage</li>
                          <li>Use streaming for large datasets</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Installation Issues */}
            <TabsContent value="installation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="w-5 h-5 mr-2" />
                    Installation Troubleshooting
                  </CardTitle>
                  <CardDescription>
                    Resolve installation and setup problems.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* NPM Installation Issues */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Terminal className="w-4 h-4 mr-2" />
                      NPM Installation Problems
                    </h3>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-red-600">Permission Denied Errors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="bg-red-50 p-3 rounded">
                              <code className="text-sm">EACCES: permission denied, access '/usr/local/lib/node_modules'</code>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <h4 className="font-medium mb-2">Solutions:</h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Use a Node version manager (nvm, fnm)</li>
                                <li>Configure npm to use a different directory</li>
                                <li>Use <code>npx</code> instead of global installation</li>
                              </ol>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm text-blue-800">
                                <strong>Recommended:</strong> <code>npx @lattice/cli@latest init</code>
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-orange-600">Network/Proxy Issues</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="bg-orange-50 p-3 rounded">
                              <code className="text-sm">npm ERR! network request failed</code>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <h4 className="font-medium mb-2">Solutions:</h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Configure npm proxy settings</li>
                                <li>Use a different registry: <code>npm config set registry https://registry.npmjs.org/</code></li>
                                <li>Clear npm cache: <code>npm cache clean --force</code></li>
                                <li>Try with yarn instead: <code>yarn add @lattice/cli</code></li>
                              </ol>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-purple-600">Version Conflicts</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="bg-purple-50 p-3 rounded">
                              <code className="text-sm">npm ERR! peer dep missing</code>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              <h4 className="font-medium mb-2">Solutions:</h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Check Node.js version compatibility (requires Node 16+)</li>
                                <li>Update npm: <code>npm install -g npm@latest</code></li>
                                <li>Install peer dependencies manually</li>
                                <li>Use <code>--legacy-peer-deps</code> flag if necessary</li>
                              </ol>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* VSCode Extension Issues */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      VSCode Extension Issues
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Extension Not Loading</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li>• Restart VSCode completely</li>
                            <li>• Check extension is enabled</li>
                            <li>• Update to latest version</li>
                            <li>• Check VSCode version compatibility</li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">IntelliSense Not Working</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li>• Reload window (Ctrl+Shift+P → "Reload Window")</li>
                            <li>• Check workspace settings</li>
                            <li>• Verify .lattice folder exists</li>
                            <li>• Check TypeScript version</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuration Issues */}
            <TabsContent value="configuration" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Configuration Problems
                  </CardTitle>
                  <CardDescription>
                    Fix configuration and setup issues.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Config File Issues */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Configuration File Problems
                    </h3>
                    <div className="space-y-4">
                      <Alert>
                        <Info className="w-4 h-4" />
                        <AlertDescription>
                          Configuration files should be located in <code>.lattice/config.json</code>
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Common Configuration Issues:</h4>
                        <div className="space-y-3">
                          <div className="border-l-4 border-red-500 pl-3">
                            <p className="font-medium text-red-700">Invalid JSON Syntax</p>
                            <p className="text-sm text-gray-600">Use a JSON validator or linter to check syntax</p>
                            <code className="text-xs bg-red-100 px-2 py-1 rounded">lattice config validate</code>
                          </div>
                          
                          <div className="border-l-4 border-orange-500 pl-3">
                            <p className="font-medium text-orange-700">Missing Required Fields</p>
                            <p className="text-sm text-gray-600">Ensure all required configuration options are present</p>
                            <code className="text-xs bg-orange-100 px-2 py-1 rounded">lattice config init --template</code>
                          </div>
                          
                          <div className="border-l-4 border-yellow-500 pl-3">
                            <p className="font-medium text-yellow-700">Incorrect Paths</p>
                            <p className="text-sm text-gray-600">Verify all file paths are correct and accessible</p>
                            <code className="text-xs bg-yellow-100 px-2 py-1 rounded">lattice config check-paths</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Environment Variables */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Key className="w-4 h-4 mr-2" />
                      Environment Variables
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Required Environment Variables:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white rounded">
                          <code className="text-sm">LATTICE_API_KEY</code>
                          <Badge variant="destructive">Required</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded">
                          <code className="text-sm">LATTICE_ENVIRONMENT</code>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded">
                          <code className="text-sm">LATTICE_CONFIG_PATH</code>
                          <Badge variant="secondary">Optional</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Setting Environment Variables:</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Windows:</strong>
                          <code className="block bg-gray-200 p-2 rounded mt-1">set LATTICE_API_KEY=your_api_key_here</code>
                        </div>
                        <div>
                          <strong>macOS/Linux:</strong>
                          <code className="block bg-gray-200 p-2 rounded mt-1">export LATTICE_API_KEY=your_api_key_here</code>
                        </div>
                        <div>
                          <strong>.env file:</strong>
                          <code className="block bg-gray-200 p-2 rounded mt-1">LATTICE_API_KEY=your_api_key_here</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workspace Setup */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Monitor className="w-4 h-4 mr-2" />
                      Workspace Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Project Structure</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <pre>
{`project/
├── .lattice/
│   ├── config.json
│   ├── specs/
│   └── cache/
├── src/
├── package.json
└── README.md`}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">VSCode Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <pre>
{`// .vscode/settings.json
{
  "lattice.enabled": true,
  "lattice.configPath": ".lattice/config.json",
  "lattice.autoValidate": true
}`}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Issues */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Performance Troubleshooting
                  </CardTitle>
                  <CardDescription>
                    Diagnose and fix performance problems.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Slow Operations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Slow Operations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Validation Taking Too Long</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                              Large specifications can slow down validation.
                            </p>
                            <div className="bg-blue-50 p-3 rounded">
                              <h4 className="font-medium text-blue-800 mb-1">Solutions:</h4>
                              <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Enable incremental validation</li>
                                <li>• Split large specs into smaller ones</li>
                                <li>• Use validation caching</li>
                                <li>• Optimize specification structure</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Slow API Responses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                              API calls taking longer than expected.
                            </p>
                            <div className="bg-green-50 p-3 rounded">
                              <h4 className="font-medium text-green-800 mb-1">Optimizations:</h4>
                              <ul className="text-sm text-green-700 space-y-1">
                                <li>• Use request batching</li>
                                <li>• Implement response caching</li>
                                <li>• Reduce payload size</li>
                                <li>• Use compression</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Memory Usage */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <MemoryStick className="w-4 h-4 mr-2" />
                      High Memory Usage
                    </h3>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Memory Optimization Techniques:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Code Level:</h5>
                          <ul className="text-sm space-y-1">
                            <li>• Use streaming for large data</li>
                            <li>• Implement object pooling</li>
                            <li>• Clear unused references</li>
                            <li>• Use WeakMap/WeakSet when appropriate</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Configuration:</h5>
                          <ul className="text-sm space-y-1">
                            <li>• Increase Node.js heap size</li>
                            <li>• Enable garbage collection logging</li>
                            <li>• Tune GC parameters</li>
                            <li>• Monitor Memory usage</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CPU Usage */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Cpu className="w-4 h-4 mr-2" />
                      High CPU Usage
                    </h3>
                    <div className="space-y-4">
                      <Alert>
                        <Info className="w-4 h-4" />
                        <AlertDescription>
                          Use profiling tools to identify CPU bottlenecks in your specifications.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Profiling Commands:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-white rounded">
                            <code className="text-sm">lattice profile --cpu</code>
                            <Button size="sm" variant="ghost">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded">
                            <code className="text-sm">lattice analyze --performance</code>
                            <Button size="sm" variant="ghost">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded">
                            <code className="text-sm">node --prof your-script.js</code>
                            <Button size="sm" variant="ghost">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Debugging */}
            <TabsContent value="debugging" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bug className="w-5 h-5 mr-2" />
                    Debugging Techniques
                  </CardTitle>
                  <CardDescription>
                    Advanced debugging methods and tools.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Debug Mode */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Terminal className="w-4 h-4 mr-2" />
                      Enable Debug Mode
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Debug Commands:</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <code className="text-sm font-medium">lattice --debug validate</code>
                            <Badge variant="outline">Verbose validation</Badge>
                          </div>
                          <p className="text-xs text-gray-600">Shows detailed validation steps and errors</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <code className="text-sm font-medium">DEBUG=lattice:* lattice command</code>
                            <Badge variant="outline">Full debug logs</Badge>
                          </div>
                          <p className="text-xs text-gray-600">Enables all debug output</p>
                        </div>
                        
                        <div className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <code className="text-sm font-medium">lattice --trace command</code>
                            <Badge variant="outline">Stack traces</Badge>
                          </div>
                          <p className="text-xs text-gray-600">Shows full stack traces for errors</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Log Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Log Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Log Locations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                              <FileText className="w-3 h-3 mr-2" />
                              <code>.lattice/logs/debug.log</code>
                            </li>
                            <li className="flex items-center">
                              <FileText className="w-3 h-3 mr-2" />
                              <code>.lattice/logs/error.log</code>
                            </li>
                            <li className="flex items-center">
                              <FileText className="w-3 h-3 mr-2" />
                              <code>~/.lattice/global.log</code>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Log Levels</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                              <XCircle className="w-3 h-3 mr-2 text-red-500" />
                              ERROR - Critical issues
                            </li>
                            <li className="flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-2 text-yellow-500" />
                              WARN - Potential problems
                            </li>
                            <li className="flex items-center">
                              <Info className="w-3 h-3 mr-2 text-blue-500" />
                              INFO - General information
                            </li>
                            <li className="flex items-center">
                              <Bug className="w-3 h-3 mr-2 text-gray-500" />
                              DEBUG - Detailed debugging
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Common Debug Scenarios */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Common Debug Scenarios
                    </h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Specification Not Loading</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Check file path and permissions</li>
                            <li>Validate JSON syntax</li>
                            <li>Verify schema version compatibility</li>
                            <li>Check for circular references</li>
                          </ol>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Mutations Not Applying</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Verify mutation syntax and structure</li>
                            <li>Check target specification exists</li>
                            <li>Ensure proper permissions</li>
                            <li>Review mutation order and dependencies</li>
                          </ol>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Real-time Sync Issues</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Check WebSocket connection status</li>
                            <li>Verify authentication tokens</li>
                            <li>Test network connectivity</li>
                            <li>Review sync configuration</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Get Support */}
            <TabsContent value="support" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Get Help & Support
                  </CardTitle>
                  <CardDescription>
                    When you need additional assistance beyond this guide.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Support Channels */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Support Channels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Community Forum
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">
                            Get help from the community and Lattice team.
                          </p>
                          <Button size="sm" className="w-full">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Visit Forum
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
<CardTitle className="text-base flex items-center">
  <ExternalLink className="w-4 h-4 mr-2" />
  GitHub Issues
</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">
                            Report bugs and request features.
                          </p>
                          <Button size="sm" variant="outline" className="w-full">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Open Issue
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Documentation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">
                            Comprehensive guides and API reference.
                          </p>
                          <Button size="sm" variant="outline" className="w-full">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Browse Docs
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center">
                            <Shield className="w-4 h-4 mr-2" />
                            Enterprise Support
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">
                            Priority support for enterprise customers.
                          </p>
                          <Button size="sm" variant="outline" className="w-full">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Contact Sales
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Before Contacting Support */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Before Contacting Support</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Please gather this information:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-blue-500" />
                          <span>Lattice CLI version: <code>lattice --version</code></span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-blue-500" />
                          <span>Node.js version: <code>node --version</code></span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-blue-500" />
                          <span>Operating system and version</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-blue-500" />
                          <span>Complete error message and stack trace</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-blue-500" />
                          <span>Steps to reproduce the issue</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-blue-500" />
                          <span>Relevant configuration files (sanitized)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* System Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">System Information Command</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Generate system report</span>
                        <Button size="sm" variant="ghost">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <code className="text-sm">lattice doctor --report</code>
                      <p className="text-xs text-gray-600 mt-2">
                        This command generates a comprehensive system report including versions, configuration, and common issues.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                New to Lattice? Start with our installation guide.
              </p>
              <Button size="sm" className="w-full">
                Installation Guide →
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Detailed API documentation and examples.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                API Docs →
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Learn recommended patterns and practices.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Best Practices →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}