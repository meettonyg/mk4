# FINAL ROOT CAUSE FOUND - Vite Export Conflict

**Date:** November 6, 2025  
**Issue:** `window.GMKB.services` undefined  
**Root Cause:** Vite library build replacing `window.GMKB` with module exports

---

## 🎯 The Problem

### Debug Output Revealed:

**1. Namespace setup works:**
```
🐛 DEBUG: === NAMESPACE SETUP COMPLETE ===
🐛 DEBUG: Final window.GMKB.services: {componentStyle: F_, xss: {…}, security: {…}}
🐛 DEBUG: Has xss? true
```
✅ Services object exists with xss and security

**2. At initialize() - GONE:**
```
🐛 DEBUG: initialize() called, guard value: false
🐛 DEBUG: window.GMKB.services at start of initialize(): undefined
```
❌ Services has disappeared!

**3. At initializeVue() - REPLACED:**
```
🐛 DEBUG: window.GMKB at start: Module {Symbol(Symbol.toStringTag): 'Module', showToast: ƒ}
🐛 DEBUG: window.GMKB.services at start: undefined
```
❌ **window.GMKB is now an ES6 Module, not your namespace object!**

---

## 🔍 Root Cause Analysis

### The Culprit: vite.config.js + export statement

**vite.config.js:**
```javascript
build: {
  lib: {
    entry: path.resolve(__dirname, 'src/main.js'),
    name: 'GMKB',  // ← This assigns exports to window.GMKB
    fileName: 'gmkb',
    formats: ['iife']
  },
```

**main.js (bottom):**
```javascript
export {
  showToast  // From ToastService, commonly used
};
```

### What Vite Does

1. **Your code runs:** Creates `window.GMKB = { services: {...}, stores: {...}, ... }`
2. **Your code finishes:** `window.GMKB` is fully populated
3. **Vite IIFE wrapper returns:** `return { showToast: showToast }`
4. **Vite assigns to window:** `window.GMKB = <return value>`
5. **Your namespace is DESTROYED:** Now only contains `{ showToast: ... }`

### The IIFE Structure

```javascript
window.GMKB = (function() {
  // Your namespace setup
  window.GMKB = { services: {...}, stores: {...} };
  
  // ... all your code ...
  
  // PROBLEM: This return statement is the last thing that runs
  return {
    showToast: showToast  // Only this exported
  };
})();
// Result: window.GMKB = { showToast: ... }
// Your carefully built namespace is GONE!
```

---

## ✅ The Fix

### Removed Export Statement

**File:** `src/main.js` (bottom)

**Before:**
```javascript
// ROOT FIX: Clean exports - only what's truly needed
export {
  showToast  // From ToastService, commonly used
};
```

**After:**
```javascript
// ROOT FIX: No exports needed - everything accessible via window.GMKB
// Removed: export { showToast } - this was causing Vite to replace window.GMKB
```

### Why This Works

- No `export` statement = Vite doesn't return anything
- No return value = `window.GMKB` not replaced
- Your namespace stays intact ✅

### showToast Still Accessible

`showToast` is already available via:
1. `window.GMKB.utils.showToast`
2. `window.showToast` (if set elsewhere)

No need to export it!

---

## 🎓 Lessons Learned

### Vite Library Mode Behavior

When building with `lib` mode and `name: 'GMKB'`:
- Vite assigns **module exports** to the global name
- This **replaces** any existing object at that global name
- Order matters: Your code runs → then Vite assigns exports

### IIFE Pattern Gotcha

In IIFE bundles:
```javascript
window.GMKB = (function() {
  // Even if you set window.GMKB here...
  window.GMKB = { my: 'namespace' };
  
  // This return value is what actually gets assigned
  return { exported: 'value' };
})();
// Result: window.GMKB = { exported: 'value' }
```

The **return value** is the final assignment, not intermediate assignments inside!

### Best Practice

For global namespace patterns with Vite:
- **Don't mix** export statements with window assignments
- Either:
  - Build namespace on `window` (no exports) ← What we do
  - OR use exports exclusively (no window assignments)
- Never do both!

---

## 📊 Expected Behavior Now

### Build & Test

```bash
npm run build
```

### Console Output Should Show

**Namespace setup:**
```
🐛 DEBUG: === NAMESPACE SETUP COMPLETE ===
🐛 DEBUG: Final window.GMKB.services: {componentStyle: ..., xss: ..., security: ...}
🐛 DEBUG: Has xss? true
```

**At initialize():**
```
🐛 DEBUG: initialize() called, guard value: false
🐛 DEBUG: window.GMKB.services at start of initialize(): {xss: ..., security: ...}  ← ✅ STILL THERE!
```

**At initializeVue():**
```
🐛 DEBUG: === initializeVue() START ===
🐛 DEBUG: window.GMKB at start: {services: {...}, stores: {...}, ...}  ← ✅ OBJECT, not Module!
🐛 DEBUG: window.GMKB.services at start: {xss: ..., security: ...}  ← ✅ EXISTS!
```

**Before service assignment:**
```
🐛 DEBUG: Before service assignment
🐛 DEBUG: window.GMKB.services: {xss: ..., security: ...}  ← ✅ EXISTS!
✅ (no crash)
```

---

## 🎯 Why Previous Fixes Didn't Work

### Fix 1: Robust Namespace (Correct but insufficient)
- Created `.services` properly ✅
- But then Vite replaced entire `window.GMKB` ❌

### Fix 2: Safe Assignment (Correct but insufficient)
- Object.assign is safe ✅
- But `.services` was already gone by then ❌

### Fix 3: Global Guard (Correct but insufficient)
- Guard worked correctly ✅
- But couldn't prevent Vite from replacing namespace ❌

### Fix 4: Remove Export (THE ACTUAL FIX)
- Prevents Vite from assigning return value to `window.GMKB` ✅
- Namespace stays intact through entire execution ✅

---

## 🔄 Complete Fix Summary

| Fix # | What It Does | Status |
|-------|-------------|--------|
| 1 | Robust namespace initialization | ✅ Needed |
| 2 | Safe service assignment | ✅ Needed |
| 3 | Global initialization guard | ✅ Needed |
| 4 | **Remove export statement** | ✅ **THE KEY** |

**All four fixes work together:**
- Fixes 1-3: Create robust, safe initialization
- Fix 4: Prevent namespace destruction by Vite

---

## 📝 Alternative Solutions (Not Implemented)

### Option A: Different Global Name
```javascript
// vite.config.js
name: 'GMKBExports',  // Different from your namespace
```
Then your exports go to `window.GMKBExports`, not `window.GMKB`.

### Option B: Remove name property
```javascript
// vite.config.js
build: {
  lib: {
    // name: 'GMKB',  // Remove this
```
No global assignment of exports at all.

### Option C: Use Different Pattern
Don't use Vite's `lib` mode, use regular `build` mode.

**We chose the simplest: Just remove the export.**

---

## ✅ Success Criteria

- [ ] Build completes: `npm run build`
- [ ] Console shows services persist through initialization
- [ ] No `TypeError: Cannot read properties of undefined`
- [ ] Application loads successfully
- [ ] All components work
- [ ] Theme applies correctly

---

## 🚀 Status

**Fix Applied:** Export statement removed  
**Expected Result:** Complete success  
**Confidence:** VERY HIGH - Debug output clearly shows the problem  
**Next Step:** BUILD AND TEST

---

**This is the real root cause. The export was destroying your namespace after you built it.**
