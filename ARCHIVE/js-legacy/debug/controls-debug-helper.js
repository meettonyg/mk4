/**
 * Debug helper for component controls visibility
 * Run this script to enable debug mode and make controls always visible
 */

window.enableControlsDebug = function() {
    console.log('🔍 Enabling controls debug mode...');
    
    // Add debug class to body
    document.body.classList.add('gmkb-debug-mode');
    document.body.classList.add('controls-debug');
    
    // Load debug CSS if not already loaded
    const debugCssId = 'gmkb-debug-controls-css';
    if (!document.getElementById(debugCssId)) {
        const link = document.createElement('link');
        link.id = debugCssId;
        link.rel = 'stylesheet';
        link.href = window.guestifyData?.pluginUrl ? 
            window.guestifyData.pluginUrl + 'css/debug-controls.css' : 
            '/wp-content/plugins/guestify-media-kit/css/debug-controls.css';
        document.head.appendChild(link);
        console.log('✅ Debug CSS loaded');
    }
    
    // Force show all controls
    const allControls = document.querySelectorAll('.component-controls--dynamic');
    allControls.forEach(controls => {
        controls.style.visibility = 'visible';
        controls.style.opacity = '0.7';
        controls.style.pointerEvents = 'all';
    });
    
    console.log(`✅ Controls debug mode enabled. Found ${allControls.length} control groups.`);
    console.log('Controls should now be visible with red dotted borders.');
    
    // Check for components without controls
    const componentsWithoutControls = [];
    document.querySelectorAll('[data-component-id]').forEach(component => {
        if (!component.querySelector('.component-controls--dynamic')) {
            componentsWithoutControls.push(component.id || component.getAttribute('data-component-id'));
        }
    });
    
    if (componentsWithoutControls.length > 0) {
        console.warn('⚠️ Components without controls:', componentsWithoutControls);
        console.log('Attempting to attach controls to components without them...');
        
        // Try to attach controls
        if (window.componentControlsManager) {
            componentsWithoutControls.forEach(componentId => {
                const element = document.getElementById(componentId);
                if (element) {
                    window.componentControlsManager.attachControls(element, componentId);
                }
            });
        }
    }
    
    return {
        debugEnabled: true,
        controlsFound: allControls.length,
        componentsWithoutControls: componentsWithoutControls.length
    };
};

window.disableControlsDebug = function() {
    console.log('🔍 Disabling controls debug mode...');
    
    // Remove debug classes
    document.body.classList.remove('gmkb-debug-mode');
    document.body.classList.remove('controls-debug');
    
    // Reset control styles
    const allControls = document.querySelectorAll('.component-controls--dynamic');
    allControls.forEach(controls => {
        controls.style.visibility = '';
        controls.style.opacity = '';
        controls.style.pointerEvents = '';
    });
    
    console.log('✅ Controls debug mode disabled');
};

// Auto-enable debug mode if URL contains ?debug=controls
if (window.location.search.includes('debug=controls')) {
    setTimeout(() => {
        window.enableControlsDebug();
    }, 2000); // Wait for everything to load
}

console.log('Controls debug helper loaded. Use window.enableControlsDebug() to enable debug mode.');
