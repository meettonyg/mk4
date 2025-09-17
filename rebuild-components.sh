#!/bin/bash
# Quick rebuild script for Media Kit Builder

echo "========================================="
echo "Rebuilding Media Kit Builder with Vite"
echo "========================================="

cd "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4"

# Run the build
echo ""
echo "Running npm build..."
npm run build

echo ""
echo "========================================="
echo "Build complete! Changes applied:"
echo "========================================="
echo "✅ Component controls now use professional SVG icons"
echo "✅ Component library modal shows all 17 components"
echo "✅ Professional styling with hover states"
echo "✅ Grid layout for component selection"
echo ""
echo "Please refresh your browser to see the changes."
echo "Use Ctrl+Shift+R for a hard refresh if needed."
echo "========================================="
