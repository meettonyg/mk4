/**
 * Quick Diagnostic Script for GMKB Loading Issues
 * Copy and paste this directly into browser console
 */

console.log('%c🔍 GMKB DIAGNOSTIC SCRIPT', 'font-size: 16px; font-weight: bold; color: #dc2626; background: #fef2f2; padding: 10px; border-radius: 5px;');

// Check WordPress data
console.log('\n📊 WordPress Data Check:');
console.log('  gmkbData available:', !!window.gmkbData);
if (window.gmkbData) {
    console.log('  Architecture:', window.gmkbData.architecture);
    console.log('  AJAX URL:', window.gmkbData.ajaxUrl);
    console.log('  Nonce:', window.gmkbData.nonce ? 'Present' : 'Missing');
    console.log('  Post ID:', window.gmkbData.postId);
} else {
    console.warn('  ❌ gmkbData not found - script may not be enqueued correctly');
}

// Check jQuery
console.log('\n🔧 jQuery Check:');
console.log('  jQuery available:', typeof $ === 'function');
console.log('  jQuery version:', $.fn?.jquery || 'Unknown');

// Check GMKB namespace
console.log('\n🏗️ GMKB Namespace Check:');
console.log('  GMKB available:', !!window.GMKB);
if (window.GMKB) {
    console.log('  Systems:', Object.keys(window.GMKB.systems));
    console.log('  Is frozen:', Object.isFrozen(window.GMKB));
} else {
    console.warn('  ❌ GMKB namespace not found - main.js may not have loaded');
}

// Check for old systems (should be gone)
console.log('\n🗑️ Old System Check (should be empty):');
console.log('  gmkbCoreReady:', window.gmkbCoreReady || 'Not found (good)');
console.log('  gmkbInitTime:', window.gmkbInitTime || 'Not found (good)');
console.log('  GMKB_Root_Fix_Script_Manager:', typeof GMKB_Root_Fix_Script_Manager !== 'undefined' ? 'Found (bad)' : 'Not found (good)');

// Check scripts
console.log('\n📜 Script Loading Check:');
const scripts = Array.from(document.querySelectorAll('script')).filter(s => s.src && s.src.includes('main.js'));
console.log('  main.js scripts found:', scripts.length);
scripts.forEach((script, index) => {
    console.log(`  Script ${index + 1}:`, script.src);
    console.log('    ID:', script.id || 'No ID');
    console.log('    Loaded:', script.readyState || 'Unknown state');
});

// Check for script errors
console.log('\n⚠️ Error Check:');
const errors = window.gmkbErrors || [];
if (errors.length > 0) {
    console.error('  Errors found:', errors);
} else {
    console.log('  No errors recorded');
}

// Check DOM state
console.log('\n📄 DOM State Check:');
console.log('  Document ready state:', document.readyState);
console.log('  Body classes:', document.body.className);
console.log('  Preview container:', !!document.getElementById('media-kit-preview') ? 'Found' : 'Not found');
console.log('  Empty state:', !!document.getElementById('empty-state') ? 'Found' : 'Not found');

// Check utility functions
console.log('\n🛠️ Utility Functions Check:');
console.log('  gmkbUtils available:', !!window.gmkbUtils);
if (window.gmkbUtils) {
    console.log('  Available methods:', Object.keys(window.gmkbUtils));
}

// Performance check
console.log('\n⚡ Performance Check:');
const performanceEntries = performance.getEntriesByType('navigation');
if (performanceEntries.length > 0) {
    const entry = performanceEntries[0];
    console.log('  DOM load time:', Math.round(entry.domContentLoadedEventEnd - entry.navigationStart), 'ms');
    console.log('  Page load time:', Math.round(entry.loadEventEnd - entry.navigationStart), 'ms');
}

// Manual test functions
console.log('\n🧪 Manual Test Functions:');
window.gmkbDiagnosticTest = {
    testScriptLoading: function() {
        console.log('Testing script loading...');
        const script = document.createElement('script');
        script.textContent = 'console.log("✅ Script execution test passed");';
        document.head.appendChild(script);
        document.head.removeChild(script);
    },
    
    testWordPressData: function() {
        console.log('Testing WordPress data...');
        if (window.gmkbData) {
            console.log('✅ WordPress data test passed:', window.gmkbData);
        } else {
            console.error('❌ WordPress data test failed');
        }
    },
    
    forceReload: function() {
        console.log('Forcing page reload...');
        location.reload(true);
    },
    
    clearCache: function() {
        console.log('Clearing cache and reloading...');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => registration.unregister());
            });
        }
        localStorage.clear();
        sessionStorage.clear();
        location.reload(true);
    }
};

console.log('\n🎯 Available diagnostic commands:');
console.log('  gmkbDiagnosticTest.testScriptLoading() - Test basic script execution');
console.log('  gmkbDiagnosticTest.testWordPressData() - Test WordPress data availability');
console.log('  gmkbDiagnosticTest.forceReload() - Force page reload');
console.log('  gmkbDiagnosticTest.clearCache() - Clear cache and reload');

console.log('\n✅ DIAGNOSTIC COMPLETE - Check results above');
