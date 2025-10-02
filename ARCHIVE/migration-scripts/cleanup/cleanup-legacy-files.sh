#!/bin/bash
# Legacy File Cleanup Script
# Removes ComponentLoader.php and DesignPanel.php from system/ directory
# These files have been archived to ARCHIVE/legacy-rendering/

echo "🧹 Legacy Cleanup Script"
echo "========================"
echo ""

# Define paths
SYSTEM_DIR="system"
ARCHIVE_DIR="ARCHIVE/legacy-rendering"

# Files to remove
FILES_TO_REMOVE=(
    "ComponentLoader.php"
    "DesignPanel.php"
)

# Verify archive exists
if [ ! -d "$ARCHIVE_DIR" ]; then
    echo "❌ ERROR: Archive directory not found: $ARCHIVE_DIR"
    exit 1
fi

# Verify archived files exist
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ ! -f "$ARCHIVE_DIR/$file" ]; then
        echo "❌ ERROR: Archived file not found: $ARCHIVE_DIR/$file"
        exit 1
    fi
done

echo "✅ Archive verification complete"
echo ""

# Remove files from system/
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$SYSTEM_DIR/$file" ]; then
        echo "🗑️  Removing $SYSTEM_DIR/$file..."
        rm "$SYSTEM_DIR/$file"
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Removed successfully"
        else
            echo "   ❌ Failed to remove"
            exit 1
        fi
    else
        echo "⚠️  File not found (may already be removed): $SYSTEM_DIR/$file"
    fi
done

echo ""
echo "🎉 Cleanup complete!"
echo ""
echo "Summary:"
echo "- Files archived to: $ARCHIVE_DIR/"
echo "- Files removed from: $SYSTEM_DIR/"
echo "- Plugin will now use Pure Vue architecture exclusively"
echo ""
echo "To restore (if needed): cp $ARCHIVE_DIR/*.php $SYSTEM_DIR/"
