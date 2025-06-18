/**
 * Complete fix for empty state and error issues
 * This addresses both the disappearing empty state and the error toast
 */

console.log('=== APPLYING COMPREHENSIVE FIX ===');

// 1. Fix empty state visibility
(function fixEmptyState() {
    const preview = document.getElementById('media-kit-preview');
    const emptyState = document.getElementById('empty-state');
    
    if (!preview) {
        console.error('Preview container not found');
        return;
    }
    
    // Check if there are any components
    const hasComponents = preview.querySelector('[data-component-id]');
    
    if (!hasComponents) {
        console.log('No components found - fixing empty state...');
        
        // Remove has-components class
        preview.classList.remove('has-components');
        
        // Ensure empty state exists and is visible
        if (emptyState) {
            // Force visibility with maximum priority
            emptyState.style.cssText = `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
                z-index: 1 !important;
                width: 100%;
                text-align: center;
                padding: 60px 20px;
            `;
            
            // Re-attach event listeners
            const addBtn = document.getElementById('add-first-component');
            const templateBtn = document.getElementById('load-template');
            
            if (addBtn && !addBtn.hasAttribute('data-fixed')) {
                addBtn.setAttribute('data-fixed', 'true');
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Opening component library...');
                    document.dispatchEvent(new CustomEvent('show-component-library'));
                });
            }
            
            if (templateBtn && !templateBtn.hasAttribute('data-fixed')) {
                templateBtn.setAttribute('data-fixed', 'true');
                templateBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Opening template library...');
                    document.dispatchEvent(new CustomEvent('show-template-library'));
                });
            }
            
            console.log('Empty state fixed and buttons attached');
        } else {
            console.error('Empty state element not found in DOM');
        }
        
        // Fix the component renderer
        if (window.componentRenderer) {
            // Clear the skip flag
            window.componentRenderer.skipInitialRender = false;
            
            // Prevent it from hiding the empty state
            const originalUpdate = window.componentRenderer.updateEmptyState;
            window.componentRenderer.updateEmptyState = function() {
                const hasComps = this.previewContainer?.querySelector('[data-component-id]');
                if (!hasComps) {
                    const es = document.getElementById('empty-state');
                    if (es) {
                        es.style.cssText = 'display: block !important;';
                        this.setupEmptyState();
                    }
                } else {
                    originalUpdate.call(this);
                }
            };
        }
    }
})();

// 2. Fix error handling to prevent unnecessary toasts
(function fixErrorHandling() {
    // Remove existing error listeners that might be causing issues
    const oldErrorListeners = window.onerror;
    window.onerror = null;
    
    // Add a more selective error handler
    window.addEventListener('error', (e) => {
        // Log the error for debugging
        console.log('Error caught:', e.message, 'at', e.filename, 'line', e.lineno);
        
        // Common benign errors to ignore
        const benignErrors = [
            'ResizeObserver',
            'Non-Error promise rejection',
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications'
        ];
        
        // Check if it's a benign error
        const isBenign = benignErrors.some(err => 
            e.message?.includes(err) || e.error?.message?.includes(err)
        );
        
        if (!isBenign && e.error) {
            console.error('Actual error:', e.error);
        }
        
        // Prevent the default error toast for benign errors
        if (isBenign) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
    
    console.log('Error handling fixed - benign errors will be suppressed');
})();

// 3. Add helper to manually add first component
window.addFirstComponent = function(componentType = 'hero') {
    if (window.componentManager) {
        console.log(`Adding ${componentType} component...`);
        window.componentManager.addComponent(componentType).then(() => {
            console.log('Component added successfully');
        }).catch(err => {
            console.error('Failed to add component:', err);
        });
    } else {
        console.error('Component manager not available');
    }
};

console.log('=== FIX APPLIED ===');
console.log('Empty state should now be visible with working buttons');
console.log('Error toasts for benign errors should be suppressed');
console.log('To manually add a component, run: addFirstComponent("hero")');
