// IMMEDIATE FIX - RUN THIS IN CONSOLE NOW!
(function() {
    const optionsPanel = document.querySelector('.component-options__content');
    if (!optionsPanel) {
        console.error('Open the Topics editor first!');
        return;
    }
    
    const componentId = document.querySelector('[data-component-type="topics"]')?.id;
    const inputs = optionsPanel.querySelectorAll('.topic-editor__field input[type="text"]');
    const items = document.querySelectorAll(`#${componentId} h4`);
    
    console.log(`Setting up sync for ${inputs.length} topics...`);
    
    Array.from(inputs).forEach((input, i) => {
        if (items[i]) {
            // Clear old events
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Sidebar → Preview
            newInput.oninput = () => {
                items[i].textContent = newInput.value;
                console.log(`✏️ Updated preview: ${newInput.value}`);
            };
            
            // Preview → Sidebar
            items[i].contentEditable = true;
            items[i].style.cursor = 'text';
            items[i].onblur = function() {
                newInput.value = this.textContent.trim();
                newInput.dispatchEvent(new Event('change', {bubbles: true}));
                console.log(`✏️ Updated sidebar: ${this.textContent}`);
            };
            
            // Visual feedback
            items[i].onfocus = function() {
                this.style.outline = '2px solid #3b82f6';
                this.style.padding = '2px 6px';
            };
            items[i].addEventListener('blur', function() {
                this.style.outline = '';
                this.style.padding = '';
            });
        }
    });
    
    console.log('🎉 Bi-directional sync is NOW WORKING!');
    console.log('Try typing in sidebar or clicking topics in preview!');
})();