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
            // Assign DOM elements - FIX: Search for correct modal ID first
            this.modal = document.getElementById('global-settings-modal') || document.getElementById('global-settings-overlay');
            this.openButton = document.getElementById('global-theme-btn') || document.getElementById('global-settings-button');
            this.closeButton = document.getElementById('close-global-settings');
            
            // Setup debounced update function
            this.debouncedUpdate = debounce(this.updateGlobalSettings.bind(this), 300);

            // Validate required elements
            if (!this.modal) {
                structuredLogger.error('MODAL', 'Global Settings modal not found', null, {
                    searchedIds: ['global-settings-modal', 'global-settings-overlay'],
                    availableModals: Array.from(document.querySelectorAll('[id*="global"], [id*="settings"], [id*="modal"]')).map(el => el.id).filter(id => id)
                });
                throw new Error('Global Settings: Modal not found');
            }
            
            if (!this.openButton) {
                structuredLogger.error('MODAL', 'Global Settings open button not found', null, {
                    searchedIds: ['global-theme-btn', 'global-settings-button'],
                    availableButtons: Array.from(document.querySelectorAll('[id*="global"], [id*="theme"], [id*="settings"]')).map(el => el.id).filter(id => id)
                });
                throw new Error('Global Settings: Open button not found');
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
        
        try {
            // Get form values if form exists
            if (this.form) {
                // Get all input, select, and textarea elements
                const inputs = this.form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    const key = input.name || input.id;
                    if (key) {
                        if (input.type === 'checkbox') {
                            settings[key] = input.checked;
                        } else if (input.type === 'radio') {
                            if (input.checked) {
                                settings[key] = input.value;
                            }
                        } else if (input.type === 'range') {
                            settings[key] = parseInt(input.value);
                        } else {
                            settings[key] = input.value;
                        }
                    }
                });
            }
            
            // Get selected palette
            const activePalette = this.modal.querySelector('.palette-option--active');
            if (activePalette) {
                settings.colorPalette = activePalette.dataset.palette;
            }
            
            structuredLogger.debug('MODAL', 'Gathered global settings', settings);
            
        } catch (error) {
            structuredLogger.error('MODAL', 'Error gathering global settings', error);
        }
        
        return settings;
    }

    show() {
        if (this.modal) {
            structuredLogger.debug('MODAL', 'Showing Global Settings modal');
            // FIX: Use the actual modal element or its ID for consistency
            const modalId = this.modal.id || 'global-settings-modal';
            showModal(modalId);
        } else {
            structuredLogger.error('MODAL', 'Cannot show Global Settings - modal not initialized');
        }
    }

    hide() {
        if (this.modal) {
            structuredLogger.debug('MODAL', 'Hiding Global Settings modal');
            // FIX: Use the actual modal element or its ID for consistency  
            const modalId = this.modal.id || 'global-settings-modal';
            hideModal(modalId);
        }
    }

    populateForm() {
        try {
            // FIX: Use the enhancedStateManager to get the current global settings.
            const state = enhancedStateManager.getState();
            const settings = state?.globalSettings || {};
            
            if (Object.keys(settings).length > 0 && this.form) {
                structuredLogger.debug('MODAL', 'Populating Global Settings form', settings);
                
                for (const key in settings) {
                    const input = this.form.querySelector(`[name="${key}"], #${key}`);
                    if (input) {
                        if (input.type === 'checkbox') {
                            input.checked = settings[key];
                        } else {
                            input.value = settings[key];
                        }
                    }
                }
                
                // Handle color palette selection
                if (settings.colorPalette) {
                    const paletteOptions = this.modal.querySelectorAll('.palette-option');
                    paletteOptions.forEach(option => {
                        option.classList.remove('palette-option--active');
                        if (option.dataset.palette === settings.colorPalette) {
                            option.classList.add('palette-option--active');
                        }
                    });
                }
            } else {
                structuredLogger.debug('MODAL', 'No saved global settings found, using defaults');
            }
        } catch (error) {
            structuredLogger.error('MODAL', 'Error populating Global Settings form', error);
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
