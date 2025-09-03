/**
 * ROOT FIX: Clean bloated state and enable bi-directional sync
 * Addresses both state size and sync issues
 */

(function() {
    'use strict';
    
    console.log('🔧 ROOT FIX: Cleaning state and fixing sync...');
    
    // PART 1: Clean the bloated state
    const state = window.enhancedStateManager.getState();
    const originalSize = JSON.stringify(state).length;
    console.log(`📊 Original state size: ${(originalSize/1024).toFixed(2)}KB`);
    
    // Find what's bloating the state
    if (state.components) {
        Object.keys(state.components).forEach(id => {
            const comp = state.components[id];
            
            // Remove all non-essential data
            const cleanComp = {
                id: comp.id,
                type: comp.type,
                props: {},
                sectionId: comp.sectionId
            };
            
            // Keep only the actual content
            if (comp.type === 'topics' && comp.props) {
                // Extract just the topic titles
                cleanComp.props.topics = [];
                for (let i = 1; i <= 5; i++) {
                    if (comp.props[`topic_${i}`]) {
                        cleanComp.props.topics.push(comp.props[`topic_${i}`]);
                    } else if (comp.props.topics && comp.props.topics[i-1]) {
                        cleanComp.props.topics.push(comp.props.topics[i-1]);
                    }
                }
            } else if (comp.type === 'hero') {
                cleanComp.props = {
                    title: comp.props?.title || '',
                    subtitle: comp.props?.subtitle || '',
                    description: comp.props?.description || ''
                };
            }
            
            // Replace with clean version
            state.components[id] = cleanComp;
        });
    }
    
    // Remove duplicate fields
    delete state.saved_components;
    delete state.history;
    delete state.undoStack;
    delete state.redoStack;
    
    // Update state directly
    window.enhancedStateManager.state = state;
    
    const newSize = JSON.stringify(state).length;
    console.log(`✅ New state size: ${(newSize/1024).toFixed(2)}KB (reduced ${((originalSize-newSize)/1024).toFixed(2)}KB)`);
    
    // PART 2: Fix the bi-directional sync
    // Wait for the editor to be ready
    setTimeout(() => {
        const componentId = 'topics-1756841493193-1';
        
        // Find the actual inputs in Phase 2 UI
        const editorContainer = document.querySelector('.topic-editor__list, #topics-editor-list');
        if (!editorContainer) {
            console.error('❌ Topics editor not found');
            return;
        }
        
        const inputs = editorContainer.querySelectorAll('.topic-input');
        const previewItems = document.querySelectorAll(`[data-component-id="${componentId}"] h4`);
        
        console.log(`📝 Found ${inputs.length} sidebar inputs`);
        console.log(`🎨 Found ${previewItems.length} preview items`);
        
        if (inputs.length > 0 && previewItems.length > 0) {
            // Set up manual bi-directional sync
            inputs.forEach((input, index) => {
                if (previewItems[index]) {
                    // Clear old listeners
                    const newInput = input.cloneNode(true);
                    input.parentNode.replaceChild(newInput, input);
                    
                    // Sidebar → Preview
                    newInput.addEventListener('input', function() {
                        previewItems[index].textContent = this.value;
                        console.log(`✏️ Synced to preview: ${this.value}`);
                    });
                    
                    // Make preview editable
                    previewItems[index].setAttribute('contenteditable', 'true');
                    previewItems[index].style.cursor = 'text';
                    
                    // Preview → Sidebar
                    previewItems[index].addEventListener('blur', function() {
                        newInput.value = this.textContent.trim();
                        newInput.dispatchEvent(new Event('input', { bubbles: true }));
                        console.log(`✏️ Synced to sidebar: ${this.textContent.trim()}`);
                    });
                    
                    // Visual feedback
                    previewItems[index].addEventListener('focus', function() {
                        this.style.outline = '2px solid #3b82f6';
                        this.style.borderRadius = '4px';
                        this.style.padding = '2px 6px';
                    });
                    
                    previewItems[index].addEventListener('blur', function() {
                        this.style.outline = '';
                        this.style.padding = '';
                    });
                }
            });
            
            console.log('✅ Bi-directional sync enabled!');
            console.log('📝 Try editing in either sidebar or preview');
        }
    }, 500);
    
    // Force save the cleaned state
    document.dispatchEvent(new CustomEvent('gmkb:save-requested', {
        detail: { source: 'state-cleanup' }
    }));
    
})();
