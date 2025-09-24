# #!/bin/bash
echo "Rebuilding Media Kit Builder with fixes..."
echo ""

# Clean dist directory
echo "Cleaning dist directory..."
rm -rf dist

# Build the application
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "BUILD COMPLETE! Fixes applied:"
echo "- Fixed Pinia store getComponentsInOrder getter"
echo "- Fixed DOM manipulation null parent issue"
echo "- Added store initialization delay"
echo "- Improved error handling and fallbacks"
echo "========================================"
echo ""
echo "Please test the application now."
