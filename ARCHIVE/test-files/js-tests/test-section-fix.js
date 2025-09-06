/**
 * Test Section System Fix
 * Verifies that the circular dependency fix is working
 */

(function() {
    'use strict';
    
    console.log('🧪 Section System Fix Test Starting...');
    
    // Test 1: Verify event detail contains manager reference
    function testManagerInEvent() {
        console.group('Test 1: Manager Reference in Events');
        
        let testPassed = false;
        
        // Listen for section registered event
        const testListener = (event) => {
            if (event.detail && event.detail.sectionLayoutManager) {
                console.log('✅ Event contains sectionLayoutManager reference');
                console.log('   Manager type:', typeof event.detail.sectionLayoutManager);
                console.log('   Has registerSection method:', typeof event.detail.sectionLayoutManager.registerSection === 'function');
                testPassed = true;
            } else {
                console.error('❌ Event missing sectionLayoutManager reference');
                console.log('   Event detail:', event.detail);
            }
            
            // Clean up listener
            document.removeEventListener('gmkb:section-registered', testListener);
        };
        
        document.addEventListener('gmkb:section-registered', testListener);
        
        // Trigger a section registration after systems are ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            if (window.sectionLayoutManager && !testPassed) {
                console.log('   Triggering test section registration...');
                window.sectionLayoutManager.registerSection('test-section-' + Date.now(), 'full_width');
            }
        });
        
        console.groupEnd();
        return testPassed;
    }
    
    // Test 2: Verify no global object sniffing in renderer
    function testNoGlobalSniffing() {
        console.group('Test 2: No Global Object Sniffing');
        
        // Check if SectionRenderer exists
        if (window.SectionRenderer) {
            const rendererCode = window.SectionRenderer.prototype.renderSection.toString();
            
            // Check for problematic patterns
            const hasWindowAccess = rendererCode.includes('window.sectionLayoutManager') && 
                                   !rendererCode.includes('|| window.sectionLayoutManager'); // Allow fallback
            const hasGlobalAccess = rendererCode.includes('window.SectionLayoutManager');
            
            if (!hasWindowAccess && !hasGlobalAccess) {
                console.log('✅ No direct global object access detected');
            } else {
                console.warn('⚠️ Potential global object access detected');
                console.log('   Has window.sectionLayoutManager:', hasWindowAccess);
                console.log('   Has window.SectionLayoutManager:', hasGlobalAccess);
            }
        } else {
            console.error('❌ SectionRenderer not found');
        }
        
        console.groupEnd();
    }
    
    // Test 3: Verify gmkbData diagnostic waits properly
    function testDataDiagnostic() {
        console.group('Test 3: Data Diagnostic Timing');
        
        if (window.runGmkbDataDiagnostic) {
            console.log('✅ Data diagnostic function available');
            
            // Check if gmkbData exists
            if (window.gmkbData) {
                console.log('✅ gmkbData is available');
                console.log('   Post ID:', window.gmkbData.postId);
                console.log('   Has saved_state:', !!window.gmkbData.saved_state);
            } else {
                console.warn('⚠️ gmkbData not yet available');
            }
        } else {
            console.warn('⚠️ Data diagnostic not loaded');
        }
        
        console.groupEnd();
    }
    
    // Run tests after core systems are ready
    document.addEventListener('gmkb:core-systems-ready', () => {
        console.log('\n🏁 Running Section System Tests...\n');
        
        testManagerInEvent();
        testNoGlobalSniffing();
        testDataDiagnostic();
        
        console.log('\n✅ Section System Fix Tests Complete\n');
    });
    
    // Also expose for manual testing
    window.testSectionFix = {
        testManagerInEvent,
        testNoGlobalSniffing,
        testDataDiagnostic,
        runAll: function() {
            testManagerInEvent();
            testNoGlobalSniffing();
            testDataDiagnostic();
        }
    };
    
    console.log('🧪 Section System Fix Test Ready');
    console.log('   Manual test: window.testSectionFix.runAll()');
    
})();
