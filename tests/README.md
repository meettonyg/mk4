# Media Kit Builder Test Suite

## Directory Structure

This directory contains all test files for the Media Kit Builder plugin. Tests are organized by functionality and phase.

### Main Test Categories

#### Core Functionality Tests (test-A*.js)
- `test-A1-component-discovery.js` - Component discovery system tests
- `test-A2-add-component.js` - Component addition functionality
- `test-A3-edit-component.js` - Component editing capabilities
- `test-A4-duplicate-component.js` - Component duplication logic
- `test-A5-delete-component.js` - Component deletion functionality
- `test-A6-reorder-components.js` - Component reordering and drag-drop

#### State Management Tests (test-B*.js)
- `test-B1-initialize-saved-data.js` - Saved data initialization
- `test-B2-auto-save.js` - Auto-save functionality
- `test-B3-undo-redo.js` - Undo/redo state management

#### UI Tests (test-C*.js)
- `test-C2-toolbar-functionality.js` - Toolbar interactions and controls

#### Integration Tests (test-D*.js)
- `test-D1-wordpress-integration.js` - WordPress integration points

### Component-Specific Tests

Located in `component-tests/` subdirectory:

#### Topics Component Tests
- `master-test-runner.js` - Orchestrates all topics tests
- `end-to-end-validation.js` - Complete workflow testing
- `error-state-validation.js` - Error handling scenarios
- `performance-validation.js` - Performance benchmarks
- `post-id-diagnostic.js` - Post ID detection diagnostics
- `post-id-fix-helper.js` - Post ID issue remediation

### Architecture & Phase Tests

#### Phase Implementation Tests
- `test-phase1-fixes.js` - Phase 1 implementation validation
- `test-phase2-implementation.js` - Phase 2 component configuration
- `test-phase3-optimization.js` - Phase 3 optimization checks
- `test-phase-integration.js` - Cross-phase integration

#### System Tests
- `test-scalable-architecture.js` - Architecture scalability
- `test-script-isolation.js` - Script isolation and dependencies
- `test-section-integration.js` - Section system integration

### Bug Fix Validation Tests

These tests validate specific bug fixes:
- `test-blank-screen-fix.js` - Blank screen issue resolution
- `test-component-controls-fix.js` - Component controls functionality
- `test-drag-drop-section-fix.js` - Drag-drop within sections
- `test-duplicate-id-fix.js` - Duplicate ID prevention
- `test-empty-state-section-support.js` - Empty state with sections

## Running Tests

### Run All Tests
```javascript
// In browser console
window.runAllTests();
```

### Run Specific Test Suite
```javascript
// Run component tests
window.runComponentTests();

// Run state management tests
window.runStateTests();

// Run integration tests
window.runIntegrationTests();
```

### Run Individual Test
```javascript
// Load and run specific test
const script = document.createElement('script');
script.src = '/wp-content/plugins/guestify-media-kit-builder/tests/test-A1-component-discovery.js';
document.head.appendChild(script);
```

## Test Utilities

- `test-suite-loader.js` - Loads multiple test files
- `test-matrix.js` - Runs test combinations
- `test-runlists.js` - Predefined test sequences
- `validation-script.js` - General validation utilities

## Adding New Tests

1. Name test files descriptively: `test-[category]-[specific-feature].js`
2. Include test metadata at the top of each file
3. Follow the established test structure:
   ```javascript
   (function() {
       'use strict';
       
       console.log('🧪 Test: [Name] starting...');
       
       // Test implementation
       
       console.log('✅ Test: [Name] complete');
   })();
   ```
4. Update this README when adding new test categories

## Debug Mode

Enable debug mode to see verbose test output:
```javascript
window.gmkbData.debugMode = true;
```

## Test Results

Test results are logged to the browser console. Look for:
- ✅ Passed tests (green checkmarks)
- ❌ Failed tests (red X marks)
- ⚠️ Warnings (yellow warning signs)
- 📊 Summary statistics

## Continuous Testing

For development, you can enable continuous testing:
```javascript
// Re-run tests every 30 seconds
setInterval(() => window.runAllTests(), 30000);
```

## Notes

- Tests are designed to run in the browser environment
- Ensure the Media Kit Builder is loaded before running tests
- Some tests require specific page states or components
- Check browser console for detailed error messages
