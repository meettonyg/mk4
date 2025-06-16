/**
 * Main entry point for the Guestify Media Kit Builder
 * Enhanced with Schema-Driven Data Binding System
 */

import { resetState } from './state.js';
import { setupTabs } from './ui/tabs.js';
import { setupPreviewToggle } from './ui/preview.js';
import { setupDragAndDrop } from './ui/dnd.js';
import { setupElementSelection, setupContentEditableUpdates } from './ui/element-editor.js';
import { setupElementControls } from './ui/element-controls.js';
import { setupFormUpdates } from './ui/form-controls.js';
import { setupLayoutOptions } from './ui/layout.js';
import { setupSaveSystem } from './services/save-service.js';
import { setupKeyboardShortcuts } from './services/keyboard-service.js';
import { setupComponentLibraryModal } from './modals/component-library.js';
import { setupGlobalSettings } from './modals/global-settings.js';
import { setupExportSystem } from './modals/export.js';
import { setupShareSystem } from './services/share-service.js';
import { historyService } from './services/history-service.js';
import { initializeDynamicComponents } from './components/dynamic-component-loader.js';
import './components/design-panel-loader.js';

// Import enhanced system modules
import { stateManager } from './services/state-manager.js';
import { dataBindingEngine } from './services/data-binding-engine.js';
import { componentManager } from './components/component-manager.js';
import { componentRenderer } from './components/component-renderer.js';

/**
 * Check if enhanced system is available
 */
function isEnhancedSystemAvailable() {
    return typeof stateManager !== 'undefined' && 
           typeof dataBindingEngine !== 'undefined' &&
           typeof componentManager !== 'undefined' &&
           typeof componentRenderer !== 'undefined';
}

// Track initialization state
let enhancedInitialized = false;

/**
 * Initializes core UI modules that are required for the builder to function,
 * regardless of the data management system in use.
 */
function initializeCoreUI() {
    // Set up global plugin URL for component loading
    setupGlobalPluginUrl();
    
    setupTabs();
    setupPreviewToggle();
    setupDragAndDrop();
    setupElementSelection();
    setupElementControls();
    setupContentEditableUpdates();
    setupLayoutOptions();
    setupKeyboardShortcuts();
    setupComponentLibraryModal();
    setupGlobalSettings();
    setupExportSystem();
    setupShareSystem();
}

/**
 * Set up the global plugin URL variable for all components to use
 */
function setupGlobalPluginUrl() {
    // Initialize the guestifyMediaKitBuilder global object if it doesn't exist
    window.guestifyMediaKitBuilder = window.guestifyMediaKitBuilder || {};
    
    // Determine the plugin URL from various possible sources
    let pluginUrl = '';
    
    if (typeof guestifyData !== 'undefined') {
        if (guestifyData.pluginUrl) {
            pluginUrl = guestifyData.pluginUrl;
        } else if (guestifyData.plugin_url) {
            pluginUrl = guestifyData.plugin_url;
        }
    } else if (typeof gmkb_data !== 'undefined' && gmkb_data.plugin_url) {
        pluginUrl = gmkb_data.plugin_url;
    } else {
        // Try to determine from script tags
        const scriptTags = document.querySelectorAll('script[src*="guestify-media-kit-builder"]');
        if (scriptTags.length > 0) {
            const src = scriptTags[0].getAttribute('src');
            const match = src.match(/(.*\/guestify-media-kit-builder\/)/);
            if (match && match[1]) {
                pluginUrl = match[1];
            }
        }
        
        // Fallback to a standard path if nothing else works
        if (!pluginUrl) {
            pluginUrl = '/wp-content/plugins/guestify-media-kit-builder/';
        }
    }
    
    // Ensure pluginUrl ends with a slash
    if (pluginUrl && !pluginUrl.endsWith('/')) {
        pluginUrl += '/';
    }
    
    // Store in the global object
    window.guestifyMediaKitBuilder.pluginUrl = pluginUrl;
    
    console.log('Plugin URL set to:', pluginUrl);
}

/**
 * Initialize the enhanced builder features
 */
async function initializeEnhancedFeatures() {
    if (enhancedInitialized) {
        console.log('Enhanced features already initialized');
        return;
    }
    
    enhancedInitialized = true;
    console.log('Initializing enhanced schema-driven system...');
    
    try {
        // First, fully initialize the component manager
        // and ensure it's ready before proceeding
        if (componentManager) {
            if (!componentManager.initialized) {
                console.log('Initializing component manager...');
                await componentManager.init();
                // Wait a bit more to ensure it's really ready
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log('Component manager initialized:', componentManager.initialized);
        } else {
            console.error('Component manager not available');
        }
        
        // Initialize the component renderer
        if (componentRenderer) {
            if (!componentRenderer.initialized) {
                console.log('Initializing component renderer...');
                componentRenderer.init();
            }
            console.log('Component renderer initialized:', componentRenderer.initialized);
        } else {
            console.error('Component renderer not available');
        }
        
        // Initialize design panel system (handled by design-panel.js)
        if (window.gmkbDesignPanel) {
            window.gmkbDesignPanel.init();
        }
        
        // Subscribe to global state changes for UI updates
        stateManager.subscribeGlobal((state) => {
            // Update save indicator
            updateSaveIndicator(state);
            
            // Dispatch state change event for other systems
            document.dispatchEvent(new CustomEvent('gmkb-state-changed', {
                detail: { state }
            }));
        });
        
        // Now that everything is initialized, load existing data
        const urlParams = new URLSearchParams(window.location.search);
        const mediaKitId = urlParams.get('media_kit_id');
        
        if (mediaKitId) {
            await loadMediaKit(mediaKitId);
        } else {
            // If no ID provided, try to load from localStorage
            // No need to check for component manager initialization here
            // since we've already waited for it above
            console.log('Loading from localStorage without checking initialization');
            const savedData = localStorage.getItem('mediaKitData');
            
            if (savedData && window.stateManager) {
                try {
                    const mediaKitData = JSON.parse(savedData);
                    window.stateManager.loadSerializedState(mediaKitData);
                    
                    // Save current state to compare for unsaved changes
                    localStorage.setItem('gmkb_last_saved_state', savedData);
                    
                    console.log('Media kit loaded successfully from localStorage');
                    
                    // Show a toast notification to confirm the load
                    if (window.historyService && window.historyService.showToast) {
                        window.historyService.showToast('Your last session was restored.');
                    }
                } catch (error) {
                    console.error('Error loading media kit from localStorage:', error);
                    localStorage.removeItem('mediaKitData');
                    localStorage.removeItem('gmkb_last_saved_state');
                }
            }
        }
        
        console.log('Enhanced system initialized successfully');
        
        // Add enhanced indicator to UI
        addEnhancedIndicator();
        
    } catch (error) {
        console.error('Failed to initialize enhanced features:', error);
    }
}

/**
 * Initialize the builder with enhanced features if available
 */
async function initializeBuilder() {
    // Always initialize the core UI first, as it's needed in both modes.
    initializeCoreUI();

    const useEnhanced = isEnhancedSystemAvailable() && !window.gmkbForceLegacy;
    
    if (useEnhanced) {
        console.log('Using enhanced schema-driven system');
        await initializeEnhancedFeatures();
        
        // Set up save system with the enhanced features
        setupSaveSystem();
    } else {
        console.log('Using legacy system (fallback)');
        
        // These are the TRUE legacy functions that have been replaced by the enhanced system
        resetState(); 
        setupFormUpdates();
        setupSaveSystem(); 
        initializeDynamicComponents();
        historyService.init(); 
        
        // Save initial state for legacy undo/redo
        setTimeout(() => {
            if (window.saveCurrentState) {
                window.saveCurrentState();
            }
        }, 100);
    }
    
    // Add system info to console
    console.log('System Info:', {
        enhanced: useEnhanced,
        version: window.GMKB_VERSION || '2.2.0',
        components: componentManager ? componentManager.componentRegistry.size : 'N/A'
    });
}

/**
 * Load media kit from server
 */
async function loadMediaKit(mediaKitId) {
    try {
        const ajaxUrl = window.ajaxurl || window.gmkb_data?.ajax_url || window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php';
        const response = await fetch(ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'gmkb_load_media_kit',
                media_kit_id: mediaKitId,
                nonce: window.gmkb_data?.nonce || ''
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Load state into state manager
            window.stateManager.loadSerializedState(data.data.state);
            
            console.log('Media kit loaded successfully');
        } else {
            console.error('Failed to load media kit:', data.data);
        }
    } catch (error) {
        console.error('Error loading media kit:', error);
    }
}

// loadFromLocalStorage function has been removed
// Loading from localStorage is now handled directly in initializeEnhancedFeatures

/**
 * Update save indicator based on state
 */
function updateSaveIndicator(state) {
    const indicator = document.querySelector('.save-status');
    if (!indicator) return;
    
    // Check if state has unsaved changes
    const lastSaved = localStorage.getItem('gmkb_last_saved_state');
    const currentState = JSON.stringify(state);
    
    if (lastSaved !== currentState) {
        indicator.textContent = 'Unsaved changes';
        indicator.classList.add('unsaved');
    } else {
        indicator.textContent = 'All changes saved';
        indicator.classList.remove('unsaved');
    }
}

/**
 * Add enhanced system indicator to UI
 */
function addEnhancedIndicator() {
    const toolbar = document.querySelector('.mkb-toolbar__section--center');
    if (!toolbar) return;
    
    const indicator = document.createElement('span');
    indicator.className = 'gmkb-enhanced-indicator';
    indicator.textContent = 'Enhanced';
    indicator.title = 'Schema-Driven System Active';
    indicator.style.cssText = `
        background: #10b981;
        color: white;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 3px;
        font-weight: 500;
        margin-left: 10px;
    `;
    
    toolbar.appendChild(indicator);
}

/**
 * Global error handler for better debugging
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    // Show user-friendly error message
    const errorToast = document.createElement('div');
    errorToast.className = 'gmkb-error-toast';
    errorToast.textContent = 'An error occurred. Check console for details.';
    errorToast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 100000;
    `;
    
    document.body.appendChild(errorToast);
    
    setTimeout(() => {
        errorToast.remove();
    }, 5000);
});

// Initialize the builder when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBuilder);
} else {
    initializeBuilder();
}

// Add beforeunload event to prevent accidental navigation with unsaved changes
window.addEventListener('beforeunload', (event) => {
    // Check if there are unsaved changes
    if (getState('isUnsaved')) { 
        // Standard way to trigger the browser's confirmation dialog
        event.preventDefault();
        event.returnValue = '';
    }
});

// Export for debugging
window.gmkbDebug = {
    stateManager,
    dataBindingEngine,
    componentManager,
    componentRenderer,
    historyService,
    getState: () => stateManager ? stateManager.getState() : null,
    forceReload: () => window.location.reload(),
    resetAll: () => {
        if (componentManager) componentManager.initialized = false;
        if (componentRenderer) componentRenderer.initialized = false;
        window.location.reload();
    }
};

// Make managers globally accessible for legacy scripts and debugging
window.stateManager = stateManager;
window.componentManager = componentManager;
window.dataBindingEngine = dataBindingEngine;
window.historyService = historyService;
window.componentRenderer = componentRenderer;