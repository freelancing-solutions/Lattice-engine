I have created the following plan after thorough exploration and analysis of the codebase. Follow the below plan verbatim. Trust the files and references. Do not re-verify what's written in the plan. Explore only when absolutely necessary. First implement all the proposed file changes and then I'll review all the changes together at the end.

### Observations

The lattice-website uses a well-structured design system with:
- **Color System**: Cloudflare-inspired orange as primary (`oklch(0.72 0.15 35)` light mode, `oklch(0.78 0.18 35)` dark mode)
- **Components**: shadcn/ui library with class-variance-authority for variant management
- **Styling**: Tailwind CSS with CSS variables for theming, supporting light/dark modes
- **Current Issue**: Hero section uses purple gradients (`from-slate-900 via-purple-900`) instead of the brand's Cloudflare-like orange colors

The downloads page doesn't explicitly define colors but references the theme colors through CSS variables, making the `globals.css` file the source of truth for the color palette.


### Approach

This plan creates a comprehensive styling guide prompt document that captures the lattice-website's design system, including the Cloudflare-inspired color palette, component patterns, and styling conventions. The prompt will serve as a reference for maintaining consistent styling across the website.

The hero section will be updated to use Cloudflare-like orange gradient colors instead of the current purple theme, aligning with the primary brand color defined in `globals.css`. This ensures visual consistency with the rest of the website's design system.


### Reasoning

I explored the lattice-website directory structure and examined key files including the downloads page, hero section component, global styles, Tailwind configuration, and several UI components. I identified the Cloudflare-inspired orange color scheme defined in `globals.css` as CSS variables, the shadcn/ui component system, and the current purple-themed hero section that needs to be updated to match the brand colors.


## Proposed File Changes

### lattice-website\prompts\styling-guide.md(NEW)

References: 

- lattice-website\src\app\globals.css
- lattice-website\tailwind.config.ts
- lattice-website\src\components\ui\button.tsx
- lattice-website\src\components\ui\card.tsx
- lattice-website\src\components\ui\badge.tsx
- lattice-website\src\app\downloads\page.tsx
- lattice-website\src\components\hero-section.tsx(MODIFY)
- lattice-website\src\lib\utils.ts

Create a comprehensive styling guide prompt document that captures the lattice-website's design system. This document should include:

## Color System
- Document the Cloudflare-inspired primary orange color: `oklch(0.72 0.15 35)` (light mode) and `oklch(0.78 0.18 35)` (dark mode)
- List all semantic color tokens from `e:/projects/Lattice-engine/lattice-website/src/app/globals.css` (background, foreground, primary, secondary, muted, accent, destructive, border, input, ring)
- Include chart colors (5 variants: orange, green, blue, pink, yellow)
- Document code syntax colors (Monokai-inspired: keyword, string, comment, function, variable, number)
- Specify that colors are defined using CSS variables for light/dark mode support

## Component System
- Explain the shadcn/ui component library usage
- Document component patterns from `e:/projects/Lattice-engine/lattice-website/src/components/ui/` including Button, Card, Badge, and their variants
- Show how components use class-variance-authority (cva) for variant management
- Include examples of component usage from `e:/projects/Lattice-engine/lattice-website/src/app/downloads/page.tsx`
- Document the semantic color token usage in components (e.g., `bg-primary`, `text-primary-foreground`)

## Styling Conventions
- Tailwind CSS as the primary styling framework
- CSS variables for dynamic theming (defined in `:root` and `.dark` selectors)
- Custom Tailwind theme extension in `e:/projects/Lattice-engine/lattice-website/tailwind.config.ts`
- Border radius system: `--radius` with sm, md, lg variants
- Shadow system: shadow-xs, shadow-sm for subtle depth
- Spacing and layout patterns using Tailwind utilities

## Animation Patterns
- Framer Motion for page transitions and interactive elements
- Common animation patterns: fade-in, slide-up with staggered delays
- Example animations from `e:/projects/Lattice-engine/lattice-website/src/components/hero-section.tsx`

## Hero Section Requirements
- **IMPORTANT**: The hero section must use Cloudflare-like orange gradient colors
- Replace purple gradients with orange-based gradients using the primary color
- Maintain the gradient aesthetic but with orange/warm tones instead of purple/cool tones
- Example: Use gradients like `from-orange-900 via-slate-900 to-orange-900` or incorporate the primary orange color
- Accent colors should complement the orange theme (e.g., amber, yellow, warm pink)

## Typography
- Font families: Geist Sans (primary), Geist Mono (code)
- Heading hierarchy and sizing conventions
- Text color tokens: foreground, muted-foreground, accent-foreground

## Best Practices
- Always use semantic color tokens instead of hardcoded colors
- Ensure all components support both light and dark modes
- Use consistent spacing scale from Tailwind
- Apply hover states and transitions for interactive elements
- Maintain accessibility with proper contrast ratios
- Use the `cn()` utility from `e:/projects/Lattice-engine/lattice-website/src/lib/utils.ts` for className merging

## Examples
Include code examples showing:
- How to use the Button component with different variants
- How to create a Card with proper styling
- How to apply the color system in custom components
- How to implement animations with Framer Motion
- How the downloads page demonstrates proper component usage

### lattice-website\src\components\hero-section.tsx(MODIFY)

References: 

- lattice-website\src\app\globals.css

Update the hero section to use Cloudflare-like orange gradient colors instead of the current purple theme. The changes should:

1. **Background Gradient**: Replace `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900` (line 57) with an orange-based gradient that uses warm tones. Consider gradients like:
   - `bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900`
   - Or `bg-gradient-to-br from-gray-900 via-orange-950 to-gray-900`
   - Or incorporate the primary orange color more directly

2. **Heading Gradient**: Update the text gradient `bg-gradient-to-r from-purple-400 to-pink-600` (line 93) to use orange/warm tones:
   - Consider `from-orange-400 to-amber-500`
   - Or `from-orange-400 to-yellow-500`
   - Or use the primary color with complementary warm tones

3. **Button Colors**: Update the primary button from `bg-purple-600 hover:bg-purple-700` (line 114) to use the primary orange color:
   - Use `bg-primary hover:bg-primary/90` to leverage the theme color
   - Or explicitly use `bg-orange-600 hover:bg-orange-700`

4. **Outline Button**: Update the outline button border and text from `border-purple-400 text-purple-400 hover:bg-purple-400` (line 118) to match the orange theme:
   - Use `border-primary text-primary hover:bg-primary` to leverage theme colors
   - Or `border-orange-400 text-orange-400 hover:bg-orange-400`

5. **Icon Colors**: Update all icon colors from `text-purple-400` (lines 163, 178, 193, 208) to `text-orange-400` or `text-primary` to maintain consistency with the new color scheme

6. **Code Snippet Colors**: Consider updating the animated code snippet color from `text-green-400` (line 63) to complement the orange theme, though green can work as an accent

Ensure all changes maintain the visual hierarchy and contrast while aligning with the Cloudflare-inspired orange brand color defined in `e:/projects/Lattice-engine/lattice-website/src/app/globals.css`.