/**
 * IMMEDIATE SYNC TEST
 * Test bi-directional sync between sidebar and preview
 */

console.log('🔄 SYNC TEST: Loading immediate sync test...');

window.testSyncNow = function() {
    console.log('TESTING SYNC: Starting bi-directional sync test with simplified system...');
    
    // ROOT FIX: Use TopicsSync API if available
    if (window.TopicsSync && typeof window.TopicsSync.testSync === 'function') {
        console.log('Using TopicsSync.testSync() from panel-script.js...');
        window.TopicsSync.testSync();
        return;
    }
    
    // Fallback: Find elements with simplified selectors
    let sidebarInputs = document.querySelectorAll('textarea[data-property^="topic_"], input[data-property^="topic_"]');
    let previewElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
    
    console.log(`Found ${sidebarInputs.length} sidebar inputs`);
    console.log(`Found ${previewElements.length} preview elements`);
    
    if (sidebarInputs.length === 0 && previewElements.length === 0) {
        console.error('❌ Cannot test - no sync elements found');
        console.log('🔍 Searching for alternative elements...');
        
        // Try to find any input elements in the sidebar
        const anyInputs = document.querySelectorAll('#element-editor input, #element-editor textarea');
        const anyEditables = document.querySelectorAll('[contenteditable="true"]');
        
        console.log(`Found ${anyInputs.length} input elements in sidebar`);
        console.log(`Found ${anyEditables.length} editable elements in preview`);
        
        if (anyInputs.length === 0 && anyEditables.length === 0) {
            console.error('❌ Cannot test - no interactive elements found at all');
            return;
        }
        
        // Use alternative elements for basic testing
        testAlternativeSync(anyInputs, anyEditables);
        return;
    }
    
    // If we have either sidebar inputs OR preview elements, we can test
    if (sidebarInputs.length === 0) {
        console.warn('⚠️ No sidebar inputs found - testing preview elements only');
    }
    if (previewElements.length === 0) {
        console.warn('⚠️ No preview elements found - testing sidebar elements only');
    }
    
    // Test 1: Sidebar to Preview (only if both exist)
    if (sidebarInputs.length > 0 && previewElements.length > 0) {
        console.log('🔄 TEST 1: Sidebar -> Preview sync');
        const testValue1 = `Sidebar Test ${Date.now()}`;
        const firstInput = sidebarInputs[0];
        const firstPreview = previewElements[0];
        
        firstInput.value = testValue1;
        firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
            const previewText = firstPreview.textContent.trim();
            const test1Pass = previewText === testValue1;
            console.log(`${test1Pass ? '✅' : '❌'} Sidebar->Preview: Expected "${testValue1}", got "${previewText}"`);
            
            // Test 2: Preview to Sidebar
            console.log('🔄 TEST 2: Preview -> Sidebar sync');
            const testValue2 = `Preview Test ${Date.now()}`;
            
            firstPreview.textContent = testValue2;
            firstPreview.dispatchEvent(new Event('input', { bubbles: true }));
            firstPreview.blur(); // Simulate user finishing edit
            
            setTimeout(() => {
                const sidebarValue = firstInput.value.trim();
                const test2Pass = sidebarValue === testValue2;
                console.log(`${test2Pass ? '✅' : '❌'} Preview->Sidebar: Expected "${testValue2}", got "${sidebarValue}"`);
                
                const overallPass = test1Pass && test2Pass;
                console.log(`\n🎯 SYNC TEST RESULT: ${overallPass ? 'WORKING ✅' : 'FAILED ❌'}`);
                
                if (overallPass) {
                    console.log('🎉 SUCCESS! Bi-directional sync is working!');
                } else {
                    console.log('❌ Sync issues detected:');
                    if (!test1Pass) console.log('  - Sidebar to preview not syncing');
                    if (!test2Pass) console.log('  - Preview to sidebar not syncing'); 
                }
                
                return overallPass;
            }, 300);
        }, 300);
    } else {
        // Test individual elements when we don't have both types
        console.log('🔄 TESTING: Individual element responsiveness...');
        
        if (sidebarInputs.length > 0) {
            console.log('🔄 TEST: Sidebar input functionality');
            const testInput = sidebarInputs[0];
            const originalValue = testInput.value;
            const testValue = `Input Test ${Date.now()}`;
            
            testInput.value = testValue;
            testInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            setTimeout(() => {
                const currentValue = testInput.value;
                const testPass = currentValue === testValue;
                console.log(`${testPass ? '✅' : '❌'} Sidebar Input: ${testPass ? 'WORKING' : 'NOT WORKING'}`);
                
                // Restore original
                testInput.value = originalValue;
                testInput.dispatchEvent(new Event('input', { bubbles: true }));
            }, 200);
        }
        
        if (previewElements.length > 0) {
            console.log('🔄 TEST: Preview element functionality');
            const testElement = previewElements[0];
            const originalValue = testElement.textContent;
            const testValue = `Preview Test ${Date.now()}`;
            
            testElement.textContent = testValue;
            testElement.dispatchEvent(new Event('input', { bubbles: true }));
            
            setTimeout(() => {
                const currentValue = testElement.textContent;
                const testPass = currentValue === testValue;
                console.log(`${testPass ? '✅' : '❌'} Preview Element: ${testPass ? 'WORKING' : 'NOT WORKING'}`);
                
                // Restore original
                testElement.textContent = originalValue;
                testElement.dispatchEvent(new Event('input', { bubbles: true }));
            }, 200);
        }
        
        console.log('\n🎯 INDIVIDUAL TEST RESULT: Element responsiveness tested');
        console.log('ℹ️ Note: Full bidirectional sync requires both sidebar and preview elements');
    }
};

/**
 * Alternative sync test when main elements are not found
 * @param {NodeList} inputs - Input elements to test
 * @param {NodeList} editables - Editable elements to test
 */
function testAlternativeSync(inputs, editables) {
    console.log('🔄 ALTERNATIVE SYNC TEST: Testing available elements...');
    
    if (inputs.length > 0) {
        console.log('🔄 TEST: Input element responsiveness');
        const testInput = inputs[0];
        const originalValue = testInput.value || testInput.textContent || '';
        const testValue = `Input Test ${Date.now()}`;
        
        if (testInput.tagName.toLowerCase() === 'input' || testInput.tagName.toLowerCase() === 'textarea') {
            testInput.value = testValue;
            testInput.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            testInput.textContent = testValue;
            testInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        setTimeout(() => {
            const currentValue = testInput.value || testInput.textContent || '';
            const test1Pass = currentValue === testValue;
            console.log(`${test1Pass ? '✅' : '❌'} Input Test: Expected "${testValue}", got "${currentValue}"`);
            
            // Restore original value
            if (testInput.tagName.toLowerCase() === 'input' || testInput.tagName.toLowerCase() === 'textarea') {
                testInput.value = originalValue;
            } else {
                testInput.textContent = originalValue;
            }
            testInput.dispatchEvent(new Event('input', { bubbles: true }));
            
        }, 200);
    }
    
    if (editables.length > 0) {
        console.log('🔄 TEST: Editable element responsiveness');
        const testEditable = editables[0];
        const originalContent = testEditable.textContent || '';
        const testContent = `Editable Test ${Date.now()}`;
        
        testEditable.textContent = testContent;
        testEditable.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
            const currentContent = testEditable.textContent || '';
            const test2Pass = currentContent === testContent;
            console.log(`${test2Pass ? '✅' : '❌'} Editable Test: Expected "${testContent}", got "${currentContent}"`);
            
            // Restore original content
            testEditable.textContent = originalContent;
            testEditable.dispatchEvent(new Event('input', { bubbles: true }));
            
        }, 200);
    }
    
    console.log(`\n🎯 ALTERNATIVE SYNC TEST RESULT: Basic element interaction tested`);
    console.log('ℹ️ Note: For full sync testing, ensure topics component is loaded with proper elements');
}

// ROOT FIX: Auto-run test with coordination check
setTimeout(() => {
    console.log('AUTO-RUNNING SIMPLIFIED SYNC TEST...');
    if (typeof window.testSyncNow === 'function') {
        window.testSyncNow();
    }
    
    // Also test TopicsSync if available
    if (window.TopicsSync && typeof window.TopicsSync.debug === 'function') {
        console.log('Running TopicsSync debug...');
        window.TopicsSync.debug();
    }
}, 2000);

console.log('✅ Sync test loaded. Run: testSyncNow()');
