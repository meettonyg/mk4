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
    
    // ROOT FIX: Multiple initialization strategies
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWhenReady);
    } else {
        // DOM already loaded, try immediate initialization
        initializeWhenReady();
    }
    
    // ROOT FIX: Also listen for design panel loaded event
    document.addEventListener('designPanelLoaded', function(e) {
        if (e.detail && e.detail.component === 'topics') {
            console.log('✅ TEMPLATE TOPICS: Design panel loaded event received');
            setTimeout(initializeWhenReady, 50); // Small delay to ensure DOM is updated
        }
    });
    
    // ROOT FIX: Listen for when design panel content changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check if topics sidebar was added
                const addedNodes = Array.from(mutation.addedNodes);
                const hasTopicsSidebar = addedNodes.some(node => 
                    node.classList && node.classList.contains('topics-sidebar'));
                    
                if (hasTopicsSidebar) {
                    console.log('✅ TEMPLATE TOPICS: Topics sidebar detected in DOM - initializing');
                    setTimeout(initializeWhenReady, 50);
                }
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

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
        reinitialize: initializeWhenReady,
        collectData: collectTopicsData,
        saveToState: saveTopicsToState,
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
        }
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
        
        // ROOT FIX: Use correct selectors that match the actual template structure
        const topicIndex = topicNumber - 1; // Convert to 0-based index
        const selectors = [
            `.topics-container .topic-item[data-topic-index="${topicIndex}"] .topic-title`,
            `.topics-container .topic-item:nth-child(${topicNumber}) .topic-title`,
            `[data-component="topics"] .topic-item[data-topic-index="${topicIndex}"] .topic-title`,
            `[data-component="topics"] .topic-item:nth-child(${topicNumber}) .topic-title`,
            `.media-kit-component[data-component="topics"] .topic-item[data-topic-index="${topicIndex}"] .topic-title`
        ];
        
        let updated = false;
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && !updated) {
                // Update the text content
                element.textContent = value || `Topic ${topicNumber}`;
                console.log(`✅ SYNC: Updated preview via ${selector}`);
                
                // Visual feedback
                element.style.backgroundColor = '#e3f2fd';
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 300);
                updated = true;
                
                // ROOT FIX: Also dispatch change event for other systems
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
        
        // ROOT FIX: Use more accurate selectors for sidebar items
        const selectors = [
            `.topics-sidebar__topic-item[data-topic-index="${topicNumber}"] .topics-sidebar__topic-input`,
            `.topics-sidebar__topic-item:nth-child(${topicNumber}) .topics-sidebar__topic-input`,
            `#topics-list .topics-sidebar__topic-item:nth-child(${topicNumber}) .topics-sidebar__topic-input`
        ];
        
        let updated = false;
        for (const selector of selectors) {
            const input = document.querySelector(selector);
            if (input && input.value !== value && !updated) {
                input.value = value;
                updateCharacterCounter(input);
                autoExpand(input);
                console.log(`✅ SYNC: Updated sidebar topic ${topicNumber} via ${selector}`);
                
                // Visual feedback
                input.style.borderColor = '#4caf50';
                setTimeout(() => {
                    input.style.borderColor = '';
                }, 300);
                
                updated = true;
                
                // ROOT FIX: Trigger input event to ensure other systems are notified
                input.dispatchEvent(new CustomEvent('input', {
                    detail: { source: 'preview-sync', value, topicNumber }
                }));
            }
        }
        
        if (!updated) {
            console.log(`⚠️ SYNC: No sidebar input found for topic ${topicNumber}`);
            
            // DEBUG: Log available sidebar elements
            const allSidebarInputs = document.querySelectorAll('.topics-sidebar__topic-input');
            console.log('Available sidebar inputs:', allSidebarInputs);
        }
    }
    
    function initializePreviewSync() {
        console.log('🔄 SYNC: Initializing bi-directional sync...');
        
        // ROOT FIX: Multiple initialization attempts with different timing
        function tryInitializePreviewSync(attempt = 1) {
            console.log(`🎯 SYNC: Attempt ${attempt} to initialize preview sync`);
            
            // Use correct selectors matching the template structure
            const selectors = [
                '.topics-container .topic-title[contenteditable="true"]',
                '[data-component="topics"] .topic-title[contenteditable="true"]',
                '.media-kit-component[data-component="topics"] .topic-title[contenteditable="true"]',
                '.topics-component .topic-title[contenteditable="true"]',
                '.topic-title[data-topic-number]'
            ];
            
            let editableTopics = [];
            let foundSelector = '';
            
            // Try each selector until we find elements
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    editableTopics = Array.from(elements);
                    foundSelector = selector;
                    console.log(`🎯 Found ${elements.length} editable topic elements using: ${selector}`);
                    break;
                }
            }
            
            if (editableTopics.length === 0) {
                // AGGRESSIVE FALLBACK: Find any element with topic-related classes and make it editable
                const fallbackElements = document.querySelectorAll('.topic-title, .topic-item .topic-title, [data-topic-number]');
                console.log(`🔍 FALLBACK: Found ${fallbackElements.length} potential topic elements`);
                
                fallbackElements.forEach(element => {
                    if (!element.hasAttribute('contenteditable')) {
                        element.setAttribute('contenteditable', 'true');
                        console.log('🔧 Made element contenteditable:', element);
                    }
                    if (!element.hasAttribute('data-topic-number')) {
                        // Try to determine topic number from parent or position
                        const topicItem = element.closest('.topic-item');
                        if (topicItem) {
                            const topicIndex = topicItem.getAttribute('data-topic-index');
                            const topicNumber = topicItem.getAttribute('data-topic-number');
                            if (topicNumber) {
                                element.setAttribute('data-topic-number', topicNumber);
                            } else if (topicIndex !== null) {
                                element.setAttribute('data-topic-number', parseInt(topicIndex) + 1);
                            }
                        }
                    }
                });
                
                editableTopics = Array.from(fallbackElements);
                foundSelector = 'fallback-elements';
                console.log(`🔧 Created ${editableTopics.length} editable elements via fallback`);
            }
            
            // Set up event listeners for each topic element
            let setupCount = 0;
            editableTopics.forEach((element, index) => {
                // Get topic number from various sources
                let topicNumber = element.getAttribute('data-topic-number');
                if (!topicNumber) {
                    // Try to get from parent
                    const parent = element.closest('[data-topic-number]');
                    if (parent) {
                        topicNumber = parent.getAttribute('data-topic-number');
                        element.setAttribute('data-topic-number', topicNumber);
                    } else {
                        // Use position-based numbering
                        topicNumber = index + 1;
                        element.setAttribute('data-topic-number', topicNumber);
                    }
                }
                
                if (topicNumber && topicNumber <= 5) {
                    // ROOT FIX: Comprehensive event listeners with immediate feedback
                    const syncHandler = function(eventType) {
                        const value = element.textContent.trim();
                        console.log(`🔄 PREVIEW CHANGE [${eventType}]: Topic ${topicNumber} = "${value}"`);
                        
                        // Immediate visual feedback
                        element.style.backgroundColor = '#fff3cd';
                        setTimeout(() => {
                            element.style.backgroundColor = '';
                        }, 200);
                        
                        // Update sidebar
                        updateSidebarFromPreview(topicNumber, value);
                    };
                    
                    // Multiple event types for maximum coverage
                    element.addEventListener('input', () => syncHandler('input'));
                    element.addEventListener('blur', () => syncHandler('blur'));
                    element.addEventListener('focusout', () => syncHandler('focusout'));
                    element.addEventListener('paste', () => {
                        setTimeout(() => syncHandler('paste'), 10);
                    });
                    element.addEventListener('keyup', (e) => {
                        if (e.key === 'Enter') {
                            syncHandler('enter');
                        }
                    });
                    
                    // ROOT FIX: Store reference for debugging and mark as initialized
                    element.setAttribute('data-sync-initialized', 'true');
                    element.setAttribute('data-sync-topic-number', topicNumber);
                    
                    setupCount++;
                    console.log(`✅ Setup sync for topic ${topicNumber} on element:`, element);
                }
            });
            
            if (setupCount > 0) {
                console.log(`✅ SYNC: Successfully set up listeners for ${setupCount} editable elements using ${foundSelector}`);
                return true;
            } else {
                console.log(`⚠️ SYNC: No valid elements found on attempt ${attempt}`);
                
                // DEBUG: Show what elements are available in the DOM
                const debugElements = document.querySelectorAll('*[class*="topic"], *[data*="topic"]');
                console.log('🔍 DEBUG: Available topic-related elements in DOM:', debugElements);
                
                // Try again after a delay if this is not the last attempt
                if (attempt < 5) {
                    setTimeout(() => {
                        tryInitializePreviewSync(attempt + 1);
                    }, 1000 * attempt); // Exponential backoff
                }
                
                return false;
            }
        }
        
        // Start initialization attempts
        setTimeout(() => {
            tryInitializePreviewSync(1);
        }, 500);
        
        // Also try again after a longer delay in case content loads later
        setTimeout(() => {
            const alreadyInitialized = document.querySelectorAll('[data-sync-initialized="true"]').length;
            if (alreadyInitialized === 0) {
                console.log('🔄 SYNC: No initialized elements found, trying late initialization...');
                tryInitializePreviewSync(99); // Special attempt number
            }
        }, 5000);
        
        // Also try to find and monitor the preview area with MutationObserver
        setTimeout(() => {
            const previewArea = document.querySelector('.editable-element[data-component="topics"], .preview-area, .component-preview');
            if (previewArea) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'characterData') {
                            const target = mutation.target;
                            const element = target.parentElement;
                            
                            // Try to detect which topic was changed
                            const parent = element.closest('li, .topic');
                            if (parent) {
                                const topicElements = Array.from(parent.parentElement.children);
                                const index = topicElements.indexOf(parent);
                                const topicNumber = index + 1;
                                
                                if (topicNumber <= 5) {
                                    clearTimeout(window.syncDebounce);
                                    window.syncDebounce = setTimeout(() => {
                                        updateSidebarFromPreview(topicNumber, target.textContent.trim());
                                    }, 200);
                                }
                            }
                        }
                    });
                });
                
                observer.observe(previewArea, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
                
                console.log('✅ SYNC: MutationObserver set up for preview area');
            }
        }, 3000);
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
        
        // Expose internal functions for debugging
        _updatePreviewFromSidebar: updatePreviewFromSidebar,
        _updateSidebarFromPreview: updateSidebarFromPreview
    };

})();
