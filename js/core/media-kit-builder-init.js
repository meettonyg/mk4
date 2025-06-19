/**
 * @file media-kit-builder-init.js
 * @description Initializes the Media Kit Builder application, including core services and UI components.
 * This is the main entry point for the enhanced, feature-flag-driven initialization sequence.
 *
 * This version includes a critical fix to remove a redundant DOMContentLoaded listener, which was
 * creating a race condition and preventing UI components from initializing correctly.
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
import {
    saveService
} from '../services/save-service.js';
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
 * This is now called by the initialization manager to ensure proper sequencing.
 */
export async function initializeEnhancedBuilder() {
    console.log('Media Kit Builder: Starting enhanced initialization...');

    // 1. Initialize services that don't depend on the DOM.
    keyboardService.init();
    enhancedComponentRenderer.init();

    // 2. Restore State from localStorage.
    restoreState();

    // 3. Set up Global Event Listeners like autosave.
    setupGlobalEventListeners();

    console.log('Media Kit Builder: Enhanced initialization complete.');
}

/**
 * Validates prerequisites before initialization
 */
function validatePrerequisites() {
    console.log('🔍 Validating prerequisites...');
    
    // Wait for DOM to be fully ready including all included PHP files
    if (document.readyState !== 'complete') {
        console.log('⏳ Waiting for document.readyState to be complete...');
        return new Promise(resolve => {
            const checkReady = () => {
                if (document.readyState === 'complete') {
                    console.log('✅ Document fully loaded');
                    resolve();
                } else {
                    setTimeout(checkReady, 10);
                }
            };
            checkReady();
        });
    }
    
    // Check for required DOM elements
    const requiredElements = [
        'media-kit-preview',
        'preview-container'
    ];
    
    for (const elementId of requiredElements) {
        if (!document.getElementById(elementId)) {
            throw new Error(`Required DOM element not found: ${elementId}`);
        }
    }
    
    // Check for guestifyData
    if (!window.guestifyData) {
        // Try backup data
        if (window.guestifyDataBackup) {
            console.log('📦 Using backup guestifyData');
            window.guestifyData = window.guestifyDataBackup;
        } else {
            throw new Error('guestifyData not available and no backup found');
        }
    }
    
    // Validate plugin URL
    if (!window.guestifyData.pluginUrl) {
        throw new Error('Plugin URL not available in guestifyData');
    }
    
    // Set global plugin URL
    window.GUESTIFY_PLUGIN_URL = window.guestifyData.pluginUrl;
    
    console.log('✅ Prerequisites validated successfully');
    return Promise.resolve();
}

/**
 * Restores the application state from localStorage.
 */
function restoreState() {
    console.log('💾 Restoring state...');
    const savedState = saveService.loadState();
    if (savedState && Object.keys(savedState.components).length > 0) {
        console.log('📦 Found saved data, loading...');
        enhancedStateManager.setInitialState(savedState);
    } else {
        console.log('🆕 No saved state found, starting with a clean slate.');
    }
    console.log('✅ State restored successfully.');
}

/**
 * Sets up core UI elements of the builder.
 * Exported so it can be called by the initialization manager.
 */
export function initializeUI() {
    console.log('Initializing UI...');
    setupTabs();
    initializeLayout(); // Sets up drag-and-drop
    updateEmptyState(); // Now that the DOM is ready, check the empty state.
    console.log('UI initialized.');
}

/**
 * Initializes feature-specific systems like modals.
 * This is now called by the initialization manager after ensuring modal HTML is ready.
 */
export function initializeFeatureSystems() {
    console.log('Initializing feature systems...');
    setupComponentLibrary();
    templateLoader.init();
    globalSettings.init();
    console.log('Feature systems initialized.');
}

/**
 * Sets up global event listeners for the application.
 */
function setupGlobalEventListeners() {
    console.log('Setting up event listeners...');
    // Autosave the state whenever it changes.
    enhancedStateManager.subscribeGlobal(state => {
        saveService.saveState(state);
    });
    console.log('Event listeners setup complete.');
}
