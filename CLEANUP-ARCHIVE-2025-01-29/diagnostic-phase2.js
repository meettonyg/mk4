// Phase 2 Diagnostic Script
// Run this in browser console to diagnose the 404 error

console.group('🔍 Phase 2 Diagnostic Check');

// Check 1: WordPress data availability
console.log('1️⃣ Checking WordPress data...');
if (window.gmkbData) {
  console.log('✅ gmkbData exists');
  console.log('  postId:', window.gmkbData.postId);
  console.log('  restUrl:', window.gmkbData.restUrl);
  console.log('  restNonce:', window.gmkbData.restNonce ? 'Present' : 'Missing');
} else {
  console.error('❌ gmkbData not found');
}

// Check 2: List all available REST routes
console.log('\n2️⃣ Checking available REST routes...');
fetch('/wp-json/')
  .then(r => r.json())
  .then(data => {
    const routes = Object.keys(data.routes);
    const gmkbRoutes = routes.filter(r => r.includes('gmkb'));
    
    console.log('Available GMKB routes:', gmkbRoutes.length);
    gmkbRoutes.forEach(route => {
      console.log('  -', route);
    });
    
    // Check specifically for v2 routes
    const v2Routes = gmkbRoutes.filter(r => r.includes('v2'));
    if (v2Routes.length === 0) {
      console.warn('⚠️  No v2 routes found! API may not be loaded.');
      console.log('\n💡 Solutions:');
      console.log('  1. Check if class-gmkb-rest-api-v2.php is being loaded');
      console.log('  2. Flush permalinks: Settings → Permalinks → Save');
      console.log('  3. Check PHP error logs for loading issues');
    } else {
      console.log('✅ Found v2 routes:', v2Routes);
    }
  })
  .catch(err => {
    console.error('❌ Could not fetch REST routes:', err);
  });

// Check 3: Test the specific endpoint
console.log('\n3️⃣ Testing specific endpoint...');
const postId = window.gmkbData?.postId || 'UNKNOWN';
const testUrl = `/wp-json/gmkb/v2/mediakit/${postId}`;
console.log('Testing:', testUrl);

fetch(testUrl, {
  method: 'GET',
  headers: {
    'X-WP-Nonce': window.gmkbData?.restNonce || ''
  }
})
.then(response => {
  console.log('Status:', response.status, response.statusText);
  console.log('Content-Type:', response.headers.get('content-type'));
  
  if (response.status === 404) {
    console.error('❌ 404 Not Found - Route not registered');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('  1. Verify file exists: includes/api/v2/class-gmkb-rest-api-v2.php');
    console.log('  2. Check main plugin loads it: guestify-media-kit-builder.php');
    console.log('  3. Flush permalinks: WP Admin → Settings → Permalinks → Save');
    console.log('  4. Check PHP error log for "GMKB Phase 2: REST API v2"');
  }
  
  return response.text();
})
.then(text => {
  console.log('\nResponse preview:');
  console.log(text.substring(0, 500));
  
  // Try to parse as JSON
  try {
    const data = JSON.parse(text);
    console.log('\n✅ Valid JSON response');
    console.log(data);
  } catch (e) {
    console.warn('\n⚠️  Response is not JSON (might be HTML 404 page)');
  }
})
.catch(err => {
  console.error('❌ Request failed:', err);
});

console.groupEnd();

// Additional check: Look for PHP debug logs in console
console.log('\n4️⃣ Looking for PHP debug messages...');
console.log('Check browser Network tab for:');
console.log('  - Request URL');
console.log('  - Response headers');
console.log('  - Response preview');
