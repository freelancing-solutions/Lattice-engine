# Lattice Frontend Development Context

This document provides a practical, decision-oriented guide for implementing the Lattice Portal frontend. It translates the specifications and architecture into concrete conventions, patterns, and workflows to ensure consistency, performance, and maintainability across the team.

## Objectives
- Build a dual-purpose portal: operational management platform and marketing front.
- Deliver real-time, secure, and accessible UI for managing agentic coders, approvals, specs, teams, and subscriptions.
- Maintain a clean, testable codebase with strong performance and UX.

## Core Principles
- Reliability over novelty: prefer proven libraries and patterns.
- UX first: fast interactions, clear states, and accessible design.
- Real-time by default: reflect backend changes quickly via WebSockets.
- Strong typing: end-to-end TypeScript types for safety.
- Separation of concerns: UI (components), client state (Zustand), server state (React Query), data access (API client), events (WebSockets).

## Tech Stack
- Framework: Next.js (App Router), TypeScript
- UI: Tailwind CSS + shadcn/ui (Radix primitives)
- State: Zustand (client state) + React Query (server state)
- Data: Axios-based API client, Zod validations
- Real-time: Socket.io client (WebSocket)
- Auth: NextAuth (JWT strategy, OAuth providers)
- Charts: Recharts
- Forms: React Hook Form + Zod

## Directory Structure
```
src/
  app/                      # Next.js App Router
    (marketing)/            # Public marketing pages
    (auth)/                 # Auth pages
    (dashboard)/            # Protected app pages
    api/                    # Route handlers (server actions)
    layout.tsx              # Root layout
    globals.css

  components/
    ui/                     # shadcn/ui components
    layout/                 # Header, Sidebar, Breadcrumbs
    charts/                 # Reusable chart wrappers
    forms/                  # Form building blocks
    features/               # Feature-specific composite components

  stores/                   # Zustand stores (client state)
    auth-store.ts
    agent-store.ts
    approval-store.ts
    notification-store.ts

  hooks/
    use-websocket.ts        # Socket setup and helpers
    use-pagination.ts
    use-toast.ts

  lib/
    api.ts                  # Axios client and API modules
    auth.ts                 # NextAuth config
    constants.ts            # Feature flags, enums
    validations.ts          # Zod schemas
    utils.ts                # Helpers

  types/                    # Shared TS types
    agent.ts
    approval.ts
    user.ts
    notification.ts

  styles/
    themes.css              # CSS vars for theming

tests/                      # Unit/integration/E2E
```

## Data & State
- Server state (React Query): API data, lists, detail views, pagination, filters.
- Client state (Zustand): selections, UI toggles, ephemeral UI state, socket connection status.
- Normalization: Keep server responses unnormalized; derive UI-friendly structures via selectors and hooks.

### React Query Conventions
- Query keys: `['agents']`, `['agents', id]`, `['approvals', { status, page }]`.
- Stale time: 10–60s for lists; 0–10s for highly dynamic views (live events override).
- Mutations: optimistic updates with rollback on error for lightweight changes (e.g., approval decisions).
- Error handling: global query error boundary + toast notifications.

### Zustand Conventions
- Keep stores small and focused; avoid cross-store dependencies.
- Use actions that return promises when performing async tasks; handle loading and errors in store.
- Devtools enabled in development only.

## API Client & Validation
- Single Axios instance with auth interceptor (JWT).
- Zod schemas for request/response validation at boundaries.
- Pagination standard: `?page=<n>&pageSize=<m>`; APIs return `{ items, total, page, pageSize }`.
- Diff payloads for approvals: render unified/side-by-side diffs using backend-provided patches.

## Real-time Events (WebSocket)
Socket.io client connects with user JWT and identifies `client_type='portal'`.

Events to subscribe:
- `approval:requested` — new approval arriving; show modal/toast.
- `approval:updated` — decision updates; refresh lists and detail views.
- `agent:status` — agent lifecycle updates (start/stop/error).
- `notification:new` — in-app notifications routing.
- `system:alert` — health/performance alerts (dashboard banner/toast).

Event handling rules:
- Always validate event payloads with Zod before state updates.
- Debounce list refreshes to avoid thrash (e.g., 250ms).
- Use activity feed for high-volume events with virtualized lists.

## UI/UX Standards
- Design system: shadcn/ui components with Tailwind tokens.
- Accessibility: WCAG AA minimum; keyboard-first interactions, proper roles/labels.
- Feedback: every async action must reflect loading, success, error states.
- Empty/edge states: define for lists, charts, and detail views.
- Theming: CSS variables for light/dark; support high-contrast mode.

## Navigation & Routing
- App Router segments: `(marketing)`, `(auth)`, `(dashboard)`.
- Guarding: server-side session checks for dashboard; redirect if unauthenticated.
- Breadcrumbs reflect entity hierarchy: Organization → Project → Agent → Approval.

## Feature Modules

### 1) Agent Management
- Views: list, detail, performance, configuration.
- Actions: create, update, start/stop, assign to projects.
- Performance charts: time-series for throughput, success rate, latency.
- Real-time badges: status online/offline/error via `agent:status`.

### 2) Approval Workflows
- Views: queue list, detail with diff, history.
- Actions: approve, reject, request changes, batch operations.
- Rules editor: define approval rules (priority, channels, SLAs).
- SLA indicators: countdown timers, escalation hints.

### 3) Specification Management
- Graph viewer: nodes (specs), edges (dependencies), versions.
- Actions: edit, link, version diff, impact analysis.
- Search/filter: by tags, owner, dependency depth.

### 4) Team & Permissions
- Members CRUD, invites, roles (Owner, Admin, Reviewer, Operator).
- RBAC UI: resource-level permissions with presets.
- Audit log viewer: filter by actor/action/time.

### 5) Billing & Subscription
- Pricing page (marketing) + in-app billing portal.
- Plan management, usage meters, invoices, payment methods.
- Alerts for overage; integrate Stripe customer portal.

### 6) Notifications
- In-app inbox + toasts + channel preferences.
- Templates preview, routing rules, digest scheduling.
- Per-user and per-organization preferences stored client-side and server-side.

## Performance Targets
- TTI (interactive): < 2s on broadband, < 4s on 3G.
- Largest Contentful Paint: < 1.8s (marketing), < 2.5s (dashboard).
- First Input Delay: < 100ms; Interaction to Next Paint: < 200ms.
- Bundle budgets: initial < 300KB gz; route-level < 200KB gz.
- Use code splitting, lazy loading, and prefetching.

## Accessibility Checklist
- Semantic HTML, ARIA roles where needed.
- Focus management and skip-to-content links.
- Keyboard support for dialogs, menus, tables.
- Color contrast ≥ 4.5:1; prefers-reduced-motion respected.
- Forms: labels, descriptions, error messaging.

## Security & Privacy
- JWT sessions via NextAuth; httpOnly cookies preferred.
- CSRF protection for mutations; rate limiting on sensitive actions.
- Do not log PII in client; redact in error reports.
- Feature gating: read flags from `NEXT_PUBLIC_*` env and server.

## Testing Strategy
- Unit: components, hooks, utils (Vitest + RTL).
- Integration: forms, stores, API interactions (MSW).
- E2E: critical flows (Playwright/Cypress): auth, approvals, billing.
- Visual regression: Storybook + Chromatic (or Percy) for key components.

## Coding Conventions
- TypeScript strict mode; prefer interfaces for public types.
- Zod for runtime validation at API boundaries and socket events.
- Named exports; avoid default unless component pages.
- CSS: Tailwind utility-first; extract complex patterns to components.
- Commit style: Conventional Commits; small, focused PRs.

## PR Review Checklist
- [ ] Types are correct and narrow; no `any` leaks.
- [ ] UI states: loading, error, empty implemented.
- [ ] Accessibility basics validated (keyboard/labels/contrast).
- [ ] Tests added/updated; coverage maintained.
- [ ] Performance budget respected; bundle sizes checked.
- [ ] No secrets or PII in code/logs.
- [ ] Docs and Storybook updated for new components.

## Environment Variables
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_WS_URL
NEXT_PUBLIC_ENABLE_ANALYTICS
NEXT_PUBLIC_ENABLE_CHAT_SUPPORT
NEXT_PUBLIC_FEATURE_*         # per-feature flags
```

## Example Patterns

### WebSocket Hook Usage
```tsx
const { isConnected, subscribe, emit } = useWebSocket({ reconnectAttempts: 5 })

useEffect(() => {
  const onApproval = (payload: ApprovalEvent) => {
    // validate
    const parsed = ApprovalEventSchema.safeParse(payload)
    if (!parsed.success) return
    // update stores
    useApprovalStore.getState().addOrUpdate(parsed.data)
    // notify user
    toast.success('New approval request received')
  }

  subscribe('approval:requested', onApproval)
  return () => {
    unsubscribe('approval:requested', onApproval)
  }
}, [subscribe])
```

### React Query + Forms
```tsx
const mutation = useMutation({
  mutationFn: (data: CreateAgentRequest) => agentApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['agents'] })
    toast.success('Agent created')
  },
  onError: (e) => toast.error(e.message ?? 'Failed to create agent')
})

const onSubmit = (values: FormValues) => mutation.mutate(transform(values))
```

## Rollout Plan
1. Establish project skeleton and core providers (QueryClientProvider, ThemeProvider, Auth SessionProvider).
2. Implement authentication flows and protected routes.
3. Build dashboard shell and navigation.
4. Deliver Agents, Approvals, Notifications MVP with real-time events.
5. Add Spec Graph, Team/RBAC, Billing.
6. Optimize performance and accessibility; prepare launch.

## Ownership & Governance
- Tech Lead owns architecture, performance, and component library quality.
- Feature owners maintain domain modules and tests.
- DevOps ensures CI/CD gating (lint, types, tests, bundle budget, Lighthouse).

---
This context should be kept up to date alongside the portal specifications and implementation guide. Amend conventions as we learn from production usage and performance telemetry.

## Overview

The Lattice Frontend is a comprehensive web platform that serves dual purposes:
1. **Management Platform**: Full-featured SaaS interface for managing coders, specifications, and approvals
2. **Developer SPA**: Lightweight single-page application for quick environment status checks and notifications

This document provides essential context for developers working on the Lattice frontend ecosystem.

---

## Architecture Philosophy

### Dual-Mode Design
The platform operates in two distinct modes while sharing core infrastructure:

**Management Mode (Full Platform)**
- Complete dashboard with all features
- Multi-user workspace management
- Advanced spec editing and graph visualization
- Comprehensive approval workflows
- Team collaboration tools

**SPA Mode (Developer Quick Access)**
- Minimal, fast-loading interface
- Environment status at-a-glance
- Real-time notifications
- Quick actions (approve/reject, status updates)
- Mobile-optimized for on-the-go access

### Technical Foundation

**Core Stack**
- Next.js 14+ with App Router for optimal performance
- TypeScript for type safety and developer experience
- React 18+ with concurrent features
- shadcn/ui for consistent, accessible components
- Tailwind CSS for rapid, maintainable styling
- Zustand or React Context for state management
- Socket.io for real-time communication

**Key Architectural Decisions**
- Server-side rendering for SEO and performance
- Progressive Web App (PWA) capabilities for mobile experience
- Modular component architecture for reusability
- API-first design with comprehensive error handling
- Responsive design with mobile-first approach

---

## User Personas & Use Cases

### Primary Users

**1. Development Team Lead**
- Manages team of coders
- Oversees spec approval processes
- Monitors project progress
- Needs: Team overview, approval queue, progress tracking

**2. Senior Developer/Architect**
- Creates and maintains specifications
- Reviews and approves changes
- Monitors system health
- Needs: Spec editing, graph visualization, approval tools

**3. Developer/Coder**
- Implements specifications
- Submits changes for approval
- Checks environment status
- Needs: Quick status checks, notifications, lightweight interface

**4. Project Manager**
- Tracks overall project health
- Manages timelines and deliverables
- Coordinates between teams
- Needs: Dashboard views, reporting, team management

### Usage Patterns

**Daily Workflows**
- Morning: Check environment status, review overnight changes
- Development: Edit specs, submit for approval, monitor builds
- Code Review: Approve/reject changes, provide feedback
- End of Day: Review progress, check notifications

**Mobile/Quick Access Scenarios**
- Commuting: Check build status, approve urgent changes
- Meetings: Quick status updates, show progress to stakeholders
- Off-hours: Emergency approvals, system alerts

---

## Core Domain Concepts

### Coders (Users)
- **Identity**: Unique developers in the system
- **Roles**: Admin, Lead, Senior, Junior, Viewer
- **Permissions**: Tiered access to features
- **Status**: Active, Inactive, Pending
- **Metadata**: Skills, teams, preferences

### Specifications (Specs)
- **Living Documents**: Dynamic, version-controlled specifications
- **Types**: API specs, architecture docs, requirements, tests
- **States**: Draft, Review, Approved, Deprecated
- **Relationships**: Dependencies, implementations, refinements
- **Metadata**: Owner, reviewers, tags, priority

### Approvals
- **Workflow**: Multi-stage approval process
- **Types**: Spec changes, deployments, architecture decisions
- **States**: Pending, Approved, Rejected, Expired
- **Participants**: Requestor, reviewers, approvers
- **Audit Trail**: Complete history of decisions

### Environment Status
- **Systems**: Development, staging, production environments
- **Metrics**: Health, performance, deployment status
- **Alerts**: Issues, warnings, notifications
- **History**: Status changes over time

---

## Feature Requirements

### Coder Management
**User Administration**
- User registration and profile management
- Role-based access control (RBAC)
- Team assignment and hierarchy
- Skill tracking and competency mapping
- Activity monitoring and analytics

**Team Collaboration**
- Team workspaces and channels
- @mentions and notifications
- Shared dashboards and views
- Collaborative editing capabilities
- Communication history

### Specification Management
**Content Management**
- Markdown-based spec editing with live preview
- Version control integration (Git-like)
- Template system for common spec types
- Bulk operations (import/export)
- Search and filtering capabilities

**Graph Visualization**
- Interactive node-edge graph of spec relationships
- Multiple layout algorithms (hierarchical, force-directed)
- Filtering by type, status, owner, date
- Zoom, pan, and selection tools
- Export capabilities (PNG, SVG, PDF)

**Metadata Management**
- Custom fields and tags
- Automated metadata extraction
- Relationship inference
- Compliance tracking
- Analytics and reporting

### Approval Workflows
**Process Management**
- Configurable approval chains
- Parallel and sequential approval paths
- Conditional routing based on content/metadata
- Escalation and timeout handling
- Delegation and substitution

**Review Interface**
- Side-by-side diff views
- Inline commenting and suggestions
- Approval/rejection with reasons
- Batch operations for multiple items
- Mobile-optimized review interface

**Audit and Compliance**
- Complete audit trail of all decisions
- Compliance reporting and metrics
- Automated policy enforcement
- Integration with external audit systems
- Retention and archival policies

### Environment Status Dashboard
**Real-time Monitoring**
- System health indicators
- Performance metrics and trends
- Deployment status and history
- Error rates and alerts
- Resource utilization

**Quick Actions**
- One-click deployments
- Emergency stops and rollbacks
- Configuration changes
- Alert acknowledgment
- Status updates

### Notification System
**Multi-channel Delivery**
- In-app notifications with real-time updates
- Email notifications with customizable templates
- SMS/push notifications for critical alerts
- Slack/Teams integration
- Webhook support for custom integrations

**Smart Filtering**
- User preference-based filtering
- Priority-based routing
- Digest modes (immediate, hourly, daily)
- Do-not-disturb scheduling
- Context-aware notifications

---

## Technical Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────┐
│                 UI Layer                │
├─────────────────────────────────────────┤
│  Pages & Components (Next.js App Router)│
│  ├── Management Dashboard               │
│  ├── SPA Mode                          │
│  ├── Shared Components                 │
│  └── Mobile Views                      │
├─────────────────────────────────────────┤
│            State Management             │
│  ├── Global State (Zustand/Context)    │
│  ├── Server State (React Query)        │
│  ├── Form State (React Hook Form)      │
│  └── Real-time State (Socket.io)       │
├─────────────────────────────────────────┤
│              API Layer                  │
│  ├── REST API Client                   │
│  ├── WebSocket Client                  │
│  ├── Authentication                    │
│  └── Error Handling                    │
├─────────────────────────────────────────┤
│             Utilities                   │
│  ├── Validation (Zod)                  │
│  ├── Date/Time (date-fns)              │
│  ├── Formatting                        │
│  └── Constants                         │
└─────────────────────────────────────────┘
```

### Data Flow
1. **User Interaction** → Component Event Handler
2. **State Update** → Global State Management
3. **API Call** → Backend Services
4. **Real-time Updates** → WebSocket Events
5. **UI Update** → React Re-render

### Performance Considerations
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Images, components, and data
- **Caching**: API responses, static assets, computed values
- **Optimization**: Bundle analysis, tree shaking, compression
- **Monitoring**: Performance metrics, error tracking, user analytics

---

## Integration Points

### Backend Services
- **Authentication Service**: JWT-based auth with refresh tokens
- **User Management Service**: CRUD operations for users and teams
- **Specification Service**: Spec CRUD, versioning, relationships
- **Approval Service**: Workflow engine, notifications, audit
- **Environment Service**: Status monitoring, metrics, alerts
- **Notification Service**: Multi-channel message delivery

### External Systems
- **Version Control**: Git integration for spec versioning
- **CI/CD Platforms**: Jenkins, GitHub Actions, GitLab CI
- **Monitoring Tools**: Prometheus, Grafana, DataDog
- **Communication**: Slack, Microsoft Teams, Discord
- **Identity Providers**: LDAP, Active Directory, OAuth providers

### API Contracts
All integrations follow OpenAPI 3.0 specifications with:
- Consistent error handling and status codes
- Comprehensive request/response validation
- Rate limiting and authentication
- Versioning strategy for backward compatibility
- Comprehensive documentation and examples

---

## Security Considerations

### Authentication & Authorization
- Multi-factor authentication (MFA) support
- Role-based access control (RBAC)
- API key management for service accounts
- Session management and timeout policies
- OAuth 2.0 / OpenID Connect integration

### Data Protection
- Input validation and sanitization
- XSS and CSRF protection
- Secure communication (HTTPS/WSS)
- Data encryption at rest and in transit
- Privacy controls and data retention

### Compliance
- GDPR compliance for EU users
- SOC 2 Type II certification path
- Audit logging and monitoring
- Data breach response procedures
- Regular security assessments

---

## Development Guidelines

### Code Standards
- TypeScript
- ESLint + Prettier for code formatting
- Conventional commits for version control
- Component-driven development approach
- Test-driven development (TDD) practices

### Testing Strategy
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for API interactions
- End-to-end tests with Playwright
- Visual regression testing with Chromatic

### Performance Standards
- Lighthouse score > 90 for all metrics
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- Time to Interactive < 3.5s

### Accessibility Standards
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management and indicators

---

## Deployment & Operations

### Environment Strategy
- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: High-availability deployment with CDN
- **Preview**: Branch-based preview deployments

### Monitoring & Observability
- Application performance monitoring (APM)
- Real user monitoring (RUM)
- Error tracking and alerting
- Business metrics and analytics
- Infrastructure monitoring

### Scaling Considerations
- Horizontal scaling with load balancers
- CDN for static asset delivery
- Database read replicas for performance
- Caching strategies (Redis, CDN)
- Auto-scaling based on metrics

---

This context document serves as the foundation for all frontend development work on the Lattice platform, ensuring consistency, quality, and alignment with business objectives.