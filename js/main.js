/**
 * @file main.js - Media Kit Builder (Refactored Entry Point)
 * @description Initializes and coordinates all core application modules.
 */
import { UICoordinator } from './core/ui-coordinator.js';
import { GMKB } from './core/gmkb.js';
import { StateManager } from './core/state-manager.js';
import { ComponentManager } from './managers/component-manager.js';

// IMMEDIATE DEBUG LOG - Should appear first
console.log('%c🚀 GMKB main.js LOADING (REFACTORED)...', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 3px;');
console.log('📜 Script URL:', document.currentScript?.src || 'unknown');
console.log('📜 Load time:', new Date().toISOString());
console.log('🔧 ARCHITECTURE: Modular ES6 structure with clean separation of concerns');
console.log('✅ REFACTORED: Clean entry point with module imports');

// Make systems available on the window for debugging and legacy compatibility
window.GMKB = GMKB;
window.StateManager = StateManager;
window.ComponentManager = ComponentManager;
window.UICoordinator = UICoordinator;

// Attach systems to GMKB namespace
GMKB.systems.StateManager = StateManager;
GMKB.systems.ComponentManager = ComponentManager;
GMKB.systems.UICoordinator = UICoordinator;

// Initialize when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', UICoordinator.init);
} else {
    UICoordinator.init();
}

console.log('✅ GMKB: Refactored application initialized successfully.');
