# Schema-Driven Data Binding System

## Overview

The enhanced Guestify Media Kit Builder now features a powerful schema-driven data binding system that automatically connects design panel inputs to preview elements, eliminating the need for custom JavaScript in most cases.

## Key Features

### 1. Schema-Driven Components
Each component now defines its complete settings schema in `component.json`:

```json
{
  "name": "Component Name",
  "settings": {
    "setting_key": {
      "type": "text|select|color|checkbox|etc",
      "label": "Display Label",
      "default": "Default Value",
      "previewSelector": ".css-selector",
      "updateMethod": "textContent|innerHTML|style.property|class|visibility",
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

### 2. Automatic Data Binding
The system automatically:
- Generates design panel UI from schema
- Binds input changes to preview updates
- Manages component state centrally
- Handles undo/redo efficiently

### 3. Centralized State Management
All component data is managed through a Redux-like state manager:

```javascript
// Initialize component
stateManager.initComponent(componentId, componentType, initialData);

// Update component
stateManager.updateComponent(componentId, 'setting_key', value);

// Subscribe to changes
stateManager.subscribe(componentId, (data) => {
  // React to state changes
});
```

## Migration Guide

### Converting Existing Components

1. **Update component.json**
   Add the `settings` and `sections` objects as shown above.

2. **Remove custom JavaScript**
   Most design panels no longer need custom update logic.

3. **Use data attributes**
   Add `data-setting="setting_key"` to inputs in custom design panels.

### Example Migration

**Before:**
```php
// design-panel.php
<input type="text" id="hero-name" value="">
<script>
  document.getElementById('hero-name').addEventListener('input', function() {
    document.querySelector('.hero-name').textContent = this.value;
  });
</script>
```

**After:**
```php
// design-panel.php (optional - can be auto-generated)
<input type="text" data-setting="hero_name" placeholder="Your Name">
// No JavaScript needed!
```

## Component Schema Reference

### Setting Types

#### text
```json
{
  "type": "text",
  "label": "Field Label",
  "placeholder": "Placeholder text",
  "default": "Default value"
}
```

#### textarea
```json
{
  "type": "textarea",
  "label": "Field Label",
  "rows": 3,
  "placeholder": "Placeholder text",
  "default": "Default value"
}
```

#### select
```json
{
  "type": "select",
  "label": "Field Label",
  "default": "option1",
  "options": [
    {"value": "option1", "label": "Option 1"},
    {"value": "option2", "label": "Option 2"}
  ]
}
```

#### color
```json
{
  "type": "color",
  "label": "Color Picker",
  "default": "#3b82f6"
}
```

#### checkbox
```json
{
  "type": "checkbox",
  "label": "Checkbox Label",
  "default": true
}
```

#### image
```json
{
  "type": "image",
  "label": "Image Upload",
  "default": "",
  "helpText": "Recommended: 200x200px"
}
```

#### number
```json
{
  "type": "number",
  "label": "Number Field",
  "default": 0,
  "min": 0,
  "max": 100,
  "step": 1
}
```

#### range
```json
{
  "type": "range",
  "label": "Range Slider",
  "default": 50,
  "min": 0,
  "max": 100,
  "step": 1
}
```

### Update Methods

- **textContent**: Updates element's text content
- **innerHTML**: Updates element's HTML (use carefully)
- **src**: Updates image source
- **href**: Updates link href
- **class**: Manages CSS classes with optional prefix
- **visibility**: Shows/hides element
- **style.property**: Updates any CSS property (e.g., `style.backgroundColor`)
- **data-attribute**: Updates data attributes

### Advanced Features

#### Class Management
```json
{
  "updateMethod": "class",
  "classPrefix": "theme-",
  "previewSelector": ".component"
}
```
This removes all classes starting with `theme-` and adds `theme-[value]`.

#### Custom Transformations
```json
{
  "transform": "function(value) { return value.toUpperCase(); }"
}
```

#### Multiple Selectors
Updates all matching elements:
```json
{
  "previewSelector": ".title, .header-title"
}
```

## API Reference

### Data Binding Engine

```javascript
// Initialize component
dataBindingEngine.initializeComponent(componentId, componentType, schema);

// Bind design panel
dataBindingEngine.bindDesignPanel(panelElement, componentId);

// Generate panel from schema
const html = dataBindingEngine.generateDesignPanel(schema);
```

### State Manager

```javascript
// Component operations
stateManager.initComponent(id, type, data);
stateManager.updateComponent(id, key, value);
stateManager.removeComponent(id);
stateManager.getComponent(id);

// Subscribe to changes
const unsubscribe = stateManager.subscribe(id, callback);
const unsubscribeGlobal = stateManager.subscribeGlobal(callback);

// History
stateManager.undo();
stateManager.redo();

// Persistence
const state = stateManager.getSerializableState();
stateManager.loadSerializedState(state);
```

### Component Manager

```javascript
// Add component
componentManager.addComponent(type, targetId, position);

// Remove component
componentManager.removeComponent(componentId);

// Reorder components
componentManager.reorderComponents([id1, id2, id3]);

// Duplicate component
componentManager.duplicateComponent(sourceId);
```

## Best Practices

1. **Keep schemas complete**: Define all settings in the schema for automatic binding.

2. **Use semantic selectors**: Use classes that describe the content, not the style.

3. **Leverage sections**: Group related settings for better UX.

4. **Set sensible defaults**: Always provide default values.

5. **Add help text**: Use `helpText` for complex settings.

6. **Test update methods**: Ensure the correct update method for each setting type.

## Troubleshooting

### Updates not appearing
- Check `previewSelector` matches elements in template
- Verify `updateMethod` is appropriate for the element
- Ensure `data-setting` attribute matches schema key

### Custom behavior needed
- Create custom design panel with `data-setting` attributes
- Use component lifecycle hooks for complex logic
- Subscribe to state changes for side effects

### Performance issues
- Use specific selectors instead of broad ones
- Batch updates with object syntax
- Limit the number of subscriptions

## Future Enhancements

- Conditional settings based on other values
- Setting groups with repeatable items
- Import/export setting presets
- AI-powered setting suggestions
- Real-time collaboration support