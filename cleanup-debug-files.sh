#!/bin/bash
# Cleanup script for temporary debug files
# Run from the mk4 directory

echo "Cleaning up temporary debug files..."

# JavaScript debug files
rm -f debug-empty-state.js
rm -f debug-empty-state-styles.js
rm -f empty-state-fix.js
rm -f quick-fix-empty-state-styles.js
rm -f empty-state-centering-patch.js
rm -f test-empty-state-centering.js
rm -f emergency-css-fix.js
rm -f force-inline-centering.js

# CSS debug files (optional - uncomment if you want to remove)
# rm -f css/modules/empty-state-fix.css

echo "Debug files cleaned up!"
echo ""
echo "Documentation files preserved:"
echo "- EMPTY_STATE_COMPLETE_FIX_SUMMARY.md"
echo "- EMPTY_STATE_CENTERING_FINAL.md"
echo "- CSS_MODULE_LOADING_ISSUE.md"
echo "- CSS_IMPORT_FIX_FINAL.md"
echo "- DELETE_BUTTON_FIX_SUMMARY.md"