/**
 * @file task5-integration.js
 * @description Task 5 Complete Integration - Data Refresh and Synchronization Controls
 * 
 * Phase 2.3 - Task 5: Final Integration Script
 * 
 * This file imports and initializes all Task 5 components:
 * - MKCGDataRefreshManager
 * - DataConflictResolver
 * - Task5SyncIndicatorIntegration
 * 
 * It provides a unified interface for the refresh and synchronization system.
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { eventBus } from './event-bus.js';

// Import Task 5 components
import mkcgDataRefreshManager from './mkcg-data-refresh-manager.js';
import { DataConflictResolver } from './data-conflict-resolver.js';
import task5SyncIntegration from './task5-sync-indicator-integration.js';

/**
 * Task 5 Integration Manager
 * Coordinates all data refresh and synchronization functionality
 */
class Task5Integration {
    constructor() {
        this.logger = structuredLogger;
        this.eventBus = eventBus;
        
        // Integration state
        this.initialized = false;
        this.components = {
            refreshManager: {
                instance: null,
                available: false,
                ready: false
            },
            conflictResolver: {
                instance: null,
                available: false,
                ready: false
            },
            syncIntegration: {
                instance: null,
                available: false,
                ready: false
            }
        };
        
        // Configuration
        this.config = {
            enableAutoRefresh: true,
            enableConflictResolution: true,
            enableSyncIndicators: true,
            debugMode: false
        };
        
        // Statistics
        this.stats = {
            refreshOperations: 0,
            conflictsResolved: 0,
            syncStatusUpdates: 0,
            errors: 0,
            lastOperation: null
        };
        
        this.logger.info('TASK5_INTEGRATION', 'Task 5 Integration Manager created');
        
        // Initialize immediately
        this.initialize();
    }

    /**
     * Initialize Task 5 integration
     */
    async initialize() {
        if (this.initialized) {
            this.logger.warn('TASK5_INTEGRATION', 'Already initialized');
            return;
        }

        this.logger.info('TASK5_INTEGRATION', 'Initializing Task 5 Data Refresh and Synchronization Controls');

        try {
            // Step 1: Initialize MKCG Data Refresh Manager
            await this.initializeRefreshManager();
            
            // Step 2: Initialize Data Conflict Resolver
            await this.initializeConflictResolver();
            
            // Step 3: Initialize Sync Indicator Integration
            await this.initializeSyncIntegration();
            
            // Step 4: Connect components together
            await this.connectComponents();
            
            // Step 5: Set up global interfaces
            this.setupGlobalInterfaces();
            
            // Step 6: Initialize event handlers
            this.setupEventHandlers();
            
            this.initialized = true;
            
            this.logger.info('TASK5_INTEGRATION', 'Task 5 integration completed successfully', {
                refreshManager: this.components.refreshManager.ready,
                conflictResolver: this.components.conflictResolver.ready,
                syncIntegration: this.components.syncIntegration.ready
            });
            
            // Emit integration ready event
            this.eventBus.emit('task5:integration-ready', {
                timestamp: Date.now(),
                components: this.getComponentStatus(),
                config: this.config
            });
            
        } catch (error) {
            this.logger.error('TASK5_INTEGRATION', 'Failed to initialize Task 5 integration', error);
            this.stats.errors++;
            throw error;
        }
    }

    /**
     * Initialize MKCG Data Refresh Manager
     */
    async initializeRefreshManager() {
        try {
            this.logger.info('TASK5_INTEGRATION', 'Initializing MKCG Data Refresh Manager');
            
            // The refresh manager should already be available from import
            if (mkcgDataRefreshManager) {
                this.components.refreshManager.instance = mkcgDataRefreshManager;
                this.components.refreshManager.available = true;
                
                // Inject conflict resolver when it's ready
                if (this.components.conflictResolver.instance) {
                    mkcgDataRefreshManager.setConflictResolver(this.components.conflictResolver.instance);
                }
                
                this.components.refreshManager.ready = true;
                this.logger.info('TASK5_INTEGRATION', 'MKCG Data Refresh Manager ready');
            } else {
                throw new Error('MKCG Data Refresh Manager not available');
            }
            
        } catch (error) {
            this.logger.error('TASK5_INTEGRATION', 'Failed to initialize refresh manager', error);
            throw error;
        }
    }

    /**
     * Initialize Data Conflict Resolver
     */
    async initializeConflictResolver() {
        try {
            this.logger.info('TASK5_INTEGRATION', 'Initializing Data Conflict Resolver');
            
            // Create conflict resolver instance
            this.components.conflictResolver.instance = new DataConflictResolver();
            this.components.conflictResolver.available = true;
            this.components.conflictResolver.ready = true;
            
            this.logger.info('TASK5_INTEGRATION', 'Data Conflict Resolver ready');
            
        } catch (error) {
            this.logger.error('TASK5_INTEGRATION', 'Failed to initialize conflict resolver', error);
            throw error;
        }
    }

    /**
     * Initialize Sync Indicator Integration
     */
    async initializeSyncIntegration() {
        try {
            this.logger.info('TASK5_INTEGRATION', 'Initializing Sync Indicator Integration');
            
            // The sync integration should already be available from import
            if (task5SyncIntegration) {
                this.components.syncIntegration.instance = task5SyncIntegration;
                this.components.syncIntegration.available = true;
                this.components.syncIntegration.ready = true;
                
                this.logger.info('TASK5_INTEGRATION', 'Sync Indicator Integration ready');
            } else {
                throw new Error('Sync Indicator Integration not available');
            }
            
        } catch (error) {
            this.logger.error('TASK5_INTEGRATION', 'Failed to initialize sync integration', error);
            throw error;
        }
    }

    /**
     * Connect components together
     */
    async connectComponents() {
        try {
            this.logger.info('TASK5_INTEGRATION', 'Connecting Task 5 components');
            
            // Inject conflict resolver into refresh manager
            if (this.components.refreshManager.instance && this.components.conflictResolver.instance) {
                this.components.refreshManager.instance.setConflictResolver(
                    this.components.conflictResolver.instance
                );
                this.logger.info('TASK5_INTEGRATION', 'Conflict resolver injected into refresh manager');
            }
            
            // Set up cross-component communication through event bus
            this.setupCrossComponentCommunication();
            
            this.logger.info('TASK5_INTEGRATION', 'Components connected successfully');
            
        } catch (error) {
            this.logger.error('TASK5_INTEGRATION', 'Failed to connect components', error);
            throw error;
        }
    }

    /**
     * Set up cross-component communication
     */
    setupCrossComponentCommunication() {
        // Listen for refresh events to update sync indicators
        this.eventBus.on('refresh:start', (data) => {
            this.stats.refreshOperations++;
            this.stats.lastOperation = 'refresh_start';
        });

        this.eventBus.on('refresh:complete', (data) => {
            this.stats.lastOperation = 'refresh_complete';
        });

        this.eventBus.on('conflict:resolved', (data) => {
            this.stats.conflictsResolved++;
            this.stats.lastOperation = 'conflict_resolved';
        });

        this.eventBus.on('sync:status-updated', (data) => {
            this.stats.syncStatusUpdates++;
            this.stats.lastOperation = 'sync_updated';
        });
    }

    /**
     * Set up global interfaces for Task 5
     */
    setupGlobalInterfaces() {
        // Main Task 5 interface
        window.task5 = {
            // Refresh operations
            refreshAll: (options) => this.refreshAllData(options),
            refreshComponent: (componentId, options) => this.refreshComponent(componentId, options),
            checkFresh: (options) => this.checkForFreshData(options),
            
            // Component status
            getComponentStatus: (componentId) => this.getComponentSyncStatus(componentId),
            getAllComponentStatus: () => this.getAllComponentStatus(),
            
            // Conflict resolution
            resolveConflicts: (conflicts, options) => this.resolveConflicts(conflicts, options),
            
            // Integration management
            getStatus: () => this.getStatus(),
            getStats: () => this.getStats(),
            debug: () => this.debug(),
            help: () => this.help(),
            
            // Configuration
            setConfig: (config) => this.setConfig(config),
            getConfig: () => this.getConfig()
        };
        
        // Integration status interface
        window.task5Integration = this;
        
        this.logger.info('TASK5_INTEGRATION', 'Global interfaces set up');
    }

    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Listen for state manager events
        this.eventBus.on('state:component-add', (data) => {
            // Initialize sync indicators for new components
            if (this.components.syncIntegration.instance) {
                setTimeout(() => {
                    this.components.syncIntegration.instance.initializeComponentSyncIndicator(data.payload.id);
                }, 100);
            }
        });

        // Listen for MKCG data changes
        this.eventBus.on('mkcg:data-updated', (data) => {
            // Trigger refresh checks
            if (this.config.enableAutoRefresh && this.components.refreshManager.instance) {
                this.components.refreshManager.instance.checkForFreshDataSilent();
            }
        });

        this.logger.info('TASK5_INTEGRATION', 'Event handlers set up');
    }

    // Public API Methods

    /**
     * Refresh all MKCG data
     * @param {Object} options - Refresh options
     * @returns {Promise<Object>} Refresh result
     */
    async refreshAllData(options = {}) {
        if (!this.components.refreshManager.ready) {
            throw new Error('Refresh manager not ready');
        }

        try {
            const result = await this.components.refreshManager.instance.refreshAllData(options);
            this.stats.refreshOperations++;
            return result;
        } catch (error) {
            this.stats.errors++;
            throw error;
        }
    }

    /**
     * Refresh specific component
     * @param {string} componentId - Component ID
     * @param {Object} options - Refresh options
     * @returns {Promise<Object>} Refresh result
     */
    async refreshComponent(componentId, options = {}) {
        if (!this.components.refreshManager.ready) {
            throw new Error('Refresh manager not ready');
        }

        try {
            const result = await this.components.refreshManager.instance.refreshComponent(componentId, options);
            this.stats.refreshOperations++;
            return result;
        } catch (error) {
            this.stats.errors++;
            throw error;
        }
    }

    /**
     * Check for fresh data
     * @param {Object} options - Check options
     * @returns {Promise<Object>} Check result
     */
    async checkForFreshData(options = {}) {
        if (!this.components.refreshManager.ready) {
            throw new Error('Refresh manager not ready');
        }

        try {
            const result = await this.components.refreshManager.instance.checkForFreshData(options);
            return result;
        } catch (error) {
            this.stats.errors++;
            throw error;
        }
    }

    /**
     * Resolve conflicts
     * @param {Array} conflicts - Conflicts to resolve
     * @param {Object} options - Resolution options
     * @returns {Promise<Object>} Resolution result
     */
    async resolveConflicts(conflicts, options = {}) {
        if (!this.components.conflictResolver.ready) {
            throw new Error('Conflict resolver not ready');
        }

        try {
            const result = await this.components.conflictResolver.instance.resolveConflicts(conflicts, options);
            this.stats.conflictsResolved++;
            return result;
        } catch (error) {
            this.stats.errors++;
            throw error;
        }
    }

    /**
     * Get component sync status
     * @param {string} componentId - Component ID
     * @returns {Object} Component status
     */
    getComponentSyncStatus(componentId) {
        if (!this.components.syncIntegration.ready) {
            return { error: 'Sync integration not ready' };
        }

        return this.components.syncIntegration.instance.componentSyncStates.get(componentId) || null;
    }

    /**
     * Get all component status
     * @returns {Object} All component statuses
     */
    getAllComponentStatus() {
        if (!this.components.syncIntegration.ready) {
            return { error: 'Sync integration not ready' };
        }

        return Object.fromEntries(this.components.syncIntegration.instance.componentSyncStates);
    }

    /**
     * Get integration status
     * @returns {Object} Integration status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            components: this.getComponentStatus(),
            config: this.config,
            stats: this.stats
        };
    }

    /**
     * Get component status
     * @returns {Object} Component status
     */
    getComponentStatus() {
        return {
            refreshManager: {
                available: this.components.refreshManager.available,
                ready: this.components.refreshManager.ready,
                stats: this.components.refreshManager.instance?.getRefreshStats?.()
            },
            conflictResolver: {
                available: this.components.conflictResolver.available,
                ready: this.components.conflictResolver.ready,
                stats: this.components.conflictResolver.instance?.getStats?.()
            },
            syncIntegration: {
                available: this.components.syncIntegration.available,
                ready: this.components.syncIntegration.ready,
                stats: this.components.syncIntegration.instance?.getStats?.()
            }
        };
    }

    /**
     * Get integration statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            ...this.stats,
            components: {
                refreshManager: this.components.refreshManager.instance?.getRefreshStats?.() || {},
                conflictResolver: this.components.conflictResolver.instance?.getStats?.() || {},
                syncIntegration: this.components.syncIntegration.instance?.getStats?.() || {}
            }
        };
    }

    /**
     * Set configuration
     * @param {Object} config - Configuration updates
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
        this.logger.info('TASK5_INTEGRATION', 'Configuration updated', this.config);
        
        // Apply configuration to components
        if (this.components.refreshManager.instance && config.refreshConfig) {
            Object.assign(this.components.refreshManager.instance.config, config.refreshConfig);
        }
    }

    /**
     * Get current configuration
     * @returns {Object} Current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Debug Task 5 integration
     */
    debug() {
        console.group('🔄 Task 5 Integration Debug');
        
        console.log('📊 Integration Status:', this.getStatus());
        console.log('📈 Statistics:', this.getStats());
        console.log('⚙️ Configuration:', this.config);
        
        if (this.components.refreshManager.ready) {
            console.log('🔄 Refresh Manager:', this.components.refreshManager.instance.getRefreshStats());
        }
        
        if (this.components.conflictResolver.ready) {
            console.log('🔀 Conflict Resolver:', this.components.conflictResolver.instance.getStats());
        }
        
        if (this.components.syncIntegration.ready) {
            console.log('🔗 Sync Integration:', this.components.syncIntegration.instance.getStats());
        }
        
        console.log('🌐 Global Interfaces:', {
            task5: !!window.task5,
            task5Integration: !!window.task5Integration,
            mkcgDataRefreshManager: !!window.mkcgDataRefreshManager,
            DataConflictResolver: !!window.DataConflictResolver,
            task5SyncIntegration: !!window.task5SyncIntegration
        });
        
        console.groupEnd();
    }

    /**
     * Show Task 5 help
     */
    help() {
        console.log('🔄 Task 5: Data Refresh and Synchronization Controls Help\n');
        
        console.log('📋 Available Commands:');
        console.log('  task5.refreshAll()              - Refresh all MKCG data');
        console.log('  task5.refreshComponent(id)      - Refresh specific component');
        console.log('  task5.checkFresh()              - Check for fresh data');
        console.log('  task5.getComponentStatus(id)    - Get component sync status');
        console.log('  task5.getAllComponentStatus()   - Get all component statuses');
        console.log('  task5.resolveConflicts(conflicts) - Resolve data conflicts');
        console.log('  task5.getStatus()               - Get integration status');
        console.log('  task5.getStats()                - Get statistics');
        console.log('  task5.debug()                   - Show debug information');
        console.log('  task5.help()                    - Show this help\n');
        
        console.log('⚙️ Configuration:');
        console.log('  task5.setConfig(config)         - Update configuration');
        console.log('  task5.getConfig()               - Get current configuration\n');
        
        console.log('🔧 Component Access:');
        console.log('  window.mkcgDataRefreshManager   - Direct access to refresh manager');
        console.log('  window.DataConflictResolver     - Conflict resolver class');
        console.log('  window.task5SyncIntegration     - Sync integration instance\n');
        
        console.log('📊 UI Features:');
        console.log('  • Real-time sync indicators on components');
        console.log('  • Automatic fresh data notifications');
        console.log('  • Interactive conflict resolution modals');
        console.log('  • Dashboard refresh controls');
        console.log('  • Component-level refresh context menus\n');
        
        console.log('💡 Usage Examples:');
        console.log('  // Refresh all data with progress');
        console.log('  await task5.refreshAll({ showProgress: true });\n');
        
        console.log('  // Check for fresh data without user notification');
        console.log('  const result = await task5.checkFresh({ notifyUser: false });\n');
        
        console.log('  // Get component sync status');
        console.log('  const status = task5.getComponentStatus("hero-component-1");\n');
    }

    /**
     * Destroy Task 5 integration
     */
    destroy() {
        // Clean up components
        if (this.components.refreshManager.instance?.destroy) {
            this.components.refreshManager.instance.destroy();
        }
        
        if (this.components.syncIntegration.instance?.destroy) {
            this.components.syncIntegration.instance.destroy();
        }
        
        // Remove global interfaces
        delete window.task5;
        delete window.task5Integration;
        
        // Clear state
        this.initialized = false;
        this.components = {};
        
        this.logger.info('TASK5_INTEGRATION', 'Task 5 integration destroyed');
    }
}

// Create and export integration instance
const task5Integration = new Task5Integration();

// Make available globally
window.task5Integration = task5Integration;

// Log integration availability
console.log('🔄 Task 5: Data Refresh and Synchronization Controls loaded');
console.log('📚 Type task5.help() for available commands');

export { task5Integration as default, Task5Integration };
