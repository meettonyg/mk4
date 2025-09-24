#!/bin/bash
# Rebuild script for Linux/Mac users

echo "Building Media Kit Builder bundle..."
echo ""
echo "This will rebuild the JavaScript bundle with the save fix."
echo ""

npm run build

echo ""
echo "Build complete! Refresh your browser to load the updated bundle."
