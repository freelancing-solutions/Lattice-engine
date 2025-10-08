# Lattice Engine Web Application Build Prompt

## Application Overview

Build a modern web application that serves as the primary interface for the Lattice Engine - a code mutation and approval system. This web app connects to existing Lattice Engine APIs and provides a comprehensive dashboard for managing code changes, approvals, and project collaboration.

**IMPORTANT**: This prompt is for building ONLY the frontend web application. The backend APIs, authentication system, and core engine already exist and are running at `https://api.lattice.dev`.

## Application Scope

### What to Build
- **React-based web application** with TypeScript
- **Dashboard interface** for mutation management
- **Project management** views and workflows  
- **Real-time collaboration** features via WebSocket
- **Authentication integration** with existing JWT system
- **Responsive design** for desktop and mobile

### What NOT to Build
- ❌ Backend APIs (already exist)
- ❌ Authentication system (integrate with existing)
- ❌ Database models (use API responses)
- ❌ Server infrastructure (frontend only)
- ❌ MCP SDK (already exists as npm package)

## Technology Stack Requirements

### Frontend Framework
- **React 18+** with TypeScript
- **Vite** for build tooling and development server
- **React Router v6** for client-side routing
- **TanStack Query** for API state management and caching
- **Zustand** for global state management
- **Tailwind CSS** for styling with shadcn/ui components

### UI/UX Libraries
- **shadcn/ui** component library (built on Radix UI)
- **Lucide React** for icons
- **React Hook Form** with Zod validation
- **Framer Motion** for animations and transitions
- **React Hot Toast** for notifications

### Development Tools
- **ESLint** and **Prettier** for code quality
- **TypeScript** strict mode enabled
- **Vite PWA** plugin for progressive web app features

## Authentication Integration

### JWT Token Management
```typescript
// Use existing authentication endpoints
const API_BASE = 'https://api.lattice.dev';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Login integration
const login = async (email: string, password: string): Promise<AuthTokens> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

### Protected Routes
```typescript
// Implement route protection with existing JWT tokens
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};
```

## API Integration Specifications

### Base Configuration
```typescript
// API client configuration
const apiClient = axios.create({
  baseURL: 'https://api.lattice.dev',
  timeout: 30000,
});

// Request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Key API Endpoints to Integrate
```typescript
// Project Management
GET    /projects              // List user's projects
POST   /projects              // Create new project
GET    /projects/{id}         // Get project details
PUT    /projects/{id}         // Update project
GET    /projects/{id}/spec    // Get project specification

// Mutation Operations  
GET    /mutations                    // List mutations with filters
POST   /mutations/propose           // Propose new mutation
GET    /mutations/{id}              // Get mutation details
POST   /mutations/{id}/approve      // Approve mutation
POST   /mutations/{id}/reject       // Reject mutation
GET    /mutations/{id}/logs         // Get execution logs

// User & Organization
GET    /auth/me                     // Current user profile
GET    /organizations               // User's organizations
GET    /organizations/{id}/members  // Organization members
```

## WebSocket Integration

### Real-time Updates
```typescript
// WebSocket connection for live updates
const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket('wss://api.lattice.dev/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'mutation_proposed':
          // Update mutations list
          queryClient.invalidateQueries(['mutations']);
          break;
        case 'mutation_status_update':
          // Update specific mutation
          queryClient.invalidateQueries(['mutation', data.mutation_id]);
          break;
      }
    };
    
    setSocket(ws);
    return () => ws.close();
  }, []);
};
```

## Application Structure & Routing

### Page Layout & Navigation
```typescript
// Main application structure
const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 p-6">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/mutations" element={<ProtectedRoute><MutationsPage /></ProtectedRoute>} />
          <Route path="/mutations/:id" element={<ProtectedRoute><MutationDetailPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);
```

### Sidebar Navigation
```typescript
// Left sidebar with navigation
const Sidebar = () => (
  <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r">
    <div className="p-6">
      <Logo />
    </div>
    <nav className="px-4">
      <NavItem icon={Home} label="Dashboard" to="/" />
      <NavItem icon={FolderOpen} label="Projects" to="/projects" />
      <NavItem icon={GitBranch} label="Mutations" to="/mutations" />
      <NavItem icon={Settings} label="Settings" to="/settings" />
    </nav>
    <div className="absolute bottom-4 left-4 right-4">
      <UserProfile />
    </div>
  </aside>
);
```

## Core UI Components & Specifications

### Dashboard Page
```typescript
// Main dashboard with overview metrics
const DashboardPage = () => (
  <div className="space-y-6">
    <PageHeader title="Dashboard" />
    
    {/* Metrics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard 
        title="Active Mutations" 
        value={activeMutations} 
        icon={GitBranch}
        trend="+12%" 
      />
      <MetricCard 
        title="Projects" 
        value={projectCount} 
        icon={FolderOpen}
        trend="+3%" 
      />
      <MetricCard 
        title="Pending Approvals" 
        value={pendingApprovals} 
        icon={Clock}
        trend="-5%" 
      />
      <MetricCard 
        title="Success Rate" 
        value="94.2%" 
        icon={CheckCircle}
        trend="+2.1%" 
      />
    </div>

    {/* Recent Activity */}
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityFeed activities={recentActivities} />
      </CardContent>
    </Card>

    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/mutations/propose')}>
            <Plus className="mr-2 h-4 w-4" />
            Propose Mutation
          </Button>
          <Button variant="outline" onClick={() => navigate('/projects/new')}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
```

### Projects Page
```typescript
// Projects listing with search and filters
const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  return (
    <div className="space-y-6">
      <PageHeader title="Projects">
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </PageHeader>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};
```

### Mutations Page
```typescript
// Mutations listing with advanced filtering
const MutationsPage = () => (
  <div className="space-y-6">
    <PageHeader title="Mutations">
      <Button onClick={() => navigate('/mutations/propose')}>
        <Plus className="mr-2 h-4 w-4" />
        Propose Mutation
      </Button>
    </PageHeader>

    {/* Filters Bar */}
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="executed">Executed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker />
        </div>
      </CardContent>
    </Card>

    {/* Mutations Table */}
    <Card>
      <CardContent>
        <MutationsTable mutations={mutations} />
      </CardContent>
    </Card>
  </div>
);
```

### Mutation Detail Page
```typescript
// Detailed mutation view with approval workflow
const MutationDetailPage = () => {
  const { id } = useParams();
  const { data: mutation } = useQuery(['mutation', id], () => 
    apiClient.get(`/mutations/${id}`)
  );

  return (
    <div className="space-y-6">
      <PageHeader title={`Mutation #${mutation?.id}`}>
        <div className="flex gap-2">
          {mutation?.status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => handleReject(mutation.id)}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={() => handleApprove(mutation.id)}>
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mutation Info */}
          <Card>
            <CardHeader>
              <CardTitle>Mutation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <MutationInfo mutation={mutation} />
            </CardContent>
          </Card>

          {/* Code Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Code Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeDiff changes={mutation?.changes} />
            </CardContent>
          </Card>

          {/* Execution Logs */}
          {mutation?.logs && (
            <Card>
              <CardHeader>
                <CardTitle>Execution Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ExecutionLogs logs={mutation.logs} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline mutation={mutation} />
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskAssessment riskLevel={mutation?.risk_level} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
```

## Data Models & TypeScript Interfaces

### API Response Types
```typescript
// Core entity interfaces matching API responses
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'active' | 'inactive';
  organizations: string[];
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  subscription_tier: 'free' | 'pro' | 'enterprise';
  settings: Record<string, any>;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  status: 'active' | 'archived';
  visibility: 'private' | 'internal' | 'public';
  settings: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Mutation {
  id: string;
  project_id: string;
  operation_type: 'create' | 'update' | 'delete';
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
  changes: Record<string, any>;
  metadata: Record<string, any>;
  created_by: string;
  approved_by?: string;
  executed_at?: string;
  created_at: string;
  updated_at: string;
}
```

### API Response Wrappers
```typescript
// Standardized API response format
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// TanStack Query hooks for API integration
const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<ListResponse<Project>>('/projects'),
  });
};

const useMutations = (filters?: MutationFilters) => {
  return useQuery({
    queryKey: ['mutations', filters],
    queryFn: () => apiClient.get<ListResponse<Mutation>>('/mutations', { params: filters }),
  });
};
```

## State Management Architecture

### Zustand Store Structure
```typescript
// Global application state
interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  
  // Current context
  currentOrganization: Organization | null;
  currentProject: Project | null;
  setCurrentOrganization: (org: Organization) => void;
  setCurrentProject: (project: Project) => void;
  
  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // WebSocket connection
  socket: WebSocket | null;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  currentOrganization: null,
  currentProject: null,
  sidebarCollapsed: false,
  socket: null,
  
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    
    localStorage.setItem('access_token', access_token);
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, isAuthenticated: false });
  },
  
  setCurrentOrganization: (org) => set({ currentOrganization: org }),
  setCurrentProject: (project) => set({ currentProject: project }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  connectWebSocket: () => {
    const ws = new WebSocket('wss://api.lattice.dev/ws');
    set({ socket: ws });
  },
  
  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null });
    }
  },
}));
```

## Critical Implementation Requirements

### Error Handling & Loading States
```typescript
// Comprehensive error boundary
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundaryComponent
      fallback={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {error.message}
              </p>
              <Button onClick={resetErrorBoundary}>Try again</Button>
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundaryComponent>
  );
};

// Loading states for async operations
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

// Error toast notifications
const useErrorHandler = () => {
  return useCallback((error: any) => {
    const message = error?.response?.data?.error?.message || 'An unexpected error occurred';
    toast.error(message);
  }, []);
};
```

### Form Handling & Validation
```typescript
// Mutation proposal form
const MutationProposalForm = () => {
  const form = useForm<MutationFormData>({
    resolver: zodResolver(mutationSchema),
    defaultValues: {
      description: '',
      risk_level: 'medium',
      operation_type: 'update',
    },
  });

  const proposeMutation = useMutation({
    mutationFn: (data: MutationFormData) => 
      apiClient.post('/mutations/propose', data),
    onSuccess: () => {
      toast.success('Mutation proposed successfully');
      navigate('/mutations');
    },
    onError: useErrorHandler(),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(proposeMutation.mutate)}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe the mutation..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="risk_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risk Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={proposeMutation.isPending}>
          {proposeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Propose Mutation
        </Button>
      </form>
    </Form>
  );
};
```

### Real-time Features Implementation
```typescript
// Real-time notifications system
const useRealTimeUpdates = () => {
  const queryClient = useQueryClient();
  const { socket } = useAppStore();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'mutation_proposed':
          queryClient.invalidateQueries({ queryKey: ['mutations'] });
          toast.info(`New mutation proposed: ${data.data.description}`);
          break;
          
        case 'mutation_approved':
          queryClient.invalidateQueries({ queryKey: ['mutation', data.data.mutation_id] });
          toast.success(`Mutation approved: ${data.data.mutation_id}`);
          break;
          
        case 'mutation_executed':
          queryClient.invalidateQueries({ queryKey: ['mutation', data.data.mutation_id] });
          toast.success(`Mutation executed successfully: ${data.data.mutation_id}`);
          break;
          
        case 'project_updated':
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          queryClient.invalidateQueries({ queryKey: ['project', data.data.project_id] });
          break;
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, queryClient]);
};
```

## Configuration

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost/lattice
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24
API_KEY_PREFIX=lk_

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_ENABLED=true
CORS_ORIGINS=["https://app.lattice.dev"]

# External Services
CELERY_BROKER_URL=redis://localhost:6379
WEBHOOK_SECRET=your-webhook-secret
```

### SDK Configuration
```python
# MCP SDK Configuration
from mcp_sdk.models import SDKConfig

config = SDKConfig(
    base_url="https://api.lattice.dev",
    timeout=30,
    max_retries=3,
    enable_caching=True,
    cache_ttl=300
)

client = LatticeClient(
    api_key="lk_live_...",
    config=config
)
```

### VSCode Extension Settings
```json
{
    "lattice.apiUrl": "https://api.lattice.dev",
    "lattice.autoSync": true,
    "lattice.showNotifications": true,
    "lattice.defaultRiskLevel": "medium",
    "lattice.excludePatterns": [
        "**/node_modules/**",
        "**/.git/**"
    ]
}
```

## User Workflows & Interaction Examples

### Primary User Journey: Mutation Lifecycle
```typescript
// 1. User proposes a mutation
const ProposeMutationWorkflow = () => {
  // Navigate to /mutations/new
  // Fill out mutation form with:
  // - Description: "Update user authentication flow"
  // - Risk Level: "medium"
  // - Operation Type: "update"
  // - Affected Files: ["auth.ts", "middleware.ts"]
  // Submit form -> Redirect to /mutations/{id}
};

// 2. Admin reviews and approves
const ApproveMutationWorkflow = () => {
  // Navigate to /mutations (see pending mutations)
  // Click on mutation -> /mutations/{id}
  // Review changes, risk assessment
  // Click "Approve" button
  // Add approval comment
  // Real-time notification sent to proposer
};

// 3. System executes mutation
const ExecuteMutationWorkflow = () => {
  // Automatic execution after approval
  // Real-time status updates via WebSocket
  // Progress indicator shows execution steps
  // Success/failure notifications
  // Execution logs available at /mutations/{id}/logs
};
```

### Project Management Workflow
```typescript
// Creating and managing projects
const ProjectManagementWorkflow = () => {
  // 1. Create new project
  // Navigate to /projects/new
  // Form fields: name, description, visibility
  // Auto-generate project slug
  // Set initial team members and permissions
  
  // 2. Project dashboard
  // Navigate to /projects/{id}
  // Overview: recent mutations, team activity
  // Quick actions: propose mutation, invite members
  // Project settings and configuration
  
  // 3. Team collaboration
  // Real-time activity feed
  // @mention notifications
  // Comment threads on mutations
  // Status updates and progress tracking
};
```

### Dashboard Analytics Workflow
```typescript
// Main dashboard interactions
const DashboardWorkflow = () => {
  // 1. Landing page after login
  // Overview cards: pending mutations, active projects
  // Recent activity timeline
  // Quick action buttons
  
  // 2. Filtering and search
  // Filter mutations by status, risk level, project
  // Search across projects and mutations
  // Saved filter presets
  
  // 3. Bulk operations
  // Select multiple mutations
  // Bulk approve/reject actions
  // Export data functionality
};
```

### Responsive Design Patterns
```typescript
// Mobile-first responsive behavior
const ResponsivePatterns = () => {
  // Desktop (>= 1024px)
  // - Full sidebar navigation
  // - Multi-column layouts
  // - Detailed data tables
  // - Hover interactions
  
  // Tablet (768px - 1023px)
  // - Collapsible sidebar
  // - Two-column layouts
  // - Simplified tables
  // - Touch-friendly buttons
  
  // Mobile (< 768px)
  // - Bottom navigation
  // - Single-column layouts
  // - Card-based UI
  // - Swipe gestures
  // - Pull-to-refresh
};
```

### Error Recovery Workflows
```typescript
// Handling common error scenarios
const ErrorRecoveryWorkflows = () => {
  // 1. Network connectivity issues
  // - Offline indicator
  // - Retry mechanisms
  // - Cached data fallbacks
  // - Queue actions for when online
  
  // 2. Authentication failures
  // - Automatic token refresh
  // - Graceful logout
  // - Login redirect with return URL
  
  // 3. Permission errors
  // - Clear error messages
  // - Suggest alternative actions
  // - Contact admin functionality
  
  // 4. Validation errors
  // - Inline field validation
  // - Form-level error summaries
  // - Helpful error messages
  // - Auto-save draft functionality
};
```

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Set up Vite + React + TypeScript project
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Implement authentication flow with JWT
- [ ] Set up API client with Axios interceptors
- [ ] Create Zustand store for global state
- [ ] Implement protected route wrapper
- [ ] Set up TanStack Query for data fetching
- [ ] Configure error boundary and toast notifications

### Phase 2: Core Features
- [ ] Build main layout with sidebar navigation
- [ ] Implement dashboard with overview cards
- [ ] Create projects list and detail pages
- [ ] Build mutations list with filtering
- [ ] Implement mutation proposal form
- [ ] Create mutation detail page with approval flow
- [ ] Add real-time WebSocket integration
- [ ] Implement user profile and settings

### Phase 3: Advanced Features
- [ ] Add advanced filtering and search
- [ ] Implement bulk operations
- [ ] Create analytics and reporting views
- [ ] Add team management functionality
- [ ] Implement notification system
- [ ] Add export/import capabilities
- [ ] Create admin panel features
- [ ] Optimize performance and add caching

### Phase 4: Polish & Deployment
- [ ] Comprehensive error handling
- [ ] Loading states and skeleton screens
- [ ] Responsive design testing
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] SEO meta tags and Open Graph
- [ ] PWA features (service worker, offline support)
- [ ] Production build and deployment setup

## Success Criteria

### Functional Requirements
1. **Authentication**: Secure login/logout with JWT tokens
2. **Project Management**: Create, view, and manage projects
3. **Mutation Workflow**: Propose, review, approve, and execute mutations
4. **Real-time Updates**: Live notifications and status updates
5. **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
6. **Error Handling**: Graceful error recovery and user feedback

### Technical Requirements
1. **Performance**: Initial load < 3 seconds, subsequent navigation < 1 second
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
4. **Security**: Secure API communication, XSS protection, CSRF tokens
5. **Maintainability**: Clean code structure, comprehensive TypeScript types
6. **Testing**: Unit tests for critical components and utilities

### User Experience Requirements
1. **Intuitive Navigation**: Clear information architecture
2. **Consistent Design**: Unified visual language and interactions
3. **Helpful Feedback**: Clear success/error messages and loading states
4. **Efficient Workflows**: Minimal clicks to complete common tasks
5. **Search & Discovery**: Easy to find projects, mutations, and information
6. **Customization**: User preferences and personalized dashboard

## Final Notes

This prompt is specifically designed for generating a **frontend web application only**. The generated application should:

1. **Connect to existing APIs** at `https://api.lattice.dev`
2. **Not recreate any backend functionality** - only consume existing endpoints
3. **Focus on user experience** and modern web application patterns
4. **Be production-ready** with proper error handling, loading states, and responsive design
5. **Follow React/TypeScript best practices** with clean, maintainable code

The result should be a complete, deployable web application that provides an intuitive interface for the Lattice Engine's mutation management capabilities.

## Security Considerations

### Frontend Security Best Practices
- Secure token storage (httpOnly cookies preferred over localStorage)
- XSS prevention through proper input sanitization
- CSRF protection via API tokens
- Content Security Policy (CSP) headers
- Secure API communication over HTTPS only
- Input validation on all form fields
- Rate limiting awareness in UI (show appropriate feedback)
- Secure logout (clear all tokens and redirect)

### API Integration Security
- JWT token refresh handling
- Automatic logout on token expiration
- Secure API key management (never expose in client code)
- Request/response interceptors for authentication
- Error handling that doesn't leak sensitive information
- Proper CORS configuration awareness

## Development Workflow

### Frontend Development Process
1. **Project Setup**: Initialize Vite + React + TypeScript project
2. **UI Foundation**: Set up Tailwind CSS and shadcn/ui components
3. **Authentication**: Implement JWT-based auth flow
4. **API Integration**: Configure Axios client with interceptors
5. **State Management**: Set up Zustand stores
6. **Routing**: Implement React Router with protected routes
7. **Core Features**: Build dashboard, projects, and mutations pages
8. **Real-time**: Add WebSocket integration
9. **Testing**: Unit tests for components and utilities
10. **Deployment**: Build and deploy to production

### Code Quality Standards
- TypeScript strict mode enabled
- ESLint and Prettier configuration
- Consistent component structure and naming
- Comprehensive error boundaries
- Accessible UI components (ARIA labels, keyboard navigation)
- Performance optimization (lazy loading, memoization)
- Responsive design testing across devices

## Monitoring and Observability

### Frontend Monitoring
- **Error Tracking**: Implement error boundary with reporting (e.g., Sentry)
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Page views, user flows, feature usage
- **Real-time Monitoring**: WebSocket connection health
- **API Response Monitoring**: Track API call success/failure rates
- **User Experience Metrics**: Time to interactive, loading states

### Development Tools
- **React DevTools**: Component debugging and profiling
- **Redux DevTools**: State management debugging (if using Redux)
- **Network Tab**: API call monitoring and debugging
- **Lighthouse**: Performance and accessibility auditing
- **Browser Console**: Error logging and debugging

## Error Handling

### Frontend Error Handling Strategy
```typescript
// Global error boundary
const GlobalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {error.message}
              </p>
              <Button onClick={resetErrorBoundary}>Try again</Button>
            </CardContent>
          </Card>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Report to error tracking service
        console.error('Error caught by boundary:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// API error handling
const apiClient = axios.create({
  baseURL: 'https://api.lattice.dev',
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication errors
      useAppStore.getState().logout();
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      // Handle server errors
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.error?.message) {
      // Handle API errors with messages
      toast.error(error.response.data.error.message);
    } else {
      // Handle network errors
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);
```

### Form Validation & Error Display
```typescript
// Form validation with Zod
const mutationSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  risk_level: z.enum(['low', 'medium', 'high']),
  operation_type: z.enum(['create', 'update', 'delete']),
});

// Error display in forms
const FormField = ({ error, children }: { error?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    {children}
    {error && (
      <p className="text-sm text-destructive flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    )}
  </div>
);
```

## Performance Optimization

### 1. Database Optimization
- **Connection pooling** with SQLAlchemy
- **Query optimization** with proper indexing
- **Caching strategies** with Redis
- **Database migrations** with Alembic

### 2. API Performance
- **Response caching** for frequently accessed data
- **Pagination** for large result sets
- **Async processing** for long-running operations
- **Rate limiting** to prevent abuse

### 3. Frontend Optimization
- **Lazy loading** for large datasets
- **WebSocket connections** for real-time updates
- **Client-side caching** for improved UX
- **Progressive loading** for better perceived performance

## Integration Patterns

### 1. Webhook Integration
```python
# Webhook endpoints for external integrations
@app.post("/webhooks/github")
async def github_webhook(
    request: Request,
    signature: str = Header(None, alias="X-Hub-Signature-256")
):
    payload = await request.body()
    if not verify_signature(payload, signature):
        raise HTTPException(401, "Invalid signature")
    
    event = await request.json()
    if event["action"] == "opened":
        # Create mutation from pull request
        await create_mutation_from_pr(event["pull_request"])
```

### 2. CI/CD Integration
```python
# Integration with CI/CD pipelines
class CIPipeline:
    async def on_mutation_approved(self, mutation: Mutation):
        # Trigger deployment pipeline
        await self.trigger_deployment(
            project_id=mutation.project_id,
            changes=mutation.changes
        )
    
    async def on_deployment_complete(self, deployment_id: str):
        # Update mutation status
        await self.update_mutation_status(
            deployment_id,
            status="executed"
        )
```

## Best Practices

### 1. Code Organization
- **Modular architecture** with clear separation of concerns
- **Dependency injection** for testability
- **Configuration management** with environment-specific settings
- **Documentation** with comprehensive API docs

### 2. Security Best Practices
- **Principle of least privilege** for all access controls
- **Input validation** at all entry points
- **Secure defaults** for all configurations
- **Regular security audits** and penetration testing

### 3. Development Practices
- **Test-driven development** with comprehensive test coverage
- **Code review** processes for all changes
- **Continuous integration** with automated testing
- **Documentation-first** approach for new features

### 4. Operational Practices
- **Infrastructure as code** for reproducible deployments
- **Monitoring and alerting** for proactive issue detection
- **Backup and disaster recovery** procedures
- **Capacity planning** for scalable growth

## Future Roadmap

### Short-term (3-6 months)
- **Enhanced WebSocket support** for real-time collaboration
- **Advanced diff visualization** in VSCode extension
- **Automated testing integration** with mutation proposals
- **Performance optimizations** for large-scale deployments

### Medium-term (6-12 months)
- **Machine learning integration** for intelligent code suggestions
- **Advanced analytics** and reporting dashboards
- **Multi-language support** beyond Python
- **Enterprise SSO integration** (SAML, OIDC)

### Long-term (12+ months)
- **Distributed execution** across multiple environments
- **Advanced workflow automation** with custom rules
- **Integration marketplace** for third-party tools
- **AI-powered code review** and quality assessment

This comprehensive system provides enterprise-grade code mutation management with robust security, scalability, and developer experience. The architecture supports both small teams and large organizations with flexible deployment options and extensive customization capabilities.