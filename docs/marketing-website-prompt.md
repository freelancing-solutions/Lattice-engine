# Lattice Engine Marketing Website Build Prompt

## Project Overview

Build a **developer-focused marketing website** for Lattice Engine - an agentic coding platform that revolutionizes how developers manage specifications, mutations, and collaborative coding workflows. This is a **frontend-only marketing site** that showcases the platform's capabilities and drives developer adoption.

**Target Audience**: Professional developers, engineering teams, DevOps engineers, and technical decision-makers who struggle with:
- Manual code reviews and approval workflows
- Inconsistent specification management
- Lack of automated mutation tracking
- Poor collaboration on code changes
- Time-consuming deployment processes

## What to Build

### Core Marketing Website Features
- **Modern React/TypeScript marketing site** with shadcn/ui components
- **Developer-centric design** with code-like animations and terminal aesthetics
- **Comprehensive documentation hub** for APIs, VSCode extensions, and workflows
- **Interactive demos** and tutorials for quick onboarding
- **Status dashboard** showing system health and uptime
- **Integrated support system** with ticketing functionality
- **SEO-optimized blog** with technical content marketing

### What NOT to Build
- Backend APIs or authentication systems
- User dashboard functionality (separate app)
- Payment processing or subscription management
- Admin panels or user management systems
- Real-time chat or messaging features

## Technology Stack Requirements

### Frontend Framework
```json
{
  "framework": "React 18+ with TypeScript",
  "bundler": "Vite",
  "styling": "Tailwind CSS",
  "components": "shadcn/ui",
  "animations": "Framer Motion",
  "icons": "Lucide React",
  "routing": "React Router v6"
}
```

### Additional Libraries
```json
{
  "forms": "React Hook Form + Zod validation",
  "markdown": "MDX for documentation and blog",
  "syntax_highlighting": "Prism.js or Shiki",
  "analytics": "Google Analytics 4",
  "seo": "React Helmet Async",
  "state_management": "Zustand (minimal global state)",
  "http_client": "Axios for API calls"
}
```

### Development Tools
```json
{
  "linting": "ESLint + Prettier",
  "testing": "Vitest + React Testing Library",
  "type_checking": "TypeScript strict mode",
  "build": "Vite production build",
  "deployment": "Vercel/Netlify ready"
}
```

## Site Architecture & Navigation

### Primary Navigation Structure
```typescript
interface NavigationStructure {
  home: "/";
  about: "/about";
  services: "/services";
  documentation: {
    overview: "/docs";
    api: "/docs/api";
    vscode: "/docs/vscode-extension";
    mcp_servers: "/docs/mcp-servers";
    workflows: "/docs/workflows";
    tutorials: "/docs/tutorials";
  };
  blog: "/blog";
  downloads: "/downloads";
  support: "/support";
  status: "/status";
  contact: "/contact";
  auth: {
    login: "https://app.lattice.dev/login";
    register: "https://app.lattice.dev/register";
    dashboard: "https://app.lattice.dev/dashboard";
  };
}
```

### Responsive Design Breakpoints
```css
/* Mobile First Approach */
sm: '640px',   /* Mobile landscape */
md: '768px',   /* Tablet */
lg: '1024px',  /* Desktop */
xl: '1280px',  /* Large desktop */
2xl: '1536px'  /* Extra large */
```

## Home Page Design & Components

### Hero Section
```typescript
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    {/* Animated background with floating code snippets */}
    <AnimatedCodeBackground />
    
    <div className="container mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Agentic Coding
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {" "}Redefined
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Automate your development workflow with intelligent mutation management, 
          spec-driven development, and collaborative code evolution.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
          <Button size="lg" variant="outline" className="border-purple-400 text-purple-400">
            <Download className="mr-2 h-5 w-5" />
            Get Started Free
          </Button>
        </div>
      </motion.div>
    </div>
    
    {/* Terminal-style code preview */}
    <TerminalCodePreview />
  </section>
);
```

### Value Proposition Sections
```typescript
const ValuePropositions = [
  {
    title: "Spec-Driven Development",
    description: "Define your application behavior with living specifications that evolve with your code",
    icon: FileText,
    features: [
      "Automated spec validation",
      "Version-controlled specifications",
      "Real-time sync with codebase",
      "Collaborative spec editing"
    ]
  },
  {
    title: "Intelligent Mutations",
    description: "Track, approve, and execute code changes with AI-powered risk assessment",
    icon: GitBranch,
    features: [
      "Risk-based approval workflows",
      "Automated testing integration",
      "Rollback capabilities",
      "Audit trail for all changes"
    ]
  },
  {
    title: "Seamless Integration",
    description: "Works with your existing tools and workflows through VSCode extension and APIs",
    icon: Zap,
    features: [
      "VSCode extension",
      "REST API access",
      "MCP server integration",
      "CI/CD pipeline support"
    ]
  }
];
```

### Interactive Demo Section
```typescript
const InteractiveDemo = () => (
  <section className="py-20 bg-slate-50">
    <div className="container mx-auto px-4">
      <h2 className="text-4xl font-bold text-center mb-12">
        See Lattice in Action
      </h2>
      
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Tabs defaultValue="mutation" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mutation">Mutation Flow</TabsTrigger>
              <TabsTrigger value="spec">Spec Management</TabsTrigger>
              <TabsTrigger value="approval">Approval Process</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mutation">
              <Card>
                <CardHeader>
                  <CardTitle>Propose Code Mutation</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedCodeEditor 
                    before={mutationBefore}
                    after={mutationAfter}
                    language="typescript"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Additional tabs... */}
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold">
            From Idea to Production in Minutes
          </h3>
          <StepByStepFlow />
        </div>
      </div>
    </div>
  </section>
);
```

### Developer-Focused Features Grid
```typescript
const DeveloperFeatures = [
  {
    icon: Terminal,
    title: "CLI Integration",
    description: "Powerful command-line tools for automation",
    code: "npx lattice mutation propose --spec user-auth"
  },
  {
    icon: Code,
    title: "VSCode Extension",
    description: "Native IDE integration with IntelliSense",
    code: "// Auto-complete for Lattice APIs\nlattice.mutation.create({...})"
  },
  {
    icon: Webhook,
    title: "REST API",
    description: "Full programmatic access to all features",
    code: "POST /api/v1/mutations\n{\n  \"spec_id\": \"user-auth\",\n  \"changes\": {...}\n}"
  },
  {
    icon: Database,
    title: "MCP Servers",
    description: "Model Context Protocol integration",
    code: "mcp://lattice.dev/specs/user-management"
  }
];
```

## Documentation Structure

### API Documentation
```typescript
interface APIDocStructure {
  overview: {
    title: "API Overview";
    sections: [
      "Authentication",
      "Rate Limiting", 
      "Error Handling",
      "Pagination",
      "Webhooks"
    ];
  };
  endpoints: {
    authentication: "/docs/api/auth";
    projects: "/docs/api/projects";
    specifications: "/docs/api/specs";
    mutations: "/docs/api/mutations";
    users: "/docs/api/users";
    organizations: "/docs/api/organizations";
  };
  sdks: {
    javascript: "/docs/api/sdk/javascript";
    python: "/docs/api/sdk/python";
    go: "/docs/api/sdk/go";
    curl: "/docs/api/sdk/curl";
  };
}
```

### VSCode Extension Documentation
```typescript
interface VSCodeDocStructure {
  installation: "/docs/vscode/installation";
  quickStart: "/docs/vscode/quick-start";
  features: {
    specManagement: "/docs/vscode/spec-management";
    mutationProposal: "/docs/vscode/mutation-proposal";
    approvalWorkflow: "/docs/vscode/approval-workflow";
    debugging: "/docs/vscode/debugging";
  };
  configuration: "/docs/vscode/configuration";
  troubleshooting: "/docs/vscode/troubleshooting";
}
```

### MCP Servers Documentation
```typescript
interface MCPDocStructure {
  overview: "/docs/mcp/overview";
  servers: {
    specServer: "/docs/mcp/spec-server";
    mutationServer: "/docs/mcp/mutation-server";
    projectServer: "/docs/mcp/project-server";
  };
  integration: {
    claude: "/docs/mcp/claude-integration";
    customClients: "/docs/mcp/custom-clients";
    authentication: "/docs/mcp/authentication";
  };
  examples: "/docs/mcp/examples";
}
```

## Cool Developer Animations

### Animated Code Background
```typescript
const AnimatedCodeBackground = () => {
  const codeSnippets = [
    "const mutation = await lattice.propose({...});",
    "if (spec.isValid()) { deploy(); }",
    "// AI-powered risk assessment",
    "mutation.status === 'approved'",
    "lattice.sync.specifications()",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      {codeSnippets.map((snippet, i) => (
        <motion.div
          key={i}
          className="absolute text-green-400 font-mono text-sm"
          initial={{ x: -100, y: Math.random() * window.innerHeight }}
          animate={{ 
            x: window.innerWidth + 100,
            y: Math.random() * window.innerHeight 
          }}
          transition={{ 
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 2
          }}
        >
          {snippet}
        </motion.div>
      ))}
    </div>
  );
};
```

### Terminal Code Preview
```typescript
const TerminalCodePreview = () => (
  <motion.div 
    className="absolute bottom-10 right-10 w-96 bg-gray-900 rounded-lg shadow-2xl border border-gray-700"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 1, duration: 0.5 }}
  >
    <div className="flex items-center justify-between p-3 border-b border-gray-700">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
      <span className="text-gray-400 text-sm">lattice-cli</span>
    </div>
    
    <div className="p-4 font-mono text-sm">
      <TypewriterEffect
        text={`$ lattice mutation propose
✓ Analyzing code changes...
✓ Risk assessment: LOW
✓ Mutation proposed successfully
→ Review at: https://app.lattice.dev/mutations/mut_123`}
        speed={50}
      />
    </div>
  </motion.div>
);
```

### Floating Feature Cards
```typescript
const FloatingFeatureCards = () => (
  <div className="absolute inset-0 pointer-events-none">
    {features.map((feature, i) => (
      <motion.div
        key={i}
        className="absolute bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
        style={{
          left: `${20 + (i * 15)}%`,
          top: `${30 + (i * 10)}%`,
        }}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 1, 0],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          delay: i * 0.5,
        }}
      >
        <feature.icon className="h-6 w-6 text-purple-400 mb-2" />
        <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
      </motion.div>
    ))}
  </div>
);
```

## Blog Content Strategy

### Blog Categories & Topics
```typescript
interface BlogStructure {
  categories: {
    "agentic-coding": {
      title: "Agentic Coding";
      topics: [
        "Introduction to Agentic Development",
        "AI-Powered Code Review Workflows",
        "Automated Mutation Testing",
        "The Future of Collaborative Coding"
      ];
    };
    "spec-management": {
      title: "Specification Management";
      topics: [
        "Spec-Driven Development Best Practices",
        "Living Documentation with Lattice",
        "Version Control for Specifications",
        "Collaborative Spec Writing"
      ];
    };
    "tutorials": {
      title: "Tutorials & Guides";
      topics: [
        "Getting Started with Lattice Engine",
        "Setting up VSCode Extension",
        "MCP Server Integration Guide",
        "Advanced Workflow Automation"
      ];
    };
    "case-studies": {
      title: "Case Studies";
      topics: [
        "How Team X Reduced Review Time by 80%",
        "Scaling Development with Lattice",
        "Migration Success Stories",
        "ROI Analysis: Before and After Lattice"
      ];
    };
  };
}
```

### Blog Post Template
```typescript
interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // MDX content
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  readingTime: number;
  tags: string[];
  category: keyof BlogStructure['categories'];
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
}
```

## Tutorial Sections

### MCP Setup Tutorial
```typescript
const MCPTutorial = {
  title: "Setting up MCP Servers with Lattice",
  steps: [
    {
      title: "Install MCP Client",
      code: `npm install -g @lattice/mcp-client`,
      description: "Install the Lattice MCP client globally"
    },
    {
      title: "Configure Server Connection",
      code: `mcp connect lattice://api.lattice.dev/mcp`,
      description: "Connect to Lattice MCP servers"
    },
    {
      title: "Authenticate",
      code: `mcp auth --api-key YOUR_API_KEY`,
      description: "Authenticate with your Lattice API key"
    },
    {
      title: "Test Connection",
      code: `mcp list-specs`,
      description: "Verify connection by listing available specs"
    }
  ]
};
```

### VSCode Extension Tutorial
```typescript
const VSCodeTutorial = {
  title: "Lattice VSCode Extension Setup",
  steps: [
    {
      title: "Install Extension",
      description: "Install from VSCode Marketplace",
      action: "marketplace-link"
    },
    {
      title: "Configure API Key",
  code: `{
  "lattice.apiKey": "your-api-key",
  "lattice.baseUrl": "https://api.project-lattice.site"
}`,
      description: "Add configuration to VSCode settings"
    },
    {
      title: "Initialize Project",
      code: `Ctrl+Shift+P → "Lattice: Initialize Project"`,
      description: "Initialize Lattice in your workspace"
    }
  ]
};
```

## Downloads Page Structure

### SDK Downloads
```typescript
interface DownloadItem {
  name: string;
  description: string;
  version: string;
  downloadUrl: string;
  documentation: string;
  size: string;
  platforms: string[];
}

const downloads: DownloadItem[] = [
  {
    name: "Lattice JavaScript SDK",
    description: "Full-featured SDK for Node.js and browser environments",
    version: "v2.1.0",
    downloadUrl: "/downloads/lattice-js-sdk-v2.1.0.zip",
    documentation: "/docs/api/sdk/javascript",
    size: "2.3 MB",
    platforms: ["Node.js", "Browser", "React", "Vue", "Angular"]
  },
  {
    name: "Lattice Python SDK",
    description: "Python SDK with async support and type hints",
    version: "v2.1.0", 
    downloadUrl: "/downloads/lattice-python-sdk-v2.1.0.zip",
    documentation: "/docs/api/sdk/python",
    size: "1.8 MB",
    platforms: ["Python 3.8+", "FastAPI", "Django", "Flask"]
  },
  {
    name: "VSCode Extension",
    description: "Native VSCode integration with IntelliSense support",
    version: "v1.5.2",
    downloadUrl: "vscode:extension/lattice.lattice-engine",
    documentation: "/docs/vscode",
    size: "5.2 MB",
    platforms: ["VSCode", "VSCodium"]
  },
  {
    name: "CLI Tools",
    description: "Command-line interface for automation and CI/CD",
    version: "v2.0.1",
    downloadUrl: "/downloads/lattice-cli-v2.0.1.zip",
    documentation: "/docs/cli",
    size: "15.4 MB",
    platforms: ["Windows", "macOS", "Linux"]
  }
];
```

## Status Page Implementation

### System Status Components
```typescript
interface SystemStatus {
  overall: 'operational' | 'degraded' | 'outage';
  services: {
    api: ServiceStatus;
    dashboard: ServiceStatus;
    vscode_extension: ServiceStatus;
    mcp_servers: ServiceStatus;
    documentation: ServiceStatus;
  };
  incidents: Incident[];
  uptime: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime: number;
  uptime: number;
  lastChecked: string;
}

const StatusPage = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-4">System Status</h1>
      <StatusIndicator status={systemStatus.overall} />
    </div>
    
    <div className="grid gap-6">
      {Object.entries(systemStatus.services).map(([key, service]) => (
        <ServiceStatusCard key={key} service={service} />
      ))}
    </div>
    
    <UptimeChart data={uptimeData} />
    <IncidentHistory incidents={systemStatus.incidents} />
  </div>
);
```

## Support & Ticketing System

### Support Page Structure
```typescript
const SupportPage = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold mb-6">Get Help</h1>
        
        <Tabs defaultValue="docs" className="w-full">
          <TabsList>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="docs">
            <QuickHelpLinks />
          </TabsContent>
          
          <TabsContent value="community">
            <CommunityResources />
          </TabsContent>
          
          <TabsContent value="contact">
            <SupportTicketForm />
          </TabsContent>
        </Tabs>
      </div>
      
      <div>
        <SupportSidebar />
      </div>
    </div>
  </div>
);
```

### Ticket System Form
```typescript
const SupportTicketForm = () => {
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="integration">Integration Help</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low - General question</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium - Feature not working</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High - Service disruption</Label>
                </div>
              </RadioGroup>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of your issue" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please provide detailed information about your issue..."
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Submit Ticket
        </Button>
      </form>
    </Form>
  );
};
```

## Footer Structure

### Comprehensive Footer
```typescript
const Footer = () => (
  <footer className="bg-slate-900 text-white">
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">Product</h3>
          <ul className="space-y-2">
            <li><Link to="/services" className="text-gray-300 hover:text-white">Services</Link></li>
            <li><Link to="/docs" className="text-gray-300 hover:text-white">Documentation</Link></li>
            <li><Link to="/downloads" className="text-gray-300 hover:text-white">Downloads</Link></li>
            <li><Link to="/status" className="text-gray-300 hover:text-white">System Status</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Documentation</h3>
          <ul className="space-y-2">
            <li><Link to="/docs/api" className="text-gray-300 hover:text-white">API Reference</Link></li>
            <li><Link to="/docs/vscode" className="text-gray-300 hover:text-white">VSCode Extension</Link></li>
            <li><Link to="/docs/mcp-servers" className="text-gray-300 hover:text-white">MCP Servers</Link></li>
            <li><Link to="/docs/tutorials" className="text-gray-300 hover:text-white">Tutorials</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Support</h3>
          <ul className="space-y-2">
            <li><Link to="/support" className="text-gray-300 hover:text-white">Help Center</Link></li>
            <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
            <li><Link to="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
            <li><a href="https://github.com/lattice-dev" className="text-gray-300 hover:text-white">GitHub</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link to="/about" className="text-gray-300 hover:text-white">About</Link></li>
            <li><Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
            <li><Link to="/security" className="text-gray-300 hover:text-white">Security</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <LatticeIcon className="h-8 w-8" />
          <span className="text-gray-300">© 2024 Lattice Engine. All rights reserved.</span>
        </div>
        
        <div className="flex space-x-4">
          <a href="https://twitter.com/latticedev" className="text-gray-300 hover:text-white">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="https://github.com/lattice-dev" className="text-gray-300 hover:text-white">
            <Github className="h-5 w-5" />
          </a>
          <a href="https://linkedin.com/company/lattice-dev" className="text-gray-300 hover:text-white">
            <Linkedin className="h-5 w-5" />
          </a>
          <a href="https://discord.gg/lattice" className="text-gray-300 hover:text-white">
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);
```

## SEO & Performance Requirements

### Meta Tags & SEO
```typescript
const SEOConfig = {
  defaultTitle: "Lattice Engine - Agentic Coding Platform",
  titleTemplate: "%s | Lattice Engine",
  defaultDescription: "Revolutionize your development workflow with intelligent mutation management, spec-driven development, and collaborative code evolution.",
  siteUrl: "https://lattice.dev",
  defaultImage: "/images/og-default.png",
  twitterHandle: "@latticedev",
  
  structuredData: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Lattice Engine",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web, VSCode, CLI",
    "description": "Agentic coding platform for intelligent development workflows",
    "url": "https://lattice.dev",
    "author": {
      "@type": "Organization",
      "name": "Lattice Dev"
    }
  }
};
```

### Performance Targets
```typescript
const PerformanceTargets = {
  lighthouse: {
    performance: 95,
    accessibility: 100,
    bestPractices: 100,
    seo: 100
  },
  coreWebVitals: {
    lcp: "< 2.5s",  // Largest Contentful Paint
    fid: "< 100ms", // First Input Delay
    cls: "< 0.1"    // Cumulative Layout Shift
  },
  bundleSize: {
    initial: "< 200KB gzipped",
    total: "< 1MB gzipped"
  }
};
```

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up Vite + React + TypeScript project
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Implement basic routing with React Router
- [ ] Create responsive layout structure
- [ ] Set up Framer Motion for animations
- [ ] Configure ESLint, Prettier, and TypeScript strict mode

### Phase 2: Core Pages (Week 2)
- [ ] Build animated hero section with terminal preview
- [ ] Create value proposition sections with interactive demos
- [ ] Implement about page with team and company info
- [ ] Build services page with feature breakdown
- [ ] Create contact page with form validation
- [ ] Add floating animations and code background effects

### Phase 3: Documentation Hub (Week 3)
- [ ] Set up MDX for documentation rendering
- [ ] Create API documentation structure with code examples
- [ ] Build VSCode extension documentation with screenshots
- [ ] Implement MCP servers documentation with integration guides
- [ ] Add search functionality across all documentation
- [ ] Create tutorial sections with step-by-step guides

### Phase 4: Downloads & Support (Week 4)
- [ ] Build downloads page with SDK and extension links
- [ ] Implement system status page with real-time monitoring
- [ ] Create support ticket system with form validation
- [ ] Add comprehensive FAQ section
- [ ] Build community resources and links
- [ ] Implement help search and filtering

### Phase 5: Blog & Content (Week 5)
- [ ] Set up blog with MDX and category filtering
- [ ] Create blog post templates and layouts
- [ ] Implement tag-based navigation and search
- [ ] Add RSS feed generation
- [ ] Create author profiles and bio pages
- [ ] Build related posts and recommendations

### Phase 6: Polish & Optimization (Week 6)
- [ ] Implement comprehensive SEO meta tags
- [ ] Add structured data and Open Graph tags
- [ ] Optimize images and implement lazy loading
- [ ] Set up analytics and error tracking
- [ ] Perform accessibility audit and fixes
- [ ] Optimize bundle size and implement code splitting
- [ ] Add PWA features (service worker, offline support)
- [ ] Configure deployment pipeline and CDN

## Success Criteria

### Developer Engagement Metrics
1. **Time to Understanding**: Visitors should grasp Lattice's value within 30 seconds
2. **Documentation Usage**: High engagement with API docs and tutorials
3. **Download Conversion**: Strong conversion from landing to downloads
4. **Support Efficiency**: Self-service resolution for common questions
5. **Developer Retention**: Return visits and deep documentation engagement

### Technical Performance
1. **Page Load Speed**: < 3 seconds initial load, < 1 second navigation
2. **Mobile Experience**: Fully responsive with touch-friendly interactions
3. **SEO Performance**: Top rankings for "agentic coding" and related terms
4. **Accessibility**: WCAG 2.1 AA compliance across all pages
5. **Uptime**: 99.9% availability with status page transparency

### Content Quality
1. **Documentation Completeness**: Comprehensive coverage of all features
2. **Tutorial Effectiveness**: Step-by-step guides that work without issues
3. **Blog Engagement**: Regular technical content that drives organic traffic
4. **Community Building**: Active engagement through support channels
5. **Developer Trust**: Transparent communication about features and limitations

## Final Notes

This marketing website should serve as the **primary conversion funnel** for developer adoption of Lattice Engine. The site must:

1. **Immediately communicate value** to time-pressed developers
2. **Provide comprehensive technical documentation** for evaluation
3. **Offer multiple engagement paths** (downloads, tutorials, support)
4. **Build trust through transparency** (status page, open communication)
5. **Convert visitors to active users** through compelling demos and clear CTAs

The result should be a **developer-first marketing experience** that respects technical audiences while driving meaningful engagement and adoption of the Lattice Engine platform.