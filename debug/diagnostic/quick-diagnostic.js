/**
 * @file quick-diagnostic.js
 * @description Quick diagnostic script that can run immediately to debug initialization issues
 * This loads independently of the main initialization process
 */

window.quickDiagnostic = function() {
    console.log('🔍 Quick System Diagnostic...');
    
    const checks = {
        dom: {
            ready: document.readyState,
            mediaKitPreview: !!document.getElementById('media-kit-preview'),
            componentLibrary: !!document.getElementById('component-library-overlay')
        },
        globals: {
            guestifyData: !!window.guestifyData,
            eventBus: !!window.eventBus,
            stateManager: !!window.stateManager,
            enhancedStateManager: !!window.enhancedStateManager,
            componentManager: !!window.componentManager,
            enhancedComponentManager: !!window.enhancedComponentManager,
            renderer: !!window.renderer,
            startupCoordinationManager: !!window.startupCoordinationManager,
            initManager: !!window.initManager
        },
        coordination: null,
        errors: []
    };
    
    // Check coordination manager status if available
    if (window.startupCoordinationManager) {
        try {
            checks.coordination = window.startupCoordinationManager.getStatus();
        } catch (error) {
            checks.errors.push(`Coordination status error: ${error.message}`);
        }
    }
    
    // Check for common error patterns
    if (!checks.dom.mediaKitPreview) {
        checks.errors.push('media-kit-preview element missing - component manager cannot initialize');
    }
    
    if (!checks.globals.guestifyData) {
        checks.errors.push('guestifyData missing - WordPress script loading failed');
    }
    
    if (!checks.globals.eventBus) {
        checks.errors.push('eventBus missing - coordination events cannot work');
    }
    
    // Log results
    console.log('📊 DOM Status:', checks.dom);
    console.log('📊 Global Objects:', checks.globals);
    
    if (checks.coordination) {
        console.log('📊 Coordination Status:', checks.coordination);
    }
    
    if (checks.errors.length > 0) {
        console.log('❌ Issues Found:');
        checks.errors.forEach(error => console.log(`  - ${error}`));
    } else {
        console.log('✅ No obvious issues detected');
    }
    
    // Provide quick fixes
    console.log('\n🔧 Quick Actions:');
    console.log('  quickDiagnostic.forceUnblock()  - Force unblock rendering');
    console.log('  quickDiagnostic.resetCoordination() - Reset coordination manager');
    console.log('  quickDiagnostic.checkTimeout()  - Check what\'s causing timeout');
    
    return checks;
};

// Quick fix functions
window.quickDiagnostic.forceUnblock = function() {
    if (window.startupCoordinationManager) {
        console.log('🚀 Force unblocking rendering...');
        window.startupCoordinationManager.unblockRendering('Manual force unblock');
        window.startupCoordinationManager.state = 'COMPLETE';
        console.log('✅ Rendering force unblocked');
    } else {
        console.log('❌ Coordination manager not available');
    }
};

window.quickDiagnostic.resetCoordination = function() {
    if (window.startupCoordinationManager) {
        console.log('🔄 Resetting coordination manager...');
        window.startupCoordinationManager.reset();
        console.log('✅ Coordination manager reset');
    } else {
        console.log('❌ Coordination manager not available');
    }
};

window.quickDiagnostic.checkTimeout = function() {
    console.log('⏱️ Checking for timeout causes...');
    
    const timeoutCauses = [];
    
    // Check if coordination is stuck
    if (window.startupCoordinationManager) {
        const status = window.startupCoordinationManager.getStatus();
        
        if (status.state === 'COORDINATING' || status.state === 'DATA_LOADING') {
            timeoutCauses.push(`Coordination stuck in ${status.state} state`);
        }
        
        if (status.pendingOperations.template > 0) {
            timeoutCauses.push(`${status.pendingOperations.template} pending template operations`);
        }
        
        if (status.pendingOperations.state > 0) {
            timeoutCauses.push(`${status.pendingOperations.state} pending state operations`);
        }
        
        if (status.renderingBlocked) {
            timeoutCauses.push('Rendering is blocked');
        }
        
        if (status.duration > 10000) {
            timeoutCauses.push(`Coordination running for ${status.duration}ms (too long)`);
        }
    }
    
    // Check for missing dependencies
    if (!window.enhancedStateManager) {
        timeoutCauses.push('Enhanced state manager missing');
    }
    
    if (!window.eventBus) {
        timeoutCauses.push('Event bus missing - coordination cannot work');
    }
    
    if (!document.getElementById('media-kit-preview')) {
        timeoutCauses.push('media-kit-preview element missing - component manager cannot initialize');
    }
    
    console.log('🔍 Potential timeout causes:');
    if (timeoutCauses.length > 0) {
        timeoutCauses.forEach(cause => console.log(`  - ${cause}`));
        
        console.log('\n💡 Suggested fixes:');
        console.log('  1. Run quickDiagnostic.forceUnblock() to unblock rendering');
        console.log('  2. Run quickDiagnostic.resetCoordination() to reset coordination');
        console.log('  3. Reload the page if issues persist');
    } else {
        console.log('  No obvious timeout causes found');
    }
    
    return timeoutCauses;
};

// Emergency bypass function
window.quickDiagnostic.emergencyBypass = function() {
    console.log('🚨 Running emergency bypass...');
    
    try {
        // Force unblock rendering
        if (window.startupCoordinationManager) {
            window.startupCoordinationManager.unblockRendering('Emergency bypass');
            window.startupCoordinationManager.state = 'COMPLETE';
        }
        
        // Try to initialize component manager manually
        if (window.enhancedComponentManager && !window.enhancedComponentManager.isInitialized) {
            const initResult = window.enhancedComponentManager.init();
            console.log('📋 Component manager manual init:', initResult);
        }
        
        // Try to initialize renderer manually
        if (window.renderer && !window.renderer.initialized) {
            window.renderer.init();
            console.log('📋 Renderer manual init: completed');
        }
        
        console.log('✅ Emergency bypass completed');
        console.log('🧪 Try running testRaceConditionFix() now');
        
    } catch (error) {
        console.log('❌ Emergency bypass failed:', error.message);
    }
};

// Auto-run diagnostic on load
console.log('🔍 Quick Diagnostic loaded! Run quickDiagnostic() for immediate system check');
console.log('🚨 If initialization is stuck, try quickDiagnostic.emergencyBypass()');

// Run diagnostic automatically after a short delay
setTimeout(() => {
    if (typeof window.startupCoordinationManager === 'undefined' || 
        !document.getElementById('media-kit-preview')) {
        console.log('⚠️ Potential initialization issues detected, running diagnostic...');
        window.quickDiagnostic();
    }
}, 2000);
