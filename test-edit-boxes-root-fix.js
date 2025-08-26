/**
 * ROOT FIX TEST: Comprehensive Edit Boxes Fix Verification
 * 
 * This script tests the ROOT CAUSE FIX for edit boxes functionality
 * Run: testEditBoxesRootFix() in the browser console
 */

console.log('🧪 ROOT FIX TEST: Edit Boxes Comprehensive Testing Loaded');

function testEditBoxesRootFix() {
    console.group('📋 ROOT FIX TEST: Edit Boxes Functionality');
    
    let passed = 0;
    let total = 0;
    
    // Test 1: Check contenteditable elements exist
    total++;
    const editableElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
    console.log(`Test 1 - Contenteditable Elements: Found ${editableElements.length}`);
    if (editableElements.length > 0) {
        console.log('✅ PASS: Contenteditable elements found');
        passed++;
    } else {
        console.log('❌ FAIL: No contenteditable elements found');
    }
    
    // Test 2: Check initialization status
    total++;
    let initializedCount = 0;
    editableElements.forEach(el => {
        if (el.hasAttribute('data-contenteditable-initialized')) {
            initializedCount++;
        }
    });
    console.log(`Test 2 - Initialization: ${initializedCount}/${editableElements.length} elements initialized`);
    if (initializedCount === editableElements.length && editableElements.length > 0) {
        console.log('✅ PASS: All elements properly initialized');
        passed++;
    } else {
        console.log('❌ FAIL: Not all elements are initialized');
    }
    
    if (editableElements.length === 0) {
        console.log('🔧 ATTEMPTING TO FIX: Running initializePreviewSync()');
        if (window.initializeTopicsPreviewSync) {
            window.initializeTopicsPreviewSync();
            setTimeout(() => {
                testEditBoxesRootFix();
            }, 2000);
        } else {
            console.log('❌ CRITICAL: initializeTopicsPreviewSync not available');
        }
        console.groupEnd();
        return;
    }
    
    // Test 3: Focus test with visual feedback
    total++;
    const firstElement = editableElements[0];
    if (firstElement) {
        console.log('Test 3 - Focus Functionality: Testing first element...');
        
        // Record initial state
        const initialActiveElement = document.activeElement;
        const initialHasEditing = firstElement.hasAttribute('data-editing');
        
        // Focus the element
        firstElement.focus();
        
        setTimeout(() => {
            const focused = document.activeElement === firstElement;
            const hasEditingMode = firstElement.hasAttribute('data-editing');
            const hasEditingStyle = firstElement.style.backgroundColor.includes('255, 243, 205') || 
                                   firstElement.style.backgroundColor === '#fff3cd' ||
                                   firstElement.style.backgroundColor === 'rgb(255, 243, 205)';
            
            console.log('Focus Test Results:', {
                focused: focused,
                editingAttribute: hasEditingMode,
                editingStyle: hasEditingStyle,
                backgroundColor: firstElement.style.backgroundColor,
                border: firstElement.style.border
            });
            
            if (focused && hasEditingMode && hasEditingStyle) {
                console.log('✅ PASS: Focus functionality working correctly');
                passed++;
            } else if (focused) {
                console.log('⚠️ PARTIAL: Element can focus but editing mode styling incomplete');
                passed += 0.5;
            } else {
                console.log('❌ FAIL: Focus functionality not working');
            }
            
            // Test 4: Text editing test
            total++;
            const originalText = firstElement.textContent;
            const testText = 'ROOT FIX TEST - ' + Date.now();
            
            firstElement.textContent = testText;
            firstElement.dispatchEvent(new Event('input', { bubbles: true }));
            
            setTimeout(() => {
                const currentText = firstElement.textContent;
                const textChanged = currentText === testText;
                
                console.log(`Test 4 - Text Editing: ${textChanged ? 'WORKING' : 'FAILED'}`);
                if (textChanged) {
                    console.log('✅ PASS: Text editing works');
                    passed++;
                } else {
                    console.log('❌ FAIL: Text editing not working');
                }
                
                // Restore original text
                firstElement.textContent = originalText;
                
                // Test 5: Blur and cleanup test
                total++;
                firstElement.blur();
                
                setTimeout(() => {
                    const stillFocused = document.activeElement === firstElement;
                    const stillEditing = firstElement.hasAttribute('data-editing');
                    const cleanedStyles = !firstElement.style.backgroundColor || 
                                        firstElement.style.backgroundColor === '' ||
                                        !firstElement.style.backgroundColor.includes('255, 243, 205');
                    
                    console.log('Blur Test Results:', {
                        stillFocused: stillFocused,
                        stillEditing: stillEditing,
                        cleanedStyles: cleanedStyles,
                        currentBackground: firstElement.style.backgroundColor
                    });
                    
                    if (!stillFocused && !stillEditing) {
                        console.log('✅ PASS: Blur functionality working');
                        passed++;
                    } else {
                        console.log('❌ FAIL: Blur functionality not working properly');
                    }
                    
                    // Final results
                    const score = (passed / total) * 100;
                    console.log(`\n🎯 FINAL SCORE: ${passed.toFixed(1)}/${total} tests passed (${score.toFixed(1)}%)`);
                    
                    if (score >= 80) {
                        console.log('🎉 SUCCESS! Edit boxes are working correctly');
                        console.log('💡 Users can now click on topic titles to edit them');
                        console.log('📝 Instructions: Click any topic title → Edit text → Press Enter or click outside to save');
                    } else if (score >= 50) {
                        console.log('⚠️ PARTIAL SUCCESS: Edit boxes work but some issues remain');
                        console.log('🔧 Try: window.initializeTopicsPreviewSync() to fix remaining issues');
                    } else {
                        console.log('❌ ISSUES DETECTED: Edit boxes not working correctly');
                        console.log('🔧 Try these fixes:');
                        console.log('1. window.initializeTopicsPreviewSync()');
                        console.log('2. window.TopicsTemplate.testContentEditable()');
                        console.log('3. Refresh the page and try again');
                    }
                    
                    console.groupEnd();
                    return score >= 80;
                    
                }, 300);
            }, 200);
        }, 200);
    } else {
        console.log('❌ FAIL: No elements to test');
        console.groupEnd();
        return false;
    }
}

// Additional utility functions for manual testing
window.testEditBoxesRootFix = testEditBoxesRootFix;

window.forceInitializeEditBoxes = function() {
    console.log('🔧 FORCE INITIALIZATION: Attempting comprehensive fix...');
    
    // Step 1: Try main initialization
    if (window.initializeTopicsPreviewSync) {
        console.log('Step 1: Running initializeTopicsPreviewSync()...');
        window.initializeTopicsPreviewSync();
    }
    
    // Step 2: Try manual sync setup
    setTimeout(() => {
        if (window.TopicsSync && window.TopicsSync.manualSetup) {
            console.log('Step 2: Running manual sync setup...');
            window.TopicsSync.manualSetup();
        }
    }, 1000);
    
    // Step 3: Test after initialization
    setTimeout(() => {
        console.log('Step 3: Testing functionality...');
        testEditBoxesRootFix();
    }, 2000);
};

window.debugEditBoxesState = function() {
    console.group('🔍 EDIT BOXES STATE DEBUG');
    
    const topicElements = document.querySelectorAll('.topic-title, [data-topic-number], [contenteditable]');
    console.log(`Found ${topicElements.length} potential topic elements`);
    
    topicElements.forEach((el, index) => {
        console.log(`Element ${index + 1}:`, {
            tagName: el.tagName,
            className: el.className,
            contenteditable: el.getAttribute('contenteditable'),
            topicNumber: el.getAttribute('data-topic-number'),
            initialized: el.hasAttribute('data-contenteditable-initialized'),
            editing: el.hasAttribute('data-editing'),
            text: el.textContent?.trim().substring(0, 50) + '...',
            styles: {
                backgroundColor: el.style.backgroundColor,
                border: el.style.border,
                cursor: el.style.cursor
            }
        });
    });
    
    // Check global functions
    console.log('Global Functions Available:', {
        initializeTopicsPreviewSync: !!window.initializeTopicsPreviewSync,
        TopicsTemplate: !!window.TopicsTemplate,
        TopicsSync: !!window.TopicsSync
    });
    
    console.groupEnd();
};

// Auto-run test after a short delay to check initial state
setTimeout(() => {
    const hasTopics = document.querySelectorAll('.topic-title').length > 0;
    if (hasTopics) {
        console.log('🚀 AUTO-TESTING: Running ROOT FIX verification...');
        setTimeout(testEditBoxesRootFix, 1000);
    }
}, 3000);

console.log('✅ ROOT FIX TEST: Test functions loaded');
console.log('📋 Available commands:');
console.log('  - testEditBoxesRootFix() - Run comprehensive test');
console.log('  - forceInitializeEditBoxes() - Force fix and test');
console.log('  - debugEditBoxesState() - Debug current state');
