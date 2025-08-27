/**
 * @file component-performance-monitor.js
 * @description Component Performance Monitoring Service
 * Handles statistics, health checks, and performance tracking for components
 * 
 * ROOT FIX: Extracted from enhanced-component-renderer.js for better maintainability
 * Following checklist: Diagnostic Logging, Actionable Error Messages
 */

(function() {
    'use strict';
    
    // Fallback utilities
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    
    const performanceMonitor = window.performanceMonitor || {
        start: () => () => {}
    };

    class ComponentPerformanceMonitor {
        constructor() {
            this.logger = structuredLogger;
            this.renderMetrics = new Map();
            this.healthCheckInterval = null;
            this.isRendering = false;
            this.renderStartTime = null;
            this.renderTimeouts = new Map();
            this.initialized = false;
        }

        /**
         * Initialize performance monitoring
         */
        init() {
            if (this.initialized) {
                return;
            }
            
            this.logger.debug('PERF', 'Initializing performance monitoring');
            
            // Start health check interval
            this.startHealthCheck();
            
            this.initialized = true;
            
            // Emit ready event
            document.dispatchEvent(new CustomEvent('gmkb:performance-monitor-ready', {
                detail: { 
                    monitor: this,
                    timestamp: Date.now()
                }
            }));
        }

        /**
         * Start health check monitoring
         */
        startHealthCheck() {
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
            }
            
            this.healthCheckInterval = setInterval(() => {
                this.performHealthCheck();
            }, 5000);
            
            this.logger.debug('PERF', 'Health check monitoring started');
        }

        /**
         * Perform health check
         */
        performHealthCheck() {
            try {
                // Check for stuck renders
                if (this.isRendering && this.renderStartTime) {
                    const renderDuration = Date.now() - this.renderStartTime;
                    if (renderDuration > 10000) {
                        this.logger.warn('PERF', `Render operation stuck for ${renderDuration}ms, resetting`);
                        this.isRendering = false;
                        this.renderStartTime = null;
                        
                        // Clear any pending timeouts
                        this.renderTimeouts.forEach((timeout) => clearTimeout(timeout));
                        this.renderTimeouts.clear();
                    }
                }
                
                // Check memory usage of metrics
                if (this.renderMetrics.size > 1000) {
                    this.logger.warn('PERF', `High metric count (${this.renderMetrics.size}), cleaning up old metrics`);
                    this.cleanupOldMetrics();
                }
                
                // Log current statistics
                const stats = this.getDetailedStats();
                if (stats.activeRenders > 0 || stats.averageRenderTime > 1000) {
                    this.logger.info('PERF', 'Performance health check:', stats);
                }
                
            } catch (error) {
                this.logger.error('PERF', 'Health check failed:', error);
            }
        }

        /**
         * Start tracking render operation
         */
        startRenderTracking(operation, componentId) {
            const trackingId = `${operation}-${componentId}-${Date.now()}`;
            
            this.renderMetrics.set(trackingId, {
                operation,
                componentId,
                startTime: Date.now(),
                status: 'active'
            });
            
            // Set timeout for render operation
            const timeoutId = setTimeout(() => {
                this.handleRenderTimeout(trackingId);
            }, 15000); // 15 second timeout
            
            this.renderTimeouts.set(trackingId, timeoutId);
            
            this.logger.debug('PERF', `Started tracking: ${trackingId}`);
            
            return trackingId;
        }

        /**
         * End render tracking
         */
        endRenderTracking(trackingId, success = true, error = null) {
            const metric = this.renderMetrics.get(trackingId);
            if (!metric) {
                return;
            }
            
            const endTime = Date.now();
            const duration = endTime - metric.startTime;
            
            // Update metric
            metric.endTime = endTime;
            metric.duration = duration;
            metric.status = success ? 'completed' : 'failed';
            metric.error = error;
            
            // Clear timeout
            const timeoutId = this.renderTimeouts.get(trackingId);
            if (timeoutId) {
                clearTimeout(timeoutId);
                this.renderTimeouts.delete(trackingId);
            }
            
            // Log performance data
            if (success) {
                this.logger.debug('PERF', `Completed tracking: ${trackingId} (${duration}ms)`);
            } else {
                this.logger.warn('PERF', `Failed tracking: ${trackingId} (${duration}ms)`, error);
            }
            
            // Alert on slow operations
            if (duration > 3000) {
                this.logger.warn('PERF', `Slow render operation detected: ${trackingId} took ${duration}ms`);
            }
            
            return duration;
        }

        /**
         * Handle render timeout
         */
        handleRenderTimeout(trackingId) {
            const metric = this.renderMetrics.get(trackingId);
            if (!metric || metric.status !== 'active') {
                return;
            }
            
            const duration = Date.now() - metric.startTime;
            
            this.logger.error('PERF', `Render timeout: ${trackingId} exceeded 15s (${duration}ms)`);
            
            // Update metric
            metric.status = 'timeout';
            metric.duration = duration;
            metric.error = 'Operation timeout';
            
            // Clean up timeout reference
            this.renderTimeouts.delete(trackingId);
        }

        /**
         * Track component render specifically
         */
        trackComponentRender(componentId, operation = 'render') {
            return this.startRenderTracking(operation, componentId);
        }

        /**
         * Track batch operations
         */
        trackBatchOperation(operationType, count) {
            return this.startRenderTracking(`batch-${operationType}`, `count-${count}`);
        }

        /**
         * Get current render statistics
         */
        getStats() {
            const now = Date.now();
            const recentMetrics = Array.from(this.renderMetrics.values())
                .filter(metric => (now - metric.startTime) < 60000); // Last minute
            
            const activeRenders = recentMetrics.filter(m => m.status === 'active').length;
            const completedRenders = recentMetrics.filter(m => m.status === 'completed').length;
            const failedRenders = recentMetrics.filter(m => m.status === 'failed').length;
            const timeoutRenders = recentMetrics.filter(m => m.status === 'timeout').length;
            
            const renderTimes = recentMetrics
                .filter(m => m.duration)
                .map(m => m.duration);
            
            const averageRenderTime = renderTimes.length > 0 
                ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length 
                : 0;
            
            return {
                activeRenders,
                completedRenders,
                failedRenders,
                timeoutRenders,
                totalMetrics: this.renderMetrics.size,
                recentMetrics: recentMetrics.length,
                averageRenderTime: Math.round(averageRenderTime),
                maxRenderTime: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
                minRenderTime: renderTimes.length > 0 ? Math.min(...renderTimes) : 0,
                isHealthy: activeRenders < 5 && timeoutRenders === 0
            };
        }

        /**
         * Get detailed performance statistics
         */
        getDetailedStats() {
            const basicStats = this.getStats();
            const now = Date.now();
            
            // Component-specific metrics
            const componentMetrics = new Map();
            this.renderMetrics.forEach(metric => {
                if (!componentMetrics.has(metric.componentId)) {
                    componentMetrics.set(metric.componentId, {
                        renders: 0,
                        totalTime: 0,
                        failures: 0,
                        lastRender: 0
                    });
                }
                
                const compMetric = componentMetrics.get(metric.componentId);
                compMetric.renders++;
                if (metric.duration) {
                    compMetric.totalTime += metric.duration;
                }
                if (metric.status === 'failed' || metric.status === 'timeout') {
                    compMetric.failures++;
                }
                compMetric.lastRender = Math.max(compMetric.lastRender, metric.startTime);
            });
            
            // Find problem components
            const problemComponents = [];
            componentMetrics.forEach((metrics, componentId) => {
                const avgTime = metrics.totalTime / metrics.renders;
                const failureRate = metrics.failures / metrics.renders;
                
                if (avgTime > 2000 || failureRate > 0.1) {
                    problemComponents.push({
                        componentId,
                        avgRenderTime: Math.round(avgTime),
                        failureRate: Math.round(failureRate * 100),
                        totalRenders: metrics.renders
                    });
                }
            });
            
            return {
                ...basicStats,
                uniqueComponents: componentMetrics.size,
                problemComponents,
                memoryUsage: {
                    metricsCount: this.renderMetrics.size,
                    timeoutsCount: this.renderTimeouts.size
                }
            };
        }

        /**
         * Clean up old metrics to prevent memory leaks
         */
        cleanupOldMetrics() {
            const now = Date.now();
            const cutoffTime = now - (5 * 60 * 1000); // 5 minutes ago
            
            let removedCount = 0;
            this.renderMetrics.forEach((metric, trackingId) => {
                if (metric.startTime < cutoffTime && metric.status !== 'active') {
                    this.renderMetrics.delete(trackingId);
                    removedCount++;
                }
            });
            
            this.logger.debug('PERF', `Cleaned up ${removedCount} old metrics`);
        }

        /**
         * Generate performance report
         */
        generateReport() {
            const stats = this.getDetailedStats();
            
            this.logger.info('PERF', 'Performance Report:', {
                summary: {
                    health: stats.isHealthy ? 'GOOD' : 'POOR',
                    activeRenders: stats.activeRenders,
                    avgRenderTime: `${stats.averageRenderTime}ms`,
                    failureRate: `${Math.round((stats.failedRenders + stats.timeoutRenders) / stats.recentMetrics * 100)}%`
                },
                metrics: {
                    completed: stats.completedRenders,
                    failed: stats.failedRenders,
                    timeouts: stats.timeoutRenders,
                    components: stats.uniqueComponents
                },
                performance: {
                    avgTime: `${stats.averageRenderTime}ms`,
                    maxTime: `${stats.maxRenderTime}ms`,
                    minTime: `${stats.minRenderTime}ms`
                },
                issues: {
                    problemComponents: stats.problemComponents,
                    memoryUsage: stats.memoryUsage
                }
            });
            
            return stats;
        }

        /**
         * Check if system is currently healthy
         */
        isSystemHealthy() {
            const stats = this.getStats();
            return stats.isHealthy;
        }

        /**
         * Get render queue statistics if available
         */
        getRenderQueueStats() {
            if (window.renderingQueueManager) {
                return window.renderingQueueManager.getStatistics();
            }
            return null;
        }

        /**
         * Log slow operation warning
         */
        logSlowOperation(operation, duration, threshold = 1000) {
            if (duration > threshold) {
                this.logger.warn('PERF', `Slow operation detected: ${operation} took ${duration}ms (threshold: ${threshold}ms)`);
                return true;
            }
            return false;
        }

        /**
         * Track memory usage
         */
        trackMemoryUsage(context = '') {
            if (performance.memory) {
                const memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
                
                this.logger.debug('PERF', `Memory usage ${context}:`, memory);
                
                // Warn if memory usage is high
                const usagePercent = (memory.used / memory.limit) * 100;
                if (usagePercent > 80) {
                    this.logger.warn('PERF', `High memory usage: ${usagePercent.toFixed(1)}% (${memory.used}MB/${memory.limit}MB)`);
                }
                
                return memory;
            }
            return null;
        }

        /**
         * Reset all metrics
         */
        reset() {
            this.renderMetrics.clear();
            this.renderTimeouts.forEach(timeout => clearTimeout(timeout));
            this.renderTimeouts.clear();
            this.isRendering = false;
            this.renderStartTime = null;
            
            this.logger.info('PERF', 'Performance metrics reset');
        }

        /**
         * Stop performance monitoring
         */
        destroy() {
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
                this.healthCheckInterval = null;
            }
            
            // Clear all timeouts
            this.renderTimeouts.forEach(timeout => clearTimeout(timeout));
            this.renderTimeouts.clear();
            
            // Clear metrics
            this.renderMetrics.clear();
            
            this.initialized = false;
            this.logger.debug('PERF', 'Performance monitoring destroyed');
        }
    }

    // Export to global scope for WordPress compatibility
    window.ComponentPerformanceMonitor = ComponentPerformanceMonitor;
    
    // Create singleton instance
    if (!window.componentPerformanceMonitor) {
        window.componentPerformanceMonitor = new ComponentPerformanceMonitor();
    }

    // Emit ready event
    document.dispatchEvent(new CustomEvent('gmkb:component-performance-monitor-ready', {
        detail: { 
            monitor: window.componentPerformanceMonitor,
            timestamp: Date.now()
        }
    }));

})();