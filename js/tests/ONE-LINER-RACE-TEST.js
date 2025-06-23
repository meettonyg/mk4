/**
 * ONE-LINER RACE TEST - CORRECTED PLUGIN PATHS
 * Copy this entire line to browser console for instant testing:
 */

(async()=>{try{const pluginUrl=window.guestifyData?.pluginUrl||window.guestifyDataBackup?.pluginUrl;if(!pluginUrl){throw new Error('Plugin URL not found');}const m=await import(`${pluginUrl}js/tests/enhanced-race-condition-tests-2025.js`);const r=await m.enhancedRaceConditionTester.runEnhancedTestSuite();const t=r.passed+r.failed;const s=(r.passed/t*100).toFixed(1);console.log(`%c🎯 RACE TEST RESULT: ${r.passed}/${t} passed (${s}%) ${r.failed===0?'🎉 ALL PASSED!':'⚠️ Issues found'}`,r.failed===0?'color:#4CAF50;font-weight:bold':'color:#FF9800;font-weight:bold');window.lastRaceTest=r;return r;}catch(e){console.error('❌ Test failed:',e);return null;})();

/**
 * DEBUGGING STEPS:
 */

// Step 1: Check plugin URL
// console.log('Plugin URL:', window.guestifyData?.pluginUrl || window.guestifyDataBackup?.pluginUrl);

// Step 2: Check if file exists
// const pluginUrl = window.guestifyData?.pluginUrl; const testUrl = `${pluginUrl}js/tests/enhanced-race-condition-tests-2025.js`; fetch(testUrl).then(r=>console.log('File exists:', r.ok)).catch(e=>console.log('File missing:', e));

// Step 3: Manual import
// const pluginUrl = window.guestifyData?.pluginUrl; const module = await import(`${pluginUrl}js/tests/enhanced-race-condition-tests-2025.js`); const results = await module.enhancedRaceConditionTester.runEnhancedTestSuite();

/**
 * ALTERNATIVE APPROACHES IF IMPORT FAILS:
 */

// Legacy test (if already loaded):
// window.raceTest ? window.raceTest.runAllTests() : console.log('❌ Legacy race tester not loaded');

// Quick system check:
// console.log('🔍 Systems:', {stateManager:!!window.stateManager,componentManager:!!window.componentManager,renderer:!!window.renderer,initializer:!!window.initializer,enhancedComponentManager:!!window.enhancedComponentManager});

// Check if files exist:
// const pluginUrl = window.guestifyData?.pluginUrl; Promise.all([`${pluginUrl}js/tests/enhanced-race-condition-tests-2025.js`,`${pluginUrl}js/tests/test-race-conditions.js`].map(url=>fetch(url).then(r=>({url,exists:r.ok})))).then(results=>console.table(results));

/**
 * SIMPLE FALLBACK TEST (NO IMPORTS NEEDED):
 */

// If all else fails, paste this block:
/*
(function() {
    console.log('%c🧪 SIMPLE RACE TEST', 'font-size: 16px; font-weight: bold; color: #2196F3');
    const results = { passed: 0, failed: 0 };
    
    function test(name, condition) {
        if (condition) {
            results.passed++;
            console.log(`%c✅ ${name}`, 'color: #4CAF50');
        } else {
            results.failed++;
            console.log(`%c❌ ${name}`, 'color: #F44336');
        }
    }
    
    test('PHP Localization', !!window.guestifyData?.pluginUrl);
    test('Module Loading', !!window.stateManager && !!window.componentManager);
    test('Enhanced System', !!window.enhancedComponentManager);
    test('DOM Elements', !!document.getElementById('add-component-btn'));
    test('Initialization', !!window.initializationManager);
    
    const total = results.passed + results.failed;
    const rate = (results.passed / total * 100).toFixed(1);
    console.log(`%c📊 RESULT: ${results.passed}/${total} passed (${rate}%)`, 'font-weight: bold');
    
    return results;
})();
*/
