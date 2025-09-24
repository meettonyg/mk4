#!/bin/bash

echo "================================="
echo "Building Vue Media Kit Builder..."
echo "================================="

# Clean previous build
rm -rf dist/gmkb.js

# Run the build
npm run build

# Check if build was successful
if [ -f "dist/gmkb.js" ]; then
    echo ""
    echo "✅ Build successful!"
    echo "File size:"
    ls -lh dist/gmkb.js
else
    echo ""
    echo "❌ Build failed - dist/gmkb.js not found"
    exit 1
fi

echo ""
echo "================================="
echo "Build complete!"
echo "================================="
