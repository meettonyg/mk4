#!/bin/bash
# Fix duplicate component controls issue

echo "🔧 Fixing duplicate component controls..."

# Add all the fixed files
git add js/core/enhanced-component-renderer.js
git add js/core/component-controls-manager.js
git add components/guest-intro/template.php
git add debug/debug-duplicate-controls.js
git add includes/enqueue.php

# Create commit
git commit -m "ROOT FIX: Prevent duplicate component controls

PROBLEMS FIXED:
1. Controls were being attached twice - once during render and once after DOM insertion
2. Modal UI elements were incorrectly getting controls attached
3. Components were rendering in wrong container (preview instead of saved-components)
4. guest-intro template had hardcoded controls and data-component-id

SOLUTIONS:
1. Removed double attachment in renderComponentWithLoader and renderSavedComponents
2. Controls now only attached once, after components are in DOM
3. Updated attachControlsToAllExistingComponents to exclude modal elements
4. Fixed reorderComponents to move components to correct container
5. Cleaned up guest-intro template to match other components

CHECKLIST COMPLIANCE:
✅ No Polling: All fixes use event-driven approaches
✅ Event-Driven: Controls attached via proper DOM events
✅ Root Cause Fix: Fixed the fundamental duplication issues
✅ Code Reduction: Removed redundant control attachment calls
✅ Maintainability: Clearer control attachment flow"

echo "✅ Commit created for duplicate controls fix"
