/**
 * @file main.js - Media Kit Builder (WordPress-Compatible Entry Point)
 * @description Initializes and coordinates all core application modules using global objects.
 */

// IMMEDIATE DEBUG LOG - Should appear first
console.log('%c🚀 GMKB main.js LOADING (WORDPRESS COMPATIBLE)...', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 3px;');
console.log('📜 Script URL:', document.currentScript?.src || 'unknown');
console.log('📜 Load time:', new Date().toISOString());
console.log('🔧 ARCHITECTURE: WordPress-compatible global namespace structure');
console.log('✅ ROOT FIX: Using global objects instead of ES6 imports');

// Wait for dependencies to be loaded via WordPress enqueue system
function initializeWhenReady() {
    // Check if all required global objects are available
    if (typeof window.GMKB !== 'undefined' && 
        typeof window.UICoordinator !== 'undefined' &&
        typeof window.StateManager !== 'undefined' &&
        typeof window.ComponentManager !== 'undefined') {
        
        console.log('✅ GMKB: All dependencies loaded, initializing...');
        
        // Attach systems to GMKB namespace for organization
        window.GMKB.systems = window.GMKB.systems || {};
        window.GMKB.systems.StateManager = window.StateManager;
        window.GMKB.systems.ComponentManager = window.ComponentManager;
        window.GMKB.systems.UICoordinator = window.UICoordinator;
        
        // Initialize the UI Coordinator
        if (typeof window.UICoordinator.init === 'function') {
            window.UICoordinator.init();
            console.log('✅ GMKB: Application initialized successfully.');
        } else {
            console.error('❌ GMKB: UICoordinator.init is not a function');
        }
        
    } else {
        console.log('⏳ GMKB: Waiting for dependencies to load...');
        console.log('  GMKB:', typeof window.GMKB);
        console.log('  UICoordinator:', typeof window.UICoordinator);
        console.log('  StateManager:', typeof window.StateManager);
        console.log('  ComponentManager:', typeof window.ComponentManager);
        
        // Retry after a short delay
        setTimeout(initializeWhenReady, 100);
    }
}

// Initialize when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
} else {
    initializeWhenReady();
}
