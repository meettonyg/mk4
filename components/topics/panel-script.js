/**
 * Topics Component - ROOT FIX: Simplified Bi-Directional Sync
 * ROOT CAUSE: Complex sync architecture with method call errors and race conditions
 * SOLUTION: Simplified event-driven sync with correct method calls and error boundaries
 * 
 * @package Guestify/Components/Topics  
 * @version 5.0.0-root-fix
 */

(function() {
    'use strict';

    console.log('TOPICS: ROOT FIX - Simplified bi-directional sync loading...');

    let isInitialized = false;
    let stateManager = null;
    let currentComponentId = null;
    let syncInProgress = false; // Prevent infinite loops

    /**
     * ROOT FIX: Simplified initialization with proper dependencies
     */
    function initialize() {
        if (isInitialized) {
            console.log('TOPICS: Already initialized');
            return;
        }

        console.log('TOPICS: Starting simplified sync initialization...');
        
        // Get state manager reference with fallbacks
        stateManager = window.enhancedStateManager || window.stateManager || null;
        if (stateManager) {
            console.log('TOPICS: State manager connected:', stateManager.constructor.name);
        } else {
            console.log('TOPICS: No state manager available - sync will be limited');
        }
        
        // Find current component ID
        currentComponentId = findCurrentTopicsComponentId();
        if (currentComponentId) {
            console.log('TOPICS: Found current component ID:', currentComponentId);
        }
        
        // Setup simplified sync (no complex observers)
        setupSimplifiedSync();
        
        isInitialized = true;
        console.log('TOPICS: Simplified sync initialization complete');
    }

    /**
     * ROOT FIX: Find current topics component ID from DOM or state
     */
    function findCurrentTopicsComponentId() {
        // Try to find from currently rendered topics component
        const topicsComponent = document.querySelector('[data-component="topics"]');
        if (topicsComponent && topicsComponent.id) {
            return topicsComponent.id;
        }
        
        // Try to find from state manager
        if (stateManager && typeof stateManager.getState === 'function') {
            try {
                const state = stateManager.getState();
                const topicsComponents = Object.keys(state.components || {})
                    .filter(id => state.components[id].type === 'topics');
                
                if (topicsComponents.length > 0) {
                    return topicsComponents[0]; // Use first topics component
                }
            } catch (error) {
                console.warn('TOPICS: Error finding component ID from state:', error);
            }
        }
        
        console.warn('TOPICS: Could not find current component ID');
        return null;
    }

    /**
     * ROOT FIX: Setup simplified sync without complex observers
     */
    function setupSimplifiedSync() {
        console.log('TOPICS: Setting up simplified bi-directional sync...');
        
        // Setup preview element editing (simplified)
        setupPreviewElementEditing();
        
        // Setup design panel sync (simplified)
        setupDesignPanelEventListeners();
        
        console.log('TOPICS: Simplified sync setup complete');
    }

    /**
     * ROOT FIX: Setup preview elements with event delegation (no re-initialization issues)
     */
    function setupPreviewElementEditing() {
        console.log('TOPICS: Setting up event delegation for preview elements');
        
        // ROOT FIX: Use event delegation on document to catch all current and future elements
        if (!document._topicsEventDelegationSetup) {
            
            // Focus event delegation
            document.addEventListener('focus', function(e) {
                if (e.target.matches('.topic-title[contenteditable="true"]')) {
                    if (syncInProgress) return;
                    const topicNumber = e.target.dataset.topicNumber || getTopicNumber(e.target);
                    console.log(`TOPICS: Focus on topic ${topicNumber}`);
                    e.target.style.backgroundColor = '#fff3cd';
                    e.target.style.border = '2px solid #ffc107';
                    e.target.setAttribute('data-editing', 'true');
                }
            }, true);
            
            // Blur event delegation
            document.addEventListener('blur', function(e) {
                if (e.target.matches('.topic-title[contenteditable="true"]')) {
                    if (syncInProgress) return;
                    const topicNumber = e.target.dataset.topicNumber || getTopicNumber(e.target);
                    console.log(`TOPICS: Blur on topic ${topicNumber}`);
                    e.target.style.backgroundColor = '';
                    e.target.style.border = '';
                    e.target.removeAttribute('data-editing');
                    
                    const value = e.target.textContent.trim();
                    syncPreviewToDesignPanel(topicNumber, value);
                }
            }, true);
            
            // Input event delegation
            document.addEventListener('input', function(e) {
                if (e.target.matches('.topic-title[contenteditable="true"]')) {
                    if (syncInProgress) return;
                    const topicNumber = e.target.dataset.topicNumber || getTopicNumber(e.target);
                    const value = e.target.textContent.trim();
                    console.log(`TOPICS: Input on topic ${topicNumber}: ${value}`);
                    
                    clearTimeout(e.target._syncTimeout);
                    e.target._syncTimeout = setTimeout(() => {
                        syncPreviewToDesignPanel(topicNumber, value);
                    }, 300);
                }
            }, true);
            
            // Keydown event delegation
            document.addEventListener('keydown', function(e) {
                if (e.target.matches('.topic-title[contenteditable="true"]') && e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            }, true);
            
            document._topicsEventDelegationSetup = true;
            console.log('TOPICS: Event delegation setup complete - works for all current and future elements');
        }
        
        // Ensure all visible elements have proper attributes
        const previewElements = document.querySelectorAll('.topic-title');
        previewElements.forEach((element, index) => {
            element.setAttribute('contenteditable', 'true');
            element.setAttribute('data-topic-number', element.dataset.topicNumber || (index + 1));
            element.style.outline = 'none';
            element.style.cursor = 'text';
        });
        
        console.log(`TOPICS: Event delegation ready for ${previewElements.length} elements`);
    }
    
    /**
     * ROOT FIX: Helper function to determine topic number from element
     */
    function getTopicNumber(element) {
        if (element.dataset.topicNumber) return element.dataset.topicNumber;
        
        const allTopics = Array.from(document.querySelectorAll('.topic-title'));
        const index = allTopics.indexOf(element);
        return index >= 0 ? index + 1 : 1;
    }

    /**
     * ROOT FIX: Setup design panel event listeners (simplified)
     */
    function setupDesignPanelEventListeners() {
        console.log('TOPICS: Setting up design panel event listeners...');
        
        // Listen for design panel input changes
        document.addEventListener('input', function(e) {
            const input = e.target;
            
            // Only handle topics-related inputs in design panel
            if (input.matches('textarea[data-property^="topic_"], input[data-property^="topic_"]')) {
                if (syncInProgress) return;
                
                const topicNumber = input.dataset.property.replace('topic_', '');
                const value = input.value.trim();
                
                console.log(`TOPICS: Design panel input changed - topic ${topicNumber}: ${value}`);
                syncDesignPanelToPreview(topicNumber, value);
            }
        });
        
        // Listen for component updates from other systems
        document.addEventListener('gmkb:component-updated', function(e) {
            if (syncInProgress) return;
            
            try {
                if (e.detail && e.detail.component && e.detail.component.type === 'topics') {
                    console.log('TOPICS: Component updated externally, refreshing sync');
                    // Small delay to allow DOM updates
                    setTimeout(() => {
                        refreshSync();
                    }, 100);
                }
            } catch (error) {
                console.error('TOPICS: Component update handler error:', error);
            }
        });
        
        console.log('TOPICS: Design panel event listeners active');
    }

    /**
     * ROOT FIX: Sync preview changes to design panel with correct method calls
     */
    function syncPreviewToDesignPanel(topicNumber, value) {
        if (syncInProgress) return;
        syncInProgress = true;
        
        try {
            console.log(`TOPICS: Syncing preview topic ${topicNumber} = "${value}" to design panel`);
            
            // Update design panel input
            const designPanelInput = document.querySelector(`textarea[data-property="topic_${topicNumber}"], input[data-property="topic_${topicNumber}"]`);
            
            if (designPanelInput && designPanelInput.value !== value) {
                designPanelInput.value = value;
                
                // Dispatch events for design panel to detect changes
                designPanelInput.dispatchEvent(new Event('input', { bubbles: true }));
                designPanelInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                console.log(`TOPICS: Updated design panel input ${topicNumber}`);
            }
            
            // ROOT FIX: Update component using correct method
            if (stateManager && currentComponentId) {
                try {
                    // Use updateComponent method instead of non-existent updateState
                    if (typeof stateManager.updateComponent === 'function') {
                        const newProps = { [`topic_${topicNumber}`]: value };
                        stateManager.updateComponent(currentComponentId, newProps);
                        console.log(`TOPICS: Component updated via updateComponent: ${currentComponentId}`);
                    } else if (window.updateComponentProps && typeof window.updateComponentProps === 'function') {
                        // Fallback to global helper function
                        const newProps = { [`topic_${topicNumber}`]: value };
                        window.updateComponentProps(currentComponentId, newProps);
                        console.log(`TOPICS: Component updated via updateComponentProps: ${currentComponentId}`);
                    } else {
                        console.warn('TOPICS: No component update method available');
                    }
                } catch (stateError) {
                    console.error('TOPICS: Component update error:', stateError);
                }
            }
            
        } catch (error) {
            console.error('TOPICS: syncPreviewToDesignPanel error:', error);
        } finally {
            // Always reset sync flag
            setTimeout(() => {
                syncInProgress = false;
            }, 100);
        }
    }

    /**
     * ROOT FIX: Sync design panel changes to preview (simplified)
     */
    function syncDesignPanelToPreview(topicNumber, value) {
        if (syncInProgress) return;
        syncInProgress = true;
        
        try {
            console.log(`TOPICS: Syncing design panel topic ${topicNumber} = "${value}" to preview`);
            
            // Update preview element
            const previewElement = document.querySelector(`.topic-title[data-topic-number="${topicNumber}"]`);
            
            if (previewElement && previewElement.textContent.trim() !== value) {
                previewElement.textContent = value;
                console.log(`TOPICS: Updated preview topic ${topicNumber}`);
                
                // Update component props via global helper if available
                if (window.updateComponentProps && currentComponentId) {
                    const newProps = { [`topic_${topicNumber}`]: value };
                    window.updateComponentProps(currentComponentId, newProps);
                    console.log(`TOPICS: Updated component props for ${currentComponentId}`);
                }
            }
            
        } catch (error) {
            console.error('TOPICS: syncDesignPanelToPreview error:', error);
        } finally {
            // Reset sync flag
            setTimeout(() => {
                syncInProgress = false;
            }, 100);
        }
    }

    /**
     * ROOT FIX: Refresh sync state (used when external updates occur)
     */
    function refreshSync() {
        if (syncInProgress) return;
        
        console.log('TOPICS: Refreshing sync state...');
        
        try {
            // Re-identify current component if needed
            if (!currentComponentId) {
                currentComponentId = findCurrentTopicsComponentId();
            }
            
            // ROOT FIX: Re-initialize preview elements (important for late-rendered elements)
            setupPreviewElementEditing();
            
            // Get current component data
            if (stateManager && currentComponentId && typeof stateManager.getComponent === 'function') {
                const component = stateManager.getComponent(currentComponentId);
                if (component && component.props) {
                    console.log('TOPICS: Refreshing from component props:', component.props);
                    
                    // Update preview elements from component props
                    for (let i = 1; i <= 5; i++) {
                        const topicKey = `topic_${i}`;
                        if (component.props[topicKey]) {
                            const previewElement = document.querySelector(`.topic-title[data-topic-number="${i}"]`);
                            const designPanelInput = document.querySelector(`textarea[data-property="topic_${i}"], input[data-property="topic_${i}"]`);
                            
                            const value = component.props[topicKey].trim();
                            
                            // Update preview if different
                            if (previewElement && previewElement.textContent.trim() !== value) {
                                previewElement.textContent = value;
                                console.log(`TOPICS: Refreshed preview topic ${i}`);
                            }
                            
                            // Update design panel if different
                            if (designPanelInput && designPanelInput.value.trim() !== value) {
                                designPanelInput.value = value;
                                console.log(`TOPICS: Refreshed design panel topic ${i}`);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('TOPICS: Error refreshing sync:', error);
        }
    }

    /**
     * ROOT FIX: Global API with simplified debugging and testing
     */
    window.TopicsSync = {
        initialize: initialize,
        reinitialize: function() {
            isInitialized = false;
            syncInProgress = false;
            initialize();
        },
        // Manual re-initialization of preview elements
        reinitializePreview: function() {
            console.log('TOPICS: Manually re-initializing preview elements...');
            // Remove existing initialization
            document.querySelectorAll('.topic-title[data-sync-initialized]').forEach(el => {
                el.removeAttribute('data-sync-initialized');
            });
            // Re-setup
            setupPreviewElementEditing();
        },
        
        // ROOT FIX: Expose sync functions for script.js integration
        syncPreviewToDesignPanel: syncPreviewToDesignPanel,
        syncDesignPanelToPreview: syncDesignPanelToPreview,
        refreshSync: refreshSync,
        
        // Test individual element detection
        testElementDetection: function() {
            console.log('TOPICS: Testing element detection...');
            
            const allTopics = document.querySelectorAll('.topic-title');
            const editableTopics = document.querySelectorAll('.topic-title[contenteditable="true"]');
            const initializedTopics = document.querySelectorAll('.topic-title[data-sync-initialized="true"]');
            
            console.log('Element detection results:', {
                allTopics: allTopics.length,
                editableTopics: editableTopics.length,
                initializedTopics: initializedTopics.length
            });
            
            // Show details of first element
            if (allTopics.length > 0) {
                const firstElement = allTopics[0];
                console.log('First topic element details:', {
                    contentEditable: firstElement.contentEditable,
                    hasDataSyncInitialized: firstElement.hasAttribute('data-sync-initialized'),
                    hasDataTopicNumber: firstElement.hasAttribute('data-topic-number'),
                    innerHTML: firstElement.innerHTML,
                    eventListeners: 'Check in Elements tab'
                });
            }
            
            return {
                allTopics: allTopics.length,
                editableTopics: editableTopics.length,
                initializedTopics: initializedTopics.length
            };
        },
        
        // ROOT FIX: Enhanced debugging with correct method names
        debug: function() {
            console.group('TOPICS SYNC DEBUG');
            console.log('Initialized:', isInitialized);
            console.log('Current Component ID:', currentComponentId);
            console.log('State Manager:', stateManager ? stateManager.constructor.name : 'None');
            console.log('State Manager methods:', stateManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(stateManager)) : 'N/A');
            console.log('Sync in progress:', syncInProgress);
            console.log('Preview elements:', document.querySelectorAll('.topic-title[contenteditable="true"]').length);
            console.log('Design panel inputs:', document.querySelectorAll('textarea[data-property^="topic_"], input[data-property^="topic_"]').length);
            console.log('Initialized elements:', document.querySelectorAll('.topic-title[data-sync-initialized]').length);
            
            // Test current component data
            if (stateManager && currentComponentId && typeof stateManager.getComponent === 'function') {
                const component = stateManager.getComponent(currentComponentId);
                console.log('Current component data:', component);
            }
            
            console.groupEnd();
        },
        
        // Test sync functionality
        testSync: function() {
            console.log('TOPICS: Testing bi-directional sync...');
            
            if (!currentComponentId) {
                console.error('No current component ID - cannot test');
                return;
            }
            
            const testValue = `Test ${Date.now()}`;
            console.log(`Testing with value: ${testValue}`);
            
            // Test preview to design panel
            const previewElement = document.querySelector('.topic-title[data-topic-number="1"]');
            if (previewElement) {
                previewElement.textContent = testValue;
                syncPreviewToDesignPanel(1, testValue);
                console.log('Preview to design panel sync tested');
            }
            
            // Test design panel to preview
            setTimeout(() => {
                const designPanelInput = document.querySelector('textarea[data-property="topic_1"], input[data-property="topic_1"]');
                if (designPanelInput) {
                    const testValue2 = `Design Panel Test ${Date.now()}`;
                    designPanelInput.value = testValue2;
                    syncDesignPanelToPreview(1, testValue2);
                    console.log('Design panel to preview sync tested');
                }
            }, 500);
        },
        
        // Manual sync trigger
        forceSyncAll: function() {
            console.log('TOPICS: Force syncing all elements...');
            syncInProgress = false; // Reset flag
            refreshSync();
        }
    };

    /**
     * ROOT FIX: Event-driven initialization - NO POLLING
     */
    
    // Wait for application to be fully ready
    document.addEventListener('gmkb:application-ready', function() {
        console.log('TOPICS: Application ready, initializing sync...');
        initialize();
    });
    
    // Listen for state manager ready
    document.addEventListener('gmkb:state-manager-ready', function() {
        stateManager = window.enhancedStateManager || window.stateManager;
        console.log('TOPICS: State manager connected for sync');
        
        // Initialize if not already done
        if (!isInitialized) {
            initialize();
        }
    });
    
    // Listen for component rendering events with retry mechanism
    document.addEventListener('gmkb:components-rendered', function() {
        console.log('TOPICS: Components rendered, setting up sync...');
        if (!isInitialized) {
            initialize();
        } else {
            // Refresh sync for newly rendered components
            refreshSync();
            // Also re-setup preview elements in case they were re-rendered
            setTimeout(() => {
                setupPreviewElementEditing();
            }, 200);
        }
    });
    
    // Listen for template loaded event (when AJAX template finishes loading)
    document.addEventListener('gmkb:template-loaded', function(e) {
        if (e.detail && e.detail.type === 'topics') {
            console.log('TOPICS: Template loaded, setting up preview elements...');
            setTimeout(() => {
                setupPreviewElementEditing();
            }, 100);
        }
    });
    
    // ROOT FIX: Also listen for DOM mutations to catch late-rendered elements
    if (document.body) {
        const domObserver = new MutationObserver((mutations) => {
            let topicsAdded = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && node.classList.contains('topic-title')) {
                                topicsAdded = true;
                            } else if (node.querySelector && node.querySelector('.topic-title')) {
                                topicsAdded = true;
                            }
                        }
                    });
                }
            });
            
            if (topicsAdded) {
                console.log('TOPICS: New topic elements detected, re-initializing...');
                setTimeout(() => {
                    setupPreviewElementEditing();
                }, 100);
            }
        });
        
        domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Initialize if everything is already ready
    if (document.readyState !== 'loading') {
        // ROOT FIX: Use requestAnimationFrame for proper timing (no setTimeout)
        requestAnimationFrame(() => {
            if (window.gmkbDataReady || window.enhancedStateManager) {
                const componentsExist = document.querySelectorAll('.topic-title[contenteditable="true"]').length > 0;
                if (componentsExist && !isInitialized) {
                    console.log('TOPICS: Components already rendered, initializing sync immediately');
                    initialize();
                }
            }
        });
    }

    console.log('TOPICS: ROOT FIX - Simplified bi-directional sync loaded');

})();
