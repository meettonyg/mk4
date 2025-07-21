/**
 * @file main.js - Media Kit Builder (WordPress-Compatible Entry Point)
 * @description Initializes and coordinates all core application modules using global objects.
 * ROOT FIX: Enhanced with Global Object Manager for proper initialization sequence
 */

// IMMEDIATE DEBUG LOG - Should appear first
console.log('%c🚀 GMKB main.js LOADING (ENHANCED WORDPRESS COMPATIBLE)...', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 3px;');
console.log('📜 Script URL:', document.currentScript?.src || 'unknown');
console.log('📜 Load time:', new Date().toISOString());
console.log('🔧 ARCHITECTURE: Enhanced WordPress-compatible global namespace with proper initialization');
console.log('✅ ROOT FIX: Using Global Object Manager for coordinated system initialization');

// ROOT FIX: Enhanced initialization with Global Object Manager
function initializeWhenReady() {
    // Check if Global Object Manager is available
    if (typeof window.globalObjectManager !== 'undefined') {
        console.log('✅ GMKB: Global Object Manager available, using enhanced initialization');
        
        // Use Global Object Manager for proper initialization
        window.globalObjectManager.onReady(() => {
            console.log('✅ GMKB: All global objects ready, starting application');
            
            // Initialize UI components
            initializeUIComponents();
            
            // Emit application ready event
            if (window.eventBus) {
                window.eventBus.emit('gmkb:application-ready', {
                    timestamp: Date.now(),
                    systems: window.globalObjectManager.getStatus()
                });
            }
            
            console.log('✅ GMKB: Enhanced application initialization completed successfully.');
        });
        
    } else {
        console.log('⚠️ GMKB: Global Object Manager not available, falling back to legacy initialization');
        legacyInitialization();
    }
}

/**
 * ROOT FIX: Enhanced UI component initialization
 */
function initializeUIComponents() {
    try {
        // Initialize tabs if available
        if (window.setupTabs && typeof window.setupTabs === 'function') {
            window.setupTabs();
            console.log('✅ GMKB: Tabs initialized');
        }
        
        // Initialize modals if available
        if (window.setupModals && typeof window.setupModals === 'function') {
            window.setupModals();
            console.log('✅ GMKB: Modals initialized');
        }
        
        // Initialize component library if available
        if (window.setupComponentLibrary && typeof window.setupComponentLibrary === 'function') {
            window.setupComponentLibrary();
            console.log('✅ GMKB: Component library initialized');
        }
        
        // Initialize export system if available
        if (window.setupExportSystem && typeof window.setupExportSystem === 'function') {
            window.setupExportSystem();
            console.log('✅ GMKB: Export system initialized');
        }
        
    } catch (error) {
        console.error('❌ GMKB: Error initializing UI components', error);
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

// ROOT FIX: Enhanced DOM ready handler
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
} else {
    initializeWhenReady();
}
