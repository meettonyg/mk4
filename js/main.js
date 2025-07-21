/**
 * @file main.js - Media Kit Builder (WordPress-Compatible Entry Point)
 * @description Initializes and coordinates all core application modules using global objects.
 * ROOT FIX: Enhanced with proper initialization sequence and fallback handling
 */

// IMMEDIATE DEBUG LOG - Should appear first
console.log('%c🚀 GMKB main.js LOADING (ENHANCED WORDPRESS COMPATIBLE)...', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 3px;');
console.log('📜 Script URL:', document.currentScript?.src || 'unknown');
console.log('📜 Load time:', new Date().toISOString());
console.log('🔧 ARCHITECTURE: Enhanced WordPress-compatible global namespace with proper initialization');
console.log('✅ ROOT FIX: Using enhanced initialization sequence with fallback handling');

// ROOT FIX: Enhanced initialization with proper dependency checking
function initializeWhenReady() {
    console.log('🚀 GMKB: Starting enhanced initialization sequence');
    
    // ROOT FIX: Check for core dependencies first
    const coreReady = checkCoreDependencies();
    if (!coreReady.ready) {
        console.log('⏳ GMKB: Waiting for core dependencies:', coreReady.missing);
        setTimeout(initializeWhenReady, 100);
        return;
    }
    
    // Initialize structured logger first
    if (window.structuredLogger) {
        window.structuredLogger.logInitStart('main-initialization');
    }
    
    try {
        // Initialize core systems in proper order
        initializeCoreSystemsSequence();
        
        // Initialize UI components
        initializeUIComponents();
        
        // Initialize modals and overlays
        initializeModalsAndOverlays();
        
        // Initialize empty state handlers
        initializeEmptyStateSystem();
        
        // Emit application ready event
        if (window.eventBus) {
            window.eventBus.emit('gmkb:application-ready', {
                timestamp: Date.now(),
                initializationComplete: true
            });
        }
        
        console.log('✅ GMKB: Enhanced application initialization completed successfully.');
        
        if (window.structuredLogger) {
            window.structuredLogger.logInitComplete('main-initialization', performance.now());
        }
        
    } catch (error) {
        console.error('❌ GMKB: Initialization failed:', error);
        if (window.structuredLogger) {
            window.structuredLogger.logInitError('main-initialization', error);
        }
        
        // ROOT FIX: Try fallback initialization instead of complete failure
        console.log('🔄 GMKB: Attempting fallback initialization...');
        initializeFallbackSystems();
    }
}

/**
 * ROOT FIX: Check for core dependencies
 */
function checkCoreDependencies() {
    const required = {
        'guestifyData': window.guestifyData || window.gmkbData,
        'structuredLogger': window.structuredLogger
    };
    
    const optional = {
        'enhancedStateManager': window.enhancedStateManager,
        'enhancedComponentManager': window.enhancedComponentManager,
        'enhancedComponentRenderer': window.enhancedComponentRenderer
    };
    
    const missing = [];
    Object.entries(required).forEach(([name, value]) => {
        if (!value) missing.push(name);
    });
    
    const availableOptional = [];
    Object.entries(optional).forEach(([name, value]) => {
        if (value) availableOptional.push(name);
    });
    
    if (availableOptional.length > 0) {
        console.log('📎 GMKB: Optional enhanced systems available:', availableOptional.join(', '));
    }
    
    return {
        ready: missing.length === 0,
        missing,
        availableOptional
    };
}

/**
 * ROOT FIX: Initialize core systems in proper sequence
 */
function initializeCoreSystemsSequence() {
    console.log('🔧 GMKB: Initializing core systems sequence');
    
    // 1. Initialize state management
    if (window.enhancedStateManager) {
        // ROOT FIX: Check if initializeAfterSystems method exists instead of initialize
        if (typeof window.enhancedStateManager.initializeAfterSystems === 'function') {
            window.enhancedStateManager.initializeAfterSystems();
            console.log('✅ GMKB: Enhanced state manager initialized via initializeAfterSystems');
        } else if (typeof window.enhancedStateManager.initialize === 'function') {
            window.enhancedStateManager.initialize();
            console.log('✅ GMKB: Enhanced state manager initialized via initialize');
        } else {
            console.log('⚠️ GMKB: Enhanced state manager available but no initialization method found');
        }
    } else {
        console.log('⚠️ GMKB: Enhanced state manager not available');
    }
    
    // 2. Initialize component management
    if (window.enhancedComponentManager) {
        if (typeof window.enhancedComponentManager.initialize === 'function') {
            window.enhancedComponentManager.initialize();
            console.log('✅ GMKB: Enhanced component manager initialized');
        } else if (typeof window.enhancedComponentManager.init === 'function') {
            window.enhancedComponentManager.init();
            console.log('✅ GMKB: Enhanced component manager initialized via init');
        } else {
            console.log('⚠️ GMKB: Enhanced component manager available but no initialization method found');
        }
    } else {
        console.log('⚠️ GMKB: Enhanced component manager not available');
    }
    
    // 3. Initialize component renderer
    if (window.enhancedComponentRenderer) {
        if (typeof window.enhancedComponentRenderer.initialize === 'function') {
            window.enhancedComponentRenderer.initialize();
            console.log('✅ GMKB: Enhanced component renderer initialized');
        } else if (typeof window.enhancedComponentRenderer.init === 'function') {
            window.enhancedComponentRenderer.init();
            console.log('✅ GMKB: Enhanced component renderer initialized via init');
        } else {
            console.log('⚠️ GMKB: Enhanced component renderer available but no initialization method found');
        }
    } else {
        console.log('⚠️ GMKB: Enhanced component renderer not available');
    }
}

/**
 * ROOT FIX: Enhanced UI component initialization
 */
function initializeUIComponents() {
    console.log('🎨 GMKB: Initializing UI components');
    
    try {
        // Initialize tabs if available
        if (window.setupTabs && typeof window.setupTabs === 'function') {
            window.setupTabs();
            console.log('✅ GMKB: Tabs initialized');
        } else {
            console.log('⚠️ GMKB: Tabs setup function not available');
        }
        
        // Initialize layout system
        if (window.setupLayout && typeof window.setupLayout === 'function') {
            window.setupLayout();
            console.log('✅ GMKB: Layout system initialized');
        }
        
        // Initialize preview system
        if (window.setupPreview && typeof window.setupPreview === 'function') {
            window.setupPreview();
            console.log('✅ GMKB: Preview system initialized');
        }
        
        // Initialize element controls
        if (window.setupElementControls && typeof window.setupElementControls === 'function') {
            window.setupElementControls();
            console.log('✅ GMKB: Element controls initialized');
        }
        
    } catch (error) {
        console.error('❌ GMKB: Error initializing UI components', error);
        if (window.structuredLogger) {
            window.structuredLogger.error('UI', 'UI component initialization failed', error);
        }
    }
}

/**
 * ROOT FIX: Initialize modals and overlays
 */
function initializeModalsAndOverlays() {
    console.log('📋 GMKB: Initializing modals and overlays');
    
    try {
        // Initialize modal base system
        if (window.setupModals && typeof window.setupModals === 'function') {
            window.setupModals();
            console.log('✅ GMKB: Modal base system initialized');
        }
        
        // Initialize component library
        if (window.setupComponentLibrary && typeof window.setupComponentLibrary === 'function') {
            window.setupComponentLibrary();
            console.log('✅ GMKB: Component library initialized');
        }
        
        // Initialize export system
        if (window.setupExportSystem && typeof window.setupExportSystem === 'function') {
            window.setupExportSystem();
            console.log('✅ GMKB: Export system initialized');
        }
        
        // Initialize global settings
        if (window.setupGlobalSettings && typeof window.setupGlobalSettings === 'function') {
            window.setupGlobalSettings();
            console.log('✅ GMKB: Global settings initialized');
        }
        
    } catch (error) {
        console.error('❌ GMKB: Error initializing modals', error);
        if (window.structuredLogger) {
            window.structuredLogger.error('MODAL', 'Modal initialization failed', error);
        }
    }
}

/**
 * ROOT FIX: Initialize empty state system
 */
function initializeEmptyStateSystem() {
    console.log('🔄 GMKB: Initializing empty state system');
    
    try {
        // Initialize empty state handlers
        if (window.emptyStateHandlers && typeof window.emptyStateHandlers.init === 'function') {
            window.emptyStateHandlers.init();
            console.log('✅ GMKB: Empty state handlers initialized');
        } else {
            console.log('⚠️ GMKB: Empty state handlers not available');
        }
        
    } catch (error) {
        console.error('❌ GMKB: Error initializing empty state system', error);
        if (window.structuredLogger) {
            window.structuredLogger.error('EMPTY_STATE', 'Empty state initialization failed', error);
        }
    }
}

/**
 * ROOT FIX: Fallback initialization when enhanced systems fail
 */
function initializeFallbackSystems() {
    console.log('🛟 GMKB: Starting fallback initialization');
    
    try {
        // Basic UI initialization without enhanced systems
        if (window.setupTabs && typeof window.setupTabs === 'function') {
            window.setupTabs();
            console.log('✅ GMKB: Fallback - Tabs initialized');
        }
        
        if (window.setupModals && typeof window.setupModals === 'function') {
            window.setupModals();
            console.log('✅ GMKB: Fallback - Modals initialized');
        }
        
        // Initialize empty state handlers with basic mode
        if (window.emptyStateHandlers) {
            try {
                window.emptyStateHandlers.init();
                console.log('✅ GMKB: Fallback - Empty state handlers initialized');
            } catch (e) {
                console.log('⚠️ GMKB: Fallback - Empty state handlers failed:', e.message);
            }
        }
        
        // Try to initialize component library in basic mode
        if (window.setupComponentLibrary && typeof window.setupComponentLibrary === 'function') {
            try {
                window.setupComponentLibrary();
                console.log('✅ GMKB: Fallback - Component library initialized');
            } catch (e) {
                console.log('⚠️ GMKB: Fallback - Component library failed:', e.message);
            }
        }
        
        console.log('✅ GMKB: Fallback initialization completed successfully');
        
    } catch (error) {
        console.error('❌ GMKB: Fallback initialization also failed:', error);
        console.log('🛟 GMKB: Basic mode - only core WordPress functionality available');
    }
}

/**
 * ROOT FIX: Legacy initialization fallback
 */
function legacyInitialization() {
    // Check if all required global objects are available
    if (typeof window.GMKB !== 'undefined' && 
        typeof window.UICoordinator !== 'undefined' &&
        typeof window.StateManager !== 'undefined' &&
        typeof window.ComponentManager !== 'undefined') {
        
        console.log('✅ GMKB: Legacy dependencies loaded, initializing...');
        
        // Attach systems to GMKB namespace for organization
        window.GMKB.systems = window.GMKB.systems || {};
        window.GMKB.systems.StateManager = window.StateManager;
        window.GMKB.systems.ComponentManager = window.ComponentManager;
        window.GMKB.systems.UICoordinator = window.UICoordinator;
        
        // Initialize the UI Coordinator
        if (typeof window.UICoordinator.init === 'function') {
            window.UICoordinator.init();
            console.log('✅ GMKB: Legacy application initialized successfully.');
        } else {
            console.error('❌ GMKB: UICoordinator.init is not a function');
        }
        
    } else {
        console.log('⏳ GMKB: Waiting for legacy dependencies to load...');
        console.log('  GMKB:', typeof window.GMKB);
        console.log('  UICoordinator:', typeof window.UICoordinator);
        console.log('  StateManager:', typeof window.StateManager);
        console.log('  ComponentManager:', typeof window.ComponentManager);
        
        // Retry after a short delay
        setTimeout(legacyInitialization, 100);
    }
}

// ROOT FIX: Ensure basic logger exists before any initialization
function ensureBasicLogger() {
    if (!window.structuredLogger) {
        window.structuredLogger = {
            info: (category, message, data) => console.log(`[${category}] ${message}`, data || ''),
            debug: (category, message, data) => console.debug(`[${category}] ${message}`, data || ''),
            warn: (category, message, data) => console.warn(`[${category}] ${message}`, data || ''),
            error: (category, message, error, data) => console.error(`[${category}] ${message}`, error, data || ''),
            logInitStart: (step) => {
                const startTime = performance.now();
                console.log(`[INIT] Starting: ${step}`);
                return startTime;
            },
            logInitComplete: (step, startTime) => {
                const duration = performance.now() - startTime;
                console.log(`[INIT] ✅ Completed: ${step} (${duration.toFixed(2)}ms)`);
                return duration;
            },
            logInitError: (step, error) => {
                console.error(`[INIT] ❌ Failed: ${step}`, error);
            }
        };
        console.log('🛟 Main: Created fallback structuredLogger before initialization');
    }
}

// ROOT FIX: Enhanced DOM ready handler with logger safety
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ensureBasicLogger();
        initializeWhenReady();
    });
} else {
    ensureBasicLogger();
    initializeWhenReady();
}
