/**
 * Auto-Fix Topics Bi-Directional Sync
 * This runs automatically when the design panel opens
 */

(function() {
    'use strict';
    
    let syncInitialized = false;
    
    function setupTopicsSync() {
        // Prevent duplicate initialization
        if (syncInitialized) return;
        
        // Check if we're in the topics design panel
        const panel = document.getElementById('element-editor');
        if (!panel) return;
        
        const panelTitle = panel.querySelector('.element-editor__title');
        if (!panelTitle || !panelTitle.textContent.includes('Speaking Topics')) return;
        
        console.log('🔧 Setting up Topics Bi-Directional Sync...');
        
        // Find the topics component
        const topicsComponent = document.querySelector('[data-component-type="topics"]');
        const componentId = topicsComponent?.getAttribute('data-component-id');
        
        if (!componentId) return;
        
        // Small delay to ensure panel is fully rendered
        setTimeout(() => {
            const sidebarInputs = panel.querySelectorAll('input[type="text"]:not([type="hidden"]):not([readonly])');
            const previewItems = document.querySelectorAll(`[data-component-id="${componentId}"] h4`);
            
            if (sidebarInputs.length === 0 || previewItems.length === 0) return;
            
            console.log(`📝 Syncing ${sidebarInputs.length} topics`);
            
            sidebarInputs.forEach((input, index) => {
                if (previewItems[index]) {
                    const previewItem = previewItems[index];
                    
                    // Remove old listeners by cloning
                    const newInput = input.cloneNode(true);
                    input.parentNode.replaceChild(newInput, input);
                    
                    // SIDEBAR → PREVIEW
                    newInput.addEventListener('input', function() {
                        previewItem.textContent = this.value;
                    });
                    
                    // Make preview editable
                    previewItem.setAttribute('contenteditable', 'true');
                    previewItem.style.cursor = 'text';
                    
                    // PREVIEW → SIDEBAR
                    previewItem.addEventListener('blur', function() {
                        newInput.value = this.textContent.trim();
                        newInput.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                    
                    // Visual feedback
                    previewItem.addEventListener('focus', function() {
                        this.style.outline = '2px solid #3b82f6';
                        this.style.borderRadius = '4px';
                        this.style.padding = '2px 6px';
                        this.style.marginLeft = '-6px';
                    });
                    
                    previewItem.addEventListener('blur', function() {
                        this.style.outline = '';
                        this.style.padding = '';
                        this.style.marginLeft = '';
                    });
                    
                    // Enter to save
                    previewItem.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            this.blur();
                        }
                    });
                }
            });
            
            syncInitialized = true;
            console.log('✅ Topics bi-directional sync active!');
        }, 300);
    }
    
    // Listen for design panel events
    document.addEventListener('designPanelLoaded', (event) => {
        if (event.detail && event.detail.component === 'topics') {
            syncInitialized = false; // Reset for new panel
            setupTopicsSync();
        }
    });
    
    document.addEventListener('gmkb:design-panel-opened', (event) => {
        if (event.detail && event.detail.componentType === 'topics') {
            syncInitialized = false; // Reset for new panel
            setupTopicsSync();
        }
    });
    
    // Try to set up if panel is already open
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupTopicsSync);
    } else {
        setupTopicsSync();
    }
    
    // Expose manual trigger
    window.fixTopicsSync = () => {
        syncInitialized = false;
        setupTopicsSync();
    };
    
})();
