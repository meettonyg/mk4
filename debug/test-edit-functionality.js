/**
 * Test script to verify the component edit functionality
 * ROOT FIX: Test the complete flow from edit button to sidebar design panel
 */

(function() {
    'use strict';
    
    console.log('🧪 Component Edit Functionality Test');
    console.log('=' + '='.repeat(59));
    
    // Test 1: Check if all systems are available
    function testSystemAvailability() {
        console.log('\n📋 Test 1: System Availability Check');
        console.log('-'.repeat(40));
        
        const systems = {
            'ComponentControlsManager': window.componentControlsManager,
            'EnhancedComponentManager': window.enhancedComponentManager,
            'DesignPanel': window.designPanel,
            'GMKBTabs': window.GMKBTabs,
            'State Manager': window.enhancedStateManager
        };
        
        let allAvailable = true;
        Object.entries(systems).forEach(([name, system]) => {
            const available = !!system;
            console.log(`${available ? '✅' : '❌'} ${name}: ${available ? 'Available' : 'Missing'}`);
            if (!available) allAvailable = false;
        });
        
        return allAvailable;
    }
    
    // Test 2: Check if components have controls
    function testComponentControls() {
        console.log('\n📋 Test 2: Component Controls Check');
        console.log('-'.repeat(40));
        
        const components = document.querySelectorAll('[data-component-id]');
        console.log(`Found ${components.length} components`);
        
        let controlsCount = 0;
        components.forEach((component, index) => {
            const id = component.getAttribute('data-component-id');
            const controls = component.querySelector('.component-controls--dynamic');
            const hasControls = !!controls;
            
            if (hasControls) controlsCount++;
            console.log(`${index + 1}. ${id}: ${hasControls ? '✅ Has controls' : '❌ Missing controls'}`);
            
            if (hasControls) {
                const editBtn = controls.querySelector('[data-action="edit"]');
                console.log(`   Edit button: ${editBtn ? '✅ Present' : '❌ Missing'}`);
            }
        });
        
        console.log(`\nSummary: ${controlsCount}/${components.length} components have controls`);
        return controlsCount === components.length;
    }
    
    // Test 3: Test edit button functionality
    function testEditButton() {
        console.log('\n📋 Test 3: Edit Button Functionality');
        console.log('-'.repeat(40));
        
        const firstComponent = document.querySelector('[data-component-id]');
        if (!firstComponent) {
            console.log('❌ No components found to test');
            return false;
        }
        
        const componentId = firstComponent.getAttribute('data-component-id');
        console.log(`Testing edit for component: ${componentId}`);
        
        // Check if edit button exists
        const editBtn = firstComponent.querySelector('[data-action="edit"]');
        if (!editBtn) {
            console.log('❌ Edit button not found');
            return false;
        }
        
        console.log('✅ Edit button found');
        
        // Set up event listener to verify edit event is dispatched
        let editEventReceived = false;
        const editHandler = (event) => {
            console.log('✅ Edit event received:', event.detail);
            editEventReceived = true;
        };
        
        document.addEventListener('gmkb:component-edit-requested', editHandler, { once: true });
        
        // Click the edit button
        console.log('🖱️ Clicking edit button...');
        editBtn.click();
        
        // Check results after a delay
        setTimeout(() => {
            console.log(`\nEdit event dispatched: ${editEventReceived ? '✅ Yes' : '❌ No'}`);
            
            // Check if design panel loaded
            const designTab = document.querySelector('[data-tab="design"]');
            const isDesignTabActive = designTab?.classList.contains('sidebar__tab--active');
            console.log(`Design tab active: ${isDesignTabActive ? '✅ Yes' : '❌ No'}`);
            
            // Check if design panel has content
            const designPanel = document.getElementById('element-editor');
            const hasContent = designPanel && !designPanel.innerHTML.includes('No Element Selected');
            console.log(`Design panel loaded: ${hasContent ? '✅ Yes' : '❌ No'}`);
            
            document.removeEventListener('gmkb:component-edit-requested', editHandler);
        }, 500);
        
        return true;
    }
    
    // Test 4: Test sidebar visibility
    function testSidebarVisibility() {
        console.log('\n📋 Test 4: Sidebar Visibility');
        console.log('-'.repeat(40));
        
        const sidebar = document.querySelector('.sidebar, .media-kit-sidebar, #media-kit-sidebar');
        if (!sidebar) {
            console.log('❌ Sidebar element not found');
            return false;
        }
        
        console.log('✅ Sidebar element found');
        
        const computedStyle = window.getComputedStyle(sidebar);
        const isVisible = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
        
        console.log(`Display: ${computedStyle.display}`);
        console.log(`Visibility: ${computedStyle.visibility}`);
        console.log(`Width: ${computedStyle.width}`);
        console.log(`Is visible: ${isVisible ? '✅ Yes' : '❌ No'}`);
        
        return isVisible;
    }
    
    // Main test runner
    function runAllTests() {
        console.log('\n🚀 Running all tests...\n');
        
        const results = {
            systemAvailability: testSystemAvailability(),
            componentControls: testComponentControls(),
            sidebarVisibility: testSidebarVisibility()
        };
        
        // Run edit button test separately due to async nature
        setTimeout(() => {
            testEditButton();
            
            // Summary after all tests
            setTimeout(() => {
                console.log('\n' + '='.repeat(60));
                console.log('📊 TEST SUMMARY');
                console.log('='.repeat(60));
                
                Object.entries(results).forEach(([test, passed]) => {
                    console.log(`${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
                });
                
                console.log('\n💡 Recommendations:');
                if (!results.systemAvailability) {
                    console.log('- Wait for all systems to load before testing');
                    console.log('- Check console for JavaScript errors');
                }
                if (!results.componentControls) {
                    console.log('- Run window.GMKB.forceAttachControls() to attach missing controls');
                }
                if (!results.sidebarVisibility) {
                    console.log('- Check CSS for sidebar visibility issues');
                    console.log('- Ensure sidebar HTML is present in the page');
                }
                
                console.log('\n🔧 Quick fixes to try:');
                console.log('1. window.GMKB.forceAttachControls() - Attach controls to all components');
                console.log('2. window.forceComponentSync() - Sync component manager with state');
                console.log('3. window.fixControlsNow() - Comprehensive controls fix');
                console.log('4. Refresh the page and try again');
                
            }, 1000);
        }, 100);
    }
    
    // Expose test functions globally
    window.testEditFunctionality = {
        runAllTests,
        testSystemAvailability,
        testComponentControls,
        testEditButton,
        testSidebarVisibility,
        
        // Quick test function
        quickTest: function(componentId) {
            if (!componentId) {
                const firstComponent = document.querySelector('[data-component-id]');
                componentId = firstComponent?.getAttribute('data-component-id');
            }
            
            if (!componentId) {
                console.error('No component ID provided and no components found');
                return;
            }
            
            console.log(`🧪 Quick test for component: ${componentId}`);
            
            // Dispatch edit event directly
            document.dispatchEvent(new CustomEvent('gmkb:component-edit-requested', {
                detail: { componentId }
            }));
            
            console.log('✅ Edit event dispatched - check if design panel opens');
        }
    };
    
    // Auto-run tests when script loads
    console.log('✅ Edit functionality test script loaded');
    console.log('📝 Available commands:');
    console.log('- testEditFunctionality.runAllTests() - Run comprehensive tests');
    console.log('- testEditFunctionality.quickTest() - Quick test edit functionality');
    console.log('- testEditFunctionality.quickTest("component-id") - Test specific component');
    
    // Run tests automatically after a delay
    setTimeout(() => {
        console.log('\n🤖 Auto-running tests in 2 seconds...');
        setTimeout(runAllTests, 2000);
    }, 500);
    
})();
