# Dark Mode Not Working - Complete Troubleshooting Guide

## Current Situation
✅ Vue components modified  
✅ Build completed (dist/gmkb.iife.js updated today at 14:51)  
❌ Dark mode still not showing correct colors in browser

## Root Causes Identified

### Issue 1: PHP Template File CSS
The `templates/builder-template-vue-pure.php` file contains **inline CSS** in `<style>` tags. This is loaded directly by PHP, so:
- ✅ No build required
- ❌ But subject to PHP OpCache
- ❌ And WordPress template caching

### Issue 2: Browser Aggressive Caching
Browsers cache inline styles from HTML very aggressively.

## SOLUTION: Complete Cache Clear

### Step 1: Clear PHP OpCache (CRITICAL)
Create a file called `clear-opcache.php` in the plugin root:

```php
<?php
// Clear PHP OpCache
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "✅ OPcache cleared successfully!";
} else {
    echo "❌ OPcache not available";
}

// Also clear WordPress object cache
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
    echo "<br>✅ WordPress object cache cleared!";
}
?>
```

Then visit: `http://your-site.com/wp-content/plugins/mk4/clear-opcache.php`

### Step 2: Rebuild Vue Components
```bash
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
npm run build
```

### Step 3: Clear WordPress Caches
If you have caching plugins:
- W3 Total Cache: Performance > Empty All Caches
- WP Super Cache: Delete Cache
- Redis/Memcached: Flush all

### Step 4: Browser Hard Refresh
1. **Close all browser tabs** with the media kit builder
2. **Clear browser cache**: Ctrl + Shift + Delete
   - Choose "Cached images and files"
   - Choose "All time"
3. **Open new incognito/private window**
4. **Load the media kit builder**
5. **Do NOT use Ctrl+F5** initially - just load fresh

### Step 5: Verify Dark Mode Toggle
1. Look for moon/sun icon in toolbar
2. Click it
3. Open DevTools (F12)
4. Check if `<body>` gets `class="dark-mode"` added

## Expected Results

### Light Mode (Default):
```css
/* Sidebar */
#gmkb-sidebar {
  background: white;          /* ← WHITE */
  border-right: #e5e7eb;
}

/* Preview */
#media-kit-preview {
  background: #f8f9fb;        /* ← Light gray */
}
```

### Dark Mode (After Toggle):
```css
/* Sidebar */
body.dark-mode #gmkb-sidebar {
  background: #0f172a;        /* ← Slate-900 (navy blue) */
  border-right: #334155;
}

/* Preview */
body.dark-mode #media-kit-preview {
  background: #475569;        /* ← Slate-600 */
}
```

## Debugging Checklist

### Check 1: Inline CSS Loaded
Open DevTools > Sources > find `builder-template-vue-pure.php`
Look for this CSS block:
```css
body.dark-mode #gmkb-sidebar {
  background: #0f172a;
  border-right-color: #334155;
}
```

**If you DON'T see it:** PHP OpCache is serving old version

### Check 2: Dark Mode Class Toggle
1. Open DevTools > Elements
2. Find `<body>` tag
3. Click moon icon
4. Watch `<body>` element

**Should see:**
```html
<!-- Before click -->
<body class="...">

<!-- After click -->
<body class="... dark-mode">
```

**If class doesn't appear:** JavaScript isn't working

### Check 3: CSS Specificity
In DevTools > Elements:
1. Select sidebar element (`#gmkb-sidebar`)
2. Check Computed styles
3. Look for background color

**Should show:**
- Light mode: `rgb(255, 255, 255)` (white)
- Dark mode: `rgb(15, 23, 42)` (#0f172a)

**If showing wrong color:** Another stylesheet is overriding

## Common Problems & Solutions

### Problem: Sidebar Always Dark
**Cause:** PHP OpCache serving old template  
**Solution:** Clear OpCache (see Step 1)

### Problem: Dark Mode Toggle Does Nothing
**Cause:** JavaScript not adding class to body  
**Check console for errors:**
```javascript
// Should see in console:
✅ Dark mode: enabled
```

**If missing:** Vue component not compiled correctly

### Problem: Colors Still Wrong After Everything
**Cause:** Another stylesheet has higher specificity  
**Solution:** Check for conflicting styles:
```css
/* Look for these in DevTools */
.gmkb-sidebar { ... }  /* Might override #gmkb-sidebar */
```

## Nuclear Option: Force Refresh Everything

If NOTHING works, do this:

```bash
# 1. Delete dist folder
rm -rf dist/

# 2. Delete node modules cache
rm -rf node_modules/.vite

# 3. Rebuild from scratch
npm run build

# 4. Clear ALL WordPress caches
wp cache flush  # If using WP-CLI

# 5. Restart PHP-FPM (if on Linux/Mac)
# Or restart your local server (XAMPP, MAMP, etc.)

# 6. Browser: Ctrl + Shift + Delete > Clear ALL
```

## Final Verification Script

Add this to browser console:
```javascript
// Check dark mode functionality
const checkDarkMode = () => {
  const body = document.body;
  const sidebar = document.getElementById('gmkb-sidebar');
  const preview = document.getElementById('media-kit-preview');
  
  console.log('Body has dark-mode class:', body.classList.contains('dark-mode'));
  console.log('Sidebar background:', getComputedStyle(sidebar).background);
  console.log('Preview background:', getComputedStyle(preview).background);
};

// Run check
checkDarkMode();

// Toggle dark mode
document.querySelector('[title*="dark mode"], [title*="light mode"]').click();

// Check again
setTimeout(checkDarkMode, 100);
```

## Expected Console Output

### Light Mode:
```
Body has dark-mode class: false
Sidebar background: rgb(255, 255, 255) ...
Preview background: rgb(248, 249, 251) ...
```

### Dark Mode:
```
Body has dark-mode class: true
Sidebar background: rgb(15, 23, 42) ...
Preview background: rgb(71, 85, 105) ...
```

## If Still Not Working

1. **Check PHP version:** Needs PHP 7.4+
2. **Check WordPress version:** Needs WP 5.8+
3. **Disable other plugins** temporarily
4. **Switch to default WordPress theme** (Twenty Twenty-Four)
5. **Check server error logs** for PHP errors

## Get Server Error Logs

### XAMPP/WAMP (Windows):
```
C:\xampp\php\logs\php_error_log
```

### MAMP (Mac):
```
/Applications/MAMP/logs/php_error.log
```

### Linux:
```
/var/log/php-fpm/error.log
/var/log/nginx/error.log
```

---

**Last Resort:** Provide access to site and I can debug directly. But 99% of the time, it's OpCache or browser cache.
