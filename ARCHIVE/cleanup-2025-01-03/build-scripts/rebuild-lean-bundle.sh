#!/bin/bash
# Rebuild the lean bundle with Vite

echo "🚀 Building Vue/Vite lean bundle..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the bundle
echo "⚙️ Building with Vite..."
npm run build

# Check if build succeeded
if [ -f "dist/gmkb.iife.js" ]; then
    echo "✅ Bundle built successfully!"
    echo "📊 Bundle size: $(du -h dist/gmkb.iife.js | cut -f1)"
    
    # Clear any cached files
    echo "🧹 Clearing WordPress cache..."
    rm -rf ../wp-content/cache/*
    
    echo "✨ Done! The lean bundle is ready."
    echo ""
    echo "📝 Next steps:"
    echo "1. Clear browser cache"
    echo "2. Reload the Media Kit Builder page"
    echo "3. Verify only 1 bundle loads (not 60+ scripts)"
else
    echo "❌ Build failed! Check for errors above."
    exit 1
fi