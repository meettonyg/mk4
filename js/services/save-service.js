/**
 * @file save-service.js
 * @description Manages saving the media kit state to localStorage.
 *
 * This version includes a fix to correctly import the 'state' object and
 * use its 'getState' method, aligning it with the updated module structure.
 */
import {
    state
} from '../state.js';
import {
    showToast
} from '../utils/toast-polyfill.js';

const SAVE_KEY = 'guestifyMediaKitState';

class SaveService {
    constructor() {
        this.autosaveInterval = null;
    }

    /**
     * Saves the current state of the media kit to localStorage.
     */
    saveState() {
        try {
            // FIX: Call the getState() method on the imported 'state' object.
            const currentState = state.getState();
            const serializedState = JSON.stringify(currentState);
            localStorage.setItem(SAVE_KEY, serializedState);
            console.log('Media kit state saved.');
        } catch (error) {
            console.error('Error saving state:', error);
            showToast('Error: Could not save your work.', 'error');
        }
    }

    /**
     * Loads the media kit state from localStorage.
     * @returns {object|null} The loaded state object, or null if no state is saved.
     */
    loadState() {
        try {
            const savedState = localStorage.getItem(SAVE_KEY);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                console.log('Media kit state loaded.');
                return parsedState;
            }
        } catch (error) {
            console.error('Error loading state:', error);
            showToast('Error: Could not load previously saved work.', 'error');
        }
        return null;
    }

    /**
     * Starts the autosave functionality.
     * @param {number} interval - The interval in milliseconds for autosaving.
     */
    startAutosave(interval = 5000) {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
        }
        this.autosaveInterval = setInterval(() => {
            this.saveState();
            showToast('Auto-saved!', 'info', 1500);
        }, interval);
        console.log(`Autosave started with a ${interval}ms interval.`);
    }

    /**
     * Stops the autosave functionality.
     */
    stopAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
            console.log('Autosave stopped.');
        }
    }
}

export const saveService = new SaveService();
