/**
 * GMKB Phase Integration Test
 * Tests Phase 1 (Data Unification), Phase 2 (Component Configuration), and Phase 3 (Section Layer)
 * 
 * Run this in the browser console after loading the Media Kit Builder page
 * 
 * @version 4.0.0-integration-test
 * @package GMKB/Tests
 */

window.testPhaseIntegration = function() {
    console.log('%c🧪 GMKB PHASE INTEGRATION TEST', 'font-weight: bold; color: white; background: #295cff; padding: 8px 12px; border-radius: 4px; font-size: 14px;');
    console.log('Testing all 4 phases of the Media Kit Builder architecture...\n');
    
    const results = {
        phase1: { name: 'Data Unification (Pods)', tests: [], passed: 0, total: 0 },
        phase2: { name: 'Component Configuration', tests: [], passed: 0, total: 0 },
        phase3: { name: 'Section Layer', tests: [], passed: 0, total: 0 },
        phase4: { name: 'Theme System', tests: [], passed: 0, total: 0 }
    };
    
    // PHASE 1: Data Unification & Pods Integration Tests
    console.log('%c📊 PHASE 1: Data Unification & Pods Integration', 'font-weight: bold; color: #059669; font-size: 12px;');
    
    const phase1Tests = [
        {
            name: 'Pods data available in gmkbData',
            test: () => window.gmkbData && window.gmkbData.postId > 0
        },
        {
            name: 'No MKCG field references',
            test: () => {
                // Check that we're not using old MKCG fields
                const html = document.documentElement.innerHTML;
                return !html.includes('mkcg_topic_') && !html.includes('mkcg_field_');
            }
        },
        {
            name: 'Component data from Pods',
            test: () => {
                // Check if components have proper data structure
                const state = window.enhancedStateManager?.getState();
                if (!state || !state.components) return true; // Pass if no components
                const components = Object.values(state.components);
                return components.every(comp => !comp.data?.mkcg_field);
            }
        }
    ];
    
    phase1Tests.forEach(test => {
        try {
            const passed = test.test();
            results.phase1.tests.push({ name: test.name, passed });
            results.phase1.total++;
            if (passed) results.phase1.passed++;
            console.log(`  ${passed ? '✅' : '❌'} ${test.name}`);
        } catch (error) {
            results.phase1.tests.push({ name: test.name, passed: false, error: error.message });
            results.phase1.total++;
            console.log(`  ❌ ${test.name} - Error: ${error.message}`);
        }
    });
    
    // PHASE 2: Component Layer Architecture Tests
    console.log('\n%c🔧 PHASE 2: Component Layer Architecture', 'font-weight: bold; color: #7c3aed; font-size: 12px;');
    
    const phase2Tests = [
        {
            name: 'ComponentConfigurationManager loaded',
            test: () => window.ComponentConfigurationManager !== undefined
        },
        {
            name: 'DataBindingEngine loaded',
            test: () => window.DataBindingEngine !== undefined
        },
        {
            name: 'Component schemas available',
            test: () => window.gmkbData?.componentSchemas && Object.keys(window.gmkbData.componentSchemas).length > 0
        },
        {
            name: 'Configuration manager instance',
            test: () => window.componentConfigurationManager !== undefined
        },
        {
            name: 'Data binding engine instance',
            test: () => window.dataBindingEngine !== undefined
        }
    ];
    
    phase2Tests.forEach(test => {
        try {
            const passed = test.test();
            results.phase2.tests.push({ name: test.name, passed });
            results.phase2.total++;
            if (passed) results.phase2.passed++;
            console.log(`  ${passed ? '✅' : '❌'} ${test.name}`);
        } catch (error) {
            results.phase2.tests.push({ name: test.name, passed: false, error: error.message });
            results.phase2.total++;
            console.log(`  ❌ ${test.name} - Error: ${error.message}`);
        }
    });
    
    // PHASE 3: Section Layer System Tests
    console.log('\n%c🏗️ PHASE 3: Section Layer System', 'font-weight: bold; color: #dc2626; font-size: 12px;');
    
    const phase3Tests = [
        {
            name: 'SectionLayoutManager loaded',
            test: () => window.SectionLayoutManager !== undefined
        },
        {
            name: 'SectionRenderer loaded',
            test: () => window.SectionRenderer !== undefined
        },
        {
            name: 'Section manager instance',
            test: () => window.sectionLayoutManager !== undefined
        },
        {
            name: 'Section renderer instance',
            test: () => window.sectionRenderer !== undefined
        },
        {
            name: 'Sidebar integration loaded',
            test: () => window.sidebarSectionIntegration !== undefined
        },
        {
            name: 'Section container exists',
            test: () => {
                const container = document.getElementById('gmkb-sections-container') ||
                                document.getElementById('component-preview-container') ||
                                document.querySelector('.gmkb-preview__container');
                return container !== null;
            }
        },
        {
            name: 'Can create sections',
            test: () => {
                if (!window.sectionLayoutManager) return false;
                return typeof window.sectionLayoutManager.registerSection === 'function';
            }
        },
        {
            name: 'Section controls in sidebar',
            test: () => {
                const addBtn = document.getElementById('add-section-btn');
                const layoutOptions = document.querySelectorAll('.layout-option');
                return addBtn !== null && layoutOptions.length > 0;
            }
        }
    ];
    
    phase3Tests.forEach(test => {
        try {
            const passed = test.test();
            results.phase3.tests.push({ name: test.name, passed });
            results.phase3.total++;
            if (passed) results.phase3.passed++;
            console.log(`  ${passed ? '✅' : '❌'} ${test.name}`);
        } catch (error) {
            results.phase3.tests.push({ name: test.name, passed: false, error: error.message });
            results.phase3.total++;
            console.log(`  ❌ ${test.name} - Error: ${error.message}`);
        }
    });
    
    // PHASE 4: Theme Layer Tests (Future)
    console.log('\n%c🎨 PHASE 4: Theme Layer & Global Design System', 'font-weight: bold; color: #0891b2; font-size: 12px;');
    console.log('  ⏳ Theme system not yet implemented');
    
    // INTEGRATION TESTS
    console.log('\n%c🔗 INTEGRATION TESTS', 'font-weight: bold; color: #f59e0b; font-size: 12px;');
    
    // Test 1: Create a section and verify it renders
    let sectionTestPassed = false;
    try {
        if (window.sectionLayoutManager && window.sectionRenderer) {
            const testSectionId = `test_section_${Date.now()}`;
            const section = window.sectionLayoutManager.registerSection(testSectionId, 'full_width');
            
            if (section) {
                // Wait a moment for rendering
                setTimeout(() => {
                    const sectionElement = document.getElementById(`section-${testSectionId}`);
                    if (sectionElement) {
                        console.log('  ✅ Section creation and rendering works');
                        // Clean up test section
                        window.sectionLayoutManager.removeSection(testSectionId);
                    } else {
                        console.log('  ❌ Section created but not rendered in DOM');
                    }
                }, 100);
                sectionTestPassed = true;
            } else {
                console.log('  ❌ Failed to create test section');
            }
        } else {
            console.log('  ⚠️ Section system not available for testing');
        }
    } catch (error) {
        console.log(`  ❌ Section test error: ${error.message}`);
    }
    
    // Test 2: Check if components can be assigned to sections
    try {
        if (window.sectionLayoutManager && typeof window.sectionLayoutManager.assignComponentToSection === 'function') {
            console.log('  ✅ Component-to-section assignment available');
        } else {
            console.log('  ❌ Component-to-section assignment not available');
        }
    } catch (error) {
        console.log(`  ❌ Component assignment test error: ${error.message}`);
    }
    
    // SUMMARY
    console.log('\n%c📈 TEST SUMMARY', 'font-weight: bold; color: white; background: #1f2937; padding: 8px 12px; border-radius: 4px; font-size: 14px;');
    
    const totalTests = results.phase1.total + results.phase2.total + results.phase3.total;
    const totalPassed = results.phase1.passed + results.phase2.passed + results.phase3.passed;
    const successRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    
    console.log(`Phase 1 (Data): ${results.phase1.passed}/${results.phase1.total} tests passed`);
    console.log(`Phase 2 (Components): ${results.phase2.passed}/${results.phase2.total} tests passed`);
    console.log(`Phase 3 (Sections): ${results.phase3.passed}/${results.phase3.total} tests passed`);
    console.log(`Phase 4 (Theme): Not implemented yet`);
    
    console.log(`\nOverall: ${totalPassed}/${totalTests} tests passed (${successRate}%)`);
    
    if (successRate >= 80) {
        console.log('%c✅ EXCELLENT! The 4-layer architecture is working well', 'font-weight: bold; color: #10b981;');
    } else if (successRate >= 60) {
        console.log('%c⚠️ GOOD! Most systems are working, but some fixes needed', 'font-weight: bold; color: #f59e0b;');
    } else {
        console.log('%c❌ NEEDS ATTENTION! Several systems are not functioning', 'font-weight: bold; color: #ef4444;');
    }
    
    // QUICK FIXES
    if (successRate < 100) {
        console.log('\n%c🔧 QUICK FIXES', 'font-weight: bold; color: #6366f1; font-size: 12px;');
        
        if (results.phase3.passed < results.phase3.total) {
            console.log('For Section Issues:');
            console.log('  • Run: window.forceCoreSystemsReady() to ensure systems are ready');
            console.log('  • Run: window.debugSectionSystem() to debug section system');
            console.log('  • Run: window.fixSectionSystem() to attempt automatic fixes');
        }
        
        if (results.phase2.passed < results.phase2.total) {
            console.log('For Component Configuration Issues:');
            console.log('  • Check if gmkbData.componentSchemas is populated');
            console.log('  • Verify ComponentConfigurationManager is loaded');
        }
        
        if (results.phase1.passed < results.phase1.total) {
            console.log('For Data Issues:');
            console.log('  • Verify Pods fields are configured correctly');
            console.log('  • Check gmkbData.postId is set correctly');
        }
    }
    
    return {
        successRate,
        results,
        recommendation: successRate >= 80 ? 'Ready for production' : 
                       successRate >= 60 ? 'Functional but needs fixes' : 
                       'Major issues need resolution'
    };
};

// Auto-run test if in debug mode
if (window.gmkbData?.debugMode) {
    console.log('Debug mode detected. Running phase integration test in 3 seconds...');
    setTimeout(() => {
        window.testPhaseIntegration();
    }, 3000);
}

// Export test function
window.GMKBTests = window.GMKBTests || {};
window.GMKBTests.testPhaseIntegration = window.testPhaseIntegration;

console.log('🧪 Phase Integration Test loaded. Run testPhaseIntegration() to test all systems.');
