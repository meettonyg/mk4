/**
 * Contact Component Panel Script
 * Handles the dynamic functionality of the contact design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['contact'] = function(element, schema) {
    initializeContactPanel(element, schema);
};

/**
 * Initialize contact panel
 * @param {HTMLElement} element - The contact component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeContactPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Contact component schema:', schema);
    }
    
    // Handle contact type change
    const contactTypeSelect = document.querySelector('[data-property="contactType"]');
    const formSection = document.getElementById('contact-form-section');
    const infoSection = document.getElementById('contact-info-section');
    
    if (contactTypeSelect && formSection && infoSection) {
        // Get initial value
        const currentType = element.getAttribute('data-contact-type') || 'form';
        contactTypeSelect.value = currentType;
        
        // Set initial visibility
        updateSectionVisibility(currentType);
        
        // Add change listener
        contactTypeSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-contact-type', this.value);
            
            // Update section visibility
            updateSectionVisibility(this.value);
            
            // Update component display
            updateContactDisplay(element, this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle layout changes
    const layoutSelect = document.querySelector('[data-property="layout"]');
    if (layoutSelect) {
        // Get initial value
        const currentLayout = element.getAttribute('data-layout') || 'standard';
        layoutSelect.value = currentLayout;
        
        // Add change listener
        layoutSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-layout', this.value);
            
            // Update classes
            element.classList.remove('contact--standard', 'contact--columns', 'contact--compact');
            element.classList.add('contact--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle form fields checkboxes
    const formFieldCheckboxes = document.querySelectorAll('[data-property^="showField"]');
    formFieldCheckboxes.forEach(checkbox => {
        const fieldType = checkbox.getAttribute('data-property').replace('show', '').replace('Field', '').toLowerCase();
        
        // Get initial state
        const fieldElement = element.querySelector(`.form-field--${fieldType}`);
        if (fieldElement) {
            checkbox.checked = fieldElement.style.display !== 'none';
        }
        
        // Add change listener
        checkbox.addEventListener('change', function() {
            const fieldElement = element.querySelector(`.form-field--${fieldType}`);
            if (fieldElement) {
                fieldElement.style.display = this.checked ? '' : 'none';
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    });
    
    // Handle social media toggle
    const showSocialCheckbox = document.getElementById('showSocial');
    if (showSocialCheckbox) {
        // Get initial state
        const socialLinks = element.querySelector('.contact-social-links');
        if (socialLinks) {
            showSocialCheckbox.checked = socialLinks.style.display !== 'none';
        }
        
        // Add change listener
        showSocialCheckbox.addEventListener('change', function() {
            const socialLinks = element.querySelector('.contact-social-links');
            if (socialLinks) {
                socialLinks.style.display = this.checked ? '' : 'none';
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
    
    // Setup custom contacts list
    setupCustomContactsList(element);
    
    // Setup accent color picker
    setupColorPicker('accentColor', element, function(color) {
        element.style.setProperty('--contact-accent-color', color);
        
        // Apply to buttons
        const buttons = element.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.backgroundColor = color;
        });
    });
    
    // Add input handlers for text content
    setupTextContentUpdater('title', '.contact-section-title', element);
    setupTextContentUpdater('description', '.contact-section-description', element);
    setupTextContentUpdater('submitButtonText', '.contact-submit-button', element);
    
    // Add input handler for notification email
    const notificationEmailInput = document.querySelector('[data-property="notificationEmail"]');
    if (notificationEmailInput) {
        // Get initial value
        const formElement = element.querySelector('form');
        if (formElement) {
            const dataEmail = formElement.getAttribute('data-notification-email');
            if (dataEmail) {
                notificationEmailInput.value = dataEmail;
            }
        }
        
        // Add input listener
        notificationEmailInput.addEventListener('input', function() {
            const formElement = element.querySelector('form');
            if (formElement) {
                formElement.setAttribute('data-notification-email', this.value);
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
    
    // Add input handler for form action
    const formActionInput = document.querySelector('[data-property="formAction"]');
    if (formActionInput) {
        // Get initial value
        const formElement = element.querySelector('form');
        if (formElement) {
            formActionInput.value = formElement.getAttribute('action') || '';
        }
        
        // Add input listener
        formActionInput.addEventListener('input', function() {
            const formElement = element.querySelector('form');
            if (formElement) {
                formElement.setAttribute('action', this.value);
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
    
    // Add change handler for form method
    const formMethodSelect = document.querySelector('[data-property="formMethod"]');
    if (formMethodSelect) {
        // Get initial value
        const formElement = element.querySelector('form');
        if (formElement) {
            formMethodSelect.value = formElement.getAttribute('method') || 'post';
        }
        
        // Add change listener
        formMethodSelect.addEventListener('change', function() {
            const formElement = element.querySelector('form');
            if (formElement) {
                formElement.setAttribute('method', this.value);
                
                // Trigger save
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }
        });
    }
    
    // Update contact info inputs
    updateContactInfoInput('contactEmail', '.contact-email', element);
    updateContactInfoInput('contactPhone', '.contact-phone', element);
    updateContactInfoInput('contactAddress', '.contact-address', element);
}

/**
 * Update section visibility based on contact type
 * @param {string} contactType - The contact type
 */
function updateSectionVisibility(contactType) {
    const formSection = document.getElementById('contact-form-section');
    const infoSection = document.getElementById('contact-info-section');
    
    if (formSection && infoSection) {
        if (contactType === 'form') {
            formSection.style.display = 'block';
            infoSection.style.display = 'none';
        } else if (contactType === 'info') {
            formSection.style.display = 'none';
            infoSection.style.display = 'block';
        } else if (contactType === 'both') {
            formSection.style.display = 'block';
            infoSection.style.display = 'block';
        }
    }
}

/**
 * Update contact display in the component
 * @param {HTMLElement} element - The component element
 * @param {string} contactType - The contact type
 */
function updateContactDisplay(element, contactType) {
    const formContainer = element.querySelector('.contact-form-container');
    const infoContainer = element.querySelector('.contact-info-container');
    
    if (formContainer && infoContainer) {
        if (contactType === 'form') {
            formContainer.style.display = '';
            infoContainer.style.display = 'none';
        } else if (contactType === 'info') {
            formContainer.style.display = 'none';
            infoContainer.style.display = '';
        } else if (contactType === 'both') {
            formContainer.style.display = '';
            infoContainer.style.display = '';
        }
    }
}

/**
 * Setup custom contacts list functionality
 * @param {HTMLElement} element - The component element
 */
function setupCustomContactsList(element) {
    const contactsList = document.getElementById('custom-contacts-list');
    const addContactBtn = document.getElementById('add-contact-btn');
    
    if (!contactsList || !addContactBtn) return;
    
    // Load existing custom contacts
    const existingContacts = element.querySelectorAll('.custom-contact-item');
    contactsList.innerHTML = '';
    
    existingContacts.forEach((contact, index) => {
        const label = contact.querySelector('.contact-label')?.textContent || '';
        const value = contact.querySelector('.contact-value')?.textContent || '';
        
        addContactToPanel(label, value, index);
    });
    
    // Add contact button handler
    addContactBtn.addEventListener('click', function() {
        const newIndex = contactsList.children.length;
        const contactItem = addContactToPanel('Label', 'Value', newIndex);
        
        // Focus the first input
        const input = contactItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updateCustomContactsInComponent(element);
    });
}

/**
 * Add a custom contact to the design panel
 * @param {string} label - Contact label
 * @param {string} value - Contact value
 * @param {number} index - Contact index
 * @returns {HTMLElement} - The contact item element
 */
function addContactToPanel(label, value, index) {
    const contactsList = document.getElementById('custom-contacts-list');
    const contactItem = document.createElement('div');
    contactItem.className = 'custom-contact-editor-item';
    contactItem.innerHTML = `
        <div class="contact-inputs">
            <input type="text" class="form-input" placeholder="Label" value="${escapeHtml(label)}" data-contact-label="${index}">
            <input type="text" class="form-input" placeholder="Value" value="${escapeHtml(value)}" data-contact-value="${index}">
        </div>
        <button class="remove-item-btn" title="Remove contact">×</button>
    `;
    
    // Input handlers
    const inputs = contactItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateCustomContactsInComponent(document.querySelector('.editable-element--selected'));
        });
    });
    
    // Remove button handler
    const removeBtn = contactItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        contactItem.remove();
        updateCustomContactsInComponent(document.querySelector('.editable-element--selected'));
    });
    
    contactsList.appendChild(contactItem);
    return contactItem;
}

/**
 * Update custom contacts in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateCustomContactsInComponent(element) {
    if (!element) return;
    
    const customContactsContainer = element.querySelector('.custom-contacts-container');
    if (!customContactsContainer) return;
    
    const contactItems = document.querySelectorAll('.custom-contact-editor-item');
    
    // Clear existing custom contacts
    customContactsContainer.innerHTML = '';
    
    // Add contacts from panel
    contactItems.forEach((item, index) => {
        const labelInput = item.querySelector(`[data-contact-label="${index}"]`);
        const valueInput = item.querySelector(`[data-contact-value="${index}"]`);
        
        if (labelInput && valueInput) {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'custom-contact-item';
            contactDiv.innerHTML = `
                <span class="contact-label" contenteditable="true">${escapeHtml(labelInput.value)}</span>
                <span class="contact-value" contenteditable="true">${escapeHtml(valueInput.value)}</span>
            `;
            customContactsContainer.appendChild(contactDiv);
        }
    });
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
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
 * Update contact info input
 * @param {string} property - The property name
 * @param {string} selector - The element selector
 * @param {HTMLElement} component - The component element
 */
function updateContactInfoInput(property, selector, component) {
    const input = document.querySelector(`[data-property="${property}"]`);
    if (!input) return;
    
    // Get initial value
    const element = component.querySelector(selector);
    if (element) {
        const value = element.getAttribute('href') || element.textContent.trim();
        input.value = value;
    }
    
    // Add input listener
    input.addEventListener('input', function() {
        const element = component.querySelector(selector);
        if (element) {
            if (property === 'contactEmail') {
                element.setAttribute('href', 'mailto:' + this.value);
                element.textContent = this.value;
            } else if (property === 'contactPhone') {
                element.setAttribute('href', 'tel:' + this.value);
                element.textContent = this.value;
            } else {
                element.textContent = this.value;
            }
            
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
    
    // Get current color if available
    const currentColor = getComputedStyle(element).getPropertyValue('--contact-accent-color');
    if (currentColor && currentColor !== '') {
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
    if (!rgbMatch) return '#4f46e5'; // Default color
    
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
