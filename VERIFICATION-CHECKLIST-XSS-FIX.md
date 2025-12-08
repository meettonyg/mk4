# XSS Configuration Fix - Verification Checklist

Use this checklist to verify the fix is working correctly.

## Pre-Build Verification
- [ ] All files modified successfully
- [ ] No syntax errors in edited files
- [ ] Git diff shows expected changes

## Build Process
- [ ] Run `RUN-BUILD-FIX.bat` or `npm run build`
- [ ] Build completes without errors
- [ ] `dist/gmkb.iife.js` updated (check timestamp)
- [ ] `dist/gmkb.css` updated (check timestamp)

## Browser Testing

### Initial Load Test
- [ ] Open media kit builder page
- [ ] Open browser console (F12)
- [ ] Hard refresh (Ctrl + Shift + R)

### Expected Console Output
Check for these messages IN ORDER:

1. **gmkbData Injection (should appear FIRST):**
   ```
   ✅ GMKB: gmkbData injected successfully via wp_add_inline_script
   ```

2. **apiSettings Verification:**
   ```
   🔍 GMKB: apiSettings.xss check: {enabled: true, sanitizeHtml: true, sanitizeUrls: true}
   ```

3. **Data Summary:**
   ```
   📊 GMKB DATA SUMMARY:
     - Post ID: [number]
     - User Status: [status]
     - Can Save: [YES/NO]
     - Components: [count]
     - Themes: [count]
   ```

4. **Initialization Steps:**
   ```
   🚀 Initializing Media Kit Builder v4.0 - Pure Vue...
   ✅ Pre-validation: gmkbData and apiSettings exist
   1️⃣ Validating environment...
   ✅ Environment valid
   2️⃣ Initializing services...
   ✅ API Service ready
   ... (more initialization steps)
   ✅ Media Kit Builder initialized successfully!
   ```

### What Should NOT Appear
- [ ] ❌ `Cannot read properties of undefined (reading 'xss')`
- [ ] ❌ `CRITICAL: apiSettings is missing`
- [ ] ❌ `CRITICAL: gmkbData assignment failed`
- [ ] ❌ `Failed to initialize Vue`

## WordPress Debug Log Verification

If WP_DEBUG is enabled, check `wp-content/debug.log`:

### Expected Entries
```
✅ GMKB: Data prepared successfully - [X] components
🔍 GMKB: apiSettings check - SET
🔍 GMKB: apiSettings.xss - SET
```

### What Should NOT Appear
- [ ] ❌ `apiSettings check - MISSING`
- [ ] ❌ `apiSettings.xss - MISSING`
- [ ] ❌ `JSON encoding failed`

## Functional Testing

### Component Operations
- [ ] Can add new components
- [ ] Can edit component data
- [ ] Can drag/drop components
- [ ] Can save changes
- [ ] Pods fields load correctly

### Error Handling
- [ ] No console errors during normal use
- [ ] Toast notifications work
- [ ] Save operations succeed
- [ ] Undo/redo functions work

## Cross-Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if applicable)

## Performance Check
- [ ] Page loads in < 3 seconds
- [ ] No "long task" warnings > 500ms
- [ ] Smooth scrolling and interactions
- [ ] No memory leaks over 5 minutes

## Edge Cases

### Test with WP_DEBUG Disabled
- [ ] Rebuild with WP_DEBUG = false
- [ ] Verify still works without debug logging
- [ ] No console errors

### Test with Empty Media Kit
- [ ] Create new media kit (no components)
- [ ] Should load without errors
- [ ] Can add first component

### Test with Large Media Kit
- [ ] Load media kit with 15+ components
- [ ] Should load without timeout
- [ ] All components render correctly

## Issue Resolution

If any checkbox FAILS:

1. **Console Error Present:**
   - Take screenshot of full error
   - Check error message against expected messages
   - Verify gmkbData exists: `console.log(window.gmkbData)`
   - Verify apiSettings: `console.log(window.gmkbData?.apiSettings)`

2. **Build Issues:**
   - Check for npm errors
   - Verify node_modules installed: `npm install`
   - Clear npm cache: `npm cache clean --force`
   - Rebuild: `npm run build`

3. **Cache Issues:**
   - Clear WordPress cache
   - Hard refresh browser (Ctrl + Shift + R)
   - Clear browser data (cookies, cache)
   - Test in incognito/private window

4. **PHP Issues:**
   - Check WordPress error log
   - Verify PHP version (7.4+ required)
   - Check file permissions
   - Verify no other plugins interfering

## Sign-Off

Test Date: _______________
Tester: _______________

Results:
- [ ] All checks passed - READY FOR PRODUCTION
- [ ] Some issues found - NEEDS MORE WORK
- [ ] Critical errors - ROLLBACK REQUIRED

Notes:
_________________________________
_________________________________
_________________________________

## Rollback Procedure (if needed)

```bash
# Restore original files
git checkout HEAD -- includes/enqueue.php src/main.js src/composables/usePodsFieldUpdate.js

# Rebuild
npm run build

# Hard refresh browser
```

---

For detailed fix information, see: `XSS-CONFIG-ERROR-FIX.md`
