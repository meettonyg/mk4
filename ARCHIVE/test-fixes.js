/**
 * Test Script - Run after applying fixes
 * Paste this in browser console to verify the fixes worked
 */

console.log('=== Testing Gemini-Identified Fixes ===\n');

// 1. Test ajaxurl availability
console.log('1. Ajax URL Tests:');
console.log('   window.ajaxurl:', window.ajaxurl || 'NOT DEFINED');
console.log('   guestifyData.ajaxUrl:', window.guestifyData?.ajaxUrl || 'NOT DEFINED');
console.log('   gmkb_data.ajax_url:', window.gmkb_data?.ajax_url || 'NOT DEFINED');

// 2. Test component data structure
console.log('\n2. Component Data Structure:');
if (window.guestifyData?.components) {
    console.log('   guestifyData.components is array:', Array.isArray(window.guestifyData.components));
    console.log('   Number of components:', window.guestifyData.components.length);
    if (window.guestifyData.components.length > 0) {
        console.log('   First component:', window.guestifyData.components[0]);
    }
} else {
    console.log('   guestifyData.components: NOT AVAILABLE');
}

// 3. Test nonce availability
console.log('\n3. Nonce Configuration:');
console.log('   guestifyData.nonce:', window.guestifyData?.nonce ? '✓ Present' : '✗ Missing');
console.log('   gmkb_data.nonce:', window.gmkb_data?.nonce ? '✓ Present' : '✗ Missing');

// 4. Test AJAX call
console.log('\n4. Testing AJAX Call:');
const testAjaxCall = async () => {
    try {
        const ajaxUrl = window.ajaxurl || window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php';
        const nonce = window.guestifyData?.nonce || window.gmkb_data?.nonce || '';
        
        console.log('   Using ajax URL:', ajaxUrl);
        console.log('   Using nonce:', nonce ? 'Present' : 'Missing');
        
        const response = await fetch(ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'guestify_get_components',
                nonce: nonce
            })
        });
        
        console.log('   Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('   ✓ AJAX call successful!');
            console.log('   Response:', data);
        } else {
            console.log('   ✗ AJAX call failed with status:', response.status);
        }
    } catch (error) {
        console.log('   ✗ AJAX call error:', error.message);
    }
};

testAjaxCall();

console.log('\n=== End of Test ===');
console.log('If all tests pass, the fixes are working correctly!');