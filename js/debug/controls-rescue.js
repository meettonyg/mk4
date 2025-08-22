/**
 * Quick fix to restore controls after they disappear from updates
 * Run this whenever controls stop appearing
 */

window.restoreControls = function() {
    console.log('🔧 Restoring controls to all components...');
    
    const components = document.querySelectorAll('[data-component-id]');
    let restoredCount = 0;
    
    components.forEach(component => {
        const componentId = component.getAttribute('data-component-id') || component.id;
        const hasControls = component.querySelector('.component-controls--dynamic');
        
        if (!hasControls && componentId) {
            // Re-attach controls
            if (window.componentControlsManager) {
                const success = window.componentControlsManager.attachControls(component, componentId);
                if (success) {
                    restoredCount++;
                    console.log('✅ Restored controls to:', componentId);
                }
            }
        }
    });
    
    console.log(`✅ Restored controls to ${restoredCount} components`);
    
    // Also fix any controls that exist but aren't working
    const allControls = document.querySelectorAll('.component-controls--dynamic');
    allControls.forEach(controls => {
        // Ensure they're not hidden
        if (controls.style.visibility === 'hidden') {
            controls.style.visibility = 'visible';
        }
        // Reset opacity to be controlled by hover
        controls.style.opacity = '0';
    });
    
    console.log('Controls should now appear on hover again!');
    
    return {
        componentsTotal: components.length,
        controlsRestored: restoredCount,
        controlsFixed: allControls.length
    };
};

// Auto-detect when controls are missing and restore them
window.autoRestoreControls = function(interval = 5000) {
    console.log(`🔄 Starting auto-restore with ${interval}ms interval`);
    
    const checkAndRestore = () => {
        const components = document.querySelectorAll('[data-component-id]');
        const componentsWithoutControls = Array.from(components).filter(comp => 
            !comp.querySelector('.component-controls--dynamic')
        );
        
        if (componentsWithoutControls.length > 0) {
            console.log(`Found ${componentsWithoutControls.length} components without controls, restoring...`);
            window.restoreControls();
        }
    };
    
    // Run immediately
    checkAndRestore();
    
    // Set up interval
    const intervalId = setInterval(checkAndRestore, interval);
    
    // Return stop function
    window.stopAutoRestore = () => {
        clearInterval(intervalId);
        console.log('🛑 Auto-restore stopped');
    };
    
    return {
        message: 'Auto-restore started. Use window.stopAutoRestore() to stop.',
        interval: interval
    };
};

// Provide immediate relief
console.log('🚑 Controls rescue functions loaded!');
console.log('- window.restoreControls() - Restore controls immediately');
console.log('- window.autoRestoreControls() - Auto-restore every 5 seconds');
console.log('- window.stopAutoRestore() - Stop auto-restore');

// Run restore immediately
setTimeout(() => {
    console.log('Running initial controls restoration...');
    window.restoreControls();
}, 500);
