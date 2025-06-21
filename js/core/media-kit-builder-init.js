/**
 * @file media-kit-builder-init.js
 * @description Initializes the Media Kit Builder application, including core services and UI components.
 * This is the main entry point for the enhanced, feature-flag-driven initialization sequence.
 *
 * REFACTORED: This version centralizes state restoration and saving within the
 * EnhancedStateManager, removing redundant logic and ensuring the correct
 * initialization sequence is followed for reliable component rendering.
 */
import {
    enhancedStateManager
} from './enhanced-state-manager.js';
import {
    enhancedComponentRenderer
} from './enhanced-component-renderer.js';
import {
    setupComponentLibrary
} from '../modals/component-library.js';
import {
    initializeLayout,
    updateEmptyState
} from '../ui/layout.js';
import {
    setupTabs
} from '../ui/tabs.js';
// REMOVED: saveService is no longer needed here for loading or subscribing.
import {
    templateLoader
} from '../services/template-loader.js';
import {
    keyboardService
} from '../services/keyboard-service.js';
import {
    globalSettings
} from '../modals/global-settings.js';


/**
 * Initializes the entire Media Kit Builder application with the enhanced architecture.
 * This function orchestrates the startup sequence to ensure all systems are ready.
 */
export async function initializeEnhancedBuilder() {
    console.log('Media Kit Builder: Starting enhanced initialization...');

    // 1. Initialize services that don't depend on the DOM.
    keyboardService.init();

    // 2. The renderer MUST be initialized before the state manager
    //    so it can subscribe to state changes before any data is loaded.
    enhancedComponentRenderer.init();

    // 3. Initialize core UI elements that are always present in the DOM.
    initializeUI();

    // 4. Initialize feature systems like modals.
    initializeFeatureSystems();

    // 5. Let the state manager handle its own state restoration.
    //    This method will correctly load from localStorage and notify all subscribers,
    //    including the renderer, to trigger the initial render.
    enhancedStateManager.initializeAfterSystems();

    console.log('✅ Enhanced initialization complete.');
}

/**
 * Sets up core UI elements of the builder.
 */
export function initializeUI() {
    console.log('Initializing UI...');
    setupTabs();
    initializeLayout();
    updateEmptyState();
    console.log('UI initialized.');
}

/**
 * Initializes feature-specific systems like modals.
 */
export function initializeFeatureSystems() {
    console.log('Initializing feature systems...');
    setupComponentLibrary();
    templateLoader.init();
    globalSettings.init();
    console.log('Feature systems initialized.');
}

// REMOVED: The `restoreState` function is no longer needed.
// The logic is now correctly handled by `enhancedStateManager.initializeAfterSystems()`.

// REMOVED: The `setupGlobalEventListeners` function is no longer needed.
// Auto-saving is now handled internally by the Enhanced State Manager.

