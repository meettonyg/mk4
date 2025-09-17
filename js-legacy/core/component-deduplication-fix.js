/**
 * Component Deduplication Fix
 * Prevents duplicate component rendering
 */

(function() {
    'use strict';
    
    console.log('🔧 Component Deduplication Fix: Initializing...');
    
    // Track all rendered components globally
    window.GMKB_RENDERED_COMPONENTS = window.GMKB_RENDERED_COMPONENTS || new Set();
    
    // Override component rendering to check for duplicates
    const originalRenderComponent = window.enhancedComponentRenderer?.renderComponent;
    if (originalRenderComponent) {
        window.enhancedComponentRenderer.renderComponent = async function(componentId, componentData) {
            // Check if already rendered
            if (window.GMKB_RENDERED_COMPONENTS.has(componentId)) {
                console.log(`⚠️ Skipping duplicate render of ${componentId}`);
                const existing = document.querySelector(`[data-component-id="${componentId}"]`);
                return existing;
            }
            
            // Check if exists in DOM already (PHP rendered)
            const existingInDOM = document.querySelector(`[data-component-id="${componentId}"]`);
            if (existingInDOM) {
                console.log(`✅ Component ${componentId} already in DOM (PHP rendered), skipping JS render`);
                window.GMKB_RENDERED_COMPONENTS.add(componentId);
                return existingInDOM;
            }
            
            // Render and track
            const result = await originalRenderComponent.call(this, componentId, componentData);
            window.GMKB_RENDERED_COMPONENTS.add(componentId);
            return result;
        };
    }
    
    // Clean up duplicate controls
    const cleanupDuplicateControls = () => {
        const components = document.querySelectorAll('[data-component-id]');
        components.forEach(component => {
            const controls = component.querySelectorAll('.gmkb-component__controls, .component-controls');
            if (controls.length > 1) {
                console.log(`🧹 Removing duplicate controls from ${component.dataset.componentId}`);
                // Keep first, remove rest
                for (let i = 1; i < controls.length; i++) {
                    controls[i].remove();
                }
            }
        });
    };
    
    // Run cleanup periodically
    setInterval(cleanupDuplicateControls, 2000);
    
    // Also cleanup on mutations
    const observer = new MutationObserver(() => {
        cleanupDuplicateControls();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Component Deduplication Fix: Ready');
    
})();
