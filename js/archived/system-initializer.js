/**
 * @file system-initializer.js
 * @description Initializes and exposes the core systems of the application.
 */

import { systemRegistrar } from './system-registrar.js';

/**
 * Initializes and exposes the registered systems globally.
 */
export async function initializeCoreSystems() {
    console.log('🚀 SystemInitializer: Initializing core systems...');

    const systems = systemRegistrar.getAll();
    
    // Log what we're about to expose
    const availableSystems = Object.keys(systems).filter(name => systems[name] !== null);
    console.log('📋 Available systems to expose:', availableSystems);

    // Expose systems globally with enhanced logging
    for (const [name, instance] of Object.entries(systems)) {
        if (instance !== null) {
            window[name] = instance;
            console.log(`✅ Exposed globally: window.${name}`);
            
            // Special handling for enhanced component manager
            if (name === 'componentManager' && instance.constructor?.name?.includes('Enhanced')) {
                window.enhancedComponentManager = instance;
                console.log('✅ Also exposed as: window.enhancedComponentManager');
            }
            
            // Special handling for enhanced state manager
            if (name === 'stateManager' && instance.constructor?.name?.includes('Enhanced')) {
                window.enhancedStateManager = instance;
                console.log('✅ Also exposed as: window.enhancedStateManager');
            }
        }
    }

    // Enhanced validation with retry mechanism for race conditions
    const criticalSystems = ['stateManager', 'componentManager', 'renderer'];
    const missingCritical = criticalSystems.filter(name => !window[name]);
    
    if (missingCritical.length > 0) {
        console.warn('⚠️ Critical systems missing on first check:', missingCritical);
        
        // GEMINI FIX: Retry mechanism for race condition recovery
        console.log('🔄 Attempting race condition recovery...');
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay
        
        // Re-check after delay
        const stillMissing = criticalSystems.filter(name => !window[name]);
        
        if (stillMissing.length > 0) {
            console.error('❌ Critical systems still missing after retry:', stillMissing);
            
            // Enhanced debugging information
            console.log('🔍 Debug: Available global objects:', {
                componentManager: typeof window.componentManager,
                enhancedComponentManager: typeof window.enhancedComponentManager,
                stateManager: typeof window.stateManager,
                renderer: typeof window.renderer
            });
            
            throw new Error(`Critical systems not available after retry: ${stillMissing.join(', ')}`);
        } else {
            console.log('✅ Race condition recovery successful!');
        }
    }

    // Enhanced component manager initialization with validation
    if (window.componentManager && typeof window.componentManager.init === 'function') {
        try {
            const initResult = window.componentManager.init();
            console.log('🔧 Component manager initialized:', !!initResult);
            
            // ROOT FIX: Validate initialization was successful
            if (window.componentManager.isInitialized) {
                console.log('✅ ROOT FIX: Component manager initialization confirmed');
            } else {
                console.warn('⚠️ ROOT FIX: Component manager may not be fully initialized');
            }
        } catch (error) {
            console.error('❌ ROOT FIX: Component manager initialization failed:', error);
            // Don't throw here - let the system continue with fallback behavior
        }
    } else {
        console.warn('⚠️ ROOT FIX: Component manager init method not available');
    }
    
    // ROOT FIX: Also try to initialize enhanced component manager if available separately
    if (window.enhancedComponentManager && window.enhancedComponentManager !== window.componentManager) {
        if (typeof window.enhancedComponentManager.init === 'function') {
            try {
                const enhancedInitResult = window.enhancedComponentManager.init();
                console.log('🔧 ROOT FIX: Enhanced component manager initialized separately:', !!enhancedInitResult);
            } catch (error) {
                console.error('❌ ROOT FIX: Enhanced component manager initialization failed:', error);
            }
        }
    }

    // Initialize keyboard shortcuts
    if (systems.stateHistory && document) {
        setupKeyboardShortcuts(systems.stateHistory, systems.saveService);
    }

    // Enhanced final validation with method checking
    console.log('🔍 Final system validation:');
    console.log('  window.stateManager:', !!window.stateManager);
    console.log('  window.componentManager:', !!window.componentManager, typeof window.componentManager?.addComponent);
    console.log('  window.enhancedComponentManager:', !!window.enhancedComponentManager, typeof window.enhancedComponentManager?.addComponent);
    console.log('  window.renderer:', !!window.renderer);
    console.log('  window.initializer:', !!window.initializer);
    
    // GEMINI FIX: Test critical methods are available
    const methodTests = {
        'componentManager.addComponent': typeof window.componentManager?.addComponent === 'function',
        'componentManager.updateComponent': typeof window.componentManager?.updateComponent === 'function',
        'enhancedComponentManager.addComponent': typeof window.enhancedComponentManager?.addComponent === 'function',
        'enhancedComponentManager.updateComponent': typeof window.enhancedComponentManager?.updateComponent === 'function'
    };
    
    console.log('🔍 Method availability check:', methodTests);
    
    const failedMethods = Object.entries(methodTests)
        .filter(([method, available]) => !available)
        .map(([method]) => method);
    
    if (failedMethods.length > 0) {
        console.warn('⚠️ Some critical methods not available:', failedMethods);
    } else {
        console.log('✅ All critical methods available');
    }

    console.log('✅ SystemInitializer: Core systems initialized and exposed globally.');
}

/**
 * Setup keyboard shortcuts for undo/redo and save functionality.
 * @param {object} stateHistory - The state history instance.
 * @param {object} saveService - The save service instance.
 */
function setupKeyboardShortcuts(stateHistory, saveService) {
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            if (stateHistory && stateHistory.canUndo()) {
                stateHistory.undo();
                console.log('↩️ Undo triggered via Ctrl+Z');
            }
        } else if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
            event.preventDefault();
            if (stateHistory && stateHistory.canRedo()) {
                stateHistory.redo();
                console.log('↪️ Redo triggered via Ctrl+Y');
            }
        } else if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (saveService && saveService.saveState) {
                saveService.saveState();
                console.log('💾 Manual save triggered via Ctrl+S');
            }
        }
    });

    console.log('⌨️ SystemInitializer: Keyboard shortcuts initialized (Ctrl+Z, Ctrl+Y, Ctrl+S)');
}