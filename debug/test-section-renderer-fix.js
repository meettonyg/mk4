/**
 * Test Section Renderer Fix
 * Verifies that SectionRenderer is properly initialized and available
 * 
 * @package GMKB/Debug
 */

(function() {
    console.log('🔍 Testing Section Renderer Fix...');
    
    // Test 1: Check if SectionRenderer class exists
    if (window.SectionRenderer) {
        console.log('✅ TEST 1 PASSED: SectionRenderer class is available');
    } else {
        console.error('❌ TEST 1 FAILED: SectionRenderer class not found');
    }
    
    // Test 2: Check if instance exists
    if (window.sectionRenderer) {
        console.log('✅ TEST 2 PASSED: sectionRenderer instance exists');
    } else {
        console.error('❌ TEST 2 FAILED: sectionRenderer instance not found');
    }
    
    // Test 3: Check if factory function exists
    if (window.getSectionRenderer) {
        console.log('✅ TEST 3 PASSED: getSectionRenderer factory function exists');
        
        // Test 3a: Try using the factory
        const renderer = window.getSectionRenderer();
        if (renderer === window.sectionRenderer) {
            console.log('✅ TEST 3a PASSED: Factory returns correct instance');
        } else {
            console.error('❌ TEST 3a FAILED: Factory returned different instance');
        }
    } else {
        console.error('❌ TEST 3 FAILED: getSectionRenderer factory not found');
    }
    
    // Test 4: Check if SidebarSectionIntegration exists
    if (window.sidebarSectionIntegration) {
        console.log('✅ TEST 4 PASSED: sidebarSectionIntegration exists');
    } else {
        console.error('❌ TEST 4 FAILED: sidebarSectionIntegration not found');
    }
    
    // Test 5: Try to programmatically add a section
    window.testAddSection = function() {
        console.log('🧪 TEST 5: Attempting to add a section programmatically...');
        
        if (!window.sectionLayoutManager) {
            console.error('❌ TEST 5 FAILED: SectionLayoutManager not available');
            return false;
        }
        
        const testSectionId = `test_section_${Date.now()}`;
        const section = window.sectionLayoutManager.registerSection(testSectionId, 'full_width');
        
        if (section) {
            console.log(`✅ TEST 5a PASSED: Section created with ID ${testSectionId}`);
            
            // Dispatch event for renderer
            const event = new CustomEvent('gmkb:section-registered', {
                detail: {
                    sectionId: testSectionId,
                    section: section,
                    sectionLayoutManager: window.sectionLayoutManager
                }
            });
            document.dispatchEvent(event);
            
            // Check if it rendered
            setTimeout(() => {
                const sectionElement = document.getElementById(`section-${testSectionId}`);
                if (sectionElement) {
                    console.log('✅ TEST 5b PASSED: Section rendered in DOM');
                    
                    // Highlight it
                    sectionElement.style.border = '3px solid #4CAF50';
                    sectionElement.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                    
                    setTimeout(() => {
                        sectionElement.style.border = '';
                        sectionElement.style.backgroundColor = '';
                    }, 3000);
                    
                    return true;
                } else {
                    console.error('❌ TEST 5b FAILED: Section not found in DOM');
                    return false;
                }
            }, 500);
        } else {
            console.error('❌ TEST 5a FAILED: Failed to create section');
            return false;
        }
    };
    
    // Test 6: Check containers
    window.testCheckContainers = function() {
        console.log('🧪 TEST 6: Checking section containers...');
        
        const containers = {
            'saved-components-container': document.getElementById('saved-components-container'),
            'gmkb-sections-container': document.getElementById('gmkb-sections-container'),
            'media-kit-preview': document.getElementById('media-kit-preview')
        };
        
        let allGood = true;
        for (const [id, element] of Object.entries(containers)) {
            if (element) {
                const isVisible = element.style.display !== 'none';
                console.log(`${isVisible ? '✅' : '⚠️'} Container ${id}: ${isVisible ? 'visible' : 'hidden'}`);
                if (!isVisible) allGood = false;
            } else {
                console.error(`❌ Container ${id}: not found`);
                allGood = false;
            }
        }
        
        return allGood;
    };
    
    // Test 7: Full integration test
    window.runSectionIntegrationTest = function() {
        console.log('🚀 Running Full Section Integration Test...');
        console.log('=====================================');
        
        // Run all tests
        const results = [];
        
        // Basic checks
        results.push(['SectionRenderer class', !!window.SectionRenderer]);
        results.push(['sectionRenderer instance', !!window.sectionRenderer]);
        results.push(['Factory function', !!window.getSectionRenderer]);
        results.push(['SidebarSectionIntegration', !!window.sidebarSectionIntegration]);
        results.push(['SectionLayoutManager', !!window.sectionLayoutManager]);
        
        // Container checks
        const containersOk = window.testCheckContainers();
        results.push(['Containers ready', containersOk]);
        
        // Try adding a section
        if (window.testAddSection) {
            window.testAddSection();
            results.push(['Section creation', 'Check console output']);
        }
        
        // Print summary
        console.log('\n📊 Test Summary:');
        console.log('================');
        results.forEach(([test, result]) => {
            const icon = result === true ? '✅' : result === false ? '❌' : '⏳';
            console.log(`${icon} ${test}: ${result}`);
        });
        
        const passed = results.filter(r => r[1] === true).length;
        const total = results.filter(r => typeof r[1] === 'boolean').length;
        
        console.log(`\n🎯 Score: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All tests passed! Section system is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Check the output above for details.');
        }
    };
    
    // Auto-run basic tests
    console.log('\n📋 Basic Test Results:');
    console.log('======================');
    
    // Provide instructions
    console.log('\n💡 Available Test Commands:');
    console.log('  - testAddSection() : Programmatically add a test section');
    console.log('  - testCheckContainers() : Check container visibility');
    console.log('  - runSectionIntegrationTest() : Run full integration test');
    
})();
