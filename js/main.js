/**
 * Main entry point for the Guestify Media Kit Builder
 * FINAL, ROBUST VERSION
 */

// Core Architecture Modules
import { stateManager } from './services/state-manager.js';
import { componentManager } from './components/component-manager.js';
import { componentRenderer } from './components/component-renderer.js';
import { historyService } from './services/history-service.js';

// All other UI, Service, and Modal imports remain the same...
import { setupTabs } from './ui/tabs.js';
import { setupPreviewToggle } from './ui/preview.js';
import { setupDragAndDrop } from './ui/dnd.js';
import { setupElementSelection, setupContentEditableUpdates } from './ui/element-editor.js';
import { setupLayoutOptions } from './ui/layout.js';
import { setupSaveSystem } from './services/save-service.js';
import { setupKeyboardShortcuts } from './services/keyboard-service.js';
import { setupShareSystem } from './services/share-service.js';
import { setupComponentLibraryModal } from './modals/component-library.js';
import { setupGlobalSettings } from './modals/global-settings.js';
import { setupExportSystem } from './modals/export.js';
import './modals/template-library.js';


// --- Main Initialization Sequence ---

async function initializeBuilder() {
    console.log('Guestify Media Kit Builder: Initializing...');
    
    // 1. Set up globals
    setupGlobalPluginUrl();

    // 2. Initialize all UI modules
    setupCoreUI();

    // 3. Initialize the core architectural managers in order
    await componentManager.init();
    componentRenderer.init();
    historyService.init();
    
    if (window.gmkbDesignPanel) {
        window.gmkbDesignPanel.init();
    }
    
    // 4. Load data. The renderer is now fully initialized and subscribed.
    const urlParams = new URLSearchParams(window.location.search);
    const mediaKitId = urlParams.get('media_kit_id');
    if (mediaKitId) {
        await loadMediaKitFromServer(mediaKitId);
    } else {
        loadMediaKitFromStorage();
    }
    
    // 5. Final setup
    setupSaveSystem();
    console.log('System Initialization Complete.');
}

function loadMediaKitFromStorage() {
    const savedData = localStorage.getItem('mediaKitData');
    if (!savedData) {
        console.log('No saved data. Starting with a blank canvas.');
        componentRenderer.updateEmptyState();
        return;
    }

    console.log('Saved data found. Loading into state manager.');
    try {
        const mediaKitData = JSON.parse(savedData);
        // This is the key: simply load the state. The renderer will react.
        stateManager.loadSerializedState(mediaKitData);
        localStorage.setItem('gmkb_last_saved_state', savedData);
        if (window.historyService?.showToast) {
            window.historyService.showToast('Your last session was restored.');
        }
    } catch (error) {
        console.error('Error loading media kit from localStorage:', error);
        localStorage.removeItem('mediaKitData');
    }
}

function setupCoreUI() {
    setupTabs();
    setupPreviewToggle();
    setupDragAndDrop();
    setupElementSelection();
    setupContentEditableUpdates();
    setupLayoutOptions();
    setupKeyboardShortcuts();
    setupComponentLibraryModal();
    setupGlobalSettings();
    setupExportSystem();
    setupShareSystem();
}

async function loadMediaKitFromServer(mediaKitId) {
    console.log(`Loading media kit ID: ${mediaKitId} from server.`);
    try {
        const ajaxUrl = window.ajaxurl || window.gmkb_data?.ajax_url || '/wp-content/plugins/guestify-media-kit-builder/admin-ajax.php';
        const response = await fetch(ajaxUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'gmkb_load_media_kit',
                media_kit_id: mediaKitId,
                nonce: window.gmkb_data?.nonce || ''
            })
        });
        const data = await response.json();
        if (data.success) {
            stateManager.loadSerializedState(data.data.state);
            console.log('Media kit loaded successfully from server.');
        } else {
            console.error('Failed to load media kit from server:', data.data);
        }
    } catch (error) {
        console.error('Error loading media kit from server:', error);
    }
}

function setupGlobalPluginUrl() {
    window.guestifyMediaKitBuilder = window.guestifyMediaKitBuilder || {};
    let pluginUrl = window.guestifyData?.pluginUrl || window.gmkb_data?.plugin_url || '';
    if (!pluginUrl) {
        const scriptTag = document.querySelector('script[src*="guestify-media-kit-builder"]');
        pluginUrl = scriptTag ? (scriptTag.src.match(/(.*\/guestify-media-kit-builder\/)/)?.[1] || '/wp-content/plugins/guestify-media-kit-builder/') : '/wp-content/plugins/guestify-media-kit-builder/';
    }
    window.guestifyMediaKitBuilder.pluginUrl = pluginUrl.endsWith('/') ? pluginUrl : `${pluginUrl}/`;
    console.log('Plugin URL set to:', window.guestifyMediaKitBuilder.pluginUrl);
}

// --- Global Listeners & Exports ---

document.addEventListener('DOMContentLoaded', initializeBuilder);

// Make managers globally accessible
window.stateManager = stateManager;
window.componentManager = componentManager;
window.componentRenderer = componentRenderer;
window.historyService = historyService;

// Make UI setup functions globally accessible for component renderer
window.setupElementSelection = setupElementSelection;
window.setupContentEditableUpdates = setupContentEditableUpdates;

// Debug helpers
window.gmkbDebug = { 
    stateManager, 
    componentManager, 
    componentRenderer, 
    historyService, 
    getState: () => stateManager?.getState() 
};
