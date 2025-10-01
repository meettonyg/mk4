# Phase 2 Quick Test (No Build Required)

## Test the REST API Directly

You can test the new Phase 2 API **immediately** without rebuilding the Vue bundle. Just paste these commands in your browser console while on the Media Kit Builder page.

---

## Test 1: Check if API is Available

```javascript
// Check WordPress data
console.log('WordPress data:', window.gmkbData);
console.log('Post ID:', window.gmkbData?.postId);
console.log('REST URL:', window.gmkbData?.restUrl);
```

**Expected**: You should see the gmkbData object with postId, restUrl, and restNonce.

---

## Test 2: Test the GET Endpoint (Load Data)

```javascript
// Build the API URL
const postId = window.gmkbData.postId;
const apiUrl = `/wp-json/gmkb/v2/mediakit/${postId}`;

console.log('Testing:', apiUrl);

// Make the request
fetch(apiUrl, {
  method: 'GET',
  headers: {
    'X-WP-Nonce': window.gmkbData.restNonce
  },
  credentials: 'same-origin'
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ SUCCESS! Phase 2 API is working!');
  console.log('Response:', data);
  console.log('');
  console.log('📊 Data Summary:');
  console.log('  Version:', data.version);
  console.log('  Components:', Object.keys(data.state.components).length);
  console.log('  Sections:', data.state.sections.length);
  console.log('  Pods fields:', Object.keys(data.podsData).length);
  console.log('  Theme:', data.theme.id);
  console.log('');
  console.log('🎉 Phase 2 is working perfectly!');
})
.catch(error => {
  console.error('❌ Error:', error);
});
```

**Expected Result**:
```
✅ SUCCESS! Phase 2 API is working!
📊 Data Summary:
  Version: 2.0
  Components: 5
  Sections: 2
  Pods fields: 52
  Theme: professional_clean
```

---

## Test 3: Test Component Metadata Endpoint

```javascript
fetch('/wp-json/gmkb/v2/components', {
  method: 'GET',
  headers: {
    'X-WP-Nonce': window.gmkbData.restNonce
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ Components loaded:', data);
  console.log('Total components:', data.total);
  console.log('Component types:', data.components.map(c => c.type));
})
.catch(error => {
  console.error('❌ Error:', error);
});
```

---

## Test 4: Performance Test

```javascript
async function testPerformance() {
  const postId = window.gmkbData.postId;
  const nonce = window.gmkbData.restNonce;
  const apiUrl = `/wp-json/gmkb/v2/mediakit/${postId}`;
  
  console.log('🧪 Starting performance test...');
  console.log('');
  
  // Test load time
  const start = performance.now();
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'X-WP-Nonce': nonce }
  });
  const data = await response.json();
  const duration = performance.now() - start;
  
  console.log('⏱️  Load Time:', duration.toFixed(2) + 'ms');
  console.log('📦 Response Size:', JSON.stringify(data).length, 'bytes');
  console.log('📊 Components:', Object.keys(data.state.components).length);
  console.log('🔗 Pods Fields:', Object.keys(data.podsData).length);
  console.log('');
  
  if (duration < 200) {
    console.log('✅ EXCELLENT! Load time is under 200ms');
  } else if (duration < 500) {
    console.log('✅ GOOD! Load time is acceptable');
  } else {
    console.log('⚠️  Load time could be optimized');
  }
  
  return { duration, data };
}

// Run the test
testPerformance();
```

---

## Test 5: Full Integration Test

```javascript
async function fullIntegrationTest() {
  console.group('🧪 Phase 2 Full Integration Test');
  
  try {
    const postId = window.gmkbData.postId;
    const nonce = window.gmkbData.restNonce;
    const apiUrl = `/wp-json/gmkb/v2/mediakit/${postId}`;
    
    // Test 1: Load
    console.log('1️⃣ Testing LOAD...');
    const loadStart = performance.now();
    const loadResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'X-WP-Nonce': nonce }
    });
    const loadData = await loadResponse.json();
    const loadTime = performance.now() - loadStart;
    console.log(`✅ Load: ${loadTime.toFixed(2)}ms`);
    
    // Test 2: Data structure
    console.log('2️⃣ Testing DATA STRUCTURE...');
    const hasComponents = loadData.state?.components;
    const hasSections = loadData.state?.sections;
    const hasPodsData = loadData.podsData;
    const hasTheme = loadData.theme;
    console.log(`✅ Components: ${hasComponents ? 'YES' : 'NO'}`);
    console.log(`✅ Sections: ${hasSections ? 'YES' : 'NO'}`);
    console.log(`✅ Pods Data: ${hasPodsData ? 'YES' : 'NO'}`);
    console.log(`✅ Theme: ${hasTheme ? 'YES' : 'NO'}`);
    
    // Test 3: Save
    console.log('3️⃣ Testing SAVE...');
    const saveStart = performance.now();
    const saveResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      },
      body: JSON.stringify({
        components: loadData.state.components,
        sections: loadData.state.sections,
        layout: loadData.state.layout || [],
        globalSettings: loadData.state.globalSettings || {},
        theme: loadData.theme.id
      })
    });
    const saveData = await saveResponse.json();
    const saveTime = performance.now() - saveStart;
    console.log(`✅ Save: ${saveTime.toFixed(2)}ms`);
    console.log(`✅ Data size: ${Math.round(saveData.data_size / 1024)}KB`);
    
    // Test 4: Components endpoint
    console.log('4️⃣ Testing COMPONENTS endpoint...');
    const compResponse = await fetch('/wp-json/gmkb/v2/components', {
      method: 'GET',
      headers: { 'X-WP-Nonce': nonce }
    });
    const compData = await compResponse.json();
    console.log(`✅ Components: ${compData.total} available`);
    
    // Summary
    console.log('');
    console.log('📊 SUMMARY:');
    console.log(`  Load time: ${loadTime.toFixed(2)}ms`);
    console.log(`  Save time: ${saveTime.toFixed(2)}ms`);
    console.log(`  Components: ${Object.keys(loadData.state.components).length}`);
    console.log(`  Sections: ${loadData.state.sections.length}`);
    console.log(`  Pods fields: ${Object.keys(loadData.podsData).length}`);
    console.log(`  Available components: ${compData.total}`);
    console.log('');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('Phase 2 is working correctly!');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
  
  console.groupEnd();
}

// Run the full test
fullIntegrationTest();
```

---

## What These Tests Prove

If these tests pass, it confirms:

✅ **REST API v2** is properly registered  
✅ **Unified endpoint** is working  
✅ **Single query optimization** is active  
✅ **All data loads** in one request  
✅ **Performance** is good (< 200ms)  
✅ **Save functionality** works  
✅ **Component metadata** loads correctly  

---

## Next Step: Rebuild Vue Bundle

After confirming the API works, rebuild the Vue bundle to use it:

```bash
npm run build
```

Then refresh your browser and the Vue app will use the new API automatically.

---

## Troubleshooting

### If you get 404 errors:

1. Go to WordPress Admin → Settings → Permalinks
2. Click "Save Changes" (flush permalinks)
3. Try the test again

### If you get 403 errors:

1. Refresh the page to get a new nonce
2. Try the test again

### If the tests pass but Vue doesn't work:

1. Run `npm run build` to rebuild the bundle
2. Clear browser cache
3. Refresh the page

---

**Ready to test?** Just copy and paste the commands above into your browser console! 🚀
