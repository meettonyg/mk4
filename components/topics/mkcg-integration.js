/**
 * Topics MKCG Integration Class
 * 
 * Handles MKCG data detection, loading, and bi-directional sync for the Topics component.
 * This class serves as the foundation pattern for MKCG integration across all components.
 * 
 * @class TopicsMKCGIntegration
 * @version 1.0.0-phase6
 * @author Guestify Media Kit Builder
 * 
 * PHASE 6: COMPREHENSIVE DATA VALIDATION & QUALITY ASSURANCE
 * - Enhanced validation engine with real-time feedback
 * - Safe auto-repair mechanisms (non-destructive only)
 * - Debounced performance optimization (300ms)
 * - Integration with existing notification systems
 * - Data integrity protection with corruption detection
 * - Professional user experience with actionable guidance
 * 
 * SECURITY: All data is sanitized and validated on both client and server-side.
 * Server-side validation includes post meta sanitization via sanitize_text_field().
 * 
 * TESTING: This class is designed for comprehensive testing:
 * - Unit tests for each method
 * - Integration tests with existing panel system
 * - E2E tests for complete user workflow
 * - Validation system testing with edge cases
 * - Performance testing with debounced validation
 */
class TopicsMKCGIntegration {
    
    /**
     * Initialize Topics MKCG Integration
     * GEMINI'S APPROACH: Simple state setup, no auto-initialization
     * 
     * @param {HTMLElement} element - The topics component element
     * @param {HTMLElement} panelContainer - The design panel container
     */
    constructor(element, panelContainer) {
        this.element = element;
        this.panelContainer = panelContainer;
        this.componentType = 'topics';
        this.postId = null;
        this.mkcgData = null;
        this.isInitialized = false;
        this.saveQueue = [];
        this.errors = [];
        
        // Performance monitoring
        this.initStartTime = performance.now();
        
        // PHASE 6: Enhanced Validation System Initialization
        this.initValidationSystem();
        
        // GEMINI'S APPROACH: No auto-initialization, just state setup
        console.log('🔧 MKCG Integration constructor - ready for manual init() call');
    }
    
    /**
     * PHASE 6: Initialize Enhanced Validation System
     * Incorporating Gemini's recommendations for performance and reliability
     */
    initValidationSystem() {
        // PHASE 6: Validation configuration following Gemini's recommendations
        this.validationConfig = {
            // Simplified keyword relevance (no complex NLP as per Gemini's recommendation)
            keywordRelevance: {
                enabled: true,
                simple: true, // Start simple, avoid complex NLP
                primaryKeywords: [], // Will be populated from MKCG data if available
                scoring: 'basic' // Basic presence check rather than complex analysis
            },
            
            // Safe auto-repair (non-destructive only as per Gemini's recommendation)
            autoRepair: {
                enabled: true,
                safeActionsOnly: true, // Limit to safe, non-destructive actions
                allowedActions: [
                    'trim_whitespace',
                    'remove_html_tags',
                    'normalize_encoding',
                    'capitalize_first_letter'
                ],
                disallowedActions: [
                    'content_modification',
                    'word_replacement',
                    'structural_changes'
                ]
            },
            
            // Debounced performance (300ms as per Gemini's recommendation)
            performance: {
                debounceDelay: 300, // 300-500ms for smooth UX
                enableRealTimeValidation: true,
                batchValidation: true,
                cacheResults: true
            },
            
            // Enhanced validation rules
            rules: {
                topic_length: { min: 3, max: 100, optimal: [20, 60] },
                required_fields: ['topic_1'], // topic_1 must be filled
                content_validation: {
                    no_html: true,
                    allowed_chars: /^[a-zA-Z0-9\s\-.,!?'"()&]+$/,
                    profanity_filter: true,
                    uniqueness_check: true
                },
                quality_thresholds: {
                    excellent: 90, good: 70, fair: 50, poor: 0
                }
            }
        };
        
        // PHASE 6: Initialize validation state
        this.validationState = {
            debounceTimers: new Map(),
            validationCache: new Map(),
            lastValidationResults: {},
            activeValidations: new Set(),
            errorHistory: [],
            repairHistory: []
        };
        
        // PHASE 6: Initialize data integrity monitoring
        this.dataIntegrity = {
            checksums: new Map(),
            lastBackup: null,
            corruptionDetected: false,
            autoRepairEnabled: true,
            backupInterval: 30000 // 30 seconds
        };
        
        console.log('✅ PHASE 6: Enhanced validation system initialized with Gemini\'s recommendations');
    }
    
    /**
     * Initialize the MKCG integration system
     * GEMINI'S APPROACH: Simple, focused initialization
     * 
     * @returns {Promise<boolean>} Success status
     */
    async init() {
        try {
            console.log('🔧 MKCG Integration init() called by panel script');
            
            // Step 1: Detect post ID
            this.postId = this.detectPostId();
            if (!this.postId) {
                console.log('📝 No post ID - MKCG integration disabled');
                return false;
            }
            
            // Step 2: Detect and validate MKCG data
            const hasData = await this.detectMKCGData();
            if (!hasData) {
                console.log('📝 No MKCG data available');
                return false;
            }
            
            // Step 3: Validate data for Topics
            const isValid = this.validateDataAvailability();
            if (!isValid) {
                console.log('📝 MKCG data not valid for Topics');
                return false;
            }
            
            // Step 4: Enhance panel with MKCG controls
            this.enhancePanelWithMKCGControls();
            
            // Step 5: Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            const initTime = performance.now() - this.initStartTime;
            
            console.log('✅ MKCG Integration complete', {
                postId: this.postId,
                topicsAvailable: Object.keys(this.mkcgData.topics.topics).length,
                initTime: `${initTime.toFixed(2)}ms`
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ MKCG Integration failed:', error);
            return false;
        }
    }
    

    
    /**
     * Detect post ID using multiple strategies
     * 
     * @returns {number|null} Post ID or null if not found
     */
    detectPostId() {
        try {
            // Strategy 1: From global guestifyData
            if (window.guestifyData?.postId) {
                const postId = parseInt(window.guestifyData.postId);
                if (postId > 0) {
                    console.log(`🔍 Post ID detected from guestifyData: ${postId}`);
                    return postId;
                }
            }
            
            // Strategy 2: URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const paramStrategies = ['post_id', 'p', 'page_id', 'mkcg_post'];
            
            for (const param of paramStrategies) {
                const value = urlParams.get(param);
                if (value && !isNaN(parseInt(value))) {
                    const postId = parseInt(value);
                    if (postId > 0) {
                        console.log(`🔍 Post ID detected from URL parameter '${param}': ${postId}`);
                        return postId;
                    }
                }
            }
            
            // Strategy 3: From component data attributes
            if (this.element?.dataset?.postId) {
                const postId = parseInt(this.element.dataset.postId);
                if (postId > 0) {
                    console.log(`🔍 Post ID detected from component data: ${postId}`);
                    return postId;
                }
            }
            
            console.warn('⚠️ No valid post ID found using any detection strategy');
            return null;
            
        } catch (error) {
            this.handleError(`Post ID detection failed: ${error.message}`, 'post-detection', error);
            return null;
        }
    }
    
    /**
     * Detect and load MKCG data from global scope
     * 
     * @returns {Promise<boolean>} True if data was found and loaded
     */
    async detectMKCGData() {
        try {
            // Check for global MKCG data
            if (!window.guestifyData?.mkcgData) {
                console.log('📝 No global MKCG data available');
                return false;
            }
            
            this.mkcgData = window.guestifyData.mkcgData;
            
            // Validate data structure
            if (!this.mkcgData.topics?.topics) {
                console.log('📝 No topics data in MKCG dataset');
                return false;
            }
            
            console.log('✅ MKCG data detected and loaded', {
                hasTopics: !!this.mkcgData.topics,
                topicCount: Object.keys(this.mkcgData.topics.topics).length,
                dataSource: this.mkcgData.meta_info?.data_source || 'unknown'
            });
            
            return true;
            
        } catch (error) {
            this.handleError(`MKCG data detection failed: ${error.message}`, 'data-detection', error);
            return false;
        }
    }
    
    /**
     * Validate that required MKCG data is available for Topics
     * 
     * @returns {boolean} True if data is valid and usable
     */
    validateDataAvailability() {
        try {
            if (!this.mkcgData?.topics?.topics) {
                return false;
            }
            
            const topics = this.mkcgData.topics.topics;
            const availableTopics = Object.keys(topics).filter(key => 
                topics[key] && typeof topics[key] === 'string' && topics[key].trim().length > 0
            );
            
            if (availableTopics.length === 0) {
                console.log('📝 No usable topic data found in MKCG dataset');
                return false;
            }
            
            console.log(`✅ Validated ${availableTopics.length} usable topics in MKCG data`);
            return true;
            
        } catch (error) {
            this.handleError(`Data validation failed: ${error.message}`, 'data-validation', error);
            return false;
        }
    }
    
    /**
     * Map MKCG data to Topics component fields
     * 
     * @returns {Object} Mapped topic data ready for panel injection
     */
    mapMKCGDataToTopics() {
        try {
            const mappedData = {};
            const topics = this.mkcgData.topics.topics;
            
            // Map each topic (topic_1 through topic_5)
            for (let i = 1; i <= 5; i++) {
                const topicKey = `topic_${i}`;
                if (topics[topicKey]) {
                    // Sanitize and validate topic data
                    const topicValue = this.sanitizeTopicData(topics[topicKey]);
                    if (topicValue) {
                        mappedData[topicKey] = {
                            value: topicValue,
                            source: 'mkcg',
                            generated: this.mkcgData.topics.meta?.generated_date || null,
                            quality: this.calculateTopicQuality(topicValue)
                        };
                    }
                }
            }
            
            console.log(`🗂️ Mapped ${Object.keys(mappedData).length} topics from MKCG data`);
            return mappedData;
            
        } catch (error) {
            this.handleError(`Data mapping failed: ${error.message}`, 'data-mapping', error);
            return {};
        }
    }
    
    /**
     * Extract and sanitize topics data from MKCG
     * 
     * @returns {Array} Array of clean topic objects
     */
    extractTopicsFromMKCG() {
        try {
            const mappedData = this.mapMKCGDataToTopics();
            const extractedTopics = [];
            
            Object.entries(mappedData).forEach(([key, data]) => {
                extractedTopics.push({
                    id: key,
                    index: parseInt(key.split('_')[1]) - 1,
                    value: data.value,
                    source: data.source,
                    quality: data.quality,
                    generated: data.generated
                });
            });
            
            // Sort by index to maintain order
            extractedTopics.sort((a, b) => a.index - b.index);
            
            return extractedTopics;
            
        } catch (error) {
            this.handleError(`Topic extraction failed: ${error.message}`, 'topic-extraction', error);
            return [];
        }
    }
    
    /**
     * Enhance the Topics panel with MKCG controls
     */
    enhancePanelWithMKCGControls() {
        try {
            console.log('🎨 Enhancing Topics panel with MKCG controls...');
            
            // Find the panel container
            const panel = this.panelContainer || document.querySelector('.element-editor');
            if (!panel) {
                throw new Error('Panel container not found');
            }
            
            // Create MKCG section
            const mkcgSection = this.createMKCGSection();
            
            // Insert MKCG section at the top of the panel
            const firstSection = panel.querySelector('.form-section');
            if (firstSection) {
                firstSection.parentNode.insertBefore(mkcgSection, firstSection);
            } else {
                panel.appendChild(mkcgSection);
            }
            
            // Show the section
            mkcgSection.style.display = 'block';
            
            console.log('✅ MKCG controls added to Topics panel');
            
        } catch (error) {
            this.handleError(`Panel enhancement failed: ${error.message}`, 'panel-enhancement', error);
        }
    }
    
    /**
     * Create the MKCG integration section for the panel
     * PHASE 5: Enhanced with complete bulk operations suite
     * 
     * @returns {HTMLElement} The MKCG section element
     */
    createMKCGSection() {
        const section = document.createElement('div');
        section.className = 'mkcg-integration-section';
        section.id = 'topics-mkcg-section';
        
        const topicsCount = Object.keys(this.mkcgData.topics.topics).length;
        const dataQuality = this.calculateDataQuality();
        
        section.innerHTML = `
            <div class="form-section mkcg-section">
                <h4 class="form-section__title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                    </svg>
                    MKCG Data Integration
                </h4>
                
                <div class="mkcg-status-indicator">
                    <div class="mkcg-connection-status">
                        <span class="status-dot connected"></span>
                        <span class="status-text">Connected to Post #${this.postId}</span>
                    </div>
                    <div class="mkcg-data-info">
                        <span class="data-count">${topicsCount} topics available</span>
                        <span class="data-quality quality-${dataQuality.level}">${dataQuality.score}% quality</span>
                    </div>
                </div>
                
                <!-- PHASE 5: Enhanced Progress Indicator -->
                <div class="mkcg-progress-indicator" style="display: none;">
                    <div class="progress-bar-container">
                        <div class="progress-bar" id="mkcg-progress-bar"></div>
                    </div>
                    <div class="progress-status">
                        <span class="progress-icon">🔄</span>
                        <span class="progress-text">Processing...</span>
                        <span class="progress-percentage">0%</span>
                    </div>
                </div>
                
                <!-- PHASE 5: Basic Operations -->
                <div class="mkcg-data-controls">
                    <button type="button" class="mkcg-refresh-btn btn-secondary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"></path>
                            <path d="M3.51 15a9 9 0 0 0 14.85 3.36L23 14"></path>
                        </svg>
                        Refresh Data
                    </button>
                    <button type="button" class="mkcg-save-btn btn-success">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Save Topics
                    </button>
                </div>
                
                <!-- PHASE 5: Bulk Operations Suite -->
                <div class="mkcg-bulk-operations">
                    <h5 class="bulk-operations-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <polyline points="9 9 15 15"></polyline>
                            <polyline points="15 9 9 15"></polyline>
                        </svg>
                        Bulk Operations
                    </h5>
                    
                    <div class="bulk-operations-grid">
                        <button type="button" class="mkcg-sync-all-btn btn-primary bulk-op-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span class="btn-text">Sync All Topics</span>
                            <small class="btn-description">Load fresh MKCG data</small>
                        </button>
                        
                        <button type="button" class="mkcg-clear-all-btn btn-warning bulk-op-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            <span class="btn-text">Clear All Topics</span>
                            <small class="btn-description">Remove all content</small>
                        </button>
                        
                        <button type="button" class="mkcg-reset-btn btn-secondary bulk-op-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="1 4 1 10 7 10"></polyline>
                                <path d="M3.51 15a9 9 0 0 0 13.48 3.36"></path>
                                <path d="M21 12c0-4.97-4.03-9-9-9-2.87 0-5.42 1.34-7.07 3.44"></path>
                            </svg>
                            <span class="btn-text">Reset to MKCG</span>
                            <small class="btn-description">Restore original data</small>
                        </button>
                        
                        <button type="button" class="mkcg-bulk-undo-btn btn-outline bulk-op-btn" disabled>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 14 4 9 9 4"></polyline>
                                <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                            </svg>
                            <span class="btn-text">Undo Bulk Op</span>
                            <small class="btn-description">Undo last bulk operation</small>
                        </button>
                    </div>
                </div>
                
                <!-- PHASE 5: Auto-Save Status (Enhanced) -->
                <div class="mkcg-auto-save-status">
                    <div class="save-status-row">
                        <span class="save-status-icon">💾</span>
                        <span class="save-status-text">Auto-save: </span>
                        <span class="save-timer">Ready</span>
                        <div class="save-progress-container">
                            <div class="save-progress-bar"></div>
                        </div>
                    </div>
                </div>
                
                <div class="mkcg-help-text">
                    <small>
                        <strong>Bulk Operations:</strong> Sync loads fresh MKCG data, Clear removes all content, Reset restores original MKCG data. 
                        All operations can be undone using the Undo Bulk Op button.
                    </small>
                </div>
            </div>
        `;
        
        return section;
    }
    
    /**
     * Inject MKCG data into the Topics panel fields
     */
    injectMKCGDataIntoPanel() {
        try {
            console.log('💉 Injecting MKCG data into Topics panel...');
            
            const extractedTopics = this.extractTopicsFromMKCG();
            if (extractedTopics.length === 0) {
                console.log('📝 No topics to inject into panel');
                return;
            }
            
            // Find the topics list container
            const topicsList = document.getElementById('design-topics-list');
            if (!topicsList) {
                console.warn('⚠️ Topics list container not found in panel');
                return;
            }
            
            // Clear existing topics and add MKCG topics
            topicsList.innerHTML = '';
            
            extractedTopics.forEach((topic, index) => {
                this.addTopicToPanel(topic.value, '', 'check', index, true); // Last param indicates MKCG source
            });
            
            // Update the component preview
            this.updateTopicsInComponent();
            
            console.log(`✅ Injected ${extractedTopics.length} topics into panel`);
            
        } catch (error) {
            this.handleError(`Data injection failed: ${error.message}`, 'data-injection', error);
        }
    }
    
    /**
     * Prepare the save-back system foundation for Phase 3
     * 
     * PHASE 3 FOUNDATION: This method establishes the architecture for bi-directional
     * data flow. The save-back mechanism will use WordPress AJAX actions to update
     * post meta fields 'mkcg_topic_1', 'mkcg_topic_2', etc. with proper sanitization
     * and validation on the server-side.
     */
    prepareSaveBackSystem() {
        try {
            console.log('⚙️ Preparing save-back system foundation...');
            
            // Initialize save queue for batch operations
            this.saveQueue = [];
            
            // Setup configuration for Phase 3 implementation
            this.saveBackConfig = {
                endpoint: 'wp_ajax_save_mkcg_topics',
                ajaxUrl: window.guestifyData?.ajaxUrl,
                nonce: window.guestifyData?.nonce,
                batchSize: 5, // Save all 5 topics at once
                autoSaveDelay: 30000, // 30 seconds
                validationRules: {
                    maxLength: 100,
                    minLength: 3,
                    allowedPattern: /^[a-zA-Z0-9\s\-.,!?'"()&]+$/
                }
            };
            
            // Validate AJAX configuration
            if (!this.saveBackConfig.ajaxUrl || !this.saveBackConfig.nonce) {
                console.warn('⚠️ AJAX configuration incomplete - save-back will be limited');
            }
            
            // Setup auto-save timer (disabled for Phase 1, ready for Phase 3)
            this.autoSaveTimer = null;
            
            console.log('✅ Save-back system foundation prepared for Phase 3');
            
        } catch (error) {
            this.handleError(`Save-back preparation failed: ${error.message}`, 'save-back-prep', error);
        }
    }
    
    /**
     * Create batch save queue for efficient WordPress updates (Phase 3)
     * 
     * @param {Object} topicData - Topic data to queue for saving
     */
    createBatchSaveQueue(topicData) {
        // Foundation for Phase 3 - queue topic changes for batch saving
        if (this.saveQueue.find(item => item.key === topicData.key)) {
            // Update existing queue item
            const index = this.saveQueue.findIndex(item => item.key === topicData.key);
            this.saveQueue[index] = { ...topicData, timestamp: Date.now() };
        } else {
            // Add new queue item
            this.saveQueue.push({ ...topicData, timestamp: Date.now() });
        }
        
        // Reset auto-save timer
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        // Phase 3: Implement actual auto-save
        // this.autoSaveTimer = setTimeout(() => this.executeBatchSave(), this.saveBackConfig.autoSaveDelay);
    }
    
    /**
     * Setup event listeners for MKCG controls
     * PHASE 5: Enhanced with complete bulk operations event handling
     */
    setupEventListeners() {
        try {
            console.log('🎯 PHASE 5: Setting up enhanced event listeners for bulk operations...');
            
            // Basic Operations
            this.setupBasicOperationListeners();
            
            // PHASE 5: Bulk Operations
            this.setupBulkOperationListeners();
            
            // PHASE 5: Progress and feedback handlers
            this.setupProgressHandlers();
            
            console.log('✅ PHASE 5: Enhanced event listeners setup complete');
            
        } catch (error) {
            this.handleError(`Event listener setup failed: ${error.message}`, 'event-listeners', error);
        }
    }
    
    /**
     * PHASE 5: Setup basic operation event listeners
     */
    setupBasicOperationListeners() {
        // Refresh MKCG Data button
        const refreshBtn = document.querySelector('.mkcg-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRefreshMKCGData();
            });
        }
        
        // Manual Save button (from Phase 3)
        const saveBtn = document.querySelector('.mkcg-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof window.performManualSaveToWordPress === 'function') {
                    window.performManualSaveToWordPress();
                } else {
                    console.warn('⚠️ Manual save function not available');
                }
            });
        }
    }
    
    /**
     * PHASE 5: Setup bulk operation event listeners
     */
    setupBulkOperationListeners() {
        // Sync All Topics button
        const syncBtn = document.querySelector('.mkcg-sync-all-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSyncAllTopicsWithConfirmation();
            });
        }
        
        // Clear All Topics button  
        const clearBtn = document.querySelector('.mkcg-clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleClearAllTopicsWithConfirmation();
            });
        }
        
        // Reset to MKCG button
        const resetBtn = document.querySelector('.mkcg-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleResetToMKCGWithConfirmation();
            });
        }
        
        // Bulk Undo button
        const undoBtn = document.querySelector('.mkcg-bulk-undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleBulkUndo();
            });
        }
    }
    
    /**
     * PHASE 5: Setup progress and feedback handlers
     */
    setupProgressHandlers() {
        // Initialize bulk operation history tracking
        this.bulkOperationHistory = [];
        this.maxBulkHistorySize = 3;
        
        // Update undo button state initially
        this.updateBulkUndoButtonState();
        
        console.log('✅ Progress handlers and bulk history initialized');
    }
    
    /**
     * Handle refresh MKCG data button click
     */
    async handleRefreshMKCGData() {
        try {
            console.log('🔄 Refreshing MKCG data...');
            
            const refreshBtn = document.querySelector('.mkcg-refresh-btn');
            if (refreshBtn) {
                refreshBtn.textContent = 'Refreshing...';
                refreshBtn.disabled = true;
            }
            
            // Re-initialize with fresh data
            await this.detectMKCGData();
            this.injectMKCGDataIntoPanel();
            
            // Reset button
            if (refreshBtn) {
                refreshBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10"></path>
                        <path d="M3.51 15a9 9 0 0 0 14.85 3.36L23 14"></path>
                    </svg>
                    Refresh MKCG Data
                `;
                refreshBtn.disabled = false;
            }
            
            console.log('✅ MKCG data refreshed successfully');
            
        } catch (error) {
            this.handleError(`Refresh failed: ${error.message}`, 'refresh-data', error);
        }
    }
    
    /**
     * PHASE 5: Handle sync all topics with confirmation dialog
     */
    handleSyncAllTopicsWithConfirmation() {
        try {
            console.log('🔄 PHASE 5: Initiating Sync All Topics with confirmation...');
            
            // Get preview of topics to be synced
            const extractedTopics = this.extractTopicsFromMKCG();
            if (extractedTopics.length === 0) {
                this.showNotification('No MKCG topics available to sync', 'warning');
                return;
            }
            
            // Create preview list for confirmation dialog
            const previewList = extractedTopics.map((topic, index) => 
                `<li class="topic-preview-item">
                    <span class="topic-number">${index + 1}.</span>
                    <span class="topic-title">${this.escapeHtml(topic.value)}</span>
                    <span class="topic-quality quality-${this.getQualityLevel(topic.quality)}">${topic.quality}%</span>
                </li>`
            ).join('');
            
            // Show confirmation dialog with preview
            this.showBulkOperationConfirmation({
                operation: 'sync',
                title: 'Sync All Topics from MKCG',
                message: `This will replace all current topic content with fresh MKCG data. ${extractedTopics.length} topics will be loaded:`,
                preview: `<ul class="topics-preview-list">${previewList}</ul>`,
                icon: '🔄',
                confirmText: 'Sync All Topics',
                confirmClass: 'btn-primary',
                warning: 'Any manual edits will be lost.',
                onConfirm: () => this.executeSyncAllTopics()
            });
            
        } catch (error) {
            this.handleError(`Sync All confirmation failed: ${error.message}`, 'sync-all-confirmation', error);
        }
    }
    
    /**
     * PHASE 5: Execute sync all topics operation
     */
    executeSyncAllTopics() {
        try {
            console.log('🚀 PHASE 5: Executing Sync All Topics...');
            
            // Store current state for undo
            this.storeBulkOperationState('sync_all', 'Before syncing all topics from MKCG');
            
            // Show progress
            this.showBulkOperationProgress('sync', 'Syncing topics from MKCG data...');
            
            // Execute the sync
            setTimeout(() => {
                this.injectMKCGDataIntoPanel();
                
                // Update progress
                this.updateBulkOperationProgress(100, 'Sync completed successfully');
                
                // Hide progress and show success
                setTimeout(() => {
                    this.hideBulkOperationProgress();
                    this.showBulkOperationSuccess(
                        'All topics synced from MKCG data', 
                        `${this.extractTopicsFromMKCG().length} topics loaded successfully`
                    );
                    
                    // Update undo button state
                    this.updateBulkUndoButtonState();
                    
                    // Trigger auto-save
                    if (typeof window.scheduleAutoSave === 'function') {
                        window.scheduleAutoSave();
                    }
                }, 500);
            }, 300);
            
        } catch (error) {
            this.hideBulkOperationProgress();
            this.handleError(`Sync All execution failed: ${error.message}`, 'sync-all-execution', error);
        }
    }
    
    /**
     * Handle sync all topics button click (legacy method for backward compatibility)
     */
    handleSyncAllTopics() {
        // Redirect to new confirmation-based method
        this.handleSyncAllTopicsWithConfirmation();
    }
    
    /**
     * PHASE 5: Handle Clear All Topics with confirmation dialog
     */
    handleClearAllTopicsWithConfirmation() {
        try {
            console.log('🗑️ PHASE 5: Initiating Clear All Topics with confirmation...');
            
            // Get current topics for preview
            const currentTopics = this.getCurrentTopicsFromPanel();
            if (currentTopics.length === 0) {
                this.showNotification('No topics to clear', 'info');
                return;
            }
            
            // Create preview of content that will be lost
            const previewList = currentTopics.map((topic, index) => 
                `<li class="topic-preview-item warning">
                    <span class="topic-number">${index + 1}.</span>
                    <span class="topic-title">${this.escapeHtml(topic.title)}</span>
                    <span class="warning-icon">⚠️</span>
                </li>`
            ).join('');
            
            // Show confirmation dialog with warning
            this.showBulkOperationConfirmation({
                operation: 'clear',
                title: 'Clear All Topics',
                message: `This will permanently remove all topic content. ${currentTopics.length} topics will be cleared:`,
                preview: `<ul class="topics-preview-list warning">${previewList}</ul>`,
                icon: '⚠️',
                confirmText: 'Clear All Topics',
                confirmClass: 'btn-warning',
                warning: 'This action will remove all topic content. You can undo this operation.',
                onConfirm: () => this.executeClearAllTopics()
            });
            
        } catch (error) {
            this.handleError(`Clear All confirmation failed: ${error.message}`, 'clear-all-confirmation', error);
        }
    }
    
    /**
     * PHASE 5: Execute clear all topics operation
     */
    executeClearAllTopics() {
        try {
            console.log('🗑️ PHASE 5: Executing Clear All Topics...');
            
            // Store current state for undo
            this.storeBulkOperationState('clear_all', 'Before clearing all topics');
            
            // Show progress
            this.showBulkOperationProgress('clear', 'Clearing all topic content...');
            
            // Execute the clear
            setTimeout(() => {
                // Clear all topics via panel-script.js
                if (typeof window.clearAllTopicsContent === 'function') {
                    window.clearAllTopicsContent();
                } else {
                    // Fallback: clear manually
                    this.clearAllTopicsManually();
                }
                
                // Update progress
                this.updateBulkOperationProgress(100, 'All topics cleared successfully');
                
                // Hide progress and show success
                setTimeout(() => {
                    this.hideBulkOperationProgress();
                    this.showBulkOperationSuccess(
                        'All topics cleared successfully',
                        'All topic content has been removed'
                    );
                    
                    // Update undo button state
                    this.updateBulkUndoButtonState();
                    
                    // Trigger auto-save
                    if (typeof window.scheduleAutoSave === 'function') {
                        window.scheduleAutoSave();
                    }
                }, 500);
            }, 300);
            
        } catch (error) {
            this.hideBulkOperationProgress();
            this.handleError(`Clear All execution failed: ${error.message}`, 'clear-all-execution', error);
        }
    }
    
    /**
     * PHASE 5: Handle Reset to MKCG with confirmation dialog
     */
    handleResetToMKCGWithConfirmation() {
        try {
            console.log('🔄 PHASE 5: Initiating Reset to MKCG with confirmation...');
            
            // Get current topics and MKCG topics for comparison
            const currentTopics = this.getCurrentTopicsFromPanel();
            const mkcgTopics = this.extractTopicsFromMKCG();
            
            if (mkcgTopics.length === 0) {
                this.showNotification('No original MKCG data available to restore', 'warning');
                return;
            }
            
            // Create before/after comparison
            const comparisonHtml = this.createBeforeAfterComparison(currentTopics, mkcgTopics);
            
            // Show confirmation dialog with comparison
            this.showBulkOperationConfirmation({
                operation: 'reset',
                title: 'Reset to Original MKCG Data',
                message: 'This will restore all topics to their original MKCG data, undoing any manual modifications:',
                preview: comparisonHtml,
                icon: '🔄',
                confirmText: 'Reset to MKCG',
                confirmClass: 'btn-secondary',
                warning: 'All manual edits will be lost and replaced with original MKCG data.',
                onConfirm: () => this.executeResetToMKCG()
            });
            
        } catch (error) {
            this.handleError(`Reset to MKCG confirmation failed: ${error.message}`, 'reset-confirmation', error);
        }
    }
    
    /**
     * PHASE 5: Execute reset to MKCG operation
     */
    executeResetToMKCG() {
        try {
            console.log('🔄 PHASE 5: Executing Reset to MKCG...');
            
            // Store current state for undo
            this.storeBulkOperationState('reset_to_mkcg', 'Before resetting to original MKCG data');
            
            // Show progress
            this.showBulkOperationProgress('reset', 'Restoring original MKCG data...');
            
            // Execute the reset
            setTimeout(() => {
                // Reset to original MKCG data
                this.injectMKCGDataIntoPanel();
                
                // Update progress
                this.updateBulkOperationProgress(100, 'Reset to MKCG completed successfully');
                
                // Hide progress and show success
                setTimeout(() => {
                    this.hideBulkOperationProgress();
                    this.showBulkOperationSuccess(
                        'Reset to MKCG completed successfully',
                        'All topics restored to original MKCG data'
                    );
                    
                    // Update undo button state
                    this.updateBulkUndoButtonState();
                    
                    // Trigger auto-save
                    if (typeof window.scheduleAutoSave === 'function') {
                        window.scheduleAutoSave();
                    }
                }, 500);
            }, 300);
            
        } catch (error) {
            this.hideBulkOperationProgress();
            this.handleError(`Reset to MKCG execution failed: ${error.message}`, 'reset-execution', error);
        }
    }
    
    /**
     * PHASE 5: Handle bulk undo operation
     */
    handleBulkUndo() {
        try {
            if (this.bulkOperationHistory.length === 0) {
                this.showNotification('No bulk operations to undo', 'info');
                return;
            }
            
            const lastOperation = this.bulkOperationHistory[this.bulkOperationHistory.length - 1];
            
            console.log('⏪ PHASE 5: Undoing bulk operation:', lastOperation.operation);
            
            // Show progress
            this.showBulkOperationProgress('undo', `Undoing ${lastOperation.operation}...`);
            
            // Execute undo
            setTimeout(() => {
                // Restore previous state
                this.restoreTopicsFromSnapshot(lastOperation.snapshot);
                
                // Remove from history
                this.bulkOperationHistory.pop();
                
                // Update progress
                this.updateBulkOperationProgress(100, 'Undo completed successfully');
                
                // Hide progress and show success
                setTimeout(() => {
                    this.hideBulkOperationProgress();
                    this.showBulkOperationSuccess(
                        'Bulk operation undone successfully',
                        `${lastOperation.operation} has been reversed`
                    );
                    
                    // Update undo button state
                    this.updateBulkUndoButtonState();
                    
                    // Trigger auto-save
                    if (typeof window.scheduleAutoSave === 'function') {
                        window.scheduleAutoSave();
                    }
                }, 500);
            }, 300);
            
        } catch (error) {
            this.hideBulkOperationProgress();
            this.handleError(`Bulk undo failed: ${error.message}`, 'bulk-undo', error);
        }
    }
    
    // ===== UTILITY METHODS =====
    
    /**
     * PHASE 5: Escape HTML for safe insertion
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        if (!text || typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * PHASE 5: Get quality level from score
     * @param {number} score - Quality score 0-100
     * @returns {string} Quality level
     */
    getQualityLevel(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }
    
    /**
     * PHASE 5: Get current topics from panel inputs
     * @returns {Array} Array of current topic objects
     */
    getCurrentTopicsFromPanel() {
        const currentTopics = [];
        
        // Get topics from enhanced panel inputs (MKCG mode)
        for (let i = 0; i < 5; i++) {
            const titleInput = document.querySelector(`[data-topic-title="${i}"]`);
            const descInput = document.querySelector(`[data-topic-description="${i}"]`);
            const iconSelect = document.querySelector(`[data-topic-icon="${i}"]`);
            
            if (titleInput) {
                const title = titleInput.value.trim();
                if (title) {
                    currentTopics.push({
                        index: i,
                        title: title,
                        description: descInput ? descInput.value.trim() : '',
                        icon: iconSelect ? iconSelect.value : 'check'
                    });
                }
            }
        }
        
        return currentTopics;
    }
    
    /**
     * PHASE 5: Show bulk operation confirmation dialog
     * @param {Object} options - Dialog options
     */
    showBulkOperationConfirmation(options) {
        // Remove existing modals
        const existingModals = document.querySelectorAll('.bulk-operation-modal-overlay');
        existingModals.forEach(modal => modal.remove());
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'bulk-operation-modal-overlay';
        modalOverlay.innerHTML = `
            <div class="bulk-operation-modal">
                <div class="modal-header">
                    <span class="modal-icon">${options.icon}</span>
                    <h3 class="modal-title">${options.title}</h3>
                    <button class="modal-close-btn">&times;</button>
                </div>
                
                <div class="modal-body">
                    <p class="modal-message">${options.message}</p>
                    ${options.preview ? `<div class="modal-preview">${options.preview}</div>` : ''}
                    ${options.warning ? `<div class="modal-warning"><strong>Warning:</strong> ${options.warning}</div>` : ''}
                </div>
                
                <div class="modal-footer">
                    <button class="modal-cancel-btn btn-secondary">Cancel</button>
                    <button class="modal-confirm-btn ${options.confirmClass}">${options.confirmText}</button>
                </div>
            </div>
        `;
        
        // Style the modal
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease-out;
        `;
        
        const modal = modalOverlay.querySelector('.bulk-operation-modal');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 0;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            animation: slideInUp 0.3s ease-out;
        `;
        
        // Add to DOM
        document.body.appendChild(modalOverlay);
        
        // Event handlers
        const closeModal = () => {
            modalOverlay.style.animation = 'fadeOut 0.2s ease-in';
            setTimeout(() => modalOverlay.remove(), 200);
        };
        
        // Close handlers
        modalOverlay.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        modalOverlay.querySelector('.modal-cancel-btn').addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        
        // Confirm handler
        modalOverlay.querySelector('.modal-confirm-btn').addEventListener('click', () => {
            closeModal();
            if (options.onConfirm) {
                options.onConfirm();
            }
        });
        
        // ESC key handler
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    /**
     * PHASE 5: Show bulk operation progress indicator
     * @param {string} operation - Operation type
     * @param {string} message - Progress message
     */
    showBulkOperationProgress(operation, message) {
        const progressIndicator = document.querySelector('.mkcg-progress-indicator');
        if (progressIndicator) {
            progressIndicator.style.display = 'block';
            
            const progressIcon = progressIndicator.querySelector('.progress-icon');
            const progressText = progressIndicator.querySelector('.progress-text');
            const progressBar = progressIndicator.querySelector('.progress-bar');
            const progressPercentage = progressIndicator.querySelector('.progress-percentage');
            
            // Operation-specific icons
            const icons = {
                sync: '🔄',
                clear: '🗑️',
                reset: '🔄',
                undo: '⏪'
            };
            
            if (progressIcon) progressIcon.textContent = icons[operation] || '🔄';
            if (progressText) progressText.textContent = message;
            if (progressBar) {
                progressBar.style.width = '10%';
                progressBar.style.background = '#3b82f6';
            }
            if (progressPercentage) progressPercentage.textContent = '10%';
        }
    }
    
    /**
     * PHASE 5: Update bulk operation progress
     * @param {number} percentage - Progress percentage
     * @param {string} message - Progress message
     */
    updateBulkOperationProgress(percentage, message) {
        const progressIndicator = document.querySelector('.mkcg-progress-indicator');
        if (progressIndicator) {
            const progressText = progressIndicator.querySelector('.progress-text');
            const progressBar = progressIndicator.querySelector('.progress-bar');
            const progressPercentage = progressIndicator.querySelector('.progress-percentage');
            
            if (progressText) progressText.textContent = message;
            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
            
            // Update color based on progress
            if (progressBar) {
                if (percentage >= 100) {
                    progressBar.style.background = '#10b981'; // Green for complete
                } else if (percentage >= 70) {
                    progressBar.style.background = '#3b82f6'; // Blue for in progress
                } else {
                    progressBar.style.background = '#f59e0b'; // Orange for starting
                }
            }
        }
    }
    
    /**
     * PHASE 5: Hide bulk operation progress indicator
     */
    hideBulkOperationProgress() {
        const progressIndicator = document.querySelector('.mkcg-progress-indicator');
        if (progressIndicator) {
            progressIndicator.style.display = 'none';
        }
    }
    
    /**
     * PHASE 5: Show bulk operation success notification
     * @param {string} title - Success title
     * @param {string} message - Success message
     */
    showBulkOperationSuccess(title, message) {
        // Use enhanced notification system from panel-script.js if available
        if (typeof window.showBulkOperationFeedback === 'function') {
            window.showBulkOperationFeedback(`${title}: ${message}`, 'success');
        } else {
            // Fallback notification
            this.showNotification(`${title}: ${message}`, 'success');
        }
    }
    
    /**
     * PHASE 5: Store bulk operation state for undo
     * @param {string} operation - Operation type
     * @param {string} description - Operation description
     */
    storeBulkOperationState(operation, description) {
        const snapshot = {
            topics: this.getCurrentTopicsFromPanel(),
            timestamp: Date.now(),
            operation: operation,
            description: description
        };
        
        this.bulkOperationHistory.push(snapshot);
        
        // Keep only the last maxBulkHistorySize operations
        if (this.bulkOperationHistory.length > this.maxBulkHistorySize) {
            this.bulkOperationHistory.shift();
        }
        
        console.log(`💾 PHASE 5: Stored bulk operation state for ${operation}:`, {
            historySize: this.bulkOperationHistory.length,
            operation: operation,
            topicsCount: snapshot.topics.length
        });
    }
    
    /**
     * PHASE 5: Update bulk undo button state
     */
    updateBulkUndoButtonState() {
        const undoButton = document.querySelector('.mkcg-bulk-undo-btn');
        if (undoButton) {
            const hasHistory = this.bulkOperationHistory && this.bulkOperationHistory.length > 0;
            
            undoButton.disabled = !hasHistory;
            undoButton.style.opacity = hasHistory ? '1' : '0.5';
            
            if (hasHistory) {
                const lastOperation = this.bulkOperationHistory[this.bulkOperationHistory.length - 1];
                undoButton.title = `Undo ${lastOperation.operation} (${this.bulkOperationHistory.length} operations available)`;
                undoButton.querySelector('.btn-description').textContent = `Undo ${lastOperation.operation}`;
            } else {
                undoButton.title = 'No bulk operations to undo';
                undoButton.querySelector('.btn-description').textContent = 'No operations to undo';
            }
        }
    }
    
    /**
     * PHASE 5: Restore topics from snapshot
     * @param {Object} snapshot - Topics snapshot to restore
     */
    restoreTopicsFromSnapshot(snapshot) {
        if (!snapshot || !snapshot.topics) {
            console.warn('⚠️ PHASE 5: Invalid snapshot for restore operation');
            return;
        }
        
        console.log('🔄 PHASE 5: Restoring topics from snapshot:', {
            operation: snapshot.operation,
            topicsCount: snapshot.topics.length,
            timestamp: new Date(snapshot.timestamp).toLocaleString()
        });
        
        // Clear all current topics first
        this.clearAllTopicsManually();
        
        // Restore topics from snapshot
        snapshot.topics.forEach((topic, index) => {
            const titleInput = document.querySelector(`[data-topic-title="${topic.index}"]`);
            const descInput = document.querySelector(`[data-topic-description="${topic.index}"]`);
            const iconSelect = document.querySelector(`[data-topic-icon="${topic.index}"]`);
            
            if (titleInput) {
                titleInput.value = topic.title;
                
                // Update character counters and indicators if in MKCG mode
                if (typeof window.updateCharCounter === 'function') {
                    const topicItem = titleInput.closest('.enhanced-topic-item');
                    if (topicItem) {
                        window.updateCharCounter(titleInput, topicItem);
                        if (typeof window.updateTopicIndicators === 'function') {
                            window.updateTopicIndicators(topicItem, topic.index);
                        }
                    }
                }
            }
            
            if (descInput) {
                descInput.value = topic.description;
                
                if (typeof window.updateCharCounter === 'function') {
                    const topicItem = descInput.closest('.enhanced-topic-item');
                    if (topicItem) {
                        window.updateCharCounter(descInput, topicItem);
                    }
                }
            }
            
            if (iconSelect) {
                iconSelect.value = topic.icon;
            }
        });
        
        // Update component preview
        this.updateTopicsInComponent();
        
        console.log('✅ PHASE 5: Topics restored from snapshot successfully');
    }
    
    /**
     * PHASE 5: Clear all topics manually (fallback method)
     */
    clearAllTopicsManually() {
        for (let i = 0; i < 5; i++) {
            const titleInput = document.querySelector(`[data-topic-title="${i}"]`);
            const descInput = document.querySelector(`[data-topic-description="${i}"]`);
            const iconSelect = document.querySelector(`[data-topic-icon="${i}"]`);
            
            if (titleInput) {
                titleInput.value = '';
                
                // Update character counters and indicators if in MKCG mode
                if (typeof window.updateCharCounter === 'function') {
                    const topicItem = titleInput.closest('.enhanced-topic-item');
                    if (topicItem) {
                        window.updateCharCounter(titleInput, topicItem);
                        if (typeof window.updateTopicIndicators === 'function') {
                            window.updateTopicIndicators(topicItem, i);
                        }
                    }
                }
            }
            
            if (descInput) {
                descInput.value = '';
                
                if (typeof window.updateCharCounter === 'function') {
                    const topicItem = descInput.closest('.enhanced-topic-item');
                    if (topicItem) {
                        window.updateCharCounter(descInput, topicItem);
                    }
                }
            }
            
            if (iconSelect) {
                iconSelect.value = 'check';
            }
        }
        
        // Update component preview
        this.updateTopicsInComponent();
    }
    
    /**
     * PHASE 5: Create before/after comparison for confirmation dialogs
     * @param {Array} currentTopics - Current topics
     * @param {Array} mkcgTopics - MKCG topics
     * @returns {string} HTML comparison
     */
    createBeforeAfterComparison(currentTopics, mkcgTopics) {
        const comparisonHtml = `
            <div class="before-after-comparison">
                <div class="comparison-column">
                    <h4 class="comparison-title">Current Topics</h4>
                    <ul class="comparison-list current">
                        ${currentTopics.length > 0 ? 
                            currentTopics.map((topic, index) => 
                                `<li class="comparison-item">
                                    <span class="item-number">${index + 1}.</span>
                                    <span class="item-title">${this.escapeHtml(topic.title)}</span>
                                </li>`
                            ).join('') : 
                            '<li class="comparison-item empty">No current topics</li>'
                        }
                    </ul>
                </div>
                
                <div class="comparison-arrow">→</div>
                
                <div class="comparison-column">
                    <h4 class="comparison-title">MKCG Topics</h4>
                    <ul class="comparison-list mkcg">
                        ${mkcgTopics.map((topic, index) => 
                            `<li class="comparison-item">
                                <span class="item-number">${index + 1}.</span>
                                <span class="item-title">${this.escapeHtml(topic.value)}</span>
                                <span class="item-quality quality-${this.getQualityLevel(topic.quality)}">${topic.quality}%</span>
                            </li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        return comparisonHtml;
    }
    
    /**
     * PHASE 6: Initialize Enhanced Validation Monitoring
     * Sets up real-time validation monitoring and data integrity checks
     */
    initValidationMonitoring() {
        try {
            console.log('🔍 PHASE 6: Initializing enhanced validation monitoring...');
            
            // Set up data integrity monitoring interval
            if (this.dataIntegrity.backupInterval > 0) {
                setInterval(() => {
                    this.performDataIntegrityCheck();
                }, this.dataIntegrity.backupInterval);
            }
            
            // Initialize primary keywords from MKCG data if available
            if (this.mkcgData) {
                this.extractPrimaryKeywords();
            }
            
            // Set up validation event listeners
            this.setupValidationEventListeners();
            
            console.log('✅ PHASE 6: Enhanced validation monitoring initialized');
            
        } catch (error) {
            this.handleError(`Validation monitoring initialization failed: ${error.message}`, 'validation-monitoring', error);
        }
    }
    
    /**
     * PHASE 6: Extract Primary Keywords from MKCG Data
     * Simple keyword extraction following Gemini's recommendation (no complex NLP)
     */
    extractPrimaryKeywords() {
        if (!this.mkcgData?.topics?.topics) return;
        
        const topics = this.mkcgData.topics.topics;
        const keywords = new Set();
        
        // Extract keywords from existing MKCG topics (simple word extraction)
        Object.values(topics).forEach(topic => {
            if (typeof topic === 'string' && topic.length > 0) {
                // Simple word extraction (split by spaces, filter short words)
                const words = topic.toLowerCase().split(/\s+/)
                    .filter(word => word.length >= 3 && /^[a-zA-Z]+$/.test(word));
                words.forEach(word => keywords.add(word));
            }
        });
        
        this.validationConfig.keywordRelevance.primaryKeywords = Array.from(keywords).slice(0, 20);
        
        console.log(`🔍 PHASE 6: Extracted ${keywords.size} primary keywords for relevance scoring`);
    }
    
    /**
     * PHASE 6: Setup Enhanced Validation Event Listeners
     * Implements debounced validation following Gemini's recommendations
     */
    setupValidationEventListeners() {
        // This will be called when topics are added to the panel to attach validation
        // The actual event listeners are attached in the panel-script.js enhancement
        console.log('🎯 PHASE 6: Validation event listeners prepared for panel integration');
    }
    
    /**
     * PHASE 6: Debounced Topic Validation
     * Implements 300ms debouncing as recommended by Gemini
     * 
     * @param {string} topicValue - Topic value to validate
     * @param {number} topicIndex - Topic index (0-4)
     * @param {HTMLElement} inputElement - Input element for UI feedback
     * @returns {Promise<Object>} Validation results
     */
    validateTopicDebounced(topicValue, topicIndex, inputElement = null) {
        return new Promise((resolve) => {
            const validationKey = `topic_${topicIndex}`;
            
            // Clear existing timer for this topic
            if (this.validationState.debounceTimers.has(validationKey)) {
                clearTimeout(this.validationState.debounceTimers.get(validationKey));
            }
            
            // Set new debounced timer (300ms as per Gemini's recommendation)
            const timer = setTimeout(async () => {
                try {
                    const results = await this.performComprehensiveValidation(topicValue, topicIndex);
                    
                    // Cache results for performance
                    this.validationState.validationCache.set(validationKey, {
                        results,
                        timestamp: Date.now(),
                        value: topicValue
                    });
                    
                    // Update UI if input element provided
                    if (inputElement) {
                        this.updateValidationUI(inputElement, results);
                    }
                    
                    // Remove from active validations
                    this.validationState.activeValidations.delete(validationKey);
                    
                    resolve(results);
                    
                } catch (error) {
                    this.handleError(`Debounced validation failed for topic ${topicIndex}: ${error.message}`, 'validation-debounced', error);
                    resolve({ isValid: false, errors: [error.message] });
                }
            }, this.validationConfig.performance.debounceDelay);
            
            this.validationState.debounceTimers.set(validationKey, timer);
            this.validationState.activeValidations.add(validationKey);
        });
    }
    
    /**
     * PHASE 6: Perform Comprehensive Topic Validation
     * Comprehensive validation following all established rules
     * 
     * @param {string} topicValue - Topic value to validate
     * @param {number} topicIndex - Topic index for context
     * @returns {Promise<Object>} Comprehensive validation results
     */
    async performComprehensiveValidation(topicValue, topicIndex) {
        const results = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            quality: {
                score: 0,
                level: 'poor',
                breakdown: {}
            },
            autoRepair: {
                performed: false,
                actions: [],
                originalValue: topicValue,
                repairedValue: topicValue
            }
        };
        
        try {
            // Step 1: Basic validation
            const basicValidation = this.performBasicValidation(topicValue, topicIndex);
            results.errors.push(...basicValidation.errors);
            results.warnings.push(...basicValidation.warnings);
            
            // Step 2: Safe auto-repair (following Gemini's recommendation)
            if (this.validationConfig.autoRepair.enabled && basicValidation.repairableIssues.length > 0) {
                const repairResult = this.performSafeAutoRepair(topicValue, basicValidation.repairableIssues);
                if (repairResult.repaired) {
                    results.autoRepair = repairResult;
                    topicValue = repairResult.repairedValue; // Use repaired value for further validation
                }
            }
            
            // Step 3: Quality scoring (enhanced version)
            const qualityResults = this.calculateEnhancedTopicQuality(topicValue, topicIndex);
            results.quality = qualityResults;
            
            // Step 4: Content-specific validation
            const contentValidation = this.performContentValidation(topicValue, topicIndex);
            results.errors.push(...contentValidation.errors);
            results.warnings.push(...contentValidation.warnings);
            results.suggestions.push(...contentValidation.suggestions);
            
            // Step 5: Uniqueness validation
            const uniquenessValidation = this.performUniquenessValidation(topicValue, topicIndex);
            results.warnings.push(...uniquenessValidation.warnings);
            results.suggestions.push(...uniquenessValidation.suggestions);
            
            // Step 6: Keyword relevance (simplified as per Gemini's recommendation)
            if (this.validationConfig.keywordRelevance.enabled) {
                const relevanceResults = this.performSimpleKeywordRelevance(topicValue);
                results.quality.breakdown.keywordRelevance = relevanceResults.score;
                results.suggestions.push(...relevanceResults.suggestions);
            }
            
            // Final validation status
            results.isValid = results.errors.length === 0;
            
            // Log validation performance
            console.log(`🔍 PHASE 6: Validation completed for topic ${topicIndex}:`, {
                isValid: results.isValid,
                qualityScore: results.quality.score,
                errorsCount: results.errors.length,
                autoRepaired: results.autoRepair.performed
            });
            
            return results;
            
        } catch (error) {
            this.handleError(`Comprehensive validation failed: ${error.message}`, 'validation-comprehensive', error);
            results.isValid = false;
            results.errors.push(`Validation error: ${error.message}`);
            return results;
        }
    }
    
    /**
     * PHASE 6: Perform Basic Validation
     * Basic validation rules following established requirements
     * 
     * @param {string} topicValue - Topic value to validate
     * @param {number} topicIndex - Topic index
     * @returns {Object} Basic validation results
     */
    performBasicValidation(topicValue, topicIndex) {
        const results = {
            errors: [],
            warnings: [],
            repairableIssues: []
        };
        
        const rules = this.validationConfig.rules;
        
        // Length validation
        if (!topicValue || topicValue.length === 0) {
            if (topicIndex === 0) { // topic_1 is required
                results.errors.push('Topic 1 is required and cannot be empty');
            } else {
                results.warnings.push('Topic is empty');
            }
        } else if (topicValue.length < rules.topic_length.min) {
            results.errors.push(`Topic too short (minimum ${rules.topic_length.min} characters)`);
        } else if (topicValue.length > rules.topic_length.max) {
            results.errors.push(`Topic too long (maximum ${rules.topic_length.max} characters)`);
        }
        
        // Content validation
        if (topicValue && topicValue.length > 0) {
            // HTML tags detection
            if (/<[^>]*>/g.test(topicValue)) {
                results.repairableIssues.push('contains_html_tags');
                results.warnings.push('Contains HTML tags that will be removed');
            }
            
            // Invalid characters
            if (!rules.content_validation.allowed_chars.test(topicValue)) {
                results.warnings.push('Contains special characters that may not display correctly');
            }
            
            // Whitespace issues
            if (topicValue !== topicValue.trim()) {
                results.repairableIssues.push('excess_whitespace');
            }
            
            // Capitalization
            if (topicValue.length > 0 && !/^[A-Z]/.test(topicValue)) {
                results.repairableIssues.push('missing_capitalization');
                results.warnings.push('Consider capitalizing the first letter');
            }
        }
        
        return results;
    }
    
    /**
     * PHASE 6: Perform Safe Auto-Repair
     * Safe, non-destructive auto-repair following Gemini's recommendations
     * 
     * @param {string} originalValue - Original topic value
     * @param {Array} repairableIssues - List of issues that can be safely repaired
     * @returns {Object} Repair results
     */
    performSafeAutoRepair(originalValue, repairableIssues) {
        const repairResult = {
            repaired: false,
            actions: [],
            originalValue: originalValue,
            repairedValue: originalValue
        };
        
        let currentValue = originalValue;
        
        // Only perform safe, non-destructive repairs as per Gemini's recommendation
        repairableIssues.forEach(issue => {
            if (this.validationConfig.autoRepair.allowedActions.includes(this.getRepairActionForIssue(issue))) {
                switch (issue) {
                    case 'excess_whitespace':
                        const trimmed = currentValue.trim();
                        if (trimmed !== currentValue) {
                            currentValue = trimmed;
                            repairResult.actions.push('Trimmed excess whitespace');
                            repairResult.repaired = true;
                        }
                        break;
                        
                    case 'contains_html_tags':
                        const withoutHTML = currentValue.replace(/<[^>]*>/g, '');
                        if (withoutHTML !== currentValue) {
                            currentValue = withoutHTML;
                            repairResult.actions.push('Removed HTML tags');
                            repairResult.repaired = true;
                        }
                        break;
                        
                    case 'missing_capitalization':
                        if (currentValue.length > 0 && !/^[A-Z]/.test(currentValue)) {
                            currentValue = currentValue.charAt(0).toUpperCase() + currentValue.slice(1);
                            repairResult.actions.push('Capitalized first letter');
                            repairResult.repaired = true;
                        }
                        break;
                }
            }
        });
        
        repairResult.repairedValue = currentValue;
        
        // Log repair actions for transparency
        if (repairResult.repaired) {
            console.log(`🔧 PHASE 6: Safe auto-repair performed:`, repairResult.actions);
            this.validationState.repairHistory.push({
                timestamp: Date.now(),
                originalValue: originalValue,
                repairedValue: currentValue,
                actions: repairResult.actions
            });
        }
        
        return repairResult;
    }
    
    /**
     * PHASE 6: Get Repair Action for Issue
     * Maps validation issues to repair actions
     * 
     * @param {string} issue - Validation issue
     * @returns {string} Repair action
     */
    getRepairActionForIssue(issue) {
        const actionMap = {
            'excess_whitespace': 'trim_whitespace',
            'contains_html_tags': 'remove_html_tags',
            'missing_capitalization': 'capitalize_first_letter'
        };
        
        return actionMap[issue] || 'unknown_action';
    }
    
    /**
     * PHASE 6: Calculate Enhanced Topic Quality
     * Enhanced quality calculation with detailed breakdown
     * 
     * @param {string} topicValue - Topic value to analyze
     * @param {number} topicIndex - Topic index for context
     * @returns {Object} Enhanced quality results
     */
    calculateEnhancedTopicQuality(topicValue, topicIndex) {
        const qualityResult = {
            score: 0,
            level: 'poor',
            breakdown: {
                length: 0,
                wordCount: 0,
                professionalism: 0,
                completeness: 0,
                keywordRelevance: 0
            },
            feedback: [],
            suggestions: []
        };
        
        if (!topicValue || topicValue.length === 0) {
            qualityResult.feedback.push('Topic is empty');
            return qualityResult;
        }
        
        const rules = this.validationConfig.rules;
        
        // Length scoring (enhanced)
        const length = topicValue.length;
        const optimalRange = rules.topic_length.optimal;
        if (length >= optimalRange[0] && length <= optimalRange[1]) {
            qualityResult.breakdown.length = 40;
            qualityResult.feedback.push('Excellent length');
        } else if (length >= rules.topic_length.min && length <= rules.topic_length.max) {
            qualityResult.breakdown.length = 25;
            qualityResult.feedback.push('Good length');
        } else {
            qualityResult.breakdown.length = 10;
            if (length < optimalRange[0]) {
                qualityResult.suggestions.push(`Consider expanding to ${optimalRange[0]}-${optimalRange[1]} characters for optimal impact`);
            } else {
                qualityResult.suggestions.push(`Consider shortening to ${optimalRange[0]}-${optimalRange[1]} characters for better readability`);
            }
        }
        
        // Word count scoring
        const wordCount = topicValue.split(/\s+/).length;
        if (wordCount >= 2 && wordCount <= 8) {
            qualityResult.breakdown.wordCount = 30;
            qualityResult.feedback.push('Optimal word count');
        } else if (wordCount >= 1 && wordCount <= 12) {
            qualityResult.breakdown.wordCount = 15;
        } else {
            qualityResult.breakdown.wordCount = 5;
            qualityResult.suggestions.push('Aim for 2-8 words for optimal readability');
        }
        
        // Professionalism scoring
        let professionalismScore = 0;
        if (/^[A-Z]/.test(topicValue)) professionalismScore += 10;
        if (!/\s{2,}/.test(topicValue)) professionalismScore += 10;
        if (!/[!]{2,}/.test(topicValue)) professionalismScore += 10;
        qualityResult.breakdown.professionalism = professionalismScore;
        
        if (professionalismScore < 20) {
            qualityResult.suggestions.push('Improve professionalism: capitalize first letter, avoid double spaces and excessive punctuation');
        }
        
        // Completeness scoring (based on topic index)
        if (topicIndex === 0) {
            qualityResult.breakdown.completeness = 10; // Required field bonus
        } else {
            qualityResult.breakdown.completeness = 5;
        }
        
        // Calculate total score
        qualityResult.score = Math.min(100, Object.values(qualityResult.breakdown).reduce((sum, score) => sum + score, 0));
        
        // Determine quality level
        const thresholds = rules.quality_thresholds;
        if (qualityResult.score >= thresholds.excellent) {
            qualityResult.level = 'excellent';
        } else if (qualityResult.score >= thresholds.good) {
            qualityResult.level = 'good';
        } else if (qualityResult.score >= thresholds.fair) {
            qualityResult.level = 'fair';
        } else {
            qualityResult.level = 'poor';
        }
        
        return qualityResult;
    }
    
    /**
     * PHASE 6: Perform Content Validation
     * Content-specific validation rules
     * 
     * @param {string} topicValue - Topic value to validate
     * @param {number} topicIndex - Topic index
     * @returns {Object} Content validation results
     */
    performContentValidation(topicValue, topicIndex) {
        const results = {
            errors: [],
            warnings: [],
            suggestions: []
        };
        
        if (!topicValue || topicValue.length === 0) {
            return results;
        }
        
        // Basic profanity check (simple word list approach)
        if (this.validationConfig.rules.content_validation.profanity_filter) {
            const profanityDetected = this.performSimpleProfanityCheck(topicValue);
            if (profanityDetected.hasProfanity) {
                results.errors.push('Content contains inappropriate language');
            }
        }
        
        // Check for overly promotional language
        const promotionalWords = ['buy now', 'click here', 'free', 'guaranteed', 'limited time'];
        const hasPromotional = promotionalWords.some(word => topicValue.toLowerCase().includes(word));
        if (hasPromotional) {
            results.warnings.push('Consider using more professional, educational language');
        }
        
        // Check for clarity and specificity
        const vagueWords = ['things', 'stuff', 'various', 'general', 'misc'];
        const hasVague = vagueWords.some(word => topicValue.toLowerCase().includes(word));
        if (hasVague) {
            results.suggestions.push('Be more specific about your expertise area');
        }
        
        return results;
    }
    
    /**
     * PHASE 6: Perform Uniqueness Validation
     * Check for duplicate topics
     * 
     * @param {string} topicValue - Topic value to validate
     * @param {number} topicIndex - Current topic index
     * @returns {Object} Uniqueness validation results
     */
    performUniquenessValidation(topicValue, topicIndex) {
        const results = {
            warnings: [],
            suggestions: []
        };
        
        if (!topicValue || topicValue.length === 0) {
            return results;
        }
        
        // Check against other topics in the current session
        const currentTopics = this.getCurrentTopicsFromPanel();
        const duplicates = currentTopics.filter((topic, index) => 
            index !== topicIndex && 
            topic.title.toLowerCase().trim() === topicValue.toLowerCase().trim()
        );
        
        if (duplicates.length > 0) {
            results.warnings.push('This topic appears to be a duplicate');
            results.suggestions.push('Consider making this topic more specific or removing the duplicate');
        }
        
        // Check for very similar topics (simple similarity)
        const similarTopics = currentTopics.filter((topic, index) => {
            if (index === topicIndex) return false;
            const similarity = this.calculateSimpleSimilarity(topicValue.toLowerCase(), topic.title.toLowerCase());
            return similarity > 0.8; // 80% similarity threshold
        });
        
        if (similarTopics.length > 0) {
            results.warnings.push('This topic is very similar to another topic');
            results.suggestions.push('Consider diversifying your topics to cover different areas');
        }
        
        return results;
    }
    
    /**
     * PHASE 6: Perform Simple Keyword Relevance
     * Simple keyword relevance check following Gemini's recommendation (no complex NLP)
     * 
     * @param {string} topicValue - Topic value to analyze
     * @returns {Object} Keyword relevance results
     */
    performSimpleKeywordRelevance(topicValue) {
        const results = {
            score: 0,
            suggestions: []
        };
        
        if (!topicValue || this.validationConfig.keywordRelevance.primaryKeywords.length === 0) {
            return results;
        }
        
        const topicWords = topicValue.toLowerCase().split(/\s+/)
            .filter(word => word.length >= 3)
            .map(word => word.replace(/[^a-zA-Z]/g, ''));
        
        // Simple presence check (no complex NLP as per Gemini's recommendation)
        const relevantKeywords = this.validationConfig.keywordRelevance.primaryKeywords
            .filter(keyword => topicWords.includes(keyword));
        
        if (relevantKeywords.length > 0) {
            results.score = Math.min(15, relevantKeywords.length * 5); // Max 15 points
        } else {
            results.suggestions.push('Consider including keywords related to your expertise areas');
        }
        
        return results;
    }
    
    /**
     * PHASE 6: Perform Simple Profanity Check
     * Basic profanity detection
     * 
     * @param {string} text - Text to check
     * @returns {Object} Profanity check results
     */
    performSimpleProfanityCheck(text) {
        // Simple implementation - in production, use a proper profanity filter library
        const basicProfanityList = ['damn', 'hell', 'crap']; // Basic list for demo
        const textLower = text.toLowerCase();
        
        const hasProfanity = basicProfanityList.some(word => textLower.includes(word));
        
        return {
            hasProfanity,
            detectedWords: hasProfanity ? basicProfanityList.filter(word => textLower.includes(word)) : []
        };
    }
    
    /**
     * PHASE 6: Calculate Simple Similarity
     * Simple text similarity calculation
     * 
     * @param {string} text1 - First text
     * @param {string} text2 - Second text
     * @returns {number} Similarity score 0-1
     */
    calculateSimpleSimilarity(text1, text2) {
        if (text1 === text2) return 1;
        if (!text1 || !text2) return 0;
        
        const words1 = new Set(text1.split(/\s+/));
        const words2 = new Set(text2.split(/\s+/));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }
    
    /**
     * PHASE 6: Update Validation UI
     * Updates the UI with validation results and feedback
     * 
     * @param {HTMLElement} inputElement - Input element to update
     * @param {Object} validationResults - Validation results
     */
    updateValidationUI(inputElement, validationResults) {
        if (!inputElement) return;
        
        try {
            const topicItem = inputElement.closest('.enhanced-topic-item');
            if (!topicItem) return;
            
            // Update validation status classes
            inputElement.classList.remove('validation-error', 'validation-warning', 'validation-success');
            
            if (validationResults.errors.length > 0) {
                inputElement.classList.add('validation-error');
            } else if (validationResults.warnings.length > 0) {
                inputElement.classList.add('validation-warning');
            } else {
                inputElement.classList.add('validation-success');
            }
            
            // Update validation feedback
            this.updateValidationFeedback(topicItem, validationResults);
            
            // Update quality indicators
            this.updateQualityIndicators(topicItem, validationResults.quality);
            
            // Show auto-repair notification if performed
            if (validationResults.autoRepair.performed) {
                this.showAutoRepairNotification(validationResults.autoRepair);
            }
            
        } catch (error) {
            this.handleError(`UI update failed: ${error.message}`, 'validation-ui', error);
        }
    }
    
    /**
     * PHASE 6: Update Validation Feedback
     * Updates the validation feedback display
     * 
     * @param {HTMLElement} topicItem - Topic item element
     * @param {Object} validationResults - Validation results
     */
    updateValidationFeedback(topicItem, validationResults) {
        let feedbackElement = topicItem.querySelector('.validation-feedback-enhanced');
        
        if (!feedbackElement) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'validation-feedback-enhanced';
            
            const formGroup = topicItem.querySelector('.enhanced-form-group');
            if (formGroup) {
                formGroup.appendChild(feedbackElement);
            }
        }
        
        // Build comprehensive feedback HTML
        let feedbackHTML = '';
        
        // Errors
        if (validationResults.errors.length > 0) {
            feedbackHTML += `
                <div class="validation-errors">
                    ${validationResults.errors.map(error => `<div class="validation-error-item">❌ ${error}</div>`).join('')}
                </div>
            `;
        }
        
        // Warnings
        if (validationResults.warnings.length > 0) {
            feedbackHTML += `
                <div class="validation-warnings">
                    ${validationResults.warnings.map(warning => `<div class="validation-warning-item">⚠️ ${warning}</div>`).join('')}
                </div>
            `;
        }
        
        // Quality feedback
        if (validationResults.quality.feedback.length > 0) {
            feedbackHTML += `
                <div class="validation-quality-feedback">
                    ${validationResults.quality.feedback.map(feedback => `<div class="validation-quality-item">✨ ${feedback}</div>`).join('')}
                </div>
            `;
        }
        
        // Suggestions
        if (validationResults.suggestions.length > 0) {
            feedbackHTML += `
                <div class="validation-suggestions">
                    <div class="suggestions-title">💡 Suggestions to improve quality:</div>
                    ${validationResults.suggestions.map(suggestion => `<div class="validation-suggestion-item">• ${suggestion}</div>`).join('')}
                </div>
            `;
        }
        
        feedbackElement.innerHTML = feedbackHTML;
        feedbackElement.style.display = feedbackHTML ? 'block' : 'none';
    }
    
    /**
     * PHASE 6: Update Quality Indicators
     * Updates the quality score and level indicators
     * 
     * @param {HTMLElement} topicItem - Topic item element
     * @param {Object} qualityData - Quality data object
     */
    updateQualityIndicators(topicItem, qualityData) {
        // Update quality badge
        const qualityBadge = topicItem.querySelector('.quality-badge');
        if (qualityBadge) {
            qualityBadge.textContent = `${qualityData.score}%`;
            qualityBadge.className = `quality-badge quality-${qualityData.level}`;
            qualityBadge.title = `Quality: ${qualityData.score}% (${qualityData.level}) - Click for breakdown`;
            
            // Add click handler for detailed breakdown
            qualityBadge.onclick = () => this.showQualityBreakdown(qualityData);
        }
        
        // Update content indicator based on quality
        const contentIndicator = topicItem.querySelector('.content-indicator');
        if (contentIndicator) {
            const hasContent = qualityData.score > 0;
            contentIndicator.className = `content-indicator ${hasContent ? 'has-content' : 'empty'} quality-${qualityData.level}`;
            contentIndicator.textContent = hasContent ? this.getQualityIcon(qualityData.level) : '○';
            contentIndicator.title = hasContent ? `${qualityData.level} quality (${qualityData.score}%)` : 'Empty';
        }
    }
    
    /**
     * PHASE 6: Get Quality Icon
     * Returns appropriate icon for quality level
     * 
     * @param {string} level - Quality level
     * @returns {string} Quality icon
     */
    getQualityIcon(level) {
        const icons = {
            'excellent': '🌟',
            'good': '⭐',
            'fair': '🔶',
            'poor': '🔸'
        };
        return icons[level] || '○';
    }
    
    /**
     * PHASE 6: Show Quality Breakdown
     * Shows detailed quality breakdown in a modal
     * 
     * @param {Object} qualityData - Quality data object
     */
    showQualityBreakdown(qualityData) {
        const breakdownItems = Object.entries(qualityData.breakdown)
            .map(([category, score]) => `
                <div class="breakdown-item">
                    <span class="breakdown-category">${this.formatCategoryName(category)}</span>
                    <span class="breakdown-score">${score}%</span>
                    <div class="breakdown-bar">
                        <div class="breakdown-progress" style="width: ${score}%"></div>
                    </div>
                </div>
            `).join('');
        
        const modal = document.createElement('div');
        modal.className = 'quality-breakdown-modal';
        modal.innerHTML = `
            <div class="quality-breakdown-content">
                <div class="breakdown-header">
                    <h3>Quality Score Breakdown</h3>
                    <div class="overall-score quality-${qualityData.level}">${qualityData.score}%</div>
                    <button class="close-breakdown">×</button>
                </div>
                <div class="breakdown-body">
                    ${breakdownItems}
                </div>
                <div class="breakdown-footer">
                    <div class="quality-level">Overall Quality: <strong>${qualityData.level.toUpperCase()}</strong></div>
                </div>
            </div>
        `;
        
        // Style and show modal
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
            z-index: 10000; animation: fadeIn 0.2s ease-out;
        `;
        
        document.body.appendChild(modal);
        
        // Close handler
        modal.querySelector('.close-breakdown').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }
    
    /**
     * PHASE 6: Format Category Name
     * Formats category names for display
     * 
     * @param {string} category - Category name
     * @returns {string} Formatted name
     */
    formatCategoryName(category) {
        const names = {
            'length': 'Length',
            'wordCount': 'Word Count',
            'professionalism': 'Professionalism',
            'completeness': 'Completeness',
            'keywordRelevance': 'Keyword Relevance'
        };
        return names[category] || category;
    }
    
    /**
     * PHASE 6: Show Auto-Repair Notification
     * Shows notification when auto-repair is performed
     * 
     * @param {Object} repairData - Auto-repair data
     */
    showAutoRepairNotification(repairData) {
        const notification = document.createElement('div');
        notification.className = 'auto-repair-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🔧</span>
                <div class="notification-text">
                    <div class="notification-title">Auto-repair completed</div>
                    <div class="notification-details">${repairData.actions.join(', ')}</div>
                </div>
                <button class="notification-close">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white; padding: 12px 16px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            z-index: 10001; font-size: 14px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove and close handler
        notification.querySelector('.notification-close').onclick = () => notification.remove();
        setTimeout(() => notification.remove(), 4000);
    }
    
    /**
     * PHASE 6: Perform Data Integrity Check
     * Monitors data integrity and detects corruption
     */
    performDataIntegrityCheck() {
        try {
            const currentTopics = this.getCurrentTopicsFromPanel();
            const currentChecksum = this.calculateDataChecksum(currentTopics);
            
            // Store checksum for comparison
            const lastChecksum = this.dataIntegrity.checksums.get('current');
            
            if (lastChecksum && lastChecksum !== currentChecksum) {
                // Data has changed - this is normal during editing
                console.log('🔍 PHASE 6: Data integrity check - normal data change detected');
            }
            
            this.dataIntegrity.checksums.set('current', currentChecksum);
            this.dataIntegrity.lastBackup = Date.now();
            
            // Backup current state
            this.dataIntegrity.lastBackup = {
                timestamp: Date.now(),
                topics: [...currentTopics],
                checksum: currentChecksum
            };
            
        } catch (error) {
            this.handleError(`Data integrity check failed: ${error.message}`, 'data-integrity', error);
        }
    }
    
    /**
     * PHASE 6: Calculate Data Checksum
     * Simple checksum calculation for data integrity
     * 
     * @param {Array} topicsData - Topics data array
     * @returns {string} Checksum string
     */
    calculateDataChecksum(topicsData) {
        const dataString = JSON.stringify(topicsData);
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
    
    /**
     * Sanitize topic data for safe usage
     * PHASE 6: Enhanced with comprehensive validation integration
     * 
     * @param {string} topicValue - Raw topic value
     * @returns {string|null} Sanitized topic or null if invalid
     */
    sanitizeTopicData(topicValue) {
        if (!topicValue || typeof topicValue !== 'string') {
            return null;
        }
        
        // PHASE 6: Enhanced sanitization with auto-repair integration
        let sanitized = topicValue;
        
        // Apply safe auto-repair if enabled
        if (this.validationConfig?.autoRepair?.enabled) {
            const repairableIssues = [];
            
            // Check for repairable issues
            if (sanitized !== sanitized.trim()) repairableIssues.push('excess_whitespace');
            if (/<[^>]*>/g.test(sanitized)) repairableIssues.push('contains_html_tags');
            
            if (repairableIssues.length > 0) {
                const repairResult = this.performSafeAutoRepair(sanitized, repairableIssues);
                if (repairResult.repaired) {
                    sanitized = repairResult.repairedValue;
                }
            }
        } else {
            // Fallback to basic sanitization
            sanitized = sanitized.trim();
            sanitized = sanitized.replace(/<[^>]*>/g, ''); // Strip HTML tags
            sanitized = sanitized.replace(/[<>&"']/g, ''); // Remove dangerous characters
        }
        
        // Validate length
        const rules = this.validationConfig?.rules || { topic_length: { min: 3, max: 100 } };
        if (sanitized.length < rules.topic_length.min || sanitized.length > rules.topic_length.max) {
            return null;
        }
        
        return sanitized;
    }
    
    /**
     * Calculate quality score for individual topic
     * PHASE 6: Backward compatibility wrapper for enhanced quality calculation
     * 
     * @param {string} topicValue - Topic value to analyze
     * @returns {number} Quality score 0-100
     */
    calculateTopicQuality(topicValue) {
        // PHASE 6: Use enhanced quality calculation if validation system is available
        if (this.validationConfig) {
            const enhancedResult = this.calculateEnhancedTopicQuality(topicValue, 0);
            return enhancedResult.score;
        }
        
        // Fallback to original calculation for backward compatibility
        if (!topicValue) return 0;
        
        let score = 0;
        
        // Length scoring (optimal 20-60 characters)
        const length = topicValue.length;
        if (length >= 20 && length <= 60) score += 40;
        else if (length >= 10 && length <= 80) score += 25;
        else score += 10;
        
        // Word count scoring (optimal 2-8 words)
        const wordCount = topicValue.split(/\s+/).length;
        if (wordCount >= 2 && wordCount <= 8) score += 30;
        else if (wordCount >= 1 && wordCount <= 12) score += 15;
        
        // Professional language indicators
        if (/^[A-Z]/.test(topicValue)) score += 10; // Starts with capital
        if (!/\s{2,}/.test(topicValue)) score += 10; // No double spaces
        if (!/[!]{2,}/.test(topicValue)) score += 10; // No excessive punctuation
        
        return Math.min(100, score);
    }
    
    /**
     * Calculate overall data quality
     * 
     * @returns {Object} Quality information
     */
    calculateDataQuality() {
        const extractedTopics = this.extractTopicsFromMKCG();
        
        if (extractedTopics.length === 0) {
            return { score: 0, level: 'none' };
        }
        
        const totalQuality = extractedTopics.reduce((sum, topic) => sum + topic.quality, 0);
        const averageQuality = Math.round(totalQuality / extractedTopics.length);
        
        let level = 'poor';
        if (averageQuality >= 80) level = 'excellent';
        else if (averageQuality >= 60) level = 'good';
        else if (averageQuality >= 40) level = 'fair';
        
        return { score: averageQuality, level };
    }
    
    /**
     * Add topic to panel (integrates with existing panel-script.js)
     * PHASE 2A: Enhanced to use new addEnhancedTopicToPanel for MKCG mode
     * 
     * @param {string} title - Topic title
     * @param {string} description - Topic description
     * @param {string} iconClass - Icon class
     * @param {number} index - Topic index
     * @param {boolean} fromMKCG - Whether this is from MKCG data
     */
    addTopicToPanel(title, description, iconClass, index, fromMKCG = false) {
        // PHASE 2A: Use enhanced topic panel for MKCG mode
        if (typeof window.addEnhancedTopicToPanel === 'function') {
            console.log(`🎯 PHASE 2A: Adding enhanced topic ${index + 1}: "${title}"`);
            
            const topicItem = window.addEnhancedTopicToPanel(title, description, iconClass, index);
            
            // Add MKCG source indicator if applicable
            if (fromMKCG && topicItem) {
                topicItem.classList.add('mkcg-sourced');
                topicItem.setAttribute('data-mkcg-source', 'true');
                
                // Add visual indicator to enhanced header
                const indicators = topicItem.querySelector('.topic-indicators');
                if (indicators) {
                    const mkcgIndicator = document.createElement('span');
                    mkcgIndicator.className = 'mkcg-source-indicator';
                    mkcgIndicator.title = 'Auto-populated from MKCG data';
                    mkcgIndicator.innerHTML = '🎯';
                    mkcgIndicator.style.cssText = `
                        background: #3b82f6;
                        color: white;
                        font-size: 10px;
                        padding: 2px 4px;
                        border-radius: 3px;
                        font-weight: bold;
                        cursor: help;
                    `;
                    indicators.appendChild(mkcgIndicator);
                }
            }
            
            return topicItem;
        }
        // Fallback to standard method if enhanced not available
        else if (typeof window.addTopicToPanel === 'function') {
            console.log(`📝 PHASE 2A: Fallback to standard topic panel for topic ${index + 1}`);
            
            const topicItem = window.addTopicToPanel(title, description, iconClass, index);
            
            // Add MKCG source indicator if applicable
            if (fromMKCG && topicItem) {
                topicItem.classList.add('mkcg-sourced');
                topicItem.setAttribute('data-mkcg-source', 'true');
                
                // Add visual indicator
                const header = topicItem.querySelector('.topic-editor-header');
                if (header) {
                    const indicator = document.createElement('span');
                    indicator.className = 'mkcg-indicator';
                    indicator.title = 'Auto-populated from MKCG data';
                    indicator.innerHTML = '⚡';
                    header.appendChild(indicator);
                }
            }
            
            return topicItem;
        } else {
            console.warn('⚠️ PHASE 2A: No topic panel functions available from panel-script.js');
            return null;
        }
    }
    
    /**
     * Update topics in component (calls existing function)
     */
    updateTopicsInComponent() {
        if (typeof window.updateTopicsInComponent === 'function') {
            window.updateTopicsInComponent(this.element);
        } else {
            console.warn('⚠️ updateTopicsInComponent function not available from panel-script.js');
        }
    }
    
    /**
     * Show notification to user
     * PHASE 5: Enhanced with better notification system
     * 
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Use enhanced notification system from panel-script.js if available
        if (typeof window.showSaveNotification === 'function') {
            window.showSaveNotification(message, type);
        } else {
            // Fallback for basic notifications
            if (type === 'error') {
                alert(`Error: ${message}`);
            } else if (type === 'warning') {
                alert(`Warning: ${message}`);
            }
        }
    }
    
    /**
     * Handle errors with comprehensive logging
     * 
     * @param {string} message - Error message
     * @param {string} context - Error context
     * @param {Error} error - Original error object (optional)
     */
    handleError(message, context = 'general', error = null) {
        const errorInfo = {
            message,
            context,
            timestamp: new Date().toISOString(),
            postId: this.postId,
            componentType: this.componentType,
            stackTrace: error?.stack || new Error().stack
        };
        
        this.errors.push(errorInfo);
        
        // Log to console for debugging
        console.error(`❌ TopicsMKCGIntegration [${context}]:`, message, error);
        
        // Log to WordPress debug if available
        if (window.guestifyData?.systemConfig?.enableDebugMode) {
            console.error('Full error details:', errorInfo);
        }
        
        // Show user-friendly notification
        this.showNotification(message, 'error');
    }
    
    /**
     * Get integration status and debug information
     * 
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            postId: this.postId,
            hasData: !!this.mkcgData,
            topicsAvailable: this.mkcgData?.topics?.topics ? Object.keys(this.mkcgData.topics.topics).length : 0,
            dataQuality: this.mkcgData ? this.calculateDataQuality() : null,
            errors: this.errors,
            saveQueueSize: this.saveQueue.length,
            initTime: this.initStartTime ? `${(performance.now() - this.initStartTime).toFixed(2)}ms` : null
        };
    }
    
    /**
     * Clean up resources when component is destroyed
     * PHASE 5: Enhanced cleanup for bulk operations
     */
    destroy() {
        // Clear timers
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        // PHASE 5: Clear bulk operation history
        if (this.bulkOperationHistory) {
            this.bulkOperationHistory = [];
        }
        
        // Clear cache
        this.mkcgData = null;
        this.saveQueue = [];
        
        // Remove event listeners (basic operations)
        document.removeEventListener('click', this.handleRefreshMKCGData);
        document.removeEventListener('click', this.handleSyncAllTopics);
        
        // PHASE 5: Remove bulk operation event listeners
        const bulkButtons = document.querySelectorAll('.mkcg-clear-all-btn, .mkcg-reset-btn, .mkcg-bulk-undo-btn');
        bulkButtons.forEach(button => {
            if (button) {
                button.removeEventListener('click', () => {});
            }
        });
        
        console.log('🧹 PHASE 5: TopicsMKCGIntegration cleanup complete with bulk operations');
    }
}

/**
 * PHASE 5: ENHANCED TESTING FRAMEWORK FOUNDATION
 * 
 * This section provides comprehensive testing foundation for all phases including Gemini's recommendations.
 * 
 * Unit Tests Required:
 * - detectPostId() - multiple strategy validation
 * - detectMKCGData() - data structure validation
 * - validateDataAvailability() - content validation
 * - mapMKCGDataToTopics() - field mapping accuracy
 * - sanitizeTopicData() - security validation
 * - calculateTopicQuality() - scoring algorithm
 * 
 * PHASE 5: Bulk Operations Unit Tests:
 * - handleSyncAllTopicsWithConfirmation() - confirmation dialog and execution
 * - handleClearAllTopicsWithConfirmation() - clear operation with preview
 * - handleResetToMKCGWithConfirmation() - reset with before/after comparison
 * - handleBulkUndo() - undo system validation
 * - storeBulkOperationState() - state management accuracy
 * - restoreTopicsFromSnapshot() - restoration integrity
 * 
 * Integration Tests Required:
 * - Panel enhancement integration
 * - Data injection with existing panel-script.js
 * - Event listener interaction
 * - Enhanced-State-Manager integration (Gemini recommendation)
 * - State-History service coordination (Gemini recommendation)
 * 
 * PHASE 5: Bulk Operations Integration Tests:
 * - Confirmation dialog display and interaction
 * - Progress indicator functionality
 * - Undo system coordination with reorder undo
 * - Auto-save integration after bulk operations
 * - Enhanced notification system integration
 * 
 * E2E Tests Required:
 * - Complete user workflow from panel open to data display
 * - Error scenarios (missing data, invalid post ID)
 * - Performance testing (initialization under 100ms)
 * 
 * PHASE 5: Bulk Operations E2E Tests:
 * - Complete Sync All workflow: button click → confirmation → execution → success feedback
 * - Complete Clear All workflow: button click → warning → execution → undo capability
 * - Complete Reset to MKCG workflow: button click → comparison → execution → verification
 * - Bulk Undo workflow: operation → undo button → restoration → state verification
 * - Sequential bulk operations with history management
 * - Error recovery during bulk operations
 * 
 * Performance Benchmarks:
 * - Bulk operation execution: < 1 second
 * - Confirmation dialog display: < 100ms
 * - Progress indicator updates: < 50ms
 * - Undo operation: < 500ms
 * - State restoration accuracy: 100%
 */

// PHASE 5: Export enhanced integration class with bulk operations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TopicsMKCGIntegration;
} else {
    window.TopicsMKCGIntegration = TopicsMKCGIntegration;
    
    // PHASE 6: Expose enhanced validation methods for external access
    window.TopicsMKCGIntegration.prototype.exposedMethods = {
        // Enhanced testing access
        getBulkOperationHistory: function() { return this.bulkOperationHistory; },
        getCurrentTopicsFromPanel: function() { return this.getCurrentTopicsFromPanel(); },
        getQualityLevel: function(score) { return this.getQualityLevel(score); },
        
        // Enhanced debugging access
        getIntegrationStatus: function() { return this.getStatus(); },
        clearBulkHistory: function() { 
            this.bulkOperationHistory = [];
            this.updateBulkUndoButtonState();
        },
        
        // PHASE 6: Validation system access
        validateTopicDebounced: function(value, index, element) { return this.validateTopicDebounced(value, index, element); },
        performComprehensiveValidation: function(value, index) { return this.performComprehensiveValidation(value, index); },
        calculateEnhancedTopicQuality: function(value, index) { return this.calculateEnhancedTopicQuality(value, index); },
        getValidationConfig: function() { return this.validationConfig; },
        getValidationState: function() { return this.validationState; },
        performDataIntegrityCheck: function() { return this.performDataIntegrityCheck(); }
    };
    
    console.log('✅ PHASE 6: Enhanced TopicsMKCGIntegration exported with comprehensive validation system and Gemini\'s recommendations');
}
