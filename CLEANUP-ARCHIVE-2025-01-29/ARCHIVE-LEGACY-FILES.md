# Legacy Files to Archive - Phase 2 Cleanup

## Files to Archive

### 1. Duplicate Component Files in src/vue/components/library/
These are duplicates since we use self-contained component folders:
- `src/vue/components/library/Stats.vue` → Should use `components/stats/StatsRenderer.vue`
- Any other files in `src/vue/components/library/`

### 2. Duplicate Composable in src/vue/composables/
- `src/vue/composables/usePodsData.js` → Duplicate of `src/composables/usePodsData.js`

### 3. Legacy JS Files (Non-Vue)
All files in `js/` directory that are legacy jQuery/vanilla JS:
- `js/core/` - Legacy state management
- `js/bridges/` - Legacy bridge code
- `js/utils/` - Legacy utilities
- `js/api/` - Legacy API handlers (replaced by REST API)
- `js/init/` - Legacy initialization
- `js/modals/` - Legacy modal code

### 4. Potentially Duplicate Vue Components in src/vue/components/
These might be duplicates or legacy versions:
- `src/vue/components/ComponentRenderer.vue` - We use component-specific renderers
- `src/vue/components/FallbackRenderer.vue` - Legacy fallback system
- `src/vue/components/MediaKitComponent.vue` - Old component wrapper
- `src/vue/components/ComponentLibrary.vue` - Might be replaced
- `src/vue/components/ComponentLibraryNew.vue` - Duplicate library

### 5. Legacy Integration Files
- `src/vue/VueComponentBridge.js` - Legacy bridge, not needed in pure Vue

## Files to KEEP

### Essential Vue Infrastructure
Keep these as they're part of the new pure Vue architecture:
- `src/stores/` - Pinia stores
- `src/composables/usePodsData.js` - The correct composable location
- `src/composables/useExportImport.js` - Export/import functionality
- `src/vue/services/UnifiedComponentRegistry.js` - Component registry
- `src/App.vue` - Main Vue app
- `src/main.js` - Vue entry point

### Self-Contained Components
Keep all folders in `components/`:
- `components/hero/`
- `components/biography/`
- `components/contact/`
- ... (all 16 component folders)

### Build Configuration
- `vite.config.js`
- `package.json`
- `webpack.config.js` (if still needed)

## Archiving Strategy

1. Create timestamped archive folder
2. Move files preserving directory structure
3. Create manifest of archived files
4. Verify application still works after archiving

## Commands to Execute

```bash
# Create archive directory with timestamp
ARCHIVE_DIR="ARCHIVE/phase2-cleanup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $ARCHIVE_DIR

# Archive duplicate component library
mkdir -p $ARCHIVE_DIR/src/vue/components/library
mv src/vue/components/library/*.vue $ARCHIVE_DIR/src/vue/components/library/

# Archive duplicate composable
mkdir -p $ARCHIVE_DIR/src/vue/composables
mv src/vue/composables/usePodsData.js $ARCHIVE_DIR/src/vue/composables/

# Archive legacy JS directory
mv js/ $ARCHIVE_DIR/js/

# Archive legacy Vue components
mkdir -p $ARCHIVE_DIR/src/vue/components
mv src/vue/components/ComponentRenderer.vue $ARCHIVE_DIR/src/vue/components/
mv src/vue/components/FallbackRenderer.vue $ARCHIVE_DIR/src/vue/components/
mv src/vue/components/MediaKitComponent.vue $ARCHIVE_DIR/src/vue/components/

# Archive bridge file
mv src/vue/VueComponentBridge.js $ARCHIVE_DIR/src/vue/
```

## Verification After Archiving

1. Check console for errors
2. Verify all 16 components still render
3. Test component adding/editing
4. Verify Pods data still loads
5. Check that build still works

## Files That Might Need Review

Some files in `src/vue/components/` might be needed:
- `BuilderCanvas.vue` - Check if used
- `SectionRenderer.vue` - Might be needed for sections
- `ThemeCustomizer.vue` - Might be needed for themes
- Panel components - Might be needed for UI

Review these before archiving.
