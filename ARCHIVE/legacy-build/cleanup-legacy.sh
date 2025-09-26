#!/bin/bash
# Media Kit Builder - Phase 4-8 Legacy Code Cleanup Script
# This script removes all legacy code and prepares for pure Vue implementation

echo "🧹 Starting Media Kit Builder Legacy Code Cleanup..."
echo "================================================"

# Phase 4: Remove Legacy UI Code
echo ""
echo "📦 Phase 4: Removing Legacy UI Code..."

# Remove legacy integration files that are no longer needed
rm -f src/integrations/componentRegistryBridge.js
rm -f src/integrations/vueStoreBridge.js
echo "✅ Removed legacy bridge files"

# Remove debug test file
rm -f src/debug/test-component-controls.js
echo "✅ Removed debug test files"

# Remove legacy features that should be Vue components
rm -f src/features/InlineEditor.js
rm -f src/features/ComponentTemplates.js
echo "✅ Removed legacy feature files"

# Phase 5: Clean up ARCHIVE directory
echo ""
echo "📦 Phase 5: Cleaning up ARCHIVE..."
if [ -d "ARCHIVE" ]; then
  rm -rf ARCHIVE
  echo "✅ Removed ARCHIVE directory"
else
  echo "⚠️  ARCHIVE directory not found (already cleaned)"
fi

# Phase 6: Remove unused dependencies from package.json
echo ""
echo "📦 Phase 6: Cleaning package.json..."
# This would need to be done manually or with a node script

# Phase 7: Clean up old backup files
echo ""
echo "📦 Phase 7: Removing backup files..."
find . -name "*.backup" -type f -delete
find . -name "*.old" -type f -delete
find . -name "*.disabled" -type f -delete
echo "✅ Removed backup files"

# Phase 8: Remove commented code (needs manual review)
echo ""
echo "📦 Phase 8: Files that may contain commented code (manual review needed):"
grep -r "^[[:space:]]*\/\/" --include="*.js" --include="*.vue" src/ | head -20

echo ""
echo "================================================"
echo "✅ Legacy Code Cleanup Complete!"
echo ""
echo "Next steps:"
echo "1. Review and update src/main.js to remove legacy imports"
echo "2. Update package.json to remove unused dependencies"
echo "3. Run 'npm run build' to test"
echo "4. Commit changes with: git add -A && git commit -m 'Phase 4-8: Remove legacy code'"
