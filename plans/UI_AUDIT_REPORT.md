# LifeOS UI/UX Audit Report

## Executive Summary

Comprehensive audit of the LifeOS application reveals **significant inconsistencies** in UI styling, component usage, and pattern implementation across all pages. The application uses a modern tech stack (Next.js, Tailwind CSS v4, shadcn/ui) but lacks unified styling enforcement.

---

## 1. Critical Issues Requiring Immediate Attention

### 1.1 Inline Button Height Styles
**Severity: HIGH**

All pages use inline `style={{ height: '32px' }}` for buttons instead of using the built-in `size` prop:

| Page | Line | Code |
|------|------|------|
| [`finance/page.tsx`](src/app/finance/page.tsx) | 243-266 | `style={{ height: '32px' }}` |
| [`habits/page.tsx`](src/app/habits/page.tsx) | 99 | `style={{ height: '32px' }}` |
| [`health/page.tsx`](src/app/health/page.tsx) | 90 | `style={{ height: '32px' }}` |
| [`workouts/page.tsx`](src/app/workouts/page.tsx) | 120-139 | `style={{ height: '32px' }}` |
| [`nutrition/page.tsx`](src/app/nutrition/page.tsx) | 114-124 | `style={{ height: '32px' }}` |
| [`goals/page.tsx`](src/app/goals/page.tsx) | 97 | `style={{ height: '32px' }}` |
| [`beauty/page.tsx`](src/app/beauty/page.tsx) | 101 | `style={{ height: '32px' }}` |
| [`automations/page.tsx`](src/app/automations/page.tsx) | 107 | `style={{ height: '32px' }}` |
| [`mind/page.tsx`](src/app/mind/page.tsx) | 128, 182, 223 | `style={{ height: '32px' }}` |

**Recommendation**: Add new size variant to Button component (`size="sm"`) or update existing size to match 32px height.

---

### 1.2 Native `<select>` Instead of UI Component
**Severity: HIGH**

All pages use native HTML `<select>` instead of the shadcn/ui [`Select`](src/components/ui/select.tsx) component:

| Page | Count | Lines |
|------|-------|-------|
| [`finance/page.tsx`](src/app/finance/page.tsx) | 5 | 339-352, 358-370, 376-402, 490-500, 505-517 |
| [`habits/page.tsx`](src/app/habits/page.tsx) | 1 | 121-130 |
| [`health/page.tsx`](src/app/health/page.tsx) | 1 | 112-125 |
| [`nutrition/page.tsx`](src/app/nutrition/page.tsx) | 2 | 138-148, 152-162 |
| [`goals/page.tsx`](src/app/goals/page.tsx) | 1 | 119-128 |
| [`beauty/page.tsx`](src/app/beauty/page.tsx) | 1 | 123-131 |
| [`automations/page.tsx`](src/app/automations/page.tsx) | 2 | 131-140, 144-153 |
| [`mind/page.tsx`](src/app/mind/page.tsx) | 1 | 150-159 |

**Code Example** (current - inconsistent):
```tsx
<select
  name="category"
  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
>
```

**Recommendation**: Replace all native `<select>` with `<Select>` component from `@/components/ui/select`.

---

### 1.3 Inline Style Tag for Tab Colors
**Severity: MEDIUM**

In [`finance/page.tsx`](src/app/finance/page.tsx) lines 301-317:

```tsx
<style>{`
  [data-slot="tabs-trigger"][data-tab-type="income"][data-active] {
    background-color: rgb(22 163 74) !important;
    color: white !important;
    border-color: rgb(22 163 74) !important;
  }
  ...
`}</style>
```

**Recommendation**: Remove inline styles and implement proper variant system for TabsTrigger using class-variance-authority.

---

### 1.4 Duplicate Card in Health Page
**Severity: MEDIUM**

In [`health/page.tsx`](src/app/health/page.tsx), the "Сон сегодня" card is duplicated:
- First instance: lines 183-196
- Second instance: lines 199-216

**Recommendation**: Remove duplicate card (lines 199-216).

---

### 1.5 Native `<textarea>` Instead of UI Component
**Severity: MEDIUM**

In [`mind/page.tsx`](src/app/mind/page.tsx) line 241-244:

```tsx
<textarea
  name="content"
  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
/>
```

**Recommendation**: Replace with `<Textarea>` component from `@/components/ui/textarea`.

---

## 2. Pattern Inconsistencies

### 2.1 Button Variants Usage
**Inconsistent Pattern**: Mix of different button variants across pages:

| Page | Pattern |
|------|---------|
| Dashboard | Uses `variant="outline"` for secondary actions |
| Finance | Uses `variant="outline"` for navigation buttons |
| Workouts | Uses `variant="outline"` and `variant="ghost"` |
| Settings | Uses `variant="ghost"` for inline actions |

**Recommendation**: Establish clear button variant guidelines:
- Primary actions: `variant="default"`
- Secondary/Navigation: `variant="outline"`
- Inline actions within cards: `variant="ghost"`

---

### 2.2 Tabs Placement and Styling
**Inconsistent Pattern**: Different tab implementations:

| Page | Placement | TabsList Classes |
|------|-----------|------------------|
| [`nutrition/page.tsx`](src/app/nutrition/page.tsx) | Outside Card | `grid grid-cols-4 gap-2` |
| [`beauty/page.tsx`](src/app/beauty/page.tsx) | Inside Card | `grid grid-cols-3 gap-2` |
| [`mind/page.tsx`](src/app/mind/page.tsx) | Inside Card | `grid grid-cols-3 gap-2` |
| [`finance/page.tsx`](src/app/finance/page.tsx) | Inside Dialog | `grid w-full grid-cols-3 bg-muted/50` |

**Recommendation**: Standardize tabs placement (recommended: inside Cards) and consistent classNames.

---

### 2.3 Card Header Structures
**Inconsistent Pattern**: Different CardHeader patterns:

| Page | Pattern |
|------|---------|
| Finance | `<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">` |
| Habits | `<CardHeader className="pb-2">` (minimal) |
| Health | `<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">` |
| Workouts | `<CardHeader>` (different structure) |
| Nutrition | `<CardHeader>` (different structure) |

**Recommendation**: Create standardized Card patterns for different use cases (stat cards, content cards, list cards).

---

### 2.4 Icon Sizing
**Inconsistent Pattern**: Different icon sizes across pages:

```tsx
// Various sizes used:
<Icon className="h-4 w-4" />  // Most common
<Icon className="h-5 w-5" />  // Settings, Beauty analysis
<Icon className="h-6 w-6" />  // Quick start buttons in Workouts
<Icon className="h-3 w-3" />  // Small labels
```

**Recommendation**: Standardize icon sizes:
- Card headers: `h-4 w-4`
- Dialog headers: `h-5 w-5`
- Large buttons: `h-6 w-6`
- Inline text: `h-3 w-3`

---

### 2.5 Empty States
**Inconsistent Pattern**: Different empty state implementations:

| Page | Implementation |
|------|----------------|
| Habits | `<EmptyState>` component |
| Workouts | Inline div with icons |
| Nutrition | Inline div with icons |
| Beauty | Inline div inside Card |
| Mind | Inline div inside Card |

**Recommendation**: Use consistent `<EmptyState>` component across all pages.

---

### 2.6 Grid Layout Patterns
**Inconsistent Pattern**: Different grid patterns:

```tsx
// Finance
<div className="grid gap-4 md:grid-cols-3">

// Health  
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// Workouts
<div className="grid gap-4 md:grid-cols-2">

// Nutrition
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
```

**Recommendation**: Establish standardized grid patterns for different card densities.

---

### 2.7 Header Actions Section
**Inconsistent Pattern**: Different approaches to header actions:

| Page | Pattern |
|------|---------|
| Finance | Full header with multiple navigation buttons + Add button |
| Habits | Just Add button |
| Health | Just Add button |
| Workouts | Multiple navigation buttons + Add button |
| Nutrition | Navigation buttons + Add button |
| Goals | Just Add button |
| Settings | Empty header block `<div className="flex flex-wrap gap-2 justify-end"></div>` |

**Recommendation**: 
- Remove empty header block in Settings
- Standardize header action patterns per page type

---

### 2.8 Card Title Sizes
**Inconsistent Pattern**: Different text sizes for CardTitle:

```tsx
// Standard
<CardTitle className="text-sm font-medium">  // Stat cards

// Variants found
<CardTitle className="text-base">  // Content cards
<CardTitle className="text-lg">  // Page titles in cards
```

---

## 3. Component Library Analysis

### 3.1 Button Component ([`button.tsx`](src/components/ui/button.tsx))
**Status**: Well-implemented with CVA variants
- Variants: default, outline, secondary, ghost, destructive, link
- Sizes: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg

**Missing**: The `size="sm"` should match 32px height (currently h-8 = 32px, which is correct!)

**Issue**: Pages are using inline styles instead of the built-in `size="sm"` prop.

---

### 3.2 Select Component ([`select.tsx`](src/components/ui/select.tsx))
**Status**: Properly implemented
- Sizes: default (h-8), sm (h-7)

**Issue**: Not used anywhere in the application.

---

### 3.3 Card Component ([`card.tsx`](src/components/ui/card.tsx))
**Status**: Well-implemented
- Supports `size="default"` and `size="sm"`
- Has size-specific styling

---

### 3.4 Tabs Component ([`tabs.tsx`](src/components/ui/tabs.tsx))
**Status**: Well-implemented
- Supports vertical/horizontal orientation
- Has variant system for TabsList

**Issue**: No colored/variant tabs trigger implementation.

---

## 4. Recommended Actions

### Priority 1 (Critical - Fix Now)
1. ✅ Add `size="sm"` buttons to pages - just use existing `size="sm"` prop instead of inline styles
2. Replace all native `<select>` with `<Select>` component
3. Remove inline `<style>` tag in finance page
4. Remove duplicate "Сон сегодня" card in health page

### Priority 2 (High - Fix Soon)
1. Replace native `<textarea>` with `<Textarea>` component
2. Standardize button variant usage across pages
3. Standardize tabs placement and styling
4. Use consistent EmptyState component

### Priority 3 (Medium - Fix During Refactor)
1. Standardize icon sizing
2. Standardize Card header structures
3. Standardize grid layouts
4. Remove empty header blocks
5. Standardize CardTitle text sizes

---

## 5. UI Style Guide Recommendation

### Colors
The application uses a consistent OKLCH color palette:
- Primary: Indigo-blue (62% lightness, 16% saturation, 240 hue)
- Secondary: Teal/Cyan (68% lightness, 13% saturation, 195 hue)
- Accent: Fresh Green (76% lightness, 18% saturation, 140 hue)

✅ **This is well-implemented and should be preserved.**

### Typography
- Headings: Use existing CardTitle, CardDescription patterns
- Body: Default text size (text-sm)
- Labels: text-sm with font-medium

### Spacing
- Card padding: px-4 py-4 (default), px-3 py-3 (sm)
- Grid gaps: gap-4 for main, gap-3 for tight, gap-2 for compact

### Components Usage
| Component | When to Use |
|-----------|-------------|
| `<Button>` | All button actions |
| `<Select>` | All dropdown selections |
| `<Textarea>` | Multi-line text input |
| `<Card>` | All content containers |
| `<EmptyState>` | All empty list states |
| `<Tabs>` | Tabbed content navigation |

---

## Conclusion

The LifeOS application has a solid design foundation with Tailwind CSS v4 and shadcn/ui, but suffers from inconsistent implementation patterns. The majority of issues stem from:

1. **Developer convenience shortcuts** (inline styles, native elements)
2. **Lack of component usage documentation** 
3. **Evolution of patterns** without retroactive updates

A concerted effort to standardize these patterns will significantly improve the experience and user maintainability of the codebase.
