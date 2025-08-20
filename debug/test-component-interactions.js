/**
 * Component Interaction Testing Script
 * 
 * This script helps diagnose component interaction issues by testing
 * various aspects of the component system.
 */

(function() {
    'use strict';

    window.testComponentInteractions = function() {
        console.log('🧪 Testing Component Interactions...');
        
        // Test 1: Check basic system availability
        console.log('\n📋 Test 1: System Availability');
        const systemCheck = {
            enhancedComponentManager: !!window.enhancedComponentManager,
            setupComponentInteractions: !!window.setupComponentInteractions,
            debugComponentInteractions: !!window.debugComponentInteractions,
            GMKB_Modals: !!window.GMKB_Modals,
            componentLibrarySystem: !!window.componentLibrarySystem
        };
        console.table(systemCheck);
        
        // Test 2: Check component items in DOM
        console.log('\n📋 Test 2: Component Items in DOM');
        const componentItems = document.querySelectorAll('.component-item');
        console.log(`Found ${componentItems.length} component items`);
        
        if (componentItems.length > 0) {
            console.log('Sample component items:');
            Array.from(componentItems).slice(0, 5).forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.dataset.component || 'NO_DATA_COMPONENT'} (${item.className})`);
            });
        }
        
        // Test 3: Check component manager readiness
        console.log('\n📋 Test 3: Component Manager Status');
        if (window.enhancedComponentManager) {
            try {
                const isReady = window.enhancedComponentManager.isReady();
                const hasWordPressData = !!window.gmkbData || !!window.guestifyData;
                
                console.log('Component Manager Status:', {
                    isReady: isReady,
                    hasWordPressData: hasWordPressData,
                    wpDataKeys: hasWordPressData ? Object.keys(window.gmkbData || window.guestifyData) : 'None'
                });
                
                if (!isReady) {
                    console.log('⚠️ Component manager not ready, attempting initialization...');
                    window.enhancedComponentManager.initialize();
                    console.log('✅ Component manager initialized');
                }
            } catch (error) {
                console.error('❌ Error checking component manager:', error);
            }
        } else {
            console.error('❌ Enhanced component manager not found');
        }
        
        // Test 4: Test direct component addition
        console.log('\n📋 Test 4: Direct Component Addition Test');
        if (window.enhancedComponentManager && window.enhancedComponentManager.isReady()) {
            console.log('🧪 Attempting to add a test hero component...');
            
            window.enhancedComponentManager.addComponent('hero', {
                title: 'Test Hero Component',
                subtitle: 'Added via diagnostic test'
            }).then((componentId) => {
                console.log('✅ Test component added successfully:', componentId);
                
                // Clean up after 3 seconds
                setTimeout(() => {
                    if (window.enhancedComponentManager.getComponent(componentId)) {
                        window.enhancedComponentManager.removeComponent(componentId);
                        console.log('🧹 Test component cleaned up');
                    }
                }, 3000);
                
            }).catch((error) => {
                console.error('❌ Failed to add test component:', error);
            });
        } else {
            console.warn('⚠️ Cannot test component addition - manager not ready');
        }
        
        // Test 5: Test click simulation
        console.log('\n📋 Test 5: Click Simulation Test');
        if (componentItems.length > 0) {
            const firstItem = componentItems[0];
            const componentType = firstItem.dataset.component;
            
            if (componentType) {
                console.log(`🧪 Simulating click on first component: ${componentType}`);
                
                // Create a synthetic click event
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                
                console.log('Before click dispatch...');
                firstItem.dispatchEvent(clickEvent);
                console.log('After click dispatch - check above for interaction logs');
            } else {
                console.warn('⚠️ First component item has no data-component attribute');
            }
        }
        
        console.log('\n🎯 Test Complete! Check the logs above for any issues.');
        
        return {
            systemAvailable: Object.values(systemCheck).every(v => v),
            componentItemsFound: componentItems.length,
            componentManagerReady: window.enhancedComponentManager ? window.enhancedComponentManager.isReady() : false
        };
    };
    
    // ROOT FIX: Auto-run disabled to prevent test components from being added automatically
    // if (window.gmkbData?.debugMode) {
    //     // Run test after a short delay to ensure everything is loaded
    //     setTimeout(() => {
    //         console.log('🔧 Debug mode detected - running component interaction test...');
    //         window.testComponentInteractions();
    //     }, 2000);
    // }
    
    console.log('🧪 Component interaction testing script loaded. Run testComponentInteractions() to test.');
    
})();
