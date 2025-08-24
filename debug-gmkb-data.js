// Debug gmkbData availability
console.clear();
console.log('🔍 Checking gmkbData availability...\n');

console.log('window.gmkbData exists?', !!window.gmkbData);

if (window.gmkbData) {
    console.log('\n✅ gmkbData found! Properties:');
    Object.keys(window.gmkbData).forEach(key => {
        const value = window.gmkbData[key];
        if (typeof value === 'string' && value.length > 50) {
            console.log(`  ${key}:`, value.substring(0, 50) + '...');
        } else if (typeof value === 'object' && value !== null) {
            console.log(`  ${key}:`, Array.isArray(value) ? `Array(${value.length})` : 'Object');
        } else {
            console.log(`  ${key}:`, value);
        }
    });
    
    console.log('\n🔍 Critical properties check:');
    console.log('  ajaxUrl:', window.gmkbData.ajaxUrl);
    console.log('  nonce:', window.gmkbData.nonce);
    console.log('  post_id:', window.gmkbData.post_id);
    console.log('  postId:', window.gmkbData.postId);
} else {
    console.error('❌ gmkbData NOT FOUND!');
    
    console.log('\nChecking for alternative data sources:');
    console.log('  window.guestifyData:', !!window.guestifyData);
    console.log('  window.wp:', !!window.wp);
    console.log('  window.ajaxurl:', window.ajaxurl);
    
    // Check all global variables
    console.log('\n🔍 All global variables containing "gmkb":');
    Object.keys(window).filter(key => key.toLowerCase().includes('gmkb')).forEach(key => {
        console.log(`  ${key}:`, typeof window[key]);
    });
}

// Check if the script is loaded too early
console.log('\n⏱️ Document ready state:', document.readyState);
console.log('Scripts loaded:', document.querySelectorAll('script').length);

// Look for the localized script
const mainScript = document.querySelector('script#gmkb-main-script-js');
if (mainScript) {
    console.log('\n✅ Main script found:', mainScript.src);
} else {
    console.log('\n⚠️ Main script element not found');
}

// Test manual data injection
console.log('\n🔧 Testing manual data injection...');
if (!window.gmkbData) {
    window.gmkbData = {
        ajaxUrl: '/wp-admin/admin-ajax.php',
        nonce: 'test-nonce',
        post_id: 32372
    };
    console.log('✅ Manually injected gmkbData');
}
