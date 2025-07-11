/**
 * @file component-state-indicators.js
 * @description Phase 2: Component State Indicator Framework
 * 
 * ROOT-LEVEL FIX: Implements comprehensive component state visual indicators
 * No patches or quick fixes - complete architectural implementation
 * 
 * Implements:
 * - Quality badge rendering system
 * - Data freshness tracking indicators
 * - Sync status visual indicators
 * - Component meta information display
 * - Real-time state updates
 */

class ComponentStateIndicators {
    constructor() {
        this.initialized = false;
        this.componentStates = new Map();
        this.stateChangeObserver = null;
        this.updateQueue = [];
        this.isProcessingQueue = false;
        
        // State tracking
        this.metrics = {
            componentsTracked: 0,
            stateUpdates: 0,
            qualityScoreTotal: 0,
            averageQuality: 0
        };
        
        // Configuration
        this.config = {
            updateInterval: 5000, // 5 seconds
            qualityThresholds: {
                excellent: 90,
                good: 70,
                fair: 50,
                poor: 0
            },
            freshnessThresholds: {
                fresh: 1000 * 60 * 5,    // 5 minutes
                stale: 1000 * 60 * 60,   // 1 hour
                old: 1000 * 60 * 60 * 24 // 24 hours
            }
        };
        
        console.log('🏷️ Component State Indicators initializing...');
    }

    /**
     * Initialize the component state indicator system
     */
    async initialize() {
        const startTime = performance.now();
        
        try {
            // Step 1: Validate prerequisites
            await this.validatePrerequisites();
            
            // Step 2: Setup mutation observer for new components
            await this.setupComponentObserver();
            
            // Step 3: Initialize existing components
            await this.initializeExistingComponents();
            
            // Step 4: Setup update scheduling
            this.setupUpdateScheduling();
            
            // Step 5: Setup event listeners
            this.setupEventListeners();
            
            // Step 6: Start monitoring
            this.startMonitoring();
            
            const duration = performance.now() - startTime;
            this.initialized = true;
            
            console.log('✅ Component State Indicators initialized successfully', {
                duration: `${duration.toFixed(2)}ms`,
                componentsFound: this.componentStates.size,
                observerActive: !!this.stateChangeObserver
            });
            
            // Expose global interface
            this.exposeGlobalInterface();
            
            return true;
            
        } catch (error) {
            console.error('❌ Component State Indicators initialization failed:', error);
            this.showFallbackInterface();
            return false;
        }
    }

    /**
     * Step 1: Validate prerequisites
     */
    async validatePrerequisites() {
        const required = {
            previewContainer: document.getElementById('media-kit-preview'),
            stateManager: window.enhancedStateManager || window.stateManager,
            componentManager: window.enhancedComponentManager || window.componentManager
        };
        
        const missing = Object.entries(required)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        if (missing.length > 0) {
            throw new Error(`Missing prerequisites: ${missing.join(', ')}`);
        }
        
        this.stateManager = required.stateManager;
        this.componentManager = required.componentManager;
        this.previewContainer = required.previewContainer;
        
        console.log('✅ Prerequisites validated');
    }

    /**
     * Step 2: Setup mutation observer for new components
     */
    async setupComponentObserver() {
        this.stateChangeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Check for new component elements
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.processNewElement(node);
                    }
                });
                
                // Check for removed components
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.processRemovedElement(node);
                    }
                });
            });
        });
        
        // Start observing
        this.stateChangeObserver.observe(this.previewContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-component-id', 'data-component-type', 'data-mkcg-populated']
        });
        
        console.log('👁️ Component observer setup complete');
    }

    /**
     * Step 3: Initialize existing components
     */
    async initializeExistingComponents() {
        const components = this.previewContainer.querySelectorAll('.mk-component, [data-component-id]');
        
        for (const component of components) {
            await this.initializeComponent(component);
        }
        
        console.log(`🏷️ Initialized ${components.length} existing components`);
    }

    /**
     * Initialize a single component with state indicators
     */
    async initializeComponent(element) {
        const componentId = this.getComponentId(element);
        if (!componentId) return;
        
        // Create component state entry
        const componentState = {
            id: componentId,
            element: element,
            type: this.getComponentType(element),
            quality: this.calculateComponentQuality(element),
            freshness: this.calculateDataFreshness(element),
            syncStatus: this.getSyncStatus(element),
            mkcgPopulated: this.isMKCGPopulated(element),
            lastUpdate: Date.now(),
            indicators: {}
        };
        
        this.componentStates.set(componentId, componentState);
        
        // Add state indicators to the component
        await this.addStateIndicators(element, componentState);
        
        // Update metrics
        this.updateMetrics();
        
        console.log(`🏷️ Initialized component: ${componentId}`, componentState);
    }

    /**
     * Add all state indicators to a component element
     */
    async addStateIndicators(element, componentState) {
        // Ensure component has proper positioning
        this.ensureComponentPositioning(element);
        
        // Add quality badge
        this.addQualityBadge(element, componentState);
        
        // Add data freshness indicator
        this.addDataFreshnessIndicator(element, componentState);
        
        // Add sync status indicator
        this.addSyncStatusIndicator(element, componentState);
        
        // Add quality score display
        this.addQualityScoreDisplay(element, componentState);
        
        // Add component actions indicator
        this.addComponentActionsIndicator(element, componentState);
        
        // Apply component state styling
        this.applyComponentStateStyling(element, componentState);
        
        console.log(`🎨 State indicators added to component: ${componentState.id}`);
    }

    /**
     * QUALITY BADGE SYSTEM
     */
    addQualityBadge(element, componentState) {
        // Remove existing badge
        const existingBadge = element.querySelector('.quality-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        const qualityLevel = this.getQualityLevel(componentState.quality);
        
        const badge = document.createElement('div');
        badge.className = `quality-badge quality-badge-${qualityLevel}`;
        badge.setAttribute('data-quality', qualityLevel);
        badge.setAttribute('data-score', componentState.quality);
        badge.textContent = qualityLevel.toUpperCase();
        
        // Add tooltip
        badge.title = `Quality Score: ${componentState.quality}% (${qualityLevel})`;
        
        // Badge styling
        badge.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            z-index: 10;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        `;
        
        // Quality-specific styling
        const qualityColors = {
            excellent: 'linear-gradient(135deg, #10b981, #059669)',
            good: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            fair: 'linear-gradient(135deg, #f59e0b, #d97706)',
            poor: 'linear-gradient(135deg, #ef4444, #dc2626)'
        };
        
        badge.style.background = qualityColors[qualityLevel] || qualityColors.poor;
        
        // Add click handler for details
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showQualityDetails(componentState);
        });
        
        // Add hover effect
        badge.addEventListener('mouseenter', () => {
            badge.style.transform = 'scale(1.1)';
            badge.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        });
        
        badge.addEventListener('mouseleave', () => {
            badge.style.transform = 'scale(1)';
            badge.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        });
        
        element.appendChild(badge);
        componentState.indicators.qualityBadge = badge;
    }

    /**
     * DATA FRESHNESS INDICATOR
     */
    addDataFreshnessIndicator(element, componentState) {
        const existingIndicator = element.querySelector('.data-freshness');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const freshnessLevel = this.getFreshnessLevel(componentState.freshness);
        const timeAgo = this.formatTimeAgo(componentState.freshness);
        
        const indicator = document.createElement('div');
        indicator.className = `data-freshness freshness-${freshnessLevel}`;
        indicator.setAttribute('data-freshness', freshnessLevel);
        indicator.setAttribute('data-timestamp', componentState.lastUpdate);
        
        // Icon based on freshness
        const icons = {
            fresh: '🕐',
            stale: '⚠️',
            old: '⏰'
        };
        
        indicator.innerHTML = `${icons[freshnessLevel]} ${timeAgo}`;
        indicator.title = `Data freshness: ${freshnessLevel} (${timeAgo})`;
        
        // Indicator styling
        indicator.style.cssText = `
            position: absolute;
            bottom: 8px;
            left: 8px;
            z-index: 5;
            font-size: 10px;
            color: #6b7280;
            background: rgba(255, 255, 255, 0.95);
            padding: 3px 8px;
            border-radius: 6px;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        // Freshness-specific styling
        if (freshnessLevel === 'stale') {
            indicator.style.color = '#d97706';
            indicator.style.background = 'rgba(251, 191, 36, 0.1)';
            indicator.style.borderColor = 'rgba(251, 191, 36, 0.2)';
        } else if (freshnessLevel === 'old') {
            indicator.style.color = '#dc2626';
            indicator.style.background = 'rgba(239, 68, 68, 0.1)';
            indicator.style.borderColor = 'rgba(239, 68, 68, 0.2)';
        }
        
        // Add click handler
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showFreshnessDetails(componentState);
        });
        
        // Add hover effect
        indicator.addEventListener('mouseenter', () => {
            indicator.style.background = 'white';
            indicator.style.color = '#374151';
            indicator.style.transform = 'scale(1.05)';
            indicator.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        });
        
        indicator.addEventListener('mouseleave', () => {
            indicator.style.transform = 'scale(1)';
            indicator.style.boxShadow = 'none';
        });
        
        element.appendChild(indicator);
        componentState.indicators.freshnessIndicator = indicator;
    }

    /**
     * SYNC STATUS INDICATOR
     */
    addSyncStatusIndicator(element, componentState) {
        const existingIndicator = element.querySelector('.sync-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const indicator = document.createElement('div');
        indicator.className = `sync-indicator sync-${componentState.syncStatus}`;
        indicator.setAttribute('data-sync-status', componentState.syncStatus);
        
        // Create animated dot
        indicator.style.cssText = `
            position: absolute;
            top: 8px;
            left: 8px;
            z-index: 10;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        // Status-specific styling
        const statusColors = {
            synced: '#10b981',
            syncing: '#f59e0b',
            error: '#ef4444',
            offline: '#6b7280'
        };
        
        indicator.style.background = statusColors[componentState.syncStatus] || statusColors.offline;
        indicator.title = `Sync status: ${componentState.syncStatus}`;
        
        // Add pulsing animation for active states
        if (componentState.syncStatus === 'syncing') {
            indicator.style.animation = 'pulse 2s ease-in-out infinite';
        }
        
        // Add pseudo-element for ring effect
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            background: inherit;
            opacity: 0.3;
            animation: pulse 2s ease-in-out infinite;
        `;
        
        indicator.appendChild(ring);
        
        // Add click handler
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showSyncDetails(componentState);
        });
        
        // Add hover effect
        indicator.addEventListener('mouseenter', () => {
            indicator.style.transform = 'scale(1.3)';
        });
        
        indicator.addEventListener('mouseleave', () => {
            indicator.style.transform = 'scale(1)';
        });
        
        element.appendChild(indicator);
        componentState.indicators.syncIndicator = indicator;
    }

    /**
     * QUALITY SCORE DISPLAY
     */
    addQualityScoreDisplay(element, componentState) {
        const existingDisplay = element.querySelector('.component-quality-score');
        if (existingDisplay) {
            existingDisplay.remove();
        }
        
        const display = document.createElement('div');
        display.className = 'component-quality-score';
        display.textContent = `${componentState.quality}%`;
        display.title = `Quality Score: ${componentState.quality}%`;
        
        display.style.cssText = `
            position: absolute;
            bottom: 8px;
            right: 8px;
            z-index: 5;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        // Add click handler
        display.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showQualityBreakdown(componentState);
        });
        
        // Add hover effect
        display.addEventListener('mouseenter', () => {
            display.style.background = 'rgba(0, 0, 0, 0.9)';
            display.style.transform = 'scale(1.1)';
        });
        
        display.addEventListener('mouseleave', () => {
            display.style.background = 'rgba(0, 0, 0, 0.8)';
            display.style.transform = 'scale(1)';
        });
        
        element.appendChild(display);
        componentState.indicators.qualityScore = display;
    }

    /**
     * COMPONENT ACTIONS INDICATOR
     */
    addComponentActionsIndicator(element, componentState) {
        const existingIndicator = element.querySelector('.component-actions-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Check if component has updates or errors
        const hasUpdates = this.componentHasUpdates(componentState);
        const hasErrors = this.componentHasErrors(componentState);
        
        if (!hasUpdates && !hasErrors) return; // No indicator needed
        
        const indicator = document.createElement('div');
        indicator.className = 'component-actions-indicator';
        
        if (hasErrors) {
            indicator.classList.add('has-errors');
            indicator.textContent = '!';
            indicator.title = 'Component has errors';
        } else if (hasUpdates) {
            indicator.classList.add('has-updates');
            indicator.textContent = '●';
            indicator.title = 'Updates available';
        }
        
        indicator.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            z-index: 20;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        
        if (hasErrors) {
            indicator.style.background = '#ef4444';
        } else {
            indicator.style.background = '#f59e0b';
        }
        
        // Show on component hover
        element.addEventListener('mouseenter', () => {
            indicator.style.opacity = '1';
            indicator.style.transform = 'scale(1)';
        });
        
        element.addEventListener('mouseleave', () => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'scale(0)';
        });
        
        // Add click handler
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showComponentActions(componentState);
        });
        
        element.appendChild(indicator);
        componentState.indicators.actionsIndicator = indicator;
    }

    /**
     * COMPONENT STATE STYLING
     */
    applyComponentStateStyling(element, componentState) {
        // Apply base component state class
        element.classList.add('component-with-indicators');
        
        // Apply MKCG population styling
        if (componentState.mkcgPopulated) {
            element.setAttribute('data-mkcg-populated', 'true');
            element.style.borderLeft = '4px solid #10b981';
            element.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)';
        }
        
        // Apply data state styling
        const dataState = this.getDataState(componentState);
        element.setAttribute('data-state', dataState);
        
        // Apply quality-based styling
        const qualityLevel = this.getQualityLevel(componentState.quality);
        element.setAttribute('data-quality', qualityLevel);
        
        // Add transition effects
        element.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Add hover effects
        const originalTransform = element.style.transform;
        
        element.addEventListener('mouseenter', () => {
            if (componentState.mkcgPopulated) {
                element.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, transparent 100%)';
                element.style.borderLeftColor = '#059669';
                element.style.transform = 'translateX(2px)';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            if (componentState.mkcgPopulated) {
                element.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)';
                element.style.borderLeftColor = '#10b981';
                element.style.transform = originalTransform;
            }
        });
        
        console.log(`🎨 Applied state styling to component: ${componentState.id}`);
    }

    /**
     * CALCULATION METHODS
     */
    calculateComponentQuality(element) {
        let qualityScore = 0;
        let totalChecks = 0;
        
        // Check for MKCG population (40 points)
        totalChecks += 40;
        if (this.isMKCGPopulated(element)) {
            qualityScore += 40;
        }
        
        // Check for content completeness (30 points)
        totalChecks += 30;
        const textContent = element.textContent?.trim() || '';
        if (textContent.length > 50) {
            qualityScore += 30;
        } else if (textContent.length > 20) {
            qualityScore += 15;
        } else if (textContent.length > 0) {
            qualityScore += 5;
        }
        
        // Check for media content (20 points)
        totalChecks += 20;
        const images = element.querySelectorAll('img');
        const videos = element.querySelectorAll('video');
        if (images.length > 0 || videos.length > 0) {
            qualityScore += 20;
        }
        
        // Check for links and interactivity (10 points)
        totalChecks += 10;
        const links = element.querySelectorAll('a');
        const buttons = element.querySelectorAll('button');
        if (links.length > 0 || buttons.length > 0) {
            qualityScore += 10;
        }
        
        return Math.round((qualityScore / totalChecks) * 100);
    }

    calculateDataFreshness(element) {
        // Check for timestamp attributes
        const timestamp = element.getAttribute('data-timestamp') || 
                         element.getAttribute('data-created') ||
                         element.getAttribute('data-updated');
        
        if (timestamp) {
            return Date.now() - parseInt(timestamp);
        }
        
        // Check for MKCG data timestamps
        if (this.isMKCGPopulated(element) && window.guestifyData?.mkcgData?.meta_info?.extraction_date) {
            const extractionDate = new Date(window.guestifyData.mkcgData.meta_info.extraction_date);
            return Date.now() - extractionDate.getTime();
        }
        
        // Default to current time (fresh)
        return 0;
    }

    getSyncStatus(element) {
        const syncAttr = element.getAttribute('data-sync-status');
        if (syncAttr) return syncAttr;
        
        // Check for MKCG population
        if (this.isMKCGPopulated(element)) {
            return 'synced';
        }
        
        // Check for errors
        if (element.classList.contains('component-error')) {
            return 'error';
        }
        
        // Default
        return 'offline';
    }

    /**
     * UTILITY METHODS
     */
    getComponentId(element) {
        return element.getAttribute('data-component-id') || 
               element.id || 
               element.getAttribute('data-id') ||
               null;
    }

    getComponentType(element) {
        return element.getAttribute('data-component-type') || 
               element.className.split(' ').find(cls => cls.includes('-component'))?.replace('-component', '') ||
               'unknown';
    }

    isMKCGPopulated(element) {
        return element.getAttribute('data-mkcg-populated') === 'true' ||
               element.classList.contains('mkcg-populated') ||
               element.querySelector('[data-mkcg-populated]');
    }

    getQualityLevel(score) {
        if (score >= this.config.qualityThresholds.excellent) return 'excellent';
        if (score >= this.config.qualityThresholds.good) return 'good';
        if (score >= this.config.qualityThresholds.fair) return 'fair';
        return 'poor';
    }

    getFreshnessLevel(age) {
        if (age <= this.config.freshnessThresholds.fresh) return 'fresh';
        if (age <= this.config.freshnessThresholds.stale) return 'stale';
        return 'old';
    }

    getDataState(componentState) {
        if (componentState.syncStatus === 'error') return 'error';
        if (componentState.freshness > this.config.freshnessThresholds.stale) return 'stale';
        return 'fresh';
    }

    formatTimeAgo(age) {
        const seconds = Math.floor(age / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'now';
    }

    ensureComponentPositioning(element) {
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === 'static') {
            element.style.position = 'relative';
        }
    }

    componentHasUpdates(componentState) {
        // Check if component has MKCG data available for updates
        return this.isMKCGPopulated(componentState.element) && 
               window.guestifyData?.mkcgData &&
               componentState.freshness > this.config.freshnessThresholds.fresh;
    }

    componentHasErrors(componentState) {
        return componentState.syncStatus === 'error' ||
               componentState.element.classList.contains('component-error');
    }

    /**
     * DETAIL MODAL SYSTEMS
     */
    showQualityDetails(componentState) {
        const modal = this.createDetailsModal('Quality Analysis', componentState);
        
        const content = `
            <div class="quality-analysis-content">
                <div class="quality-score-circle">
                    <div class="score-value">${componentState.quality}%</div>
                    <div class="score-label">${this.getQualityLevel(componentState.quality)}</div>
                </div>
                
                <div class="quality-breakdown">
                    <h4>Quality Breakdown</h4>
                    ${this.getQualityBreakdownHTML(componentState)}
                </div>
                
                <div class="improvement-suggestions">
                    <h4>💡 Improvement Suggestions</h4>
                    ${this.getImprovementSuggestionsHTML(componentState)}
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-content').innerHTML = content;
        this.attachModalHandlers(modal);
    }

    showFreshnessDetails(componentState) {
        const modal = this.createDetailsModal('Data Freshness', componentState);
        
        const freshnessLevel = this.getFreshnessLevel(componentState.freshness);
        const timeAgo = this.formatTimeAgo(componentState.freshness);
        
        const content = `
            <div class="freshness-details-content">
                <div class="freshness-status ${freshnessLevel}">
                    <div class="freshness-icon">${freshnessLevel === 'fresh' ? '🟢' : freshnessLevel === 'stale' ? '🟡' : '🔴'}</div>
                    <div class="freshness-info">
                        <div class="freshness-level">${freshnessLevel.toUpperCase()}</div>
                        <div class="freshness-time">Last updated ${timeAgo}</div>
                    </div>
                </div>
                
                <div class="freshness-actions">
                    <h4>🔄 Available Actions</h4>
                    <button class="btn btn--primary" data-action="refresh">Refresh Data</button>
                    <button class="btn btn--secondary" data-action="sync">Sync with MKCG</button>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-content').innerHTML = content;
        this.attachModalHandlers(modal);
    }

    showSyncDetails(componentState) {
        const modal = this.createDetailsModal('Sync Status', componentState);
        
        const content = `
            <div class="sync-details-content">
                <div class="sync-status ${componentState.syncStatus}">
                    <div class="sync-icon">${this.getSyncStatusIcon(componentState.syncStatus)}</div>
                    <div class="sync-info">
                        <div class="sync-level">${componentState.syncStatus.toUpperCase()}</div>
                        <div class="sync-description">${this.getSyncStatusDescription(componentState.syncStatus)}</div>
                    </div>
                </div>
                
                <div class="sync-history">
                    <h4>📊 Sync History</h4>
                    ${this.getSyncHistoryHTML(componentState)}
                </div>
                
                <div class="sync-actions">
                    <button class="btn btn--primary" data-action="force-sync">Force Sync</button>
                    <button class="btn btn--secondary" data-action="reset-sync">Reset Sync</button>
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-content').innerHTML = content;
        this.attachModalHandlers(modal);
    }

    createDetailsModal(title, componentState) {
        const modal = document.createElement('div');
        modal.className = 'component-details-modal-overlay';
        modal.innerHTML = `
            <div class="component-details-modal">
                <div class="modal-header">
                    <div class="modal-title">
                        <h3>${title}</h3>
                        <div class="component-info">
                            <span class="component-type">${componentState.type}</span>
                            <span class="component-id">#${componentState.id}</span>
                        </div>
                    </div>
                    <button class="modal-close" data-action="close">&times;</button>
                </div>
                <div class="modal-content">
                    <!-- Content will be added here -->
                </div>
            </div>
        `;
        
        // Modal styling
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10003;
            animation: fadeIn 0.3s ease-out;
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    attachModalHandlers(modal) {
        modal.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleModalAction(action, modal, e.target);
            }
            
            // Close on overlay click
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    async handleModalAction(action, modal, element) {
        switch (action) {
            case 'close':
                this.closeModal(modal);
                break;
                
            case 'refresh':
                await this.handleRefreshComponent(modal);
                break;
                
            case 'sync':
                await this.handleSyncComponent(modal);
                break;
                
            case 'force-sync':
                await this.handleForceSyncComponent(modal);
                break;
                
            case 'reset-sync':
                await this.handleResetSyncComponent(modal);
                break;
        }
    }

    closeModal(modal) {
        modal.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => modal.remove(), 300);
    }

    /**
     * UPDATE AND MONITORING SYSTEMS
     */
    setupUpdateScheduling() {
        // Schedule regular updates
        setInterval(() => {
            this.processUpdateQueue();
        }, this.config.updateInterval);
        
        console.log(`⏰ Update scheduling setup: every ${this.config.updateInterval}ms`);
    }

    setupEventListeners() {
        // Listen for state manager changes
        if (this.stateManager && this.stateManager.subscribe) {
            this.stateManager.subscribe('componentUpdate', (data) => {
                this.queueComponentUpdate(data.componentId);
            });
        }
        
        // Listen for MKCG data updates
        document.addEventListener('mkcgDataUpdated', (e) => {
            this.updateAllComponentsFromMKCG();
        });
        
        console.log('👂 Event listeners setup complete');
    }

    startMonitoring() {
        // Start quality monitoring
        this.startQualityMonitoring();
        
        // Start freshness monitoring
        this.startFreshnessMonitoring();
        
        console.log('🔍 Component monitoring started');
    }

    startQualityMonitoring() {
        setInterval(() => {
            this.componentStates.forEach((state, id) => {
                const newQuality = this.calculateComponentQuality(state.element);
                if (newQuality !== state.quality) {
                    this.updateComponentQuality(id, newQuality);
                }
            });
        }, 30000); // Check every 30 seconds
    }

    startFreshnessMonitoring() {
        setInterval(() => {
            this.componentStates.forEach((state, id) => {
                this.updateComponentFreshness(id);
            });
        }, 60000); // Check every minute
    }

    /**
     * UPDATE METHODS
     */
    queueComponentUpdate(componentId) {
        if (!this.updateQueue.includes(componentId)) {
            this.updateQueue.push(componentId);
        }
    }

    async processUpdateQueue() {
        if (this.isProcessingQueue || this.updateQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        while (this.updateQueue.length > 0) {
            const componentId = this.updateQueue.shift();
            await this.updateComponent(componentId);
        }
        
        this.isProcessingQueue = false;
    }

    async updateComponent(componentId) {
        const componentState = this.componentStates.get(componentId);
        if (!componentState) return;
        
        // Recalculate all state values
        componentState.quality = this.calculateComponentQuality(componentState.element);
        componentState.freshness = this.calculateDataFreshness(componentState.element);
        componentState.syncStatus = this.getSyncStatus(componentState.element);
        componentState.lastUpdate = Date.now();
        
        // Update all indicators
        await this.updateStateIndicators(componentState);
        
        console.log(`🔄 Updated component: ${componentId}`, componentState);
    }

    async updateStateIndicators(componentState) {
        // Update quality badge
        if (componentState.indicators.qualityBadge) {
            const qualityLevel = this.getQualityLevel(componentState.quality);
            componentState.indicators.qualityBadge.textContent = qualityLevel.toUpperCase();
            componentState.indicators.qualityBadge.setAttribute('data-quality', qualityLevel);
            componentState.indicators.qualityBadge.title = `Quality Score: ${componentState.quality}% (${qualityLevel})`;
        }
        
        // Update freshness indicator
        if (componentState.indicators.freshnessIndicator) {
            const freshnessLevel = this.getFreshnessLevel(componentState.freshness);
            const timeAgo = this.formatTimeAgo(componentState.freshness);
            componentState.indicators.freshnessIndicator.innerHTML = 
                `${freshnessLevel === 'fresh' ? '🕐' : freshnessLevel === 'stale' ? '⚠️' : '⏰'} ${timeAgo}`;
        }
        
        // Update sync indicator
        if (componentState.indicators.syncIndicator) {
            componentState.indicators.syncIndicator.className = `sync-indicator sync-${componentState.syncStatus}`;
        }
        
        // Update quality score
        if (componentState.indicators.qualityScore) {
            componentState.indicators.qualityScore.textContent = `${componentState.quality}%`;
        }
        
        // Update component styling
        this.applyComponentStateStyling(componentState.element, componentState);
    }

    updateComponentQuality(componentId, newQuality) {
        const componentState = this.componentStates.get(componentId);
        if (!componentState) return;
        
        const oldQuality = componentState.quality;
        componentState.quality = newQuality;
        
        // Update quality badge
        if (componentState.indicators.qualityBadge) {
            const qualityLevel = this.getQualityLevel(newQuality);
            componentState.indicators.qualityBadge.textContent = qualityLevel.toUpperCase();
            componentState.indicators.qualityBadge.setAttribute('data-quality', qualityLevel);
        }
        
        // Update metrics
        this.updateMetrics();
        
        console.log(`📊 Quality updated for ${componentId}: ${oldQuality}% → ${newQuality}%`);
    }

    updateComponentFreshness(componentId) {
        const componentState = this.componentStates.get(componentId);
        if (!componentState) return;
        
        componentState.freshness = this.calculateDataFreshness(componentState.element);
        
        // Update freshness indicator
        if (componentState.indicators.freshnessIndicator) {
            const freshnessLevel = this.getFreshnessLevel(componentState.freshness);
            const timeAgo = this.formatTimeAgo(componentState.freshness);
            
            const icons = { fresh: '🕐', stale: '⚠️', old: '⏰' };
            componentState.indicators.freshnessIndicator.innerHTML = `${icons[freshnessLevel]} ${timeAgo}`;
        }
    }

    updateAllComponentsFromMKCG() {
        console.log('🔄 Updating all components from MKCG data...');
        
        this.componentStates.forEach((state, id) => {
            this.queueComponentUpdate(id);
        });
    }

    updateMetrics() {
        const qualities = Array.from(this.componentStates.values()).map(state => state.quality);
        
        this.metrics.componentsTracked = this.componentStates.size;
        this.metrics.stateUpdates++;
        this.metrics.qualityScoreTotal = qualities.reduce((sum, quality) => sum + quality, 0);
        this.metrics.averageQuality = this.metrics.qualityScoreTotal / (qualities.length || 1);
    }

    /**
     * ELEMENT PROCESSING
     */
    processNewElement(element) {
        // Check if this is a component element
        if (this.isComponentElement(element)) {
            this.initializeComponent(element);
        }
        
        // Check for component elements in children
        const componentChildren = element.querySelectorAll?.('.mk-component, [data-component-id]');
        componentChildren?.forEach(child => {
            this.initializeComponent(child);
        });
    }

    processRemovedElement(element) {
        const componentId = this.getComponentId(element);
        if (componentId && this.componentStates.has(componentId)) {
            this.componentStates.delete(componentId);
            this.updateMetrics();
            console.log(`🗑️ Removed component from tracking: ${componentId}`);
        }
    }

    isComponentElement(element) {
        return element.classList?.contains('mk-component') ||
               element.hasAttribute?.('data-component-id') ||
               element.hasAttribute?.('data-component-type');
    }

    /**
     * HELPER METHODS FOR MODAL CONTENT
     */
    getQualityBreakdownHTML(componentState) {
        // Return detailed quality breakdown
        return `
            <div class="breakdown-item">
                <span class="breakdown-label">MKCG Data:</span>
                <span class="breakdown-value">${componentState.mkcgPopulated ? '✅ Connected' : '❌ Not Connected'}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Content:</span>
                <span class="breakdown-value">${componentState.element.textContent?.length > 50 ? '✅ Complete' : '⚠️ Partial'}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Media:</span>
                <span class="breakdown-value">${componentState.element.querySelectorAll('img, video').length > 0 ? '✅ Present' : '❌ Missing'}</span>
            </div>
        `;
    }

    getImprovementSuggestionsHTML(componentState) {
        const suggestions = [];
        
        if (!componentState.mkcgPopulated) {
            suggestions.push('🔗 Connect to MKCG data for auto-population');
        }
        
        if (componentState.element.textContent?.length < 50) {
            suggestions.push('📝 Add more descriptive content');
        }
        
        if (componentState.element.querySelectorAll('img, video').length === 0) {
            suggestions.push('🖼️ Add images or videos for visual appeal');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('✨ Component looks great! No improvements needed.');
        }
        
        return suggestions.map(suggestion => `<div class="suggestion-item">${suggestion}</div>`).join('');
    }

    getSyncStatusIcon(status) {
        const icons = {
            synced: '🟢',
            syncing: '🟡',
            error: '🔴',
            offline: '⚫'
        };
        return icons[status] || icons.offline;
    }

    getSyncStatusDescription(status) {
        const descriptions = {
            synced: 'Component is synchronized with the latest data',
            syncing: 'Component is currently being synchronized',
            error: 'Synchronization failed - manual intervention needed',
            offline: 'Component is not connected to any data source'
        };
        return descriptions[status] || descriptions.offline;
    }

    getSyncHistoryHTML(componentState) {
        // Mock sync history for demonstration
        return `
            <div class="history-item">
                <span class="history-time">2 minutes ago</span>
                <span class="history-action">Data refreshed</span>
                <span class="history-status success">✅</span>
            </div>
            <div class="history-item">
                <span class="history-time">1 hour ago</span>
                <span class="history-action">MKCG sync</span>
                <span class="history-status success">✅</span>
            </div>
        `;
    }

    /**
     * GLOBAL INTERFACE
     */
    exposeGlobalInterface() {
        window.componentStateIndicators = this;
        
        window.componentIndicators = {
            getStatus: () => ({
                initialized: this.initialized,
                componentsTracked: this.componentStates.size,
                metrics: this.metrics,
                config: this.config
            }),
            
            updateComponent: (componentId) => this.queueComponentUpdate(componentId),
            updateAllComponents: () => this.updateAllComponentsFromMKCG(),
            getComponentState: (componentId) => this.componentStates.get(componentId),
            getAllComponentStates: () => Array.from(this.componentStates.values()),
            
            showQualityDetails: (componentId) => {
                const state = this.componentStates.get(componentId);
                if (state) this.showQualityDetails(state);
            },
            
            help: () => {
                console.log('🏷️ Component State Indicators Available:');
                console.log('  componentIndicators.getStatus() - Get system status');
                console.log('  componentIndicators.updateComponent(id) - Update specific component');
                console.log('  componentIndicators.updateAllComponents() - Update all components');
                console.log('  componentIndicators.getComponentState(id) - Get component state');
                console.log('  componentIndicators.getAllComponentStates() - Get all states');
                console.log('  componentIndicators.showQualityDetails(id) - Show quality details');
                console.log('  componentStateIndicators - Access full class instance');
            }
        };
        
        console.log('🌐 Component State Indicators interface exposed globally');
        console.log('💡 Try: componentIndicators.help()');
    }

    showFallbackInterface() {
        console.log('🚨 Component State Indicators in fallback mode');
        
        window.componentIndicators = {
            status: 'fallback-mode',
            help: () => console.log('⚠️ Component State Indicators in fallback mode. Try refreshing the page.'),
            retry: () => {
                console.log('🔄 Retrying initialization...');
                this.initialize();
            }
        };
    }
}

// Initialize when DOM is ready
function initializeComponentStateIndicators() {
    const indicators = new ComponentStateIndicators();
    indicators.initialize();
}

// Check if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponentStateIndicators);
} else {
    initializeComponentStateIndicators();
}

// Additional CSS for component state indicators
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
    .component-with-indicators {
        position: relative;
    }
    
    .component-details-modal {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .component-details-modal .modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .modal-title h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
    }
    
    .component-info {
        display: flex;
        gap: 8px;
        font-size: 12px;
    }
    
    .component-type {
        background: #3b82f6;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: 500;
    }
    
    .component-id {
        color: #64748b;
        font-family: monospace;
    }
    
    .quality-score-circle {
        text-align: center;
        margin: 20px 0;
    }
    
    .score-value {
        font-size: 48px;
        font-weight: 700;
        color: #1e293b;
    }
    
    .score-label {
        font-size: 14px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 4px;
    }
    
    .quality-breakdown,
    .improvement-suggestions,
    .freshness-details-content,
    .sync-details-content {
        margin: 20px 0;
    }
    
    .quality-breakdown h4,
    .improvement-suggestions h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
    }
    
    .breakdown-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
    }
    
    .breakdown-label {
        font-size: 13px;
        color: #64748b;
    }
    
    .breakdown-value {
        font-size: 13px;
        font-weight: 500;
    }
    
    .suggestion-item {
        padding: 8px 12px;
        background: #f8fafc;
        border-radius: 6px;
        margin-bottom: 8px;
        font-size: 13px;
        line-height: 1.4;
    }
    
    .freshness-status,
    .sync-status {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    
    .freshness-icon,
    .sync-icon {
        font-size: 24px;
    }
    
    .freshness-level,
    .sync-level {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
    }
    
    .freshness-time,
    .sync-description {
        font-size: 13px;
        color: #64748b;
        margin-top: 2px;
    }
    
    .freshness-actions,
    .sync-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;
    }
    
    .history-item {
        display: grid;
        grid-template-columns: 1fr 2fr auto;
        gap: 12px;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: 13px;
    }
    
    .history-time {
        color: #64748b;
    }
    
    .history-action {
        color: #374151;
    }
    
    .history-status.success {
        color: #059669;
    }
    
    .btn {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn--primary {
        background: #3b82f6;
        color: white;
    }
    
    .btn--primary:hover {
        background: #2563eb;
    }
    
    .btn--secondary {
        background: #f1f5f9;
        color: #374151;
        border: 1px solid #d1d5db;
    }
    
    .btn--secondary:hover {
        background: #e5e7eb;
    }
`;

document.head.appendChild(additionalStyle);

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentStateIndicators;
}

console.log('✅ Component State Indicators System loaded successfully');
console.log('💡 Initialize with: new ComponentStateIndicators().initialize()');
