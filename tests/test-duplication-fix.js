/**
 * Test script to verify component duplication fix
 * Run this in the browser console on the media kit builder page
 */

console.log('=== Testing Component Duplication Fix ===');

// 1. Check for duplicates in DOM
function checkForDuplicates() {
    const components = document.querySelectorAll('[data-component-id]');
    const componentMap = new Map();
    let duplicatesFound = false;
    
    components.forEach(element => {
        const id = element.getAttribute('data-component-id');
        if (componentMap.has(id)) {
            console.error(`❌ DUPLICATE FOUND: ${id}`);
            duplicatesFound = true;
            componentMap.get(id).push(element);
        } else {
            componentMap.set(id, [element]);
        }
    });
    
    if (!duplicatesFound) {
        console.log('✅ No duplicates found in DOM');
    } else {
        console.log('Duplicate components:', componentMap);
    }
    
    return !duplicatesFound;
}

// 2. Check component counts
function checkComponentCounts() {
    const state = window.enhancedStateManager.getState();
    const stateCount = Object.keys(state.components || {}).length;
    
    const savedContainer = document.getElementById('saved-components-container');
    const previewContainer = document.getElementById('media-kit-preview');
    
    const savedCount = savedContainer ? savedContainer.children.length : 0;
    const previewCount = previewContainer ? previewContainer.children.length : 0;
    const totalInDOM = savedCount + previewCount;
    
    console.log('Component counts:');
    console.log(`  State: ${stateCount} components`);
    console.log(`  Saved container: ${savedCount} components`);
    console.log(`  Preview container: ${previewCount} components`);
    console.log(`  Total in DOM: ${totalInDOM} components`);
    
    if (stateCount === totalInDOM || stateCount === savedCount || stateCount === previewCount) {
        console.log('✅ Component count matches state');
        return true;
    } else {
        console.error('❌ Component count mismatch!');
        return false;
    }
}

// 3. Check DOM Render Coordinator status
function checkCoordinator() {
    if (window.domRenderCoordinator) {
        const status = window.domRenderCoordinator.getStatus();
        console.log('DOM Render Coordinator status:', status);
        
        const analysis = window.domRenderCoordinator.analyzeDOMState();
        console.log('DOM Analysis:', analysis);
        
        if (Object.keys(analysis.duplicates).length === 0) {
            console.log('✅ Coordinator reports no duplicates');
            return true;
        } else {
            console.error('❌ Coordinator found duplicates:', analysis.duplicates);
            return false;
        }
    } else {
        console.warn('⚠️ DOM Render Coordinator not available');
        return null;
    }
}

// 4. Test adding a new component
async function testAddComponent() {
    console.log('\n--- Testing component addition ---');
    
    const beforeCount = document.querySelectorAll('[data-component-id]').length;
    console.log(`Components before: ${beforeCount}`);
    
    // Add a test component
    if (window.enhancedComponentManager) {
        const testId = `test-component-${Date.now()}`;
        await window.enhancedComponentManager.addComponent('hero', {
            title: 'Test Component',
            subtitle: 'Testing duplication fix'
        });
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const afterCount = document.querySelectorAll('[data-component-id]').length;
        console.log(`Components after: ${afterCount}`);
        
        if (afterCount === beforeCount + 1) {
            console.log('✅ Component added without duplication');
            return true;
        } else {
            console.error(`❌ Expected ${beforeCount + 1} components, got ${afterCount}`);
            return false;
        }
    } else {
        console.warn('⚠️ Component manager not available');
        return null;
    }
}

// 5. Check for emergency cleanup removal
function checkEmergencyCleanupRemoved() {
    const renderer = window.enhancedComponentRenderer;
    if (renderer) {
        if (typeof renderer.emergencyCleanupDuplicates === 'undefined') {
            console.log('✅ Emergency cleanup method removed (good!)');
            return true;
        } else {
            console.error('❌ Emergency cleanup method still exists!');
            return false;
        }
    } else {
        console.warn('⚠️ Enhanced component renderer not available');
        return null;
    }
}

// Run all tests
async function runAllTests() {
    console.log('=== Running All Duplication Fix Tests ===\n');
    
    const results = {
        noDuplicates: checkForDuplicates(),
        correctCounts: checkComponentCounts(),
        coordinatorClean: checkCoordinator(),
        emergencyCleanupRemoved: checkEmergencyCleanupRemoved()
    };
    
    // Test dynamic addition
    const addTestResult = await testAddComponent();
    if (addTestResult !== null) {
        results.dynamicAddition = addTestResult;
    }
    
    // Summary
    console.log('\n=== Test Summary ===');
    let allPassed = true;
    for (const [test, result] of Object.entries(results)) {
        if (result === false) {
            allPassed = false;
            console.error(`❌ ${test}: FAILED`);
        } else if (result === true) {
            console.log(`✅ ${test}: PASSED`);
        } else {
            console.warn(`⚠️ ${test}: SKIPPED`);
        }
    }
    
    if (allPassed) {
        console.log('\n🎉 All tests passed! Duplication fix is working correctly.');
    } else {
        console.error('\n❌ Some tests failed. Check the logs above for details.');
    }
    
    return results;
}

// Auto-run tests
runAllTests();
