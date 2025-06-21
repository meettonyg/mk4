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
    console.log('🔍 DIAGNOSTIC: Feature flags received:', flags);
    
    // Validate flags object
    if (!flags || typeof flags !== 'object') {
        console.error('❌ ConditionalLoader: Invalid flags object provided');
        throw new Error('Feature flags object is required');
    }
    
    console.log('🔍 DIAGNOSTIC: About to call selectSystems...');
    const selectedSystems = selectSystems(flags);
    console.log('🔍 DIAGNOSTIC: selectSystems returned:', {
        stateManagerType: selectedSystems.stateManagerType,
        componentManagerType: selectedSystems.componentManagerType,
        rendererType: selectedSystems.rendererType,
        componentManagerAvailable: !!selectedSystems.componentManager,
        componentManagerValid: selectedSystems.componentManager && typeof selectedSystems.componentManager.addComponent === 'function'
    });
    
    console.log('🔍 DIAGNOSTIC: About to validate systems...');
    const validationResult = validateSystems(selectedSystems);
    
    if (!validationResult.valid) {
        console.error('❌ ConditionalLoader: System validation failed:', validationResult.errors);
        throw new Error(`System validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    console.log('🔍 DIAGNOSTIC: Systems validated, starting global exposure...');
    
    // Expose systems globally - synchronous assignment
    window.stateManager = selectedSystems.stateManager;
    window.componentManager = selectedSystems.componentManager;
    window.renderer = selectedSystems.renderer;
    window.initializer = selectedSystems.initializer;
    
    console.log('🔍 DIAGNOSTIC: Basic globals assigned');
    
    // PHASE 3 FIX: Expose enhanced systems globally
    if (selectedSystems.stateManagerType === 'enhanced') {
        window.enhancedStateManager = selectedSystems.stateManager;
        console.log('✅ Enhanced State Manager exposed globally');
    }
    
    console.log('🔍 DIAGNOSTIC: About to check component manager type:', selectedSystems.componentManagerType);
    
    if (selectedSystems.componentManagerType === 'enhanced') {
        console.log('🔍 Component manager exposure check:', {
            selectedSystem: selectedSystems.componentManager,
            type: typeof selectedSystems.componentManager,
            constructor: selectedSystems.componentManager?.constructor?.name,
            isEnhancedManager: selectedSystems.componentManager === enhancedComponentManager,
            enhancedComponentManagerImport: !!enhancedComponentManager,
            addComponentExists: typeof selectedSystems.componentManager?.addComponent
        });
        
        // CRITICAL FIX: Force direct assignment from import
        window.enhancedComponentManager = enhancedComponentManager;
        console.log('✅ Enhanced Component Manager exposed globally (direct from import)');
        
        // Also ensure componentManager points to enhanced version
        window.componentManager = enhancedComponentManager;
        console.log('✅ Component Manager also points to enhanced version');
        
        // Triple verify exposure worked
        console.log('🔍 VERIFICATION - Enhanced Component Manager exposure:', {
            windowEnhancedComponentManager: !!window.enhancedComponentManager,
            windowComponentManager: !!window.componentManager,
            bothPointToSame: window.componentManager === window.enhancedComponentManager,
            hasAddComponent: typeof window.enhancedComponentManager?.addComponent === 'function',
            isCorrectInstance: window.enhancedComponentManager === enhancedComponentManager
        });
        
        if (!window.enhancedComponentManager) {
            console.error('❌ CRITICAL: Enhanced component manager exposure failed!');
            console.error('Attempting emergency fix...');
            // Emergency fix - create a getter
            Object.defineProperty(window, 'enhancedComponentManager', {
                get: () => enhancedComponentManager,
                configurable: true
            });
            console.log('🚨 Emergency getter created for enhancedComponentManager');
        }
    } else {
        console.log(`🛠️ Component manager type is '${selectedSystems.componentManagerType}', not exposing enhanced version`);
    }
    
    // PHASE 3 FIX: Initialize and expose Phase 3 systems
    initializePhase3Systems();
    
    // PHASE 3 FIX: Additional global exposure for testing
    if (selectedSystems.componentManagerType === 'enhanced') {
        // Double-ensure enhanced component manager is available
        window.enhancedComponentManager = selectedSystems.componentManager;
        console.log('✅ Enhanced Component Manager re-confirmed globally available');
    }
    
    console.log('✅ ConditionalLoader: Systems loaded and validated');
    console.log('📊 ConditionalLoader: System selection:', {
        stateManager: selectedSystems.stateManagerType,
        componentManager: selectedSystems.componentManagerType,
        renderer: selectedSystems.rendererType,
        initializer: selectedSystems.initializerType
    });
    
    // Log global availability for debugging
    console.log('🔍 ConditionalLoader: Global system availability:', {
        stateManager: !!window.stateManager,
        componentManager: !!window.componentManager,
        enhancedStateManager: !!window.enhancedStateManager,
        enhancedComponentManager: !!window.enhancedComponentManager,
        renderer: !!window.renderer,
        initializer: !!window.initializer
    });
    
    perfEnd();
    
    // FINAL VERIFICATION: Ensure enhanced component manager is truly accessible
    console.log('🎆 FINAL VERIFICATION - Enhanced Component Manager Status:');
    console.log('  window.enhancedComponentManager:', !!window.enhancedComponentManager);
    console.log('  window.componentManager:', !!window.componentManager);
    console.log('  Both are same instance:', window.componentManager === window.enhancedComponentManager);
    console.log('  Has addComponent method:', typeof window.enhancedComponentManager?.addComponent === 'function');
    console.log('  Direct import available:', !!enhancedComponentManager);
    
    if (!window.enhancedComponentManager && selectedSystems.componentManagerType === 'enhanced') {
        console.error('🚨 CRITICAL FINAL CHECK: Enhanced component manager selected but not exposed!');
        console.error('Attempting final fix...');
        window.enhancedComponentManager = enhancedComponentManager;
        window.componentManager = enhancedComponentManager;
        console.log('🔧 Final fix applied');
    }
    
    return selectedSystems;
}

/**
 * Selects the appropriate systems based on feature flags
 * @param {object} flags - Feature flags configuration
 * @returns {object} Selected systems with metadata
 */
function selectSystems(flags) {
    console.log('🔍 DIAGNOSTIC: selectSystems called with flags:', {
        USE_ENHANCED_STATE_MANAGER: flags.USE_ENHANCED_STATE_MANAGER,
        USE_ENHANCED_COMPONENT_MANAGER: flags.USE_ENHANCED_COMPONENT_MANAGER,
        USE_ENHANCED_COMPONENT_RENDERER: flags.USE_ENHANCED_COMPONENT_RENDERER
    });
    
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
    
    console.log('🔍 DIAGNOSTIC: Initial systems object created');
    
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
    
    console.log('🔍 DIAGNOSTIC: State manager selected:', systems.stateManagerType);
    
    // CRITICAL: Check enhanced component manager availability BEFORE selection
    console.log('🔍 DIAGNOSTIC: Enhanced component manager pre-check:', {
        enhancedComponentManagerExists: !!enhancedComponentManager,
        enhancedComponentManagerType: typeof enhancedComponentManager,
        enhancedComponentManagerConstructor: enhancedComponentManager?.constructor?.name,
        enhancedComponentManagerMethods: enhancedComponentManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(enhancedComponentManager)) : 'N/A'
    });
    
    // Select Component Manager
    if (flags.USE_ENHANCED_COMPONENT_MANAGER) {
        console.log('🔧 USE_ENHANCED_COMPONENT_MANAGER flag is TRUE - attempting enhanced selection');
        
        // CRITICAL: Log the actual import to debug the issue
        console.log('🔍 Enhanced component manager import check:', {
            importAvailable: !!enhancedComponentManager,
            importType: typeof enhancedComponentManager,
            isObject: enhancedComponentManager && typeof enhancedComponentManager === 'object',
            hasInit: enhancedComponentManager && typeof enhancedComponentManager.init === 'function',
            hasAddComponent: enhancedComponentManager && typeof enhancedComponentManager.addComponent === 'function',
            methods: enhancedComponentManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(enhancedComponentManager)).slice(0, 10) : []
        });
        
        // Force use enhanced component manager regardless of method check
        // The methods might not be available until after init() is called
        if (enhancedComponentManager) {
            systems.componentManager = enhancedComponentManager;
            systems.componentManagerType = 'enhanced';
            console.log('✅ Enhanced component manager selected (forced)');
            console.log('🔍 Selected component manager:', {
                hasInit: typeof systems.componentManager.init === 'function',
                hasAddComponent: typeof systems.componentManager.addComponent === 'function',
                hasHandleControls: typeof systems.componentManager.handleControls === 'function'
            });
        } else {
            console.error('❌ CRITICAL: Enhanced component manager import is null/undefined!');
            console.error('This should never happen - check the import statement');
            systems.componentManager = componentManager;
            systems.componentManagerType = 'legacy-emergency-fallback';
        }
    } else {
        console.log('🔧 USE_ENHANCED_COMPONENT_MANAGER flag is FALSE - using legacy');
        systems.componentManager = componentManager;
        systems.componentManagerType = 'legacy';
    }
    
    console.log('🔍 DIAGNOSTIC: Component manager selected:', {
        type: systems.componentManagerType,
        available: !!systems.componentManager,
        addComponentMethod: systems.componentManager ? typeof systems.componentManager.addComponent : 'N/A'
    });
    
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

// Enhanced component manager should already be exposed by now
if (!window.enhancedComponentManager && enhancedComponentManager) {
    console.error('🚨 CRITICAL: Enhanced component manager still missing after initialization!');
    console.error('This should not happen - check initialization sequence');
    // Final attempt to fix
    window.enhancedComponentManager = enhancedComponentManager;
    console.log('🚨 EMERGENCY: Final attempt to expose enhanced component manager');
}

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
    
    // Verify enhanced component manager is still exposed
    if (!window.enhancedComponentManager) {
        console.error('🚨 Phase3Systems: Enhanced component manager missing from window!');
        console.error('This indicates a serious initialization problem');
        
        // Log diagnostic info
        console.log('🔍 Phase3Systems: Diagnostic info:', {
            enhancedComponentManagerImport: !!enhancedComponentManager,
            windowComponentManager: !!window.componentManager,
            componentManagerType: window.componentManager?.constructor?.name,
            hasAddComponent: typeof window.componentManager?.addComponent
        });
        
        // Do NOT reassign - this might be overwriting the correct instance
        // The assignment should have already happened in the main flow
    } else {
        console.log('✅ Phase3Systems: Enhanced component manager verified present');
    }
    
    // Log system availability for debugging
    const phase3Systems = {
        stateValidator: !!window.stateValidator,
        uiRegistry: !!window.uiRegistry,
        stateHistory: !!window.stateHistory,
        eventBus: !!window.eventBus,
        enhancedStateManager: !!window.enhancedStateManager,
        enhancedComponentManager: !!window.enhancedComponentManager
    };
    
    console.log('📊 ConditionalLoader: Phase 3 systems status:', phase3Systems);
    
    const workingSystems = Object.values(phase3Systems).filter(Boolean).length;
    console.log(`✅ ConditionalLoader: ${workingSystems}/6 Phase 3 systems initialized`);
    
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
