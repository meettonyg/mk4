/**
 * @file mkcg-data-refresh-manager.js
 * @description MKCG Data Refresh Manager - Handles data synchronization and refresh operations
 * 
 * Phase 2.3 - Task 5: Data Refresh and Synchronization Controls
 * 
 * Core responsibilities:
 * - Check for fresh MKCG data with timestamp comparison
 * - Download and validate fresh data from server
 * - Detect conflicts between local changes and fresh data
 * - Queue refresh operations with progress tracking
 * - Integrate with existing Task 3 sync indicators
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { eventBus } from './event-bus.js';
import { showToast } from '../utils/toast-polyfill.js';

/**
 * MKCG Data Refresh Manager
 * Orchestrates all data refresh and synchronization operations
 */
class MKCGDataRefreshManager {
    constructor() {
        this.refreshQueue = [];
        this.isRefreshing = false;
        this.lastRefreshCheck = null;
        this.refreshInterval = null;
        this.conflictResolver = null; // Will be injected
        this.logger = structuredLogger;
        this.eventBus = eventBus;
        
        // Configuration
        this.config = {
            autoCheckInterval: 300000, // 5 minutes
            refreshTimeout: 30000, // 30 seconds
            maxRetries: 3,
            batchSize: 5,
            conflictResolution: 'prompt' // 'prompt', 'prefer-fresh', 'prefer-local', 'merge'
        };
        
        // State tracking
        this.refreshState = {
            inProgress: false,
            totalComponents: 0,
            completedComponents: 0,
            failedComponents: [],
            conflicts: [],
            startTime: null,
            currentOperation: null
        };
        
        // Data cache for conflict detection
        this.dataCache = new Map();
        this.timestampCache = new Map();
        
        this.logger.info('REFRESH', 'MKCG Data Refresh Manager initialized');
        
        // Initialize automatic checks if MKCG data is available
        this.initializeAutoChecks();
    }
    
    /**
     * ROOT FIX: Direct test of the failing endpoint
     */
    async testFreshnessEndpoint() {
            console.log('🔍 Testing freshness endpoint directly...');
            
            const postId = window.guestifyData?.postId || 32372;
            const nonce = window.guestifyData?.nonce || '';
            const timestamp = Date.now();
            
            console.log('Test parameters:', { postId, nonce, timestamp });
            
            try {
                const response = await fetch('/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'gmkb_check_mkcg_freshness',
                        post_id: postId,
                        client_timestamp: timestamp,
                        nonce: nonce
                    })
                });
                
                console.log('Direct response status:', response.status);
                console.log('Direct response OK:', response.ok);
                
                if (!response.ok) {
                    const responseText = await response.text();
                    console.error('Direct HTTP Error:', response.status, responseText.substring(0, 500));
                    return { success: false, error: `HTTP ${response.status}`, responseText: responseText.substring(0, 500) };
                }
                
                const result = await response.json();
                console.log('✅ Direct freshness test result:', result);
                return result;
                
            } catch (error) {
                console.error('❌ Direct freshness test failed:', error);
                return { success: false, error: error.message, type: 'direct-test' };
            }
        }

    /**
     * Initialize automatic data freshness checks
     */
    initializeAutoChecks() {
        // Check if MKCG integration is available and properly configured
        const hasAjaxEndpoint = window.guestifyData?.ajaxurl && window.guestifyData?.nonce;
        const hasMKCGData = window.guestifyData?.mkcgData && window.guestifyData?.postId;
        const hasTimestamp = window.guestifyData?.mkcgData?.meta_info?.extraction_timestamp;
        
        if (hasAjaxEndpoint && hasMKCGData && hasTimestamp) {
            this.setupAutoRefreshChecks();
            this.logger.info('REFRESH', 'Auto-refresh checks enabled', {
                postId: window.guestifyData.postId,
                interval: this.config.autoCheckInterval
            });
        } else {
            this.logger.debug('REFRESH', 'Auto-refresh checks disabled', {
                hasAjaxEndpoint,
                hasMKCGData,
                hasTimestamp
            });
        }
    }

    /**
     * Set up automatic refresh checks
     */
    setupAutoRefreshChecks() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Set up new interval
        this.refreshInterval = setInterval(() => {
            this.checkForFreshDataSilent();
        }, this.config.autoCheckInterval);
        
        // Initial check
        setTimeout(() => this.checkForFreshDataSilent(), 5000); // Check after 5 seconds
    }

    /**
     * Check for fresh MKCG data (with user feedback)
     * @param {Object} options - Check options
     * @returns {Promise<Object>} Check results
     */
    async checkForFreshData(options = {}) {
        const {
            showProgress = true,
            notifyUser = true
        } = options;

        this.logger.info('REFRESH', 'Checking for fresh MKCG data', { showProgress, notifyUser });

        try {
            if (showProgress) {
                this.showCheckingStatus();
            }

            const result = await this.performFreshnessCheck();
            
            if (notifyUser) {
                this.handleFreshnessCheckResult(result);
            }

            return result;

        } catch (error) {
            this.logger.error('REFRESH', 'Error checking for fresh data', error);
            
            if (notifyUser) {
                showToast('Error checking for fresh data: ' + error.message, 'error');
            }
            
            return { success: false, error: error.message };
        } finally {
            if (showProgress) {
                this.hideCheckingStatus();
            }
        }
    }

    /**
     * Check for fresh data silently (for auto-checks)
     * @returns {Promise<Object>} Check results
     */
    async checkForFreshDataSilent() {
        try {
            // Check if AJAX endpoints are available first
            if (!window.guestifyData?.ajaxurl || !window.guestifyData?.nonce) {
                this.logger.debug('REFRESH', 'AJAX endpoints not available, skipping freshness check');
                return { success: false, error: 'AJAX not available' };
            }
            
            const result = await this.performFreshnessCheck();
            
            // Only notify if fresh data is available
            if (result.hasFreshData) {
                this.eventBus.emit('refresh:fresh-data-available', {
                    postId: result.postId,
                    serverTimestamp: result.serverTimestamp,
                    clientTimestamp: result.clientTimestamp,
                    changedComponents: result.changedComponents
                });
                
                // Show subtle notification
                this.showFreshDataNotification(result.changedComponents.length);
            }
            
            return result;
            
        } catch (error) {
            this.logger.debug('REFRESH', 'Silent freshness check failed', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Perform the actual freshness check
     * @returns {Promise<Object>} Check results
     */
    async performFreshnessCheck() {
        const postId = window.guestifyData?.postId;
        if (!postId) {
            throw new Error('No post ID available for freshness check');
        }

        // ROOT FIX: Simple validation - just check if MKCG data exists
        const mkcgData = window.guestifyData?.mkcgData;
        if (!mkcgData) {
            this.logger.debug('REFRESH', 'No MKCG data available, skipping check');
            throw new Error('MKCG data structure is incomplete.\n\nSOLUTION: Re-generate MKCG content:\n🔄 Quick fix:\n1. Go to Media Content Generator\n2. Re-generate content for post ID ' + postId + '\n3. Ensure all content types are generated\n4. Save and return here\nThis will ensure proper data structure with timestamps.');
        }

        // Get current MKCG data timestamp (with fallback to current time)
        const clientTimestamp = mkcgData.meta_info?.extraction_timestamp || 
                               mkcgData.freshness?.extraction_timestamp || 
                               Date.now();

        this.logger.info('REFRESH', 'Making AJAX request for freshness check', {
            postId,
            clientTimestamp,
            ajaxUrl: window.guestifyData?.ajaxurl,
            hasNonce: !!window.guestifyData?.nonce
        });

        try {
            // Make AJAX request to check server timestamp
            const response = await this.makeAjaxRequest('check_mkcg_freshness', {
                post_id: postId,
                client_timestamp: clientTimestamp
            });

            const serverTimestamp = response.server_timestamp;
            const hasFreshData = serverTimestamp > clientTimestamp;
            
            // Store results
            this.lastRefreshCheck = Date.now();
            this.timestampCache.set(postId, {
                client: clientTimestamp,
                server: serverTimestamp,
                checked: this.lastRefreshCheck
            });

            const result = {
                success: true,
                postId,
                clientTimestamp,
                serverTimestamp,
                hasFreshData,
                timeDifference: serverTimestamp - clientTimestamp,
                changedComponents: response.changed_components || []
            };

            this.logger.info('REFRESH', 'Freshness check completed', result);
            return result;
        } catch (ajaxError) {
            this.logger.error('REFRESH', 'AJAX request failed', {
                error: ajaxError.message,
                stack: ajaxError.stack,
                postId,
                clientTimestamp
            });
            throw new Error(`AJAX request failed: ${ajaxError.message}`);
        }
    }

    /**
     * Refresh all MKCG data
     * @param {Object} options - Refresh options
     * @returns {Promise<Object>} Refresh results
     */
    async refreshAllData(options = {}) {
        const {
            showProgress = true,
            conflictResolution = this.config.conflictResolution,
            validateQuality = true
        } = options;

        if (this.isRefreshing) {
            this.logger.warn('REFRESH', 'Refresh already in progress');
            return { success: false, reason: 'already-refreshing' };
        }

        this.logger.info('REFRESH', 'Starting full data refresh', options);

        try {
            this.isRefreshing = true;
            this.resetRefreshState();
            
            if (showProgress) {
                this.showRefreshProgress(0, 'Preparing refresh...');
            }

            // Emit refresh start event
            this.eventBus.emit('refresh:start', {
                type: 'full',
                options,
                timestamp: Date.now()
            });

            // Step 1: Check for fresh data
            this.updateRefreshProgress(10, 'Checking for fresh data...');
            const freshnessCheck = await this.performFreshnessCheck();
            
            if (!freshnessCheck.hasFreshData) {
                this.completeRefresh(showProgress);
                return {
                    success: true,
                    reason: 'no-fresh-data',
                    message: 'Your data is already up to date'
                };
            }

            // Step 2: Download fresh data
            this.updateRefreshProgress(30, 'Downloading fresh data...');
            const freshData = await this.downloadFreshData();

            // Step 3: Detect conflicts
            this.updateRefreshProgress(50, 'Analyzing conflicts...');
            const conflicts = await this.detectAllConflicts(freshData);

            // Step 4: Handle conflicts
            if (conflicts.length > 0) {
                this.updateRefreshProgress(60, 'Resolving conflicts...');
                const resolutionResult = await this.handleConflicts(conflicts, conflictResolution);
                
                if (!resolutionResult.success) {
                    throw new Error('Conflict resolution failed: ' + resolutionResult.reason);
                }
            }

            // Step 5: Apply fresh data
            this.updateRefreshProgress(80, 'Applying fresh data...');
            const applyResult = await this.applyFreshData(freshData, conflicts);

            // Step 6: Update components
            this.updateRefreshProgress(95, 'Updating components...');
            await this.updateAllComponents(freshData);

            // Complete refresh
            this.updateRefreshProgress(100, 'Refresh completed successfully!');
            this.completeRefresh(showProgress);

            const result = {
                success: true,
                refreshedComponents: applyResult.updatedComponents,
                conflictsResolved: conflicts.length,
                duration: Date.now() - this.refreshState.startTime
            };

            // Emit completion event
            this.eventBus.emit('refresh:complete', {
                type: 'full',
                result,
                conflicts: conflicts.length
            });

            // Show success notification
            showToast(`Data refreshed successfully! Updated ${applyResult.updatedComponents.length} components.`, 'success');

            this.logger.info('REFRESH', 'Full refresh completed successfully', result);
            return result;

        } catch (error) {
            this.logger.error('REFRESH', 'Full refresh failed', error);
            
            this.eventBus.emit('refresh:error', {
                type: 'full',
                error: error.message,
                state: this.refreshState
            });

            if (showProgress) {
                this.showRefreshError(error.message);
            }
            
            showToast('Refresh failed: ' + error.message, 'error');
            return { success: false, error: error.message };

        } finally {
            this.isRefreshing = false;
            if (showProgress) {
                setTimeout(() => this.hideRefreshProgress(), 2000);
            }
        }
    }

    /**
     * Refresh specific component data
     * @param {string} componentId - Component ID to refresh
     * @param {Object} options - Refresh options
     * @returns {Promise<Object>} Refresh results
     */
    async refreshComponent(componentId, options = {}) {
        const {
            showProgress = true,
            conflictResolution = 'prompt'
        } = options;

        this.logger.info('REFRESH', 'Starting component refresh', { componentId, options });

        try {
            // Get component from state
            const component = window.enhancedStateManager?.getComponent(componentId);
            if (!component) {
                throw new Error(`Component ${componentId} not found`);
            }

            const componentType = component.type;

            if (showProgress) {
                this.showComponentRefreshProgress(componentId, 'Checking for updates...');
            }

            // Check for fresh data for this component type
            const freshComponentData = await this.downloadFreshComponentData(componentType);
            
            if (!freshComponentData) {
                if (showProgress) {
                    this.hideComponentRefreshProgress(componentId);
                }
                return {
                    success: true,
                    reason: 'no-fresh-data',
                    message: 'Component data is already up to date'
                };
            }

            // Detect conflicts for this component
            const conflicts = await this.detectComponentConflicts(componentId, freshComponentData);

            // Handle conflicts if any
            if (conflicts.length > 0) {
                this.updateComponentRefreshProgress(componentId, 'Resolving conflicts...');
                
                if (conflictResolution === 'prompt') {
                    // Show conflict resolution for this component
                    const resolutionResult = await this.resolveComponentConflicts(componentId, conflicts);
                    if (!resolutionResult.success) {
                        throw new Error('Conflict resolution cancelled by user');
                    }
                }
            }

            // Apply fresh data to component
            this.updateComponentRefreshProgress(componentId, 'Updating component...');
            const updateResult = await this.updateSingleComponent(componentId, freshComponentData);

            if (showProgress) {
                this.completeComponentRefresh(componentId, 'Updated successfully!');
            }

            // Show success notification
            showToast(`${componentType} component refreshed successfully!`, 'success');

            const result = {
                success: true,
                componentId,
                componentType,
                conflictsResolved: conflicts.length,
                updateResult
            };

            this.eventBus.emit('refresh:component-complete', result);

            this.logger.info('REFRESH', 'Component refresh completed', result);
            return result;

        } catch (error) {
            this.logger.error('REFRESH', 'Component refresh failed', error, { componentId });
            
            if (showProgress) {
                this.showComponentRefreshError(componentId, error.message);
            }
            
            showToast(`Failed to refresh component: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * Download fresh MKCG data from server
     * @returns {Promise<Object>} Fresh data
     */
    async downloadFreshData() {
        const postId = window.guestifyData?.postId;
        if (!postId) {
            throw new Error('No post ID available');
        }

        this.logger.info('REFRESH', 'Downloading fresh MKCG data', { postId });

        const response = await this.makeAjaxRequest('get_fresh_mkcg_data', {
            post_id: postId
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to download fresh data');
        }

        // Cache the fresh data
        this.dataCache.set(postId, {
            data: response.data,
            timestamp: Date.now()
        });

        this.logger.info('REFRESH', 'Fresh data downloaded successfully', {
            postId,
            dataSize: JSON.stringify(response.data).length
        });

        return response.data;
    }

    /**
     * Download fresh data for specific component type
     * @param {string} componentType - Component type
     * @returns {Promise<Object>} Fresh component data
     */
    async downloadFreshComponentData(componentType) {
        const postId = window.guestifyData?.postId;
        if (!postId) {
            throw new Error('No post ID available');
        }

        this.logger.info('REFRESH', 'Downloading fresh component data', { postId, componentType });

        const response = await this.makeAjaxRequest('get_fresh_component_data', {
            post_id: postId,
            component_type: componentType
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to download fresh component data');
        }

        return response.data;
    }

    /**
     * Detect conflicts between current state and fresh data
     * @param {Object} freshData - Fresh MKCG data
     * @returns {Promise<Array>} Array of conflicts
     */
    async detectAllConflicts(freshData) {
        this.logger.info('REFRESH', 'Detecting conflicts between current and fresh data');

        const conflicts = [];
        const currentState = window.enhancedStateManager?.getState();
        
        if (!currentState || !currentState.components) {
            return conflicts;
        }

        // Check each component for conflicts
        for (const [componentId, component] of Object.entries(currentState.components)) {
            const componentConflicts = await this.detectComponentConflicts(componentId, freshData, component);
            conflicts.push(...componentConflicts);
        }

        this.logger.info('REFRESH', 'Conflict detection completed', {
            totalConflicts: conflicts.length,
            conflictTypes: conflicts.map(c => c.type)
        });

        return conflicts;
    }

    /**
     * Detect conflicts for specific component
     * @param {string} componentId - Component ID
     * @param {Object} freshData - Fresh data
     * @param {Object} currentComponent - Current component data (optional)
     * @returns {Promise<Array>} Component conflicts
     */
    async detectComponentConflicts(componentId, freshData, currentComponent = null) {
        const component = currentComponent || window.enhancedStateManager?.getComponent(componentId);
        if (!component) {
            return [];
        }

        const conflicts = [];
        const componentType = component.type;

        // Use MKCG data mapper to check for conflicts
        if (window.mkcgDataMapper) {
            try {
                const currentMappedData = window.mkcgDataMapper.mapDataToComponent(componentType, window.guestifyData?.mkcgData);
                const freshMappedData = window.mkcgDataMapper.mapDataToComponent(componentType, freshData);

                // Compare mapped data
                for (const [fieldName, currentValue] of Object.entries(currentMappedData)) {
                    const freshValue = freshMappedData[fieldName];
                    const componentValue = component.props[fieldName];

                    // Check if user has modified the field
                    const userModified = componentValue !== currentValue;
                    const dataChanged = freshValue !== currentValue;

                    if (userModified && dataChanged && freshValue !== componentValue) {
                        conflicts.push({
                            componentId,
                            componentType,
                            fieldName,
                            type: 'field-conflict',
                            currentValue: componentValue,
                            originalValue: currentValue,
                            freshValue: freshValue,
                            severity: this.calculateConflictSeverity(fieldName, currentValue, freshValue)
                        });
                    }
                }

            } catch (error) {
                this.logger.warn('REFRESH', 'Error detecting component conflicts', error, { componentId, componentType });
            }
        }

        return conflicts;
    }

    /**
     * Calculate conflict severity
     * @param {string} fieldName - Field name
     * @param {*} currentValue - Current value
     * @param {*} freshValue - Fresh value
     * @returns {string} Severity level
     */
    calculateConflictSeverity(fieldName, currentValue, freshValue) {
        // Key fields are high severity
        const keyFields = ['name', 'title', 'bio_text', 'topic_1', 'topic_2'];
        if (keyFields.includes(fieldName)) {
            return 'high';
        }

        // Large content differences are medium severity
        if (typeof currentValue === 'string' && typeof freshValue === 'string') {
            const lengthDiff = Math.abs(currentValue.length - freshValue.length);
            if (lengthDiff > 100) {
                return 'medium';
            }
        }

        return 'low';
    }

    /**
     * Handle conflicts based on resolution strategy
     * @param {Array} conflicts - Array of conflicts
     * @param {string} resolutionStrategy - Resolution strategy
     * @returns {Promise<Object>} Resolution result
     */
    async handleConflicts(conflicts, resolutionStrategy) {
        this.logger.info('REFRESH', 'Handling conflicts', { 
            conflictCount: conflicts.length,
            strategy: resolutionStrategy 
        });

        switch (resolutionStrategy) {
            case 'prompt':
                return await this.promptUserForResolution(conflicts);
            case 'prefer-fresh':
                return this.autoResolveConflicts(conflicts, 'fresh');
            case 'prefer-local':
                return this.autoResolveConflicts(conflicts, 'local');
            case 'merge':
                return this.autoResolveConflicts(conflicts, 'merge');
            default:
                throw new Error(`Unknown conflict resolution strategy: ${resolutionStrategy}`);
        }
    }

    /**
     * Prompt user for conflict resolution
     * @param {Array} conflicts - Array of conflicts
     * @returns {Promise<Object>} Resolution result
     */
    async promptUserForResolution(conflicts) {
        if (conflicts.length === 0) {
            return { success: true, resolutions: [] };
        }

        this.logger.info('REFRESH', 'Prompting user for conflict resolution', { conflictCount: conflicts.length });

        // Check if conflict resolver is available
        if (!this.conflictResolver) {
            // Create conflict resolver if not injected
            const { DataConflictResolver } = await import('./data-conflict-resolver.js');
            this.conflictResolver = new DataConflictResolver();
        }

        return await this.conflictResolver.resolveConflicts(conflicts);
    }

    /**
     * Auto-resolve conflicts with given strategy
     * @param {Array} conflicts - Array of conflicts
     * @param {string} strategy - Resolution strategy
     * @returns {Object} Resolution result
     */
    autoResolveConflicts(conflicts, strategy) {
        this.logger.info('REFRESH', 'Auto-resolving conflicts', { strategy, conflictCount: conflicts.length });

        const resolutions = conflicts.map(conflict => {
            let resolvedValue;
            
            switch (strategy) {
                case 'fresh':
                    resolvedValue = conflict.freshValue;
                    break;
                case 'local':
                    resolvedValue = conflict.currentValue;
                    break;
                case 'merge':
                    resolvedValue = this.mergeValues(conflict.currentValue, conflict.freshValue);
                    break;
                default:
                    resolvedValue = conflict.freshValue;
            }

            return {
                ...conflict,
                resolution: strategy,
                resolvedValue
            };
        });

        return {
            success: true,
            resolutions,
            strategy
        };
    }

    /**
     * Merge two values intelligently
     * @param {*} localValue - Local value
     * @param {*} freshValue - Fresh value
     * @returns {*} Merged value
     */
    mergeValues(localValue, freshValue) {
        // For strings, prefer the longer one
        if (typeof localValue === 'string' && typeof freshValue === 'string') {
            return localValue.length > freshValue.length ? localValue : freshValue;
        }

        // For other types, prefer fresh value
        return freshValue;
    }

    /**
     * Apply fresh data to components
     * @param {Object} freshData - Fresh MKCG data
     * @param {Array} conflicts - Resolved conflicts
     * @returns {Promise<Object>} Apply result
     */
    async applyFreshData(freshData, conflicts = []) {
        this.logger.info('REFRESH', 'Applying fresh data to components');

        const updatedComponents = [];
        const currentState = window.enhancedStateManager?.getState();
        
        if (!currentState || !currentState.components) {
            throw new Error('No current state available');
        }

        // Create resolution map for quick lookup
        const resolutionMap = new Map();
        conflicts.forEach(conflict => {
            if (conflict.resolution) {
                const key = `${conflict.componentId}-${conflict.fieldName}`;
                resolutionMap.set(key, conflict.resolvedValue);
            }
        });

        // Update each component
        for (const [componentId, component] of Object.entries(currentState.components)) {
            try {
                const updated = await this.updateSingleComponent(componentId, freshData, resolutionMap);
                if (updated) {
                    updatedComponents.push(componentId);
                }
            } catch (error) {
                this.logger.warn('REFRESH', 'Failed to update component', error, { componentId });
            }
        }

        this.logger.info('REFRESH', 'Fresh data applied', { updatedComponents: updatedComponents.length });

        return {
            success: true,
            updatedComponents
        };
    }

    /**
     * Update single component with fresh data
     * @param {string} componentId - Component ID
     * @param {Object} freshData - Fresh MKCG data
     * @param {Map} resolutionMap - Conflict resolutions
     * @returns {Promise<boolean>} True if updated
     */
    async updateSingleComponent(componentId, freshData, resolutionMap = new Map()) {
        const component = window.enhancedStateManager?.getComponent(componentId);
        if (!component) {
            return false;
        }

        const componentType = component.type;

        // Use MKCG data mapper to get fresh mapped data
        if (window.mkcgDataMapper) {
            try {
                const freshMappedData = window.mkcgDataMapper.mapDataToComponent(componentType, freshData);
                const newProps = { ...component.props };
                let hasChanges = false;

                // Apply fresh data or resolved conflicts
                for (const [fieldName, freshValue] of Object.entries(freshMappedData)) {
                    const resolutionKey = `${componentId}-${fieldName}`;
                    let valueToUse;

                    if (resolutionMap.has(resolutionKey)) {
                        // Use resolved value
                        valueToUse = resolutionMap.get(resolutionKey);
                    } else {
                        // Use fresh value
                        valueToUse = freshValue;
                    }

                    if (newProps[fieldName] !== valueToUse) {
                        newProps[fieldName] = valueToUse;
                        hasChanges = true;
                    }
                }

                // Update component if there are changes
                if (hasChanges) {
                    window.enhancedStateManager.updateComponent(componentId, newProps);
                    
                    // Update component indicators
                    this.updateComponentIndicators(componentId, {
                        freshData: true,
                        lastUpdated: Date.now(),
                        conflicts: 0
                    });

                    this.logger.info('REFRESH', 'Component updated with fresh data', { componentId, componentType });
                    return true;
                }

            } catch (error) {
                this.logger.error('REFRESH', 'Error updating component', error, { componentId, componentType });
                throw error;
            }
        }

        return false;
    }

    /**
     * Update all components with fresh data
     * @param {Object} freshData - Fresh MKCG data
     * @returns {Promise<void>}
     */
    async updateAllComponents(freshData) {
        // Update MKCG data in global scope
        if (window.guestifyData && window.guestifyData.mkcgData) {
            window.guestifyData.mkcgData = freshData;
        }

        // Update dashboard if available
        this.updateDashboard(freshData);

        // Emit global data update event
        this.eventBus.emit('refresh:data-updated', {
            freshData,
            timestamp: Date.now()
        });
    }

    /**
     * Update component sync indicators
     * @param {string} componentId - Component ID
     * @param {Object} status - Status information
     */
    updateComponentIndicators(componentId, status) {
        // Find component element
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (!componentElement) {
            return;
        }

        // Update sync indicator
        const syncIndicator = componentElement.querySelector('.sync-indicator');
        if (syncIndicator) {
            syncIndicator.className = 'sync-indicator';
            if (status.freshData) {
                syncIndicator.classList.add('synced');
            }
        }

        // Update freshness indicator
        const freshnessIndicator = componentElement.querySelector('.data-freshness');
        if (freshnessIndicator && status.lastUpdated) {
            const timeAgo = this.formatTimeAgo(status.lastUpdated);
            freshnessIndicator.textContent = timeAgo;
            freshnessIndicator.classList.remove('stale');
        }

        // Update component state
        componentElement.setAttribute('data-state', status.freshData ? 'fresh' : 'stale');
        componentElement.setAttribute('data-tooltip', `Last updated: ${this.formatDateTime(status.lastUpdated)}`);
    }

    /**
     * Update dashboard with fresh data
     * @param {Object} freshData - Fresh MKCG data
     */
    updateDashboard(freshData) {
        // Update last update time in dashboard
        const lastUpdateElement = document.querySelector('.mkcg-metric-value:last-child');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = 'Just now';
        }

        // Update dashboard metrics if available
        const dashboardElement = document.getElementById('mkcg-enhanced-dashboard');
        if (dashboardElement) {
            // Trigger dashboard refresh
            this.eventBus.emit('dashboard:refresh', { freshData });
        }
    }

    /**
     * Make AJAX request to WordPress
     * @param {string} action - WordPress action
     * @param {Object} data - Request data
     * @returns {Promise<Object>} Response data
     */
    async makeAjaxRequest(action, data = {}) {
        // ROOT FIX: Better AJAX URL detection with fallbacks
        let ajaxUrl = null;
        let nonce = null;
        
        // Try multiple sources for AJAX URL
        if (window.guestifyData?.ajaxurl) {
            ajaxUrl = window.guestifyData.ajaxurl;
            nonce = window.guestifyData.nonce;
        } else if (window.ajaxurl) {
            ajaxUrl = window.ajaxurl;
        } else if (window.wpApiSettings?.root) {
            ajaxUrl = window.wpApiSettings.root + 'wp/v2/';
        } else {
            // WordPress standard AJAX URL fallback
            ajaxUrl = '/wp-admin/admin-ajax.php';
        }
        
        if (!ajaxUrl) {
            throw new Error('WordPress AJAX URL not available');
        }
        
        this.logger.info('REFRESH', 'Making AJAX request', {
            action,
            ajaxUrl,
            hasNonce: !!nonce,
            dataKeys: Object.keys(data)
        });

        const requestData = {
            action: `gmkb_${action}`,
            nonce: nonce || '',
            ...data
        };

        try {
            const response = await fetch(ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(requestData)
            });

            this.logger.info('REFRESH', 'AJAX response received', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                url: response.url
            });

            if (!response.ok) {
                // Get response text for better error details
                let responseText = '';
                try {
                    responseText = await response.text();
                } catch (e) {
                    responseText = 'Could not read response text';
                }
                
                this.logger.error('REFRESH', 'HTTP error response', {
                    status: response.status,
                    statusText: response.statusText,
                    responseText: responseText.substring(0, 500) // First 500 chars
                });
                
                // Check if it's a 404 - endpoint doesn't exist
                if (response.status === 404) {
                    throw new Error(`AJAX endpoint not found (404): ${ajaxUrl} - refresh functionality not available`);
                }
                throw new Error(`HTTP ${response.status} ${response.statusText}: ${responseText.substring(0, 200)}`);
            }

            const result = await response.json();
            
            this.logger.info('REFRESH', 'AJAX response parsed', {
                success: result.success,
                hasData: !!result.data
            });
            
            if (!result.success) {
                throw new Error(result.data || 'Request failed');
            }

            return result.data;
            
        } catch (error) {
            // Network errors or JSON parsing errors
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new Error('Network error - unable to connect to server');
            }
            throw error;
        }
    }

    // Progress and UI Methods

    /**
     * Show checking status
     */
    showCheckingStatus() {
        const refreshBtn = document.getElementById('mkcg-refresh-data');
        if (refreshBtn) {
            refreshBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Checking...
            `;
            refreshBtn.disabled = true;
        }
    }

    /**
     * Hide checking status
     */
    hideCheckingStatus() {
        const refreshBtn = document.getElementById('mkcg-refresh-data');
        if (refreshBtn) {
            refreshBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                </svg>
                Refresh Data
            `;
            refreshBtn.disabled = false;
        }
    }

    /**
     * Hide refresh progress
     * This method is called in finally block of refreshAllData
     */
    hideRefreshProgress() {
        // Use enhanced state manager to hide progress if available
        if (window.enhancedStateManager && window.enhancedStateManager.completeProgressTracking) {
            window.enhancedStateManager.completeProgressTracking();
        }
        
        // Also hide the checking status on the button
        this.hideCheckingStatus();
    }

    /**
     * Show refresh progress
     * @param {number} percent - Progress percentage
     * @param {string} message - Progress message
     */
    showRefreshProgress(percent, message) {
        // Use enhanced state manager's progress tracking if available
        if (window.enhancedStateManager && window.enhancedStateManager.updateProgressTracking) {
            window.enhancedStateManager.updateProgressTracking(100, percent, message);
        }

        // Update refresh button
        const refreshBtn = document.getElementById('mkcg-refresh-data');
        if (refreshBtn) {
            refreshBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                ${Math.round(percent)}%
            `;
            refreshBtn.disabled = true;
        }
    }

    /**
     * Update refresh progress
     * @param {number} percent - Progress percentage
     * @param {string} message - Progress message
     */
    updateRefreshProgress(percent, message) {
        this.showRefreshProgress(percent, message);
        
        // Update internal state
        this.refreshState.currentOperation = message;
        
        // Emit progress event
        this.eventBus.emit('refresh:progress', {
            percent,
            message,
            state: this.refreshState
        });
    }

    /**
     * Complete refresh
     * @param {boolean} showProgress - Whether to show progress
     */
    completeRefresh(showProgress = true) {
        if (showProgress) {
            // Use enhanced state manager to complete progress tracking
            if (window.enhancedStateManager && window.enhancedStateManager.completeProgressTracking) {
                window.enhancedStateManager.completeProgressTracking();
            }
        }

        // Reset refresh button
        setTimeout(() => {
            this.hideCheckingStatus();
        }, 2000);
    }

    /**
     * Show refresh error
     * @param {string} message - Error message
     */
    showRefreshError(message) {
        const refreshBtn = document.getElementById('mkcg-refresh-data');
        if (refreshBtn) {
            refreshBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Error
            `;
            
            setTimeout(() => {
                this.hideCheckingStatus();
            }, 3000);
        }
    }

    /**
     * Show component refresh progress
     * @param {string} componentId - Component ID
     * @param {string} message - Progress message
     */
    showComponentRefreshProgress(componentId, message) {
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (componentElement) {
            // Add loading overlay
            const overlay = document.createElement('div');
            overlay.className = 'component-state-overlay';
            overlay.innerHTML = `
                <div class="state-message">
                    <div class="loading-spinner"></div>
                    <span>${message}</span>
                </div>
            `;
            
            componentElement.appendChild(overlay);
            componentElement.classList.add('updating');
        }
    }

    /**
     * Update component refresh progress
     * @param {string} componentId - Component ID
     * @param {string} message - Progress message
     */
    updateComponentRefreshProgress(componentId, message) {
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (componentElement) {
            const overlay = componentElement.querySelector('.component-state-overlay .state-message span');
            if (overlay) {
                overlay.textContent = message;
            }
        }
    }

    /**
     * Complete component refresh
     * @param {string} componentId - Component ID
     * @param {string} message - Completion message
     */
    completeComponentRefresh(componentId, message) {
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (componentElement) {
            const overlay = componentElement.querySelector('.component-state-overlay');
            if (overlay) {
                overlay.remove();
            }
            componentElement.classList.remove('updating');
        }
    }

    /**
     * Hide component refresh progress
     * @param {string} componentId - Component ID
     */
    hideComponentRefreshProgress(componentId) {
        this.completeComponentRefresh(componentId, '');
    }

    /**
     * Show component refresh error
     * @param {string} componentId - Component ID
     * @param {string} message - Error message
     */
    showComponentRefreshError(componentId, message) {
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (componentElement) {
            const overlay = componentElement.querySelector('.component-state-overlay');
            if (overlay) {
                overlay.innerHTML = `
                    <div class="state-message error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>Error: ${message}</span>
                    </div>
                `;
                
                setTimeout(() => {
                    this.hideComponentRefreshProgress(componentId);
                }, 3000);
            }
        }
    }

    /**
     * Show fresh data notification
     * @param {number} componentCount - Number of changed components
     */
    showFreshDataNotification(componentCount) {
        // Create subtle notification
        const notification = document.createElement('div');
        notification.className = 'mkcg-fresh-data-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🔄</div>
                <div class="notification-text">
                    Fresh data available (${componentCount} components)
                    <button class="refresh-now-btn">Refresh Now</button>
                </div>
                <button class="notification-close">✕</button>
            </div>
        `;

        // Add event listeners
        notification.querySelector('.refresh-now-btn').addEventListener('click', () => {
            this.refreshAllData();
            notification.remove();
        });

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // Utility Methods

    /**
     * Reset refresh state
     */
    resetRefreshState() {
        this.refreshState = {
            inProgress: true,
            totalComponents: 0,
            completedComponents: 0,
            failedComponents: [],
            conflicts: [],
            startTime: Date.now(),
            currentOperation: null
        };
    }

    /**
     * Format time ago
     * @param {number} timestamp - Timestamp
     * @returns {string} Formatted time
     */
    formatTimeAgo(timestamp) {
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
     * Format date time
     * @param {number} timestamp - Timestamp
     * @returns {string} Formatted date time
     */
    formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    /**
     * Set conflict resolver
     * @param {DataConflictResolver} resolver - Conflict resolver instance
     */
    setConflictResolver(resolver) {
        this.conflictResolver = resolver;
    }

    /**
     * Get refresh statistics
     * @returns {Object} Refresh statistics
     */
    getRefreshStats() {
        return {
            isRefreshing: this.isRefreshing,
            lastRefreshCheck: this.lastRefreshCheck,
            refreshState: this.refreshState,
            queueLength: this.refreshQueue.length,
            cacheSize: this.dataCache.size,
            config: this.config
        };
    }

    /**
     * Destroy refresh manager
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.dataCache.clear();
        this.timestampCache.clear();
        this.refreshQueue = [];
        
        this.logger.info('REFRESH', 'MKCG Data Refresh Manager destroyed');
    }
}

// Create and export singleton instance
const mkcgDataRefreshManager = new MKCGDataRefreshManager();

// Expose globally for integration
window.mkcgDataRefreshManager = mkcgDataRefreshManager;

// ROOT FIX: Simple debug utility
if (typeof window !== 'undefined') {
    window.mkcgDebugRefresh = {
        // Check current MKCG data structure
        checkDataStructure: () => {
            const data = window.guestifyData?.mkcgData;
            
            console.group('🔍 MKCG Data Structure Analysis');
            console.log('Has MKCG Data:', !!data);
            
            if (data) {
                console.log('=== RAW MKCG DATA STRUCTURE ===');
                console.log('Full MKCG Data Object:', data);
                console.log('Top-level keys:', Object.keys(data));
            } else {
                console.error('❌ No MKCG data found in window.guestifyData.mkcgData');
                console.log('window.guestifyData:', window.guestifyData);
            }
            
            console.groupEnd();
            return data;
        },
        
        // Test refresh functionality
        testRefresh: async () => {
            console.log('🔄 Testing MKCG refresh functionality...');
            console.log('Available data:', {
                postId: window.guestifyData?.postId,
                hasMkcgData: !!window.guestifyData?.mkcgData,
                ajaxUrl: window.guestifyData?.ajaxurl || window.ajaxurl || '/wp-admin/admin-ajax.php',
                hasNonce: !!window.guestifyData?.nonce
            });
            
            try {
                const result = await mkcgDataRefreshManager.checkForFreshData({ notifyUser: false });
                console.log('✅ Refresh test result:', result);
                return result;
            } catch (error) {
                console.error('❌ Refresh test failed with error:', error);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                
                // Try to extract more error details
                const errorDetails = {
                    success: false, 
                    error: error.message,
                    errorName: error.name,
                    stack: error.stack
                };
                
                console.log('📛 Complete error details:', errorDetails);
                return errorDetails;
            }
        },
        
        // Debug WordPress AJAX availability
        checkWordPressData: () => {
            console.group('🔍 WordPress Data Availability');
            console.log('window.guestifyData:', window.guestifyData);
            console.log('window.ajaxurl:', window.ajaxurl);
            console.log('window.wpApiSettings:', window.wpApiSettings);
            
            console.log('\n=== AJAX URL Sources ===');
            console.log('guestifyData.ajaxurl:', window.guestifyData?.ajaxurl);
            console.log('global ajaxurl:', window.ajaxurl);
            console.log('REST API root:', window.wpApiSettings?.root);
            console.log('Standard fallback:', '/wp-admin/admin-ajax.php');
            
            console.log('\n=== Security ===');
            console.log('guestifyData.nonce:', window.guestifyData?.nonce);
            console.log('REST API nonce:', window.wpApiSettings?.nonce);
            
            console.groupEnd();
            
            return {
                hasGuestifyData: !!window.guestifyData,
                hasAjaxUrl: !!(window.guestifyData?.ajaxurl || window.ajaxurl),
                hasNonce: !!(window.guestifyData?.nonce || window.wpApiSettings?.nonce),
                sources: {
                    guestifyAjax: window.guestifyData?.ajaxurl,
                    globalAjax: window.ajaxurl,
                    restApi: window.wpApiSettings?.root
                }
            };
        },
        
        // ROOT FIX: Test AJAX connection without nonce
        testConnection: async () => {
            console.log('🔌 Testing AJAX connection...');
            try {
                const response = await fetch('/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'gmkb_test_connection'
                    })
                });
                
                console.log('Response status:', response.status);
                console.log('Response OK:', response.ok);
                
                if (!response.ok) {
                    const responseText = await response.text();
                    console.error('HTTP Error:', response.status, responseText.substring(0, 200));
                    return { success: false, error: `HTTP ${response.status}`, responseText };
                }
                
                const result = await response.json();
                console.log('✅ Connection test result:', result);
                return result;
                
            } catch (error) {
                console.error('❌ Connection test failed:', error);
                return { success: false, error: error.message };
            }
        }
    };
    
    console.log('🔧 MKCG Refresh Debug Tools Available:');
    console.log('  • mkcgDebugRefresh.checkDataStructure() - Show raw data structure');
    console.log('  • mkcgDebugRefresh.testRefresh() - Test refresh functionality');
    console.log('  • mkcgDebugRefresh.testConnection() - Test AJAX connection (no nonce)');
    console.log('  • mkcgDebugRefresh.checkWordPressData() - Check WordPress data availability');
}

export { mkcgDataRefreshManager as default, MKCGDataRefreshManager };
