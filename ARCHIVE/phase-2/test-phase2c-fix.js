/**
 * Quick fix test for Phase 2C REST API endpoint
 */

console.log('Testing Phase 2C REST API endpoint fix...\n');

// Wait for guestifyData to be available
function testRestEndpoint() {
    if (!window.guestifyData) {
        console.log('Waiting for guestifyData...');
        setTimeout(testRestEndpoint, 100);
        return;
    }
    
    console.log('guestifyData available:', {
        siteUrl: window.guestifyData.siteUrl,
        pluginUrl: window.guestifyData.pluginUrl,
        restUrl: window.guestifyData.restUrl,
        hasTemplates: !!window.guestifyData.templates,
        templateCount: window.guestifyData.templates?.length || 0
    });
    
    // Test the correct REST API URL
    const siteUrl = window.guestifyData.siteUrl || window.location.origin;
    const correctUrl = `${siteUrl}/wp-json/guestify/v1/templates/batch`;
    
    console.log('\nTesting correct REST API URL:', correctUrl);
    
    fetch(correctUrl)
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ REST API working!');
            console.log('Templates loaded:', Object.keys(data.templates || {}).length);
            console.log('Version:', data.version);
            console.log('Load time:', data.meta?.load_time_ms + 'ms');
        })
        .catch(error => {
            console.error('❌ REST API error:', error);
        });
}

// Start test
testRestEndpoint();
