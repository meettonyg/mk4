# 🔍 DIAGNOSTIC MODE: Finding Why Icons Don't Display

## 🚨 CURRENT ISSUE
Icons still showing as cubes despite all fixes applied.

---

## ✅ WHAT I JUST ADDED

### 1. Aggressive Cache Clearing (enqueue.php)
```php
// Force delete WordPress transient directly
$cache_key = 'gmkb_component_discovery_' . md5(GUESTIFY_PLUGIN_DIR . 'components/');
delete_transient($cache_key);

// Force fresh scan (bypasses cache)
$discovery->scan(true);
```

### 2. PHP Debug Logging (enqueue.php)
```php
// Logs first component data to WordPress debug.log
error_log('🔍 GMKB DEBUG: First component data: ' . print_r($first_component, true));
```

### 3. JavaScript Console Logging (enqueue.php)
```javascript
// Logs component registry to browser console
console.log('🔍 GMKB DEBUG: Component Registry:', window.gmkbData.componentRegistry);
console.log('🔍 GMKB DEBUG: First component icon:', firstComponent.icon);
```

---

## 🧪 DIAGNOSTIC STEPS

### Step 1: Clear Everything
1. **Browser**: Hard refresh `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear browser cache** completely (Ctrl + Shift + Delete)
3. Reload the page

### Step 2: Check Browser Console
Open Browser DevTools (F12) and look for:

```javascript
✅ GMKB: Backend data (gmkbData) is available.
🔍 GMKB DEBUG: Component Registry: {hero: {...}, biography: {...}}
🔍 GMKB DEBUG: First component: {name: "Hero", icon: "fa-solid fa-user", ...}
🔍 GMKB DEBUG: First component icon: "fa-solid fa-user"
```

### Step 3: Check PHP Debug Log
If WP_DEBUG is enabled, check `wp-content/debug.log`:

```
🔍 GMKB DEBUG: First component data: Array
(
    [name] => Hero Section
    [icon] => fa-solid fa-user
    [type] => hero
    ...
)
```

---

## 📊 DIAGNOSTIC CHECKLIST

### Check 1: Icon in component.json ✅
```bash
# Already verified - all component.json files have icon field
components/hero/component.json: "icon": "fa-solid fa-square"
components/biography/component.json: "icon": "fa-solid fa-file-lines"
```

### Check 2: PHP reads icon ❓
**Look for in PHP debug.log:**
- ✅ If log shows `[icon] => fa-solid fa-user` → PHP is reading correctly
- ❌ If log shows `[icon] =>` → PHP NOT reading icon field

### Check 3: JavaScript receives icon ❓
**Look for in browser console:**
- ✅ If console shows `icon: "fa-solid fa-user"` → JavaScript receives correctly
- ❌ If console shows `icon: undefined` → Data not flowing to JavaScript

### Check 4: Vue uses icon ❓
**Check SidebarTabs.vue (line ~83):**
```javascript
icon: comp.icon || 'fa-solid fa-cube',
```
- ✅ If comp.icon exists → Should display unique icons
- ❌ If comp.icon is undefined → Falls back to cube

---

## 🎯 POSSIBLE ROOT CAUSES

### Scenario A: PHP Not Reading Icon
**Symptom**: PHP debug.log shows empty icon field
**Cause**: `loadComponentJson()` not parsing JSON correctly
**Fix**: Check JSON parsing in ComponentDiscovery.php

### Scenario B: WordPress Cache Not Clearing
**Symptom**: PHP log shows correct icon, but old data persists
**Cause**: Transient cache not being deleted
**Fix**: Manually delete transients via WordPress dashboard

### Scenario C: JavaScript Not Receiving Data
**Symptom**: PHP shows icon, but JS console shows undefined
**Cause**: Data not flowing from `window.gmkbData` to UnifiedComponentRegistry
**Fix**: Check `loadWordPressDefinitions()` in UnifiedComponentRegistry.js

### Scenario D: Vue Not Using Icon
**Symptom**: JS receives icon, but still shows cubes
**Cause**: SidebarTabs.vue not reading icon from component data
**Fix**: Verify line ~83 in SidebarTabs.vue

---

## 🔧 MANUAL CACHE CLEAR

If automatic cache clear doesn't work:

### Option 1: WordPress Admin
1. Install plugin: "Transients Manager" or "WP Optimize"
2. Clear all transients
3. Reload page

### Option 2: Database Direct (Advanced)
```sql
DELETE FROM wp_options WHERE option_name LIKE '_transient_gmkb_component_discovery_%';
DELETE FROM wp_options WHERE option_name LIKE '_transient_timeout_gmkb_component_discovery_%';
```

### Option 3: PHP Direct (Add to functions.php temporarily)
```php
add_action('init', function() {
    global $wpdb;
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_gmkb_component_discovery_%'");
});
```

---

## 📋 REPORT BACK FORMAT

**Please share these 3 things:**

### 1. Browser Console Output
```
Copy and paste what you see after:
🔍 GMKB DEBUG: First component icon:
```

### 2. PHP Debug Log (if enabled)
```
Copy the line that shows:
🔍 GMKB DEBUG: First component data:
```

### 3. Current Icon Display
```
Still showing cubes? Or showing different icons?
```

---

## 🎯 NEXT STEPS

Based on your diagnostic results, we'll know:
1. **Where** the icon data is getting lost
2. **What** needs to be fixed
3. **How** to fix it properly

---

## 🚨 CRITICAL QUESTION

**Is WP_DEBUG enabled?**

To enable (in wp-config.php):
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Without this, we won't see the PHP debug logs!

---

**STATUS**: DIAGNOSTIC MODE ACTIVE 🔍

Please run the diagnostic steps above and report back the console output!
