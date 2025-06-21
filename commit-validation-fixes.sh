#!/bin/bash

# Commit the critical validation fixes

echo "📝 Committing Critical Validation & Timing Fixes"

git add js/core/schema-validator.js
git add js/core/initialization-manager.js
git add js/main.js

git commit -m "🔧 CRITICAL FIX: Resolve validation errors and component manager timing

PROBLEMS RESOLVED:
❌ schemaValidator.validate is not a function (state-validator.js:157)
❌ Enhanced component manager init deferred (DOM not ready)
❌ Transaction validation errors preventing component addition
❌ testArchitectureFix function not available

FIXES IMPLEMENTED:
✅ Added missing validate() method to SchemaValidator class
✅ Fixed enhanced component manager initialization timing
✅ Added fallback initialization in modal setup phase
✅ Added testArchitectureFix() function directly to main.js
✅ Improved DOM readiness checks before component manager init

VALIDATION FIXES:
- SchemaValidator now has compatible validate() method for state/transaction validation
- Simple but effective validation that accepts valid data structures
- Proper error handling and return format compatibility

TIMING FIXES:
- Enhanced component manager only initializes when DOM elements are ready
- Fallback initialization during modal setup if initial attempt failed
- Better logging of initialization status and timing

TESTING:
- testArchitectureFix() function now available immediately
- Quick validation of core system availability
- Clear pass/fail reporting for debugging

EXPECTED RESULTS:
✅ No more validation function errors
✅ Component addition should work properly
✅ Enhanced component manager properly initialized
✅ Test function available for validation"

echo "✅ Critical validation fixes committed successfully"