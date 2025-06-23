#!/bin/bash
# Git commit script for Phase 2A changes

cd "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

# Add all changed files
git add js/core/initialization-manager.js
git add js/core/media-kit-builder-init.js
git add js/core/conditional-loader.js
git add js/modals/component-library.js
git add js/modals/global-settings.js
git add test-phase2a-modals.js
git add docs/implementation-plan/summaries/phase-2a-modal-fix-summary.md

# Commit with descriptive message
git commit -m "Phase 2A: Fix modal race condition with promise-based initialization

- Enhanced initialization-manager.js with modal validation steps
- Converted component-library.js to promise-based setup
- Updated global-settings.js with better element handling
- Modified conditional-loader.js to prevent duplicate initialization
- Added comprehensive test suite for modal functionality
- Expected improvement: 66.7% → 99%+ success rate

Fixes the 'Amazon issues' where modal buttons had no event listeners"

echo "Git commit completed for Phase 2A"
