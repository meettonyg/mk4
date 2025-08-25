/**
 * IMMEDIATE SYNC TEST
 * Test bi-directional sync between sidebar and preview
 */

console.log('🔄 SYNC TEST: Loading immediate sync test...');

window.testSyncNow = function() {
    console.log('🔄 TESTING SYNC: Starting bi-directional sync test...');
    
    // Find elements
    const sidebarInputs = document.querySelectorAll('.topics-sidebar__topic-input');
    const previewElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
    
    console.log(`Found ${sidebarInputs.length} sidebar inputs`);
    console.log(`Found ${previewElements.length} preview elements`);
    
    if (sidebarInputs.length === 0 || previewElements.length === 0) {
        console.error('❌ Cannot test - missing elements');
        return;
    }
    
    // Test 1: Sidebar to Preview
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
};

// Auto-run test
setTimeout(() => {
    console.log('🚀 AUTO-RUNNING SYNC TEST...');
    if (typeof window.testSyncNow === 'function') {
        window.testSyncNow();
    }
}, 2000);

console.log('✅ Sync test loaded. Run: testSyncNow()');
