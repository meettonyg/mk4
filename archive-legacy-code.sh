#!/bin/bash

# Media Kit Builder - Legacy Code Archival Script
# This script safely archives all legacy JavaScript and related files
# Run this after verifying Vue-only mode works correctly

echo "========================================="
echo "Media Kit Builder - Legacy Code Archival"
echo "========================================="
echo ""

# Get current date for archive naming
DATE=$(date +%Y%m%d_%H%M%S)
ARCHIVE_DIR="ARCHIVE/legacy-removal-$DATE"

# Create archive directory
echo "Creating archive directory: $ARCHIVE_DIR"
mkdir -p "$ARCHIVE_DIR"

# Function to safely move files/directories
safe_move() {
    local source=$1
    local dest_dir=$2
    
    if [ -e "$source" ]; then
        echo "  Moving: $source"
        mv "$source" "$dest_dir/"
    else
        echo "  Skipping (not found): $source"
    fi
}

# ================================================
# ARCHIVE LEGACY JAVASCRIPT
# ================================================
echo ""
echo "Archiving legacy JavaScript files..."
safe_move "js" "$ARCHIVE_DIR"
safe_move "js-legacy" "$ARCHIVE_DIR"

# ================================================
# ARCHIVE LEGACY SYSTEM FILES
# ================================================
echo ""
echo "Archiving legacy system files..."
if [ -d "system" ]; then
    mkdir -p "$ARCHIVE_DIR/system"
    # Move only .js files from system directory
    find system -name "*.js" -type f -exec mv {} "$ARCHIVE_DIR/system/" \; 2>/dev/null
    echo "  Moved JavaScript files from system/"
fi

# ================================================
# ARCHIVE LEGACY ENQUEUE FILES
# ================================================
echo ""
echo "Archiving legacy enqueue files..."
mkdir -p "$ARCHIVE_DIR/includes"
safe_move "includes/enqueue.php" "$ARCHIVE_DIR/includes"
safe_move "includes/enqueue-separated.php" "$ARCHIVE_DIR/includes"

# ================================================
# ARCHIVE LEGACY TEMPLATES
# ================================================
echo ""
echo "Archiving legacy template files..."
mkdir -p "$ARCHIVE_DIR/templates"
safe_move "templates/builder-template-backup.php" "$ARCHIVE_DIR/templates"
safe_move "templates/builder-template.php" "$ARCHIVE_DIR/templates"
safe_move "templates/partials" "$ARCHIVE_DIR/templates"

# ================================================
# ARCHIVE BUILD SCRIPTS
# ================================================
echo ""
echo "Archiving legacy build scripts..."
safe_move "build.bat" "$ARCHIVE_DIR"
safe_move "build.sh" "$ARCHIVE_DIR"
safe_move "build.js" "$ARCHIVE_DIR"
safe_move "rebuild.bat" "$ARCHIVE_DIR"
safe_move "clean-rebuild.bat" "$ARCHIVE_DIR"
safe_move "force-rebuild.bat" "$ARCHIVE_DIR"
safe_move "rebuild-vue.bat" "$ARCHIVE_DIR"

# ================================================
# ARCHIVE LEGACY DEBUG FILES
# ================================================
echo ""
echo "Archiving legacy debug files..."
mkdir -p "$ARCHIVE_DIR/debug"
if [ -d "debug" ]; then
    find debug -name "*.js" -type f -exec mv {} "$ARCHIVE_DIR/debug/" \; 2>/dev/null
fi
safe_move "test-*.js" "$ARCHIVE_DIR"

# ================================================
# CREATE ARCHIVE INFO FILE
# ================================================
echo ""
echo "Creating archive info file..."
cat > "$ARCHIVE_DIR/ARCHIVE_INFO.txt" << EOF
Media Kit Builder - Legacy Code Archive
========================================
Archive Date: $(date)
Archive Reason: Migration to 100% Vue Architecture

This archive contains all legacy JavaScript and related files
that were removed during the migration to Vue-only architecture.

Contents:
- js/              : Legacy JavaScript files (60+ files)
- system/*.js      : Legacy system JavaScript
- includes/        : Legacy enqueue files
- templates/       : Legacy PHP templates
- build scripts    : Legacy build tools
- debug/           : Legacy debug tools

To restore (NOT RECOMMENDED):
1. Copy files back to their original locations
2. Update guestify-media-kit-builder.php to use enqueue.php
3. Add back GMKB_PURE_VUE_MODE constant

For questions, check LEGACY-REMOVAL-PLAN.md
EOF

# ================================================
# CREATE RESTORATION SCRIPT
# ================================================
echo ""
echo "Creating restoration script (for emergency use only)..."
cat > "$ARCHIVE_DIR/restore-legacy.sh" << 'RESTORE_EOF'
#!/bin/bash
echo "WARNING: This will restore legacy code and break Vue-only mode!"
echo "Are you sure? (type 'yes' to continue)"
read confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Restoration cancelled"
    exit 1
fi

# Restore files
cp -r js ../../ 2>/dev/null
cp -r system/*.js ../../system/ 2>/dev/null
cp -r includes/* ../../includes/ 2>/dev/null
cp -r templates/* ../../templates/ 2>/dev/null

echo "Legacy files restored. You must now:"
echo "1. Edit guestify-media-kit-builder.php"
echo "2. Change require to use enqueue.php instead of enqueue-vue-only.php"
echo "3. Add define('GMKB_PURE_VUE_MODE', false);"
RESTORE_EOF

chmod +x "$ARCHIVE_DIR/restore-legacy.sh"

# ================================================
# SUMMARY
# ================================================
echo ""
echo "========================================="
echo "Archive Complete!"
echo "========================================="
echo "Archive location: $ARCHIVE_DIR"
echo ""
echo "Files archived:"
if [ -d "$ARCHIVE_DIR/js" ]; then
    echo "  - $(find "$ARCHIVE_DIR/js" -type f 2>/dev/null | wc -l) JavaScript files"
fi
if [ -d "$ARCHIVE_DIR/system" ]; then
    echo "  - $(find "$ARCHIVE_DIR/system" -type f 2>/dev/null | wc -l) system files"
fi
if [ -d "$ARCHIVE_DIR/templates" ]; then
    echo "  - $(find "$ARCHIVE_DIR/templates" -type f 2>/dev/null | wc -l) template files"
fi
echo ""
echo "Next steps:"
echo "1. Test the Media Kit Builder"
echo "2. Verify everything works with Vue-only mode"
echo "3. If all good, you can delete the archive later"
echo ""
echo "To delete archive permanently:"
echo "  rm -rf $ARCHIVE_DIR"
echo ""
echo "Done!"
