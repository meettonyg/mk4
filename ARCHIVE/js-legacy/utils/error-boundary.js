/**
 * Error Boundary System
 * Provides comprehensive error handling and recovery strategies
 */

import { structuredLogger } from './structured-logger.js';

class ErrorBoundary {
    constructor(logger = structuredLogger) {
        this.logger = logger;
        this.errorHandlers = new Map();
        this.errorHistory = [];
        this.recoveryStrategies = new Map();
        this.maxHistorySize = 100;
        this.globalHandlersSetup = false;
        
        // Default error types
        this.errorTypes = {
            NETWORK: 'NetworkError',
            TIMEOUT: 'TimeoutError',
            VALIDATION: 'ValidationError',
            STATE: 'StateError',
            INITIALIZATION: 'InitializationError',
            RACE_CONDITION: 'RaceConditionError',
            DOM: 'DOMError',
            UNKNOWN: 'UnknownError'
        };
        
        // Setup default handlers
        this.setupDefaultHandlers();
        
        // Setup global error handlers
        this.setupGlobalHandlers();
    }
    
    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        if (this.globalHandlersSetup) return;
        
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledRejection(event.reason, {
                promise: event.promise
            });
        });
        
        this.globalHandlersSetup = true;
        this.logger.debug('ERROR', 'Global error handlers setup');
    }
    
    /**
     * Setup default error handlers
     */
    setupDefaultHandlers() {
        // Network errors
        this.registerHandler(this.errorTypes.NETWORK, async (error, context) => {
            this.logger.warn('ERROR', 'Network error - attempting retry', context);
            
            if (context.retryCount < 3) {
                await this.delay(1000 * Math.pow(2, context.retryCount)); // Exponential backoff
                return { retry: true, retryCount: (context.retryCount || 0) + 1 };
            }
            
            return { fallback: context.fallbackValue || null };
        });
        
        // Timeout errors
        this.registerHandler(this.errorTypes.TIMEOUT, (error, context) => {
            this.logger.warn('ERROR', 'Operation timeout', context);
            return { fallback: context.fallbackValue || null };
        });
        
        // Validation errors
        this.registerHandler(this.errorTypes.VALIDATION, (error, context) => {
            this.logger.error('ERROR', 'Validation failed', error, context);
            return { handled: true, showToast: true };
        });
        
        // State errors
        this.registerHandler(this.errorTypes.STATE, async (error, context) => {
            this.logger.error('ERROR', 'State error - attempting recovery', error, context);
            
            if (context.module && context.lastKnownGoodState) {
                return { 
                    rollback: true, 
                    state: context.lastKnownGoodState 
                };
            }
            
            return { reset: true };
        });
        
        // Race condition errors
        this.registerHandler(this.errorTypes.RACE_CONDITION, async (error, context) => {
            this.logger.error('ERROR', 'Race condition detected', error, context);
            
            if (context.waitFor) {
                await this.waitForCondition(context.waitFor, context.timeout || 5000);
                return { retry: true };
            }
            
            return { defer: true, delay: 1000 };
        });
    }
    
    /**
     * Wrap a function with error handling
     */
    catch(module, fn, options = {}) {
        const {
            fallback = null,
            errorType = this.errorTypes.UNKNOWN,
            retryCount = 0,
            silent = false
        } = options;
        
        return (...args) => {
            try {
                const result = fn(...args);
                
                // Handle promises
                if (result && typeof result.then === 'function') {
                    return result.catch(error => {
                        return this.handleError(module, error, {
                            errorType,
                            fallback,
                            retryCount,
                            silent,
                            args
                        });
                    });
                }
                
                return result;
            } catch (error) {
                return this.handleError(module, error, {
                    errorType,
                    fallback,
                    retryCount,
                    silent,
                    args
                });
            }
        };
    }
    
    /**
     * Wrap an async function
     */
    wrapAsync(module, fn, options = {}) {
        return async (...args) => {
            const startTime = performance.now();
            
            try {
                const result = await fn(...args);
                
                // Log successful operation
                if (options.logSuccess) {
                    this.logger.debug(module, `Operation completed`, {
                        duration: performance.now() - startTime
                    });
                }
                
                return result;
            } catch (error) {
                return await this.handleError(module, error, {
                    ...options,
                    args,
                    duration: performance.now() - startTime
                });
            }
        };
    }
    
    /**
     * Handle an error
     */
    async handleError(module, error, context = {}) {
        // Record error
        this.recordError(module, error, context);
        
        // Log error
        if (!context.silent) {
            this.logger.error(module, error.message || 'Unknown error', error, context);
        }
        
        // Find appropriate handler
        const errorType = this.classifyError(error, context);
        const handler = this.errorHandlers.get(errorType) || this.errorHandlers.get(this.errorTypes.UNKNOWN);
        
        if (handler) {
            try {
                const result = await handler(error, { ...context, module });
                
                // Handle recovery strategies
                if (result.retry && context.retryCount < 3) {
                    this.logger.info(module, 'Retrying operation', { 
                        attempt: context.retryCount + 1 
                    });
                    // The calling code should handle retry logic
                    throw Object.assign(error, { retry: true, retryCount: context.retryCount + 1 });
                }
                
                if (result.rollback) {
                    return await this.rollback(module, result.state);
                }
                
                if (result.fallback !== undefined) {
                    this.logger.info(module, 'Using fallback value', { 
                        fallback: result.fallback 
                    });
                    return result.fallback;
                }
                
                if (result.defer) {
                    await this.delay(result.delay || 1000);
                    throw error; // Re-throw for caller to handle
                }
                
                if (result.showToast && window.mkToast) {
                    window.mkToast.error(error.message || 'An error occurred');
                }
                
            } catch (handlerError) {
                this.logger.error('ERROR', 'Error handler failed', handlerError);
            }
        }
        
        // If no handler or handler failed, use fallback
        if (context.fallback !== undefined) {
            return context.fallback;
        }
        
        // Re-throw if not handled
        throw error;
    }
    
    /**
     * Register an error handler
     */
    registerHandler(errorType, handler) {
        this.errorHandlers.set(errorType, handler);
        this.logger.debug('ERROR', `Registered handler for ${errorType}`);
    }
    
    /**
     * Register a recovery strategy
     */
    registerRecoveryStrategy(module, strategy) {
        this.recoveryStrategies.set(module, strategy);
        this.logger.debug('ERROR', `Registered recovery strategy for ${module}`);
    }
    
    /**
     * Classify error type
     */
    classifyError(error, context = {}) {
        // Check context hints
        if (context.errorType) {
            return context.errorType;
        }
        
        // Check error properties
        if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
            return this.errorTypes.NETWORK;
        }
        
        if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
            return this.errorTypes.TIMEOUT;
        }
        
        if (error.name === 'ValidationError' || error.message?.includes('validation')) {
            return this.errorTypes.VALIDATION;
        }
        
        if (error.message?.includes('race condition')) {
            return this.errorTypes.RACE_CONDITION;
        }
        
        if (error.message?.includes('state')) {
            return this.errorTypes.STATE;
        }
        
        if (error.message?.includes('DOM') || error.message?.includes('element')) {
            return this.errorTypes.DOM;
        }
        
        return this.errorTypes.UNKNOWN;
    }
    
    /**
     * Record error for history
     */
    recordError(module, error, context) {
        const errorRecord = {
            timestamp: performance.now(),
            module,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context,
            type: this.classifyError(error, context)
        };
        
        this.errorHistory.push(errorRecord);
        
        // Limit history size
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
    }
    
    /**
     * Attempt recovery
     */
    async attemptRecovery(error, context) {
        const strategy = this.recoveryStrategies.get(context.module);
        
        if (strategy) {
            try {
                this.logger.info(context.module, 'Attempting recovery');
                const result = await strategy(error, context);
                
                if (result.success) {
                    this.logger.info(context.module, 'Recovery successful');
                    return result.value;
                }
            } catch (recoveryError) {
                this.logger.error(context.module, 'Recovery failed', recoveryError);
            }
        }
        
        return null;
    }
    
    /**
     * Rollback to a previous state
     */
    async rollback(module, state) {
        this.logger.info(module, 'Rolling back to previous state');
        
        try {
            // Module-specific rollback
            if (module === 'STATE' && window.mkState) {
                await window.mkState.restore(state);
            } else {
                // Generic rollback
                this.logger.warn(module, 'No specific rollback strategy, using generic approach');
            }
            
            return state;
        } catch (rollbackError) {
            this.logger.error(module, 'Rollback failed', rollbackError);
            throw rollbackError;
        }
    }
    
    /**
     * Handle global errors
     */
    handleGlobalError(error, context) {
        this.logger.error('GLOBAL', 'Uncaught error', error, context);
        this.recordError('GLOBAL', error, context);
        
        // Show user-friendly error if toast is available
        if (window.mkToast) {
            window.mkToast.error('An unexpected error occurred. Please refresh the page if issues persist.');
        }
    }
    
    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(reason, context) {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        this.logger.error('PROMISE', 'Unhandled promise rejection', error, context);
        this.recordError('PROMISE', error, context);
    }
    
    /**
     * Wait for a condition to be met
     */
    async waitForCondition(checkFn, timeout = 5000) {
        const startTime = performance.now();
        const checkInterval = 100;
        
        while (performance.now() - startTime < timeout) {
            try {
                if (await checkFn()) {
                    return true;
                }
            } catch (error) {
                // Ignore errors during condition check
            }
            
            await this.delay(checkInterval);
        }
        
        throw new Error('Condition timeout');
    }
    
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {
            total: this.errorHistory.length,
            byType: {},
            byModule: {},
            recent: this.errorHistory.slice(-10)
        };
        
        this.errorHistory.forEach(record => {
            // By type
            stats.byType[record.type] = (stats.byType[record.type] || 0) + 1;
            
            // By module
            stats.byModule[record.module] = (stats.byModule[record.module] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * Generate error report
     */
    generateReport() {
        const stats = this.getErrorStats();
        
        console.group('%c🛡️ Error Boundary Report', 'font-size: 14px; font-weight: bold; color: #F44336');
        console.log('%c' + '='.repeat(80), 'color: #666');
        
        console.log('Total Errors:', stats.total);
        
        if (stats.total > 0) {
            console.log('\n%cErrors by Type:', 'font-weight: bold;');
            Object.entries(stats.byType).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });
            
            console.log('\n%cErrors by Module:', 'font-weight: bold;');
            Object.entries(stats.byModule).forEach(([module, count]) => {
                console.log(`  ${module}: ${count}`);
            });
            
            console.log('\n%cRecent Errors:', 'font-weight: bold;');
            stats.recent.forEach((record, index) => {
                console.log(`  ${index + 1}. [${record.module}] ${record.error.message}`);
            });
        } else {
            console.log('✅ No errors recorded');
        }
        
        console.groupEnd();
    }
    
    /**
     * Clear error history
     */
    clearHistory() {
        this.errorHistory = [];
        this.logger.info('ERROR', 'Error history cleared');
    }
}

// Create singleton instance
const errorBoundary = new ErrorBoundary();

// Export
export { errorBoundary, ErrorBoundary };