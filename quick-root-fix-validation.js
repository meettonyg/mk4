/**
 * QUICK ROOT FIX VALIDATION
 * 
 * This script provides immediate validation that the WordPress-native
 * dependency management is working correctly.
 */

console.log('🧪 QUICK ROOT FIX VALIDATION: Starting immediate test...');

// Quick test function that can be run in console
window.quickRootFixValidation = function() {
    console.group('🔍 QUICK ROOT FIX VALIDATION RESULTS');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function test(name, condition) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        
        console.log(`${icon} ${name}: ${status}`);
        
        if (condition) {
            results.passed++;
        } else {
            results.failed++;
        }
        
        results.tests.push({ name, status, condition });
    }
    
    // Core WordPress architecture tests
    test('WordPress Data Available', !!window.guestifyData);
    test('AJAX URL Present', !!window.guestifyData?.ajaxUrl);
    test('Security Nonce Present', !!window.guestifyData?.nonce);
    test('WordPress Architecture Flag', window.guestifyData?.architecture === 'wordpress-native-dependencies');
    
    // Script loading order tests
    test('jQuery Available', !!window.jQuery);
    test('SortableJS Available', !!(window.Sortable || typeof Sortable !== 'undefined'));
    test('Enhanced Component Manager Available', !!window.enhancedComponentManager);
    test('State Manager Available', !!window.stateManager || !!window.enhancedStateManager);
    test('Renderer Available', !!window.renderer);
    
    // System initialization tests
    test('Main.js Systems Ready', !!window.gmkbSystemsReady);
    test('WordPress Native Flag', !!window.gmkbWordPressNative);
    
    // Component functionality tests
    test('Add Test Component Function', typeof window.addTestComponent === 'function');
    test('Save State Function', typeof window.saveState === 'function');
    test('System Status Function', typeof window.getSystemStatus === 'function');
    
    // DOM tests
    test('Media Kit Preview Element', !!document.getElementById('media-kit-preview'));
    
    // Summary
    console.log('\n📊 QUICK VALIDATION SUMMARY:');
    console.log(`  ✅ Passed: ${results.passed}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    console.log(`  📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 ROOT FIX VALIDATION: SUCCESS!');
        console.log('✅ WordPress-native dependency management is working perfectly!');
        console.log('✅ All systems initialized correctly');
        console.log('✅ Ready for testing component functionality');
        
        console.log('\n💡 Next steps:');
        console.log('  1. Try: addTestComponent() - Add a test component');
        console.log('  2. Try: saveState() - Save current state');
        console.log('  3. Try: validateRootFix() - Run full validation (if available)');
    } else {
        console.log('\n⚠️ Some tests failed, but core functionality may still work');
        
        const criticalFailures = results.tests.filter(t => 
            !t.condition && (
                t.name.includes('WordPress Data') || 
                t.name.includes('AJAX URL') || 
                t.name.includes('Architecture Flag')
            )
        );
        
        if (criticalFailures.length > 0) {
            console.log('❌ Critical issues detected - check enqueue.php');
        }
    }
    
    console.groupEnd();
    return results;
};

// Auto-run after a delay
setTimeout(() => {
    console.log('🚀 Running automatic quick validation...');
    window.quickRootFixValidation();
}, 2000);

console.log('✅ Quick ROOT FIX validation script loaded');
console.log('📝 Run quickRootFixValidation() for immediate test results');
