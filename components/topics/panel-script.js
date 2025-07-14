/**
 * Topics Component Panel Script - ROOT FIX IMPLEMENTATION
 * PHASE 3: Simplified, focused JavaScript for better UX
 * Focus: Core functionality, clean architecture, maintainable code
 */

// =================================================================================
// CORE INITIALIZATION - Clean, single-purpose entry point
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Topics Panel Script: Starting initialization...');
    
    const componentElement = document.querySelector('.editable-element[data-component="topics"]');
    if (componentElement) {
        initializeTopicsPanel(componentElement);
    } else {
        console.log('📝 Topics component not found - panel will initialize when component is selected');
    }
});

/**
 * Main panel initialization - simplified and focused
 * @param {HTMLElement} element The main component element
 */
function initializeTopicsPanel(element) {
    console.log('🚀 Initializing Topics Panel...');
    
    try {
        // Initialize core panel functionality
        setupBasicControls(element);
        setupTopicsEditor();
        setupDisplayControls(element);
        setupAdvancedFeatures();
        setupMKCGIntegration(); // Optional - only if available
        
        console.log('✅ Topics Panel initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing Topics Panel:', error);
        showNotification('Panel initialization failed. Some features may not work.', 'error');
    }
}

// =================================================================================
// CORE PANEL CONTROLS - Essential functionality
// =================================================================================

/**
 * Setup basic form controls for content and display
 * @param {HTMLElement} element The component element
 */
function setupBasicControls(element) {
    console.log('🔧 Setting up basic controls...');
    
    // Title and introduction text controls
    setupTextControl('title', '.topics-section-title', element);
    setupTextControl('introduction', '.topics-introduction', element);
    
    // Color picker
    setupColorPicker(element);
    
    // Checkbox controls
    setupCheckboxControls(element);
    
    console.log('✅ Basic controls initialized');
}

/**
 * Setup text input controls with live preview
 * @param {string} property The data property name
 * @param {string} selector The preview element selector
 * @param {HTMLElement} element The component element
 */
function setupTextControl(property, selector, element) {
    const input = document.querySelector(`[data-property="${property}"]`);
    if (!input) return;
    
    // Get initial value from component
    const previewElement = element.querySelector(selector);
    if (previewElement) {
        input.value = previewElement.textContent.trim();
    }
    
    // Add live update listener
    input.addEventListener('input', debounce(() => {
        const previewElement = element.querySelector(selector);
        if (previewElement) {
            previewElement.textContent = input.value;
            triggerComponentUpdate(element);
        }
    }, 300));
}

/**
 * Setup color picker with live preview
 * @param {HTMLElement} element The component element
 */
function setupColorPicker(element) {
    const colorInput = document.querySelector('[data-property="topicColor"]');
    const textInput = colorInput?.nextElementSibling;
    
    if (!colorInput || !textInput) return;
    
    // Sync color and text inputs
    colorInput.addEventListener('input', () => {
        textInput.value = colorInput.value;
        applyColorToComponent(element, colorInput.value);
        triggerComponentUpdate(element);
    });
    
    textInput.addEventListener('input', () => {
        if (isValidHexColor(textInput.value)) {
            colorInput.value = textInput.value;
            applyColorToComponent(element, textInput.value);
            triggerComponentUpdate(element);
        }
    });
}

/**
 * Apply color theme to component
 * @param {HTMLElement} element The component element
 * @param {string} color The hex color value
 */
function applyColorToComponent(element, color) {
    element.style.setProperty('--topic-color', color);
    
    // Apply to topic elements
    const topicElements = element.querySelectorAll('.topic-icon, .topic-item');
    topicElements.forEach(el => {
        if (el.classList.contains('topic-icon')) {
            el.style.backgroundColor = color;
        }
    });
}

/**
 * Setup checkbox controls
 * @param {HTMLElement} element The component element
 */
function setupCheckboxControls(element) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-property]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const property = checkbox.dataset.property;
            element.setAttribute(`data-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, checkbox.checked);
            triggerComponentUpdate(element);
        });
    });
}

// =================================================================================
// TOPICS EDITOR - Core topic management
// =================================================================================

let topicCount = 0;
const MAX_TOPICS = 10;

/**
 * Setup topics editor functionality
 */
function setupTopicsEditor() {
    console.log('📝 Setting up topics editor...');
    
    const addButton = document.getElementById('add-topic-btn');
    const clearButton = document.getElementById('clear-all-topics-btn');
    
    if (addButton) {
        addButton.addEventListener('click', addNewTopic);
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', handleClearAllTopics);
    }
    
    // Initialize with existing topics or create empty ones
    loadExistingTopics();
    
    console.log('✅ Topics editor initialized');
}

/**
 * Add a new topic to the editor
 */
function addNewTopic() {
    if (topicCount >= MAX_TOPICS) {
        showNotification(`Maximum of ${MAX_TOPICS} topics allowed`, 'warning');
        return;
    }
    
    const topicItem = createTopicEditorItem('', '', topicCount);
    const topicsList = document.getElementById('design-topics-list');
    
    if (topicsList && topicItem) {
        topicsList.appendChild(topicItem);
        topicCount++;
        updateTopicsCounter();
        updateClearButtonVisibility();
        
        // Focus the new topic input
        const input = topicItem.querySelector('input[data-topic-title]');
        if (input) {
            input.focus();
            input.select();
        }
    }
}

/**
 * Create a topic editor item
 * @param {string} title The topic title
 * @param {string} description The topic description
 * @param {number} index The topic index
 * @returns {HTMLElement} The topic editor item
 */
function createTopicEditorItem(title, description, index) {
    const item = document.createElement('div');
    item.className = 'topic-editor-item';
    item.innerHTML = `
        <div class="topic-editor-header">
            <span class="topic-number">Topic ${index + 1}</span>
            <button class="remove-item-btn" type="button" title="Remove topic">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="form-group">
            <label class="form-label">Topic Title</label>
            <input type="text" class="form-input" data-topic-title="${index}" value="${escapeHtml(title)}" placeholder="Enter topic title...">
        </div>
        <div class="form-group">
            <label class="form-label">Description <span class="form-label__optional">(optional)</span></label>
            <textarea class="form-input form-textarea" rows="2" data-topic-description="${index}" placeholder="Brief description...">${escapeHtml(description)}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Icon</label>
            <select class="form-select" data-topic-icon="${index}">
                <option value="check" selected>Checkmark</option>
                <option value="star">Star</option>
                <option value="arrow">Arrow</option>
                <option value="circle">Circle</option>
                <option value="info">Info</option>
                <option value="none">No Icon</option>
            </select>
        </div>
    `;
    
    // Setup event listeners
    setupTopicItemEvents(item, index);
    
    return item;
}

/**
 * Setup event listeners for a topic item
 * @param {HTMLElement} item The topic item element
 * @param {number} index The topic index
 */
function setupTopicItemEvents(item, index) {
    // Input change listeners
    const inputs = item.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            updateComponentPreview();
        }, 300));
    });
    
    // Remove button listener
    const removeBtn = item.querySelector('.remove-item-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            removeTopic(item);
        });
    }
}

/**
 * Remove a topic item
 * @param {HTMLElement} item The topic item to remove
 */
function removeTopic(item) {
    item.remove();
    topicCount--;
    updateTopicsCounter();
    updateClearButtonVisibility();
    renumberTopics();
    updateComponentPreview();
}

/**
 * Handle clear all topics button
 */
function handleClearAllTopics() {
    if (topicCount === 0) return;
    
    if (confirm(`Are you sure you want to remove all ${topicCount} topics?`)) {
        const topicsList = document.getElementById('design-topics-list');
        if (topicsList) {
            topicsList.innerHTML = '';
            topicCount = 0;
            updateTopicsCounter();
            updateClearButtonVisibility();
            updateComponentPreview();
            showNotification('All topics cleared', 'success');
        }
    }
}

/**
 * Load existing topics from component
 */
function loadExistingTopics() {
    const component = document.querySelector('.editable-element[data-component="topics"]');
    if (!component) return;
    
    const existingTopics = component.querySelectorAll('.topic-item');
    
    if (existingTopics.length > 0) {
        // Load from existing component
        existingTopics.forEach((topicEl, index) => {
            const title = topicEl.querySelector('.topic-title')?.textContent || '';
            const description = topicEl.querySelector('.topic-description')?.textContent || '';
            
            const topicItem = createTopicEditorItem(title, description, index);
            const topicsList = document.getElementById('design-topics-list');
            if (topicsList) {
                topicsList.appendChild(topicItem);
                topicCount++;
            }
        });
    } else {
        // Create default empty topics
        for (let i = 0; i < 3; i++) {
            const topicItem = createTopicEditorItem('', '', i);
            const topicsList = document.getElementById('design-topics-list');
            if (topicsList) {
                topicsList.appendChild(topicItem);
                topicCount++;
            }
        }
    }
    
    updateTopicsCounter();
    updateClearButtonVisibility();
}

/**
 * Update topics counter
 */
function updateTopicsCounter() {
    const counter = document.getElementById('topic-count');
    if (counter) {
        counter.textContent = topicCount;
    }
}

/**
 * Update clear button visibility
 */
function updateClearButtonVisibility() {
    const clearButton = document.getElementById('clear-all-topics-btn');
    if (clearButton) {
        clearButton.style.display = topicCount > 0 ? 'flex' : 'none';
    }
}

/**
 * Renumber topics after removal
 */
function renumberTopics() {
    const topicItems = document.querySelectorAll('.topic-editor-item');
    topicItems.forEach((item, index) => {
        const numberEl = item.querySelector('.topic-number');
        if (numberEl) {
            numberEl.textContent = `Topic ${index + 1}`;
        }
        
        // Update data attributes
        const titleInput = item.querySelector('[data-topic-title]');
        const descInput = item.querySelector('[data-topic-description]');
        const iconSelect = item.querySelector('[data-topic-icon]');
        
        if (titleInput) titleInput.setAttribute('data-topic-title', index);
        if (descInput) descInput.setAttribute('data-topic-description', index);
        if (iconSelect) iconSelect.setAttribute('data-topic-icon', index);
    });
}

// =================================================================================
// DISPLAY CONTROLS - Layout and styling options
// =================================================================================

/**
 * Setup display and layout controls
 * @param {HTMLElement} element The component element
 */
function setupDisplayControls(element) {
    console.log('🎨 Setting up display controls...');
    
    // Display style selector
    const displayStyleSelect = document.querySelector('[data-property="displayStyle"]');
    if (displayStyleSelect) {
        displayStyleSelect.addEventListener('change', () => {
            const style = displayStyleSelect.value;
            element.setAttribute('data-display-style', style);
            updateColumnsVisibility(style);
            triggerComponentUpdate(element);
        });
        
        // Initialize
        updateColumnsVisibility(displayStyleSelect.value);
    }
    
    // Columns selector
    const columnsSelect = document.querySelector('[data-property="columns"]');
    if (columnsSelect) {
        columnsSelect.addEventListener('change', () => {
            element.style.setProperty('--topic-columns', columnsSelect.value);
            triggerComponentUpdate(element);
        });
    }
    
    // Other selects
    const selects = document.querySelectorAll('select[data-property]');
    selects.forEach(select => {
        if (select !== displayStyleSelect && select !== columnsSelect) {
            select.addEventListener('change', () => {
                const property = select.dataset.property;
                element.setAttribute(`data-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, select.value);
                triggerComponentUpdate(element);
            });
        }
    });
    
    console.log('✅ Display controls initialized');
}

/**
 * Update columns field visibility based on display style
 * @param {string} style The selected display style
 */
function updateColumnsVisibility(style) {
    const columnsGroup = document.getElementById('columns-group');
    if (columnsGroup) {
        columnsGroup.style.display = (style === 'grid' || style === 'cards') ? 'block' : 'none';
    }
}

// =================================================================================
// ADVANCED FEATURES - Collapsible sections
// =================================================================================

/**
 * Setup advanced features (collapsible sections)
 */
function setupAdvancedFeatures() {
    console.log('⚙️ Setting up advanced features...');
    
    // Setup collapsible sections
    const toggleButtons = document.querySelectorAll('.form-section__toggle');
    toggleButtons.forEach(button => {
        button.addEventListener('click', handleSectionToggle);
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSectionToggle.call(button, e);
            }
        });
    });
    
    console.log('✅ Advanced features initialized');
}

/**
 * Handle section toggle
 * @param {Event} e The click event
 */
function handleSectionToggle(e) {
    const section = this.closest('.form-section--collapsible');
    const content = section.querySelector('.form-section__content');
    
    if (section && content) {
        const isExpanded = section.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse
            content.style.display = 'none';
            section.classList.remove('expanded');
        } else {
            // Expand
            content.style.display = 'block';
            section.classList.add('expanded');
        }
        
        // Update ARIA attributes for accessibility
        this.setAttribute('aria-expanded', !isExpanded);
    }
}

// =================================================================================
// MKCG INTEGRATION - Optional advanced features
// =================================================================================

/**
 * Setup MKCG integration if available
 */
function setupMKCGIntegration() {
    console.log('🔗 Checking for MKCG integration...');
    
    // Check if MKCG is available
    if (!window.topicsMkcgIntegration) {
        console.log('📝 MKCG not available - hiding integration section');
        const mkcgSection = document.getElementById('mkcg-integration');
        if (mkcgSection) {
            mkcgSection.style.display = 'none';
        }
        return;
    }
    
    // Show MKCG section
    const mkcgSection = document.getElementById('mkcg-integration');
    if (mkcgSection) {
        mkcgSection.style.display = 'block';
    }
    
    // Setup MKCG controls
    setupMKCGControls();
    
    console.log('✅ MKCG integration initialized');
}

/**
 * Setup MKCG controls
 */
function setupMKCGControls() {
    const loadButton = document.getElementById('load-saved-topics');
    const syncButton = document.getElementById('sync-topics');
    
    if (loadButton) {
        loadButton.addEventListener('click', handleLoadSavedTopics);
    }
    
    if (syncButton) {
        syncButton.addEventListener('click', handleSyncTopics);
    }
    
    // Update status
    updateMKCGStatus();
}

/**
 * Handle load saved topics
 */
function handleLoadSavedTopics() {
    console.log('📥 Loading saved topics...');
    
    if (window.topicsMkcgIntegration && window.topicsMkcgIntegration.loadSavedTopics) {
        try {
            window.topicsMkcgIntegration.loadSavedTopics()
                .then(() => {
                    showNotification('Topics loaded successfully', 'success');
                    loadExistingTopics(); // Refresh the editor
                })
                .catch(error => {
                    console.error('Error loading topics:', error);
                    showNotification('Failed to load topics', 'error');
                });
        } catch (error) {
            console.error('Error calling MKCG integration:', error);
            showNotification('MKCG integration error', 'error');
        }
    }
}

/**
 * Handle sync topics
 */
function handleSyncTopics() {
    console.log('🔄 Syncing topics...');
    
    if (window.topicsMkcgIntegration && window.topicsMkcgIntegration.syncTopics) {
        try {
            window.topicsMkcgIntegration.syncTopics()
                .then(() => {
                    showNotification('Topics synced successfully', 'success');
                    loadExistingTopics(); // Refresh the editor
                })
                .catch(error => {
                    console.error('Error syncing topics:', error);
                    showNotification('Failed to sync topics', 'error');
                });
        } catch (error) {
            console.error('Error calling MKCG integration:', error);
            showNotification('MKCG integration error', 'error');
        }
    }
}

/**
 * Update MKCG status indicator
 */
function updateMKCGStatus() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    const actionsDiv = document.getElementById('mkcg-actions');
    
    if (window.topicsMkcgIntegration && window.topicsMkcgIntegration.isConnected) {
        if (statusDot) statusDot.setAttribute('data-status', 'connected');
        if (statusText) statusText.textContent = 'Connected to Content Generator';
        if (actionsDiv) actionsDiv.style.display = 'block';
    } else {
        if (statusDot) statusDot.setAttribute('data-status', 'disconnected');
        if (statusText) statusText.textContent = 'Content Generator not available';
        if (actionsDiv) actionsDiv.style.display = 'none';
    }
}

// =================================================================================
// COMPONENT PREVIEW UPDATE - Live preview functionality
// =================================================================================

/**
 * Update the component preview based on panel inputs
 */
function updateComponentPreview() {
    const component = document.querySelector('.editable-element[data-component="topics"]');
    if (!component) return;
    
    const topicsContainer = component.querySelector('.topics-container');
    if (!topicsContainer) return;
    
    // Clear existing topics
    topicsContainer.innerHTML = '';
    
    // Get all topic items from editor
    const topicItems = document.querySelectorAll('.topic-editor-item');
    
    topicItems.forEach((item, index) => {
        const titleInput = item.querySelector(`[data-topic-title="${index}"]`);
        const descInput = item.querySelector(`[data-topic-description="${index}"]`);
        const iconSelect = item.querySelector(`[data-topic-icon="${index}"]`);
        
        const title = titleInput?.value.trim();
        const description = descInput?.value.trim();
        const iconType = iconSelect?.value || 'check';
        
        if (title) {
            const topicElement = createTopicPreviewElement(title, description, iconType);
            topicsContainer.appendChild(topicElement);
        }
    });
    
    // Trigger component update
    triggerComponentUpdate(component);
}

/**
 * Create a topic preview element
 * @param {string} title The topic title
 * @param {string} description The topic description
 * @param {string} iconType The icon type
 * @returns {HTMLElement} The topic element
 */
function createTopicPreviewElement(title, description, iconType) {
    const topicDiv = document.createElement('div');
    topicDiv.className = 'topic-item';
    
    // Create icon if not 'none'
    let iconHtml = '';
    if (iconType !== 'none') {
        iconHtml = `<div class="topic-icon" data-icon="${iconType}">${getIconSVG(iconType)}</div>`;
    }
    
    // Check if descriptions should be shown
    const showDescriptions = document.querySelector('[data-property="showDescriptions"]')?.checked !== false;
    
    topicDiv.innerHTML = `
        ${iconHtml}
        <div class="topic-content">
            <h3 class="topic-title">${escapeHtml(title)}</h3>
            ${description && showDescriptions ? `<p class="topic-description">${escapeHtml(description)}</p>` : ''}
        </div>
    `;
    
    return topicDiv;
}

/**
 * Get SVG icon for topic type
 * @param {string} iconType The icon type
 * @returns {string} The SVG HTML
 */
function getIconSVG(iconType) {
    const icons = {
        check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
        arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
        circle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };
    
    return icons[iconType] || icons.check;
}

// =================================================================================
// UTILITY FUNCTIONS - Helper functions
// =================================================================================

/**
 * Trigger component update event
 * @param {HTMLElement} element The component element
 */
function triggerComponentUpdate(element) {
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func The function to debounce
 * @param {number} wait The debounce delay in milliseconds
 * @returns {Function} The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text The text to escape
 * @returns {string} The escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Check if a string is a valid hex color
 * @param {string} color The color string to validate
 * @returns {boolean} True if valid hex color
 */
function isValidHexColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Show notification to user
 * @param {string} message The notification message
 * @param {string} type The notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `topics-notification topics-notification--${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
        font-size: 14px;
        color: white;
        animation: slideInRight 0.3s ease-out;
        background: ${getNotificationColor(type)};
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

/**
 * Get notification icon
 * @param {string} type The notification type
 * @returns {string} The icon character
 */
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

/**
 * Get notification color
 * @param {string} type The notification type
 * @returns {string} The background color
 */
function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

// =================================================================================
// GLOBAL INTERFACE - For external integration
// =================================================================================

// Expose clean API for external components
window.topicsPanel = {
    initialize: initializeTopicsPanel,
    updatePreview: updateComponentPreview,
    addTopic: addNewTopic,
    clearTopics: handleClearAllTopics,
    showNotification: showNotification
};

// Add notification animations to page
if (!document.getElementById('topics-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'topics-notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
        }
        
        .notification-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: inherit;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-left: auto;
        }
        
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ Topics Panel Script: Loaded successfully with clean architecture');
