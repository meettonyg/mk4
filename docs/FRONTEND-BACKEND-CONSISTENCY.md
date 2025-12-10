# Frontend-Backend Consistency Guide

## Overview
This document outlines the alignment between the Vue backend (editor/preview) and PHP frontend (public display) for the Media Kit Builder.

## Architecture Decision: PHP Frontend + Vue Backend

### Why PHP Frontend?
1. **SEO Benefits** - Server-side rendering for search engines
2. **Performance** - No JavaScript required for viewing
3. **Accessibility** - Works without JavaScript
4. **WordPress Integration** - Native hooks and filters

### Why Vue Backend?
1. **Interactive Editing** - Real-time preview
2. **Component Management** - Drag-and-drop interface
3. **State Management** - Complex editor state
4. **Rich UX** - Smooth transitions and updates

## HTML Structure Alignment

### Container Hierarchy
Both frontend and backend must use identical structure:

```html
<!-- Root Container -->
<div class="gmkb-frontend-wrapper" data-media-kit-id="..." data-gmkb-theme="...">
    
    <!-- Main Container -->
    <div class="gmkb-media-kit-container">
        
        <!-- Sections Wrapper -->
        <div class="gmkb-sections-wrapper">
            
            <!-- Section -->
            <section class="gmkb-section gmkb-section--{type}" data-section-id="...">
                <div class="gmkb-section__inner">
                    
                    <!-- For multi-column -->
                    <div class="gmkb-section__columns gmkb-section__columns--{count}">
                        <div class="gmkb-section__column" data-column="{n}">
                            <!-- Components here -->
                        </div>
                    </div>
                    
                    <!-- Component -->
                    <div class="gmkb-component gmkb-component--{type}" data-component-id="...">
                        <!-- Component content -->
                    </div>
                    
                </div>
            </section>
            
        </div>
    </div>
</div>
```

## CSS Class Naming Convention

### BEM-Style Naming
- Block: `gmkb-{block}`
- Element: `gmkb-{block}__{element}`
- Modifier: `gmkb-{block}--{modifier}`

### Standard Classes
```css
/* Containers */
.gmkb-frontend-wrapper
.gmkb-media-kit-container
.gmkb-sections-wrapper
.gmkb-components-wrapper

/* Sections */
.gmkb-section
.gmkb-section--full_width
.gmkb-section--two_column
.gmkb-section--three_column
.gmkb-section__inner
.gmkb-section__columns
.gmkb-section__columns--2
.gmkb-section__columns--3
.gmkb-section__column

/* Components */
.gmkb-component
.gmkb-component--{type}
.gmkb-component__content
.gmkb-component__header
.gmkb-component__footer

/* States */
.gmkb-animate
.gmkb-animate--visible
.gmkb-loading
.gmkb-error
.gmkb-empty
```

## CSS Variables (Design Tokens)

Both frontend and backend must use the same CSS variables:

```css
:root {
    /* Typography */
    --gmkb-font-primary: Inter, sans-serif;
    --gmkb-font-heading: Montserrat, sans-serif;
    --gmkb-font-size-base: 16px;
    --gmkb-line-height-body: 1.7;
    --gmkb-line-height-heading: 1.3;
    
    /* Colors */
    --gmkb-color-primary: #2563eb;
    --gmkb-color-text: #1f2937;
    --gmkb-color-background: #ffffff;
    --gmkb-color-surface: #f9fafb;
    --gmkb-color-border: #e5e7eb;
    
    /* Spacing */
    --gmkb-spacing-base-unit: 8px;
    --gmkb-spacing-component-gap: 48px;
    --gmkb-spacing-section-gap: 96px;
    --gmkb-spacing-container-padding: 24px;
    --gmkb-spacing-content-max-width: 1200px;
    
    /* Effects */
    --gmkb-border-radius: 12px;
    --gmkb-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --gmkb-transitions: all 0.2s ease;
}
```

## Component Templates

### Directory Structure
```
/components/
  /{component-type}/
    /component.json       # Component definition
    /template.php         # PHP template (frontend & backend fallback)
    /frontend.php         # Frontend-specific PHP template
    /Component.vue        # Vue component for editor
    /preview.vue          # Vue preview component
    /styles.css          # Component-specific styles
```

### Template Variables
Both PHP and Vue templates receive the same data structure:

```php
// PHP
$props = [
    'title' => '...',
    'content' => '...',
    'settings' => [...],
    // Component-specific props
];

// Vue
props: {
    title: String,
    content: String,
    settings: Object,
    // Component-specific props
}
```

## Data Attributes

### Required Data Attributes
```html
<!-- Sections -->
data-section-id="{unique-id}"
data-section-type="{full_width|two_column|three_column}"

<!-- Components -->
data-component-id="{unique-id}"
data-component-type="{component-type}"

<!-- Columns -->
data-column="{1|2|3}"
```

## Responsive Breakpoints

Both frontend and backend must use identical breakpoints:

```css
/* Desktop First */
@media (max-width: 1280px) { /* xl */ }
@media (max-width: 1024px) { /* lg */ }
@media (max-width: 768px)  { /* md */ }
@media (max-width: 640px)  { /* sm */ }
@media (max-width: 480px)  { /* xs */ }
```

## Animation Classes

Consistent animation behavior:

```css
/* Initial state */
.gmkb-animate {
    opacity: 0;
    transform: translateY(20px);
}

/* Visible state */
.gmkb-animate--visible {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* Fade variations */
.gmkb-animate--fade { /* fade in */ }
.gmkb-animate--slide { /* slide up */ }
.gmkb-animate--scale { /* scale in */ }
```

## JavaScript Integration

### Frontend (Minimal JS)
```javascript
// Intersection Observer for animations
// Smooth scrolling
// Print functionality
// Analytics tracking
```

### Backend (Vue App)
```javascript
// Full Vue 3 application
// Vuex/Pinia for state
// Component drag-drop
// Real-time preview
// AJAX save/load
```

## Testing Checklist

### Visual Consistency
- [ ] Components render identically in preview and frontend
- [ ] Spacing matches between environments
- [ ] Typography is consistent
- [ ] Colors match exactly
- [ ] Responsive behavior is identical

### Functional Consistency
- [ ] Animations trigger at same points
- [ ] Links work correctly
- [ ] Images load properly
- [ ] Videos play correctly
- [ ] Social links open correctly

### Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Deployment Notes

### Files to Deploy for Consistency
1. `/templates/mediakit-frontend-template.php` - Main frontend template
2. `/design-system/index.css` - Core styles
3. `/components/*/template.php` - Component templates
4. `/includes/class-gmkb-frontend-display.php` - Frontend renderer

### Cache Clearing
After deployment, clear:
1. WordPress transients
2. CDN cache
3. Browser cache
4. Plugin cache

## Future Considerations

### Potential Vue Frontend
If full consistency becomes critical:
1. Create `frontend-vue-display.php`
2. Load Vue in read-only mode
3. Use same components as editor
4. Consider SSR for SEO

### Progressive Enhancement
1. PHP renders initial HTML
2. Vue hydrates for interactivity
3. Best of both worlds