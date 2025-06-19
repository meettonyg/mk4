# Media Kit Builder - Component Development Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Component Architecture](#component-architecture)
3. [Creating Your First Component](#creating-your-first-component)
4. [Schema Reference](#schema-reference)
5. [Data Binding System](#data-binding-system)
6. [Common Patterns](#common-patterns)
7. [WordPress Integration](#wordpress-integration)
8. [Performance Best Practices](#performance-best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Quick Reference](#quick-reference)

---

## Introduction

The Media Kit Builder uses a **schema-driven component system** where components are self-contained modules defined by JSON schemas. This approach provides:

- 🚀 **Automatic UI generation** - Design panels are created from schemas
- 🔄 **Real-time data binding** - Changes instantly reflect in preview
- 💾 **Automatic state management** - No manual state handling needed
- 🎨 **Consistent styling** - Shared design system across all components
- ⚡ **Optimized performance** - Built-in caching and efficient rendering

### Prerequisites

- Basic knowledge of PHP and JavaScript
- Understanding of JSON structure
- Familiarity with WordPress development (helpful but not required)

---

## Component Architecture

Each component consists of three core files:

```
components/
└── your-component/
    ├── component.json    # Schema definition (required)
    ├── template.php     # HTML template (required)
    └── script.js        # Custom JavaScript (optional)
```

### How Components Work

1. **Schema Definition** (`component.json`) defines the component's metadata and settings
2. **Data Binding Engine** automatically creates the design panel from the schema
3. **State Manager** handles all data updates and persistence
4. **Component Renderer** updates the preview based on state changes
5. **Template** renders the initial HTML with PHP variables

---

## Creating Your First Component

Let's create a **Feature List** component step by step.

### Step 1: Create Component Directory

```bash
mkdir components/feature-list
```

### Step 2: Define the Schema (`component.json`)

```json
{
  "name": "Feature List",
  "category": "content",
  "icon": "list.svg",
  "description": "Showcase your key features or services",
  "isPremium": false,
  "version": "1.0.0",
  "order": 10,
  "settings": {
    "title": {
      "type": "text",
      "label": "Section Title",
      "default": "Key Features",
      "placeholder": "Enter section title",
      "previewSelector": ".feature-list__title",
      "updateMethod": "textContent",
      "section": "content"
    },
    "subtitle": {
      "type": "textarea",
      "label": "Section Description",
      "default": "What makes you unique",
      "rows": 2,
      "previewSelector": ".feature-list__subtitle",
      "updateMethod": "textContent",
      "section": "content"
    },
    "layout": {
      "type": "select",
      "label": "Layout Style",
      "default": "grid",
      "options": [
        {"value": "grid", "label": "Grid Layout"},
        {"value": "list", "label": "List Layout"},
        {"value": "cards", "label": "Card Layout"}
      ],
      "previewSelector": ".feature-list",
      "updateMethod": "class",
      "classPrefix": "layout-",
      "section": "appearance"
    },
    "columns": {
      "type": "range",
      "label": "Columns",
      "default": 3,
      "min": 1,
      "max": 4,
      "step": 1,
      "previewSelector": ".feature-list__grid",
      "updateMethod": "style.gridTemplateColumns",
      "transform": "value => `repeat(${value}, 1fr)`",
      "section": "appearance"
    },
    "icon_style": {
      "type": "select",
      "label": "Icon Style",
      "default": "circle",
      "options": [
        {"value": "circle", "label": "Circle"},
        {"value": "square", "label": "Square"},
        {"value": "none", "label": "No Background"}
      ],
      "previewSelector": ".feature-icon",
      "updateMethod": "class",
      "classPrefix": "icon-style-",
      "section": "appearance"
    },
    "primary_color": {
      "type": "color",
      "label": "Primary Color",
      "default": "#3b82f6",
      "previewSelector": ".feature-list",
      "updateMethod": "style.setProperty",
      "propertyName": "--primary-color",
      "section": "appearance"
    }
  },
  "sections": {
    "content": {
      "title": "Content",
      "order": 1
    },
    "appearance": {
      "title": "Appearance",
      "order": 2
    }
  }
}
```

### Step 3: Create the Template (`template.php`)

```php
<?php
/**
 * Feature List Component Template
 */

// Default values
$title = $title ?? 'Key Features';
$subtitle = $subtitle ?? 'What makes you unique';
$layout = $layout ?? 'grid';
$columns = $columns ?? 3;
$icon_style = $icon_style ?? 'circle';
$primary_color = $primary_color ?? '#3b82f6';

// Sample features (in production, these would come from component data)
$features = [
    [
        'icon' => '🚀',
        'title' => 'Fast Performance',
        'description' => 'Lightning-fast load times for better user experience'
    ],
    [
        'icon' => '🔒',
        'title' => 'Secure & Reliable',
        'description' => 'Built with security best practices in mind'
    ],
    [
        'icon' => '📱',
        'title' => 'Mobile Responsive',
        'description' => 'Looks great on all devices and screen sizes'
    ]
];
?>

<div class="feature-list editable-element layout-<?php echo esc_attr($layout); ?>" 
     data-element="feature-list" 
     data-component="feature-list" 
     data-component-id="<?php echo esc_attr($componentId); ?>" 
     data-component-type="feature-list"
     style="--primary-color: <?php echo esc_attr($primary_color); ?>">
    
    <div class="element-controls">
        <button class="control-btn" title="Move Up">↑</button>
        <button class="control-btn" title="Move Down">↓</button>
        <button class="control-btn" title="Duplicate">⧉</button>
        <button class="control-btn" title="Delete">×</button>
    </div>
    
    <div class="feature-list__header">
        <h2 class="feature-list__title" contenteditable="true" data-setting="title">
            <?php echo esc_html($title); ?>
        </h2>
        <p class="feature-list__subtitle" contenteditable="true" data-setting="subtitle">
            <?php echo esc_html($subtitle); ?>
        </p>
    </div>
    
    <div class="feature-list__grid" style="grid-template-columns: repeat(<?php echo esc_attr($columns); ?>, 1fr)">
        <?php foreach ($features as $index => $feature): ?>
        <div class="feature-item" data-feature-index="<?php echo $index; ?>">
            <div class="feature-icon icon-style-<?php echo esc_attr($icon_style); ?>">
                <span class="feature-icon__emoji"><?php echo esc_html($feature['icon']); ?></span>
            </div>
            <h3 class="feature-item__title" contenteditable="true" data-setting="feature_<?php echo $index; ?>_title">
                <?php echo esc_html($feature['title']); ?>
            </h3>
            <p class="feature-item__description" contenteditable="true" data-setting="feature_<?php echo $index; ?>_desc">
                <?php echo esc_html($feature['description']); ?>
            </p>
        </div>
        <?php endforeach; ?>
    </div>
    
    <div class="feature-list__actions">
        <button class="add-feature-btn">+ Add Feature</button>
    </div>
</div>

<style>
/* Component-specific styles */
.feature-list {
    padding: 3rem 0;
}

.feature-list__header {
    text-align: center;
    margin-bottom: 3rem;
}

.feature-list__title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

.feature-list__subtitle {
    font-size: 1.125rem;
    color: #6b7280;
}

.feature-list__grid {
    display: grid;
    gap: 2rem;
}

.feature-item {
    text-align: center;
    padding: 1.5rem;
}

.feature-icon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    background: var(--primary-color, #3b82f6);
    color: white;
    font-size: 2rem;
}

.feature-icon.icon-style-circle {
    border-radius: 50%;
}

.feature-icon.icon-style-square {
    border-radius: 0.5rem;
}

.feature-icon.icon-style-none {
    background: none;
    color: var(--primary-color, #3b82f6);
}

.feature-item__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.feature-item__description {
    color: #6b7280;
    line-height: 1.6;
}

/* Layout variations */
.layout-list .feature-list__grid {
    grid-template-columns: 1fr;
}

.layout-list .feature-item {
    display: flex;
    align-items: flex-start;
    text-align: left;
}

.layout-list .feature-icon {
    margin: 0 1rem 0 0;
    flex-shrink: 0;
}

.layout-cards .feature-item {
    background: #f9fafb;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.feature-list__actions {
    text-align: center;
    margin-top: 2rem;
}

.add-feature-btn {
    background: var(--primary-color, #3b82f6);
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
}

.add-feature-btn:hover {
    opacity: 0.9;
}
</style>
```

### Step 4: Add Custom JavaScript (Optional)

Create `script.js` for dynamic feature management:

```javascript
/**
 * Feature List Component Script
 * Handles dynamic feature addition/removal
 */

(function() {
    // Component initialization
    document.addEventListener('DOMContentLoaded', function() {
        initializeFeatureLists();
    });
    
    function initializeFeatureLists() {
        const featureLists = document.querySelectorAll('[data-component-type="feature-list"]');
        
        featureLists.forEach(component => {
            if (component.dataset.initialized) return;
            
            const addBtn = component.querySelector('.add-feature-btn');
            if (addBtn) {
                addBtn.addEventListener('click', () => addFeature(component));
            }
            
            component.dataset.initialized = 'true';
        });
    }
    
    function addFeature(component) {
        const grid = component.querySelector('.feature-list__grid');
        const featureCount = grid.querySelectorAll('.feature-item').length;
        const componentId = component.dataset.componentId;
        
        // Create new feature element
        const newFeature = document.createElement('div');
        newFeature.className = 'feature-item';
        newFeature.dataset.featureIndex = featureCount;
        newFeature.innerHTML = `
            <div class="feature-icon">
                <span class="feature-icon__emoji">✨</span>
            </div>
            <h3 class="feature-item__title" contenteditable="true" 
                data-setting="feature_${featureCount}_title">New Feature</h3>
            <p class="feature-item__description" contenteditable="true" 
                data-setting="feature_${featureCount}_desc">Describe this feature</p>
            <button class="remove-feature-btn" title="Remove">×</button>
        `;
        
        grid.appendChild(newFeature);
        
        // Update state
        if (window.stateManager) {
            window.stateManager.updateComponent(componentId, `feature_${featureCount}_title`, 'New Feature');
            window.stateManager.updateComponent(componentId, `feature_${featureCount}_desc`, 'Describe this feature');
        }
        
        // Re-bind data binding for new elements
        if (window.dataBindingEngine) {
            const panel = document.querySelector(`[data-component-id="${componentId}"]`);
            window.dataBindingEngine.bindDesignPanel(panel, componentId);
        }
    }
    
    // Re-initialize when new components are added
    if (window.componentRenderer) {
        window.componentRenderer.on('component-rendered', initializeFeatureLists);
    }
})();
```

---

## Schema Reference

### Basic Field Types

| Type | Description | Properties | Example |
|------|-------------|------------|---------|
| `text` | Single line text input | `label`, `default`, `placeholder` | Component title |
| `textarea` | Multi-line text input | `label`, `default`, `rows`, `placeholder` | Description |
| `select` | Dropdown selection | `label`, `default`, `options` | Layout style |
| `color` | Color picker | `label`, `default` | Theme color |
| `checkbox` | Boolean toggle | `label`, `default` | Show/hide element |
| `image` | Media library integration | `label`, `default`, `helpText` | Background image |
| `number` | Numeric input | `label`, `default`, `min`, `max`, `step` | Item count |
| `range` | Slider input | `label`, `default`, `min`, `max`, `step` | Column width |

### Schema Properties

#### Required Properties

```json
{
  "name": "Component Name",        // Display name
  "category": "content",           // Component category
  "icon": "icon.svg",             // Icon filename
  "description": "Brief description"
}
```

#### Optional Properties

```json
{
  "isPremium": false,             // Premium component flag
  "version": "1.0.0",             // Component version
  "order": 10,                    // Display order in library
  "dependencies": ["jquery"],      // Script dependencies
  "sections": {                   // Group settings into sections
    "content": {
      "title": "Content Settings",
      "order": 1
    }
  }
}
```

### Update Methods

The `updateMethod` property determines how preview updates are applied:

| Method | Description | Example |
|--------|-------------|---------|
| `textContent` | Updates element text | Titles, descriptions |
| `innerHTML` | Updates HTML content | Rich text areas |
| `src` | Updates image source | Image components |
| `href` | Updates link href | Call-to-action buttons |
| `class` | Manages CSS classes | Layout variations |
| `visibility` | Shows/hides elements | Toggle features |
| `style.property` | Updates inline styles | Colors, dimensions |
| `data-attribute` | Updates data attributes | Custom attributes |

### Advanced Features

#### Class Prefix Management

```json
{
  "updateMethod": "class",
  "classPrefix": "layout-",
  "options": [
    {"value": "grid", "label": "Grid"},
    {"value": "list", "label": "List"}
  ]
}
```

#### Value Transformation

```json
{
  "updateMethod": "style.gridTemplateColumns",
  "transform": "value => `repeat(${value}, 1fr)`"
}
```

#### Conditional Visibility

```json
{
  "showIf": {
    "field": "layout",
    "value": "grid"
  }
}
```

---

## Data Binding System

The Data Binding Engine automatically connects design panel inputs to preview elements.

### How It Works

1. **Schema Processing**: The engine reads your `component.json`
2. **Panel Generation**: Creates form inputs based on settings
3. **Event Binding**: Attaches listeners to inputs
4. **State Updates**: Changes flow through the State Manager
5. **Preview Updates**: DOM updates based on `updateMethod`

### Manual Binding

For custom functionality, you can manually bind elements:

```javascript
// Get the data binding engine
const { dataBindingEngine } = window;

// Bind a custom input
const customInput = document.querySelector('#custom-input');
customInput.addEventListener('input', (e) => {
    stateManager.updateComponent(componentId, 'customSetting', e.target.value);
});

// Subscribe to state changes
stateManager.subscribe(componentId, (state) => {
    // Update preview based on state
    updateCustomPreview(state.customSetting);
});
```

---

## Common Patterns

### 1. Repeatable Items Pattern

For components with dynamic lists (like testimonials, features):

```php
<?php
// In template.php
$items = $items ?? [
    ['title' => 'Item 1', 'content' => 'Description'],
    ['title' => 'Item 2', 'content' => 'Description']
];
?>

<div class="items-container">
    <?php foreach ($items as $index => $item): ?>
    <div class="item" data-index="<?php echo $index; ?>">
        <h3 contenteditable="true" data-setting="item_<?php echo $index; ?>_title">
            <?php echo esc_html($item['title']); ?>
        </h3>
    </div>
    <?php endforeach; ?>
</div>
```

### 2. Media Integration Pattern

For WordPress media library integration:

```json
{
  "background_image": {
    "type": "image",
    "label": "Background Image",
    "default": "",
    "previewSelector": ".component-wrapper",
    "updateMethod": "style.backgroundImage",
    "transform": "url => `url(${url})`"
  }
}
```

### 3. Responsive Settings Pattern

For responsive design options:

```json
{
  "mobile_columns": {
    "type": "select",
    "label": "Mobile Columns",
    "default": "1",
    "options": [
      {"value": "1", "label": "1 Column"},
      {"value": "2", "label": "2 Columns"}
    ],
    "previewSelector": ".grid",
    "updateMethod": "data-mobile-columns"
  }
}
```

### 4. Color Scheme Pattern

For consistent theming:

```json
{
  "color_scheme": {
    "type": "select",
    "label": "Color Scheme",
    "default": "light",
    "options": [
      {"value": "light", "label": "Light"},
      {"value": "dark", "label": "Dark"},
      {"value": "custom", "label": "Custom"}
    ],
    "previewSelector": ".component",
    "updateMethod": "class",
    "classPrefix": "theme-"
  }
}
```

---

## WordPress Integration

### Using WordPress Media Library

The Media Kit Builder automatically integrates with WordPress media library for image fields:

```javascript
// Triggered automatically for type: "image" fields
jQuery(document).on('click', '.upload-btn', function(e) {
    e.preventDefault();
    
    const button = jQuery(this);
    const settingKey = button.closest('[data-setting]').data('setting');
    
    // WordPress media frame
    const frame = wp.media({
        title: 'Select Image',
        button: { text: 'Use this image' },
        multiple: false
    });
    
    frame.on('select', function() {
        const attachment = frame.state().get('selection').first().toJSON();
        
        // Update state with image URL
        stateManager.updateComponent(componentId, settingKey, attachment.url);
    });
    
    frame.open();
});
```

### Using WordPress APIs

Access WordPress data in your components:

```php
<?php
// In template.php

// Get current user
$current_user = wp_get_current_user();

// Get posts for a dropdown
$posts = get_posts([
    'post_type' => 'post',
    'posts_per_page' => 10
]);

// Use WordPress functions
$formatted_date = date_i18n(get_option('date_format'), time());
?>
```

---

## Performance Best Practices

### 1. Use Template Caching

Components are automatically cached after first load:

```javascript
// The system handles this automatically
// Cache key: componentType-pluginVersion
// Cache invalidates on plugin update
```

### 2. Optimize Rendering

```javascript
// Use batch updates for multiple changes
stateManager.batchUpdate(() => {
    stateManager.updateComponent(id, 'setting1', value1);
    stateManager.updateComponent(id, 'setting2', value2);
    stateManager.updateComponent(id, 'setting3', value3);
}); // Single render triggered
```

### 3. Lazy Load Heavy Components

```json
{
  "lazyLoad": true,
  "loadPriority": "low",
  "placeholder": "<div class='component-loading'>Loading...</div>"
}
```

### 4. Minimize DOM Queries

```javascript
// Cache selectors
const elements = {
    title: component.querySelector('.title'),
    content: component.querySelector('.content')
};

// Reuse cached elements
elements.title.textContent = newTitle;
elements.content.innerHTML = newContent;
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Component Not Appearing in Library

**Problem**: Your new component doesn't show up in the component library.

**Solutions**:
- Check file structure: `components/your-component/component.json`
- Validate JSON syntax: Use a JSON validator
- Check for PHP errors in `template.php`
- Clear browser cache and reload

#### 2. Schema Validation Warnings

**Problem**: Console shows schema validation warnings.

**Solutions**:
```javascript
// Check console for specific warnings
[Schema Validation] Component feature-list: Missing required field: name

// Ensure all required fields are present
{
  "name": "Feature List",      // Required
  "category": "content",        // Required
  "icon": "list.svg",          // Required
  "description": "..."          // Required
}
```

#### 3. Preview Not Updating

**Problem**: Changes in design panel don't reflect in preview.

**Solutions**:
- Verify `previewSelector` matches your HTML
- Check `updateMethod` is correct
- Ensure `data-setting` attributes match schema keys
- Check browser console for errors

#### 4. State Not Persisting

**Problem**: Component data is lost on page reload.

**Solutions**:
```javascript
// Ensure state manager is notified of changes
stateManager.updateComponent(componentId, settingKey, value);

// For contenteditable elements, save on blur
element.addEventListener('blur', () => {
    const value = element.textContent;
    stateManager.updateComponent(componentId, settingKey, value);
});
```

#### 5. Performance Issues

**Problem**: Component operations are slow.

**Solutions**:
```javascript
// Use performance monitor to identify bottlenecks
window.mkPerf.report();

// Common optimizations:
// 1. Batch state updates
// 2. Debounce input handlers
// 3. Use event delegation
// 4. Minimize DOM manipulations
```

### Debug Tools

#### Console Commands

```javascript
// Check component state
stateManager.getComponentData('component-id-here');

// Validate schema
mkSchema.validate('feature-list');

// Performance report
mkPerf.report();

// Debug mode
localStorage.setItem('mk_debug', 'true');
```

#### Visual Debugging

```css
/* Add to your CSS for visual debugging */
.debug-mode [data-component] {
    outline: 2px solid red;
}

.debug-mode [data-setting] {
    outline: 1px solid blue;
}
```

---

## Quick Reference

### Essential Methods

```javascript
// State Management
stateManager.updateComponent(componentId, key, value);
stateManager.getComponentData(componentId);
stateManager.batchUpdate(callback);

// Data Binding
dataBindingEngine.initializeComponent(componentId, type, schema);
dataBindingEngine.bindDesignPanel(panel, componentId);

// Component Rendering
componentRenderer.renderComponent(componentId);
componentRenderer.batchAdd(components);

// Performance Monitoring
mkPerf.track('operation-name', duration);
mkPerf.report();
```

### File Structure Template

```
components/
└── your-component/
    ├── component.json    # Required: Schema definition
    ├── template.php     # Required: HTML template
    ├── script.js        # Optional: Custom JavaScript
    ├── styles.css       # Optional: Component styles
    └── icon.svg         # Optional: Custom icon
```

### Schema Template

```json
{
  "name": "Component Name",
  "category": "content|essential|media|social",
  "icon": "icon.svg",
  "description": "Brief description",
  "isPremium": false,
  "version": "1.0.0",
  "settings": {
    "setting_key": {
      "type": "text|textarea|select|color|checkbox|image|number|range",
      "label": "Setting Label",
      "default": "Default Value",
      "previewSelector": ".css-selector",
      "updateMethod": "textContent|innerHTML|class|style.property",
      "section": "section_key"
    }
  },
  "sections": {
    "section_key": {
      "title": "Section Title",
      "order": 1
    }
  }
}
```

### Naming Conventions

- **Component directory**: `kebab-case` (e.g., `feature-list`)
- **Schema keys**: `snake_case` (e.g., `background_color`)
- **CSS classes**: `BEM notation` (e.g., `feature-list__title`)
- **JavaScript variables**: `camelCase` (e.g., `componentId`)
- **PHP variables**: `snake_case` (e.g., `$component_data`)

---

## Conclusion

Creating components for the Media Kit Builder is straightforward thanks to the schema-driven architecture. Focus on defining a clear schema, and the system handles the rest - from UI generation to state management and real-time updates.

For more examples, explore the existing components in the `components/` directory. Each demonstrates different patterns and capabilities of the system.

Happy component building! 🚀