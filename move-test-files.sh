#!/bin/bash
# Move test files from debug directory to archive

# List of test files to move
test_files=(
    "quick-edit-test.js"
    "quick-undo-test.js"
    "section-component-integration-fix-test.js"
    "section-component-integration-test.js"
    "test-component-interactions.js"
    "test-component-selection.js"
    "test-edit-functionality.js"
    "test-overlapping-controls-fix.js"
    "test-pods-enrichment.js"
    "test-post-id-flow.js"
    "test-section-edit-panel.js"
    "test-section-fix.js"
    "test-template-router.php"
    "test-theme-system.js"
    "test-undo-redo.js"
    "test-wordpress-save-load.js"
    "undo-redo-fix-test.js"
)

# Create destination directory if not exists
mkdir -p ARCHIVE/test-files/debug-tests

# Move each file
for file in "${test_files[@]}"; do
    if [ -f "debug/$file" ]; then
        mv "debug/$file" "ARCHIVE/test-files/debug-tests/" 2>/dev/null && echo "Moved: $file" || echo "Failed: $file"
    fi
done

echo "Test file cleanup complete!"
