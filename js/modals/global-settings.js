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
        // Properties will be assigned in init()
        this.modal = null;
        this.form = null;
        this.openButton = null;
        this.closeButton = null;
        this.debouncedUpdate = null;
    }

    async init() {
        console.log('⚙️ Setting up Global Settings...');
        
        // Assign DOM elements
        this.modal = document.getElementById('global-settings-overlay') || document.getElementById('global-settings-modal');
        this.openButton = document.getElementById('global-theme-btn') || document.getElementById('global-settings-button');
        this.closeButton = document.getElementById('close-global-settings');
        
        // Setup debounced update function
        this.debouncedUpdate = debounce(this.updateGlobalSettings.bind(this), 300);

        // Validate required elements
        if (!this.modal) {
            throw new Error('Global Settings: Modal not found');
        }
        
        // Try to find form or create one from modal body
        this.form = document.getElementById('global-settings-form');
        if (!this.form) {
            // If no form exists, create one from modal body
            const modalBody = this.modal.querySelector('.modal__body');
            if (modalBody) {
                // Wrap modal body content in a form
                const form = document.createElement('form');
                form.id = 'global-settings-form';
                while (modalBody.firstChild) {
                    form.appendChild(modalBody.firstChild);
                }
                modalBody.appendChild(form);
                this.form = form;
            }
        }
        
        if (!this.form) {
            console.warn('Global Settings: Form not found, settings may not save properly');
        }

        // Setup event listeners
        if (this.openButton) {
            this.openButton.addEventListener('click', () => this.show());
            this.openButton.setAttribute('data-listener-attached', 'true');
            console.log('✅ Global Settings: Open button listener attached');
        } else {
            console.warn('Global Settings: Open button not found');
        }
        
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.hide());
        }
        
        // Setup form event listeners
        if (this.form) {
            this.form.addEventListener('input', (e) => {
                this.handleSettingsChange();
            });
            
            this.form.addEventListener('change', (e) => {
                this.handleSettingsChange();
            });
        }
        
        // Setup color palette clicks
        const paletteOptions = this.modal.querySelectorAll('.palette-option');
        paletteOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // Remove active class from all
                paletteOptions.forEach(opt => opt.classList.remove('palette-option--active'));
                // Add active class to clicked
                option.classList.add('palette-option--active');
                // Update settings
                this.handleSettingsChange();
            });
        });

        this.populateForm();
        console.log('✅ Global Settings: Setup complete');
        return Promise.resolve();
    }
    
    handleSettingsChange() {
        const settings = this.gatherSettings();
        this.debouncedUpdate(settings);
    }
    
    gatherSettings() {
        const settings = {};
        
        // Get form values if form exists
        if (this.form) {
            const formData = new FormData(this.form);
            Object.assign(settings, Object.fromEntries(formData.entries()));
        }
        
        // Get selected palette
        const activePalette = this.modal.querySelector('.palette-option--active');
        if (activePalette) {
            settings.colorPalette = activePalette.dataset.palette;
        }
        
        return settings;
    }

    show() {
        if (this.modal) {
            showModal('global-settings-modal'); // Pass the ID string
        }
    }

    hide() {
        if (this.modal) {
            hideModal('global-settings-modal'); // Pass the ID string
        }
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
