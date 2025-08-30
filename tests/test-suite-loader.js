/**
 * GMKB Complete Test Suite Loader
 * Loads all test scripts and provides a simple interface
 * 
 * USAGE: Copy and paste this entire script into browser console
 */

console.log('🧪 GMKB Complete Test Suite Loader v1.0.0');
console.log('═══════════════════════════════════════════════════════════');

// Load individual test scripts (simplified inline versions)
(function loadAllTests() {
    'use strict';
    
    // Minimal test for demonstration - load the actual files for full functionality
    if (!window.GMKBTest) {
        console.warn('⚠️ Main test harness not loaded. Please load console-test-suite.js first.');
        console.log('📁 Required files:');
        console.log('  1. console-test-suite.js (main harness)');
        console.log('  2. test-matrix.js (test reference)');
        console.log('  3. test-runlists.js (predefined combinations)');  
        console.log('  4. test-cleanup.js (cleanup utilities)');
        console.log('  5. Individual test files in tests/ folder');
        console.log('');
        console.log('🚀 Quick start:');
        console.log('  1. Load console-test-suite.js');
        console.log('  2. Load other scripts as needed');
        console.log('  3. Run: await GMKBTest.run("smoke")');
        return;
    }
    
    // Add minimal tests if main harness is loaded
    
    // Test A1 - Component Discovery (simplified)
    if (!GMKBTest.tests.A1) {
        GMKBTest.tests.A1 = async function() {
            console.log('🔍 A1: Component Discovery (minimal version)');
            try {
                GMKBTest.assert(window.gmkbData, 'WordPress data should be available');
                GMKBTest.assert(window.gmkbData.components, 'Components should be defined');
                GMKBTest.assert(window.gmkbData.components.length > 0, 'Should have components');
                return { ok: true, details: { componentsFound: window.gmkbData.components.length }};
            } catch (error) {
                return { ok: false, error: error.message };
            }
        };
    }
    
    // Test D1 - WordPress Integration (simplified)
    if (!GMKBTest.tests.D1) {
        GMKBTest.tests.D1 = async function() {
            console.log('🔌 D1: WordPress Integration (minimal version)');
            try {
                GMKBTest.assert(window.gmkbData, 'WordPress data should be available');
                GMKBTest.assert(window.gmkbData.ajaxUrl, 'AJAX URL should be defined');
                GMKBTest.assert(window.gmkbData.nonce, 'Nonce should be defined');
                return { ok: true, details: { ajaxUrl: !!window.gmkbData.ajaxUrl, nonce: !!window.gmkbData.nonce }};
            } catch (error) {
                return { ok: false, error: error.message };
            }
        };
    }
    
    // Add minimal runlists if not loaded
    if (!GMKBTest.runlists) {
        GMKBTest.runlists = {
            minimal: {
                name: 'Minimal Test',
                description: 'Basic functionality check',
                tests: ['A1', 'D1'],
                timeout: 10000,
                config: { cleanup: true, verbose: true, failFast: false }
            }
        };
        
        console.log('📋 Added minimal runlist: GMKBTest.run("minimal")');
    }
    
    // Add basic cleanup if not loaded
    if (!GMKBTest.cleanup.enhanced) {
        GMKBTest.basicCleanup = function() {
            console.log('🧹 Running basic cleanup...');
            
            // Remove test components
            const testComponents = document.querySelectorAll('[data-component-id^="test-"]');
            testComponents.forEach(el => el.remove());
            
            // Close modals
            const modals = document.querySelectorAll('.modal.show, .modal[style*="block"]');
            modals.forEach(modal => {
                modal.style.display = 'none';
                modal.classList.remove('show');
            });
            
            console.log(`✅ Basic cleanup complete: ${testComponents.length} components, ${modals.length} modals`);
            return { components: testComponents.length, modals: modals.length };
        };
    }
    
    console.log('✅ Test suite components loaded');
})();

// Display usage information
console.log('');
console.log('🚀 Quick Commands:');
console.log('  GMKBTest.run("smoke")     - Run smoke tests');
console.log('  GMKBTest.run("minimal")   - Run minimal tests');
console.log('  GMKBTest.tests.A1()       - Run component discovery test');
console.log('  GMKBTest.tests.D1()       - Run WordPress integration test');
console.log('  GMKBTest.cleanup()        - Clean up test artifacts');
console.log('');
console.log('📊 Status Check:');
console.log('  Window gmkbData:', !!window.gmkbData);
console.log('  State Manager:', !!window.enhancedStateManager);
console.log('  Component Manager:', !!window.enhancedComponentManager);
console.log('  GMKB Global:', !!window.GMKB);
console.log('');
console.log('📁 For full test suite, load these files:');
console.log('  • console-test-suite.js (main harness)');
console.log('  • test-matrix.js (reference table)');
console.log('  • test-runlists.js (predefined tests)');
console.log('  • test-cleanup.js (cleanup utilities)');
console.log('  • tests/*.js (individual test files)');
console.log('');

// Auto-run diagnostic if safe
if (window.GMKBTest && window.gmkbData) {
    console.log('🔬 Running auto-diagnostic...');
    
    setTimeout(async () => {
        try {
            if (GMKBTest.tests.A1 && GMKBTest.tests.D1) {
                console.log('🧪 Auto-running minimal diagnostic tests...');
                const a1Result = await GMKBTest.tests.A1();
                const d1Result = await GMKBTest.tests.D1();
                
                console.log('📊 Diagnostic Results:');
                console.log('  A1 (Component Discovery):', a1Result.ok ? '✅ PASS' : '❌ FAIL');
                console.log('  D1 (WordPress Integration):', d1Result.ok ? '✅ PASS' : '❌ FAIL');
                
                if (a1Result.ok && d1Result.ok) {
                    console.log('');
                    console.log('🎉 Basic systems appear to be working!');
                    console.log('💡 Try: await GMKBTest.run("smoke") for comprehensive tests');
                } else {
                    console.log('');
                    console.log('⚠️ Some systems may have issues. Check the results above.');
                }
            }
        } catch (error) {
            console.log('⚠️ Auto-diagnostic failed:', error.message);
        }
    }, 1000);
} else {
    console.log('⚠️ GMKBTest harness or gmkbData not available');
    console.log('   Make sure you are on the Media Kit Builder page');
    console.log('   and the page has fully loaded.');
}

console.log('');
console.log('Ready for testing! 🚀');
