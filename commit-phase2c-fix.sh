#!/bin/bash

# Commit Phase 2C Fix: REST API URL Correction

echo "Committing Phase 2C fixes..."

# Add modified files
git add includes/enqueue.php
git add js/services/template-preloader.js
git add js/components/dynamic-component-loader.js
git add test-phase2c-fix.js

# Create commit
git commit -m "Fix Phase 2C: Correct REST API URL construction

- Fixed template-preloader.js to use site URL instead of plugin URL for REST API
- Added siteUrl to guestifyData localization in enqueue.php
- Added preset templates array for template library functionality
- Fixed dynamic-component-loader.js REST API URL construction
- Created test file to verify REST endpoint

The batch template endpoint now correctly uses:
/wp-json/guestify/v1/templates/batch
instead of:
/wp-content/plugins/.../wp-json/guestify/v1/templates/batch

This fixes the 404 errors and allows template preloading to work correctly."

echo "Phase 2C fixes committed successfully!"
