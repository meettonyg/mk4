#!/bin/bash
echo "=====================================" 
echo "XSS SANITIZER FIX - BUILD AND TEST"
echo "====================================="
echo

echo "1. Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi

echo
echo "2. Build successful!"
echo "3. Checking for XSS sanitizer in build..."

# Check if XSS sanitizer is in the built file
if grep -q "XSSSanitizer" dist/gmkb.iife.js; then
    echo "   ✅ XSS Sanitizer found in build"
else
    echo "   ❌ WARNING: XSS Sanitizer might be missing from build"
fi

if grep -q "__GMKB_XSS_SANITIZER_LOADED__" dist/gmkb.iife.js; then
    echo "   ✅ XSS Sanitizer side-effect marker found"
else
    echo "   ⚠️  Side-effect marker not found (might be minified)"
fi

echo
echo "4. Next steps:"
echo "   a) Deploy the updated dist/gmkb.iife.js to your WordPress site"
echo "   b) Hard refresh your browser (Ctrl+Shift+R)"
echo "   c) Open browser console"
echo "   d) Test with: GMKB.debugSanitization('https://example.com', 'website')"
echo "   e) Run the full test suite (see test-xss-sanitizer-production.js)"
echo

echo "5. Quick test commands:"
echo "   GMKB.services.xss  // Should return the XSS sanitizer object"
echo "   GMKB.debugSanitization('https://example.com', 'website')  // Test URL"
echo "   GMKB.debugSanitization('CEO & Founder', 'position')  // Test text"
echo
