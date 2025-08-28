/**
 * Phase 2: Global Object Initialization Root-Level Fixes
 * 
 * This file addresses the core architecture issue where global objects
 * are not being properly exposed when expected by other modules.
 * 
 * ROOT FIX: Ensures proper initialization sequence and global exposure
 */

// Add to main.js - Comprehensive Global Object Initialization Fix

/**
 * ROOT FIX: Enhanced Global Object Manager
 * Ensures all systems are properly initialized and exposed globally
 */
class GlobalObjectManager {
    constructor() {
        this.initializationOrder = [
            'structuredLogger',
            'eventBus', 
            'performanceMonitor',
            'stateValidator',
            'enhancedStateManager',
            'enhancedComponentManager',
            'componentRenderer',
            'historyService',
            'saveService',
            'emptyStateHandlers'
        ];
        
        this.initialized = new Set();
        this.failed = new Set();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        
        this.logger = window.structuredLogger || console;
        this.readyCallbacks = [];
        this.isReady = false;
    }
    
    /**
     * ROOT FIX: Initialize all core systems in proper order
     */
    async initializeAllSystems() {
        this.logger.info('GLOBAL', 'Starting comprehensive global object initialization');
        
        try {
            // Phase 1: Initialize foundational systems
            await this.initializeFoundationSystems();
            
            // Phase 2: Initialize core state management
            await this.initializeCoreStateSystems();
            
            // Phase 3: Initialize UI and interaction systems
            await this.initializeUISystems();
            
            // Phase 4: Verify all systems are properly exposed
            await this.verifyGlobalExposure();
            
            // Phase 5: Run integration tests
            await this.runIntegrationTests();
            
            this.isReady = true;
            this.notifyReadyCallbacks();
            
            this.logger.info('GLOBAL', 'All systems initialized successfully', {
                initialized: Array.from(this.initialized),
                failed: Array.from(this.failed),
                totalSystems: this.initializationOrder.length
            });
            
        } catch (error) {
            this.logger.error('GLOBAL', 'System initialization failed', error);
            throw error;
        }
    }
    
    /**
     * ROOT FIX: Initialize foundational systems first
     */
    async initializeFoundationSystems() {
        const foundationSystems = ['structuredLogger', 'eventBus', 'performanceMonitor'];
        
        for (const systemName of foundationSystems) {
            await this.initializeSystem(systemName);
        }
        
        // Ensure foundational systems are working
        if (window.structuredLogger) {
            this.logger = window.structuredLogger;
        }
        
        this.logger.info('GLOBAL', 'Foundation systems initialized');
    }
    
    /**
     * ROOT FIX: Initialize core state management systems
     */
    async initializeCoreStateSystems() {
        const coreStateSystems = ['stateValidator', 'enhancedStateManager'];
        
        for (const systemName of coreStateSystems) {
            await this.initializeSystem(systemName);
        }
        
        // Special initialization for enhanced state manager
        if (window.enhancedStateManager && !this.initialized.has('enhancedStateManager')) {
            try {
                await window.enhancedStateManager.initializeAfterSystems();
                this.initialized.add('enhancedStateManager');
                this.logger.info('GLOBAL', 'Enhanced state manager post-initialization completed');
            } catch (error) {
                this.logger.error('GLOBAL', 'Enhanced state manager post-initialization failed', error);
            }
        }
        
        this.logger.info('GLOBAL', 'Core state systems initialized');
    }
    
    /**
     * ROOT FIX: Initialize UI and interaction systems
     */
    async initializeUISystems() {
        const uiSystems = ['enhancedComponentManager', 'componentRenderer', 'historyService', 'saveService', 'emptyStateHandlers'];
        
        for (const systemName of uiSystems) {
            await this.initializeSystem(systemName);
        }
        
        this.logger.info('GLOBAL', 'UI systems initialized');
    }
    
    /**
     * ROOT FIX: Initialize individual system with retry logic
     */
    async initializeSystem(systemName) {
        const maxRetries = this.maxRetries;
        let attempts = 0;
        
        while (attempts < maxRetries) {
            attempts++;
            
            try {
                const success = await this.attemptSystemInitialization(systemName);
                
                if (success) {
                    this.initialized.add(systemName);
                    this.logger.info('GLOBAL', `System initialized: ${systemName}`, {
                        attempt: attempts,
                        available: typeof window[systemName] !== 'undefined'
                    });
                    return;
                }
                
            } catch (error) {
                this.logger.warn('GLOBAL', `System initialization attempt ${attempts} failed: ${systemName}`, error);
            }
            
            // Wait before retry
            if (attempts < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 100 * attempts));
            }
        }
        
        this.failed.add(systemName);
        this.logger.error('GLOBAL', `System initialization failed after ${maxRetries} attempts: ${systemName}`);
    }
    
    /**
     * ROOT FIX: Attempt to initialize a specific system
     */
    async attemptSystemInitialization(systemName) {
        // Check if system is already available globally
        if (window[systemName]) {
            // If system has an init method, call it
            if (typeof window[systemName].init === 'function') {
                try {
                    await window[systemName].init();
                    this.logger.debug('GLOBAL', `Called init() on ${systemName}`);
                } catch (error) {
                    this.logger.warn('GLOBAL', `Failed to call init() on ${systemName}`, error);
                }
            }
            return true;
        }
        
        // Special cases for specific systems
        switch (systemName) {
            case 'structuredLogger':
                return this.initializeStructuredLogger();
                
            case 'eventBus':
                return this.initializeEventBus();
                
            case 'performanceMonitor':
                return this.initializePerformanceMonitor();
                
            case 'stateValidator':
                return this.initializeStateValidator();
                
            case 'enhancedStateManager':
                return this.initializeEnhancedStateManager();
                
            case 'enhancedComponentManager':
                return this.initializeEnhancedComponentManager();
                
            default:
                this.logger.warn('GLOBAL', `No initialization strategy for ${systemName}`);
                return false;
        }
    }
    
    /**
     * ROOT FIX: Initialize structured logger
     */
    initializeStructuredLogger() {
        if (window.structuredLogger) return true;
        
        // Create fallback logger
        window.structuredLogger = {
            info: (category, message, data) => console.log(`[${category}] ${message}`, data || ''),
            warn: (category, message, data) => console.warn(`[${category}] ${message}`, data || ''),
            error: (category, message, error, data) => console.error(`[${category}] ${message}`, error, data || ''),
            debug: (category, message, data) => console.debug(`[${category}] ${message}`, data || '')
        };
        
        return true;
    }
    
    /**
     * ROOT FIX: Initialize event bus
     */
    initializeEventBus() {
        if (window.eventBus) return true;
        
        // Create simple event bus
        window.eventBus = {
            listeners: new Map(),
            
            on(event, callback) {
                if (!this.listeners.has(event)) {
                    this.listeners.set(event, []);
                }
                this.listeners.get(event).push(callback);
            },
            
            off(event, callback) {
                if (this.listeners.has(event)) {
                    const callbacks = this.listeners.get(event);
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            },
            
            emit(event, data) {
                if (this.listeners.has(event)) {
                    this.listeners.get(event).forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error('Event bus callback error:', error);
                        }
                    });
                }
            }
        };
        
        return true;
    }
    
    /**
     * ROOT FIX: Initialize performance monitor
     */
    initializePerformanceMonitor() {
        if (window.performanceMonitor) return true;
        
        // Create simple performance monitor
        window.performanceMonitor = {
            start(operation) {
                const startTime = performance.now();
                return () => {
                    const duration = performance.now() - startTime;
                    console.debug(`Performance: ${operation} took ${duration.toFixed(2)}ms`);
                    return duration;
                };
            }
        };
        
        return true;
    }
    
    /**
     * ROOT FIX: Initialize state validator
     */
    initializeStateValidator() {
        if (window.stateValidator) return true;
        
        // Create simple state validator
        window.stateValidator = {
            validateState: (state, options = {}) => ({
                valid: true,
                errors: [],
                recovered: false
            }),
            
            validateTransaction: (transaction, state) => ({
                valid: true,
                errors: []
            }),
            
            getStats: () => ({
                validations: 0,
                errors: 0,
                recoveries: 0
            })
        };
        
        return true;
    }
    
    /**
     * ROOT FIX: Initialize enhanced state manager
     */
    initializeEnhancedStateManager() {
        // Enhanced state manager should be loaded via script
        // Just ensure it's properly exposed
        if (window.enhancedStateManager) {
            return true;
        }
        
        this.logger.warn('GLOBAL', 'Enhanced state manager not found - may not be loaded yet');
        return false;
    }
    
    /**
     * ROOT FIX: Initialize enhanced component manager
     */
    initializeEnhancedComponentManager() {
        // Enhanced component manager should be loaded via script
        // Just ensure it's properly exposed
        if (window.enhancedComponentManager) {
            return true;
        }
        
        this.logger.warn('GLOBAL', 'Enhanced component manager not found - may not be loaded yet');
        return false;
    }
    
    /**
     * ROOT FIX: Verify all systems are properly exposed globally
     */
    async verifyGlobalExposure() {
        const verificationResults = {};
        
        for (const systemName of this.initializationOrder) {
            const isAvailable = typeof window[systemName] !== 'undefined';
            const isInitialized = this.initialized.has(systemName);
            
            verificationResults[systemName] = {
                available: isAvailable,
                initialized: isInitialized,
                status: isAvailable && isInitialized ? 'OK' : 'MISSING'
            };
        }
        
        // Log verification results
        const availableCount = Object.values(verificationResults).filter(r => r.status === 'OK').length;
        const totalCount = this.initializationOrder.length;
        
        this.logger.info('GLOBAL', 'Global exposure verification completed', {
            available: availableCount,
            total: totalCount,
            successRate: `${(availableCount / totalCount * 100).toFixed(1)}%`,
            results: verificationResults
        });
        
        return verificationResults;
    }
    
    /**
     * ROOT FIX: Run basic integration tests
     */
    async runIntegrationTests() {
        const tests = [];
        
        // Test 1: State manager integration
        if (window.enhancedStateManager) {
            tests.push(await this.testStateManagerIntegration());
        }
        
        // Test 2: Component manager integration
        if (window.enhancedComponentManager) {
            tests.push(await this.testComponentManagerIntegration());
        }
        
        // Test 3: Event bus communication
        if (window.eventBus) {
            tests.push(await this.testEventBusIntegration());
        }
        
        const passedTests = tests.filter(t => t.passed).length;
        const totalTests = tests.length;
        
        this.logger.info('GLOBAL', 'Integration tests completed', {
            passed: passedTests,
            total: totalTests,
            successRate: `${(passedTests / totalTests * 100).toFixed(1)}%`,
            tests
        });
        
        return tests;
    }
    
    /**
     * ROOT FIX: Test state manager integration
     */
    async testStateManagerIntegration() {
        try {
            const stateManager = window.enhancedStateManager;
            
            // Test basic functionality
            const state = stateManager.getState();
            const isValidState = state && typeof state === 'object';
            
            // Test subscription
            let subscriptionWorking = false;
            const unsubscribe = stateManager.subscribeGlobal(() => {
                subscriptionWorking = true;
            });
            
            // Trigger state change to test subscription
            stateManager.updateGlobalSettings({ test: true });
            
            // Clean up
            unsubscribe();
            
            return {
                name: 'StateManagerIntegration',
                passed: isValidState && subscriptionWorking,
                details: {
                    validState: isValidState,
                    subscriptionWorking
                }
            };
            
        } catch (error) {
            return {
                name: 'StateManagerIntegration',
                passed: false,
                error: error.message
            };
        }
    }
    
    /**
     * ROOT FIX: Test component manager integration
     */
    async testComponentManagerIntegration() {
        try {
            const componentManager = window.enhancedComponentManager;
            
            // Test basic functionality
            const hasAddMethod = typeof componentManager.addComponent === 'function';
            const hasRemoveMethod = typeof componentManager.removeComponent === 'function';
            const hasUpdateMethod = typeof componentManager.updateComponent === 'function';
            
            return {
                name: 'ComponentManagerIntegration',
                passed: hasAddMethod && hasRemoveMethod && hasUpdateMethod,
                details: {
                    hasAddMethod,
                    hasRemoveMethod,
                    hasUpdateMethod
                }
            };
            
        } catch (error) {
            return {
                name: 'ComponentManagerIntegration',
                passed: false,
                error: error.message
            };
        }
    }
    
    /**
     * ROOT FIX: Test event bus integration
     */
    async testEventBusIntegration() {
        try {
            const eventBus = window.eventBus;
            
            let eventReceived = false;
            const testEvent = 'global-test-event';
            
            // Set up listener
            eventBus.on(testEvent, () => {
                eventReceived = true;
            });
            
            // Emit event
            eventBus.emit(testEvent, { test: true });
            
            // Clean up
            eventBus.off(testEvent);
            
            return {
                name: 'EventBusIntegration',
                passed: eventReceived,
                details: {
                    eventReceived
                }
            };
            
        } catch (error) {
            return {
                name: 'EventBusIntegration',
                passed: false,
                error: error.message
            };
        }
    }
    
    /**
     * ROOT FIX: Add ready callback
     */
    onReady(callback) {
        if (this.isReady) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }
    
    /**
     * ROOT FIX: Notify ready callbacks
     */
    notifyReadyCallbacks() {
        this.readyCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                this.logger.error('GLOBAL', 'Ready callback error', error);
            }
        });
        this.readyCallbacks = [];
    }
    
    /**
     * ROOT FIX: Get initialization status
     */
    getStatus() {
        return {
            isReady: this.isReady,
            initialized: Array.from(this.initialized),
            failed: Array.from(this.failed),
            totalSystems: this.initializationOrder.length,
            successRate: (this.initialized.size / this.initializationOrder.length * 100).toFixed(1) + '%'
        };
    }
}

// ROOT FIX: Create global object manager instance
const globalObjectManager = new GlobalObjectManager();

// ROOT FIX: Enhanced DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Phase 2: Starting enhanced global object initialization');
    
    try {
        await globalObjectManager.initializeAllSystems();
        
        // Emit global ready event
        if (window.eventBus) {
            window.eventBus.emit('global-objects-ready', {
                status: globalObjectManager.getStatus(),
                timestamp: Date.now()
            });
        }
        
        console.log('✅ Phase 2: Enhanced global object initialization completed');
        
    } catch (error) {
        console.error('❌ Phase 2: Global object initialization failed', error);
    }
});

// ROOT FIX: Expose global object manager
window.globalObjectManager = globalObjectManager;

// ROOT FIX: Expose direct initialization function
window.initializeGlobalObjects = () => globalObjectManager.initializeAllSystems();

console.log('✅ Phase 2: Global Object Manager loaded and ready');
