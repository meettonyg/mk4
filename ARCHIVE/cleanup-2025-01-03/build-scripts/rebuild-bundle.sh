#!/bin/bash

# Build Script for Media Kit Builder Vue Bundle
# This rebuilds the gmkb.iife.js bundle with the fixed source code

echo "============================================"
echo "Media Kit Builder - Rebuild Vue Bundle"
echo "============================================"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install Node.js and npm first"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the plugin root directory"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building the bundle..."
npm run build

# Check if build was successful
if [ -f "dist/gmkb.iife.js" ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📁 Bundle created at: dist/gmkb.iife.js"
    echo ""
    echo "The bundle now includes:"
    echo "  ✓ Fixed APIService with mkcg_id detection"
    echo "  ✓ Proper post ID handling"
    echo "  ✓ Better error handling"
    echo ""
    echo "🚀 The save functionality should now work correctly!"
else
    echo ""
    echo "❌ Build failed!"
    echo "Please check the error messages above"
    exit 1
fi
