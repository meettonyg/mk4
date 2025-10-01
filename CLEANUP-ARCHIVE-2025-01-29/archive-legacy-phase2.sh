#!/bin/bash
# Archive Legacy Files Script - Phase 2 Cleanup
# This script archives duplicate and legacy files that don't comply with the pure Vue architecture

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_DIR="ARCHIVE/phase2-cleanup-$TIMESTAMP"

echo "🗄️  Starting Phase 2 Cleanup - Archiving Legacy Files"
echo "Archive Directory: $ARCHIVE_DIR"

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# === DUPLICATE COMPONENT FILES ===
echo "📁 Archiving duplicate component files from src/vue/components/library/"
if [ -d "src/vue/components/library" ]; then
  mkdir -p "$ARCHIVE_DIR/src/vue/components/library"
  # Already moved Stats.vue, check for others
  for file in src/vue/components/library/*.vue; do
    if [ -f "$file" ]; then
      mv "$file" "$ARCHIVE_DIR/src/vue/components/library/"
      echo "  ✓ Archived: $(basename $file)"
    fi
  done
fi

# === DUPLICATE COMPOSABLES ===
echo "📁 Archiving duplicate composables"
# Already moved usePodsData.js
# Check for other duplicates
if [ -f "src/vue/composables/usePerformance.js" ]; then
  mkdir -p "$ARCHIVE_DIR/src/vue/composables"
  mv "src/vue/composables/usePerformance.js" "$ARCHIVE_DIR/src/vue/composables/"
  echo "  ✓ Archived: usePerformance.js (keep src/composables/ version)"
fi

# === LEGACY BRIDGE FILES ===
echo "📁 Archiving legacy bridge files"
# Already moved VueComponentBridge.js

# === LEGACY JS DIRECTORY ===
echo "📁 Archiving legacy JavaScript files"
if [ -d "js" ]; then
  # Archive entire js directory - it's all legacy jQuery/vanilla code
  mv "js" "$ARCHIVE_DIR/"
  echo "  ✓ Archived: entire js/ directory"
fi

# === POTENTIALLY DUPLICATE VUE COMPONENTS ===
echo "📁 Reviewing Vue components for archiving"

# Components that are likely duplicates or legacy
LEGACY_COMPONENTS=(
  "ComponentRenderer.vue"      # We use specific renderers in component folders
  "MediaKitComponent.vue"      # Old wrapper
  "ComponentLibrary.vue"       # Check if ComponentLibraryNew.vue is the active one
  "ComponentWrapper.vue"       # Duplicate of builder/ComponentWrapper.vue
)

for component in "${LEGACY_COMPONENTS[@]}"; do
  if [ -f "src/vue/components/$component" ]; then
    mkdir -p "$ARCHIVE_DIR/src/vue/components"
    mv "src/vue/components/$component" "$ARCHIVE_DIR/src/vue/components/"
    echo "  ✓ Archived: $component"
  fi
done

# === LEGACY PHP TEMPLATES ===
echo "📁 Checking for legacy PHP templates in component folders"
# Component folders should only have Vue files, not PHP templates for rendering
for dir in components/*/; do
  component_name=$(basename "$dir")
  # Keep these PHP files as they might be needed for WordPress integration:
  # - component.json (component definition)
  # - *-integration.php (Pods integration)
  # - ajax-handler.php (AJAX handlers)
  # Archive these as they're legacy:
  # - template.php (old PHP rendering, replaced by Vue)
  
  if [ -f "$dir/template.php" ]; then
    mkdir -p "$ARCHIVE_DIR/components/$component_name"
    cp "$dir/template.php" "$ARCHIVE_DIR/components/$component_name/"
    echo "  ⚠️  Found legacy template.php in $component_name (kept original, copy in archive)"
  fi
done

# === CREATE MANIFEST ===
echo "📝 Creating archive manifest"
cat > "$ARCHIVE_DIR/MANIFEST.md" << EOF
# Archive Manifest
Date: $(date)
Reason: Phase 2 Cleanup - Removing duplicate and legacy files after Vue 3 migration

## Archived Files

### Duplicate Component Files
- src/vue/components/library/*.vue - Duplicates of components in components/*/

### Duplicate Composables  
- src/vue/composables/usePodsData.js - Duplicate of src/composables/usePodsData.js

### Legacy Bridge Files
- src/vue/VueComponentBridge.js - Legacy bridge not needed in pure Vue

### Legacy JavaScript
- js/ - Entire directory of jQuery/vanilla JS code replaced by Vue

### Legacy Vue Components
- ComponentRenderer.vue - Replaced by specific renderers
- MediaKitComponent.vue - Old component wrapper
- ComponentLibrary.vue - Check if replaced by ComponentLibraryNew.vue
- ComponentWrapper.vue - Duplicate

### Legacy PHP Templates
- Various template.php files - Old PHP rendering replaced by Vue

## Files Kept

### Vue Infrastructure
- src/App.vue
- src/main.js
- src/stores/*
- src/composables/* (except duplicates)
- src/vue/services/UnifiedComponentRegistry.js

### Self-Contained Components
- components/*/*.vue (all Vue component files)
- components/*/component.json (definitions)
- components/*/*-integration.php (Pods integration)

### Build Configuration
- vite.config.js
- package.json
- webpack.config.js

## Verification Steps
1. Run: npm run dev
2. Check console for errors
3. Test all 16 components
4. Verify Pods data loads
5. Test save/load functionality
EOF

echo "✅ Archive complete: $ARCHIVE_DIR"
echo ""
echo "📋 Summary:"
echo "  - Duplicates archived: $(find $ARCHIVE_DIR -type f | wc -l) files"
echo "  - Archive size: $(du -sh $ARCHIVE_DIR | cut -f1)"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Test the application to ensure nothing broke"
echo "  2. If everything works, the archive can be deleted later"
echo "  3. If issues arise, files can be restored from $ARCHIVE_DIR"
