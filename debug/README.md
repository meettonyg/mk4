# Debug Directory

This directory contains debugging and testing files for the Media Kit Builder plugin.

## Structure

### `/diagnostic/`
Contains diagnostic JavaScript files for troubleshooting specific issues:
- `gmkb-diagnostic.js` - Main diagnostic tool
- `diagnose-component-data.js` - Component data debugging
- `diagnostic-container-save-protection.js` - Container save protection diagnostics
- `diagnostic-infinite-loop-fix.js` - Infinite loop detection and fixes
- `diagnostic-saved-components.js` - Saved components diagnostics

Quick test scripts for various functionality:
- Component testing
- Topics/questions debugging
- Button functionality tests
- State synchronization tests
- Various fix verification scripts

### `/php-debug/`
PHP debugging scripts:
- `debug-component-loading.php` - Component loading debug
- `debug-template-logic.php` - Template logic debugging
- `fix-topics-post-id.php` - Topics post ID fixes
- `test-topics-meta.php` - Topics metadata testing

## Usage

These files are NOT loaded in production. To use them:

1. **JavaScript files**: Can be loaded via browser console or temporarily added to enqueue.php
2. **PHP files**: Can be included temporarily in the main plugin file for debugging

## Important

⚠️ These files should NEVER be included in production builds!
