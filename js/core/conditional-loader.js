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

// PHASE 3 SYSTEM IMPORTS - Import to trigger global exposure
import {
    stateValidator
} from './state-validator.js';
import {
    uiRegistry
} from './ui-registry.js';
import {
    stateHistory
} from './state-history.js';
import {
    eventBus
} from './event-bus.js';

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
    
    // PHASE 3 FIX: Expose enhanced systems globally
    if (selectedSystems.stateManagerType === 'enhanced') {
        window.enhancedStateManager = selectedSystems.stateManager;
        console.log('✅ Enhanced State Manager exposed globally');
    }
    
    if (selectedSystems.componentManagerType === 'enhanced') {
        window.enhancedComponentManager = selectedSystems.componentManager;
        console.log('✅ Enhanced Component Manager exposed globally');
    }
    
    // PHASE 3 FIX: Initialize and expose Phase 3 systems
    initializePhase3Systems();
    
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
        // Create a custom initializer that only initializes core services
        systems.initializer = async () => {
            // Only initialize core services, not UI
            const { keyboardService } = await import('../services/keyboard-service.js');
            const { saveService } = await import('../services/save-service.js');
            
            keyboardService.init();
            enhancedComponentRenderer.init();
            
            // Restore state
            const savedState = saveService.loadState();
            if (savedState && Object.keys(savedState.components).length > 0) {
                console.log('📦 Found saved data, loading...');
                enhancedStateManager.setInitialState(savedState);
            }
            
            // Setup autosave
            enhancedStateManager.subscribeGlobal(state => {
                saveService.saveState(state);
            });
            
            console.log('✅ Core services initialized');
        };
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

/**
 * Initialize Phase 3 systems and ensure global exposure
 * PHASE 3 FIX: Explicitly initialize systems that may not auto-expose
 */
function initializePhase3Systems() {
    console.log('🚀 ConditionalLoader: Initializing Phase 3 systems...');
    
    // Ensure all Phase 3 systems are globally exposed
    window.stateValidator = stateValidator;
    window.uiRegistry = uiRegistry;
    window.stateHistory = stateHistory;
    window.eventBus = eventBus;
    window.saveService = null; // Will be set by save service import
    
    // Log system availability for debugging
    const phase3Systems = {
        stateValidator: !!window.stateValidator,
        uiRegistry: !!window.uiRegistry,
        stateHistory: !!window.stateHistory,
        eventBus: !!window.eventBus,
        enhancedStateManager: !!window.enhancedStateManager
    };
    
    console.log('📊 ConditionalLoader: Phase 3 systems status:', phase3Systems);
    
    const workingSystems = Object.values(phase3Systems).filter(Boolean).length;
    console.log(`✅ ConditionalLoader: ${workingSystems}/5 Phase 3 systems initialized`);
    
    // Initialize keyboard shortcuts for state history
    if (window.stateHistory && document) {
        setupKeyboardShortcuts();
    }
}

/**
 * Setup keyboard shortcuts for undo/redo functionality
 * PHASE 3 FIX: Wire up Ctrl+Z and Ctrl+Y to state history
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Check for Ctrl+Z (undo)
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            if (window.stateHistory && window.stateHistory.canUndo()) {
                window.stateHistory.undo();
                console.log('↩️ Undo triggered via Ctrl+Z');
            }
        }
        
        // Check for Ctrl+Y or Ctrl+Shift+Z (redo)
        if ((event.ctrlKey && event.key === 'y') || 
            (event.ctrlKey && event.shiftKey && event.key === 'z')) {
            event.preventDefault();
            if (window.stateHistory && window.stateHistory.canRedo()) {
                window.stateHistory.redo();
                console.log('↪️ Redo triggered via Ctrl+Y');
            }
        }
        
        // Check for Ctrl+S (manual save)
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (window.saveService && window.saveService.saveState) {
                window.saveService.saveState();
                console.log('💾 Manual save triggered via Ctrl+S');
            }
        }
    });
    
    console.log('⌨️ ConditionalLoader: Keyboard shortcuts initialized (Ctrl+Z, Ctrl+Y, Ctrl+S)');
}
