/**
 * Quick Phase 1 diagnostic test - run directly in browser console
 * Copy and paste this entire function into the console, then call it
 */
window.quickPhase1Test = function() {
    console.log('🧪 Quick Phase 1 Race Condition Test');
    console.log('='.repeat(50));
    
    const results = [];
    let passes = 0;
    let fails = 0;
    
    // Test 1: Double initialization check
    console.log('\n1. 🔍 Double Initialization Check');
    if (typeof initializationStarted !== 'undefined') {
        console.log('  ✅ Double init prevention: FIXED');
        results.push('✅ Double initialization prevention');
        passes++;
    } else {
        console.log('  ❌ Double init prevention: NOT IMPLEMENTED');
        results.push('❌ Double initialization prevention');
        fails++;
    }
    
    // Test 2: PHP Data availability
    console.log('\n2. 🔍 PHP Data Availability');
    if (window.guestifyData?.pluginUrl) {
        console.log('  ✅ guestifyData: AVAILABLE');
        results.push('✅ PHP data localization');
        passes++;
    } else {
        console.log('  ❌ guestifyData: MISSING');
        results.push('❌ PHP data localization');
        fails++;
    }
    
    if (window.guestifyDataBackup?.pluginUrl) {
        console.log('  ✅ Backup data: AVAILABLE');
        results.push('✅ Backup data system');
        passes++;
    } else {
        console.log('  ❌ Backup data: MISSING');
        results.push('❌ Backup data system');
        fails++;
    }
    
    // Test 3: System globals
    console.log('\n3. 🔍 System Globals');
    const requiredGlobals = ['stateManager', 'componentManager', 'renderer', 'initializer'];
    let globalsMissing = [];
    
    requiredGlobals.forEach(global => {
        if (window[global]) {
            console.log(`  ✅ window.${global}: AVAILABLE`);
        } else {
            console.log(`  ❌ window.${global}: MISSING`);
            globalsMissing.push(global);
        }
    });
    
    if (globalsMissing.length === 0) {
        results.push('✅ All system globals available');
        passes++;
    } else {
        results.push(`❌ Missing globals: ${globalsMissing.join(', ')}`);
        fails++;
    }
    
    // Test 4: Initialization manager
    console.log('\n4. 🔍 Initialization Manager');
    if (window.initManager) {
        const status = window.initManager.getStatus();
        console.log(`  ✅ Init manager: AVAILABLE (state: ${status.state})`);
        console.log(`  ✅ Duration: ${status.duration}ms`);
        console.log(`  ✅ Steps completed: ${status.steps.length}`);
        results.push('✅ Initialization manager working');
        passes++;
    } else {
        console.log('  ❌ Init manager: NOT AVAILABLE');
        results.push('❌ Initialization manager missing');
        fails++;
    }
    
    // Test 5: Performance monitoring
    console.log('\n5. 🔍 Performance Monitoring');
    if (window.mkPerf) {
        console.log('  ✅ Performance monitor: AVAILABLE');
        results.push('✅ Performance monitoring active');
        passes++;
    } else {
        console.log('  ❌ Performance monitor: MISSING');
        results.push('❌ Performance monitoring missing');
        fails++;
    }
    
    // Test 6: System info
    console.log('\n6. 🔍 System Information');
    if (window.getSystemInfo) {
        const sysInfo = window.getSystemInfo();
        console.log('  ✅ System info: AVAILABLE');
        console.log('  📊 System types:', sysInfo.types);
        results.push('✅ System information available');
        passes++;
    } else {
        console.log('  ❌ System info: MISSING');
        results.push('❌ System information missing');
        fails++;
    }
    
    // Summary
    const total = passes + fails;
    const successRate = ((passes / total) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 QUICK TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passes}`);
    console.log(`❌ Failed: ${fails}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (fails === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Phase 1 fixes are working!');
    } else {
        console.log(`\n⚠️ ${fails} issue(s) detected. See details above.`);
    }
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result}`);
    });
    
    return {
        passed: passes,
        failed: fails,
        total: total,
        successRate: successRate + '%',
        results: results
    };
};

// Auto-run the test
console.log('🔧 Loading quick Phase 1 test...');
console.log('💡 Run: window.quickPhase1Test()');
