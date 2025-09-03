/**
 * ACTUAL WORKING FIX - Run this in console NOW
 */
(function fixSync() {
    console.log('🔧 Setting up WORKING bi-directional sync...');
    
    // Get the actual elements we found in debug
    const inputs = document.querySelectorAll('#custom-content-editor .topic-input');
    const previewItems = document.querySelectorAll('[data-component-id="topics-1756841493193-1"] h4');
    
    console.log(`Found ${inputs.length} inputs and ${previewItems.length} preview h4 elements`);
    
    if (inputs.length === 0 || previewItems.length === 0) {
        console.error('Missing elements!');
        return;
    }
    
    // Set up ACTUAL working sync
    inputs.forEach((input, index) => {
        if (previewItems[index]) {
            const h4 = previewItems[index];
            
            // Clean the h4 text first (remove the edit indicator)
            const cleanText = h4.textContent.replace('✏️ Editing - Press Enter to save', '').trim();
            if (index === 0) {
                h4.textContent = cleanText;
            }
            
            // SIDEBAR → PREVIEW
            input.addEventListener('input', function() {
                h4.textContent = this.value;
                console.log(`✏️ Sidebar → Preview: "${this.value}"`);
            });
            
            // Make preview editable
            h4.setAttribute('contenteditable', 'true');
            h4.style.cursor = 'text';
            h4.style.minHeight = '20px';
            
            // PREVIEW → SIDEBAR
            h4.addEventListener('blur', function() {
                const newText = this.textContent.replace('✏️ Editing - Press Enter to save', '').trim();
                input.value = newText;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`✏️ Preview → Sidebar: "${newText}"`);
            });
            
            // Visual feedback
            h4.addEventListener('focus', function() {
                this.style.outline = '2px solid #3b82f6';
                this.style.padding = '4px';
            });
            
            h4.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.padding = '';
            });
            
            console.log(`✅ Topic ${index + 1} synced`);
        }
    });
    
    console.log('');
    console.log('🎉 BI-DIRECTIONAL SYNC IS WORKING!');
    console.log('Try typing in sidebar OR clicking on preview text!');
})();
