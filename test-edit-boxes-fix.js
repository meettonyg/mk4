/**
 * Test Script for Edit Boxes Fix
 * 
 * Run this in the browser console to test if the edit boxes are working properly
 */

console.log('🧪 EDIT BOXES FIX TEST: Starting comprehensive test...');

function testEditBoxesFix() {
    console.group('📋 EDIT BOXES FIX TEST RESULTS');
    
    // Test 1: Check if contenteditable elements exist
    const editableElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
    console.log(`✅ Test 1: Found ${editableElements.length} contenteditable elements`);
    
    if (editableElements.length === 0) {
        console.error('❌ CRITICAL: No contenteditable elements found! The topics component may not be loaded.');
        console.groupEnd();
        return false;
    }
    
    // Test 2: Check if event listeners are properly attached
    let elementsWithEvents = 0;
    editableElements.forEach((element, index) => {
        const hasEvents = element.hasAttribute('data-sync-initialized');
        if (hasEvents) elementsWithEvents++;
        
        console.log(`Element ${index + 1}:`, {
            hasEventListeners: hasEvents,
            isContentEditable: element.isContentEditable,
            currentText: element.textContent.trim(),
            hasEditingAttribute: element.hasAttribute('data-editing')
        });
    });
    
    console.log(`✅ Test 2: ${elementsWithEvents}/${editableElements.length} elements have event listeners`);
    
    // Test 3: Test focus functionality
    const firstElement = editableElements[0];
    if (firstElement) {
        console.log('🎯 Test 3: Testing focus functionality on first element...');
        
        // Record initial state
        const initialActiveElement = document.activeElement;
        
        // Focus the element
        firstElement.focus();
        
        setTimeout(() => {
            const afterFocusActiveElement = document.activeElement;
            const focusWorked = afterFocusActiveElement === firstElement;
            
            console.log(`${focusWorked ? '✅' : '❌'} Test 3: Focus ${focusWorked ? 'WORKS' : 'FAILED'}`, {
                initialActiveElement: initialActiveElement?.tagName,
                afterFocusActiveElement: afterFocusActiveElement?.tagName,
                correctElement: afterFocusActiveElement === firstElement
            });
            
            // Test 4: Test if editing mode activates
            if (focusWorked) {
                setTimeout(() => {
                    const hasEditingAttribute = firstElement.hasAttribute('data-editing');
                    console.log(`${hasEditingAttribute ? '✅' : '❌'} Test 4: Editing mode ${hasEditingAttribute ? 'ACTIVATED' : 'NOT ACTIVATED'}`);
                    
                    // Test 5: Test typing simulation
                    const originalText = firstElement.textContent;
                    const testText = 'TEST EDIT - ' + Date.now();
                    
                    firstElement.textContent = testText;
                    firstElement.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    setTimeout(() => {
                        const currentText = firstElement.textContent;
                        const textChanged = currentText === testText;
                        console.log(`${textChanged ? '✅' : '❌'} Test 5: Text editing ${textChanged ? 'WORKS' : 'FAILED'}`, {
                            originalText: originalText,
                            testText: testText,
                            currentText: currentText
                        });
                        
                        // Restore original text
                        firstElement.textContent = originalText;
                        
                        // Test 6: Test blur without immediate sync interference
                        firstElement.blur();
                        
                        setTimeout(() => {
                            const stillEditing = firstElement.hasAttribute('data-editing');
                            const stillFocused = document.activeElement === firstElement;
                            
                            console.log(`${!stillEditing && !stillFocused ? '✅' : '❌'} Test 6: Blur handling ${!stillEditing && !stillFocused ? 'WORKS' : 'PROBLEMATIC'}`, {
                                stillEditing: stillEditing,
                                stillFocused: stillFocused,
                                activeElement: document.activeElement?.tagName
                            });
                            
                            // Final result
                            const allTestsPassed = editableElements.length > 0 && 
                                                 elementsWithEvents === editableElements.length &&
                                                 focusWorked && 
                                                 textChanged && 
                                                 !stillEditing;
                            
                            console.log(`\n🎯 FINAL RESULT: Edit boxes are ${allTestsPassed ? 'WORKING PROPERLY! ✅' : 'NOT WORKING CORRECTLY ❌'}`);
                            
                            if (allTestsPassed) {
                                console.log('🎉 SUCCESS! Users should now be able to click and edit topic titles directly in the preview.');
                                console.log('💡 Instructions: Click on any topic title in the preview to start editing. Press Enter or click outside to save.');
                            } else {
                                console.log('🔧 ISSUES DETECTED. You may need to:');
                                console.log('1. Refresh the page and try again');
                                console.log('2. Ensure the topics component is properly loaded');
                                console.log('3. Check that the panel-script.js fixes were applied correctly');
                                console.log('4. Run window.TopicsTemplate.testContentEditable() for more details');
                            }
                            
                            console.groupEnd();
                            return allTestsPassed;
                            
                        }, 200);
                    }, 100);
                }, 100);
            } else {
                console.groupEnd();
                return false;
            }
        }, 100);
    } else {
        console.error('❌ No first element found for testing');
        console.groupEnd();
        return false;
    }
}

// Additional utility functions
window.testEditBoxes = testEditBoxesFix;

window.forceTopicsReinit = function() {
    console.log('🔄 FORCE REINIT: Forcing topics template reinitialization...');
    if (window.TopicsTemplate && window.TopicsTemplate.forceClearAndReinitialize) {
        window.TopicsTemplate.forceClearAndReinitialize();
    } else {
        console.error('❌ TopicsTemplate not found or missing forceClearAndReinitialize method');
    }
};

window.debugTopicsState = function() {
    console.log('🔍 TOPICS STATE DEBUG:');
    
    if (window.TopicsTemplate) {
        window.TopicsTemplate.debug();
        window.TopicsTemplate.testContentEditable();
    } else {
        console.error('❌ TopicsTemplate not found');
    }
    
    if (window.TopicsSync) {
        console.log('\n🔗 TOPICS SYNC DEBUG:');
        window.TopicsSync.debug();
    } else {
        console.warn('⚠️ TopicsSync not found');
    }
};

// Auto-run the test
setTimeout(() => {
    console.log('\n🚀 AUTO-TESTING: Running edit boxes test in 2 seconds...');
    console.log('💡 You can also manually run: testEditBoxes(), forceTopicsReinit(), or debugTopicsState()');
    
    setTimeout(testEditBoxesFix, 2000);
}, 100);

console.log('✅ EDIT BOXES FIX TEST: Test script loaded successfully');
console.log('📋 Available commands:');
console.log('  - testEditBoxes() - Run comprehensive test');
console.log('  - forceTopicsReinit() - Force reinitialize topics template'); 
console.log('  - debugTopicsState() - Show debug information');
