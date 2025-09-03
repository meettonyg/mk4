/**
 * Phase 2 Topics Bi-Directional Sync Fix
 * This works with the new Component Options UI
 */

(function() {
    'use strict';
    
    console.log('🔧 Phase 2 Topics Sync Fix loading...');
    
    let syncActive = false;
    
    function setupPhase2Sync() {
        // Prevent duplicate setup
        if (syncActive) return;
        
        console.log('🔍 Looking for Phase 2 topics editor...');
        
        // Find the Phase 2 options panel
        const optionsPanel = document.querySelector('.component-options__content');
        if (!optionsPanel) {
            console.log('⚠️ Phase 2 options panel not found');
            return;
        }
        
        // Check if this is the topics editor
        const editorTitle = optionsPanel.querySelector('h3');
        if (!editorTitle || !editorTitle.textContent.includes('Topics')) {
            console.log('⚠️ Not in topics editor');
            return;
        }
        
        // Find the component ID
        const componentId = document.querySelector('[data-component-type="topics"]')?.getAttribute('data-component-id');
        if (!componentId) {
            console.log('⚠️ No topics component found');
            return;
        }
        
        console.log(`✅ Found topics component: ${componentId}`);
        
        // Get the topic input fields from Phase 2 UI
        const topicInputs = optionsPanel.querySelectorAll('.topic-editor__field input[type="text"]');
        
        // Get the preview items
        const previewItems = document.querySelectorAll(`[data-component-id="${componentId}"] .gmkb-topics__item h4, [data-component-id="${componentId}"] .topic-item h4`);
        
        console.log(`📝 Found ${topicInputs.length} topic inputs`);
        console.log(`🎨 Found ${previewItems.length} preview items`);
        
        if (topicInputs.length === 0 || previewItems.length === 0) {
            console.log('⚠️ Missing inputs or preview items');
            return;
        }
        
        // Set up bi-directional sync
        topicInputs.forEach((input, index) => {
            if (previewItems[index]) {
                const previewItem = previewItems[index];
                
                // Remove old listeners
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
                
                // SIDEBAR → PREVIEW
                newInput.addEventListener('input', function() {
                    previewItem.textContent = this.value;
                    console.log(`✏️ Phase 2 Sidebar → Preview: "${this.value}"`);
                });
                
                newInput.addEventListener('change', function() {
                    previewItem.textContent = this.value;
                });
                
                // Make preview editable
                previewItem.setAttribute('contenteditable', 'true');
                previewItem.style.cursor = 'text';
                previewItem.style.minHeight = '20px';
                
                // Visual feedback
                previewItem.addEventListener('focus', function() {
                    this.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    this.style.outline = '2px solid rgba(59, 130, 246, 0.4)';
                    this.style.borderRadius = '4px';
                    this.style.padding = '2px 6px';
                    this.style.marginLeft = '-6px';
                });
                
                previewItem.addEventListener('blur', function() {
                    this.style.backgroundColor = '';
                    this.style.outline = '';
                    this.style.padding = '';
                    this.style.marginLeft = '';
                });
                
                // PREVIEW → SIDEBAR  
                previewItem.addEventListener('input', function() {
                    newInput.value = this.textContent;
                    // Trigger Phase 2 update
                    newInput.dispatchEvent(new Event('input', { bubbles: true }));
                    newInput.dispatchEvent(new Event('change', { bubbles: true }));
                });
                
                previewItem.addEventListener('blur', function() {
                    newInput.value = this.textContent.trim();
                    newInput.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`✏️ Phase 2 Preview → Sidebar: "${this.textContent.trim()}"`);
                });
                
                // Enter to save
                previewItem.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.blur();
                    }
                });
                
                console.log(`✅ Topic ${index + 1}: Phase 2 bi-directional sync active`);
            }
        });
        
        syncActive = true;
        console.log('🎉 Phase 2 Topics Bi-Directional Sync is working!');
        console.log('📝 Try editing in either the sidebar or preview!');
    }
    
    // Listen for Phase 2 component selection
    document.addEventListener('gmkb:phase2-component-selected', (event) => {
        if (event.detail && event.detail.componentType === 'topics') {
            console.log('📋 Phase 2 topics selected, setting up sync...');
            syncActive = false;
            setTimeout(setupPhase2Sync, 300);
        }
    });
    
    // Also listen for the editor creation
    document.addEventListener('gmkb:editor-created', (event) => {
        if (event.detail && event.detail.type === 'topics') {
            console.log('📋 Topics editor created, setting up sync...');
            syncActive = false;
            setTimeout(setupPhase2Sync, 300);
        }
    });
    
    // Try to set up immediately if already in topics editor
    setTimeout(setupPhase2Sync, 500);
    
    // Also create a global function for manual triggering
    window.fixPhase2TopicsSync = () => {
        syncActive = false;
        setupPhase2Sync();
    };
    
    console.log('✅ Phase 2 Topics Sync Fix ready');
    console.log('💡 Run fixPhase2TopicsSync() to manually activate');
})();
