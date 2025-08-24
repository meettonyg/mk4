/**
 * @file test-component-overwrite-fix.js
 * @description Test script to verify the component overwrite fix
 * 
 * This script tests that when dragging a new component to the preview area,
 * existing components are NOT overwritten/removed.
 */

console.log('🧪 Component Overwrite Fix Test Loaded');

/**
 * Test the component overwrite fix
 */
window.testComponentOverwriteFix = async function() {
    console.group('🧪 Testing Component Overwrite Fix');
    
    try {
        // 1. Check initial state
        console.log('📊 Initial State Check:');
        const initialComponents = document.querySelectorAll('[data-component-id]');
        console.log(`Found ${initialComponents.length} existing components`);
        
        initialComponents.forEach((comp, index) => {
            console.log(`  ${index + 1}. ${comp.id} (${comp.getAttribute('data-component-type')})`);
        });
        
        if (initialComponents.length === 0) {
            console.warn('⚠️ No existing components found. Add a component first, then run this test.');
            console.groupEnd();
            return false;
        }
        
        // 2. Test adding a new component via component manager
        console.log('\n➕ Testing Component Addition:');
        
        if (!window.enhancedComponentManager) {
            console.error('❌ Enhanced Component Manager not available');
            console.groupEnd();
            return false;
        }
        
        // Add a hero component
        const heroComponentId = await window.enhancedComponentManager.addComponent('hero', {
            title: 'Test Hero Component',
            testCreated: true
        });
        
        console.log(`✅ Added hero component: ${heroComponentId}`);
        
        // 3. Verify components after addition
        console.log('\n🔍 Verification After Addition:');
        const componentsAfterAdd = document.querySelectorAll('[data-component-id]');
        console.log(`Found ${componentsAfterAdd.length} components after addition`);
        
        const expectedCount = initialComponents.length + 1;
        if (componentsAfterAdd.length === expectedCount) {
            console.log('✅ Component count is correct - no components were overwritten');
        } else {
            console.error(`❌ Expected ${expectedCount} components, found ${componentsAfterAdd.length}`);
        }
        
        // List all components
        componentsAfterAdd.forEach((comp, index) => {
            const isNew = comp.id === heroComponentId;
            console.log(`  ${index + 1}. ${comp.id} (${comp.getAttribute('data-component-type')}) ${isNew ? '🆕' : ''}`);
        });
        
        // 4. Test that all original components still exist
        console.log('\n🔍 Original Components Integrity Check:');
        let originalComponentsStillExist = 0;
        
        initialComponents.forEach(originalComp => {
            const stillExists = document.getElementById(originalComp.id);
            if (stillExists) {
                originalComponentsStillExist++;
                console.log(`✅ ${originalComp.id} still exists`);
            } else {
                console.error(`❌ ${originalComp.id} was removed!`);
            }
        });
        
        console.log(`\n📊 Summary:`);
        console.log(`- Original components: ${initialComponents.length}`);
        console.log(`- Components still existing: ${originalComponentsStillExist}`);
        console.log(`- New components added: ${componentsAfterAdd.length - originalComponentsStillExist}`);
        console.log(`- Total components now: ${componentsAfterAdd.length}`);
        
        const testPassed = (originalComponentsStillExist === initialComponents.length && 
                           componentsAfterAdd.length === expectedCount);
        
        if (testPassed) {
            console.log('🎉 TEST PASSED: No components were overwritten');
        } else {
            console.error('❌ TEST FAILED: Components were overwritten or count is incorrect');
        }
        
        console.groupEnd();
        return testPassed;
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
        console.groupEnd();
        return false;
    }
};

/**
 * Test drag and drop without actually dragging
 */
window.testDragDropComponentAddition = async function() {
    console.group('🎯 Testing Drag & Drop Component Addition');
    
    try {
        // Check initial state
        const initialComponents = document.querySelectorAll('[data-component-id]');
        console.log(`Initial components: ${initialComponents.length}`);
        
        // Simulate drag and drop by directly calling the drag-drop manager
        if (!window.DragDropManager) {
            console.error('❌ DragDropManager not available');
            console.groupEnd();
            return false;
        }
        
        // Simulate component drop
        const mockDropZone = document.getElementById('media-kit-preview');
        const mockEvent = new Event('drop');
        
        if (mockDropZone) {
            console.log('🎯 Simulating hero component drop...');
            
            // Set up the drag data simulation
            window.DragDropManager.draggedComponentType = 'hero';
            
            await window.DragDropManager.handleComponentDrop('hero', mockDropZone, mockEvent);
            
            // Check components after drop
            const componentsAfterDrop = document.querySelectorAll('[data-component-id]');
            console.log(`Components after drop: ${componentsAfterDrop.length}`);
            
            const testPassed = componentsAfterDrop.length === (initialComponents.length + 1);
            
            if (testPassed) {
                console.log('✅ Drag & Drop test passed');
            } else {
                console.error('❌ Drag & Drop test failed');
            }
            
            console.groupEnd();
            return testPassed;
        } else {
            console.error('❌ Preview container not found');
            console.groupEnd();
            return false;
        }
        
    } catch (error) {
        console.error('❌ Drag & Drop test failed with error:', error);
        console.groupEnd();
        return false;
    }
};

/**
 * Run all tests
 */
window.runComponentOverwriteTests = async function() {
    console.log('🚀 Running All Component Overwrite Tests');
    
    const test1 = await window.testComponentOverwriteFix();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between tests
    const test2 = await window.testDragDropComponentAddition();
    
    console.log('\n📋 Test Results Summary:');
    console.log(`Component Manager Test: ${test1 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Drag & Drop Test: ${test2 ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allPassed = test1 && test2;
    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED - Component overwrite fix is working!');
    } else {
        console.log('❌ Some tests failed - component overwrite fix needs more work');
    }
    
    return allPassed;
};

// Auto-run tests after a delay to let the system initialize
setTimeout(() => {
    if (window.gmkbData?.debugMode) {
        console.log('🧪 Component Overwrite Fix Test available. Run runComponentOverwriteTests() to test.');
    }
}, 2000);
