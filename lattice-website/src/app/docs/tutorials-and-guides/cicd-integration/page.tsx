"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
// import CodeBlock from "@/components/ui/code-block";
import { 
  GitBranch, 
  Zap, 
  CheckCircle, 
  Settings, 
  Play, 
  Shield, 
  Clock, 
  AlertTriangle,
  Github,
  GitlabIcon as Gitlab,
  Activity,
  Workflow,
  Target,
  Monitor,
  TrendingUp,
  Bell,
  Code,
  Database,
  Cloud,
  Lock,
  ArrowRight,
  ExternalLink,
  Copy,
  Terminal,
  FileText,
  Layers,
  Package
} from 'lucide-react';

// Configuration constants
const CONFIG = {
  quickNavItems: [
    { icon: Github, label: 'GitHub Actions' },
    { icon: Gitlab, label: 'GitLab CI' },
    { icon: Activity, label: 'Jenkins' },
    { icon: Cloud, label: 'Azure DevOps' }
  ],
  tabItems: [
    { value: 'github-actions', label: 'GitHub Actions' },
    { value: 'gitlab-ci', label: 'GitLab CI' },
    { value: 'jenkins', label: 'Jenkins' },
    { value: 'azure-devops', label: 'Azure DevOps' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'best-practices', label: 'Best Practices' }
  ],
  metrics: [
    { value: '98.5%', label: 'Success Rate', color: 'text-green-600' },
    { value: '12m', label: 'Avg Build Time', color: 'text-blue-600' },
    { value: '3.2', label: 'Deploys/Day', color: 'text-orange-600' },
    { value: '99.9%', label: 'Uptime', color: 'text-purple-600' }
  ]
} as const;

// Reusable Components
const CodeBlock = ({ 
  fileName, 
  code, 
  onCopy = () => {} 
}: { 
  fileName: string;
  code: string;
  onCopy?: () => void;
}) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium">{fileName}</span>
      <Button size="sm" variant="ghost" onClick={onCopy}>
        <Copy className="w-3 h-3" />
      </Button>
    </div>
    <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-words">
      {code}
    </pre>
  </div>
);

const MetricCard = ({ value, label, color }: { 
  value: string; 
  label: string; 
  color: string; 
}) => (
  <Card>
    <CardContent className="p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </CardContent>
  </Card>
);

const QuickNavigation = () => (
  <div className="flex flex-wrap gap-2 mb-8">
    {CONFIG.quickNavItems.map(({ icon: Icon, label }) => (
      <Button key={label} size="sm" variant="outline">
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </Button>
    ))}
  </div>
);

const HeaderSection = () => (
  <div className="mb-8">
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <span>Tutorials & Guides</span>
      <ArrowRight className="w-4 h-4" />
      <span className="text-blue-600 font-medium">CI/CD Integration</span>
    </div>
    
    <h1 className="text-4xl font-bold text-gray-900 mb-4">
      CI/CD Integration with Lattice Engine
    </h1>
    
    <p className="text-xl text-gray-600 mb-6">
      Automate your development workflow with continuous integration and deployment pipelines.
    </p>

    <QuickNavigation />
  </div>
);

const GitHubActionsContent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Github className="w-5 h-5 mr-2" />
        GitHub Actions Integration
      </CardTitle>
      <CardDescription>
        Set up automated workflows with GitHub Actions for Lattice Engine projects.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Workflow className="w-4 h-4 mr-2" />
          Basic CI/CD Workflow
        </h3>
        <CodeBlock 
          fileName=".github/workflows/lattice-ci.yml"
          code={`name: Lattice Engine CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Lattice validation
        run: |
          npx lattice validate --config .lattice/config.json
          npx lattice test --coverage
        env:
          LATTICE_API_KEY: \${{ secrets.LATTICE_API_KEY }}
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to staging
        if: github.ref == 'refs/heads/develop'
        run: |
          npx lattice deploy --env staging
        env:
          LATTICE_API_KEY: \${{ secrets.LATTICE_API_KEY }}
          STAGING_TOKEN: \${{ secrets.STAGING_TOKEN }}
      `}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Matrix Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <pre>
{`strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest]`}
                </pre>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conditional Deployment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <pre>
{`- name: Deploy to production
  if: |
    github.ref == 'refs/heads/main' &&
    github.event_name == 'push'`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Lock className="w-4 h-4 mr-2" />
          Secrets Management
        </h3>
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            Store sensitive information like API keys and tokens in GitHub Secrets.
          </AlertDescription>
        </Alert>
        <div className="mt-3 space-y-2">
          {[
            { name: 'LATTICE_API_KEY', required: true },
            { name: 'STAGING_TOKEN', required: false },
            { name: 'PRODUCTION_TOKEN', required: false }
          ].map(({ name, required }) => (
            <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <code className="text-sm">{name}</code>
              <Badge variant={required ? "secondary" : "outline"}>
                {required ? "Required" : "Optional"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const MonitoringContent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Monitor className="w-5 h-5 mr-2" />
        Pipeline Monitoring & Analytics
      </CardTitle>
      <CardDescription>
        Monitor your CI/CD pipelines and track deployment metrics.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Key Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONFIG.metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Bell className="w-4 h-4 mr-2" />
          Monitoring Configuration
        </h3>
        <CodeBlock 
          fileName="monitoring.config.js"
          code={`const monitoring = {
  pipelines: {
    alerts: {
      failureRate: { threshold: 5, window: "1h" },
      buildTime: { threshold: "15m", window: "30m" }
    }
  }
};`}
        />
      </div>
    </CardContent>
  </Card>
);

const QuickLinks = () => (
  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      { title: 'Advanced Workflows', description: 'Learn about complex deployment patterns and workflows.', buttonText: 'View Advanced Workflows →', variant: 'default' as const },
      { title: 'Team Collaboration', description: 'Set up team workflows and collaboration tools.', buttonText: 'Team Setup Guide →', variant: 'outline' as const },
      { title: 'API Reference', description: 'Explore CI/CD automation APIs and webhooks.', buttonText: 'API Documentation →', variant: 'outline' as const }
    ].map((link) => (
      <Card key={link.title}>
        <CardHeader>
          <CardTitle className="text-base">{link.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">{link.description}</p>
          <Button size="sm" variant={link.variant} className="w-full">
            {link.buttonText}
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Main Component
export default function CICDIntegrationPage() {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const tabComponents = {
    'github-actions': <GitHubActionsContent />,
    'gitlab-ci': <div>GitLab CI Content</div>,
    'jenkins': <div>Jenkins Content</div>,
    'azure-devops': <div>Azure DevOps Content</div>,
    'monitoring': <MonitoringContent />,
    'best-practices': <div>Best Practices Content</div>
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <HeaderSection />

        <div className="space-y-8">
          <Tabs defaultValue="github-actions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {CONFIG.tabItems.map(({ value, label }) => (
                <TabsTrigger key={value} value={value}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CONFIG.tabItems.map(({ value }) => (
              <TabsContent key={value} value={value} className="space-y-6">
                {tabComponents[value as keyof typeof tabComponents]}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <QuickLinks />
      </div>
    </div>
  );
}