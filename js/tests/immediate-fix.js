// IMMEDIATE FIX - Copy and paste this entire block into console

// Fix global managers
window.componentManager = window.enhancedComponentManager || window.componentManager;
window.stateManager = window.enhancedStateManager || window.stateManager;
window.componentRenderer = window.enhancedComponentRenderer || window.componentRenderer;

// Initialize if needed
(async function() {
    if (window.enhancedComponentManager && !window.enhancedComponentManager.initialized) {
        await window.enhancedComponentManager.init();
        console.log('✅ Component manager initialized');
    }
    
    if (window.enhancedComponentRenderer && !window.enhancedComponentRenderer.initialized) {
        window.enhancedComponentRenderer.init();
        console.log('✅ Component renderer initialized');
    }
    
    // Fix add component button
    const addBtn = document.getElementById('add-component-btn');
    if (addBtn && !addBtn.hasAttribute('data-fixed')) {
        addBtn.setAttribute('data-fixed', 'true');
        addBtn.onclick = () => document.dispatchEvent(new CustomEvent('show-component-library'));
        console.log('✅ Add Component button fixed');
    }
    
    // Fix load template button
    const loadBtn = document.getElementById('load-template');
    if (loadBtn && !loadBtn.hasAttribute('data-fixed')) {
        loadBtn.setAttribute('data-fixed', 'true');
        loadBtn.onclick = () => document.dispatchEvent(new CustomEvent('show-template-library'));
        console.log('✅ Load Template button fixed');
    }
    
    console.log('✨ Buttons should work now! Try clicking them.');
})();