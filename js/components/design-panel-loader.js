/**
 * Dynamic Design Panel Loader
 * Loads component-specific design panels when elements are selected
 */

/**
 * Load a design panel for a specific component
 * @param {string} componentType - The component type/slug
 * @returns {Promise<string>} - The design panel HTML
 */
export async function loadDesignPanel(componentType) {
    try {
        // First try REST API
        if (guestifyData.restUrl) {
            const response = await fetch(`${guestifyData.restUrl}guestify/v1/render-design-panel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': guestifyData.restNonce
                },
                body: JSON.stringify({
                    component: componentType
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return data.html;
                }
            }
        }

        // Fallback to AJAX
        const formData = new FormData();
        formData.append('action', 'guestify_render_design_panel');
        formData.append('component', componentType);
        formData.append('nonce', guestifyData.nonce);

        const ajaxResponse = await fetch(guestifyData.ajaxUrl, {
            method: 'POST',
            body: formData
        });

        const ajaxData = await ajaxResponse.json();
        if (ajaxData.success) {
            return ajaxData.data.html;
        }

        throw new Error('Failed to load design panel');
    } catch (error) {
        console.error('Error loading design panel:', error);
        return getErrorPanel(componentType);
    }
}

/**
 * Show a design panel for a component
 * @param {string} componentType - The component type
 * @param {HTMLElement} element - The selected element
 */
export async function showDesignPanel(componentType, element) {
    const designTab = document.getElementById('design-tab');
    const elementEditor = document.getElementById('element-editor');
    
    if (!elementEditor) return;
    
    // Show loading state
    elementEditor.innerHTML = `
        <div class="design-panel-loading">
            <div class="loading-spinner"></div>
            <p>Loading settings...</p>
        </div>
    `;
    
    // Switch to design tab
    const designTabButton = document.querySelector('[data-tab="design"]');
    if (designTabButton) {
        designTabButton.click();
    }
    
    try {
        // Load the design panel
        const panelHtml = await loadDesignPanel(componentType);
        elementEditor.innerHTML = panelHtml;
        
        // Initialize panel functionality
        initializeDesignPanel(componentType, element);
        
        // Store current component type
        elementEditor.setAttribute('data-current-component', componentType);
        
    } catch (error) {
        console.error('Error showing design panel:', error);
        elementEditor.innerHTML = getErrorPanel(componentType);
    }
}

/**
 * Initialize design panel functionality
 * @param {string} componentType - The component type
 * @param {HTMLElement} element - The selected element
 */
function initializeDesignPanel(componentType, element) {
    // Handle common form inputs generically
    initializeCommonControls(element);
    
    // Get component schema if available
    const schemaData = element.getAttribute('data-schema');
    let schema = null;
    
    try {
        if (schemaData) {
            schema = JSON.parse(schemaData);
        }
    } catch (e) {
        console.error('Error parsing schema data:', e);
    }
    
    // Try to load component-specific panel script
    loadComponentPanelScript(componentType, element, schema);
}

/**
 * Initialize common controls (inputs, selects, etc.)
 * @param {HTMLElement} element - The selected element
 */
function initializeCommonControls(element) {
    const elementEditor = document.getElementById('element-editor');
    if (!elementEditor) return;
    
    // Handle form inputs
    const inputs = elementEditor.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        const property = input.getAttribute('data-property');
        if (!property) return;
        
        // Get current value from element
        const currentValue = getPropertyValue(element, property);
        if (currentValue !== null) {
            if (input.type === 'checkbox') {
                input.checked = currentValue === 'true' || currentValue === true;
            } else {
                input.value = currentValue;
            }
        }
        
        // Add change listener
        input.addEventListener('change', function() {
            updateElementProperty(element, property, this.value, this.type);
        });
        
        // Real-time updates for text inputs
        if (input.type === 'text' || input.type === 'url' || input.type === 'color' || input.tagName === 'TEXTAREA') {
            input.addEventListener('input', function() {
                updateElementProperty(element, property, this.value, this.type);
            });
        }
    });
    
    // Handle color pickers
    const colorPickers = elementEditor.querySelectorAll('.color-picker');
    colorPickers.forEach(picker => {
        const colorInput = picker.querySelector('input[type="color"]');
        const textInput = picker.querySelector('input[type="text"]');
        
        if (colorInput && textInput) {
            // Sync color and text inputs
            colorInput.addEventListener('change', function() {
                textInput.value = this.value;
                const property = this.getAttribute('data-property');
                if (property) {
                    updateElementProperty(element, property, this.value, 'color');
                }
            });
            
            textInput.addEventListener('change', function() {
                colorInput.value = this.value;
                const property = colorInput.getAttribute('data-property');
                if (property) {
                    updateElementProperty(element, property, this.value, 'color');
                }
            });
        }
    });
}

/**
 * Load component-specific panel script if available
 * @param {string} componentType - The component type
 * @param {HTMLElement} element - The selected element
 * @param {Object} schema - Component schema (optional)
 */
function loadComponentPanelScript(componentType, element, schema) {
    // Check if component has registered an init function
    if (window.componentPanelHandlers && window.componentPanelHandlers[componentType]) {
        window.componentPanelHandlers[componentType](element, schema);
        return;
    }
    
    // Legacy component-specific code (will be migrated to panel-script.js files)
    if (componentType === 'guest-intro') {
        initializeGuestIntroPanel(element);
    } else if (componentType === 'stats') {
        initializeStatsPanel(element);
    } else {
        // Try to dynamically load panel-script.js if it exists
        // Get plugin URL from global object
        // Direct approach - no fallbacks
        // Get the current site URL
        const siteUrl = window.location.origin;
        
        // Direct path to the component script
        const scriptUrl = `${siteUrl}/wp-content/plugins/guestify-media-kit-builder/components/${componentType}/panel-script.js`;
        
        console.log('Loading panel script from:', scriptUrl);
        
        fetch(scriptUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    // Script exists, load it
                    const script = document.createElement('script');
                    script.src = scriptUrl;
                    script.onload = () => {
                        // Call initialization function if it was registered
                        if (window.componentPanelHandlers && 
                            window.componentPanelHandlers[componentType]) {
                            window.componentPanelHandlers[componentType](element, schema);
                        }
                    };
                    document.head.appendChild(script);
                }
            })
            .catch((error) => {
                // Script doesn't exist, or error loading - that's fine,
                // we'll just use the generic controls
                console.log(`No panel script for ${componentType}, using generic controls`); 
            });
    }
}

/**
 * Initialize guest intro specific panel features
 * @param {HTMLElement} element - The guest intro element
 */
function initializeGuestIntroPanel(element) {
    const topicsList = document.getElementById('design-topics-list');
    const addTopicBtn = document.getElementById('add-topic-btn');
    
    if (!topicsList || !addTopicBtn) return;
    
    // Load existing topics
    const existingTopics = element.querySelectorAll('.topics-list li');
    topicsList.innerHTML = '';
    
    existingTopics.forEach((topic, index) => {
        addTopicToPanel(topic.textContent, index);
    });
    
    // Add topic button handler
    addTopicBtn.addEventListener('click', function() {
        const newIndex = topicsList.children.length;
        const topicItem = addTopicToPanel('New discussion topic', newIndex);
        
        // Focus the input
        const input = topicItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Add to the actual component
        updateTopicsInComponent(element);
    });
}

/**
 * Initialize stats panel features
 * @param {HTMLElement} element - The stats element
 */
function initializeStatsPanel(element) {
    const statsList = document.getElementById('design-stats-list');
    const addStatBtn = document.getElementById('add-stat-btn');
    
    if (!statsList || !addStatBtn) return;
    
    // Load existing stats
    const existingStats = element.querySelectorAll('.stat-item');
    statsList.innerHTML = '';
    
    existingStats.forEach((stat, index) => {
        const number = stat.querySelector('.stat-item__number')?.textContent || '';
        const label = stat.querySelector('.stat-item__label')?.textContent || '';
        addStatToPanel(number, label, index);
    });
    
    // Add stat button handler
    addStatBtn.addEventListener('click', function() {
        const newIndex = statsList.children.length;
        const statItem = addStatToPanel('0', 'New Metric', newIndex);
        
        // Focus the first input
        const input = statItem.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
        
        // Update component
        updateStatsInComponent(element);
    });
    
    // Handle grid columns change
    const gridSelect = document.querySelector('[data-property="grid_columns"]');
    if (gridSelect) {
        gridSelect.addEventListener('change', function() {
            const statsGrid = element.querySelector('.stats-grid');
            if (statsGrid) {
                statsGrid.style.gridTemplateColumns = `repeat(${this.value}, 1fr)`;
            }
        });
    }
}

/**
 * Add a topic to the design panel
 * @param {string} text - Topic text
 * @param {number} index - Topic index
 * @returns {HTMLElement} - The topic item element
 */
function addTopicToPanel(text, index) {
    const topicsList = document.getElementById('design-topics-list');
    const topicItem = document.createElement('div');
    topicItem.className = 'topic-item';
    topicItem.innerHTML = `
        <input type="text" class="form-input" value="${escapeHtml(text)}" data-topic-index="${index}">
        <button class="remove-item-btn" title="Remove topic">×</button>
    `;
    
    // Input handler
    const input = topicItem.querySelector('input');
    input.addEventListener('input', function() {
        const element = document.querySelector('.editable-element--selected');
        if (element) {
            updateTopicsInComponent(element);
        }
    });
    
    // Remove button handler
    const removeBtn = topicItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        topicItem.remove();
        const element = document.querySelector('.editable-element--selected');
        if (element) {
            updateTopicsInComponent(element);
        }
    });
    
    topicsList.appendChild(topicItem);
    return topicItem;
}

/**
 * Add a stat to the design panel
 * @param {string} number - Stat number/value
 * @param {string} label - Stat label
 * @param {number} index - Stat index
 * @returns {HTMLElement} - The stat item element
 */
function addStatToPanel(number, label, index) {
    const statsList = document.getElementById('design-stats-list');
    const statItem = document.createElement('div');
    statItem.className = 'stat-editor-item';
    statItem.innerHTML = `
        <div class="stat-inputs">
            <input type="text" class="form-input" placeholder="Value" value="${escapeHtml(number)}" data-stat-number="${index}">
            <input type="text" class="form-input" placeholder="Label" value="${escapeHtml(label)}" data-stat-label="${index}">
        </div>
        <button class="remove-item-btn" title="Remove stat">×</button>
    `;
    
    // Input handlers
    const inputs = statItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const element = document.querySelector('.editable-element--selected');
            if (element) {
                updateStatsInComponent(element);
            }
        });
    });
    
    // Remove button handler
    const removeBtn = statItem.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', function() {
        statItem.remove();
        const element = document.querySelector('.editable-element--selected');
        if (element) {
            updateStatsInComponent(element);
        }
    });
    
    statsList.appendChild(statItem);
    return statItem;
}

/**
 * Update topics in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateTopicsInComponent(element) {
    const topicsList = element.querySelector('.topics-list');
    if (!topicsList) return;
    
    const panelTopics = document.querySelectorAll('#design-topics-list input');
    
    // Clear existing topics
    topicsList.innerHTML = '';
    
    // Add topics from panel
    panelTopics.forEach(input => {
        if (input.value.trim()) {
            const li = document.createElement('li');
            li.textContent = input.value;
            li.setAttribute('contenteditable', 'true');
            topicsList.appendChild(li);
        }
    });
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Update stats in the component based on panel inputs
 * @param {HTMLElement} element - The component element
 */
function updateStatsInComponent(element) {
    const statsGrid = element.querySelector('.stats-grid');
    if (!statsGrid) return;
    
    const statItems = document.querySelectorAll('.stat-editor-item');
    
    // Clear existing stats
    statsGrid.innerHTML = '';
    
    // Add stats from panel
    statItems.forEach((item, index) => {
        const numberInput = item.querySelector(`[data-stat-number="${index}"]`);
        const labelInput = item.querySelector(`[data-stat-label="${index}"]`);
        
        if (numberInput && labelInput) {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat-item';
            statDiv.innerHTML = `
                <span class="stat-item__number" contenteditable="true">${escapeHtml(numberInput.value)}</span>
                <div class="stat-item__label" contenteditable="true">${escapeHtml(labelInput.value)}</div>
            `;
            statsGrid.appendChild(statDiv);
        }
    });
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Get property value from element
 * @param {HTMLElement} element - The element
 * @param {string} property - The property name
 * @returns {string|null} - The property value
 */
function getPropertyValue(element, property) {
    // Map properties to element selectors
    const propertyMap = {
        'guest_name': '.guest-name',
        'guest_title': '.guest-title',
        'tagline': '.guest-tagline',
        'intro_text': '.intro-description p',
        'guest_website': '.guest-website',
        'guest_social': '.guest-social',
        'hero_name': '.hero__name',
        'hero_title': '.hero__title',
        'hero_bio': '.hero__bio',
        'section_title': '.section-title'
    };
    
    const selector = propertyMap[property];
    if (!selector) return null;
    
    const targetEl = element.querySelector(selector);
    if (!targetEl) return null;
    
    if (targetEl.hasAttribute('href')) {
        return targetEl.getAttribute('href');
    }
    
    return targetEl.textContent || '';
}

/**
 * Update element property
 * @param {HTMLElement} element - The element to update
 * @param {string} property - The property name
 * @param {string} value - The new value
 * @param {string} inputType - The input type
 */
function updateElementProperty(element, property, value, inputType) {
    // Map properties to element selectors
    const propertyMap = {
        'guest_name': '.guest-name',
        'guest_title': '.guest-title',
        'tagline': '.guest-tagline',
        'intro_text': '.intro-description p',
        'guest_website': '.guest-website',
        'guest_social': '.guest-social',
        'hero_name': '.hero__name',
        'hero_title': '.hero__title',
        'hero_bio': '.hero__bio',
        'section_title': '.section-title'
    };
    
    const selector = propertyMap[property];
    if (!selector) {
        // Handle special properties
        if (property === 'number_color') {
            const numbers = element.querySelectorAll('.stat-item__number');
            numbers.forEach(num => num.style.color = value);
        }
        return;
    }
    
    const targetEl = element.querySelector(selector);
    if (!targetEl) return;
    
    // Update based on property type
    if (targetEl.hasAttribute('href')) {
        targetEl.setAttribute('href', value);
        // Update visibility
        if (value) {
            targetEl.style.display = '';
        } else {
            targetEl.style.display = 'none';
        }
    } else if (property.includes('color')) {
        // Handle color properties
        if (property === 'accent_color') {
            element.style.setProperty('--accent-color', value);
        } else if (property === 'hero_bg_color') {
            element.style.backgroundColor = value;
        } else if (property === 'hero_text_color') {
            element.style.color = value;
        }
    } else if (inputType === 'checkbox') {
        // Handle checkbox properties
        if (property === 'show_section_title' || property === 'show_title') {
            const title = element.querySelector('.section-title');
            if (title) {
                title.style.display = value === 'true' || value === true ? '' : 'none';
            }
        }
    } else {
        // Update text content
        targetEl.textContent = value;
    }
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Get error panel HTML
 * @param {string} componentType - The component type
 * @returns {string} - Error panel HTML
 */
function getErrorPanel(componentType) {
    return `
        <div class="element-editor__title">Settings Unavailable</div>
        <div class="element-editor__subtitle">Unable to load settings for this component</div>
        <div class="form-section">
            <p class="form-help-text">The design panel could not be loaded. You can still edit this component by clicking on elements in the preview area.</p>
        </div>
    `;
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

/**
 * Clear the design panel
 */
export function clearDesignPanel() {
    const elementEditor = document.getElementById('element-editor');
    if (elementEditor) {
        elementEditor.innerHTML = `
            <div class="element-editor__title">No Element Selected</div>
            <div class="element-editor__subtitle">Click on any element in the preview to edit its properties</div>
        `;
        elementEditor.removeAttribute('data-current-component');
    }
}
