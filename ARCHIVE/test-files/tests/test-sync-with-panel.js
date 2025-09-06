/**
 * Test sync when design panel is open
 * This tests the actual sync functionality between sidebar and preview
 */

(function() {
    'use strict';
    
    console.log('🧪 SYNC TEST: Testing bidirectional sync with design panel open...');
    
    function runSyncTest() {
        // Check if design panel is open
        const designPanel = document.querySelector('.design-panel');
        const designTab = document.querySelector('[data-tab="design"]');
        const isDesignPanelOpen = designPanel && designTab && designTab.classList.contains('active');
        
        if (!isDesignPanelOpen) {
            console.log('❌ SYNC TEST: Design panel not open. Open a topic component first.');
            return false;
        }
        
        console.log('✅ Design panel is open');
        
        // Find sidebar inputs
        const sidebarInputs = document.querySelectorAll('.topics-sidebar__topic-input');
        console.log(`Found ${sidebarInputs.length} sidebar inputs`);
        
        // Find preview elements  
        const previewElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
        console.log(`Found ${previewElements.length} preview elements`);
        
        if (sidebarInputs.length === 0) {
            console.log('❌ No sidebar inputs found');
            return false;
        }
        
        if (previewElements.length === 0) {
            console.log('❌ No preview elements found');
            return false;
        }
        
        // Test 1: Sidebar to Preview
        console.group('📝 TEST 1: Sidebar → Preview sync');
        const firstInput = sidebarInputs[0];
        const testValue1 = `Sync Test ${Date.now()}`;
        
        console.log(`Setting sidebar value to: "${testValue1}"`);
        firstInput.value = testValue1;
        firstInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
            // Find the corresponding preview element
            const topicNumber = firstInput.getAttribute('data-property')?.replace('topic_', '') || '1';
            const previewElement = document.querySelector(`[data-topic-number="${topicNumber}"]`) || previewElements[0];
            
            const previewValue = previewElement.textContent.trim();
            const syncWorked = previewValue === testValue1;
            
            console.log(`Preview value: "${previewValue}"`);
            console.log(`Sync result: ${syncWorked ? '✅ SUCCESS' : '❌ FAILED'}`);
            console.groupEnd();
            
            // Test 2: Preview to Sidebar
            console.group('📝 TEST 2: Preview → Sidebar sync');
            const testValue2 = `Preview Test ${Date.now()}`;
            
            console.log(`Setting preview value to: "${testValue2}"`);
            previewElement.textContent = testValue2;
            previewElement.dispatchEvent(new Event('input', { bubbles: true }));
            previewElement.blur();
            
            setTimeout(() => {
                const sidebarValue = firstInput.value.trim();
                const reverseWorked = sidebarValue === testValue2;
                
                console.log(`Sidebar value: "${sidebarValue}"`);
                console.log(`Sync result: ${reverseWorked ? '✅ SUCCESS' : '❌ FAILED'}`);
                console.groupEnd();
                
                // Summary
                console.group('📊 SYNC TEST SUMMARY');
                console.log(`Sidebar → Preview: ${syncWorked ? '✅ WORKING' : '❌ NOT WORKING'}`);
                console.log(`Preview → Sidebar: ${reverseWorked ? '✅ WORKING' : '❌ NOT WORKING'}`);
                console.log(`Overall: ${syncWorked && reverseWorked ? '✅ BIDIRECTIONAL SYNC WORKING!' : '❌ SYNC ISSUES DETECTED'}`);
                console.groupEnd();
                
                if (!syncWorked || !reverseWorked) {
                    console.log('🔧 Debug info:');
                    console.log('- Sidebar input data-property:', firstInput.getAttribute('data-property'));
                    console.log('- Preview element data-topic-number:', previewElement.getAttribute('data-topic-number'));
                    console.log('- updatePreviewFromSidebar available:', typeof window.updatePreviewFromSidebar);
                    console.log('- updateSidebarFromPreview available:', typeof window.updateSidebarFromPreview);
                }
            }, 500);
        }, 500);
    }
    
    // Export test function
    window.testSyncWithPanel = runSyncTest;
    
    // Auto-run if design panel is open
    setTimeout(() => {
        const designTab = document.querySelector('[data-tab="design"]');
        if (designTab && designTab.classList.contains('active')) {
            console.log('🚀 Design panel detected, auto-running sync test...');
            runSyncTest();
        } else {
            console.log('💡 To test sync: 1) Click edit on a topics component 2) Run testSyncWithPanel()');
        }
    }, 1000);
    
})();
