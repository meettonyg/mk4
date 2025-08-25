/**
 * Topics Component Template Matching Panel Script
 * Version 6.1.0 - Simplified to match template exactly
 * 
 * @package Guestify/Components/Topics
 * @version 6.1.0-template-match
 */

(function() {
    'use strict';
    
    // Global variables
    let draggedElement = null;
    let draggedIndex = null;
    let dropZones = [];
    
    // Smart placeholder array
    const smartPlaceholders = [
        "Enter your primary expertise area...",
        "Add your second area of expertise...", 
        "What's another topic you speak about?",
        "Share another area you're knowledgeable about...",
        "Round out your expertise with a final topic..."
    ];

    // ROOT FIX: Track initialization state per component instance - MOVED TO TOP LEVEL
    let componentInitialized = new Set();

    console.log('✅ TEMPLATE TOPICS: Panel script loaded with template matching functionality');

    // ROOT FIX: Enhanced initialization to handle dynamic design panel loading
    function initializeWhenReady() {
        console.log('✅ TEMPLATE TOPICS: Initializing template matching functionality');
        
        // ROOT FIX: Wait for design panel content to be fully loaded
        const checkForContent = () => {
            const topicInputs = document.querySelectorAll('.topics-sidebar__topic-input');
            if (topicInputs.length > 0) {
                console.log('✅ TEMPLATE TOPICS: Found ' + topicInputs.length + ' topic inputs - initializing');
                
                // Initialize core functionality only
                initializeTopicInputs();
                initializeActionButtons();
                initializePreviewSync(); // ROOT FIX: Initialize bi-directional sync
                setupAutoSaveListener(); // ROOT FIX: Listen for preview auto-save events
                
                // Auto-expand existing textareas and fix character counters
                topicInputs.forEach(input => {
                autoExpand(input);
                    updateCharacterCounter(input); // ROOT FIX: Recalculate based on actual content
                });
                
        console.log('✅ TEMPLATE TOPICS: Initialization complete with bi-directional sync and auto-save listener');
            } else {
                console.log('⏳ TEMPLATE TOPICS: No topic inputs found yet, retrying...');
                setTimeout(checkForContent, 100);
            }
        };
        
        checkForContent();
    }
    
    // ROOT FIX: CRITICAL - Single initialization strategy to prevent conflicts
    let isInitialized = false;
    let initializationInProgress = false;
    
    // ROOT FIX: CRITICAL - Global flag to prevent multiple setups
    if (window.TopicsTemplateInitialized) {
        console.log('⚠️ TEMPLATE TOPICS: Already initialized globally, skipping duplicate initialization');
        return;
    }
    window.TopicsTemplateInitialized = true;
    
    function safeInitializeWhenReady() {
        if (initializationInProgress || isInitialized) {
            console.log('⚠️ TEMPLATE TOPICS: Initialization already in progress or completed, skipping');
            return;
        }
        
        initializationInProgress = true;
        console.log('🔄 TEMPLATE TOPICS: Starting safe initialization...');
        
        try {
            initializeWhenReady();
            isInitialized = true;
            console.log('✅ TEMPLATE TOPICS: Safe initialization completed');
        } catch (error) {
            console.error('❌ TEMPLATE TOPICS: Initialization failed:', error);
        } finally {
            initializationInProgress = false;
        }
    }
    
    // ROOT FIX: Single initialization point
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInitializeWhenReady, { once: true });
    } else {
        // DOM already loaded, try immediate initialization
        safeInitializeWhenReady();
    }
    
    // ROOT FIX: Track if we've already initialized for this panel load
    let lastInitTimestamp = 0;
    
    // ROOT FIX: SINGLE design panel loaded event listener
    document.addEventListener('designPanelLoaded', function(e) {
        if (e.detail && e.detail.component === 'topics') {
            // Prevent multiple initializations for the same panel load
            if (e.detail.timestamp && e.detail.timestamp === lastInitTimestamp) {
                console.log('⚠️ TEMPLATE TOPICS: Duplicate design panel event ignored');
                return;
            }
            lastInitTimestamp = e.detail.timestamp || Date.now();
            
            console.log('✅ TEMPLATE TOPICS: Design panel loaded event received');
            
            // Reset initialization flags for new panel load
            isInitialized = false;
            initializationInProgress = false;
            
            setTimeout(safeInitializeWhenReady, 50); // Small delay to ensure DOM is updated
        }
    });
    
    // ROOT FIX: SINGLE mutation observer for sidebar detection
    let observerActive = false;
    if (!observerActive) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Check if topics sidebar was added
                    const addedNodes = Array.from(mutation.addedNodes);
                    const hasTopicsSidebar = addedNodes.some(node => 
                        node.classList && node.classList.contains('topics-sidebar'));
                        
                    if (hasTopicsSidebar) {
                        console.log('✅ TEMPLATE TOPICS: Topics sidebar detected in DOM - safe initializing');
                        // Reset flags for new sidebar
                        isInitialized = false;
                        setTimeout(safeInitializeWhenReady, 50);
                    }
                }
            });
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        observerActive = true;
        console.log('✅ TEMPLATE TOPICS: Mutation observer activated');
    }

    // ========================================
    // TOPIC INPUT HANDLING
    // ========================================

    function initializeTopicInputs() {
        const inputs = document.querySelectorAll('.topics-sidebar__topic-input');
        console.log(`🎯 TEMPLATE TOPICS: Initializing ${inputs.length} topic inputs`);
        
        inputs.forEach((input, index) => {
            console.log(`📝 TEMPLATE TOPICS: Setting up input ${index + 1}, current value: "${input.value}"`);
            setupTopicInputEvents(input, index);
            // Initialize auto-expand and character counter
            autoExpand(input);
            updateCharacterCounter(input);
        });
        
        console.log('✅ TEMPLATE TOPIC INPUTS: Enhanced inputs initialized');
    }

    function setupTopicInputEvents(input, index) {
        // Set smart placeholder if available
        if (smartPlaceholders[index]) {
            input.placeholder = smartPlaceholders[index];
        }

        input.addEventListener('input', function() {
            // ROOT FIX: Track sidebar edit timing
            this.setAttribute('data-last-sidebar-edit', Date.now().toString());
            
            autoExpand(this);
            updateCharacterCounter(this);
            
            // ROOT FIX: Bi-directional sync - Update preview when sidebar changes
            const topicNumber = index + 1;
            updatePreviewFromSidebar(topicNumber, this.value);
        });

        input.addEventListener('focus', function() {
            this.closest('.topics-sidebar__topic-item').classList.add('topics-sidebar__topic-item--focused');
            autoExpand(this);
        });
        
        input.addEventListener('blur', function() {
            this.closest('.topics-sidebar__topic-item').classList.remove('topics-sidebar__topic-item--focused');
        });
    }

    function autoExpand(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
    }

    function updateCharacterCounter(input) {
        const topicItem = input.closest('.topics-sidebar__topic-item');
        if (!topicItem) {
            console.log('⚠️ TEMPLATE TOPICS: No topic item found for character counter update');
            return;
        }
        
        const feedback = topicItem.querySelector('.topics-sidebar__input-feedback');
        if (!feedback) {
            console.log('⚠️ TEMPLATE TOPICS: No feedback section found for character counter');
            return;
        }
        
        const counter = feedback.querySelector('.topics-sidebar__char-counter span');
        const counterContainer = feedback.querySelector('.topics-sidebar__char-counter');
        const length = input.value.length;
        
        console.log(`📊 TEMPLATE TOPICS: Updating character counter - Length: ${length}`);
        
        if (counter) {
            counter.textContent = `${length}/80`;
        }
        
        if (counterContainer) {
            // Reset classes
            counterContainer.classList.remove('topics-sidebar__char-counter--optimal', 'topics-sidebar__char-counter--warning', 'topics-sidebar__char-counter--error');
            
            // Set status based on optimal range (20-60)
            if (length >= 20 && length <= 60) {
                counterContainer.classList.add('topics-sidebar__char-counter--optimal');
                if (counter.nextElementSibling) {
                    counter.nextElementSibling.textContent = 'optimal length';
                }
            } else if (length > 60 && length <= 80) {
                counterContainer.classList.add('topics-sidebar__char-counter--warning');
                if (counter.nextElementSibling) {
                    counter.nextElementSibling.textContent = 'getting long';
                }
            } else if (length > 80) {
                counterContainer.classList.add('topics-sidebar__char-counter--error');
                if (counter.nextElementSibling) {
                    counter.nextElementSibling.textContent = 'too long';
                }
            } else {
                if (counter.nextElementSibling) {
                    counter.nextElementSibling.textContent = 'characters';
                }
            }
        }
    }

    // ========================================
    // ACTION BUTTON HANDLING
    // ========================================

    function initializeActionButtons() {
        // Add first topic button
        const addFirstBtn = document.querySelector('.topics-sidebar__add-first-btn');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', addNewTopic);
        }

        // Main add topic button
        const addBtn = document.querySelector('.topics-sidebar__add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', addNewTopic);
        }

        // ROOT FIX: Connect Save button to actual state management system
        const saveBtn = document.querySelector('.topics-sidebar__save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('💾 TEMPLATE TOPICS: Save button clicked - collecting topics data');
                
                // Collect all topics data from the sidebar
                const topicsData = collectTopicsData();
                
                if (!topicsData || topicsData.length === 0) {
                    console.log('⚠️ TEMPLATE TOPICS: No topics data to save');
                    return;
                }
                
                // Show saving state
                this.style.background = '#f59e0b';
                this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><circle cx="12" cy="12" r="3"></circle><path d="m12 1v6m0 6v6"></path><path d="M19.07 4.93L16.24 7.76m0 0L16.24 16.24m0 0l2.83 2.83M4.93 19.07L7.76 16.24m0 0L16.24 7.76m0 0L19.07 4.93"></path></svg>Saving...';
                this.disabled = true;
                
                // Save to the actual state management system
                saveTopicsToState(topicsData).then((success) => {
                    if (success) {
                        // Show success state
                        this.style.background = '#38a169';
                        this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>Saved!';
                        
                        console.log('✅ TEMPLATE TOPICS: Topics saved successfully');
                        
                        // Dispatch saved event for other systems
                        document.dispatchEvent(new CustomEvent('topicsSaved', {
                            detail: { topics: topicsData, timestamp: Date.now() }
                        }));
                        
                        setTimeout(() => {
                            this.style.background = '#3182ce';
                            this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17,21 17,13 7,13 7,21"></polyline><polyline points="7,3 7,8 15,8"></polyline></svg>Save Changes';
                            this.disabled = false;
                        }, 2000);
                    } else {
                        // Show error state
                        this.style.background = '#e53e3e';
                        this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>Save Failed';
                        
                        console.error('❌ TEMPLATE TOPICS: Failed to save topics');
                        
                        setTimeout(() => {
                            this.style.background = '#3182ce';
                            this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17,21 17,13 7,13 7,21"></polyline><polyline points="7,3 7,8 15,8"></polyline></svg>Save Changes';
                            this.disabled = false;
                        }, 3000);
                    }
                }).catch((error) => {
                    console.error('❌ TEMPLATE TOPICS: Error saving topics:', error);
                    
                    // Show error state
                    this.style.background = '#e53e3e';
                    this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>Save Error';
                    
                    setTimeout(() => {
                        this.style.background = '#3182ce';
                        this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17,21 17,13 7,13 7,21"></polyline><polyline points="7,3 7,8 15,8"></polyline></svg>Save Changes';
                        this.disabled = false;
                    }, 3000);
                });
            });
        }

        // Reset button
        const resetBtn = document.querySelector('.topics-sidebar__reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('Reset all topics to last saved state?')) {
                    location.reload();
                }
            });
        }

        // ROOT FIX: Enhanced toggle switches with better initialization and event handling
        function initializeToggleSwitches() {
            const toggles = document.querySelectorAll('.topics-sidebar__toggle');
            console.log(`🎛️ TEMPLATE TOPICS: Initializing ${toggles.length} toggle switches`);
            
            toggles.forEach((toggle, index) => {
                // Remove existing event listeners to prevent duplicates
                toggle.replaceWith(toggle.cloneNode(true));
                const newToggle = document.querySelectorAll('.topics-sidebar__toggle')[index];
                
                newToggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🎛️ TEMPLATE TOPICS: Toggle switch clicked');
                    this.classList.toggle('topics-sidebar__toggle--active');
                    
                    // Dispatch custom event for other systems to listen
                    document.dispatchEvent(new CustomEvent('topicsDisplayOptionChanged', {
                        detail: {
                            toggle: this,
                            active: this.classList.contains('topics-sidebar__toggle--active')
                        }
                    }));
                });
            });
        }
        
        // Initialize toggle switches
        initializeToggleSwitches();

        // ROOT FIX: Enhanced style options with better initialization and event handling
        function initializeStyleOptions() {
            const styleOptions = document.querySelectorAll('.topics-sidebar__style-option');
            console.log(`🎨 TEMPLATE TOPICS: Initializing ${styleOptions.length} style options`);
            
            styleOptions.forEach((option, index) => {
                // Remove existing event listeners to prevent duplicates
                option.replaceWith(option.cloneNode(true));
                const newOption = document.querySelectorAll('.topics-sidebar__style-option')[index];
                
                newOption.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log(`🎨 TEMPLATE TOPICS: Style option clicked: ${this.textContent}`);
                    
                    // Remove active class from all options
                    document.querySelectorAll('.topics-sidebar__style-option').forEach(opt => {
                        opt.classList.remove('topics-sidebar__style-option--active');
                    });
                    
                    // Add active class to clicked option
                    this.classList.add('topics-sidebar__style-option--active');
                    
                    // Dispatch custom event for other systems to listen
                    document.dispatchEvent(new CustomEvent('topicsStyleChanged', {
                        detail: {
                            style: this.textContent.trim(),
                            element: this
                        }
                    }));
                });
            });
        }
        
        // Initialize style options
        initializeStyleOptions();

        // ROOT FIX: Enhanced delete buttons with better event targeting
        document.addEventListener('click', function(e) {
            const deleteBtn = e.target.closest('.topics-sidebar__action-btn--danger');
            if (deleteBtn) {
                console.log('🗑️ TEMPLATE TOPICS: Delete button clicked');
                e.preventDefault();
                e.stopPropagation();
                const topicItem = deleteBtn.closest('.topics-sidebar__topic-item');
                if (topicItem) {
                    deleteTopicItem(topicItem);
                } else {
                    console.log('⚠️ TEMPLATE TOPICS: No topic item found for delete button');
                }
            }
        });

        // ROOT FIX: Enhanced copy buttons with better event targeting
        document.addEventListener('click', function(e) {
            const copyBtn = e.target.closest('.topics-sidebar__action-btn:not(.topics-sidebar__action-btn--danger)');
            if (copyBtn && copyBtn.classList.contains('topics-sidebar__action-btn')) {
                console.log('📋 TEMPLATE TOPICS: Copy button clicked');
                e.preventDefault();
                e.stopPropagation();
                const topicItem = copyBtn.closest('.topics-sidebar__topic-item');
                if (topicItem) {
                    copyTopicItem(topicItem);
                } else {
                    console.log('⚠️ TEMPLATE TOPICS: No topic item found for copy button');
                }
            }
        });
        
        console.log('✅ TEMPLATE ACTION BUTTONS: Enhanced initialization complete');
    }

    // ========================================
    // DATA COLLECTION AND STATE MANAGEMENT
    // ========================================
    
    /**
     * ROOT FIX: Collect all topics data from the sidebar for saving
     * @returns {Array} Array of topic objects
     */
    function collectTopicsData() {
        const topicsData = [];
        const topicItems = document.querySelectorAll('.topics-sidebar__topic-item');
        
        console.log(`📋 TEMPLATE TOPICS: Collecting data from ${topicItems.length} topics`);
        
        topicItems.forEach((item, index) => {
            const input = item.querySelector('.topics-sidebar__topic-input');
            const topicNumber = item.querySelector('.topics-sidebar__topic-number')?.textContent || (index + 1);
            
            if (input) {
                const title = input.value.trim();
                
                if (title && title.length > 0) {
                    topicsData.push({
                        id: `topic_${index + 1}`,
                        title: title,
                        order: index + 1,
                        length: title.length,
                        status: title.length >= 20 && title.length <= 60 ? 'optimal' : 
                                title.length > 60 ? 'warning' : 'short'
                    });
                    
                    console.log(`📝 Topic ${topicNumber}: "${title}" (${title.length} chars)`);
                }
            }
        });
        
        console.log(`✅ TEMPLATE TOPICS: Collected ${topicsData.length} valid topics`);
        return topicsData;
    }
    
    /**
     * ROOT FIX: Save topics data to WordPress post meta (like MKCG system)
     * @param {Array} topicsData Array of topic objects
     * @returns {Promise} Promise that resolves with success status
     */
    function saveTopicsToState(topicsData) {
        return new Promise((resolve, reject) => {
            console.log('💾 TEMPLATE TOPICS: Saving topics to WordPress post meta (MKCG format)');
            
            try {
                // Get post ID from multiple sources
                let post_id = 0;
                
                // Strategy 1: From design panel or WordPress data
                if (window.gmkbData && window.gmkbData.postId) {
                    post_id = parseInt(window.gmkbData.postId) || parseInt(window.gmkbData.post_id) || 0;
                }
                
                // Strategy 2: From URL parameters
                if (!post_id) {
                    const urlParams = new URLSearchParams(window.location.search);
                    post_id = parseInt(urlParams.get('post_id')) || parseInt(urlParams.get('mkcg_id')) || parseInt(urlParams.get('p')) || 0;
                }
                
                // Strategy 3: From hidden field (if available)
                if (!post_id) {
                    const hiddenField = document.querySelector('#topics-generator-post-id, [name="post_id"], [data-post-id]');
                    if (hiddenField) {
                        post_id = parseInt(hiddenField.value || hiddenField.getAttribute('data-post-id')) || 0;
                    }
                }
                
                if (!post_id || post_id <= 0) {
                    console.error('❌ TEMPLATE TOPICS: No valid post ID found for save');
                    reject(new Error('No valid post ID found'));
                    return;
                }
                
                console.log(`🎯 TEMPLATE TOPICS: Using post ID: ${post_id}`);
                
                // Convert topics data to WordPress format (topic_1, topic_2, etc.)
                const topics = {};
                
                topicsData.forEach((topic, index) => {
                    const topicNumber = index + 1;
                    if (topicNumber <= 5 && topic.title && topic.title.trim()) {
                        topics[`topic_${topicNumber}`] = topic.title.trim();
                    }
                });
                
                console.log('📋 TEMPLATE TOPICS: Topics data formatted for WordPress:', topics);
                
                // Prepare nonce
                let nonce = '';
                if (window.gmkbData && window.gmkbData.nonce) {
                    nonce = window.gmkbData.nonce;
                } else {
                    // Try to find nonce in page
                    const nonceField = document.querySelector('[name="_wpnonce"], [name="nonce"], #topics-generator-nonce');
                    if (nonceField) {
                        nonce = nonceField.value;
                    }
                }
                
                if (!nonce) {
                    console.error('❌ TEMPLATE TOPICS: No nonce found');
                    reject(new Error('Security nonce not found'));
                    return;
                }
                
                // Use the existing Topics AJAX handler
                const formData = new FormData();
                formData.append('action', 'save_custom_topics');
                formData.append('post_id', post_id);
                formData.append('nonce', nonce);
                
                // ROOT FIX: Save to both formats for compatibility
                // Primary: MKCG format (mkcg_topic_1, mkcg_topic_2, etc.)
                // Fallback: Custom format (topic_1, topic_2, etc.)
                Object.keys(topics).forEach(key => {
                    const topicNumber = key.replace('topic_', '');
                    const value = topics[key];
                    
                    // MKCG format (primary)
                    formData.append(`topics[mkcg_topic_${topicNumber}]`, value);
                    // Custom format (fallback)
                    formData.append(`topics[${key}]`, value);
                });
                
                // Add additional metadata
                formData.append('source', 'topics_sidebar');
                formData.append('timestamp', Date.now());
                
                console.log('💾 TEMPLATE TOPICS: Sending AJAX request to save_custom_topics...');
                
                // Get AJAX URL
                let ajaxUrl = window.gmkbData?.ajaxUrl || window.ajaxurl || '/wp-admin/admin-ajax.php';
                
                fetch(ajaxUrl, {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('💾 TEMPLATE TOPICS: Save response:', data);
                    
                    if (data.success) {
                        console.log('✅ TEMPLATE TOPICS: Topics saved successfully to WordPress post meta');
                        console.log('📋 TEMPLATE TOPICS: Save details:', data.data || data.message);
                        resolve(true);
                    } else {
                        console.error('❌ TEMPLATE TOPICS: Save failed:', data.message || data.data);
                        reject(new Error(data.message || data.data || 'Save operation failed'));
                    }
                })
                .catch(error => {
                    console.error('❌ TEMPLATE TOPICS: Network error during save:', error);
                    reject(error);
                });
                
            } catch (error) {
                console.error('❌ TEMPLATE TOPICS: Error in saveTopicsToState:', error);
                reject(error);
            }
        });
    }
    
    /**
     * ROOT FIX: Fallback AJAX save method (now removed - direct WordPress save only)
     * @deprecated Using direct WordPress post meta save instead
     */
    function saveTopicsViaAjax(topicsData, componentId) {
        console.warn('⚠️ DEPRECATED: saveTopicsViaAjax - Using direct WordPress post meta save instead');
        return Promise.reject(new Error('This method is deprecated. Use direct WordPress save.'));
    }
    
    // ========================================
    // TOPIC MANAGEMENT
    // ========================================

    function addNewTopic() {
        const topicsList = document.getElementById('topics-list');
        if (!topicsList) return;
        
        const topicCount = topicsList.querySelectorAll('.topics-sidebar__topic-item').length;
        
        if (topicCount >= 5) {
            alert('Maximum 5 topics allowed');
            return;
        }

        // Remove empty state if present
        const emptyState = topicsList.querySelector('.topics-sidebar__empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const newTopic = createTopicItem(topicCount + 1);
        topicsList.appendChild(newTopic);
        
        // Focus the new input
        const newInput = newTopic.querySelector('.topics-sidebar__topic-input');
        if (newInput) {
            newInput.focus();
        }
        
        console.log('✅ TEMPLATE: New topic added');
    }

    function createTopicItem(number) {
        const div = document.createElement('div');
        div.className = 'topics-sidebar__topic-item';
        div.dataset.topicIndex = number;
        
        div.innerHTML = `
            <div class="topics-sidebar__topic-header">
                <div class="topics-sidebar__drag-handle" draggable="true">
                    <span></span><span></span><span></span>
                </div>
                <div class="topics-sidebar__topic-number">${number}</div>
                <div class="topics-sidebar__topic-status">
                    <div class="topics-sidebar__status-dot"></div>
                </div>
            </div>
            <div class="topics-sidebar__input-container">
                <textarea class="topics-sidebar__topic-input" 
                          placeholder="${smartPlaceholders[number - 1] || 'Enter your speaking topic...'}"
                          aria-label="Topic ${number} input"></textarea>
            </div>
            <div class="topics-sidebar__input-feedback">
                <div class="topics-sidebar__char-counter">
                    <span>0/80</span>
                    <span>characters</span>
                </div>
                <div class="topics-sidebar__range-indicator">Sweet spot: 20-60</div>
            </div>
            <div class="topics-sidebar__topic-actions">
                <button class="topics-sidebar__action-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                </button>
                <button class="topics-sidebar__action-btn topics-sidebar__action-btn--danger">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    </svg>
                    Delete
                </button>
            </div>
        `;
        
        // Setup events for new topic
        const input = div.querySelector('.topics-sidebar__topic-input');
        setupTopicInputEvents(input, number - 1);
        
        return div;
    }

    function deleteTopicItem(topicItem) {
        if (!topicItem) {
            console.log('⚠️ TEMPLATE TOPICS: No topic item provided for deletion');
            return;
        }
        
        console.log('🗑️ TEMPLATE TOPICS: Deleting topic item');
        
        const topicsList = document.getElementById('topics-list');
        if (!topicsList) {
            console.log('⚠️ TEMPLATE TOPICS: No topics list found');
            return;
        }
        
        const remainingTopics = topicsList.querySelectorAll('.topics-sidebar__topic-item').length;
        console.log(`📊 TEMPLATE TOPICS: ${remainingTopics} topics remaining before deletion`);
        
        // ROOT FIX: Confirm deletion for better UX
        const input = topicItem.querySelector('.topics-sidebar__topic-input');
        const topicText = input ? input.value.trim() : '';
        const topicNumber = topicItem.querySelector('.topics-sidebar__topic-number')?.textContent || 'this';
        
        if (topicText && topicText.length > 0) {
            if (!confirm(`Delete topic ${topicNumber}: "${topicText.substring(0, 50)}${topicText.length > 50 ? '...' : ''}"?`)) {
                return;
            }
        }
        
        // Animate out
        topicItem.style.transition = 'all 0.3s ease';
        topicItem.style.transform = 'translateX(-100%)';
        topicItem.style.opacity = '0';
        
        setTimeout(() => {
            topicItem.remove();
            updateTopicNumbers();
            
            // Check if we need to show empty state
            const newRemainingTopics = topicsList.querySelectorAll('.topics-sidebar__topic-item').length;
            if (newRemainingTopics === 0) {
                showEmptyState();
            }
            
            console.log('✅ TEMPLATE: Topic deleted - ' + newRemainingTopics + ' topics remaining');
        }, 300);
    }

    function copyTopicItem(topicItem) {
        if (!topicItem) return;
        
        const topicsList = document.getElementById('topics-list');
        const topicCount = topicsList.querySelectorAll('.topics-sidebar__topic-item').length;
        
        if (topicCount >= 5) {
            alert('Maximum 5 topics allowed');
            return;
        }

        const input = topicItem.querySelector('.topics-sidebar__topic-input');
        const topicText = input ? input.value : '';
        
        const newTopic = createTopicItem(topicCount + 1);
        const newInput = newTopic.querySelector('.topics-sidebar__topic-input');
        
        if (newInput && topicText) {
            newInput.value = topicText + ' (Copy)';
            updateCharacterCounter(newInput);
            autoExpand(newInput);
        }
        
        topicsList.appendChild(newTopic);
        updateTopicNumbers();
        
        console.log('✅ TEMPLATE: Topic copied');
        
        // Focus the new input
        if (newInput) {
            newInput.focus();
            // Select the " (Copy)" part for easy editing
            const copyPos = newInput.value.lastIndexOf(' (Copy)');
            if (copyPos > -1) {
                newInput.setSelectionRange(copyPos, newInput.value.length);
            }
        }
    }

    function showEmptyState() {
        const topicsList = document.getElementById('topics-list');
        if (!topicsList) return;
        
        const emptyState = document.createElement('div');
        emptyState.className = 'topics-sidebar__empty-state';
        emptyState.innerHTML = `
            <div class="topics-sidebar__empty-message">No topics yet. Add your first topic to get started.</div>
            <button class="topics-sidebar__add-first-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add First Topic
            </button>
        `;
        
        // Add event listener to the new button
        const addFirstBtn = emptyState.querySelector('.topics-sidebar__add-first-btn');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', addNewTopic);
        }
        
        topicsList.appendChild(emptyState);
    }

    function updateTopicNumbers() {
        document.querySelectorAll('.topics-sidebar__topic-number').forEach((number, index) => {
            number.textContent = index + 1;
        });
        
        // Update data attributes
        document.querySelectorAll('.topics-sidebar__topic-item').forEach((item, index) => {
            item.dataset.topicIndex = index + 1;
        });
    }

    // ROOT FIX: Enhanced global API for external use, debugging, and state management
    window.TopicsTemplate = {
        addTopic: addNewTopic,
        updateCounters: function() {
            console.log('🔄 TEMPLATE TOPICS: Updating all character counters');
            document.querySelectorAll('.topics-sidebar__topic-input').forEach(updateCharacterCounter);
        },
        reinitialize: safeInitializeWhenReady,
        collectData: collectTopicsData,
        saveToState: saveTopicsToState,
        forceClearAndReinitialize: function() {
            console.log('🧾 FORCE RESET: Clearing initialization state and reinitializing...');
            isInitialized = false;
            initializationInProgress = false;
            safeInitializeWhenReady();
        },
        debug: function() {
            console.log('🔍 TEMPLATE TOPICS DEBUG:');
            console.log('- Topic inputs found:', document.querySelectorAll('.topics-sidebar__topic-input').length);
            console.log('- Topics list element:', document.getElementById('topics-list'));
            console.log('- Action buttons found:', document.querySelectorAll('.topics-sidebar__action-btn').length);
            console.log('- Toggle switches found:', document.querySelectorAll('.topics-sidebar__toggle').length);
            console.log('- Current topics data:', collectTopicsData());
            console.log('- State managers available:', {
                enhanced: !!window.enhancedStateManager,
                regular: !!window.stateManager,
                designPanel: !!window.designPanel
            });
            console.log('- Initialization status:', { isInitialized, initializationInProgress });
        },
        
        // ROOT FIX: CRITICAL - Test contenteditable functionality
        testContentEditable: function() {
            console.log('🧪 TESTING: Contenteditable functionality...');
            
            const editableElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
            console.log(`Found ${editableElements.length} contenteditable elements`);
            
            editableElements.forEach((element, index) => {
                const topicNumber = index + 1;
                const hasEvents = element.hasAttribute('data-sync-initialized');
                const isEditing = element.hasAttribute('data-editing');
                const isFocused = document.activeElement === element;
                
                console.log(`Topic ${topicNumber}:`, {
                    element: element,
                    contenteditable: element.getAttribute('contenteditable'),
                    hasEventListeners: hasEvents,
                    isEditing: isEditing,
                    isFocused: isFocused,
                    textContent: element.textContent.trim(),
                    lastValue: element.getAttribute('data-last-value')
                });
            });
            
            // Test focusing the first element
            if (editableElements.length > 0) {
                const firstElement = editableElements[0];
                console.log('🎯 TESTING: Attempting to focus first element...');
                firstElement.focus();
                
                setTimeout(() => {
                    console.log('🎯 TEST RESULT:', {
                        activeElement: document.activeElement,
                        isFirstElement: document.activeElement === firstElement,
                        canEdit: document.activeElement === firstElement && firstElement.isContentEditable
                    });
                }, 100);
            }
        },
        
        // ROOT FIX: Test sync functionality
        testSync: function() {
            console.log('🔄 TESTING: Bi-directional sync functionality...');
            
            // Test 1: Check if sidebar and preview elements exist
            const sidebarInputs = document.querySelectorAll('.topics-sidebar__topic-input');
            const previewElements = document.querySelectorAll('.topic-title[contenteditable="true"]');
            
            console.log(`✅ Found ${sidebarInputs.length} sidebar inputs`);
            console.log(`✅ Found ${previewElements.length} preview elements`);
            
            if (sidebarInputs.length === 0 || previewElements.length === 0) {
                console.error('❌ Cannot test sync - missing sidebar or preview elements');
                return false;
            }
            
            // Test 2: Test sidebar to preview sync
            const testValue1 = `Sidebar Test ${Date.now()}`;
            const firstSidebarInput = sidebarInputs[0];
            const firstPreviewElement = previewElements[0];
            
            console.log(`🔄 Testing sidebar -> preview sync with: "${testValue1}"`);
            firstSidebarInput.value = testValue1;
            firstSidebarInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            setTimeout(() => {
                const previewText = firstPreviewElement.textContent.trim();
                const sidebarToPreviewWorks = previewText === testValue1;
                console.log(`${sidebarToPreviewWorks ? '✅' : '❌'} Sidebar -> Preview: Expected "${testValue1}", got "${previewText}"`);
                
                // Test 3: Test preview to sidebar sync
                const testValue2 = `Preview Test ${Date.now()}`;
                console.log(`🔄 Testing preview -> sidebar sync with: "${testValue2}"`);
                
                firstPreviewElement.textContent = testValue2;
                firstPreviewElement.dispatchEvent(new Event('input', { bubbles: true }));
                // Manually trigger blur to simulate user finishing edit
                firstPreviewElement.blur();
                
                setTimeout(() => {
                    const sidebarValue = firstSidebarInput.value.trim();
                    const previewToSidebarWorks = sidebarValue === testValue2;
                    console.log(`${previewToSidebarWorks ? '✅' : '❌'} Preview -> Sidebar: Expected "${testValue2}", got "${sidebarValue}"`);
                    
                    // Final result
                    const syncWorks = sidebarToPreviewWorks && previewToSidebarWorks;
                    console.log(`
🎯 SYNC TEST RESULT: ${syncWorks ? 'WORKING ✅' : 'FAILED ❌'}`);
                    
                    if (syncWorks) {
                        console.log('🎉 SUCCESS! Bi-directional sync is working properly.');
                        console.log('📝 Try editing topics manually - changes should sync between preview and sidebar.');
                    } else {
                        console.log('🔧 SYNC ISSUES DETECTED:');
                        if (!sidebarToPreviewWorks) console.log('- Sidebar to preview sync not working');
                        if (!previewToSidebarWorks) console.log('- Preview to sidebar sync not working');
                        console.log('📝 Check console for sync-related error messages');
                    }
                    
                    return syncWorks;
                }, 200);
            }, 200);
        },
    };
    
    // ROOT FIX: CRITICAL FIX - Expose initializeManualSync FIRST before TopicsSync object is defined
    window.initializeManualSync = function() {
        console.log('🔧 GLOBAL INIT: Initializing manual sync...');
        
        // CRITICAL: Create inline implementation to prevent undefined errors
        const previewTopics = document.querySelectorAll('.media-kit-preview .topic-title, .topics-container .topic-title');
        console.log(`🔧 MANUAL SYNC: Found ${previewTopics.length} preview elements`);

        previewTopics.forEach((element, index) => {
            const topicNumber = index + 1;
            element.setAttribute('contenteditable', 'true');
            element.setAttribute('data-topic-number', topicNumber);

            // Remove existing listeners by cloning to avoid duplicates
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);

            // CRITICAL FIX: Handler directly references the element via event.currentTarget
            const syncHandler = (event) => {
                const el = event.currentTarget;
                const value = el.textContent.trim();
                const currentTopicNumber = el.getAttribute('data-topic-number');
                console.log(`🔄 SYNC TO SIDEBAR: Topic ${currentTopicNumber} = "${value}"`);
                
                // Inline sidebar sync to prevent dependencies
                if (window.TopicsSync && window.TopicsSync.updateSidebar) {
                    window.TopicsSync.updateSidebar(currentTopicNumber, value);
                } else {
                    // Fallback direct sync
                    const sidebarInput = document.querySelector(`#topics-list .topics-sidebar__topic-item:nth-child(${currentTopicNumber}) .topics-sidebar__topic-input`);
                    if (sidebarInput) {
                        sidebarInput.value = value;
                        console.log(`✅ FALLBACK SYNC: Updated sidebar topic ${currentTopicNumber}`);
                    }
                }
            };

            newElement.addEventListener('blur', syncHandler);
            newElement.addEventListener('input', syncHandler);
            newElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur(); // Trigger the blur event to sync
                }
            });
        });

        console.log('✅ GLOBAL Manual sync initialized');
    };
    
    // ROOT FIX: Expose enhanced functions globally for troubleshooting and manual operations
    window.debugTopicsSidebar = window.TopicsTemplate.debug;
    window.saveTopicsSidebar = function() {
        console.log('💾 Manual save triggered from console - using WordPress post meta save');
        const topicsData = collectTopicsData();
        if (topicsData.length > 0) {
            console.log('📋 Saving topics via WordPress post meta:', topicsData);
            return saveTopicsToState(topicsData);
        } else {
            console.log('⚠️ No topics data to save');
            return Promise.resolve(false);
        }
    };
    window.collectTopicsData = collectTopicsData;
    
    // ROOT FIX: Add debug function to test WordPress save
    window.testTopicsWordPressSave = function() {
        console.log('🧪 Testing WordPress topics save functionality...');
        
        // Get test data
        const testTopicsData = [
            { id: 'topic_1', title: 'Test Topic 1 - WordPress Save', order: 1, length: 25, status: 'optimal' },
            { id: 'topic_2', title: 'Test Topic 2 - WordPress Save', order: 2, length: 25, status: 'optimal' }
        ];
        
        console.log('📋 Test data prepared:', testTopicsData);
        
        // Try the save
        return saveTopicsToState(testTopicsData)
            .then(() => {
                console.log('✅ WordPress save test successful!');
                return true;
            })
            .catch(error => {
                console.error('❌ WordPress save test failed:', error);
                return false;
            });
    };
    
    // ========================================
    // BI-DIRECTIONAL SYNC FUNCTIONS
    // ========================================
    
    function updatePreviewFromSidebar(topicNumber, value) {
        console.log(`🔄 SYNC: Updating preview topic ${topicNumber}: "${value}"`);
        
        // ROOT FIX: Use correct selectors that match the actual template structure (.topics-container)
        const topicIndex = topicNumber - 1; // Convert to 0-based index
        const selectors = [
            `.topics-container .topic-item[data-topic-index="${topicIndex}"] .topic-title`,
            `.topics-container .topic-item:nth-child(${topicNumber}) .topic-title`,
            `.topics-container .topic-title[data-topic-number="${topicNumber}"]`,
            `.media-kit-preview .topics-container .topic-item[data-topic-index="${topicIndex}"] .topic-title`,
            `.media-kit-preview .topics-container .topic-item:nth-child(${topicNumber}) .topic-title`
        ];
        
        let updated = false;
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && !updated) {
                // ROOT FIX: ALLOW updates unless element is currently being actively edited
                // Only block if user is actively typing (check recent focus time)
                const lastFocusTime = element.getAttribute('data-last-focus-time');
                const timeSinceLastFocus = lastFocusTime ? (Date.now() - parseInt(lastFocusTime)) : Infinity;
                
                if (element.hasAttribute('data-editing') && document.activeElement === element && timeSinceLastFocus < 2000) {
                    console.log(`🚫 SYNC BLOCKED: Preview element is actively being edited (focused ${timeSinceLastFocus}ms ago)`);
                    return;
                }
                
                // Update the text content
                element.textContent = value || `Topic ${topicNumber}`;
                console.log(`✅ SYNC: Updated preview via ${selector}`);
                
                // ROOT FIX: Add visual feedback for successful sync
                element.style.backgroundColor = '#e3f2fd';
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 400);
                
                updated = true;
                
                // ROOT FIX: Also dispatch change event for other systems (but mark as sync)
                element.dispatchEvent(new CustomEvent('input', { 
                    detail: { source: 'sidebar-sync', value, topicNumber } 
                }));
            }
        }
        
        if (!updated) {
            console.log(`⚠️ SYNC: No preview element found for topic ${topicNumber} using selectors:`, selectors);
            
            // DEBUG: Log all available topic elements for troubleshooting
            const allTopicElements = document.querySelectorAll('.topic-item, .topic-title, [data-topic-index]');
            console.log('Available topic elements:', allTopicElements);
        }
    }
    
    function updateSidebarFromPreview(topicNumber, value) {
        console.log(`🔄 SYNC: Updating sidebar topic ${topicNumber}: "${value}"`);
        
        // ROOT FIX: Use simple nth-child selector since the inputs are in order 1-5
        const selectors = [
            `#topics-list .topics-sidebar__topic-item:nth-child(${topicNumber}) .topics-sidebar__topic-input`,
            `.topics-sidebar .topics-sidebar__topic-item:nth-child(${topicNumber}) .topics-sidebar__topic-input`,
            `.topics-sidebar__topic-input:nth-of-type(${topicNumber})`
        ];
        
        let updated = false;
        for (const selector of selectors) {
            const input = document.querySelector(selector);
            if (input && input.value !== value && !updated) {
                // ROOT FIX: ALLOW sync even if sidebar input has focus (user might be in both places)
                // Only skip if there's recent typing activity in the sidebar
                const lastSidebarEdit = input.getAttribute('data-last-sidebar-edit');
                const timeSinceLastEdit = lastSidebarEdit ? (Date.now() - parseInt(lastSidebarEdit)) : Infinity;
                
                if (document.activeElement === input && timeSinceLastEdit < 1000) {
                    console.log(`🚫 SYNC BLOCKED: Sidebar input was recently edited (${timeSinceLastEdit}ms ago)`);
                    return;
                }
                
                input.value = value;
                updateCharacterCounter(input);
                autoExpand(input);
                console.log(`✅ SYNC: Updated sidebar topic ${topicNumber} via ${selector}`);
                
                // ROOT FIX: Add visual feedback briefly
                input.style.borderColor = '#4caf50';
                input.style.backgroundColor = '#e8f5e8';
                setTimeout(() => {
                    input.style.borderColor = '';
                    input.style.backgroundColor = '';
                }, 500);
                
                updated = true;
                
                // ROOT FIX: Trigger input event to ensure other systems are notified
                input.dispatchEvent(new CustomEvent('input', {
                    detail: { source: 'preview-sync', value, topicNumber }
                }));
                
                break; // Exit loop after successful update
            }
        }
        
        // ROOT FIX: Fallback - direct index access if selectors fail
        if (!updated) {
            const allInputs = document.querySelectorAll('.topics-sidebar__topic-input');
            if (allInputs.length >= topicNumber) {
                const targetInput = allInputs[topicNumber - 1]; // Convert to 0-based index
                if (targetInput && targetInput.value !== value) {
                    targetInput.value = value;
                    updateCharacterCounter(targetInput);
                    autoExpand(targetInput);
                    
                    // Visual feedback
                    targetInput.style.borderColor = '#4caf50';
                    setTimeout(() => {
                        targetInput.style.borderColor = '';
                    }, 300);
                    
                    // Trigger input event
                    targetInput.dispatchEvent(new CustomEvent('input', {
                        detail: { source: 'preview-sync-fallback', value, topicNumber }
                    }));
                    
                    console.log(`✅ SYNC: Updated sidebar topic ${topicNumber} via fallback method (index ${topicNumber - 1})`);
                    updated = true;
                }
            }
        }
        
        if (!updated) {
            console.log(`⚠️ SYNC: Failed to update sidebar topic ${topicNumber}`);
            
            // Enhanced DEBUG: Log detailed information about sidebar inputs
            const allSidebarInputs = document.querySelectorAll('.topics-sidebar__topic-input');
            console.log('DEBUG: Sidebar inputs details:');
            allSidebarInputs.forEach((input, index) => {
                console.log(`  Input ${index + 1}:`, {
                    element: input,
                    value: input.value,
                    parent: input.closest('.topics-sidebar__topic-item'),
                    parentData: input.closest('.topics-sidebar__topic-item')?.dataset || {}
                });
            });
        }
    }
    
    function initializePreviewSync() {
        console.log('🎯 ROOT FIX: Initializing bi-directional sync with proper event coordination...');
        
        // ROOT FIX: Wait for actual topics container to be fully rendered first
        function waitForPreviewComponent(callback, maxAttempts = 10) {
            let attempt = 1;
            
            const checkForPreviewComponent = () => {
                console.log(`🔍 ROOT FIX: Checking for topics container (attempt ${attempt}/${maxAttempts})`);
                
                // ROOT FIX: Look for the actual .topics-container where topics are rendered
                const topicsContainer = document.querySelector('.topics-container');
                
                if (topicsContainer) {
                    console.log('✅ ROOT FIX: Topics container found:', topicsContainer);
                    
                    // ROOT FIX: Look for topic title elements within the container
                    const topicTitles = topicsContainer.querySelectorAll('.topic-title');
                    console.log(`📝 ROOT FIX: Found ${topicTitles.length} topic title elements`);
                    
                    if (topicTitles.length > 0) {
                        callback(topicsContainer, Array.from(topicTitles));
                        return;
                    }
                }
                
                // ROOT FIX: If not found and attempts remaining, try again
                if (attempt < maxAttempts) {
                    attempt++;
                    setTimeout(checkForPreviewComponent, 500 * attempt); // Exponential backoff
                } else {
                    console.log('⚠️ ROOT FIX: Could not find topics container after all attempts');
                    callback(null, []);
                }
            };
            
            checkForPreviewComponent();
        }
        
        // ROOT FIX: Setup sync only after topics container is confirmed to exist
        waitForPreviewComponent((topicsContainer, topicTitleElements) => {
            if (!topicsContainer || topicTitleElements.length === 0) {
                console.log('❌ ROOT FIX: No topics container or title elements found - sync not possible');
                return;
            }
            
            console.log(`🎯 ROOT FIX: Setting up sync for ${topicTitleElements.length} topic elements`);
            
            // ROOT FIX: Clear any existing initialization tracking
            componentInitialized.clear();
            console.log('🧹 ROOT FIX: Cleared previous initialization tracking');
            
            // ROOT FIX: Setup event listeners for each topic title element  
            topicTitleElements.forEach((element, index) => {
                const topicNumber = index + 1;
                
                if (topicNumber > 5) return; // Skip beyond 5 topics
                
                // ROOT FIX: Prevent duplicate initialization per element
                const elementKey = `topic-${topicNumber}-${element.id || element.className}`;
                if (componentInitialized.has(elementKey)) {
                    console.log(`⚠️ DUPLICATE INIT PREVENTED: Topic ${topicNumber} already initialized`);
                    return;
                }
                
                console.log(`🔧 ROOT FIX: Setting up sync for topic ${topicNumber}`);
                componentInitialized.add(elementKey);
                
                // ROOT FIX: Ensure element is contenteditable
                if (!element.hasAttribute('contenteditable')) {
                    element.setAttribute('contenteditable', 'true');
                    element.setAttribute('spellcheck', 'false');
                    element.style.outline = 'none';
                    console.log(`✅ Made topic ${topicNumber} contenteditable`);
                }
                
                // ROOT FIX: CRITICAL - Prevent focus loss and ensure stable editing
                element.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    console.log(`📝 MOUSEDOWN: Topic ${topicNumber} - preventing propagation`);
                }, true);
                
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`📝 CLICK: Topic ${topicNumber} - focusing element`);
                    
                    // ROOT FIX: Record click timestamp
                    element.setAttribute('data-last-click-time', Date.now().toString());
                    
                    // Ensure the element is properly focused
                    if (document.activeElement !== element) {
                        element.focus();
                        
                        // Set cursor position to end of text
                        const range = document.createRange();
                        const selection = window.getSelection();
                        range.selectNodeContents(element);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }, true);
                
                // ROOT FIX: Prevent external DOM manipulation from interrupting editing
                element.addEventListener('DOMNodeRemoved', (e) => {
                    if (element.hasAttribute('data-editing')) {
                        console.log(`⚠️ DOM REMOVAL BLOCKED: Topic ${topicNumber} is being edited`);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
                
                // ROOT FIX: Set topic number for identification
                element.setAttribute('data-topic-number', topicNumber);
                element.setAttribute('data-sync-initialized', 'true');
                
                // ROOT FIX: FIXED - Comprehensive sync handler that allows controlled sync
                const syncToSidebar = function(eventType) {
                    // ROOT FIX: CRITICAL - Allow sync for certain events, but prevent during rapid typing
                    if (element.hasAttribute('data-editing') && eventType === 'blur') {
                        // Allow sync on blur even if editing (user finished editing)
                        console.log(`🔄 SYNC ALLOWED: ${eventType} sync permitted on blur`);
                    } else if (element.hasAttribute('data-editing') && eventType !== 'input') {
                        console.log(`🚫 SYNC BLOCKED: Element is being edited, blocking ${eventType} sync`);
                        return;
                    }
                    
                    // ROOT FIX: Don't sync if element is currently focused and it's a blur event (prevents conflict)
                    if (document.activeElement === element && eventType === 'blur') {
                        console.log(`🚫 SYNC BLOCKED: Element still has focus, ignoring blur event`);
                        return;
                    }
                    
                    const currentValue = element.textContent.trim();
                    const lastValue = element.getAttribute('data-last-value') || '';
                    
                    // Only sync if value actually changed
                    if (currentValue !== lastValue) {
                        console.log(`🔄 ROOT FIX SYNC [${eventType}]: Topic ${topicNumber} changed from "${lastValue}" to "${currentValue}"`);
                        
                        // Store new value
                        element.setAttribute('data-last-value', currentValue);
                        
                        // ROOT FIX: CRITICAL - Sync to sidebar without interfering with editing
                        clearTimeout(element._syncTimeout);
                        element._syncTimeout = setTimeout(() => {
                            // Only sync if element is not currently focused (prevents interference)
                            if (document.activeElement !== element) {
                                updateSidebarFromPreview(topicNumber, currentValue);
                            } else {
                                console.log(`🚫 SYNC DELAYED: Element still focused, will sync later`);
                            }
                        }, eventType === 'input' ? 300 : 50); // Shorter delay for blur events
                    }
                };
                
                // ROOT FIX: Set initial value for comparison
                element.setAttribute('data-last-value', element.textContent.trim());
                
                const newElement = element; // Don't clone, just use original element
                
                // ROOT FIX: Track sync state to prevent loops
                let lastSyncTime = 0;
                const MIN_SYNC_INTERVAL = 500; // Minimum time between syncs
                
                // ROOT FIX: FIXED - Track if element is being edited
                let isEditing = false;
                let editStartTime = 0;
                
                // ROOT FIX: FIXED - Add event listeners that don't interfere with editing
                newElement.addEventListener('focus', (e) => {
                    isEditing = true;
                    editStartTime = Date.now();
                    newElement.setAttribute('data-editing', 'true');
                    newElement.setAttribute('data-last-focus-time', Date.now().toString());
                    console.log(`🎯 EDIT START: Topic ${topicNumber} focus - editing mode active`);
                    
                    // ROOT FIX: CRITICAL - Ensure the element stays focused
                    e.stopPropagation();
                });
                
                // ROOT FIX: FIXED - Input handling that syncs during longer edit sessions
                newElement.addEventListener('input', (e) => {
                    // Sync input changes but with longer delay to allow continuous typing
                    const editDuration = Date.now() - editStartTime;
                    if (editDuration > 800) { // Sync after 800ms of editing
                        clearTimeout(newElement._inputTimeout);
                        newElement._inputTimeout = setTimeout(() => {
                            if (isEditing) { // Double-check still editing
                                console.log(`🔄 INPUT SYNC: Topic ${topicNumber} - syncing during long edit session`);
                                syncToSidebar('input');
                            }
                        }, 800); // Longer delay for input to allow typing
                    }
                });
                
                // ROOT FIX: CRITICAL - FIXED blur handling that syncs when editing is complete
                newElement.addEventListener('blur', (e) => {
                    // ROOT FIX: CRITICAL - Check if blur is caused by clicking outside or switching to another element
                    const editDuration = Date.now() - editStartTime;
                    
                    console.log(`🎯 BLUR EVENT: Topic ${topicNumber} - edit duration: ${editDuration}ms`);
                    
                    // If edit duration is very short, user might have just clicked to start editing
                    if (editDuration < 500) {
                        console.log(`🎯 QUICK BLUR IGNORED: Topic ${topicNumber} - edit session too short (${editDuration}ms), keeping edit mode active`);
                        
                        // ROOT FIX: CRITICAL - Keep editing mode active and re-focus if needed
                        if (!newElement.hasAttribute('data-editing')) {
                            newElement.setAttribute('data-editing', 'true');
                        }
                        
                        // Re-focus the element if it's not focused
                        setTimeout(() => {
                            if (document.activeElement !== newElement) {
                                console.log(`🎯 RE-FOCUSING: Topic ${topicNumber} after quick blur`);
                                newElement.focus();
                            }
                        }, 10);
                        
                        return;
                    }
                    
                    // Clear pending timeouts
                    clearTimeout(newElement._inputTimeout);
                    
                    // ROOT FIX: CRITICAL - Sync immediately when user finishes editing
                    console.log(`🔄 BLUR SYNC: Topic ${topicNumber} - user finished editing, syncing now`);
                    
                    // Sync only if there was actual content change
                    const currentValue = newElement.textContent.trim();
                    const lastValue = newElement.getAttribute('data-last-value') || '';
                    
                    if (currentValue !== lastValue) {
                        syncToSidebar('blur');
                    }
                    
                    // Mark as not editing after a short delay
                    setTimeout(() => {
                        isEditing = false;
                        newElement.removeAttribute('data-editing');
                        console.log(`🎯 EDIT END: Topic ${topicNumber} - editing mode deactivated`);
                    }, 100); // Small delay to ensure sync completes first
                });
                
                // ROOT FIX: REMOVED focusout handler to prevent conflicts
                // The blur handler is sufficient
                
                // ROOT FIX: FIXED - Enhanced keyboard handling that syncs on Enter
                newElement.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        console.log(`🎯 ENTER KEY: Topic ${topicNumber} - syncing and completing edit`);
                        
                        // Immediate sync on Enter
                        const currentValue = newElement.textContent.trim();
                        syncToSidebar('enter');
                        
                        // Blur the element to complete editing
                        newElement.blur();
                    }
                    if (e.key === 'Tab') {
                        console.log(`🎯 TAB KEY: Topic ${topicNumber} - natural tab navigation will trigger blur`);
                        // Let tab proceed naturally - blur will handle sync
                    }
                    if (e.key === 'Escape') {
                        console.log(`🎯 ESCAPE KEY: Topic ${topicNumber} - cancelling edit`);
                        // Restore original value
                        const originalValue = newElement.getAttribute('data-original-value') || newElement.getAttribute('data-last-value') || '';
                        newElement.textContent = originalValue;
                        newElement.blur();
                    }
                });
                
                // ROOT FIX: Paste event handling
                newElement.addEventListener('paste', () => {
                    setTimeout(() => syncToSidebar('paste'), 50);
                });
                
                console.log(`✅ ROOT FIX: Sync setup complete for topic ${topicNumber}`);
            });
            
            console.log('✅ ROOT FIX: Bi-directional sync initialization complete with proper event coordination');
            
            // ROOT FIX: Dispatch event to notify other systems that sync is ready
            document.dispatchEvent(new CustomEvent('topicsPreviewSyncReady', {
                detail: {
                    topicsContainer,
                    syncElements: topicTitleElements.length,
                    timestamp: Date.now()
                }
            }));
        });
    }
    
    // ========================================
    // AUTO-SAVE EVENT LISTENER
    // ========================================
    
    /**
     * ROOT FIX: Listen for auto-save events from preview and update sidebar accordingly
     */
    function setupAutoSaveListener() {
        document.addEventListener('topicsAutoSaved', function(event) {
            console.log('🔄 SIDEBAR: Received auto-save event from preview:', event.detail);
            
            if (event.detail && event.detail.topics && event.detail.source === 'preview') {
                const savedTopics = event.detail.topics;
                
                // Update sidebar inputs to match the saved values
                Object.keys(savedTopics).forEach(key => {
                    const topicNumber = key.replace('topic_', '');
                    const value = savedTopics[key];
                    
                    const input = document.querySelector(`#topics-list .topics-sidebar__topic-item:nth-child(${topicNumber}) .topics-sidebar__topic-input`);
                    if (input && input.value !== value) {
                        input.value = value;
                        updateCharacterCounter(input);
                        autoExpand(input);
                        
                        // Visual feedback that it was synced from preview
                        input.style.borderColor = '#2196f3';
                        setTimeout(() => {
                            input.style.borderColor = '';
                        }, 500);
                        
                        console.log(`✅ SIDEBAR: Synced topic ${topicNumber} from preview auto-save`);
                    }
                });
                
                // Show success message in sidebar
                showSidebarSyncIndicator('✅ Synced from preview');
            }
        });
        
        console.log('✅ TEMPLATE TOPICS: Auto-save listener setup complete');
    }
    
    /**
     * Show sync indicator in sidebar
     */
    function showSidebarSyncIndicator(message) {
        const autoSaveElement = document.querySelector('.topics-sidebar__auto-save');
        if (autoSaveElement) {
            const originalText = autoSaveElement.textContent;
            autoSaveElement.textContent = message;
            autoSaveElement.style.color = '#4caf50';
            
            setTimeout(() => {
                autoSaveElement.textContent = originalText;
                autoSaveElement.style.color = '';
            }, 2000);
        }
    }
    
    // Export sync functions globally for debugging
    window.TopicsSync = {
        initializeManualSync: function() {
            console.log('🔧 MANUAL SYNC: Forcing re-initialization of preview sync...');
            const previewTopics = document.querySelectorAll('.media-kit-preview .topic-title');

            previewTopics.forEach((element, index) => {
                const topicNumber = index + 1;
                element.setAttribute('contenteditable', 'true');
                element.setAttribute('data-topic-number', topicNumber);

                // Remove existing listeners by cloning to avoid duplicates
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);

                // CRITICAL FIX: Handler directly references the element via event.currentTarget
                const syncHandler = (event) => {
                    const el = event.currentTarget;
                    const value = el.textContent.trim();
                    const currentTopicNumber = el.getAttribute('data-topic-number');
                    console.log(`🔄 SYNC TO SIDEBAR: Topic ${currentTopicNumber} = "${value}"`);
                    updateSidebarFromPreview(currentTopicNumber, value);
                };

                newElement.addEventListener('blur', syncHandler);
                newElement.addEventListener('input', syncHandler);
                newElement.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur(); // Trigger the blur event to sync
                    }
                });
            });

            console.log('✅ Preview sync re-initialized');
        },
        updatePreview: updatePreviewFromSidebar,
        updateSidebar: updateSidebarFromPreview,
        initialize: initializePreviewSync,
        setupAutoSaveListener: setupAutoSaveListener,
        
        // ROOT FIX: Enhanced debugging and manual sync functions
        debug: function() {
            console.group('🔍 TOPICS SYNC DEBUG');
            
            // Check sidebar elements
            const sidebarInputs = document.querySelectorAll('.topics-sidebar__topic-input');
            console.log('Sidebar inputs found:', sidebarInputs.length);
            sidebarInputs.forEach((input, i) => {
                const topicItem = input.closest('.topics-sidebar__topic-item');
                const topicNumber = topicItem ? topicItem.getAttribute('data-topic-index') || (i + 1) : 'unknown';
                console.log(`  Sidebar ${i + 1} (topic ${topicNumber}): "${input.value}"`);
            });
            
            // Check preview elements
            const previewElements = document.querySelectorAll('.topic-title, [data-topic-number]');
            console.log('Preview elements found:', previewElements.length);
            previewElements.forEach((el, i) => {
                const topicNumber = el.getAttribute('data-topic-number') || el.getAttribute('data-sync-topic-number') || (i + 1);
                const isContentEditable = el.hasAttribute('contenteditable');
                const hasSync = el.hasAttribute('data-sync-initialized');
                console.log(`  Preview ${i + 1} (topic ${topicNumber}): "${el.textContent.trim()}" [editable: ${isContentEditable}, sync: ${hasSync}]`);
            });
            
            console.groupEnd();
        },
        
        forceSync: function(direction = 'both') {
            console.log(`🔄 FORCE SYNC: ${direction}`);
            
            if (direction === 'sidebar-to-preview' || direction === 'both') {
                const sidebarInputs = document.querySelectorAll('.topics-sidebar__topic-input');
                sidebarInputs.forEach((input, index) => {
                    const topicNumber = index + 1;
                    const value = input.value.trim();
                    if (value) {
                        console.log(`🔄 Force syncing topic ${topicNumber} to preview: "${value}"`);
                        updatePreviewFromSidebar(topicNumber, value);
                    }
                });
            }
            
            if (direction === 'preview-to-sidebar' || direction === 'both') {
                const previewElements = document.querySelectorAll('.topic-title[data-topic-number], .topic-title[data-sync-topic-number]');
                previewElements.forEach((element) => {
                    const topicNumber = element.getAttribute('data-topic-number') || element.getAttribute('data-sync-topic-number');
                    const value = element.textContent.trim();
                    if (value && topicNumber) {
                        console.log(`🔄 Force syncing topic ${topicNumber} to sidebar: "${value}"`);
                        updateSidebarFromPreview(topicNumber, value);
                    }
                });
            }
        },
        
        reinitialize: function() {
            console.log('🔄 REINITIALIZING TOPICS SYNC...');
            
            // Remove existing sync markers
            document.querySelectorAll('[data-sync-initialized]').forEach(el => {
                el.removeAttribute('data-sync-initialized');
            });
            
            // Reinitialize
            initializePreviewSync();
        },
        
        testSync: function() {
            console.log('🧪 Testing bi-directional sync...');
            
            // Test sidebar to preview
            const testValue1 = `Test sync ${Date.now()}`;
            updatePreviewFromSidebar(1, testValue1);
            
            // Test preview to sidebar after a delay
            setTimeout(() => {
                const testValue2 = `Test sync ${Date.now()}`;
                updateSidebarFromPreview(2, testValue2);
            }, 1000);
        },

        
        // ROOT FIX: Manual setup for contenteditable elements - FIXED SCOPE ISSUE
        manualSetup: function() {
            console.log('🔧 MANUALLY SETTING UP PREVIEW SYNC...');
            
            const topicsContainer = document.querySelector('.topics-container');
            if (!topicsContainer) {
                console.log('❌ No topics container found');
                return;
            }
            
            const topicTitles = topicsContainer.querySelectorAll('.topic-title');
            console.log(`Found ${topicTitles.length} topic title elements`);
            
            topicTitles.forEach((element, index) => {
                const topicNumber = index + 1;
                
                // Make sure it's contenteditable
                element.setAttribute('contenteditable', 'true');
                element.setAttribute('data-topic-number', topicNumber);
                
                // Remove existing listeners by cloning
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                
                // CRITICAL FIX: Use event.currentTarget instead of closure variable
                const syncHandler = (event) => {
                    const el = event.currentTarget;
                    const value = el.textContent.trim();
                    const currentTopicNumber = el.getAttribute('data-topic-number');
                    console.log(`🔄 MANUAL SYNC: Topic ${currentTopicNumber} = "${value}"`);
                    updateSidebarFromPreview(currentTopicNumber, value);
                };
                
                newElement.addEventListener('blur', syncHandler);
                newElement.addEventListener('focusout', syncHandler);
                newElement.addEventListener('input', syncHandler);
                newElement.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur(); // FIXED: Use e.currentTarget instead of newElement
                    }
                });
                
                console.log(`✅ MANUAL: Set up topic ${topicNumber} sync`);
            });
            
            console.log('✅ MANUAL PREVIEW SYNC SETUP COMPLETE');
        },
        
        // Expose internal functions for debugging
        _updatePreviewFromSidebar: updatePreviewFromSidebar,
        _updateSidebarFromPreview: updateSidebarFromPreview
    };

})();