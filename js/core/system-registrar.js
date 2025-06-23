/**
 * @file system-registrar.js
 * @description A central, lightweight registry for core application systems.
 * This module is designed to be dependency-free to avoid circular dependencies.
 * 
 * GEMINI FIX: Added historyService to allowed systems list for undo/redo integration
 */

const systems = {
    stateManager: null,
    componentManager: null,
    renderer: null,
    initializer: null,
    stateValidator: null,
    uiRegistry: null,
    stateHistory: null,
    eventBus: null,
    saveService: null,
    historyService: null,  // GEMINI FIX: Added historyService to allowed systems
    dynamicComponentLoader: null,  // CRITICAL FIX: Add template loading systems
    templateCache: null  // CRITICAL FIX: Add template caching system
};

export const systemRegistrar = {
    register: (name, instance) => {
        if (systems.hasOwnProperty(name)) {
            systems[name] = instance;
            console.log(`📝 System registered: ${name}`);
        } else {
            console.warn(`⚠️ Unknown system registration attempted: ${name}`);
        }
    },
    get: (name) => systems[name],
    getAll: () => ({ ...systems }),
    list: () => {
        console.log('📋 Registered systems:', Object.keys(systems).filter(name => systems[name] !== null));
        return Object.keys(systems).filter(name => systems[name] !== null);
    }
};

// Expose globally for debugging
window.systemRegistrar = systemRegistrar;