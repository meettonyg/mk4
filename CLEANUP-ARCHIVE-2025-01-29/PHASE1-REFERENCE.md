# Phase 1 Vue Implementation - Quick Reference

## IMPORTANT: Configuration Object Name
The Vue bundle expects `window.gmkbData` (NOT `gmkbConfig`)

## Console Commands for Testing

### 1. Check Configuration
```javascript
// Check if configuration exists
console.log('gmkbData available:', typeof gmkbData !== 'undefined' ? '✅ YES' : '❌ NO');

// View full configuration
console.log('gmkbData:', gmkbData);

// Check specific values
console.log('API URL:', gmkbData?.api);
console.log('REST Nonce:', gmkbData?.nonce);
console.log('Post ID:', gmkbData?.postId);
console.log('Pods Data:', gmkbData?.pods_data);
```

### 2. Test API Endpoint
```javascript
// Test the Phase 1 API
fetch(`${gmkbData.api}mediakit/${gmkbData.postId}`, {
    headers: { 'X-WP-Nonce': gmkbData.nonce }
})
.then(r => r.json())
.then(data => {
    console.log('✅ API Response:', data);
    console.log('Components:', data.components);
    console.log('Sections:', data.sections);
    console.log('Pods fields:', Object.keys(data.podsData || {}));
})
.catch(error => console.error('❌ API Error:', error));
```

### 3. Check Vue App Status
```javascript
// Check if Vue app is initialized
console.log('Vue App:', window.gmkbApp ? '✅ Initialized' : '❌ Not initialized');
console.log('Vue Store:', window.gmkbStore ? '✅ Available' : '❌ Not available');
console.log('Theme Store:', window.themeStore ? '✅ Available' : '❌ Not available');
```

### 4. Add Components (after Vue initializes)
```javascript
// Add a hero component
GMKB.addComponent('hero');

// Add a biography component
GMKB.addComponent('biography');

// View current state
GMKB.getState();

// Save to WordPress
GMKB.save();
```

### 5. Debug Commands
```javascript
// Run Phase 1 diagnostic
testPhase1API();

// Get current config
getPhase1Config();

// Check for legacy scripts
Array.from(document.querySelectorAll('script[src*="/js/"]')).forEach(s => console.log(s.src));
```

## Common Issues and Solutions

### Issue: "gmkbConfig is not defined"
**Solution**: Use `gmkbData` instead. The Vue bundle expects `gmkbData`.

### Issue: "gmkbData is not defined"
**Solution**: Check if the page is in Pure Vue Mode. Look for this script tag:
```html
<script id="gmkb-lean-bundle-js-before">
/* <![CDATA[ */
var gmkbData = {...};
/* ]]> */
</script>
```

### Issue: API returns 401 Unauthorized
**Solution**: Check the nonce is valid:
```javascript
console.log('Nonce:', gmkbData?.nonce);
```

### Issue: Vue app not initializing
**Solution**: Check console for errors and verify:
1. gmkbData exists
2. Vue bundle is loaded (gmkb.iife.js)
3. No legacy scripts interfering

## File Locations

- **PHP Config**: `includes/enqueue.php` (line ~344)
- **Vue Entry**: `src/main.js`
- **API Handler**: `includes/api/MediaKitAPI.php`
- **Diagnostic**: `js/phase1-diagnostic.js`

## Key Principles
1. ✅ Vue bundle expects `window.gmkbData`
2. ✅ No bridges or patches needed
3. ✅ Single configuration object
4. ✅ API-first architecture
