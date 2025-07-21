/**
 * Test script to verify initialization timing fixes
 * 
 * Run in console: testInitializationFix()
 */

window.testInitializationFix = function() {
    console.group('🧪 Testing Initialization Fix');
    
    const results = {
        scriptDefer: false,
        templateEvent: false,
        noFallbackWarning: true,
        initializationSource: null,
        timingMetrics: {}
    };
    
    // Test 1: Check if script has defer attribute
    const scriptElement = document.querySelector('script[src*="main.js"]');
    if (scriptElement) {
        results.scriptDefer = scriptElement.hasAttribute('defer');
        console.log(`✅ Script defer attribute: ${results.scriptDefer ? 'YES' : 'NO'}`);
    } else {
        console.log('❌ Main script element not found');
    }
    
    // Test 2: Check if template event was dispatched
    if (window.dispatchTemplateComplete) {
        results.templateEvent = true;
        console.log('✅ Template completion dispatcher found');
    } else {
        console.log('❌ Template completion dispatcher not found');
    }
    
    // Test 3: Check logs for fallback warning
    const logs = structuredLogger?.getLogs?.() || [];
    const fallbackWarning = logs.find(log => 
        log.message && log.message.includes('Using fallback window load trigger')
    );
    
    if (fallbackWarning) {
        results.noFallbackWarning = false;
        console.log('❌ Fallback warning found in logs');
    } else {
        console.log('✅ No fallback warning in logs');
    }
    
    // Test 4: Check initialization source
    const initLog = logs.find(log => 
        log.message && log.message.includes('Starting initialization from')
    );
    
    if (initLog) {
        const match = initLog.message.match(/Starting initialization from (\w+)/);
        if (match) {
            results.initializationSource = match[1];
            console.log(`✅ Initialization source: ${results.initializationSource}`);
        }
    }
    
    // Test 5: Performance metrics
    if (window.performance && window.performance.getEntriesByType) {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
            results.timingMetrics = {
                domContentLoaded: Math.round(navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart),
                loadComplete: Math.round(navTiming.loadEventEnd - navTiming.loadEventStart),
                totalTime: Math.round(navTiming.loadEventEnd - navTiming.fetchStart)
            };
            console.log('📊 Performance metrics:', results.timingMetrics);
        }
    }
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.table(results);
    
    const allPassed = results.scriptDefer && 
                     results.templateEvent && 
                     results.noFallbackWarning &&
                     results.initializationSource !== 'load';
                     
    if (allPassed) {
        console.log('\n🎉 All tests passed! Initialization fix is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check individual results above.');
    }
    
    console.groupEnd();
    
    return results;
};

// Quick check function
window.quickInitCheck = function() {
    const logs = structuredLogger?.getLogs?.() || [];
    const fallbackLog = logs.find(log => log.message?.includes('Using fallback window load'));
    const initLog = logs.find(log => log.message?.includes('Starting initialization from'));
    
    if (fallbackLog) {
        console.log('❌ FALLBACK WARNING DETECTED - Fix not working');
    } else if (initLog) {
        const source = initLog.message.match(/from (\w+)/)?.[1];
        console.log(`✅ Clean initialization from: ${source} (no fallback warning)`);
    } else {
        console.log('⚠️ No initialization logs found');
    }
};

console.log('🔧 Initialization fix test loaded. Run testInitializationFix() or quickInitCheck()');
