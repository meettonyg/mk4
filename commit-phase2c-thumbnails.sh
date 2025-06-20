#!/bin/bash

# Commit Phase 2C Final Fix: Template Thumbnails

echo "Committing Phase 2C template thumbnail fixes..."

# Add modified files
git add includes/enqueue.php
git add js/services/template-loader.js

# Create commit
git commit -m "Fix Phase 2C: Template thumbnail 404 errors

- Removed non-existent image references from enqueue.php
- Added CSS-based placeholder thumbnails in template-loader.js
- Templates now show document icon (📄) instead of broken images
- Graceful fallback if images are added later (onerror handler)

This eliminates the 404 errors for template thumbnails while maintaining
the visual template grid functionality."

echo "Phase 2C thumbnail fix committed successfully!"
