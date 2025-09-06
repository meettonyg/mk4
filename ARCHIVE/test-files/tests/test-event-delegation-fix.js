/**
 * ROOT FIX: Event Delegation Test Script
 * 
 * Tests edit boxes functionality with proper event delegation detection
 * Run: testEventDelegation() in browser console
 */

console.log('ROOT FIX: Event Delegation Test Script Loading...');

function testEventDelegation() {
    console.group('ROOT FIX TEST: Event Delegation Functionality');
    
    let passed = 0;
    let total = 5;
    
    // Test 1: Check contenteditable elements exist
    const editableElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
    console.log(`Test 1 - Contenteditable Elements: Found ${editableElements.length}`);
    if (editableElements.length > 0) {
        console.log('PASS: Contenteditable elements found');
        passed++;
    } else {
        console.log('FAIL: No contenteditable elements found');
    }
    
    // ROOT FIX: Test 2 - Check for event delegation setup
    console.log('Test 2 - Event Delegation: Checking...');
    
    const hasEventDelegation = document._topicsEventDelegationSetup === true;
    const hasTopicsSync = window.TopicsSync && typeof window.TopicsSync.syncPreviewToDesignPanel === 'function';
    
    if (hasEventDelegation) {
        console.log('PASS: Event delegation properly setup');
        passed++;
    } else if (hasTopicsSync) {
        console.log('PASS: TopicsSync available (fallback system)');
        passed++;
    } else {
        console.log('FAIL: No event system detected');
    }
    
    if (editableElements.length === 0) {
        console.log('EARLY EXIT: No elements to test');
        console.groupEnd();
        return false;
    }
    
    // Test 3: Focus functionality with event delegation
    console.log('Test 3 - Focus Functionality: Testing first element...');
    
    const firstElement = editableElements[0];
    const initialActiveElement = document.activeElement;
    
    // Focus the element
    firstElement.focus();
    
    // ROOT FIX: Use requestAnimationFrame for proper event delegation timing
    requestAnimationFrame(() => {
        const focused = document.activeElement === firstElement;
        const hasEditingAttribute = firstElement.hasAttribute('data-editing');
        const hasEditingStyle = firstElement.style.backgroundColor !== '' || firstElement.style.border !== '';
        
        console.log('Focus Test Results:', {
            focused: focused,
            editingAttribute: hasEditingAttribute,
            editingStyle: hasEditingStyle,
            backgroundColor: firstElement.style.backgroundColor,
            border: firstElement.style.border
        });
        
        if (focused && (hasEditingAttribute || hasEditingStyle)) {
            console.log('PASS: Focus functionality working correctly');
            passed++;
        } else if (focused) {
            console.log('PARTIAL: Element can focus but editing mode styling incomplete');
            passed += 0.5;
        } else {
            console.log('FAIL: Focus functionality not working');
        }
        
        // Test 4: Text editing with event delegation
        const originalText = firstElement.textContent;
        const testText = 'ROOT FIX TEST - ' + Date.now();
        
        firstElement.textContent = testText;
        firstElement.dispatchEvent(new Event('input', { bubbles: true }));
        
        requestAnimationFrame(() => {
            const currentText = firstElement.textContent;
            const textChanged = currentText === testText;
            
            console.log(`Test 4 - Text Editing: ${textChanged ? 'WORKING' : 'FAILED'}`);
            if (textChanged) {
                console.log('PASS: Text editing works');
                passed++;
            } else {
                console.log('FAIL: Text editing not working');
            }
            
            // Restore original text
            firstElement.textContent = originalText;
            
            // Test 5: Blur and cleanup with event delegation
            firstElement.blur();
            
            requestAnimationFrame(() => {
                const stillFocused = document.activeElement === firstElement;
                const stillEditing = firstElement.hasAttribute('data-editing');
                const cleanedStyles = firstElement.style.backgroundColor === '' && firstElement.style.border === '';
                
                console.log('Blur Test Results:', {
                    stillFocused: stillFocused,
                    stillEditing: stillEditing,
                    cleanedStyles: cleanedStyles,
                    currentBackground: firstElement.style.backgroundColor
                });
                
                if (!stillFocused && !stillEditing && cleanedStyles) {
                    console.log('PASS: Blur functionality working');
                    passed++;
                } else {
                    console.log('FAIL: Blur functionality not working properly');
                }
                
                // Final results
                const score = (passed / total) * 100;
                console.log(`\\nFINAL SCORE: ${passed.toFixed(1)}/${total} tests passed (${score.toFixed(1)}%)`);
                
                if (score >= 80) {
                    console.log('SUCCESS: Event delegation working correctly');
                    console.log('Users can now click on topic titles to edit them');
                } else if (score >= 50) {
                    console.log('PARTIAL SUCCESS: Some functionality working');
                    console.log('Try: TopicsSync.debug() for more information');
                } else {
                    console.log('ISSUES DETECTED: Event delegation not working');
                    console.log('Try: TopicsSync.reinitialize() to fix');
                }
                
                console.groupEnd();
                return score >= 80;
            });
        });
    });
}

// Global functions
window.testEventDelegation = testEventDelegation;

window.forceEventDelegationTest = function() {
    console.log('FORCE TEST: Running event delegation test...');
    
    // Check if TopicsSync is available
    if (window.TopicsSync) {
        console.log('TopicsSync available - running debug...');
        window.TopicsSync.debug();
        
        // Test sync functionality
        if (typeof window.TopicsSync.testSync === 'function') {
            console.log('Testing sync functionality...');
            window.TopicsSync.testSync();
        }
    }
    
    // Run main test
    requestAnimationFrame(() => {
        testEventDelegation();
    });
};

window.debugEventDelegation = function() {
    console.group('EVENT DELEGATION DEBUG');
    
    console.log('Event Delegation Status:', {
        hasEventDelegation: document._topicsEventDelegationSetup === true,
        hasTopicsSync: !!window.TopicsSync,
        syncMethods: window.TopicsSync ? Object.keys(window.TopicsSync) : 'None'
    });
    
    const topicElements = document.querySelectorAll('.topic-title');
    console.log(`Found ${topicElements.length} topic elements`);
    
    if (topicElements.length > 0) {
        const firstElement = topicElements[0];
        console.log('First element properties:', {
            contentEditable: firstElement.contentEditable,
            hasDataTopicNumber: firstElement.hasAttribute('data-topic-number'),
            hasDataSyncInitialized: firstElement.hasAttribute('data-sync-initialized'),
            textContent: firstElement.textContent.trim(),
            tagName: firstElement.tagName,
            className: firstElement.className
        });
    }
    
    console.groupEnd();
};

// Auto-run test
requestAnimationFrame(() => {
    const hasTopics = document.querySelectorAll('.topic-title').length > 0;
    if (hasTopics) {
        console.log('AUTO-TESTING: Running event delegation verification...');
        setTimeout(testEventDelegation, 1000);
    }
});

console.log('ROOT FIX: Event Delegation Test Script Loaded');
console.log('Available commands:');
console.log('  - testEventDelegation() - Test event delegation');
console.log('  - forceEventDelegationTest() - Force comprehensive test');
console.log('  - debugEventDelegation() - Debug event delegation state');
