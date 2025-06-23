/**
 * @file enhanced-system-registrar.js
 * @description Registers enhanced systems with the system registrar
 * GEMINI FIX: Converted to static imports to eliminate race conditions
 */

import { systemRegistrar } from './system-registrar.js';
import { performanceMonitor } from '../utils/performance-monitor.js';

// GEMINI FIX: Static imports to eliminate race conditions for core systems
import { enhancedStateManager } from './enhanced-state-manager.js';
import { enhancedComponentManager } from './enhanced-component-manager.js';
import { enhancedComponentRenderer } from './enhanced-component-renderer.js';

// GEMINI FIX: Import the initializer system
import { initializer } from './media-kit-builder-init.js';

/**
 * Registers all enhanced systems with the system registrar
 * GEMINI FIX: Now synchronous for core systems, async for optional Phase 3 systems
 */
export async function registerEnhancedSystems() {
    const perfEnd = performanceMonitor.start('register-enhanced-systems');
    
    console.log('🔧 Enhanced System Registrar: Starting system registration...');
    
    try {
        // GEMINI FIX: Validate core systems are available (they should be since they're static imports)
        console.log('📦 Validating core enhanced systems...');
        
        // Add comprehensive validation
        const validationResults = {
            stateManager: !!enhancedStateManager,
            componentManager: !!enhancedComponentManager,
            renderer: !!enhancedComponentRenderer,
            stateManagerMethods: typeof enhancedStateManager?.addComponent === 'function',
            componentManagerMethods: typeof enhancedComponentManager?.addComponent === 'function',
            rendererMethods: typeof enhancedComponentRenderer?.init === 'function'
        };
        
        console.log('🔍 System validation results:', validationResults);
        
        if (!enhancedStateManager) {
            throw new Error('Enhanced State Manager not available after static import');
        }
        
        if (!enhancedComponentManager) {
            throw new Error('Enhanced Component Manager not available after static import');
        }
        
        if (!enhancedComponentRenderer) {
            throw new Error('Enhanced Component Renderer not available after static import');
        }
        
        console.log('✅ All core enhanced systems validated');
        
        // Register Core Enhanced Systems (synchronous)
        console.log('📝 Registering core enhanced systems...');
        
        // State Manager
        systemRegistrar.register('stateManager', enhancedStateManager);
        console.log('✅ State Manager: Enhanced');
        
        // Component Manager - CRITICAL
        systemRegistrar.register('componentManager', enhancedComponentManager);
        console.log('✅ Component Manager: Enhanced');
        
        // Renderer
        systemRegistrar.register('renderer', enhancedComponentRenderer);
        console.log('✅ Renderer: Enhanced');
        
        // GEMINI FIX: Register the initializer system
        systemRegistrar.register('initializer', initializer);
        console.log('✅ Initializer: Enhanced');
        
        // Validate enhanced component manager
        console.log('🔍 Enhanced Component Manager validation:', {
            imported: !!enhancedComponentManager,
            type: typeof enhancedComponentManager,
            constructor: enhancedComponentManager?.constructor?.name,
            hasAddComponent: typeof enhancedComponentManager?.addComponent === 'function',
            hasInit: typeof enhancedComponentManager?.init === 'function',
            hasUpdateComponent: typeof enhancedComponentManager?.updateComponent === 'function'
        });
        
        // GEMINI FIX: Validate initializer system
        console.log('🔍 Initializer validation:', {
            imported: !!initializer,
            type: typeof initializer,
            constructor: initializer?.constructor?.name,
            hasInitialize: typeof initializer?.initialize === 'function',
            getStatus: initializer?.getStatus()
        });
        
        // Register Phase 3 Systems (optional - async imports)
        console.log('📝 Registering Phase 3 systems...');
        
        // Import Phase 3 systems with error handling
        let stateValidator, uiRegistry, stateHistory, eventBus;
        
        try {
            const stateValidatorModule = await import('./state-validator.js');
            stateValidator = stateValidatorModule.stateValidator;
            if (stateValidator) {
                systemRegistrar.register('stateValidator', stateValidator);
                console.log('✅ State Validator: Available');
            }
        } catch (error) {
            console.warn('⚠️ State Validator not available:', error.message);
        }
        
        try {
            const uiRegistryModule = await import('./ui-registry.js');
            uiRegistry = uiRegistryModule.uiRegistry;
            if (uiRegistry) {
                systemRegistrar.register('uiRegistry', uiRegistry);
                console.log('✅ UI Registry: Available');
            }
        } catch (error) {
            console.warn('⚠️ UI Registry not available:', error.message);
        }
        
        try {
            const stateHistoryModule = await import('./state-history.js');
            stateHistory = stateHistoryModule.stateHistory;
            if (stateHistory) {
                systemRegistrar.register('stateHistory', stateHistory);
                console.log('✅ State History: Available');
            }
        } catch (error) {
            console.warn('⚠️ State History not available:', error.message);
        }
        
        try {
            const eventBusModule = await import('./event-bus.js');
            eventBus = eventBusModule.eventBus;
            if (eventBus) {
                systemRegistrar.register('eventBus', eventBus);
                console.log('✅ Event Bus: Available');
            }
        } catch (error) {
            console.warn('⚠️ Event Bus not available:', error.message);
        }
        
        // Services will be registered later when imported
        systemRegistrar.register('saveService', null);
        systemRegistrar.register('historyService', null);
        
        // Verify registration worked
        const registeredSystems = systemRegistrar.list();
        console.log('✅ Enhanced System Registrar: Registration complete');
        console.log('📋 Registered systems:', registeredSystems);
        
        if (registeredSystems.length < 4) {
            throw new Error(`Only ${registeredSystems.length} systems registered, expected at least 4 (stateManager, componentManager, renderer, initializer)`);
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
        },
        methods: {
            componentManagerAddComponent: typeof registeredSystems.componentManager?.addComponent === 'function',
            componentManagerUpdateComponent: typeof registeredSystems.componentManager?.updateComponent === 'function',
            enhancedComponentManagerAddComponent: typeof window.enhancedComponentManager?.addComponent === 'function',
            enhancedComponentManagerUpdateComponent: typeof window.enhancedComponentManager?.updateComponent === 'function',
            initializerInitialize: typeof registeredSystems.initializer?.initialize === 'function'
        }
    };
}

// Expose system info globally for debugging
window.getEnhancedSystemInfo = getEnhancedSystemInfo;