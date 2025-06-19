/**
 * @file global-settings.js
 * @description Manages the global settings modal and updates the application's global state.
 *
 * This version has been updated to use the new enhancedStateManager for state management,
 * resolving module import errors and aligning it with the new architecture.
 * 
 * Phase 2B Enhancement: Integrated comprehensive logging
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
import { structuredLogger } from '../utils/structured-logger.js';
import { errorBoundary } from '../utils/error-boundary.js';

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
        const initStart = performance.now();
        structuredLogger.info('MODAL', 'Setting up Global Settings');
        
        try {
            // Assign DOM elements
            this.modal = document.getElementById('global-settings-overlay') || document.getElementById('global-settings-modal');
            this.openButton = document.getElementById('global-theme-btn') || document.getElementById('global-settings-button');
            this.closeButton = document.getElementById('close-global-settings');
            
            // Setup debounced update function
            this.debouncedUpdate = debounce(this.updateGlobalSettings.bind(this), 300);

            // Validate required elements
            if (!this.modal) {
                structuredLogger.error('MODAL', 'Global Settings modal not found', null, {
                    searchedIds: ['global-settings-overlay', 'global-settings-modal']
                });
                throw new Error('Global Settings: Modal not found');
            }
            
            structuredLogger.debug('MODAL', 'Global Settings DOM elements found', {
                modal: !!this.modal,
                openButton: !!this.openButton,
                closeButton: !!this.closeButton
            });
        
            // Try to find form or create one from modal body
            this.form = document.getElementById('global-settings-form');
            if (!this.form) {
                // If no form exists, create one from modal body
                const modalBody = this.modal.querySelector('.modal__body');
                if (modalBody) {
                    structuredLogger.debug('MODAL', 'Creating form wrapper for Global Settings');
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
                structuredLogger.warn('MODAL', 'Global Settings form not found, settings may not save properly');
            }

            // Setup event listeners
            if (this.openButton) {
                this.openButton.addEventListener('click', () => {
                    structuredLogger.debug('UI', 'Global Settings button clicked');
                    this.show();
                });
                this.openButton.setAttribute('data-listener-attached', 'true');
                structuredLogger.debug('MODAL', 'Global Settings open button listener attached');
            } else {
                structuredLogger.warn('MODAL', 'Global Settings open button not found', {
                    searchedIds: ['global-theme-btn', 'global-settings-button']
                });
            }
            
            if (this.closeButton) {
                this.closeButton.addEventListener('click', () => {
                    structuredLogger.debug('UI', 'Global Settings close button clicked');
                    this.hide();
                });
            }
        
            // Setup form event listeners
            if (this.form) {
                this.form.addEventListener('input', (e) => {
                    structuredLogger.debug('UI', 'Global Settings input changed', { 
                        field: e.target.name,
                        value: e.target.value 
                    });
                    this.handleSettingsChange();
                });
                
                this.form.addEventListener('change', (e) => {
                    structuredLogger.debug('UI', 'Global Settings changed', { 
                        field: e.target.name,
                        value: e.target.value 
                    });
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
                    
                    structuredLogger.debug('UI', 'Color palette selected', {
                        palette: option.dataset.palette
                    });
                    
                    // Update settings
                    this.handleSettingsChange();
                });
            });

            this.populateForm();
            
            structuredLogger.info('MODAL', 'Global Settings setup complete', {
                duration: performance.now() - initStart,
                formFieldsCount: this.form ? this.form.querySelectorAll('input, select, textarea').length : 0,
                paletteOptionsCount: paletteOptions.length
            });
            
            return Promise.resolve();
            
        } catch (error) {
            structuredLogger.error('MODAL', 'Global Settings initialization failed', error);
            throw error;
        }
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
        
        structuredLogger.debug('MODAL', 'Gathered global settings', settings);
        return settings;
    }

    show() {
        if (this.modal) {
            structuredLogger.debug('MODAL', 'Showing Global Settings modal');
            showModal('global-settings-modal'); // Pass the ID string
        } else {
            structuredLogger.error('MODAL', 'Cannot show Global Settings - modal not initialized');
        }
    }

    hide() {
        if (this.modal) {
            structuredLogger.debug('MODAL', 'Hiding Global Settings modal');
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
        const updateStart = performance.now();
        
        structuredLogger.info('STATE', 'Updating global settings', {
            settingsCount: Object.keys(newSettings).length,
            settings: newSettings
        });
        
        enhancedStateManager.updateGlobalSettings(newSettings);
        
        structuredLogger.debug('STATE', 'Global settings updated', {
            duration: performance.now() - updateStart
        });
    }
}

export const globalSettings = new GlobalSettings();
