#!/bin/bash

# Circular Dependency Fix - Commit Script
# Fixes the circular dependencies causing Phase 3 system initialization failures

echo "🔧 Committing circular dependency fixes..."

git add -A

git commit -m "Fix circular dependencies in Phase 3 systems

CRITICAL FIX: Resolved circular dependencies preventing Phase 3 initialization

Fixed Files:
- js/core/state-history.js: Removed enhancedStateManager import, access via window
- js/core/ui-registry.js: Removed enhancedStateManager import, access via window  
- js/services/save-service.js: Removed enhancedStateManager import, access via window

Changes Made:
- Removed direct imports of enhancedStateManager from dependent modules
- Updated all methods to access enhancedStateManager through window.enhancedStateManager
- Added proper null checks and error handling for missing state manager
- Added retry logic for state subscriptions when state manager not ready yet

RESOLVES: ReferenceError: Cannot access 'enhancedStateManager' before initialization
ADDRESSES: Phase 3 systems failing to load due to circular imports
ENSURES: All Phase 3 systems can now initialize without dependency conflicts

Testing: Run fixed-emergency-phase3-loader.js in browser console"

echo "✅ Circular dependency fixes committed successfully!"
echo ""
echo "🧪 To test the fixes:"
echo "1. Hard refresh the page (Ctrl+F5)"
echo "2. Open browser console"
echo "3. Run the fixed emergency loader:"
echo "   Copy and paste contents of fixed-emergency-phase3-loader.js"
echo "4. Then run the Phase 3 validation test"
echo ""
echo "Expected result: All systems should load without circular dependency errors"
