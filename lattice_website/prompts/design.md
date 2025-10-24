# Homepage Theme Fix - Apply Cloudflare Orange Theme

## Objective
Update `src/app/page.tsx` and all its imported components to remove purple/violet colors and apply the correct Cloudflare orange theme from `globals.css`.

## Files to Update

### Main Page
- `src/app/page.tsx` - Already has correct structure, verify components

### Components to Audit & Fix
All components imported in homepage:
- `src/components/navigation.tsx`
- `src/components/hero-section.tsx`
- `src/components/value-propositions.tsx`
- `src/components/interactive-demo.tsx`
- `src/components/developer-features.tsx`
- `src/components/documentation-hub.tsx`
- `src/components/footer.tsx`

## Critical Requirements

### 1. Remove ALL Purple Colors
Search and replace in all homepage components:
- ❌ `purple-*` → ✅ `primary` or orange equivalents
- ❌ `violet-*` → ✅ `primary` or orange equivalents
- ❌ `indigo-*` → ✅ `primary` or orange equivalents
- ❌ Hex codes like `#8B5CF6`, `#A855F7` → ✅ Use Tailwind theme classes

### 2. Apply Correct Theme Classes

**Primary Actions (Buttons, CTAs):**
```tsx
// ❌ WRONG
<button className="bg-purple-600 hover:bg-purple-700">

// ✅ CORRECT
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
```

**Cards:**
```tsx
// ❌ WRONG
<div className="bg-white dark:bg-gray-900 border-purple-200">

// ✅ CORRECT
<div className="bg-card text-card-foreground border border-border">
```

**Icons & Accents:**
```tsx
// ❌ WRONG
<div className="text-purple-600">
<div className="bg-purple-100">

// ✅ CORRECT
<div className="text-primary">
<div className="bg-primary/10">
```

**Links:**
```tsx
// ❌ WRONG
<a className="text-purple-600 hover:text-purple-800">

// ✅ CORRECT
<a className="text-primary hover:text-primary/80">
```

**Gradients:**
```tsx
// ❌ WRONG
<div className="bg-gradient-to-r from-purple-600 to-blue-600">

// ✅ CORRECT
<div className="bg-gradient-to-r from-primary to-primary/80">
```

## Component-Specific Guidance

### Hero Section
- Heading: `text-foreground`
- Subheading: `text-muted-foreground`
- Primary CTA: `bg-primary text-primary-foreground hover:bg-primary/90`
- Secondary CTA: `border border-border text-foreground hover:bg-accent`
- Accent elements: `text-primary` or `bg-primary/10`

### Value Propositions
- Card backgrounds: `bg-card`
- Card borders: `border-border`
- Icons: `text-primary` with `bg-primary/10` background circle
- Headings: `text-foreground`
- Descriptions: `text-muted-foreground`

### Interactive Demo
- Demo container: `bg-card border border-border`
- Active states: `bg-primary/10 text-primary`
- Code syntax: Use CSS variables `--code-keyword`, `--code-string`, etc.
- Buttons: `bg-primary text-primary-foreground`

### Developer Features
- Feature cards: `bg-card border border-border rounded-lg`
- Icons: `text-primary` in `bg-primary/10` containers
- Hover effects: `hover:shadow-lg hover:border-primary/20`
- Tags/badges: `bg-primary/10 text-primary border border-primary/20`

### Documentation Hub
- Section links: `text-primary hover:text-primary/80`
- Category cards: `bg-card border border-border`
- Icons: `text-primary`
- Hover states: `hover:bg-accent`

### Navigation
- Background: `bg-background/95 backdrop-blur` with `border-b border-border`
- Links: `text-foreground hover:text-primary`
- Active link: `text-primary`
- Mobile menu toggle: `text-foreground`
- CTA button: `bg-primary text-primary-foreground`

### Footer
- Background: `bg-muted` or `bg-card`
- Text: `text-muted-foreground`
- Links: `hover:text-primary`
- Section headings: `text-foreground font-semibold`
- Social icons: `text-muted-foreground hover:text-primary`

## Quick Search & Replace Patterns

Run these searches across homepage components:

1. **Class name patterns:**
   ```
   Find: purple-[0-9]{3}
   Find: violet-[0-9]{3}
   Find: indigo-[0-9]{3}
   Review and replace with appropriate theme class
   ```

2. **Common replacements:**
   ```
   bg-purple-600 → bg-primary
   text-purple-600 → text-primary
   border-purple-200 → border-border
   hover:bg-purple-700 → hover:bg-primary/90
   bg-purple-50 → bg-primary/10
   from-purple-600 → from-primary
   ```

## Verification Steps

1. **Visual Inspection:**
   - [ ] No purple/violet anywhere on homepage
   - [ ] Primary buttons are Cloudflare orange
   - [ ] Icons use orange accent color
   - [ ] Cards have consistent styling

2. **Mode Testing:**
   - [ ] Light mode: Orange accents on white background
   - [ ] Dark mode: Brighter orange on dark background
   - [ ] Smooth theme transitions

3. **Interactive States:**
   - [ ] Hover states use orange (not purple)
   - [ ] Active states use orange
   - [ ] Focus rings use orange (`ring-primary`)

4. **Consistency Check:**
   - [ ] All CTAs use same orange
   - [ ] All icons use same orange
   - [ ] All links hover to orange
   - [ ] All accent backgrounds are light orange

## Example Component Fix

**Before (Purple):**
```tsx
export function ValuePropositions() {
  return (
    <section className="py-24">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Feature</h3>
          <p className="text-gray-600 dark:text-gray-400">Description</p>
          <button className="mt-4 text-purple-600 hover:text-purple-700">Learn more →</button>
        </div>
      </div>
    </section>
  )
}
```

**After (Orange):**
```tsx
export function ValuePropositions() {
  return (
    <section className="py-24">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Feature</h3>
          <p className="text-muted-foreground">Description</p>
          <button className="mt-4 text-primary hover:text-primary/80 transition-colors">Learn more →</button>
        </div>
      </div>
    </section>
  )
}
```

## Output

After completion:
1. List all files modified
2. Confirm no purple colors remain
3. Verify light & dark mode both use orange theme
4. Screenshot homepage in both modes for verification

---

**Priority: HIGH - This must match the theme system already defined in `globals.css`**