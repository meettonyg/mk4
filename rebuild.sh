# Rebuild Script for Media Kit Builder

echo "Rebuilding Media Kit Builder bundle..."

cd "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4"

# Run the build command
npm run build

echo "Build complete! The bundle has been updated with the latest fixes."
echo ""
echo "FIXES APPLIED:"
echo "1. Section controls no longer use emojis - now use professional SVG icons"
echo "2. Fixed duplicate section rendering - components only appear once"
echo "3. Added proper CSS styling for section controls"
echo ""
echo "Please refresh your browser to see the changes."
