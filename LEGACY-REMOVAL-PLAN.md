# Media Kit Builder - Legacy Code Removal Plan
## Goal: Achieve 100% Vue Architecture

## Current State Analysis

### What We Have:
1. **Vue System**: Complete Vue/Vite bundle in `/dist/gmkb.iife.js` 
2. **Legacy System**: 60+ JavaScript files in `/js` directory
3. **Hybrid Enqueue**: Both `enqueue.php` and `enqueue-separated.php` with GMKB_PURE_VUE_MODE flag
4. **Mixed Templates**: Both Vue components and PHP templates

## Phase 1: Directory Cleanup (Immediate)

### Directories to Archive:
```bash
# Create archive directory
mkdir -p ARCHIVE/legacy-js-backup-$(date +%Y%m%d)

# Move all legacy JavaScript
mv js/ ARCHIVE/legacy-js-backup-$(date +%Y%m%d)/

# Move legacy PHP templates  
mv templates/builder-template-backup.php ARCHIVE/legacy-js-backup-$(date +%Y%m%d)/
mv templates/partials/ ARCHIVE/legacy-js-backup-$(date +%Y%m%d)/

# Move system legacy files
mv system/*.js ARCHIVE/legacy-js-backup-$(date +%Y%m%d)/

# Keep only essential PHP files for Vue API
```

### Files to Keep:
- `/dist/` - Vue bundle output
- `/src/` - Vue source code  
- `/components/*/template.php` - Component templates for server-side rendering fallback
- `/includes/api/` - API endpoints for Vue
- `/includes/enqueue-vue-only.php` - New simplified enqueue file

## Phase 2: Simplify Enqueue System

### Create New Vue-Only Enqueue:
```php
<?php
// includes/enqueue-vue-only.php
function gmkb_enqueue_vue_assets() {
    if (!is_media_kit_builder_page()) return;
    
    // Vue bundle
    wp_enqueue_script(
        'gmkb-vue-bundle',
        GUESTIFY_PLUGIN_URL . 'dist/gmkb.iife.js',
        array(),
        filemtime(GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js'),
        true
    );
    
    // Vue data
    wp_localize_script('gmkb-vue-bundle', 'gmkbData', [
        'api' => rest_url('gmkb/v1/'),
        'nonce' => wp_create_nonce('wp_rest'),
        'postId' => get_current_post_id_safe(),
        // ... minimal data
    ]);
    
    // Vue styles only
    wp_enqueue_style(
        'gmkb-vue-styles',
        GUESTIFY_PLUGIN_URL . 'dist/style.css'
    );
}
add_action('wp_enqueue_scripts', 'gmkb_enqueue_vue_assets');
```

## Phase 3: Remove Legacy Dependencies

### Main Plugin File Updates:
1. Remove all legacy includes
2. Remove GMKB_PURE_VUE_MODE constant  
3. Keep only:
   - API endpoints
   - Component discovery
   - Vue enqueue

### Remove These Includes:
```php
// REMOVE from guestify-media-kit-builder.php:
// require_once 'includes/enqueue.php';
// require_once 'includes/enqueue-separated.php'; 
// require_once 'system/ComponentLoader.php';
// require_once 'system/DesignPanel.php';

// KEEP only:
require_once 'includes/enqueue-vue-only.php';
require_once 'includes/api/MediaKitAPI.php';
require_once 'system/ComponentDiscovery.php';
```

## Phase 4: API Consolidation

### Keep These REST Endpoints:
- `/wp-json/gmkb/v1/mediakit/{id}` - Load media kit
- `/wp-json/gmkb/v1/mediakit/{id}/save` - Save media kit  
- `/wp-json/gmkb/v1/components` - Get components
- `/wp-json/gmkb/v1/themes` - Get themes

### Remove Legacy AJAX Handlers:
- Remove all `wp_ajax_*` actions except those used by Vue
- Keep only REST API endpoints

## Phase 5: Template Simplification

### Single Entry Template:
```php
<!-- templates/vue-app.php -->
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Media Kit Builder</title>
    <?php wp_head(); ?>
</head>
<body>
    <div id="gmkb-app"></div>
    <?php wp_footer(); ?>
</body>
</html>
```

## Phase 6: Files to Remove

### JavaScript Files (ALL):
- `/js/**/*` - All legacy JavaScript
- `/system/*.js` - Legacy system files
- `/scripts/` - Build scripts for legacy

### PHP Files:
- `/includes/enqueue.php` - Legacy enqueue
- `/includes/enqueue-separated.php` - Hybrid enqueue
- `/templates/builder-template.php` - Legacy template
- `/templates/builder-template-backup.php` - Backup template

### CSS Files to Review:
- Keep: Component-specific styles
- Remove: Legacy-specific styles
- Consolidate: Into Vue bundle

## Phase 7: Component Migration

### Component Structure:
```
components/
  hero/
    component.json    # Component definition
    Hero.vue          # Vue component
    template.php      # Optional SSR fallback
    schema.json       # Data schema
```

### Remove from Components:
- `renderer.js` - Legacy renderer
- `script.js` - Legacy JavaScript
- `panel-script.js` - Legacy panel script
- `design-panel.php` - Legacy design panel

## Phase 8: Configuration Updates

### package.json Scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist node_modules package-lock.json"
  }
}
```

### Remove Build Scripts:
- `build.bat`
- `build.sh` 
- `build.js`
- `rebuild.bat`
- All legacy build scripts

## Phase 9: Verification Checklist

- [ ] All `/js` files removed
- [ ] No `define('GMKB_PURE_VUE_MODE')` references
- [ ] Single enqueue file loading Vue only
- [ ] No jQuery dependencies
- [ ] No legacy AJAX handlers
- [ ] Clean REST API only
- [ ] Vue bundle builds successfully
- [ ] All components load via Vue
- [ ] Save/Load works via REST API
- [ ] No console errors

## Phase 10: Final Structure

```
mk4/
├── dist/              # Vue build output
│   ├── gmkb.iife.js
│   └── style.css
├── src/               # Vue source
│   ├── main.js
│   ├── stores/
│   └── vue/components/
├── components/        # Self-contained components
│   └── {name}/
│       ├── component.json
│       └── {Name}.vue
├── includes/          
│   ├── api/          # REST API only
│   └── enqueue-vue.php
├── css/              # Minimal CSS
└── guestify-media-kit-builder.php
```

## Implementation Commands

```bash
# 1. Backup current state
cp -r . ../mk4-backup-$(date +%Y%m%d)

# 2. Clean legacy files
rm -rf js/
rm -rf system/*.js
rm -f includes/enqueue.php
rm -f includes/enqueue-separated.php

# 3. Update plugin file
# Edit guestify-media-kit-builder.php to remove legacy includes

# 4. Build Vue
npm run build

# 5. Test
# Load media kit builder page
# Verify no errors
```

## Benefits After Completion

1. **Performance**: ~80% reduction in scripts loaded
2. **Bundle Size**: Single ~500KB bundle vs 60+ files
3. **Maintainability**: Single codebase in Vue
4. **Modern Stack**: Vue 3 + Vite + Pinia
5. **Clean API**: REST only, no legacy AJAX
6. **No Conflicts**: No jQuery, no global pollution
7. **Fast Builds**: Vite instead of complex build scripts

## Risk Mitigation

1. **Backup Everything**: Before any changes
2. **Test Incrementally**: One phase at a time
3. **Keep SSR Fallback**: Component templates for SEO
4. **Maintain API**: Keep REST endpoints stable
5. **Version Control**: Commit after each phase

## Timeline

- Phase 1-3: 1 day (cleanup and basic setup)
- Phase 4-6: 1 day (remove legacy code)
- Phase 7-8: 1 day (component migration)
- Phase 9-10: 1 day (testing and verification)

**Total: 4 days to 100% Vue**