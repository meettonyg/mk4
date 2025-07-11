// Debug script for MKCG Refresh AJAX issues
console.log('=== MKCG Refresh Debug ===');

// Check 1: Are the required globals available?
console.log('1. Checking globals:');
console.log('   - ajaxurl:', window.guestifyData?.ajaxurl || 'NOT FOUND');
console.log('   - nonce:', window.guestifyData?.nonce || 'NOT FOUND');
console.log('   - postId:', window.guestifyData?.postId || 'NOT FOUND');
console.log('   - mkcgData:', window.guestifyData?.mkcgData ? 'EXISTS' : 'NOT FOUND');

// Check 2: What's the refresh manager status?
if (window.mkcgDataRefreshManager) {
    console.log('2. Refresh Manager Status:');
    const stats = window.mkcgDataRefreshManager.getRefreshStats();
    console.log('   - isRefreshing:', stats.isRefreshing);
    console.log('   - config:', stats.config);
} else {
    console.log('2. Refresh Manager: NOT FOUND');
}

// Check 3: Test a simple AJAX request to see what happens
if (window.guestifyData?.ajaxurl) {
    console.log('3. Testing AJAX endpoint:');
    
    // Test with the standard WordPress test action
    fetch(window.guestifyData.ajaxurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'heartbeat',
            _nonce: window.guestifyData.nonce || ''
        })
    })
    .then(response => {
        console.log('   - Heartbeat test status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('   - Heartbeat response:', text.substring(0, 100) + '...');
    })
    .catch(error => {
        console.error('   - Heartbeat test error:', error);
    });
    
    // Now test the actual MKCG endpoint
    console.log('4. Testing MKCG refresh endpoint:');
    
    const testData = {
        action: 'gmkb_check_mkcg_freshness',
        nonce: window.guestifyData.nonce || '',
        post_id: window.guestifyData.postId || 0,
        client_timestamp: Date.now()
    };
    
    console.log('   - Request data:', testData);
    
    fetch(window.guestifyData.ajaxurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(testData)
    })
    .then(response => {
        console.log('   - MKCG endpoint status:', response.status);
        if (!response.ok) {
            console.log('   - Response headers:', response.headers);
        }
        return response.text();
    })
    .then(text => {
        console.log('   - MKCG response:', text);
        try {
            const json = JSON.parse(text);
            console.log('   - Parsed response:', json);
        } catch (e) {
            console.log('   - Response is not JSON');
        }
    })
    .catch(error => {
        console.error('   - MKCG endpoint error:', error);
    });
} else {
    console.log('3. Cannot test AJAX - ajaxurl not found');
}

// Check 4: Look for any MKCG timestamp
if (window.guestifyData?.mkcgData?.meta_info?.extraction_timestamp) {
    console.log('5. MKCG Timestamp found:', window.guestifyData.mkcgData.meta_info.extraction_timestamp);
} else {
    console.log('5. No MKCG timestamp found - this might be why refresh is failing');
}

console.log('=== Debug Complete ===');
console.log('If you see "0" as the response, the AJAX handler is reached but returning empty.');
console.log('If you see HTML, WordPress is not recognizing the AJAX action.');
