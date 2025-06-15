/**
 * Main entry point for the Guestify Media Kit Builder
 */

import { resetState } from './state.js';
import { setupTabs } from './ui/tabs.js';
import { setupPreviewToggle } from './ui/preview.js';
import { setupDragAndDrop } from './ui/dnd.js';
import { setupElementSelection, setupContentEditableUpdates } from './ui/element-editor.js';
import { setupFormUpdates } from './ui/form-controls.js';
import { setupLayoutOptions } from './ui/layout.js';
import { setupSaveSystem } from './services/save-service.js';
import { setupKeyboardShortcuts } from './services/keyboard-service.js';
import { setupComponentLibraryModal } from './modals/component-library.js';
import { setupGlobalSettings } from './modals/global-settings.js';
import { setupExportSystem } from './modals/export.js';
import { setupShareSystem } from './services/share-service.js';
import { saveCurrentState } from './services/history-service.js';

/**
 * Initialize the builder
 */
function initializeBuilder() {
    resetState();
    setupTabs();
    setupPreviewToggle();
    setupDragAndDrop();
    setupElementSelection();
    setupContentEditableUpdates();
    setupFormUpdates();
    setupLayoutOptions();
    setupSaveSystem();
    setupKeyboardShortcuts();
    setupComponentLibraryModal();
    setupGlobalSettings();
    setupExportSystem();
    setupShareSystem();
    console.log('Guestify Media Kit Builder v2 initialized');
}

// Initialize the builder when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBuilder();
    
    // Initialize the first state for undo/redo
    setTimeout(() => {
        saveCurrentState();
    }, 100);
});
