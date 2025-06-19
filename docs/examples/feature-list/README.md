# Feature List Component Example

This is a complete example of a Media Kit Builder component that demonstrates best practices and common patterns.

## Files

- **component.json** - Schema definition that drives the component
- **template.php** - PHP template for rendering the component
- **script.js** - Optional JavaScript for dynamic functionality

## Features Demonstrated

### Schema Features
- Multiple input types (text, textarea, select, range, color, checkbox)
- Organized settings into sections
- Conditional visibility (`showIf`)
- Value transformation functions
- Repeater field pattern for dynamic items
- Default values and placeholders

### Template Features
- Proper variable extraction with defaults
- Security escaping (esc_html, esc_attr)
- Contenteditable integration
- CSS custom properties for theming
- Responsive design considerations
- Multiple layout variations

### JavaScript Features
- Component initialization pattern
- Event delegation for dynamic elements
- State management integration
- Toast notifications
- Smooth animations
- Focus management

## Installation

To use this component in your Media Kit Builder:

1. Copy the entire `feature-list` directory to `components/feature-list/`
2. The component will automatically appear in the component library
3. Clear any caches if the component doesn't appear

## Customization

### Adding New Settings

Add to the `settings` object in `component.json`:

```json
"new_setting": {
  "type": "text",
  "label": "New Setting",
  "default": "Default Value",
  "previewSelector": ".element-to-update",
  "updateMethod": "textContent",
  "section": "content"
}
```

### Adding New Sections

Add to the `sections` object:

```json
"advanced": {
  "title": "Advanced Settings",
  "order": 4
}
```

### Custom Update Methods

For complex updates, use the `transform` property:

```json
"transform": "value => value.toUpperCase()"
```

## Testing

1. Add the component to a page
2. Verify all settings update the preview correctly
3. Test adding/removing features
4. Check responsive behavior
5. Validate state persistence after page reload

## Common Issues

- **Component not appearing**: Check JSON syntax in component.json
- **Preview not updating**: Verify previewSelector matches HTML
- **State not saving**: Ensure data-setting attributes are correct

## Performance Tips

- Use CSS transforms for animations instead of layout properties
- Debounce rapid updates (handled by the system)
- Minimize DOM queries by caching selectors
- Use event delegation for dynamic elements

## Next Steps

- Study this example to understand the component system
- Copy and modify for your own components
- Refer to the main COMPONENTS.md guide for detailed documentation
