# Comprehensive Component Migration Summary

This script will help complete the migration of Vue renderers to their proper component directories and create the necessary component.json manifest files.

## Components to Process:

1. **hero** - ✅ Already migrated
2. **biography** - ✅ Already migrated  
3. **topics** - ✅ Already migrated
4. **contact** - Needs migration
5. **social** - Needs migration
6. **testimonials** - Needs migration
7. **call-to-action** - Needs migration
8. **questions** - Needs migration
9. **stats** - Needs migration
10. **video-intro** - Needs migration
11. **photo-gallery** - Needs migration
12. **podcast-player** - Needs migration
13. **booking-calendar** - Needs migration
14. **authority-hook** - Needs migration
15. **guest-intro** - Needs migration
16. **logo-grid** - Needs migration

## Migration Tasks:

### Step 1: Copy Vue Renderers
Copy each renderer from `src/vue/components/renderers/` to `components/[name]/`

### Step 2: Create component.json files
Each component needs a manifest file with:
- Component metadata (name, description, category)
- Renderer paths (vue, php, javascript)
- Support capabilities

### Step 3: Update ComponentDiscovery.php
✅ Already updated to support both manifest-based and legacy discovery

## After Migration:
1. Delete `src/vue/components/renderers/` directory
2. Update build config to scan component directories for Vue files
3. Test component loading with new structure
