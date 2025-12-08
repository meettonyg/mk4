# Pods Data Debugging Guide

## Browser Console Debugging

### Step 1: Run Full Diagnostic Script

**Copy and paste this into browser console:**

```javascript
// Full diagnostic - paste entire content of console-pods-debug.js
```

OR use the file:
1. Open `console-pods-debug.js`
2. Copy all contents (Ctrl+A, Ctrl+C)
3. Open browser console (F12)
4. Paste and press Enter

---

### Step 2: Quick Checks (One-Liners)

Run these commands in browser console for quick checks:

#### Check if gmkbData exists
```javascript
console.log('gmkbData:', window.gmkbData); console.log('Has pods_data:', !!window.gmkbData?.pods_data); console.log('Pods fields:', Object.keys(window.gmkbData?.pods_data || {}));
```

#### Check Pods data contents
```javascript
console.table(window.gmkbData?.pods_data);
```

#### Check Pinia store
```javascript
console.log('Pinia stores:', Object.keys(window.__PINIA__?.state?.value || {})); console.log('Main store podsData:', window.__PINIA__?.state?.value?.main?.podsData);
```

#### Check specific field
```javascript
// Replace 'first_name' with any field
console.log('Field value:', window.gmkbData?.pods_data?.first_name);
```

#### Check all fields with data
```javascript
Object.entries(window.gmkbData?.pods_data || {}).filter(([k,v]) => v).forEach(([k,v]) => console.log(k + ':', v));
```

#### Check REST API manually
```javascript
fetch(window.gmkbData.restUrl + 'gmkb/v2/mediakit/' + window.gmkbData.postId, {
    headers: {'X-WP-Nonce': window.gmkbData.restNonce}
}).then(r => r.json()).then(d => {
    console.log('REST API podsData:', d.podsData);
    console.table(d.podsData);
});
```

#### Check component discovery
```javascript
fetch(window.gmkbData.restUrl + 'gmkb/v1/components/discover')
    .then(r => r.json())
    .then(d => console.log('Discovered components:', d));
```

---

## WordPress PHP Debugging

### Check PHP Side

Add this to your theme's `functions.php` or create a test page:

```php
// TEST 1: Check ComponentDiscovery
global $gmkb_component_discovery;
error_log('ComponentDiscovery exists: ' . (is_object($gmkb_component_discovery) ? 'YES' : 'NO'));

if ($gmkb_component_discovery) {
    $fields = $gmkb_component_discovery->getRequiredPodsFields();
    error_log('Discovered fields: ' . print_r($fields, true));
}

// TEST 2: Check gmkb_get_pods_data
$post_id = 123; // Replace with actual post ID
$pods_data = gmkb_get_pods_data($post_id);
error_log('Pods data for post ' . $post_id . ': ' . print_r($pods_data, true));

// TEST 3: Check Pods directly
if (function_exists('pods')) {
    $pod = pods('mkcg', $post_id); // or 'guests'
    if ($pod && $pod->exists()) {
        error_log('Pod exists: YES');
        error_log('First name: ' . $pod->field('first_name'));
        error_log('Biography: ' . substr($pod->field('biography'), 0, 100));
    } else {
        error_log('Pod exists: NO');
    }
} else {
    error_log('Pods function not available');
}

// TEST 4: Check REST API class
if (class_exists('GMKB_REST_API_V2')) {
    error_log('REST API v2 class exists: YES');
    $reflection = new ReflectionClass('GMKB_REST_API_V2');
    error_log('Has initialize_pods_fields: ' . ($reflection->hasMethod('initialize_pods_fields') ? 'YES' : 'NO'));
} else {
    error_log('REST API v2 class exists: NO');
}
```

Then check `wp-content/debug.log` for output.

---

## Common Issues & Solutions

### Issue 1: gmkbData.pods_data is empty

**Possible Causes:**
1. No guest selected (post ID invalid)
2. Pods plugin not active
3. Wrong post type (should be 'mkcg' or 'guests')
4. Guest has no data in Pods fields

**Debug:**
```javascript
console.log('Post ID:', window.gmkbData.postId);
console.log('Post Type:', window.gmkbData.postType); // May not exist
```

**Check in WordPress:**
1. Go to Posts > All Posts (or Guests)
2. Find the post with ID from console
3. Edit it
4. Verify Pods fields have data

---

### Issue 2: gmkbData exists but fields not displaying in components

**Possible Causes:**
1. Component not using `usePodsData()` composable
2. Component looking for wrong field names
3. Data binding issue in Vue template
4. Component not initialized yet

**Debug:**
```javascript
// Check if component is receiving data
// (Requires Vue DevTools installed)
// 1. Open Vue DevTools
// 2. Find component (e.g., BiographyRenderer)
// 3. Check props and data
```

**Check Component Code:**
Look at component's `.vue` file:
```vue
<script setup>
import { usePodsData } from '@/composables/usePodsData';

const podsData = usePodsData(); // Should be called
console.log('Component podsData:', podsData); // Add for debugging
</script>

<template>
  <div>{{ podsData.first_name }}</div> <!-- Should display -->
</template>
```

---

### Issue 3: REST API returns 403 or empty data

**Possible Causes:**
1. Nonce expired
2. User not logged in
3. Permission issues
4. Wrong post ID

**Debug:**
```javascript
// Check auth status
console.log('User logged in:', window.gmkbData.user?.isLoggedIn);
console.log('User can save:', window.gmkbData.user?.canSave);
console.log('Nonce:', window.gmkbData.restNonce);

// Try API call with error handling
fetch(window.gmkbData.restUrl + 'gmkb/v2/mediakit/' + window.gmkbData.postId, {
    headers: {'X-WP-Nonce': window.gmkbData.restNonce}
})
.then(r => {
    console.log('Status:', r.status);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
})
.then(d => console.log('Success:', d))
.catch(e => console.error('Failed:', e));
```

---

### Issue 4: ComponentDiscovery not finding fields

**Check pods-config.json files exist:**
```bash
# From plugin directory
find components -name "pods-config.json"
```

Should show 16 files like:
```
components/biography/pods-config.json
components/social/pods-config.json
components/hero/pods-config.json
...
```

**Check JSON syntax:**
```bash
# Validate each JSON file
cd components/biography
cat pods-config.json | python -m json.tool
```

**Clear cache:**
Add to functions.php temporarily:
```php
add_action('init', function() {
    global $gmkb_component_discovery;
    if ($gmkb_component_discovery) {
        $gmkb_component_discovery->clearCache();
        error_log('Component cache cleared');
    }
}, 999);
```

---

## Expected Debug Output

### Healthy System

**Console should show:**
```
✅ PASS: window.gmkbData exists
✅ PASS: gmkbData.pods_data exists with 25 fields
✅ PASS: Pinia store exists
✅ PASS: Main store has podsData
✅ PASS: REST API returns podsData with 25 fields
✅ PASS: Component registry has 16 components
```

**WordPress debug.log should show:**
```
ComponentDiscovery: Scanning components for Pods field requirements...
ComponentDiscovery: Component 'biography' requires 4 Pods fields
ComponentDiscovery: Total unique Pods fields required: 25
GMKB REST API v2: Using 25 Pods fields from component discovery
gmkb_get_pods_data: Using 25 fields from component discovery
```

---

## Data Flow Visualization

```
PHP (Server Side)
├─ ComponentDiscovery->getRequiredPodsFields()
│  ├─ Scans components/*/pods-config.json
│  └─ Returns ['first_name', 'last_name', ...]
│
├─ gmkb_get_pods_data($post_id)
│  ├─ Uses discovered fields
│  ├─ Calls pods()->field() for each
│  └─ Returns {first_name: 'John', last_name: 'Doe', ...}
│
└─ gmkb_prepare_data_for_injection()
   ├─ Includes pods_data
   └─ Outputs as window.gmkbData

JavaScript (Client Side)
├─ window.gmkbData.pods_data available immediately
│
├─ Pinia store initialized
│  └─ state.podsData = gmkbData.pods_data
│
└─ Vue components
   ├─ usePodsData() composable
   │  └─ Returns reactive podsData from store
   │
   └─ Template binds to podsData.field_name
```

---

## Quick Checklist

When debugging "fields not populating":

- [ ] Open browser console (F12)
- [ ] Run full diagnostic script
- [ ] Check `window.gmkbData` exists
- [ ] Check `window.gmkbData.pods_data` has data
- [ ] Check Pinia store has data
- [ ] Verify post ID is correct
- [ ] Check Pods plugin is active
- [ ] Verify guest has data in WordPress
- [ ] Check WordPress debug.log for PHP errors
- [ ] Install Vue DevTools if not installed
- [ ] Check component is using usePodsData()

---

## Get Help

If still stuck after debugging:

1. Run full diagnostic and save output
2. Check WordPress debug.log
3. Note which tests FAIL
4. Provide:
   - Browser console output
   - WordPress debug.log excerpt
   - Post ID being tested
   - Component that's not working
   - Whether other components work

---

**Files:**
- Full Diagnostic: `console-pods-debug.js`
- This Guide: `DEBUG-PODS-CONSOLE.md`
