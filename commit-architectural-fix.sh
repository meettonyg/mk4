#!/bin/bash

# Commit the architectural fixes for circular dependency resolution

echo "📝 Committing Critical Architecture Fix - Function Name Resolution"

git add js/core/system-registrar.js
git add js/core/system-initializer.js
git add js/core/conditional-loader.js
git add js/core/initialization-manager.js
git add js/main.js
git add js/modals/component-library.js
git add test-new-architecture.js
git add test-architecture-fix.js

git commit -m "🔧 CRITICAL FIX: Resolve initializeSystems function name conflict

PROBLEM RESOLVED:
❌ TypeError: initializeSystems is not a function (initialization-manager.js:287)
❌ Enhanced component manager still missing after initialization
❌ SVG attribute malformation causing console errors
❌ Circular dependency preventing proper system initialization

ARCHITECTURAL SOLUTION:
✅ Created js/core/system-registrar.js - Dependency-free system registry
✅ Created js/core/system-initializer.js - Handles global system exposure
✅ Refactored js/core/conditional-loader.js - Renamed to selectAndRegisterSystems
✅ Updated js/core/initialization-manager.js - Fixed function import
✅ Updated js/main.js - Better error handling and fallbacks
✅ Fixed SVG icon rendering in component-library.js

NEW FLOW:
1. main.js calls selectAndRegisterSystems() to load systems
2. main.js calls initializeCoreSystems() to expose globally  
3. main.js calls initializationManager.initialize() for remaining setup
4. Enhanced component manager properly available as window.enhancedComponentManager

RESULTS:
✅ No more 'initializeSystems is not a function' errors
✅ Enhanced component manager accessible globally
✅ Component addition functionality restored
✅ SVG console errors eliminated
✅ Circular dependencies resolved
✅ Clear architectural separation of concerns

Based on Gemini's circular dependency analysis - addresses root cause"

echo "✅ Critical architecture fix committed successfully"