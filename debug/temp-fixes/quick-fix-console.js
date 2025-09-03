// RUN THIS IN YOUR CONSOLE NOW to immediately fix topics sync:

(function fixNow() {
    const panel = document.getElementById('element-editor');
    if (!panel) {
        console.error('Please open the Speaking Topics design panel first');
        return;
    }
    
    const componentId = document.querySelector('[data-component-type="topics"]')?.getAttribute('data-component-id');
    if (!componentId) {
        console.error('No topics component found');
        return;
    }
    
    const inputs = panel.querySelectorAll('input[type="text"]:not([readonly])');
    const items = document.querySelectorAll(`[data-component-id="${componentId}"] h4`);
    
    console.log(`Syncing ${inputs.length} inputs with ${items.length} preview items...`);
    
    inputs.forEach((input, i) => {
        if (items[i]) {
            // Clear old listeners
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Sidebar to preview
            newInput.oninput = () => items[i].textContent = newInput.value;
            
            // Make preview editable
            items[i].contentEditable = true;
            items[i].style.cursor = 'text';
            
            // Preview to sidebar
            items[i].onblur = () => {
                newInput.value = items[i].textContent.trim();
                newInput.dispatchEvent(new Event('input', {bubbles: true}));
            };
            
            // Visual feedback
            items[i].onfocus = () => {
                items[i].style.outline = '2px solid #3b82f6';
                items[i].style.padding = '2px 6px';
                items[i].style.marginLeft = '-6px';
            };
            
            items[i].onblur = function() {
                this.style.outline = '';
                this.style.padding = '';
                this.style.marginLeft = '';
                newInput.value = this.textContent.trim();
                newInput.dispatchEvent(new Event('input', {bubbles: true}));
            };
            
            console.log(`✅ Topic ${i+1} synced`);
        }
    });
    
    console.log('🎉 Topics sync is now working! Try editing in either place.');
})();