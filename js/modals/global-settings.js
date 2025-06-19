/**
 * @file global-settings.js
 * @description Manages the global settings modal and updates the application's global state.
 *
 * This version has been updated to use the new enhancedStateManager for state management,
 * resolving module import errors and aligning it with the new architecture.
 */

// FIX: Import the enhancedStateManager for a centralized approach to state management.
import {
    enhancedStateManager
} from '../core/enhanced-state-manager.js';
import {
    debounce
} from '../utils/helpers.js';
import {
    hideModal,
    showModal
} from './modal-base.js';

class GlobalSettings {
    constructor() {
        this.modal = document.getElementById('global-settings-modal');
        this.form = document.getElementById('global-settings-form');
        this.openButton = document.getElementById('global-settings-button');
        this.closeButton = document.getElementById('close-global-settings');

        this.debouncedUpdate = debounce(this.updateGlobalSettings.bind(this), 300);
    }

    init() {
        if (!this.modal || !this.form) {
            console.warn('Global settings modal not found, skipping initialization.');
            return;
        }

        this.openButton.addEventListener('click', () => this.show());
        this.closeButton.addEventListener('click', () => this.hide());
        this.form.addEventListener('input', (e) => {
            const formData = new FormData(this.form);
            const settings = Object.fromEntries(formData.entries());
            this.debouncedUpdate(settings);
        });

        console.log('Global settings initialized.');
        this.populateForm();
    }

    show() {
        showModal(this.modal);
    }

    hide() {
        hideModal(this.modal);
    }

    populateForm() {
        // FIX: Use the enhancedStateManager to get the current global settings.
        const settings = enhancedStateManager.getState().globalSettings;
        if (settings) {
            for (const key in settings) {
                const input = this.form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = settings[key];
                }
            }
        }
    }

    updateGlobalSettings(newSettings) {
        // FIX: Use the enhancedStateManager to update the global settings.
        enhancedStateManager.updateGlobalSettings(newSettings);
    }
}

export const globalSettings = new GlobalSettings();
