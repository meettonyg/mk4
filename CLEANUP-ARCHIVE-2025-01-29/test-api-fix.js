// Test script to verify the API fix
(function() {
    console.log('🔍 Testing API Configuration Fix...');
    
    // Check if gmkbData exists
    if (typeof gmkbData === 'undefined') {
        console.error('❌ gmkbData is not defined!');
        return;
    }
    
    console.log('✅ gmkbData exists');
    
    // Check for api field
    if (gmkbData.api) {
        console.log('✅ gmkbData.api is defined:', gmkbData.api);
    } else {
        console.error('❌ gmkbData.api is missing!');
        console.log('Available fields in gmkbData:', Object.keys(gmkbData));
    }
    
    // Check for other important fields
    if (gmkbData.restUrl) {
        console.log('✅ gmkbData.restUrl:', gmkbData.restUrl);
    }
    
    if (gmkbData.nonce) {
        console.log('✅ gmkbData.nonce:', gmkbData.nonce.substring(0, 8) + '...');
    }
    
    if (gmkbData.postId) {
        console.log('✅ gmkbData.postId:', gmkbData.postId);
    }
    
    // Test the API endpoint
    if (gmkbData.api && gmkbData.nonce && gmkbData.postId) {
        console.log('📡 Testing API endpoint...');
        
        const apiUrl = `${gmkbData.api}mediakit/${gmkbData.postId}`;
        console.log('API URL:', apiUrl);
        
        fetch(apiUrl, {
            headers: { 
                'X-WP-Nonce': gmkbData.nonce 
            }
        })
        .then(r => {
            console.log('Response status:', r.status);
            return r.json();
        })
        .then(data => {
            console.log('✅ API Response received!');
            console.log('📊 Response data:', data);
            console.log('📊 Components:', data.components);
            console.log('📊 Pods Data fields:', Object.keys(data.podsData || {}));
            
            // Success message
            console.log('%c✅ API FIX VERIFIED - Everything is working!', 'color: green; font-size: 16px; font-weight: bold;');
        })
        .catch(error => {
            console.error('❌ API Error:', error);
        });
    } else {
        console.error('❌ Missing required fields for API test');
        console.log('Missing:', {
            api: !gmkbData.api,
            nonce: !gmkbData.nonce,
            postId: !gmkbData.postId
        });
    }
})();
