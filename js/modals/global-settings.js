/**
 * @file global-settings.js
 * @description Manages the global settings modal and updates the application's global state.
 * ROOT FIX: Simplified version that doesn't import problematic modules
 * @version 2.0.1
 */

class GlobalSettings {
    constructor() {
        this.modal = null;
        this.form = null;
        this.openButton = null;
        this.closeButton = null;
        this.debouncedUpdate = null;
    }

    async init() {
        console.log('🗺 GMKB: Initializing Global Settings...');
        
        try {
            // Find DOM elements
            this.modal = document.getElementById('global-settings-modal') || document.getElementById('global-settings-overlay');
            this.openButton = document.getElementById('global-theme-btn') || document.getElementById('global-settings-button');
            this.closeButton = document.getElementById('close-global-settings');
            
            if (!this.modal) {
                console.warn('⚠️ GMKB: Global Settings modal not found - this is optional');
                return Promise.resolve();
            }
            
            if (!this.openButton) {
                console.warn('⚠️ GMKB: Global Settings open button not found - this is optional');
                return Promise.resolve();
            }
            
            // Setup basic event listeners
            if (this.openButton) {
                this.openButton.addEventListener('click', () => {
                    this.show();
                });
            }
            
            if (this.closeButton) {
                this.closeButton.addEventListener('click', () => {
                    this.hide();
                });
            }
            
            // Try to find form
            this.form = document.getElementById('global-settings-form');
            if (this.form) {
                this.setupFormListeners();
            }
            
            console.log('✅ GMKB: Global Settings initialized successfully');
            return Promise.resolve();
            
        } catch (error) {
            console.warn('⚠️ GMKB: Global Settings initialization failed (this is optional):', error);
            return Promise.resolve(); // Don't throw, it's optional
        }
    }
    
    setupFormListeners() {
        if (!this.form) return;
        
        // Create debounced update function
        let updateTimeout;
        const debouncedUpdate = () => {
            if (updateTimeout) clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                this.updateSettings();
            }, 300);
        };
        
        // Listen for form changes
        this.form.addEventListener('input', debouncedUpdate);
        this.form.addEventListener('change', debouncedUpdate);
        
        // Listen for color palette clicks
        const paletteOptions = this.modal.querySelectorAll('.palette-option');
        paletteOptions.forEach(option => {
            option.addEventListener('click', () => {
                paletteOptions.forEach(opt => opt.classList.remove('palette-option--active'));
                option.classList.add('palette-option--active');
                debouncedUpdate();
            });
        });
    }
    
    show() {
        if (this.modal && window.GMKB_Modals && typeof window.GMKB_Modals.show === 'function') {
            const modalId = this.modal.id || 'global-settings-modal';
            window.GMKB_Modals.show(modalId);
        }
    }
    
    hide() {
        if (this.modal && window.GMKB_Modals && typeof window.GMKB_Modals.hide === 'function') {
            const modalId = this.modal.id || 'global-settings-modal';
            window.GMKB_Modals.hide(modalId);
        }
    }
    
    updateSettings() {
        try {
            if (!this.form) return;
            
            // Gather form data
            const formData = new FormData(this.form);
            const settings = {};
            
            for (const [key, value] of formData.entries()) {
                settings[key] = value;
            }
            
            // Get active palette
            const activePalette = this.modal.querySelector('.palette-option--active');
            if (activePalette) {
                settings.colorPalette = activePalette.dataset.palette;
            }
            
            console.log('🎨 GMKB: Global settings updated:', settings);
            
            // Try to update via GMKB state manager if available
            if (window.GMKB && window.GMKB.systems && window.GMKB.systems.StateManager) {
                window.GMKB.systems.StateManager.updateGlobalSettings(settings);
            }
            
        } catch (error) {
            console.warn('⚠️ GMKB: Error updating global settings:', error);
        }
    }
}

export const globalSettings = new GlobalSettings();
