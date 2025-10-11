# Lattice Website - Unified Theme & Layout Refactoring

## Project Overview
The `lattice-website` is a Next.js 14+ multi-page application located in the `src/app` directory with the following pages:
- about
- admin
- api
- blog
- docs
- downloads
- features
- pricing
- privacy
- status
- support
- terms

## Current State Analysis

### What Exists (DO NOT MODIFY):
1. **Root Layout** (`src/app/layout.tsx`):
   - Already implements ThemeProvider with dark mode support
   - Uses Inter font from Google Fonts
   - Includes QueryClientProvider wrapper
   - Has Sonner toast notifications
   - Contains comprehensive SEO metadata
   - Includes structured data components

2. **Global Styles** (`src/app/globals.css`):
   - Complete Tailwind CSS v4 configuration with custom theme
   - Monokai-inspired dark mode theme
   - Cloudflare orange accent colors
   - Full color system using OKLCH color space
   - Custom code syntax highlighting variables
   - Sidebar, chart, and component color tokens

3. **Homepage** (`src/app/page.tsx`):
   - Uses shared components: Navigation, HeroSection, ValuePropositions, InteractiveDemo, DeveloperFeatures, DocumentationHub, Footer
   - Has proper SEO metadata structure

### Existing Shared Components (Confirmed):
- `Navigation` - Top navigation bar
- `Footer` - Site footer
- Theme system via `ThemeProvider`

## Problem Statement
The individual pages (about, admin, api, blog, docs, downloads, features, pricing, privacy, status, support, terms) currently:
1. **CRITICAL: Use incorrect purple/violet colors instead of the Cloudflare orange theme**
2. Lack consistent layout structure
3. Don't properly apply the unified theme from `globals.css`
4. May not consistently use shared navigation and footer components
5. Need cohesive visual design language matching the homepage
6. May lack proper SEO metadata

**PRIORITY: Remove ALL purple/violet colors and apply the orange-based theme from `globals.css`**

## Objectives

### Primary Goal
Create a unified, maintainable architecture that allows:
- Single source of truth for theme configuration
- Consistent user experience across all pages
- Easy future modifications to design system
- Reusable layout components for all pages

### Requirements

#### 1. Layout Architecture
Create a reusable layout system:

**Option A: Nested Layouts (Recommended)**
```
src/app/
  layout.tsx (root - already exists)
  (marketing)/
    layout.tsx (shared marketing layout)
    about/page.tsx
    features/page.tsx
    pricing/page.tsx
  (docs)/
    layout.tsx (documentation layout)
    docs/page.tsx
    api/page.tsx
  (legal)/
    layout.tsx (legal pages layout)
    privacy/page.tsx
    terms/page.tsx
  (app)/
    layout.tsx (authenticated app layout)
    admin/page.tsx
    status/page.tsx
```

**Option B: Single Shared Layout Component**
Create `src/components/layouts/page-layout.tsx` that wraps all pages with consistent structure.

Choose the approach that best fits the project's needs.

#### 2. Component Requirements

##### A. Update/Create Page Layouts
For each page type, ensure:
- Includes `<Navigation />` component (already exists)
- Includes `<Footer />` component (already exists)
- Applies consistent padding/margins
- Uses theme colors from `globals.css`
- Responsive design following existing patterns

##### B. Shared Components to Verify/Create
Ensure these exist in `src/components/`:
- `navigation.tsx` ✓ (exists, verify it's being used)
- `footer.tsx` ✓ (exists, verify it's being used)
- `page-header.tsx` (create if needed - reusable page title/breadcrumb)
- `section-container.tsx` (create if needed - consistent spacing wrapper)

#### 3. Theme Consistency - **CRITICAL REQUIREMENT**

**DO NOT modify `globals.css`** - it already has a complete, correct theme system with Cloudflare orange accents.

**MANDATORY THEME APPLICATION:**

##### Colors to Use (From globals.css):
```css
/* Light Mode */
--primary: oklch(0.72 0.15 35);              /* Cloudflare orange */
--primary-foreground: oklch(0.98 0.02 35);   /* Light text on orange */
--background: oklch(1 0 0);                   /* Pure white */
--foreground: oklch(0.145 0 0);              /* Near black text */
--card: oklch(1 0 0);                        /* White cards */
--accent: oklch(0.96 0.02 35);               /* Light orange accent */
--muted: oklch(0.96 0.01 35);                /* Subtle background */
--border: oklch(0.92 0.01 35);               /* Light borders */

/* Dark Mode */
--primary: oklch(0.78 0.18 35);              /* Brighter orange for dark mode */
--background: oklch(0.16 0.02 35);           /* Dark background */
--foreground: oklch(0.95 0.02 35);           /* Light text */
--card: oklch(0.19 0.02 35);                 /* Dark cards */
--border: oklch(0.3 0.02 35);                /* Dark borders */
```

##### REMOVE ALL Purple/Violet Colors:
- ❌ NO `purple-*`, `violet-*`, `indigo-*` Tailwind classes
- ❌ NO custom purple hex codes (#8B5CF6, #A855F7, etc.)
- ❌ NO purple in gradients or backgrounds
- ✅ ONLY use theme colors: `bg-primary`, `text-primary`, `border-primary`

##### Correct Tailwind Classes to Use:
```tsx
/* Buttons & CTAs */
<button className="bg-primary text-primary-foreground hover:bg-primary/90">

/* Cards */
<div className="bg-card text-card-foreground border border-border rounded-lg">

/* Accent Elements */
<div className="bg-accent text-accent-foreground">

/* Icons & Highlights */
<div className="text-primary">                    /* Orange icons */
<div className="bg-primary/10 text-primary">      /* Light orange background */

/* Links */
<a className="text-primary hover:text-primary/80">

/* Badges/Pills */
<span className="bg-primary/10 text-primary border border-primary/20">

/* Gradients (if needed) */
<div className="bg-gradient-to-r from-primary to-primary/80">
```

##### Component Examples with Correct Theme:

**Card Component:**
```tsx
<div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
    <Icon className="w-6 h-6" />
  </div>
  <h3 className="text-xl font-semibold text-foreground mb-2">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

**Button Component:**
```tsx
{/* Primary Button */}
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors">
  Get Started
</button>

{/* Secondary Button */}
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-3 rounded-lg font-medium transition-colors">
  Learn More
</button>

{/* Outline Button */}
<button className="border border-border text-foreground hover:bg-accent px-6 py-3 rounded-lg font-medium transition-colors">
  Documentation
</button>
```

**Download/Feature Card (from your screenshots):**
```tsx
<div className="bg-card border border-border rounded-lg p-6">
  <div className="flex items-start gap-4 mb-4">
    <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
      <CodeIcon className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-foreground">VSCode Extension</h3>
        <div className="flex items-center gap-1 text-sm">
          <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-muted-foreground">4.7</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">v1.5.2</p>
      <p className="text-muted-foreground mb-4">Native VSCode integration with IntelliSense support</p>
      
      <div className="text-sm text-muted-foreground mb-4">
        <span>5.2 MB</span>
        <span className="mx-2">•</span>
        <span>28.5k downloads</span>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Features:</h4>
        <ul className="space-y-1">
          <li className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckIcon className="w-4 h-4 text-green-500" />
            Code completion
          </li>
          {/* ... more features */}
        </ul>
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <DownloadIcon className="w-4 h-4" />
          Download
        </button>
        <button className="border border-border text-foreground hover:bg-accent px-4 py-2 rounded-lg font-medium transition-colors">
          Docs
        </button>
      </div>
    </div>
  </div>
</div>
```

**Support/Help Section:**
```tsx
<section className="py-16 bg-muted">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-foreground mb-4">Need Help?</h2>
      <p className="text-lg text-muted-foreground">Get support from our community and team members.</p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <UsersIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Community Forum</h3>
        <p className="text-muted-foreground mb-4">Connect with other developers and share your experiences.</p>
        <button className="w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors">
          Join Community
        </button>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircleIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Discord Server</h3>
        <p className="text-muted-foreground mb-4">Real-time chat with the Lattice team and community members.</p>
        <button className="w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors">
          Join Discord
        </button>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <MailIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Email Support</h3>
        <p className="text-muted-foreground mb-4">Get help from our support team for technical questions.</p>
        <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  </div>
</section>
```

##### Status Badges:
```tsx
{/* Good - Green */}
<span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
  <CheckCircleIcon className="w-4 h-4" />
  Operational
</span>

{/* Warning - Yellow */}
<span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
  <AlertCircleIcon className="w-4 h-4" />
  Degraded
</span>

{/* Error - Red */}
<span className="inline-flex items-center gap-1 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
  <XCircleIcon className="w-4 h-4" />
  Outage
</span>
```

**VERIFICATION CHECKLIST:**
- [ ] No purple, violet, or indigo colors anywhere
- [ ] All primary actions use `bg-primary` (orange)
- [ ] All cards use `bg-card` with `border-border`
- [ ] All text uses `text-foreground` or `text-muted-foreground`
- [ ] All icons in orange use `text-primary`
- [ ] Theme works in both light and dark modes
- [ ] Hover states use `/90` or `/80` opacity variants
- [ ] Accent backgrounds use `bg-primary/10` pattern

#### 4. Page-Specific Requirements

##### Marketing Pages (about, features, pricing)
- Hero section with title and description
- Content sections with consistent spacing
- CTA buttons using primary theme colors
- Optional: Feature cards, testimonials, comparison tables

##### Documentation Pages (docs, api)
- Sidebar navigation (optional, if complex docs)
- Content area with proper typography
- Code blocks styled with theme syntax colors
- Table of contents (for longer pages)

##### Legal Pages (privacy, terms)
- Simple layout focused on readability
- Proper heading hierarchy (h1, h2, h3)
- Last updated date
- Contact information

##### App Pages (admin, status)
- Dashboard layout
- Protected routes (if authentication exists)
- Consistent card-based UI

##### Community Pages (blog, support, downloads)
- Grid/list views for content
- Filter/search functionality (if applicable)
- Consistent card styling

#### 5. SEO & Metadata

For each page, add proper metadata following the pattern in `src/app/page.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Page Title | Lattice Engine",
  description: "Page description for SEO",
  keywords: ["relevant", "keywords"],
  openGraph: {
    title: "Page Title",
    description: "Page description",
    url: `${baseUrl}/page-path`,
    images: [{ url: `${baseUrl}/og-page.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title",
    description: "Page description",
  },
  alternates: {
    canonical: `${baseUrl}/page-path`,
  },
};
```

## Implementation Steps

### Phase 1: Audit & Planning
1. Review all existing pages in `src/app/`
2. Identify which pages exist and their current structure
3. Group pages by type (marketing, docs, legal, app, community)
4. Document any page-specific requirements or unique features

### Phase 2: Layout Structure
1. Choose layout architecture (nested vs. component-based)
2. Create shared layout components if needed
3. Implement consistent spacing and container system
4. Ensure Navigation and Footer are properly imported

### Phase 3: Page Updates - **THEME COMPLIANCE PRIORITY**
1. **First: Remove all purple/violet colors from every page**
2. Apply correct theme classes using examples above
3. Update each page to use shared layouts
4. Add proper metadata
5. Ensure responsive design
6. Test dark/light mode switching with orange theme

### Phase 4: Component Extraction
1. Identify repeated patterns across pages
2. Extract into reusable components
3. Document component props and usage
4. Create component examples if needed

### Phase 5: Quality Assurance
1. **CRITICAL: Verify NO purple colors exist anywhere in the application**
2. Verify Cloudflare orange theme applied consistently across all pages
3. Test navigation between pages
4. Check responsive breakpoints
5. Validate SEO metadata
6. Test accessibility (keyboard navigation, screen readers)
7. Verify dark/light theme switching with correct orange colors in both modes
8. Compare with homepage theme for consistency

## Technical Constraints

### Must Keep
- Next.js App Router structure (`src/app/`)
- Existing `layout.tsx` and `globals.css`
- ThemeProvider implementation
- Existing color system and theme tokens
- Current font configuration (Inter)

### Must Use
- Tailwind CSS v4 utility classes
- Theme color variables from `globals.css`
- TypeScript for all components
- Next.js 14+ features (Server Components by default)

### Performance Considerations
- Minimize client-side JavaScript (prefer Server Components)
- Optimize images with Next.js `Image` component
- Lazy load heavy components when appropriate
- Use proper caching strategies

## Success Criteria

### Visual Consistency
- [ ] **NO purple/violet colors anywhere in the application**
- [ ] **All primary elements use Cloudflare orange (`bg-primary`)**
- [ ] All pages use the same Navigation component
- [ ] All pages use the same Footer component
- [ ] Consistent spacing and layout patterns
- [ ] Theme colors applied consistently (orange, not purple)
- [ ] Typography scale used properly
- [ ] Icons use `text-primary` for orange color
- [ ] Cards use `bg-card` with `border-border`

### Code Quality
- [ ] No duplicate code across pages
- [ ] Shared components properly documented
- [ ] TypeScript types defined correctly
- [ ] Clean, maintainable code structure

### User Experience
- [ ] Smooth dark/light mode transitions
- [ ] Consistent navigation experience
- [ ] Fast page loads
- [ ] Responsive on all screen sizes
- [ ] Accessible to all users

### Maintainability
- [ ] Single theme configuration in `globals.css`
- [ ] Easy to update colors/spacing globally
- [ ] Clear component organization
- [ ] Good documentation for future developers

## Deliverables

1. **Updated Page Files**: All pages in `src/app/` updated with consistent layouts
2. **Shared Components**: Any new layout/shared components created
3. **Documentation**: README or CONTRIBUTING.md with:
   - Architecture overview
   - Component usage guide
   - Theme customization guide
   - Common patterns and examples
4. **Testing**: Verification that all pages work correctly

## Additional Notes

### CRITICAL: Theme Color Reference
**Always refer to the homepage (`src/app/page.tsx`) and shared components for color usage examples.**

The theme uses:
- **Primary Color**: Cloudflare orange (oklch(0.72 0.15 35) light, oklch(0.78 0.18 35) dark)
- **NOT**: Purple, violet, indigo, or any other color as primary
- **Status Colors**: Green (success), Yellow (warning), Red (error) - but NOT purple
- **Neutral Colors**: Background, foreground, muted, card (all grayscale with slight orange tint)

### File Organization Best Practices
```
src/
  app/
    (routes)/
  components/
    ui/           # shadcn/ui components
    layouts/      # layout components
    sections/     # page sections
    shared/       # shared components (Navigation, Footer)
  lib/
    utils.ts      # utility functions
  styles/
    globals.css   # DO NOT MODIFY
```

### Common Patterns to Follow

**Page Structure:**
```tsx
export default function PageName() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            {/* Page content */}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
```

**Section Spacing:**
- Hero sections: `py-16 md:py-24 lg:py-32`
- Content sections: `py-12 md:py-16 lg:py-20`
- Small sections: `py-8 md:py-12`

**Container Widths:**
- Default: `container mx-auto px-4`
- Narrow content: `max-w-4xl mx-auto px-4`
- Wide content: `max-w-7xl mx-auto px-4`

## Questions to Consider

Before starting implementation, clarify:
1. Are there any existing brand guidelines or design mockups?
2. Should certain pages have unique layouts (e.g., blog with sidebar)?
3. Are there any pages that need authentication/authorization?
4. What analytics or tracking needs to be implemented?
5. Are there any third-party integrations required?

## Resources

- Next.js App Router Docs: https://nextjs.org/docs/app
- Tailwind CSS v4 Docs: https://tailwindcss.com/docs
- OKLCH Color Picker: https://oklch.com/
- Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

---

**Start by auditing the current pages and then proceed systematically through the implementation phases. Focus on one page type at a time to ensure consistency.**