/**
 * ROOT FIX: Topics Component - Single-Step Render Complete + Auto-Save
 * ✅ NO JavaScript loading needed - all data pre-loaded server-side
 * ✅ Eliminates race conditions and infinite loading states
 * ✅ Simple, reliable rendering
 * ✅ Auto-save functionality for direct preview editing
 */

(function() {
    'use strict';
    
    console.log('✅ ROOT FIX: Topics component loaded via single-step render - no AJAX calls needed');
    
    // Auto-save debouncer
    let autoSaveTimeout;
    
    // ROOT FIX: CRITICAL - Direct contenteditable initialization
    function initializeContentEditableElements() {
        console.log('🎯 DIRECT INIT: Setting up contenteditable elements...');
        
        const topicTitles = document.querySelectorAll('.topic-title');
        console.log(`🎯 DIRECT INIT: Found ${topicTitles.length} topic title elements`);
        
        topicTitles.forEach((element, index) => {
            const topicNumber = index + 1;
            
            // CRITICAL: Ensure contenteditable is set
            element.setAttribute('contenteditable', 'true');
            element.setAttribute('data-topic-number', topicNumber);
            element.setAttribute('spellcheck', 'false');
            element.style.outline = 'none';
            element.style.cursor = 'text';
            
            // Store original value
            if (!element.hasAttribute('data-original-value')) {
                element.setAttribute('data-original-value', element.textContent.trim());
            }
            
            // CRITICAL: Remove existing listeners to prevent conflicts
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // CRITICAL: Set up simple, reliable event handlers
            newElement.addEventListener('focus', function() {
                console.log(`🎯 FOCUS: Topic ${topicNumber} - editing mode activated`);
                this.setAttribute('data-editing', 'true');
                this.style.backgroundColor = '#fff3cd';
                this.style.borderColor = '#856404';
                this.style.border = '1px solid #856404';
            });
            
            newElement.addEventListener('blur', function() {
                console.log(`🎯 BLUR: Topic ${topicNumber} - editing mode deactivated`);
                this.removeAttribute('data-editing');
                this.style.backgroundColor = '';
                this.style.borderColor = '';
                this.style.border = '';
                
                const newValue = this.textContent.trim();
                const originalValue = this.getAttribute('data-original-value') || '';
                
                if (newValue !== originalValue) {
                    console.log(`📝 VALUE CHANGED: Topic ${topicNumber}: "${originalValue}" → "${newValue}"`);
                    this.setAttribute('data-original-value', newValue);
                    
                    // Auto-save
                    debouncedAutoSave();
                }
            });
            
            newElement.addEventListener('input', function() {
                console.log(`🔤 INPUT: Topic ${topicNumber} - text changed`);
            });
            
            newElement.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log(`⏎ ENTER: Topic ${topicNumber} - finishing edit`);
                    this.blur();
                }
            });
            
            console.log(`✅ DIRECT INIT: Topic ${topicNumber} contenteditable setup complete`);
        });
    }
    
    // Simple initialization to ensure any loading states are resolved
    document.addEventListener('DOMContentLoaded', function() {
        const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"]');
        
        topicsElements.forEach(function(element) {
            // Mark as loaded (defensive - should already be set by template)
            element.setAttribute('data-loading-resolved', 'true');
            element.setAttribute('data-single-step-render', 'true');
            
            // Remove any loading indicators that might still exist
            const loadingElements = element.querySelectorAll('.loading-indicator, .loading-message');
            loadingElements.forEach(function(el) {
                el.style.display = 'none';
            });
            
            // ROOT FIX: Set up auto-save for direct preview editing
            setupPreviewAutoSave(element);
        });
        
        // CRITICAL: Initialize contenteditable elements directly
        initializeContentEditableElements();
        
        // Also try after a short delay to catch dynamically loaded content
        setTimeout(initializeContentEditableElements, 500);
        
        console.log('✅ ROOT FIX: Topics single-step render verification complete');
    });
    
    // ROOT FIX: Also try immediate initialization if DOM is already ready
    if (document.readyState === 'loading') {
        // DOM still loading, wait for DOMContentLoaded
    } else {
        // DOM already loaded, initialize immediately
        initializeContentEditableElements();
        setTimeout(initializeContentEditableElements, 100);
    }
    
    // ROOT FIX: Auto-save functionality for preview editing + MutationObserver for dynamic content
    function setupPreviewAutoSave(topicsComponent) {
        console.log('💾 Setting up preview auto-save for component:', topicsComponent);
        
        function attachListenersToTopics() {
            const editableTopics = topicsComponent.querySelectorAll('.topic-title[contenteditable="true"], .topic-title[data-topic-number]');
            console.log(`💾 Found ${editableTopics.length} editable topics in component`);
            
            editableTopics.forEach(function(topicElement) {
                // Skip if already has listeners
                if (topicElement.hasAttribute('data-auto-save-ready')) {
                    return;
                }
                
                let topicNumber = topicElement.getAttribute('data-topic-number');
                if (!topicNumber) {
                    // Try to get from parent or determine from position
                    const topicItem = topicElement.closest('.topic-item');
                    if (topicItem) {
                        topicNumber = topicItem.getAttribute('data-topic-number') || topicItem.getAttribute('data-topic-index');
                        if (topicNumber && topicItem.getAttribute('data-topic-index')) {
                            topicNumber = parseInt(topicNumber) + 1; // Convert from 0-based to 1-based
                        }
                    }
                }
                
                if (!topicNumber) {
                    console.warn('⚠️ Could not determine topic number for element:', topicElement);
                    return;
                }
                
                console.log(`💾 Setting up auto-save for topic ${topicNumber}`);
                
                // Set up event listeners
                topicElement.addEventListener('blur', function() {
                    const newValue = this.textContent.trim();
                    const originalValue = this.getAttribute('data-original-value') || '';
                    
                    if (newValue !== originalValue) {
                        console.log(`📝 Topic ${topicNumber} changed: "${originalValue}" → "${newValue}"`);
                        
                        // Update the original value
                        this.setAttribute('data-original-value', newValue);
                        
                        // Trigger auto-save with debouncing
                        debouncedAutoSave();
                        
                        // ROOT FIX: Also trigger sync to sidebar
                        if (window.TopicsSync && window.TopicsSync._updateSidebarFromPreview) {
                            window.TopicsSync._updateSidebarFromPreview(topicNumber, newValue);
                        }
                    }
                });
                
                // Enhanced input listener for real-time sync
                topicElement.addEventListener('input', function() {
                    const newValue = this.textContent.trim();
                    
                    // Real-time sync to sidebar (no auto-save on every keystroke)
                    if (window.TopicsSync && window.TopicsSync._updateSidebarFromPreview) {
                        window.TopicsSync._updateSidebarFromPreview(topicNumber, newValue);
                    }
                });
                
                // Also save on Enter key
                topicElement.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.blur(); // Trigger blur event which handles the save
                    }
                });
                
                // Mark as ready
                topicElement.setAttribute('data-auto-save-ready', 'true');
                topicElement.setAttribute('data-topic-number', topicNumber);
            });
        }
        
        // Initial attachment
        attachListenersToTopics();
        
        // ROOT FIX: Set up MutationObserver to catch dynamically added content
        const observer = new MutationObserver(function(mutations) {
            let needsReattachment = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node contains topic elements
                            const hasTopicElements = node.matches && (node.matches('.topic-title, .topic-item') || node.querySelector('.topic-title, .topic-item'));
                            if (hasTopicElements) {
                                needsReattachment = true;
                            }
                        }
                    });
                }
            });
            
            if (needsReattachment) {
                console.log('💾 New topic elements detected, reattaching auto-save listeners...');
                setTimeout(attachListenersToTopics, 100);
            }
        });
        
        observer.observe(topicsComponent, {
            childList: true,
            subtree: true
        });
        
        console.log('💾 Auto-save setup complete with MutationObserver');
    }
    
    /**
     * Debounced auto-save function
     */
    function debouncedAutoSave() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(function() {
            saveTopicsFromPreview();
        }, 1000); // Save 1 second after user stops typing
    }
    
    /**
     * Save all topics from preview to WordPress
     */
    function saveTopicsFromPreview() {
        console.log('💾 Auto-saving topics from preview...');
        
        // Get all topic elements
        const topicElements = document.querySelectorAll('.topic-title[data-topic-number]');
        const topics = {};
        
        topicElements.forEach(function(element) {
            const topicNumber = element.getAttribute('data-topic-number');
            const value = element.textContent.trim();
            
            if (value && topicNumber) {
                topics[`topic_${topicNumber}`] = value;
            }
        });
        
        if (Object.keys(topics).length === 0) {
            console.log('⚠️ No topics to save');
            return;
        }
        
        // Get post ID and nonce
        const postId = getPostId();
        const nonce = getNonce();
        
        if (!postId || !nonce) {
            console.error('❌ Cannot save: Missing post ID or nonce');
            return;
        }
        
        // Prepare form data
        const formData = new FormData();
        formData.append('action', 'save_custom_topics');
        formData.append('post_id', postId);
        formData.append('nonce', nonce);
        
        // Add topics in both formats for compatibility
        Object.keys(topics).forEach(key => {
            const topicNumber = key.replace('topic_', '');
            const value = topics[key];
            
            // MKCG format (primary)
            formData.append(`topics[mkcg_topic_${topicNumber}]`, value);
            // Custom format (fallback)
            formData.append(`topics[${key}]`, value);
        });
        
        formData.append('source', 'preview_auto_save');
        formData.append('timestamp', Date.now());
        
        // Get AJAX URL
        const ajaxUrl = window.gmkbData?.ajaxUrl || window.ajaxurl || '/wp-admin/admin-ajax.php';
        
        // Send the save request
        fetch(ajaxUrl, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Topics auto-saved successfully from preview');
                
                // Visual feedback
                showSaveIndicator('saved');
                
                // Dispatch event for sidebar sync
                document.dispatchEvent(new CustomEvent('topicsAutoSaved', {
                    detail: { topics, source: 'preview' }
                }));
            } else {
                console.error('❌ Auto-save failed:', data.message);
                showSaveIndicator('error');
            }
        })
        .catch(error => {
            console.error('❌ Auto-save network error:', error);
            showSaveIndicator('error');
        });
    }
    
    /**
     * Get post ID from various sources
     */
    function getPostId() {
        if (window.gmkbData && window.gmkbData.postId) {
            return window.gmkbData.postId;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('post_id') || urlParams.get('mkcg_id') || urlParams.get('p') || 0;
    }
    
    /**
     * Get nonce from various sources
     */
    function getNonce() {
        if (window.gmkbData && window.gmkbData.nonce) {
            return window.gmkbData.nonce;
        }
        
        const nonceField = document.querySelector('[name="_wpnonce"], [name="nonce"]');
        return nonceField ? nonceField.value : null;
    }
    
    /**
     * Show save indicator
     */
    function showSaveIndicator(status) {
        // Simple visual feedback - you can enhance this
        const indicator = document.createElement('div');
        indicator.className = `topics-save-indicator topics-save-indicator--${status}`;
        indicator.innerHTML = status === 'saved' ? '✅ Saved' : '❌ Error';
        indicator.style.cssText = 'position: fixed; top: 20px; right: 20px; background: ' + 
            (status === 'saved' ? '#4caf50' : '#f44336') + 
            '; color: white; padding: 8px 16px; border-radius: 4px; z-index: 10000;';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 3000);
    }
    
    // Export functions for debugging
    window.topicsAutoSave = {
        saveNow: saveTopicsFromPreview,
        getTopics: function() {
            const topics = {};
            document.querySelectorAll('.topic-title[data-topic-number]').forEach(function(el) {
                const num = el.getAttribute('data-topic-number');
                const val = el.textContent.trim();
                if (val && num) topics[`topic_${num}`] = val;
            });
            return topics;
        },
        
        // ROOT FIX: Enhanced debugging for sync issues
        debug: function() {
            console.group('🔍 TOPICS AUTO-SAVE DEBUG');
            
            const topicsComponent = document.querySelector('.topics-component, [data-component="topics"]');
            console.log('Topics component found:', !!topicsComponent);
            
            if (topicsComponent) {
                const editableElements = topicsComponent.querySelectorAll('.topic-title');
                console.log(`Found ${editableElements.length} topic title elements:`);
                
                editableElements.forEach((el, i) => {
                    const topicNumber = el.getAttribute('data-topic-number');
                    const isEditable = el.hasAttribute('contenteditable');
                    const hasAutoSave = el.hasAttribute('data-auto-save-ready');
                    const originalValue = el.getAttribute('data-original-value');
                    const currentValue = el.textContent.trim();
                    
                    console.log(`  Topic ${i + 1}:`, {
                        element: el,
                        topicNumber: topicNumber,
                        contenteditable: isEditable,
                        autoSaveReady: hasAutoSave,
                        originalValue: originalValue,
                        currentValue: currentValue,
                        needsSync: originalValue !== currentValue
                    });
                });
                
                // Check for sync integration
                console.log('TopicsSync available:', !!window.TopicsSync);
                if (window.TopicsSync) {
                    console.log('TopicsSync functions:', Object.keys(window.TopicsSync));
                }
            }
            
            console.groupEnd();
        },
        
        forceInitialize: function() {
            console.log('🔄 Force reinitializing auto-save...');
            const topicsComponents = document.querySelectorAll('.topics-component, [data-component="topics"]');
            topicsComponents.forEach(setupPreviewAutoSave);
        },
        
        testSync: function() {
            console.log('🧪 Testing auto-save sync...');
            const firstTopic = document.querySelector('.topic-title[data-topic-number="1"]');
            if (firstTopic) {
                const testValue = `Auto-save test ${Date.now()}`;
                firstTopic.textContent = testValue;
                firstTopic.setAttribute('data-original-value', 'old value');
                
                // Trigger blur to test auto-save
                firstTopic.focus();
                setTimeout(() => {
                    firstTopic.blur();
                    console.log('🧪 Blur event triggered for auto-save test');
                }, 500);
            } else {
                console.log('⚠️ No first topic element found for testing');
            }
        },
        
        // ROOT FIX: Direct contenteditable initialization function
        initializeContentEditableNow: initializeContentEditableElements
    };
    
    // ROOT FIX: Expose the direct initialization globally for manual triggering
    window.initializeTopicsContentEditable = initializeContentEditableElements;
    window.initTopicsEditing = initializeContentEditableElements; // Short alias
    
})();
