#!/bin/bash
# Cleanup script for MK4 plugin
# Run this to organize debug files and clean up the project

echo "🧹 Starting MK4 Plugin Cleanup..."

# Create archive directories if they don't exist
mkdir -p ARCHIVE/debug-scripts
mkdir -p ARCHIVE/test-scripts
mkdir -p ARCHIVE/documentation
mkdir -p ARCHIVE/patches

# Move debug files to archive
echo "📁 Archiving debug files..."
mv debug/*.js ARCHIVE/debug-scripts/ 2>/dev/null
mv debug/*.php ARCHIVE/debug-scripts/ 2>/dev/null
mv debug/diagnostic/*.* ARCHIVE/debug-scripts/ 2>/dev/null
mv debug/quick-tests/*.* ARCHIVE/debug-scripts/ 2>/dev/null
mv debug/test-fixes/*.* ARCHIVE/debug-scripts/ 2>/dev/null
mv debug/temp-fixes/*.* ARCHIVE/debug-scripts/ 2>/dev/null
mv debug/discarded/*.* ARCHIVE/debug-scripts/ 2>/dev/null

# Move root-level test files
echo "📁 Moving root-level test files..."
mv test-*.js ARCHIVE/test-scripts/ 2>/dev/null
mv git-commit-*.txt ARCHIVE/documentation/ 2>/dev/null

# Move old implementation docs
echo "📁 Archiving old documentation..."
mv *-COMPLETE.md ARCHIVE/documentation/ 2>/dev/null
mv CLEANUP-SUMMARY.md ARCHIVE/documentation/ 2>/dev/null

# Clean up empty directories
echo "🗑️ Removing empty directories..."
rmdir debug/diagnostic 2>/dev/null
rmdir debug/quick-tests 2>/dev/null
rmdir debug/test-fixes 2>/dev/null
rmdir debug/temp-fixes 2>/dev/null
rmdir debug/discarded 2>/dev/null
rmdir debug/php-debug 2>/dev/null

# Keep only essential debug structure
echo "📁 Keeping essential debug structure..."
mkdir -p debug
echo "# Debug Directory

This directory is for temporary debugging scripts during development.
Files here should not be included in production builds.

## Usage
- Place temporary debug scripts here
- Archive completed debug work to ARCHIVE/debug-scripts
- Keep this directory clean between debug sessions
" > debug/README.md

echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "- Debug scripts archived to ARCHIVE/debug-scripts/"
echo "- Test files moved to ARCHIVE/test-scripts/"
echo "- Documentation moved to ARCHIVE/documentation/"
echo "- Empty directories removed"
echo "- Essential structure maintained"
