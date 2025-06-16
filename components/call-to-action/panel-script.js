/**
 * Call to Action Component Panel Script
 * Handles the dynamic functionality of the call-to-action design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['call-to-action'] = function(element, schema) {
    initializeCallToActionPanel(element, schema);
};

/**
 * Initialize call to action panel
 * @param {HTMLElement} element - The call to action component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeCallToActionPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Call to Action component schema:', schema);
    }
    
    // Handle CTA style changes
    const ctaStyleSelect = document.querySelector('[data-property="ctaStyle"]');
    if (ctaStyleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-cta-style') || 'standard';
        ctaStyleSelect.value = currentStyle;
        
        // Add change listener
        ctaStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-cta-style', this.value);
            
            // Update classes
            element.classList.remove('cta--standard', 'cta--prominent', 'cta--subtle', 'cta--floating');
            element.classList.add('cta--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle button target
    const buttonTargetSelect = document.querySelector('[data-property="buttonTarget"]');
    if (buttonTargetSelect) {
        // Get initial value from button
        const ctaButton = element.querySelector('.cta-button');
        if (ctaButton) {
            const currentTarget = ctaButton.getAttribute('target') || '_self';
            buttonTargetSelect.value = currentTarget;
        }
        
        // Add change listener
        buttonTargetSelect.addEventListener('change', function() {
            const ctaButton = element.querySelector('.cta-button');
            if (ctaButton) {
                ctaButton.setAttribute('target', this.value);
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
    
    // Handle button visibility
    const showButtonCheckbox = document.querySelector('[data-property="showButton"]');
    if (showButtonCheckbox) {
        // Get initial state
        const ctaButton = element.querySelector('.cta-button');
        if (ctaButton) {
            showButtonCheckbox.checked = ctaButton.style.display !== 'none';
        }
        
        // Add change listener
        showButtonCheckbox.addEventListener('change', function() {
            const ctaButton = element.querySelector('.cta-button');
            if (ctaButton) {
                ctaButton.style.display = this.checked ? '' : 'none';
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
    
    // Handle animation setting
    const animationSelect = document.querySelector('[data-property="animation"]');
    if (animationSelect) {
        // Get initial value
        const currentAnimation = element.getAttribute('data-animation') || 'none';
        animationSelect.value = currentAnimation;
        
        // Add change listener
        animationSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-animation', this.value);
            
            // Remove all animation classes
            element.classList.remove('animate-fade', 'animate-slide', 'animate-pulse');
            
            // Add new animation class if not 'none'
            if (this.value !== 'none') {
                element.classList.add('animate-' + this.value);
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Setup color pickers
    setupColorPicker('backgroundColor', element, function(color) {
        element.style.backgroundColor = color;
    });
    
    setupColorPicker('textColor', element, function(color) {
        element.style.color = color;
        
        // Also update h2 and p elements
        const heading = element.querySelector('.cta-heading');
        const description = element.querySelector('.cta-description');
        
        if (heading) heading.style.color = color;
        if (description) description.style.color = color;
    });
    
    setupColorPicker('buttonColor', element, function(color) {
        const button = element.querySelector('.cta-button');
        if (button) button.style.backgroundColor = color;
    });
    
    setupColorPicker('buttonTextColor', element, function(color) {
        const button = element.querySelector('.cta-button');
        if (button) button.style.color = color;
    });
    
    // Add input handlers for button URL
    const buttonUrlInput = document.querySelector('[data-property="buttonUrl"]');
    if (buttonUrlInput) {
        // Get initial value
        const ctaButton = element.querySelector('.cta-button');
        if (ctaButton) {
            buttonUrlInput.value = ctaButton.getAttribute('href') || '';
        }
        
        // Add input listener
        buttonUrlInput.addEventListener('input', function() {
            const ctaButton = element.querySelector('.cta-button');
            if (ctaButton) {
                ctaButton.setAttribute('href', this.value);
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
    
    // Add input handlers for text content
    setupTextContentUpdater('title', '.cta-heading', element);
    setupTextContentUpdater('description', '.cta-description', element);
    setupTextContentUpdater('buttonText', '.cta-button', element);
}

/**
 * Setup text content updater
 * @param {string} property - The property name
 * @param {string} selector - The element selector
 * @param {HTMLElement} component - The component element
 */
function setupTextContentUpdater(property, selector, component) {
    const input = document.querySelector(`[data-property="${property}"]`);
    if (!input) return;
    
    // Get initial value
    const element = component.querySelector(selector);
    if (element) {
        input.value = element.textContent.trim();
    }
    
    // Add input listener
    input.addEventListener('input', function() {
        const element = component.querySelector(selector);
        if (element) {
            element.textContent = this.value;
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            component.dispatchEvent(event);
        }
    });
}

/**
 * Setup a color picker
 * @param {string} property - The property name
 * @param {HTMLElement} element - The component element
 * @param {Function} applyCallback - Callback to apply the color
 */
function setupColorPicker(property, element, applyCallback) {
    const colorInput = document.querySelector(`[data-property="${property}"]`);
    const textInput = colorInput?.nextElementSibling;
    
    if (!colorInput || !textInput) return;
    
    // Get current computed color if possible
    if (property === 'backgroundColor') {
        const currentColor = getComputedStyle(element).backgroundColor;
        if (currentColor && currentColor !== 'rgba(0, 0, 0, 0)') {
            const hex = rgbToHex(currentColor);
            colorInput.value = hex;
            textInput.value = hex;
        }
    } else if (property === 'textColor') {
        const currentColor = getComputedStyle(element).color;
        if (currentColor) {
            const hex = rgbToHex(currentColor);
            colorInput.value = hex;
            textInput.value = hex;
        }
    } else if (property === 'buttonColor') {
        const button = element.querySelector('.cta-button');
        if (button) {
            const currentColor = getComputedStyle(button).backgroundColor;
            if (currentColor && currentColor !== 'rgba(0, 0, 0, 0)') {
                const hex = rgbToHex(currentColor);
                colorInput.value = hex;
                textInput.value = hex;
            }
        }
    } else if (property === 'buttonTextColor') {
        const button = element.querySelector('.cta-button');
        if (button) {
            const currentColor = getComputedStyle(button).color;
            if (currentColor) {
                const hex = rgbToHex(currentColor);
                colorInput.value = hex;
                textInput.value = hex;
            }
        }
    }
    
    // Sync color and text inputs
    colorInput.addEventListener('input', function() {
        textInput.value = this.value;
        if (applyCallback) {
            applyCallback(this.value);
        }
        
        // Trigger save
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
    });
    
    textInput.addEventListener('input', function() {
        // Validate hex color
        if (/^#[0-9A-F]{6}$/i.test(this.value)) {
            colorInput.value = this.value;
            if (applyCallback) {
                applyCallback(this.value);
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        }
    });
}

/**
 * Convert RGB to HEX color
 * @param {string} rgb - RGB color string
 * @returns {string} - HEX color string
 */
function rgbToHex(rgb) {
    // If already a hex color, return as is
    if (rgb.startsWith('#')) {
        return rgb;
    }
    
    // Extract RGB values
    const rgbMatch = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (!rgbMatch) return '#000000'; // Default to black
    
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
