# Media Kit Builder - Component Save Fix Verification

## Issue Identified
Components were being added to the UI and rendering correctly but showing `components_count: 0` when saving to WordPress.

## Root Cause
The PHP AJAX handler's component counting logic wasn't properly handling JavaScript objects sent as associative arrays after JSON decoding.

## Fixes Applied

### 1. PHP Side (gmkb-ajax-handlers.php)
- Enhanced component counting logic to handle both associative arrays and objects
- Added comprehensive debugging to track component structure
- Fixed counting for JavaScript objects decoded as PHP associative arrays

### 2. JavaScript Side (verified working)
- Components are properly added to state.components object
- State manager correctly maintains components map
- Save function properly passes components to API

## How to Verify the Fix

### Step 1: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 2: Test Component Addition
1. Go to the Media Kit Builder page
2. Open browser console (F12)
3. Add a component by dragging from sidebar
4. Run in console:
   ```javascript
   debugGMKB.showState()
   ```
5. Verify "Components:" shows count > 0

### Step 3: Test Save Function
1. After adding component, click Save button
2. Check console for save message
3. Look for: "components_count: 1" (or correct number)

### Step 4: Test Persistence
1. After saving, refresh the page
2. Component should reload from database
3. Run `debugGMKB.showState()` to verify

## Debug Commands Available

```javascript
// Check current state
debugGMKB.showState()

// See components map
debugGMKB.showComponents()

// Check sections
debugGMKB.showSections()

// Test save functionality
testSaveState()       // Check what will be saved
testManualSave()      // Manually trigger save with debug
addTestComponent()    // Add a test component

// Get server logs
await debugGMKB.getLogs()
```

## Expected Console Output After Fix

When saving a media kit with components:
```
APIService: Saving to post ID: 32372
APIService: Save successful {
  message: "Media kit saved successfully",
  components_count: 1,  // <-- Should show actual count, not 0
  sections_count: 1,
  components_in_sections: 1,
  ...
}
✅ State saved to WordPress database
```

## What Was Wrong

1. **JavaScript objects** (e.g., `{comp_1: {...}, comp_2: {...}}`) were being sent to PHP
2. PHP's `json_decode()` converts these to **associative arrays**
3. The original counting logic wasn't properly handling associative arrays
4. This caused `count()` to return 0 even when components existed

## What Was Fixed

1. **Detection**: Check if array is associative (object-like) vs indexed
2. **Counting**: Properly count keys in associative arrays
3. **Logging**: Added debug logging to track component structure
4. **Validation**: Ensure components are counted regardless of format

## Testing Checklist

- [ ] Components add to UI correctly
- [ ] Console shows correct component count
- [ ] Save shows correct components_count
- [ ] Components persist after page refresh
- [ ] No JavaScript errors in console
- [ ] PHP debug logs show correct counts

## If Issues Persist

1. Check browser console for errors
2. Run `testSaveState()` to see exact data being sent
3. Check PHP debug logs with `await debugGMKB.getLogs()`
4. Verify nonce is valid (check for "Invalid nonce" errors)
5. Ensure post_id is correct (check URL parameter mkcg_id)

## Files Modified

1. `/includes/gmkb-ajax-handlers.php` - Fixed component counting logic
2. `/test-save-fix.js` - Added debug functions
3. `/src/main.js` - Already had correct save logic

## Build Instructions

1. Run build to compile JavaScript:
   ```bash
   npm run build
   ```

2. Clear WordPress cache if using caching plugin

3. Hard refresh browser (Ctrl+Shift+R)

## Support

If components still show 0 count after these fixes:
1. Enable debug mode in WordPress
2. Check `/wp-content/debug.log`
3. Run all debug commands listed above
4. Check network tab for AJAX response
