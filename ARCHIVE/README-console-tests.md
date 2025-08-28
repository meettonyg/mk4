# GMKB Console Test Suite - Usage Documentation

## Quick Start (3 Steps)

1. **Load the test harness** in your browser console:
   ```javascript
   // Copy and paste the contents of console-test-suite.js
   ```

2. **Load additional test scripts** (optional):
   ```javascript
   // Copy and paste contents of test-matrix.js, test-runlists.js, test-cleanup.js
   ```

3. **Run tests**:
   ```javascript
   await GMKBTest.run('smoke')  // Quick smoke tests
   await GMKBTest.run('full')   // Comprehensive tests
   ```

## Available Test Runlists

### Smoke Tests (Recommended)
Fast, safe tests for essential functionality:
```javascript
await GMKBTest.run('smoke')
```
- **Tests**: A1, A2, A3, B2, C2, D1
- **Duration**: ~30 seconds
- **Safe**: Non-destructive, auto-cleanup

### Full Test Suite
Comprehensive testing of all functionality:
```javascript
await GMKBTest.run('full')
```
- **Tests**: All implemented tests
- **Duration**: ~2 minutes
- **Comprehensive**: Tests all major features

### Focused Test Suites
Run specific categories:
```javascript
await GMKBTest.run('components')  // Component system tests
await GMKBTest.run('state')       // State management tests  
await GMKBTest.run('ui')          // UI integration tests
await GMKBTest.run('wordpress')   // WordPress integration tests
```

### Single Tests
Run individual tests:
```javascript
await GMKBTest.tests.A1()  // Component discovery
await GMKBTest.tests.A2()  // Add component
await GMKBTest.tests.B2()  // Auto-save functionality
```

## Test Categories

### A Series - Component System
- **A1**: Component Discovery & Availability
- **A2**: Add Component → Render → Attach Controls  
- **A3**: Edit Component via Design Panel
- **A4**: Duplicate Component
- **A5**: Delete Component
- **A6**: Reorder Components

### B Series - State Management
- **B1**: Initialize from Saved Data
- **B2**: Auto-save after Edits
- **B3**: Undo/Redo Sequence

### C Series - UI Integration
- **C2**: Toolbar Button Functionality

### D Series - WordPress Integration
- **D1**: Localized Data Presence

## Configuration Options

### Test Configuration
```javascript
// Modify test behavior
GMKBTest.config.timeout = 10000;    // Set timeout (ms)
GMKBTest.config.verbose = true;     // Enable verbose logging
GMKBTest.config.cleanup = true;     // Auto-cleanup between tests
GMKBTest.config.failFast = false;   // Stop on first failure
```

### Selector Customization
```javascript
// Override selectors if your markup differs
GMKBTest.selectors.componentItem = '[data-component-id]';
GMKBTest.selectors.btnEdit = '[data-action="edit"]';
GMKBTest.selectors.designPanel = '#design-panel';
// ... etc
```

## Utility Functions

### State Management
```javascript
GMKBTest.getState()                    // Get current state
GMKBTest.setState({...})               // Set state patch
GMKBTest.snapshot('label')             // Take state snapshot
GMKBTest.diff(stateA, stateB)         // Compare states
```

### Component Helpers
```javascript
GMKBTest.addComponent('hero', {title: 'Test'})  // Add test component
GMKBTest.selectComponent({id: 'comp-123'})      // Select component
GMKBTest.removeComponent('comp-123')            // Remove component
```

### UI Helpers
```javascript
GMKBTest.waitForSelector('.my-element')         // Wait for element
GMKBTest.waitForEvent('gmkb:ready')            // Wait for event
GMKBTest.clickControl(element, 'edit')         // Click component control
GMKBTest.setField('input[name="title"]', 'New Title')  // Set field value
```

### Cleanup
```javascript
GMKBTest.cleanup()         // Full cleanup
GMKBTest.quickCleanup()    // Fast cleanup
GMKBTest.deepCleanup()     // Thorough cleanup
```

## Common Errors & Solutions

### "GMKBTest harness not loaded"
**Solution**: Copy and paste the contents of `console-test-suite.js` first.

### "Not on Media Kit Builder page"
**Solution**: Navigate to the Media Kit Builder page before running tests.

### "Core systems not available"
**Solution**: Wait for the page to fully load and GMKB to initialize.

### Test timeouts
**Solution**: Increase timeout or check if page is responding:
```javascript
GMKBTest.config.timeout = 15000;  // Increase to 15 seconds
```

### Selector not found errors
**Solution**: Update selectors to match your implementation:
```javascript
GMKBTest.selectors.btnEdit = '.your-edit-button-selector';
```

## Performance Monitoring

### Run with performance tracking:
```javascript
await GMKBTest.runWithPerfMonitoring('smoke')
```

This provides:
- Total duration
- Average time per test
- Memory usage delta
- Performance warnings

## Advanced Usage

### Custom Test Lists
```javascript
// Run specific tests
await GMKBTest.run(['A1', 'A2', 'B2'])

// Run single test
await GMKBTest.run('A1')
```

### Error Recovery
```javascript
// Run with rollback protection
await GMKBTest.withRollback(async () => {
    await GMKBTest.tests.A3();
    // If error occurs, state will be rolled back
});
```

### Batch Operations
```javascript
// Take snapshot before testing
GMKBTest.snapshot('before-testing');

// Run tests
await GMKBTest.run('smoke');

// Compare results
const after = GMKBTest.getState();
const before = GMKBTest.state.snapshots.get('before-testing');
const differences = GMKBTest.diff(before, after);
```

## Safety Features

### Non-Destructive by Default
- Tests use temporary components with `test-` prefixes
- Auto-cleanup removes test artifacts
- Original state preserved via snapshots

### Rollback Protection
- Automatic state snapshots before destructive operations
- Manual rollback available via `withRollback()`
- Cleanup functions restore original state

### Error Handling
- Comprehensive try/catch blocks
- Graceful degradation when systems unavailable
- Detailed error reporting with remediation hints

## Best Practices

### Before Testing
1. Navigate to Media Kit Builder page
2. Wait for full page load
3. Take initial snapshot: `GMKBTest.snapshot('initial')`

### During Testing
1. Run smoke tests first: `await GMKBTest.run('smoke')`
2. Use performance monitoring for full runs
3. Check console for warnings/errors

### After Testing
1. Run cleanup: `GMKBTest.cleanup()`
2. Check test results for failures
3. Review performance metrics

### For Development
1. Use single tests during debugging: `await GMKBTest.tests.A2()`
2. Customize selectors for your markup
3. Add custom cleanup functions for custom components

## Troubleshooting

### Tests Fail Due to Missing Elements
Check and update selectors:
```javascript
console.log('Available buttons:', document.querySelectorAll('button'));
GMKBTest.selectors.btnEdit = 'your-actual-selector';
```

### State Manager Issues
Verify state manager availability:
```javascript
console.log('State manager:', window.enhancedStateManager);
console.log('Component manager:', window.enhancedComponentManager);
```

### AJAX/Network Issues
Check WordPress data:
```javascript
console.log('GMKB Data:', window.gmkbData);
console.log('AJAX URL:', window.gmkbData?.ajaxUrl);
```

### Memory Issues
Monitor memory usage:
```javascript
console.log('Memory:', performance.memory);
await GMKBTest.runWithPerfMonitoring('smoke');
```

## Support

### Getting Help
1. Check console for detailed error messages
2. Verify all prerequisites are met
3. Try smoke tests first before full suite
4. Use diagnostic runlist: `await GMKBTest.run('diagnostic')`

### Reporting Issues
Include:
- Browser and version
- Console errors/warnings  
- Test results object
- Page URL and state

### Extending Tests
Add custom tests to `GMKBTest.tests`:
```javascript
GMKBTest.tests.CUSTOM1 = async function() {
    console.log('Custom test running...');
    // Your test logic
    return { ok: true, details: {} };
};
```

## File Structure

```
tests/
├── console-test-suite.js     # Main test harness
├── test-matrix.js           # Test reference table  
├── test-runlists.js         # Predefined test combinations
├── test-cleanup.js          # Cleanup utilities
├── tests/
│   ├── test-A1-component-discovery.js
│   ├── test-A2-add-component.js
│   ├── test-A3-edit-component.js
│   ├── test-A4-duplicate-component.js
│   ├── test-A5-delete-component.js
│   ├── test-A6-reorder-components.js
│   ├── test-B1-initialize-saved-data.js
│   ├── test-B2-auto-save.js
│   ├── test-B3-undo-redo.js
│   ├── test-C2-toolbar-functionality.js
│   └── test-D1-wordpress-integration.js
└── README.md               # This file
```

Happy testing! 🧪✨
