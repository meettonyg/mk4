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
                
                // Auto-expand existing textareas and fix character counters
                topicInputs.forEach(input => {
                    autoExpand(input);
                    updateCharacterCounter(input); // ROOT FIX: Recalculate based on actual content
                });
                
                console.log('✅ TEMPLATE TOPICS: Initialization complete');
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

        // Save button
        const saveBtn = document.querySelector('.topics-sidebar__save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                // Simulate save
                this.style.background = '#38a169';
                this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>Saved!';
                
                setTimeout(() => {
                    this.style.background = '#3182ce';
                    this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17,21 17,13 7,13 7,21"></polyline><polyline points="7,3 7,8 15,8"></polyline></svg>Save Changes';
                }, 2000);
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

    // ROOT FIX: Enhanced global API for external use and debugging
    window.TopicsTemplate = {
        addTopic: addNewTopic,
        updateCounters: function() {
            console.log('🔄 TEMPLATE TOPICS: Updating all character counters');
            document.querySelectorAll('.topics-sidebar__topic-input').forEach(updateCharacterCounter);
        },
        reinitialize: initializeWhenReady,
        debug: function() {
            console.log('🔍 TEMPLATE TOPICS DEBUG:');
            console.log('- Topic inputs found:', document.querySelectorAll('.topics-sidebar__topic-input').length);
            console.log('- Topics list element:', document.getElementById('topics-list'));
            console.log('- Action buttons found:', document.querySelectorAll('.topics-sidebar__action-btn').length);
            console.log('- Toggle switches found:', document.querySelectorAll('.topics-sidebar__toggle').length);
        }
    };
    
    // ROOT FIX: Expose debug function globally for troubleshooting
    window.debugTopicsSidebar = window.TopicsTemplate.debug;

})();
