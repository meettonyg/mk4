# Media Kit Builder - Component Architecture Documentation

## Self-Contained Component System

The Media Kit Builder uses a self-contained component architecture where each component is a complete, independent module with all its necessary files in one directory.

## Directory Structure

```
components/
├── [component-name]/
│   ├── component.json       # Component manifest (metadata & configuration)
│   ├── [Name]Renderer.vue   # Vue.js renderer
│   ├── template.php         # PHP template for SSR
│   ├── renderer.js          # Legacy JavaScript renderer
│   ├── schema.json          # Data schema & configuration
│   ├── styles.css           # Component-specific styles
│   ├── script.js            # Component behavior (optional)
│   └── README.md            # Component documentation (optional)
```

## Component Manifest (component.json)

Each component must have a `component.json` manifest file that describes the component:

```json
{
  "type": "hero",
  "name": "Hero",
  "description": "Hero section with headline and call-to-action",
  "category": "content",
  "version": "1.0.0",
  "renderers": {
    "php": "template.php",
    "javascript": "renderer.js",
    "vue": "HeroRenderer.vue"
  },
  "styles": "styles.css",
  "schema": "schema.json",
  "supports": {
    "serverRender": true,
    "vueRender": true,
    "inlineEdit": true,
    "designPanel": true
  }
}
```

### Manifest Fields

- **type**: Unique identifier for the component (lowercase, hyphenated)
- **name**: Display name for the component
- **description**: Brief description of the component's purpose
- **category**: Component category for grouping
  - `content`: Content-focused components
  - `media`: Media components (video, audio, gallery)
  - `social`: Social media components
  - `social-proof`: Testimonials, logos, statistics
  - `conversion`: CTAs, forms, booking
  - `contact`: Contact information and forms
- **version**: Component version (semver format)
- **renderers**: Available rendering methods
- **styles**: CSS file for component styling
- **schema**: Data schema file
- **supports**: Feature support flags

## Vue Renderer Structure

Each Vue renderer should follow this structure:

```vue
<template>
  <div class="gmkb-[component]-component" :data-component-id="componentId">
    <!-- Component HTML -->
  </div>
</template>

<script>
export default {
  name: '[Component]Renderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  // Component logic
}
</script>

<style scoped>
/* Use CSS variables for theming */
.gmkb-[component]-component {
  padding: var(--gmkb-spacing-md, 2rem);
  background: var(--gmkb-color-surface, #fff);
}
</style>
```

## Component Discovery

The PHP `ComponentDiscovery` class automatically discovers components by:

1. Scanning the `components/` directory
2. Reading `component.json` manifests
3. Registering components with their capabilities
4. Exporting data for JavaScript consumption

```php
$discovery = new ComponentDiscovery();
$components = $discovery->get_components();
```

## Adding a New Component

1. **Create component directory**: `components/my-component/`

2. **Create component.json**:
```json
{
  "type": "my-component",
  "name": "My Component",
  "description": "Description here",
  "category": "content",
  "version": "1.0.0",
  "renderers": {
    "vue": "MyComponentRenderer.vue",
    "php": "template.php"
  },
  "supports": {
    "vueRender": true,
    "serverRender": true
  }
}
```

3. **Create Vue renderer**: `MyComponentRenderer.vue`

4. **Create PHP template**: `template.php` (optional)

5. **Create schema**: `schema.json` (optional)

The component will be automatically discovered and available in the builder.

## Component Categories

- **content**: Hero, Biography, Topics, Questions, Guest Intro
- **media**: Video, Photo Gallery, Podcast Player
- **social**: Social Media Links
- **social-proof**: Testimonials, Statistics, Authority Hook, Logo Grid
- **conversion**: Call-to-Action, Booking Calendar
- **contact**: Contact Information

## Build Process

The Vite build process:

1. Scans component directories for Vue files
2. Bundles Vue renderers with the main application
3. Supports hot module replacement in development
4. Optimizes for production deployment

## Theme Support

Components use CSS variables for theming:

```css
/* Component styles use theme variables */
.component {
  color: var(--gmkb-color-text, #333);
  background: var(--gmkb-color-surface, #fff);
  padding: var(--gmkb-spacing-md, 2rem);
  border-radius: var(--gmkb-border-radius, 8px);
}
```

## Migration Status

### ✅ Completed Components (with Vue renderers)
1. hero
2. biography
3. topics
4. contact
5. social

### ⏳ Components with Manifests (renderers pending migration)
6. testimonials
7. call-to-action
8. questions
9. stats
10. video-intro
11. photo-gallery
12. podcast-player
13. booking-calendar
14. authority-hook
15. guest-intro
16. logo-grid

## Best Practices

1. **Keep components self-contained**: All files in one directory
2. **Use semantic naming**: Clear, descriptive component names
3. **Follow schema structure**: Consistent data structure
4. **Support multiple renderers**: PHP for SSR, Vue for interactivity
5. **Use CSS variables**: Enable theming support
6. **Document components**: Include README for complex components
7. **Version components**: Track changes with semantic versioning
8. **Test components**: Include test files when applicable

## Troubleshooting

### Component not appearing
- Check `component.json` exists and is valid JSON
- Verify component type is unique
- Clear WordPress transients: `delete_transient('gmkb_discovered_components_v2')`

### Vue renderer not loading
- Ensure Vue file is referenced in component.json
- Check file name matches manifest
- Verify build process includes component directory

### Styles not applying
- Check CSS file is referenced in component.json
- Verify CSS uses proper selectors
- Ensure theme variables have fallbacks

## Future Enhancements

1. **Component Marketplace**: Install third-party components
2. **Component Versioning**: Handle multiple versions
3. **Component Dependencies**: Manage inter-component dependencies
4. **Component Templates**: Pre-configured component sets
5. **Component Testing**: Automated testing framework
