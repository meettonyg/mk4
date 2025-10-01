#!/bin/bash

# Media Kit Builder Deployment Script
echo "🚀 Building Media Kit Builder for Production..."

# 1. Build assets
echo "📦 Building JavaScript assets..."
npm run build

# 2. Check if build succeeded
if [ ! -f "dist/gmkb.iife.js" ]; then
    echo "❌ Build failed! dist/gmkb.iife.js not found"
    exit 1
fi

echo "✅ Build successful!"

# 3. Create deployment package
echo "📁 Creating deployment package..."

# Create temp deployment directory
rm -rf deploy-temp
mkdir deploy-temp
mkdir deploy-temp/guestify-media-kit-builder

# Copy required files
echo "📋 Copying files..."
cp -r admin deploy-temp/guestify-media-kit-builder/
cp -r components deploy-temp/guestify-media-kit-builder/
cp -r css deploy-temp/guestify-media-kit-builder/
cp -r dist deploy-temp/guestify-media-kit-builder/
cp -r includes deploy-temp/guestify-media-kit-builder/
cp -r js deploy-temp/guestify-media-kit-builder/
cp -r partials deploy-temp/guestify-media-kit-builder/
cp -r system deploy-temp/guestify-media-kit-builder/
cp -r templates deploy-temp/guestify-media-kit-builder/
cp -r themes deploy-temp/guestify-media-kit-builder/
cp guestify-media-kit-builder.php deploy-temp/guestify-media-kit-builder/
cp index.php deploy-temp/guestify-media-kit-builder/
cp README.md deploy-temp/guestify-media-kit-builder/

# Create ZIP file
echo "🗜️ Creating ZIP file..."
cd deploy-temp
zip -r ../guestify-media-kit-builder-production.zip guestify-media-kit-builder -q
cd ..

# Clean up
rm -rf deploy-temp

echo "✅ Deployment package created: guestify-media-kit-builder-production.zip"
echo "📌 This ZIP file can be uploaded via WordPress Admin → Plugins → Add New → Upload"
echo ""
echo "📊 Package contents:"
echo "  - Compiled JavaScript (dist/)"
echo "  - All PHP files"
echo "  - All components and themes"
echo "  - All CSS files"
echo "  - NO source files (src/)"
echo "  - NO node_modules"
echo "  - NO development files"
echo ""
echo "🎉 Ready to deploy!"
