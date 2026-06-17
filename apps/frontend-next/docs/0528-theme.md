# Theme Unification Plan - SmartRetail Pro Frontend-Next

**Date**: 2026-05-28
**Status**: Planned

## Goal

Unify the theme across all screens in `apps/frontend-next` for consistent visual appearance.

---

## Issues Identified

### 1. Dark Mode Selector Mismatch (Critical)

**Location**: `app/globals.css:51`

- **Current**: Uses `@media (prefers-color-scheme: dark)` for dark theme
- **Problem**: `theme-provider.tsx` uses `attribute="class"` (adds `.dark` class to `<html>`)
- **Result**: Dark mode toggle does not work; only system preference applies

### 2. Missing Semantic Color Tokens

**Location**: `app/globals.css`

- No `success` color (green for positive states)
- No `warning` color (yellow for warnings)
- No `info` color (blue for informational states)

### 3. Hardcoded Colors in Components

| File | Line | Issue |
|------|------|-------|
| `features/products/components/product-table-client.tsx` | 133-136 | Status badge uses `bg-green-100`, `text-green-800`, `dark:bg-green-900` |
| `features/alerts/components/alert-list-client.tsx` | 29-33 | Severity uses `text-blue-500`, `text-yellow-500`, `text-red-500` |
| `features/alerts/components/alert-list-client.tsx` | 68-69 | Connection indicator uses `bg-green-500`, `bg-red-500` |
| `features/alerts/components/alert-list-client.tsx` | 126 | Unread indicator uses `bg-blue-500` |

### 4. Missing UI Components

- No `badge.tsx` component (status badges are inline)
- No `textarea.tsx` component (product form uses inline styles)

---

## Implementation Plan

### Phase 1: Fix Dark Mode CSS Architecture

**File**: `app/globals.css`

Change dark theme from media query to class selector:

```css
/* Replace @media (prefers-color-scheme: dark) { @theme { ... } } */
/* With: */
.dark {
  --color-background: oklch(0.145 0 0);
  --color-foreground: oklch(0.985 0 0);
  /* ... all dark theme variables */
}
```

### Phase 2: Add Semantic Color Tokens

**File**: `app/globals.css`

Add to `@theme` block (light mode):
```css
/* Status colors */
--color-success: oklch(0.6 0.2 145);
--color-success-foreground: oklch(0.985 0 0);
--color-warning: oklch(0.75 0.15 85);
--color-warning-foreground: oklch(0.145 0 0);
--color-info: oklch(0.6 0.15 250);
--color-info-foreground: oklch(0.985 0 0);
```

Add to `.dark` block:
```css
--color-success: oklch(0.65 0.18 145);
--color-success-foreground: oklch(0.145 0 0);
--color-warning: oklch(0.8 0.12 85);
--color-warning-foreground: oklch(0.145 0 0);
--color-info: oklch(0.65 0.13 250);
--color-info-foreground: oklch(0.145 0 0);
```

### Phase 3: Create Missing UI Components

#### 3.1 Badge Component

**File**: `components/ui/badge.tsx`

shadcn/ui style Badge with semantic variants:
- `default`, `secondary`, `destructive`, `outline`
- `success`, `warning`, `info` (new semantic variants)

#### 3.2 Textarea Component

**File**: `components/ui/textarea.tsx`

shadcn/ui style Textarea matching existing Input component.

### Phase 4: Refactor Components to Use Theme Tokens

#### 4.1 Product Table

**File**: `features/products/components/product-table-client.tsx`

Replace inline status badge (lines 132-140) with Badge component:
```tsx
<Badge variant={product.status === 1 ? 'success' : 'destructive'}>
  {product.status === 1 ? '有効' : '無効'}
</Badge>
```

#### 4.2 Alert List

**File**: `features/alerts/components/alert-list-client.tsx`

Replace hardcoded severity colors (lines 29-33):
```tsx
const severityColors = {
  info: 'text-info',
  warning: 'text-warning',
  error: 'text-destructive',
};
```

Replace connection indicator (lines 67-70):
```tsx
<span className={cn("h-2 w-2 rounded-full", isConnected ? "bg-success" : "bg-destructive")} />
```

Replace unread indicator (line 126):
```tsx
<span className="h-2 w-2 rounded-full bg-info" />
```

### Phase 5: Verify Product Form

**File**: `features/products/components/product-form.tsx`

Replace inline textarea with Textarea component if needed.

---

## Files to Modify

| Priority | File | Changes |
|----------|------|---------|
| High | `app/globals.css` | Fix dark mode selector, add semantic tokens |
| High | `components/ui/badge.tsx` | Create new component |
| Medium | `components/ui/textarea.tsx` | Create new component |
| High | `features/products/components/product-table-client.tsx` | Use Badge component |
| High | `features/alerts/components/alert-list-client.tsx` | Use semantic color tokens |
| Low | `features/products/components/product-form.tsx` | Use Textarea component |

---

## Verification

### Manual Testing

1. **Dark Mode Toggle**
   - Visit any page
   - Toggle dark/light mode via system preferences or theme toggle
   - Verify all colors change correctly

2. **Component Consistency**
   - Check product status badges on `/products` page
   - Check alert severity colors on `/alerts` page
   - Check connection indicator on `/alerts` page

### E2E Testing

Run Playwright tests after implementation:

```bash
cd apps/frontend-next
pnpm test:e2e
```

Test scenarios to verify:
- Authentication flow (login page theme)
- Product CRUD (status badges)
- Alert display (severity colors, connection indicator)
- Dark mode visual consistency

---

## Assumptions

1. Figma design reference may contain specific color values - will extract if accessible
2. OKLch color values for success/warning/info are based on typical green/yellow/blue hues
3. shadcn/ui "new-york" style conventions apply to new components
