/**
 * @file quick-enhanced-race-test.js
 * @description Quick one-liner test runner for the enhanced race condition test suite
 * Usage: Copy this line into browser console for instant testing
 */

// Quick test launcher - copy this entire block to browser console
(async () => {
    console.log('%c🚀 QUICK ENHANCED RACE TEST LAUNCHER', 'font-size: 16px; font-weight: bold; color: #2196F3; background: #E3F2FD; padding: 8px;');
    
    try {
        // Import the enhanced test suite
        const module = await import(`${window.guestifyData?.pluginUrl || window.guestifyDataBackup?.pluginUrl}js/tests/enhanced-race-condition-tests-2025.js`);
        const tester = module.enhancedRaceConditionTester;
        
        console.log('✅ Enhanced test suite loaded successfully');
        
        // Run the full test suite
        console.log('⏳ Running enhanced race condition tests...');
        const results = await tester.runEnhancedTestSuite();
        
        // Quick summary
        const total = results.passed + results.failed;
        const successRate = (results.passed / total * 100).toFixed(1);
        
        console.log('%c📊 QUICK SUMMARY', 'font-weight: bold; color: #333; font-size: 14px;');
        console.log(`Tests: ${total} | Passed: ${results.passed} ✅ | Failed: ${results.failed} ❌ | Rate: ${successRate}%`);
        
        if (results.failed === 0) {
            console.log('%c🎉 ALL TESTS PASSED! System is stable.', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
        } else {
            console.log('%c⚠️ Some tests failed. Check detailed report above.', 'color: #FF9800; font-weight: bold; font-size: 14px;');
        }
        
        // Expose results globally for further inspection
        window.lastRaceTestResults = results;
        console.log('💾 Results saved to window.lastRaceTestResults for inspection');
        
        return results;
        
    } catch (error) {
        console.error('❌ Failed to run enhanced race test:', error);
        console.log('🔧 Ensure you are on the Media Kit Builder page and system is initialized');
        return null;
    }
})();

// Alternative: Direct import and run if module system available
if (window.enhancedRaceTest) {
    console.log('🔄 Using already loaded enhanced race tester...');
    window.runEnhancedRaceTests();
} else {
    console.log('⏳ Enhanced race tester not yet loaded, importing...');
}

/**
 * Console helper functions
 */
window.quickRaceTest = async () => {
    try {
            const module = await import(`${window.guestifyData?.pluginUrl || window.guestifyDataBackup?.pluginUrl}js/tests/enhanced-race-condition-tests-2025.js`);
        return await module.enhancedRaceConditionTester.runEnhancedTestSuite();
    } catch (error) {
        console.error('Quick race test failed:', error);
        return null;
    }
};

window.raceTestStatus = () => {
    if (window.lastRaceTestResults) {
        const r = window.lastRaceTestResults;
        const total = r.passed + r.failed;
        const rate = (r.passed / total * 100).toFixed(1);
        console.log(`Last Test: ${total} tests, ${r.passed} passed, ${r.failed} failed (${rate}%)`);
        return window.lastRaceTestResults;
    } else {
        console.log('No race test results available. Run quickRaceTest() first.');
        return null;
    }
};

// Instruction banner
console.log('%c🧪 ENHANCED RACE TEST COMMANDS READY', 'color: #2196F3; font-weight: bold;');
console.log('Commands available:');
console.log('  quickRaceTest()    - Run complete enhanced race test suite');
console.log('  raceTestStatus()   - Show last test results summary');
console.log('  runEnhancedRaceTests() - Run tests (if tester already loaded)');
console.log('  raceTestResults()  - Export detailed results (if tester loaded)');
