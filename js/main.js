/**
 * Main entry point for the Guestify Media Kit Builder
 */

import { resetState } from './state.js';
import { setupTabs } from './ui/tabs.js';
import { setupPreviewToggle } from './ui/preview.js';
import { setupDragAndDrop } from './ui/dnd.js';
import { setupElementSelection, setupContentEditableUpdates } from './ui/element-editor.js';
import { setupElementControls } from './ui/element-controls.js'; // Import the new controls
import { setupFormUpdates } from './ui/form-controls.js';
import { setupLayoutOptions } from './ui/layout.js';
import { setupSaveSystem } from './services/save-service.js';
import { setupKeyboardShortcuts } from './services/keyboard-service.js';
import { setupComponentLibraryModal } from './modals/component-library.js';
import { setupGlobalSettings } from './modals/global-settings.js';
import { setupExportSystem } from './modals/export.js';
import { setupShareSystem } from './services/share-service.js';
import { saveCurrentState } from './services/history-service.js';
import { initializeDynamicComponents } from './components/dynamic-component-loader.js';
import './components/design-panel-loader.js'; // Import for side effects

/**
 * Initialize the builder
 */
function initializeBuilder() {
    resetState();
    setupTabs();
    setupPreviewToggle();
    setupDragAndDrop();
    setupElementSelection();
    setupElementControls(); // Initialize the controls
    setupContentEditableUpdates();
    setupFormUpdates();
    setupLayoutOptions();
    setupSaveSystem();
    setupKeyboardShortcuts();
    setupComponentLibraryModal();
    setupGlobalSettings();
    setupExportSystem();
    setupShareSystem();
    
    // Initialize dynamic components
    initializeDynamicComponents();
    
    // Add a debugging tool to check controls
    setTimeout(debugControlsSetup, 1000);
    
    console.log('Guestify Media Kit Builder v2 initialized');
}

/**
 * Debug function to check control buttons setup
 */
function debugControlsSetup() {
    const controlButtons = document.querySelectorAll('.control-btn');
    console.log(`Debug: Found ${controlButtons.length} control buttons`);
    
    // Force display of all control buttons for 5 seconds to help with debugging
    const editableElements = document.querySelectorAll('.editable-element');
    console.log(`Debug: Found ${editableElements.length} editable elements`);
    
    // Add click events directly to all control buttons as a fallback
    controlButtons.forEach(btn => {
        console.log(`Debug: Adding direct click handler to button: ${btn.getAttribute('title')}`);
        btn.addEventListener('click', function(e) {
            console.log(`Debug: Control button clicked: ${this.getAttribute('title')}`);
            e.stopPropagation();
            e.preventDefault();
            
            // Get the action and perform it
            const action = this.getAttribute('title');
            const element = this.closest('.editable-element');
            
            if (action === 'Move Up') {
                console.log('Debug: Moving element up');
                // Move code
            } else if (action === 'Move Down') {
                console.log('Debug: Moving element down');
                // Move code
            } else if (action === 'Duplicate') {
                console.log('Debug: Duplicating element');
                const clone = element.cloneNode(true);
                element.parentNode.insertBefore(clone, element.nextSibling);
            } else if (action === 'Delete') {
                console.log('Debug: Deleting element');
                if (element.getAttribute('data-component') !== 'hero') {
                    element.remove();
                }
            }
        });
    });
}

// Initialize the builder when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBuilder();
    
    // Initialize the first state for undo/redo
    setTimeout(() => {
        saveCurrentState();
    }, 100);
});
