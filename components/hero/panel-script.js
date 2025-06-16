/**
 * Hero Component Panel Script
 * Handles the dynamic functionality of the hero design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['hero'] = function(element, schema) {
    initializeHeroPanel(element, schema);
};

/**
 * Initialize hero panel
 * @param {HTMLElement} element - The hero component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeHeroPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Hero component schema:', schema);
    }
    
    // Handle background style changes
    const bgStyleSelect = document.querySelector('[data-property="hero_bg_style"]');
    if (bgStyleSelect) {
        // Get initial value from element if available
        const currentBgStyle = element.getAttribute('data-bg-style');
        if (currentBgStyle) {
            bgStyleSelect.value = currentBgStyle;
        }
        
        // Add change listener
        bgStyleSelect.addEventListener('change', function() {
            // Update the data attribute
            element.setAttribute('data-bg-style', this.value);
            
            // Update classes
            element.classList.remove('hero--gradient', 'hero--solid', 'hero--image', 'hero--pattern');
            element.classList.add('hero--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle avatar style changes
    const avatarStyleSelect = document.querySelector('[data-property="avatar_style"]');
    if (avatarStyleSelect) {
        // Get initial value from element if available
        const avatar = element.querySelector('.hero__avatar');
        if (avatar) {
            const currentAvatarStyle = avatar.getAttribute('data-avatar-style') || 'circle';
            avatarStyleSelect.value = currentAvatarStyle;
            
            // Add change listener
            avatarStyleSelect.addEventListener('change', function() {
                // Update the data attribute
                avatar.setAttribute('data-avatar-style', this.value);
                
                // Update classes
                avatar.classList.remove('avatar--circle', 'avatar--square', 'avatar--rounded');
                avatar.classList.add('avatar--' + this.value);
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            });
        }
    }
    
    // Handle profile image upload
    const uploadBtn = document.querySelector('.upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            // This would typically use the WordPress media uploader
            // For now, we'll just use a placeholder
            alert('Image upload functionality would open media browser here');
            
            // In a real implementation, we would update the avatar image src
            // and trigger a save event
        });
    }
    
    // Handle color pickers for background and text
    setupColorPicker('hero_bg_color', 'hero_bg_color_text', element, function(color) {
        element.style.backgroundColor = color;
    });
    
    setupColorPicker('hero_text_color', 'hero_text_color_text', element, function(color) {
        element.style.color = color;
    });
    
    // Handle bio visibility toggle
    const showBioCheckbox = document.querySelector('[data-property="show_bio"]');
    if (showBioCheckbox) {
        // Get initial state
        const heroBio = element.querySelector('.hero__bio');
        if (heroBio) {
            showBioCheckbox.checked = heroBio.style.display !== 'none';
        }
        
        // Add change listener
        showBioCheckbox.addEventListener('change', function() {
            const heroBio = element.querySelector('.hero__bio');
            if (heroBio) {
                heroBio.style.display = this.checked ? '' : 'none';
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
}

/**
 * Set up a color picker with text input synchronization
 * @param {string} colorProperty - The color property name
 * @param {string} textProperty - The text property name
 * @param {HTMLElement} element - The component element
 * @param {Function} applyCallback - Callback to apply the color
 */
function setupColorPicker(colorProperty, textProperty, element, applyCallback) {
    const colorInput = document.querySelector(`[data-property="${colorProperty}"]`);
    const textInput = document.querySelector(`[data-property="${textProperty}"]`);
    
    if (!colorInput || !textInput) return;
    
    // Get initial color from element
    const currentColor = getComputedStyle(element).getPropertyValue(
        colorProperty === 'hero_bg_color' ? 'background-color' : 'color'
    );
    
    // Convert RGB to HEX if needed
    if (currentColor && currentColor.startsWith('rgb')) {
        const hex = rgbToHex(currentColor);
        colorInput.value = hex;
        textInput.value = hex;
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
    if (!rgbMatch) return '#000000';
    
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Escape HTML for safe insertion
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
