# Media Kit Builder - Frontend Display System

## Overview

The Media Kit Builder frontend display system automatically renders media kits for custom post types that have media kit data stored. It includes full theme support, section rendering, and performance optimizations.

## How It Works

### Automatic Template Routing

When viewing a single post (of a supported post type) that has media kit data:

1. The `GMKB_Frontend_Template_Router` checks if the post has media kit data
2. If data exists, it loads the media kit template instead of the default post template
3. The template uses the enhanced `GMKB_Frontend_Display` class to render with themes

### Supported Post Types

By default, the system supports the `guests` custom post type. To add support for other custom post types:

```php
// In your theme's functions.php or a custom plugin
add_filter('gmkb_supported_post_types', function($post_types) {
    // Add your custom post types
    $post_types[] = 'speakers';
    $post_types[] = 'authors';
    $post_types[] = 'team_members';
    return $post_types;
});
```

## Display Methods

### Automatic Template Display (Primary Method)

When viewing a guest post (or other supported post type) with media kit data, the system automatically:
- Loads the media kit template (`mediakit-frontend-template.php`)
- Applies the selected theme
- Renders sections and components
- No shortcode needed!

Example URL: `yoursite.com/guests/john-doe/`

### Shortcode Display (For Embedding)

Use the `[display_media_kit]` shortcode to embed media kits anywhere:

```php
// Basic usage
[display_media_kit id="123"]

// With all options
[display_media_kit 
    id="123"                    // Required: Post ID
    theme="professional_clean"   // Override theme
    class="custom-class"         // Additional CSS class
    responsive="true"            // Enable responsive design
    lazy_load="true"            // Enable lazy loading
    section_animation="fade"     // Animation type: fade, slide-up, scale
    cache="true"                // Enable HTML caching
]
```

### PHP Template Tag (For Custom Templates)

For custom templates, you can directly call the display class:

```php
<?php
if (class_exists('GMKB_Frontend_Display')) {
    $frontend = GMKB_Frontend_Display::get_instance();
    $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    
    if ($state) {
        $frontend->render_media_kit_template($state, $post_id);
    }
}
?>
```

## Theme System

### Available Themes

1. **Professional Clean** - Clean, corporate design with blue accents
2. **Creative Bold** - Vibrant, playful design with gradients
3. **Minimal Elegant** - Monochrome, sophisticated design
4. **Modern Dark** - Dark mode with glassmorphism effects

### Theme Selection Priority

1. Shortcode `theme` attribute (highest priority)
2. Media kit saved theme (`globalSettings.theme`)
3. Global default theme
4. Fallback to `professional_clean`

### Custom Themes

Custom themes are supported and will be loaded if they exist in the database.

## Section Layouts

The system supports three section layouts:

1. **Full Width** - Single column, full container width
2. **Two Column** - 50/50 split layout
3. **Three Column** - 33/33/33 split layout

Sections automatically stack on mobile devices.

## Performance Features

### Lazy Loading
- Components load as they enter the viewport
- Reduces initial page load time
- Automatic placeholder generation

### CSS Caching
- Theme CSS cached for 1 hour
- Reduces CSS generation overhead
- Automatic cache invalidation on theme change

### HTML Caching
- Full rendered output cached for 15 minutes (when enabled)
- Significantly improves page load speed
- Cache key includes all render parameters

### Conditional Asset Loading
- CSS/JS only loaded on pages with media kits
- Scripts loaded in footer for better performance
- Minimal inline styles

## Template Files

### Primary Template
- **`templates/mediakit-frontend-template.php`** - Main media kit display template
  - Automatically loaded when viewing posts with media kit data
  - Handles theme loading and component rendering
  - Supports both enhanced and basic display modes

### Template Hierarchy
The system checks for templates in this order:
1. `mediakit-frontend-template.php` (plugin template)
2. `single-mediakit-display.php` (theme override option)
3. Default post type template (fallback)

## Component Templates

Components can have two templates:

1. **frontend-template.php** - Frontend-specific display
2. **template.php** - Universal template (fallback)

Template location: `/components/[component-name]/`

### Template Variables

Templates receive these variables:
- `$component_id` - Unique component identifier
- `$post_id` - Parent post ID
- `$data` - Component data array
- `$props` - Component properties
- `$is_frontend` - Always true for frontend
- `$theme` - Current theme configuration

## Responsive Design

The system automatically handles responsive design:

- **Desktop**: Full layouts preserved
- **Tablet** (< 1024px): Three columns become two
- **Mobile** (< 768px): All columns stack vertically
- **Small Mobile** (< 480px): Reduced font sizes and spacing

## Animations

Scroll-triggered animations available:

- **fade** - Fade in from transparent
- **slide-up** - Slide up from below
- **scale** - Scale up from smaller size

Configure via `section_animation` attribute in shortcode or data attributes in HTML.

## Extending the System

### Add Custom Post Type Support

```php
add_filter('gmkb_supported_post_types', function($types) {
    $types[] = 'your_post_type';
    return $types;
});
```

### Modify Component Rendering

```php
add_filter('gmkb_render_component', function($html, $component, $post_id) {
    // Modify component HTML
    return $html;
}, 10, 3);
```

### Add Custom Theme Variables

```php
add_filter('gmkb_theme_css_variables', function($css, $theme) {
    $css .= '--custom-var: value;';
    return $css;
}, 10, 2);
```

## Troubleshooting

### Media Kit Not Displaying

1. Check if post has media kit data: `get_post_meta($post_id, 'gmkb_media_kit_state', true)`
2. Verify post type is supported (see filters above)
3. Check PHP error logs for template loading issues

### Theme Not Applied

1. Verify theme exists in `/themes/` directory
2. Check theme.json is valid JSON
3. Clear theme CSS cache (transients)

### Components Not Loading

1. Check component directories exist
2. Verify template.php files are present
3. Check browser console for JavaScript errors

### Performance Issues

1. Enable caching in shortcode: `cache="true"`
2. Use lazy loading: `lazy_load="true"`
3. Check server response times
4. Consider CDN for assets

## Developer Reference

### Hooks

**Filters:**
- `gmkb_supported_post_types` - Add post type support
- `gmkb_load_media_kit_state` - Modify state before rendering
- `gmkb_theme_css_variables` - Add custom CSS variables
- `gmkb_render_component` - Modify component HTML
- `gmkb_section_classes` - Add section CSS classes

**Actions:**
- `gmkb_before_render_media_kit` - Before rendering starts
- `gmkb_after_render_media_kit` - After rendering completes
- `gmkb_component_rendered` - After each component renders

### JavaScript Events

- `gmkb:component-loaded` - Component lazy loaded
- `gmkb:element-animated` - Element animation triggered
- `gmkb:media-kit-rendered` - Full media kit rendered

### CSS Classes

**Wrapper:**
- `.gmkb-frontend-display` - Main container
- `.gmkb-theme--[theme-id]` - Theme-specific class
- `.gmkb-responsive` - Responsive enabled

**Sections:**
- `.gmkb-section` - Section container
- `.gmkb-section--[type]` - Section type modifier
- `.gmkb-section__inner` - Inner wrapper
- `.gmkb-section__columns` - Column container

**Components:**
- `.gmkb-component` - Component wrapper
- `.gmkb-component--[type]` - Component type
- `.gmkb-lazy` - Lazy loading enabled
- `.gmkb-animate` - Animation enabled
