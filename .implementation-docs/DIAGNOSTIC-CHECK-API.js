// DIAGNOSTIC: Check what REST API is actually returning

// Fix the Pinia access
console.log('=== PODS DATA DIAGNOSTIC ===');
console.log('Post ID:', window.$pinia?.state?.value?.mediaKit?.postId);
console.log('Store Pods Data:', window.$pinia?.state?.value?.mediaKit?.podsData);

// Check gmkbData (initial data from PHP)
console.log('Initial gmkbData Pods:', window.gmkbData?.podsData);

// Make a fresh API call to see what's returned
fetch(window.gmkbData?.restUrl + 'gmkb/v2/mediakit/' + window.gmkbData?.postId, {
  method: 'GET',
  headers: {
    'X-WP-Nonce': window.gmkbData?.restNonce
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== REST API RESPONSE ===');
  console.log('Full response:', data);
  console.log('Pods data keys:', Object.keys(data.podsData || {}));
  console.log('Pods data:', data.podsData);
  console.log('Has introduction?', 'introduction' in (data.podsData || {}));
  console.log('Introduction value:', data.podsData?.introduction);
})
.catch(err => console.error('API Error:', err));
