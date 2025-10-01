# Schema Validation System

## Overview

The Media Kit Builder now includes a non-breaking schema validation system that helps ensure component schemas follow best practices and maintain consistency. The system validates schemas when they are loaded but does not block functionality - it only provides warnings and suggestions.

## Features

- **Non-blocking validation**: Issues are logged as warnings, not errors
- **Performance optimized**: <10ms validation with caching
- **Three severity levels**: ERROR, WARNING, INFO
- **Developer-friendly**: Clear messages with actionable suggestions
- **Console utilities**: Easy debugging with `mkSchema` commands

## Schema Structure

A valid component schema should follow this structure:

```json
{
  "name": "Component Name",           // Required
  "category": "essential",            // Required (essential|content|media|social|premium|advanced)
  "version": "1.0.0",                // Recommended (semantic versioning)
  "description": "Brief description", // Recommended
  "icon": "icon-name.svg",           // Recommended
  "order": 1,                        // Recommended for sorting
  "isPremium": false,                // Optional
  "dependencies": [],                // Optional array
  
  "settings": {
    "field_name": {
      "type": "text",              // Required (text|textarea|number|checkbox|select|image|color|radio|range)
      "label": "Field Label",      // Recommended
      "default": "Default value",  // Recommended
      "previewSelector": ".class", // Required if updateMethod is used
      "updateMethod": "textContent", // Optional (textContent|innerHTML|src|href|class|visibility|style|attribute)
      "section": "general",        // Optional section grouping
      "helpText": "Help text",     // Recommended for complex fields
      
      // Type-specific fields
      "options": [],               // Required for select/radio
      "min": 0,                   // Optional for number/range
      "max": 100,                 // Optional for number/range
      "rows": 3,                  // Recommended for textarea
      "placeholder": "..."        // Optional for text fields
    }
  },
  
  "sections": {                    // Optional, for grouping settings
    "general": {
      "title": "General Settings",
      "order": 1
    }
  }
}
```

## Validation Rules

### Required Fields (ERROR level)
- `name`: Component display name
- `category`: Component category
- `settings[*].type`: Each setting must have a valid type

### Recommended Fields (WARNING level)
- `version`: Semantic version number
- `settings[*].label`: UI label for each setting
- `settings[*].default`: Default value for each setting

### Best Practices (INFO level)
- `description`: Helps users understand the component
- `icon`: Improves component library UX
- `order`: Controls component sorting
- `settings[*].helpText`: Provides guidance for complex fields

## Console Commands

The validation system provides these console utilities:

```javascript
// Show validation summary for all schemas
mkSchema.summary()

// Validate a specific component
mkSchema.validate('hero')

// Validate all registered components
mkSchema.validateAll()

// Show detailed issues for a component
mkSchema.issues('hero')

// Clear validation cache
mkSchema.clearCache()

// Show help
mkSchema.help()
```

## Example Usage

### Check a specific component:
```javascript
// Validate hero component
await mkSchema.validate('hero');

// Show detailed issues
mkSchema.issues('hero');
```

### Validate all components:
```javascript
// Run full validation
await mkSchema.validateAll();

// Show summary
mkSchema.summary();
```

### Example Output:
```
📋 Schema Validation: biography - 1 warning, 3 suggestions in biography component schema
  ⚠️ WARNINGS (1)
    version: Version field is recommended for tracking
    💡 Add "version" field to component.json
    
  ℹ️ INFOS (3)
    description: Description helps users understand the component
    💡 Add description field to improve component documentation
```

## Performance

- Validation runs asynchronously to avoid blocking
- Results are cached for repeated validations
- Target performance: <10ms per validation
- Cache can be cleared with `mkSchema.clearCache()`

## Future: Strict Mode

The system is prepared for a future strict mode that would:
- Block component loading on schema errors
- Enforce data type constraints
- Require all recommended fields

Currently, strict mode shows a warning that it's not yet implemented.

## Testing

Run the test script to verify the system is working:

```javascript
// Load test script in console
import('./js/tests/test-schema-validation.js')
```

This will run automated tests and show results.

## Troubleshooting

### No validation output
- Check if schemas are being loaded from PHP (`guestifyData.componentSchemas`)
- Verify component type matches directory name
- Use `mkSchema.validateAll()` to check all components

### Performance issues
- Clear cache with `mkSchema.clearCache()`
- Check for very large schemas
- Validation should be <10ms per component

### Missing schemas
- Some components may not have schemas (normal)
- Only components with `component.json` files are validated