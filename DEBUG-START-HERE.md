# 🔍 Pods Data Not Populating - Debug Guide

**Issue**: Pods fields are not showing data in components  
**Created**: October 28, 2025  
**Tools Provided**: 3 debugging scripts + guide

---

## 🚀 Quick Start (Do This First!)

### Step 1: Open Browser Console
1. Open your media kit builder page
2. Press **F12** (or right-click > Inspect)
3. Click **Console** tab

### Step 2: Run Quick Debug Script

**Copy the ENTIRE contents of `quick-pods-debug.js` and paste into console**

OR paste this directly:

```javascript
// Paste entire contents of quick-pods-debug.js here
```

### Step 3: Read the Output

The script will tell you immediately:
- ✅ If data exists
- ❌ What's missing
- 💡 What to do next

---

## 📁 Debug Files Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| **quick-pods-debug.js** | Fast diagnosis (30 sec) | Use first - immediate issue identification |
| **console-pods-debug.js** | Full diagnostic (2 min) | Use for deep dive after quick check |
| **DEBUG-PODS-CONSOLE.md** | Complete guide | Reference for understanding issues |
| **verify-pods-architecture.php** | Server-side verification | Check PHP/WordPress side |

---

## 🎯 Common Issues & Solutions

### Issue 1: "gmkbData does NOT exist"

**Cause**: PHP enqueue failed

**Solution**:
1. Check WordPress debug.log
2. Look for errors in `gmkb_prepare_data_for_injection()`
3. Verify enqueue.php is loaded

**Debug Command**:
```php
// Add to functions.php temporarily
add_action('wp_footer', function() {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('=== ENQUEUE DEBUG ===');
        error_log('gmkb_is_builder_page: ' . (gmkb_is_builder_page() ? 'YES' : 'NO'));
        error_log('Current URI: ' . $_SERVER['REQUEST_URI']);
    }
}, 999);
```

---

### Issue 2: "pods_data is EMPTY"

**Cause**: No Pods data for this post

**Solution**:
1. Note the Post ID from console output
2. Go to WordPress admin
3. Find and edit that post
4. Fill in Pods fields
5. Save and refresh

**Quick Check**:
```javascript
console.log('Post ID:', window.gmkbData.postId);
// Then go to WordPress > Posts > Edit post with that ID
```

---

### Issue 3: "All fields are EMPTY"

**Cause**: Pods fields exist but have no data

**Solution**:
1. Edit the post in WordPress
2. Scroll to Pods meta boxes
3. Fill in fields like:
   - First Name
   - Last Name
   - Biography
   - Social media links
4. Save and refresh page

---

### Issue 4: "Data exists but components still empty"

**Cause**: Component not using data correctly

**Solution**:

1. **Install Vue DevTools** (Chrome/Firefox extension)

2. **Check component in DevTools**:
   - Open Vue DevTools
   - Find component (e.g., `BiographyRenderer`)
   - Check if it has `podsData` prop
   - Verify data is present

3. **Check component code**:
```vue
<!-- Component should have this -->
<script setup>
import { usePodsData } from '@/composables/usePodsData';

const podsData = usePodsData(); // ✅ Must call this
</script>

<template>
  <!-- Should bind to podsData -->
  <div>{{ podsData.first_name }}</div>
</template>
```

4. **Common mistakes**:
```javascript
// ❌ WRONG - not using composable
const podsData = window.gmkbData.pods_data;

// ❌ WRONG - wrong field name
{{ podsData.firstName }} // Should be first_name

// ✅ CORRECT
import { usePodsData } from '@/composables/usePodsData';
const podsData = usePodsData();
{{ podsData.first_name }}
```

---

## 📊 Debug Checklist

Run through this checklist:

### Phase 1: Data Availability
- [ ] Run `quick-pods-debug.js`
- [ ] Verify `window.gmkbData` exists
- [ ] Verify `window.gmkbData.pods_data` exists
- [ ] Check field count > 0
- [ ] Verify some fields have data

**If any fail**: Check WordPress debug.log for PHP errors

### Phase 2: Data Flow
- [ ] Check Pinia store exists (`window.__PINIA__`)
- [ ] Check store has `podsData`
- [ ] Verify field counts match

**If any fail**: Vue app may not be initialized

### Phase 3: Component Usage
- [ ] Install Vue DevTools
- [ ] Find component in DevTools
- [ ] Check component has `podsData`
- [ ] Verify template uses correct field names

**If any fail**: Component code needs fixing

---

## 🔧 Advanced Debugging

### Check REST API Directly

```javascript
fetch(window.gmkbData.restUrl + 'gmkb/v2/mediakit/' + window.gmkbData.postId, {
    headers: {'X-WP-Nonce': window.gmkbData.restNonce}
})
.then(r => r.json())
.then(d => {
    console.log('REST API Response:', d);
    console.log('Pods Data:', d.podsData);
    console.table(d.podsData);
})
.catch(e => console.error('API Error:', e));
```

### Check ComponentDiscovery (PHP side)

Add to `functions.php`:
```php
add_action('wp_footer', function() {
    global $gmkb_component_discovery;
    
    if ($gmkb_component_discovery) {
        $fields = $gmkb_component_discovery->getRequiredPodsFields();
        error_log('Discovered ' . count($fields) . ' Pods fields');
        error_log('Fields: ' . implode(', ', $fields));
    } else {
        error_log('ComponentDiscovery not available!');
    }
}, 999);
```

### Check Specific Component

```javascript
// Find all biography components
const bioComponents = document.querySelectorAll('[data-component-type="biography"]');
console.log('Biography components found:', bioComponents.length);

// Check their content
bioComponents.forEach((el, i) => {
    console.log('Bio ' + i + ' content:', el.textContent.substring(0, 100));
});
```

---

## 📝 What to Report

If you need help, provide:

1. **Console output** from `quick-pods-debug.js`
2. **WordPress debug.log** excerpt
3. **Post ID** being tested
4. **Component type** that's not working
5. **Browser** and version
6. **Screenshots** of:
   - Browser console
   - Vue DevTools (if installed)
   - WordPress post edit screen

---

## 🎓 Understanding the Data Flow

```
WordPress/PHP Side:
┌─────────────────────────────────────┐
│ ComponentDiscovery                  │
│ - Scans pods-config.json files     │
│ - Returns list of required fields  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ gmkb_get_pods_data($post_id)       │
│ - Uses discovered fields            │
│ - Fetches from Pods API             │
│ - Returns associative array         │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ gmkb_prepare_data_for_injection()  │
│ - Includes pods_data in gmkbData   │
│ - Outputs as window.gmkbData       │
└─────────────────────────────────────┘

Browser/JavaScript Side:
┌─────────────────────────────────────┐
│ window.gmkbData.pods_data          │
│ Available immediately on page load │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Pinia Store                         │
│ state.podsData = gmkbData.pods_data│
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Vue Component                       │
│ const podsData = usePodsData()     │
│ {{ podsData.first_name }}          │
└─────────────────────────────────────┘
```

**Any break in this chain = no data in components**

---

## 💡 Pro Tips

### Tip 1: Enable WP_DEBUG
In `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### Tip 2: Clear All Caches
```php
// Add to functions.php temporarily
add_action('init', function() {
    // Clear component cache
    delete_transient('gmkb_component_discovery_' . md5(GUESTIFY_PLUGIN_DIR . 'components/'));
    
    // Clear REST API cache
    global $wpdb;
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_gmkb_mediakit_%'");
    
    error_log('Caches cleared');
}, 1);
```

### Tip 3: Watch Network Tab
1. Open DevTools > Network tab
2. Refresh page
3. Filter by "gmkb"
4. Check REST API calls
5. Verify responses contain data

---

## 📞 Still Stuck?

If you've tried everything:

1. Run `console-pods-debug.js` (full diagnostic)
2. Run `verify-pods-architecture.php` (PHP side)
3. Save all output
4. Check WordPress debug.log
5. Note which specific tests fail
6. Report with all debugging info

---

## ✅ Success Indicators

You know it's working when:

✅ Console shows: "Data exists with X fields"  
✅ Console shows: "X fields have data"  
✅ Pinia store has podsData  
✅ Components display actual text (not empty)  
✅ Vue DevTools shows data in components  

---

**Created**: October 28, 2025  
**Purpose**: Debug Pods data not populating in components  
**Status**: Ready to use

**Start with**: `quick-pods-debug.js` in browser console!
