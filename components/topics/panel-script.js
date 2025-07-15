/**
 * Topics Design Panel Script - PHASE 3 GMKB EVENT-DRIVEN Implementation
 * Full GMKB event bus integration for seamless cross-panel communication
 * 
 * PHASE 3 GMKB FEATURES:
 * ✅ GMKB Event Bus Integration - Native pub/sub panel communication
 * ✅ Cross-Component Event Coordination - Design panel ↔ preview ↔ component manager
 * ✅ State Manager Event Synchronization - Real-time bidirectional sync
 * ✅ UI Event Broadcasting - Panel actions to all subscribers
 * ✅ Event-Driven Panel Lifecycle - No polling, pure event coordination
 * 
 * @version 3.0.0-gmkb-event-driven
 */

// GMKB ARCHITECTURE: Ensure GMKB is available
if (!window.GMKB) {
    console.error('🚨 Topics Design Panel: GMKB event system not available!');
    throw new Error('GMKB event system required for topics design panel');
}

class TopicsDesignPanelManager {
    constructor() {
        this.isInitialized = false;
        this.stateManager = null;
        this.sortable = null;
        this.saveTimeout = null;
        this.qualityTimer = null;
        
        // GMKB ARCHITECTURE: Event system integration
        this.eventBus = window.GMKB;
        this.eventSubscriptions = new Map();
        
        // UI elements
        this.elements = {
            container: null,
            topicsList: null,
            loading: null,
            addPrompt: null,
            addForm: null,
            newTopicInput: null,
            saveStatus: null,
            counter: null,
            qualityOverview: null
        };
        
        // Configuration
        this.config = {
            maxTopics: 10,
            autoSaveDelay: 2000,
            qualityUpdateDelay: 500,
            animationDuration: 300
        };
        
        console.log('🎨 GMKB Topics Design Panel: Initializing...');
        this.init();
    }

    async init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    async initialize() {
        try {
            // Find UI elements
            this.findUIElements();
            
            // Connect to state manager
            await this.connectToStateManager();
            
            // Setup event handlers
            this.setupEventListeners();
            this.setupGMKBStateListeners();
            this.setupSortable();
            this.setupCollapsibleSections();
            
            // Register with GMKB system
            this.registerWithGMKB();
            
            // Load initial data
            await this.loadInitialData();
            
            // Initialize UI state
            this.updateUI();
            
            this.isInitialized = true;
            console.log('✅ GMKB Topics Design Panel: Initialization complete');
            
            // GMKB ARCHITECTURE: Trigger ready event through event bus
            this.eventBus.dispatch('topics:design-panel:ready', {
                panel: this,
                topicsCount: this.stateManager?.getTopics().length || 0,
                timestamp: Date.now(),
                source: 'design-panel'
            });
            
        } catch (error) {
            console.error('❌ Topics Design Panel: Initialization failed:', error);
            this.showError('Failed to initialize design panel: ' + error.message);
        }
    }

    /**
     * Find and cache UI elements
     */
    findUIElements() {
        this.elements = {
            container: document.getElementById('live-topics-container'),
            topicsList: document.getElementById('live-topics-list'),
            loading: document.getElementById('topics-loading'),
            addPrompt: document.getElementById('add-topic-prompt'),
            addForm: document.getElementById('add-topic-form'),
            newTopicInput: document.getElementById('new-topic-input'),
            saveStatus: document.getElementById('topics-save-status'),
            counter: document.getElementById('live-topic-count'),
            qualityOverview: document.getElementById('topics-quality-overview'),
            
            // Add topic interface
            addFirstBtn: document.getElementById('add-first-topic-btn'),
            confirmAddBtn: document.getElementById('confirm-add-topic'),
            cancelAddBtn: document.getElementById('cancel-add-topic'),
            
            // Settings
            sectionTitleInput: document.getElementById('section-title-input'),
            sectionIntroInput: document.getElementById('section-intro-input'),
            displayStyleSelect: document.getElementById('display-style-select'),
            columnsSelect: document.getElementById('columns-select'),
            
            // Integration
            loadFromMkcgBtn: document.getElementById('load-from-mkcg'),
            syncWithMkcgBtn: document.getElementById('sync-with-mkcg'),
            integrationStatus: document.getElementById('integration-status-text')
        };

        // Validate required elements
        const required = ['container', 'topicsList', 'loading'];
        const missing = required.filter(key => !this.elements[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required UI elements: ${missing.join(', ')}`);
        }

        console.log('🎯 Topics Design Panel: UI elements found and cached');
    }

    /**
     * Connect to global state manager
     */
    async connectToStateManager() {
        // Ensure state manager exists
        if (!window.topicsStateManager) {
            // Wait a bit for it to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!window.topicsStateManager) {
                // Create it if still missing
                const { TopicsStateManager } = await import('./script.js');
                window.topicsStateManager = new TopicsStateManager();
            }
        }
        
        this.stateManager = window.topicsStateManager;
        
        // Extract and set post ID if needed
        const postId = this.extractPostId();
        if (postId && !this.stateManager.postId) {
            this.stateManager.setPostId(postId);
        }
        
        console.log('🔗 Topics Design Panel: Connected to state manager');
    }

    /**
     * Extract post ID from various sources
     */
    extractPostId() {
        return (
            new URLSearchParams(window.location.search).get('post_id') ||
            new URLSearchParams(window.location.search).get('p') ||
            window.guestifyData?.postId ||
            window.guestifyMediaKit?.postId ||
            document.querySelector('[data-post-id]')?.dataset.postId
        );
    }

    /**
     * Setup DOM event listeners
     */
    setupEventListeners() {
        // Add topic buttons
        this.elements.addFirstBtn?.addEventListener('click', () => this.showAddTopicForm());
        this.elements.confirmAddBtn?.addEventListener('click', () => this.addNewTopic());
        this.elements.cancelAddBtn?.addEventListener('click', () => this.hideAddTopicForm());

        // New topic input
        this.elements.newTopicInput?.addEventListener('input', (e) => this.validateNewTopicInput(e.target));
        this.elements.newTopicInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addNewTopic();
            }
        });

        // Section settings
        this.elements.sectionTitleInput?.addEventListener('input', (e) => this.updateSectionTitle(e.target.value));
        this.elements.sectionIntroInput?.addEventListener('input', (e) => this.updateSectionIntro(e.target.value));

        // Display options
        this.elements.displayStyleSelect?.addEventListener('change', (e) => this.updateDisplayStyle(e.target.value));
        this.elements.columnsSelect?.addEventListener('change', (e) => this.updateColumns(e.target.value));

        // Integration actions
        this.elements.loadFromMkcgBtn?.addEventListener('click', () => this.loadFromMKCG());
        this.elements.syncWithMkcgBtn?.addEventListener('click', () => this.syncWithMKCG());

        console.log('🔗 Topics Design Panel: Event listeners configured');
    }

    /**
     * GMKB ARCHITECTURE: Register design panel with GMKB system
     */
    registerWithGMKB() {
        // Register as a system component
        if (this.eventBus.registerSystem) {
            this.eventBus.registerSystem('TopicsDesignPanel', this);
        }
        
        console.log('✅ Topics Design Panel: Registered with GMKB system');
    }
    
    /**
     * GMKB ARCHITECTURE: Setup GMKB state event listeners
     */
    setupGMKBStateListeners() {
        // Listen for topics changes
        const topicsChangedSub = this.eventBus.subscribe('topics:topics-changed',
            (e) => this.handleStateTopicsChanged(e),
            { id: 'designPanel_topicsChanged', priority: 10 }
        );
        this.eventSubscriptions.set('topics:topics-changed', topicsChangedSub);
        
        // Listen for individual topic updates
        const topicUpdateSub = this.eventBus.subscribe('topics:topic-updated',
            (e) => this.handleStateTopicUpdated(e),
            { id: 'designPanel_topicUpdated', priority: 10 }
        );
        this.eventSubscriptions.set('topics:topic-updated', topicUpdateSub);
        
        // Listen for topic additions
        const topicAddedSub = this.eventBus.subscribe('topics:topic-added',
            (e) => this.handleStateTopicAdded(e),
            { id: 'designPanel_topicAdded', priority: 10 }
        );
        this.eventSubscriptions.set('topics:topic-added', topicAddedSub);
        
        // Listen for topic removals
        const topicRemovedSub = this.eventBus.subscribe('topics:topic-removed',
            (e) => this.handleStateTopicRemoved(e),
            { id: 'designPanel_topicRemoved', priority: 10 }
        );
        this.eventSubscriptions.set('topics:topic-removed', topicRemovedSub);
        
        // Listen for topics reordered
        const topicsReorderedSub = this.eventBus.subscribe('topics:topics-reordered',
            (e) => this.handleStateTopicsReordered(e),
            { id: 'designPanel_topicsReordered', priority: 10 }
        );
        this.eventSubscriptions.set('topics:topics-reordered', topicsReorderedSub);
        
        // Listen for save events
        const saveSuccessSub = this.eventBus.subscribe('topics:save-success',
            (e) => this.handleStateSaveSuccess(e),
            { id: 'designPanel_saveSuccess', priority: 10 }
        );
        this.eventSubscriptions.set('topics:save-success', saveSuccessSub);
        
        const saveErrorSub = this.eventBus.subscribe('topics:save-error',
            (e) => this.handleStateSaveError(e),
            { id: 'designPanel_saveError', priority: 10 }
        );
        this.eventSubscriptions.set('topics:save-error', saveErrorSub);
        
        // GMKB ARCHITECTURE: Listen for design panel open requests
        const openRequestSub = this.eventBus.subscribe('topics:design-panel:open-request',
            (e) => this.handleDesignPanelOpenRequest(e),
            { id: 'designPanel_openRequest', priority: 15 }
        );
        this.eventSubscriptions.set('topics:design-panel:open-request', openRequestSub);
        
        // Listen for component manager events
        const componentEventSub = this.eventBus.subscribe('components:topics:counter-changed',
            (e) => this.handleComponentCounterChanged(e),
            { id: 'designPanel_counterChanged', priority: 5 }
        );
        this.eventSubscriptions.set('components:topics:counter-changed', componentEventSub);
        
        console.log('🔗 GMKB Topics Design Panel: Event subscriptions active');
    }

    /**
     * Setup sortable drag-and-drop
     */
    setupSortable() {
        if (!this.elements.topicsList || !window.Sortable) {
            console.warn('⚠️ Sortable not available');
            return;
        }

        this.sortable = Sortable.create(this.elements.topicsList, {
            animation: 150,
            ghostClass: 'topic-item-ghost',
            chosenClass: 'topic-item-chosen',
            dragClass: 'topic-item-drag',
            handle: '.topic-drag-handle',
            filter: '.topics-loading, .add-topic-interface',
            preventOnFilter: false,
            onStart: (evt) => {
                evt.item.classList.add('is-dragging');
                this.triggerEvent('topicDragStart', { index: evt.oldIndex });
            },
            onEnd: (evt) => {
                evt.item.classList.remove('is-dragging');
                
                if (evt.oldIndex !== evt.newIndex) {
                    this.handleTopicReorder(evt.oldIndex, evt.newIndex);
                }
                
                this.triggerEvent('topicDragEnd', { 
                    fromIndex: evt.oldIndex, 
                    toIndex: evt.newIndex 
                });
            }
        });

        console.log('🎯 Topics Design Panel: Sortable drag-and-drop enabled');
    }

    /**
     * Setup collapsible sections
     */
    setupCollapsibleSections() {
        const toggles = document.querySelectorAll('.form-section__toggle');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const section = toggle.closest('.form-section--collapsible');
                const content = section?.querySelector('.form-section__content');
                
                if (content) {
                    const isExpanded = content.style.display !== 'none';
                    content.style.display = isExpanded ? 'none' : 'block';
                    section.classList.toggle('expanded', !isExpanded);
                }
            });
        });
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        if (!this.stateManager) return;

        this.showLoading(true);
        
        try {
            // Load topics if state is empty
            if (this.stateManager.getTopics().length === 0) {
                await this.stateManager.loadTopics('auto');
            }
            
            // Render current state
            this.renderTopicsList();
            this.updateTopicsCounter();
            this.updateQualityOverview();
            this.checkIntegrationStatus();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load topics: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * GMKB ARCHITECTURE: Handle design panel open request
     */
    handleDesignPanelOpenRequest(e) {
        console.log('🎨 GMKB Design Panel: Open request received', e.data);
        
        // Show/focus the design panel
        this.openPanel();
        
        // Sync with the requesting component's data
        if (e.data.topics && e.data.topics.length > 0) {
            this.renderTopicsList();
        }
        
        // Emit acknowledgment
        this.eventBus.dispatch('topics:design-panel:opened', {
            componentId: e.data.componentId,
            timestamp: Date.now(),
            source: 'design-panel'
        });
    }
    
    /**
     * GMKB ARCHITECTURE: Handle component counter changed event
     */
    handleComponentCounterChanged(e) {
        console.log('🔢 GMKB Design Panel: Counter changed', e.data);
        
        // Update local counter display
        this.updateTopicsCounter();
        
        // Emit acknowledgment
        this.eventBus.dispatch('topics:design-panel:counter-ack', {
            currentCount: this.stateManager?.getTopics().length || 0,
            receivedCount: e.data.topicsCount,
            timestamp: Date.now(),
            source: 'design-panel'
        });
    }
    
    /**
     * GMKB ARCHITECTURE: Handle state topics changed
     */
    handleStateTopicsChanged(e) {
        if (e.data.source === 'designPanel') {
            // Ignore changes originating from design panel
            return;
        }
        
        console.log('🔄 GMKB Design Panel: Syncing with state changes');
        this.renderTopicsList();
        this.updateTopicsCounter();
        this.updateQualityOverview();
    }

    /**
     * GMKB ARCHITECTURE: Handle state topic updated
     */
    handleStateTopicUpdated(e) {
        if (e.data.source === 'designPanel') {
            return;
        }
        
        console.log(`📝 GMKB Design Panel: Updating topic ${e.data.topicId}`);
        this.updateTopicInList(e.data.index, e.data.topic);
    }
    
    /**
     * GMKB ARCHITECTURE: Handle state topic added
     */
    handleStateTopicAdded(e) {
        if (e.data.source === 'designPanel') {
            return;
        }
        
        console.log(`➕ GMKB Design Panel: Topic added, refreshing list`);
        this.renderTopicsList();
        this.updateTopicsCounter();
        this.updateQualityOverview();
    }
    
    /**
     * GMKB ARCHITECTURE: Handle state topic removed
     */
    handleStateTopicRemoved(e) {
        if (e.data.source === 'designPanel') {
            return;
        }
        
        console.log(`🗑️ GMKB Design Panel: Topic removed, refreshing list`);
        this.renderTopicsList();
        this.updateTopicsCounter();
        this.updateQualityOverview();
    }
    
    /**
     * GMKB ARCHITECTURE: Handle state topics reordered
     */
    handleStateTopicsReordered(e) {
        if (e.data.source === 'designPanel') {
            return;
        }
        
        console.log(`🔄 GMKB Design Panel: Topics reordered, refreshing list`);
        this.renderTopicsList();
    }

    /**
     * Render topics list
     */
    renderTopicsList() {
        if (!this.elements.topicsList) return;

        const topics = this.stateManager?.getTopics() || [];
        
        // Clear existing topics (but keep loading and add interface)
        const existingItems = this.elements.topicsList.querySelectorAll('.live-topic-item');
        existingItems.forEach(item => item.remove());

        if (topics.length === 0) {
            this.showAddTopicPrompt();
            return;
        }

        // Render each topic
        topics.forEach((topic, index) => {
            const topicEl = this.createTopicElement(topic, index);
            this.elements.topicsList.insertBefore(topicEl, this.elements.loading);
        });

        this.hideAddTopicPrompt();
        this.showQualityOverview();
    }

    /**
     * Create topic element for design panel
     */
    createTopicElement(topic, index) {
        const quality = this.getQualityLevel(topic.quality);
        
        const topicEl = document.createElement('div');
        topicEl.className = 'live-topic-item';
        topicEl.dataset.topicId = topic.id;
        topicEl.dataset.index = index;
        
        topicEl.innerHTML = `
            <div class="topic-drag-handle" title="Drag to reorder">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <div class="topic-content">
                <input type="text" 
                       class="topic-input" 
                       value="${this.escapeHtml(topic.title)}"
                       data-topic-id="${topic.id}"
                       data-original-value="${this.escapeHtml(topic.title)}"
                       maxlength="100"
                       placeholder="Enter topic title...">
                
                <div class="topic-meta">
                    <div class="topic-quality">
                        <span class="quality-label ${quality}">${quality.toUpperCase()}</span>
                        <div class="quality-bar">
                            <div class="quality-fill ${quality}" style="width: ${topic.quality}%"></div>
                        </div>
                        <span class="quality-score">${topic.quality}%</span>
                    </div>
                    <span class="topic-source">Source: ${topic.source}</span>
                    <span class="topic-chars">${topic.title.length}/100</span>
                </div>
            </div>
            
            <div class="topic-actions">
                <button class="topic-action-btn" title="Enhance Quality" data-action="enhance">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                </button>
                <button class="topic-action-btn" title="Duplicate Topic" data-action="duplicate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="topic-action-btn danger" title="Delete Topic" data-action="delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    </svg>
                </button>
            </div>
        `;

        // Setup event listeners
        this.setupTopicElementListeners(topicEl, topic);
        
        return topicEl;
    }

    /**
     * Setup event listeners for topic element
     */
    setupTopicElementListeners(topicEl, topic) {
        const input = topicEl.querySelector('.topic-input');
        const actionButtons = topicEl.querySelectorAll('.topic-action-btn');

        // Input handling
        input?.addEventListener('input', (e) => this.handleTopicInput(e, topic));
        input?.addEventListener('blur', (e) => this.handleTopicBlur(e, topic));
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        });

        // Action buttons
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleTopicAction(btn.dataset.action, topic, topicEl);
            });
        });
    }

    /**
     * Handle topic input changes
     */
    handleTopicInput(e, topic) {
        const newValue = e.target.value;
        const topicEl = e.target.closest('.live-topic-item');
        
        // Update character count
        const charCount = topicEl?.querySelector('.topic-chars');
        if (charCount) {
            charCount.textContent = `${newValue.length}/100`;
        }
        
        // Update quality in real-time with debouncing
        if (this.qualityTimer) {
            clearTimeout(this.qualityTimer);
        }
        
        this.qualityTimer = setTimeout(() => {
            this.updateTopicQualityDisplay(topicEl, newValue);
        }, this.config.qualityUpdateDelay);
        
        // Mark as unsaved
        this.setSaveStatus('unsaved');
    }

    /**
     * Handle topic blur (save changes)
     */
    handleTopicBlur(e, topic) {
        const newValue = e.target.value.trim();
        const originalValue = e.target.dataset.originalValue;
        
        if (newValue !== originalValue) {
            // Update state manager (this will sync with preview)
            this.stateManager.updateTopic(topic.id, { title: newValue }, 'designPanel');
            
            // Update original value
            e.target.dataset.originalValue = newValue;
            
            // Schedule auto-save
            this.scheduleAutoSave();
            
            console.log(`📝 Design Panel: Topic updated - "${originalValue}" → "${newValue}"`);
        }
    }

    /**
     * Handle topic actions
     */
    handleTopicAction(action, topic, topicEl) {
        switch (action) {
            case 'enhance':
                this.enhanceTopicQuality(topic);
                break;
            case 'duplicate':
                this.duplicateTopic(topic);
                break;
            case 'delete':
                this.deleteTopic(topic, topicEl);
                break;
        }
    }

    /**
     * Enhance topic quality
     */
    enhanceTopicQuality(topic) {
        const suggestions = this.getQualityEnhancements(topic.title);
        
        if (suggestions.length > 0) {
            const message = `Quality Enhancement Suggestions for "${topic.title}":\n\n` +
                           suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n') +
                           '\n\nChoose an option:';
            
            // Show enhancement dialog
            this.showEnhancementDialog(topic, suggestions);
        } else {
            this.showMessage(`"${topic.title}" already has excellent quality!`, 'success');
        }
    }

    /**
     * Get quality enhancement suggestions
     */
    getQualityEnhancements(title) {
        const enhancements = [];
        
        if (title.length < 20) {
            enhancements.push(`${title} Strategies and Best Practices`);
            enhancements.push(`Advanced ${title} Techniques`);
        }
        
        if (!title.includes('and') && !title.includes('&')) {
            enhancements.push(`${title} and Implementation`);
            enhancements.push(`${title} and Real-World Applications`);
        }
        
        if (title.charAt(0) !== title.charAt(0).toUpperCase()) {
            enhancements.push(title.charAt(0).toUpperCase() + title.slice(1));
        }
        
        if (!/\b(strategy|strategies|techniques|methods|approaches|solutions)\b/i.test(title)) {
            enhancements.push(`${title} Strategies`);
            enhancements.push(`${title} Methodologies`);
        }
        
        return enhancements.slice(0, 4);
    }

    /**
     * Show enhancement dialog
     */
    showEnhancementDialog(topic, suggestions) {
        const dialog = document.createElement('div');
        dialog.className = 'enhancement-dialog-overlay';
        dialog.innerHTML = `
            <div class="enhancement-dialog">
                <div class="dialog-header">
                    <h3>Enhance Topic Quality</h3>
                    <button class="dialog-close">&times;</button>
                </div>
                <div class="dialog-content">
                    <p>Original: <strong>"${this.escapeHtml(topic.title)}"</strong></p>
                    <p>Choose an enhancement:</p>
                    <div class="enhancement-options">
                        ${suggestions.map((suggestion, index) => `
                            <button class="enhancement-option" data-index="${index}">
                                <span class="option-number">${index + 1}</span>
                                <span class="option-text">${this.escapeHtml(suggestion)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="btn btn--secondary dialog-cancel">Cancel</button>
                    <button class="btn btn--primary" id="apply-custom">Apply Custom</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Event listeners
        const closeBtn = dialog.querySelector('.dialog-close');
        const cancelBtn = dialog.querySelector('.dialog-cancel');
        const optionBtns = dialog.querySelectorAll('.enhancement-option');
        
        const closeDialog = () => {
            document.body.removeChild(dialog);
        };
        
        closeBtn?.addEventListener('click', closeDialog);
        cancelBtn?.addEventListener('click', closeDialog);
        
        optionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const newTitle = suggestions[index];
                
                // Update topic
                this.stateManager.updateTopic(topic.id, { title: newTitle }, 'designPanel');
                
                // Update input field
                const topicInput = document.querySelector(`input[data-topic-id="${topic.id}"]`);
                if (topicInput) {
                    topicInput.value = newTitle;
                    topicInput.dataset.originalValue = newTitle;
                    topicInput.dispatchEvent(new Event('input'));
                }
                
                this.showMessage(`Topic enhanced: "${newTitle}"`, 'success');
                closeDialog();
            });
        });
        
        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
            }
        });
    }

    /**
     * Duplicate topic
     */
    duplicateTopic(topic) {
        const newTopic = this.stateManager.addTopic({
            title: `${topic.title} (Copy)`,
            description: topic.description,
            source: 'duplicated'
        }, -1, 'designPanel');
        
        this.scheduleAutoSave();
        this.showMessage(`Topic duplicated: "${newTopic.title}"`, 'success');
        
        console.log(`📋 Design Panel: Topic duplicated - "${topic.title}"`);
    }

    /**
     * Delete topic
     */
    deleteTopic(topic, topicEl) {
        if (!confirm(`Delete topic "${topic.title}"?`)) return;
        
        // Remove from state
        this.stateManager.removeTopic(topic.id, 'designPanel');
        
        // Remove from DOM with animation
        topicEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        topicEl.style.opacity = '0';
        topicEl.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            if (topicEl.parentNode) {
                topicEl.parentNode.removeChild(topicEl);
            }
        }, 300);
        
        this.scheduleAutoSave();
        this.showMessage(`Topic deleted: "${topic.title}"`, 'info');
        
        console.log(`🗑️ Design Panel: Topic deleted - "${topic.title}"`);
    }

    /**
     * Handle topic reorder
     */
    handleTopicReorder(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        const success = this.stateManager.reorderTopics(fromIndex, toIndex, 'designPanel');
        
        if (success) {
            this.scheduleAutoSave();
            this.showMessage(`Topic moved from position ${fromIndex + 1} to ${toIndex + 1}`, 'info');
            console.log(`🔄 Design Panel: Topic reordered from ${fromIndex} to ${toIndex}`);
        }
    }

    /**
     * Show add topic form
     */
    showAddTopicForm() {
        if (this.elements.addPrompt) {
            this.elements.addPrompt.style.display = 'none';
        }
        if (this.elements.addForm) {
            this.elements.addForm.style.display = 'block';
        }
        if (this.elements.newTopicInput) {
            this.elements.newTopicInput.focus();
        }
    }

    /**
     * Hide add topic form
     */
    hideAddTopicForm() {
        if (this.elements.addForm) {
            this.elements.addForm.style.display = 'none';
        }
        if (this.elements.addPrompt) {
            this.elements.addPrompt.style.display = 'block';
        }
        if (this.elements.newTopicInput) {
            this.elements.newTopicInput.value = '';
        }
    }

    /**
     * Add new topic
     */
    addNewTopic() {
        const input = this.elements.newTopicInput;
        const title = input?.value.trim();
        
        if (!title || title.length < 3) {
            this.showMessage('Topic must be at least 3 characters long', 'error');
            return;
        }
        
        if (title.length > 100) {
            this.showMessage('Topic cannot be longer than 100 characters', 'error');
            return;
        }
        
        // Check for duplicates
        const existingTopics = this.stateManager.getTopics();
        if (existingTopics.some(t => t.title.toLowerCase() === title.toLowerCase())) {
            this.showMessage('Topic already exists', 'error');
            return;
        }
        
        // Add to state
        const newTopic = this.stateManager.addTopic({
            title: title,
            description: '',
            source: 'design_panel'
        }, -1, 'designPanel');
        
        // Clear form
        this.hideAddTopicForm();
        
        // Schedule save
        this.scheduleAutoSave();
        
        this.showMessage(`Topic added: "${newTopic.title}"`, 'success');
        console.log(`➕ Design Panel: Topic added - "${newTopic.title}"`);
    }

    /**
     * Validate new topic input
     */
    validateNewTopicInput(input) {
        const title = input.value;
        const charCounter = document.querySelector('.char-counter');
        const qualityIndicator = document.querySelector('#new-topic-quality span');
        
        // Update character counter
        if (charCounter) {
            charCounter.textContent = `${title.length}/100`;
        }
        
        // Update quality indicator
        if (qualityIndicator && title.length > 0) {
            const quality = this.stateManager?.calculateQuality(title) || 0;
            const level = this.getQualityLevel(quality);
            
            qualityIndicator.textContent = level.charAt(0).toUpperCase() + level.slice(1);
            qualityIndicator.className = level;
        }
    }

    /**
     * Update topic quality display
     */
    updateTopicQualityDisplay(topicEl, title) {
        const quality = this.stateManager?.calculateQuality(title) || 0;
        const level = this.getQualityLevel(quality);
        
        const qualityFill = topicEl?.querySelector('.quality-fill');
        const qualityScore = topicEl?.querySelector('.quality-score');
        const qualityLabel = topicEl?.querySelector('.quality-label');
        
        if (qualityFill) {
            qualityFill.style.width = `${quality}%`;
            qualityFill.className = `quality-fill ${level}`;
        }
        
        if (qualityScore) {
            qualityScore.textContent = `${quality}%`;
        }
        
        if (qualityLabel) {
            qualityLabel.textContent = level.toUpperCase();
            qualityLabel.className = `quality-label ${level}`;
        }
    }

    /**
     * Get quality level from score
     */
    getQualityLevel(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    /**
     * Update topics counter
     */
    updateTopicsCounter() {
        const topics = this.stateManager?.getTopics() || [];
        if (this.elements.counter) {
            this.elements.counter.textContent = topics.length;
        }
        
        // Update UI based on topic count
        if (topics.length === 0) {
            this.showAddTopicPrompt();
        } else {
            this.hideAddTopicPrompt();
            this.showQualityOverview();
        }
    }

    /**
     * Update quality overview
     */
    updateQualityOverview() {
        const topics = this.stateManager?.getTopics() || [];
        
        if (topics.length === 0) {
            this.hideQualityOverview();
            return;
        }
        
        const stats = this.calculateQualityStats(topics);
        
        // Update quality stats
        const avgQualityEl = document.getElementById('average-quality');
        const completionEl = document.getElementById('completion-rate');
        const excellenceEl = document.getElementById('excellence-count');
        
        if (avgQualityEl) avgQualityEl.textContent = `${stats.averageQuality}%`;
        if (completionEl) completionEl.textContent = `${stats.completionRate}%`;
        if (excellenceEl) excellenceEl.textContent = stats.excellentTopics;
        
        // Update recommendations
        this.updateQualityRecommendations(stats);
        
        this.showQualityOverview();
    }

    /**
     * Calculate quality statistics
     */
    calculateQualityStats(topics) {
        const totalTopics = topics.length;
        const maxTopics = this.config.maxTopics;
        const validTopics = topics.filter(t => t.isValid);
        const excellentTopics = topics.filter(t => t.quality >= 80);
        
        const averageQuality = totalTopics > 0 ? 
            Math.round(topics.reduce((sum, t) => sum + t.quality, 0) / totalTopics) : 0;
        
        const completionRate = Math.round((totalTopics / maxTopics) * 100);
        
        return {
            totalTopics,
            validTopics: validTopics.length,
            excellentTopics: excellentTopics.length,
            averageQuality,
            completionRate
        };
    }

    /**
     * Update quality recommendations
     */
    updateQualityRecommendations(stats) {
        const recommendationsEl = document.getElementById('quality-recommendations');
        if (!recommendationsEl) return;
        
        const recommendations = [];
        
        if (stats.totalTopics < 3) {
            recommendations.push({
                type: 'action',
                icon: '➕',
                text: 'Add more topics to showcase your expertise (aim for 3-5 topics)'
            });
        }
        
        if (stats.averageQuality < 60) {
            recommendations.push({
                type: 'quality',
                icon: '✨',
                text: 'Improve topic quality by adding more specific details'
            });
        }
        
        if (stats.excellentTopics === 0 && stats.totalTopics > 0) {
            recommendations.push({
                type: 'enhance',
                icon: '🚀',
                text: 'Use the enhance button to improve your topics automatically'
            });
        }
        
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'success',
                icon: '✅',
                text: 'Great job! Your topics look professional and comprehensive'
            });
        }
        
        recommendationsEl.innerHTML = recommendations.map(rec => `
            <div class="recommendation recommendation--${rec.type}">
                <span class="recommendation-icon">${rec.icon}</span>
                <span class="recommendation-text">${rec.text}</span>
            </div>
        `).join('');
    }

    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.setSaveStatus('unsaved');
        
        this.saveTimeout = setTimeout(() => {
            if (this.stateManager?.hasPendingChanges()) {
                this.performSave('auto');
            }
        }, this.config.autoSaveDelay);
    }

    /**
     * Perform save operation
     */
    async performSave(saveType = 'manual') {
        if (!this.stateManager) return;
        
        console.log(`💾 Design Panel: Starting ${saveType} save`);
        this.setSaveStatus('saving');
        
        try {
            const success = await this.stateManager.saveTopics(saveType);
            
            if (success) {
                this.setSaveStatus('saved');
                console.log('✅ Design Panel: Save successful');
            } else {
                this.setSaveStatus('error', 'Save failed');
            }
            
        } catch (error) {
            console.error('❌ Design Panel: Save failed:', error);
            this.setSaveStatus('error', error.message);
        }
    }

    /**
     * Set save status
     */
    setSaveStatus(status, message = '') {
        const statusEl = this.elements.saveStatus;
        if (!statusEl) return;
        
        const iconEl = statusEl.querySelector('.save-icon');
        const textEl = statusEl.querySelector('.save-text');
        const timestampEl = statusEl.querySelector('.save-timestamp');
        
        statusEl.dataset.status = status;
        
        const configs = {
            saved: { icon: '✅', text: 'Saved', color: '#10b981' },
            saving: { icon: '⏳', text: 'Saving...', color: '#f59e0b' },
            unsaved: { icon: '⚠️', text: 'Unsaved changes', color: '#ef4444' },
            error: { icon: '❌', text: 'Save failed', color: '#ef4444' }
        };
        
        const config = configs[status] || configs.saved;
        
        if (iconEl) iconEl.textContent = config.icon;
        if (textEl) {
            textEl.textContent = message || config.text;
            textEl.style.color = config.color;
        }
        
        if (timestampEl && status === 'saved') {
            timestampEl.textContent = `at ${new Date().toLocaleTimeString()}`;
        }
    }

    /**
     * GMKB ARCHITECTURE: Handle state save success
     */
    handleStateSaveSuccess(e) {
        console.log('✅ GMKB Design Panel: State save successful');
        const topicsSaved = e.data.response?.topics_saved || e.data.topicsCount || 0;
        this.setSaveStatus('saved', `${topicsSaved} topics saved`);
    }

    /**
     * GMKB ARCHITECTURE: Handle state save error
     */
    handleStateSaveError(e) {
        console.error('❌ GMKB Design Panel: State save error:', e.data.error);
        this.setSaveStatus('error', 'Save failed');
    }

    /**
     * GMKB ARCHITECTURE: Update preview settings
     */
    updateSectionTitle(title) {
        // Use GMKB event bus for cross-component communication
        this.eventBus.dispatch('topics:section:title-updated', {
            title,
            timestamp: Date.now(),
            source: 'design-panel'
        });
    }

    updateSectionIntro(intro) {
        this.eventBus.dispatch('topics:section:intro-updated', {
            intro,
            timestamp: Date.now(),
            source: 'design-panel'
        });
    }

    updateDisplayStyle(style) {
        this.eventBus.dispatch('topics:display:style-updated', {
            style,
            timestamp: Date.now(),
            source: 'design-panel'
        });
    }

    updateColumns(columns) {
        this.eventBus.dispatch('topics:display:columns-updated', {
            columns,
            timestamp: Date.now(),
            source: 'design-panel'
        });
    }

    /**
     * Integration functions
     */
    async loadFromMKCG() {
        this.showMessage('Loading topics from MKCG...', 'info');
        
        try {
            // TODO: Implement MKCG integration
            console.log('🔄 Loading from MKCG...');
            
        } catch (error) {
            console.error('Failed to load from MKCG:', error);
            this.showMessage('Failed to load from MKCG: ' + error.message, 'error');
        }
    }

    async syncWithMKCG() {
        this.showMessage('Syncing with MKCG...', 'info');
        
        try {
            // TODO: Implement MKCG sync
            console.log('🔄 Syncing with MKCG...');
            
        } catch (error) {
            console.error('Failed to sync with MKCG:', error);
            this.showMessage('Failed to sync with MKCG: ' + error.message, 'error');
        }
    }

    checkIntegrationStatus() {
        // TODO: Check MKCG integration status
        if (this.elements.integrationStatus) {
            this.elements.integrationStatus.textContent = 'Ready for integration';
        }
    }

    /**
     * UI helper methods
     */
    showAddTopicPrompt() {
        const addInterface = document.getElementById('add-topic-interface');
        if (addInterface) {
            addInterface.style.display = 'block';
        }
    }

    hideAddTopicPrompt() {
        const addInterface = document.getElementById('add-topic-interface');
        if (addInterface) {
            addInterface.style.display = 'none';
        }
    }

    showQualityOverview() {
        if (this.elements.qualityOverview) {
            this.elements.qualityOverview.style.display = 'block';
        }
    }

    hideQualityOverview() {
        if (this.elements.qualityOverview) {
            this.elements.qualityOverview.style.display = 'none';
        }
    }

    showLoading(show) {
        if (this.elements.loading) {
            this.elements.loading.style.display = show ? 'flex' : 'none';
        }
    }

    showMessage(message, type = 'info') {
        console.log(`📢 Design Panel: ${message}`);
        
        // TODO: Implement proper toast/notification system
        // For now, use temporary alert
        if (type === 'error') {
            console.error(message);
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    updateUI() {
        this.updateTopicsCounter();
        this.updateQualityOverview();
    }

    /**
     * GMKB ARCHITECTURE: Open panel method
     */
    openPanel() {
        // Show the design panel (implementation depends on UI framework)
        const panelElement = document.querySelector('.topics-design-panel, .design-panel[data-panel="topics"]');
        if (panelElement) {
            panelElement.style.display = 'block';
            panelElement.classList.add('active');
        }
        
        // Emit panel opened event
        this.eventBus.dispatch('topics:design-panel:panel-opened', {
            timestamp: Date.now(),
            source: 'design-panel'
        });
    }
    
    /**
     * GMKB ARCHITECTURE: Trigger GMKB event (replaces custom DOM events)
     */
    triggerEvent(eventName, data) {
        // Convert legacy event names to GMKB event names
        const gmkbEventName = this.convertToGMKBEventName(eventName);
        
        this.eventBus.dispatch(gmkbEventName, {
            ...data,
            timestamp: Date.now(),
            source: 'design-panel'
        });
    }
    
    /**
     * GMKB ARCHITECTURE: Convert legacy event names to GMKB format
     */
    convertToGMKBEventName(legacyEventName) {
        const conversionMap = {
            'topicsDesignPanelReady': 'topics:design-panel:ready',
            'updateSectionTitle': 'topics:section:title-updated',
            'updateSectionIntro': 'topics:section:intro-updated',
            'updateDisplayStyle': 'topics:display:style-updated',
            'updateColumns': 'topics:display:columns-updated'
        };
        
        return conversionMap[legacyEventName] || `topics:design-panel:${legacyEventName.toLowerCase().replace(/([A-Z])/g, '-$1')}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * GMKB ARCHITECTURE: Cleanup
     */
    destroy() {
        // Clear timeouts
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        if (this.qualityTimer) {
            clearTimeout(this.qualityTimer);
        }
        
        // Unsubscribe from GMKB events
        this.eventSubscriptions.forEach((unsubscribe, eventName) => {
            try {
                unsubscribe();
                console.log(`🧹 Design Panel: Unsubscribed from ${eventName}`);
            } catch (error) {
                console.error(`❌ Design Panel: Error unsubscribing from ${eventName}:`, error);
            }
        });
        
        this.eventSubscriptions.clear();
        
        // Destroy sortable
        if (this.sortable) {
            this.sortable.destroy();
        }
        
        // Notify about panel destruction
        this.eventBus.dispatch('topics:design-panel:destroyed', {
            timestamp: Date.now()
        });
        
        console.log('🧹 GMKB Topics Design Panel: Cleaned up');
    }
}

// PHASE 3: GMKB initialization with event-driven architecture
if (typeof window !== 'undefined') {
    // Wait for GMKB to be ready before initializing
    if (window.GMKB) {
        // Initialize design panel when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.topicsDesignPanelManager = new TopicsDesignPanelManager();
                
                // Register with GMKB system
                window.GMKB.registerSystem('TopicsDesignPanelManager', window.topicsDesignPanelManager);
            });
        } else {
            window.topicsDesignPanelManager = new TopicsDesignPanelManager();
            window.GMKB.registerSystem('TopicsDesignPanelManager', window.topicsDesignPanelManager);
        }
        
        console.log('🎨 Topics Design Panel PHASE 3: GMKB event-driven architecture initialized');
    } else {
        // Wait for GMKB to be available
        const checkGMKB = () => {
            if (window.GMKB) {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        window.topicsDesignPanelManager = new TopicsDesignPanelManager();
                        window.GMKB.registerSystem('TopicsDesignPanelManager', window.topicsDesignPanelManager);
                    });
                } else {
                    window.topicsDesignPanelManager = new TopicsDesignPanelManager();
                    window.GMKB.registerSystem('TopicsDesignPanelManager', window.topicsDesignPanelManager);
                }
                console.log('🎨 Topics Design Panel PHASE 3: GMKB event-driven architecture initialized (delayed)');
            } else {
                setTimeout(checkGMKB, 100);
            }
        };
        checkGMKB();
    }
}
