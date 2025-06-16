/**
 * Logo Grid Component Panel Script
 * Handles the dynamic functionality of the logo grid design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['logo-grid'] = function(element, schema) {
    initializeLogoGridPanel(element, schema);
};

/**
 * Initialize logo grid panel
 * @param {HTMLElement} element - The logo grid component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeLogoGridPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Logo Grid component schema:', schema);
    }
    
    // Setup logos list
    setupLogosList(element);
    
    // Handle columns change
    const columnsSelect = document.querySelector('[data-property="columns"]');
    if (columnsSelect) {
        // Get initial value
        const currentColumns = element.getAttribute('data-columns') || '4';
        columnsSelect.value = currentColumns;
        
        // Add change listener
        columnsSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-columns', this.value);
            
            // Update grid style
            const logoGrid = element.querySelector('.logo-grid');
            if (logoGrid) {
                logoGrid.style.gridTemplateColumns = `repeat(${this.value}, 1fr)`;
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle display style change
    const displayStyleSelect = document.querySelector('[data-property="displayStyle"]');
    if (displayStyleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-display-style') || 'grid';
        displayStyleSelect.value = currentStyle;
        
        // Add change listener
        displayStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-display-style', this.value);
            
            // Update classes
            element.classList.remove('logo-display--grid', 'logo-display--slider', 'logo-display--masonry');
            element.classList.add('logo-display--' + this.value);
            
            // Show/hide auto-scroll option based on display style
            const autoScrollGroup = document.querySelector('[data-property="autoScroll"]').closest('.form-group');
            if (autoScrollGroup) {
                autoScrollGroup.style.display = this.value === 'slider' ? 'block' : 'none';
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
        
        // Trigger change event to ensure proper initial state
        displayStyleSelect.dispatchEvent(new Event('change'));
    }
    
    // Handle show names toggle
    const showNamesCheckbox = document.querySelector('[data-property="showNames"]');
    if (showNamesCheckbox) {
        // Get initial state
        const logoNames = element.querySelectorAll('.logo-name');
        if (logoNames.length) {
            showNamesCheckbox.checked = logoNames[0].style.display !== 'none';
        }
        
        // Add change listener
        showNamesCheckbox.addEventListener('change', function() {
            const logoNames = element.querySelectorAll('.logo-name');
            logoNames.forEach(name => {
                name.style.display = this.checked ? '' : 'none';
            });
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle logo size change
    const logoSizeSelect = document.querySelector('[data-property="logoSize"]');
    if (logoSizeSelect) {
        // Get initial value
        const currentSize = element.getAttribute('data-logo-size') || 'medium';
        logoSizeSelect.value = currentSize;
        
        // Add change listener
        logoSizeSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-logo-size', this.value);
            
            // Update classes
            element.classList.remove('logo-size--small', 'logo-size--medium', 'logo-size--large');
            element.classList.add('logo-size--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle logo style change
    const logoStyleSelect = document.querySelector('[data-property="logoStyle"]');
    if (logoStyleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-logo-style') || 'default';
        logoStyleSelect.value = currentStyle;
        
        // Add change listener
        logoStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-logo-style', this.value);
            
            // Update classes
            element.classList.remove('logo-style--default', 'logo-style--grayscale', 'logo-style--colored', 'logo-style--outlined');
            element.classList.add('logo-style--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle background style change
    const backgroundStyleSelect = document.querySelector('[data-property="backgroundStyle"]');
    if (backgroundStyleSelect) {
        // Get initial value
        const currentBg = element.getAttribute('data-bg-style') || 'transparent';
        backgroundStyleSelect.value = currentBg;
        
        // Add change listener
        backgroundStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-bg-style', this.value);
            
            // Update classes
            element.classList.remove('bg-style--transparent', 'bg-style--light', 'bg-style--dark', 'bg-style--branded');
            element.classList.add('bg-style--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle borders toggle
    const addBordersCheckbox = document.querySelector('[data-property="addBorders"]');
    if (addBordersCheckbox) {
        // Get initial state
        addBordersCheckbox.checked = element.classList.contains('logo-grid--bordered');
        
        // Add change listener
        addBordersCheckbox.addEventListener('change', function() {
            if (this.checked) {
                element.classList.add('logo-grid--bordered');
            } else {
                element.classList.remove('logo-grid--bordered');
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle animation change
    const animationSelect = document.querySelector('[data-property="animation"]');
    if (animationSelect) {
        // Get initial value
        const currentAnimation = element.getAttribute('data-animation') || 'none';
        animationSelect.value = currentAnimation;
        
        // Add change listener
        animationSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-animation', this.value);
            
            // Update classes
            element.classList.remove('animate-fade', 'animate-slide', 'animate-zoom');
            if (this.value !== 'none') {
                element.classList.add('animate-' + this.value);
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle auto-scroll toggle
    const autoScrollCheckbox = document.querySelector('[data-property="autoScroll"]');
    if (autoScrollCheckbox) {
        // Get initial state
        autoScrollCheckbox.checked = element.hasAttribute('data-auto-scroll');
        
        // Add change listener
        autoScrollCheckbox.addEventListener('change', function() {
            if (this.checked) {
                element.setAttribute('data-auto-scroll', 'true');
            } else {
                element.removeAttribute('data-auto-scroll');
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Setup text content updaters
    setupTextContentUpdater('title', '.logo-grid-title', element);
    setupTextContentUpdater('description', '.logo-grid-description', element);
}

/**
 * Setup logos list functionality
 * @param {HTMLElement} element - The component element
 */
function setupLogosList(element) {
    const logosList = document.getElementById('design-logos-list');
    const addLogoBtn = document.getElementById('add-logo-btn');
    
    if (!logosList || !addLogoBtn) return;
    
    // Load existing logos
    const existingLogos = element.querySelectorAll('.logo-item');
    logosList.innerHTML = '';
    
    existingLogos.forEach((logo, index) => {
        const logoImg = logo.querySelector('img');
        const logoName = logo.querySelector('.logo-name')?.textContent || '';
        const logoUrl = logo.querySelector('a')?.getAttribute('href') || '';
        const logoSrc = logoImg?.getAttribute('src') || '';
        const logoAlt = logoImg?.getAttribute('alt') || '';
        
        addLogoToPanel(logoName, logoUrl, logoSrc, logoAlt, index);
    });
    
    // Add logo button handler
    addLogoBtn.addEventListener('click', function() {
        const newIndex = logosList.children.length;
        const logoItem = addLogoToPanel('Company Name', '#', '', 'Company Logo', newIndex);
        
        // Focus the first input
        const input = logoItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updateLogosInComponent(element);
    });
}

/**
 * Add a logo to the design panel
 * @param {string} name - Logo name
 * @param {string} url - Logo URL
 * @param {string} src - Logo image source
 * @param {string} alt - Logo image alt text
 * @param {number} index - Logo index
 * @returns {HTMLElement} - The logo item element
 */
function addLogoToPanel(name, url, src, alt, index) {
    const logosList = document.getElementById('design-logos-list');
    const logoItem = document.createElement('div');
    logoItem.className = 'logo-editor-item';
    logoItem.innerHTML = `
        <div class="logo-preview">
            ${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="logo-thumbnail">` : '<div class="logo-placeholder">No Image</div>'}
        </div>
        <div class="logo-inputs">
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" value="${escapeHtml(name)}" data-logo-name="${index}">
            </div>
            <div class="form-group">
                <label class="form-label">URL (Optional)</label>
                <input type="url" class="form-input" value="${escapeHtml(url)}" data-logo-url="${index}">
            </div>
            <div class="form-group">
                <label class="form-label">Logo Image</label>
                <div class="image-upload-control">
                    <button class="upload-image-btn" data-logo-index="${index}">Choose Image</button>
                    <span class="selected-image">${src ? 'Image selected' : 'No image selected'}</span>
                </div>
                <input type="hidden" data-logo-src="${index}" value="${escapeHtml(src)}">
                <input type="hidden" data-logo-alt="${index}" value="${escapeHtml(alt)}">
            </div>
        </div>
        <button class="remove-item-btn" title="Remove logo">×</button>
    `;
    
    // Input handlers
    const inputs = logoItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateLogosInComponent(document.querySelector('.editable-element--selected'));
        });
    });
    
    // Image upload handler
    const uploadBtn = logoItem.querySelector('.upload-image-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            // This would typically use the WordPress media uploader
            // For now, we'll just use a placeholder
            alert('Image upload functionality would open media browser here');
            
            // In a real implementation, we would set the logo src and alt attributes
            // and update the component accordingly
            
            // Simulating an image selection
            const srcInput = logoItem.querySelector(`[data-logo-src="${index}"]`);
            const altInput = logoItem.querySelector(`[data-logo-alt="${index}"]`);
            const nameInput = logoItem.querySelector(`[data-logo-name="${index}"]`);
            const logoPreview = logoItem.querySelector('.logo-preview');
            
            if (srcInput && altInput && nameInput && logoPreview) {
                // For demonstration, we'll use a placeholder image
                const placeholderSrc = 'https://via.placeholder.com/150x75?text=Logo';
                srcInput.value = placeholderSrc;
                altInput.value = nameInput.value + ' Logo';
                
                // Update preview
                logoPreview.innerHTML = `<img src="${placeholderSrc}" alt="${nameInput.value} Logo" class="logo-thumbnail">`;
                
                // Update component
                updateLogosInComponent(document.querySelector('.editable-element--selected'));
            }
        });
    }
    
    // Remove button handler
    const removeBtn = logoItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        logoItem.remove();
        updateLogosInComponent(document.querySelector('.editable-element--selected'));
    });
    
    logosList.appendChild(logoItem);
    return logoItem;
}

/**
 * Update logos in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateLogosInComponent(element) {
    if (!element) return;
    
    const logoGrid = element.querySelector('.logo-grid');
    if (!logoGrid) return;
    
    const logoItems = document.querySelectorAll('.logo-editor-item');
    
    // Clear existing logos
    logoGrid.innerHTML = '';
    
    // Add logos from panel
    logoItems.forEach((item, index) => {
        const nameInput = item.querySelector(`[data-logo-name="${index}"]`);
        const urlInput = item.querySelector(`[data-logo-url="${index}"]`);
        const srcInput = item.querySelector(`[data-logo-src="${index}"]`);
        const altInput = item.querySelector(`[data-logo-alt="${index}"]`);
        
        if (nameInput && urlInput && srcInput && altInput) {
            const logoDiv = document.createElement('div');
            logoDiv.className = 'logo-item';
            
            const logoContent = document.createElement('div');
            logoContent.className = 'logo-content';
            
            // Create logo image or placeholder
            if (srcInput.value) {
                const img = document.createElement('img');
                img.src = srcInput.value;
                img.alt = altInput.value || nameInput.value + ' Logo';
                img.className = 'logo-image';
                logoContent.appendChild(img);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'logo-placeholder';
                placeholder.textContent = nameInput.value.charAt(0);
                logoContent.appendChild(placeholder);
            }
            
            // Create logo name
            const logoName = document.createElement('div');
            logoName.className = 'logo-name';
            logoName.textContent = nameInput.value;
            logoName.setAttribute('contenteditable', 'true');
            logoContent.appendChild(logoName);
            
            // Wrap in link if URL is provided
            if (urlInput.value && urlInput.value !== '#') {
                const link = document.createElement('a');
                link.href = urlInput.value;
                link.target = '_blank';
                link.rel = 'noopener';
                link.appendChild(logoContent);
                logoDiv.appendChild(link);
            } else {
                logoDiv.appendChild(logoContent);
            }
            
            logoGrid.appendChild(logoDiv);
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
 * Escape HTML for safe insertion
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
