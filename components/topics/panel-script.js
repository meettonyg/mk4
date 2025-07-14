// panel-script.js

// =================================================================================
// MAIN INITIALIZATION - A single, robust entry point for the panel.
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    const componentElement = document.querySelector('.editable-element[data-component="topics"]');
    if (componentElement) {
        initializeTopicsPanel(componentElement);
    } else {
        console.error('Topics component element not found on the page.');
    }
});

/**
 * Main orchestrator for the topics panel. It ensures a stable,
 * predictable loading sequence using async/await.
 * @param {HTMLElement} element - The main component element.
 */
async function initializeTopicsPanel(element) {
    console.log('🚀 [1/4] Topics Panel Initialization Started');

    try {
        // --- Step 1: Instantiate MKCG Integration (if available) ---
        if (window.TopicsMKCGIntegration) {
            window.topicsMkcgIntegration = new window.TopicsMKCGIntegration(element, document.querySelector('.element-editor'));
            console.log('✅ [2/4] MKCG Integration class instantiated.');
        }

        // --- Step 2: Fetch Data from Server (handles all cases gracefully) ---
        const storedData = await loadStoredTopicsData();
        window.storedTopicsData = storedData; // Make data globally available

        if (storedData) {
            console.log('✅ [3/4] Server data fetched and ready.', storedData);
        } else {
            console.warn('📝 [3/4] No stored data found. Panel will load in a manual/empty state.');
        }

        // --- Step 3: Populate the Panel and Initialize Controls (Guaranteed to Run) ---
        // GEMINI'S UNIFIED FIX: Single function that guarantees 5 topic fields are always created
        populateAndInitializePanel(element, storedData);
        console.log('✅ [4/4] Panel UI is fully initialized and populated.');

    } catch (error) {
        console.error('❌ FATAL: A critical error occurred during panel setup.', error);
        showDataLoadingStatus('A critical error prevented the panel from loading.', 'error');
    }
}

// =================================================================================
// DATA & UI POPULATION - The core corrected logic.
// =================================================================================

/**
 * Fetches data and returns a promise that always resolves with data or null.
 */
function loadStoredTopicsData() {
    return new Promise((resolve) => {
        const postId = getPostIdForDataLoading();
        if (!postId) {
            showDataLoadingStatus('No Post ID found. Ready for new entry.', 'info');
            return resolve(null);
        }

        showDataLoadingStatus('Loading stored topics...', 'loading');
        const ajaxUrl = window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php';
        const nonce = window.guestifyData?.nonce;

        if (!nonce) {
            console.error("CRITICAL: AJAX Nonce is missing.");
            showDataLoadingStatus('Security nonce missing. Cannot fetch data.', 'error');
            return resolve(null);
        }

        const requestData = new URLSearchParams({ action: 'load_stored_topics', post_id: postId, nonce: nonce });

        fetch(ajaxUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: requestData })
            .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
            .then(data => {
                if (data.success && data.data) {
                    showDataLoadingStatus('Data loaded successfully!', 'success');
                    resolve(data.data);
                } else {
                    const serverMessage = data.data?.message || "Server returned an error.";
                    console.error('Server-side error:', serverMessage, data.data?.debug || '');
                    showDataLoadingStatus(`Failed to load data: ${serverMessage}`, 'error');
                    resolve(null);
                }
            })
            .catch(error => {
                console.error('A network or fetch error occurred:', error);
                showDataLoadingStatus(`Network error: ${error.message}`, 'error');
                resolve(null);
            });
    });
}

/**
 * GEMINI'S UNIFIED UI POPULATION FIX
 * 
 * A single, unified function that GUARANTEES 5 topic fields are always created.
 * This eliminates race conditions and scattered function calls that were causing
 * the missing topic input fields issue.
 * 
 * @param {HTMLElement} element - The main component element.
 * @param {Object|null} storedData - The data from the server, or null.
 */
function populateAndInitializePanel(element, storedData) {
    console.log('🚀 GEMINI\'S UNIFIED FIX: Starting guaranteed 5-field creation...');
    
    try {
        // STEP 1: Verify DOM structure exists
        const topicsListContainer = document.getElementById('design-topics-list');
        if (!topicsListContainer) {
            console.error('❌ CRITICAL: #design-topics-list container not found in DOM');
            showDataLoadingStatus('Panel container missing - cannot create topic fields', 'error');
            return;
        }
        
        // STEP 2: Clear container to ensure clean state
        topicsListContainer.innerHTML = '';
        console.log('🧹 Container cleared for fresh field creation');
        
        // STEP 3: GUARANTEED FIELD CREATION - Always create exactly 5 topic fields
        console.log('🎨 GUARANTEED: Creating exactly 5 topic input fields...');
        
        for (let i = 0; i < 5; i++) {
            let topicTitle = '';
            let topicDescription = '';
            let topicIcon = 'check';
            
            // If we have stored data, try to populate this field
            if (storedData && storedData.topics) {
                const topicKey = `topic_${i + 1}`;
                const topicData = storedData.topics[topicKey];
                
                if (topicData && !topicData.is_empty) {
                    topicTitle = topicData.value || '';
                    console.log(`📊 Populating field ${i + 1} with stored data: "${topicTitle}"`);
                } else {
                    console.log(`📝 Creating empty field ${i + 1} for manual entry`);
                }
            } else {
                console.log(`📝 Creating empty field ${i + 1} (no stored data available)`);
            }
            
            // GUARANTEED: Create the topic field regardless of data availability
            const fieldCreated = createTopicField(i, topicTitle, topicDescription, topicIcon, topicsListContainer);
            
            if (!fieldCreated) {
                console.error(`❌ Failed to create topic field ${i + 1}`);
                showDataLoadingStatus(`Failed to create topic field ${i + 1}`, 'error');
            } else {
                console.log(`✅ Topic field ${i + 1} created successfully`);
            }
        }
        
        // STEP 4: Verify all fields were created
        const createdFields = topicsListContainer.querySelectorAll('.topic-editor-item');
        if (createdFields.length !== 5) {
            console.error(`❌ FIELD CREATION FAILED: Expected 5 fields, got ${createdFields.length}`);
            showDataLoadingStatus(`Only ${createdFields.length} of 5 topic fields created`, 'error');
        } else {
            console.log(`✅ SUCCESS: All 5 topic fields created and verified`);
            showDataLoadingStatus('All topic fields created successfully!', 'success');
        }
        
        // STEP 5: Initialize all controls and functionality
        console.log('🎯 Initializing panel controls and functionality...');
        initializePanelControls(element, storedData);
        updatePanelWithStoredData(storedData);
        setupEnhancedBulkOperations();
        
        // STEP 6: Final verification and user feedback
        const finalFieldCount = document.querySelectorAll('.topic-editor-item').length;
        console.log(`✅ GEMINI'S UNIFIED FIX COMPLETE: ${finalFieldCount} topic fields ready for use`);
        
        // Update field counter
        updateTopicFieldCounter(storedData ? (storedData.total_topics || 0) : 0);
        
    } catch (error) {
        console.error('❌ CRITICAL ERROR in unified panel population:', error);
        showDataLoadingStatus('Critical error during panel setup', 'error');
        throw error; // Re-throw to be caught by parent
    }
}

/**
 * GEMINI'S GUARANTEED FIELD CREATION FUNCTION
 * 
 * Creates a single topic field with robust error handling.
 * This function GUARANTEES field creation or provides detailed error reporting.
 * 
 * @param {number} index - Field index (0-4)
 * @param {string} title - Topic title
 * @param {string} description - Topic description  
 * @param {string} iconClass - Icon class
 * @param {HTMLElement} container - Container element
 * @returns {boolean} True if field was created successfully
 */
function createTopicField(index, title, description, iconClass, container) {
    try {
        console.log(`🔧 Creating topic field ${index + 1}: "${title || 'Empty'}"`);
        
        // Create the topic item element
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-editor-item';
        
        // Build the HTML structure
        topicItem.innerHTML = `
            <div class="topic-editor-header">
                <div class="topic-number">#${index + 1}</div>
                <button class="remove-item-btn" title="Remove topic">×</button>
            </div>
            <div class="form-group">
                <label class="form-label">Topic Title</label>
                <input type="text" class="form-input" value="${escapeHtml(title || '')}" data-topic-title="${index}" placeholder="Enter topic ${index + 1}...">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input form-textarea" rows="2" data-topic-description="${index}" placeholder="Describe this topic...">${escapeHtml(description || '')}</textarea>
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
        
        // Add event listeners for inputs
        const inputs = topicItem.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                const component = document.querySelector('.editable-element--selected');
                if (component) {
                    updateTopicsInComponent(component);
                }
            });
            
            input.addEventListener('change', function() {
                const component = document.querySelector('.editable-element--selected');
                if (component) {
                    updateTopicsInComponent(component);
                }
            });
        });
        
        // Add remove button handler
        const removeBtn = topicItem.querySelector('.remove-item-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                topicItem.remove();
                
                // Update component and renumber remaining topics
                const component = document.querySelector('.editable-element--selected');
                if (component) {
                    updateTopicsInComponent(component);
                }
                
                // Renumber remaining topics
                const remainingItems = container.querySelectorAll('.topic-editor-item');
                remainingItems.forEach((item, idx) => {
                    const numberEl = item.querySelector('.topic-number');
                    if (numberEl) {
                        numberEl.textContent = `#${idx + 1}`;
                    }
                    
                    // Update data attributes
                    const titleInput = item.querySelector('[data-topic-title]');
                    const descInput = item.querySelector('[data-topic-description]');
                    const iconSelect = item.querySelector('[data-topic-icon]');
                    
                    if (titleInput) titleInput.setAttribute('data-topic-title', idx);
                    if (descInput) descInput.setAttribute('data-topic-description', idx);
                    if (iconSelect) iconSelect.setAttribute('data-topic-icon', idx);
                });
            });
        }
        
        // Add to container
        container.appendChild(topicItem);
        
        // Verify the field was added successfully
        const addedField = container.querySelector(`[data-topic-title="${index}"]`);
        if (!addedField) {
            console.error(`❌ Failed to verify topic field ${index + 1} was added to DOM`);
            return false;
        }
        
        console.log(`✅ Topic field ${index + 1} created and verified successfully`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error creating topic field ${index + 1}:`, error);
        return false;
    }
}

/**
 * Updates the data-driven sections of the panel (previews, counters).
 * Enhanced for the unified approach.
 * @param {Object|null} storedData - The data from the server, or null.
 */
function updatePanelWithStoredData(storedData) {
    try {
        const previewSection = document.getElementById('stored-topics-preview');

        if (storedData) {
            console.log('🎨 Integrating stored data into enhanced panel sections...');
            if (previewSection) {
                previewSection.style.display = 'block';
                updateStoredTopicsPreview(storedData);
            }
            updateTopicFieldCounter(storedData.total_topics || 0);
            showEnhancedControls(storedData);
        } else {
            console.log('📝 No stored data. Setting up manual entry mode.');
            if (previewSection) previewSection.style.display = 'none';
            updateTopicFieldCounter(0);
        }
    } catch (error) {
        console.error('Error updating panel with stored data:', error);
        // Don't throw - panel should still work
    }
}

// =================================================================================
// UI UTILITY FUNCTIONS (ENHANCED FOR UNIFIED APPROACH)
// =================================================================================

/**
 * LEGACY FUNCTION - Now redirects to the guaranteed field creation approach
 * Kept for backward compatibility with MKCG integration
 */
function addTopicToPanel(title, description, iconClass, index) {
    console.log(`🔄 Legacy addTopicToPanel called - redirecting to guaranteed field creation`);
    
    const topicsListContainer = document.getElementById('design-topics-list');
    if (!topicsListContainer) {
        console.error('Cannot add topic - topics list container not found');
        return null;
    }
    
    // Use the guaranteed field creation function
    const success = createTopicField(index, title, description, iconClass, topicsListContainer);
    
    if (success) {
        const createdField = topicsListContainer.querySelector(`[data-topic-title="${index}"]`);
        return createdField ? createdField.closest('.topic-editor-item') : null;
    }
    
    return null;
}

/**
 * Update topics in the component based on panel inputs
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
        
        if (titleInput && titleInput.value.trim()) {
            const topicDiv = document.createElement('div');
            topicDiv.className = 'topic-item';
            
            // Add icon if not 'none'
            const iconType = iconSelect ? iconSelect.value : 'check';
            let iconHtml = '';
            
            if (iconType !== 'none') {
                iconHtml = `<div class="topic-icon" data-icon="${iconType}">${getIconSvg(iconType)}</div>`;
            }
            
            // Get show descriptions state
            const showDescriptions = document.querySelector('[data-property="showDescriptions"]')?.checked !== false;
            
            // Build topic HTML
            topicDiv.innerHTML = `
                ${iconHtml}
                <div class="topic-content">
                    <h3 class="topic-title">${escapeHtml(titleInput.value)}</h3>
                    <div class="topic-description" style="${showDescriptions ? '' : 'display: none;'}">
                        ${escapeHtml(descInput ? descInput.value : '')}
                    </div>
                </div>
            `;
            
            topicsContainer.appendChild(topicDiv);
        }
    });
    
    // Trigger save
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
}

/**
 * Initialize panel controls - essential for panel functionality
 */
function initializePanelControls(element, storedData) {
    try {
        console.log('🎯 Initializing panel controls...');
        
        // Setup display style controls
        setupDisplayStyleControls(element);
        
        // Setup color picker
        setupColorPicker('topicColor', element, function(color) {
            element.style.setProperty('--topic-color', color);
            
            // Apply to topic elements
            const topicTitles = element.querySelectorAll('.topic-title');
            topicTitles.forEach(title => {
                title.style.color = color;
            });
        });
        
        // Setup text content updaters
        setupTextContentUpdater('title', '.topics-section-title', element);
        setupTextContentUpdater('introduction', '.topics-introduction', element);
        
        // Setup add topic button if it exists
        const addTopicBtn = document.getElementById('add-topic-btn');
        if (addTopicBtn) {
            addTopicBtn.addEventListener('click', function() {
                const topicsList = document.getElementById('design-topics-list');
                const newIndex = topicsList ? topicsList.children.length : 0;
                
                if (newIndex < 10) { // Allow up to 10 topics
                    const topicItem = addTopicToPanel('New Topic', 'Description...', 'check', newIndex);
                    
                    // Focus the topic title input
                    const input = topicItem?.querySelector('input');
                    if (input) {
                        input.focus();
                        input.select();
                    }
                    
                    updateTopicsInComponent(element);
                }
            });
        }
        
        console.log('✅ Panel controls initialized');
        
    } catch (error) {
        console.error('Error initializing panel controls:', error);
        // Don't throw - panel should still work
    }
}

/**
 * Setup display style controls
 */
function setupDisplayStyleControls(element) {
    const displayStyleSelect = document.querySelector('[data-property="displayStyle"]');
    if (displayStyleSelect) {
        const currentStyle = element.getAttribute('data-display-style') || 'list';
        displayStyleSelect.value = currentStyle;
        
        displayStyleSelect.addEventListener('change', function() {
            element.setAttribute('data-display-style', this.value);
            element.classList.remove('display--list', 'display--grid', 'display--tags', 'display--cards');
            element.classList.add('display--' + this.value);
            
            // Show/hide columns option
            const columnsGroup = document.querySelector('[data-property="columns"]')?.closest('.form-group');
            if (columnsGroup) {
                columnsGroup.style.display = (this.value === 'grid' || this.value === 'cards') ? 'block' : 'none';
            }
            
            // Trigger save
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
    }
}

/**
 * Setup enhanced bulk operations if MKCG is available
 */
function setupEnhancedBulkOperations() {
    if (window.topicsMkcgIntegration && window.topicsMkcgIntegration.isInitialized) {
        console.log('🔧 Setting up MKCG bulk operations...');
        // MKCG integration will handle its own event listeners
    } else {
        console.log('📝 MKCG not available - bulk operations disabled');
    }
}

// =================================================================================
// UTILITY FUNCTIONS
// =================================================================================

/**
 * Get post ID for data loading from multiple sources
 */
function getPostIdForDataLoading() {
    try {
        // Strategy 1: From global guestifyData
        if (window.guestifyData?.postId) {
            const postId = parseInt(window.guestifyData.postId);
            if (postId > 0) {
                console.log(`🎯 Post ID from guestifyData: ${postId}`);
                return postId;
            }
        }
        
        // Strategy 2: From URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const paramStrategies = ['post_id', 'p', 'page_id', 'post'];
        
        for (const param of paramStrategies) {
            const value = urlParams.get(param);
            if (value && !isNaN(parseInt(value))) {
                const postId = parseInt(value);
                if (postId > 0) {
                    console.log(`🎯 Post ID from URL param '${param}': ${postId}`);
                    return postId;
                }
            }
        }
        
        // Strategy 3: From WordPress admin context
        if (window.pagenow === 'post') {
            const adminPostId = document.getElementById('post_ID');
            if (adminPostId && adminPostId.value) {
                const postId = parseInt(adminPostId.value);
                if (postId > 0) {
                    console.log(`🎯 Post ID from WP admin: ${postId}`);
                    return postId;
                }
            }
        }
        
        console.log('📝 No post ID found - this is normal for new posts');
        return null;
        
    } catch (error) {
        console.error('Error in post ID detection:', error);
        return null;
    }
}

/**
 * Show data loading status with user feedback
 */
function showDataLoadingStatus(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Try to show visual feedback if status element exists
    let statusEl = document.getElementById('data-loading-status');
    if (!statusEl) {
        // Create status element if it doesn't exist
        statusEl = document.createElement('div');
        statusEl.id = 'data-loading-status';
        statusEl.className = 'data-loading-status';
        
        // Try to insert into panel
        const panel = document.querySelector('.element-editor');
        if (panel) {
            panel.insertBefore(statusEl, panel.firstElementChild);
        }
    }
    
    if (statusEl) {
        const icons = {
            loading: '⏳',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        statusEl.innerHTML = `
            <div class="status-content status-${type}">
                <span class="status-icon">${icons[type] || icons.info}</span>
                <span class="status-message">${message}</span>
            </div>
        `;
        
        statusEl.style.cssText = `
            margin: 10px 0;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            background: ${type === 'success' ? '#f0fdf4' : type === 'error' ? '#fef2f2' : type === 'warning' ? '#fffbeb' : '#f0f9ff'};
            border: 1px solid ${type === 'success' ? '#bbf7d0' : type === 'error' ? '#fecaca' : type === 'warning' ? '#fed7aa' : '#bae6fd'};
            color: ${type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : type === 'warning' ? '#92400e' : '#1e40af'};
        `;
        
        // Auto-hide success/info messages
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (statusEl && statusEl.parentNode) {
                    statusEl.style.opacity = '0';
                    setTimeout(() => {
                        if (statusEl.parentNode) statusEl.remove();
                    }, 300);
                }
            }, 3000);
        }
    }
}

/**
 * Update stored topics preview section
 */
function updateStoredTopicsPreview(storedData) {
    const dataGrid = document.getElementById('topics-data-grid');
    const totalCount = document.getElementById('total-topics-count');
    const qualityScore = document.getElementById('data-quality-score');
    const lastModified = document.getElementById('last-modified-time');
    
    if (totalCount) {
        totalCount.textContent = storedData.total_topics || 0;
    }
    
    if (qualityScore) {
        const avgScore = storedData.quality_summary?.average_score || 0;
        qualityScore.textContent = avgScore;
    }
    
    if (lastModified) {
        const lastEdit = storedData.metadata?.last_edited;
        if (lastEdit) {
            const date = new Date(lastEdit);
            lastModified.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } else {
            lastModified.textContent = 'Never';
        }
    }
    
    if (dataGrid && storedData.topics) {
        dataGrid.innerHTML = '';
        
        Object.entries(storedData.topics).forEach(([topicKey, topicData]) => {
            if (!topicData.is_empty) {
                const card = createTopicDataCard(topicKey, topicData);
                dataGrid.appendChild(card);
            }
        });
    }
}

/**
 * Create topic data card for preview
 */
function createTopicDataCard(topicKey, topicData) {
    const card = document.createElement('div');
    card.className = `topic-data-card quality-${topicData.quality_level || 'poor'}`;
    
    card.innerHTML = `
        <div class="card-header">
            <span class="topic-index">${topicData.index + 1}</span>
            <div class="card-badges">
                <span class="quality-badge">${topicData.quality || 0}%</span>
            </div>
        </div>
        <div class="card-content">
            <div class="topic-text" title="${escapeHtml(topicData.value)}">
                ${escapeHtml(topicData.value.length > 60 ? topicData.value.substring(0, 57) + '...' : topicData.value)}
            </div>
        </div>
        <div class="card-actions">
            <button class="use-topic-btn" onclick="useStoredTopic('${topicKey}')" title="Use this topic">
                Use
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Update topic field counter
 */
function updateTopicFieldCounter(totalTopics) {
    const counter = document.getElementById('topics-field-counter');
    const activeCount = document.getElementById('active-topics-count');
    
    if (counter && activeCount) {
        counter.style.display = totalTopics > 0 ? 'inline' : 'none';
        activeCount.textContent = totalTopics;
    }
}

/**
 * Show enhanced controls
 */
function showEnhancedControls(storedData) {
    const loadBtn = document.getElementById('load-stored-topics-btn');
    const populateBtn = document.getElementById('populate-fields-btn');
    
    if (storedData && storedData.total_topics > 0) {
        if (loadBtn) loadBtn.style.display = 'inline-flex';
        if (populateBtn) populateBtn.style.display = 'inline-flex';
    }
}

/**
 * Setup text content updater
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
 * Setup color picker
 */
function setupColorPicker(property, element, applyCallback) {
    const colorInput = document.querySelector(`[data-property="${property}"]`);
    const textInput = colorInput?.nextElementSibling;
    
    if (!colorInput || !textInput) return;
    
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
 * Get icon SVG based on icon type
 */
function getIconSvg(iconType) {
    switch (iconType) {
        case 'check':
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>`;
        case 'star':
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>`;
        case 'arrow':
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>`;
        case 'circle':
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
            </svg>`;
        case 'info':
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`;
        default:
            return '';
    }
}

/**
 * Escape HTML for safe insertion
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Global function for using stored topics
 */
window.useStoredTopic = function(topicKey) {
    if (!window.storedTopicsData || !window.storedTopicsData.topics[topicKey]) {
        console.warn('Stored topic not available:', topicKey);
        return;
    }
    
    const topicData = window.storedTopicsData.topics[topicKey];
    console.log('📋 Using stored topic:', topicKey, topicData.value);
    
    // Find available topic input slot
    const inputs = document.querySelectorAll('[data-topic-title]');
    for (let input of inputs) {
        if (!input.value.trim()) {
            input.value = topicData.value;
            updateTopicsInComponent(document.querySelector('.editable-element--selected'));
            showDataLoadingStatus(`Topic "${topicData.value}" added to panel`, 'success');
            break;
        }
    }
};

// Global helper function for clearing all topics (used by MKCG integration)
window.clearAllTopicsContent = function() {
    console.log('🗑️ Clearing all topics content...');
    
    for (let i = 0; i < 5; i++) {
        const titleInput = document.querySelector(`[data-topic-title="${i}"]`);
        const descInput = document.querySelector(`[data-topic-description="${i}"]`);
        const iconSelect = document.querySelector(`[data-topic-icon="${i}"]`);
        
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        if (iconSelect) iconSelect.value = 'check';
    }
    
    // Update component
    const component = document.querySelector('.editable-element--selected');
    if (component) {
        updateTopicsInComponent(component);
    }
    
    console.log('✅ All topics content cleared');
};

// Global helper function for scheduling auto-save (used by MKCG integration)
window.scheduleAutoSave = function() {
    console.log('💾 Auto-save scheduled by MKCG integration');
    // Auto-save logic can be implemented here if needed
};

console.log('✅ Topics Panel Script loaded with GEMINI\'S UNIFIED GUARANTEED FIELD CREATION APPROACH');
console.log('🎯 Panel will now GUARANTEE 5 topic input fields are always created');
