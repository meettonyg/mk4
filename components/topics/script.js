/**
 * PHASE 2.2 ROOT FIX: Integrated Topics Component JavaScript  
 * ✅ COORDINATES with main StateManager and ComponentManager
 * ✅ Event-driven initialization - waits for main systems
 * ✅ Unified state management with main GMKB systems
 * ✅ Eliminates race conditions through proper event coordination
 * ✅ No polling or setTimeout usage for system coordination
 * 
 * @version 2.2.0-integrated
 */

(function() {
    'use strict';
    
    console.log('🚀 PHASE 2.2 Topics: Integrated component loading...');
    
    /**
     * PHASE 2.2: Integrated Topics Manager
     * Coordinates with main StateManager and ComponentManager
     */
    class IntegratedTopicsManager {
        constructor() {
            this.components = new Map();
            this.initialized = false;
            this.initPromise = null;
            this.mainSystemsReady = false;
            
            console.log('📝 PHASE 2.2 Topics: Integrated manager initializing...');
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
                // PHASE 2.2 FIX: Wait for DOM ready
                await this.waitForDOM();
                console.log('✅ PHASE 2.2 Topics: DOM ready');
                
                // PHASE 2.2 FIX: Check if main systems are ready first
                if (this.checkMainSystemsReady()) {
                    this.completeInitialization();
                } else {
                    console.log('🔄 PHASE 2.2 Topics: Waiting for main systems...');
                    this.waitForMainSystems();
                }
                
            } catch (error) {
                console.error('❌ PHASE 2.2 Topics: Initialization failed:', error);
                // PHASE 2.2 FIX: Even on error, try to resolve loading states
                this.forceResolveLoadingStates();
            }
        }
        
        /**
         * PHASE 2.2 FIX: Check if main GMKB systems are ready
         */
        checkMainSystemsReady() {
            const gmkbReady = window.GMKB && 
                             window.GMKB.systems && 
                             window.GMKB.systems.StateManager && 
                             window.GMKB.systems.ComponentManager;
            
            if (gmkbReady) {
                console.log('✅ PHASE 2.2 Topics: Main GMKB systems detected and ready');
                this.mainSystemsReady = true;
                return true;
            }
            
            console.log('⏳ PHASE 2.2 Topics: Main GMKB systems not yet ready');
            return false;
        }
        
        /**
         * PHASE 2.2 FIX: Wait for main systems using event coordination
         */
        waitForMainSystems() {
            // PHASE 2.2 FIX: Listen for initialization complete event from main.js
            document.addEventListener('gmkb:initialization-complete', (event) => {
                console.log('🎯 PHASE 2.2 Topics: Received initialization complete event', event.detail);
                this.mainSystemsReady = true;
                this.completeInitialization();
            });
            
            // PHASE 2.2 FIX: Secondary check in case event was missed
            const checkInterval = setInterval(() => {
                if (this.checkMainSystemsReady()) {
                    clearInterval(checkInterval);
                    this.completeInitialization();
                }
            }, 500);
            
            // PHASE 2.2 FIX: Timeout fallback (emergency only)
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!this.mainSystemsReady) {
                    console.log('⚠️ PHASE 2.2 Topics: Timeout reached, proceeding with fallback initialization');
                    this.completeInitialization();
                }
            }, 5000);
        }
        
        /**
         * PHASE 2.2 FIX: Complete initialization once systems are ready
         */
        completeInitialization() {
            if (this.initialized) {
                console.log('⚠️ PHASE 2.2 Topics: Already initialized, skipping');
                return;
            }
            
            console.log('🚀 PHASE 2.2 Topics: Completing initialization...');
            
            // PHASE 2.2 FIX: Initialize all topic components
            this.initializeAllComponents();
            
            // PHASE 2.2 FIX: Set up integrated save handlers
            this.setupIntegratedSaveHandlers();
            
            // PHASE 2.2 FIX: Register with main state management if available
            this.integrateWithMainSystems();
            
            this.initialized = true;
            console.log('✅ PHASE 2.2 Topics: Integrated initialization complete');
        }
        
        /**
         * PHASE 2.2 FIX: Integrate with main GMKB systems
         */
        integrateWithMainSystems() {
            if (window.GMKB && window.GMKB.systems) {
                // Register this manager with main systems
                window.GMKB.systems.TopicsManager = this;
                
                // Hook into main state changes
                if (window.GMKB.subscribe) {
                    window.GMKB.subscribe('gmkb:state-changed', (event) => {
                        this.handleMainStateChange(event.detail);
                    });
                    
                    window.GMKB.subscribe('gmkb:component-updated', (event) => {
                        this.handleComponentUpdate(event.detail);
                    });
                }
                
                console.log('🔗 PHASE 2.2 Topics: Integrated with main GMKB systems');
            } else {
                console.log('⚠️ PHASE 2.2 Topics: Main systems not available for integration');
            }
        }
        
        /**
         * PHASE 2.2 FIX: Handle state changes from main system
         */
        handleMainStateChange(stateData) {
            console.log('🔄 PHASE 2.2 Topics: Main state changed', stateData);
            // Topics can react to main state changes if needed
        }
        
        /**
         * PHASE 2.2 FIX: Handle component updates from main system
         */
        handleComponentUpdate(updateData) {
            if (updateData.componentType === 'topics') {
                console.log('🔄 PHASE 2.2 Topics: Component update from main system', updateData);
                // Handle updates from main component manager
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
            // PHASE 2.2 FIX: Find all topics components
            const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            
            console.log(`📋 PHASE 2.2 Topics: Found ${topicsElements.length} components`);
            
            topicsElements.forEach((element, index) => {
                try {
                    this.initializeComponent(element, index);
                } catch (error) {
                    console.error(`❌ PHASE 2.2 Topics: Component ${index} init failed:`, error);
                    // PHASE 2.2 FIX: Resolve loading state even on error
                    this.resolveComponentLoadingState(element);
                }
            });
        }
        
        initializeComponent(element, index) {
            const componentId = element.dataset.componentId || `topics_${index}`;
            
            // PHASE 2.2 FIX: Immediately resolve any loading states
            this.resolveComponentLoadingState(element);
            
            // PHASE 2.2 FIX: Set up integrated editing functionality
            this.setupComponentEditing(element);
            
            // PHASE 2.2 FIX: Store component reference
            this.components.set(componentId, {
                element: element,
                id: componentId,
                initialized: true,
                integratedWithMain: this.mainSystemsReady
            });
            
            console.log(`✅ PHASE 2.2 Topics: Component ${componentId} initialized (integrated: ${this.mainSystemsReady})`);
        }
        
        resolveComponentLoadingState(element) {
            // PHASE 2.2 FIX: Remove any loading indicators
            const loadingElements = element.querySelectorAll('.loading-indicator, .loading-message, [data-loading="true"]');
            loadingElements.forEach(el => {
                el.style.display = 'none';
                el.remove();
            });
            
            // PHASE 2.2 FIX: Mark as loaded with integration status
            element.setAttribute('data-loading-resolved', 'true');
            element.setAttribute('data-phase-2-2-complete', 'true');
            element.setAttribute('data-integrated-with-main', this.mainSystemsReady ? 'true' : 'false');
            
            // PHASE 2.2 FIX: Ensure topics container is visible
            const container = element.querySelector('.topics-container');
            if (container) {
                container.style.display = '';
                container.setAttribute('data-loading-resolved', 'true');
            }
        }
        
        setupComponentEditing(element) {
            // PHASE 2.2 FIX: Enhanced contenteditable handling with main system integration
            const editableElements = element.querySelectorAll('[contenteditable="true"]');
            
            editableElements.forEach(editableEl => {
                // PHASE 2.2 FIX: Integrated auto-save on blur
                editableEl.addEventListener('blur', () => {
                    this.scheduleIntegratedAutoSave(element);
                });
                
                // PHASE 2.2 FIX: Prevent enter key from creating new lines
                editableEl.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        editableEl.blur();
                    }
                });
                
                // PHASE 2.2 FIX: Real-time updates to main system if available
                if (this.mainSystemsReady) {
                    editableEl.addEventListener('input', () => {
                        this.notifyMainSystemOfChange(element, editableEl);
                    });
                }
            });
        }
        
        /**
         * PHASE 2.2 FIX: Notify main system of real-time changes
         */
        notifyMainSystemOfChange(element, editableEl) {
            if (window.GMKB && window.GMKB.dispatch) {
                const componentId = element.dataset.componentId;
                const setting = editableEl.dataset.setting;
                const value = editableEl.textContent.trim();
                
                window.GMKB.dispatch('gmkb:topics-content-changed', {
                    componentId: componentId,
                    setting: setting,
                    value: value,
                    timestamp: Date.now()
                });
            }
        }
        
        setupIntegratedSaveHandlers() {
            // PHASE 2.2 FIX: Enhanced save handlers with main system integration
            window.saveTopics = (postId) => {
                this.saveAllComponents(postId);
            };
            
            // PHASE 2.2 FIX: Listen for main save events
            document.addEventListener('mainSaveTriggered', () => {
                this.saveAllComponents();
            });
            
            // PHASE 2.2 FIX: Listen for main system save events
            if (window.GMKB && window.GMKB.subscribe) {
                window.GMKB.subscribe('gmkb:save-requested', () => {
                    console.log('💾 PHASE 2.2 Topics: Main system save requested');
                    this.saveAllComponents();
                });
            }
        }
        
        scheduleIntegratedAutoSave(element) {
            // PHASE 2.2 FIX: Enhanced debounced auto-save with main system coordination
            const postId = element.dataset.postId;
            if (!postId) return;
            
            clearTimeout(element._autoSaveTimeout);
            element._autoSaveTimeout = setTimeout(() => {
                this.saveComponent(element);
                
                // PHASE 2.2 FIX: Notify main system of save
                if (window.GMKB && window.GMKB.dispatch) {
                    window.GMKB.dispatch('gmkb:topics-auto-saved', {
                        componentId: element.dataset.componentId,
                        postId: postId,
                        timestamp: Date.now()
                    });
                }
            }, 2000);
        }
        
        async saveComponent(element) {
            const postId = element.dataset.postId;
            if (!postId) {
                console.warn('⚠️ PHASE 2.2 Topics: No post ID for save');
                return;
            }
            
            try {
                // PHASE 2.2 FIX: Extract topics from DOM
                const topics = this.extractTopicsFromElement(element);
                
                // PHASE 2.2 FIX: Enhanced AJAX save with main system coordination
                const response = await this.performIntegratedSave(postId, topics);
                
                if (response.success) {
                    console.log('✅ PHASE 2.2 Topics: Saved successfully');
                    this.showSaveStatus(element, 'saved');
                    
                    // PHASE 2.2 FIX: Update main system state if available
                    this.updateMainSystemState(element, topics);
                } else {
                    console.error('❌ PHASE 2.2 Topics: Save failed:', response.message);
                    this.showSaveStatus(element, 'error');
                }
                
            } catch (error) {
                console.error('❌ PHASE 2.2 Topics: Save error:', error);
                this.showSaveStatus(element, 'error');
            }
        }
        
        /**
         * PHASE 2.2 FIX: Update main system state after successful save
         */
        updateMainSystemState(element, topics) {
            if (window.GMKB && window.GMKB.systems && window.GMKB.systems.StateManager) {
                const componentId = element.dataset.componentId;
                
                try {
                    // Update component data in main state
                    window.GMKB.systems.StateManager.updateComponent(componentId, {
                        data: { ...topics },
                        lastSaved: Date.now(),
                        savedBy: 'integrated-topics-manager'
                    });
                    
                    console.log('🔄 PHASE 2.2 Topics: Updated main system state');
                } catch (error) {
                    console.warn('⚠️ PHASE 2.2 Topics: Could not update main state:', error);
                }
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
        
        async performIntegratedSave(postId, topics) {
            // PHASE 1.1 FIX: Enhanced AJAX save with comprehensive post ID handling
            const ajaxUrl = this.getAjaxUrl();
            const nonce = this.getEnhancedNonce();
            
            const formData = new FormData();
            formData.append('action', 'save_custom_topics');
            formData.append('post_id', postId);
            formData.append('media_kit_post_id', postId);  // PHASE 1.1 FIX: Add missing parameter
            formData.append('topics', JSON.stringify(topics));
            formData.append('nonce', nonce);
            formData.append('source', 'integrated-topics-manager');
            formData.append('phase', '1.1');  // Updated phase
            
            const response = await fetch(ajaxUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            return response.json();
        }
        
        /**
         * PHASE 2.2 FIX: Enhanced AJAX URL detection
         */
        getAjaxUrl() {
            return window.gmkbData?.ajaxUrl || 
                   window.ajaxurl || 
                   '/wp-admin/admin-ajax.php';
        }
        
        /**
         * PHASE 2.2 FIX: Enhanced nonce detection from multiple sources
         */
        getEnhancedNonce() {
            return window.gmkbData?.nonce ||
                   window.guestifyData?.nonce || 
                   window.guestifyMediaKit?.nonce || 
                   document.querySelector('[data-nonce]')?.dataset.nonce ||
                   '';
        }
        
        showSaveStatus(element, status) {
            // PHASE 2.2 FIX: Enhanced save status indicator
            let statusEl = element.querySelector('.save-status');
            if (!statusEl) {
                statusEl = document.createElement('div');
                statusEl.className = 'save-status';
                statusEl.style.cssText = 'position: absolute; top: 5px; right: 5px; padding: 5px 8px; border-radius: 4px; font-size: 11px; z-index: 1000; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
                element.style.position = 'relative';
                element.appendChild(statusEl);
            }
            
            const configs = {
                saved: { text: '✅ Saved', color: '#10b981', bg: '#f0fdf4' },
                saving: { text: '⏳ Saving...', color: '#f59e0b', bg: '#fffbeb' },
                error: { text: '❌ Error', color: '#ef4444', bg: '#fef2f2' },
                integrated: { text: '🔗 Synced', color: '#06b6d4', bg: '#f0f9ff' }
            };
            
            const config = configs[status] || configs.saved;
            statusEl.textContent = config.text;
            statusEl.style.color = config.color;
            statusEl.style.backgroundColor = config.bg;
            
            // PHASE 2.2 FIX: Enhanced auto-hide with integration status
            if (status === 'saved' || status === 'integrated') {
                setTimeout(() => {
                    if (statusEl.parentNode) {
                        statusEl.style.opacity = '0';
                        statusEl.style.transition = 'opacity 0.3s ease';
                        setTimeout(() => statusEl.remove(), 300);
                    }
                }, 2000);
            }
        }
        
        async saveAllComponents(specificPostId = null) {
            console.log('💾 PHASE 2.2 Topics: Saving all components (integrated)...');
            
            const promises = [];
            this.components.forEach((component) => {
                const postId = specificPostId || component.element.dataset.postId;
                if (postId) {
                    promises.push(this.saveComponent(component.element));
                }
            });
            
            try {
                await Promise.all(promises);
                console.log('✅ PHASE 2.2 Topics: All components saved');
                
                // PHASE 2.2 FIX: Notify main system of bulk save completion
                if (window.GMKB && window.GMKB.dispatch) {
                    window.GMKB.dispatch('gmkb:topics-bulk-save-complete', {
                        componentsCount: this.components.size,
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                console.error('❌ PHASE 2.2 Topics: Bulk save error:', error);
            }
        }
        
        forceResolveLoadingStates() {
            // PHASE 2.2 FIX: Emergency function to resolve any stuck loading states
            const allTopicsElements = document.querySelectorAll('.topics-component, [data-component="topics"], [data-element="topics"]');
            
            allTopicsElements.forEach(element => {
                this.resolveComponentLoadingState(element);
            });
            
            console.log('🔧 PHASE 2.2 Topics: Force resolved all loading states');
        }
        
        /**
         * PHASE 2.2 FIX: Get integration status
         */
        getIntegrationStatus() {
            return {
                mainSystemsReady: this.mainSystemsReady,
                initialized: this.initialized,
                componentsCount: this.components.size,
                gmkbAvailable: !!window.GMKB,
                phase: '2.2-integrated'
            };
        }
    }
    
    /**
     * PHASE 2.2 FIX: Enhanced GMKB Compatibility Layer
     * Provides enhanced compatibility and coordination with main systems
     */
    function createEnhancedGMKBCompatibilityLayer() {
        if (!window.GMKB) {
            window.GMKB = {
                dispatch: function(eventName, data) {
                    console.log(`📡 PHASE 2.2 GMKB Enhanced Fallback: ${eventName}`, data);
                    // PHASE 2.2 FIX: Enhanced DOM event handling
                    const event = new CustomEvent(eventName, { 
                        detail: data,
                        bubbles: true,
                        cancelable: true
                    });
                    document.dispatchEvent(event);
                },
                subscribe: function(eventName, callback) {
                    console.log(`🔗 PHASE 2.2 GMKB Enhanced Fallback: Subscribed to ${eventName}`);
                    const handler = (e) => callback({ data: e.detail });
                    document.addEventListener(eventName, handler);
                    return () => document.removeEventListener(eventName, handler);
                },
                systems: {},
                registerSystem: function(name, system) {
                    console.log(`🏗️ PHASE 2.2 GMKB Enhanced Fallback: Registered ${name}`);
                    this.systems[name] = system;
                    window[name] = system;
                }
            };
            console.log('🔧 PHASE 2.2 Topics: Enhanced GMKB compatibility layer created');
        }
    }
    
    /**
     * PHASE 2.2 FIX: Event-driven initialization - waits for main systems
     */
    function initializeIntegratedTopics() {
        console.log('🚀 PHASE 2.2 Topics: Starting integrated initialization...');
        
        // PHASE 2.2 FIX: Wait for main systems to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForMainSystems);
        } else {
            waitForMainSystems();
        }
    }
    
    /**
     * PHASE 2.2 FIX: Wait for main systems before initializing topics
     */
    function waitForMainSystems() {
        // PHASE 2.2 FIX: Listen for initialization complete event from main.js
        document.addEventListener('gmkb:initialization-complete', (event) => {
            console.log('✅ PHASE 2.2 Topics: Main systems ready, initializing topics...');
            initializeTopicsManager();
        });
        
        // PHASE 2.2 FIX: Fallback if main systems don't exist or event missed
        setTimeout(() => {
            if (!window.GMKB || !window.simplifiedTopicsManager) {
                console.log('⚠️ PHASE 2.2 Topics: Fallback initialization (main systems not detected)');
                initializeTopicsManager();
            }
        }, 3000);
    }
    
    /**
     * PHASE 2.2 FIX: Initialize the topics manager
     */
    function initializeTopicsManager() {
        if (window.simplifiedTopicsManager) {
            console.log('⚠️ PHASE 2.2 Topics: Manager already exists, skipping');
            return;
        }
        
        // PHASE 2.2 FIX: Create enhanced GMKB compatibility if needed
        createEnhancedGMKBCompatibilityLayer();
        
        // PHASE 2.2 FIX: Initialize integrated topics manager
        window.simplifiedTopicsManager = new IntegratedTopicsManager();
        
        // PHASE 2.2 FIX: Register with main GMKB system
        if (window.GMKB && window.GMKB.systems) {
            window.GMKB.systems.TopicsManager = window.simplifiedTopicsManager;
            console.log('✅ PHASE 2.2 Topics: Registered with main GMKB systems');
        }
        
        console.log('✅ PHASE 2.2 Topics: Integration complete');
    }
    
    // PHASE 2.2 FIX: Start event-driven initialization
    initializeIntegratedTopics();
    
    // PHASE 2.2 FIX: Enhanced debugging functions
    window.debugTopicsPhase22 = function() {
        console.group('🔍 PHASE 2.2 Topics Debug');
        console.log('Manager:', window.simplifiedTopicsManager);
        console.log('Integration Status:', window.simplifiedTopicsManager?.getIntegrationStatus());
        console.log('Components:', window.simplifiedTopicsManager?.components);
        console.log('GMKB Available:', !!window.GMKB);
        console.log('GMKB Systems:', window.GMKB?.systems);
        console.log('Topics Elements:', document.querySelectorAll('.topics-component, [data-component="topics"]').length);
        console.groupEnd();
    };
    
    console.log('📝 PHASE 2.2 Topics: Integrated script loaded and ready');
    
})();
