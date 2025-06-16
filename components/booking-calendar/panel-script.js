/**
 * Booking Calendar Component Panel Script
 * Handles the dynamic functionality of the booking calendar design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['booking-calendar'] = function(element, schema) {
    initializeBookingCalendarPanel(element, schema);
};

/**
 * Initialize booking calendar panel
 * @param {HTMLElement} element - The booking calendar component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeBookingCalendarPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Booking Calendar component schema:', schema);
    }
    
    // Handle calendar source change
    const calendarSourceSelect = document.querySelector('[data-property="calendar_source"]');
    const calendlyIntegration = document.getElementById('calendly-integration');
    
    if (calendarSourceSelect && calendlyIntegration) {
        // Get initial value
        const currentSource = element.getAttribute('data-calendar-source') || 'manual';
        calendarSourceSelect.value = currentSource;
        
        // Show/hide Calendly integration based on initial value
        calendlyIntegration.style.display = currentSource === 'calendly' ? 'block' : 'none';
        
        // Add change listener
        calendarSourceSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-calendar-source', this.value);
            
            // Show/hide Calendly integration
            calendlyIntegration.style.display = this.value === 'calendly' ? 'block' : 'none';
            
            // Show/hide services section based on calendar source
            const servicesSection = document.getElementById('services-section');
            if (servicesSection) {
                servicesSection.style.display = this.value === 'manual' ? 'block' : 'none';
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
        
        // Trigger change event to ensure proper initial state
        calendarSourceSelect.dispatchEvent(new Event('change'));
    }
    
    // Setup services list
    setupServicesList(element);
    
    // Setup calendar style
    const calendarStyleSelect = document.querySelector('[data-property="calendar_style"]');
    if (calendarStyleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-calendar-style') || 'standard';
        calendarStyleSelect.value = currentStyle;
        
        // Add change listener
        calendarStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-calendar-style', this.value);
            
            // Update classes
            element.classList.remove('calendar--standard', 'calendar--compact', 'calendar--detailed');
            element.classList.add('calendar--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Setup calendar color picker
    setupColorPicker('calendar_color', element, function(color) {
        element.style.setProperty('--calendar-accent-color', color);
    });
    
    // Setup day selectors
    setupDaySelectors(element);
}

/**
 * Setup services list functionality
 * @param {HTMLElement} element - The component element
 */
function setupServicesList(element) {
    const servicesList = document.getElementById('design-services-list');
    const addServiceBtn = document.getElementById('add-service-btn');
    
    if (!servicesList || !addServiceBtn) return;
    
    // Load existing services
    const existingServices = element.querySelectorAll('.service-item');
    servicesList.innerHTML = '';
    
    existingServices.forEach((service, index) => {
        const name = service.querySelector('.service-name')?.textContent || '';
        const duration = service.querySelector('.service-duration')?.textContent || '';
        const price = service.querySelector('.service-price')?.textContent || '';
        
        addServiceToPanel(name, duration, price, index);
    });
    
    // Add service button handler
    addServiceBtn.addEventListener('click', function() {
        const newIndex = servicesList.children.length;
        const serviceItem = addServiceToPanel('New Service', '60 min', '$100', newIndex);
        
        // Focus the first input
        const input = serviceItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updateServicesInComponent(element);
    });
}

/**
 * Add a service to the design panel
 * @param {string} name - Service name
 * @param {string} duration - Service duration
 * @param {string} price - Service price
 * @param {number} index - Service index
 * @returns {HTMLElement} - The service item element
 */
function addServiceToPanel(name, duration, price, index) {
    const servicesList = document.getElementById('design-services-list');
    const serviceItem = document.createElement('div');
    serviceItem.className = 'service-editor-item';
    serviceItem.innerHTML = `
        <div class="service-inputs">
            <input type="text" class="form-input" placeholder="Service Name" value="${escapeHtml(name)}" data-service-name="${index}">
            <input type="text" class="form-input" placeholder="Duration" value="${escapeHtml(duration)}" data-service-duration="${index}">
            <input type="text" class="form-input" placeholder="Price" value="${escapeHtml(price)}" data-service-price="${index}">
        </div>
        <button class="remove-item-btn" title="Remove service">×</button>
    `;
    
    // Input handlers
    const inputs = serviceItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateServicesInComponent(document.querySelector('.editable-element--selected'));
        });
    });
    
    // Remove button handler
    const removeBtn = serviceItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        serviceItem.remove();
        updateServicesInComponent(document.querySelector('.editable-element--selected'));
    });
    
    servicesList.appendChild(serviceItem);
    return serviceItem;
}

/**
 * Update services in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateServicesInComponent(element) {
    if (!element) return;
    
    const servicesContainer = element.querySelector('.services-container');
    if (!servicesContainer) return;
    
    const serviceItems = document.querySelectorAll('.service-editor-item');
    
    // Clear existing services
    servicesContainer.innerHTML = '';
    
    // Add services from panel
    serviceItems.forEach((item, index) => {
        const nameInput = item.querySelector(`[data-service-name="${index}"]`);
        const durationInput = item.querySelector(`[data-service-duration="${index}"]`);
        const priceInput = item.querySelector(`[data-service-price="${index}"]`);
        
        if (nameInput && durationInput && priceInput) {
            const serviceDiv = document.createElement('div');
            serviceDiv.className = 'service-item';
            serviceDiv.innerHTML = `
                <div class="service-name" contenteditable="true">${escapeHtml(nameInput.value)}</div>
                <div class="service-details">
                    <span class="service-duration" contenteditable="true">${escapeHtml(durationInput.value)}</span>
                    <span class="service-price" contenteditable="true">${escapeHtml(priceInput.value)}</span>
                </div>
            `;
            servicesContainer.appendChild(serviceDiv);
        }
    });
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Setup day selectors functionality
 * @param {HTMLElement} element - The component element
 */
function setupDaySelectors(element) {
    const daySelectors = document.querySelectorAll('.day-selector');
    
    daySelectors.forEach(daySelector => {
        const checkbox = daySelector.querySelector('input[type="checkbox"]');
        const timeInputs = daySelector.querySelectorAll('.time-input');
        
        if (!checkbox) return;
        
        // Update time inputs disabled state based on checkbox
        function updateTimeInputs() {
            timeInputs.forEach(input => {
                input.disabled = !checkbox.checked;
            });
        }
        
        // Initial state
        updateTimeInputs();
        
        // Add change listener
        checkbox.addEventListener('change', function() {
            updateTimeInputs();
            
            // Update component availability
            updateAvailabilityInComponent(element);
        });
        
        // Add change listeners to time inputs
        timeInputs.forEach(input => {
            input.addEventListener('change', function() {
                updateAvailabilityInComponent(element);
            });
        });
    });
}

/**
 * Update availability in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateAvailabilityInComponent(element) {
    // This would update a visual representation of availability in the component
    // For now, we'll just trigger a save event
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
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
    
    // Get initial color
    const currentColor = element.style.getPropertyValue('--calendar-accent-color');
    if (currentColor) {
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
