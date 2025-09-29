#!/bin/bash
# Archive Legacy Vue Component Files
# Date: 2024
# Purpose: Archive duplicate/legacy Vue components that don't comply with self-contained architecture

ARCHIVE_DIR="ARCHIVE/vue-legacy-$(date +%Y%m%d-%H%M%S)"

echo "🗄️ Creating archive directory: $ARCHIVE_DIR"
mkdir -p "$ARCHIVE_DIR"

# Create archive documentation
cat > "$ARCHIVE_DIR/ARCHIVE_REASON.md" << EOF
# Archived Vue Legacy Files

## Archive Date
$(date)

## Reason for Archiving
These files were archived because they:
1. Are duplicates of self-contained components in components/ folder
2. Use old architecture patterns (not self-contained)
3. Contain legacy bridge/adapter code
4. Are superseded by new implementations

## Architecture Decision
We are using the self-contained component architecture where:
- Each component lives in its own folder under components/
- Components are self-contained with their own Vue, styles, scripts
- No separate library folder for Vue components
- Composables live in src/composables (not src/vue/composables)

## Files Archived

### Duplicate Component Files
- src/vue/components/library/*.vue (duplicates of components/*/\*Renderer.vue)

### Duplicate Composables  
- src/vue/composables/usePodsData.js (duplicate of src/composables/usePodsData.js)

### Legacy Bridge/Adapter Files
- src/vue/VueComponentBridge.js (legacy bridge pattern)

### Old Component Discovery/Registry
- Files that duplicate UnifiedComponentRegistry functionality

EOF

echo "📁 Archiving duplicate component library files..."
# Archive the library folder with duplicate components
if [ -d "src/vue/components/library" ]; then
    mkdir -p "$ARCHIVE_DIR/src/vue/components/"
    mv src/vue/components/library "$ARCHIVE_DIR/src/vue/components/"
    echo "  ✅ Archived src/vue/components/library/"
fi

echo "📁 Archiving duplicate composables..."
# Archive duplicate usePodsData.js
if [ -f "src/vue/composables/usePodsData.js" ]; then
    mkdir -p "$ARCHIVE_DIR/src/vue/composables/"
    mv src/vue/composables/usePodsData.js "$ARCHIVE_DIR/src/vue/composables/"
    echo "  ✅ Archived src/vue/composables/usePodsData.js"
fi

echo "📁 Archiving legacy bridge files..."
# Archive VueComponentBridge.js
if [ -f "src/vue/VueComponentBridge.js" ]; then
    mkdir -p "$ARCHIVE_DIR/src/vue/"
    mv src/vue/VueComponentBridge.js "$ARCHIVE_DIR/src/vue/"
    echo "  ✅ Archived src/vue/VueComponentBridge.js"
fi

echo "📁 Archiving old component discovery/registry if duplicates..."
# Archive old discovery pattern files
if [ -d "src/vue/discovery" ]; then
    mv src/vue/discovery "$ARCHIVE_DIR/src/vue/"
    echo "  ✅ Archived src/vue/discovery/"
fi

# Archive duplicate registry files (keep UnifiedComponentRegistry.js)
if [ -f "src/vue/services/componentRegistry.js" ]; then
    mkdir -p "$ARCHIVE_DIR/src/vue/services/"
    mv src/vue/services/componentRegistry.js "$ARCHIVE_DIR/src/vue/services/"
    echo "  ✅ Archived src/vue/services/componentRegistry.js"
fi

if [ -f "src/vue/services/componentDiscovery.js" ]; then
    mv src/vue/services/componentDiscovery.js "$ARCHIVE_DIR/src/vue/services/"
    echo "  ✅ Archived src/vue/services/componentDiscovery.js"
fi

echo "📁 Archiving old/duplicate component files in src/vue/components/..."
# Archive files that are duplicates or use old patterns
FILES_TO_ARCHIVE=(
    "src/vue/components/ComponentLibrary.vue"
    "src/vue/components/ComponentLibraryNew.vue"
    "src/vue/components/FallbackRenderer.vue"
    "src/vue/components/GenericEditor.vue"
    "src/vue/components/MediaKitApp.vue"
    "src/vue/components/MediaKitAppComplete.vue"
    "src/vue/components/SectionLayout.vue"
    "src/vue/components/SidebarIntegration.vue"
)

for file in "${FILES_TO_ARCHIVE[@]}"; do
    if [ -f "$file" ]; then
        dir=$(dirname "$file")
        mkdir -p "$ARCHIVE_DIR/$dir"
        mv "$file" "$ARCHIVE_DIR/$file"
        echo "  ✅ Archived $file"
    fi
done

echo ""
echo "📊 Archive Summary:"
echo "==================="
echo "Archive location: $ARCHIVE_DIR"
echo "Files archived: $(find $ARCHIVE_DIR -type f | wc -l)"

echo ""
echo "✅ Archive complete! Legacy files moved to: $ARCHIVE_DIR"
echo ""
echo "🎯 Current clean structure:"
echo "  - components/        : Self-contained components"
echo "  - src/composables/   : Shared composables"
echo "  - src/stores/        : Pinia stores"
echo "  - src/vue/services/  : UnifiedComponentRegistry only"
