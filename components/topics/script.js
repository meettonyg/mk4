/**
 * Topics Component - Preview Sync Script  
 * Handles preview contenteditable functionality and sync
 * 
 * @package Guestify/Components/Topics
 * @version 4.0.0-preview-sync
 */

(function() {
    'use strict';
    
    console.log('🎯 TOPICS: Preview sync script loading...');
    
    let isInitialized = false;

    /**
     * Initialize preview contenteditable elements
     */
    function initializePreview() {
        if (isInitialized) return;
        
        const topicElements = document.querySelectorAll('.topic-title');
        console.log(`🎯 TOPICS: Initializing ${topicElements.length} preview elements`);
        
        if (topicElements.length === 0) {
            console.log('⏳ TOPICS: No preview elements found yet, will retry when ready');
            return false;
        }
        
        topicElements.forEach((element, index) => {
            const topicNumber = index + 1;
            
            // Ensure proper setup
            element.setAttribute('contenteditable', 'true');
            element.setAttribute('data-topic-number', topicNumber);
            element.style.outline = 'none';
            element.style.cursor = 'text';
            
            // ROOT FIX: Skip if TopicsSync already handled this element
            if (element.hasAttribute('data-sync-initialized')) {
                console.log(`🎯 TOPICS: Element ${topicNumber} already initialized by TopicsSync`);
                return;
            }
            
            // Only add listeners if not already initialized by this script
            if (!element.hasAttribute('data-preview-initialized')) {
                // Focus styling
                element.addEventListener('focus', function() {
                    this.setAttribute('data-editing', 'true');
                    this.style.backgroundColor = '#fff3cd';
                    this.style.border = '1px solid #856404';
                });
                
                // Blur handling
                element.addEventListener('blur', function() {
                    this.removeAttribute('data-editing');
                    this.style.backgroundColor = '';
                    this.style.border = '';
                    
                    const value = this.textContent.trim();
                    handlePreviewChange(topicNumber, value);
                });
                
                // Enter key handling
                element.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.blur();
                    }
                });
                
                element.setAttribute('data-preview-initialized', 'true');
            }
        });
        
        isInitialized = true;
        console.log('✅ TOPICS: Preview elements initialized');
        return true;
    }
    
    /**
     * ROOT FIX: Handle preview element changes - integrate with panel-script.js
     */
    function handlePreviewChange(topicNumber, value) {
        console.log(`📝 TOPICS: Preview ${topicNumber} changed to: "${value}"`);
        
        // ROOT FIX: Call panel-script.js sync directly instead of events
        if (window.TopicsSync && typeof window.TopicsSync.syncPreviewToDesignPanel === 'function') {
            window.TopicsSync.syncPreviewToDesignPanel(topicNumber, value);
        } else {
            // Fallback: Try to find design panel input directly
            const designPanelInput = document.querySelector(`textarea[data-property="topic_${topicNumber}"], input[data-property="topic_${topicNumber}"]`);
            if (designPanelInput && designPanelInput.value !== value) {
                designPanelInput.value = value;
                designPanelInput.dispatchEvent(new Event('input', { bubbles: true }));
                designPanelInput.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`📝 TOPICS: Updated design panel input ${topicNumber} directly`);
            }
        }
        
        // Auto-save after changes
        clearTimeout(window.topicsPreviewAutoSave);
        window.topicsPreviewAutoSave = setTimeout(saveTopics, 1000);
    }
    
    /**
     * Save topics to backend
     */
    function saveTopics() {
        const topics = {};
        document.querySelectorAll('.topic-title[data-topic-number]').forEach(element => {
            const topicNumber = element.getAttribute('data-topic-number');
            const value = element.textContent.trim();
            
            if (value && topicNumber) {
                topics[`topic_${topicNumber}`] = value;
            }
        });
        
        if (Object.keys(topics).length === 0) return;
        
        console.log('💾 TOPICS: Auto-saving from preview...', topics);
        
        const formData = new FormData();
        formData.append('action', 'save_custom_topics');
        formData.append('post_id', getPostId());
        formData.append('nonce', getNonce());
        
        Object.keys(topics).forEach(key => {
            formData.append(`topics[${key}]`, topics[key]);
            formData.append(`topics[mkcg_${key}]`, topics[key]);
        });
        
        fetch(getAjaxUrl(), {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ TOPICS: Preview auto-saved');
                document.dispatchEvent(new CustomEvent('gmkb:topics-saved', { 
                    detail: { topics, source: 'preview' } 
                }));
            } else {
                console.error('❌ TOPICS: Preview save failed:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ TOPICS: Preview save error:', error);
        });
    }
    
    /**
     * Utility functions
     */
    function getPostId() {
        return window.gmkbData?.postId || 
               new URLSearchParams(window.location.search).get('post_id') || 
               0;
    }
    
    function getNonce() {
        return window.gmkbData?.nonce || '';
    }
    
    function getAjaxUrl() {
        return window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php';
    }
    
    /**
     * Global API
     */
    window.TopicsPreview = {
        initialize: initializePreview,
        reinitialize: function() {
            isInitialized = false;
            // Remove existing initialization markers
            document.querySelectorAll('.topic-title[data-preview-initialized]').forEach(el => {
                el.removeAttribute('data-preview-initialized');
            });
            initializePreview();
        },
        saveNow: saveTopics,
        debug: function() {
            console.group('🔍 TOPICS PREVIEW DEBUG');
            console.log('Initialized:', isInitialized);
            console.log('Preview elements:', document.querySelectorAll('.topic-title').length);
            console.log('Initialized elements:', document.querySelectorAll('.topic-title[data-preview-initialized]').length);
            console.groupEnd();
        }
    };
    
    /**
     * ROOT FIX: Event-driven initialization that actually works
     */
    
    // Wait for application ready
    document.addEventListener('gmkb:application-ready', function() {
        console.log('🎯 TOPICS: Preview initializing after application ready...');
        initializePreview();
    });
    
    // ROOT FIX: Listen for TopicsSync system initialization
    document.addEventListener('gmkb:topics-preview-initialized', function(e) {
        console.log('🎯 TOPICS: TopicsSync initialized, checking if script.js needs to run...');
        
        // If TopicsSync is handling it, we can skip script.js initialization
        if (window.TopicsSync && typeof window.TopicsSync.syncPreviewToDesignPanel === 'function') {
            console.log('🎯 TOPICS: TopicsSync is available - script.js will coordinate instead of duplicate');
            // Don't duplicate - just ensure coordination
        } else {
            console.log('🎯 TOPICS: TopicsSync not available - script.js will initialize preview');
            initializePreview();
        }
    });
    
    // ROOT FIX: Listen for components rendered event
    document.addEventListener('gmkb:components-rendered', function() {
        console.log('🎯 TOPICS: Components rendered - checking preview initialization...');
        
        // Only initialize if TopicsSync isn't handling it
        if (!window.TopicsSync || !isInitialized) {
            initializePreview();
        }
    });
    
    // Immediate initialization if components already exist
    if (document.readyState !== 'loading') {
        // ROOT FIX: Use requestAnimationFrame for proper timing
        requestAnimationFrame(() => {
            const hasElements = document.querySelectorAll('.topic-title').length > 0;
            if (hasElements) {
                console.log('🎯 TOPICS: Preview elements found, initializing immediately');
                initializePreview();
            }
        });
    }
    
    console.log('✅ TOPICS: Preview sync script loaded');
    
    /**
     * ROOT FIX: Integrated Topics Save Handler (from TopicsEditorSaveHandler.js)
     * Saves topics directly to Pods custom fields
     * This eliminates the 404 error and follows component self-contained architecture
     */
    class TopicsEditorSaveHandler {
        constructor() {
            this.logger = window.structuredLogger || console;
            this.init();
        }
        
        init() {
            // Listen for topics updates from the editor
            document.addEventListener('gmkb:component-content-updated', (event) => {
                if (event.detail && event.detail.data && event.detail.data.topics) {
                    const componentId = event.detail.componentId;
                    
                    // Check if this is a topics component
                    const component = window.enhancedStateManager?.getState()?.components?.[componentId];
                    if (component && component.type === 'topics') {
                        this.saveTopicsToPods(event.detail.data.topics);
                    }
                }
            });
        }
        
        saveTopicsToPods(topics) {
            const postId = window.gmkbData?.postId || window.gmkbData?.post_id;
            
            if (!postId) {
                this.logger.error('TOPICS_SAVE', 'No post ID available for saving');
                return;
            }
            
            // Prepare the data for Pods
            const formData = new FormData();
            formData.append('action', 'gmkb_save_topics_to_pods');
            formData.append('post_id', postId);
            formData.append('topics', JSON.stringify(topics));
            formData.append('nonce', window.gmkbData.nonce);
            
            // Save to Pods via AJAX
            fetch(window.gmkbData.ajaxUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.logger.info('TOPICS_SAVE', `Saved ${topics.length} topics to Pods`);
                    
                    // Show success toast if available
                    if (window.showToast) {
                        window.showToast('Topics saved', 'success');
                    }
                } else {
                    this.logger.error('TOPICS_SAVE', 'Failed to save topics:', result.data);
                }
            })
            .catch(error => {
                this.logger.error('TOPICS_SAVE', 'Error saving topics:', error);
            });
        }
    }
    
    // Initialize the save handler
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.topicsEditorSaveHandler = new TopicsEditorSaveHandler();
            console.log('✅ TOPICS: Save handler initialized');
        });
    } else {
        window.topicsEditorSaveHandler = new TopicsEditorSaveHandler();
        console.log('✅ TOPICS: Save handler initialized');
    }
    
})();
