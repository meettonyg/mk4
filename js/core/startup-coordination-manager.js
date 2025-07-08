/**
 * @file startup-coordination-manager.js
 * @description Manages the coordination between data loading and component rendering during startup
 * to prevent race conditions where template fetches get aborted during state updates.
 * 
 * ROOT FIX: This addresses the race condition between hydrateStateWithMKCGData() and component rendering
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { performanceMonitor } from '../utils/performance-monitor.js';
import { eventBus } from './event-bus.js';

class StartupCoordinationManager {
    constructor() {
        this.logger = structuredLogger;
        this.state = 'IDLE'; // IDLE, COORDINATING, DATA_LOADING, RENDERING, COMPLETE
        this.phases = [];
        this.currentPhase = null;
        this.startTime = null;
        this.coordinationPromise = null;
        this.activeOperations = new Set();
        this.deferredOperations = [];
        
        // Coordination flags
        this.dataLoadingComplete = false;
        this.templatePreloadComplete = false;
        this.systemsReady = false;
        this.renderingBlocked = false;
        
        // Operation counters
        this.pendingTemplateOperations = 0;
        this.pendingStateOperations = 0;
        
        // Emergency circuit breaker
        this.maxCoordinationTime = 30000; // 30 seconds max coordination time
        this.emergencyTimeout = null;
        
        this.logger.info('COORD', 'Startup Coordination Manager initialized');
        
        // Set up event listeners for coordination
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for coordinating operations
     */
    setupEventListeners() {
        // Listen for template fetch operations
        eventBus.on('template:fetch-start', (data) => {
            this.registerTemplateOperation(data.componentType, data.operationId);
        });
        
        eventBus.on('template:fetch-complete', (data) => {
            this.completeTemplateOperation(data.operationId);
        });
        
        eventBus.on('template:fetch-error', (data) => {
            this.completeTemplateOperation(data.operationId);
        });
        
        // Listen for state operations
        eventBus.on('state:operation-start', (data) => {
            this.registerStateOperation(data.operation, data.operationId);
        });
        
        eventBus.on('state:operation-complete', (data) => {
            this.completeStateOperation(data.operationId);
        });
        
        // Listen for MKCG hydration
        eventBus.on('state:mkcg-hydration-start', () => {
            this.blockRendering('MKCG hydration in progress');
        });
        
        eventBus.on('state:mkcg-hydration-complete', () => {
            this.unblockRendering('MKCG hydration complete');
        });
        
        this.logger.debug('COORD', 'Event listeners set up for startup coordination');
    }
    
    /**
     * Main coordination method - ensures proper startup sequencing
     * @param {Object} options - Coordination options
     * @returns {Promise<boolean>} Success status
     */
    async coordinateStartup(options = {}) {
        if (this.state !== 'IDLE') {
            this.logger.warn('COORD', 'Coordination already in progress', { currentState: this.state });
            return this.coordinationPromise;
        }
        
        const {
            enableMKCGHydration = true,
            preloadTemplates = true,
            maxWaitTime = 15000,
            emergencyFallback = true
        } = options;
        
        this.state = 'COORDINATING';
        this.startTime = performance.now();
        
        this.logger.info('COORD', 'Starting startup coordination', {
            enableMKCGHydration,
            preloadTemplates,
            maxWaitTime
        });
        
        // Set emergency timeout
        this.emergencyTimeout = setTimeout(() => {
            this.handleEmergencyTimeout();
        }, this.maxCoordinationTime);
        
        this.coordinationPromise = this.executeCoordinatedStartup({
            enableMKCGHydration,
            preloadTemplates,
            maxWaitTime,
            emergencyFallback
        });
        
        return this.coordinationPromise;
    }
    
    /**
     * Execute the coordinated startup sequence
     */
    async executeCoordinatedStartup(options) {
        try {
            // Phase 1: Ensure systems are ready
            await this.executePhase('SYSTEMS_READY', () => this.ensureSystemsReady());
            
            // Phase 2: Template preloading (if enabled)
            if (options.preloadTemplates) {
                await this.executePhase('TEMPLATE_PRELOAD', () => this.preloadCriticalTemplates());
            }
            
            // Phase 3: Block rendering during data operations
            this.blockRendering('Data loading phase');
            this.state = 'DATA_LOADING';
            
            // Phase 4: MKCG data hydration (if enabled)
            if (options.enableMKCGHydration) {
                await this.executePhase('MKCG_HYDRATION', () => this.coordinateMKCGHydration());
            }
            
            // Phase 5: Wait for any pending operations to complete
            await this.executePhase('PENDING_OPERATIONS', () => this.waitForPendingOperations(options.maxWaitTime));
            
            // Phase 6: Unblock rendering
            this.unblockRendering('Data loading complete');
            this.state = 'RENDERING';
            
            // CRITICAL FIX: Set dataLoadingComplete BEFORE validation
            this.dataLoadingComplete = true;
            
            // Phase 7: Process deferred operations
            await this.executePhase('DEFERRED_OPERATIONS', () => this.processDeferredOperations());
            
            // Phase 8: Final validation
            await this.executePhase('VALIDATION', () => this.validateStartupComplete());
            
            this.state = 'COMPLETE';
            
            const duration = performance.now() - this.startTime;
            this.logger.info('COORD', 'Startup coordination completed successfully', {
                duration,
                phases: this.phases.length,
                deferredOperations: this.deferredOperations.length
            });
            
            // Clear emergency timeout
            if (this.emergencyTimeout) {
                clearTimeout(this.emergencyTimeout);
                this.emergencyTimeout = null;
            }
            
            // Emit completion event
            eventBus.emit('startup:coordination-complete', {
                duration,
                phases: this.phases,
                success: true
            });
            
            return true;
            
        } catch (error) {
            this.logger.error('COORD', 'Startup coordination failed', error);
            this.state = 'IDLE'; // Reset for retry
            
            // Emergency fallback if enabled
            if (options.emergencyFallback) {
                return this.executeEmergencyFallback();
            }
            
            throw error;
        }
    }
    
    /**
     * Execute a coordination phase with timing and error handling
     */
    async executePhase(phaseName, phaseFunction) {
        const phaseStart = performance.now();
        this.currentPhase = phaseName;
        
        this.logger.debug('COORD', `Starting phase: ${phaseName}`);
        
        try {
            await phaseFunction();
            
            const duration = performance.now() - phaseStart;
            this.phases.push({
                name: phaseName,
                duration,
                success: true,
                timestamp: Date.now()
            });
            
            this.logger.debug('COORD', `Phase completed: ${phaseName}`, { duration });
            
        } catch (error) {
            const duration = performance.now() - phaseStart;
            this.phases.push({
                name: phaseName,
                duration,
                success: false,
                error: error.message,
                timestamp: Date.now()
            });
            
            this.logger.error('COORD', `Phase failed: ${phaseName}`, error, { duration });
            throw error;
        } finally {
            this.currentPhase = null;
        }
    }
    
    /**
     * Ensure all core systems are ready
     */
    async ensureSystemsReady() {
        const requiredSystems = ['stateManager', 'componentManager', 'renderer'];
        const maxWait = 5000;
        const startTime = performance.now();
        
        while (performance.now() - startTime < maxWait) {
            const missingSystems = requiredSystems.filter(name => !window[name]);
            
            if (missingSystems.length === 0) {
                this.systemsReady = true;
                this.logger.info('COORD', 'All core systems ready');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        const missingAfterWait = requiredSystems.filter(name => !window[name]);
        if (missingAfterWait.length > 0) {
            throw new Error(`Required systems not ready: ${missingAfterWait.join(', ')}`);
        }
        
        this.systemsReady = true;
    }
    
    /**
     * Preload critical component templates
     */
    async preloadCriticalTemplates() {
        if (!window.templatePreloader) {
            this.logger.info('COORD', 'Template preloader not available, skipping preload');
            this.templatePreloadComplete = true;
            return;
        }
        
        try {
            const criticalTemplates = ['hero', 'topics', 'biography', 'authority-hook'];
            
            this.logger.info('COORD', 'Preloading critical templates', { templates: criticalTemplates });
            
            // Use template preloader if available
            if (typeof window.templatePreloader.preloadSpecific === 'function') {
                await window.templatePreloader.preloadSpecific(criticalTemplates);
            } else if (typeof window.templatePreloader.init === 'function') {
                await window.templatePreloader.init();
            }
            
            this.templatePreloadComplete = true;
            this.logger.info('COORD', 'Critical templates preloaded successfully');
            
        } catch (error) {
            this.logger.warn('COORD', 'Template preload failed, continuing without preload', error);
            this.templatePreloadComplete = true; // Continue anyway
        }
    }
    
    /**
     * Coordinate MKCG data hydration to prevent race conditions
     */
    async coordinateMKCGHydration() {
        if (!window.enhancedStateManager) {
            this.logger.info('COORD', 'Enhanced state manager not available, skipping MKCG hydration');
            return;
        }
        
        // Check if MKCG data is available
        if (!window.guestifyData?.mkcgData) {
            this.logger.info('COORD', 'No MKCG data available, skipping hydration');
            return;
        }
        
        this.logger.info('COORD', 'Starting coordinated MKCG hydration');
        
        try {
            // Emit hydration start event
            eventBus.emit('state:mkcg-hydration-start', {
                coordinator: 'startup-coordination-manager'
            });
            
            // Check if enhanced state manager has initialization method
            if (typeof window.enhancedStateManager.initializeAfterSystems === 'function') {
                await window.enhancedStateManager.initializeAfterSystems();
            } else if (typeof window.enhancedStateManager.hydrateStateWithMKCGData === 'function') {
                // Load saved state first
                const savedState = window.enhancedStateManager.loadStateFromStorage();
                if (savedState) {
                    await window.enhancedStateManager.hydrateStateWithMKCGData(savedState);
                } else {
                    // Auto-generate from MKCG data
                    await window.enhancedStateManager.autoGenerateComponentsFromMKCG();
                }
            }
            
            // Emit hydration complete event
            eventBus.emit('state:mkcg-hydration-complete', {
                coordinator: 'startup-coordination-manager'
            });
            
            this.logger.info('COORD', 'MKCG hydration completed successfully');
            
        } catch (error) {
            this.logger.error('COORD', 'MKCG hydration failed', error);
            
            // Emit hydration complete even on failure to unblock rendering
            eventBus.emit('state:mkcg-hydration-complete', {
                coordinator: 'startup-coordination-manager',
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * Wait for pending operations to complete
     */
    async waitForPendingOperations(maxWaitTime = 10000) {
        const startTime = performance.now();
        
        while (performance.now() - startTime < maxWaitTime) {
            if (this.pendingTemplateOperations === 0 && this.pendingStateOperations === 0) {
                this.logger.info('COORD', 'All pending operations completed');
                return;
            }
            
            this.logger.debug('COORD', 'Waiting for pending operations', {
                templateOps: this.pendingTemplateOperations,
                stateOps: this.pendingStateOperations,
                elapsed: performance.now() - startTime
            });
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.logger.warn('COORD', 'Timeout waiting for pending operations', {
            templateOps: this.pendingTemplateOperations,
            stateOps: this.pendingStateOperations,
            maxWaitTime
        });
        
        // Continue anyway - don't block startup
    }
    
    /**
     * Process deferred operations that were blocked during data loading
     */
    async processDeferredOperations() {
        if (this.deferredOperations.length === 0) {
            this.logger.debug('COORD', 'No deferred operations to process');
            return;
        }
        
        this.logger.info('COORD', `Processing ${this.deferredOperations.length} deferred operations`);
        
        const operations = [...this.deferredOperations];
        this.deferredOperations = [];
        
        for (const operation of operations) {
            try {
                await operation.execute();
                this.logger.debug('COORD', `Deferred operation completed: ${operation.type}`);
            } catch (error) {
                this.logger.warn('COORD', `Deferred operation failed: ${operation.type}`, error);
            }
        }
        
        this.logger.info('COORD', 'All deferred operations processed');
    }
    
    /**
     * Validate that startup completed successfully
     */
    async validateStartupComplete() {
        const validationChecks = {
            systemsReady: this.systemsReady,
            dataLoadingComplete: this.dataLoadingComplete,
            renderingUnblocked: !this.renderingBlocked,
            noActiveOperations: this.activeOperations.size === 0,
            noPendingOperations: this.pendingTemplateOperations === 0 && this.pendingStateOperations === 0
        };
        
        const failedChecks = Object.entries(validationChecks)
            .filter(([check, passed]) => !passed)
            .map(([check]) => check);
        
        if (failedChecks.length > 0) {
            this.logger.warn('COORD', 'Startup validation failed', {
                failedChecks,
                validationChecks
            });
            throw new Error(`Startup validation failed: ${failedChecks.join(', ')}`);
        }
        
        this.logger.info('COORD', 'Startup validation passed', validationChecks);
    }
    
    /**
     * Block rendering operations during data loading
     */
    blockRendering(reason) {
        this.renderingBlocked = true;
        this.logger.info('COORD', `Rendering blocked: ${reason}`);
        
        eventBus.emit('rendering:blocked', { reason, coordinator: true });
    }
    
    /**
     * Unblock rendering operations after data loading
     */
    unblockRendering(reason) {
        this.renderingBlocked = false;
        this.logger.info('COORD', `Rendering unblocked: ${reason}`);
        
        eventBus.emit('rendering:unblocked', { reason, coordinator: true });
    }
    
    /**
     * Check if rendering is currently blocked
     */
    isRenderingBlocked() {
        return this.renderingBlocked;
    }
    
    /**
     * Register a template operation
     */
    registerTemplateOperation(componentType, operationId) {
        this.pendingTemplateOperations++;
        this.activeOperations.add(operationId);
        
        this.logger.debug('COORD', `Template operation registered: ${componentType}`, {
            operationId,
            pendingOps: this.pendingTemplateOperations
        });
    }
    
    /**
     * Complete a template operation
     */
    completeTemplateOperation(operationId) {
        this.pendingTemplateOperations = Math.max(0, this.pendingTemplateOperations - 1);
        this.activeOperations.delete(operationId);
        
        this.logger.debug('COORD', `Template operation completed`, {
            operationId,
            pendingOps: this.pendingTemplateOperations
        });
    }
    
    /**
     * Register a state operation
     */
    registerStateOperation(operation, operationId) {
        this.pendingStateOperations++;
        this.activeOperations.add(operationId);
        
        this.logger.debug('COORD', `State operation registered: ${operation}`, {
            operationId,
            pendingOps: this.pendingStateOperations
        });
    }
    
    /**
     * Complete a state operation
     */
    completeStateOperation(operationId) {
        this.pendingStateOperations = Math.max(0, this.pendingStateOperations - 1);
        this.activeOperations.delete(operationId);
        
        this.logger.debug('COORD', `State operation completed`, {
            operationId,
            pendingOps: this.pendingStateOperations
        });
    }
    
    /**
     * Defer an operation until after data loading is complete
     */
    deferOperation(operation) {
        if (!this.renderingBlocked) {
            // Not blocked, execute immediately
            return operation.execute();
        }
        
        this.deferredOperations.push(operation);
        this.logger.debug('COORD', `Operation deferred: ${operation.type}`, {
            totalDeferred: this.deferredOperations.length
        });
        
        return new Promise((resolve, reject) => {
            operation.resolve = resolve;
            operation.reject = reject;
        });
    }
    
    /**
     * Handle emergency timeout
     */
    handleEmergencyTimeout() {
        this.logger.error('COORD', 'Emergency timeout reached - startup coordination taking too long');
        
        // Force unblock rendering
        this.unblockRendering('Emergency timeout');
        this.state = 'COMPLETE';
        
        // Execute emergency fallback
        this.executeEmergencyFallback();
    }
    
    /**
     * Execute emergency fallback initialization
     */
    async executeEmergencyFallback() {
        this.logger.warn('COORD', 'Executing emergency fallback initialization');
        
        try {
            // Unblock everything
            this.renderingBlocked = false;
            this.dataLoadingComplete = true;
            
            // Clear all pending operations
            this.pendingTemplateOperations = 0;
            this.pendingStateOperations = 0;
            this.activeOperations.clear();
            
            // Process critical deferred operations only
            const criticalOperations = this.deferredOperations.filter(op => op.critical);
            for (const operation of criticalOperations) {
                try {
                    await operation.execute();
                } catch (error) {
                    this.logger.warn('COORD', 'Critical deferred operation failed', error);
                }
            }
            
            // Clear all deferred operations
            this.deferredOperations = [];
            
            // Emit emergency fallback event
            eventBus.emit('startup:emergency-fallback', {
                coordinator: 'startup-coordination-manager',
                timestamp: Date.now()
            });
            
            this.logger.info('COORD', 'Emergency fallback completed');
            return true;
            
        } catch (error) {
            this.logger.error('COORD', 'Emergency fallback failed', error);
            return false;
        }
    }
    
    /**
     * Get current coordination status
     */
    getStatus() {
        return {
            state: this.state,
            currentPhase: this.currentPhase,
            dataLoadingComplete: this.dataLoadingComplete,
            templatePreloadComplete: this.templatePreloadComplete,
            systemsReady: this.systemsReady,
            renderingBlocked: this.renderingBlocked,
            pendingOperations: {
                template: this.pendingTemplateOperations,
                state: this.pendingStateOperations,
                active: this.activeOperations.size
            },
            deferredOperations: this.deferredOperations.length,
            phases: this.phases,
            duration: this.startTime ? performance.now() - this.startTime : 0
        };
    }
    
    /**
     * Reset coordination manager for retry
     */
    reset() {
        this.state = 'IDLE';
        this.phases = [];
        this.currentPhase = null;
        this.startTime = null;
        this.coordinationPromise = null;
        this.activeOperations.clear();
        this.deferredOperations = [];
        
        this.dataLoadingComplete = false;
        this.templatePreloadComplete = false;
        this.systemsReady = false;
        this.renderingBlocked = false;
        
        this.pendingTemplateOperations = 0;
        this.pendingStateOperations = 0;
        
        if (this.emergencyTimeout) {
            clearTimeout(this.emergencyTimeout);
            this.emergencyTimeout = null;
        }
        
        this.logger.info('COORD', 'Coordination manager reset');
    }
}

// Export singleton instance
export const startupCoordinationManager = new StartupCoordinationManager();

// Expose globally for debugging
window.startupCoordinationManager = startupCoordinationManager;

// Add debug commands
window.startupCoordination = {
    status: () => startupCoordinationManager.getStatus(),
    coordinate: (options) => startupCoordinationManager.coordinateStartup(options),
    reset: () => startupCoordinationManager.reset(),
    blockRendering: (reason) => startupCoordinationManager.blockRendering(reason),
    unblockRendering: (reason) => startupCoordinationManager.unblockRendering(reason),
    help: () => {
        console.log('🚀 Startup Coordination Manager Commands:');
        console.log('  startupCoordination.status()     - Get current status');
        console.log('  startupCoordination.coordinate()  - Start coordination');
        console.log('  startupCoordination.reset()      - Reset manager');
        console.log('  startupCoordination.blockRendering() - Block rendering');
        console.log('  startupCoordination.unblockRendering() - Unblock rendering');
        console.log('  startupCoordination.help()       - Show this help');
    }
};

console.log('🚀 Startup Coordination Manager loaded! Type startupCoordination.help() for commands.');
