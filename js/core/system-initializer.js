/**
 * @file system-initializer.js
 * @description Initializes and exposes the core systems of the application.
 */

import { systemRegistrar } from './system-registrar.js';

/**
 * Initializes and exposes the registered systems globally.
 */
export function initializeCoreSystems() {
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
        }
    }

    // Validate critical systems are available
    const criticalSystems = ['stateManager', 'componentManager', 'renderer'];
    const missingCritical = criticalSystems.filter(name => !window[name]);
    
    if (missingCritical.length > 0) {
        console.error('❌ Critical systems missing:', missingCritical);
        throw new Error(`Critical systems not available: ${missingCritical.join(', ')}`);
    }

    // Initialize enhanced component manager if available
    if (window.componentManager && typeof window.componentManager.init === 'function') {
        const initResult = window.componentManager.init();
        console.log('🔧 Component manager initialized:', !!initResult);
    }

    // Initialize keyboard shortcuts
    if (systems.stateHistory && document) {
        setupKeyboardShortcuts(systems.stateHistory, systems.saveService);
    }

    // Final validation
    console.log('🔍 Final system validation:');
    console.log('  window.stateManager:', !!window.stateManager);
    console.log('  window.componentManager:', !!window.componentManager);
    console.log('  window.enhancedComponentManager:', !!window.enhancedComponentManager);
    console.log('  window.renderer:', !!window.renderer);
    console.log('  window.initializer:', !!window.initializer);

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