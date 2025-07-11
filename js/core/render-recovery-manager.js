/**
 * @file render-recovery-manager.js
 * @description Automatic render recovery system for Media Kit Builder
 * 
 * PHASE 2B: Comprehensive error recovery for failed component renders
 * - Multiple recovery strategies (retry, fallback, reset, replace)
 * - Exponential backoff retry logic
 * - Fallback rendering using cached templates
 * - User notifications for persistent failures
 * - Integration with validation system for health monitoring
 * 
 * @version 1.0.0
 * @architecture enhanced-registrar-based
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { performanceMonitor } from '../utils/performance-monitor.js';
import { eventBus } from './event-bus.js';
import { showToast } from '../utils/toast-polyfill.js';
import { renderValidator } from './render-validator.js';

/**
 * Enterprise-grade automatic render recovery system
 */
class RenderRecoveryManager {
    constructor() {
        this.logger = structuredLogger;
        
        // Recovery configuration
        this.recoveryConfig = {
            maxRetryAttempts: 3,
            retryDelays: [250, 750, 2000], // Progressive delays in ms
            fallbackTimeout: 5000, // Max time to spend on fallback
            healthCheckInterval: 10000, // Health check every 10 seconds
            
            // Recovery strategy priorities
            strategyOrder: ['retry', 'fallback', 'reset', 'replace'],
            
            // Error type to strategy mapping
            errorStrategies: {
                'timeout': ['retry', 'fallback'],
                'network': ['retry', 'fallback'],
                'permission': ['fallback', 'replace'],
                'validation': ['reset', 'retry'],
                'corruption': ['reset', 'replace'],
                'memory': ['fallback', 'reset'],
                'unknown': ['retry', 'fallback', 'reset']
            }
        };
        
        // Recovery state tracking
        this.recoveryQueue = new Map(); // componentId -> recovery task
        this.recoveryHistory = new Map(); // componentId -> recovery attempts
        this.componentHealth = new Map(); // componentId -> health status
        this.failurePatterns = new Map(); // error type -> frequency
        
        // Template cache for fallback rendering
        this.templateCache = new Map(); // componentType -> cached template
        this.lastKnownGoodStates = new Map(); // componentId -> state snapshot
        
        // Recovery statistics
        this.statistics = {
            totalRecoveries: 0,
            successfulRecoveries: 0,
            failedRecoveries: 0,
            strategiesUsed: {
                retry: 0,
                fallback: 0,
                reset: 0,
                replace: 0
            },
            averageRecoveryTime: 0,
            mostCommonErrors: new Map()
        };
        
        // User notification management
        this.userNotifications = {
            enabled: true,
            lastNotificationTime: 0,
            notificationCooldown: 30000, // 30 seconds between notifications
            errorThreshold: 3, // Show notification after 3 consecutive failures
            consecutiveFailures: 0
        };
        
        // Circuit breaker for cascade failure prevention
        this.circuitBreaker = {
            state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
            failureCount: 0,
            maxFailures: 5,
            resetTimeout: 60000, // 1 minute
            lastFailureTime: 0
        };
        
        this.setupEventListeners();
        this.startHealthMonitoring();
        
        this.logger.info('RENDER_RECOVERY', 'Render recovery manager initialized');
    }
    
    /**
     * Main recovery entry point - triggered when a render fails
     * 
     * @param {string} componentId - Failed component ID
     * @param {Object} renderData - Original render data
     * @param {Object} error - Error details
     * @param {Object} options - Recovery options
     * @returns {Promise<Object>} Recovery result
     */
    async initiateRecovery(componentId, renderData, error, options = {}) {
        const recoveryStartTime = performance.now();
        const perfEnd = performanceMonitor.start('render-recovery', { componentId });
        
        try {
            // Check circuit breaker
            if (!this.checkCircuitBreaker()) {
                this.logger.warn('RENDER_RECOVERY', 'Circuit breaker OPEN, skipping recovery', {
                    componentId
                });
                return this.createRecoveryResult(componentId, false, 'circuit_breaker_open');
            }
            
            // Analyze error and determine recovery strategy
            const errorAnalysis = this.analyzeError(error);
            const recoveryStrategies = this.selectRecoveryStrategies(errorAnalysis, options);
            
            this.logger.info('RENDER_RECOVERY', 'Starting recovery process', {
                componentId,
                errorType: errorAnalysis.type,
                strategies: recoveryStrategies,
                attempt: this.getRecoveryAttemptCount(componentId) + 1
            });
            
            // Track recovery attempt
            this.trackRecoveryAttempt(componentId, errorAnalysis, recoveryStrategies);
            
            // Execute recovery strategies in order
            const recoveryResult = await this.executeRecoveryStrategies(
                componentId,
                renderData,
                errorAnalysis,
                recoveryStrategies,
                options
            );
            
            // Update statistics and handle result
            const recoveryTime = performance.now() - recoveryStartTime;
            this.updateRecoveryStatistics(recoveryResult, recoveryTime);
            
            if (recoveryResult.success) {
                this.handleSuccessfulRecovery(componentId, recoveryResult);
            } else {
                this.handleFailedRecovery(componentId, recoveryResult, error);
            }
            
            perfEnd();
            return recoveryResult;
            
        } catch (recoveryError) {
            perfEnd();
            this.logger.error('RENDER_RECOVERY', 'Recovery process failed', {
                componentId,
                error: recoveryError.message
            });
            
            this.recordCircuitBreakerFailure();
            return this.createRecoveryResult(componentId, false, 'recovery_error', {
                error: recoveryError.message
            });
        }
    }
    
    /**
     * Analyze error to determine appropriate recovery strategy
     */
    analyzeError(error) {
        const errorMessage = error.message || error.toString();
        const errorStack = error.stack || '';
        
        // Categorize error type
        let errorType = 'unknown';
        
        if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
            errorType = 'timeout';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            errorType = 'network';
        } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
            errorType = 'permission';
        } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
            errorType = 'validation';
        } else if (errorMessage.includes('corrupt') || errorMessage.includes('malformed')) {
            errorType = 'corruption';
        } else if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
            errorType = 'memory';
        }
        
        // Track error pattern
        this.updateErrorPattern(errorType);
        
        return {
            type: errorType,
            message: errorMessage,
            stack: errorStack,
            severity: this.calculateErrorSeverity(errorType, errorMessage),
            recoverable: this.isErrorRecoverable(errorType),
            timestamp: Date.now()
        };
    }
    
    /**
     * Select appropriate recovery strategies based on error analysis
     */
    selectRecoveryStrategies(errorAnalysis, options) {
        // Get strategies for this error type
        const errorStrategies = this.recoveryConfig.errorStrategies[errorAnalysis.type] || 
                               this.recoveryConfig.errorStrategies.unknown;
        
        // Filter strategies based on options and history
        const availableStrategies = errorStrategies.filter(strategy => {
            // Check if strategy is enabled
            if (options.disabledStrategies && options.disabledStrategies.includes(strategy)) {
                return false;
            }
            
            // Check if strategy has been overused
            if (this.isStrategyOverused(strategy)) {
                return false;
            }
            
            return true;
        });
        
        // Add user-preferred strategies
        if (options.preferredStrategies) {
            return [...options.preferredStrategies, ...availableStrategies]
                .filter((strategy, index, arr) => arr.indexOf(strategy) === index) // Remove duplicates
                .slice(0, 3); // Limit to 3 strategies max
        }
        
        return availableStrategies.slice(0, 2); // Use top 2 strategies
    }
    
    /**
     * Execute recovery strategies in order until one succeeds
     */
    async executeRecoveryStrategies(componentId, renderData, errorAnalysis, strategies, options) {
        let lastError = null;
        let strategyResults = [];
        
        for (const strategy of strategies) {
            try {
                this.logger.debug('RENDER_RECOVERY', `Attempting recovery strategy: ${strategy}`, {
                    componentId,
                    errorType: errorAnalysis.type
                });
                
                const strategyResult = await this.executeRecoveryStrategy(
                    strategy,
                    componentId,
                    renderData,
                    errorAnalysis,
                    options
                );
                
                strategyResults.push({
                    strategy,
                    ...strategyResult
                });
                
                if (strategyResult.success) {
                    // Validate the recovery
                    const validationResult = await this.validateRecovery(componentId);
                    
                    if (validationResult.passed) {
                        this.logger.info('RENDER_RECOVERY', 'Recovery successful', {
                            componentId,
                            strategy,
                            healthScore: validationResult.healthScore
                        });
                        
                        return this.createRecoveryResult(componentId, true, strategy, {
                            strategyResults,
                            validationResult
                        });
                    } else {
                        this.logger.warn('RENDER_RECOVERY', 'Recovery validation failed', {
                            componentId,
                            strategy,
                            healthScore: validationResult.healthScore
                        });
                        continue; // Try next strategy
                    }
                }
                
            } catch (strategyError) {
                this.logger.warn('RENDER_RECOVERY', `Recovery strategy failed: ${strategy}`, {
                    componentId,
                    error: strategyError.message
                });
                
                lastError = strategyError;
                strategyResults.push({
                    strategy,
                    success: false,
                    error: strategyError.message
                });
            }
        }
        
        // All strategies failed
        return this.createRecoveryResult(componentId, false, 'all_strategies_failed', {
            strategyResults,
            lastError: lastError?.message
        });
    }
    
    /**
     * Execute individual recovery strategy
     */
    async executeRecoveryStrategy(strategy, componentId, renderData, errorAnalysis, options) {
        const startTime = performance.now();
        
        // Update strategy usage statistics
        this.statistics.strategiesUsed[strategy]++;
        
        let result;
        
        switch (strategy) {
            case 'retry':
                result = await this.executeRetryStrategy(componentId, renderData, options);
                break;
            case 'fallback':
                result = await this.executeFallbackStrategy(componentId, renderData, options);
                break;
            case 'reset':
                result = await this.executeResetStrategy(componentId, renderData, options);
                break;
            case 'replace':
                result = await this.executeReplaceStrategy(componentId, renderData, options);
                break;
            default:
                throw new Error(`Unknown recovery strategy: ${strategy}`);
        }
        
        return {
            ...result,
            strategy,
            duration: performance.now() - startTime
        };
    }
    
    /**
     * RETRY STRATEGY: Attempt to render again with fresh data
     */
    async executeRetryStrategy(componentId, renderData, options) {
        const retryAttempt = this.getRetryAttemptCount(componentId);
        
        if (retryAttempt >= this.recoveryConfig.maxRetryAttempts) {
            throw new Error('Maximum retry attempts exceeded');
        }
        
        // Wait before retry (exponential backoff)
        const delay = this.recoveryConfig.retryDelays[Math.min(retryAttempt, this.recoveryConfig.retryDelays.length - 1)];
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Clean up any existing element
        const existingElement = document.getElementById(componentId);
        if (existingElement) {
            existingElement.remove();
        }
        
        // Attempt render with fresh data
        const renderer = this.getRenderer();
        if (!renderer) {
            throw new Error('No renderer available for retry');
        }
        
        const renderResult = await renderer.renderComponent({
            id: componentId,
            type: renderData.type,
            props: { ...renderData.props } // Clone props to avoid reference issues
        });
        
        this.incrementRetryAttemptCount(componentId);
        
        return {
            success: !!renderResult,
            method: 'retry',
            attempt: retryAttempt + 1,
            delay
        };
    }
    
    /**
     * FALLBACK STRATEGY: Use cached template or simplified version
     */
    async executeFallbackStrategy(componentId, renderData, options) {
        // Try to use cached template first
        let fallbackHTML = this.getCachedTemplate(renderData.type);
        
        if (!fallbackHTML) {
            // Generate simplified fallback
            fallbackHTML = this.generateFallbackHTML(componentId, renderData);
        }
        
        // Create fallback element
        const fallbackElement = this.createFallbackElement(componentId, fallbackHTML, renderData);
        
        // Insert into DOM
        const container = document.getElementById('media-kit-preview');
        if (!container) {
            throw new Error('Preview container not found');
        }
        
        // Remove existing element if present
        const existingElement = document.getElementById(componentId);
        if (existingElement) {
            existingElement.remove();
        }
        
        container.appendChild(fallbackElement);
        
        // Cache this template for future use
        this.cacheTemplate(renderData.type, fallbackHTML);
        
        return {
            success: true,
            method: 'fallback',
            cached: !!this.getCachedTemplate(renderData.type)
        };
    }
    
    /**
     * RESET STRATEGY: Reset component to last known good state
     */
    async executeResetStrategy(componentId, renderData, options) {
        // Get last known good state
        const lastGoodState = this.getLastKnownGoodState(componentId);
        
        if (!lastGoodState) {
            throw new Error('No last known good state available');
        }
        
        // Clean up current element
        const existingElement = document.getElementById(componentId);
        if (existingElement) {
            existingElement.remove();
        }
        
        // Render with last good state
        const renderer = this.getRenderer();
        if (!renderer) {
            throw new Error('No renderer available for reset');
        }
        
        const renderResult = await renderer.renderComponent({
            id: componentId,
            type: lastGoodState.type,
            props: { ...lastGoodState.props }
        });
        
        return {
            success: !!renderResult,
            method: 'reset',
            stateAge: Date.now() - lastGoodState.timestamp
        };
    }
    
    /**
     * REPLACE STRATEGY: Replace with error component
     */
    async executeReplaceStrategy(componentId, renderData, options) {
        const errorHTML = this.generateErrorComponentHTML(componentId, renderData);
        const errorElement = this.createErrorElement(componentId, errorHTML, renderData);
        
        // Insert into DOM
        const container = document.getElementById('media-kit-preview');
        if (!container) {
            throw new Error('Preview container not found');
        }
        
        // Remove existing element if present
        const existingElement = document.getElementById(componentId);
        if (existingElement) {
            existingElement.remove();
        }
        
        container.appendChild(errorElement);
        
        return {
            success: true,
            method: 'replace',
            isErrorComponent: true
        };
    }
    
    /**
     * Validate recovery success using render validator
     */
    async validateRecovery(componentId) {
        try {
            return await renderValidator.validateRender(componentId, {
                timeout: 2000, // Quick validation for recovery
                requiredScore: 60 // Lower threshold for recovery validation
            });
        } catch (error) {
            this.logger.warn('RENDER_RECOVERY', 'Recovery validation failed', {
                componentId,
                error: error.message
            });
            
            return {
                passed: false,
                healthScore: 0,
                error: error.message
            };
        }
    }
    
    /**
     * Generate fallback HTML for component types
     */
    generateFallbackHTML(componentId, renderData) {
        const componentType = renderData.type;
        const props = renderData.props || {};
        
        switch (componentType) {
            case 'hero':
                return `
                    <div class="hero-fallback">
                        <h1>${props.title || 'Hero Section'}</h1>
                        <p>${props.subtitle || 'This component is temporarily unavailable.'}</p>
                        <button class="fallback-btn">Learn More</button>
                    </div>
                `;
            
            case 'text':
                return `
                    <div class="text-fallback">
                        <p>${props.content || 'Text content is being loaded...'}</p>
                    </div>
                `;
            
            case 'image':
                return `
                    <div class="image-fallback">
                        <div class="placeholder-image">
                            <span>📷 Image loading...</span>
                        </div>
                        <p>${props.caption || ''}</p>
                    </div>
                `;
            
            case 'cta':
                return `
                    <div class="cta-fallback">
                        <button class="fallback-btn">${props.text || 'Click Here'}</button>
                    </div>
                `;
            
            default:
                return `
                    <div class="default-fallback">
                        <h3>${componentType} Component</h3>
                        <p>This component is temporarily unavailable.</p>
                        <button onclick="this.parentElement.remove()" class="remove-btn">Remove</button>
                    </div>
                `;
        }
    }
    
    /**
     * Generate error component HTML
     */
    generateErrorComponentHTML(componentId, renderData) {
        return `
            <div class="error-component">
                <div class="error-icon">⚠️</div>
                <h3>Component Error</h3>
                <p>The ${renderData.type} component encountered an error and couldn't be loaded.</p>
                <div class="error-actions">
                    <button onclick="window.renderRecoveryManager.retryComponent('${componentId}')" 
                            class="retry-btn">Try Again</button>
                    <button onclick="this.closest('.editable-element').remove()" 
                            class="remove-btn">Remove</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Create fallback DOM element
     */
    createFallbackElement(componentId, fallbackHTML, renderData) {
        const element = document.createElement('div');
        element.id = componentId;
        element.className = 'editable-element component-fallback';
        element.dataset.componentId = componentId;
        element.dataset.componentType = renderData.type;
        element.dataset.fallback = 'true';
        element.innerHTML = fallbackHTML;
        
        // Add fallback styling
        element.style.cssText = `
            border: 2px dashed #ccc;
            padding: 20px;
            margin: 10px 0;
            background-color: #f9f9f9;
            border-radius: 8px;
            text-align: center;
            opacity: 0.8;
        `;
        
        return element;
    }
    
    /**
     * Create error DOM element
     */
    createErrorElement(componentId, errorHTML, renderData) {
        const element = document.createElement('div');
        element.id = componentId;
        element.className = 'editable-element component-error';
        element.dataset.componentId = componentId;
        element.dataset.componentType = renderData.type;
        element.dataset.error = 'true';
        element.innerHTML = errorHTML;
        
        // Add error styling
        element.style.cssText = `
            border: 2px solid #ff6b6b;
            padding: 20px;
            margin: 10px 0;
            background-color: #ffe6e6;
            border-radius: 8px;
            text-align: center;
            color: #d63031;
        `;
        
        return element;
    }
    
    /**
     * Template caching utilities
     */
    cacheTemplate(componentType, html) {
        this.templateCache.set(componentType, {
            html,
            timestamp: Date.now()
        });
    }
    
    getCachedTemplate(componentType) {
        const cached = this.templateCache.get(componentType);
        if (cached && (Date.now() - cached.timestamp) < 300000) { // 5 minutes
            return cached.html;
        }
        return null;
    }
    
    /**
     * Last known good state management
     */
    saveLastKnownGoodState(componentId, renderData) {
        this.lastKnownGoodStates.set(componentId, {
            ...renderData,
            timestamp: Date.now()
        });
    }
    
    getLastKnownGoodState(componentId) {
        const state = this.lastKnownGoodStates.get(componentId);
        if (state && (Date.now() - state.timestamp) < 600000) { // 10 minutes
            return state;
        }
        return null;
    }
    
    /**
     * Recovery tracking utilities
     */
    trackRecoveryAttempt(componentId, errorAnalysis, strategies) {
        if (!this.recoveryHistory.has(componentId)) {
            this.recoveryHistory.set(componentId, {
                attempts: [],
                totalAttempts: 0,
                lastAttempt: 0
            });
        }
        
        const history = this.recoveryHistory.get(componentId);
        history.attempts.push({
            timestamp: Date.now(),
            errorType: errorAnalysis.type,
            strategies,
            success: false // Will be updated later
        });
        history.totalAttempts++;
        history.lastAttempt = Date.now();
        
        this.statistics.totalRecoveries++;
    }
    
    getRecoveryAttemptCount(componentId) {
        const history = this.recoveryHistory.get(componentId);
        return history ? history.totalAttempts : 0;
    }
    
    getRetryAttemptCount(componentId) {
        const history = this.recoveryHistory.get(componentId);
        if (!history) return 0;
        
        return history.attempts.filter(attempt => 
            attempt.strategies.includes('retry')
        ).length;
    }
    
    incrementRetryAttemptCount(componentId) {
        // This is tracked automatically in trackRecoveryAttempt
    }
    
    /**
     * Handle successful recovery
     */
    handleSuccessfulRecovery(componentId, recoveryResult) {
        // Update statistics
        this.statistics.successfulRecoveries++;
        
        // Reset consecutive failures
        this.userNotifications.consecutiveFailures = 0;
        
        // Update recovery history
        const history = this.recoveryHistory.get(componentId);
        if (history && history.attempts.length > 0) {
            history.attempts[history.attempts.length - 1].success = true;
        }
        
        // Save current state as last known good
        if (recoveryResult.validationResult && recoveryResult.validationResult.passed) {
            // Get current component data from state manager
            if (window.enhancedStateManager) {
                const state = window.enhancedStateManager.getState();
                const componentData = state.components[componentId];
                if (componentData) {
                    this.saveLastKnownGoodState(componentId, componentData);
                }
            }
        }
        
        // Emit success event
        eventBus.emit('render:recovery-success', {
            componentId,
            strategy: recoveryResult.strategy,
            healthScore: recoveryResult.validationResult?.healthScore
        });
        
        this.logger.info('RENDER_RECOVERY', 'Recovery completed successfully', {
            componentId,
            strategy: recoveryResult.strategy
        });
    }
    
    /**
     * Handle failed recovery
     */
    handleFailedRecovery(componentId, recoveryResult, originalError) {
        // Update statistics
        this.statistics.failedRecoveries++;
        
        // Track consecutive failures
        this.userNotifications.consecutiveFailures++;
        
        // Record circuit breaker failure
        this.recordCircuitBreakerFailure();
        
        // Send user notification if threshold reached
        this.handleUserNotification(componentId, originalError);
        
        // Emit failure event
        eventBus.emit('render:recovery-failed', {
            componentId,
            originalError: originalError.message,
            recoveryResult
        });
        
        this.logger.error('RENDER_RECOVERY', 'Recovery failed', {
            componentId,
            originalError: originalError.message,
            strategiesAttempted: recoveryResult.strategyResults?.map(r => r.strategy)
        });
    }
    
    /**
     * Handle user notifications for persistent failures
     */
    handleUserNotification(componentId, error) {
        if (!this.userNotifications.enabled) return;
        
        const now = Date.now();
        const cooldownPassed = (now - this.userNotifications.lastNotificationTime) > 
                              this.userNotifications.notificationCooldown;
        
        if (this.userNotifications.consecutiveFailures >= this.userNotifications.errorThreshold && 
            cooldownPassed) {
            
            showToast(
                `Component rendering issues detected. ${this.userNotifications.consecutiveFailures} consecutive failures. Please try refreshing the page.`,
                'error',
                8000
            );
            
            this.userNotifications.lastNotificationTime = now;
        }
    }
    
    /**
     * Utility methods
     */
    getRenderer() {
        return window.enhancedComponentRenderer || window.renderer;
    }
    
    calculateErrorSeverity(errorType, errorMessage) {
        const severityMap = {
            'timeout': 'medium',
            'network': 'medium',
            'permission': 'high',
            'validation': 'low',
            'corruption': 'high',
            'memory': 'high',
            'unknown': 'medium'
        };
        
        return severityMap[errorType] || 'medium';
    }
    
    isErrorRecoverable(errorType) {
        const nonRecoverableTypes = ['permission'];
        return !nonRecoverableTypes.includes(errorType);
    }
    
    updateErrorPattern(errorType) {
        const current = this.failurePatterns.get(errorType) || 0;
        this.failurePatterns.set(errorType, current + 1);
        
        // Update most common errors
        this.statistics.mostCommonErrors.set(errorType, current + 1);
    }
    
    isStrategyOverused(strategy) {
        const totalUsage = this.statistics.strategiesUsed[strategy] || 0;
        const totalRecoveries = this.statistics.totalRecoveries;
        
        if (totalRecoveries === 0) return false;
        
        // Consider overused if used in more than 80% of recoveries
        return (totalUsage / totalRecoveries) > 0.8;
    }
    
    createRecoveryResult(componentId, success, strategy, details = {}) {
        return {
            componentId,
            success,
            strategy,
            timestamp: Date.now(),
            ...details
        };
    }
    
    updateRecoveryStatistics(result, recoveryTime) {
        const total = this.statistics.totalRecoveries;
        this.statistics.averageRecoveryTime = 
            (this.statistics.averageRecoveryTime * (total - 1) + recoveryTime) / total;
    }
    
    /**
     * Circuit breaker implementation
     */
    checkCircuitBreaker() {
        const now = Date.now();
        
        // Reset if enough time has passed
        if (this.circuitBreaker.state === 'OPEN' && 
            (now - this.circuitBreaker.lastFailureTime) > this.circuitBreaker.resetTimeout) {
            this.circuitBreaker.state = 'HALF_OPEN';
            this.circuitBreaker.failureCount = 0;
            this.logger.info('RENDER_RECOVERY', 'Circuit breaker reset to HALF_OPEN');
        }
        
        return this.circuitBreaker.state !== 'OPEN';
    }
    
    recordCircuitBreakerFailure() {
        this.circuitBreaker.failureCount++;
        this.circuitBreaker.lastFailureTime = Date.now();
        
        if (this.circuitBreaker.failureCount >= this.circuitBreaker.maxFailures) {
            this.circuitBreaker.state = 'OPEN';
            this.logger.warn('RENDER_RECOVERY', 'Circuit breaker OPENED', {
                failureCount: this.circuitBreaker.failureCount
            });
        }
    }
    
    /**
     * Health monitoring
     */
    startHealthMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, this.recoveryConfig.healthCheckInterval);
    }
    
    async performHealthCheck() {
        // Check all components in preview for health issues
        const previewContainer = document.getElementById('media-kit-preview');
        if (!previewContainer) return;
        
        const components = previewContainer.querySelectorAll('[data-component-id]');
        let unhealthyComponents = 0;
        
        for (const element of components) {
            const componentId = element.dataset.componentId;
            if (!componentId) continue;
            
            // Quick zombie detection
            const zombieResult = renderValidator.detectZombieComponent(componentId);
            if (zombieResult.isZombie) {
                unhealthyComponents++;
                
                // Attempt automatic recovery for zombie components
                this.logger.warn('RENDER_RECOVERY', 'Zombie component detected during health check', {
                    componentId,
                    zombieScore: zombieResult.zombieScore
                });
                
                // Queue recovery with low priority
                setTimeout(() => {
                    this.initiateRecovery(componentId, {
                        type: element.dataset.componentType || 'default',
                        props: {}
                    }, new Error('Zombie component detected'), {
                        priority: 'low'
                    });
                }, 1000);
            }
        }
        
        // Update component health status
        this.componentHealth.set('healthCheck', {
            timestamp: Date.now(),
            totalComponents: components.length,
            unhealthyComponents,
            healthPercentage: components.length > 0 ? 
                ((components.length - unhealthyComponents) / components.length) * 100 : 100
        });
    }
    
    /**
     * Public API methods
     */
    
    /**
     * Manually retry a component (called from error component buttons)
     */
    async retryComponent(componentId) {
        this.logger.info('RENDER_RECOVERY', 'Manual retry requested', { componentId });
        
        // Get component data from state manager
        if (window.enhancedStateManager) {
            const state = window.enhancedStateManager.getState();
            const componentData = state.components[componentId];
            
            if (componentData) {
                return await this.initiateRecovery(
                    componentId,
                    componentData,
                    new Error('Manual retry requested'),
                    { preferredStrategies: ['retry', 'reset'] }
                );
            }
        }
        
        throw new Error('Component data not found for manual retry');
    }
    
    /**
     * Get recovery statistics
     */
    getStatistics() {
        return {
            ...this.statistics,
            circuitBreakerState: this.circuitBreaker.state,
            recoveryQueueSize: this.recoveryQueue.size,
            templateCacheSize: this.templateCache.size,
            componentHealthStatus: this.componentHealth.get('healthCheck'),
            successRate: this.statistics.totalRecoveries > 0 ? 
                (this.statistics.successfulRecoveries / this.statistics.totalRecoveries) * 100 : 0
        };
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for render failures
        eventBus.on('render:failed', async (event) => {
            const { renderId, componentId, error } = event;
            
            // Get render data from state manager
            if (window.enhancedStateManager) {
                const state = window.enhancedStateManager.getState();
                const componentData = state.components[componentId];
                
                if (componentData) {
                    await this.initiateRecovery(
                        componentId,
                        componentData,
                        new Error(error),
                        { triggeredBy: 'render_failed_event' }
                    );
                }
            }
        });
        
        // Listen for validation failures
        eventBus.on('render:validated', (event) => {
            const { componentId, passed, healthScore } = event;
            
            // Trigger recovery for severely unhealthy components
            if (!passed && healthScore < 30) {
                setTimeout(() => {
                    if (window.enhancedStateManager) {
                        const state = window.enhancedStateManager.getState();
                        const componentData = state.components[componentId];
                        
                        if (componentData) {
                            this.initiateRecovery(
                                componentId,
                                componentData,
                                new Error('Component failed validation'),
                                { triggeredBy: 'validation_failure' }
                            );
                        }
                    }
                }, 2000); // Delay to avoid interfering with normal operations
            }
        });
    }
    
    /**
     * Debug method
     */
    debug() {
        console.group('%c🚑 Render Recovery Manager Debug', 'font-size: 14px; font-weight: bold; color: #EF4444');
        console.log('Recovery Statistics:', this.getStatistics());
        console.log('Recovery History:', Array.from(this.recoveryHistory.entries()));
        console.log('Error Patterns:', Array.from(this.failurePatterns.entries()));
        console.log('Template Cache:', Array.from(this.templateCache.keys()));
        console.log('Circuit Breaker:', this.circuitBreaker);
        console.groupEnd();
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        this.recoveryQueue.clear();
        this.recoveryHistory.clear();
        this.templateCache.clear();
        this.lastKnownGoodStates.clear();
        this.componentHealth.clear();
        
        this.logger.info('RENDER_RECOVERY', 'Render recovery manager destroyed');
    }
}

// Export singleton instance
export const renderRecoveryManager = new RenderRecoveryManager();

// Global exposure for debugging and manual recovery
if (typeof window !== 'undefined') {
    window.renderRecoveryManager = renderRecoveryManager;
}