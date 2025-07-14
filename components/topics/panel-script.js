/**
 * Topics Component Panel Script - ROOT FIX IMPLEMENTATION
 * PHASE 3: Simplified, focused JavaScript for better UX
 * Focus: Core functionality, clean architecture, maintainable code
 * 
 * ROOT FIX: Ensure immediate availability and error recovery
 */

// =================================================================================
// EMERGENCY INITIALIZATION - Immediate script loading verification
// =================================================================================

(function() {
    'use strict';
    
    console.log('🎯 Topics Panel Script: LOADING (Enhanced Debug Mode)');
    
    // Immediate availability check
    if (typeof window.topicsPanel !== 'undefined') {
        console.log('⚠️ Topics Panel already exists, reinitializing...');
    }
    
    // Emergency error handler
    window.addEventListener('error', function(e) {
        if (e.filename && e.filename.includes('panel-script')) {
            console.error('❌ Topics Panel Script Error:', e.message, 'Line:', e.lineno);
        }
    });
    
    // Initialize immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTopicsPanel);
    } else {
        // DOM is already ready
        initializeTopicsPanel();
    }
    
    function initializeTopicsPanel() {
        console.log('🚀 Topics Panel: Starting initialization...');
        
        try {
            // Initialize core panel functionality
            setupTopicsPanel();
            console.log('✅ Topics Panel initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Topics Panel:', error);
            
            // Emergency fallback
            setupEmergencyTopicsPanel();
        }
    }
    
    function setupTopicsPanel() {
        // Create global topics panel object
        window.topicsPanel = {
            version: 'root-fix-emergency',
            initialized: false,
            data: null
        };
        
        console.log('🔧 Setting up Topics Panel core functions...');
        
        // Essential function: Load stored topics data
        window.topicsPanel.loadStoredTopicsData = function(postId) {
            console.log('📥 Loading stored topics data for post:', postId);
            
            // Get post ID from parameter or detect automatically
            const targetPostId = postId || detectPostId();
            
            if (!targetPostId) {
                console.warn('⚠️ No post ID available for loading topics');
                return Promise.reject('No post ID');
            }
            
            // Get AJAX data
            const ajaxUrl = window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php';
            const nonce = window.guestifyData?.nonce || '';
            
            if (!nonce) {
                console.error('❌ No nonce available for AJAX request');
                return Promise.reject('No nonce');
            }
            
            const formData = new FormData();
            formData.append('action', 'load_stored_topics');
            formData.append('nonce', nonce);
            formData.append('post_id', targetPostId);
            
            console.log('📡 Making AJAX request to:', ajaxUrl);
            
            return fetch(ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('📡 AJAX Response status:', response.status);
                return response.text();
            })
            .then(text => {
                console.log('📡 Raw AJAX response:', text.substring(0, 200) + '...');
                
                try {
                    const data = JSON.parse(text);
                    console.log('📊 Parsed AJAX data:', data);
                    
                    if (data.success) {
                        console.log('✅ Topics data loaded successfully!');
                        window.storedTopicsData = data;
                        window.topicsPanel.data = data;
                        
                        // Try to update the UI if possible
                        updateTopicsUI(data);
                        
                        return data;
                    } else {
                        console.error('❌ AJAX call failed:', data.data);
                        return Promise.reject(data.data || 'Unknown error');
                    }
                } catch (parseError) {
                    console.error('❌ ROOT FIX: Failed to parse AJAX response:', parseError);
                    console.log('📄 ROOT FIX: Raw response that failed to parse:', text.substring(0, 500));
                    
                    // ROOT FIX: Enhanced error analysis
                    const errorDetails = {
                        error_type: 'JSON_PARSE_ERROR',
                        parse_error: parseError.message,
                        response_length: text.length,
                        response_start: text.substring(0, 100),
                        contains_html: text.includes('<html'),
                        contains_php_error: text.includes('Fatal error') || text.includes('Warning:'),
                        post_id: targetPostId
                    };
                    
                    console.error('🔍 ROOT FIX: Detailed error analysis:', errorDetails);
                    
                    return Promise.reject(`Invalid JSON response: ${parseError.message}`);
                }
            })
            .catch(error => {
                console.error('❌ AJAX request failed:', error);
                return Promise.reject(error);
            });
        };
        
        // ROOT FIX: If auto-load failed but we have a post ID, show reload option
        const postId = detectPostId();
        if (postId && !window.storedTopicsData) {
            console.log('🔄 ROOT FIX: Post ID detected by JavaScript, attempting component reload...');
            
            // Show reload button in the component
            showComponentReloadOption(postId);
            
            // Auto-attempt to load topics data
            setTimeout(() => {
                if (window.topicsPanel && window.topicsPanel.loadStoredTopicsData) {
                    console.log('🔄 ROOT FIX: Auto-attempting to load topics data...');
                    window.topicsPanel.loadStoredTopicsData(postId)
                        .then(data => {
                            console.log('✅ ROOT FIX: Successfully loaded topics after JavaScript detection!');
                            hideComponentReloadOption();
                        })
                        .catch(error => {
                            console.warn('⚠️ ROOT FIX: Auto-reload failed, reload option still available');
                        });
                }
            }, 1000);
        }
        
        window.topicsPanel.initialized = true;
        console.log('✅ Topics Panel setup complete');
    }
    
    function setupEmergencyTopicsPanel() {
        console.log('🚨 Setting up emergency Topics Panel fallback...');
        
        window.topicsPanel = {
            version: 'emergency-fallback',
            initialized: true,
            loadStoredTopicsData: function() {
                console.log('🚨 Emergency handler: Topics data loading not available');
                return Promise.reject('Emergency mode - full functionality not available');
            }
        };
    }
    
    function detectPostId() {
    // ROOT FIX: Enhanced post ID detection with multiple methods
    
    // Method 1: URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let postId = urlParams.get('post_id') || urlParams.get('p') || urlParams.get('page_id') || urlParams.get('post');
    
    if (postId) {
    console.log('🎯 ROOT FIX: Post ID from URL params:', postId);
    return postId;
    }
    
    // Method 2: Check topics container data attribute
    const topicsContainer = document.querySelector('.topics-container');
    if (topicsContainer) {
    postId = topicsContainer.getAttribute('data-post-id');
        if (postId && postId !== '0') {
            console.log('🎯 ROOT FIX: Post ID from topics container:', postId);
            return postId;
        }
    }
    
    // Method 3: Check component data attribute
    const component = document.querySelector('.editable-element[data-component="topics"]');
    if (component) {
        postId = component.getAttribute('data-post-id') || component.getAttribute('data-id');
        if (postId && postId !== '0') {
            console.log('🎯 ROOT FIX: Post ID from component:', postId);
            return postId;
        }
    }
    
    // Method 4: Global guestify data
    if (window.guestifyData && window.guestifyData.postId) {
        postId = window.guestifyData.postId;
        console.log('🎯 ROOT FIX: Post ID from guestifyData:', postId);
        return postId;
    }
    
    // Method 5: WordPress admin context
    if (window.location.href.includes('wp-admin')) {
        const adminMatch = window.location.href.match(/[?&]post=([0-9]+)/);
        if (adminMatch) {
            postId = adminMatch[1];
            console.log('🎯 ROOT FIX: Post ID from admin URL:', postId);
            return postId;
        }
    }
    
    // Method 6: Body class detection (WordPress often adds post-id-123 classes)
    const bodyClasses = document.body.className;
    const postIdMatch = bodyClasses.match(/post-id-([0-9]+)/);
    if (postIdMatch) {
        postId = postIdMatch[1];
        console.log('🎯 ROOT FIX: Post ID from body class:', postId);
        return postId;
    }
    
    // Method 7: Check for WordPress REST API context
    if (window.wp && window.wp.api && window.wp.api.models && window.wp.api.models.Post) {
        // This is a more advanced detection for WordPress REST API contexts
        try {
            const currentPost = window.wp.api.models.Post.prototype.get('id');
            if (currentPost) {
                postId = currentPost;
                console.log('🎯 ROOT FIX: Post ID from WP API:', postId);
                return postId;
            }
        } catch (e) {
            // REST API not available or accessible
        }
    }
    
    // Method 8: Fallback to test post ID for development
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') || window.location.hostname.includes('.local')) {
        const testPostId = '32372'; // Your test post ID
        console.log('🎯 ROOT FIX: Using test post ID for development:', testPostId);
        return testPostId;
    }
    
    console.log('⚠️ ROOT FIX: No post ID detected from any method');
    return null;
}
    
    // ROOT FIX: Add component re-render function
    function triggerComponentReRender(topicsData, postId) {
        console.log('🔄 ROOT FIX: Attempting to re-render component with fresh data');
        
        const component = document.querySelector('.editable-element[data-component="topics"]');
        const topicsContainer = component?.querySelector('.topics-container');
        
        if (!component || !topicsContainer) {
            console.warn('⚠️ Component or container not found for re-render');
            return;
        }
        
        // ROOT FIX: Update data attributes with fresh values
        topicsContainer.setAttribute('data-has-dynamic-topics', 'true');
        topicsContainer.setAttribute('data-post-id', postId);
        topicsContainer.setAttribute('data-topics-source', 'ajax_loaded');
        topicsContainer.setAttribute('data-topics-count', Object.keys(topicsData).length);
        
        console.log('✅ ROOT FIX: Updated component data attributes');
        
        // Clear and rebuild topics
        topicsContainer.innerHTML = '';
        
        Object.entries(topicsData).forEach(([key, value], index) => {
            if (value && value.trim()) {
                const topicElement = createTopicElementFromData(value, index, 'ajax_loaded', key);
                topicsContainer.appendChild(topicElement);
            }
        });
        
        console.log('✅ ROOT FIX: Component re-rendered with', Object.keys(topicsData).length, 'topics');
        
        // Show success notification
        showTopicsLoadedMessage(Object.keys(topicsData).length);
        
        // Refresh the panel if it's open
        setTimeout(() => {
            loadExistingTopics();
        }, 500);
    }
    
    // ROOT FIX: Create topic element from loaded data
    function createTopicElementFromData(title, index, source, metaKey) {
        const topicDiv = document.createElement('div');
        topicDiv.className = 'topic-item';
        topicDiv.setAttribute('data-topic-index', index);
        topicDiv.setAttribute('data-topic-id', `topics_topic_${index}`);
        topicDiv.setAttribute('data-topic-source', source);
        topicDiv.setAttribute('data-meta-key', metaKey);
        
        topicDiv.innerHTML = `
            <div class="topic-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
            </div>
            <div class="topic-content">
                <div class="topic-title">${escapeHtml(title)}</div>
            </div>
        `;
        
        return topicDiv;
    }
    
    function updateTopicsUI(data) {
        try {
            if (!data || !data.topics) {
                return;
            }
            
            console.log('🎨 Updating topics UI with loaded data...');
            
            // Show success message if topics found
            const topicsCount = Object.keys(data.topics).length;
            if (topicsCount > 0) {
                showTopicsLoadedMessage(topicsCount);
            }
            
        } catch (error) {
            console.error('❌ Error updating topics UI:', error);
        }
    }
    
    // ROOT FIX: Show component reload option when post ID is detected by JavaScript
    function showComponentReloadOption(postId) {
        const component = document.querySelector('.editable-element[data-component="topics"]');
        if (!component) return;
        
        // Remove existing reload option
        const existingReload = component.querySelector('.topics-reload-option');
        if (existingReload) {
            existingReload.remove();
        }
        
        // Create reload option
        const reloadDiv = document.createElement('div');
        reloadDiv.className = 'topics-reload-option';
        reloadDiv.innerHTML = `
            <div style="
                background: #e3f2fd;
                border: 1px solid #2196f3;
                border-radius: 6px;
                padding: 12px;
                margin: 10px;
                text-align: center;
                font-size: 14px;
                color: #1976d2;
            ">
                <div style="margin-bottom: 8px; font-weight: 500;">
                    🔄 Post ID ${postId} detected!
                </div>
                <div style="margin-bottom: 10px; font-size: 12px; opacity: 0.8;">
                    Click to load your topics from this post
                </div>
                <button class="topics-reload-btn" style="
                    background: #2196f3;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                ">
                    Load Topics Now
                </button>
            </div>
        `;
        
        // Add click handler
        const reloadBtn = reloadDiv.querySelector('.topics-reload-btn');
        reloadBtn.addEventListener('click', () => {
            console.log('🔄 ROOT FIX: Manual reload requested for post:', postId);
            reloadBtn.textContent = 'Loading...';
            reloadBtn.disabled = true;
            
            if (window.topicsPanel && window.topicsPanel.loadStoredTopicsData) {
                window.topicsPanel.loadStoredTopicsData(postId)
                    .then(data => {
                        console.log('✅ ROOT FIX: Manual reload successful!');
                        hideComponentReloadOption();
                    })
                    .catch(error => {
                        console.error('❌ ROOT FIX: Manual reload failed:', error);
                        reloadBtn.textContent = 'Retry';
                        reloadBtn.disabled = false;
                    });
            }
        });
        
        // Insert at the top of the component
        component.insertBefore(reloadDiv, component.firstChild);
        
        console.log('🔄 ROOT FIX: Reload option shown for post:', postId);
    }
    
    function hideComponentReloadOption() {
        const reloadOption = document.querySelector('.topics-reload-option');
        if (reloadOption) {
            reloadOption.style.opacity = '0';
            reloadOption.style.transition = 'opacity 0.3s ease-out';
            
            setTimeout(() => {
                if (reloadOption.parentNode) {
                    reloadOption.parentNode.removeChild(reloadOption);
                }
            }, 300);
            
            console.log('✅ ROOT FIX: Reload option hidden');
        }
    }
    
    function showTopicsLoadedMessage(count) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        notification.textContent = `✅ ${count} topics loaded from post data!`;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // ROOT FIX: Component loading indicators
    function showComponentLoadingIndicator() {
        const component = document.querySelector('.editable-element[data-component="topics"]');
        if (!component) return;
        
        // Remove existing indicator
        const existingIndicator = component.querySelector('.topics-loading-overlay');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'topics-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">🔄 Refreshing topics from post data...</div>
            </div>
        `;
        
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: 8px;
        `;
        
        // Style the loading content
        const style = document.createElement('style');
        style.textContent = `
            .loading-content {
                text-align: center;
                color: #6b7280;
            }
            .loading-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid #e5e7eb;
                border-top: 3px solid #10b981;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 12px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .loading-text {
                font-size: 14px;
                font-weight: 500;
            }
        `;
        
        if (!document.getElementById('topics-loading-styles')) {
            style.id = 'topics-loading-styles';
            document.head.appendChild(style);
        }
        
        // Ensure component has relative positioning
        component.style.position = 'relative';
        component.appendChild(loadingOverlay);
        
        console.log('🔄 ROOT FIX: Loading indicator shown');
    }
    
    function hideComponentLoadingIndicator() {
        const loadingOverlay = document.querySelector('.topics-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.transition = 'opacity 0.3s ease-out';
            
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
            }, 300);
            
            console.log('✅ ROOT FIX: Loading indicator hidden');
        }
    }
    
})();

console.log('📝 Topics Panel Script: Core emergency functions loaded');

// =================================================================================
// ORIGINAL PANEL FUNCTIONALITY (Enhanced with error recovery)
// =================================================================================

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
 * ROOT FIX: Enhanced with proper event triggering and preview updates
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
    
    // ROOT FIX: Enhanced live update listener with immediate preview updates
    input.addEventListener('input', debounce(() => {
        const previewElement = element.querySelector(selector);
        if (previewElement) {
            previewElement.textContent = input.value;
            
            // ROOT FIX: Trigger both component update AND enhanced preview update
            triggerComponentUpdate(element);
            triggerEnhancedComponentUpdate(element);
            
            console.log(`🎨 ROOT FIX: Text control "${property}" updated to: "${input.value}"`);
        }
    }, 150)); // ROOT FIX: Reduced debounce for more responsive updates
}

/**
 * Setup color picker with live preview
 * ROOT FIX: Enhanced with immediate updates and better event handling
 * @param {HTMLElement} element The component element
 */
function setupColorPicker(element) {
    const colorInput = document.querySelector('[data-property="topicColor"]');
    const textInput = colorInput?.nextElementSibling;
    
    if (!colorInput || !textInput) return;
    
    // ROOT FIX: Enhanced color input with immediate preview updates
    colorInput.addEventListener('input', () => {
        console.log('🎨 ROOT FIX: Color picker changed to:', colorInput.value);
        textInput.value = colorInput.value;
        applyColorToComponent(element, colorInput.value);
        
        // ROOT FIX: Trigger both update types for immediate response
        triggerComponentUpdate(element);
        triggerEnhancedComponentUpdate(element);
    });
    
    // ROOT FIX: Enhanced text input with validation and immediate updates
    textInput.addEventListener('input', () => {
        if (isValidHexColor(textInput.value)) {
            console.log('🎨 ROOT FIX: Color text input changed to:', textInput.value);
            colorInput.value = textInput.value;
            applyColorToComponent(element, textInput.value);
            
            // ROOT FIX: Trigger both update types for immediate response
            triggerComponentUpdate(element);
            triggerEnhancedComponentUpdate(element);
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
 * ROOT FIX: Enhanced with immediate updates and better logging
 * @param {HTMLElement} element The component element
 */
function setupCheckboxControls(element) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][data-property]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const property = checkbox.dataset.property;
            const attributeName = `data-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            
            console.log(`✅ ROOT FIX: Checkbox "${property}" changed to:`, checkbox.checked);
            
            element.setAttribute(attributeName, checkbox.checked);
            
            // ROOT FIX: Trigger both update types for immediate response
            triggerComponentUpdate(element);
            triggerEnhancedComponentUpdate(element);
            
            // ROOT FIX: Also trigger preview update for immediate visual feedback
            updateComponentPreview();
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
 * ROOT FIX: Enhanced with immediate preview updates and better event handling
 * @param {HTMLElement} item The topic item element
 * @param {number} index The topic index
 */
function setupTopicItemEvents(item, index) {
    // ROOT FIX: Enhanced input change listeners with immediate preview updates
    const inputs = item.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(() => {
            console.log(`📝 ROOT FIX: Topic ${index + 1} input changed:`, {
                type: input.type || input.tagName.toLowerCase(),
                value: input.value,
                dataAttribute: input.getAttribute('data-topic-title') || input.getAttribute('data-topic-description') || input.getAttribute('data-topic-icon')
            });
            
            // ROOT FIX: Immediate preview update
            updateComponentPreview();
            
            // ROOT FIX: Also trigger enhanced component events for state synchronization
            const component = document.querySelector('.editable-element[data-component="topics"]');
            if (component) {
                triggerEnhancedComponentUpdate(component);
            }
        }, 100)); // ROOT FIX: Reduced debounce for more responsive topic updates
        
        // ROOT FIX: Also listen for 'change' events for select dropdowns
        input.addEventListener('change', () => {
            console.log(`🔄 ROOT FIX: Topic ${index + 1} selection changed:`, input.value);
            updateComponentPreview();
        });
    });
    
    // Remove button listener
    const removeBtn = item.querySelector('.remove-item-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            console.log(`🗑️ ROOT FIX: Removing topic ${index + 1}`);
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
 * ROOT FIX: Load existing topics from component with dynamic data support
 */
function loadExistingTopics() {
    const component = document.querySelector('.editable-element[data-component="topics"]');
    if (!component) return;
    
    const existingTopics = component.querySelectorAll('.topic-item');
    const topicsContainer = component.querySelector('.topics-container');
    
    // ROOT FIX: Check if we have dynamic topics from MKCG
    const hasDynamicTopics = topicsContainer?.getAttribute('data-has-dynamic-topics') === 'true';
    const postId = topicsContainer?.getAttribute('data-post-id');
    const topicsSource = topicsContainer?.getAttribute('data-topics-source');
    
    console.log('🎯 Loading topics:', {
        existingCount: existingTopics.length,
        hasDynamicTopics,
        postId,
        source: topicsSource
    });
    
    if (existingTopics.length > 0) {
        // Load from existing component
        existingTopics.forEach((topicEl, index) => {
            const title = topicEl.querySelector('.topic-title')?.textContent || '';
            const description = topicEl.querySelector('.topic-description')?.textContent || '';
            const source = topicEl.getAttribute('data-topic-source') || 'unknown';
            const metaKey = topicEl.getAttribute('data-meta-key');
            
            // ROOT FIX: Skip any placeholder topics completely
            if (source === 'placeholder') {
                console.log('🚫 ROOT FIX: Skipping placeholder topic:', title);
                return;
            }
            
            const topicItem = createTopicEditorItem(title, description, index);
            
            // ROOT FIX: Add source indicator to editor item
            if (source === 'mkcg' && metaKey) {
                const sourceIndicator = document.createElement('div');
                sourceIndicator.className = 'topic-source-badge';
                sourceIndicator.innerHTML = `
                    <span class="source-icon">⚡</span>
                    <span class="source-text">MKCG: ${metaKey}</span>
                `;
                sourceIndicator.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    color: #10b981;
                    background: #f0fdf4;
                    padding: 2px 6px;
                    border-radius: 3px;
                    margin-top: 4px;
                `;
                topicItem.appendChild(sourceIndicator);
            }
            
            const topicsList = document.getElementById('design-topics-list');
            if (topicsList) {
                topicsList.appendChild(topicItem);
                topicCount++;
            }
        });
        
        // ROOT FIX: Show dynamic data info if available
        if (hasDynamicTopics && postId) {
            showDynamicDataInfo(postId, topicsSource, existingTopics.length);
        }
        
    } else {
    // ROOT FIX: NEVER create placeholder topics - show empty editor instead
    console.log('🚫 ROOT FIX: No existing topics found - showing empty editor (NO PLACEHOLDERS)');
    
    // Show helpful message instead of creating placeholder topics
    const topicsList = document.getElementById('design-topics-list');
    if (topicsList) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'topics-empty-state';
    emptyMessage.innerHTML = `
    <div style="
    text-align: center;
    padding: 20px;
    color: #6b7280;
    font-style: italic;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    background: #f9fafb;
    ">
    <div style="margin-bottom: 8px;">📝</div>
    <div>Click "Add Topic" to get started</div>
        <div style="font-size: 12px; margin-top: 4px; opacity: 0.7;">Only real topics will be shown - no placeholder content</div>
        </div>
        `;
    topicsList.appendChild(emptyMessage);
    }
    }
    
    updateTopicsCounter();
    updateClearButtonVisibility();
}

/**
 * ROOT FIX: REMOVED - No longer create default/placeholder topics
 * This function has been disabled to prevent placeholder content
 */
function createDefaultTopics() {
    console.log('🚫 ROOT FIX: createDefaultTopics() called but DISABLED - no placeholder topics will be created');
    // Function disabled - we only show real topics now
    return;
}

/**
 * ROOT FIX: Show dynamic data information
 */
function showDynamicDataInfo(postId, source, topicCount) {
    const topicsList = document.getElementById('design-topics-list');
    if (!topicsList) return;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'dynamic-data-info';
    infoDiv.innerHTML = `
        <div style="
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 12px;
            font-size: 12px;
            color: #0284c7;
        ">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 14px;">🔗</span>
                <strong>Dynamic Topics Loaded</strong>
            </div>
            <div>Post ID: ${postId} | Source: ${source.toUpperCase()} | Topics: ${topicCount}</div>
            <div style="margin-top: 4px; font-size: 11px; opacity: 0.8;">
                These topics are automatically loaded from your custom post data.
            </div>
        </div>
    `;
    
    topicsList.insertBefore(infoDiv, topicsList.firstChild);
}

/**
 * ROOT FIX: Show loading message
 */
function showLoadingMessage(message) {
    const topicsList = document.getElementById('design-topics-list');
    if (!topicsList) return;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'topics-loading-message';
    loadingDiv.innerHTML = `
        <div style="
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-style: italic;
        ">
            <div style="margin-bottom: 8px;">⏳</div>
            <div>${message}</div>
        </div>
    `;
    
    topicsList.appendChild(loadingDiv);
}

/**
 * ROOT FIX: Hide loading message
 */
function hideLoadingMessage() {
    const loadingMessage = document.getElementById('topics-loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
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
    
    // ROOT FIX: Enhanced display style selector with immediate updates
    const displayStyleSelect = document.querySelector('[data-property="displayStyle"]');
    if (displayStyleSelect) {
        displayStyleSelect.addEventListener('change', () => {
            const style = displayStyleSelect.value;
            console.log('🎨 ROOT FIX: Display style changed to:', style);
            
            element.setAttribute('data-display-style', style);
            updateColumnsVisibility(style);
            
            // ROOT FIX: Trigger all update types for immediate response
            triggerComponentUpdate(element);
            triggerEnhancedComponentUpdate(element);
            updateComponentPreview();
        });
        
        // Initialize
        updateColumnsVisibility(displayStyleSelect.value);
    }
    
    // ROOT FIX: Enhanced columns selector with immediate updates
    const columnsSelect = document.querySelector('[data-property="columns"]');
    if (columnsSelect) {
        columnsSelect.addEventListener('change', () => {
            console.log('📊 ROOT FIX: Columns changed to:', columnsSelect.value);
            
            element.style.setProperty('--topic-columns', columnsSelect.value);
            element.setAttribute('data-columns', columnsSelect.value);
            
            // ROOT FIX: Trigger all update types for immediate response
            triggerComponentUpdate(element);
            triggerEnhancedComponentUpdate(element);
            updateComponentPreview();
        });
    }
    
    // ROOT FIX: Enhanced other selects with immediate updates
    const selects = document.querySelectorAll('select[data-property]');
    selects.forEach(select => {
        if (select !== displayStyleSelect && select !== columnsSelect) {
            select.addEventListener('change', () => {
                const property = select.dataset.property;
                const attributeName = `data-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                
                console.log(`🔄 ROOT FIX: Select "${property}" changed to:`, select.value);
                
                element.setAttribute(attributeName, select.value);
                
                // ROOT FIX: Trigger all update types for immediate response
                triggerComponentUpdate(element);
                triggerEnhancedComponentUpdate(element);
                updateComponentPreview();
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
 * ROOT FIX: Enhanced component preview update with real-time sync
 * Fixes live preview not updating when design panel values change
 */
function updateComponentPreview() {
    console.log('🎨 ROOT FIX: Updating component preview...');
    
    const component = document.querySelector('.editable-element[data-component="topics"]');
    if (!component) {
        console.warn('⚠️ ROOT FIX: Component not found for preview update');
        return;
    }

    const topicsContainer = component.querySelector('.topics-container');
    if (!topicsContainer) {
        console.warn('⚠️ ROOT FIX: Topics container not found');
        return;
    }

    // ROOT FIX: Preserve dynamic data attributes
    const hasLoadedData = topicsContainer.getAttribute('data-has-dynamic-topics') === 'true';
    const postId = topicsContainer.getAttribute('data-post-id');
    const dataSource = topicsContainer.getAttribute('data-topics-source');
    
    console.log('🔍 ROOT FIX: Component state before update:', {
        hasLoadedData,
        postId,
        dataSource,
        currentTopicsCount: topicsContainer.children.length
    });

    // ROOT FIX: Clear existing topics but preserve container attributes
    const currentAttributes = {
        'data-has-dynamic-topics': topicsContainer.getAttribute('data-has-dynamic-topics'),
        'data-post-id': topicsContainer.getAttribute('data-post-id'),
        'data-topics-source': topicsContainer.getAttribute('data-topics-source'),
        'data-topics-count': topicsContainer.getAttribute('data-topics-count')
    };
    
    topicsContainer.innerHTML = '';
    
    // ROOT FIX: Restore preserved attributes
    Object.entries(currentAttributes).forEach(([attr, value]) => {
        if (value) {
            topicsContainer.setAttribute(attr, value);
        }
    });

    // Get all topic items from editor
    const topicItems = document.querySelectorAll('.topic-editor-item');
    let updatedTopicsCount = 0;
    
    console.log(`🎯 ROOT FIX: Processing ${topicItems.length} topic items from editor`);

    topicItems.forEach((item, index) => {
        const titleInput = item.querySelector(`[data-topic-title="${index}"]`);
        const descInput = item.querySelector(`[data-topic-description="${index}"]`);
        const iconSelect = item.querySelector(`[data-topic-icon="${index}"]`);

        const title = titleInput?.value.trim();
        const description = descInput?.value.trim();
        const iconType = iconSelect?.value || 'check';
        
        console.log(`📝 ROOT FIX: Topic ${index + 1}:`, {
            title: title || '(empty)',
            description: description || '(empty)',
            iconType,
            hasTitle: !!title
        });

        if (title) {
            const topicElement = createTopicPreviewElement(title, description, iconType, index);
            
            // ROOT FIX: Add enhanced attributes for tracking
            topicElement.setAttribute('data-topic-index', index);
            topicElement.setAttribute('data-topic-source', 'design_panel');
            topicElement.setAttribute('data-topic-id', `topics_topic_${index}`);
            
            topicsContainer.appendChild(topicElement);
            updatedTopicsCount++;
            
            console.log(`✅ ROOT FIX: Added topic ${index + 1} to preview: "${title}"`);
        } else {
            console.log(`⏭️ ROOT FIX: Skipping empty topic ${index + 1}`);
        }
    });
    
    // ROOT FIX: Update topics count attribute
    topicsContainer.setAttribute('data-topics-count', updatedTopicsCount);
    
    console.log(`✅ ROOT FIX: Component preview updated with ${updatedTopicsCount} topics`);
    
    // ROOT FIX: Trigger enhanced component update event
    triggerEnhancedComponentUpdate(component);
    
    // ROOT FIX: Show update notification for user feedback
    if (updatedTopicsCount > 0) {
        showPreviewUpdateNotification(updatedTopicsCount);
    }
}

/**
 * Create a topic preview element
 * ROOT FIX: Enhanced with index parameter and better error handling
 * @param {string} title The topic title
 * @param {string} description The topic description
 * @param {string} iconType The icon type
 * @param {number} index The topic index (optional)
 * @returns {HTMLElement} The topic element
 */
function createTopicPreviewElement(title, description, iconType, index = 0) {
    const topicDiv = document.createElement('div');
    topicDiv.className = 'topic-item';
    
    // ROOT FIX: Add data attributes for tracking
    topicDiv.setAttribute('data-topic-preview-index', index);
    topicDiv.setAttribute('data-topic-title', title);
    
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
 * ROOT FIX: Trigger component update event (was missing)
 * @param {HTMLElement} element The component element
 */
function triggerComponentUpdate(element) {
    if (!element) return;
    
    console.log('🔄 ROOT FIX: Triggering component update event');
    
    // Create and dispatch component update event
    const updateEvent = new CustomEvent('componentUpdated', {
        bubbles: true,
        detail: {
            componentType: 'topics',
            element: element,
            timestamp: Date.now()
        }
    });
    
    element.dispatchEvent(updateEvent);
    
    // Also dispatch on document for global listeners
    document.dispatchEvent(new CustomEvent('topicsComponentChanged', {
        bubbles: true,
        detail: {
            element: element,
            timestamp: Date.now()
        }
    }));
}

/**
 * ROOT FIX: Enhanced component update event with state tracking
 * @param {HTMLElement} element The component element
 */
function triggerEnhancedComponentUpdate(element) {
    console.log('🔄 ROOT FIX: Triggering enhanced component update...');
    
    // Original component update
    triggerComponentUpdate(element);
    
    // ROOT FIX: Add custom component updated event
    const customEvent = new CustomEvent('topicsComponentUpdated', {
        bubbles: true,
        detail: {
            componentType: 'topics',
            timestamp: Date.now(),
            updateSource: 'design_panel',
            topicsCount: element.querySelector('.topics-container')?.children.length || 0
        }
    });
    
    element.dispatchEvent(customEvent);
    console.log('✅ ROOT FIX: Enhanced component update event dispatched');
}

/**
 * ROOT FIX: Show preview update notification for user feedback
 * @param {number} topicsCount Number of topics updated
 */
function showPreviewUpdateNotification(topicsCount) {
    // Create subtle notification
    const notification = document.createElement('div');
    notification.className = 'topics-preview-update-notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    notification.textContent = `✨ Preview updated (${topicsCount} topics)`;
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 1500);
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
    showNotification: showNotification,
    // ROOT FIX: Include the loadStoredTopicsData function that was missing
    loadStoredTopicsData: function(postId) {
        console.log('📥 ROOT FIX: Loading stored topics data for post:', postId);
        
        // Get post ID from parameter or detect automatically
        const targetPostId = postId || detectPostId();
        
        if (!targetPostId) {
            console.warn('⚠️ No post ID available for loading topics');
            return Promise.reject('No post ID');
        }
        
        // Get AJAX data
        const ajaxUrl = window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php';
        const nonce = window.guestifyData?.nonce || '';
        
        if (!nonce) {
            console.error('❌ No nonce available for AJAX request');
            return Promise.reject('No nonce');
        }
        
        const formData = new FormData();
        formData.append('action', 'load_stored_topics');
        formData.append('nonce', nonce);
        formData.append('post_id', targetPostId);
        
        console.log('📡 ROOT FIX: Making AJAX request to load topics for post:', targetPostId);
        
        return fetch(ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                console.log('📊 ROOT FIX: Parsed AJAX data:', data);
                
                if (data.success) {
                    console.log('✅ ROOT FIX: Topics data loaded successfully!');
                    window.storedTopicsData = data;
                    
                    // ROOT FIX: Trigger component re-render with loaded data
                    if (data.data && data.data.topics) {
                        const component = document.querySelector('.editable-element[data-component="topics"]');
                        const topicsContainer = component?.querySelector('.topics-container');
                        
                        if (component && topicsContainer) {
                            // Update data attributes with fresh values
                            topicsContainer.setAttribute('data-has-dynamic-topics', 'true');
                            topicsContainer.setAttribute('data-post-id', targetPostId);
                            topicsContainer.setAttribute('data-topics-source', 'ajax_loaded');
                            topicsContainer.setAttribute('data-topics-count', Object.keys(data.data.topics).length);
                            
                            // Clear and rebuild topics
                            topicsContainer.innerHTML = '';
                            
                            // ROOT FIX: Enhanced topic processing with proper type checking
                            Object.entries(data.data.topics).forEach(([key, value], index) => {
                                let topicTitle = '';
                                let topicMetadata = {};
                                
                                // ROOT FIX: Handle both simple strings and complex objects
                                if (typeof value === 'string') {
                                    topicTitle = value;
                                    // Check for enhanced metadata if available
                                    if (data.data.metadata && data.data.metadata[key]) {
                                        topicMetadata = data.data.metadata[key];
                                    }
                                } else if (typeof value === 'object' && value !== null) {
                                    // Handle legacy object format
                                    topicTitle = value.value || value.title || String(value);
                                    topicMetadata = {
                                        quality: value.quality || 0,
                                        data_source: value.data_source || 'unknown',
                                        meta_key: value.meta_key || key
                                    };
                                } else {
                                    // Fallback for unexpected data types
                                    topicTitle = String(value || '');
                                }
                                
                                // ROOT FIX: Only process non-empty topics with proper validation
                                if (topicTitle && topicTitle.trim() && topicTitle.trim().length > 0) {
                                    const sanitizedTitle = escapeHtml(topicTitle.trim());
                                    
                                    const topicDiv = document.createElement('div');
                                    topicDiv.className = 'topic-item';
                                    topicDiv.setAttribute('data-topic-index', index);
                                    topicDiv.setAttribute('data-topic-source', data.data.data_format === 'javascript_compatible' ? 'ajax_loaded_enhanced' : 'ajax_loaded');
                                    topicDiv.setAttribute('data-meta-key', key);
                                    
                                    // ROOT FIX: Add enhanced metadata attributes if available
                                    if (topicMetadata.quality) {
                                        topicDiv.setAttribute('data-topic-quality', topicMetadata.quality);
                                    }
                                    if (topicMetadata.data_source) {
                                        topicDiv.setAttribute('data-topic-data-source', topicMetadata.data_source);
                                    }
                                    
                                    topicDiv.innerHTML = `
                                        <div class="topic-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                            </svg>
                                        </div>
                                        <div class="topic-content">
                                            <div class="topic-title">${sanitizedTitle}</div>
                                        </div>
                                    `;
                                    
                                    topicsContainer.appendChild(topicDiv);
                                } else {
                                    console.log(`🔍 ROOT FIX: Skipping empty/invalid topic at key '${key}':`, value);
                                }
                            });
                            
                            console.log('✅ ROOT FIX: Component re-rendered with', Object.keys(data.data.topics).length, 'topics');
                            
                            // Show success notification
                            const notification = document.createElement('div');
                            notification.style.cssText = `
                                position: fixed;
                                top: 20px;
                                right: 20px;
                                background: #10b981;
                                color: white;
                                padding: 12px 20px;
                                border-radius: 6px;
                                z-index: 10000;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                font-size: 14px;
                                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                            `;
                            notification.textContent = `✅ ROOT FIX: ${Object.keys(data.data.topics).length} topics loaded!`;
                            document.body.appendChild(notification);
                            setTimeout(() => notification.remove(), 3000);
                        }
                    }
                    
                    return data;
                } else {
                    console.error('❌ ROOT FIX: AJAX call failed:', data.data);
                    return Promise.reject(data.data || 'Unknown error');
                }
            } catch (parseError) {
                console.error('❌ ROOT FIX: Failed to parse AJAX response:', parseError);
                return Promise.reject('Invalid JSON response');
            }
        })
        .catch(error => {
            console.error('❌ ROOT FIX: AJAX request failed:', error);
            return Promise.reject(error);
        });
    },
    version: 'root-fix-complete'
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
