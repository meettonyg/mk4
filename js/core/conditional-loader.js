/**
 * @file conditional-loader.js
 * @description This module acts as a feature flag-based loader for the core systems
 * of the Media Kit Builder. It uses a registrar to avoid circular dependencies.
 * 
 * REFACTORED: Simplified to focus only on system selection, removing initialization
 * logic that was causing circular dependencies.
 */

import { systemRegistrar } from './system-registrar.js';
import { performanceMonitor } from '../utils/performance-monitor.js';

// Legacy system imports
import { state as legacyStateManager } from '../state.js';
import { componentManager as legacyComponentManager } from '../components/component-manager.js';
import { renderAllComponents as legacyRenderer } from '../components/component-renderer.js';

// Enhanced system imports
import { enhancedStateManager } from './enhanced-state-manager.js';
import { enhancedComponentManager } from './enhanced-component-manager.js';
import { enhancedComponentRenderer } from './enhanced-component-renderer.js';
import { initializeEnhancedBuilder } from './media-kit-builder-init.js';

// Phase 3 System Imports
import { stateValidator } from './state-validator.js';
import { uiRegistry } from './ui-registry.js';
import { stateHistory } from './state-history.js';
import { eventBus } from './event-bus.js';

// GEMINI FIX: Import history service for undo/redo integration
import { historyService } from '../services/history-service.js';

/**
 * Selects and registers the appropriate systems based on feature flags.
 * @param {object} flags - The feature flag configuration object.
 */
export function selectAndRegisterSystems(flags) {
    const perfEnd = performanceMonitor.start('select-and-register-systems');
    
    console.log('🔧 ConditionalLoader: Starting system selection and registration...');
    
    if (!flags || typeof flags !== 'object') {
        console.error('❌ ConditionalLoader: Invalid flags object provided');
        throw new Error('Feature flags object is required');
    }

    console.log('📊 ConditionalLoader: Feature flags:', {
        USE_ENHANCED_STATE_MANAGER: flags.USE_ENHANCED_STATE_MANAGER,
        USE_ENHANCED_COMPONENT_MANAGER: flags.USE_ENHANCED_COMPONENT_MANAGER,
        USE_ENHANCED_COMPONENT_RENDERER: flags.USE_ENHANCED_COMPONENT_RENDERER,
        USE_ENHANCED_INITIALIZATION: flags.USE_ENHANCED_INITIALIZATION
    });

    // --- System Selection ---
    const useEnhancedState = flags.USE_ENHANCED_STATE_MANAGER;
    const useEnhancedComponents = flags.USE_ENHANCED_COMPONENT_MANAGER;
    const useEnhancedRenderer = flags.USE_ENHANCED_COMPONENT_RENDERER;
    const useEnhancedInit = flags.USE_ENHANCED_INITIALIZATION;

    // --- Register Core Systems ---
    console.log('📝 ConditionalLoader: Registering core systems...');
    
    // State Manager
    const selectedStateManager = useEnhancedState ? enhancedStateManager : legacyStateManager;
    systemRegistrar.register('stateManager', selectedStateManager);
    console.log(`✅ State Manager: ${useEnhancedState ? 'Enhanced' : 'Legacy'}`);

    // Component Manager - CRITICAL FIX
    const selectedComponentManager = useEnhancedComponents ? enhancedComponentManager : legacyComponentManager;
    systemRegistrar.register('componentManager', selectedComponentManager);
    console.log(`✅ Component Manager: ${useEnhancedComponents ? 'Enhanced' : 'Legacy'}`);
    
    // Validate enhanced component manager is properly imported
    if (useEnhancedComponents) {
        console.log('🔍 Enhanced Component Manager validation:', {
            imported: !!enhancedComponentManager,
            type: typeof enhancedComponentManager,
            constructor: enhancedComponentManager?.constructor?.name,
            hasAddComponent: typeof enhancedComponentManager?.addComponent === 'function',
            hasInit: typeof enhancedComponentManager?.init === 'function'
        });
        
        if (!enhancedComponentManager) {
            console.error('❌ CRITICAL: Enhanced component manager import failed!');
            throw new Error('Enhanced component manager import failed');
        }
    }

    // Renderer
    const selectedRenderer = useEnhancedRenderer ? enhancedComponentRenderer : createLegacyRendererWrapper();
    systemRegistrar.register('renderer', selectedRenderer);
    console.log(`✅ Renderer: ${useEnhancedRenderer ? 'Enhanced' : 'Legacy'}`);

    // Initializer
    const selectedInitializer = useEnhancedInit ? createEnhancedInitializer() : initializeEnhancedBuilder;
    systemRegistrar.register('initializer', selectedInitializer);
    console.log(`✅ Initializer: ${useEnhancedInit ? 'Enhanced' : 'Fallback'}`);

    // --- Register Phase 3 Systems ---
    console.log('📝 ConditionalLoader: Registering Phase 3 systems...');
    systemRegistrar.register('stateValidator', stateValidator);
    systemRegistrar.register('uiRegistry', uiRegistry);
    systemRegistrar.register('stateHistory', stateHistory);
    systemRegistrar.register('eventBus', eventBus);
    
    // GEMINI FIX: Register and expose history service globally
    systemRegistrar.register('historyService', historyService);
    window.historyService = historyService;
    console.log('✅ History Service: Registered and exposed globally');
    
    // Save service will be registered later when imported
    systemRegistrar.register('saveService', null);

    console.log('✅ ConditionalLoader: All systems selected and registered');
    console.log('📋 ConditionalLoader: Registered systems:', systemRegistrar.list());
    
    perfEnd();
}

/**
 * Creates a legacy renderer wrapper for consistency.
 * @returns {object} Wrapped legacy renderer.
 */
function createLegacyRendererWrapper() {
    return {
        render: legacyRenderer,
        init: () => console.log('Legacy renderer initialized'),
        destroy: () => console.log('Legacy renderer destroyed')
    };
}

/**
 * Creates a custom initializer for enhanced mode that only initializes core services.
 * @returns {function} The initializer function.
 */
function createEnhancedInitializer() {
    return async () => {
        console.log('🚀 Enhanced initializer starting...');
        
        try {
            // Import services dynamically to avoid circular dependencies
            const { keyboardService } = await import('../services/keyboard-service.js');
            const { saveService } = await import('../services/save-service.js');
            
            // Register save service now that it's imported
            systemRegistrar.register('saveService', saveService);

            // GEMINI FIX: Initialize history service for undo/redo
            if (historyService && historyService.init) {
                historyService.init();
                console.log('✅ History Service initialized');
            }

            // Initialize services
            keyboardService.init();
            
            if (enhancedComponentRenderer && enhancedComponentRenderer.init) {
                enhancedComponentRenderer.init();
            }

            // GEMINI FIX: Now that renderer is initialized, trigger state manager's post-system init
            if (enhancedStateManager && enhancedStateManager.initializeAfterSystems) {
                enhancedStateManager.initializeAfterSystems();
                console.log('✅ Enhanced State Manager post-system initialization complete');
            }

            // GEMINI FIX: State loading now handled automatically by enhanced state manager
            // Removed duplicate state loading logic
            // Autosave is also handled internally by enhanced state manager

            console.log('✅ Enhanced initializer: Core services initialized');
        } catch (error) {
            console.error('❌ Enhanced initializer failed:', error);
            throw error;
        }
    };
}

/**
 * Gets the current system configuration for debugging
 * @returns {object} Current system information
 */
export function getSystemInfo() {
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
window.getSystemInfo = getSystemInfo;