/**
 * @file task5-sync-indicator-integration.js
 * @description Integration layer connecting Task 5 refresh system with Task 3 sync indicators
 * 
 * Phase 2.3 - Task 5: Data Refresh and Synchronization Controls
 * 
 * This module connects the real refresh functionality to the existing
 * component sync indicators from Task 3, providing live status updates.
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { eventBus } from '../core/event-bus.js';

/**
 * Task 5 Sync Indicator Integration
 * Connects refresh manager to existing Task 3 sync indicators
 */
class Task5SyncIndicatorIntegration {
    constructor() {
        this.logger = structuredLogger;
        this.eventBus = eventBus;
        
        // Track component sync states
        this.componentSyncStates = new Map();
        
        // Track global refresh state
        this.globalRefreshState = {
            inProgress: false,
            lastCheck: null,
            lastRefresh: null,
            pendingComponents: new Set(),
            errorComponents: new Set()
        };
        
        this.logger.info('SYNC_INTEGRATION', 'Task 5 Sync Indicator Integration initialized');
        
        // Initialize integration
        this.initializeIntegration();
    }

    /**
     * Initialize the integration with refresh manager and existing indicators
     */
    initializeIntegration() {
        // Wait for refresh manager to be available
        this.waitForRefreshManager().then(() => {
            this.setupEventListeners();
            this.initializeExistingIndicators();
            this.logger.info('SYNC_INTEGRATION', 'Integration setup completed');
        });
    }

    /**
     * Wait for refresh manager to be available
     * @returns {Promise<Object>} Refresh manager instance
     */
    async waitForRefreshManager() {
        return new Promise((resolve) => {
            const checkForManager = () => {
                if (window.mkcgDataRefreshManager) {
                    resolve(window.mkcgDataRefreshManager);
                } else {
                    setTimeout(checkForManager, 100);
                }
            };
            checkForManager();
        });
    }

    /**
     * Set up event listeners for refresh events
     */
    setupEventListeners() {
        // Listen for refresh events from refresh manager
        this.eventBus.on('refresh:start', (data) => {
            this.handleRefreshStart(data);
        });

        this.eventBus.on('refresh:progress', (data) => {
            this.handleRefreshProgress(data);
        });

        this.eventBus.on('refresh:complete', (data) => {
            this.handleRefreshComplete(data);
        });

        this.eventBus.on('refresh:error', (data) => {
            this.handleRefreshError(data);
        });

        this.eventBus.on('refresh:component-complete', (data) => {
            this.handleComponentRefreshComplete(data);
        });

        this.eventBus.on('refresh:fresh-data-available', (data) => {
            this.handleFreshDataAvailable(data);
        });

        this.eventBus.on('refresh:data-updated', (data) => {
            this.handleDataUpdated(data);
        });

        // Listen for state manager events to track component changes
        this.eventBus.on('state:component-add', (data) => {
            this.initializeComponentSyncIndicator(data.payload.id);
        });

        this.eventBus.on('state:component-remove', (data) => {
            this.cleanupComponentSyncIndicator(data.payload);
        });

        this.logger.info('SYNC_INTEGRATION', 'Event listeners set up');
    }

    /**
     * Initialize existing component sync indicators
     */
    initializeExistingIndicators() {
        // Find all existing components with sync indicators
        const componentElements = document.querySelectorAll('[data-component-id]');
        
        componentElements.forEach(element => {
            const componentId = element.getAttribute('data-component-id');
            if (componentId) {
                this.initializeComponentSyncIndicator(componentId);
            }
        });

        // Initialize dashboard sync status
        this.initializeDashboardSyncStatus();

        this.logger.info('SYNC_INTEGRATION', `Initialized ${componentElements.length} existing component indicators`);
    }

    /**
     * Initialize sync indicator for a specific component
     * @param {string} componentId - Component ID
     */
    initializeComponentSyncIndicator(componentId) {
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) {
            return;
        }

        // Create sync indicator if it doesn't exist
        let syncIndicator = componentElement.querySelector('.sync-indicator');
        if (!syncIndicator) {
            syncIndicator = this.createSyncIndicator(componentId);
            componentElement.appendChild(syncIndicator);
        }

        // Create data freshness indicator if it doesn't exist
        let freshnessIndicator = componentElement.querySelector('.data-freshness');
        if (!freshnessIndicator) {
            freshnessIndicator = this.createDataFreshnessIndicator(componentId);
            componentElement.appendChild(freshnessIndicator);
        }

        // Initialize component state
        this.componentSyncStates.set(componentId, {
            status: 'idle',
            lastSync: null,
            lastCheck: null,
            hasChanges: false,
            qualityScore: 0,
            conflicts: 0
        });

        // Set initial sync status
        this.updateComponentSyncStatus(componentId, 'idle');

        // Add click handlers for sync controls
        this.attachComponentSyncHandlers(componentId, componentElement);
    }

    /**
     * Create sync indicator element
     * @param {string} componentId - Component ID
     * @returns {HTMLElement} Sync indicator element
     */
    createSyncIndicator(componentId) {
        const indicator = document.createElement('div');
        indicator.className = 'sync-indicator';
        indicator.title = 'Click to refresh this component';
        indicator.setAttribute('data-component-id', componentId);
        
        // Add click handler for individual component refresh
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            this.refreshSingleComponent(componentId);
        });

        return indicator;
    }

    /**
     * Create data freshness indicator element
     * @param {string} componentId - Component ID
     * @returns {HTMLElement} Freshness indicator element
     */
    createDataFreshnessIndicator(componentId) {
        const indicator = document.createElement('div');
        indicator.className = 'data-freshness';
        indicator.textContent = 'Unknown';
        indicator.title = 'Last data update time';
        
        return indicator;
    }

    /**
     * Initialize dashboard sync status
     */
    initializeDashboardSyncStatus() {
        const dashboard = document.getElementById('mkcg-enhanced-dashboard');
        if (!dashboard) {
            return;
        }

        // Create global sync status indicator
        let globalSyncStatus = dashboard.querySelector('.global-sync-status');
        if (!globalSyncStatus) {
            globalSyncStatus = document.createElement('div');
            globalSyncStatus.className = 'global-sync-status';
            globalSyncStatus.innerHTML = `
                <div class="sync-status-indicator" title="Global sync status"></div>
                <span class="sync-status-text">All components in sync</span>
            `;
            
            // Insert after dashboard header
            const dashboardHeader = dashboard.querySelector('.mkcg-dashboard-trigger');
            if (dashboardHeader) {
                dashboardHeader.appendChild(globalSyncStatus);
            }
        }

        // Add CSS for global sync status
        this.addGlobalSyncStatusCSS();
    }

    /**
     * Add CSS for global sync status
     */
    addGlobalSyncStatusCSS() {
        if (document.getElementById('task5-sync-integration-css')) {
            return; // Already added
        }

        const style = document.createElement('style');
        style.id = 'task5-sync-integration-css';
        style.textContent = `
            /* Task 5 Sync Integration CSS */
            .global-sync-status {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: 12px;
                padding: 4px 8px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(4px);
            }
            
            .sync-status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
                transition: all 0.3s ease;
            }
            
            .sync-status-indicator.syncing {
                background: #f59e0b;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            .sync-status-indicator.error {
                background: #ef4444;
            }
            
            .sync-status-indicator.checking {
                background: #6b7280;
                animation: pulse 2s ease-in-out infinite;
            }
            
            .sync-status-text {
                font-size: 11px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.9);
            }
            
            /* Enhanced component sync indicators */
            .sync-indicator {
                position: absolute;
                top: 8px;
                left: 8px;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--sync-active);
                z-index: 10;
                transition: all 0.3s ease;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .sync-indicator:hover {
                transform: scale(1.2);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .sync-indicator.idle {
                background: #10b981;
            }
            
            .sync-indicator.checking {
                background: #6b7280;
                animation: pulse 2s ease-in-out infinite;
            }
            
            .sync-indicator.syncing {
                background: #f59e0b;
                animation: spin 1s linear infinite;
            }
            
            .sync-indicator.fresh {
                background: #10b981;
                animation: success-pulse 1s ease-out;
            }
            
            .sync-indicator.stale {
                background: #f59e0b;
            }
            
            .sync-indicator.error {
                background: #ef4444;
                animation: error-shake 0.5s ease-in-out;
            }
            
            .sync-indicator.conflicts {
                background: #8b5cf6;
                animation: pulse 1s ease-in-out infinite;
            }
            
            /* Enhanced data freshness indicators */
            .data-freshness {
                position: absolute;
                bottom: 8px;
                left: 8px;
                font-size: 9px;
                color: #6b7280;
                background: rgba(255, 255, 255, 0.95);
                padding: 2px 6px;
                border-radius: 4px;
                backdrop-filter: blur(4px);
                border: 1px solid rgba(0, 0, 0, 0.05);
                z-index: 5;
                transition: all 0.3s ease;
                cursor: pointer;
                font-weight: 500;
            }
            
            .data-freshness:hover {
                background: white;
                color: #374151;
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .data-freshness.fresh {
                color: #059669;
                border-color: #059669;
            }
            
            .data-freshness.stale {
                color: #d97706;
                background: rgba(251, 191, 36, 0.1);
                border-color: rgba(251, 191, 36, 0.3);
            }
            
            .data-freshness.very-stale {
                color: #dc2626;
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.3);
            }
            
            /* Component state enhancements for sync */
            .mk-component[data-sync-status="syncing"] {
                position: relative;
                overflow: hidden;
            }
            
            .mk-component[data-sync-status="syncing"]::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 2px;
                background: linear-gradient(90deg, transparent, #3b82f6, transparent);
                animation: loading-bar 2s ease-in-out infinite;
                z-index: 20;
            }
            
            .mk-component[data-sync-status="fresh"] {
                border-left-color: #10b981;
            }
            
            .mk-component[data-sync-status="stale"] {
                border-left-color: #f59e0b;
            }
            
            .mk-component[data-sync-status="error"] {
                border-left-color: #ef4444;
            }
            
            .mk-component[data-sync-status="conflicts"] {
                border-left-color: #8b5cf6;
            }
            
            /* Animations */
            @keyframes success-pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.8; }
            }
            
            @keyframes error-shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-2px); }
                75% { transform: translateX(2px); }
            }
            
            @keyframes loading-bar {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            /* Sync control tooltips */
            .sync-indicator[data-tooltip]:hover::after {
                content: attr(data-tooltip);
                position: absolute;
                bottom: 120%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 6px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                white-space: nowrap;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            
            .sync-indicator[data-tooltip]:hover::before {
                content: '';
                position: absolute;
                bottom: 115%;
                left: 50%;
                transform: translateX(-50%);
                border: 4px solid transparent;
                border-top-color: rgba(0, 0, 0, 0.9);
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Attach sync handlers to component element
     * @param {string} componentId - Component ID
     * @param {HTMLElement} componentElement - Component element
     */
    attachComponentSyncHandlers(componentId, componentElement) {
        // Add context menu for sync options
        componentElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showComponentSyncContextMenu(componentId, e.clientX, e.clientY);
        });

        // Add keyboard shortcuts
        componentElement.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshSingleComponent(componentId);
            }
        });
    }

    /**
     * Show context menu for component sync options
     * @param {string} componentId - Component ID
     * @param {number} x - Mouse X position
     * @param {number} y - Mouse Y position
     */
    showComponentSyncContextMenu(componentId, x, y) {
        // Remove existing context menu
        const existingMenu = document.querySelector('.sync-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'sync-context-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.zIndex = '10000';
        menu.style.background = 'white';
        menu.style.border = '1px solid #e2e8f0';
        menu.style.borderRadius = '8px';
        menu.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        menu.style.padding = '8px 0';
        menu.style.minWidth = '180px';

        const state = this.componentSyncStates.get(componentId);
        const canRefresh = state && state.status !== 'syncing';

        menu.innerHTML = `
            <div class="sync-menu-item ${canRefresh ? '' : 'disabled'}" data-action="refresh">
                <span class="menu-icon">🔄</span>
                <span class="menu-text">Refresh Component</span>
            </div>
            <div class="sync-menu-item" data-action="check">
                <span class="menu-icon">🔍</span>
                <span class="menu-text">Check for Updates</span>
            </div>
            <hr style="margin: 4px 0; border: none; border-top: 1px solid #f1f5f9;">
            <div class="sync-menu-item" data-action="status">
                <span class="menu-icon">📊</span>
                <span class="menu-text">View Sync Status</span>
            </div>
        `;

        // Add menu item styling
        const style = document.createElement('style');
        style.textContent = `
            .sync-menu-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s ease;
            }
            .sync-menu-item:hover:not(.disabled) {
                background-color: #f8fafc;
            }
            .sync-menu-item.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .menu-icon {
                font-size: 12px;
                width: 16px;
            }
        `;
        document.head.appendChild(style);

        // Add event listeners
        menu.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.sync-menu-item');
            if (!menuItem || menuItem.classList.contains('disabled')) {
                return;
            }

            const action = menuItem.dataset.action;
            switch (action) {
                case 'refresh':
                    this.refreshSingleComponent(componentId);
                    break;
                case 'check':
                    this.checkComponentForUpdates(componentId);
                    break;
                case 'status':
                    this.showComponentSyncStatus(componentId);
                    break;
            }

            menu.remove();
            style.remove();
        });

        // Remove menu on outside click
        document.addEventListener('click', function onOutsideClick() {
            menu.remove();
            style.remove();
            document.removeEventListener('click', onOutsideClick);
        });

        document.body.appendChild(menu);
    }

    // Event Handlers

    /**
     * Handle refresh start event
     * @param {Object} data - Event data
     */
    handleRefreshStart(data) {
        this.globalRefreshState.inProgress = true;
        this.updateGlobalSyncStatus('syncing', 'Refreshing data...');

        // Update all component indicators to show syncing state
        this.componentSyncStates.forEach((state, componentId) => {
            this.updateComponentSyncStatus(componentId, 'syncing');
        });

        this.logger.info('SYNC_INTEGRATION', 'Global refresh started', data);
    }

    /**
     * Handle refresh progress event
     * @param {Object} data - Event data
     */
    handleRefreshProgress(data) {
        const message = `${data.message || 'Refreshing...'} (${Math.round(data.percent)}%)`;
        this.updateGlobalSyncStatus('syncing', message);
    }

    /**
     * Handle refresh complete event
     * @param {Object} data - Event data
     */
    handleRefreshComplete(data) {
        this.globalRefreshState.inProgress = false;
        this.globalRefreshState.lastRefresh = Date.now();

        if (data.result?.success) {
            this.updateGlobalSyncStatus('fresh', 'All data refreshed');
            
            // Update component indicators
            const refreshedComponents = data.result.refreshedComponents || [];
            refreshedComponents.forEach(componentId => {
                this.updateComponentSyncStatus(componentId, 'fresh');
                this.updateComponentDataFreshness(componentId, Date.now());
            });

        } else {
            this.updateGlobalSyncStatus('error', 'Refresh failed');
        }

        // Reset all other components to idle
        this.componentSyncStates.forEach((state, componentId) => {
            if (!data.result?.refreshedComponents?.includes(componentId)) {
                this.updateComponentSyncStatus(componentId, 'idle');
            }
        });

        this.logger.info('SYNC_INTEGRATION', 'Global refresh completed', data);
    }

    /**
     * Handle refresh error event
     * @param {Object} data - Event data
     */
    handleRefreshError(data) {
        this.globalRefreshState.inProgress = false;
        this.updateGlobalSyncStatus('error', 'Refresh error');

        // Update all components to error state
        this.componentSyncStates.forEach((state, componentId) => {
            this.updateComponentSyncStatus(componentId, 'error');
        });

        this.logger.warn('SYNC_INTEGRATION', 'Refresh error', data);
    }

    /**
     * Handle component refresh complete event
     * @param {Object} data - Event data
     */
    handleComponentRefreshComplete(data) {
        const { componentId } = data;
        if (componentId) {
            this.updateComponentSyncStatus(componentId, 'fresh');
            this.updateComponentDataFreshness(componentId, Date.now());
        }
    }

    /**
     * Handle fresh data available event
     * @param {Object} data - Event data
     */
    handleFreshDataAvailable(data) {
        this.updateGlobalSyncStatus('stale', 'Fresh data available');
        
        // Mark affected components as stale
        if (data.changedComponents) {
            data.changedComponents.forEach(componentType => {
                this.markComponentTypeAsStale(componentType);
            });
        }
    }

    /**
     * Handle data updated event
     * @param {Object} data - Event data
     */
    handleDataUpdated(data) {
        this.globalRefreshState.lastRefresh = Date.now();
        this.updateGlobalSyncStatus('fresh', 'Data updated');

        // Update all components to fresh state
        this.componentSyncStates.forEach((state, componentId) => {
            this.updateComponentSyncStatus(componentId, 'fresh');
            this.updateComponentDataFreshness(componentId, Date.now());
        });
    }

    // Update Methods

    /**
     * Update global sync status
     * @param {string} status - Sync status
     * @param {string} message - Status message
     */
    updateGlobalSyncStatus(status, message) {
        const globalStatus = document.querySelector('.global-sync-status');
        if (!globalStatus) return;

        const indicator = globalStatus.querySelector('.sync-status-indicator');
        const text = globalStatus.querySelector('.sync-status-text');

        if (indicator) {
            indicator.className = `sync-status-indicator ${status}`;
        }

        if (text) {
            text.textContent = message;
        }
    }

    /**
     * Update component sync status
     * @param {string} componentId - Component ID
     * @param {string} status - Sync status
     */
    updateComponentSyncStatus(componentId, status) {
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) return;

        const syncIndicator = componentElement.querySelector('.sync-indicator');
        if (syncIndicator) {
            syncIndicator.className = `sync-indicator ${status}`;
            syncIndicator.setAttribute('data-tooltip', this.getStatusTooltip(status));
        }

        // Update component state attribute
        componentElement.setAttribute('data-sync-status', status);

        // Update internal state
        const state = this.componentSyncStates.get(componentId);
        if (state) {
            state.status = status;
            if (status === 'fresh') {
                state.lastSync = Date.now();
            }
        }
    }

    /**
     * Update component data freshness
     * @param {string} componentId - Component ID
     * @param {number} timestamp - Timestamp
     */
    updateComponentDataFreshness(componentId, timestamp) {
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) return;

        const freshnessIndicator = componentElement.querySelector('.data-freshness');
        if (freshnessIndicator) {
            const timeAgo = this.getTimeAgo(timestamp);
            freshnessIndicator.textContent = timeAgo;
            
            // Update freshness class based on age
            const age = Date.now() - timestamp;
            const ageClass = this.getFreshnessClass(age);
            freshnessIndicator.className = `data-freshness ${ageClass}`;
        }

        // Update internal state
        const state = this.componentSyncStates.get(componentId);
        if (state) {
            state.lastSync = timestamp;
        }
    }

    /**
     * Mark component type as stale
     * @param {string} componentType - Component type
     */
    markComponentTypeAsStale(componentType) {
        // Find all components of this type
        const stateManager = window.enhancedStateManager;
        if (!stateManager) return;

        const components = stateManager.getComponents();
        components.forEach(component => {
            if (component.type === componentType) {
                this.updateComponentSyncStatus(component.id, 'stale');
            }
        });
    }

    // Action Methods

    /**
     * Refresh single component
     * @param {string} componentId - Component ID
     */
    async refreshSingleComponent(componentId) {
        if (!window.mkcgDataRefreshManager) {
            this.logger.warn('SYNC_INTEGRATION', 'Refresh manager not available');
            return;
        }

        try {
            this.updateComponentSyncStatus(componentId, 'syncing');

            const result = await window.mkcgDataRefreshManager.refreshComponent(componentId, {
                showProgress: true,
                conflictResolution: 'prompt'
            });

            if (result.success) {
                this.updateComponentSyncStatus(componentId, 'fresh');
                this.updateComponentDataFreshness(componentId, Date.now());
            } else {
                this.updateComponentSyncStatus(componentId, 'error');
            }

        } catch (error) {
            this.logger.error('SYNC_INTEGRATION', 'Component refresh failed', error);
            this.updateComponentSyncStatus(componentId, 'error');
        }
    }

    /**
     * Check component for updates
     * @param {string} componentId - Component ID
     */
    async checkComponentForUpdates(componentId) {
        if (!window.mkcgDataRefreshManager) {
            return;
        }

        try {
            this.updateComponentSyncStatus(componentId, 'checking');

            // This would be a lighter check operation
            const hasUpdates = await this.checkComponentHasUpdates(componentId);
            
            if (hasUpdates) {
                this.updateComponentSyncStatus(componentId, 'stale');
            } else {
                this.updateComponentSyncStatus(componentId, 'fresh');
            }

        } catch (error) {
            this.logger.error('SYNC_INTEGRATION', 'Component update check failed', error);
            this.updateComponentSyncStatus(componentId, 'error');
        }
    }

    /**
     * Check if component has updates (placeholder)
     * @param {string} componentId - Component ID
     * @returns {Promise<boolean>} True if has updates
     */
    async checkComponentHasUpdates(componentId) {
        // This would implement a lightweight check
        // For now, return false as placeholder
        return false;
    }

    /**
     * Show component sync status
     * @param {string} componentId - Component ID
     */
    showComponentSyncStatus(componentId) {
        const state = this.componentSyncStates.get(componentId);
        if (!state) return;

        const component = window.enhancedStateManager?.getComponent(componentId);
        const componentType = component?.type || 'Unknown';

        const statusInfo = {
            'Component': componentType,
            'Status': state.status,
            'Last Sync': state.lastSync ? new Date(state.lastSync).toLocaleString() : 'Never',
            'Last Check': state.lastCheck ? new Date(state.lastCheck).toLocaleString() : 'Never',
            'Has Changes': state.hasChanges ? 'Yes' : 'No',
            'Quality Score': state.qualityScore,
            'Conflicts': state.conflicts
        };

        const message = Object.entries(statusInfo)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        alert(`Sync Status for ${componentType}\n\n${message}`);
    }

    /**
     * Cleanup component sync indicator
     * @param {string} componentId - Component ID
     */
    cleanupComponentSyncIndicator(componentId) {
        this.componentSyncStates.delete(componentId);
    }

    // Utility Methods

    /**
     * Get status tooltip text
     * @param {string} status - Status
     * @returns {string} Tooltip text
     */
    getStatusTooltip(status) {
        const tooltips = {
            'idle': 'Click to refresh component',
            'checking': 'Checking for updates...',
            'syncing': 'Refreshing component...',
            'fresh': 'Component is up to date',
            'stale': 'Fresh data available - click to refresh',
            'error': 'Refresh failed - click to retry',
            'conflicts': 'Data conflicts detected'
        };
        
        return tooltips[status] || 'Unknown status';
    }

    /**
     * Get time ago string
     * @param {number} timestamp - Timestamp
     * @returns {string} Time ago string
     */
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    /**
     * Get freshness CSS class based on age
     * @param {number} age - Age in milliseconds
     * @returns {string} CSS class
     */
    getFreshnessClass(age) {
        const hours = age / 3600000;
        
        if (hours < 1) return 'fresh';
        if (hours < 24) return 'stale';
        return 'very-stale';
    }

    /**
     * Get sync integration statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            componentCount: this.componentSyncStates.size,
            globalRefreshState: this.globalRefreshState,
            componentStates: Object.fromEntries(this.componentSyncStates)
        };
    }

    /**
     * Destroy integration
     */
    destroy() {
        // Remove event listeners
        this.eventBus.off('refresh:start');
        this.eventBus.off('refresh:progress');
        this.eventBus.off('refresh:complete');
        this.eventBus.off('refresh:error');
        this.eventBus.off('refresh:component-complete');
        this.eventBus.off('refresh:fresh-data-available');
        this.eventBus.off('refresh:data-updated');

        // Clear state
        this.componentSyncStates.clear();

        // Remove CSS
        const css = document.getElementById('task5-sync-integration-css');
        if (css) {
            css.remove();
        }

        this.logger.info('SYNC_INTEGRATION', 'Task 5 Sync Indicator Integration destroyed');
    }
}

// Create and export integration instance
const task5SyncIntegration = new Task5SyncIndicatorIntegration();

// Make available globally
window.task5SyncIntegration = task5SyncIntegration;

export { task5SyncIntegration as default, Task5SyncIndicatorIntegration };
