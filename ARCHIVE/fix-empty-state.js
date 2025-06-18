/**
 * Quick fix to show empty state and add component functionality
 * Run this in the browser console if empty state is hidden
 */

(function() {
    console.log('=== APPLYING EMPTY STATE FIX ===');
    
    // Find or create empty state
    let emptyState = document.getElementById('empty-state');
    const preview = document.getElementById('media-kit-preview');
    
    if (!preview) {
        console.error('Preview container not found!');
        return;
    }
    
    // Check if there are any components
    const hasComponents = preview.querySelector('[data-component-id]');
    
    if (!hasComponents) {
        console.log('No components found, ensuring empty state is visible...');
        
        // Remove has-components class
        preview.classList.remove('has-components');
        
        if (!emptyState) {
            console.log('Creating empty state...');
            // Create empty state manually
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.id = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-state__icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <line x1="9" y1="13" x2="15" y2="13"></line>
                        <line x1="9" y1="17" x2="11" y2="17"></line>
                    </svg>
                </div>
                <h2 class="empty-state__title">Start Building Your Media Kit</h2>
                <p class="empty-state__text">Add components from the sidebar or choose a template to get started.</p>
                <div class="empty-state__actions">
                    <button class="btn btn--primary" id="add-first-component">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Component
                    </button>
                    <button class="btn btn--secondary" id="load-template">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        Load Template
                    </button>
                </div>
            `;
            preview.appendChild(emptyState);
        }
        
        // Force it visible with highest priority
        emptyState.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            z-index: 1 !important;
        `;
        
        // Setup button handlers
        const addBtn = emptyState.querySelector('#add-first-component');
        const templateBtn = emptyState.querySelector('#load-template');
        
        if (addBtn) {
            addBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Add component clicked - opening library');
                document.dispatchEvent(new CustomEvent('show-component-library'));
            };
        }
        
        if (templateBtn) {
            templateBtn.onclick = (e) => {
                e.preventDefault();
                console.log('Load template clicked - opening library');
                document.dispatchEvent(new CustomEvent('show-template-library'));
            };
        }
        
        console.log('Empty state is now visible with buttons attached');
        
        // Also try to fix the renderer
        if (window.componentRenderer) {
            window.componentRenderer.updateEmptyState();
        }
    } else {
        console.log('Components exist, empty state not needed');
    }
})();
