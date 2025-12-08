# GMKB Field Verification Test - Usage Guide

## 📋 Overview

This console test utility allows you to verify all field values and compare saved database values to frontend displayed values. It performs 5 comprehensive tests to ensure data integrity across your media kit.

## 🚀 Quick Start

### Step 1: Open Frontend Page
Navigate to any page displaying a media kit (e.g., `yourdomain.com/media-kit/32372`)

### Step 2: Open Browser Console
- **Windows/Linux**: Press `F12` or `Ctrl+Shift+J`
- **Mac**: Press `Cmd+Option+J`

### Step 3: Load Test Utility
Copy and paste the entire contents of `console-field-verification-test.js` into the console and press Enter.

### Step 4: Run Tests
```javascript
GMKB_FieldTest.runFullDiagnostic()
```

## 📊 Available Tests

### 1. Full Diagnostic (Recommended)
```javascript
GMKB_FieldTest.runFullDiagnostic()
```
Runs all 5 tests in sequence and displays a comprehensive summary.

### 2. Individual Tests

#### Theme Customizations Test
```javascript
GMKB_FieldTest.testThemeCustomizations()
```
- Verifies saved theme matches loaded theme
- Checks theme object completeness
- Fetches and validates customizations

#### CSS Variables Test
```javascript
GMKB_FieldTest.testCSSVariables()
```
- Counts injected CSS variables
- Validates critical variables exist
- Displays sample values

#### Component Fields Test
```javascript
GMKB_FieldTest.testComponentFields()
```
- Lists all rendered components
- Checks for empty/missing content
- Displays computed styles

#### State vs DOM Test
```javascript
GMKB_FieldTest.testStateVsDOM()
```
- Compares JavaScript state to actual DOM
- Identifies missing components
- Validates synchronization

#### Saved vs Displayed Test
```javascript
GMKB_FieldTest.testSavedVsDisplayed()
```
- Fetches saved data from WordPress
- Compares to frontend display
- Validates theme and component counts

### 3. Admin to Frontend Comparison
```javascript
// Method 1: Automatic (if on same domain)
GMKB_FieldTest.compareAdminToFrontend()

// Method 2: Manual state passing
// Step 1: In admin builder, run:
copy(window.GMKB.stores.mediaKit.getState())

// Step 2: In frontend, run:
GMKB_FieldTest.compareAdminToFrontend(/* paste state here */)
```

## 📈 Reading Test Results

### Console Output Structure

```
🔍 GMKB FIELD VERIFICATION TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Timestamp: 2025-10-21T22:30:00.000Z

━━ TEST 1: Theme Customizations ━━
Saved Theme: professional_clean
Loaded Theme: professional_clean
Theme Match: ✅
...

📊 TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests: 5
✅ Passed: 5
🎉 ALL TESTS PASSED!
```

### Result Object

All test results are automatically stored in:
```javascript
window.GMKB_TestResults
```

Access specific test results:
```javascript
window.GMKB_TestResults.tests.themeCustomizations
window.GMKB_TestResults.tests.cssVariables
window.GMKB_TestResults.tests.componentFields
window.GMKB_TestResults.tests.stateVsDOM
window.GMKB_TestResults.tests.savedVsDisplayed
```

## 🔍 Understanding Test Results

### ✅ Passing Tests
- All checks completed successfully
- Data integrity verified
- No errors or warnings

### ❌ Failing Tests
Common failure scenarios:

#### Theme Mismatch
```
❌ Theme mismatch! Saved: minimal_elegant, Loaded: professional_clean
```
**Cause**: Saved theme doesn't match loaded theme
**Solution**: Check theme loading logic in PHP

#### Missing CSS Variables
```
❌ Missing critical CSS variables: --gmkb-color-primary, --gmkb-font-primary
```
**Cause**: CSS variables not injected
**Solution**: Verify `inject_theme_css_variables()` in frontend display

#### Empty Components
```
⚠️ Empty component: biography (comp-123)
```
**Cause**: Component rendered but has no content
**Solution**: Check component template and data enrichment

#### Component Count Mismatch
```
❌ Component count mismatch! State: 16, DOM: 14
```
**Cause**: Some components not rendering
**Solution**: Check component rendering logic

## 🛠️ Troubleshooting

### Test Won't Run
**Issue**: `GMKB_FieldTest is not defined`
**Solution**: Make sure you pasted the entire test file into console

### Can't Fetch Saved State
**Issue**: `Failed to fetch saved state from database`
**Solutions**:
1. Check REST API is enabled
2. Verify post ID exists
3. Check authentication/permissions
4. Try manual AJAX approach

### Theme Customizations Not Found
**Issue**: `No customizations found`
**Possible Causes**:
1. No customizations have been saved
2. Customizations stored in different location
3. REST API endpoint not configured

## 📝 Helper Commands

```javascript
// Show help
GMKB_FieldTest.help()

// Get post ID
GMKB_FieldTest.getPostIdFromDOM()

// Check CSS variables manually
GMKB_FieldTest.testCSSVariables()

// Access debug helper
window.GMKB_DEBUG.getThemeVariables()
window.GMKB_DEBUG.listComponents()
```

## 🎯 Use Cases

### Scenario 1: Theme Not Applying
```javascript
// Run theme and CSS tests
await GMKB_FieldTest.testThemeCustomizations()
GMKB_FieldTest.testCSSVariables()
```

### Scenario 2: Components Not Showing
```javascript
// Check component rendering
GMKB_FieldTest.testComponentFields()
GMKB_FieldTest.testStateVsDOM()
```

### Scenario 3: Admin Changes Not Reflecting
```javascript
// Compare admin to frontend
await GMKB_FieldTest.testSavedVsDisplayed()
// Or with manual state:
GMKB_FieldTest.compareAdminToFrontend(adminState)
```

### Scenario 4: Complete Audit
```javascript
// Run everything
await GMKB_FieldTest.runFullDiagnostic()
// Then inspect results
console.table(window.GMKB_TestResults.tests)
```

## 📦 Sample Output

### Successful Test Run
```javascript
{
  "timestamp": "2025-10-21T22:30:00.000Z",
  "postId": "32372",
  "tests": {
    "themeCustomizations": {
      "name": "Theme Customizations",
      "passed": true,
      "errors": [],
      "data": {
        "savedTheme": "professional_clean",
        "loadedTheme": "professional_clean",
        "themeMatch": true
      }
    },
    "cssVariables": {
      "name": "CSS Variables",
      "passed": true,
      "errors": [],
      "data": {
        "variableCount": 43,
        "variables": { /* all CSS vars */ }
      }
    }
    // ... other tests
  }
}
```

### Failed Test Run
```javascript
{
  "tests": {
    "themeCustomizations": {
      "passed": false,
      "errors": [
        "Theme mismatch! Saved: minimal_elegant, Loaded: professional_clean"
      ]
    }
  }
}
```

## 🔗 Integration with Existing Debug Tools

This test utility works alongside the existing `window.GMKB_DEBUG` helper:

```javascript
// Use both together
await GMKB_FieldTest.runFullDiagnostic()
window.GMKB_DEBUG.listComponents()
window.GMKB_DEBUG.getThemeVariables()
```

## 📚 Additional Resources

- **Main Codebase**: `includes/class-gmkb-frontend-display.php`
- **Theme System**: `system/ThemeDiscovery.php`
- **State Management**: `src/stores/mediaKitStore.js`
- **Debug Helper**: Already in `class-gmkb-frontend-display.php` (window.GMKB_DEBUG)

## ⚠️ Important Notes

1. **Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
2. **Network Requests**: Some tests make AJAX/fetch requests to WordPress
3. **Async Tests**: Theme customizations and saved vs displayed tests are async
4. **Data Privacy**: All tests run client-side, no data sent externally
5. **Performance**: Tests are lightweight and won't impact page performance

## 💡 Tips

- Run full diagnostic first for comprehensive overview
- Use individual tests for targeted debugging
- Save test results: `copy(window.GMKB_TestResults)`
- Compare results before/after code changes
- Run tests on multiple media kits to verify consistency

---

**Created**: October 2025
**Version**: 1.0
**Compatibility**: GMKB Plugin v2.1+
