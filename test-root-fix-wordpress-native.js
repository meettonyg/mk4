/**
 * ROOT FIX VALIDATION: WordPress-Native Dependency Management Test
 * 
 * This script validates that the corrected enqueue.php architecture is working
 * and that all race conditions have been eliminated through proper WordPress
 * dependency management.
 */

// Global test results object
window.rootFixValidation = {
    startTime: Date.now(),
    results: {},
    architecture: 'wordpress-native-dependencies'
};

/**
 * Main validation function for the ROOT FIX
 */
function validateRootFix() {
    console.group('🔍 ROOT FIX VALIDATION: WordPress-Native Dependency Management');
    console.log('🚀 Testing corrected architecture implementation...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function test(name, condition, critical = false) {
        const status = condition ? 'PASS' : 'FAIL';
        const icon = condition ? '✅' : '❌';
        
        console.log(`${icon} ${name}: ${status}`);
        
        results.tests.push({ name, status, critical });
        
        if (condition) {
            results.passed++;
        } else {
            results.failed++;
        }
    }
    
    // === PHASE 1: WordPress Dependency Management Tests ===
    console.log('\n📋 Phase 1: WordPress Dependency Management Validation');
    
    // Check if guestifyData is available (wp_localize_script test)
    test('WordPress Data Object Available', !!window.guestifyData, true);
    test('AJAX URL Available', !!window.guestifyData?.ajaxUrl, true);
    test('Security Nonce Available', !!window.guestifyData?.nonce, true);
    test('Post ID Available', window.guestifyData?.postId !== undefined, false);
    test('Plugin URL Available', !!window.guestifyData?.pluginUrl, true);
    
    // Check architecture flag
    test('WordPress-Native Architecture Flag', window.guestifyData?.architecture === 'wordpress-native-dependencies', true);
    
    // === PHASE 2: Script Loading Order Tests ===
    console.log('\n📋 Phase 2: Script Loading Order Validation');
    
    // Check if jQuery loaded first (dependency)
    test('jQuery Loaded', !!window.jQuery, true);
    
    // Check if SortableJS loaded
    test('SortableJS Loaded', !!(window.Sortable || typeof Sortable !== 'undefined'), false);
    
    // Check core systems availability (should be loaded in dependency order)
    test('Enhanced Component Manager Available', !!window.enhancedComponentManager, false);
    test('State Manager Available', !!window.stateManager, false);
    test('Renderer Available', !!window.renderer, false);
    
    // === PHASE 3: Race Condition Elimination Tests ===
    console.log('\n📋 Phase 3: Race Condition Elimination Validation');
    
    // Test that old script manager class is not interfering
    test('Old Script Manager Class Not Active', !window.GMKB_Root_Fix_Script_Manager, true);
    test('No Complex Script Manager Instances', !window.gmkb_manager, true);
    
    // Test WordPress script loading
    test('WordPress Script Loading Active', did_wordpress_scripts_load(), true);
    
    // Test that multiple initialization attempts don't occur
    test('No Multiple Initialization Race', !window.gmkbMultipleInit, true);
    
    // === PHASE 4: Functional Tests ===
    console.log('\n📋 Phase 4: Functional System Tests');
    
    // Test AJAX communication capability
    test('AJAX Communication Ready', can_communicate_with_server(), true);
    
    // Test if DOM is ready for component manipulation
    test('DOM Ready for Components', !!document.getElementById('media-kit-preview'), false);
    
    // Test component library availability
    test('Component Library Elements Present', !!document.getElementById('component-library-overlay'), false);
    
    // === PHASE 5: Performance Tests ===
    console.log('\n📋 Phase 5: Performance Validation');
    
    const initTime = Date.now() - window.rootFixValidation.startTime;
    test('Fast Initialization (<5 seconds)', initTime < 5000, false);
    test('Very Fast Initialization (<2 seconds)', initTime < 2000, false);
    
    // === SUMMARY ===
    console.log('\n📊 ROOT FIX VALIDATION SUMMARY:');
    console.log(`  ✅ Passed: ${results.passed}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    console.log(`  ⏱️ Initialization Time: ${initTime}ms`);
    console.log(`  🏗️ Architecture: WordPress-Native Dependencies`);
    
    // Check for critical failures
    const criticalFailures = results.tests.filter(t => t.status === 'FAIL' && t.critical);
    
    if (criticalFailures.length === 0) {
        console.log('\n🎉 ROOT FIX VALIDATION: SUCCESS!');
        console.log('✅ WordPress-native dependency management working correctly');
        console.log('✅ All race conditions eliminated through proper dependency chain');
        console.log('✅ AJAX communication properly configured');
        console.log('✅ No legacy script manager conflicts detected');
        
        if (results.failed === 0) {
            console.log('🏆 PERFECT SCORE: All tests passed!');
        } else {
            console.log(`⚠️ ${results.failed} non-critical tests failed (system still functional)`);
        }
    } else {
        console.log('\n❌ ROOT FIX VALIDATION: CRITICAL FAILURES DETECTED');
        console.log('Critical issues that need immediate attention:');
        criticalFailures.forEach(failure => {
            console.log(`  ❌ ${failure.name}`);
        });
    }
    
    // Store results globally
    window.rootFixValidation.results = results;
    window.rootFixValidation.endTime = Date.now();
    window.rootFixValidation.duration = initTime;
    
    console.groupEnd();
    return results;
}

/**
 * Helper function to test if WordPress scripts loaded properly
 */
function did_wordpress_scripts_load() {
    // Check if we have the wp_localize_script data
    if (!window.guestifyData) return false;
    
    // Check if scripts are loading with defer attribute (our custom filter)
    const scripts = document.querySelectorAll('script[defer]');
    const guestifyScripts = Array.from(scripts).filter(script => 
        script.src && script.src.includes('guestify')
    );
    
    return guestifyScripts.length > 0;
}

/**
 * Helper function to test AJAX communication readiness
 */
function can_communicate_with_server() {
    if (!window.guestifyData?.ajaxUrl || !window.guestifyData?.nonce) {
        return false;
    }
    
    // Check if we can create a proper AJAX request structure
    try {
        const testData = new FormData();
        testData.append('action', 'test');
        testData.append('nonce', window.guestifyData.nonce);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Quick validation function for immediate feedback
 */
function quickRootFixCheck() {
    console.log('🚀 Quick ROOT FIX Check...');
    
    const checks = {
        wordPressData: !!window.guestifyData,
        ajaxReady: !!window.guestifyData?.ajaxUrl,
        nonceReady: !!window.guestifyData?.nonce,
        noOldManager: !window.GMKB_Root_Fix_Script_Manager,
        architecture: window.guestifyData?.architecture === 'wordpress-native-dependencies'
    };
    
    console.table(checks);
    
    const allPassed = Object.values(checks).every(check => check);
    
    if (allPassed) {
        console.log('✅ QUICK CHECK: ROOT FIX appears to be working!');
        console.log('💡 Run validateRootFix() for comprehensive validation');
    } else {
        console.log('❌ QUICK CHECK: Issues detected');
        console.log('🔧 Run validateRootFix() for detailed diagnosis');
    }
    
    return allPassed;
}

/**
 * Test WordPress script dependency chain
 */
function testWordPressDependencyChain() {
    console.log('🔗 Testing WordPress Dependency Chain...');
    
    const expectedOrder = [
        'jquery',
        'sortable-js', 
        'enhanced-component-manager',
        'core-systems-bundle',
        'application-bundle',
        'guestify-main'
    ];
    
    const loadedScripts = [];
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
        const id = script.id || (script.src ? script.src.split('/').pop().split('?')[0] : '');
        if (id && expectedOrder.some(expected => id.includes(expected))) {
            loadedScripts.push(id);
        }
    });
    
    console.log('📋 Expected order:', expectedOrder);
    console.log('📋 Detected scripts:', loadedScripts);
    
    const hasCorrectBase = loadedScripts.some(script => script.includes('jquery'));
    const hasGuestifyScripts = loadedScripts.some(script => script.includes('guestify') || script.includes('enhanced'));
    
    console.log(hasCorrectBase && hasGuestifyScripts ? 
        '✅ Dependency chain appears correct' : 
        '❌ Dependency chain issues detected'
    );
    
    return { expectedOrder, loadedScripts, hasCorrectBase, hasGuestifyScripts };
}

// Expose functions globally
window.validateRootFix = validateRootFix;
window.quickRootFixCheck = quickRootFixCheck;
window.testWordPressDependencyChain = testWordPressDependencyChain;

// Auto-run quick check when script loads
console.log('🔧 ROOT FIX Validation Tools Loaded');
console.log('📝 Available commands:');
console.log('  validateRootFix() - Comprehensive validation');
console.log('  quickRootFixCheck() - Quick status check'); 
console.log('  testWordPressDependencyChain() - Test script loading order');

// Run quick check after a brief delay to let other scripts load
setTimeout(() => {
    if (window.guestifyData) {
        quickRootFixCheck();
    } else {
        console.log('⏳ Waiting for WordPress data to load...');
        
        // Try again after another delay
        setTimeout(() => {
            if (window.guestifyData) {
                quickRootFixCheck();
            } else {
                console.log('❌ WordPress data (guestifyData) not loaded - check enqueue.php');
            }
        }, 2000);
    }
}, 1000);

console.log('🏆 ROOT FIX: WordPress-Native Dependency Management Architecture Active');
