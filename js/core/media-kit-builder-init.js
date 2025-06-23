/**
 * @file media-kit-builder-init.js
 * @description Provides the main application initializer system.
 * This is designed to be registered and called by the InitializationManager
 * after core systems are globally available.
 * 
 * GEMINI FIX: Refactored to be a proper initializer system that can be registered
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
    templateLoader
} from '../services/template-loader.js';
import {
    keyboardService
} from '../services/keyboard-service.js';
import {
    globalSettings
} from '../modals/global-settings.js';

class AppInitializer {
    constructor() {
        this.isInitialized = false;
        this.logger = window.structuredLogger || console;
    }

    /**
     * The main initialization sequence for the application UI and features.
     * This is called by the InitializationManager after core systems are ready.
     */
    async initialize() {
        if (this.isInitialized) {
            this.logger.warn?.('Initializer: Already initialized.') || console.warn('Initializer: Already initialized.');
            return true;
        }
        
        this.logger.info?.('Initializer: Starting application setup...') || console.log('Initializer: Starting application setup...');

        try {
            // 1. Initialize services that don't depend on the DOM.
            this.logger.debug?.('Initializer: Initializing keyboard service') || console.log('Initializer: Initializing keyboard service');
            keyboardService.init();

            // 2. The renderer MUST be initialized before the state manager
            //    so it can subscribe to state changes before any data is loaded.
            this.logger.debug?.('Initializer: Initializing enhanced component renderer') || console.log('Initializer: Initializing enhanced component renderer');
            enhancedComponentRenderer.init();

            // 3. Initialize core UI elements.
            this.logger.debug?.('Initializer: Setting up UI') || console.log('Initializer: Setting up UI');
            this.initializeUI();

            // 4. Initialize feature systems like modals.
            this.logger.debug?.('Initializer: Setting up feature systems') || console.log('Initializer: Setting up feature systems');
            this.initializeFeatureSystems();

            // 5. Let the state manager handle its own state restoration.
            //    This method will correctly load from localStorage and notify all subscribers,
            //    including the renderer, to trigger the initial render.
            this.logger.debug?.('Initializer: Initializing state manager post-systems') || console.log('Initializer: Initializing state manager post-systems');
            enhancedStateManager.initializeAfterSystems();

            this.isInitialized = true;
            this.logger.info?.('✅ Initializer: Application setup complete.') || console.log('✅ Initializer: Application setup complete.');
            return true;
            
        } catch (error) {
            this.logger.error?.('❌ Initializer: Application setup failed', error) || console.error('❌ Initializer: Application setup failed', error);
            throw error;
        }
    }

    /**
     * Sets up core UI elements of the builder.
     */
    initializeUI() {
        this.logger.debug?.('Initializing UI...') || console.log('Initializing UI...');
        setupTabs();
        initializeLayout();
        updateEmptyState();
        this.logger.debug?.('UI initialized.') || console.log('UI initialized.');
    }

    /**
     * Initializes feature-specific systems like modals.
     */
    initializeFeatureSystems() {
        this.logger.debug?.('Initializing feature systems...') || console.log('Initializing feature systems...');
        setupComponentLibrary();
        templateLoader.init();
        globalSettings.init();
        this.logger.debug?.('Feature systems initialized.') || console.log('Feature systems initialized.');
    }
    
    /**
     * Get initializer status for debugging
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            availableMethods: {
                initialize: typeof this.initialize === 'function',
                initializeUI: typeof this.initializeUI === 'function',
                initializeFeatureSystems: typeof this.initializeFeatureSystems === 'function'
            }
        };
    }
}

export const initializer = new AppInitializer();

// GEMINI FIX: Also export the individual functions for backward compatibility
export function initializeUI() {
    return initializer.initializeUI();
}

export function initializeFeatureSystems() {
    return initializer.initializeFeatureSystems();
}

export async function initializeEnhancedBuilder() {
    return await initializer.initialize();
}

// GEMINI FIX: Expose globally for debugging
window.appInitializer = initializer;

