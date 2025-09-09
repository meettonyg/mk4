# Component Template Pattern for Dynamic Data Loading

## The Problem
Components configured with `requiresServerRender: true` may not always receive data through AJAX on initial render. Network issues, timing problems, or other factors can cause the server-side rendering to fail.

## The Solution
Always include a **fallback data loader** in your template.php file that loads data directly from the database if props are empty. This is what makes Topics component work reliably.

## Template Structure

```php
<?php
/**
 * [Component] Template
 * COMPLIANT: Template with direct database fallback
 */

// 1. Extract props and component ID
$finalComponentId = $component_id ?? $componentId ?? '';
$props = $props ?? [];

// 2. Try to get data from props first
$data = $props['data'] ?? null;
$post_id = $props['post_id'] ?? $props['postId'] ?? 0;

// 3. CRITICAL: Fallback to direct database loading
if (empty($data)) {
    // Get post ID from URL if not in props
    if (!$post_id) {
        $post_id = intval($_GET['mkcg_id'] ?? $_GET['post_id'] ?? $_GET['p'] ?? 0);
    }
    
    // Load data directly from database
    if ($post_id > 0) {
        // Your database loading logic here
        $data = get_post_meta($post_id, 'your_field_name', true);
        
        if (!empty($data) && defined('WP_DEBUG') && WP_DEBUG) {
            error_log("[Component] Template: Loaded data directly from database for post {$post_id}");
        }
    }
}

// 4. Render the component
?>
<div class="component-class" 
     data-component-type="your-type"
     data-component-id="<?php echo esc_attr($finalComponentId ?: 'your-type-' . time()); ?>">
    
    <?php if (!empty($data)): ?>
        <!-- Render your data -->
    <?php else: ?>
        <!-- Render placeholder -->
    <?php endif; ?>
    
    <!-- Optional debug notice -->
    <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
        <div class="debug-notice">
            <?php echo !empty($data) ? '✅ Data loaded' : '❌ No data found'; ?>
        </div>
    <?php endif; ?>
</div>
```

## Key Principles

### 1. **Always Have a Fallback**
Don't rely solely on props being passed. Always check if data is empty and load it directly.

### 2. **Multiple Post ID Sources**
Check for post ID in this order:
- Props (`$props['post_id']` or `$props['postId']`)
- URL parameters (`$_GET['mkcg_id']`, `$_GET['post_id']`, `$_GET['p']`)

### 3. **Direct Database Access**
Use WordPress functions to load data directly:
- `get_post_meta()` for Pods fields
- `get_field()` for ACF fields (if using ACF)
- Direct SQL queries if needed (with proper sanitization)

### 4. **Debug Notices**
In debug mode, show whether data was loaded successfully. This helps during development.

## Why This Works

1. **Immediate Data**: The template gets data on first render, even if AJAX fails
2. **Fallback Safety**: If server-side rendering fails, the template still shows data
3. **Performance**: No waiting for AJAX round-trip on initial load
4. **Reliability**: Works even with network issues or JavaScript errors

## Components Using This Pattern

✅ **Topics** - Fully implemented with fallback  
✅ **Biography** - Now updated with fallback  
⏳ **Hero** - Needs fallback implementation  
⏳ **Contact** - Needs fallback implementation  
⏳ **Questions** - Needs fallback implementation  
⏳ **Social** - Needs fallback implementation  

## Migration Checklist

When updating a component template:

- [ ] Add post ID extraction from props and URL
- [ ] Add fallback data loading when props are empty
- [ ] Map database fields to display variables
- [ ] Add debug notice for development
- [ ] Test with and without server-side rendering
- [ ] Verify data shows immediately on component add

## Example: Biography Component

```php
// Fallback to load directly from Pods
if (empty($bio_content)) {
    if (!$post_id) {
        $post_id = intval($_GET['mkcg_id'] ?? $_GET['post_id'] ?? 0);
    }
    
    if ($post_id > 0) {
        // Check multiple biography fields
        $bio_medium = get_post_meta($post_id, 'biography_medium', true);
        $bio_long = get_post_meta($post_id, 'biography_long', true);
        $bio_short = get_post_meta($post_id, 'biography_short', true);
        
        // Use first non-empty field
        $bio_content = $bio_medium ?: $bio_long ?: $bio_short;
    }
}
```

This pattern ensures components always show data, making them as reliable as the Topics component.
