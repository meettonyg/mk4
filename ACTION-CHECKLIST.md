# IMMEDIATE ACTION CHECKLIST

## Problem
`window.gmkbData` is `undefined` - PHP isn't injecting data into the page.

## Quick Fix Steps

### ☐ STEP 1: Rebuild Project
```bash
npm run build
```
**Wait for "Build successful" message**

### ☐ STEP 2: Hard Refresh Browser
- Chrome/Edge: `Ctrl + Shift + R`
- Firefox: `Ctrl + F5`

### ☐ STEP 3: Check Browser Console
Look for these messages at the TOP of console:
```
✅ GMKB: gmkbData injected successfully
🔍 GMKB: apiSettings.xss check: {...}
```

**If you see them:** ✅ FIXED! Continue using the builder.

**If you DON'T see them:** Continue to Step 4.

### ☐ STEP 4: Check Page Source
1. Right-click → View Page Source
2. Search for `window.gmkbData`
3. Is it there?

**YES, it's there:**
- Problem: JavaScript timing issue
- Solution: Check console for errors BEFORE gmkbData check

**NO, it's NOT there:**
- Problem: PHP not running
- Solution: Continue to Step 5

### ☐ STEP 5: Verify URL
Are you on one of these URLs?
- `/tools/media-kit`
- `/media-kit`  
- `/guestify-media-kit`
- WordPress admin editing a media kit post

**NO:** Navigate to correct URL

**YES:** Continue to Step 6

### ☐ STEP 6: Check Plugin Active
WordPress Admin → Plugins
- Is "Guestify Media Kit Builder" active?
- If not, activate it

### ☐ STEP 7: Enable Debug Mode
Edit `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

Reload page, check `wp-content/debug.log`

Look for:
```
✅ GMKB: Data prepared successfully
🔍 GMKB: apiSettings check - SET
🔍 GMKB: apiSettings.xss - SET
```

### ☐ STEP 8: Add Diagnostic Code

Add to `functions.php` (temporarily):
```php
add_action('wp_head', function() {
    if (function_exists('gmkb_is_builder_page') && gmkb_is_builder_page()) {
        ?>
        <script>
        console.log('🔍 DIAGNOSTIC: Page is builder page');
        console.log('🔍 DIAGNOSTIC: gmkbData exists?', typeof window.gmkbData !== 'undefined');
        if (typeof window.gmkbData !== 'undefined') {
            console.log('🔍 DIAGNOSTIC: gmkbData keys:', Object.keys(window.gmkbData));
        }
        </script>
        <?php
    }
}, 999);
```

## What to Report

If still broken, tell me:

1. **Build Status:** Success or error?
2. **URL:** What page are you on?
3. **Console Output:** Screenshot
4. **Page Source:** Is `window.gmkbData` in HTML?
5. **Debug Log:** Any relevant errors?

---

**START WITH STEP 1 RIGHT NOW** 🔨
