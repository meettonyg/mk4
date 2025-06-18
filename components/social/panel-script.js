/**
 * Social Component Panel Script
 * Schema-driven approach with DataBindingEngine
 */

import { dataBindingEngine } from '../../js/services/data-binding-engine.js';
import { stateManager } from '../../js/services/state-manager.js';

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['social'] = function(element, schema) {
    initializeSocialPanel(element, schema);
};

/**
 * Initialize social panel
 * @param {HTMLElement} element - The social component element
 * @param {Object} schema - Component schema
 */
function initializeSocialPanel(element, schema) {
    if (!element) return;
    
    const componentId = element.getAttribute('data-component-id');
    if (!componentId) {
        console.error('Component ID not found on element');
        return;
    }
    
    // Add custom social links container
    setupCustomSocialLinksUI(element, componentId);
    
    // Bind special behavior for branded colors
    setupBrandedColorsToggle(componentId);
    
    // Handle platform link updates
    setupPlatformLinkHandlers(componentId);
}

/**
 * Setup custom social links UI
 * @param {HTMLElement} element - The component element
 * @param {string} componentId - Component ID
 */
function setupCustomSocialLinksUI(element, componentId) {
    // Add custom links section to the panel
    const panelContent = document.querySelector('.element-editor__content');
    if (!panelContent) return;
    
    // Check if container already exists
    let customLinksSection = document.getElementById('custom-social-links-section');
    if (customLinksSection) return;
    
    // Create custom links section
    customLinksSection = document.createElement('div');
    customLinksSection.id = 'custom-social-links-section';
    customLinksSection.className = 'form-section';
    customLinksSection.innerHTML = `
        <h4 class="form-section__title">Custom Links</h4>
        <div id="custom-social-links" class="custom-links-container"></div>
        <button id="add-social-link-btn" class="add-item-btn">Add Custom Link</button>
    `;
    
    panelContent.appendChild(customLinksSection);
    
    // Setup custom links container
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
 * Setup special handling for branded colors toggle
 * @param {string} componentId - Component ID
 */
function setupBrandedColorsToggle(componentId) {
    // Listen for changes to icon_style setting
    stateManager.subscribe(componentId, (state) => {
        if (state.icon_style !== undefined) {
            const iconColorInput = document.querySelector('[data-setting="icon_color"]');
            const bgColorInput = document.querySelector('[data-setting="background_color"]');
            const iconColorTextInput = document.querySelector('[data-setting="icon_color-text"]');
            const bgColorTextInput = document.querySelector('[data-setting="background_color-text"]');
            
            // Disable color inputs if using branded colors
            const isBranded = state.icon_style === 'branded';
            
            if (iconColorInput) iconColorInput.disabled = isBranded;
            if (bgColorInput) bgColorInput.disabled = isBranded;
            if (iconColorTextInput) iconColorTextInput.disabled = isBranded;
            if (bgColorTextInput) bgColorTextInput.disabled = isBranded;
            
            // Apply branded colors if selected
            if (isBranded) {
                applyBrandedColors(componentId);
            }
        }
    });
}

/**
 * Apply branded colors to social icons
 * @param {string} componentId - Component ID
 */
function applyBrandedColors(componentId) {
    const element = document.querySelector(`[data-component-id="${componentId}"]`);
    if (!element) return;
    
    const socialIcons = element.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        const platform = icon.getAttribute('data-platform');
        if (platform) {
            icon.style.backgroundColor = getBrandedColor(platform);
            icon.style.color = '#ffffff';
        }
    });
}

/**
 * Setup platform link handlers
 * @param {string} componentId - Component ID
 */
function setupPlatformLinkHandlers(componentId) {
    // Listen for changes to platform links
    const platforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'youtube', 'tiktok', 'pinterest', 'medium'];
    
    platforms.forEach(platform => {
        stateManager.subscribe(componentId, (state) => {
            if (state[`social_${platform}`] !== undefined) {
                updateSocialIcon(componentId, platform, state[`social_${platform}`]);
            }
        });
    });
}

/**
 * Update social icon visibility and link
 * @param {string} componentId - Component ID
 * @param {string} platform - The social platform
 * @param {string} url - The URL to link to
 */
function updateSocialIcon(componentId, platform, url) {
    const element = document.querySelector(`[data-component-id="${componentId}"]`);
    if (!element) return;
    
    let socialIcon = element.querySelector(`.social-icon[data-platform="${platform}"]`);
    const socialContainer = element.querySelector('.social-icons-container');
    
    if (!socialContainer) return;
    
    // If URL is empty, remove the icon
    if (!url) {
        if (socialIcon) {
            const iconLink = socialIcon.closest('.social-link');
            if (iconLink) {
                iconLink.remove();
            }
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
        const openNewTab = stateManager.getComponentSetting(componentId, 'open_new_tab');
        const addNofollow = stateManager.getComponentSetting(componentId, 'add_rel_nofollow');
        
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
        const iconStyle = stateManager.getComponentSetting(componentId, 'icon_style') || 'solid';
        if (iconStyle === 'branded') {
            icon.style.backgroundColor = getBrandedColor(platform);
            icon.style.color = '#ffffff';
        } else {
            const bgColor = stateManager.getComponentSetting(componentId, 'background_color');
            const iconColor = stateManager.getComponentSetting(componentId, 'icon_color');
            
            icon.style.backgroundColor = bgColor;
            icon.style.color = iconColor;
        }
        
        // Add label if needed
        const showLabels = stateManager.getComponentSetting(componentId, 'show_labels');
        const label = document.createElement('span');
        label.className = 'social-label';
        label.textContent = getPlatformName(platform);
        label.style.display = showLabels ? '' : 'none';
        iconLink.appendChild(label);
        
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
    
    const componentId = element.getAttribute('data-component-id');
    if (!componentId) return;
    
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
            const openNewTab = stateManager.getComponentSetting(componentId, 'open_new_tab');
            const addNofollow = stateManager.getComponentSetting(componentId, 'add_rel_nofollow');
            
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
            const iconStyle = stateManager.getComponentSetting(componentId, 'icon_style') || 'solid';
            if (iconStyle !== 'branded') {
                const bgColor = stateManager.getComponentSetting(componentId, 'background_color');
                const iconColor = stateManager.getComponentSetting(componentId, 'icon_color');
                
                icon.style.backgroundColor = bgColor;
                icon.style.color = iconColor;
            }
            
            // Add label
            const showLabels = stateManager.getComponentSetting(componentId, 'show_labels');
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
 * Escape HTML for safe insertion
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}