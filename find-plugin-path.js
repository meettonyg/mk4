// Quick script to find the correct plugin path
console.log('=== FINDING PLUGIN PATH ===');

// Check various possible locations for plugin URL
console.log('Checking window.guestifyData:', window.guestifyData);
console.log('Plugin URL from guestifyData:', window.guestifyData?.pluginUrl);

console.log('\nChecking window.gmkb_data:', window.gmkb_data);
console.log('Plugin URL from gmkb_data:', window.gmkb_data?.plugin_url);

console.log('\nChecking window.guestifyMediaKitBuilder:', window.guestifyMediaKitBuilder);
console.log('Plugin URL from guestifyMediaKitBuilder:', window.guestifyMediaKitBuilder?.pluginUrl);

// Check script tags to find plugin path
const scripts = Array.from(document.querySelectorAll('script[src*="guestify"]'));
console.log('\nScript tags containing "guestify":');
scripts.forEach(script => {
    console.log(script.src);
});

// Try to determine the correct path
let pluginPath = '';
if (window.guestifyData?.pluginUrl) {
    pluginPath = window.guestifyData.pluginUrl;
} else if (window.gmkb_data?.plugin_url) {
    pluginPath = gmkb_data.plugin_url;
} else if (window.guestifyMediaKitBuilder?.pluginUrl) {
    pluginPath = window.guestifyMediaKitBuilder.pluginUrl;
} else {
    // Try to extract from a script src
    const mainScript = document.querySelector('script[src*="guestify-media-kit-builder"]');
    if (mainScript) {
        const src = mainScript.src;
        const match = src.match(/(.*\/guestify-media-kit-builder\/)/);
        if (match) {
            pluginPath = match[1];
        }
    }
}

console.log('\nDetermined plugin path:', pluginPath || 'NOT FOUND');

if (pluginPath) {
    console.log('\n=== USE THESE COMMANDS ===');
    console.log(`const s1 = document.createElement('script');`);
    console.log(`s1.src = '${pluginPath}debug-delete-enhanced.js';`);
    console.log(`document.head.appendChild(s1);`);
    
    console.log(`\nconst s2 = document.createElement('script');`);
    console.log(`s2.src = '${pluginPath}test-switch-statement.js';`);
    console.log(`document.head.appendChild(s2);`);
} else {
    console.log('\nCould not determine plugin path automatically.');
    console.log('Look for any script tag with "guestify-media-kit-builder" in the Network tab');
}
