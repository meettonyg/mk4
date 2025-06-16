/**
 * Social Component Panel Script
 * Handles the dynamic functionality of the social design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['social'] = function(element, schema) {
    initializeSocialPanel(element, schema);
};

/**
 * Initialize social panel
 * @param {HTMLElement} element - The social component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeSocialPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Social component schema:', schema);
    }
    
    // Setup social profile inputs
    setupSocialProfileInputs(element);
    
    // Setup custom social links
    setupCustomSocialLinks(element);
    
    // Handle icon style change
    const iconStyleSelect = document.querySelector('[data-property="icon_style"]');
    if (iconStyleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-icon-style') || 'solid';
        iconStyleSelect.value = currentStyle;
        
        // Add change listener
        iconStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-icon-style', this.value);
            
            // Update classes
            element.classList.remove('icon-style--solid', 'icon-style--outline', 'icon-style--minimal', 'icon-style--branded');
            element.classList.add('icon-style--' + this.value);
            
            // Handle branded colors specially
            const iconColor = document.querySelector('[data-property="icon_color"]');
            const bgColor = document.querySelector('[data-property="background_color"]');
            
            if (this.value === 'branded') {
                if (iconColor) iconColor.disabled = true;
                if (bgColor) bgColor.disabled = true;
                
                // Set each social icon to its branded color
                const socialIcons = element.querySelectorAll('.social-icon');
                socialIcons.forEach(icon => {
                    const platform = icon.getAttribute('data-platform');
                    if (platform) {
                        icon.style.backgroundColor = getBrandedColor(platform);
                        icon.style.color = '#ffffff';
                    }
                });
            } else {
                if (iconColor) iconColor.disabled = false;
                if (bgColor) bgColor.disabled = false;
                
                // Reset to selected colors
                const iconColorValue = document.querySelector('[data-property="icon_color"]').value;
                const bgColorValue = document.querySelector('[data-property="background_color"]').value;
                
                const socialIcons = element.querySelectorAll('.social-icon');
                socialIcons.forEach(icon => {
                    icon.style.backgroundColor = bgColorValue;
                    icon.style.color = iconColorValue;
                });
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle icon size change
    const iconSizeSelect = document.querySelector('[data-property="icon_size"]');
    if (iconSizeSelect) {
        // Get initial value
        const currentSize = element.getAttribute('data-icon-size') || 'medium';
        iconSizeSelect.value = currentSize;
        
        // Add change listener
        iconSizeSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-icon-size', this.value);
            
            // Update classes
            element.classList.remove('icon-size--small', 'icon-size--medium', 'icon-size--large');
            element.classList.add('icon-size--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle layout change
    const layoutSelect = document.querySelector('[data-property="layout"]');
    if (layoutSelect) {
        // Get initial value
        const currentLayout = element.getAttribute('data-layout') || 'horizontal';
        layoutSelect.value = currentLayout;
        
        // Add change listener
        layoutSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-layout', this.value);
            
            // Update classes
            element.classList.remove('layout--horizontal', 'layout--vertical', 'layout--grid');
            element.classList.add('layout--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle icon shape change
    const iconShapeSelect = document.querySelector('[data-property="icon_shape"]');
    if (iconShapeSelect) {
        // Get initial value
        const currentShape = element.getAttribute('data-icon-shape') || 'circle';
        iconShapeSelect.value = currentShape;
        
        // Add change listener
        iconShapeSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-icon-shape', this.value);
            
            // Update classes
            element.classList.remove('icon-shape--circle', 'icon-shape--square', 'icon-shape--rounded', 'icon-shape--none');
            element.classList.add('icon-shape--' + this.value);
            
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
            element.classList.remove('animation--none', 'animation--pulse', 'animation--bounce', 'animation--shake');
            element.classList.add('animation--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle show labels toggle
    const showLabelsCheckbox = document.querySelector('[data-property="show_labels"]');
    if (showLabelsCheckbox) {
        // Get initial state
        showLabelsCheckbox.checked = element.hasAttribute('data-show-labels');
        
        // Add change listener
        showLabelsCheckbox.addEventListener('change', function() {
            if (this.checked) {
                element.setAttribute('data-show-labels', 'true');
            } else {
                element.removeAttribute('data-show-labels');
            }
            
            // Update labels visibility
            const labels = element.querySelectorAll('.social-label');
            labels.forEach(label => {
                label.style.display = this.checked ? '' : 'none';
            });
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle open in new tab toggle
    const openNewTabCheckbox = document.querySelector('[data-property="open_new_tab"]');
    if (openNewTabCheckbox) {
        // Get initial state
        const socialLinks = element.querySelectorAll('.social-link');
        if (socialLinks.length > 0) {
            openNewTabCheckbox.checked = socialLinks[0].getAttribute('target') === '_blank';
        }
        
        // Add change listener
        openNewTabCheckbox.addEventListener('change', function() {
            const socialLinks = element.querySelectorAll('.social-link');
            socialLinks.forEach(link => {
                if (this.checked) {
                    link.setAttribute('target', '_blank');
                } else {
                    link.removeAttribute('target');
                }
            });
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle nofollow toggle
    const nofollowCheckbox = document.querySelector('[data-property="add_rel_nofollow"]');
    if (nofollowCheckbox) {
        // Get initial state
        const socialLinks = element.querySelectorAll('.social-link');
        if (socialLinks.length > 0) {
            nofollowCheckbox.checked = socialLinks[0].getAttribute('rel')?.includes('nofollow') || false;
        }
        
        // Add change listener
        nofollowCheckbox.addEventListener('change', function() {
            const socialLinks = element.querySelectorAll('.social-link');
            socialLinks.forEach(link => {
                if (this.checked) {
                    link.setAttribute('rel', 'nofollow noopener');
                } else {
                    link.setAttribute('rel', 'noopener');
                }
            });
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Setup color pickers
    setupColorPicker('icon_color', element, function(color) {
        // Only apply if not using branded colors
        if (element.getAttribute('data-icon-style') !== 'branded') {
            const socialIcons = element.querySelectorAll('.social-icon');
            socialIcons.forEach(icon => {
                icon.style.color = color;
            });
        }
    });
    
    setupColorPicker('background_color', element, function(color) {
        // Only apply if not using branded colors
        if (element.getAttribute('data-icon-style') !== 'branded') {
            const socialIcons = element.querySelectorAll('.social-icon');
            socialIcons.forEach(icon => {
                icon.style.backgroundColor = color;
            });
        }
    });
    
    setupColorPicker('hover_color', element, function(color) {
        element.style.setProperty('--social-hover-color', color);
    });
}

/**
 * Setup social profile inputs
 * @param {HTMLElement} element - The component element
 */
function setupSocialProfileInputs(element) {
    const socialInputs = document.querySelectorAll('[data-property^="social_"], [data-property$="_url"]');
    
    socialInputs.forEach(input => {
        const platform = input.getAttribute('data-property').replace('social_', '').replace('_url', '');
        
        // Get initial value
        const socialLink = element.querySelector(`.social-link[data-platform="${platform}"]`);
        if (socialLink) {
            input.value = socialLink.getAttribute('href') || '';
        }
        
        // Add input listener
        input.addEventListener('input', function() {
            updateSocialIcon(element, platform, this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    });
}

/**
 * Update social icon visibility and link
 * @param {HTMLElement} element - The component element
 * @param {string} platform - The social platform
 * @param {string} url - The URL to link to
 */
function updateSocialIcon(element, platform, url) {
    let socialIcon = element.querySelector(`.social-icon[data-platform="${platform}"]`);
    const socialContainer = element.querySelector('.social-icons-container');
    
    if (!socialContainer) return;
    
    // If URL is empty, remove the icon
    if (!url) {
        if (socialIcon) {
            socialIcon.parentElement.remove();
        }
        return;
    }
    
    // If icon doesn't exist, create it
    if (!socialIcon) {
        const iconLink = document.createElement('a');
        iconLink.className = 'social-link';
        iconLink.setAttribute('href', url);
        iconLink.setAttribute('data-platform', platform);
        
        // Add target and rel attributes based on settings
        const openNewTab = document.querySelector('[data-property="open_new_tab"]').checked;
        const addNofollow = document.querySelector('[data-property="add_rel_nofollow"]').checked;
        
        if (openNewTab) {
            iconLink.setAttribute('target', '_blank');
        }
        
        iconLink.setAttribute('rel', addNofollow ? 'nofollow noopener' : 'noopener');
        
        // Create icon
        const icon = document.createElement('div');
        icon.className = 'social-icon';
        icon.setAttribute('data-platform', platform);
        
        // Set icon content
        icon.innerHTML = getSocialIconSvg(platform);
        
        // Set styles based on current settings
        const iconStyle = element.getAttribute('data-icon-style') || 'solid';
        if (iconStyle === 'branded') {
            icon.style.backgroundColor = getBrandedColor(platform);
            icon.style.color = '#ffffff';
        } else {
            const bgColor = document.querySelector('[data-property="background_color"]').value;
            const iconColor = document.querySelector('[data-property="icon_color"]').value;
            
            icon.style.backgroundColor = bgColor;
            icon.style.color = iconColor;
        }
        
        // Add label if needed
        const showLabels = element.hasAttribute('data-show-labels');
        if (showLabels) {
            const label = document.createElement('span');
            label.className = 'social-label';
            label.textContent = getPlatformName(platform);
            iconLink.appendChild(label);
        }
        
        iconLink.appendChild(icon);
        socialContainer.appendChild(iconLink);
    } else {
        // Update existing icon
        const iconLink = socialIcon.closest('.social-link');
        if (iconLink) {
            iconLink.setAttribute('href', url);
        }
    }
}

/**
 * Setup custom social links functionality
 * @param {HTMLElement} element - The component element
 */
function setupCustomSocialLinks(element) {
    const customLinksContainer = document.getElementById('custom-social-links');
    const addLinkBtn = document.getElementById('add-social-link-btn');
    
    if (!customLinksContainer || !addLinkBtn) return;
    
    // Load existing custom links
    const customLinks = element.querySelectorAll('.social-link[data-platform="custom"]');
    customLinksContainer.innerHTML = '';
    
    customLinks.forEach((link, index) => {
        const url = link.getAttribute('href') || '';
        const label = link.querySelector('.social-label')?.textContent || '';
        
        addCustomLinkToPanel(label, url, index);
    });
    
    // Add custom link button handler
    addLinkBtn.addEventListener('click', function() {
        const newIndex = customLinksContainer.children.length;
        const linkItem = addCustomLinkToPanel('Custom Link', 'https://', newIndex);
        
        // Focus the label input
        const input = linkItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updateCustomLinksInComponent(element);
    });
}

/**
 * Add a custom link to the design panel
 * @param {string} label - Link label
 * @param {string} url - Link URL
 * @param {number} index - Link index
 * @returns {HTMLElement} - The link item element
 */
function addCustomLinkToPanel(label, url, index) {
    const customLinksContainer = document.getElementById('custom-social-links');
    const linkItem = document.createElement('div');
    linkItem.className = 'custom-link-item';
    linkItem.innerHTML = `
        <div class="custom-link-inputs">
            <div class="form-group">
                <label class="form-label">Label</label>
                <input type="text" class="form-input" value="${escapeHtml(label)}" data-custom-label="${index}">
            </div>
            <div class="form-group">
                <label class="form-label">URL</label>
                <input type="url" class="form-input" value="${escapeHtml(url)}" data-custom-url="${index}">
            </div>
        </div>
        <button class="remove-item-btn" title="Remove link">×</button>
    `;
    
    // Input handlers
    const inputs = linkItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateCustomLinksInComponent(document.querySelector('.editable-element--selected'));
        });
    });
    
    // Remove button handler
    const removeBtn = linkItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        linkItem.remove();
        updateCustomLinksInComponent(document.querySelector('.editable-element--selected'));
    });
    
    customLinksContainer.appendChild(linkItem);
    return linkItem;
}

/**
 * Update custom links in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateCustomLinksInComponent(element) {
    if (!element) return;
    
    const socialContainer = element.querySelector('.social-icons-container');
    if (!socialContainer) return;
    
    // Remove existing custom links
    const existingCustomLinks = element.querySelectorAll('.social-link[data-platform="custom"]');
    existingCustomLinks.forEach(link => {
        link.remove();
    });
    
    // Add custom links from panel
    const customLinkItems = document.querySelectorAll('.custom-link-item');
    
    customLinkItems.forEach((item, index) => {
        const labelInput = item.querySelector(`[data-custom-label="${index}"]`);
        const urlInput = item.querySelector(`[data-custom-url="${index}"]`);
        
        if (labelInput && urlInput && urlInput.value) {
            const iconLink = document.createElement('a');
            iconLink.className = 'social-link';
            iconLink.setAttribute('href', urlInput.value);
            iconLink.setAttribute('data-platform', 'custom');
            
            // Add target and rel attributes based on settings
            const openNewTab = document.querySelector('[data-property="open_new_tab"]').checked;
            const addNofollow = document.querySelector('[data-property="add_rel_nofollow"]').checked;
            
            if (openNewTab) {
                iconLink.setAttribute('target', '_blank');
            }
            
            iconLink.setAttribute('rel', addNofollow ? 'nofollow noopener' : 'noopener');
            
            // Create icon
            const icon = document.createElement('div');
            icon.className = 'social-icon';
            icon.setAttribute('data-platform', 'custom');
            
            // Set icon content
            icon.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
            `;
            
            // Set styles based on current settings
            const iconStyle = element.getAttribute('data-icon-style') || 'solid';
            if (iconStyle !== 'branded') {
                const bgColor = document.querySelector('[data-property="background_color"]').value;
                const iconColor = document.querySelector('[data-property="icon_color"]').value;
                
                icon.style.backgroundColor = bgColor;
                icon.style.color = iconColor;
            }
            
            // Add label
            const showLabels = element.hasAttribute('data-show-labels');
            const label = document.createElement('span');
            label.className = 'social-label';
            label.textContent = labelInput.value;
            label.style.display = showLabels ? '' : 'none';
            
            iconLink.appendChild(icon);
            iconLink.appendChild(label);
            socialContainer.appendChild(iconLink);
        }
    });
    
    // Trigger save
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
    
    // Disable if using branded colors for icon/bg color
    if ((property === 'icon_color' || property === 'background_color') && 
        element.getAttribute('data-icon-style') === 'branded') {
        colorInput.disabled = true;
        textInput.disabled = true;
    }
    
    // Get current color if available
    let currentColor;
    
    if (property === 'hover_color') {
        currentColor = getComputedStyle(element).getPropertyValue('--social-hover-color');
    } else if (property === 'icon_color') {
        const firstIcon = element.querySelector('.social-icon');
        if (firstIcon) {
            currentColor = getComputedStyle(firstIcon).color;
        }
    } else if (property === 'background_color') {
        const firstIcon = element.querySelector('.social-icon');
        if (firstIcon) {
            currentColor = getComputedStyle(firstIcon).backgroundColor;
        }
    }
    
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
 * Get social icon SVG based on platform
 * @param {string} platform - The social platform
 * @returns {string} - The SVG icon HTML
 */
function getSocialIconSvg(platform) {
    switch (platform) {
        case 'twitter':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
            `;
        case 'linkedin':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                </svg>
            `;
        case 'instagram':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
            `;
        case 'facebook':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
            `;
        case 'youtube':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
            `;
        case 'tiktok':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm10-6h-4v8.9a3.1 3.1 0 1 1-3.1-3.1v-4C8.2 7.8 5 11 5 15a7 7 0 0 0 7 7 7 7 0 0 0 7-7V6z"></path>
                </svg>
            `;
        case 'pinterest':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 0c0 1.42.5 2.5 1.24 3.26l-.72 2.42 2.4-.72c.76.74 1.84 1.24 3.26 1.24a4.18 4.18 0 0 0 4.18-4.18 4.18 4.18 0 0 0-4.18-4.18A4.18 4.18 0 0 0 8 12z"></path>
                </svg>
            `;
        case 'medium':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 0v-2c0-3.3 2.7-6 6-6h.5M3.5 12h2"></path>
                </svg>
            `;
        default:
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
            `;
    }
}

/**
 * Get branded color for a social platform
 * @param {string} platform - The social platform
 * @returns {string} - The brand color
 */
function getBrandedColor(platform) {
    switch (platform) {
        case 'twitter':
            return '#1DA1F2';
        case 'linkedin':
            return '#0077B5';
        case 'instagram':
            return '#E4405F';
        case 'facebook':
            return '#1877F2';
        case 'youtube':
            return '#FF0000';
        case 'tiktok':
            return '#000000';
        case 'pinterest':
            return '#BD081C';
        case 'medium':
            return '#000000';
        default:
            return '#4f46e5';
    }
}

/**
 * Get friendly name for a social platform
 * @param {string} platform - The social platform
 * @returns {string} - The platform name
 */
function getPlatformName(platform) {
    switch (platform) {
        case 'twitter':
            return 'Twitter / X';
        case 'linkedin':
            return 'LinkedIn';
        case 'instagram':
            return 'Instagram';
        case 'facebook':
            return 'Facebook';
        case 'youtube':
            return 'YouTube';
        case 'tiktok':
            return 'TikTok';
        case 'pinterest':
            return 'Pinterest';
        case 'medium':
            return 'Medium';
        default:
            return 'Link';
    }
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
