/**
 * Save functionality
 */

import { setState } from '../state.js';

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
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-indicator span');

    // Update UI to show saving state
    if (saveBtn) saveBtn.disabled = true;
    if (statusDot) statusDot.classList.add('saving');
    if (statusText) statusText.textContent = 'Saving...';

    // Simulate save operation
    setTimeout(() => {
        setState('isUnsaved', false);
        if (saveBtn) saveBtn.disabled = false;
        if (statusDot) statusDot.classList.remove('saving');
        if (statusText) statusText.textContent = 'Saved';
        
        console.log('Media kit saved successfully');
    }, 1500);
}

/**
 * Auto-save the media kit
 */
function autoSave() {
    const statusText = document.querySelector('.status-indicator span');
    if (statusText) statusText.textContent = 'Auto-saving...';
    
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
    const statusText = document.querySelector('.status-indicator span');
    if (statusText) statusText.textContent = 'Unsaved changes';
}

/**
 * Check if the media kit is unsaved
 * @returns {boolean} Whether the media kit is unsaved
 */
export function isUnsaved() {
    return require('../state.js').getState('isUnsaved');
}
