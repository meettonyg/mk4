// Copy and paste this entire block into your browser console

(function() {
    console.log('=== LOADING DELETE BUTTON DEBUG ===');
    
    // First, find the plugin path
    let pluginPath = '';
    
    // Try various sources
    if (window.guestifyData?.pluginUrl) {
        pluginPath = window.guestifyData.pluginUrl;
    } else if (window.gmkb_data?.plugin_url) {
        pluginPath = window.gmkb_data.plugin_url;
    } else if (window.guestifyMediaKitBuilder?.pluginUrl) {
        pluginPath = window.guestifyMediaKitBuilder.pluginUrl;
    } else {
        // Try to extract from a script src
        const scripts = document.querySelectorAll('script[src]');
        for (let script of scripts) {
            if (script.src.includes('guestify-media-kit-builder')) {
                const match = script.src.match(/(.*\/guestify-media-kit-builder\/)/);
                if (match) {
                    pluginPath = match[1];
                    break;
                }
            }
        }
    }
    
    console.log('Found plugin path:', pluginPath || 'NOT FOUND');
    
    if (pluginPath) {
        // Ensure it ends with /
        if (!pluginPath.endsWith('/')) pluginPath += '/';
        
        // Try to load the debug script
        const script = document.createElement('script');
        script.src = pluginPath + 'debug-delete-enhanced.js';
        script.onload = () => console.log('Debug script loaded successfully!');
        script.onerror = () => {
            console.error('Failed to load debug script from:', script.src);
            console.log('Loading inline debug code instead...');
            loadInlineDebug();
        };
        document.head.appendChild(script);
    } else {
        console.log('Could not find plugin path, loading inline debug...');
        loadInlineDebug();
    }
    
    function loadInlineDebug() {
        // Inline version of the debug script
        console.log('=== Enhanced Delete Button Debug (Inline) ===');

        // Override duplicateComponent to catch any calls
        if (window.componentManager) {
            const originalDuplicate = window.componentManager.duplicateComponent;
            window.componentManager.duplicateComponent = async function(sourceComponentId) {
                console.error('!!! DUPLICATE COMPONENT CALLED UNEXPECTEDLY !!!');
                console.error('This should not happen when delete is clicked');
                console.error('Source component:', sourceComponentId);
                console.error('Stack trace:', new Error().stack);
                // Call original
                return originalDuplicate.call(this, sourceComponentId);
            };
        }

        // Add a global click listener to catch ALL control button clicks
        let clickCount = 0;
        document.addEventListener('click', function(e) {
            if (e.target.closest('.control-btn')) {
                clickCount++;
                const btn = e.target.closest('.control-btn');
                console.log(`\n=== GLOBAL CLICK HANDLER #${clickCount} ===`);
                console.log('Event phase:', e.eventPhase === 1 ? 'CAPTURE' : e.eventPhase === 2 ? 'TARGET' : 'BUBBLE');
                console.log('Button title:', btn.title);
                console.log('Button text:', btn.textContent);
                console.log('Button HTML:', btn.innerHTML);
                console.log('Is delete button?', btn.title === 'Delete' || btn.textContent.trim() === '×');
            }
        }, true); // Capture phase

        // Test function to check current components
        window.debugCheckComponents = function() {
            console.log('\n=== CURRENT COMPONENTS ===');
            const components = document.querySelectorAll('[data-component-id]');
            components.forEach((comp, index) => {
                console.log(`${index + 1}. ${comp.getAttribute('data-component-type')} - ID: ${comp.getAttribute('data-component-id')}`);
            });
            
            // Check state
            if (window.stateManager) {
                const state = window.stateManager.getState();
                console.log('\nComponents in state:', Object.keys(state.components).length);
            }
        };

        console.log('\n=== Debug loaded (inline) ===');
        console.log('1. Click any delete button to see what happens');
        console.log('2. Run debugCheckComponents() to see current state');
        console.log('\nWatching for clicks...');
        
        // Initial check
        setTimeout(() => {
            window.debugCheckComponents();
        }, 500);
    }
})();
