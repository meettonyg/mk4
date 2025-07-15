/**
 * Topics Component JavaScript - PHASE 2 ROOT FIX Version
 * Enhanced with Bidirectional JavaScript Bridge for seamless side panel ↔ preview communication
 * 
 * PHASE 2 FEATURES:
 * - Unified state management with single source of truth
 * - Real-time bidirectional synchronization between design panel and preview
 * - Event-driven bridge architecture with conflict resolution
 * - Quality scoring with live feedback
 * - Advanced drag-and-drop with cross-component coordination
 * 
 * @version 2.0.0-phase2-bridge
 */

/**
 * PHASE 2: Central Topics State Manager
 * Single source of truth for all topics data with event-driven updates
 */
class TopicsStateManager {
    constructor() {
        this.topics = [];
        this.postId = null;
        this.lastSaveTimestamp = 0;
        this.pendingChanges = false;
        this.listeners = new Map();
        this.saveQueue = [];
        this.isProcessingSave = false;
        
        // State change tracking
        this.changeHistory = [];
        this.maxHistorySize = 50;
        
        console.log('🏗️ Topics State Manager: Initialized');
    }

    /**
     * Set post ID and initialize state
     */
    setPostId(postId) {
        this.postId = parseInt(postId, 10);
        console.log(`🎯 Topics State: Post ID set to ${this.postId}`);
        this.notifyListeners('postIdChanged', { postId: this.postId });
    }

    /**
     * Load topics from various sources
     */
    async loadTopics(source = 'auto') {
        console.log(`📥 Topics State: Loading topics from ${source}`);
        
        try {
            let topics = [];
            
            switch (source) {
                case 'preview':
                    topics = this.extractFromPreview();
                    break;
                case 'server':
                    topics = await this.loadFromServer();
                    break;
                case 'auto':
                default:
                    // Try preview first, then server
                    topics = this.extractFromPreview();
                    if (topics.length === 0 && this.postId) {
                        console.log('📥 Topics State: No preview topics found, trying server...');
                        topics = await this.loadFromServer();
                    }
                    
                    // PHASE 3 FIX: If still no topics, create empty state to end loading
                    if (topics.length === 0) {
                        console.log('📥 Topics State: No topics found from any source, creating empty state');
                        topics = []; // Ensure we have an array
                    }
                    break;
            }
            
            this.setTopics(topics, source);
            console.log(`✅ Topics State: Successfully loaded ${topics.length} topics from ${source}`);
            return topics;
            
        } catch (error) {
            console.error('❌ Topics State: Failed to load topics:', error);
            
            // PHASE 3 FIX: Set empty topics array to end loading state
            this.setTopics([], 'error');
            this.notifyListeners('loadError', { error, source });
            
            // Return empty array instead of throwing
            return [];
        }
    }

    /**
     * Set topics array and notify all listeners
     */
    setTopics(topics, source = 'manual') {
        const oldTopics = [...this.topics];
        this.topics = topics.map((topic, index) => ({
            id: topic.id || `topic_${index + 1}`,
            index: index,
            title: topic.title || '',
            description: topic.description || '',
            quality: this.calculateQuality(topic.title || ''),
            source: topic.source || source,
            lastModified: topic.lastModified || Date.now(),
            isValid: (topic.title || '').length >= 3,
            ...topic
        }));
        
        // Track change in history
        this.addToHistory('setTopics', { oldTopics, newTopics: [...this.topics], source });
        
        console.log(`📊 Topics State: Set ${this.topics.length} topics from ${source}`);
        this.notifyListeners('topicsChanged', { 
            topics: [...this.topics], 
            source,
            oldTopics 
        });
    }

    /**
     * Update a single topic by ID
     */
    updateTopic(topicId, updates, source = 'manual') {
        const index = this.topics.findIndex(t => t.id === topicId);
        if (index === -1) {
            console.warn(`⚠️ Topics State: Topic ${topicId} not found for update`);
            return false;
        }
        
        const oldTopic = { ...this.topics[index] };
        const newTopic = {
            ...oldTopic,
            ...updates,
            lastModified: Date.now(),
            quality: updates.title ? this.calculateQuality(updates.title) : oldTopic.quality,
            isValid: updates.title ? updates.title.length >= 3 : oldTopic.isValid
        };
        
        this.topics[index] = newTopic;
        this.pendingChanges = true;
        
        // Track change
        this.addToHistory('updateTopic', { topicId, oldTopic, newTopic, source });
        
        console.log(`📝 Topics State: Updated ${topicId} from ${source}:`, updates);
        this.notifyListeners('topicUpdated', { 
            topicId, 
            topic: newTopic, 
            oldTopic, 
            source,
            index 
        });
        
        return true;
    }

    /**
     * Add a new topic
     */
    addTopic(topicData, position = -1, source = 'manual') {
        const newTopic = {
            id: topicData.id || `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            index: position >= 0 ? position : this.topics.length,
            title: topicData.title || '',
            description: topicData.description || '',
            quality: this.calculateQuality(topicData.title || ''),
            source: source,
            lastModified: Date.now(),
            isValid: (topicData.title || '').length >= 3,
            ...topicData
        };
        
        if (position >= 0 && position < this.topics.length) {
            this.topics.splice(position, 0, newTopic);
            // Update indices for subsequent topics
            this.reindexTopics();
        } else {
            this.topics.push(newTopic);
        }
        
        this.pendingChanges = true;
        
        // Track change
        this.addToHistory('addTopic', { newTopic, position, source });
        
        console.log(`➕ Topics State: Added topic ${newTopic.id} at position ${newTopic.index}`);
        this.notifyListeners('topicAdded', { 
            topic: newTopic, 
            position: newTopic.index, 
            source 
        });
        
        return newTopic;
    }

    /**
     * Remove a topic by ID
     */
    removeTopic(topicId, source = 'manual') {
        const index = this.topics.findIndex(t => t.id === topicId);
        if (index === -1) {
            console.warn(`⚠️ Topics State: Topic ${topicId} not found for removal`);
            return false;
        }
        
        const removedTopic = this.topics.splice(index, 1)[0];
        this.reindexTopics();
        this.pendingChanges = true;
        
        // Track change
        this.addToHistory('removeTopic', { removedTopic, index, source });
        
        console.log(`🗑️ Topics State: Removed topic ${topicId}`);
        this.notifyListeners('topicRemoved', { 
            topic: removedTopic, 
            index, 
            source 
        });
        
        return removedTopic;
    }

    /**
     * Reorder topics
     */
    reorderTopics(fromIndex, toIndex, source = 'manual') {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
            fromIndex >= this.topics.length || toIndex >= this.topics.length) {
            return false;
        }
        
        const movedTopic = this.topics.splice(fromIndex, 1)[0];
        this.topics.splice(toIndex, 0, movedTopic);
        this.reindexTopics();
        this.pendingChanges = true;
        
        // Track change
        this.addToHistory('reorderTopics', { fromIndex, toIndex, movedTopic, source });
        
        console.log(`🔄 Topics State: Moved topic from ${fromIndex} to ${toIndex}`);
        this.notifyListeners('topicsReordered', { 
            fromIndex, 
            toIndex, 
            movedTopic, 
            topics: [...this.topics], 
            source 
        });
        
        return true;
    }

    /**
     * Extract topics from preview DOM
     */
    extractFromPreview() {
        const previewElement = (
            document.querySelector('.topics-component') ||
            document.querySelector('[data-component="topics"]') ||
            document.querySelector('.media-kit .content-section[data-element="topics"]')
        );
        
        if (!previewElement) {
            console.warn('⚠️ Topics State: No preview element found for extraction');
            return [];
        }
        
        const topicItems = previewElement.querySelectorAll('.topic-item');
        const extractedTopics = [];
        
        topicItems.forEach((item, index) => {
            const titleEl = item.querySelector('.topic-title');
            const title = titleEl ? titleEl.textContent.trim() : '';
            
            if (title) {
                extractedTopics.push({
                    id: item.dataset.topicId || `topic_${index + 1}`,
                    index: index,
                    title: title,
                    description: '',
                    source: 'preview',
                    element: item,
                    titleElement: titleEl
                });
            }
        });
        
        console.log(`📤 Topics State: Extracted ${extractedTopics.length} topics from preview`);
        return extractedTopics;
    }

    /**
     * Load topics from server
     */
    async loadFromServer() {
        if (!this.postId) {
            console.warn('⚠️ Topics State: No post ID for server load');
            return [];
        }
        
        try {
            const nonce = window.guestifyData?.nonce || window.guestifyMediaKit?.nonce || '';
            
            // PHASE 3 FIX: Enhanced debugging for AJAX issues
            console.log('📡 Topics State: Attempting server load with:', {
                postId: this.postId,
                nonce: nonce ? nonce.substring(0, 10) + '...' : 'MISSING',
                ajaxUrl: window.guestifyData?.ajaxUrl || 'MISSING'
            });
            
            if (!nonce) {
                throw new Error('No security nonce available - AJAX data not loaded');
            }
            
            const response = await this.sendAjaxRequest({
                action: 'load_stored_topics',
                post_id: this.postId,
                nonce: nonce
            });
            
            console.log('📡 Topics State: Server response:', response);
            
            if (response.success && response.data.topics) {
                const serverTopics = [];
                
                Object.entries(response.data.topics).forEach(([key, title], index) => {
                    if (title && title.trim()) {
                        serverTopics.push({
                            id: key,
                            index: index,
                            title: title.trim(),
                            description: '',
                            source: 'server'
                        });
                    }
                });
                
                console.log(`📥 Topics State: Loaded ${serverTopics.length} topics from server`);
                return serverTopics;
            } else {
                console.log('📥 Topics State: Server returned no topics or failed:', response);
                return [];
            }
            
        } catch (error) {
            console.error('❌ Topics State: Server load failed:', error);
            
            // PHASE 3 FIX: Return empty array instead of throwing to prevent hanging
            return [];
        }
    }

    /**
     * Save topics to server
     */
    async saveTopics(saveType = 'auto') {
        if (!this.postId || this.isProcessingSave) {
            console.warn('⚠️ Topics State: Cannot save - no post ID or save in progress');
            return false;
        }
        
        this.isProcessingSave = true;
        this.notifyListeners('saveStarted', { saveType, topicsCount: this.topics.length });
        
        try {
            const topicsData = {};
            
            this.topics.forEach((topic, index) => {
                if (topic.title && topic.title.trim()) {
                    topicsData[`topic_${index + 1}`] = topic.title.trim();
                }
            });
            
            const nonce = window.guestifyData?.nonce || window.guestifyMediaKit?.nonce || '';
            const response = await this.sendAjaxRequest({
                action: 'save_custom_topics',
                post_id: this.postId,
                topics: JSON.stringify(topicsData),
                save_type: saveType,
                client_timestamp: Math.floor(Date.now() / 1000),
                nonce: nonce
            });
            
            if (response.success) {
                this.pendingChanges = false;
                this.lastSaveTimestamp = Date.now();
                
                console.log('✅ Topics State: Save successful:', response.data);
                this.notifyListeners('saveSuccess', { 
                    response: response.data, 
                    saveType,
                    timestamp: this.lastSaveTimestamp 
                });
                
                return true;
            } else {
                throw new Error(response.data?.message || 'Save failed');
            }
            
        } catch (error) {
            console.error('❌ Topics State: Save failed:', error);
            this.notifyListeners('saveError', { error, saveType });
            return false;
        } finally {
            this.isProcessingSave = false;
        }
    }

    /**
     * Get current topics array
     */
    getTopics() {
        return [...this.topics];
    }

    /**
     * Get topic by ID
     */
    getTopic(topicId) {
        return this.topics.find(t => t.id === topicId);
    }

    /**
     * Check if there are pending changes
     */
    hasPendingChanges() {
        return this.pendingChanges;
    }

    /**
     * Calculate topic quality score
     */
    calculateQuality(title) {
        if (!title || title.length < 3) return 0;
        
        let score = 0;
        const length = title.length;
        const wordCount = title.split(/\s+/).length;
        
        // Length scoring (optimal 20-60 characters)
        if (length >= 20 && length <= 60) {
            score += 40;
        } else if (length >= 10 && length <= 80) {
            score += 25;
        } else if (length >= 3) {
            score += 10;
        }
        
        // Word count scoring (optimal 2-8 words)
        if (wordCount >= 2 && wordCount <= 8) {
            score += 30;
        } else if (wordCount >= 1 && wordCount <= 12) {
            score += 15;
        }
        
        // Professional language indicators
        if (/^[A-Z]/.test(title)) score += 10; // Starts with capital
        if (!/\s{2,}/.test(title)) score += 10; // No double spaces
        if (!/[!]{2,}/.test(title)) score += 10; // No excessive punctuation
        
        return Math.min(100, score);
    }

    /**
     * Reindex all topics
     */
    reindexTopics() {
        this.topics.forEach((topic, index) => {
            topic.index = index;
        });
    }

    /**
     * Add change to history
     */
    addToHistory(action, data) {
        this.changeHistory.push({
            action,
            data,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.changeHistory.length > this.maxHistorySize) {
            this.changeHistory.shift();
        }
    }

    /**
     * Register event listener
     */
    addEventListener(event, callback, id = null) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Map());
        }
        
        const listenerId = id || `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.listeners.get(event).set(listenerId, callback);
        
        console.log(`🔗 Topics State: Registered listener for '${event}' (${listenerId})`);
        return listenerId;
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, id) {
        if (this.listeners.has(event)) {
            const removed = this.listeners.get(event).delete(id);
            console.log(`🔌 Topics State: ${removed ? 'Removed' : 'Failed to remove'} listener ${id} for '${event}'`);
            return removed;
        }
        return false;
    }

    /**
     * Notify all listeners of an event
     */
    notifyListeners(event, data = {}) {
        if (this.listeners.has(event)) {
            const eventListeners = this.listeners.get(event);
            eventListeners.forEach((callback, id) => {
                try {
                    callback({ event, data, timestamp: Date.now() });
                } catch (error) {
                    console.error(`❌ Topics State: Error in listener ${id} for event ${event}:`, error);
                }
            });
        }
    }

    /**
     * Send AJAX request
     */
    async sendAjaxRequest(data) {
        const url = window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php';
        
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    }

    /**
     * Get state statistics
     */
    getStats() {
        const totalTopics = this.topics.length;
        const validTopics = this.topics.filter(t => t.isValid).length;
        const averageQuality = totalTopics > 0 ? 
            Math.round(this.topics.reduce((sum, t) => sum + t.quality, 0) / totalTopics) : 0;
        
        return {
            totalTopics,
            validTopics,
            averageQuality,
            pendingChanges: this.pendingChanges,
            lastSaveTimestamp: this.lastSaveTimestamp,
            changeHistorySize: this.changeHistory.length
        };
    }
}

/**
 * PHASE 2: Enhanced Topics Component with Bridge Integration
 * Integrates with central state manager for bidirectional communication
 */
class TopicsComponent {
    constructor(element) {
        this.element = element;
        this.componentId = element.dataset.componentId || `topics_${Date.now()}`;
        this.stateManager = window.topicsStateManager;
        this.isInitialized = false;
        this.saveTimeout = null;
        this.eventListeners = new Map();
        
        console.log(`🚀 Topics Component: Initializing ${this.componentId}`);
        this.init();
    }

    async init() {
        try {
            console.log(`🔄 Topics Component: Starting initialization for ${this.componentId}`);
            
            // Wait for state manager
            await this.ensureStateManager();
            console.log(`✅ Topics Component: State manager ready for ${this.componentId}`);
            
            // Extract data
            const postId = this.extractPostId();
            console.log(`🎯 Topics Component: Post ID extracted: ${postId}`);
            
            this.setupStateListeners();
            this.setupDOMListeners();
            this.setupSaveInterface();
            console.log(`🔗 Topics Component: Event listeners configured for ${this.componentId}`);
            
            // PHASE 3 FIX: Enhanced loading with timeout and fallback
            console.log(`📥 Topics Component: Starting topic loading for ${this.componentId}`);
            
            // Load initial topics if state is empty with timeout
            if (this.stateManager.getTopics().length === 0) {
                try {
                    // Add a timeout to prevent infinite loading
                    const loadingPromise = this.stateManager.loadTopics('auto');
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Loading timeout')), 10000)
                    );
                    
                    await Promise.race([loadingPromise, timeoutPromise]);
                } catch (loadError) {
                    console.error(`❌ Topics Component: Loading failed for ${this.componentId}:`, loadError);
                    
                    // Force empty state to end loading
                    this.stateManager.setTopics([], 'fallback');
                    this.showLoadingError(loadError.message);
                }
            } else {
                // Sync preview with state
                this.syncPreviewWithState();
            }
            
            this.isInitialized = true;
            console.log(`✅ Topics Component: Initialization complete for ${this.componentId}`);
            
            // Notify other components
            this.triggerEvent('topicsComponentReady', {
                componentId: this.componentId,
                element: this.element
            });
            
        } catch (error) {
            console.error(`❌ Topics Component: Initialization failed for ${this.componentId}:`, error);
            
            // PHASE 3 FIX: Show error state instead of hanging
            this.showInitializationError(error.message);
        }
    }

    /**
     * Ensure state manager is available
     */
    async ensureStateManager() {
        if (!window.topicsStateManager) {
            window.topicsStateManager = new TopicsStateManager();
        }
        this.stateManager = window.topicsStateManager;
        
        // Set post ID if available
        const postId = this.extractPostId();
        if (postId && !this.stateManager.postId) {
            this.stateManager.setPostId(postId);
        }
    }

    /**
     * Extract post ID from multiple sources
     */
    extractPostId() {
        const postId = (
            this.element.dataset.postId ||
            this.element.querySelector('.topics-container')?.dataset.postId ||
            new URLSearchParams(window.location.search).get('post_id') ||
            new URLSearchParams(window.location.search).get('p') ||
            window.guestifyData?.postId ||
            window.guestifyMediaKit?.postId
        );
        
        return postId ? parseInt(postId, 10) : null;
    }

    /**
     * Setup state manager event listeners
     */
    setupStateListeners() {
        // Listen for state changes and update preview
        const listenerId = this.stateManager.addEventListener('topicsChanged', 
            (e) => this.handleStateTopicsChanged(e), 
            `${this.componentId}_topicsChanged`
        );
        this.eventListeners.set('topicsChanged', listenerId);
        
        // Listen for individual topic updates
        const topicUpdateListenerId = this.stateManager.addEventListener('topicUpdated',
            (e) => this.handleStateTopicUpdated(e),
            `${this.componentId}_topicUpdated`
        );
        this.eventListeners.set('topicUpdated', topicUpdateListenerId);
        
        // Listen for topic additions
        const topicAddedListenerId = this.stateManager.addEventListener('topicAdded',
            (e) => this.handleStateTopicAdded(e),
            `${this.componentId}_topicAdded`
        );
        this.eventListeners.set('topicAdded', topicAddedListenerId);
        
        // Listen for topic removals
        const topicRemovedListenerId = this.stateManager.addEventListener('topicRemoved',
            (e) => this.handleStateTopicRemoved(e),
            `${this.componentId}_topicRemoved`
        );
        this.eventListeners.set('topicRemoved', topicRemovedListenerId);
        
        // Listen for reordering
        const reorderedListenerId = this.stateManager.addEventListener('topicsReordered',
            (e) => this.handleStateTopicsReordered(e),
            `${this.componentId}_topicsReordered`
        );
        this.eventListeners.set('topicsReordered', reorderedListenerId);
        
        // Listen for save events
        const saveListenerId = this.stateManager.addEventListener('saveSuccess',
            (e) => this.handleStateSaveSuccess(e),
            `${this.componentId}_saveSuccess`
        );
        this.eventListeners.set('saveSuccess', saveListenerId);
        
        console.log(`🔗 Topics Component: State listeners registered for ${this.componentId}`);
    }

    /**
     * Setup DOM event listeners
     */
    setupDOMListeners() {
        // Content editable changes
        const topicTitles = this.element.querySelectorAll('.topic-title[contenteditable]');
        topicTitles.forEach((titleEl, index) => {
            titleEl.addEventListener('input', (e) => this.handlePreviewTopicInput(e, index));
            titleEl.addEventListener('blur', (e) => this.handlePreviewTopicBlur(e, index));
            titleEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        });
        
        // Control buttons
        const controlButtons = this.element.querySelectorAll('.control-btn');
        controlButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleControlAction(e));
        });
        
        // Global events
        window.addEventListener('mainSaveTriggered', () => this.handleMainSave());
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
        
        console.log(`🔗 Topics Component: DOM listeners configured for ${this.componentId}`);
    }

    /**
     * Handle state topics changed event
     */
    handleStateTopicsChanged(e) {
        if (e.data.source === this.componentId) {
            // Ignore changes originating from this component
            return;
        }
        
        console.log(`🔄 Topics Component: Syncing preview with state (${e.data.topics.length} topics)`);
        this.syncPreviewWithState();
    }

    /**
     * Handle state topic updated event
     */
    handleStateTopicUpdated(e) {
        if (e.data.source === this.componentId) {
            // Ignore changes originating from this component
            return;
        }
        
        console.log(`📝 Topics Component: Updating preview topic ${e.data.topicId}`);
        this.updatePreviewTopic(e.data.index, e.data.topic);
    }

    /**
     * Handle preview topic input (real-time)
     */
    handlePreviewTopicInput(e, index) {
        const newTitle = e.target.textContent.trim();
        const topic = this.stateManager.getTopics()[index];
        
        if (topic && topic.title !== newTitle) {
            // Update state manager (this will trigger other components to update)
            this.stateManager.updateTopic(topic.id, { title: newTitle }, this.componentId);
        }
    }

    /**
     * Handle preview topic blur (save changes)
     */
    handlePreviewTopicBlur(e, index) {
        const newTitle = e.target.textContent.trim();
        const topic = this.stateManager.getTopics()[index];
        
        if (topic) {
            // Clean up the title and update state
            const cleanTitle = newTitle.replace(/\s+/g, ' ').trim();
            e.target.textContent = cleanTitle;
            
            if (topic.title !== cleanTitle) {
                this.stateManager.updateTopic(topic.id, { title: cleanTitle }, this.componentId);
                this.scheduleAutoSave();
            }
        }
    }

    /**
     * Sync preview with current state
     */
    syncPreviewWithState() {
        const topics = this.stateManager.getTopics();
        const container = this.element.querySelector('.topics-container');
        
        if (!container) return;
        
        // Remove existing topic items
        const existingItems = container.querySelectorAll('.topic-item');
        existingItems.forEach(item => item.remove());
        
        // Add topics from state
        topics.forEach((topic, index) => {
            const topicElement = this.createTopicElement(topic, index);
            container.appendChild(topicElement);
        });
        
        // Show/hide empty state
        const emptyState = this.element.querySelector('.no-topics-message');
        if (emptyState) {
            emptyState.style.display = topics.length === 0 ? 'block' : 'none';
        }
        
        console.log(`🔄 Topics Component: Preview synced with ${topics.length} topics`);
    }

    /**
     * Update a specific topic in preview
     */
    updatePreviewTopic(index, topic) {
        const topicItems = this.element.querySelectorAll('.topic-item');
        const topicElement = topicItems[index];
        
        if (topicElement) {
            const titleElement = topicElement.querySelector('.topic-title');
            if (titleElement && titleElement.textContent !== topic.title) {
                titleElement.textContent = topic.title;
                
                // Add visual feedback
                titleElement.style.background = '#e6f3ff';
                setTimeout(() => {
                    titleElement.style.background = '';
                }, 1000);
            }
        }
    }

    /**
     * Create topic element
     */
    createTopicElement(topic, index) {
        const topicEl = document.createElement('div');
        topicEl.className = 'topic-item';
        topicEl.dataset.topicId = topic.id;
        topicEl.dataset.topicIndex = index;
        
        topicEl.innerHTML = `
            <div class="topic-content">
                <div class="topic-title" 
                     contenteditable="true" 
                     data-setting="topic_${index + 1}"
                     data-original-source="${topic.source}">
                    ${this.escapeHtml(topic.title)}
                </div>
                
                ${topic.description ? `
                    <div class="topic-description" 
                         contenteditable="true" 
                         data-setting="topic_${index + 1}_description">
                        ${this.escapeHtml(topic.description)}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Setup event listeners for this element
        this.setupTopicElementListeners(topicEl, topic, index);
        
        return topicEl;
    }

    /**
     * Setup event listeners for a topic element
     */
    setupTopicElementListeners(topicEl, topic, index) {
        const titleEl = topicEl.querySelector('.topic-title');
        
        if (titleEl) {
            titleEl.addEventListener('input', (e) => this.handlePreviewTopicInput(e, index));
            titleEl.addEventListener('blur', (e) => this.handlePreviewTopicBlur(e, index));
            titleEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        }
    }

    /**
     * Setup save interface
     */
    setupSaveInterface() {
        // Create save status indicator if it doesn't exist
        let saveInterface = this.element.querySelector('.topics-save-interface');
        
        if (!saveInterface) {
            const container = this.element.querySelector('.topics-container');
            if (container) {
                const saveStatusHtml = `
                    <div class="topics-save-interface" style="margin-top: 10px;">
                        <div class="save-status" data-status="saved">
                            <span class="save-indicator">✅</span>
                            <span class="save-text">Saved</span>
                            <span class="save-timestamp"></span>
                        </div>
                        <div class="main-save-status" style="display: none; margin-top: 5px; font-size: 0.9em; color: #666;">
                            <span class="main-save-indicator">🔄</span>
                            <span class="main-save-text">Preparing for main save...</span>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('afterend', saveStatusHtml);
            }
        }
        
        // PHASE 3: Setup main save coordination
        this.setupMainSaveCoordination();
    }

    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.updateSaveStatus('unsaved');
        
        this.saveTimeout = setTimeout(() => {
            if (this.stateManager.hasPendingChanges()) {
                // PHASE 3: Only auto-save if not in main save process
                if (!this.mainSaveStatus.executing && !this.mainSaveStatus.prepared) {
                    this.performSave('auto');
                } else {
                    console.log('🔄 Topics Component: Skipping auto-save - main save in progress');
                }
            }
        }, 2000);
    }

    /**
     * Perform save operation
     */
    async performSave(saveType = 'manual') {
        console.log(`💾 Topics Component: Starting ${saveType} save`);
        this.updateSaveStatus('saving');
        
        try {
            const success = await this.stateManager.saveTopics(saveType);
            
            if (success) {
                this.updateSaveStatus('saved');
                console.log('✅ Topics Component: Save successful');
            } else {
                this.updateSaveStatus('error', 'Save failed');
            }
            
        } catch (error) {
            console.error('❌ Topics Component: Save failed:', error);
            this.updateSaveStatus('error', error.message);
        }
    }

    /**
     * Update save status indicator
     */
    updateSaveStatus(status, message = '') {
        const statusElement = this.element.querySelector('.save-status');
        const indicatorElement = statusElement?.querySelector('.save-indicator');
        const textElement = statusElement?.querySelector('.save-text');
        const timestampElement = statusElement?.querySelector('.save-timestamp');
        
        if (!statusElement) return;
        
        statusElement.dataset.status = status;
        
        const configs = {
            saved: { icon: '✅', text: 'Saved', color: '#10b981' },
            saving: { icon: '⏳', text: 'Saving...', color: '#f59e0b' },
            unsaved: { icon: '⚠️', text: 'Unsaved changes', color: '#ef4444' },
            error: { icon: '❌', text: 'Save failed', color: '#ef4444' }
        };
        
        const config = configs[status] || configs.saved;
        
        if (indicatorElement) indicatorElement.textContent = config.icon;
        if (textElement) {
            textElement.textContent = message || config.text;
            textElement.style.color = config.color;
        }
        
        if (timestampElement && status === 'saved') {
            timestampElement.textContent = `at ${new Date().toLocaleTimeString()}`;
        }
    }

    /**
     * Handle control actions
     */
    handleControlAction(e) {
        const action = e.target.closest('.control-btn')?.dataset.action;
        if (!action) return;
        
        e.preventDefault();
        console.log(`🎮 Topics Component: Control action ${action}`);
        
        switch (action) {
            case 'edit':
                this.openDesignPanel();
                break;
            case 'move-up':
            case 'move-down':
                // Handle section movement
                break;
            case 'duplicate':
                // Handle component duplication
                break;
            case 'delete':
                // Handle component deletion
                break;
        }
    }

    /**
     * Open design panel
     */
    openDesignPanel() {
        console.log('🎨 Topics Component: Opening design panel');
        
        // Trigger custom event for design panel
        this.triggerEvent('openTopicsDesignPanel', {
            componentId: this.componentId,
            element: this.element,
            topics: this.stateManager.getTopics()
        });
    }

    /**
     * PHASE 3: Setup main save coordination
     */
    setupMainSaveCoordination() {
        // Listen for main save events
        window.addEventListener('mainSaveInitiated', (e) => this.handleMainSaveInitiated(e));
        window.addEventListener('mainSaveExecute', (e) => this.handleMainSaveExecute(e));
        window.addEventListener('mainSaveComplete', (e) => this.handleMainSaveComplete(e));
        
        // Listen for main save button clicks
        const mainSaveButton = document.querySelector('.main-save-button, #main-save-btn, [data-action="main-save"]');
        if (mainSaveButton) {
            mainSaveButton.addEventListener('click', (e) => this.prepareForMainSave(e));
        }
        
        // Setup save status aggregation
        this.mainSaveStatus = {
            prepared: false,
            executing: false,
            completed: false,
            error: null
        };
        
        console.log('🔗 Topics Component: Main save coordination configured');
    }
    
    /**
     * PHASE 3: Prepare topics for main save
     */
    async prepareForMainSave(event) {
        console.log('🎯 Topics Component: Preparing for main save');
        
        try {
            this.updateMainSaveStatus('preparing', 'Preparing topics for main save...');
            
            // Check if there are pending changes
            if (!this.stateManager.hasPendingChanges()) {
                console.log('📝 Topics Component: No pending changes, preparation complete');
                this.mainSaveStatus.prepared = true;
                this.updateMainSaveStatus('ready', 'Ready for main save');
                return true;
            }
            
            // Prepare topics data for main save
            const topics = this.stateManager.getTopics();
            const topicsData = {};
            
            topics.forEach((topic, index) => {
                if (topic.title && topic.title.trim()) {
                    topicsData[`topic_${index + 1}`] = topic.title.trim();
                }
            });
            
            // Send preparation request to server
            const nonce = window.guestifyData?.nonce || window.guestifyMediaKit?.nonce || '';
            const response = await this.sendAjaxRequest({
                action: 'topics_main_save_prepare',
                post_id: this.stateManager.postId,
                topics: JSON.stringify(topicsData),
                nonce: nonce
            });
            
            if (response.success) {
                this.mainSaveStatus.prepared = true;
                this.mainSaveStatus.transientKey = response.data.transient_key;
                this.updateMainSaveStatus('ready', `${response.data.topics_count} topics ready for main save`);
                
                // Notify main save system that topics are ready
                this.triggerEvent('topicsReadyForMainSave', {
                    componentId: this.componentId,
                    topicsCount: response.data.topics_count,
                    transientKey: response.data.transient_key
                });
                
                return true;
            } else {
                throw new Error(response.data?.message || 'Preparation failed');
            }
            
        } catch (error) {
            console.error('❌ Topics Component: Main save preparation failed:', error);
            this.mainSaveStatus.error = error.message;
            this.updateMainSaveStatus('error', `Preparation failed: ${error.message}`);
            return false;
        }
    }
    
    /**
     * PHASE 3: Handle main save initiated event
     */
    handleMainSaveInitiated(event) {
        console.log('🚀 Topics Component: Main save initiated');
        this.updateMainSaveStatus('initiated', 'Main save starting...');
    }
    
    /**
     * PHASE 3: Handle main save execute event
     */
    async handleMainSaveExecute(event) {
        console.log('⚡ Topics Component: Executing main save');
        
        try {
            this.mainSaveStatus.executing = true;
            this.updateMainSaveStatus('executing', 'Saving topics...');
            
            // Execute main save for topics
            const nonce = window.guestifyData?.nonce || window.guestifyMediaKit?.nonce || '';
            const response = await this.sendAjaxRequest({
                action: 'topics_main_save_execute',
                post_id: this.stateManager.postId,
                transient_key: this.mainSaveStatus.transientKey,
                nonce: nonce
            });
            
            if (response.success) {
                this.mainSaveStatus.completed = true;
                this.updateMainSaveStatus('success', `${response.data.topics_saved} topics saved`);
                
                // Update state manager
                this.stateManager.pendingChanges = false;
                this.stateManager.lastSaveTimestamp = Date.now();
                
                // Notify about successful save
                this.triggerEvent('topicsMainSaveSuccess', {
                    componentId: this.componentId,
                    topicsSaved: response.data.topics_saved,
                    timestamp: response.data.execution_timestamp
                });
                
            } else {
                throw new Error(response.data?.message || 'Execution failed');
            }
            
        } catch (error) {
            console.error('❌ Topics Component: Main save execution failed:', error);
            this.mainSaveStatus.error = error.message;
            this.updateMainSaveStatus('error', `Save failed: ${error.message}`);
            
            this.triggerEvent('topicsMainSaveError', {
                componentId: this.componentId,
                error: error.message
            });
        }
    }
    
    /**
     * PHASE 3: Handle main save complete event
     */
    handleMainSaveComplete(event) {
        console.log('🎉 Topics Component: Main save completed');
        
        // Update UI to reflect completion
        setTimeout(() => {
            this.updateMainSaveStatus('hidden', '');
            this.updateSaveStatus('saved', 'Included in main save');
        }, 2000);
        
        // Reset main save status
        this.mainSaveStatus = {
            prepared: false,
            executing: false,
            completed: false,
            error: null
        };
    }
    
    /**
     * PHASE 3: Update main save status indicator
     */
    updateMainSaveStatus(status, message = '') {
        const statusElement = this.element.querySelector('.main-save-status');
        const indicatorElement = statusElement?.querySelector('.main-save-indicator');
        const textElement = statusElement?.querySelector('.main-save-text');
        
        if (!statusElement) return;
        
        const configs = {
            preparing: { icon: '🔄', text: 'Preparing for main save...', show: true, color: '#f59e0b' },
            ready: { icon: '✅', text: 'Ready for main save', show: true, color: '#10b981' },
            initiated: { icon: '🚀', text: 'Main save starting...', show: true, color: '#3b82f6' },
            executing: { icon: '⚡', text: 'Saving topics...', show: true, color: '#8b5cf6' },
            success: { icon: '🎉', text: 'Saved successfully', show: true, color: '#10b981' },
            error: { icon: '❌', text: 'Save failed', show: true, color: '#ef4444' },
            hidden: { icon: '', text: '', show: false, color: '' }
        };
        
        const config = configs[status] || configs.hidden;
        
        if (indicatorElement) indicatorElement.textContent = config.icon;
        if (textElement) {
            textElement.textContent = message || config.text;
            textElement.style.color = config.color;
        }
        
        statusElement.style.display = config.show ? 'block' : 'none';
    }
    
    /**
     * PHASE 3: Send AJAX request
     */
    async sendAjaxRequest(data) {
        const url = window.guestifyData?.ajaxUrl || '/wp-admin/admin-ajax.php';
        
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    /**
     * Handle main save (legacy compatibility)
     */
    handleMainSave() {
        console.log('🔄 Topics Component: Legacy main save triggered - using new coordination');
        this.prepareForMainSave();
    }

    /**
     * PHASE 3 FIX: Show loading error in UI
     */
    showLoadingError(message) {
        const loadingElement = this.element.querySelector('.loading-indicator, .loading-message');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div style="color: #ef4444; padding: 15px; text-align: center;">
                    <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Loading Failed</div>
                    <div style="font-size: 0.9em; margin-bottom: 10px;">${message}</div>
                    <button onclick="window.location.reload()" style="padding: 5px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * PHASE 3 FIX: Show initialization error in UI
     */
    showInitializationError(message) {
        console.error(`🚨 Topics Component: Showing initialization error: ${message}`);
        
        // Find the element that shows loading state
        const container = this.element.querySelector('.topics-container') || this.element;
        
        container.innerHTML = `
            <div style="color: #ef4444; padding: 20px; text-align: center; border: 2px dashed #ef4444; border-radius: 8px; margin: 10px;">
                <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">🚨 Topics Component Error</div>
                <div style="margin-bottom: 15px;">Failed to initialize: ${message}</div>
                <div style="font-size: 0.9em; color: #666; margin-bottom: 15px;">
                    Check browser console for detailed error information.
                </div>
                <button onclick="window.debugTopics()" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                    Debug Info
                </button>
                <button onclick="window.location.reload()" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
    }
    
    /**
     * Handle before unload
     */
    handleBeforeUnload(e) {
        if (this.stateManager.hasPendingChanges()) {
            const message = 'You have unsaved changes to your topics. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
    }

    /**
     * Handle state save success
     */
    handleStateSaveSuccess(e) {
        console.log('✅ Topics Component: State save successful');
        this.updateSaveStatus('saved', `${e.data.response.topics_saved} topics saved`);
    }

    /**
     * Trigger custom event
     */
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Cleanup
     */
    destroy() {
        // Clear timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        // Remove state listeners
        this.eventListeners.forEach((listenerId, event) => {
            this.stateManager.removeEventListener(event, listenerId);
        });
        
        console.log(`🧹 Topics Component: Cleaned up ${this.componentId}`);
    }
}

/**
 * PHASE 2: Enhanced Topics Component Manager
 * Coordinates multiple components and manages global state
 */
class TopicsComponentManager {
    constructor() {
        this.components = new Map();
        this.stateManager = null;
        this.isInitialized = false;
        
        console.log('🏗️ Topics Component Manager: Initializing...');
        this.init();
    }
    
    async init() {
        // Initialize global state manager
        if (!window.topicsStateManager) {
            window.topicsStateManager = new TopicsStateManager();
        }
        this.stateManager = window.topicsStateManager;
        
        // Setup DOM ready handling
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
        
        // Listen for dynamic content
        window.addEventListener('contentUpdated', () => this.handleContentUpdate());
        window.addEventListener('mediaKitSystemReady', () => this.handleSystemReady());
        
        // Setup global event handlers
        this.setupGlobalHandlers();
        
        this.isInitialized = true;
        console.log('✅ Topics Component Manager: Initialization complete');
    }
    
    initializeComponents() {
        const topicsElements = document.querySelectorAll('.topics-component, [data-component="topics"]');
        
        console.log(`🏗️ Topics Manager: Found ${topicsElements.length} topic components`);
        
        topicsElements.forEach((element, index) => {
            try {
                const componentId = element.dataset.componentId || `topics_${index}`;
                
                if (!this.components.has(componentId) && !element.dataset.componentInitialized) {
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
    
    setupGlobalHandlers() {
        // Global save trigger
        window.triggerTopicsSave = () => {
            console.log(`🔄 Triggering save for ${this.components.size} topics components`);
            if (this.stateManager) {
                this.stateManager.saveTopics('global_save');
            }
        };
        
        // Debug helpers
        window.debugTopics = () => {
            console.log('🔍 Topics Debug Information:');
            console.log('State Manager:', this.stateManager);
            console.log('Components:', this.components);
            console.log('State Stats:', this.stateManager?.getStats());
            console.log('Topics:', this.stateManager?.getTopics());
        };
        
        window.topicsManager = this;
    }
    
    handleContentUpdate() {
        console.log('🔄 Topics Manager: Content updated, checking for new components');
        this.initializeComponents();
    }
    
    handleSystemReady() {
        console.log('🚀 Topics Manager: System ready confirmed');
        
        // Ensure all components are connected to latest state
        this.components.forEach(component => {
            if (component.stateManager !== this.stateManager) {
                component.stateManager = this.stateManager;
                console.log(`🔗 Updated state manager reference for ${component.componentId}`);
            }
        });
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
    
    getStateManager() {
        return this.stateManager;
    }
    
    getStats() {
        return {
            componentsCount: this.components.size,
            isInitialized: this.isInitialized,
            stateStats: this.stateManager?.getStats()
        };
    }
}

// PHASE 2: Global initialization with enhanced bridge architecture
if (typeof window !== 'undefined') {
    // Initialize manager
    window.topicsComponentManager = new TopicsComponentManager();
    
    console.log('🎯 Topics Component PHASE 2: Enhanced bridge architecture initialized');
}
