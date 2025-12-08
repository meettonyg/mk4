# 🧪 TEST SUITE QUICK REFERENCE CARD

## 🚀 INSTANT COMMANDS

### Full Test Suite
```javascript
await testSuite.runAllTests()
```

### Individual Tests
```javascript
await testSuite.testSectionTabs()         // Tab structure
await testSuite.testSectionContent()      // Content panel
await testSuite.testSectionStyle()        // Style panel
await testSuite.testSectionAdvanced()     // Advanced panel
await testSuite.testComponentEditors()    // Component editors
await testSuite.testRealTimeUpdates()     // Real-time updates
await testSuite.testSettingsPersistence() // Settings save
await testSuite.testAccessibility()       // A11y features
await testSuite.testErrorHandling()       // Error handling
await testSuite.testResponsiveDesign()    // Responsive CSS
```

---

## 📊 INTERPRETING RESULTS

| Pass Rate | Status      | Action                    |
|-----------|-------------|---------------------------|
| 90-100%   | ✅ Excellent| Minor cleanup             |
| 80-89%    | ⚠️ Good     | Review failures           |
| 70-79%    | ⚠️ Needs Work| Fix critical issues      |
| <70%      | ❌ Critical | Major problems exist      |

---

## 🔍 QUICK DEBUG COMMANDS

```javascript
// Check if test suite loaded
console.log(testSuite)

// Check if store accessible
testSuite.getStore()

// Check if UI store accessible
testSuite.getUIStore()

// Get current results
testSuite.results

// Interactive mode
testSuite.runInteractive()
```

---

## ⚡ SPEED RUN (30 seconds)

```javascript
console.clear();
const r = await testSuite.runAllTests();
console.log(`✅ Pass: ${r.passed} | ❌ Fail: ${r.failed} | Rate: ${r.passRate}%`);
```

---

## 🎯 PRE-COMMIT CHECKLIST

```javascript
// 1. Clear console
console.clear();

// 2. Run full suite
const results = await testSuite.runAllTests();

// 3. Check pass rate
if (results.passRate >= 90) {
  console.log('✅ READY TO COMMIT');
} else {
  console.log('❌ FIX FAILURES FIRST');
  console.log(testSuite.results.errors);
}
```

---

## 🐛 TROUBLESHOOTING QUICK FIXES

**Issue:** Test suite not defined
```javascript
window.testSuite = new MediaKitTestSuite();
```

**Issue:** Tests fail to access store
```javascript
// Check manually
console.log(window.mediaKitStore);
```

**Issue:** Need to see more details
```javascript
// Run with verbose output
testSuite.log = (msg, type) => console.log(`[${type}] ${msg}`);
```

---

## 📝 CUSTOM ASSERTIONS

```javascript
// Quick assertion
testSuite.assert(condition, 'Test description');

// Quick warning
testSuite.warn('Something suspicious');

// Check element exists
testSuite.assert(
  document.querySelector('.my-element') !== null,
  'My element found'
);
```

---

## 🔄 REGRESSION TESTING

```javascript
// Before changes
const before = await testSuite.runAllTests();
console.log('BEFORE:', before.passRate);

// ... make your changes ...

// After changes
const after = await testSuite.runAllTests();
console.log('AFTER:', after.passRate);

// Compare
if (after.passRate >= before.passRate) {
  console.log('✅ NO REGRESSION');
} else {
  console.log('❌ REGRESSION DETECTED');
}
```

---

## 📦 SAVE RESULTS

```javascript
// Save results to variable
const results = await testSuite.runAllTests();

// Export as JSON
const json = JSON.stringify(results, null, 2);
console.log(json);

// Copy to clipboard
copy(json);
```

---

## 🎨 COLOR CODED OUTPUT

- 🔵 **Blue** = Info/Test Starting
- 🟢 **Green** = Test Passed
- 🔴 **Red** = Test Failed
- 🟡 **Yellow** = Warning
- 🟣 **Purple** = Test Category

---

## ⌨️ KEYBOARD SHORTCUTS

While testing in console:

- `Ctrl+L` / `Cmd+L` - Clear console
- `Ctrl+Shift+K` / `Cmd+Option+K` - Clear console (Firefox)
- `Ctrl+R` / `Cmd+R` - Reload page
- `Ctrl+Shift+R` / `Cmd+Shift+R` - Hard reload

---

## 📊 WATCH MODE (Manual)

```javascript
// Run tests every 30 seconds
setInterval(async () => {
  console.clear();
  await testSuite.runAllTests();
}, 30000);
```

---

## 🔥 EMERGENCY COMMANDS

```javascript
// Stop error capture
testSuite.stopErrorCapture();

// Reset results
testSuite.results = { passed: 0, failed: 0, errors: [], warnings: [] };

// Force cleanup
testSuite.teardown();
```

---

## 📱 MOBILE TESTING

```javascript
// Test with mobile viewport
// 1. Open DevTools
// 2. Toggle device toolbar (Ctrl+Shift+M)
// 3. Select iPhone/Android
// 4. Run tests
await testSuite.testResponsiveDesign();
```

---

## 🎯 FOCUSED TESTING

```javascript
// Test only what you changed
await testSuite.testSectionStyle();     // Changed style panel
await testSuite.testRealTimeUpdates();  // Verify live updates
```

---

## 📈 BENCHMARK TIMING

```javascript
// Time a specific test
console.time('StyleTest');
await testSuite.testSectionStyle();
console.timeEnd('StyleTest');
```

---

## 🎓 LEARNING MODE

```javascript
// Run with explanations
testSuite.log('Starting section tabs test...', 'test');
await testSuite.testSectionTabs();
testSuite.log('Check: All 3 tabs should be visible', 'info');
```

---

## 💾 SAVE THIS FILE

**Location:** Keep this in your project root or bookmark this page  
**Print:** Great for desk reference  
**Share:** Send to team members for consistency

---

## ⭐ MOST USED COMMANDS (TOP 5)

1. `await testSuite.runAllTests()` - Full suite
2. `testSuite.testSectionStyle()` - Style panel
3. `testSuite.testRealTimeUpdates()` - Live updates
4. `testSuite.results` - View results
5. `console.clear()` - Clean slate

---

## 📞 WHEN ALL ELSE FAILS

```javascript
// Nuclear option - reload everything
location.reload();

// Then re-run
await testSuite.runAllTests();
```

---

**Pro Tip:** Bookmark this page and keep it open in a separate tab while developing!

**Remember:** A 90%+ pass rate means you're ready to commit! 🚀

---

*Last Updated: October 09, 2025*
