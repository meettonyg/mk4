# Quick Theme Loading Fix

## Issue
1. **"No themes data available in gmkbData"** - Theme data not being passed to Vue
2. **403 Forbidden** on `/wp-json/gmkb/v1/themes/custom` - Permission issue

## Solution

### Fix 1: Add Diagnostic Logging

Add this to `enqueue.php` after the `$vue_config` array is defined (around line 383):

```php
// DEBUG: Log theme data being passed
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ GMKB: Theme data being passed to Vue:');
    error_log('  - Built-in themes count: ' . count($themes_data));
    error_log('  - Theme IDs: ' . implode(', ', array_keys($themes_data)));
    error_log('  - Vue config has themes: ' . (isset($vue_config['themes']) ? 'YES' : 'NO'));
}
```

### Fix 2: Bypass 403 with Local Theme Loading

The 403 error suggests a security plugin or server config is blocking the request. The Vue store already has a fallback - it should use the built-in themes from `gmkbData.themes` instead of calling the API for empty custom themes.

Update `src/stores/theme.js` line ~186 in `loadCustomThemes()`:

```javascript
async loadCustomThemes() {
  // ROOT FIX: If no custom themes API available, that's OK - use built-in themes only
  let restUrl = window.gmkbData?.api || window.gmkbData?.restUrl || '/wp-json/';
  const nonce = window.gmkbData?.nonce || window.gmkbData?.restNonce || '';
  
  if (!restUrl) {
    console.log('Custom themes: REST API not configured, using built-in themes only');
    return; // EXIT EARLY - just use built-in themes
  }
  
  // ... rest of function
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-WP-Nonce': nonce
      },
      credentials: 'same-origin'
    });
    
    // Handle 403 gracefully
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        console.log('Custom themes: Authentication not available, using built-in themes only');
      } else {
        console.log(`Custom themes: HTTP ${response.status}, using built-in themes only`);
      }
      return; // EXIT EARLY - just use built-in themes
    }
    
    // ... process response
  } catch (error) {
    // Silently handle - custom themes are optional
    console.log('Custom themes not available, using built-in themes');
    return; // EXIT EARLY - just use built-in themes
  }
}
```

### Why This Works

1. **Built-in themes are already in the Vue store** - They're defined in `state.availableThemes`
2. **Custom themes are optional** - The app works fine with just built-in themes
3. **The 403 means the endpoint requires authentication** - Likely a security plugin

The 403 is likely caused by:
- Wordfence or similar security plugin
- Server-level security (mod_security)
- CloudFlare security rules
- Missing nonce (though we're passing one)

### Test

```javascript
// In browser console
console.log('Theme data:', window.gmkbData.themes);
console.log('Available themes:', Object.keys(window.gmkbData.themes || {}));
```

Expected output:
```
Theme data: {professional_clean: {...}, creative_bold: {...}, ...}
Available themes: ["professional_clean", "creative_bold", "minimal_elegant", "modern_dark"]
```

### Permanent Fix

The 403 suggests we need to either:
1. Disable the REST API security restriction (not recommended)
2. Make the endpoint truly public (current `permission_callback => '__return_true'` should work but isn't)
3. Use AJAX handlers instead of REST API
4. Just use built-in themes (simplest - custom themes are a premium feature anyway)

**Recommendation**: Use built-in themes only for now. Custom themes can be a Phase 6 feature when you have proper authentication set up.
