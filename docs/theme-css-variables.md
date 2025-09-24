# Media Kit Builder - CSS Variable Contract

## Overview
This document defines the standardized CSS variables used throughout the Media Kit Builder. All components and themes must use these variables to ensure consistent theming.

## Variable Naming Convention
All CSS variables follow the pattern: `--gmkb-{category}-{property}`

Example: `--gmkb-color-primary`, `--gmkb-font-heading`

## Complete Variable Reference

### Color Variables
These variables define the color scheme for the entire application.

```css
/* Primary Colors */
--gmkb-color-primary            /* Primary brand color */
--gmkb-color-primary-hover      /* Primary color hover state */
--gmkb-color-secondary          /* Secondary brand color */
--gmkb-color-accent             /* Accent color for highlights */

/* Text Colors */
--gmkb-color-text               /* Main text color */
--gmkb-color-text-light         /* Secondary/muted text */
--gmkb-color-text-dark          /* Dark text for light backgrounds */

/* Background Colors */
--gmkb-color-background         /* Main background color */
--gmkb-color-surface            /* Surface/card background */
--gmkb-color-surface-hover      /* Surface hover state */

/* Border Colors */
--gmkb-color-border             /* Default border color */
--gmkb-color-border-light       /* Light border color */

/* Status Colors (Optional) */
--gmkb-color-success            /* Success state color */
--gmkb-color-error              /* Error state color */
--gmkb-color-warning            /* Warning state color */
--gmkb-color-info               /* Info state color */
```

### Typography Variables
These variables control all text-related styling.

```css
/* Font Families */
--gmkb-font-primary             /* Body text font family */
--gmkb-font-heading             /* Heading font family */
--gmkb-font-mono                /* Monospace font family */

/* Font Sizes */
--gmkb-font-size-xs             /* Extra small text */
--gmkb-font-size-sm             /* Small text */
--gmkb-font-size-base           /* Base/body text size */
--gmkb-font-size-lg             /* Large text */
--gmkb-font-size-xl             /* Extra large text */
--gmkb-font-size-2xl            /* 2X large (H3) */
--gmkb-font-size-3xl            /* 3X large (H2) */
--gmkb-font-size-4xl            /* 4X large (H1) */

/* Font Weight */
--gmkb-font-weight-light        /* Light weight (300) */
--gmkb-font-weight-normal       /* Normal weight (400) */
--gmkb-font-weight-medium       /* Medium weight (500) */
--gmkb-font-weight-semibold     /* Semibold weight (600) */
--gmkb-font-weight-bold         /* Bold weight (700) */

/* Line Heights */
--gmkb-line-height-tight        /* Tight line height (1.2) */
--gmkb-line-height-heading      /* Heading line height (1.3) */
--gmkb-line-height-base         /* Body text line height (1.6) */
--gmkb-line-height-relaxed      /* Relaxed line height (1.8) */

/* Letter Spacing */
--gmkb-letter-spacing-tight     /* Tight letter spacing */
--gmkb-letter-spacing-normal    /* Normal letter spacing */
--gmkb-letter-spacing-wide      /* Wide letter spacing */
```

### Spacing Variables
These variables ensure consistent spacing throughout the application.

```css
/* Base Spacing Scale */
--gmkb-space-0                  /* 0px */
--gmkb-space-1                  /* 4px */
--gmkb-space-2                  /* 8px */
--gmkb-space-3                  /* 12px */
--gmkb-space-4                  /* 16px */
--gmkb-space-5                  /* 20px */
--gmkb-space-6                  /* 24px */
--gmkb-space-8                  /* 32px */
--gmkb-space-10                 /* 40px */
--gmkb-space-12                 /* 48px */
--gmkb-space-16                 /* 64px */
--gmkb-space-20                 /* 80px */

/* Component Spacing */
--gmkb-spacing-component-gap    /* Gap between components */
--gmkb-spacing-section-gap      /* Gap between sections */
--gmkb-spacing-base-unit        /* Base unit for calculations */
```

### Layout Variables
These variables control layout-related properties.

```css
/* Container Widths */
--gmkb-container-xs             /* Extra small container */
--gmkb-container-sm             /* Small container */
--gmkb-container-md             /* Medium container */
--gmkb-container-lg             /* Large container */
--gmkb-container-xl             /* Extra large container */
--gmkb-container-full           /* Full width container */

/* Breakpoints (for reference) */
--gmkb-breakpoint-xs            /* 480px */
--gmkb-breakpoint-sm            /* 640px */
--gmkb-breakpoint-md            /* 768px */
--gmkb-breakpoint-lg            /* 1024px */
--gmkb-breakpoint-xl            /* 1280px */
```

### Effect Variables
These variables control visual effects and transitions.

```css
/* Border Radius */
--gmkb-border-radius-none       /* 0px */
--gmkb-border-radius-sm         /* 4px */
--gmkb-border-radius            /* 8px (default) */
--gmkb-border-radius-lg         /* 12px */
--gmkb-border-radius-xl         /* 16px */
--gmkb-border-radius-full       /* 9999px */

/* Box Shadows */
--gmkb-shadow-none              /* No shadow */
--gmkb-shadow-sm                /* Small shadow */
--gmkb-shadow                   /* Default shadow */
--gmkb-shadow-md                /* Medium shadow */
--gmkb-shadow-lg                /* Large shadow */
--gmkb-shadow-xl                /* Extra large shadow */

/* Transitions */
--gmkb-transition-fast          /* 150ms */
--gmkb-transition               /* 300ms (default) */
--gmkb-transition-slow          /* 500ms */
--gmkb-transition-timing        /* Timing function (ease) */

/* Opacity */
--gmkb-opacity-disabled         /* 0.5 */
--gmkb-opacity-hover            /* 0.8 */
```

## Component Usage Guidelines

### Required Variables
Every component MUST use these variables for theming to work properly:
- `--gmkb-color-background` for component backgrounds
- `--gmkb-color-text` for text color
- `--gmkb-color-primary` for interactive elements
- `--gmkb-font-primary` for body text
- `--gmkb-border-radius` for rounded corners

### Fallback Values
Always provide fallback values when using CSS variables:
```css
color: var(--gmkb-color-text, #333333);
```

### Example Component Styles
```css
.gmkb-component {
  /* Colors */
  background: var(--gmkb-color-surface, #ffffff);
  color: var(--gmkb-color-text, #333333);
  border: 1px solid var(--gmkb-color-border, #e1e5e9);
  
  /* Typography */
  font-family: var(--gmkb-font-primary, sans-serif);
  font-size: var(--gmkb-font-size-base, 16px);
  line-height: var(--gmkb-line-height-base, 1.6);
  
  /* Spacing */
  padding: var(--gmkb-space-4, 16px);
  margin-bottom: var(--gmkb-spacing-component-gap, 40px);
  
  /* Effects */
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
  transition: all var(--gmkb-transition, 300ms) var(--gmkb-transition-timing, ease);
}

.gmkb-component h2 {
  font-family: var(--gmkb-font-heading, var(--gmkb-font-primary, sans-serif));
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  color: var(--gmkb-color-text, #333333);
  line-height: var(--gmkb-line-height-heading, 1.3);
}

.gmkb-component button {
  background: var(--gmkb-color-primary, #295cff);
  color: white;
  border: none;
  padding: var(--gmkb-space-3, 12px) var(--gmkb-space-6, 24px);
  border-radius: var(--gmkb-border-radius, 8px);
  font-family: var(--gmkb-font-primary, sans-serif);
  font-weight: var(--gmkb-font-weight-semibold, 600);
  transition: background var(--gmkb-transition-fast, 150ms) ease;
}

.gmkb-component button:hover {
  background: var(--gmkb-color-primary-hover, #1c4ed8);
}
```

## Theme Requirements

### Minimum Required Variables
Every theme MUST provide these CSS variables at minimum:

```css
:root {
  /* Essential Colors */
  --gmkb-color-primary: #295cff;
  --gmkb-color-text: #333333;
  --gmkb-color-background: #ffffff;
  --gmkb-color-surface: #f8f9fa;
  --gmkb-color-border: #e1e5e9;
  
  /* Essential Typography */
  --gmkb-font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --gmkb-font-size-base: 16px;
  --gmkb-line-height-base: 1.6;
  
  /* Essential Effects */
  --gmkb-border-radius: 8px;
  --gmkb-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --gmkb-transition: 300ms;
}
```

### Complete Theme Example
```css
:root {
  /* Complete color palette */
  --gmkb-color-primary: #2563eb;
  --gmkb-color-primary-hover: #1d4ed8;
  --gmkb-color-secondary: #1e40af;
  --gmkb-color-accent: #3b82f6;
  --gmkb-color-text: #1f2937;
  --gmkb-color-text-light: #6b7280;
  --gmkb-color-background: #ffffff;
  --gmkb-color-surface: #f9fafb;
  --gmkb-color-border: #e5e7eb;
  
  /* Typography system */
  --gmkb-font-primary: 'Inter', sans-serif;
  --gmkb-font-heading: 'Montserrat', sans-serif;
  --gmkb-font-size-xs: 12px;
  --gmkb-font-size-sm: 14px;
  --gmkb-font-size-base: 16px;
  --gmkb-font-size-lg: 18px;
  --gmkb-font-size-xl: 24px;
  --gmkb-font-size-2xl: 32px;
  --gmkb-font-size-3xl: 40px;
  --gmkb-font-size-4xl: 48px;
  
  /* Spacing system */
  --gmkb-space-1: 4px;
  --gmkb-space-2: 8px;
  --gmkb-space-3: 12px;
  --gmkb-space-4: 16px;
  --gmkb-space-6: 24px;
  --gmkb-space-8: 32px;
  --gmkb-spacing-component-gap: 48px;
  --gmkb-spacing-section-gap: 96px;
  
  /* Effects */
  --gmkb-border-radius: 12px;
  --gmkb-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --gmkb-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --gmkb-shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --gmkb-transition: 200ms;
  --gmkb-transition-timing: ease;
}
```

## Migration Guide

### For Existing Components
If your component is using hardcoded styles or non-standard variable names:

#### Before:
```css
.hero-component {
  background-color: #f5f5f5;
  color: #333;
}
```

#### After:
```css
.hero-component {
  background-color: var(--gmkb-color-surface, #f5f5f5);
  color: var(--gmkb-color-text, #333);
}
```

### For Inline Styles
Remove all inline styles from JavaScript:

#### Before:
```javascript
`<div style="background-color: ${backgroundColor}; color: ${textColor};">`
```

#### After:
```javascript
`<div class="gmkb-hero">`
```

## Testing Checklist

- [ ] Component uses only `--gmkb-*` CSS variables
- [ ] All variables have fallback values
- [ ] No hardcoded colors in CSS
- [ ] No inline styles in JavaScript/Vue templates
- [ ] Component looks correct with all 4 themes
- [ ] Component responds to theme switching
- [ ] Custom theme changes apply correctly

## Notes

1. **Consistency**: Always use the standardized variable names
2. **Fallbacks**: Always provide fallback values for graceful degradation
3. **Inheritance**: Use CSS cascade - set variables on parent containers
4. **Performance**: CSS variables are performant and update instantly
5. **Browser Support**: CSS variables are supported in all modern browsers
