/**
 * Topics Component JavaScript - ROOT FIX Version
 * Implements event-driven save functionality with no polling
 */

class TopicsComponent {
    constructor(element) {
        this.element = element;
        this.topics = [];
        this.postId = null;
        this.saveTimeout = null;
        this.lastSaveTimestamp = Date.now();
        this.unsavedChanges = false;
        this.saveStatus = 'saved'; // 'saved', 'saving', 'unsaved', 'error'
        this.nonce = window.guestifyData?.nonce || window.guestifyMediaKit?.nonce || '';
        
        // ROOT FIX: Debug nonce availability
        if (this.nonce) {
            console.log('✅ Topics Component: Nonce found:', this.nonce.substring(0, 10) + '...');
        } else {
            console.warn('⚠️ Topics Component: No nonce available - save functionality may fail');
        }
        
        this.init();
    }

    init() {
        console.log('🚀 Topics Component ROOT FIX: Initializing event-driven save system');
        
        this.extractPostId();
        this.extractExistingTopics();
        this.setupEventListeners();
        this.setupSaveInterface();
        this.setupAutoSave();
        
        // ROOT FIX: Event-driven architecture - listen for system ready events
        if (window.addEventListener) {
            window.addEventListener('mediaKitSystemReady', this.handleSystemReady.bind(this));
            window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
            
            // ROOT FIX: Listen for main save button events
            window.addEventListener('mainSaveTriggered', this.handleMainSave.bind(this));
        }
        
        // ROOT FIX: Integrate with main save system if available
        if (window.enhancedSystemRegistrar) {
            window.enhancedSystemRegistrar.addEventListener('save', this.handleMainSave.bind(this));
        }
        
        console.log(`✅ Topics Component: Initialized for post ${this.postId} with ${this.topics.length} topics`);
    }
    
    /**
     * ROOT FIX: Extract post ID from multiple sources with fallback chain
     */
    extractPostId() {
        // Priority 1: Data attribute on component
        this.postId = this.element.dataset.postId;
        
        // Priority 2: Container data attributes
        if (!this.postId) {
            const container = this.element.querySelector('.topics-container');
            if (container) {
                this.postId = container.dataset.postId;
            }
        }
        
        // Priority 3: URL parameters
        if (!this.postId) {
            const urlParams = new URLSearchParams(window.location.search);
            this.postId = urlParams.get('post_id') || urlParams.get('p') || urlParams.get('page_id');
        }
        
        // Priority 4: Global WordPress variables (check both sources)
        if (!this.postId && (window.guestifyData?.postId || window.guestifyMediaKit?.postId)) {
            this.postId = window.guestifyData?.postId || window.guestifyMediaKit?.postId;
        }
        
        // Convert to integer
        this.postId = this.postId ? parseInt(this.postId, 10) : null;
        
        if (!this.postId || this.postId <= 0) {
            console.warn('⚠️ Topics Component: No valid post ID detected');
            this.postId = null;
        } else {
            console.log(`✅ Topics Component: Post ID detected: ${this.postId}`);
        }
    }
    
    /**
     * ROOT FIX: Extract existing topics from DOM for baseline
     */
    extractExistingTopics() {
        this.topics = [];
        const topicItems = this.element.querySelectorAll('.topic-item');
        
        topicItems.forEach((item, index) => {
            const titleElement = item.querySelector('.topic-title');
            const descElement = item.querySelector('.topic-description');
            
            if (titleElement) {
                const topicData = {
                    index: index,
                    title: titleElement.textContent.trim(),
                    description: descElement ? descElement.textContent.trim() : '',
                    element: item,
                    titleElement: titleElement,
                    descElement: descElement,
                    metaKey: item.dataset.metaKey || `topic_${index + 1}`,
                    source: item.dataset.topicSource || 'custom_post_fields'
                };
                
                this.topics.push(topicData);
            }
        });
        
        console.log(`📊 Topics Component: Extracted ${this.topics.length} existing topics`);
    }

    /**
     * ROOT FIX: Event-driven setup - NO polling, only event listeners
     */
    setupEventListeners() {
        // ROOT FIX: Event-driven contenteditable change detection
        this.topics.forEach(topic => {
            if (topic.titleElement) {
                // Use focusout instead of blur for better UX
                topic.titleElement.addEventListener('focusout', (e) => {
                    this.handleTopicChange(topic, 'title', e.target.textContent.trim());
                });
                
                // Also listen for input for immediate feedback
                topic.titleElement.addEventListener('input', (e) => {
                    this.handleTopicInput(topic, 'title');
                });
                
                // Prevent line breaks in titles
                topic.titleElement.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.target.blur(); // Trigger save
                    }
                });
            }
            
            if (topic.descElement) {
                topic.descElement.addEventListener('focusout', (e) => {
                    this.handleTopicChange(topic, 'description', e.target.textContent.trim());
                });
                
                topic.descElement.addEventListener('input', (e) => {
                    this.handleTopicInput(topic, 'description');
                });
            }
        });
        
        // Element control buttons
        const controlButtons = this.element.querySelectorAll('.control-btn');
        controlButtons.forEach(btn => {
            btn.addEventListener('click', this.handleControlAction.bind(this));
        });
        
        console.log('🔗 Topics Component: Event listeners configured (no polling)');
    }
    
    /**
     * ROOT FIX: Setup save interface with status indicators
     */
    setupSaveInterface() {
        // Create save status indicator
        const saveStatusHtml = `
            <div class="topics-save-interface" style="margin-top: 10px;">
                <div class="save-status" data-status="saved">
                    <span class="save-indicator">✅</span>
                    <span class="save-text">Saved</span>
                    <span class="save-timestamp"></span>
                </div>
                <div class="save-actions">
                    <button class="manual-save-btn" style="display: none; margin-left: 10px; padding: 4px 8px; font-size: 12px;">
                        Save Now
                    </button>
                </div>
            </div>
        `;
        
        // Insert save interface after topics container
        const container = this.element.querySelector('.topics-container');
        if (container) {
            container.insertAdjacentHTML('afterend', saveStatusHtml);
            
            // Setup manual save button
            const manualSaveBtn = this.element.querySelector('.manual-save-btn');
            if (manualSaveBtn) {
                manualSaveBtn.addEventListener('click', this.handleManualSave.bind(this));
            }
        }
        
        this.updateSaveStatus('saved');
        console.log('💾 Topics Component: Save interface initialized');
    }
    
    /**
     * ROOT FIX: Auto-save setup with event-driven debouncing
     */
    setupAutoSave() {
        // AUTO-SAVE: Event-driven with debouncing (no polling)
        this.autoSaveDelay = 2000; // 2 seconds after last change
        console.log('⚡ Topics Component: Auto-save system armed (event-driven)');
    }
    
    /**
     * ROOT FIX: Handle topic content changes (event-driven)
     */
    handleTopicChange(topic, field, newValue) {
        // ROOT FIX: Aggressive trimming to remove all whitespace issues
        const cleanValue = newValue.replace(/\s+/g, ' ').trim();
        const oldValue = topic[field];
        
        if (oldValue !== cleanValue) {
            topic[field] = cleanValue;
            
            // ROOT FIX: Update DOM immediately to show cleaned value
            if (field === 'title' && topic.titleElement) {
                topic.titleElement.textContent = cleanValue;
            }
            
            this.unsavedChanges = true;
            
            console.log(`📝 Topic ${topic.index + 1} ${field} changed: "${oldValue}" → "${cleanValue}"`);
            
            this.updateSaveStatus('unsaved');
            this.scheduleAutoSave();
        }
    }
    
    /**
     * ROOT FIX: Handle real-time input (for UI feedback only)
     */
    handleTopicInput(topic, field) {
        // Mark as unsaved immediately for UI feedback
        if (!this.unsavedChanges) {
            this.unsavedChanges = true;
            this.updateSaveStatus('unsaved');
        }
    }
    
    /**
     * ROOT FIX: Schedule auto-save with event-driven debouncing
     */
    scheduleAutoSave() {
        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        // Schedule new save
        this.saveTimeout = setTimeout(() => {
            if (this.unsavedChanges) {
                this.performSave('auto');
            }
        }, this.autoSaveDelay);
        
        console.log(`⏱️ Auto-save scheduled in ${this.autoSaveDelay}ms`);
    }
    
    /**
     * ROOT FIX: Manual save handler
     */
    handleManualSave(e) {
        e.preventDefault();
        this.performSave('manual');
    }
    
    /**
     * ROOT FIX: Handle main save button (integration with main app)
     */
    handleMainSave(e) {
        console.log('🔄 Main save button triggered - saving topics');
        this.performSave('main_save');
    }
    
    /**
     * ROOT FIX: Core save functionality
     */
    async performSave(saveType = 'manual') {
        if (!this.postId) {
            console.error('❌ Cannot save: No post ID available');
            this.updateSaveStatus('error', 'No post ID available');
            return;
        }
        
        if (!this.unsavedChanges && saveType !== 'manual') {
            console.log('✅ No changes to save');
            return;
        }
        
        console.log(`💾 Starting ${saveType} save for post ${this.postId}`);
        console.log('📊 Current topics data:', this.topics.map(t => `"${t.title}" (${t.title.length} chars)`));
        this.updateSaveStatus('saving');
        
        try {
            // DEBUG: Log topics before processing
            console.log('🔍 DEBUG: Raw topics data before processing:', this.topics);
            
            // Prepare topics data for custom post fields format
            const topicsData = {};
            
            this.topics.forEach((topic, index) => {
                const topicKey = `topic_${index + 1}`;
                console.log(`🔍 DEBUG: Processing topic ${index}:`, {
                    topicKey,
                    title: topic.title,
                    titleType: typeof topic.title,
                    titleLength: topic.title ? topic.title.length : 0,
                    hasTrim: topic.title && topic.title.trim(),
                    trimmedLength: topic.title && topic.title.trim() ? topic.title.trim().length : 0
                });
                
                if (topic.title && topic.title.trim()) {
                    // ROOT FIX: Aggressive cleaning of topic data
                    const cleanTitle = topic.title.replace(/\s+/g, ' ').trim();
                    topicsData[topicKey] = cleanTitle;
                    console.log(`🧽 Prepared ${topicKey}: "${cleanTitle}" (length: ${cleanTitle.length})`);
                } else {
                    console.log(`⚠️ DEBUG: Skipping empty topic ${index}: "${topic.title}"`);
                }
                // Note: Descriptions not saved in this version - focusing on titles only
            });
            
            console.log('🔍 DEBUG: Final topics data object:', topicsData);
            console.log('🔍 DEBUG: Topics data keys:', Object.keys(topicsData));
            console.log('🔍 DEBUG: Topics data values:', Object.values(topicsData));
            
            const requestData = {
                action: 'save_custom_topics',
                post_id: this.postId,
                topics: topicsData,
                save_type: saveType,
                client_timestamp: Math.floor(Date.now() / 1000),
                nonce: this.nonce
            };
            
            console.log('📤 Sending save request:', requestData);
            
            // ROOT FIX: Enhanced debugging of request data
            console.log('🔍 DEBUG: Request details:');
            console.log('  - action:', requestData.action);
            console.log('  - post_id:', requestData.post_id, '(type:', typeof requestData.post_id, ')');
            console.log('  - topics data:', requestData.topics);
            console.log('  - topics JSON:', JSON.stringify(requestData.topics));
            console.log('  - save_type:', requestData.save_type);
            console.log('  - nonce:', requestData.nonce ? requestData.nonce.substring(0, 10) + '...' : 'MISSING');
            
            // ROOT FIX: Debug what will actually be sent in FormData
            console.log('🔍 DEBUG: What will be sent in FormData:');
            const formDataPreview = new FormData();
            Object.keys(requestData).forEach(key => {
                if (typeof requestData[key] === 'object') {
                    const jsonValue = JSON.stringify(requestData[key]);
                    formDataPreview.append(key, jsonValue);
                    console.log(`  - ${key}: ${jsonValue}`);
                } else {
                    formDataPreview.append(key, requestData[key]);
                    console.log(`  - ${key}: ${requestData[key]}`);
                }
            });
            
            // Check individual topic values
            Object.entries(requestData.topics).forEach(([key, value]) => {
                console.log(`  - ${key}:`, {
                    value: value,
                    type: typeof value,
                    length: value ? value.length : 0,
                    chars: value ? Array.from(value).map(c => c.charCodeAt(0)) : []
                });
            });
            
            const response = await this.sendAjaxRequest(requestData);
            
            // ROOT FIX: Enhanced response debugging
            console.log('📡 AJAX Response received:', response);
            if (!response.success && response.data) {
                console.log('❌ Response error details:', {
                    message: response.data.message || response.data,
                    code: response.data.code,
                    validation_errors: response.data.validation_errors,
                    full_data: response.data
                });
            }
            
            if (response.success) {
                this.unsavedChanges = false;
                this.lastSaveTimestamp = Date.now();
                this.updateSaveStatus('saved', `${response.data.topics_saved} topics saved`);
                
                console.log('✅ Save successful:', response.data);
                
                // Update metadata
                if (response.data.saved_fields) {
                    console.log('📋 Saved to fields:', response.data.saved_fields);
                }
                
            } else {
                throw new Error(response.data?.message || 'Save failed');
            }
            
        } catch (error) {
            console.error('❌ Save failed:', error);
            this.updateSaveStatus('error', error.message || 'Save failed');
        }
    }
    
    /**
     * ROOT FIX: Send AJAX request with proper error handling
     */
    async sendAjaxRequest(data) {
        const url = window.guestifyData?.ajaxUrl || window.guestifyMediaKit?.ajaxUrl || '/wp-admin/admin-ajax.php';
        
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'object') {
                formData.append(key, JSON.stringify(data[key]));
            } else {
                formData.append(key, data[key]);
            }
        });
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    }
    
    /**
     * ROOT FIX: Update save status indicator
     */
    updateSaveStatus(status, message = '') {
        this.saveStatus = status;
        
        const statusElement = this.element.querySelector('.save-status');
        const indicatorElement = this.element.querySelector('.save-indicator');
        const textElement = this.element.querySelector('.save-text');
        const timestampElement = this.element.querySelector('.save-timestamp');
        const manualSaveBtn = this.element.querySelector('.manual-save-btn');
        
        if (!statusElement) return;
        
        statusElement.dataset.status = status;
        
        const statusConfig = {
            'saved': { 
                indicator: '✅', 
                text: 'Saved', 
                showButton: false,
                color: '#10b981' 
            },
            'saving': { 
                indicator: '⏳', 
                text: 'Saving...', 
                showButton: false,
                color: '#f59e0b' 
            },
            'unsaved': { 
                indicator: '⚠️', 
                text: 'Unsaved changes', 
                showButton: true,
                color: '#ef4444' 
            },
            'error': { 
                indicator: '❌', 
                text: 'Save failed', 
                showButton: true,
                color: '#ef4444' 
            }
        };
        
        const config = statusConfig[status] || statusConfig['saved'];
        
        if (indicatorElement) indicatorElement.textContent = config.indicator;
        if (textElement) {
            textElement.textContent = message || config.text;
            textElement.style.color = config.color;
        }
        
        if (manualSaveBtn) {
            manualSaveBtn.style.display = config.showButton ? 'inline-block' : 'none';
        }
        
        if (timestampElement && status === 'saved') {
            const time = new Date().toLocaleTimeString();
            timestampElement.textContent = `at ${time}`;
            timestampElement.style.opacity = '0.6';
        }
        
        console.log(`🔔 Save status: ${status} - ${message || config.text}`);
    }
    
    /**
     * ROOT FIX: Handle control actions (move, duplicate, delete)
     */
    handleControlAction(e) {
        const action = e.target.closest('.control-btn')?.dataset.action;
        if (!action) return;
        
        console.log(`🎮 Control action: ${action}`);
        
        switch (action) {
            case 'edit':
                this.openEditPanel();
                break;
            case 'move-up':
            case 'move-down':
                this.moveSection(action === 'move-up' ? -1 : 1);
                break;
            case 'duplicate':
                this.duplicateSection();
                break;
            case 'delete':
                this.deleteSection();
                break;
        }
    }
    
    /**
     * Open edit panel for topics
     */
    openEditPanel() {
        console.log('🎨 Opening topics edit panel');
        // Trigger design panel if available
        if (window.enhancedSystemRegistrar) {
            window.enhancedSystemRegistrar.triggerEvent('openDesignPanel', {
                component: 'topics',
                element: this.element
            });
        }
    }
    
    /**
     * ROOT FIX: Handle system ready events
     */
    handleSystemReady(e) {
        console.log('🚀 Topics Component: Media Kit system ready detected');
        
        // Re-extract nonce and other globals that might now be available
        if (window.guestifyData?.nonce || window.guestifyMediaKit?.nonce) {
            this.nonce = window.guestifyData?.nonce || window.guestifyMediaKit?.nonce;
        }
        
        // Re-extract post ID if it wasn't available before
        if (!this.postId && (window.guestifyData?.postId || window.guestifyMediaKit?.postId)) {
            this.postId = parseInt(window.guestifyData?.postId || window.guestifyMediaKit?.postId, 10);
            console.log(`✅ Post ID updated from system: ${this.postId}`);
        }
    }
    
    /**
     * ROOT FIX: Handle before page unload
     */
    handleBeforeUnload(e) {
        if (this.unsavedChanges) {
            const message = 'You have unsaved changes to your topics. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        // Remove event listeners
        window.removeEventListener('mediaKitSystemReady', this.handleSystemReady);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        
        console.log('🧹 Topics Component: Cleaned up');
    }
}

/**
 * ROOT FIX: Enhanced initialization with system event coordination
 */
class TopicsComponentManager {
    constructor() {
        this.components = new Map();
        this.systemReady = false;
        this.init();
    }
    
    init() {
        // ROOT FIX: Event-driven initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initializeComponents.bind(this));
        } else {
            this.initializeComponents();
        }
        
        // Listen for dynamic content
        if (window.addEventListener) {
            window.addEventListener('contentUpdated', this.handleContentUpdate.bind(this));
            window.addEventListener('mediaKitSystemReady', this.handleSystemReady.bind(this));
        }
    }
    
    initializeComponents() {
        const topicsElements = document.querySelectorAll('.topics-component');
        
        console.log(`🏗️ Topics Manager: Initializing ${topicsElements.length} components`);
        
        topicsElements.forEach((element, index) => {
            try {
                const componentId = element.dataset.componentId || `topics_${index}`;
                
                if (!this.components.has(componentId)) {
                    const component = new TopicsComponent(element);
                    this.components.set(componentId, component);
                    element.dataset.componentInitialized = 'true';
                }
            } catch (error) {
                console.error(`❌ Failed to initialize topics component ${index}:`, error);
            }
        });
        
        console.log(`✅ Topics Manager: ${this.components.size} components active`);
    }
    
    handleContentUpdate(e) {
        console.log('🔄 Topics Manager: Content updated, checking for new components');
        this.initializeComponents();
    }
    
    handleSystemReady(e) {
        this.systemReady = true;
        console.log('🚀 Topics Manager: System ready confirmed');
    }
    
    getComponent(elementOrId) {
        if (typeof elementOrId === 'string') {
            return this.components.get(elementOrId);
        }
        
        // Find by element
        for (let [id, component] of this.components) {
            if (component.element === elementOrId) {
                return component;
            }
        }
        
        return null;
    }
}

// ROOT FIX: Global initialization
if (typeof window !== 'undefined') {
    window.topicsComponentManager = new TopicsComponentManager();
    
    // Debug helper
    window.debugTopicsComponent = function(elementOrId) {
        const component = window.topicsComponentManager.getComponent(elementOrId);
        if (component) {
            console.log('🔍 Topics Component Debug:', {
                postId: component.postId,
                topics: component.topics,
                unsavedChanges: component.unsavedChanges,
                saveStatus: component.saveStatus,
                nonce: component.nonce ? 'present' : 'missing',
                topicsData: component.topics.map(t => `"${t.title}" (${t.title.length} chars)`)
            });
            
            // ROOT FIX: Test save functionality
            console.log('🧪 Testing save functionality...');
            component.performSave('debug_test');
        } else {
            console.log('❌ Topics component not found');
        }
    };
    
    // ROOT FIX: Global save trigger for main save button integration
    window.triggerTopicsSave = function() {
        const components = window.topicsComponentManager.components;
        console.log(`🔄 Triggering save for ${components.size} topics components`);
        
        for (let [id, component] of components) {
            component.handleMainSave({});
        }
    };
    
    console.log('🎯 Topics Component ROOT FIX: Manager initialized');
}