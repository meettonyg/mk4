# Component Data Integration Pattern

## Overview
Each component that needs to load data from the database (Pods fields, post meta, etc.) should have a `data-integration.php` file in its component folder. This follows the self-contained component architecture where each component handles its own data operations.

## File Structure
```
components/
├── biography/
│   ├── component.json         # Component configuration (set requiresServerRender: true)
│   ├── data-integration.php   # Data loading/saving logic
│   ├── template.php          # Component template
│   └── script.js            # Component JavaScript
├── topics/
│   ├── component.json
│   ├── data-integration.php
│   └── ...
└── data-integration-template.php  # Template file to copy
```

## How It Works

1. **Component Configuration**: Add `"requiresServerRender": true` to your `component.json`
2. **Data Integration**: Create `data-integration.php` in your component folder
3. **Class Naming**: Use pattern `{ComponentName}_Data_Integration`
4. **AJAX Handler**: Generic handler automatically loads your data integration file
5. **Template Rendering**: Your component template receives the prepared data

## Creating a Data Integration File

1. Copy `components/data-integration-template.php` to your component folder
2. Rename it to `data-integration.php`
3. Update the class name following the convention:
   - `Biography_Data_Integration` for biography component
   - `Topics_Data_Integration` for topics component
   - `Social_Links_Data_Integration` for social-links component
   - `Call_To_Action_Data_Integration` for call-to-action component

4. Update the field mappings to match your component's data structure
5. Implement the required methods:
   - `load_component_data($post_id)` - Load data from database
   - `prepare_template_props($component_data, $existing_props)` - Format data for template

## Example: Biography Component

```php
class Biography_Data_Integration {
    protected static $field_mappings = array(
        'short' => 'biography_short',    // Maps to Pods field
        'medium' => 'biography_medium',  // Maps to Pods field
        'long' => 'biography_long',      // Maps to Pods field
    );
    
    public static function load_component_data($post_id) {
        // Load biography data from Pods fields
    }
    
    public static function prepare_template_props($component_data, $existing_props) {
        // Prepare data for biography template
    }
}
```

## Benefits

✅ **Self-Contained**: All data logic stays within the component folder  
✅ **Reusable Pattern**: Same pattern works for all components  
✅ **Generic AJAX**: The AJAX handler doesn't need to know about specific components  
✅ **Easy to Maintain**: Each component manages its own data independently  
✅ **Checklist Compliant**: Follows all project architecture principles  

## Server-Side Rendering Flow

1. Component is added to Media Kit Builder
2. Renderer checks `requiresServerRender` flag in component.json
3. If true, AJAX request is made to load component data
4. AJAX handler loads `components/{type}/data-integration.php`
5. Calls `load_component_data()` to get data from database
6. Calls `prepare_template_props()` to format data
7. Renders component template with the data
8. Returns HTML to frontend

## Checklist Compliance

This pattern ensures:
- **No Polling**: Event-driven data loading
- **Root Cause Fix**: Components get data when they need it
- **Self-Contained**: Each component handles its own data
- **Generic Systems**: AJAX handler works for any component
- **Code Reduction**: Reusable pattern reduces duplication
