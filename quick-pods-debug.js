// ⚡ QUICK PODS DEBUG - Paste this entire block into browser console
// This will show you immediately what's wrong with Pods data

console.clear();
console.log('%c🔍 QUICK PODS DEBUG', 'background: #2563eb; color: white; padding: 10px; font-size: 16px; font-weight: bold');
console.log('');

// 1. Check gmkbData
if (!window.gmkbData) {
    console.log('%c❌ CRITICAL: window.gmkbData does NOT exist', 'color: #dc2626; font-weight: bold; font-size: 14px');
    console.log('%c💡 FIX: Check WordPress debug.log - PHP enqueue may have failed', 'color: #f59e0b');
    console.log('   Look for errors in gmkb_prepare_data_for_injection()');
} else {
    console.log('%c✅ gmkbData exists', 'color: #16a34a; font-weight: bold');
    
    // 2. Check pods_data
    if (!window.gmkbData.pods_data) {
        console.log('%c❌ CRITICAL: gmkbData.pods_data is MISSING', 'color: #dc2626; font-weight: bold; font-size: 14px');
        console.log('%c💡 FIX: Check gmkb_get_pods_data() in includes/enqueue.php', 'color: #f59e0b');
        console.log('   Post ID:', window.gmkbData.postId);
    } else if (Object.keys(window.gmkbData.pods_data).length === 0) {
        console.log('%c⚠️  WARNING: gmkbData.pods_data is EMPTY', 'color: #f59e0b; font-weight: bold; font-size: 14px');
        console.log('%c💡 POSSIBLE CAUSES:', 'color: #f59e0b');
        console.log('   1. No guest selected (check post ID:', window.gmkbData.postId + ')');
        console.log('   2. Pods plugin not active');
        console.log('   3. Guest has no data in Pods fields');
        console.log('   4. Wrong post type (should be mkcg or guests)');
        console.log('');
        console.log('%c🔧 QUICK TEST: Check if Pods is working', 'color: #3b82f6; font-weight: bold');
        console.log('   Go to WordPress > Posts/Guests');
        console.log('   Edit post ID ' + window.gmkbData.postId);
        console.log('   Check if Pods fields have data');
    } else {
        console.log('%c✅ gmkbData.pods_data exists with ' + Object.keys(window.gmkbData.pods_data).length + ' fields', 'color: #16a34a; font-weight: bold');
        console.log('');
        console.log('%c📋 FIELDS WITH DATA:', 'color: #3b82f6; font-weight: bold');
        
        let fieldsWithData = 0;
        let fieldsEmpty = 0;
        
        Object.entries(window.gmkbData.pods_data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                console.log('%c  ✅ ' + key + ':', 'color: #16a34a', value);
                fieldsWithData++;
            } else {
                fieldsEmpty++;
            }
        });
        
        console.log('');
        console.log('%c📊 SUMMARY:', 'color: #3b82f6; font-weight: bold');
        console.log('   Fields with data:', fieldsWithData);
        console.log('   Empty fields:', fieldsEmpty);
        
        if (fieldsWithData === 0) {
            console.log('');
            console.log('%c⚠️  ALL FIELDS ARE EMPTY', 'color: #f59e0b; font-weight: bold; font-size: 14px');
            console.log('%c💡 This means data was fetched but guest has no Pods data', 'color: #f59e0b');
            console.log('   Check WordPress post ID ' + window.gmkbData.postId);
        } else {
            console.log('');
            console.log('%c✅ DATA LOOKS GOOD!', 'color: #16a34a; font-weight: bold; font-size: 14px');
            console.log('');
            console.log('%cIf components still not showing data, check:', 'color: #3b82f6; font-weight: bold');
            console.log('1. Component is using usePodsData() composable');
            console.log('2. Template binds to correct field names');
            console.log('3. Vue DevTools shows component receiving data');
            console.log('');
            console.log('%c🔧 NEXT STEP: Check Pinia store', 'color: #3b82f6; font-weight: bold');
            console.log('Run this command:');
            console.log('%cwindow.__PINIA__?.state?.value?.main?.podsData', 'background: #1e293b; color: #10b981; padding: 5px; font-family: monospace');
        }
    }
}

// 3. Quick Pinia check
if (window.__PINIA__) {
    console.log('');
    console.log('%c🔍 PINIA STORE CHECK:', 'color: #3b82f6; font-weight: bold');
    
    const stores = window.__PINIA__.state.value;
    const storeNames = Object.keys(stores);
    
    console.log('   Available stores:', storeNames);
    
    if (stores.main) {
        if (stores.main.podsData) {
            const storeFieldCount = Object.keys(stores.main.podsData).length;
            console.log('%c   ✅ Main store has podsData (' + storeFieldCount + ' fields)', 'color: #16a34a');
            
            // Check if it matches gmkbData
            const gmkbFieldCount = Object.keys(window.gmkbData?.pods_data || {}).length;
            if (storeFieldCount !== gmkbFieldCount) {
                console.log('%c   ⚠️  Field count mismatch!', 'color: #f59e0b');
                console.log('      gmkbData:', gmkbFieldCount, 'fields');
                console.log('      Store:', storeFieldCount, 'fields');
            }
        } else {
            console.log('%c   ❌ Main store MISSING podsData', 'color: #dc2626');
            console.log('%c   💡 Store should initialize with gmkbData.pods_data', 'color: #f59e0b');
        }
    } else {
        console.log('%c   ⚠️  Main store not found', 'color: #f59e0b');
        console.log('      Available stores:', storeNames);
    }
} else {
    console.log('');
    console.log('%c❌ Pinia store not initialized yet', 'color: #f59e0b');
    console.log('   Vue app may still be loading. Wait a moment and try again.');
}

// 4. Component check
console.log('');
console.log('%c🎨 COMPONENT CHECK:', 'color: #3b82f6; font-weight: bold');

const components = document.querySelectorAll('[data-component-type]');
if (components.length === 0) {
    console.log('%c   ⚠️  No components found in DOM', 'color: #f59e0b');
    console.log('      Components may not be added to canvas yet');
} else {
    console.log('   Found ' + components.length + ' components');
    console.log('   Types:', Array.from(components).map(c => c.getAttribute('data-component-type')).slice(0, 5).join(', '));
}

// 5. Quick action summary
console.log('');
console.log('%c' + '═'.repeat(60), 'color: #2563eb');
console.log('%c🎯 WHAT TO DO NEXT:', 'color: #2563eb; font-weight: bold; font-size: 14px');
console.log('%c' + '═'.repeat(60), 'color: #2563eb');

if (!window.gmkbData) {
    console.log('%c1. Check WordPress debug.log immediately', 'color: #dc2626; font-weight: bold');
    console.log('2. Look for PHP errors in gmkb_prepare_data_for_injection()');
} else if (!window.gmkbData.pods_data || Object.keys(window.gmkbData.pods_data).length === 0) {
    console.log('%c1. Verify post ID ' + window.gmkbData.postId + ' has Pods data', 'color: #f59e0b; font-weight: bold');
    console.log('2. Check Pods plugin is active');
    console.log('3. Verify correct post type (mkcg or guests)');
} else if (Object.values(window.gmkbData.pods_data).filter(v => v).length === 0) {
    console.log('%c1. Edit post ' + window.gmkbData.postId + ' in WordPress', 'color: #f59e0b; font-weight: bold');
    console.log('2. Fill in Pods fields (first_name, last_name, biography, etc.)');
    console.log('3. Refresh page and try again');
} else {
    console.log('%c✅ Data exists! Now check component code:', 'color: #16a34a; font-weight: bold');
    console.log('');
    console.log('1. Open Vue DevTools (install if needed)');
    console.log('2. Find a component (e.g., BiographyRenderer)');
    console.log('3. Check if it has podsData prop/data');
    console.log('4. Verify component uses usePodsData() composable');
    console.log('5. Check template binds to correct field names');
}

console.log('');
console.log('%c📖 For detailed debugging, see:', 'color: #3b82f6; font-weight: bold');
console.log('   - console-pods-debug.js (full diagnostic)');
console.log('   - DEBUG-PODS-CONSOLE.md (complete guide)');

console.log('');
console.log('%c✨ Debug Complete', 'color: #2563eb; font-weight: bold');
console.log('');

// Return useful data for further inspection
({ 
    gmkbData: window.gmkbData,
    podsData: window.gmkbData?.pods_data,
    fieldCount: Object.keys(window.gmkbData?.pods_data || {}).length,
    fieldsWithData: Object.values(window.gmkbData?.pods_data || {}).filter(v => v).length,
    piniaStores: Object.keys(window.__PINIA__?.state?.value || {}),
    componentCount: document.querySelectorAll('[data-component-type]').length
});
