/**
 * @file conditional-loader.js
 * @description This module acts as a feature flag-based loader for the core systems
 * of the Media Kit Builder. It synchronously loads either the legacy or the new "enhanced"
 * versions based on feature flags, preventing race conditions in module loading.
 *
 * This version fixes race conditions by using static imports and synchronous system selection.
 */

// Legacy system imports
import {
    state
} from '../state.js';
import {
    componentManager
} from '../components/component-manager.js';
import {
    renderAllComponents
} from '../components/component-renderer.js';

// Enhanced system imports - all static to prevent race conditions
import {
    enhancedStateManager
} from './enhanced-state-manager.js';
import {
    enhancedComponentManager
} from './enhanced-component-manager.js';
import {
    enhancedComponentRenderer
} from './enhanced-component-renderer.js';
import {
    initializeEnhancedBuilder
} from './media-kit-builder-init.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';

/**
 * Synchronously initializes the appropriate systems based on feature flags.
 * This prevents race conditions by avoiding dynamic imports.
 * @param {object} flags - The feature flag configuration object.
 * @returns {object} The selected systems for validation
 */
export function initializeSystems(flags) {
    const perfEnd = performanceMonitor.start('initialize-systems');
    
    console.log('🔧 ConditionalLoader: Starting system initialization...');
    
    // Validate flags object
    if (!flags || typeof flags !== 'object') {
        console.error('❌ ConditionalLoader: Invalid flags object provided');
        throw new Error('Feature flags object is required');
    }
    
    const selectedSystems = selectSystems(flags);
    const validationResult = validateSystems(selectedSystems);
    
    if (!validationResult.valid) {
        throw new Error(`System validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // Expose systems globally - synchronous assignment
    window.stateManager = selectedSystems.stateManager;
    window.componentManager = selectedSystems.componentManager;
    window.renderer = selectedSystems.renderer;
    window.initializer = selectedSystems.initializer;
    
    console.log('✅ ConditionalLoader: Systems loaded and validated');
    console.log('📊 ConditionalLoader: System selection:', {
        stateManager: selectedSystems.stateManagerType,
        componentManager: selectedSystems.componentManagerType,
        renderer: selectedSystems.rendererType,
        initializer: selectedSystems.initializerType
    });
    
    perfEnd();
    return selectedSystems;
}

/**
 * Selects the appropriate systems based on feature flags
 * @param {object} flags - Feature flags configuration
 * @returns {object} Selected systems with metadata
 */
function selectSystems(flags) {
    const systems = {
        stateManager: null,
        componentManager: null,
        renderer: null,
        initializer: null,
        stateManagerType: 'unknown',
        componentManagerType: 'unknown',
        rendererType: 'unknown',
        initializerType: 'unknown'
    };
    
    // Select State Manager
    if (flags.USE_ENHANCED_STATE_MANAGER) {
        console.log('🔧 Using enhanced state manager');
        systems.stateManager = enhancedStateManager;
        systems.stateManagerType = 'enhanced';
    } else {
        console.log('🔧 Using legacy state manager');
        systems.stateManager = state;
        systems.stateManagerType = 'legacy';
    }
    
    // Select Component Manager
    if (flags.USE_ENHANCED_COMPONENT_MANAGER) {
        console.log('🔧 Using enhanced component manager');
        systems.componentManager = enhancedComponentManager;
        systems.componentManagerType = 'enhanced';
    } else {
        console.log('🔧 Using legacy component manager');
        systems.componentManager = componentManager;
        systems.componentManagerType = 'legacy';
    }
    
    // Select Renderer
    if (flags.USE_ENHANCED_COMPONENT_RENDERER) {
        console.log('🔧 Using enhanced component renderer');
        systems.renderer = enhancedComponentRenderer;
        systems.rendererType = 'enhanced';
    } else {
        console.log('🔧 Using legacy component renderer');
        // Wrap legacy renderer for consistency
        systems.renderer = {
            render: renderAllComponents,
            init: () => console.log('Legacy renderer initialized'),
            destroy: () => console.log('Legacy renderer destroyed')
        };
        systems.rendererType = 'legacy';
    }
    
    // Select Initializer
    if (flags.USE_ENHANCED_INITIALIZATION) {
        console.log('🔧 Using enhanced initialization');
        systems.initializer = initializeEnhancedBuilder;
        systems.initializerType = 'enhanced';
    } else {
        console.log('🔧 Using enhanced initialization (legacy not available)');
        // Legacy initializer doesn't exist, use enhanced as fallback
        systems.initializer = initializeEnhancedBuilder;
        systems.initializerType = 'enhanced-fallback';
    }
    
    return systems;
}

/**
 * Validates that all selected systems are properly available
 * @param {object} systems - Selected systems object
 * @returns {object} Validation result with success status and any errors
 */
function validateSystems(systems) {
    const errors = [];
    
    // Validate State Manager
    if (!systems.stateManager) {
        errors.push('State manager is null');
    } else if (systems.stateManagerType === 'enhanced' && typeof systems.stateManager.getState !== 'function') {
        errors.push('Enhanced state manager missing getState method');
    }
    
    // Validate Component Manager
    if (!systems.componentManager) {
        errors.push('Component manager is null');
    } else if (systems.componentManagerType === 'enhanced' && typeof systems.componentManager.addComponent !== 'function') {
        errors.push('Enhanced component manager missing addComponent method');
    }
    
    // Validate Renderer
    if (!systems.renderer) {
        errors.push('Renderer is null');
    } else if (systems.rendererType === 'enhanced' && typeof systems.renderer.init !== 'function') {
        errors.push('Enhanced renderer missing init method');
    }
    
    // Validate Initializer
    if (!systems.initializer) {
        errors.push('Initializer is null');
    } else if (typeof systems.initializer !== 'function') {
        errors.push('Initializer is not a function');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Gets the current system configuration for debugging
 * @returns {object} Current system information
 */
export function getSystemInfo() {
    return {
        available: {
            stateManager: !!window.stateManager,
            componentManager: !!window.componentManager,
            renderer: !!window.renderer,
            initializer: !!window.initializer
        },
        types: {
            stateManager: window.stateManager === enhancedStateManager ? 'enhanced' : 'legacy',
            componentManager: window.componentManager === enhancedComponentManager ? 'enhanced' : 'legacy',
            renderer: window.renderer === enhancedComponentRenderer ? 'enhanced' : 'legacy'
        },
        methods: {
            stateManager: window.stateManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.stateManager)) : [],
            componentManager: window.componentManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.componentManager)) : [],
            renderer: window.renderer ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.renderer)) : []
        }
    };
}

// Expose system info globally for debugging
window.getSystemInfo = getSystemInfo;
