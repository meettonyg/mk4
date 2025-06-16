# Quick Start Guide: Schema-Driven Components

## Creating a New Component in 5 Minutes

### 1. Create Component Folder
```
components/my-component/
├── component.json
├── template.php
├── styles.css
└── script.js (optional)
```

### 2. Define Schema (`component.json`)
```json
{
  "name": "My Component",
  "category": "essential",
  "icon": "icon.svg",
  "description": "Component description",
  "version": "1.0.0",
  "settings": {
    "title": {
      "type": "text",
      "label": "Title",
      "default": "Hello World",
      "previewSelector": ".my-title",
      "updateMethod": "textContent"
    },
    "bg_color": {
      "type": "color", 
      "label": "Background Color",
      "default": "#ffffff",
      "previewSelector": ".my-component",
      "updateMethod": "style.backgroundColor"
    }
  }
}
```

### 3. Create Template (`template.php`)
```php
<div class="my-component editable-element" 
     data-component-id="<?php echo $component_id; ?>"
     data-component-type="my-component">
    <h2 class="my-title"><?php echo $title ?? 'Hello World'; ?></h2>
</div>
```

### 4. Add Styles (`styles.css`)
```css
.my-component {
    padding: 40px;
    text-align: center;
    border-radius: 8px;
}

.my-title {
    font-size: 32px;
    margin: 0;
}
```

**That's it!** The design panel is auto-generated, and updates happen automatically.

## Common Schema Patterns

### Text Input with Placeholder
```json
"field_name": {
  "type": "text",
  "label": "Field Label",
  "placeholder": "Enter text...",
  "default": "",
  "previewSelector": ".element",
  "updateMethod": "textContent"
}
```

### Dropdown Selection
```json
"alignment": {
  "type": "select",
  "label": "Text Alignment",
  "default": "center",
  "options": [
    {"value": "left", "label": "Left"},
    {"value": "center", "label": "Center"},
    {"value": "right", "label": "Right"}
  ],
  "previewSelector": ".text-block",
  "updateMethod": "class",
  "classPrefix": "align-"
}
```

### Toggle Visibility
```json
"show_subtitle": {
  "type": "checkbox",
  "label": "Show Subtitle",
  "default": true,
  "previewSelector": ".subtitle",
  "updateMethod": "visibility"
}
```

### Image Upload
```json
"hero_image": {
  "type": "image",
  "label": "Background Image",
  "default": "",
  "previewSelector": ".hero",
  "updateMethod": "style.backgroundImage",
  "transform": "url({value})"
}
```

## Update Methods Reference

| Method | Example | Use Case |
|--------|---------|----------|
| `textContent` | Updates element text | Titles, paragraphs |
| `innerHTML` | Updates HTML content | Rich text areas |
| `src` | Updates image source | Images, videos |
| `href` | Updates link URL | Links, buttons |
| `class` | Manages CSS classes | Style variants |
| `visibility` | Shows/hides element | Toggles |
| `style.*` | Updates CSS property | Colors, sizes |
| `data-*` | Updates data attribute | Custom attributes |

## Tips & Tricks

### 1. Multiple Elements
Update all matching elements:
```json
"previewSelector": ".item-title, .mobile-title"
```

### 2. Class Prefixes
Remove old classes and add new:
```json
"updateMethod": "class",
"classPrefix": "theme-"
// Removes theme-* and adds theme-[value]
```

### 3. Value Transformation
Transform value before applying:
```json
"transform": "function(v) { return v.toUpperCase(); }"
```

### 4. Grouped Settings
Organize with sections:
```json
"sections": {
  "content": {"title": "Content", "order": 1},
  "style": {"title": "Style", "order": 2}
}
```

### 5. Help Text
Add instructions:
```json
"helpText": "Recommended size: 1200x600px"
```

## Debugging

### Console Commands
```javascript
// View current state
gmkbDebug.getState()

// Get component data
gmkbDebug.stateManager.getComponent('component-id')

// Manually update
gmkbDebug.stateManager.updateComponent('id', 'key', 'value')
```

### Common Issues

**Updates not working?**
- Check browser console for errors
- Verify `previewSelector` matches your template
- Ensure `updateMethod` is appropriate

**Design panel not showing?**
- Validate JSON syntax in component.json
- Check file permissions
- Clear browser cache

## Advanced Features

### Custom Design Panel
Still want custom controls? Create `design-panel.php`:
```php
<div class="form-group">
    <label>Custom Control</label>
    <input type="text" data-setting="custom_field">
</div>
```

### Component JavaScript
Need initialization? Use `script.js`:
```javascript
// Runs when component is added
export function init(componentEl) {
    console.log('Component initialized');
}
```

### Dynamic Settings
Coming soon:
- Conditional settings
- Repeatable fields
- Nested components
- Live validation

## Resources

- Full Documentation: `SCHEMA_DRIVEN_SYSTEM.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`
- Demo: Open `demo-schema-driven.html` in browser
- Examples: See Hero and Stats components

Start building components faster with less code!