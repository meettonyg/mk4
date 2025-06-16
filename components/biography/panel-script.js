/**
 * Biography Component Panel Script
 * Handles the dynamic functionality of the biography design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['biography'] = function(element, schema) {
    initializeBiographyPanel(element, schema);
};

/**
 * Initialize biography panel
 * @param {HTMLElement} element - The biography component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeBiographyPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Biography component schema:', schema);
    }
    
    // Set up style change handler
    const styleSelect = document.querySelector('[data-property="style"]');
    if (styleSelect) {
        // Get initial value from element if available
        const currentStyle = element.getAttribute('data-style');
        if (currentStyle) {
            styleSelect.value = currentStyle;
        }
        
        // Add change listener
        styleSelect.addEventListener('change', function() {
            // Update the data attribute
            element.setAttribute('data-style', this.value);
            
            // Update classes
            element.classList.remove('biography--standard', 'biography--featured', 'biography--bordered');
            element.classList.add('biography--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Set up content textarea handler with enhanced functionality
    const contentTextarea = document.querySelector('[data-property="content"]');
    if (contentTextarea) {
        // Get initial content from the biography text element
        const biographyText = element.querySelector('.biography-text');
        if (biographyText) {
            contentTextarea.value = biographyText.innerHTML.replace(/<br\s*\/?>/g, '\n').trim();
        }
        
        // Add input listener
        contentTextarea.addEventListener('input', function() {
            // Update the biography text with formatted content
            const biographyText = element.querySelector('.biography-text');
            if (biographyText) {
                // Convert line breaks to <br> tags for display
                biographyText.innerHTML = this.value.replace(/\n/g, '<br>');
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
    
    // Handle section title visibility toggle
    const showTitleCheckbox = document.querySelector('[data-property="show_section_title"]');
    if (showTitleCheckbox) {
        // Get initial state
        const sectionTitle = element.querySelector('.section-title');
        if (sectionTitle) {
            showTitleCheckbox.checked = sectionTitle.style.display !== 'none';
        }
        
        // Add change listener
        showTitleCheckbox.addEventListener('change', function() {
            const sectionTitle = element.querySelector('.section-title');
            if (sectionTitle) {
                sectionTitle.style.display = this.checked ? '' : 'none';
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
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
