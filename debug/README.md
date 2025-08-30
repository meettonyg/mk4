# Debug Tools Directory

## Purpose

This directory contains debugging and diagnostic tools for the Media Kit Builder plugin. These files should **NOT** be included in production builds.

## Directory Structure

### `/diagnostic/`
Diagnostic tools for specific issues:
- `quick-diagnostic.js` - Quick system status check
- `save-diagnostics.js` - Save functionality diagnostics
- `state-loading-diagnostics.js` - State loading analysis
- `undo-redo-diagnostics.js` - Undo/redo system diagnostics

### `/quick-tests/`
Quick test scripts for rapid debugging during development

### `/test-fixes/`
Temporary fixes and debugging scripts for specific issues:
- `cleanup-legacy-controls.js` - Legacy control cleanup
- `debug-controls-attachment.js` - Control attachment debugging
- `debug-controls-visibility.js` - Control visibility issues
- `fix-controls.js` - Control system fixes

### `/php-debug/`
PHP debugging scripts and tools

### `/discarded/`
Old debug scripts kept for reference but no longer active

## Main Debug Files

### System Diagnostics
- `blank-screen-diagnostic.js` - Diagnose blank screen issues
- `diagnose-saved-components.js` - Saved component analysis
- `debug-duplicate-controls.js` - Duplicate control detection

### Emergency Fixes
- `emergency-blank-screen-fix.js` - Emergency fix for blank screens
- `clear-test-components.js` - Clear test data

### Component Testing
- `test-component-interactions.js` - Component interaction testing
- `test-edit-functionality.js` - Edit functionality validation
- `verify-component-controls-fix.js` - Control fix verification

### Section System
- `section-component-integration-test.js` - Section integration testing
- `section-rendering-quickfix.js` - Section rendering fixes
- `test-section-fix.js` - Section system fixes

## Usage

### Loading Debug Tools

```javascript
// Load a debug script
const script = document.createElement('script');
script.src = '/wp-content/plugins/guestify-media-kit-builder/debug/blank-screen-diagnostic.js';
document.head.appendChild(script);
```

### Quick Diagnostics

```javascript
// Run quick diagnostic
window.runQuickDiagnostic?.();

// Check save functionality
window.runSaveDiagnostics?.();

// Analyze state loading
window.runStateLoadingDiagnostics?.();
```

### Emergency Fixes

```javascript
// Apply emergency blank screen fix
window.applyEmergencyFix?.();

// Clear test components
window.clearTestComponents?.();

// Fix component controls
window.fixComponentControls?.();
```

## Debug Mode

Enable debug mode for verbose output:
```javascript
window.gmkbData.debugMode = true;
```

## Development Workflow

1. **Identify Issue**: Use diagnostic tools to identify the problem
2. **Apply Debug Script**: Load appropriate debug script
3. **Test Fix**: Verify the fix works
4. **Implement Properly**: Move fix to production code
5. **Archive Debug Script**: Move to `/discarded/` when no longer needed

## Important Notes

⚠️ **PRODUCTION WARNING**: These files should NOT be deployed to production
- Add `/debug/` to `.gitignore` for production branches
- Remove debug script references from `enqueue.php` before deployment
- Clear browser cache after removing debug scripts

## Creating New Debug Tools

Template for new debug scripts:
```javascript
/**
 * Debug Tool: [Name]
 * Purpose: [Description]
 * Author: [Your name]
 * Date: [Creation date]
 * 
 * Usage: window.[functionName]()
 */
(function() {
    'use strict';
    
    console.log('🔧 Debug Tool: [Name] loading...');
    
    window.[functionName] = function() {
        console.log('🔍 Running [Name] diagnostic...');
        
        // Diagnostic code here
        
        console.log('✅ [Name] diagnostic complete');
    };
    
    console.log('✅ Debug Tool: [Name] ready - Use window.[functionName]()');
})();
```

## Cleanup Schedule

Debug files should be reviewed and cleaned up:
- **Weekly**: Move unused scripts to `/discarded/`
- **Monthly**: Delete scripts from `/discarded/` older than 3 months
- **Before Release**: Ensure no debug scripts in production code

## Contact

For questions about debug tools, check the main project documentation or contact the development team.
