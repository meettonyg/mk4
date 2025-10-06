#!/bin/bash
# Test script to validate component reference normalization

echo "Testing Media Kit Component Reference Normalization"
echo "===================================================="

# Run npm build to compile the changes
echo "Building Vue bundle..."
cd C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Check if the build output exists
if [ -f dist/gmkb.iife.js ]; then
    echo "✅ Bundle created: dist/gmkb.iife.js"
    
    # Check file size
    size=$(stat -c%s "dist/gmkb.iife.js")
    echo "   Bundle size: $((size / 1024)) KB"
else
    echo "❌ Bundle not found"
    exit 1
fi

echo ""
echo "Test Steps:"
echo "1. Clear browser cache"
echo "2. Load media kit: /media-kit/?mkcg_id=32372"
echo "3. Check console for normalization messages:"
echo "   - Should see: '🔧 Normalizing object reference to string'"
echo "   - Should NOT see: 'Failed to load component undefined'"
echo "4. Verify all components render correctly"
echo ""
echo "Expected Behaviors:"
echo "- Components display without errors"
echo "- No 'undefined' type components"
echo "- Multi-column sections work properly"
