/**
 * Form controls and design panel functionality
 */

import { markUnsaved } from '../services/save-service.js';
import { isValidColor } from '../utils/helpers.js';

/**
 * Set up form updates
 */
export function setupFormUpdates() {
    setupColorInputs();
    setupLiveEditing();
}

/**
 * Set up color inputs with text field synchronization
 */
function setupColorInputs() {
    const colorInputs = document.querySelectorAll('.color-input');
    colorInputs.forEach(input => {
        const textInput = input.nextElementSibling;
        
        input.addEventListener('input', function() {
            if (textInput) textInput.value = this.value;
        });

        if (textInput) {
            textInput.addEventListener('input', function() {
                if (isValidColor(this.value)) {
                    input.value = this.value;
                }
            });
        }
    });
}

/**
 * Set up live editing functionality
 */
function setupLiveEditing() {
    // Sync form inputs with preview elements
    const nameInput = document.getElementById('hero-name');
    const titleInput = document.getElementById('hero-title');
    const bioInput = document.getElementById('hero-bio');
    const bgColorInput = document.getElementById('hero-bg-color');
    const textColorInput = document.getElementById('hero-text-color');

    if (nameInput) {
        nameInput.addEventListener('input', function() {
            const preview = document.getElementById('preview-name');
            if (preview) preview.textContent = this.value;
            markUnsaved();
        });
    }

    if (titleInput) {
        titleInput.addEventListener('input', function() {
            const preview = document.getElementById('preview-title');
            if (preview) preview.textContent = this.value;
            markUnsaved();
        });
    }

    if (bioInput) {
        bioInput.addEventListener('input', function() {
            const preview = document.getElementById('preview-bio');
            if (preview) preview.textContent = this.value;
            markUnsaved();
        });
    }

    if (bgColorInput) {
        bgColorInput.addEventListener('input', function() {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.background = `linear-gradient(135deg, ${this.value} 0%, ${adjustBrightness(this.value, -10)} 100%)`;
            }
            document.getElementById('hero-bg-text').value = this.value;
            markUnsaved();
        });
    }

    if (textColorInput) {
        textColorInput.addEventListener('input', function() {
            const heroName = document.querySelector('.hero-name');
            if (heroName) heroName.style.color = this.value;
            document.getElementById('hero-text-text').value = this.value;
            markUnsaved();
        });
    }
}

/**
 * Adjust the brightness of a color
 * @param {string} color - The color to adjust
 * @param {number} percent - The percentage to adjust (-100 to 100)
 * @returns {string} The adjusted color
 */
function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
