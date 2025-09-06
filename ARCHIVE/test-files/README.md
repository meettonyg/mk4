# Test Files Archive

## Date: Current
## Purpose: Phase 5 Cleanup - Test File Organization

This archive contains all test and diagnostic files that were scattered throughout the codebase. These files have been organized and archived to keep the production code clean while preserving the testing utilities for future reference.

## Archive Structure

```
ARCHIVE/test-files/
├── tests/                    # Main test suite (60+ test scripts)
├── debug-tests/              # Debug directory test files
│   ├── quick-tests/          # Quick test utilities
│   └── test-fixes/           # Test fix scripts
├── js-tests/                 # JavaScript test files
├── component-tests/          # Component-specific tests
│   └── topics-testing/       # Topics component tests
└── cleanup-log.js           # Cleanup documentation
```

## Categories of Test Files

### 1. **Integration Tests** (`tests/`)
- Complete test suites (A1-A6, B1-B3, C2, D1)
- Phase integration tests
- System verification tests
- Component lifecycle tests

### 2. **Debug Tests** (`debug-tests/`)
- Quick diagnostic scripts
- Fix verification tests
- Manual testing utilities
- Browser console tests

### 3. **Component Tests** (`component-tests/`)
- Component-specific test runners
- Topics component master test runner
- Individual component validators

### 4. **JavaScript Tests** (`js-tests/`)
- Client-side test utilities
- DOM manipulation tests
- Event handling tests

## Test Naming Convention

Tests follow these naming patterns:
- `test-*.js` - General test files
- `test-A#-*.js` - Component operation tests
- `test-B#-*.js` - State management tests
- `test-C#-*.js` - UI tests
- `test-D#-*.js` - WordPress integration tests
- `*-fix-test.js` - Fix verification tests
- `quick-*.js` - Quick manual tests

## How to Use Archived Tests

### Running Tests from Archive

1. **Browser Console Tests**:
   ```javascript
   // Load a test file
   const script = document.createElement('script');
   script.src = '/wp-content/plugins/mk4/ARCHIVE/test-files/tests/test-A1-component-discovery.js';
   document.head.appendChild(script);
   ```

2. **Manual Testing**:
   - Copy specific test file back to active directory
   - Run in browser console
   - Move back to archive when done

3. **Automated Testing**:
   - Tests can be integrated into CI/CD pipeline
   - Reference from archive location

## Important Test Files

### Core Functionality Tests
- `test-A1-component-discovery.js` - Component system validation
- `test-B2-auto-save.js` - Auto-save functionality
- `test-D1-wordpress-integration.js` - WordPress integration

### Fix Verification Tests
- `test-component-controls-root-fix.js` - Controls fix validation
- `test-section-integration.js` - Section system validation
- `test-wordpress-save-load.js` - Save/load verification

### Quick Diagnostic Tests
- `quick-tests/console-test-suite.js` - Browser console test suite
- `diagnostic/system-diagnostic.js` - System health check

## Test Statistics

- **Total Test Files**: 100+
- **Test Categories**: 10
- **Test Suites**: 6 major suites
- **Quick Tests**: 15+
- **Fix Verification Tests**: 20+

## Restoration

To restore any test file to active use:

```bash
# Example: Restore a specific test
cp ARCHIVE/test-files/tests/test-A1-component-discovery.js debug/

# Or restore entire test suite
cp -r ARCHIVE/test-files/tests/* tests/
```

## Notes

- All tests are preserved in working condition
- Tests reference production code paths
- Some tests may need path updates if code structure changes
- Console tests can be run directly without restoration

## Related Documentation

- See `docs/test-scripts-summary.md` for test descriptions
- See `docs/TEST_SCRIPTS.md` for detailed test documentation
- See root `Media Kit Builder QA Testing Plan.md` for testing procedures
