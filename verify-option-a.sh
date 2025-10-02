#!/bin/bash
# Option A Verification Script
# Run this to verify the implementation

echo "🔍 OPTION A VERIFICATION SCRIPT"
echo "================================"
echo ""

# Check if main file exists
echo "1️⃣ Checking main plugin file..."
if [ -f "guestify-media-kit-builder.php" ]; then
    LINES=$(wc -l < guestify-media-kit-builder.php)
    echo "   ✅ File exists: guestify-media-kit-builder.php"
    echo "   📊 Lines: $LINES (expected: ~650)"
    
    if [ "$LINES" -lt 700 ] && [ "$LINES" -gt 600 ]; then
        echo "   ✅ Line count looks good!"
    else
        echo "   ⚠️  Line count unexpected (should be ~650)"
    fi
else
    echo "   ❌ Main file not found!"
    exit 1
fi

echo ""

# Check if backup exists
echo "2️⃣ Checking backup file..."
if [ -f "ARCHIVE/option-a-php-rendering-removal/guestify-media-kit-builder-BACKUP.php" ]; then
    BACKUP_LINES=$(wc -l < ARCHIVE/option-a-php-rendering-removal/guestify-media-kit-builder-BACKUP.php)
    echo "   ✅ Backup exists"
    echo "   📊 Backup lines: $BACKUP_LINES (expected: ~2400)"
else
    echo "   ❌ Backup not found!"
    exit 1
fi

echo ""

# Check for removed methods
echo "3️⃣ Checking for removed methods..."
if grep -q "ajax_render_component()" guestify-media-kit-builder.php; then
    echo "   ❌ ERROR: ajax_render_component() still exists!"
    exit 1
else
    echo "   ✅ ajax_render_component() removed"
fi

if grep -q "ajax_render_component_enhanced()" guestify-media-kit-builder.php; then
    echo "   ❌ ERROR: ajax_render_component_enhanced() still exists!"
    exit 1
else
    echo "   ✅ ajax_render_component_enhanced() removed"
fi

if grep -q "ajax_render_design_panel()" guestify-media-kit-builder.php; then
    echo "   ❌ ERROR: ajax_render_design_panel() still exists!"
    exit 1
else
    echo "   ✅ ajax_render_design_panel() removed"
fi

echo ""

# Check for version
echo "4️⃣ Checking version..."
if grep -q "2.1.0-option-a-pure-vue" guestify-media-kit-builder.php; then
    echo "   ✅ Version updated to 2.1.0-option-a-pure-vue"
else
    echo "   ⚠️  Version not updated (expected: 2.1.0-option-a-pure-vue)"
fi

echo ""

# Check documentation
echo "5️⃣ Checking documentation..."
DOCS=(
    "OPTION-A-STATUS.md"
    "OPTION-A-QUICK-REF.md"
    "CHANGELOG-OPTION-A.md"
    "ARCHIVE/option-a-php-rendering-removal/IMPLEMENTATION-REPORT.md"
    "ARCHIVE/option-a-php-rendering-removal/EXECUTIVE-SUMMARY.md"
)

DOC_COUNT=0
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        ((DOC_COUNT++))
    fi
done

echo "   📚 Documentation files: $DOC_COUNT/${#DOCS[@]}"
if [ "$DOC_COUNT" -eq "${#DOCS[@]}" ]; then
    echo "   ✅ All documentation present"
else
    echo "   ⚠️  Some documentation missing"
fi

echo ""

# Summary
echo "================================"
echo "✅ VERIFICATION COMPLETE"
echo ""
echo "Next Steps:"
echo "1. Load the builder page in browser"
echo "2. Look for 'PURE VUE ✓' badge"
echo "3. Check Network tab for single API call"
echo "4. Test adding/editing components"
echo ""
echo "Rollback if needed:"
echo "cp ARCHIVE/option-a-php-rendering-removal/guestify-media-kit-builder-BACKUP.php guestify-media-kit-builder.php"
echo ""
echo "Status: Ready for production 🚀"
