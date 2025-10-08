# BugSage Marketing Website - One-Shot Development Prompt

## 🎯 Project Overview

**Domain**: bugsage.site  
**Purpose**: Marketing website for AI-powered debugging platform integrated with Project Lattice  
**Tech Stack**: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui  
**Target**: Create a professional marketing website that showcases BugSage as the diagnostic intelligence layer for Project Lattice

## 🚨 IMPORTANT: What NOT to Build

**DO NOT BUILD:**
- BugSage backend/platform (will be built separately)
- User authentication or login systems
- Actual diagnostic tools or debugging functionality
- Payment processing or subscription management
- Database integrations or user data storage
- API endpoints or server-side functionality

**ONLY BUILD:**
- Static marketing website with modern UI/UX
- Information architecture and content presentation
- Interactive demos (frontend-only, no real functionality)
- Contact forms (frontend validation only)
- Documentation structure (content only, no live docs)

## 🛠 Tech Stack Requirements

### Core Framework
```json
{
  "framework": "Next.js 14+ with App Router",
  "language": "TypeScript (strict mode)",
  "styling": "Tailwind CSS",
  "components": "shadcn/ui",
  "animations": "Framer Motion",
  "icons": "Lucide React",
  "fonts": "Inter (sans) + JetBrains Mono (code)"
}
```

### Additional Libraries
```json
{
  "forms": "React Hook Form + Zod validation",
  "syntax_highlighting": "Prism.js or Shiki for code examples",
  "seo": "Next.js built-in SEO optimization",
  "analytics": "Google Analytics 4 (setup only)",
  "deployment": "Vercel-ready configuration"
}
```

## 🎨 Design System & Brand Identity

### Color Palette
```css
/* Primary Brand Colors */
--sage-green: #7CB342;        /* Primary brand color */
--sage-dark: #558B2F;         /* Hover states */
--sage-light: #9CCC65;        /* Accents */

/* Dark Mode (Default) */
--bg-primary: #0F1419;        /* Main background */
--bg-secondary: #1A1F2E;      /* Cards/sections */
--bg-tertiary: #252A38;       /* Hover/elevated */

--text-primary: #E8EAED;      /* Body text */
--text-secondary: #9AA0A6;    /* Muted text */
--text-tertiary: #5F6368;     /* Disabled text */

/* Semantic Colors */
--error: #F44336;
--warning: #FF9800;
--success: #4CAF50;
--info: #2196F3;

/* Code Syntax Highlighting */
--code-bg: #1E1E1E;
--code-keyword: #C586C0;
--code-string: #CE9178;
--code-function: #DCDCAA;
--code-comment: #6A9955;
```

### Typography Scale
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Text Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

## 📐 Site Structure & Navigation

### Page Hierarchy
```
/                       (Homepage)
├── /features           (Features breakdown)
├── /lattice-integration (Deep-dive on Lattice integration)
├── /how-it-works       (Technical explainer)
├── /pricing            (Pricing tiers)
├── /docs               (Documentation hub)
├── /blog               (Blog index - placeholder)
├── /about              (About BugSage)
├── /contact            (Contact form)
├── /support            (Support resources)
└── /beta-signup        (Early access form)
```

### Navigation Structure
```typescript
interface NavigationStructure {
  home: "/";
  features: "/features";
  latticeIntegration: "/lattice-integration";
  howItWorks: "/how-it-works";
  pricing: "/pricing";
  docs: "/docs";
  blog: "/blog";
  about: "/about";
  contact: "/contact";
  support: "/support";
  betaSignup: "/beta-signup";
}
```

## 🏠 Homepage Design & Components

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ NAVIGATION BAR                                          │
│ [Logo] [Features] [Lattice] [Pricing] [Docs] [Beta]    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ HERO SECTION                                            │
│ • Headline: "Fix Production Errors Autonomously"       │
│ • Subheadline: AI-powered debugging integration        │
│ • Dual CTA: [Start Beta] [Watch Demo]                  │
│ • Animated code example (3-panel transformation)       │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ SOCIAL PROOF                                            │
│ "Integrated with Project Lattice • 10K+ diagnostics"   │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ PROBLEM → SOLUTION (3-column grid)                     │
│ [Production Errors] → [Manual Debugging] → [BugSage]   │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ LATTICE INTEGRATION SPOTLIGHT                           │
│ Visual diagram + explanation of autonomous loop        │
│ CTA: "Learn about Lattice Integration →"               │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ KEY FEATURES (6-item grid)                             │
│ • Autonomous Error Resolution                           │
│ • Sentry MCP Integration                               │
│ • Coding Agent Orchestration                           │
│ • Spec Mutation Engine                                 │
│ • Configurable Safety Rules                            │
│ • VSCode Git Automation                                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ DEMO VIDEO / INTERACTIVE PREVIEW                        │
│ "See BugSage resolve errors in 90 seconds"             │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ TESTIMONIALS (Carousel)                                 │
│ Developer quotes about autonomous debugging             │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ CTA SECTION                                             │
│ "Ready to eliminate production errors?"                │
│ [Join Beta Program] [Schedule Demo]                    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ FOOTER                                                  │
│ [Product] [Resources] [Company] [Legal] [Social]       │
└─────────────────────────────────────────────────────────┘
```

### Hero Section Copy
```
Headline: "Fix Production Errors Autonomously"
Subheadline: "AI-powered debugging that detects, diagnoses, and deploys 
fixes—automatically. Integrated with Project Lattice and Sentry for 
end-to-end error resolution."

CTAs:
- Primary: "Join Beta Program" → /beta-signup
- Secondary: "Watch Demo" → scroll to demo video
```

### Animated Code Example (Hero)
Create a 3-panel animated transformation showing:

```javascript
// LEFT PANEL: Sentry Alert
🚨 Production Error (247 occurrences)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ TypeError: Cannot read property 
   'refresh_token' of undefined
   
📍 auth/oauth.ts:42
👤 Affecting 15% of users
⏰ Last 30 minutes

// MIDDLE PANEL: BugSage Analysis
🧠 Autonomous Analysis Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Root cause identified (0.8s)
✓ Spec impact analyzed (1.2s)
✓ Safety rules validated (0.3s)

📋 Missing: OAuth2 refresh token 
   rotation in user-auth spec
   
🤖 Assigning to coding agent...

// RIGHT PANEL: Fix Deployed
✅ Fix Deployed to Production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Spec created: oauth-refresh-token-rotation v1.0
💻 Code updated: auth/oauth.ts (+12 lines)
🚀 Deployed via canary (10%)
   Error rate: 247 → 0
⏱️ Total time: 4 minutes
```

## 📄 Page-Specific Requirements

### Features Page (`/features`)
**Structure:**
- Hero: "Built for Spec-Driven Development"
- Feature grid (8 features, 2x4 layout)
- Detailed sections with alternating image/text layout

**Key Features to Highlight:**
1. **Autonomous Error Resolution** 🤖
2. **Production Monitoring (Sentry MCP)** 🔄
3. **Coding Agent Orchestration** 🧠
4. **Spec Mutation Engine** 📋
5. **Configurable Safety Rules** 🛡️
6. **Deep Lattice Integration** 🔗
7. **VSCode Git Automation** 💻
8. **Historical Pattern Learning** 📊

### Lattice Integration Page (`/lattice-integration`)
**Purpose:** Dedicated page explaining the autonomous development loop

**Structure:**
- Hero: "The Brain Behind Lattice's Autonomous Development"
- "What is Project Lattice?" section (for unfamiliar users)
- Interactive animated diagram of the autonomous loop
- "How BugSage Enhances Lattice" (4 cards)
- "How Lattice Enhances BugSage" (4 cards)
- Real-world example walkthrough
- Configuration comparison table

**The Autonomous Loop Diagram:**
```
Production (Sentry MCP) → Error detected
    ↓
BugSage (Error Intelligence) → Analyzes + correlates with specs
    ↓
Project Lattice (Orchestration) → Creates/mutates spec + assigns task
    ↓
Coding Agent (Execution) → Generates fix based on spec
    ↓
VSCode (Git Integration) → Shows diff + auto-commits
    ↓
Fix Deployed → BugSage monitors results
```

### How It Works Page (`/how-it-works`)
**Structure:**
- Hero: "The Autonomous Debugging Pipeline"
- Interactive architecture diagram
- Step-by-step process breakdown
- Safety and control mechanisms
- Integration requirements

### Pricing Page (`/pricing`)
**Tiers:**
1. **Free Tier**: Basic diagnostics, limited to 100 errors/month
2. **Pro**: $49/month - Full features, 10K errors/month
3. **Team**: $149/month - Team collaboration, 50K errors/month
4. **Enterprise**: Custom pricing - Unlimited, on-premise options

### Documentation Hub (`/docs`)
**Structure:**
- Hero with search functionality
- Quick start guide
- Integration guides (Lattice, Sentry, VSCode)
- API reference (placeholder)
- Troubleshooting
- FAQ

### Beta Signup Page (`/beta-signup`)
**Form Fields:**
- Name, Email, Company
- Current debugging tools
- Team size
- Integration interests (Lattice, Sentry, etc.)
- Use case description

## 🎭 Component Requirements

### Reusable Components to Create
1. **Navigation** - Responsive header with mobile menu
2. **Hero Section** - Animated background with floating code snippets
3. **Feature Cards** - Consistent card design with icons and descriptions
4. **Code Block** - Syntax-highlighted code examples
5. **Testimonial Card** - Customer quote with avatar and company
6. **CTA Section** - Call-to-action with dual buttons
7. **Footer** - Comprehensive footer with links and social media
8. **Animated Diagram** - Interactive flow diagrams
9. **Pricing Card** - Feature comparison and pricing display
10. **Form Components** - Contact and beta signup forms

### Animation Requirements
- **Framer Motion** for page transitions and component animations
- **Floating code snippets** in hero background
- **Typewriter effect** for code examples
- **Scroll-triggered animations** for feature reveals
- **Hover effects** on cards and buttons
- **Loading states** for form submissions

## 📱 Responsive Design Requirements

### Breakpoints
```css
sm: '640px',   /* Mobile landscape */
md: '768px',   /* Tablet */
lg: '1024px',  /* Desktop */
xl: '1280px',  /* Large desktop */
2xl: '1536px'  /* Extra large */
```

### Mobile-First Approach
- Stack components vertically on mobile
- Collapsible navigation menu
- Touch-friendly button sizes
- Optimized image loading
- Readable typography on small screens

## 🔍 SEO & Performance Requirements

### SEO Optimization
- **Meta tags** for each page with unique titles and descriptions
- **Open Graph** tags for social media sharing
- **Structured data** for rich snippets
- **Sitemap.xml** generation
- **Robots.txt** configuration

### Performance Targets
- **Lighthouse score** > 90 for all metrics
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **Image optimization** with Next.js Image component

## 📝 Content Guidelines

### Tone & Voice
- **Professional yet approachable**
- **Technical but accessible** to non-developers
- **Confident** about AI capabilities
- **Transparent** about beta status and limitations
- **Developer-focused** language and examples

### Key Messaging
- **Primary Value Prop**: "Autonomous error resolution for spec-driven development"
- **Differentiation**: "Built specifically for Project Lattice integration"
- **Trust Signals**: "AI-powered with human oversight and safety controls"
- **Call to Action**: "Join the beta and eliminate production errors"

### Sample Headlines
- "Fix Production Errors Autonomously"
- "The Brain Behind Lattice's Autonomous Development"
- "From Error to Fix in Under 5 Minutes"
- "AI-Powered Debugging for Modern Development Teams"
- "Eliminate Regressions Before They Impact Users"

## 🚀 Development Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Implement responsive navigation component
- [ ] Create basic page structure and routing
- [ ] Set up Framer Motion for animations

### Phase 2: Core Pages (Week 1-2)
- [ ] Build animated hero section with code examples
- [ ] Create homepage with all required sections
- [ ] Implement features page with detailed breakdowns
- [ ] Build Lattice integration page with flow diagram
- [ ] Create how-it-works page with architecture overview

### Phase 3: Supporting Pages (Week 2)
- [ ] Build pricing page with comparison table
- [ ] Create documentation hub structure
- [ ] Implement about page with team/company info
- [ ] Build contact page with form validation
- [ ] Create beta signup page with detailed form

### Phase 4: Polish & Optimization (Week 2)
- [ ] Add animations and micro-interactions
- [ ] Optimize images and performance
- [ ] Implement SEO meta tags and structured data
- [ ] Test responsive design across devices
- [ ] Add loading states and error handling

### Phase 5: Content & Launch Prep (Week 3)
- [ ] Finalize all copy and content
- [ ] Add testimonials and social proof
- [ ] Implement analytics tracking
- [ ] Test all forms and interactions
- [ ] Prepare for deployment to Vercel

## 🎯 Success Criteria

### Technical Requirements
- **TypeScript strict mode** with no errors
- **Responsive design** working on all screen sizes
- **Accessibility** compliance (WCAG 2.1 AA)
- **Performance** meeting all Lighthouse targets
- **SEO** optimization for all pages

### User Experience Goals
- **Clear value proposition** within 5 seconds of landing
- **Intuitive navigation** with logical information architecture
- **Engaging animations** that enhance rather than distract
- **Professional appearance** that builds trust and credibility
- **Compelling CTAs** that drive beta signups

### Content Objectives
- **Educate** visitors about BugSage's unique value
- **Differentiate** from generic debugging tools
- **Build trust** in AI-powered autonomous systems
- **Generate interest** in beta program participation
- **Establish authority** in spec-driven development space

---

## 🎨 Final Notes

This is a **marketing website only** - focus on compelling presentation, clear messaging, and professional design. The actual BugSage platform will be built separately using different technology and architecture.

**Remember**: You are building a website to showcase and market BugSage, not to implement its actual debugging functionality. Focus on creating an engaging, informative, and conversion-optimized marketing experience that drives beta signups and establishes BugSage as the premier debugging solution for Project Lattice users.

**Key Success Metric**: Visitors should understand BugSage's value proposition and want to join the beta program within 30 seconds of landing on the homepage.