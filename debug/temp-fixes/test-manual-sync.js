/**
 * IMMEDIATE Console Fix for Bi-Directional Sync
 * Run this in console to test if sync CAN work with proper selectors
 */

(function testSync() {
    console.log('=== TESTING SYNC CAPABILITY ===');
    
    // 1. Find the editor container
    const editorContainer = document.querySelector('#custom-content-editor');
    console.log('Editor container found:', !!editorContainer);
    
    if (editorContainer) {
        // 2. Find the inputs
        const inputs = editorContainer.querySelectorAll('.topic-input');
        console.log(`Found ${inputs.length} topic inputs`);
        
        // 3. Find preview items
        const previewItems = document.querySelectorAll('.gmkb-topics__item h4, .topic-title');
        console.log(`Found ${previewItems.length} preview items`);
        
        // 4. Set up manual sync
        if (inputs.length > 0 && previewItems.length > 0) {
            inputs.forEach((input, i) => {
                if (previewItems[i]) {
                    // Clear old events
                    const newInput = input.cloneNode(true);
                    input.parentNode.replaceChild(newInput, input);
                    
                    // Sidebar to preview
                    newInput.addEventListener('input', function() {
                        previewItems[i].textContent = this.value;
                        console.log(`Synced to preview: ${this.value}`);
                    });
                    
                    // Make preview editable
                    previewItems[i].setAttribute('contenteditable', 'true');
                    previewItems[i].style.cursor = 'text';
                    
                    // Preview to sidebar
                    previewItems[i].addEventListener('blur', function() {
                        newInput.value = this.textContent.trim();
                        newInput.dispatchEvent(new Event('input', {bubbles: true}));
                        console.log(`Synced to sidebar: ${this.textContent.trim()}`);
                    });
                }
            });
            
            console.log('✅ SYNC IS WORKING! Try editing in either place.');
        } else {
            console.log('❌ Cannot set up sync - missing elements');
        }
    } else {
        console.log('❌ Editor container not found - open Topics editor first');
    }
})();
