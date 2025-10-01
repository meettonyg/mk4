# Schema-First Component Architecture

This document outlines the Schema-First approach used in the Media Kit Builder system. This approach ensures that all components have a consistent data structure that can be used for both the editor and front-end rendering.

## Key Principles

1. **Schema as Source of Truth**: All components must have a complete schema that defines their structure and properties
2. **Custom Panels as Enhancement**: Custom design panels provide enhanced editing experiences but don't define the data structure
3. **Schema-Based Serialization**: All component data is serialized based on the schema, not the panel inputs
4. **Front-End Rendering**: The same schema is used for front-end rendering, ensuring consistency

## Component Requirements

### Required Files

Every component must include:

- **component.json**: Defines the component's schema, properties, and behavior
- **template.php**: Defines the component's HTML structure

Optional files:

- **design-panel.php**: Custom UI for editing the component (enhances user experience)
- **panel-script.js**: Custom JavaScript for the design panel (provides interactive editing features)
- **script.js**: Front-end behavior for the component
- **styles.css**: Component styling

### Schema Structure

The component.json file must follow this structure:

```json
{
  "name": "Component Name",
  "description": "Component description",
  "category": "essential",
  "icon": "component-icon.svg",
  "version": "1.0.0",
  "order": 10,
  "sections": {
    "content": {
      "title": "Content",
      "order": 1
    }
  },
  "settings": {
    "property_name": {
      "type": "text",
      "label": "Property Label",
      "default": "Default Value",
      "section": "content",
      "previewSelector": ".element-selector",
      "updateMethod": "textContent"
    }
  }
}
```

## Adding a New Component

1. Create a new directory in the `components` folder with your component name
2. Copy the `component-schema-template.json` to your component directory as `component.json`
3. Modify the schema to match your component's properties
4. Create a `template.php` file for your component's HTML structure
5. Optionally create a `design-panel.php` for custom editing UI

## Custom Design Panels

When creating a custom design panel:

1. Ensure all properties defined in the schema have corresponding inputs in the panel
2. Use the `data-property` attribute on inputs to bind them to schema properties
3. For complex editing features, create a `panel-script.js` file

## Schema-Driven Binding

The data binding engine automatically:

1. Connects form inputs to preview elements based on the schema
2. Updates the preview when inputs change
3. Serializes component data based on the schema
4. Provides a consistent structure for front-end rendering

## Component Serialization

When the media kit is saved:

1. The system collects all component data based on their schemas
2. Each component's data is structured according to its schema
3. The data can be used directly for front-end rendering

## Example

```javascript
// Example component data structure
{
  "id": "hero-123",
  "type": "hero",
  "settings": {
    "title": "Welcome to My Media Kit",
    "subtitle": "Professional Speaker & Author",
    "background_color": "#4f46e5",
    "text_color": "#ffffff"
  }
}
```

This approach ensures that all components have a consistent, predictable data structure that can be used throughout the system.
