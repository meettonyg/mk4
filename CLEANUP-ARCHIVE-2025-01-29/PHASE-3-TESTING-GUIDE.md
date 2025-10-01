# Phase 3 Testing Guide - Pure Vue Template

## Pre-Testing Setup

### 1. Build Vue Bundle
```bash
# Windows
build-phase3.bat

# Unix/Mac
npm run build
```

### 2. Clear WordPress Cache
- Clear WordPress object cache
- Clear browser cache
- Disable any caching plugins temporarily

### 3. Enable Debug Mode
In `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

## Test 1: Template Detection

### Objective
Verify that Pure Vue template is loaded for builder pages

### Steps
1. Navigate to builder page: `http://your-site.com/media-kit-builder?mkcg_id=123`
2. Open browser DevTools → Console
3. Look for log message: `🎯 GMKB Phase 3: Using Pure Vue template for builder`

### Expected Result
✅ Console shows Pure Vue template detection
✅ No errors in console
✅ Page loads without PHP warnings

### Troubleshooting
If template not detected:
- Check `GMKB_USE_PURE_VUE` constant is `true`
- Verify `mkcg_id` or `post_id` parameter in URL
- Check `debug.log` for template router messages

---

## Test 2: Minimal HTML Structure

### Objective
Verify page source is minimal (< 100 lines)

### Steps
1. Navigate to builder page
2. Right-click → View Page Source
3. Count lines of HTML

### Expected Result
✅ Page source < 100 lines
✅ Only essential HTML present
✅ Single `<div id="app">` for Vue
✅ `window.gmkbData` script present
✅ No PHP component wrappers visible

### What to Look For
```html
<!DOCTYPE html>
<html class="gmkb-pure-vue">
<head>
    <!-- Minimal head content -->
</head>
<body class="gmkb-builder gmkb-pure-vue">
    <!-- Vue Application Mount Point -->
    <div id="app">
        <!-- Loading State (Vue will replace this) -->
        <div class="gmkb-loading">
            ...
        </div>
    </div>
    
    <!-- Data Injection -->
    <script>
        window.gmkbData = { ... };
    </script>
    
    <!-- WordPress scripts -->
</body>
</html>
```

---

## Test 3: 7-Step Initialization

### Objective
Verify proper initialization sequence

### Steps
1. Navigate to builder page
2. Open DevTools → Console
3. Watch initialization logs

### Expected Console Output
```
🚀 Initializing Media Kit Builder v2.0 - Phase 3...
1️⃣ Validating environment...
✅ Environment valid
2️⃣ Initializing services...
🔧 Initializing APIService with: {...}
✅ API Service ready
✅ Component registry initialized
✅ Nonce manager initialized
✅ Pods data integration initialized
✅ Drag and drop initialized
✅ Import/Export service initialized
3️⃣ Creating Vue application...
✅ Pinia store created
✅ Vue components loaded
4️⃣ Mounting Vue application...
✅ Vue mounted to #app
5️⃣ Initializing stores...
✅ Stores initialized
✅ AutoSave initialized with proper context
6️⃣ Loading media kit data...
✅ Data loaded from API (or savedState)
7️⃣ Initializing theme...
✅ Theme initialized: professional_clean
✅ Vue Media Kit Builder initialized successfully
✅ Media Kit Builder initialized successfully!
📊 State: { components: X, sections: Y, theme: '...' }
```

### Expected Result
✅ All 7 steps complete successfully
✅ No errors between steps
✅ Final state summary displays
✅ `gmkb:ready` event dispatched

---

## Test 4: Vue DevTools Inspection

### Objective
Verify clean Vue component tree

### Steps
1. Install Vue DevTools browser extension
2. Navigate to builder page
3. Open DevTools → Vue tab
4. Inspect component tree

### Expected Result
✅ Clean Vue component hierarchy visible
✅ No PHP-rendered elements in tree
✅ Pinia stores visible in DevTools
✅ All components show proper data

### Component Tree Should Look Like
```
<App>
  <MediaKitApp>
    <ComponentLibrary />
    <MediaKitPreview>
      <Section v-for="section">
        <Component v-for="component" />
      </Section>
    </MediaKitPreview>
    <ThemeCustomizer />
  </MediaKitApp>
</App>
```

---

## Test 5: Loading Screen

### Objective
Verify loading screen displays before Vue mounts

### Steps
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Navigate to builder page
4. Watch for loading screen

### Expected Result
✅ Loading screen displays immediately
✅ Spinner animates smoothly
✅ Loading message shows "Loading Media Kit Builder"
✅ Vue replaces loading screen when ready

### What to Look For
- Purple gradient background
- White spinner rotating
- Clear loading message
- No flash of unstyled content

---

## Test 6: Error Handling

### Objective
Test error scenarios and fallback UI

### Test 6.1: Missing gmkbData
1. Temporarily comment out `window.gmkbData` in template
2. Reload page
3. Check console and UI

**Expected**:
- ❌ Console error: "gmkbData not available"
- Error UI displays with clear message
- Reload button present

### Test 6.2: Missing Required Fields
1. In template, remove `restUrl` from `gmkbData`
2. Reload page
3. Check console and UI

**Expected**:
- ❌ Console error: "gmkbData missing required fields: restUrl"
- Error UI displays
- Helpful error message

### Test 6.3: Vue Mount Timeout
1. Disable JavaScript after page load
2. Wait 10 seconds

**Expected**:
- After 10 seconds, error UI appears
- Message: "Failed to Load"
- Reload button present

---

## Test 7: Environment Validation

### Objective
Verify `window.gmkbData` is properly injected

### Steps
1. Navigate to builder page
2. Open DevTools → Console
3. Type: `window.gmkbData`
4. Press Enter

### Expected Result
```javascript
{
  postId: 123,
  postTitle: "Guest Name",
  nonce: "abc123...",
  restUrl: "http://your-site.com/wp-json/",
  restNonce: "def456...",
  ajaxUrl: "http://your-site.com/wp-admin/admin-ajax.php",
  pluginUrl: "http://your-site.com/wp-content/plugins/mk4/",
  environment: "development",
  version: "2.0.0",
  timestamp: 1234567890,
  architecture: "pure-vue"
}
```

### Validation Checks
✅ All required fields present
✅ `architecture` equals `"pure-vue"`
✅ `postId` is a number
✅ URLs are properly formatted
✅ Nonces are non-empty strings

---

## Test 8: Cross-Browser Testing

### Objective
Verify compatibility across browsers

### Browsers to Test
1. ✅ Chrome/Edge (Chromium)
2. ✅ Firefox
3. ✅ Safari (Mac/iOS)

### For Each Browser
1. Navigate to builder page
2. Check console for initialization
3. Verify UI renders correctly
4. Test basic interactions

### Expected Result
✅ Works in all modern browsers
✅ No browser-specific errors
✅ Consistent appearance

---

## Test 9: Network Conditions

### Objective
Test under various network conditions

### Test 9.1: Fast Network
1. Navigate to builder page
2. Should load quickly (< 2 seconds)

### Test 9.2: Slow Network
1. DevTools → Network → Throttling → Slow 3G
2. Navigate to builder page
3. Loading screen should display
4. Should eventually load successfully

### Test 9.3: Offline/Online
1. DevTools → Network → Offline
2. Navigate to builder page
3. Wait 5 seconds
4. DevTools → Network → Online
5. Should retry and load

---

## Test 10: State Management

### Objective
Verify Pinia stores work correctly

### Steps
1. Navigate to builder page
2. Open DevTools → Console
3. Test store methods:

```javascript
// Check store availability
window.gmkbStore
window.themeStore

// Test adding component
GMKB.addComponent('hero')

// Check state
GMKB.getState()

// Test save
GMKB.save()
```

### Expected Result
✅ Stores accessible globally
✅ Methods work without errors
✅ State updates reflected in UI
✅ Save operations succeed

---

## Test 11: Theme System

### Objective
Verify theme initialization

### Steps
1. Navigate to builder page
2. Wait for initialization
3. Open console
4. Type: `window.themeStore.currentTheme`

### Expected Result
✅ Theme object present
✅ Default theme applied if none saved
✅ CSS variables injected into page
✅ Theme switching works

### Test Theme Switching
```javascript
// Switch theme
switchTheme('dark')

// Verify change
window.themeStore.currentTheme.id // Should be 'dark'
```

---

## Test 12: Debugging Tools

### Objective
Verify debug commands work

### Commands to Test
```javascript
// 1. Check GMKB object
window.GMKB

// 2. View state
GMKB.getState()

// 3. Component operations
GMKB.addComponent('biography')
GMKB.removeComponent('component-id')

// 4. Section operations
GMKB.addSection('two_column')
GMKB.removeSection('section-id')

// 5. Theme operations
switchTheme('modern_bold')

// 6. Import/Export
GMKB.openImportExport()
```

### Expected Result
✅ All commands execute without errors
✅ Help message displays on console
✅ Methods return expected values

---

## Test 13: WordPress Integration

### Objective
Verify proper WordPress integration

### Checks
1. ✅ Scripts loaded via `wp_head()`
2. ✅ Scripts loaded via `wp_footer()`
3. ✅ No inline scripts (except gmkbData)
4. ✅ Proper script dependencies
5. ✅ CSS loaded correctly

### Verification
1. View page source
2. Find script tags
3. Verify they're in `<head>` or before `</body>`
4. Check for dependency attributes

---

## Test 14: Performance

### Objective
Measure and verify performance

### Metrics to Check
1. **Bundle Size**
   ```bash
   ls -lh dist/gmkb.iife.js
   ```
   Expected: < 500KB gzipped

2. **Load Time**
   - DevTools → Network → Load time
   - Expected: < 2 seconds

3. **Time to Interactive**
   - DevTools → Lighthouse
   - Expected: < 3 seconds

4. **Lighthouse Score**
   ```bash
   lighthouse http://your-site.com/media-kit-builder?mkcg_id=123
   ```
   Expected: > 90

---

## Test 15: Rollback

### Objective
Verify rollback mechanism works

### Steps
1. In `guestify-media-kit-builder.php`, change:
   ```php
   define( 'GMKB_USE_PURE_VUE', false );
   ```
2. Clear cache
3. Reload builder page
4. Should revert to previous template system

### Expected Result
✅ Previous template loads
✅ No errors
✅ Builder still functional

---

## Common Issues & Solutions

### Issue: "gmkbData not available"
**Solution**: Check that template injects data before Vue bundle loads

### Issue: Blank page
**Solution**: 
- Check console for errors
- Verify Vue bundle built successfully
- Check WordPress debug log

### Issue: Loading screen doesn't disappear
**Solution**:
- Check for JavaScript errors
- Verify Vue mounts within 10 seconds
- Check network requests

### Issue: Template not loading
**Solution**:
- Verify `GMKB_USE_PURE_VUE` is `true`
- Check URL has `mkcg_id` or `post_id`
- Clear WordPress cache

---

## Success Criteria Checklist

After all tests pass, verify:

- [ ] Pure Vue template loads for builder pages
- [ ] Page source < 100 lines
- [ ] All 7 initialization steps complete
- [ ] Vue DevTools shows clean component tree
- [ ] Loading screen displays and disappears
- [ ] Error handling works for all scenarios
- [ ] `window.gmkbData` properly injected
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on slow network
- [ ] Pinia stores functional
- [ ] Theme system works
- [ ] Debug commands work
- [ ] WordPress integration proper
- [ ] Performance meets targets
- [ ] Rollback mechanism works

---

## Reporting Issues

If any test fails:

1. **Document the failure**:
   - Which test failed
   - Steps to reproduce
   - Console errors
   - Screenshots

2. **Check logs**:
   - Browser console
   - WordPress debug.log
   - Network tab

3. **Gather context**:
   - Browser version
   - WordPress version
   - PHP version
   - Network conditions

4. **File issue** with all above information

---

## Phase 4 Prerequisites

Before moving to Phase 4:
- ✅ All Phase 3 tests passing
- ✅ No console errors
- ✅ Clean Vue component tree
- ✅ Performance metrics met
- ✅ Cross-browser compatible

Only proceed to Phase 4 when all tests pass successfully!
