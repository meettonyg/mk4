#!/bin/bash

# Git commit script for Phase 2B Fixes

echo "📝 Committing Phase 2B Logging System Fixes..."

# Add the modified files
git add js/utils/initialization-tracker.js
git add js/main.js
git add js/core/initialization-manager.js
git add fix-phase2b-timeouts.js
git add docs/implementation-plan/summaries/phase-2b-fixes-summary.md
git add commit-phase2b-fixes.sh

# Create the commit
git commit -m "Fix Phase 2B: Resolve timeout promise rejections and duplicate initialization

## Issues Fixed
1. Timeout promises were firing even after steps completed
2. Duplicate initialization from both DOMContentLoaded and readyState check
3. Unhandled promise rejections cluttering the console

## Solutions
- Added timeout cancellation when steps complete/fail
- Fixed duplicate initialization with single execution path  
- Created executeStep() method for cleaner step handling
- Timeouts only reject if step hasn't completed

## Results
- Clean console output without timeout errors
- No duplicate initialization warnings
- Proper error handling and recovery
- Version updated to 2.0-phase2b-fixed

This ensures the logging system works cleanly without false errors."

echo "✅ Phase 2B fixes committed successfully!"
