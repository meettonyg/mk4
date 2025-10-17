#!/bin/bash
# Verification Script for CSS Architecture Fix
# Checks that all PHP templates have the component-root wrapper

echo "========================================="
echo "CSS ARCHITECTURE VERIFICATION"
echo "========================================="
echo ""

# Count total templates
total=$(find components/*/template.php -type f 2>/dev/null | wc -l)
echo "Total PHP templates found: $total"

# Count templates with component-root
with_root=$(grep -l "component-root" components/*/template.php 2>/dev/null | wc -l)
echo "Templates with component-root: $with_root"

echo ""
echo "----------------------------------------"
echo ""

# Check each component
echo "Checking individual components:"
echo ""

for file in components/*/template.php; do
    component=$(echo $file | cut -d'/' -f2)
    
    if grep -q "component-root" "$file"; then
        echo "✅ $component"
    else
        echo "❌ $component - MISSING component-root"
    fi
done

echo ""
echo "----------------------------------------"
echo ""

# Summary
if [ "$total" -eq "$with_root" ]; then
    echo "🎉 SUCCESS: All $total templates have component-root"
    echo ""
    echo "Status: ✅ READY FOR PRODUCTION"
else
    missing=$((total - with_root))
    echo "⚠️  WARNING: $missing templates missing component-root"
    echo ""
    echo "Status: ❌ NOT READY"
fi

echo ""
echo "========================================="
