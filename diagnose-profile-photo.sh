#!/bin/bash
# Diagnostic script to check component registration

echo "=== PROFILE PHOTO COMPONENT DIAGNOSTIC ==="
echo ""

echo "1. Checking if component directory exists..."
if [ -d "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/components/profile-photo" ]; then
    echo "✅ Directory exists"
else
    echo "❌ Directory NOT found"
    exit 1
fi

echo ""
echo "2. Checking component files..."
files=(
    "component.json"
    "ProfilePhotoRenderer.vue"
    "ProfilePhotoEditor.vue"
    "schema.json"
    "styles.css"
)

for file in "${files[@]}"; do
    if [ -f "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/components/profile-photo/$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file MISSING"
    fi
done

echo ""
echo "3. Checking component.json type field..."
type=$(grep -o '"type"[[:space:]]*:[[:space:]]*"[^"]*"' "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/components/profile-photo/component.json" | cut -d'"' -f4)
if [ "$type" == "profile-photo" ]; then
    echo "✅ Type is correct: $type"
else
    echo "❌ Type mismatch: $type (expected: profile-photo)"
fi

echo ""
echo "4. Checking if Vue renderer follows naming convention..."
if [ -f "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/components/profile-photo/ProfilePhotoRenderer.vue" ]; then
    echo "✅ ProfilePhotoRenderer.vue follows *Renderer.vue pattern"
else
    echo "❌ Vue renderer file doesn't match expected pattern"
fi

echo ""
echo "5. Checking dist build files..."
if [ -f "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/dist/gmkb.iife.js" ]; then
    build_date=$(stat -c %y "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/dist/gmkb.iife.js" 2>/dev/null || stat -f "%Sm" "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/dist/gmkb.iife.js" 2>/dev/null)
    echo "✅ Build file exists"
    echo "   Last modified: $build_date"
    
    # Check if profile-photo is in the bundle
    if grep -q "profile-photo" "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/dist/gmkb.iife.js"; then
        echo "✅ profile-photo found in bundle"
    else
        echo "❌ profile-photo NOT found in bundle - BUILD REQUIRED"
    fi
else
    echo "❌ Build file NOT found - BUILD REQUIRED"
fi

echo ""
echo "=== DIAGNOSTIC COMPLETE ==="
echo ""
echo "If any ❌ appear above, that's the issue to fix."
echo "If all ✅ but still not working, run: npm run build"
