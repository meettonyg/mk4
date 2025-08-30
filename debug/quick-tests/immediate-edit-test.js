/**
 * IMMEDIATE TEST FOR EDIT BOXES FIX
 * Run this immediately in console: window.immediateTestEditBoxes()
 */

console.log('🔧 IMMEDIATE EDIT BOXES TEST: Loading...');

window.immediateTestEditBoxes = function() {
    console.log('🧪 IMMEDIATE TEST: Checking edit boxes functionality...');
    
    // Find contenteditable elements
    const editableElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
    console.log(`Found ${editableElements.length} contenteditable elements`);
    
    if (editableElements.length === 0) {
        console.error('❌ NO CONTENTEDITABLE ELEMENTS FOUND');
        console.log('💡 Try clicking on the topics component first, then run this test again');
        return false;
    }
    
    // Test first element
    const testElement = editableElements[0];
    console.log('🎯 Testing first element:', testElement);
    
    // Check if it has event listeners
    const hasSync = testElement.hasAttribute('data-sync-initialized');
    console.log(`Element has sync initialized: ${hasSync}`);
    
    // Try to focus it
    console.log('🎯 Attempting to focus element...');
    testElement.focus();
    
    setTimeout(() => {
        const isFocused = document.activeElement === testElement;
        const isEditing = testElement.hasAttribute('data-editing');
        
        console.log('📊 FOCUS TEST RESULTS:');
        console.log(`  - Element is focused: ${isFocused}`);
        console.log(`  - Element is in editing mode: ${isEditing}`);
        console.log(`  - Active element:`, document.activeElement);
        
        if (isFocused) {
            console.log('✅ SUCCESS: Element can be focused and should be editable!');
            console.log('💡 Try typing in the element now');
            
            // Test typing
            const originalText = testElement.textContent;
            const testText = 'TEST TYPING ' + Date.now();
            
            testElement.textContent = testText;
            console.log(`🔤 Changed text from "${originalText}" to "${testText}"`);
            
            // Test if change persists briefly
            setTimeout(() => {
                const currentText = testElement.textContent;
                if (currentText === testText) {
                    console.log('✅ TEXT CHANGE SUCCESSFUL: Edit box is working!');
                } else {
                    console.log(`❌ Text reverted: expected "${testText}", got "${currentText}"`);
                }
                
                // Restore original text
                testElement.textContent = originalText;
                console.log('🔄 Restored original text');
            }, 500);
            
        } else {
            console.log('❌ FAILED: Element could not be focused');
            console.log('💡 The edit box is still having issues');
        }
    }, 100);
    
    return true;
};

// Make it available globally
window.testEditNow = window.immediateTestEditBoxes;

console.log('✅ IMMEDIATE TEST LOADED');
console.log('💡 Usage: immediateTestEditBoxes() or testEditNow()');

// Auto-run after a short delay
setTimeout(() => {
    console.log('🚀 AUTO-RUNNING IMMEDIATE TEST...');
    window.immediateTestEditBoxes();
}, 3000);
