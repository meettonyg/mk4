/**
 * Save functionality
 * Enhanced with state manager integration
 */

import { setState, getState } from '../state.js';
import { stateManager } from './state-manager.js';

/**
 * Set up save system
 */
export function setupSaveSystem() {
    const saveBtn = document.getElementById('save-btn');

    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveMediaKit();
        });
    }

    // Auto-save every 30 seconds
    setInterval(() => {
        if (isUnsaved()) {
            autoSave();
        }
    }, 30000);
}

/**
 * Save the media kit
 */
export function saveMediaKit() {
    const saveBtn = document.getElementById('save-btn');
    const statusDot = document.querySelector('.toolbar__status-dot');
    const statusText = document.querySelector('.toolbar__status span');

    // Update UI to show saving state
    if (saveBtn) saveBtn.disabled = true;
    if (statusDot) statusDot.classList.add('toolbar__status-dot--saving');
    if (statusText) statusText.textContent = 'Saving...';

    // Use the global window.stateManager to ensure we get the correct instance
    if (!window.stateManager) {
        console.error('State manager not available, cannot save');
        if (statusText) statusText.textContent = 'Save failed - refresh page';
        if (saveBtn) saveBtn.disabled = false;
        return;
    }

    // Get data directly from the state manager
    const mediaKitData = window.stateManager.getSerializableState();
    
    // Log the schema-based data structure
    console.log('Saving media kit data from state manager:', mediaKitData);

    // Save to localStorage for now
    localStorage.setItem('mediaKitData', JSON.stringify(mediaKitData));
    
    // Store state hash for change detection
    localStorage.setItem('gmkb_last_saved_state', JSON.stringify(mediaKitData));
    
    // Simulate server save operation
    setTimeout(() => {
        setState('isUnsaved', false);
        if (saveBtn) saveBtn.disabled = false;
        if (statusDot) statusDot.classList.remove('toolbar__status-dot--saving');
        if (statusText) statusText.textContent = 'Saved';
        
        console.log('Media kit saved successfully');
    }, 1500);
}

// collectComponentData function has been removed
// We now use stateManager.getSerializableState() instead

/**
 * Auto-save the media kit
 */
function autoSave() {
    const statusText = document.querySelector('.toolbar__status span');
    if (statusText) statusText.textContent = 'Auto-saving...';
    
    // Check if state manager is available
    if (!window.stateManager) {
        console.error('State manager not available, cannot auto-save');
        if (statusText) statusText.textContent = 'Auto-save failed';
        return;
    }
    
    // Get data from state manager
    const mediaKitData = window.stateManager.getSerializableState();
    
    // Save to localStorage
    localStorage.setItem('mediaKitData', JSON.stringify(mediaKitData));
    localStorage.setItem('gmkb_last_saved_state', JSON.stringify(mediaKitData));
    
    console.log('Media kit auto-saved');
    
    setTimeout(() => {
        setState('isUnsaved', false);
        if (statusText) statusText.textContent = 'Saved';
    }, 1000);
}

/**
 * Mark the media kit as unsaved
 */
export function markUnsaved() {
    setState('isUnsaved', true);
    const statusText = document.querySelector('.toolbar__status span');
    if (statusText) statusText.textContent = 'Unsaved changes';
}

/**
 * Check if the media kit is unsaved
 * @returns {boolean} Whether the media kit is unsaved
 */
export function isUnsaved() {
    return getState('isUnsaved');
}
