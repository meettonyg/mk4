// Quick fix for component rendering - Copy and paste this entire block into the console

(async () => {
    console.log('🚀 Applying component rendering fix...\n');
    
    // Step 1: Check if components exist in state but not in DOM
    const state = window.enhancedStateManager?.getState() || window.stateManager?.getState();
    const preview = document.getElementById('media-kit-preview');
    
    if (!state || !preview) {
        console.error('❌ Required elements not found!');
        return;
    }
    
    const componentsInState = Object.keys(state.components || {});
    const componentsInDOM = Array.from(preview.querySelectorAll('[data-component-id]')).map(el => el.id);
    
    console.log(`📊 Components in state: ${componentsInState.length}`);
    console.log(`📊 Components in DOM: ${componentsInDOM.length}`);
    
    if (componentsInState.length > componentsInDOM.length) {
        console.log('⚠️ State has more components than DOM - fixing...\n');
        
        // Step 2: Fix the renderer subscription
        const renderer = window.enhancedComponentRenderer || window.componentRenderer;
        const stateManager = window.enhancedStateManager || window.stateManager;
        
        if (renderer && stateManager) {
            // Re-subscribe to ensure renderer gets state changes
            if (renderer.stateUnsubscribe) {
                renderer.stateUnsubscribe();
            }
            
            renderer.stateUnsubscribe = stateManager.subscribeGlobal((newState) => {
                console.log('📢 State change detected');
                renderer.onStateChange(newState);
            });
            
            // Step 3: Force render missing components
            console.log('🎨 Forcing render of all components...');
            
            // Enable rendering
            renderer.disableRendering = false;
            
            // Trigger a full render by simulating all components as "added"
            const changes = {
                added: new Set(componentsInState),
                removed: new Set(),
                updated: new Set(),
                moved: new Set()
            };
            
            // Process the changes
            await renderer.processChanges(changes, state);
            
            // Update empty state
            const emptyState = document.getElementById('empty-state');
            if (emptyState && componentsInState.length > 0) {
                emptyState.style.display = 'none';
            }
            
            console.log('✅ Rendering fix applied!');
            
            // Step 4: Verify
            setTimeout(() => {
                const newComponentsInDOM = preview.querySelectorAll('[data-component-id]').length;
                console.log(`\n✅ Components now in DOM: ${newComponentsInDOM}`);
                
                if (newComponentsInDOM === componentsInState.length) {
                    console.log('🎉 All components rendered successfully!');
                } else {
                    console.log('⚠️ Some components may still be missing. Try refreshing the page.');
                }
            }, 1000);
        }
    } else if (componentsInState.length === 0) {
        console.log('ℹ️ No components in state. Add a component to test.');
    } else {
        console.log('✅ All components are already rendered!');
    }
})();
