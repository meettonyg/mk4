/**
 * Topics Component Panel Script
 * Handles the dynamic functionality of the topics design panel
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['topics'] = function(element, schema) {
    initializeTopicsPanel(element, schema);
};

/**
 * Initialize topics panel
 * @param {HTMLElement} element - The topics component element
 * @param {Object} schema - Component schema (optional)
 */
function initializeTopicsPanel(element, schema) {
    // Log schema if available
    if (schema) {
        console.log('Topics component schema:', schema);
    }
    
    // Setup topics list
    setupTopicsList(element);
    
    // Handle display style change
    const displayStyleSelect = document.querySelector('[data-property="displayStyle"]');
    if (displayStyleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-display-style') || 'list';
        displayStyleSelect.value = currentStyle;
        
        // Add change listener
        displayStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-display-style', this.value);
            
            // Update classes
            element.classList.remove('display--list', 'display--grid', 'display--tags', 'display--cards');
            element.classList.add('display--' + this.value);
            
            // Show/hide columns option based on display style
            const columnsGroup = document.querySelector('[data-property="columns"]').closest('.form-group');
            if (columnsGroup) {
                columnsGroup.style.display = (this.value === 'grid' || this.value === 'cards') ? 'block' : 'none';
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
        
        // Trigger change event to ensure proper initial state
        displayStyleSelect.dispatchEvent(new Event('change'));
    }
    
    // Handle columns change
    const columnsSelect = document.querySelector('[data-property="columns"]');
    if (columnsSelect) {
        // Get initial value
        const currentColumns = element.getAttribute('data-columns') || '3';
        columnsSelect.value = currentColumns;
        
        // Add change listener
        columnsSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-columns', this.value);
            
            // Update grid style
            const topicsContainer = element.querySelector('.topics-container');
            if (topicsContainer) {
                topicsContainer.style.gridTemplateColumns = `repeat(${this.value}, 1fr)`;
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle topic style change
    const topicStyleSelect = document.querySelector('[data-property="topicStyle"]');
    if (topicStyleSelect) {
        // Get initial value
        const currentStyle = element.getAttribute('data-topic-style') || 'default';
        topicStyleSelect.value = currentStyle;
        
        // Add change listener
        topicStyleSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-topic-style', this.value);
            
            // Update classes
            element.classList.remove('topic-style--default', 'topic-style--minimal', 'topic-style--boxed', 'topic-style--bordered', 'topic-style--numbered');
            element.classList.add('topic-style--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle topic size change
    const topicSizeSelect = document.querySelector('[data-property="topicSize"]');
    if (topicSizeSelect) {
        // Get initial value
        const currentSize = element.getAttribute('data-topic-size') || 'medium';
        topicSizeSelect.value = currentSize;
        
        // Add change listener
        topicSizeSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-topic-size', this.value);
            
            // Update classes
            element.classList.remove('topic-size--small', 'topic-size--medium', 'topic-size--large');
            element.classList.add('topic-size--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle icon position change
    const iconPositionSelect = document.querySelector('[data-property="iconPosition"]');
    if (iconPositionSelect) {
        // Get initial value
        const currentPosition = element.getAttribute('data-icon-position') || 'left';
        iconPositionSelect.value = currentPosition;
        
        // Add change listener
        iconPositionSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-icon-position', this.value);
            
            // Update classes
            element.classList.remove('icon--left', 'icon--right', 'icon--none');
            element.classList.add('icon--' + this.value);
            
            // Update icons visibility
            const icons = element.querySelectorAll('.topic-icon');
            icons.forEach(icon => {
                icon.style.display = this.value === 'none' ? 'none' : '';
                
                // Move icons based on position
                const topicItem = icon.closest('.topic-item');
                if (topicItem) {
                    if (this.value === 'left') {
                        topicItem.insertBefore(icon, topicItem.firstChild);
                    } else if (this.value === 'right') {
                        topicItem.appendChild(icon);
                    }
                }
            });
            
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
            element.classList.remove('animation--none', 'animation--fade', 'animation--slide', 'animation--grow');
            element.classList.add('animation--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle hover effect change
    const hoverEffectSelect = document.querySelector('[data-property="hoverEffect"]');
    if (hoverEffectSelect) {
        // Get initial value
        const currentHover = element.getAttribute('data-hover-effect') || 'scale';
        hoverEffectSelect.value = currentHover;
        
        // Add change listener
        hoverEffectSelect.addEventListener('change', function() {
            // Update data attribute
            element.setAttribute('data-hover-effect', this.value);
            
            // Update classes
            element.classList.remove('hover--none', 'hover--scale', 'hover--highlight', 'hover--shadow');
            element.classList.add('hover--' + this.value);
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle show descriptions toggle
    const showDescriptionsCheckbox = document.querySelector('[data-property="showDescriptions"]');
    if (showDescriptionsCheckbox) {
        // Get initial state
        const descriptions = element.querySelectorAll('.topic-description');
        if (descriptions.length > 0) {
            showDescriptionsCheckbox.checked = descriptions[0].style.display !== 'none';
        }
        
        // Add change listener
        showDescriptionsCheckbox.addEventListener('change', function() {
            const descriptions = element.querySelectorAll('.topic-description');
            descriptions.forEach(desc => {
                desc.style.display = this.checked ? '' : 'none';
            });
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Handle expandable toggle
    const expandableCheckbox = document.querySelector('[data-property="expandable"]');
    if (expandableCheckbox) {
        // Get initial state
        expandableCheckbox.checked = element.hasAttribute('data-expandable');
        
        // Add change listener
        expandableCheckbox.addEventListener('change', function() {
            if (this.checked) {
                element.setAttribute('data-expandable', 'true');
                
                // Add expand/collapse functionality to topics
                const topicItems = element.querySelectorAll('.topic-item');
                topicItems.forEach(item => {
                    item.classList.add('expandable');
                    
                    // Add click handler if not already present
                    if (!item.hasAttribute('data-expandable-initialized')) {
                        item.setAttribute('data-expandable-initialized', 'true');
                        
                        const title = item.querySelector('.topic-title');
                        if (title) {
                            title.addEventListener('click', function() {
                                const isExpanded = item.classList.contains('expanded');
                                const description = item.querySelector('.topic-description');
                                
                                if (isExpanded) {
                                    item.classList.remove('expanded');
                                    if (description) {
                                        description.style.maxHeight = '0';
                                    }
                                } else {
                                    item.classList.add('expanded');
                                    if (description) {
                                        description.style.maxHeight = description.scrollHeight + 'px';
                                    }
                                }
                            });
                        }
                    }
                    
                    // Initialize collapsed state
                    const description = item.querySelector('.topic-description');
                    if (description) {
                        description.style.maxHeight = '0';
                    }
                });
            } else {
                element.removeAttribute('data-expandable');
                
                // Remove expandable functionality
                const topicItems = element.querySelectorAll('.topic-item');
                topicItems.forEach(item => {
                    item.classList.remove('expandable', 'expanded');
                    
                    // Reset description display
                    const description = item.querySelector('.topic-description');
                    if (description) {
                        description.style.maxHeight = '';
                    }
                });
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
    
    // Setup topic color picker
    setupColorPicker('topicColor', element, function(color) {
        element.style.setProperty('--topic-color', color);
        
        // Apply to topic elements
        const topicTitles = element.querySelectorAll('.topic-title');
        topicTitles.forEach(title => {
            title.style.color = color;
        });
        
        const topicIcons = element.querySelectorAll('.topic-icon');
        topicIcons.forEach(icon => {
            icon.style.color = color;
        });
    });
    
    // Setup text content updaters
    setupTextContentUpdater('title', '.topics-section-title', element);
    setupTextContentUpdater('introduction', '.topics-introduction', element);
}

/**
 * Setup topics list functionality
 * @param {HTMLElement} element - The component element
 */
function setupTopicsList(element) {
    const topicsList = document.getElementById('design-topics-list');
    const addTopicBtn = document.getElementById('add-topic-btn');
    
    if (!topicsList || !addTopicBtn) return;
    
    // Load existing topics
    const existingTopics = element.querySelectorAll('.topic-item');
    topicsList.innerHTML = '';
    
    existingTopics.forEach((topic, index) => {
        const title = topic.querySelector('.topic-title')?.textContent || '';
        const description = topic.querySelector('.topic-description')?.textContent || '';
        const iconClass = topic.querySelector('.topic-icon')?.getAttribute('data-icon') || 'check';
        
        addTopicToPanel(title, description, iconClass, index);
    });
    
    // Add topic button handler
    addTopicBtn.addEventListener('click', function() {
        const newIndex = topicsList.children.length;
        const topicItem = addTopicToPanel('New Topic', 'Description of this topic...', 'check', newIndex);
        
        // Focus the topic title input
        const input = topicItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updateTopicsInComponent(element);
    });
}

/**
 * Add a topic to the design panel
 * @param {string} title - Topic title
 * @param {string} description - Topic description
 * @param {string} iconClass - Icon class
 * @param {number} index - Topic index
 * @returns {HTMLElement} - The topic item element
 */
function addTopicToPanel(title, description, iconClass, index) {
    const topicsList = document.getElementById('design-topics-list');
    const topicItem = document.createElement('div');
    topicItem.className = 'topic-editor-item';
    topicItem.innerHTML = `
        <div class="topic-editor-header">
            <div class="topic-number">#${index + 1}</div>
            <button class="remove-item-btn" title="Remove topic">×</button>
        </div>
        <div class="form-group">
            <label class="form-label">Topic Title</label>
            <input type="text" class="form-input" value="${escapeHtml(title)}" data-topic-title="${index}">
        </div>
        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-input form-textarea" rows="2" data-topic-description="${index}">${escapeHtml(description)}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Icon</label>
            <select class="form-select" data-topic-icon="${index}">
                <option value="check" ${iconClass === 'check' ? 'selected' : ''}>Checkmark</option>
                <option value="star" ${iconClass === 'star' ? 'selected' : ''}>Star</option>
                <option value="arrow" ${iconClass === 'arrow' ? 'selected' : ''}>Arrow</option>
                <option value="circle" ${iconClass === 'circle' ? 'selected' : ''}>Circle</option>
                <option value="info" ${iconClass === 'info' ? 'selected' : ''}>Info</option>
                <option value="none" ${iconClass === 'none' ? 'selected' : ''}>No Icon</option>
            </select>
        </div>
    `;
    
    // Input handlers
    const inputs = topicItem.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateTopicsInComponent(document.querySelector('.editable-element--selected'));
        });
        
        input.addEventListener('change', function() {
            updateTopicsInComponent(document.querySelector('.editable-element--selected'));
        });
    });
    
    // Remove button handler
    const removeBtn = topicItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        topicItem.remove();
        updateTopicsInComponent(document.querySelector('.editable-element--selected'));
        
        // Renumber topics
        const items = document.querySelectorAll('.topic-editor-item');
        items.forEach((item, idx) => {
            const numberEl = item.querySelector('.topic-number');
            if (numberEl) {
                numberEl.textContent = `#${idx + 1}`;
            }
        });
    });
    
    topicsList.appendChild(topicItem);
    return topicItem;
}

/**
 * Update topics in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateTopicsInComponent(element) {
    if (!element) return;
    
    const topicsContainer = element.querySelector('.topics-container');
    if (!topicsContainer) return;
    
    const topicItems = document.querySelectorAll('.topic-editor-item');
    
    // Clear existing topics
    topicsContainer.innerHTML = '';
    
    // Add topics from panel
    topicItems.forEach((item, index) => {
        const titleInput = item.querySelector(`[data-topic-title="${index}"]`);
        const descInput = item.querySelector(`[data-topic-description="${index}"]`);
        const iconSelect = item.querySelector(`[data-topic-icon="${index}"]`);
        
        if (titleInput && descInput) {
            const topicDiv = document.createElement('div');
            topicDiv.className = 'topic-item';
            
            // Add icon if not 'none'
            const iconType = iconSelect ? iconSelect.value : 'check';
            let iconHtml = '';
            
            if (iconType !== 'none') {
                iconHtml = `<div class="topic-icon" data-icon="${iconType}">${getIconSvg(iconType)}</div>`;
            }
            
            // Check if expandable
            const isExpandable = element.hasAttribute('data-expandable');
            if (isExpandable) {
                topicDiv.classList.add('expandable');
            }
            
            // Get show descriptions state
            const showDescriptions = document.querySelector('[data-property="showDescriptions"]').checked;
            
            // Build topic HTML
            topicDiv.innerHTML = `
                ${iconHtml}
                <div class="topic-content">
                    <h3 class="topic-title" contenteditable="true">${escapeHtml(titleInput.value)}</h3>
                    <div class="topic-description" contenteditable="true" style="${showDescriptions ? '' : 'display: none;'}${isExpandable ? 'max-height: 0;' : ''}">
                        ${escapeHtml(descInput.value)}
                    </div>
                </div>
            `;
            
            // Add click handler for expandable topics
            if (isExpandable) {
                const title = topicDiv.querySelector('.topic-title');
                if (title) {
                    title.addEventListener('click', function() {
                        const isExpanded = topicDiv.classList.contains('expanded');
                        const description = topicDiv.querySelector('.topic-description');
                        
                        if (isExpanded) {
                            topicDiv.classList.remove('expanded');
                            if (description) {
                                description.style.maxHeight = '0';
                            }
                        } else {
                            topicDiv.classList.add('expanded');
                            if (description) {
                                description.style.maxHeight = description.scrollHeight + 'px';
                            }
                        }
                    });
                }
            }
            
            // Apply topic color
            const topicColor = document.querySelector('[data-property="topicColor"]').value;
            const titleEl = topicDiv.querySelector('.topic-title');
            const iconEl = topicDiv.querySelector('.topic-icon');
            
            if (titleEl) titleEl.style.color = topicColor;
            if (iconEl) iconEl.style.color = topicColor;
            
            topicsContainer.appendChild(topicDiv);
        }
    });
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Get icon SVG based on icon type
 * @param {string} iconType - The icon type
 * @returns {string} - The SVG icon HTML
 */
function getIconSvg(iconType) {
    switch (iconType) {
        case 'check':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
        case 'star':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            `;
        case 'arrow':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            `;
        case 'circle':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>
            `;
        case 'info':
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            `;
        default:
            return '';
    }
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
    
    // Get current color if available
    const currentColor = getComputedStyle(element).getPropertyValue('--topic-color');
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
