/**
 * Topics Component Panel Script
 * Handles the dynamic functionality of the topics design panel
 * PHASE 1: Enhanced with MKCG integration support
 * PHASE 2A: Enhanced Topic Management with fixed 5-topic system
 * PHASE 6: Comprehensive Data Validation & Quality Assurance
 * 
 * Incorporates Gemini's recommendations:
 * - Debounced validation (300ms) for smooth performance
 * - Safe auto-repair mechanisms (non-destructive only)
 * - Simplified keyword relevance (no complex NLP)
 * - Integration with existing notification systems
 * - Professional user experience with actionable guidance
 */

// Register this component's panel handler
window.componentPanelHandlers = window.componentPanelHandlers || {};
window.componentPanelHandlers['topics'] = function(element, schema) {
    initializeTopicsPanel(element, schema);
};

/**
 * PHASE 1: MKCG Integration Global Reference
 * Stores the MKCG integration instance for access by other functions
 */
let topicsMkcgIntegration = null;

/**
 * PHASE 2A: Enhanced Topic Management Globals
 * Track MKCG mode and topic management state
 */
let isMkcgMode = false;
let topicsAutoSaveTimer = null;
const TOPICS_AUTO_SAVE_DELAY = 30000; // 30 seconds

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
    
    // PHASE 1 & 2A: Initialize MKCG integration if data is available
    if (window.guestifyData?.mkcgData && window.TopicsMKCGIntegration) {
        try {
            console.log('🔧 PHASE 2B: Initializing enhanced MKCG integration for Topics component...');
            
            // Create MKCG integration instance
            topicsMkcgIntegration = new window.TopicsMKCGIntegration(
                element, 
                document.querySelector('.element-editor')
            );
            
            // Store reference on element for cleanup
            element._mkcgIntegration = topicsMkcgIntegration;
            
            // Enable MKCG mode for enhanced topic management
            isMkcgMode = true;
            
            // PHASE 2B: Setup enhanced bulk operations
            setTimeout(() => {
                setupEnhancedBulkOperations();
                updateAutoSaveStatus('ready');
            }, 100);
            
            console.log('✅ PHASE 2B: Enhanced MKCG integration initialized successfully');
            
        } catch (error) {
            console.error('❌ PHASE 2B: MKCG integration initialization failed:', error);
            // Continue with standard panel initialization as fallback
            isMkcgMode = false;
        }
    } else {
        console.log('📝 PHASE 2B: MKCG integration not available - using standard panel mode');
        isMkcgMode = false;
    }
    
    // Setup topics list (existing functionality)
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
 * PHASE 2A: Enhanced with fixed 5-topic system for MKCG mode
 * @param {HTMLElement} element - The component element
 */
function setupTopicsList(element) {
    const topicsList = document.getElementById('design-topics-list');
    const addTopicBtn = document.getElementById('add-topic-btn');
    
    if (!topicsList) return;
    
    // PHASE 2A: Use enhanced topic management if in MKCG mode
    if (isMkcgMode) {
        console.log('🎯 PHASE 2A: Setting up enhanced fixed 5-topic system...');
        setupEnhancedFixedTopicsList(element, topicsList, addTopicBtn);
    } else {
        console.log('📝 PHASE 2A: Setting up standard dynamic topics list...');
        setupStandardTopicsList(element, topicsList, addTopicBtn);
    }
}

/**
 * PHASE 2A: Setup enhanced fixed 5-topic system for MKCG mode
 * @param {HTMLElement} element - The component element
 * @param {HTMLElement} topicsList - The topics list container
 * @param {HTMLElement} addTopicBtn - The add topic button
 */
function setupEnhancedFixedTopicsList(element, topicsList, addTopicBtn) {
    // Clear existing topics
    topicsList.innerHTML = '';
    
    // Hide the Add Topic button in MKCG mode (fixed 5 topics)
    if (addTopicBtn) {
        addTopicBtn.style.display = 'none';
        
        // Add explanation text
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'mkcg-topics-explanation';
        explanationDiv.innerHTML = `
            <div class="topics-info-panel">
                <div class="info-icon">ℹ️</div>
                <div class="info-text">
                    <strong>Fixed 5-Topic System</strong><br>
                    <small>When connected to MKCG data, you can edit up to 5 topics. Use drag handles to reorder.</small>
                </div>
            </div>
        `;
        addTopicBtn.parentNode.insertBefore(explanationDiv, addTopicBtn);
    }
    
    // Create exactly 5 topic slots
    for (let i = 0; i < 5; i++) {
        // Get existing topic data if available
        const existingTopic = element.querySelector(`.topic-item:nth-child(${i + 1})`);
        let title = '';
        let description = '';
        let iconClass = 'check';
        
        if (existingTopic) {
            title = existingTopic.querySelector('.topic-title')?.textContent || '';
            description = existingTopic.querySelector('.topic-description')?.textContent || '';
            iconClass = existingTopic.querySelector('.topic-icon')?.getAttribute('data-icon') || 'check';
        }
        
        addEnhancedTopicToPanel(title, description, iconClass, i);
    }
    
    console.log('✅ PHASE 2A: Enhanced fixed 5-topic system setup complete');
}

/**
 * PHASE 2A: Setup standard dynamic topics list for non-MKCG mode
 * @param {HTMLElement} element - The component element
 * @param {HTMLElement} topicsList - The topics list container
 * @param {HTMLElement} addTopicBtn - The add topic button
 */
function setupStandardTopicsList(element, topicsList, addTopicBtn) {
    if (!addTopicBtn) return;
    
    // Load existing topics
    const existingTopics = element.querySelectorAll('.topic-item');
    topicsList.innerHTML = '';
    
    existingTopics.forEach((topic, index) => {
        const title = topic.querySelector('.topic-title')?.textContent || '';
        const description = topic.querySelector('.topic-description')?.textContent || '';
        const iconClass = topic.querySelector('.topic-icon')?.getAttribute('data-icon') || 'check';
        
        addTopicToPanel(title, description, iconClass, index);
    });
    
    // Ensure Add Topic button is visible
    addTopicBtn.style.display = 'flex';
    
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
 * PHASE 2A: Add enhanced topic to panel (for MKCG fixed 5-topic system)
 * @param {string} title - Topic title
 * @param {string} description - Topic description
 * @param {string} iconClass - Icon class
 * @param {number} index - Topic index (0-4)
 * @returns {HTMLElement} - The topic item element
 */
function addEnhancedTopicToPanel(title, description, iconClass, index) {
    const topicsList = document.getElementById('design-topics-list');
    const topicItem = document.createElement('div');
    topicItem.className = 'topic-editor-item enhanced-topic-item';
    topicItem.setAttribute('data-topic-index', index);
    
    // Calculate topic quality for visual indicators
    const titleQuality = calculateTopicQuality(title);
    const hasContent = title.trim().length > 0;
    
    topicItem.innerHTML = `
        <div class="topic-editor-header">
            <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
            <div class="topic-number">Topic ${index + 1}</div>
            <div class="topic-indicators">
                <span class="quality-badge quality-${getQualityLevel(titleQuality)}" data-quality="${titleQuality}" title="Quality: ${titleQuality}%">
                    ${titleQuality}%
                </span>
                <span class="content-indicator ${hasContent ? 'has-content' : 'empty'}" title="${hasContent ? 'Has content' : 'Empty'}">
                    ${hasContent ? '⚡' : '○'}
                </span>
            </div>
        </div>
        
        <div class="form-group enhanced-form-group">
            <label class="form-label">
                Topic Title 
                <span class="char-counter">
                    <span class="current-length">${title.length}</span>/100
                </span>
            </label>
            <input type="text" 
                   class="form-input enhanced-topic-input" 
                   value="${escapeHtml(title)}" 
                   data-topic-title="${index}"
                   maxlength="100"
                   placeholder="Enter topic title...">
            <div class="validation-feedback"></div>
        </div>
        
        <div class="form-group enhanced-form-group">
            <label class="form-label">
                Description 
                <span class="char-counter">
                    <span class="current-length">${description.length}</span>/200
                </span>
            </label>
            <textarea class="form-input form-textarea enhanced-topic-textarea" 
                      rows="2" 
                      data-topic-description="${index}"
                      maxlength="200"
                      placeholder="Describe this topic...">${escapeHtml(description)}</textarea>
            <div class="validation-feedback"></div>
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
        
        <div class="topic-actions">
            <button type="button" class="clear-topic-btn" title="Clear this topic">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Clear
            </button>
        </div>
    `;
    
    // Enhanced input handlers with validation and auto-save
    setupEnhancedTopicInputHandlers(topicItem, index);
    
    topicsList.appendChild(topicItem);
    return topicItem;
}

/**
 * Add a topic to the design panel
 * PHASE 1: Enhanced to support MKCG integration
 * @param {string} title - Topic title
 * @param {string} description - Topic description
 * @param {string} iconClass - Icon class
 * @param {number} index - Topic index
 * @returns {HTMLElement} - The topic item element
 */
function addTopicToPanel(title, description, iconClass, index) {
    return addTopicToPanelInternal(title, description, iconClass, index);
}

/**
 * Internal implementation of addTopicToPanel (accessible to MKCG integration)
 * @param {string} title - Topic title
 * @param {string} description - Topic description
 * @param {string} iconClass - Icon class
 * @param {number} index - Topic index
 * @returns {HTMLElement} - The topic item element
 */
function addTopicToPanelInternal(title, description, iconClass, index) {
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
 * PHASE 1: Enhanced to support MKCG integration
 * @param {HTMLElement} element - The component element
 */
function updateTopicsInComponent(element) {
    return updateTopicsInComponentInternal(element);
}

/**
 * Internal implementation of updateTopicsInComponent (accessible to MKCG integration)
 * @param {HTMLElement} element - The component element
 */
function updateTopicsInComponentInternal(element) {
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

/**
 * PHASE 6: Setup enhanced input handlers with comprehensive validation
 * Incorporates Gemini's recommendations for debounced validation and performance
 * @param {HTMLElement} topicItem - The topic item element
 * @param {number} index - Topic index
 */
function setupEnhancedTopicInputHandlers(topicItem, index) {
    const titleInput = topicItem.querySelector(`[data-topic-title="${index}"]`);
    const descInput = topicItem.querySelector(`[data-topic-description="${index}"]`);
    const iconSelect = topicItem.querySelector(`[data-topic-icon="${index}"]`);
    const clearBtn = topicItem.querySelector('.clear-topic-btn');
    const dragHandle = topicItem.querySelector('.drag-handle');
    
    // PHASE 2B: Setup drag-and-drop functionality
    setupDragAndDropHandlers(topicItem, index, dragHandle);
    
    // PHASE 6: Enhanced input handlers with comprehensive validation
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            // Basic UI updates (immediate)
            updateCharCounter(this, topicItem);
            
            // PHASE 6: Debounced comprehensive validation (300ms as per Gemini's recommendation)
            if (topicsMkcgIntegration && typeof topicsMkcgIntegration.validateTopicDebounced === 'function') {
                topicsMkcgIntegration.validateTopicDebounced(this.value, index, this)
                    .then(validationResults => {
                        // Validation results are automatically applied to UI by the integration class
                        console.log(`✅ PHASE 6: Validation completed for topic ${index + 1}:`, {
                            isValid: validationResults.isValid,
                            qualityScore: validationResults.quality?.score || 0,
                            autoRepaired: validationResults.autoRepair?.performed || false
                        });
                        
                        // Apply auto-repair results if available
                        if (validationResults.autoRepair?.performed && validationResults.autoRepair.repairedValue !== this.value) {
                            this.value = validationResults.autoRepair.repairedValue;
                            updateCharCounter(this, topicItem);
                        }
                    })
                    .catch(error => {
                        console.error('❌ PHASE 6: Validation failed:', error);
                    });
            } else {
                // Fallback to basic validation for backward compatibility
                validateTopicInput(this, topicItem);
                updateTopicIndicators(topicItem, index);
            }
            
            // Schedule auto-save and update component
            scheduleAutoSave();
            updateTopicsInComponent(document.querySelector('.editable-element--selected'));
        });
        
        titleInput.addEventListener('blur', function() {
            // PHASE 6: Full validation on blur with immediate feedback
            if (topicsMkcgIntegration && typeof topicsMkcgIntegration.performComprehensiveValidation === 'function') {
                topicsMkcgIntegration.performComprehensiveValidation(this.value, index)
                    .then(validationResults => {
                        // Force immediate UI update on blur
                        if (topicsMkcgIntegration.updateValidationUI) {
                            topicsMkcgIntegration.updateValidationUI(this, validationResults);
                        }
                    });
            } else {
                // Fallback validation
                validateTopicInput(this, topicItem, true);
            }
        });
        
        // PHASE 6: Add paste event handler for auto-repair
        titleInput.addEventListener('paste', function(e) {
            // Allow paste to complete, then validate with potential auto-repair
            setTimeout(() => {
                if (topicsMkcgIntegration && typeof topicsMkcgIntegration.validateTopicDebounced === 'function') {
                    topicsMkcgIntegration.validateTopicDebounced(this.value, index, this);
                }
            }, 50);
        });
    }
    
    if (descInput) {
        descInput.addEventListener('input', function() {
            updateCharCounter(this, topicItem);
            
            // PHASE 6: Apply basic validation to description as well
            if (topicsMkcgIntegration && this.value.length > 0) {
                // Simple validation for description (no full validation suite)
                const hasHTML = /<[^>]*>/g.test(this.value);
                if (hasHTML && topicsMkcgIntegration.validationConfig?.autoRepair?.enabled) {
                    const repairResult = topicsMkcgIntegration.performSafeAutoRepair(this.value, ['contains_html_tags']);
                    if (repairResult.repaired) {
                        this.value = repairResult.repairedValue;
                        updateCharCounter(this, topicItem);
                        topicsMkcgIntegration.showAutoRepairNotification(repairResult);
                    }
                }
            }
            
            scheduleAutoSave();
            updateTopicsInComponent(document.querySelector('.editable-element--selected'));
        });
    }
    
    if (iconSelect) {
        iconSelect.addEventListener('change', function() {
            updateTopicsInComponent(document.querySelector('.editable-element--selected'));
            scheduleAutoSave();
        });
    }
    
    // Clear topic button
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearTopicContent(topicItem, index);
        });
    }
    
    // PHASE 6: Initialize validation for existing content
    if (titleInput && titleInput.value.trim().length > 0) {
        setTimeout(() => {
            if (topicsMkcgIntegration && typeof topicsMkcgIntegration.validateTopicDebounced === 'function') {
                topicsMkcgIntegration.validateTopicDebounced(titleInput.value, index, titleInput);
            }
        }, 100);
    }
}

/**
 * PHASE 2B: Setup drag-and-drop handlers for topic reordering
 * @param {HTMLElement} topicItem - The topic item element
 * @param {number} index - Topic index
 * @param {HTMLElement} dragHandle - The drag handle element
 */
function setupDragAndDropHandlers(topicItem, index, dragHandle) {
    if (!dragHandle || !isMkcgMode) return; // Only enable in MKCG mode
    
    // Make topic item draggable
    topicItem.draggable = true;
    topicItem.setAttribute('data-drag-index', index);
    
    // Drag start handler
    topicItem.addEventListener('dragstart', function(e) {
        console.log(`🎯 PHASE 2B: Drag started for topic ${index + 1}`);
        
        // Store drag data
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';
        
        // Add visual feedback
        this.classList.add('dragging');
        this.style.opacity = '0.5';
        
        // Create drag image
        const dragImage = this.cloneNode(true);
        dragImage.style.transform = 'rotate(2deg)';
        dragImage.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
        
        // Highlight valid drop zones
        highlightDropZones(index);
    });
    
    // Drag end handler
    topicItem.addEventListener('dragend', function(e) {
        console.log(`🎯 PHASE 2B: Drag ended for topic ${index + 1}`);
        
        // Remove visual feedback
        this.classList.remove('dragging');
        this.style.opacity = '';
        
        // Clear drop zone highlights
        clearDropZoneHighlights();
    });
    
    // Drag over handler
    topicItem.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Add drop zone visual feedback
        if (!this.classList.contains('dragging')) {
            this.classList.add('drag-over');
        }
    });
    
    // Drag leave handler
    topicItem.addEventListener('dragleave', function(e) {
        // Only remove highlight if we're actually leaving the element
        if (!this.contains(e.relatedTarget)) {
            this.classList.remove('drag-over');
        }
    });
    
    // Drop handler
    topicItem.addEventListener('drop', function(e) {
        e.preventDefault();
        
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const targetIndex = parseInt(this.getAttribute('data-drag-index'));
        
        console.log(`🎯 PHASE 2B: Drop - moving topic ${sourceIndex + 1} to position ${targetIndex + 1}`);
        
        // Remove visual feedback
        this.classList.remove('drag-over');
        
        // Perform reordering if different positions
        if (sourceIndex !== targetIndex) {
            reorderTopics(sourceIndex, targetIndex);
        }
    });
}

/**
 * PHASE 2B: Highlight valid drop zones during drag
 * @param {number} dragIndex - Index of item being dragged
 */
function highlightDropZones(dragIndex) {
    const topicItems = document.querySelectorAll('.enhanced-topic-item');
    topicItems.forEach((item, index) => {
        if (index !== dragIndex) {
            item.classList.add('drop-zone-active');
        }
    });
}

/**
 * PHASE 2B: Clear drop zone highlights
 */
function clearDropZoneHighlights() {
    const topicItems = document.querySelectorAll('.enhanced-topic-item');
    topicItems.forEach(item => {
        item.classList.remove('drop-zone-active', 'drag-over');
    });
}

/**
 * PHASE 4: Complete reorder topics with WordPress integration and undo support
 * @param {number} sourceIndex - Original position
 * @param {number} targetIndex - New position
 */
function reorderTopics(sourceIndex, targetIndex) {
    console.log(`🔄 PHASE 4: Reordering topic from ${sourceIndex + 1} to ${targetIndex + 1}`);
    
    const topicsList = document.getElementById('design-topics-list');
    if (!topicsList) return;
    
    try {
        // PHASE 4: Store undo state before reordering
        storeUndoState('reorder', {
            sourceIndex,
            targetIndex,
            timestamp: Date.now()
        });
        
        // PHASE 4: Extract current topic data for content swapping
        const currentTopicsData = extractTopicsDataForReorder();
        
        // PHASE 4: Perform content-aware reordering
        const reorderedData = performContentSwapping(currentTopicsData, sourceIndex, targetIndex);
        
        // PHASE 4: Update UI with reordered content
        updateUIWithReorderedContent(reorderedData);
        
        // PHASE 4: Update all topic indices and data attributes
        updateTopicIndicesAfterReorder();
        
        // Update component preview
        updateTopicsInComponent(document.querySelector('.editable-element--selected'));
        
        // PHASE 4: Save reorder to WordPress immediately
        saveReorderToWordPress(reorderedData, sourceIndex, targetIndex);
        
        // Show reorder success feedback
        showReorderFeedback(sourceIndex, targetIndex);
        
        console.log('✅ PHASE 4: Topic reordering completed successfully');
        
    } catch (error) {
        console.error('❌ PHASE 4: Reordering failed:', error);
        showReorderError('Reordering failed: ' + error.message);
        
        // Revert to previous state
        revertToLastState();
    }
}

/**
 * PHASE 4: Extract current topics data for content-aware reordering
 * @returns {Array} Array of topic data objects
 */
function extractTopicsDataForReorder() {
    const topicsData = [];
    
    for (let i = 0; i < 5; i++) {
        const titleInput = document.querySelector(`[data-topic-title="${i}"]`);
        const descInput = document.querySelector(`[data-topic-description="${i}"]`);
        const iconSelect = document.querySelector(`[data-topic-icon="${i}"]`);
        
        topicsData.push({
            index: i,
            title: titleInput ? titleInput.value.trim() : '',
            description: descInput ? descInput.value.trim() : '',
            icon: iconSelect ? iconSelect.value : 'check',
            quality: titleInput ? calculateTopicQuality(titleInput.value) : 0
        });
    }
    
    return topicsData;
}

/**
 * PHASE 4: Perform content swapping for reordering
 * @param {Array} topicsData - Current topics data
 * @param {number} sourceIndex - Source position
 * @param {number} targetIndex - Target position
 * @returns {Array} Reordered topics data
 */
function performContentSwapping(topicsData, sourceIndex, targetIndex) {
    const reorderedData = [...topicsData];
    
    // Remove the source item
    const sourceItem = reorderedData.splice(sourceIndex, 1)[0];
    
    // Insert at target position
    reorderedData.splice(targetIndex, 0, sourceItem);
    
    // Update indices to match new positions
    reorderedData.forEach((item, newIndex) => {
        item.index = newIndex;
        item.reordered = true;
        item.reorderTimestamp = Date.now();
    });
    
    console.log('🔄 PHASE 4: Content swapping completed:', {
        source: sourceIndex + 1,
        target: targetIndex + 1,
        reorderedCount: reorderedData.length
    });
    
    return reorderedData;
}

/**
 * PHASE 4: Update UI with reordered content
 * @param {Array} reorderedData - Reordered topics data
 */
function updateUIWithReorderedContent(reorderedData) {
    reorderedData.forEach((topicData, newIndex) => {
        const titleInput = document.querySelector(`[data-topic-title="${newIndex}"]`);
        const descInput = document.querySelector(`[data-topic-description="${newIndex}"]`);
        const iconSelect = document.querySelector(`[data-topic-icon="${newIndex}"]`);
        
        if (titleInput) {
            titleInput.value = topicData.title;
            
            // Update character counter and quality indicators
            const topicItem = titleInput.closest('.enhanced-topic-item');
            if (topicItem) {
                updateCharCounter(titleInput, topicItem);
                updateTopicIndicators(topicItem, newIndex);
            }
        }
        
        if (descInput) {
            descInput.value = topicData.description;
            
            const topicItem = descInput.closest('.enhanced-topic-item');
            if (topicItem) {
                updateCharCounter(descInput, topicItem);
            }
        }
        
        if (iconSelect) {
            iconSelect.value = topicData.icon;
        }
    });
}

/**
 * PHASE 4: Save reorder to WordPress via AJAX
 * @param {Array} reorderedData - Reordered topics data
 * @param {number} sourceIndex - Original source position
 * @param {number} targetIndex - Original target position
 */
function saveReorderToWordPress(reorderedData, sourceIndex, targetIndex) {
    const postId = topicsMkcgIntegration?.postId || window.guestifyData?.postId;
    
    if (!postId) {
        console.warn('⚠️ PHASE 4: No post ID available for reorder save');
        return;
    }
    
    // Prepare reordered topics for WordPress
    const reorderedTopics = {};
    reorderedData.forEach((topicData, index) => {
        if (topicData.title.trim()) {
            reorderedTopics[`topic_${index + 1}`] = topicData.title.trim();
        }
    });
    
    const requestData = {
        action: 'reorder_mkcg_topics',
        post_id: postId,
        topics: reorderedTopics,
        reorder_info: {
            source_position: sourceIndex + 1,
            target_position: targetIndex + 1,
            reorder_timestamp: Math.floor(Date.now() / 1000)
        },
        nonce: window.guestifyData?.nonce || ''
    };
    
    console.log('💾 PHASE 4: Saving reorder to WordPress:', {
        postId,
        reorderedTopics: Object.keys(reorderedTopics).length,
        sourcePos: sourceIndex + 1,
        targetPos: targetIndex + 1
    });
    
    fetch(window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ PHASE 4: Reorder saved to WordPress:', data.data);
            
            // Update success feedback with save confirmation
            showReorderFeedback(sourceIndex, targetIndex, {
                saved: true,
                processingTime: data.data?.processing_time
            });
            
        } else {
            console.error('❌ PHASE 4: Reorder save failed:', data.data);
            showReorderError('Failed to save reorder: ' + (data.data?.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('❌ PHASE 4: Reorder save network error:', error);
        showReorderError('Network error during reorder save');
    });
}

// PHASE 4: Undo system globals
let reorderUndoHistory = [];
const MAX_UNDO_HISTORY = 5;
let isUndoInProgress = false;

/**
 * PHASE 4: Store undo state for reorder operations
 * @param {string} operation - Operation type
 * @param {Object} data - Operation data
 */
function storeUndoState(operation, data) {
    if (isUndoInProgress) return; // Don't store undo states during undo operations
    
    const undoState = {
        operation,
        data,
        timestamp: Date.now(),
        topicsSnapshot: extractTopicsDataForReorder()
    };
    
    reorderUndoHistory.unshift(undoState);
    
    // Keep only the last MAX_UNDO_HISTORY operations
    if (reorderUndoHistory.length > MAX_UNDO_HISTORY) {
        reorderUndoHistory = reorderUndoHistory.slice(0, MAX_UNDO_HISTORY);
    }
    
    // Update undo button state
    updateUndoButtonState();
    
    console.log(`💾 PHASE 4: Undo state stored for ${operation}:`, {
        historySize: reorderUndoHistory.length,
        operation: operation,
        timestamp: undoState.timestamp
    });
}

/**
 * PHASE 4: Undo last reorder operation
 */
function undoLastReorder() {
    if (reorderUndoHistory.length === 0) {
        console.warn('⚠️ PHASE 4: No reorder operations to undo');
        return;
    }
    
    isUndoInProgress = true;
    
    try {
        const lastOperation = reorderUndoHistory.shift();
        console.log('⏪ PHASE 4: Undoing last reorder operation:', lastOperation);
        
        // Restore the previous state
        updateUIWithReorderedContent(lastOperation.topicsSnapshot);
        updateTopicIndicesAfterReorder();
        updateTopicsInComponent(document.querySelector('.editable-element--selected'));
        
        // Save the restored state to WordPress
        const restoredTopics = {};
        lastOperation.topicsSnapshot.forEach((topicData, index) => {
            if (topicData.title.trim()) {
                restoredTopics[`topic_${index + 1}`] = topicData.title.trim();
            }
        });
        
        // Save undo to WordPress
        const postId = topicsMkcgIntegration?.postId || window.guestifyData?.postId;
        if (postId) {
            const requestData = {
                action: 'save_mkcg_topics',
                post_id: postId,
                topics: restoredTopics,
                save_type: 'undo_reorder',
                undo_timestamp: Math.floor(Date.now() / 1000),
                nonce: window.guestifyData?.nonce || ''
            };
            
            fetch(window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(requestData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('✅ PHASE 4: Undo saved to WordPress');
                    showUndoFeedback('Reorder undone successfully');
                } else {
                    console.error('❌ PHASE 4: Undo save failed:', data.data);
                    showUndoFeedback('Undo completed but save failed', 'warning');
                }
            })
            .catch(error => {
                console.error('❌ PHASE 4: Undo save error:', error);
                showUndoFeedback('Undo completed but save failed', 'warning');
            });
        }
        
        // Update undo button state
        updateUndoButtonState();
        
    } catch (error) {
        console.error('❌ PHASE 4: Undo operation failed:', error);
        showUndoFeedback('Undo operation failed: ' + error.message, 'error');
    } finally {
        isUndoInProgress = false;
    }
}

/**
 * PHASE 4: Retry last reorder operation
 */
function retryLastReorder() {
    if (reorderUndoHistory.length === 0) {
        console.warn('⚠️ PHASE 4: No reorder operations to retry');
        return;
    }
    
    const lastOperation = reorderUndoHistory[0];
    if (lastOperation.operation === 'reorder') {
        const { sourceIndex, targetIndex } = lastOperation.data;
        console.log('🔄 PHASE 4: Retrying last reorder operation');
        
        // Remove the failed operation from history to avoid double-storing
        reorderUndoHistory.shift();
        
        // Retry the reorder
        reorderTopics(sourceIndex, targetIndex);
    }
}

/**
 * PHASE 4: Revert to last valid state (error recovery)
 */
function revertToLastState() {
    if (reorderUndoHistory.length > 0) {
        undoLastReorder();
    } else {
        console.warn('⚠️ PHASE 4: No previous state available for revert');
        showUndoFeedback('No previous state available', 'warning');
    }
}

/**
 * PHASE 4: Update undo button state
 */
function updateUndoButtonState() {
    const undoButtons = document.querySelectorAll('.undo-reorder-btn, .topics-undo-btn');
    const hasUndoHistory = reorderUndoHistory.length > 0;
    
    undoButtons.forEach(button => {
        if (button) {
            button.disabled = !hasUndoHistory;
            button.style.opacity = hasUndoHistory ? '1' : '0.5';
            button.title = hasUndoHistory ? 
                `Undo last reorder (${reorderUndoHistory.length} operations available)` : 
                'No reorder operations to undo';
        }
    });
}

/**
 * PHASE 4: Show undo feedback
 * @param {string} message - Feedback message
 * @param {string} type - Feedback type (success, warning, error)
 */
function showUndoFeedback(message, type = 'success') {
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    
    const icons = {
        success: '⏪',
        warning: '⚠️',
        error: '❌'
    };
    
    const feedback = document.createElement('div');
    feedback.className = 'undo-feedback';
    feedback.innerHTML = `
        <div class="feedback-content">
            <span class="feedback-icon">${icons[type]}</span>
            <span class="feedback-text">${message}</span>
        </div>
    `;
    
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10002;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => feedback.remove(), 300);
        }
    }, 3000);
}

/**
 * PHASE 4: Enhanced visual feedback for successful reordering
 * @param {number} sourceIndex - Original position
 * @param {number} targetIndex - New position
 * @param {Object} options - Additional feedback options
 */
function showReorderFeedback(sourceIndex, targetIndex, options = {}) {
    // Remove existing reorder feedback
    const existingFeedback = document.querySelectorAll('.reorder-feedback');
    existingFeedback.forEach(feedback => feedback.remove());
    
    // Create enhanced feedback element
    const feedback = document.createElement('div');
    feedback.className = 'reorder-feedback';
    
    const saveStatus = options.saved ? 
        `<div class="save-status">💾 Saved ${options.processingTime ? `(${options.processingTime}ms)` : ''}</div>` : 
        '';
    
    feedback.innerHTML = `
        <div class="feedback-content">
            <span class="feedback-icon">🔄</span>
            <div class="feedback-text">
                <div class="reorder-action">Topic ${sourceIndex + 1} → Position ${targetIndex + 1}</div>
                ${saveStatus}
            </div>
            <button class="undo-reorder-btn" title="Undo reorder" onclick="undoLastReorder()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 0 0 13.48 3.36M21 12c0-4.97-4.03-9-9-9-2.87 0-5.42 1.34-7.07 3.44"></path>
                </svg>
            </button>
        </div>
    `;
    
    // Enhanced styling
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        max-width: 320px;
        min-width: 280px;
    `;
    
    document.body.appendChild(feedback);
    
    // Auto-remove after 5 seconds (longer for reorder feedback)
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }
    }, 5000);
}

/**
 * PHASE 4: Show reorder error feedback
 * @param {string} message - Error message
 */
function showReorderError(message) {
    const feedback = document.createElement('div');
    feedback.className = 'reorder-error-feedback';
    feedback.innerHTML = `
        <div class="feedback-content">
            <span class="feedback-icon">❌</span>
            <div class="feedback-text">
                <div class="error-title">Reorder Failed</div>
                <div class="error-message">${message}</div>
            </div>
            <button class="retry-reorder-btn" title="Retry last reorder" onclick="retryLastReorder()">
                🔄
            </button>
        </div>
    `;
    
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        z-index: 10001;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        max-width: 320px;
    `;
    
    document.body.appendChild(feedback);
    
    // Auto-remove after 8 seconds (longer for error messages)
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }
    }, 8000);
}

/**
 * PHASE 2B: Update topic indices after reordering
 */
function updateTopicIndicesAfterReorder() {
    const topicItems = document.querySelectorAll('.enhanced-topic-item');
    
    topicItems.forEach((item, newIndex) => {
        // Update data attributes
        item.setAttribute('data-topic-index', newIndex);
        item.setAttribute('data-drag-index', newIndex);
        
        // Update topic number display
        const topicNumber = item.querySelector('.topic-number');
        if (topicNumber) {
            topicNumber.textContent = `Topic ${newIndex + 1}`;
        }
        
        // Update input data attributes
        const titleInput = item.querySelector('[data-topic-title]');
        const descInput = item.querySelector('[data-topic-description]');
        const iconSelect = item.querySelector('[data-topic-icon]');
        
        if (titleInput) titleInput.setAttribute('data-topic-title', newIndex);
        if (descInput) descInput.setAttribute('data-topic-description', newIndex);
        if (iconSelect) iconSelect.setAttribute('data-topic-icon', newIndex);
        
        // Re-setup event handlers with new index
        const oldHandlers = item.querySelectorAll('[data-handlers-setup]');
        oldHandlers.forEach(el => el.removeAttribute('data-handlers-setup'));
        
        // Re-setup enhanced handlers
        setupEnhancedTopicInputHandlers(item, newIndex);
    });
    
    console.log('✅ PHASE 2B: Topic indices updated after reordering');
}

/**
 * PHASE 2B: Show visual feedback for successful reordering
 * @param {number} sourceIndex - Original position
 * @param {number} targetIndex - New position
 */
function showReorderFeedback(sourceIndex, targetIndex) {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = 'reorder-feedback';
    feedback.innerHTML = `
        <div class="feedback-content">
            <span class="feedback-icon">🔄</span>
            <span class="feedback-text">Topic ${sourceIndex + 1} moved to position ${targetIndex + 1}</span>
        </div>
    `;
    
    // Style the feedback
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 3000);
}

/**
 * PHASE 6: Enhanced character counter with quality-aware coloring
 * @param {HTMLElement} input - Input element
 * @param {HTMLElement} topicItem - Topic item container
 */
function updateCharCounter(input, topicItem) {
    const formGroup = input.closest('.enhanced-form-group');
    if (!formGroup) return;
    
    const counter = formGroup.querySelector('.char-counter .current-length');
    if (counter) {
        counter.textContent = input.value.length;
        
        // PHASE 6: Enhanced counter color based on quality and usage
        const maxLength = parseInt(input.getAttribute('maxlength'));
        const usage = input.value.length / maxLength;
        const length = input.value.length;
        
        // Quality-aware coloring
        if (topicsMkcgIntegration && topicsMkcgIntegration.validationConfig) {
            const optimalRange = topicsMkcgIntegration.validationConfig.rules.topic_length.optimal;
            
            if (length >= optimalRange[0] && length <= optimalRange[1]) {
                counter.style.color = '#10b981'; // Green - optimal length
                counter.title = 'Optimal length for quality';
            } else if (usage >= 0.9) {
                counter.style.color = '#ef4444'; // Red - too long
                counter.title = 'Approaching maximum length';
            } else if (usage >= 0.7) {
                counter.style.color = '#f59e0b'; // Orange - getting long
                counter.title = 'Consider staying under optimal range';
            } else if (length < 3) {
                counter.style.color = '#ef4444'; // Red - too short
                counter.title = 'Minimum 3 characters required';
            } else {
                counter.style.color = '#6b7280'; // Gray - acceptable
                counter.title = 'Acceptable length';
            }
        } else {
            // Fallback to original logic
            if (usage >= 0.9) {
                counter.style.color = '#ef4444'; // Red
            } else if (usage >= 0.7) {
                counter.style.color = '#f59e0b'; // Orange
            } else {
                counter.style.color = '#6b7280'; // Gray
            }
        }
    }
}

/**
 * PHASE 6: Enhanced topic input validation with fallback support
 * Maintains backward compatibility while supporting advanced validation
 * @param {HTMLElement} input - Input element
 * @param {HTMLElement} topicItem - Topic item container
 * @param {boolean} showAll - Show all validation messages
 */
function validateTopicInput(input, topicItem, showAll = false) {
    // PHASE 6: If comprehensive validation is available, use it
    if (topicsMkcgIntegration && typeof topicsMkcgIntegration.performComprehensiveValidation === 'function') {
        const topicIndex = parseInt(input.getAttribute('data-topic-title').split('-').pop()) || 0;
        
        topicsMkcgIntegration.performComprehensiveValidation(input.value, topicIndex)
            .then(validationResults => {
                // Update UI with comprehensive results
                if (typeof topicsMkcgIntegration.updateValidationUI === 'function') {
                    topicsMkcgIntegration.updateValidationUI(input, validationResults);
                }
                
                // Update topic indicators based on quality
                if (validationResults.quality) {
                    updateTopicIndicators(topicItem, topicIndex, validationResults.quality);
                }
            })
            .catch(error => {
                console.error('❌ PHASE 6: Comprehensive validation failed, falling back to basic:', error);
                // Fall through to basic validation
                performBasicValidation();
            });
        
        return; // Exit early if comprehensive validation is handling it
    }
    
    // Fallback to basic validation for backward compatibility
    performBasicValidation();
    
    function performBasicValidation() {
        const formGroup = input.closest('.enhanced-form-group');
        if (!formGroup) return;
        
        const feedback = formGroup.querySelector('.validation-feedback');
        const value = input.value.trim();
        const messages = [];
        
        // Basic validation rules
        if (showAll || value.length > 0) {
            if (value.length < 3 && value.length > 0) {
                messages.push('Too short (min 3 characters)');
            }
            
            if (value.length > 0 && !/^[a-zA-Z0-9\s\-.,!?'"()&]+$/.test(value)) {
                messages.push('Contains invalid characters');
            }
            
            if (value.length > 0 && value === value.toLowerCase()) {
                messages.push('Consider capitalizing first letter');
            }
            
            // PHASE 6: Additional basic checks
            if (value.length > 100) {
                messages.push('Too long (max 100 characters)');
            }
            
            if (/<[^>]*>/g.test(value)) {
                messages.push('HTML tags are not allowed');
            }
        }
        
        // Update feedback
        if (feedback) {
            if (messages.length > 0) {
                feedback.innerHTML = messages.map(msg => `<span class="validation-error">⚠️ ${msg}</span>`).join('');
                feedback.style.display = 'block';
                input.classList.add('validation-error');
            } else {
                feedback.style.display = 'none';
                input.classList.remove('validation-error');
            }
        }
    }
}

/**
 * PHASE 6: Enhanced topic indicators with comprehensive quality data
 * @param {HTMLElement} topicItem - Topic item element
 * @param {number} index - Topic index
 * @param {Object} qualityData - Optional quality data from comprehensive validation
 */
function updateTopicIndicators(topicItem, index, qualityData = null) {
    const titleInput = topicItem.querySelector(`[data-topic-title="${index}"]`);
    if (!titleInput) return;
    
    const title = titleInput.value.trim();
    
    // PHASE 6: Use provided quality data or calculate basic quality
    let quality, level, hasContent;
    
    if (qualityData) {
        // Use comprehensive quality data
        quality = qualityData.score;
        level = qualityData.level;
        hasContent = quality > 0;
    } else {
        // Fallback to basic calculation
        quality = calculateTopicQuality(title);
        level = getQualityLevel(quality);
        hasContent = title.length > 0;
    }
    
    // Update quality badge
    const qualityBadge = topicItem.querySelector('.quality-badge');
    if (qualityBadge) {
        qualityBadge.textContent = `${quality}%`;
        qualityBadge.setAttribute('data-quality', quality);
        qualityBadge.className = `quality-badge quality-${level}`;
        
        // PHASE 6: Enhanced tooltip with breakdown information
        if (qualityData && qualityData.breakdown) {
            const breakdownText = Object.entries(qualityData.breakdown)
                .map(([category, score]) => `${category}: ${score}%`)
                .join(', ');
            qualityBadge.setAttribute('title', `Quality: ${quality}% (${level})\nBreakdown: ${breakdownText}\nClick for detailed breakdown`);
            
            // Add click handler for detailed breakdown if comprehensive validation is available
            if (topicsMkcgIntegration && typeof topicsMkcgIntegration.showQualityBreakdown === 'function') {
                qualityBadge.style.cursor = 'pointer';
                qualityBadge.onclick = () => topicsMkcgIntegration.showQualityBreakdown(qualityData);
            }
        } else {
            qualityBadge.setAttribute('title', `Quality: ${quality}% (${level})`);
        }
    }
    
    // Update content indicator with enhanced icons
    const contentIndicator = topicItem.querySelector('.content-indicator');
    if (contentIndicator) {
        contentIndicator.className = `content-indicator ${hasContent ? 'has-content' : 'empty'} quality-${level}`;
        
        // PHASE 6: Quality-based icons
        let icon;
        if (hasContent) {
            switch (level) {
                case 'excellent': icon = '🌟'; break;
                case 'good': icon = '⭐'; break;
                case 'fair': icon = '🔶'; break;
                case 'poor': icon = '🔸'; break;
                default: icon = '⚡';
            }
        } else {
            icon = '○';
        }
        
        contentIndicator.textContent = icon;
        contentIndicator.setAttribute('title', 
            hasContent ? `${level} quality (${quality}%)` : 'Empty'
        );
    }
    
    // PHASE 6: Add validation status indicator if available
    const validationStatus = topicItem.querySelector('.validation-status-indicator');
    if (validationStatus && qualityData) {
        if (qualityData.isValid) {
            validationStatus.textContent = '✅';
            validationStatus.title = 'Valid topic';
            validationStatus.className = 'validation-status-indicator valid';
        } else {
            validationStatus.textContent = '❌';
            validationStatus.title = `${qualityData.errors.length} error(s) found`;
            validationStatus.className = 'validation-status-indicator invalid';
        }
    }
}

/**
 * PHASE 2A: Calculate topic quality score
 * @param {string} title - Topic title
 * @returns {number} Quality score 0-100
 */
function calculateTopicQuality(title) {
    if (!title || typeof title !== 'string') return 0;
    
    const trimmed = title.trim();
    if (trimmed.length === 0) return 0;
    
    let score = 0;
    
    // Length scoring (optimal 20-60 characters)
    const length = trimmed.length;
    if (length >= 20 && length <= 60) score += 40;
    else if (length >= 10 && length <= 80) score += 25;
    else if (length >= 3) score += 10;
    
    // Word count scoring (optimal 2-8 words)
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount >= 2 && wordCount <= 8) score += 30;
    else if (wordCount >= 1 && wordCount <= 12) score += 15;
    
    // Professional language indicators
    if (/^[A-Z]/.test(trimmed)) score += 10; // Starts with capital
    if (!/\s{2,}/.test(trimmed)) score += 10; // No double spaces
    if (!/[!]{2,}/.test(trimmed)) score += 10; // No excessive punctuation
    
    return Math.min(100, score);
}

/**
 * PHASE 2A: Get quality level from score
 * @param {number} score - Quality score 0-100
 * @returns {string} Quality level
 */
function getQualityLevel(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
}

/**
 * PHASE 2A: Clear topic content
 * @param {HTMLElement} topicItem - Topic item element
 * @param {number} index - Topic index
 */
function clearTopicContent(topicItem, index) {
    const titleInput = topicItem.querySelector(`[data-topic-title="${index}"]`);
    const descInput = topicItem.querySelector(`[data-topic-description="${index}"]`);
    const iconSelect = topicItem.querySelector(`[data-topic-icon="${index}"]`);
    
    if (titleInput) {
        titleInput.value = '';
        updateCharCounter(titleInput, topicItem);
        validateTopicInput(titleInput, topicItem);
    }
    
    if (descInput) {
        descInput.value = '';
        updateCharCounter(descInput, topicItem);
    }
    
    if (iconSelect) {
        iconSelect.value = 'check';
    }
    
    updateTopicIndicators(topicItem, index);
    updateTopicsInComponent(document.querySelector('.editable-element--selected'));
    scheduleAutoSave();
}

/**
 * PHASE 3: Schedule auto-save with debouncing and visual feedback
 * NOW IMPLEMENTED: Full WordPress integration with AJAX save
 */
function scheduleAutoSave() {
    if (topicsAutoSaveTimer) {
        clearTimeout(topicsAutoSaveTimer);
    }
    
    // Update auto-save status
    updateAutoSaveStatus('pending');
    
    topicsAutoSaveTimer = setTimeout(() => {
        console.log('🔄 PHASE 3: Auto-saving topics to WordPress...');
        updateAutoSaveStatus('saving');
        
        // PHASE 3: Implement actual auto-save to WordPress
        performAutoSaveToWordPress();
        
    }, TOPICS_AUTO_SAVE_DELAY);
}

/**
 * PHASE 2B: Update auto-save status indicator
 * @param {string} status - Status: 'ready', 'pending', 'saving', 'saved', 'error'
 */
function updateAutoSaveStatus(status) {
    const statusIcon = document.querySelector('.save-status-icon');
    const statusText = document.querySelector('.save-timer');
    const progressBar = document.querySelector('.save-progress-bar');
    
    if (!statusIcon || !statusText || !progressBar) return;
    
    switch (status) {
        case 'ready':
            statusIcon.textContent = '💾';
            statusText.textContent = 'Ready';
            statusText.style.color = '#6b7280';
            progressBar.style.width = '0%';
            break;
            
        case 'pending':
            statusIcon.textContent = '⏱️';
            statusText.textContent = `${Math.floor(TOPICS_AUTO_SAVE_DELAY / 1000)}s`;
            statusText.style.color = '#f59e0b';
            progressBar.style.width = '30%';
            progressBar.style.background = '#f59e0b';
            
            // Start countdown
            startAutoSaveCountdown();
            break;
            
        case 'saving':
            statusIcon.textContent = '🔄';
            statusText.textContent = 'Saving...';
            statusText.style.color = '#3b82f6';
            progressBar.style.width = '70%';
            progressBar.style.background = '#3b82f6';
            break;
            
        case 'saved':
            statusIcon.textContent = '✅';
            statusText.textContent = 'Saved';
            statusText.style.color = '#10b981';
            progressBar.style.width = '100%';
            progressBar.style.background = '#10b981';
            
            // Reset to ready after 2 seconds
            setTimeout(() => updateAutoSaveStatus('ready'), 2000);
            break;
            
        case 'error':
            statusIcon.textContent = '❌';
            statusText.textContent = 'Error';
            statusText.style.color = '#ef4444';
            progressBar.style.width = '100%';
            progressBar.style.background = '#ef4444';
            break;
    }
}

/**
 * PHASE 3: Perform auto-save to WordPress via AJAX
 * Complete implementation of save-back mechanism
 */
function performAutoSaveToWordPress() {
    try {
        // Get current topics data from panel
        const topicsData = getCurrentTopicsData();
        
        // Get post ID from MKCG integration
        const postId = topicsMkcgIntegration?.postId || window.guestifyData?.postId;
        
        if (!postId) {
            console.warn('⚠️ PHASE 3: No post ID available for auto-save');
            updateAutoSaveStatus('error');
            return;
        }
        
        // Prepare AJAX request
        const requestData = {
            action: 'save_mkcg_topics',
            post_id: postId,
            topics: topicsData,
            save_type: 'auto',
            client_timestamp: Math.floor(Date.now() / 1000),
            nonce: window.guestifyData?.nonce || ''
        };
        
        console.log('🚀 PHASE 3: Sending auto-save request:', {
            postId: postId,
            topicsCount: Object.keys(topicsData).length,
            saveType: 'auto'
        });
        
        // Send AJAX request to WordPress
        fetch(window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ PHASE 3: Auto-save successful:', data.data);
                updateAutoSaveStatus('saved');
                
                // Show success notification
                showSaveNotification('Topics auto-saved successfully', 'success');
                
            } else {
                console.error('❌ PHASE 3: Auto-save failed:', data.data);
                updateAutoSaveStatus('error');
                
                // Show error notification
                showSaveNotification('Auto-save failed: ' + (data.data?.message || 'Unknown error'), 'error');
                
                // Handle specific error types
                if (data.data?.code === 'EDIT_CONFLICT') {
                    handleEditConflict(data.data);
                }
            }
        })
        .catch(error => {
            console.error('❌ PHASE 3: Auto-save network error:', error);
            updateAutoSaveStatus('error');
            showSaveNotification('Auto-save failed: Network error', 'error');
        });
        
    } catch (error) {
        console.error('❌ PHASE 3: Auto-save exception:', error);
        updateAutoSaveStatus('error');
        showSaveNotification('Auto-save failed: ' + error.message, 'error');
    }
}

/**
 * PHASE 3: Get current topics data from panel inputs
 * @returns {Object} Topics data ready for saving
 */
function getCurrentTopicsData() {
    const topicsData = {};
    
    // Extract data from enhanced topic inputs (if in MKCG mode)
    if (isMkcgMode) {
        for (let i = 1; i <= 5; i++) {
            const titleInput = document.querySelector(`[data-topic-title="${i-1}"]`);
            if (titleInput && titleInput.value.trim()) {
                topicsData[`topic_${i}`] = titleInput.value.trim();
            }
        }
    } else {
        // Extract from standard topic inputs
        const topicItems = document.querySelectorAll('.topic-editor-item');
        topicItems.forEach((item, index) => {
            const titleInput = item.querySelector(`[data-topic-title="${index}"]`);
            if (titleInput && titleInput.value.trim()) {
                topicsData[`topic_${index + 1}`] = titleInput.value.trim();
            }
        });
    }
    
    return topicsData;
}

/**
 * PHASE 3: Show save notification to user
 * @param {string} message Notification message
 * @param {string} type Notification type (success, error, warning)
 */
function showSaveNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.topics-save-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `topics-save-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add close handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto-remove after delay
    const autoRemoveDelay = type === 'error' ? 8000 : 4000;
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, autoRemoveDelay);
}

/**
 * PHASE 3: Get notification icon based on type
 * @param {string} type Notification type
 * @returns {string} Icon HTML
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

/**
 * PHASE 3: Get notification color based on type
 * @param {string} type Notification type
 * @returns {string} CSS color
 */
function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#3b82f6';
    }
}

/**
 * PHASE 3: Handle edit conflicts
 * @param {Object} conflictData Conflict information from server
 */
function handleEditConflict(conflictData) {
    const modal = createConfirmationModal({
        title: 'Edit Conflict Detected',
        message: `${conflictData.message}\n\nHow would you like to proceed?`,
        icon: '⚠️',
        confirmText: 'Overwrite Changes',
        confirmClass: 'btn-warning',
        cancelText: 'Reload Server Data',
        cancelClass: 'btn-secondary',
        showThirdOption: true,
        thirdOptionText: 'Cancel',
        thirdOptionClass: 'btn-outline'
    });
    
    // Handle conflict resolution
    modal.addEventListener('click', (e) => {
        if (e.target.textContent === 'Overwrite Changes') {
            resolveEditConflict('overwrite');
        } else if (e.target.textContent === 'Reload Server Data') {
            resolveEditConflict('reload');
        }
        modal.remove();
    });
}

/**
 * PHASE 3: Resolve edit conflict
 * @param {string} resolutionType Resolution type ('overwrite' or 'reload')
 */
function resolveEditConflict(resolutionType) {
    const postId = topicsMkcgIntegration?.postId || window.guestifyData?.postId;
    
    if (!postId) {
        showSaveNotification('Cannot resolve conflict: Post ID not available', 'error');
        return;
    }
    
    const requestData = {
        action: 'resolve_topics_conflict',
        post_id: postId,
        resolution_type: resolutionType,
        nonce: window.guestifyData?.nonce || ''
    };
    
    console.log(`🔄 PHASE 3: Resolving edit conflict with: ${resolutionType}`);
    
    fetch(window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (resolutionType === 'reload') {
                // Reload server data into panel
                loadServerDataIntoPanel(data.data.topics);
                showSaveNotification('Panel updated with server data', 'success');
            } else {
                // Overwrite was successful
                showSaveNotification('Your changes have been saved', 'success');
            }
        } else {
            showSaveNotification('Conflict resolution failed: ' + (data.data?.message || 'Unknown error'), 'error');
        }
    })
    .catch(error => {
        console.error('❌ PHASE 3: Conflict resolution error:', error);
        showSaveNotification('Conflict resolution failed: Network error', 'error');
    });
}

/**
 * PHASE 3: Load server data into panel inputs
 * @param {Object} serverTopics Topics data from server
 */
function loadServerDataIntoPanel(serverTopics) {
    Object.entries(serverTopics).forEach(([topicKey, topicValue]) => {
        const topicIndex = parseInt(topicKey.split('_')[1]) - 1;
        const titleInput = document.querySelector(`[data-topic-title="${topicIndex}"]`);
        
        if (titleInput) {
            titleInput.value = topicValue;
            
            // Update indicators if in MKCG mode
            if (isMkcgMode) {
                const topicItem = titleInput.closest('.enhanced-topic-item');
                if (topicItem) {
                    updateCharCounter(titleInput, topicItem);
                    validateTopicInput(titleInput, topicItem);
                    updateTopicIndicators(topicItem, topicIndex);
                }
            }
        }
    });
    
    // Update component preview
    updateTopicsInComponent(document.querySelector('.editable-element--selected'));
}

/**
 * PHASE 3: Add manual save button functionality
 */
function setupManualSaveButton() {
    const saveButton = document.querySelector('.mkcg-save-btn');
    if (!saveButton) return;
    
    saveButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        console.log('💾 PHASE 3: Manual save triggered');
        
        // Clear auto-save timer
        if (topicsAutoSaveTimer) {
            clearTimeout(topicsAutoSaveTimer);
        }
        
        // Update UI to show saving
        updateAutoSaveStatus('saving');
        
        // Perform save with manual type
        performManualSaveToWordPress();
    });
}

/**
 * PHASE 3: Perform manual save to WordPress
 */
function performManualSaveToWordPress() {
    try {
        const topicsData = getCurrentTopicsData();
        const postId = topicsMkcgIntegration?.postId || window.guestifyData?.postId;
        
        if (!postId) {
            console.warn('⚠️ PHASE 3: No post ID available for manual save');
            updateAutoSaveStatus('error');
            showSaveNotification('Save failed: No post ID available', 'error');
            return;
        }
        
        const requestData = {
            action: 'save_mkcg_topics',
            post_id: postId,
            topics: topicsData,
            save_type: 'manual',
            client_timestamp: Math.floor(Date.now() / 1000),
            nonce: window.guestifyData?.nonce || ''
        };
        
        console.log('💾 PHASE 3: Sending manual save request:', {
            postId: postId,
            topicsCount: Object.keys(topicsData).length,
            saveType: 'manual'
        });
        
        fetch(window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ PHASE 3: Manual save successful:', data.data);
                updateAutoSaveStatus('saved');
                showSaveNotification(
                    `Topics saved successfully (${data.data.topics_saved} topics, ${data.data.processing_time}ms)`, 
                    'success'
                );
            } else {
                console.error('❌ PHASE 3: Manual save failed:', data.data);
                updateAutoSaveStatus('error');
                showSaveNotification('Save failed: ' + (data.data?.message || 'Unknown error'), 'error');
                
                if (data.data?.code === 'EDIT_CONFLICT') {
                    handleEditConflict(data.data);
                }
            }
        })
        .catch(error => {
            console.error('❌ PHASE 3: Manual save network error:', error);
            updateAutoSaveStatus('error');
            showSaveNotification('Save failed: Network error', 'error');
        });
        
    } catch (error) {
        console.error('❌ PHASE 3: Manual save exception:', error);
        updateAutoSaveStatus('error');
        showSaveNotification('Save failed: ' + error.message, 'error');
    }
}

/**
 * PHASE 2B: Start auto-save countdown timer
 */
function startAutoSaveCountdown() {
    let remainingTime = Math.floor(TOPICS_AUTO_SAVE_DELAY / 1000);
    const statusText = document.querySelector('.save-timer');
    const progressBar = document.querySelector('.save-progress-bar');
    
    const countdownInterval = setInterval(() => {
        remainingTime--;
        
        if (statusText && remainingTime > 0) {
            statusText.textContent = `${remainingTime}s`;
            
            // Update progress bar
            const progress = ((TOPICS_AUTO_SAVE_DELAY / 1000 - remainingTime) / (TOPICS_AUTO_SAVE_DELAY / 1000)) * 30;
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        } else {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

/**
 * PHASE 4: Setup undo button functionality
 */
function setupUndoButton() {
    // Find or create undo button in MKCG section
    let undoButton = document.querySelector('.topics-undo-btn');
    
    if (!undoButton) {
        // Create undo button if it doesn't exist
        const mkcgControls = document.querySelector('.mkcg-data-controls');
        if (mkcgControls) {
            undoButton = document.createElement('button');
            undoButton.type = 'button';
            undoButton.className = 'topics-undo-btn btn-secondary';
            undoButton.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 0 0 13.48 3.36M21 12c0-4.97-4.03-9-9-9-2.87 0-5.42 1.34-7.07 3.44"></path>
                </svg>
                Undo Reorder
            `;
            undoButton.title = 'Undo last reorder operation';
            undoButton.disabled = true; // Initially disabled
            
            mkcgControls.appendChild(undoButton);
        }
    }
    
    if (undoButton) {
        // Remove existing listeners
        undoButton.removeEventListener('click', undoLastReorder);
        
        // Add click handler
        undoButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (reorderUndoHistory.length > 0) {
                console.log('⏪ PHASE 4: Manual undo triggered');
                undoLastReorder();
            } else {
                showUndoFeedback('No reorder operations to undo', 'warning');
            }
        });
        
        console.log('✅ PHASE 4: Undo button setup complete');
    }
    
    // Update initial state
    updateUndoButtonState();
}

/**
 * PHASE 3: Enhanced bulk operations functionality with save-back integration
 */
function setupEnhancedBulkOperations() {
    // Clear All Topics button
    const clearAllBtn = document.querySelector('.mkcg-clear-all-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', handleClearAllTopics);
    }
    
    // Reset to MKCG button
    const resetBtn = document.querySelector('.mkcg-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleResetToMKCG);
    }
    
    // PHASE 3: Setup manual save button
    setupManualSaveButton();
    
    // PHASE 4: Setup undo button
    setupUndoButton();
    
    console.log('✅ PHASE 4: Enhanced bulk operations with save-back and undo setup complete');
}

/**
 * PHASE 2B: Handle Clear All Topics with confirmation
 */
function handleClearAllTopics() {
    // Create confirmation modal
    const modal = createConfirmationModal({
        title: 'Clear All Topics',
        message: 'Are you sure you want to clear all topic content? This action cannot be undone.',
        icon: '⚠️',
        confirmText: 'Clear All',
        confirmClass: 'btn-warning',
        cancelText: 'Cancel'
    });
    
    modal.onConfirm = () => {
        console.log('🗑️ PHASE 2B: Clearing all topics...');
        
        // Clear all topic content
        const topicItems = document.querySelectorAll('.enhanced-topic-item');
        topicItems.forEach((item, index) => {
            clearTopicContent(item, index);
        });
        
        // Show success feedback
        showBulkOperationFeedback('All topics cleared successfully', 'success');
        
        // Update auto-save
        scheduleAutoSave();
    };
}

/**
 * PHASE 2B: Handle Reset to MKCG with confirmation
 */
function handleResetToMKCG() {
    if (!topicsMkcgIntegration) {
        showBulkOperationFeedback('MKCG integration not available', 'error');
        return;
    }
    
    // Create confirmation modal
    const modal = createConfirmationModal({
        title: 'Reset to MKCG Data',
        message: 'This will replace all current topic content with original MKCG data. Any manual edits will be lost.',
        icon: '🔄',
        confirmText: 'Reset to MKCG',
        confirmClass: 'btn-primary',
        cancelText: 'Cancel'
    });
    
    modal.onConfirm = () => {
        console.log('🔄 PHASE 2B: Resetting to MKCG data...');
        
        // Re-inject MKCG data
        topicsMkcgIntegration.injectMKCGDataIntoPanel();
        
        // Show success feedback
        showBulkOperationFeedback('Topics reset to MKCG data successfully', 'success');
        
        // Update auto-save
        scheduleAutoSave();
    };
}

/**
 * PHASE 2B: Create confirmation modal
 * @param {Object} options - Modal options
 * @returns {Object} Modal object with onConfirm callback
 */
function createConfirmationModal(options) {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal-overlay';
    modal.innerHTML = `
        <div class="confirmation-modal">
            <div class="modal-header">
                <span class="modal-icon">${options.icon}</span>
                <h3 class="modal-title">${options.title}</h3>
            </div>
            <div class="modal-body">
                <p class="modal-message">${options.message}</p>
            </div>
            <div class="modal-footer">
                <button class="modal-cancel-btn btn-secondary">${options.cancelText}</button>
                <button class="modal-confirm-btn ${options.confirmClass}">${options.confirmText}</button>
            </div>
        </div>
    `;
    
    // Style the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease-out;
    `;
    
    const modalContent = modal.querySelector('.confirmation-modal');
    modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: slideInUp 0.3s ease-out;
    `;
    
    document.body.appendChild(modal);
    
    const modalObject = { onConfirm: null };
    
    // Event handlers
    const cancelBtn = modal.querySelector('.modal-cancel-btn');
    const confirmBtn = modal.querySelector('.modal-confirm-btn');
    
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.2s ease-in';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 200);
    };
    
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    confirmBtn.addEventListener('click', () => {
        if (modalObject.onConfirm) {
            modalObject.onConfirm();
        }
        closeModal();
    });
    
    return modalObject;
}

/**
 * PHASE 2B: Show bulk operation feedback
 * @param {string} message - Feedback message
 * @param {string} type - Feedback type: 'success', 'error', 'info'
 */
function showBulkOperationFeedback(message, type = 'info') {
    const feedback = document.createElement('div');
    feedback.className = `bulk-operation-feedback ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    const colors = {
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    };
    
    feedback.innerHTML = `
        <div class="feedback-content">
            <span class="feedback-icon">${icons[type]}</span>
            <span class="feedback-text">${message}</span>
        </div>
    `;
    
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 4 seconds
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 4000);
}

/**
 * PHASE 2A: Schedule auto-save with debouncing
 */
function scheduleAutoSave() {
    if (topicsAutoSaveTimer) {
        clearTimeout(topicsAutoSaveTimer);
    }
    
    // Update auto-save status
    updateAutoSaveStatus('pending');
    
    topicsAutoSaveTimer = setTimeout(() => {
        console.log('🔄 PHASE 3: Auto-saving topics to WordPress...');
        updateAutoSaveStatus('saving');
        
        // PHASE 3: Actual auto-save implementation
        performAutoSaveToWordPress();
        
    }, TOPICS_AUTO_SAVE_DELAY);
}

/**
 * PHASE 5: Clear all topics content (for bulk operations)
 */
function clearAllTopicsContent() {
    console.log('🗑️ PHASE 5: Clearing all topics content...');
    
    if (isMkcgMode) {
        // Clear enhanced topic items
        for (let i = 0; i < 5; i++) {
            const titleInput = document.querySelector(`[data-topic-title="${i}"]`);
            const descInput = document.querySelector(`[data-topic-description="${i}"]`);
            const iconSelect = document.querySelector(`[data-topic-icon="${i}"]`);
            
            if (titleInput) {
                titleInput.value = '';
                
                // Update indicators if in MKCG mode
                const topicItem = titleInput.closest('.enhanced-topic-item');
                if (topicItem) {
                    updateCharCounter(titleInput, topicItem);
                    validateTopicInput(titleInput, topicItem);
                    updateTopicIndicators(topicItem, i);
                }
            }
            
            if (descInput) {
                descInput.value = '';
                
                const topicItem = descInput.closest('.enhanced-topic-item');
                if (topicItem) {
                    updateCharCounter(descInput, topicItem);
                }
            }
            
            if (iconSelect) {
                iconSelect.value = 'check';
            }
        }
    } else {
        // Clear standard topic items
        const topicItems = document.querySelectorAll('.topic-editor-item');
        topicItems.forEach((item, index) => {
            const titleInput = item.querySelector(`[data-topic-title="${index}"]`);
            const descInput = item.querySelector(`[data-topic-description="${index}"]`);
            const iconSelect = item.querySelector(`[data-topic-icon="${index}"]`);
            
            if (titleInput) titleInput.value = '';
            if (descInput) descInput.value = '';
            if (iconSelect) iconSelect.value = 'check';
        });
    }
    
    // Update component preview
    updateTopicsInComponent(document.querySelector('.editable-element--selected'));
    
    console.log('✅ PHASE 5: All topics content cleared successfully');
}

// PHASE 6: Enhanced MKCG Integration Function Exposure
// Make key functions available globally for MKCG integration class
if (typeof window !== 'undefined') {
window.addTopicToPanel = addTopicToPanelInternal;
window.updateTopicsInComponent = updateTopicsInComponentInternal;
window.escapeHtml = escapeHtml;

// PHASE 2A: Enhanced functions
window.addEnhancedTopicToPanel = addEnhancedTopicToPanel;
window.calculateTopicQuality = calculateTopicQuality;
window.getQualityLevel = getQualityLevel;

// PHASE 3: Save functions
window.scheduleAutoSave = scheduleAutoSave;
window.performManualSaveToWordPress = performManualSaveToWordPress;
window.showSaveNotification = showSaveNotification;

// PHASE 4: Reorder and undo functions
window.undoLastReorder = undoLastReorder;
window.updateUndoButtonState = updateUndoButtonState;

// PHASE 5: Bulk operations functions
window.clearAllTopicsContent = clearAllTopicsContent;
window.showBulkOperationFeedback = showBulkOperationFeedback;
window.getCurrentTopicsData = getCurrentTopicsData;
window.updateAutoSaveStatus = updateAutoSaveStatus;

// PHASE 6: Enhanced validation functions
    window.updateCharCounter = updateCharCounter;
        window.validateTopicInput = validateTopicInput;
        window.updateTopicIndicators = updateTopicIndicators;
        window.setupEnhancedTopicInputHandlers = setupEnhancedTopicInputHandlers;
        
        // PHASE 6: Validation integration helpers
        window.triggerTopicValidation = function(topicIndex) {
            const titleInput = document.querySelector(`[data-topic-title="${topicIndex}"]`);
            if (titleInput && topicsMkcgIntegration) {
                topicsMkcgIntegration.validateTopicDebounced(titleInput.value, topicIndex, titleInput);
            }
        };
        
        window.getTopicValidationResults = function(topicIndex) {
            if (topicsMkcgIntegration && topicsMkcgIntegration.validationState) {
                const validationKey = `topic_${topicIndex}`;
                return topicsMkcgIntegration.validationState.validationCache.get(validationKey);
            }
            return null;
        };
        
        console.log('✅ PHASE 6: Complete topics panel functions with enhanced validation exposed globally');
    }
