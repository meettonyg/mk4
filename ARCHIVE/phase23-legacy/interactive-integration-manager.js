/**
 * @file interactive-integration-manager.js
 * @description Phase 3: Complete Interactive Integration
 * 
 * ROOT-LEVEL FIX: Connects state indicators to live data updates and implements
 * comprehensive interactive workflows. No patches or quick fixes.
 * 
 * Implements:
 * - Live data update connections
 * - Component quality scoring integration
 * - User feedback systems
 * - Cross-system communication
 * - Performance optimization
 */

class InteractiveIntegrationManager {
    constructor() {
        this.initialized = false;
        this.emptyStateSystem = null;
        this.stateIndicators = null;
        this.componentManager = null;
        this.stateManager = null;
        
        // Integration state
        this.integrationStatus = {
            emptyStateConnected: false,
            indicatorsConnected: false,
            liveUpdatesActive: false,
            qualityScoringActive: false,
            feedbackSystemActive: false
        };
        
        // Event management
        this.eventListeners = new Map();
        this.updateQueue = [];
        this.isProcessingUpdates = false;
        
        // Performance metrics
        this.performanceMetrics = {
            initTime: 0,
            totalUpdates: 0,
            averageUpdateTime: 0,
            errorCount: 0,
            lastErrorTime: null
        };
        
        console.log('🔄 Interactive Integration Manager initializing...');
    }

    /**
     * Initialize the interactive integration system
     */
    async initialize() {
        const startTime = performance.now();
        
        try {
            // Step 1: Connect to subsystems
            await this.connectToSubsystems();
            
            // Step 2: Setup cross-system communication
            await this.setupCrossSysCommunication();
            
            // Step 3: Initialize live data updates
            await this.initializeLiveDataUpdates();
            
            // Step 4: Setup quality scoring integration
            await this.setupQualityScoringIntegration();
            
            // Step 5: Initialize user feedback systems
            await this.initializeUserFeedbackSystems();
            
            // Step 6: Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Step 7: Start integration workflows
            await this.startIntegrationWorkflows();
            
            this.performanceMetrics.initTime = performance.now() - startTime;
            this.initialized = true;
            
            console.log('✅ Interactive Integration Manager initialized successfully', {
                duration: `${this.performanceMetrics.initTime.toFixed(2)}ms`,
                integrationStatus: this.integrationStatus,
                connectedSystems: this.getConnectedSystemsCount()
            });
            
            // Expose global interface
            this.exposeGlobalInterface();
            
            return true;
            
        } catch (error) {
            console.error('❌ Interactive Integration Manager initialization failed:', error);
            this.performanceMetrics.errorCount++;
            this.performanceMetrics.lastErrorTime = Date.now();
            this.showFallbackInterface();
            return false;
        }
    }

    /**
     * Step 1: Connect to subsystems
     */
    async connectToSubsystems() {
        // Connect to Enhanced Empty State system
        this.emptyStateSystem = window.enhancedEmptyState;
        if (this.emptyStateSystem) {
            this.integrationStatus.emptyStateConnected = true;
            console.log('✅ Connected to Enhanced Empty State system');
        } else {
            console.warn('⚠️ Enhanced Empty State system not found');
        }
        
        // Connect to Component State Indicators
        this.stateIndicators = window.componentStateIndicators;
        if (this.stateIndicators) {
            this.integrationStatus.indicatorsConnected = true;
            console.log('✅ Connected to Component State Indicators');
        } else {
            console.warn('⚠️ Component State Indicators not found');
        }
        
        // Connect to core systems
        this.componentManager = window.enhancedComponentManager || window.componentManager;
        this.stateManager = window.enhancedStateManager || window.stateManager;
        
        if (!this.componentManager || !this.stateManager) {
            throw new Error('Core systems (component/state manager) not available');
        }
        
        console.log('✅ Connected to core systems');
    }

    /**
     * Step 2: Setup cross-system communication
     */
    async setupCrossSysCommunication() {
        // Create event bus for cross-system communication
        this.createEventBus();
        
        // Setup empty state → indicators communication
        this.setupEmptyStateToIndicators();
        
        // Setup indicators → empty state communication
        this.setupIndicatorsToEmptyState();
        
        // Setup component manager integration
        this.setupComponentManagerIntegration();
        
        // Setup state manager integration
        this.setupStateManagerIntegration();
        
        console.log('🔗 Cross-system communication setup complete');
    }

    /**
     * Create centralized event bus
     */
    createEventBus() {
        this.eventBus = {
            events: new Map(),
            
            emit: (eventName, data) => {
                const listeners = this.events.get(eventName) || [];
                listeners.forEach(listener => {
                    try {
                        listener(data);
                    } catch (error) {
                        console.error(`Error in event listener for ${eventName}:`, error);
                    }
                });
                
                // Also dispatch DOM event for external listeners
                document.dispatchEvent(new CustomEvent(`phase23-${eventName}`, {
                    detail: data
                }));
            },
            
            on: (eventName, listener) => {
                if (!this.events.has(eventName)) {
                    this.events.set(eventName, []);
                }
                this.events.get(eventName).push(listener);
            },
            
            off: (eventName, listener) => {
                const listeners = this.events.get(eventName) || [];
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
        
        // Expose event bus globally
        window.phase23EventBus = this.eventBus;
        
        console.log('📡 Event bus created and exposed globally');
    }

    /**
     * Setup empty state → indicators communication
     */
    setupEmptyStateToIndicators() {
        if (!this.emptyStateSystem || !this.stateIndicators) return;
        
        // Listen for component generation events
        this.eventBus.on('componentGenerated', (data) => {
            if (this.stateIndicators && data.componentId) {
                // Queue component for indicator initialization
                setTimeout(() => {
                    this.stateIndicators.queueComponentUpdate(data.componentId);
                }, 100);
            }
        });
        
        // Listen for quality state changes
        this.eventBus.on('qualityStateChanged', (data) => {
            this.updateComponentQualityFromEmptyState(data);
        });
        
        // Listen for MKCG data updates
        this.eventBus.on('mkcgDataUpdated', (data) => {
            if (this.stateIndicators) {
                this.stateIndicators.updateAllComponentsFromMKCG();
            }
        });
        
        console.log('➡️ Empty State → Indicators communication setup');
    }

    /**
     * Setup indicators → empty state communication
     */
    setupIndicatorsToEmptyState() {
        if (!this.emptyStateSystem || !this.stateIndicators) return;
        
        // Listen for quality score updates
        this.eventBus.on('qualityScoreUpdated', (data) => {
            this.updateEmptyStateFromQuality(data);
        });
        
        // Listen for component state changes
        this.eventBus.on('componentStateChanged', (data) => {
            this.handleComponentStateChange(data);
        });
        
        // Listen for sync status updates
        this.eventBus.on('syncStatusUpdated', (data) => {
            this.updateEmptyStateFromSync(data);
        });
        
        console.log('⬅️ Indicators → Empty State communication setup');
    }

    /**
     * Setup component manager integration
     */
    setupComponentManagerIntegration() {
        if (!this.componentManager) return;
        
        // Override addComponent to emit events
        const originalAddComponent = this.componentManager.addComponent.bind(this.componentManager);
        this.componentManager.addComponent = async (...args) => {
            const result = await originalAddComponent(...args);
            
            // Emit component generated event
            this.eventBus.emit('componentGenerated', {
                componentId: result?.id || args[2]?.id,
                componentType: args[0],
                props: args[1],
                timestamp: Date.now()
            });
            
            return result;
        };
        
        // Override updateComponent to emit events
        if (this.componentManager.updateComponent) {
            const originalUpdateComponent = this.componentManager.updateComponent.bind(this.componentManager);
            this.componentManager.updateComponent = async (...args) => {
                const result = await originalUpdateComponent(...args);
                
                // Emit component updated event
                this.eventBus.emit('componentUpdated', {
                    componentId: args[0],
                    props: args[1],
                    timestamp: Date.now()
                });
                
                return result;
            };
        }
        
        console.log('🔧 Component Manager integration setup');
    }

    /**
     * Setup state manager integration
     */
    setupStateManagerIntegration() {
        if (!this.stateManager) return;
        
        // Listen for state changes
        if (this.stateManager.subscribe) {
            this.stateManager.subscribe('stateChanged', (data) => {
                this.eventBus.emit('stateChanged', data);
            });
        }
        
        // Listen for component updates
        if (this.stateManager.subscribe) {
            this.stateManager.subscribe('componentUpdate', (data) => {
                this.eventBus.emit('componentStateChanged', data);
            });
        }
        
        console.log('💾 State Manager integration setup');
    }

    /**
     * Step 3: Initialize live data updates
     */
    async initializeLiveDataUpdates() {
        // Setup real-time component monitoring
        this.setupRealtimeComponentMonitoring();
        
        // Setup MKCG data monitoring
        this.setupMKCGDataMonitoring();
        
        // Setup quality score monitoring
        this.setupQualityScoreMonitoring();
        
        this.integrationStatus.liveUpdatesActive = true;
        console.log('📊 Live data updates initialized');
    }

    /**
     * Setup real-time component monitoring
     */
    setupRealtimeComponentMonitoring() {
        // Monitor DOM changes for component updates
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                this.processMutationForUpdates(mutation);
            });
        });
        
        const previewContainer = document.getElementById('media-kit-preview');
        if (previewContainer) {
            observer.observe(previewContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-component-id', 'data-mkcg-populated', 'class']
            });
        }
        
        console.log('👁️ Real-time component monitoring active');
    }

    /**
     * Setup MKCG data monitoring
     */
    setupMKCGDataMonitoring() {
        // Monitor for MKCG data changes
        let lastMKCGHash = this.hashMKCGData();
        
        setInterval(() => {
            const currentHash = this.hashMKCGData();
            if (currentHash !== lastMKCGHash) {
                lastMKCGHash = currentHash;
                this.eventBus.emit('mkcgDataUpdated', {
                    timestamp: Date.now(),
                    hash: currentHash
                });
            }
        }, 10000); // Check every 10 seconds
        
        console.log('🔗 MKCG data monitoring active');
    }

    /**
     * Setup quality score monitoring
     */
    setupQualityScoreMonitoring() {
        // Monitor component quality scores
        setInterval(() => {
            this.updateAllQualityScores();
        }, 30000); // Check every 30 seconds
        
        console.log('📈 Quality score monitoring active');
    }

    /**
     * Step 4: Setup quality scoring integration
     */
    async setupQualityScoringIntegration() {
        // Create quality scoring engine
        this.qualityScorer = new ComponentQualityScorer();
        
        // Setup quality scoring rules
        this.setupQualityScoringRules();
        
        // Setup quality thresholds
        this.setupQualityThresholds();
        
        // Connect to component updates
        this.connectQualityScoringToUpdates();
        
        this.integrationStatus.qualityScoringActive = true;
        console.log('🏆 Quality scoring integration setup');
    }

    /**
     * Step 5: Initialize user feedback systems
     */
    async initializeUserFeedbackSystems() {
        // Setup toast notification system
        this.setupToastNotifications();
        
        // Setup progress indicators
        this.setupProgressIndicators();
        
        // Setup user guidance system
        this.setupUserGuidanceSystem();
        
        // Setup feedback collection
        this.setupFeedbackCollection();
        
        this.integrationStatus.feedbackSystemActive = true;
        console.log('💬 User feedback systems initialized');
    }

    /**
     * Setup toast notification system
     */
    setupToastNotifications() {
        this.toastManager = {
            activeToasts: new Set(),
            maxToasts: 3,
            
            show: (message, type = 'info', duration = 5000) => {
                const toast = this.createToast(message, type, duration);
                document.body.appendChild(toast);
                this.activeToasts.add(toast);
                
                // Auto-remove
                setTimeout(() => {
                    this.removeToast(toast);
                }, duration);
                
                // Limit number of toasts
                if (this.activeToasts.size > this.maxToasts) {
                    const oldestToast = this.activeToasts.values().next().value;
                    this.removeToast(oldestToast);
                }
            },
            
            success: (message) => this.show(message, 'success'),
            error: (message) => this.show(message, 'error'),
            warning: (message) => this.show(message, 'warning'),
            info: (message) => this.show(message, 'info')
        };
        
        // Expose globally
        window.showToast = this.toastManager.show.bind(this.toastManager);
        window.toast = this.toastManager;
        
        console.log('🍞 Toast notification system ready');
    }

    createToast(message, type, duration) {
        const toast = document.createElement('div');
        toast.className = `phase23-toast toast-${type}`;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type]}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-progress"></div>
        `;
        
        // Styling
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10004;
            background: ${colors[type]};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            min-width: 300px;
            overflow: hidden;
        `;
        
        // Position multiple toasts
        const existingToasts = document.querySelectorAll('.phase23-toast');
        if (existingToasts.length > 0) {
            toast.style.top = `${20 + (existingToasts.length * 80)}px`;
        }
        
        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Progress bar animation
        const progressBar = toast.querySelector('.toast-progress');
        progressBar.style.cssText = `
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            width: 100%;
            animation: progressBarAnimation ${duration}ms linear;
        `;
        
        return toast;
    }

    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
            this.activeToasts.delete(toast);
        }
    }

    /**
     * Setup progress indicators
     */
    setupProgressIndicators() {
        this.progressManager = {
            activeProgress: new Map(),
            
            show: (id, message, progress = 0) => {
                let indicator = this.activeProgress.get(id);
                
                if (!indicator) {
                    indicator = this.createProgressIndicator(id, message);
                    document.body.appendChild(indicator);
                    this.activeProgress.set(id, indicator);
                }
                
                this.updateProgressIndicator(indicator, message, progress);
            },
            
            update: (id, message, progress) => {
                const indicator = this.activeProgress.get(id);
                if (indicator) {
                    this.updateProgressIndicator(indicator, message, progress);
                }
            },
            
            complete: (id, message = 'Complete!') => {
                const indicator = this.activeProgress.get(id);
                if (indicator) {
                    this.updateProgressIndicator(indicator, message, 100);
                    setTimeout(() => {
                        this.hide(id);
                    }, 2000);
                }
            },
            
            hide: (id) => {
                const indicator = this.activeProgress.get(id);
                if (indicator) {
                    indicator.style.animation = 'fadeOut 0.3s ease-in';
                    setTimeout(() => {
                        if (indicator.parentNode) {
                            indicator.remove();
                        }
                    }, 300);
                    this.activeProgress.delete(id);
                }
            }
        };
        
        window.showProgress = this.progressManager.show.bind(this.progressManager);
        window.progress = this.progressManager;
        
        console.log('📊 Progress indicators ready');
    }

    createProgressIndicator(id, message) {
        const indicator = document.createElement('div');
        indicator.className = 'phase23-progress-indicator';
        indicator.id = `progress-${id}`;
        
        indicator.innerHTML = `
            <div class="progress-content">
                <div class="progress-message">${message}</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>
                <div class="progress-percentage">0%</div>
            </div>
        `;
        
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10004;
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 16px 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInUp 0.3s ease-out;
            min-width: 300px;
        `;
        
        return indicator;
    }

    updateProgressIndicator(indicator, message, progress) {
        const messageEl = indicator.querySelector('.progress-message');
        const progressBar = indicator.querySelector('.progress-bar');
        const percentageEl = indicator.querySelector('.progress-percentage');
        
        if (messageEl) messageEl.textContent = message;
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (percentageEl) percentageEl.textContent = `${Math.round(progress)}%`;
        
        // Color based on progress
        if (progress >= 100) {
            indicator.style.borderColor = '#10b981';
            progressBar.style.background = '#10b981';
        }
    }

    /**
     * Setup user guidance system
     */
    setupUserGuidanceSystem() {
        this.guidanceManager = {
            activeGuidance: null,
            
            show: (message, target = null, options = {}) => {
                this.hide(); // Hide existing guidance
                
                const guidance = this.createGuidance(message, target, options);
                document.body.appendChild(guidance);
                this.activeGuidance = guidance;
                
                // Auto-hide after duration
                if (options.duration !== false) {
                    setTimeout(() => {
                        this.hide();
                    }, options.duration || 5000);
                }
            },
            
            hide: () => {
                if (this.activeGuidance) {
                    this.activeGuidance.style.animation = 'fadeOut 0.3s ease-in';
                    setTimeout(() => {
                        if (this.activeGuidance && this.activeGuidance.parentNode) {
                            this.activeGuidance.remove();
                        }
                    }, 300);
                    this.activeGuidance = null;
                }
            }
        };
        
        window.showGuidance = this.guidanceManager.show.bind(this.guidanceManager);
        window.guidance = this.guidanceManager;
        
        console.log('🧭 User guidance system ready');
    }

    createGuidance(message, target, options) {
        const guidance = document.createElement('div');
        guidance.className = 'phase23-guidance';
        
        guidance.innerHTML = `
            <div class="guidance-content">
                <div class="guidance-icon">${options.icon || '💡'}</div>
                <div class="guidance-message">${message}</div>
                <button class="guidance-close" ${options.dismissible !== false ? '' : 'style="display: none;"'}>&times;</button>
            </div>
        `;
        
        // Position relative to target or default
        let position = 'bottom: 20px; left: 50%; transform: translateX(-50%);';
        
        if (target) {
            const rect = target.getBoundingClientRect();
            position = `top: ${rect.bottom + 10}px; left: ${rect.left}px;`;
        }
        
        guidance.style.cssText = `
            position: fixed;
            ${position}
            z-index: 10005;
            background: #1e293b;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideInUp 0.3s ease-out;
            max-width: 400px;
            font-size: 14px;
        `;
        
        // Close button functionality
        const closeBtn = guidance.querySelector('.guidance-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.guidanceManager.hide();
            });
        }
        
        return guidance;
    }

    /**
     * Step 6: Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor update performance
        this.eventBus.on('componentUpdated', (data) => {
            this.performanceMetrics.totalUpdates++;
        });
        
        // Monitor error rates
        this.eventBus.on('integrationError', (data) => {
            this.performanceMetrics.errorCount++;
            this.performanceMetrics.lastErrorTime = Date.now();
        });
        
        // Performance reporting
        setInterval(() => {
            this.generatePerformanceReport();
        }, 60000); // Every minute
        
        console.log('📈 Performance monitoring setup');
    }

    /**
     * Step 7: Start integration workflows
     */
    async startIntegrationWorkflows() {
        // Start update processing
        this.startUpdateProcessing();
        
        // Start quality monitoring workflow
        this.startQualityMonitoringWorkflow();
        
        // Start user interaction workflow
        this.startUserInteractionWorkflow();
        
        console.log('🔄 Integration workflows started');
    }

    /**
     * EVENT HANDLERS AND WORKFLOWS
     */
    processMutationForUpdates(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE && this.isComponentElement(node)) {
                    this.eventBus.emit('componentAdded', {
                        element: node,
                        componentId: this.getComponentId(node),
                        timestamp: Date.now()
                    });
                }
            });
        }
        
        if (mutation.type === 'attributes') {
            const element = mutation.target;
            if (this.isComponentElement(element)) {
                this.eventBus.emit('componentAttributeChanged', {
                    element: element,
                    componentId: this.getComponentId(element),
                    attribute: mutation.attributeName,
                    timestamp: Date.now()
                });
            }
        }
    }

    updateComponentQualityFromEmptyState(data) {
        if (this.stateIndicators && data.componentId) {
            const componentState = this.stateIndicators.componentStates.get(data.componentId);
            if (componentState) {
                // Update quality based on empty state data
                componentState.quality = data.quality || componentState.quality;
                componentState.mkcgPopulated = data.mkcgPopulated || componentState.mkcgPopulated;
                
                // Queue for update
                this.stateIndicators.queueComponentUpdate(data.componentId);
            }
        }
    }

    updateEmptyStateFromQuality(data) {
        if (this.emptyStateSystem && data.averageQuality) {
            // Update empty state quality level based on average component quality
            const qualityLevel = this.getQualityLevelFromScore(data.averageQuality);
            
            // Trigger empty state update if needed
            if (this.emptyStateSystem.qualityLevel !== qualityLevel) {
                this.emptyStateSystem.qualityLevel = qualityLevel;
                this.emptyStateSystem.currentState = this.mapQualityToState(qualityLevel);
            }
        }
    }

    handleComponentStateChange(data) {
        // Handle cross-system state changes
        if (data.componentId && data.state) {
            this.eventBus.emit('stateChangeProcessed', {
                componentId: data.componentId,
                oldState: data.oldState,
                newState: data.state,
                timestamp: Date.now()
            });
        }
    }

    updateEmptyStateFromSync(data) {
        if (this.emptyStateSystem && data.syncStatus) {
            // Update empty state based on overall sync status
            console.log('🔄 Updating empty state from sync status:', data.syncStatus);
        }
    }

    startUpdateProcessing() {
        setInterval(() => {
            if (this.updateQueue.length > 0 && !this.isProcessingUpdates) {
                this.processUpdateQueue();
            }
        }, 1000);
    }

    async processUpdateQueue() {
        this.isProcessingUpdates = true;
        
        while (this.updateQueue.length > 0) {
            const update = this.updateQueue.shift();
            try {
                await this.processUpdate(update);
            } catch (error) {
                console.error('Error processing update:', error);
                this.eventBus.emit('integrationError', { error, update });
            }
        }
        
        this.isProcessingUpdates = false;
    }

    async processUpdate(update) {
        const startTime = performance.now();
        
        // Process the update based on type
        switch (update.type) {
            case 'componentQuality':
                await this.processQualityUpdate(update);
                break;
            case 'componentState':
                await this.processStateUpdate(update);
                break;
            case 'mkcgData':
                await this.processMKCGDataUpdate(update);
                break;
        }
        
        const duration = performance.now() - startTime;
        this.updateAverageUpdateTime(duration);
    }

    startQualityMonitoringWorkflow() {
        setInterval(() => {
            this.updateAllQualityScores();
        }, 30000);
    }

    updateAllQualityScores() {
        if (!this.stateIndicators) return;
        
        const componentStates = this.stateIndicators.getAllComponentStates();
        let totalQuality = 0;
        let count = 0;
        
        componentStates.forEach(state => {
            const newQuality = this.calculateEnhancedComponentQuality(state.element);
            if (newQuality !== state.quality) {
                this.updateQueue.push({
                    type: 'componentQuality',
                    componentId: state.id,
                    oldQuality: state.quality,
                    newQuality: newQuality,
                    timestamp: Date.now()
                });
            }
            
            totalQuality += newQuality;
            count++;
        });
        
        if (count > 0) {
            const averageQuality = totalQuality / count;
            this.eventBus.emit('qualityScoreUpdated', {
                averageQuality,
                componentCount: count,
                timestamp: Date.now()
            });
        }
    }

    startUserInteractionWorkflow() {
        // Listen for user interactions and provide feedback
        this.eventBus.on('componentGenerated', (data) => {
            this.toastManager.success(`Component "${data.componentType}" added successfully!`);
        });
        
        this.eventBus.on('qualityScoreUpdated', (data) => {
            if (data.averageQuality > 80) {
                this.guidanceManager.show('🎉 Your components have excellent quality!', null, { duration: 3000 });
            }
        });
        
        this.eventBus.on('mkcgDataUpdated', (data) => {
            this.toastManager.info('MKCG data updated - refreshing components...');
        });
    }

    /**
     * UTILITY METHODS
     */
    hashMKCGData() {
        const mkcgData = window.guestifyData?.mkcgData || window.mkcgData;
        if (!mkcgData) return null;
        
        // Simple hash function for change detection
        return JSON.stringify(mkcgData).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
    }

    isComponentElement(element) {
        return element.classList?.contains('mk-component') ||
               element.hasAttribute?.('data-component-id') ||
               element.hasAttribute?.('data-component-type');
    }

    getComponentId(element) {
        return element.getAttribute('data-component-id') || 
               element.id || 
               element.getAttribute('data-id');
    }

    getQualityLevelFromScore(score) {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    }

    mapQualityToState(qualityLevel) {
        const mapping = {
            excellent: 'high-quality',
            good: 'good-quality',
            fair: 'low-quality',
            poor: 'poor-quality'
        };
        return mapping[qualityLevel] || 'no-data';
    }

    calculateEnhancedComponentQuality(element) {
        // Enhanced quality calculation with more factors
        let quality = 0;
        let totalFactors = 0;
        
        // MKCG population (30%)
        totalFactors += 30;
        if (this.isMKCGPopulated(element)) {
            quality += 30;
        }
        
        // Content quality (25%)
        totalFactors += 25;
        const textContent = element.textContent?.trim() || '';
        if (textContent.length > 100) {
            quality += 25;
        } else if (textContent.length > 50) {
            quality += 15;
        } else if (textContent.length > 0) {
            quality += 5;
        }
        
        // Media content (20%)
        totalFactors += 20;
        const mediaElements = element.querySelectorAll('img, video, audio');
        if (mediaElements.length >= 2) {
            quality += 20;
        } else if (mediaElements.length === 1) {
            quality += 15;
        }
        
        // Interactivity (15%)
        totalFactors += 15;
        const interactiveElements = element.querySelectorAll('a, button, input, textarea');
        if (interactiveElements.length >= 2) {
            quality += 15;
        } else if (interactiveElements.length === 1) {
            quality += 10;
        }
        
        // Styling and presentation (10%)
        totalFactors += 10;
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
            computedStyle.backgroundImage !== 'none') {
            quality += 5;
        }
        if (computedStyle.borderRadius !== '0px') {
            quality += 3;
        }
        if (computedStyle.boxShadow !== 'none') {
            quality += 2;
        }
        
        return Math.round((quality / totalFactors) * 100);
    }

    isMKCGPopulated(element) {
        return element.getAttribute('data-mkcg-populated') === 'true' ||
               element.classList.contains('mkcg-populated');
    }

    getConnectedSystemsCount() {
        let count = 0;
        if (this.integrationStatus.emptyStateConnected) count++;
        if (this.integrationStatus.indicatorsConnected) count++;
        if (this.componentManager) count++;
        if (this.stateManager) count++;
        return count;
    }

    updateAverageUpdateTime(duration) {
        if (this.performanceMetrics.averageUpdateTime === 0) {
            this.performanceMetrics.averageUpdateTime = duration;
        } else {
            this.performanceMetrics.averageUpdateTime = 
                (this.performanceMetrics.averageUpdateTime + duration) / 2;
        }
    }

    generatePerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            integrationStatus: this.integrationStatus,
            performanceMetrics: this.performanceMetrics,
            connectedSystems: this.getConnectedSystemsCount(),
            eventBusStats: {
                totalEvents: this.eventBus.events.size,
                activeListeners: Array.from(this.eventBus.events.values())
                    .reduce((sum, listeners) => sum + listeners.length, 0)
            }
        };
        
        // Log performance issues
        if (this.performanceMetrics.averageUpdateTime > 100) {
            console.warn('⚠️ Performance warning: Average update time is high', 
                         this.performanceMetrics.averageUpdateTime.toFixed(2) + 'ms');
        }
        
        if (this.performanceMetrics.errorCount > 10) {
            console.warn('⚠️ Performance warning: High error count', 
                         this.performanceMetrics.errorCount);
        }
        
        return report;
    }

    /**
     * GLOBAL INTERFACE
     */
    exposeGlobalInterface() {
        window.interactiveIntegrationManager = this;
        
        window.phase23Integration = {
            getStatus: () => this.integrationStatus,
            getMetrics: () => this.performanceMetrics,
            
            // Event system
            emit: (event, data) => this.eventBus.emit(event, data),
            on: (event, listener) => this.eventBus.on(event, listener),
            off: (event, listener) => this.eventBus.off(event, listener),
            
            // User feedback
            showToast: this.toastManager.show.bind(this.toastManager),
            showProgress: this.progressManager.show.bind(this.progressManager),
            showGuidance: this.guidanceManager.show.bind(this.guidanceManager),
            
            // Performance
            generateReport: () => this.generatePerformanceReport(),
            
            help: () => {
                console.log('🔄 Interactive Integration Manager Available:');
                console.log('  phase23Integration.getStatus() - Get integration status');
                console.log('  phase23Integration.getMetrics() - Get performance metrics');
                console.log('  phase23Integration.emit(event, data) - Emit event');
                console.log('  phase23Integration.on(event, listener) - Listen to event');
                console.log('  phase23Integration.showToast(message, type) - Show notification');
                console.log('  phase23Integration.showProgress(id, message, progress) - Show progress');
                console.log('  phase23Integration.showGuidance(message, target) - Show guidance');
                console.log('  phase23Integration.generateReport() - Generate performance report');
                console.log('  interactiveIntegrationManager - Access full class instance');
                console.log('\n🎯 Global systems also available:');
                console.log('  window.toast, window.progress, window.guidance');
                console.log('  window.phase23EventBus - Event communication system');
            }
        };
        
        console.log('🌐 Interactive Integration Manager interface exposed globally');
        console.log('💡 Try: phase23Integration.help()');
    }

    showFallbackInterface() {
        console.log('🚨 Interactive Integration Manager in fallback mode');
        
        window.phase23Integration = {
            status: 'fallback-mode',
            help: () => console.log('⚠️ Interactive Integration Manager in fallback mode. Try refreshing the page.'),
            retry: () => {
                console.log('🔄 Retrying initialization...');
                this.initialize();
            }
        };
    }
}

/**
 * Component Quality Scorer helper class
 */
class ComponentQualityScorer {
    constructor() {
        this.rules = new Map();
        this.thresholds = {
            excellent: 90,
            good: 70,
            fair: 50,
            poor: 0
        };
    }
    
    addRule(name, scoreFn, weight = 1) {
        this.rules.set(name, { scoreFn, weight });
    }
    
    scoreComponent(element) {
        let totalScore = 0;
        let totalWeight = 0;
        
        this.rules.forEach((rule, name) => {
            try {
                const score = rule.scoreFn(element);
                totalScore += score * rule.weight;
                totalWeight += rule.weight;
            } catch (error) {
                console.warn(`Quality scoring rule '${name}' failed:`, error);
            }
        });
        
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }
}

// Initialize when DOM is ready
function initializeInteractiveIntegrationManager() {
    // Wait for other systems to be ready
    setTimeout(() => {
        const integrationManager = new InteractiveIntegrationManager();
        integrationManager.initialize();
    }, 2000); // Wait 2 seconds for other systems
}

// Check if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInteractiveIntegrationManager);
} else {
    initializeInteractiveIntegrationManager();
}

// Additional CSS for integration UI elements
const integrationStyle = document.createElement('style');
integrationStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes progressBarAnimation {
        from { width: 100%; }
        to { width: 0%; }
    }
    
    .phase23-toast {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
    }
    
    .toast-icon {
        font-size: 16px;
        flex-shrink: 0;
    }
    
    .toast-message {
        flex: 1;
    }
    
    .toast-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
        transition: all 0.2s;
    }
    
    .toast-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
    
    .toast-progress {
        height: 3px;
        background: rgba(255, 255, 255, 0.3);
    }
    
    .phase23-progress-indicator {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .progress-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .progress-message {
        font-size: 14px;
        font-weight: 500;
        color: #1e293b;
    }
    
    .progress-bar-container {
        width: 100%;
        height: 8px;
        background: #f1f5f9;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .progress-bar {
        height: 100%;
        background: #3b82f6;
        border-radius: 4px;
        transition: width 0.3s ease;
    }
    
    .progress-percentage {
        font-size: 12px;
        color: #64748b;
        text-align: right;
    }
    
    .phase23-guidance {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .guidance-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .guidance-icon {
        font-size: 16px;
        flex-shrink: 0;
    }
    
    .guidance-message {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
    }
    
    .guidance-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
        transition: all 0.2s;
    }
    
    .guidance-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
`;

document.head.appendChild(integrationStyle);

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractiveIntegrationManager;
}

console.log('✅ Interactive Integration Manager loaded successfully');
console.log('💡 Initialize with: new InteractiveIntegrationManager().initialize()');
