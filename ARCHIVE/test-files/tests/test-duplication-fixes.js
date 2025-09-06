/**
 * Test Script: Verify Duplicate Component Rendering Fixes
 * 
 * This script tests the root fixes for:
 * 1. Duplicate component rendering
 * 2. Child elements with data-component-id
 * 3. Controls not attaching after re-render
 */

console.log('🧪 TESTING DUPLICATION FIXES');
console.log('='.repeat(60));

// Test 1: Check for duplicate data-component-id attributes
function testDuplicateAttributes() {
    console.log('\n📋 TEST 1: Checking for duplicate data-component-id attributes');
    
    const allComponents = document.querySelectorAll('[data-component-id]');
    const idMap = new Map();
    
    allComponents.forEach(element => {
        const id = element.getAttribute('data-component-id');
        if (!idMap.has(id)) {
            idMap.set(id, []);
        }
        idMap.get(id).push(element);
    });
    
    let duplicatesFound = 0;
    idMap.forEach((elements, id) => {
        if (elements.length > 1) {
            console.error(`❌ DUPLICATE FOUND: ${id} appears ${elements.length} times`);
            duplicatesFound++;
        }
    });
    
    if (duplicatesFound === 0) {
        console.log('✅ No duplicate data-component-id attributes found');
    }
    
    return duplicatesFound === 0;
}

// Test 2: Check for child elements with data-component-id
function testChildDataAttributes() {
    console.log('\n📋 TEST 2: Checking for child elements with data-component-id');
    
    const components = document.querySelectorAll('[id^="component-"]');
    let issuesFound = 0;
    
    components.forEach(component => {
        const childrenWithDataId = component.querySelectorAll('[data-component-id]');
        if (childrenWithDataId.length > 0) {
            console.error(`❌ Component ${component.id} has ${childrenWithDataId.length} child elements with data-component-id`);
            issuesFound++;
        }
    });
    
    if (issuesFound === 0) {
        console.log('✅ No child elements with data-component-id found');
    }
    
    return issuesFound === 0;
}

// Test 3: Check controls attachment
function testControlsAttachment() {
    console.log('\n📋 TEST 3: Checking controls attachment');
    
    const components = document.querySelectorAll('[id^="component-"]');
    let missingControls = 0;
    
    components.forEach(component => {
        const controls = component.querySelector('.component-controls--dynamic');
        if (!controls) {
            console.error(`❌ Component ${component.id} is missing controls`);
            missingControls++;
        }
    });
    
    if (missingControls === 0) {
        console.log(`✅ All ${components.length} components have controls attached`);
    }
    
    return missingControls === 0;
}

// Test 4: Test duplicate component scenario
async function testDuplicateComponent() {
    console.log('\n📋 TEST 4: Testing component duplication scenario');
    
    // Find a component to duplicate
    const existingComponent = document.querySelector('[id^="component-"]');
    if (!existingComponent) {
        console.log('⚠️ No components found to test duplication');
        return true;
    }
    
    const componentId = existingComponent.id;
    console.log(`Testing duplication of component: ${componentId}`);
    
    // Dispatch duplicate event
    document.dispatchEvent(new CustomEvent('gmkb:component-duplicate-requested', {
        detail: { componentId }
    }));
    
    // Wait for duplication to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check results
    const test1 = testDuplicateAttributes();
    const test2 = testChildDataAttributes();
    const test3 = testControlsAttachment();
    
    return test1 && test2 && test3;
}

// Test 5: Test component re-render
async function testComponentReRender() {
    console.log('\n📋 TEST 5: Testing component re-render');
    
    const component = document.querySelector('[id^="component-"]');
    if (!component) {
        console.log('⚠️ No components found to test re-render');
        return true;
    }
    
    const componentId = component.id;
    const initialControlsCount = document.querySelectorAll('.component-controls--dynamic').length;
    
    // Trigger a state update that causes re-render
    if (window.enhancedStateManager) {
        const state = window.enhancedStateManager.getState();
        const componentData = state.components[componentId];
        if (componentData) {
            // Update component props
            window.enhancedStateManager.updateComponent(componentId, {
                ...componentData,
                lastUpdated: Date.now()
            });
        }
    }
    
    // Wait for re-render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalControlsCount = document.querySelectorAll('.component-controls--dynamic').length;
    
    if (finalControlsCount === initialControlsCount) {
        console.log('✅ Controls count remained stable after re-render');
        return true;
    } else {
        console.error(`❌ Controls count changed: ${initialControlsCount} → ${finalControlsCount}`);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🚀 RUNNING ALL TESTS...\n');
    
    const results = [];
    
    results.push({ name: 'Duplicate Attributes', passed: testDuplicateAttributes() });
    results.push({ name: 'Child Data Attributes', passed: testChildDataAttributes() });
    results.push({ name: 'Controls Attachment', passed: testControlsAttachment() });
    
    // Run async tests
    results.push({ name: 'Duplicate Component', passed: await testDuplicateComponent() });
    results.push({ name: 'Component Re-render', passed: await testComponentReRender() });
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY:');
    console.log('='.repeat(60));
    
    let passedCount = 0;
    results.forEach(result => {
        const status = result.passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status} - ${result.name}`);
        if (result.passed) passedCount++;
    });
    
    console.log('\n' + '='.repeat(60));
    const allPassed = passedCount === results.length;
    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED! Duplication issues are fixed.');
    } else {
        console.log(`⚠️ ${results.length - passedCount} test(s) failed. Some issues remain.`);
    }
    console.log('='.repeat(60));
    
    return allPassed;
}

// Execute tests
runAllTests();

// Export for manual testing
window.testDuplicationFixes = {
    testDuplicateAttributes,
    testChildDataAttributes,
    testControlsAttachment,
    testDuplicateComponent,
    testComponentReRender,
    runAllTests
};
