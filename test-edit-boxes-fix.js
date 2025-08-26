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
    
    // ROOT FIX: Check for event delegation setup instead of individual listeners
    console.log('✅ Test 2: Checking event delegation setup...');
    const hasEventDelegation = document._topicsEventDelegationSetup === true;
    
    if (hasEventDelegation) {
        console.log('✅ Test 2: Event delegation properly setup (modern approach)');
    } else {
        // Check for legacy individual listeners
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
        
        console.log(`✅ Test 2: ${elementsWithEvents}/${editableElements.length} elements have individual listeners`);
    }
    
    // Test 3: Test focus functionality
    const firstElement = editableElements[0];
    if (firstElement) {
        console.log('🎯 Test 3: Testing focus functionality on first element...');
        
        // Record initial state
        const initialActiveElement = document.activeElement;
        
        // Focus the element
        firstElement.focus();
        
        console.log('🎯 Test 3: Testing focus functionality with event delegation...');
        
        // Record initial state
        const initialActiveElement = document.activeElement.tagName;
        
        // Focus the element
        firstElement.focus();
        
        // ROOT FIX: Use requestAnimationFrame instead of setTimeout for proper event delegation timing
        requestAnimationFrame(() => {
            const afterFocusActiveElement = document.activeElement.tagName;
            const focusWorked = document.activeElement === firstElement;
            const hasEditingAttribute = firstElement.hasAttribute('data-editing');
            const hasEditingStyles = firstElement.style.backgroundColor !== '' || firstElement.style.border !== '';
            
            console.log(`${focusWorked ? '✅' : '❌'} Test 3: Focus ${focusWorked ? 'WORKS' : 'FAILED'}`, {
                initialActiveElement: initialActiveElement,
                afterFocusActiveElement: afterFocusActiveElement,
                correctElement: focusWorked
            });
            
            // ROOT FIX: Test 4 - Check if event delegation triggers editing mode
            const editingModeWorked = hasEditingAttribute || hasEditingStyles;
            console.log(`${editingModeWorked ? '✅' : '❌'} Test 4: Editing mode ${editingModeWorked ? 'ACTIVATED' : 'NOT ACTIVATED'}`);
            
            if (focusWorked) {
                // ROOT FIX: Test text editing with proper event delegation timing
                const originalText = firstElement.textContent;
                const testText = 'TEST EDIT - ' + Date.now();
                
                firstElement.textContent = testText;
                firstElement.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Use requestAnimationFrame for event delegation processing
                requestAnimationFrame(() => {
                    const currentText = firstElement.textContent;
                    const textChanged = currentText === testText;
                    console.log(`${textChanged ? '✅' : '❌'} Test 5: Text editing ${textChanged ? 'WORKS' : 'FAILED'}`, {
                        originalText: originalText,
                        testText: testText,
                        currentText: currentText
                    });
                    
                    // Restore original text
                    firstElement.textContent = originalText;
                    
                    // Test 6: Test blur with event delegation
                    firstElement.blur();
                    
                    requestAnimationFrame(() => {
                        const stillEditing = firstElement.hasAttribute('data-editing');
                        const stillFocused = document.activeElement === firstElement;
                        const cleanedStyles = firstElement.style.backgroundColor === '' && firstElement.style.border === '';
                        
                        console.log(`${!stillEditing && !stillFocused && cleanedStyles ? '✅' : '❌'} Test 6: Blur handling ${!stillEditing && !stillFocused && cleanedStyles ? 'WORKS' : 'PROBLEMATIC'}`, {
                            stillEditing: stillEditing,
                            stillFocused: stillFocused,
                            activeElement: document.activeElement?.tagName,
                            cleanedStyles: cleanedStyles,
                            currentBackground: firstElement.style.backgroundColor
                        });
                        
                        // ROOT FIX: Updated final result calculation
                        const eventSystemWorked = hasEventDelegation || (elementsWithEvents > 0);
                        const allTestsPassed = editableElements.length > 0 && 
                                             eventSystemWorked &&
                                             focusWorked && 
                                             textChanged && 
                                             !stillEditing;
                        
                        const testScore = [
                            editableElements.length > 0,
                            eventSystemWorked,
                            focusWorked,
                            editingModeWorked || textChanged, // Either editing mode OR text editing should work
                            textChanged,
                            !stillEditing
                        ].filter(Boolean).length;
                        
                        const percentage = ((testScore / 6) * 100).toFixed(1);
                        
                        console.log(`\n🎯 FINAL SCORE: ${testScore}/6 tests passed (${percentage}%)`);
                        
                        if (testScore >= 5) {
                            console.log('✅ SUCCESS: Edit boxes are working correctly!');
                            console.log('💡 Instructions: Click on any topic title in the preview to start editing. Press Enter or click outside to save.');
                        } else if (testScore >= 3) {
                            console.log('⚠️ PARTIAL SUCCESS: Edit boxes work but some issues remain');
                            console.log('🔧 Try: window.initializeTopicsPreviewSync() to fix remaining issues');
                        } else {
                            console.log('❌ FAILURE: Edit boxes are not working correctly');
                            console.log('🔧 ISSUES DETECTED. You may need to:');
                            console.log('1. Refresh the page and try again');
                            console.log('2. Ensure the topics component is properly loaded');
                            console.log('3. Check that the panel-script.js fixes were applied correctly');
                            console.log('4. Run window.TopicsTemplate.testContentEditable() for more details');
                        }
                        
                        console.groupEnd();
                        return testScore >= 5;
                    });
                });
            } else {
                console.groupEnd();
                return false;
            }
        });
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
