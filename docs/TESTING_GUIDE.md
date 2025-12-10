# 🧪 MEDIA KIT BUILDER - CONSOLE TEST SUITE GUIDE

Complete guide for testing all functionality across component and section editors using the browser console.

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Running Tests](#running-tests)
4. [Test Categories](#test-categories)
5. [Understanding Results](#understanding-results)
6. [Troubleshooting](#troubleshooting)
7. [Writing Custom Tests](#writing-custom-tests)
8. [Best Practices](#best-practices)

---

## 🚀 QUICK START

### Option 1: Auto-Run All Tests (Fastest)

```javascript
// Open browser console (F12) and paste:
await testSuite.runAllTests()
```

### Option 2: Interactive Mode

```javascript
// Open interactive mode for step-by-step testing:
testSuite.runInteractive()

// Then run individual test categories:
await testSuite.testSectionTabs()
await testSuite.testSectionContent()
await testSuite.testSectionStyle()
// ... etc
```

### Option 3: Auto-Run on Page Load

Add `?test=auto` to URL:
```
http://localhost/media-kit-builder?test=auto
```

---

## 📦 INSTALLATION

### Method 1: Direct Console Import

1. Open the Media Kit Builder page
2. Open browser DevTools (F12)
3. Go to Console tab
4. Copy and paste the entire `test-suite.js` file
5. Hit Enter

### Method 2: Script Tag (Development)

Add to your HTML:
```html
<script src="/src/utils/test-suite.js"></script>
```

### Method 3: Module Import (Production)

```javascript
import MediaKitTestSuite from './utils/test-suite.js';
const testSuite = new MediaKitTestSuite();
await testSuite.runAllTests();
```

---

## 🏃 RUNNING TESTS

### Full Test Suite

```javascript
// Run everything (recommended for comprehensive testing)
const results = await testSuite.runAllTests();

// Results object contains:
// {
//   passed: 45,
//   failed: 2,
//   warnings: 3,
//   errors: 0,
//   passRate: 95.7,
//   duration: 4.23
// }
```

### Individual Test Categories

```javascript
// Test section tab structure
await testSuite.testSectionTabs();

// Test section content panel
await testSuite.testSectionContent();

// Test section style panel (BaseStylePanel)
await testSuite.testSectionStyle();

// Test section advanced panel (BaseAdvancedPanel)
await testSuite.testSectionAdvanced();

// Test component editors
await testSuite.testComponentEditors();

// Test real-time updates
await testSuite.testRealTimeUpdates();

// Test settings persistence
await testSuite.testSettingsPersistence();

// Test accessibility features
await testSuite.testAccessibility();

// Test error handling
await testSuite.testErrorHandling();

// Test responsive design
await testSuite.testResponsiveDesign();
```

---

## 📊 TEST CATEGORIES

### 1. Section Tabs Test (`testSectionTabs`)

**What it tests:**
- Section settings panel exists in DOM
- Three tabs are present (Content, Style, Advanced)
- Tab labels are correct
- One tab is marked as active
- Tab switching functionality

**Pass Criteria:**
- All 3 tabs found
- Correct labels displayed
- Active state properly set

**Common Failures:**
- "No sections found" - Add at least one section to the builder
- "Section settings panel not found" - Open section settings first
- "Tabs not found" - Check if SectionSettings.vue loaded correctly

---

### 2. Section Content Test (`testSectionContent`)

**What it tests:**
- Content panel component exists
- Layout options (3 layouts: Full Width, Two Column, Three Column)
- Active layout is marked
- Container settings checkboxes
- Mobile behavior controls
- Spacing preset dropdowns
- Custom CSS input fields
- Tooltips for all controls

**Pass Criteria:**
- 3 layout options visible
- 1 active layout marked
- 2+ checkboxes (full width, reverse mobile)
- 2+ select dropdowns (padding, gap)
- 1+ text input (CSS class)
- 3+ tooltips present

**Common Failures:**
- "Content panel not visible" - Switch to Content tab
- "Layout options not found" - Check SectionContentPanel.vue
- "Missing controls" - Verify component rendered correctly

---

### 3. Section Style Test (`testSectionStyle`)

**What it tests:**
- BaseStylePanel rendered correctly
- Preset section with multiple presets
- Spacing controls (margin, padding)
- Background controls (color, opacity)
- Typography controls (if applicable)
- Border controls (width, color, style, radius)
- Effects controls (box shadow)
- All control types present

**Pass Criteria:**
- Preset section exists with 3+ presets
- 4+ style sections (Spacing, Background, Border, Effects)
- Color pickers present
- Range sliders for opacity
- Number inputs for border width
- Select dropdowns for styles

**Common Failures:**
- "Style panel not visible" - Switch to Style tab
- "Missing controls" - Check BaseStylePanel.vue adaptation
- "Section mode not working" - Verify `mode="section"` prop passed

---

### 4. Section Advanced Test (`testSectionAdvanced`)

**What it tests:**
- BaseAdvancedPanel rendered correctly
- Layout section (width type, custom width, alignment)
- Responsive visibility toggles
- Custom CSS section (classes, IDs)
- Alignment buttons (left, center, right)
- Active states on controls

**Pass Criteria:**
- 3+ advanced sections present
- Width type selector exists
- 3 alignment buttons
- 1 alignment marked active
- Responsive toggle component
- 2+ text inputs for CSS

**Common Failures:**
- "Advanced panel not visible" - Switch to Advanced tab
- "Missing controls" - Check BaseAdvancedPanel.vue adaptation
- "Alignment not working" - Verify click handlers bound correctly

---

### 5. Component Editors Test (`testComponentEditors`)

**What it tests:**
- Component editors still work (no regressions)
- Component sidebar/editor exists
- Base panels render for components
- Component editor tabs (if applicable)

**Pass Criteria:**
- Component editor UI exists
- Base panels found
- No console errors when editing components

**Common Failures:**
- "No components found" - Add at least one component
- "Component editor broken" - Check for regressions in BaseStylePanel/BaseAdvancedPanel

---

### 6. Real-Time Updates Test (`testRealTimeUpdates`)

**What it tests:**
- Changes in settings immediately reflected in preview
- Store updates trigger DOM updates
- No delays or race conditions
- Background color, padding, etc. apply instantly

**Pass Criteria:**
- Setting changes visible in DOM within 500ms
- Store state matches visual state
- No setTimeout/setInterval polling

**Common Failures:**
- "Store not accessible" - Check if store properly initialized
- "Updates not reflecting" - Verify `applySectionStyles()` function
- "Race conditions" - Check for debouncing issues

---

### 7. Settings Persistence Test (`testSettingsPersistence`)

**What it tests:**
- Settings saved to store correctly
- Settings retrievable after changes
- isDirty flag set correctly
- Data structure integrity maintained

**Pass Criteria:**
- Settings update in store
- `isDirty` flag set to true
- Settings retrievable by section ID
- No data loss

**Common Failures:**
- "Settings not persisting" - Check `updateSectionSettings()` method
- "isDirty not set" - Verify store mutation
- "Data structure broken" - Check schema validation

---

### 8. Accessibility Test (`testAccessibility`)

**What it tests:**
- ARIA labels present
- Keyboard navigation works
- Focusable elements accessible
- Tooltips available for context
- Screen reader compatibility

**Pass Criteria:**
- ARIA labels on interactive elements
- Tab navigation functional
- Tooltips provide helpful information

**Common Failures:**
- "No ARIA labels" - Add aria-label attributes
- "Not keyboard accessible" - Ensure tabindex set correctly
- "Missing tooltips" - Add Tooltip components

---

### 9. Error Handling Test (`testErrorHandling`)

**What it tests:**
- Invalid operations don't crash app
- Error messages captured
- Graceful degradation
- App remains functional after errors

**Pass Criteria:**
- Invalid section IDs handled gracefully
- No uncaught exceptions
- Builder remains operational
- User sees helpful error messages

**Common Failures:**
- "App crashed" - Add try-catch blocks
- "Uncaught errors" - Improve error boundaries
- "Silent failures" - Add error logging

---

### 10. Responsive Design Test (`testResponsiveDesign`)

**What it tests:**
- Responsive classes present
- Media queries implemented
- Mobile/tablet/desktop styles
- Panel adjusts to screen size

**Pass Criteria:**
- Responsive CSS classes found
- Media queries in stylesheets
- Panel width adapts on mobile

**Common Failures:**
- "No responsive classes" - Add mobile breakpoints
- "Panel too wide on mobile" - Adjust max-width
- "Content overflows" - Fix overflow-x issues

---

## 📈 UNDERSTANDING RESULTS

### Success Output Example

```
═══════════════════════════════════════════════
📊 TEST SUITE RESULTS
═══════════════════════════════════════════════
✅ Passed: 52
❌ Failed: 0
⚠️  Warnings: 2
⏱️  Duration: 4.5s
Pass Rate: 100.0%
═══════════════════════════════════════════════
```

### Result Interpretation

| Pass Rate | Status | Action Required |
|-----------|--------|-----------------|
| 90-100% | ✅ Excellent | Minor cleanup only |
| 80-89% | ⚠️ Good | Review failed tests |
| 70-79% | ⚠️ Needs Work | Fix critical failures |
| <70% | ❌ Critical | Major issues present |

### Common Warnings

**"No sections found"**
- **Cause:** No sections in builder
- **Action:** Add at least one section before testing

**"Store not accessible"**
- **Cause:** Store not attached to window or Vue instance
- **Action:** Verify store initialization

**"Panel not visible"**
- **Cause:** Panel not open or tab not selected
- **Action:** Manually navigate to the relevant tab

**"Could not test X without store access"**
- **Cause:** Store access method failed
- **Action:** Update `getStore()` method to match your app structure

---

## 🔧 TROUBLESHOOTING

### Issue: Tests Won't Run

**Symptoms:**
- Error: "testSuite is not defined"
- Nothing happens when running commands

**Solutions:**
1. Ensure test suite loaded: `console.log(testSuite)`
2. Reload page and re-paste test suite code
3. Check browser console for script loading errors
4. Try: `window.testSuite = new MediaKitTestSuite()`

---

### Issue: All Tests Fail

**Symptoms:**
- Pass rate: 0%
- Many "not found" errors

**Solutions:**
1. Verify you're on the correct page (Media Kit Builder)
2. Ensure sections and components exist
3. Check if builder has finished loading
4. Try adding `await sleep(2000)` before running tests

---

### Issue: Store Not Accessible

**Symptoms:**
- "Cannot access store" warnings
- Settings persistence tests fail

**Solutions:**
1. Check if store attached to window: `console.log(window.mediaKitStore)`
2. Update `getStore()` method to match your app structure
3. Verify Vuex/Pinia store properly initialized
4. Check Vue DevTools for store instance

---

### Issue: Real-Time Updates Not Working

**Symptoms:**
- Changes don't appear in preview
- "Updates not reflecting" failures

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify `applySectionStyles()` function exists
3. Test manually by changing a setting
4. Check if DOM elements have correct data attributes
5. Verify store mutations triggering reactivity

---

### Issue: Some Tests Skip

**Symptoms:**
- Yellow warning messages
- Tests marked "skipped"

**Solutions:**
- This is normal if no sections/components exist
- Add test data to the builder
- Warnings don't affect pass rate

---

## 🎨 WRITING CUSTOM TESTS

### Template for Custom Test

```javascript
async function myCustomTest() {
  testSuite.log('\n🔬 Testing My Feature', 'test');
  
  // Your test logic here
  const myElement = document.querySelector('.my-element');
  testSuite.assert(
    myElement !== null,
    'My element exists'
  );
  
  // Test a condition
  const hasClass = myElement.classList.contains('active');
  testSuite.assert(
    hasClass === true,
    'Element has active class'
  );
  
  return true;
}

// Run your custom test
await myCustomTest();
```

### Adding to Test Suite

```javascript
// Extend the test suite
MediaKitTestSuite.prototype.testMyFeature = async function() {
  this.log('\n🔬 Testing My Feature', 'test');
  
  // Your tests here
  this.assert(true, 'My test passed');
  
  return true;
};

// Now available globally
await testSuite.testMyFeature();
```

---

## ✅ BEST PRACTICES

### Before Testing

1. ✅ **Open a clean instance** of the builder
2. ✅ **Add test data**: At least 1 section and 1 component
3. ✅ **Clear console** for clean output
4. ✅ **Disable auto-save** to prevent unintended changes
5. ✅ **Use incognito mode** for clean state testing

### During Testing

1. ✅ **Run full suite first** to get baseline
2. ✅ **Review warnings** - they indicate potential issues
3. ✅ **Test incrementally** after making changes
4. ✅ **Check console errors** - captured automatically
5. ✅ **Take screenshots** of failures for debugging

### After Testing

1. ✅ **Document failures** in issue tracker
2. ✅ **Share results** with team via pass rate
3. ✅ **Retest after fixes** to verify resolution
4. ✅ **Update test suite** as features evolve
5. ✅ **Celebrate** when pass rate improves! 🎉

---

## 📊 EXAMPLE TEST SESSION

```javascript
// 1. Open browser console
console.clear();

// 2. Load test suite (if not auto-loaded)
// (paste test-suite.js code)

// 3. Run interactive mode to see available commands
testSuite.runInteractive();

// 4. Run full test suite
const results = await testSuite.runAllTests();

// 5. Review results
console.log(`Pass Rate: ${results.passRate}%`);

// 6. Run specific tests if needed
await testSuite.testSectionStyle();

// 7. Test custom scenarios
await testSuite.testRealTimeUpdates();
```

---

## 🚨 KNOWN LIMITATIONS

1. **Store Access**: May fail if store structure changes
2. **Timing Issues**: Some tests may need longer delays
3. **CORS Restrictions**: Cannot inspect all stylesheets
4. **Vue Version**: Assumes Vue 3 composition API
5. **Single Instance**: Tests assume single builder instance

---

## 🔄 CONTINUOUS INTEGRATION

### Automated Testing Setup

```javascript
// In your CI/CD pipeline
const testResults = await testSuite.runAllTests();

if (testResults.passRate < 80) {
  throw new Error(`Test pass rate too low: ${testResults.passRate}%`);
}

console.log('✅ All tests passed!');
```

### Regression Testing

```bash
# Run tests before each commit
git commit-msg hook:
node run-tests.js || exit 1
```

---

## 📞 SUPPORT

**Having issues?**
- Check this guide first
- Review browser console for errors
- Test on different browsers
- Verify builder version compatibility

**Still stuck?**
- Document the exact error message
- Note your pass/fail counts
- Share console screenshots
- Provide reproduction steps

---

## 🎯 SUCCESS CHECKLIST

- [ ] Test suite loads without errors
- [ ] Can run full test suite
- [ ] Pass rate above 90%
- [ ] No critical failures
- [ ] All warnings understood
- [ ] Real-time updates working
- [ ] Settings persist correctly
- [ ] Both sections and components tested
- [ ] No console errors during tests
- [ ] Results documented

---

## 📚 RELATED DOCUMENTATION

- `IMPLEMENTATION_SUMMARY_PHASE1_STEP1.md` - Implementation details
- `Section Settings Upgrade Plan.md` - Original requirements
- Component Style Service documentation
- Store architecture guide

---

**Last Updated:** October 09, 2025  
**Test Suite Version:** 1.0.0  
**Compatibility:** Media Kit Builder v4.0+

---

**Ready to test? Open your console and run:**

```javascript
await testSuite.runAllTests()
```

**Good luck! 🚀**
