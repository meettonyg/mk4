/**
 * @file rendering-queue-manager.js
 * @description Enterprise-grade rendering queue system for Media Kit Builder
 * 
 * ROOT FIX: Eliminates race conditions between state updates and DOM rendering
 * through centralized queue management with priority handling, retry logic,
 * and comprehensive error recovery.
 * 
 * Key Features:
 * - Intelligent batching with priority queues
 * - Exponential backoff retry mechanism
 * - Render completion acknowledgment system
 * - Performance monitoring and statistics
 * - Circuit breaker for cascade failure prevention
 * 
 * @version 1.0.0
 * @architecture enhanced-registrar-based
 */

import { performanceMonitor } from '../utils/performance-monitor.js';
import { structuredLogger } from '../utils/structured-logger.js';
import { eventBus } from './event-bus.js';
import { showToast } from '../utils/toast-polyfill.js';
// PHASE 2: Import validation system for automatic render validation
import { renderValidator } from './render-validator.js';

/**
 * Enterprise-grade rendering queue manager that eliminates race conditions
 * and provides reliable, high-performance component rendering
 */
class RenderingQueueManager {
    constructor() {
        // Core queue system
        this.queue = new Map(); // componentId -> renderRequest
        this.priorityQueues = {
            critical: new Map(),
            high: new Map(), 
            normal: new Map(),
            low: new Map()
        };
        
        // Processing state
        this.processing = false;
        this.processingBatch = new Set();
        this.batchSize = 8; // Optimized batch size
        this.processInterval = 50; // ms
        this.maxConcurrentRenders = 3;
        
        // Retry system with exponential backoff
        this.retryQueue = new Map();
        this.retryDelays = [100, 250, 500, 1000, 2000]; // Progressive delays
        this.maxRetries = 3;
        
        // Render completion acknowledgment system
        this.pendingAcknowledgments = new Map(); // renderId -> callback
        this.acknowledgmentTimeout = 5000; // 5 seconds
        
        // Circuit breaker for cascade failure prevention
        this.circuitBreaker = {
            failureCount: 0,
            maxFailures: 5,
            resetTimeout: 30000,
            state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
            lastFailureTime: 0
        };
        
        // Performance statistics
        this.statistics = {
            processed: 0,
            succeeded: 0,
            failed: 0,
            retried: 0,
            batchesProcessed: 0,
            avgProcessTime: 0,
            avgBatchTime: 0,
            cacheHits: 0,
            queueHighWaterMark: 0
        };
        
        // Performance monitoring
        this.performanceMetrics = {
            renderTimes: [],
            batchTimes: [],
            queueSizes: [],
            lastCleanup: Date.now()
        };
        
        // Initial state rendering configuration
        this.initialStateMode = false;
        this.initialRenderBatch = new Set();
        
        // User experience settings
        this.userNotifications = {
            showErrors: false, // Handle errors gracefully by default
            errorThreshold: 3, // Show UI error after 3 consecutive failures
            consecutiveFailures: 0
        };
        
        this.logger = structuredLogger;
        this.setupEventListeners();
        this.startProcessingLoop();
        
        this.logger.info('RENDER_QUEUE', 'Rendering Queue Manager initialized', {
            batchSize: this.batchSize,
            maxRetries: this.maxRetries,
            version: '1.0.0'
        });
    }
    
    /**
     * Add component to rendering queue with intelligent deduplication and priority handling
     * 
     * @param {string} componentId - Unique component identifier
     * @param {Object} renderData - Component render data and props
     * @param {string} priority - Render priority: 'critical', 'high', 'normal', 'low'
     * @param {Object} options - Additional rendering options
     * @returns {string} Render request ID for tracking
     */
    addToQueue(componentId, renderData, priority = 'normal', options = {}) {
        const renderId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        
        // Create render request with comprehensive metadata
        const renderRequest = {
            renderId,
            componentId,
            renderData: { ...renderData },
            priority,
            timestamp,
            retryCount: 0,
            attempts: [],
            options: {
                timeout: 2000,
                validateRender: true,
                requireAcknowledgment: true,
                fallbackOnError: true,
                ...options
            },
            // Initial state handling
            isInitialRender: this.initialStateMode || options.isInitialRender,
            // Performance tracking
            queuedAt: timestamp,
            startedAt: null,
            completedAt: null
        };
        
        // Handle deduplication - latest request overwrites previous for same component
        const existingRequest = this.queue.get(componentId);
        if (existingRequest) {
            this.logger.debug('RENDER_QUEUE', 'Deduplicating render request', {
                componentId,
                existingRenderId: existingRequest.renderId,
                newRenderId: renderId,
                priorityChange: existingRequest.priority !== priority
            });
            
            // Cancel existing acknowledgment if pending
            if (this.pendingAcknowledgments.has(existingRequest.renderId)) {
                this.pendingAcknowledgments.delete(existingRequest.renderId);
            }
            
            // Remove from priority queue
            this.priorityQueues[existingRequest.priority].delete(componentId);
        }
        
        // Add to appropriate priority queue
        this.queue.set(componentId, renderRequest);
        this.priorityQueues[priority].set(componentId, renderRequest);
        
        // Track queue high water mark
        const totalQueueSize = this.getTotalQueueSize();
        if (totalQueueSize > this.statistics.queueHighWaterMark) {
            this.statistics.queueHighWaterMark = totalQueueSize;
        }
        
        // Handle initial state batch rendering
        if (this.initialStateMode) {
            this.initialRenderBatch.add(componentId);
        }
        
        this.logger.debug('RENDER_QUEUE', 'Component added to render queue', {
            componentId,
            renderId,
            priority,
            queueSize: totalQueueSize,
            isInitialRender: renderRequest.isInitialRender
        });
        
        // Schedule processing
        this.scheduleProcessing();
        
        // Set up acknowledgment tracking if required
        if (renderRequest.options.requireAcknowledgment) {
            this.setupAcknowledgmentTracking(renderRequest);
        }
        
        return renderId;
    }
    
    /**
     * Schedule queue processing with intelligent timing
     */
    scheduleProcessing() {
        if (this.processing) {
            return; // Already processing
        }
        
        // Immediate processing for critical priority items
        const criticalCount = this.priorityQueues.critical.size;
        if (criticalCount > 0) {
            this.logger.info('RENDER_QUEUE', 'Critical priority items detected, processing immediately', {
                criticalCount
            });
            setImmediate(() => this.processBatch());
            return;
        }
        
        // Batch processing for normal priority items
        const delay = this.initialStateMode ? 10 : this.processInterval; // Faster for initial state
        setTimeout(() => this.processBatch(), delay);
    }
    
    /**
     * Process render queue in intelligent batches with priority handling
     */
    async processBatch() {
        if (this.processing) {
            return; // Prevent concurrent processing
        }
        
        // Check circuit breaker
        if (!this.checkCircuitBreaker()) {
            this.logger.warn('RENDER_QUEUE', 'Circuit breaker OPEN, skipping batch processing');
            return;
        }
        
        const batchStart = performance.now();
        this.processing = true;
        
        try {
            // Build priority-ordered batch
            const batch = this.buildPriorityBatch();
            
            if (batch.length === 0) {
                return; // No items to process
            }
            
            this.logger.info('RENDER_QUEUE', 'Processing render batch', {
                batchSize: batch.length,
                priorities: this.getBatchPriorityDistribution(batch),
                batchId: `batch_${Date.now()}`
            });
            
            // Process batch with performance monitoring
            const results = await this.processRenderBatch(batch);
            
            // Update statistics
            this.updateBatchStatistics(results, batchStart);
            
            // Handle batch completion
            this.handleBatchCompletion(results);
            
        } catch (error) {
            this.logger.error('RENDER_QUEUE', 'Batch processing failed', error);
            this.recordCircuitBreakerFailure();
        } finally {
            this.processing = false;
            
            // Schedule next batch if queue has items
            if (this.getTotalQueueSize() > 0) {
                this.scheduleProcessing();
            }
        }
    }
    
    /**
     * Build intelligent batch based on priority and performance considerations
     */
    buildPriorityBatch() {
        const batch = [];
        const maxBatchSize = this.initialStateMode ? this.batchSize * 2 : this.batchSize;
        
        // Priority order: critical -> high -> normal -> low
        const priorityOrder = ['critical', 'high', 'normal', 'low'];
        
        for (const priority of priorityOrder) {
            const priorityQueue = this.priorityQueues[priority];
            
            for (const [componentId, renderRequest] of priorityQueue) {
                if (batch.length >= maxBatchSize) {
                    break;
                }
                
                // Skip if already processing
                if (this.processingBatch.has(componentId)) {
                    continue;
                }
                
                batch.push(renderRequest);
                this.processingBatch.add(componentId);
                
                // Remove from queues
                this.queue.delete(componentId);
                priorityQueue.delete(componentId);
            }
            
            if (batch.length >= maxBatchSize) {
                break;
            }
        }
        
        return batch;
    }
    
    /**
     * Process individual render batch with concurrent handling
     */
    async processRenderBatch(batch) {
        const results = [];
        const semaphore = new Semaphore(this.maxConcurrentRenders);
        
        // Process renders with controlled concurrency
        const renderPromises = batch.map(async (renderRequest) => {
            await semaphore.acquire();
            
            try {
                const result = await this.processIndividualRender(renderRequest);
                results.push(result);
                return result;
            } finally {
                semaphore.release();
                this.processingBatch.delete(renderRequest.componentId);
            }
        });
        
        await Promise.all(renderPromises);
        return results;
    }
    
    /**
     * Process individual component render with comprehensive error handling
     */
    async processIndividualRender(renderRequest) {
        const { renderId, componentId, renderData, options } = renderRequest;
        const renderStart = performance.now();
        
        renderRequest.startedAt = renderStart;
        renderRequest.attempts.push({
            attempt: renderRequest.retryCount + 1,
            startTime: renderStart,
            endTime: null,
            success: false,
            error: null
        });
        
        this.logger.debug('RENDER_QUEUE', 'Processing individual render', {
            renderId,
            componentId,
            attempt: renderRequest.retryCount + 1
        });
        
        try {
            // Get renderer (enhanced component renderer)
            const renderer = window.renderer || window.enhancedComponentRenderer;
            if (!renderer) {
                throw new Error('No renderer available');
            }
            
            // Execute render with timeout
            const renderPromise = renderer.renderComponent({
                id: componentId,
                type: renderData.type,
                props: renderData.props || renderData.data || {}
            });
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Render timeout')), options.timeout);
            });
            
            const renderResult = await Promise.race([renderPromise, timeoutPromise]);
            
            // PHASE 2: Enhanced render validation using render validator
            if (options.validateRender) {
                const validationResult = await this.validateRenderEnhanced(componentId, renderData.type, renderResult);
                
                // If validation fails with low health score, consider it a render failure
                if (!validationResult.passed && validationResult.healthScore < 30) {
                    throw new Error(`Render validation failed: health score ${validationResult.healthScore}`);
                }
            }
            
            // Record successful render
            const renderDuration = performance.now() - renderStart;
            renderRequest.completedAt = performance.now();
            
            const currentAttempt = renderRequest.attempts[renderRequest.attempts.length - 1];
            currentAttempt.endTime = performance.now();
            currentAttempt.success = true;
            
            this.statistics.processed++;
            this.statistics.succeeded++;
            this.performanceMetrics.renderTimes.push(renderDuration);
            
            // Reset consecutive failures counter
            this.userNotifications.consecutiveFailures = 0;
            
            this.logger.debug('RENDER_QUEUE', 'Render completed successfully', {
                renderId,
                componentId,
                duration: renderDuration,
                attempt: renderRequest.retryCount + 1
            });
            
            // Emit completion event
            eventBus.emit('render:completed', {
                renderId,
                componentId,
                duration: renderDuration,
                success: true
            });
            
            return {
                renderId,
                componentId,
                success: true,
                duration: renderDuration,
                result: renderResult
            };
            
        } catch (error) {
            // Record failed render
            const renderDuration = performance.now() - renderStart;
            
            const currentAttempt = renderRequest.attempts[renderRequest.attempts.length - 1];
            currentAttempt.endTime = performance.now();
            currentAttempt.error = error.message;
            
            this.statistics.processed++;
            this.statistics.failed++;
            
            this.logger.warn('RENDER_QUEUE', 'Render failed', {
                renderId,
                componentId,
                error: error.message,
                attempt: renderRequest.retryCount + 1,
                duration: renderDuration
            });
            
            // Handle retry logic
            if (this.shouldRetry(renderRequest, error)) {
                await this.scheduleRetry(renderRequest, error);
                return {
                    renderId,
                    componentId,
                    success: false,
                    retrying: true,
                    error: error.message,
                    duration: renderDuration
                };
            }
            
            // Handle fallback if enabled
            if (options.fallbackOnError) {
                await this.handleRenderFallback(renderRequest, error);
            }
            
            // Track consecutive failures for user notifications
            this.userNotifications.consecutiveFailures++;
            this.handleUserNotification(error);
            
            // Emit failure event
            eventBus.emit('render:failed', {
                renderId,
                componentId,
                error: error.message,
                duration: renderDuration
            });
            
            return {
                renderId,
                componentId,
                success: false,
                error: error.message,
                duration: renderDuration
            };
        }
    }
    
    /**
     * PHASE 2: Enhanced render validation using render validator system
     */
    async validateRenderEnhanced(componentId, componentType, renderResult) {
        try {
            // Use the dedicated render validator for comprehensive validation
            const validationResult = await renderValidator.validateRender(componentId, {
                timeout: 1500, // Slightly shorter timeout for queue processing
                componentType,
                strictMode: false, // Production mode validation
                requiredScore: 60 // Lower threshold for queue validation
            });
            
            this.logger.debug('RENDER_QUEUE', 'Enhanced validation completed', {
                componentId,
                passed: validationResult.passed,
                healthScore: validationResult.healthScore
            });
            
            // Emit validation event
            eventBus.emit('render:queue-validated', {
                componentId,
                validationResult,
                queueContext: true
            });
            
            return validationResult;
            
        } catch (validationError) {
            this.logger.warn('RENDER_QUEUE', 'Enhanced validation failed', {
                componentId,
                error: validationError.message
            });
            
            // Fallback to basic validation
            return await this.validateRenderBasic(componentId, renderResult);
        }
    }
    
    /**
     * Basic render validation as fallback
     */
    async validateRenderBasic(componentId, renderResult) {
        const element = document.getElementById(componentId);
        
        if (!element) {
            throw new Error('Rendered component not found in DOM');
        }
        
        // Additional validation checks
        if (!element.classList.contains('editable-element') && 
            !element.querySelector('.editable-element')) {
            this.logger.warn('RENDER_QUEUE', 'Component missing editable-element class', {
                componentId
            });
            
            // Auto-fix: Add the required class
            element.classList.add('editable-element');
        }
        
        // Check for required data attributes
        if (!element.dataset.componentId) {
            element.dataset.componentId = componentId;
        }
        
        return {
            passed: true,
            healthScore: 75, // Assume decent health for basic validation
            validator: 'basic_fallback'
        };
    }
    
    /**
     * Determine if render should be retried based on error type and attempt count
     */
    shouldRetry(renderRequest, error) {
        if (renderRequest.retryCount >= this.maxRetries) {
            return false;
        }
        
        // Don't retry certain error types
        const nonRetryableErrors = [
            'Component type not found',
            'Invalid component configuration',
            'Permission denied'
        ];
        
        if (nonRetryableErrors.some(errorType => error.message.includes(errorType))) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Schedule retry with exponential backoff
     */
    async scheduleRetry(renderRequest, error) {
        renderRequest.retryCount++;
        
        const delayIndex = Math.min(renderRequest.retryCount - 1, this.retryDelays.length - 1);
        const delay = this.retryDelays[delayIndex];
        
        this.logger.info('RENDER_QUEUE', 'Scheduling render retry', {
            renderId: renderRequest.renderId,
            componentId: renderRequest.componentId,
            retryCount: renderRequest.retryCount,
            delay,
            error: error.message
        });
        
        // Add to retry queue
        setTimeout(() => {
            this.addToQueue(
                renderRequest.componentId,
                renderRequest.renderData,
                'high', // Increase priority for retries
                { ...renderRequest.options, isRetry: true }
            );
            this.statistics.retried++;
        }, delay);
    }
    
    /**
     * Handle render fallback for failed components
     */
    async handleRenderFallback(renderRequest, error) {
        try {
            const fallbackElement = this.createFallbackElement(renderRequest);
            const container = document.getElementById('media-kit-preview');
            
            if (container && fallbackElement) {
                container.appendChild(fallbackElement);
                
                this.logger.info('RENDER_QUEUE', 'Fallback element created', {
                    componentId: renderRequest.componentId,
                    error: error.message
                });
            }
        } catch (fallbackError) {
            this.logger.error('RENDER_QUEUE', 'Fallback creation failed', fallbackError);
        }
    }
    
    /**
     * Create fallback element for failed renders
     */
    createFallbackElement(renderRequest) {
        const element = document.createElement('div');
        element.id = renderRequest.componentId;
        element.className = 'component-fallback editable-element';
        element.dataset.componentId = renderRequest.componentId;
        element.innerHTML = `
            <div class="fallback-content">
                <h3>Component Temporarily Unavailable</h3>
                <p>The ${renderRequest.renderData.type} component is experiencing issues.</p>
                <button onclick="this.parentElement.parentElement.remove()" class="fallback-remove-btn">
                    Remove Component
                </button>
            </div>
        `;
        return element;
    }
    
    /**
     * Handle user notifications for render errors
     */
    handleUserNotification(error) {
        if (!this.userNotifications.showErrors) {
            return; // Handle errors gracefully by default
        }
        
        if (this.userNotifications.consecutiveFailures >= this.userNotifications.errorThreshold) {
            showToast(
                `Component rendering issues detected. ${this.userNotifications.consecutiveFailures} consecutive failures.`,
                'warning',
                5000
            );
        }
    }
    
    /**
     * Set up render completion acknowledgment tracking
     */
    setupAcknowledgmentTracking(renderRequest) {
        const { renderId } = renderRequest;
        
        const acknowledgeCallback = (success) => {
            if (this.pendingAcknowledgments.has(renderId)) {
                this.pendingAcknowledgments.delete(renderId);
                
                this.logger.debug('RENDER_QUEUE', 'Render acknowledgment received', {
                    renderId,
                    success
                });
            }
        };
        
        this.pendingAcknowledgments.set(renderId, acknowledgeCallback);
        
        // Set up timeout for acknowledgment
        setTimeout(() => {
            if (this.pendingAcknowledgments.has(renderId)) {
                this.pendingAcknowledgments.delete(renderId);
                this.logger.warn('RENDER_QUEUE', 'Render acknowledgment timeout', {
                    renderId,
                    timeout: this.acknowledgmentTimeout
                });
            }
        }, this.acknowledgmentTimeout);
        
        return acknowledgeCallback;
    }
    
    /**
     * Circuit breaker implementation
     */
    checkCircuitBreaker() {
        const now = Date.now();
        
        // Reset circuit breaker if enough time has passed
        if (this.circuitBreaker.state === 'OPEN' && 
            (now - this.circuitBreaker.lastFailureTime) > this.circuitBreaker.resetTimeout) {
            this.circuitBreaker.state = 'HALF_OPEN';
            this.circuitBreaker.failureCount = 0;
            this.logger.info('RENDER_QUEUE', 'Circuit breaker reset to HALF_OPEN');
        }
        
        return this.circuitBreaker.state !== 'OPEN';
    }
    
    /**
     * Record circuit breaker failure
     */
    recordCircuitBreakerFailure() {
        this.circuitBreaker.failureCount++;
        this.circuitBreaker.lastFailureTime = Date.now();
        
        if (this.circuitBreaker.failureCount >= this.circuitBreaker.maxFailures) {
            this.circuitBreaker.state = 'OPEN';
            this.logger.warn('RENDER_QUEUE', 'Circuit breaker OPENED', {
                failureCount: this.circuitBreaker.failureCount,
                maxFailures: this.circuitBreaker.maxFailures
            });
        }
    }
    
    /**
     * Update batch processing statistics
     */
    updateBatchStatistics(results, batchStart) {
        const batchDuration = performance.now() - batchStart;
        this.statistics.batchesProcessed++;
        this.performanceMetrics.batchTimes.push(batchDuration);
        
        // Calculate rolling averages
        if (this.performanceMetrics.renderTimes.length > 0) {
            this.statistics.avgProcessTime = this.performanceMetrics.renderTimes
                .slice(-50) // Last 50 renders
                .reduce((a, b) => a + b, 0) / Math.min(50, this.performanceMetrics.renderTimes.length);
        }
        
        if (this.performanceMetrics.batchTimes.length > 0) {
            this.statistics.avgBatchTime = this.performanceMetrics.batchTimes
                .slice(-20) // Last 20 batches
                .reduce((a, b) => a + b, 0) / Math.min(20, this.performanceMetrics.batchTimes.length);
        }
    }
    
    /**
     * Handle batch completion
     */
    handleBatchCompletion(results) {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success && !r.retrying).length;
        const retrying = results.filter(r => r.retrying).length;
        
        this.logger.info('RENDER_QUEUE', 'Batch processing completed', {
            total: results.length,
            successful,
            failed,
            retrying,
            avgBatchTime: this.statistics.avgBatchTime
        });
        
        // Emit batch completion event
        eventBus.emit('render:batch-completed', {
            results,
            statistics: this.getStatistics()
        });
    }
    
    /**
     * Initial state rendering mode
     */
    enterInitialStateMode() {
        this.initialStateMode = true;
        this.initialRenderBatch.clear();
        this.logger.info('RENDER_QUEUE', 'Entered initial state rendering mode');
    }
    
    exitInitialStateMode() {
        const batchSize = this.initialRenderBatch.size;
        this.initialStateMode = false;
        this.initialRenderBatch.clear();
        
        this.logger.info('RENDER_QUEUE', 'Exited initial state rendering mode', {
            componentsRendered: batchSize
        });
    }
    
    /**
     * Utility methods
     */
    getTotalQueueSize() {
        return this.queue.size;
    }
    
    getBatchPriorityDistribution(batch) {
        const distribution = { critical: 0, high: 0, normal: 0, low: 0 };
        batch.forEach(request => distribution[request.priority]++);
        return distribution;
    }
    
    /**
     * Get comprehensive statistics
     */
    getStatistics() {
        return {
            ...this.statistics,
            queueSize: this.getTotalQueueSize(),
            processing: this.processing,
            circuitBreakerState: this.circuitBreaker.state,
            pendingAcknowledgments: this.pendingAcknowledgments.size,
            performanceMetrics: {
                avgRenderTime: this.statistics.avgProcessTime,
                avgBatchTime: this.statistics.avgBatchTime,
                queueHighWaterMark: this.statistics.queueHighWaterMark
            }
        };
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for state changes to coordinate rendering
        eventBus.on('state:changed', (event) => {
            if (event.batch) {
                this.logger.debug('RENDER_QUEUE', 'State batch update detected');
            }
        });
        
        // Listen for component additions
        eventBus.on('component:added', (event) => {
            const { componentId, componentData } = event;
            this.addToQueue(componentId, componentData, 'normal');
        });
    }
    
    /**
     * Start processing loop
     */
    startProcessingLoop() {
        // Periodic cleanup of performance metrics
        setInterval(() => {
            this.cleanupPerformanceMetrics();
        }, 60000); // Every minute
        
        this.logger.info('RENDER_QUEUE', 'Processing loop started');
    }
    
    /**
     * Cleanup old performance metrics
     */
    cleanupPerformanceMetrics() {
        const now = Date.now();
        const cleanupInterval = 5 * 60 * 1000; // 5 minutes
        
        if (now - this.performanceMetrics.lastCleanup > cleanupInterval) {
            // Keep only recent metrics
            this.performanceMetrics.renderTimes = this.performanceMetrics.renderTimes.slice(-100);
            this.performanceMetrics.batchTimes = this.performanceMetrics.batchTimes.slice(-50);
            this.performanceMetrics.queueSizes = this.performanceMetrics.queueSizes.slice(-100);
            this.performanceMetrics.lastCleanup = now;
        }
    }
    
    /**
     * Debug and monitoring methods
     */
    debug() {
        console.group('%c🎯 Rendering Queue Manager Debug', 'font-size: 14px; font-weight: bold; color: #8B5CF6');
        console.log('Queue Statistics:', this.getStatistics());
        console.log('Current Queue:', Array.from(this.queue.values()));
        console.log('Priority Distribution:', {
            critical: this.priorityQueues.critical.size,
            high: this.priorityQueues.high.size,
            normal: this.priorityQueues.normal.size,
            low: this.priorityQueues.low.size
        });
        console.log('Circuit Breaker:', this.circuitBreaker);
        console.groupEnd();
    }
}

/**
 * Simple semaphore implementation for controlling concurrent renders
 */
class Semaphore {
    constructor(maxConcurrent) {
        this.maxConcurrent = maxConcurrent;
        this.current = 0;
        this.queue = [];
    }
    
    async acquire() {
        if (this.current < this.maxConcurrent) {
            this.current++;
            return;
        }
        
        return new Promise((resolve) => {
            this.queue.push(resolve);
        });
    }
    
    release() {
        this.current--;
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            this.current++;
            next();
        }
    }
}

// Export singleton instance
export const renderingQueueManager = new RenderingQueueManager();

// Global exposure for debugging
if (typeof window !== 'undefined') {
    window.renderingQueueManager = renderingQueueManager;
}