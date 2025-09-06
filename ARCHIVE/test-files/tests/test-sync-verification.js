/**
 * Simple sync test to verify root cause
 * Tests if the sidebar inputs have proper data-property attributes
 * and if the bidirectional sync is working
 */

(function() {
    'use strict';
    
    console.log('🧪 SYNC TEST: Starting sync verification...');
    
    // Test 1: Check sidebar inputs for data-property attributes
    function testSidebarAttributes() {
        console.group('📋 TEST 1: Sidebar data-property attributes');
        
        const sidebarInputs = document.querySelectorAll('.topics-sidebar__topic-input');
        console.log(`Found ${sidebarInputs.length} sidebar inputs`);
        
        let allHaveAttributes = true;
        sidebarInputs.forEach((input, index) => {
            const property = input.getAttribute('data-property');
            const expected = `topic_${index + 1}`;
            const hasCorrectAttribute = property === expected;
            
            console.log(`Input ${index + 1}: data-property="${property}" ${hasCorrectAttribute ? '✅' : '❌'} (expected: "${expected}")`);
            
            if (!hasCorrectAttribute) {
                allHaveAttributes = false;
            }
        });
        
        console.groupEnd();
        return allHaveAttributes;
    }
    
    // Test 2: Check preview elements for data-topic-number attributes  
    function testPreviewAttributes() {
        console.group('📋 TEST 2: Preview data-topic-number attributes');
        
        const previewElements = document.querySelectorAll('.topic-title');
        console.log(`Found ${previewElements.length} preview elements`);
        
        let allHaveAttributes = true;
        previewElements.forEach((element, index) => {
            const topicNumber = element.getAttribute('data-topic-number');
            const expected = (index + 1).toString();
            const hasCorrectAttribute = topicNumber === expected;
            
            console.log(`Element ${index + 1}: data-topic-number="${topicNumber}" ${hasCorrectAttribute ? '✅' : '❌'} (expected: "${expected}")`);
            
            if (!hasCorrectAttribute) {
                allHaveAttributes = false;
            }
        });
        
        console.groupEnd();
        return allHaveAttributes;
    }
    
    // Test 3: Check if bidirectional sync manager is loaded
    function testSyncManagerLoaded() {
        console.group('📋 TEST 3: Sync manager status');
        
        const managerLoaded = !!window.bidirectionalSyncManager;
        console.log(`Bidirectional Sync Manager loaded: ${managerLoaded ? '✅' : '❌'}`);
        
        if (managerLoaded) {
            const debug = window.bidirectionalSyncManager.debug();
            console.log('Manager status:', debug);
        }
        
        console.groupEnd();
        return managerLoaded;
    }
    
    // Test 4: Functional sync test
    function testFunctionalSync() {
        console.group('📋 TEST 4: Functional sync test');
        
        // Test sidebar to preview
        const firstInput = document.querySelector('.topics-sidebar__topic-input[data-property="topic_1"]');
        const firstPreview = document.querySelector('[data-topic-number="1"]');
        
        if (!firstInput || !firstPreview) {
            console.log('❌ Cannot test sync - missing elements');
            console.groupEnd();
            return false;
        }
        
        const testValue = `Sync Test ${Date.now()}`;
        console.log(`Setting sidebar value to: "${testValue}"`);
        
        firstInput.value = testValue;
        firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Check if preview updated
        setTimeout(() => {
            const previewValue = firstPreview.textContent.trim();
            const syncWorked = previewValue === testValue;
            
            console.log(`Preview value: "${previewValue}"`);
            console.log(`Sync worked: ${syncWorked ? '✅' : '❌'}`);
            
            console.groupEnd();
            
            // Summary
            console.group('🎯 SYNC TEST SUMMARY');
            console.log('1. Sidebar attributes: ' + (testSidebarAttributes() ? '✅ PASS' : '❌ FAIL'));
            console.log('2. Preview attributes: ' + (testPreviewAttributes() ? '✅ PASS' : '❌ FAIL'));
            console.log('3. Sync manager loaded: ' + (testSyncManagerLoaded() ? '✅ PASS' : '❌ FAIL'));
            console.log('4. Functional sync: ' + (syncWorked ? '✅ PASS' : '❌ FAIL'));
            console.groupEnd();
            
            if (!syncWorked) {
                console.log('🔧 DEBUGGING: Possible causes:');
                console.log('- Bidirectional sync manager not properly initialized');
                console.log('- Topics component not registered with sync manager');
                console.log('- Event listeners not attached');
                console.log('- Try running: bidirectionalSyncManager.autoRegisterTopicsComponent()');
            }
        }, 500);
        
        return true;
    }
    
    // Run all tests
    console.log('🚀 Running all sync tests...\n');
    
    const sidebarOk = testSidebarAttributes();
    const previewOk = testPreviewAttributes();
    const managerOk = testSyncManagerLoaded();
    
    // Run functional test after a delay
    setTimeout(() => {
        testFunctionalSync();
    }, 1000);
    
})();
