# Media Kit Builder - Post ID Usage Guide

## Overview
The Media Kit Builder requires a post ID to load and save media kit data. This guide explains how to properly pass the post ID to the builder.

## Query String Parameters

### Primary Methods (Recommended)
1. **`post_id` parameter** (Most common):
   ```
   https://yourdomain.com/guestify-media-kit/?post_id=123
   ```

2. **`p` parameter** (WordPress standard):
   ```
   https://yourdomain.com/guestify-media-kit/?p=123
   ```

### Alternative Methods
3. **`page_id` parameter**:
   ```
   https://yourdomain.com/guestify-media-kit/?page_id=123
   ```

4. **`mkcg_id` parameter** (MKCG integration):
   ```
   https://yourdomain.com/guestify-media-kit/?mkcg_id=123
   ```

5. **`media_kit_id` parameter**:
   ```
   https://yourdomain.com/guestify-media-kit/?media_kit_id=123
   ```

## How Post ID Detection Works

### PHP Side (Server)
The plugin uses multiple strategies to detect the post ID:

1. **URL Parameters** (highest priority)
   - Checks `$_GET['post_id']`
   - Checks `$_GET['p']`
   - Checks `$_GET['page_id']`
   - Checks `$_GET['mkcg_id']`
   - Checks `$_GET['media_kit_id']`

2. **WordPress Context** (fallback)
   - Uses `get_the_ID()` if available
   - Checks global `$post` object

3. **Validation**
   - Verifies post exists
   - Checks post is not in trash
   - Returns 0 if invalid

### JavaScript Side (Client)
The post ID is available in JavaScript via:

```javascript
// Primary access method
const postId = window.gmkbData.postId;

// The post ID is automatically included in all AJAX calls
```

## AJAX Requests

### Topics Component
When loading or saving topics, the post ID is automatically included:

```javascript
// Example AJAX call (handled internally)
const formData = new FormData();
formData.append('action', 'load_stored_topics');
formData.append('nonce', window.gmkbData.nonce);
formData.append('post_id', window.gmkbData.postId); // Automatically included
```

### Component Rendering
When rendering components that need data (like topics), the post ID is passed:

```javascript
// Example component render (handled internally)
const formData = new FormData();
formData.append('action', 'guestify_render_component');
formData.append('nonce', window.gmkbData.nonce);
formData.append('component', 'topics');
formData.append('post_id', window.gmkbData.postId); // Ensures data loading
formData.append('props', JSON.stringify({
    post_id: window.gmkbData.postId,
    // other props...
}));
```

## Data Storage

### Where Media Kit Data is Stored
1. **Main state**: `gmkb_media_kit_state` post meta
2. **Topics data**: 
   - `topic_1` through `topic_5` (custom fields)
   - `mkcg_topic_1` through `mkcg_topic_5` (MKCG format)
   - `gmkb_topics_data` (backup format)

### Auto-Save Feature
The builder automatically saves changes when:
- Components are added
- Components are removed
- Components are modified
- Manual save button is clicked

## Troubleshooting

### No Post ID Detected
If the builder shows "No valid post ID", check:
1. URL contains one of the supported parameters
2. Post exists and is not in trash
3. User has permission to edit the post

### Debug Mode
Enable WordPress debug mode to see detailed logs:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Check logs at: `wp-content/debug.log`

### Common Issues

1. **Topics not loading**
   - Verify post ID is passed in URL
   - Check browser console for errors
   - Verify AJAX URL is correct

2. **Save failing**
   - Ensure post ID is valid
   - Check user permissions
   - Verify nonce is valid

3. **Wrong data loading**
   - Confirm correct post ID in URL
   - Clear browser cache
   - Check for duplicate post IDs

## Integration Examples

### Link from WordPress Admin
```php
$edit_url = add_query_arg(
    'post_id', 
    $post->ID, 
    home_url('/guestify-media-kit/')
);
echo '<a href="' . esc_url($edit_url) . '">Edit Media Kit</a>';
```

### Link from Theme
```php
<?php if (is_single()) : ?>
    <a href="<?php echo home_url('/guestify-media-kit/?post_id=' . get_the_ID()); ?>">
        Edit Media Kit
    </a>
<?php endif; ?>
```

### Programmatic Access
```javascript
// Get current post ID in JavaScript
const currentPostId = window.gmkbData?.postId || 0;

// Check if valid post ID
if (currentPostId > 0) {
    console.log('Editing media kit for post:', currentPostId);
} else {
    console.error('No valid post ID available');
}
```

## Best Practices

1. **Always include post ID in URL** when linking to the builder
2. **Validate post ID** before processing
3. **Use consistent parameter** (`post_id` recommended)
4. **Handle missing post ID** gracefully
5. **Test with different post types** to ensure compatibility

## Architecture Notes

### Data Flow
1. URL Parameter → PHP Detection → WordPress Data
2. WordPress Data → JavaScript via `wp_localize_script`
3. JavaScript → AJAX Calls → PHP Handlers
4. PHP Handlers → Database Operations

### Component-Specific Data
Components that load data (like topics) receive the post ID through:
1. Initial render props
2. AJAX load requests
3. Design panel updates

This ensures data consistency across all operations.
