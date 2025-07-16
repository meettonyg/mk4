/**
 * PHASE 1.3 ROOT FIX: Simplified Topics Component JavaScript
 * ✅ ELIMINATES GMKB dependency race conditions
 * ✅ Simple, reliable initialization without complex event systems
 * ✅ Graceful fallback when GMKB is not available
 * ✅ Direct DOM manipulation for immediate loading resolution
 * ✅ No infinite loading states
 * 
 * @version 1.3.0-simplified
 */

(function() {
    'use strict';
    
    console.log('🚀 PHASE 1.3 Topics: Simplified component loading...');
    
    /**
     * PHASE 1.3: Simplified Topics Manager
     * No GMKB dependencies, pure DOM-based functionality
     */
    class SimplifiedTopicsManager {
        constructor() {
            this.components = new Map();
            this.initialized = false;
            this.initPromise = null;
            
            console.log('📋 PHASE 1.3 Topics: Manager initializing...');
            this.init();
        }
        
        async init() {
            if (this.initPromise) {
                return this.initPromise;
            }
            
            this.initPromise = this.performInit();
            return this.initPromise;
        }
        
        async performInit() {
            try {
                // PHASE 1.3 FIX: Wait for DOM ready
                await this.waitForDOM();
                console.log('✅ PHASE 1.3 Topics: DOM ready');
                
                // PHASE 1.3 FIX: Initialize all topic components immediately
                this.initializeAllComponents();
                
                // PHASE 1.3 FIX: Set up simple save handlers
                this.setupSaveHandlers();
                
                this.initialized = true;
                console.log('✅ PHASE 1.3 Topics: Manager initialized successfully');
                
            } catch (error) {
                console.error('❌ PHASE 1.3 Topics: Initialization failed:', error);
                // PHASE 1.3 FIX: Even on error, try to resolve loading states
                this.forceResolveLoadingStates();
            }
        }
        
        waitForDOM() {
            return new Promise((resolve) => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    resolve();
                }
            });
        }
        
        initializeAllComponents() {
            // PHASE 1.3 FIX: Find all topics components
            const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            
            console.log(`📋 PHASE 1.3 Topics: Found ${topicsElements.length} components`);
            
            topicsElements.forEach((element, index) => {
                try {
                    this.initializeComponent(element, index);
                } catch (error) {
                    console.error(`❌ PHASE 1.3 Topics: Component ${index} init failed:`, error);
                    // PHASE 1.3 FIX: Resolve loading state even on error
                    this.resolveComponentLoadingState(element);
                }
            });
        }
        
        initializeComponent(element, index) {
            const componentId = element.dataset.componentId || `topics_${index}`;
            
            // PHASE 1.3 FIX: Immediately resolve any loading states
            this.resolveComponentLoadingState(element);
            
            // PHASE 1.3 FIX: Set up basic editing functionality
            this.setupComponentEditing(element);
            
            // PHASE 1.3 FIX: Store component reference
            this.components.set(componentId, {
                element: element,
                id: componentId,
                initialized: true
            });
            
            console.log(`✅ PHASE 1.3 Topics: Component ${componentId} initialized`);
        }
        
        resolveComponentLoadingState(element) {
            // PHASE 1.3 FIX: Remove any loading indicators
            const loadingElements = element.querySelectorAll('.loading-indicator, .loading-message, [data-loading="true"]');
            loadingElements.forEach(el => {
                el.style.display = 'none';
                el.remove();
            });
            
            // PHASE 1.3 FIX: Mark as loaded
            element.setAttribute('data-loading-resolved', 'true');
            element.setAttribute('data-phase-1-3-complete', 'true');
            
            // PHASE 1.3 FIX: Ensure topics container is visible
            const container = element.querySelector('.topics-container');
            if (container) {
                container.style.display = '';
                container.setAttribute('data-loading-resolved', 'true');
            }
        }
        
        setupComponentEditing(element) {
            // PHASE 1.3 FIX: Simple contenteditable handling
            const editableElements = element.querySelectorAll('[contenteditable="true"]');
            
            editableElements.forEach(editableEl => {
                // PHASE 1.3 FIX: Simple auto-save on blur
                editableEl.addEventListener('blur', () => {
                    this.scheduleAutoSave(element);
                });
                
                // PHASE 1.3 FIX: Prevent enter key from creating new lines
                editableEl.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        editableEl.blur();
                    }
                });
            });
        }
        
        setupSaveHandlers() {
            // PHASE 1.3 FIX: Simple global save handler
            window.saveTopics = (postId) => {
                this.saveAllComponents(postId);
            };
            
            // PHASE 1.3 FIX: Listen for main save events
            document.addEventListener('mainSaveTriggered', () => {
                this.saveAllComponents();
            });
        }
        
        scheduleAutoSave(element) {
            // PHASE 1.3 FIX: Simple debounced auto-save
            const postId = element.dataset.postId;
            if (!postId) return;
            
            clearTimeout(element._autoSaveTimeout);
            element._autoSaveTimeout = setTimeout(() => {
                this.saveComponent(element);
            }, 2000);
        }
        
        async saveComponent(element) {
            const postId = element.dataset.postId;
            if (!postId) {
                console.warn('⚠️ PHASE 1.3 Topics: No post ID for save');
                return;
            }
            
            try {
                // PHASE 1.3 FIX: Extract topics from DOM
                const topics = this.extractTopicsFromElement(element);
                
                // PHASE 1.3 FIX: Simple AJAX save
                const response = await this.performSave(postId, topics);
                
                if (response.success) {
                    console.log('✅ PHASE 1.3 Topics: Saved successfully');
                    this.showSaveStatus(element, 'saved');
                } else {
                    console.error('❌ PHASE 1.3 Topics: Save failed:', response.message);
                    this.showSaveStatus(element, 'error');
                }
                
            } catch (error) {
                console.error('❌ PHASE 1.3 Topics: Save error:', error);
                this.showSaveStatus(element, 'error');
            }
        }
        
        extractTopicsFromElement(element) {
            const topics = {};
            const topicElements = element.querySelectorAll('.topic-title[contenteditable]');
            
            topicElements.forEach((titleEl, index) => {
                const content = titleEl.textContent.trim();
                if (content) {
                    topics[`topic_${index + 1}`] = content;
                }
            });
            
            return topics;
        }
        
        async performSave(postId, topics) {
            const formData = new FormData();
            formData.append('action', 'save_custom_topics');
            formData.append('post_id', postId);
            formData.append('topics', JSON.stringify(topics));
            formData.append('nonce', this.getNonce());
            
            const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            return response.json();
        }
        
        getNonce() {
            // PHASE 1.3 FIX: Get nonce from multiple possible sources
            return window.guestifyData?.nonce || 
                   window.guestifyMediaKit?.nonce || 
                   document.querySelector('[data-nonce]')?.dataset.nonce ||
                   '';
        }
        
        showSaveStatus(element, status) {
            // PHASE 1.3 FIX: Simple save status indicator
            let statusEl = element.querySelector('.save-status');
            if (!statusEl) {
                statusEl = document.createElement('div');
                statusEl.className = 'save-status';
                statusEl.style.cssText = 'position: absolute; top: 5px; right: 5px; padding: 5px; border-radius: 3px; font-size: 12px; z-index: 1000;';
                element.style.position = 'relative';
                element.appendChild(statusEl);
            }
            
            const configs = {
                saved: { text: '✅ Saved', color: '#10b981', bg: '#f0fdf4' },
                saving: { text: '⏳ Saving...', color: '#f59e0b', bg: '#fffbeb' },
                error: { text: '❌ Error', color: '#ef4444', bg: '#fef2f2' }
            };
            
            const config = configs[status] || configs.saved;
            statusEl.textContent = config.text;
            statusEl.style.color = config.color;
            statusEl.style.backgroundColor = config.bg;
            
            // PHASE 1.3 FIX: Auto-hide after success
            if (status === 'saved') {
                setTimeout(() => {
                    if (statusEl.parentNode) {
                        statusEl.style.opacity = '0';
                        setTimeout(() => statusEl.remove(), 500);
                    }
                }, 2000);
            }
        }
        
        async saveAllComponents(specificPostId = null) {
            console.log('💾 PHASE 1.3 Topics: Saving all components...');
            
            const promises = [];
            this.components.forEach((component) => {
                const postId = specificPostId || component.element.dataset.postId;
                if (postId) {
                    promises.push(this.saveComponent(component.element));
                }
            });
            
            try {
                await Promise.all(promises);
                console.log('✅ PHASE 1.3 Topics: All components saved');
            } catch (error) {
                console.error('❌ PHASE 1.3 Topics: Bulk save error:', error);
            }
        }
        
        forceResolveLoadingStates() {
            // PHASE 1.3 FIX: Emergency function to resolve any stuck loading states
            const allTopicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            
            allTopicsElements.forEach(element => {
                this.resolveComponentLoadingState(element);
            });
            
            console.log('🔧 PHASE 1.3 Topics: Force resolved all loading states');
        }
    }
    
    /**
     * PHASE 1.3 FIX: GMKB Compatibility Layer
     * Provides basic compatibility if GMKB is expected but not available
     */
    function createGMKBCompatibilityLayer() {
        if (!window.GMKB) {
            window.GMKB = {
                dispatch: function(eventName, data) {
                    console.log(`📡 PHASE 1.3 GMKB Fallback: ${eventName}`, data);
                    // PHASE 1.3 FIX: Convert to standard DOM events
                    const event = new CustomEvent(eventName, { detail: data });
                    document.dispatchEvent(event);
                },
                subscribe: function(eventName, callback) {
                    console.log(`🔗 PHASE 1.3 GMKB Fallback: Subscribed to ${eventName}`);
                    document.addEventListener(eventName, (e) => callback({ data: e.detail }));
                    return () => document.removeEventListener(eventName, callback);
                },
                registerSystem: function(name, system) {
                    console.log(`🏗️ PHASE 1.3 GMKB Fallback: Registered ${name}`);
                    window[name] = system;
                }
            };
            console.log('🔧 PHASE 1.3 Topics: GMKB compatibility layer created');
        }
    }
    
    /**
     * PHASE 1.3 FIX: Initialize everything
     */
    function initializePhase13() {
        console.log('🚀 PHASE 1.3 Topics: Starting initialization...');
        
        // PHASE 1.3 FIX: Create GMKB compatibility if needed
        createGMKBCompatibilityLayer();
        
        // PHASE 1.3 FIX: Initialize simplified manager
        window.simplifiedTopicsManager = new SimplifiedTopicsManager();
        
        // PHASE 1.3 FIX: Register with GMKB if available
        if (window.GMKB && window.GMKB.registerSystem) {
            window.GMKB.registerSystem('SimplifiedTopicsManager', window.simplifiedTopicsManager);
        }
        
        // PHASE 1.3 FIX: Emergency fallback - force resolve loading after timeout
        setTimeout(() => {
            if (window.simplifiedTopicsManager) {
                window.simplifiedTopicsManager.forceResolveLoadingStates();
            }
        }, 5000);
        
        console.log('✅ PHASE 1.3 Topics: Initialization complete');
    }
    
    // PHASE 1.3 FIX: Start initialization immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePhase13);
    } else {
        initializePhase13();
    }
    
    // PHASE 1.3 FIX: Expose global debugging functions
    window.debugTopicsPhase13 = function() {
        console.group('🔍 PHASE 1.3 Topics Debug');
        console.log('Manager:', window.simplifiedTopicsManager);
        console.log('Components:', window.simplifiedTopicsManager?.components);
        console.log('GMKB Available:', !!window.GMKB);
        console.log('Topics Elements:', document.querySelectorAll('.topics-component, [data-component="topics"]').length);
        console.groupEnd();
    };
    
    console.log('📝 PHASE 1.3 Topics: Script loaded and ready');
    
})();
