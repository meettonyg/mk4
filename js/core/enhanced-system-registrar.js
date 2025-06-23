/**
 * @file enhanced-system-registrar.js
 * @description Registers enhanced systems with the system registrar
 * Replaces the functionality that was in conditional-loader.js
 */

import { systemRegistrar } from './system-registrar.js';
import { performanceMonitor } from '../utils/performance-monitor.js';

/**
 * Registers all enhanced systems with the system registrar
 */
export async function registerEnhancedSystems() {
    const perfEnd = performanceMonitor.start('register-enhanced-systems');
    
    console.log('🔧 Enhanced System Registrar: Starting system registration...');
    
    try {
        // Import enhanced systems with error handling
        console.log('📦 Importing enhanced systems...');
        
        let enhancedStateManager, enhancedComponentManager, enhancedComponentRenderer;
        let stateValidator, uiRegistry, stateHistory, eventBus;
        
        try {
            const stateManagerModule = await import('./enhanced-state-manager.js');
            enhancedStateManager = stateManagerModule.enhancedStateManager;
            console.log('✅ Enhanced State Manager imported:', !!enhancedStateManager);
        } catch (error) {
            console.error('❌ Enhanced State Manager import failed:', error);
            throw new Error(`Enhanced State Manager import failed: ${error.message}`);
        }
        
        try {
            const componentManagerModule = await import('./enhanced-component-manager.js');
            enhancedComponentManager = componentManagerModule.enhancedComponentManager;
            console.log('✅ Enhanced Component Manager imported:', !!enhancedComponentManager);
        } catch (error) {
            console.error('❌ Enhanced Component Manager import failed:', error);
            throw new Error(`Enhanced Component Manager import failed: ${error.message}`);
        }
        
        try {
            const rendererModule = await import('./enhanced-component-renderer.js');
            enhancedComponentRenderer = rendererModule.enhancedComponentRenderer;
            console.log('✅ Enhanced Component Renderer imported:', !!enhancedComponentRenderer);
        } catch (error) {
            console.error('❌ Enhanced Component Renderer import failed:', error);
            throw new Error(`Enhanced Component Renderer import failed: ${error.message}`);
        }
        
        // Import Phase 3 systems (optional)
        try {
            const stateValidatorModule = await import('./state-validator.js');
            stateValidator = stateValidatorModule.stateValidator;
            console.log('✅ State Validator imported:', !!stateValidator);
        } catch (error) {
            console.error('⚠️ State Validator import failed:', error);
            // Don't throw - this is optional
        }
        
        try {
            const uiRegistryModule = await import('./ui-registry.js');
            uiRegistry = uiRegistryModule.uiRegistry;
            console.log('✅ UI Registry imported:', !!uiRegistry);
        } catch (error) {
            console.error('⚠️ UI Registry import failed:', error);
            // Don't throw - this is optional
        }
        
        try {
            const stateHistoryModule = await import('./state-history.js');
            stateHistory = stateHistoryModule.stateHistory;
            console.log('✅ State History imported:', !!stateHistory);
        } catch (error) {
            console.error('⚠️ State History import failed:', error);
            // Don't throw - this is optional
        }
        
        try {
            const eventBusModule = await import('./event-bus.js');
            eventBus = eventBusModule.eventBus;
            console.log('✅ Event Bus imported:', !!eventBus);
        } catch (error) {
            console.error('⚠️ Event Bus import failed:', error);
            // Don't throw - this is optional
        }
        
        // Register Core Enhanced Systems
        console.log('📝 Registering core enhanced systems...');
        
        // State Manager
        if (enhancedStateManager) {
            systemRegistrar.register('stateManager', enhancedStateManager);
            console.log('✅ State Manager: Enhanced');
        } else {
            throw new Error('Enhanced State Manager is null after import');
        }
        
        // Component Manager - CRITICAL
        if (enhancedComponentManager) {
            systemRegistrar.register('componentManager', enhancedComponentManager);
            console.log('✅ Component Manager: Enhanced');
            
            // Validate enhanced component manager
            console.log('🔍 Enhanced Component Manager validation:', {
                imported: !!enhancedComponentManager,
                type: typeof enhancedComponentManager,
                constructor: enhancedComponentManager?.constructor?.name,
                hasAddComponent: typeof enhancedComponentManager?.addComponent === 'function',
                hasInit: typeof enhancedComponentManager?.init === 'function'
            });
        } else {
            throw new Error('Enhanced Component Manager is null after import');
        }
        
        // Renderer
        if (enhancedComponentRenderer) {
            systemRegistrar.register('renderer', enhancedComponentRenderer);
            console.log('✅ Renderer: Enhanced');
        } else {
            throw new Error('Enhanced Component Renderer is null after import');
        }
        
        // Register Phase 3 Systems (optional)
        console.log('📝 Registering Phase 3 systems...');
        if (stateValidator) systemRegistrar.register('stateValidator', stateValidator);
        if (uiRegistry) systemRegistrar.register('uiRegistry', uiRegistry);
        if (stateHistory) systemRegistrar.register('stateHistory', stateHistory);
        if (eventBus) systemRegistrar.register('eventBus', eventBus);
        
        // Services will be registered later when imported
        systemRegistrar.register('saveService', null);
        systemRegistrar.register('historyService', null);
        
        // Verify registration worked
        const registeredSystems = systemRegistrar.list();
        console.log('✅ Enhanced System Registrar: Registration complete');
        console.log('📋 Registered systems:', registeredSystems);
        
        if (registeredSystems.length < 3) {
            throw new Error(`Only ${registeredSystems.length} systems registered, expected at least 3`);
        }
        
        perfEnd();
        return true;
        
    } catch (error) {
        console.error('❌ Enhanced System Registrar failed:', error);
        perfEnd();
        throw error;
    }
}

/**
 * Gets the current system configuration for debugging
 * @returns {object} Current system information
 */
export function getEnhancedSystemInfo() {
    const registeredSystems = systemRegistrar.getAll();
    
    return {
        registered: Object.keys(registeredSystems).reduce((acc, name) => {
            acc[name] = !!registeredSystems[name];
            return acc;
        }, {}),
        global: {
            stateManager: !!window.stateManager,
            componentManager: !!window.componentManager,
            enhancedComponentManager: !!window.enhancedComponentManager,
            renderer: !!window.renderer,
            initializer: !!window.initializer
        },
        types: {
            stateManager: registeredSystems.stateManager?.constructor?.name || 'Unknown',
            componentManager: registeredSystems.componentManager?.constructor?.name || 'Unknown',
            renderer: registeredSystems.renderer?.constructor?.name || 'Unknown'
        }
    };
}

// Expose system info globally for debugging
window.getEnhancedSystemInfo = getEnhancedSystemInfo;