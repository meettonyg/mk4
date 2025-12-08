# URGENT: gmkbData is UNDEFINED - Root Cause Investigation

## The Problem
`window.gmkbData` is completely `undefined`, which means the PHP script isn't injecting the data into the page at all.

This is BEFORE my fixes can even run - the data never reaches JavaScript.

## Immediate Actions

### STEP 1: Verify You Rebuilt
```bash
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
npm run build
```

**Check the output:**
- Does it say "Build successful"?
- Check the timestamp of `dist/gmkb.iife.js` - is it recent?

### STEP 2: Add Diagnostic Script

Add the contents of `DIAGNOSTIC-PLUGIN.php` to your theme's `functions.php`:

```php
// Paste DIAGNOSTIC-PLUGIN.php contents here temporarily
```

Then:
1. Visit the media kit builder page
2. Open console (F12)
3. Look for "🔍 GMKB DIAGNOSTIC CHECK" output
4. Take a screenshot and share

### STEP 3: Check Page Source

1. Right-click on media kit page → "View Page Source"
2. Search for `window.gmkbData`
3. Do you see it in the HTML?

**Expected:** You should see something like:
```html
<script id="gmkb-vue-app-js-before">
window.gmkbData = {
  "postId": 123,
  "apiSettings": {...},
  ...
};
</script>
```

**If missing:** The PHP isn't running `gmkb_enqueue_vue_only_assets()`

## Root Causes (Most Likely → Least Likely)

### Cause 1: Plugin Not Active
Check: WordPress Admin → Plugins
- Is "Guestify Media Kit Builder" active?

### Cause 2: Not on Builder Page
The enqueue only runs on builder pages. Check:
- Are you on `/tools/media-kit` URL?
- Or editing a media kit post in admin?

### Cause 3: Enqueue Function Not Called
Check: `includes/enqueue.php` line ~310
```php
add_action('wp_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20);
add_action('admin_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20);
```

### Cause 4: Function Returns Early
Check `gmkb_enqueue_vue_only_assets()` - does it exit early?
Look for:
```php
if (!gmkb_is_builder_page()) {
    return;  // ← Exits here if not builder page
}
```

### Cause 5: wp_add_inline_script Failed
The inline script might not be added. Check if this line exists:
```php
wp_add_inline_script('gmkb-vue-app', $inline_script, 'before');
```

## Debug Steps

### Debug 1: Add Logging to PHP

Edit `includes/enqueue.php`, add at line ~315:
```php
function gmkb_enqueue_vue_only_assets() {
    error_log('🔍 gmkb_enqueue_vue_only_assets called');
    
    if (!gmkb_is_builder_page()) {
        error_log('❌ Not a builder page, returning');
        return;
    }
    
    error_log('✅ Is builder page, continuing...');
    
    // ... rest of function
}
```

### Debug 2: Check WordPress Debug Log

Enable WordPress debugging:
```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Then check: `wp-content/debug.log`

### Debug 3: Force Load Script

Temporarily bypass the page check:
```php
function gmkb_enqueue_vue_only_assets() {
    // TEMPORARY: Comment out the return
    // if (!gmkb_is_builder_page()) {
    //     return;
    // }
    
    // Rest of function...
}
```

⚠️ This will load the script on ALL pages - only for testing!

## Expected Console Output (After Fix)

After these steps, you should see:
```
✅ GMKB: gmkbData injected successfully via wp_add_inline_script
🔍 GMKB: apiSettings.xss check: {enabled: true, sanitizeHtml: true, sanitizeUrls: true}
📊 GMKB DATA SUMMARY:
  - Post ID: 123
  - User Status: Logged in
  - Components: 17
  - Themes: 4
✅ Pre-validation: gmkbData and apiSettings exist
```

## What to Report Back

Please provide:
1. **Build output** - Did npm run build succeed?
2. **Console diagnostic** - Screenshot of diagnostic check
3. **Page source** - Do you see `window.gmkbData` in HTML source?
4. **WordPress debug.log** - Any relevant errors?
5. **Current URL** - What page are you on when error occurs?

## If Still Broken After All This

There might be:
1. **Caching** - Clear all caches (WordPress, browser, CDN)
2. **Conflict** - Another plugin interfering
3. **PHP Error** - Silently failing before reaching enqueue

---

**Next Step:** Run STEP 1 (rebuild), then STEP 2 (diagnostic), then report back! 🔨
