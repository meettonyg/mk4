# CRITICAL: Profile Photo Component Not Loading

## ROOT CAUSE
The profile-photo component exists in the filesystem and is properly configured, but the Vue build doesn't include it yet. The UnifiedComponentRegistry uses `import.meta.glob()` to discover components at build time, so a fresh build is required.

## IMMEDIATE FIX REQUIRED

Run these commands in PowerShell or Command Prompt:

```bash
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

# Clean previous build
npm run clean

# Rebuild with latest components
npm run build
```

## VERIFICATION

After rebuilding, check the browser console for:
```
✅ Registered X Vue components
Available component paths: ...
```

The profile-photo component should be listed.

## WHY THIS HAPPENED

The Vue build system uses Vite's `import.meta.glob('../../components/*/*Renderer.vue')` to discover all component renderer files at **build time**. This means:

1. When ProfilePhotoRenderer.vue was added, it existed in the source
2. But the dist/gmkb.iife.js bundle was built BEFORE this file existed
3. Therefore, the Vue app doesn't know about profile-photo

## ALTERNATIVE: Force Cache Clear

If rebuild doesn't work, also clear WordPress transient cache:

```php
// Add this to functions.php temporarily or run in WP CLI:
delete_transient('gmkb_component_discovery_' . md5(GUESTIFY_PLUGIN_DIR . 'components/'));
```

## VERIFICATION STEPS

1. After rebuild, refresh the media kit builder page
2. Open browser console
3. Run: `GMKB.services.registry.debug()`
4. Check if 'profile-photo' is in the list of component types
5. Try adding a profile-photo component again

## FILES VERIFIED ✅

All these files exist and are properly configured:
- ✅ components/profile-photo/component.json
- ✅ components/profile-photo/ProfilePhotoRenderer.vue  
- ✅ components/profile-photo/ProfilePhotoEditor.vue
- ✅ components/profile-photo/schema.json
- ✅ components/profile-photo/styles.css

The PHP side (ComponentDiscovery) correctly scans and finds this component.
The issue is ONLY on the Vue side due to stale build.
