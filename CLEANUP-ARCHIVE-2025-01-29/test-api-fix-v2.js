/**
 * Test script to force refresh and verify API configuration
 * 
 * Run this in the console to test the fix with fresh data
 */

(function() {
    console.log('🔄 Testing API Configuration After Cache Clear...');
    console.log('='.repeat(50));
    
    // Force reload the page to get fresh configuration
    if (confirm('This will reload the page to clear cache. Continue?')) {
        // Add cache-busting parameter to force fresh load
        const url = new URL(window.location.href);
        url.searchParams.set('cache_bust', Date.now());
        window.location.href = url.toString();
    } else {
        console.log('Manual test without reload:');
        console.log('');
        
        // Check current state
        console.log('Current gmkbData state:');
        if (typeof gmkbData !== 'undefined') {
            console.log('✅ gmkbData exists');
            console.log('  api:', gmkbData.api || '❌ MISSING');
            console.log('  restUrl:', gmkbData.restUrl || '❌ MISSING');
            console.log('  nonce:', gmkbData.nonce ? '✅ Present' : '❌ MISSING');
            console.log('  ajaxNonce:', gmkbData.ajaxNonce ? '✅ Present' : '❌ MISSING');
            console.log('  postId:', gmkbData.postId || '❌ MISSING');
            
            if (!gmkbData.api) {
                console.log('');
                console.log('⚠️ API field is missing. The fix may not have taken effect yet.');
                console.log('');
                console.log('To fix this:');
                console.log('1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)');
                console.log('2. Or add ?v=' + Date.now() + ' to the URL and reload');
                console.log('3. Or open in incognito/private mode');
            } else {
                console.log('');
                console.log('✅ API field is present! Testing the endpoint...');
                
                // Test the API
                const apiUrl = `${gmkbData.api}mediakit/${gmkbData.postId}`;
                console.log('Testing:', apiUrl);
                
                fetch(apiUrl, {
                    headers: { 
                        'X-WP-Nonce': gmkbData.nonce 
                    }
                })
                .then(response => {
                    console.log('Response status:', response.status);
                    if (response.status === 200) {
                        console.log('✅ API is working!');
                        return response.json();
                    } else if (response.status === 401) {
                        console.log('❌ 401 Unauthorized - nonce may be invalid');
                        console.log('Try refreshing the page to get a new nonce');
                        throw new Error('Unauthorized');
                    } else {
                        throw new Error('Status: ' + response.status);
                    }
                })
                .then(data => {
                    console.log('✅ Data received:', data);
                    console.log('Components:', data.components);
                    console.log('Pods Data:', data.podsData);
                })
                .catch(error => {
                    console.error('❌ Error:', error.message);
                });
            }
        } else {
            console.log('❌ gmkbData is not defined');
            console.log('This could mean:');
            console.log('1. The page is not a media kit builder page');
            console.log('2. Scripts haven\'t loaded yet');
            console.log('3. There\'s a JavaScript error preventing initialization');
        }
        
        console.log('');
        console.log('='.repeat(50));
        console.log('For AJAX 401 errors with custom themes:');
        console.log('The Vue app may be using the wrong nonce for AJAX calls.');
        console.log('The REST API nonce (for /wp-json/) is different from AJAX nonce.');
        console.log('Current nonces:');
        console.log('  REST nonce:', gmkbData?.nonce || 'Not available');
        console.log('  AJAX nonce:', gmkbData?.ajaxNonce || 'Not available');
    }
})();
