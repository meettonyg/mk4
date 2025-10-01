# Phase 2 Testing Guide

## Quick Start

### Step 1: Rebuild the Vue Bundle

The updated `APIService.js` needs to be compiled into the Vue bundle:

```bash
# Option A: Using the batch file (Windows)
rebuild-phase2.bat

# Option B: Manual command
npm run build
```

**What this does**: Compiles `src/services/APIService.js` into `dist/gmkb.iife.js`

### Step 2: Refresh Your Browser

After rebuilding:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Reload the Media Kit Builder page
3. Open browser console (F12)

---

## Testing Methods

### Method 1: Direct REST API Test (Simplest)

Test the new API endpoints directly without the Vue bundle:

```javascript
// Test GET endpoint (load data)
fetch('/wp-json/gmkb/v2/mediakit/' + window.gmkbData.postId, {
  method: 'GET',
  headers: {
    'X-WP-Nonce': window.gmkbData.restNonce
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ API Response:', data);
  console.log('Components:', Object.keys(data.state.components).length);
  console.log('Pods fields:', Object.keys(data.podsData).length);
})
.catch(error => console.error('❌ Error:', error));
```

### Method 2: Test via Vue Service (After Rebuild)

Once the Vue bundle is rebuilt and loaded:

```javascript
// Check if APIService is available
if (window.gmkbApp?.$apiService) {
  const api = window.gmkbApp.$apiService;
  
  // Test load
  api.load().then(data => {
    console.log('✅ Loaded:', data);
  });
  
  // Test cache
  api.load().then(data => {
    console.log('✅ Cached load (should be instant)');
  });
  
} else {
  console.log('⏳ Vue app still initializing...');
}
```

### Method 3: Performance Test

```javascript
async function testPhase2Performance() {
  const postId = window.gmkbData.postId;
  const nonce = window.gmkbData.restNonce;
  const baseUrl = `/wp-json/gmkb/v2/mediakit/${postId}`;
  
  console.group('🧪 Phase 2 Performance Test');
  
  // Test 1: Initial load
  console.log('1️⃣ Testing initial load...');
  const start1 = performance.now();
  const response1 = await fetch(baseUrl, {
    headers: { 'X-WP-Nonce': nonce }
  });
  const data1 = await response1.json();
  const time1 = performance.now() - start1;
  console.log(`✅ Initial load: ${time1.toFixed(2)}ms`);
  
  // Test 2: Verify single query optimization
  console.log('2️⃣ Checking data completeness...');
  console.log(`  Components: ${Object.keys(data1.state.components).length}`);
  console.log(`  Sections: ${data1.state.sections.length}`);
  console.log(`  Pods fields: ${Object.keys(data1.podsData).length}`);
  console.log(`  Theme: ${data1.theme.id}`);
  
  // Test 3: Save operation
  console.log('3️⃣ Testing save...');
  const start2 = performance.now();
  const response2 = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce
    },
    body: JSON.stringify({
      components: data1.state.components,
      sections: data1.state.sections,
      layout: data1.state.layout,
      globalSettings: data1.state.globalSettings,
      theme: data1.theme.id
    })
  });
  const data2 = await response2.json();
  const time2 = performance.now() - start2;
  console.log(`✅ Save: ${time2.toFixed(2)}ms`);
  console.log(`  Data size: ${Math.round(data2.data_size / 1024)}KB`);
  
  console.groupEnd();
  
  return {
    loadTime: time1,
    saveTime: time2,
    componentCount: Object.keys(data1.state.components).length,
    podsFieldCount: Object.keys(data1.podsData).length,
    dataSize: data2.data_size
  };
}

// Run the test
testPhase2Performance().then(results => {
  console.log('📊 Results:', results);
});
```

---

## Expected Results

### ✅ Successful Implementation

You should see:

1. **Single API Call**: 
   - Network tab shows only ONE request to `/wp-json/gmkb/v2/mediakit/{id}`
   - Response includes ALL data (components, sections, Pods, theme)

2. **Performance**:
   - Load time: 100-200ms
   - Data includes 50+ Pods fields
   - No multiple AJAX requests

3. **Console Output**:
   ```
   ✅ GMKB Phase 2: REST API v2 loaded (unified endpoint)
   ✅ API Response: { success: true, version: "2.0", ... }
   Components: 5
   Pods fields: 52
   ```

### ❌ Common Issues

#### Issue 1: "APIService is not defined"

**Cause**: Vue bundle not rebuilt or not loaded

**Solution**:
```bash
npm run build
# Then refresh browser
```

#### Issue 2: "404 Not Found" on API endpoint

**Cause**: WordPress permalinks need flushing

**Solution**:
1. Go to WordPress Admin → Settings → Permalinks
2. Click "Save Changes" (no changes needed)
3. Try again

#### Issue 3: "403 Forbidden"

**Cause**: Nonce expired or permissions issue

**Solution**:
```javascript
// Refresh the page to get new nonce
location.reload();
```

#### Issue 4: Vue bundle not loading

**Cause**: Build failed or path incorrect

**Solution**:
```bash
# Check if bundle exists
ls dist/gmkb.iife.js

# If missing, rebuild
npm install
npm run build
```

---

## Validation Checklist

Use this checklist to verify Phase 2 is working correctly:

### Backend (PHP) ✅

- [ ] File exists: `includes/api/v2/class-gmkb-rest-api-v2.php`
- [ ] Endpoint registered: Check WP_DEBUG logs for "REST API v2 loaded"
- [ ] Can access: `/wp-json/gmkb/v2/mediakit/{id}` returns data
- [ ] Single query: Response includes all Pods fields

### Frontend (JavaScript) ✅

- [ ] File updated: `src/services/APIService.js` uses REST API
- [ ] Bundle rebuilt: `dist/gmkb.iife.js` updated timestamp
- [ ] Service available: `window.gmkbApp` exists after page load
- [ ] Cache working: Second load is significantly faster

### Integration ✅

- [ ] Load works: Can fetch complete media kit data
- [ ] Save works: Can persist changes to database
- [ ] Components load: Can fetch component metadata
- [ ] No errors: Console is clean (no red errors)

### Performance ✅

- [ ] Load time: < 200ms
- [ ] Query count: ≤ 5 queries (check WP_DEBUG logs)
- [ ] Data complete: All 50+ Pods fields present
- [ ] Cache effective: 95%+ speedup on repeat loads

---

## Debug Commands

### Check API Endpoint Registration

```javascript
// List all GMKB routes
fetch('/wp-json/')
  .then(r => r.json())
  .then(data => {
    const routes = data.routes;
    const gmkbRoutes = Object.keys(routes).filter(r => r.includes('gmkb'));
    console.log('GMKB Routes:', gmkbRoutes);
  });

// Should include:
// - /gmkb/v2/mediakit/(?P<id>\d+)
// - /gmkb/v2/components
```

### Check Vue Bundle

```javascript
// Check if bundle loaded
console.log('Bundle loaded:', !!window.gmkbApp);

// Check APIService class
console.log('APIService:', typeof APIService);

// Check instance
console.log('API instance:', window.gmkbApp?.$apiService);
```

### Monitor Network Requests

```javascript
// Before Phase 2: You'd see multiple requests
// admin-ajax.php?action=gmkb_load_media_kit_vue
// admin-ajax.php?action=gmkb_get_components
// etc.

// After Phase 2: You should see only ONE request
// /wp-json/gmkb/v2/mediakit/123
```

---

## Next Steps After Testing

Once Phase 2 tests pass:

1. ✅ **Mark Phase 2 Complete**
2. 📋 **Document any issues found**
3. 🚀 **Proceed to Phase 3**: Pure Vue Template
4. 📝 **Update project documentation**

---

## Support & Troubleshooting

### WordPress Debug Mode

Enable for detailed logs:

```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Then check: `wp-content/debug.log`

### Browser DevTools

**Network Tab**:
- Filter: `/wp-json/gmkb/v2/`
- Look for: 200 OK status
- Check: Response data completeness

**Console Tab**:
- Look for: "✅ GMKB Phase 2:" messages
- Check for: Red error messages
- Verify: Vue app initialization

**Performance Tab**:
- Record page load
- Check: Script evaluation time
- Verify: No long tasks blocking

---

## Success Criteria

Phase 2 is successful when:

✅ **Single API endpoint** loading all data  
✅ **Load time** < 200ms  
✅ **Query count** ≤ 5  
✅ **Cache** working (95%+ speedup)  
✅ **No console errors**  
✅ **All tests passing**  

**Status**: Ready for Phase 3 ✨
