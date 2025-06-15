/**
 * Global settings modal functionality
 */

import { getState, setState } from '../state.js';
import { showModal, hideModal, setupModalClose } from './modal-base.js';
import { markUnsaved } from '../services/save-service.js';

/**
 * Set up global settings modal
 */
export function setupGlobalSettings() {
    const globalSettingsBtn = document.getElementById('global-settings-btn');
    const globalThemeBtn = document.getElementById('global-theme-btn');

    setupModalClose('global-settings-modal', 'close-global-settings');

    if (globalSettingsBtn) {
        globalSettingsBtn.addEventListener('click', showGlobalSettings);
    }

    if (globalThemeBtn) {
        globalThemeBtn.addEventListener('click', showGlobalSettings);
    }

    // Palette selection
    const paletteOptions = document.querySelectorAll('.palette-option');
    paletteOptions.forEach(option => {
        option.addEventListener('click', function() {
            paletteOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const palette = this.getAttribute('data-palette');
            applyThemePalette(palette);
        });
    });

    // Font changes
    const primaryFont = document.getElementById('primary-font');
    const secondaryFont = document.getElementById('secondary-font');

    if (primaryFont) {
        primaryFont.addEventListener('change', function() {
            applyPrimaryFont(this.value);
        });
    }

    if (secondaryFont) {
        secondaryFont.addEventListener('change', function() {
            applySecondaryFont(this.value);
        });
    }
}

/**
 * Show the global settings modal
 */
export function showGlobalSettings() {
    showModal('global-settings-modal');
}

/**
 * Hide the global settings modal
 */
export function hideGlobalSettings() {
    hideModal('global-settings-modal');
}

/**
 * Apply a theme palette
 * @param {string} palette - The palette to apply
 */
function applyThemePalette(palette) {
    setState('currentTheme', palette);
    const preview = document.getElementById('media-kit-preview');
    
    // Remove existing theme classes
    preview.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-pink', 'theme-gray');
    
    // Add new theme class
    preview.classList.add(`theme-${palette}`);
    
    // Update CSS variables based on palette
    const paletteColors = {
        blue: { primary: '#3b82f6', secondary: '#dbeafe', accent: '#1e40af' },
        green: { primary: '#10b981', secondary: '#dcfce7', accent: '#047857' },
        purple: { primary: '#8b5cf6', secondary: '#f3e8ff', accent: '#7c3aed' },
        orange: { primary: '#f97316', secondary: '#fed7aa', accent: '#ea580c' },
        pink: { primary: '#ec4899', secondary: '#fce7f3', accent: '#db2777' },
        gray: { primary: '#64748b', secondary: '#f1f5f9', accent: '#475569' }
    };

    const colors = paletteColors[palette];
    if (colors) {
        document.documentElement.style.setProperty('--theme-primary', colors.primary);
        document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
        document.documentElement.style.setProperty('--theme-accent', colors.accent);
    }

    markUnsaved();
}

/**
 * Apply a primary font
 * @param {string} fontFamily - The font family to apply
 */
function applyPrimaryFont(fontFamily) {
    document.documentElement.style.setProperty('--primary-font', fontFamily);
    markUnsaved();
}

/**
 * Apply a secondary font
 * @param {string} fontFamily - The font family to apply
 */
function applySecondaryFont(fontFamily) {
    document.documentElement.style.setProperty('--secondary-font', fontFamily);
    markUnsaved();
}
