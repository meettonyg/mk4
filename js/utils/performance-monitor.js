/**
 * Performance Monitoring Module
 * Tracks and reports on key operations with minimal overhead
 * ROOT FIX: WordPress-compatible IIFE wrapper
 */

// ROOT FIX: WordPress-compatible IIFE wrapper
(function() {
    'use strict';

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.benchmarks = {
            'component-add': 100,
            'component-add-cached': 100,
            'component-remove': 100,
            'component-duplicate': 150,
            'component-move': 100,
            'state-save': 50,
            'state-load': 100,
            'state-batch-update': 50,
            'full-render': 200,
            'component-render': 50,
            'dom-update': 30,
            'template-load': 200,
            'template-load-cached': 10,
            'schema-load': 100,
            'schema-load-cached': 5,
            'data-binding-init': 50,
            'data-binding-update': 30,
            'control-action': 300
        };
        
        this.cacheStats = {
            template: { hits: 0, misses: 0 },
            schema: { hits: 0, misses: 0 }
        };
        
        this.maxEntriesPerMetric = 100;
        this.dailySummaries = new Map();
        this.isEnabled = true;
        this.debugMode = false;
        
        // Load historical data
        this.loadHistoricalData();
        
        // Setup periodic cleanup
        this.setupCleanup();
    }
    
    /**
     * Track a performance metric
     */
    track(operation, startTime, metadata = {}) {
        if (!this.isEnabled) return;
        
        const duration = performance.now() - startTime;
        
        // Store metric
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }
        
        const entries = this.metrics.get(operation);
        entries.push({
            duration: Math.round(duration * 100) / 100, // Round to 2 decimals
            timestamp: Date.now(),
            metadata,
            pass: duration < (this.benchmarks[operation] || 300)
        });
        
        // Limit entries
        if (entries.length > this.maxEntriesPerMetric) {
            entries.shift();
        }
        
        // Debug logging
        if (this.debugMode) {
            const status = duration < (this.benchmarks[operation] || 300) ? '✅' : '❌';
            console.log(`[Perf] ${operation}: ${duration.toFixed(2)}ms ${status}`, metadata);
        }
        
        // Update daily summary
        this.updateDailySummary(operation, duration);
    }
    
    /**
     * Start tracking an operation (returns end function)
     */
    start(operation, metadata = {}) {
        if (!this.isEnabled) return () => {};
        
        const startTime = performance.now();
        return () => this.track(operation, startTime, metadata);
    }
    
    /**
     * Track cache hit/miss
     */
    trackCache(type, hit) {
        if (!this.isEnabled) return;
        
        if (this.cacheStats[type]) {
            if (hit) {
                this.cacheStats[type].hits++;
            } else {
                this.cacheStats[type].misses++;
            }
        }
    }
    
    /**
     * Get metrics for an operation
     */
    getMetrics(operation) {
        const entries = this.metrics.get(operation) || [];
        if (entries.length === 0) return null;
        
        const durations = entries.map(e => e.duration).sort((a, b) => a - b);
        const sum = durations.reduce((acc, val) => acc + val, 0);
        
        return {
            count: entries.length,
            min: durations[0],
            max: durations[durations.length - 1],
            avg: sum / entries.length,
            p95: durations[Math.floor(entries.length * 0.95)] || durations[durations.length - 1],
            recent: entries.slice(-10).map(e => e.duration)
        };
    }
    
    /**
     * Generate console report
     */
    report() {
        console.group('%cMedia Kit Performance Report', 'font-size: 16px; font-weight: bold; color: #2196F3');
        console.log('%c' + '='.repeat(80), 'color: #666');
        
        // Prepare data
        const rows = [];
        const operations = [
            'component-add',
            'component-add-cached',
            'component-remove',
            'component-duplicate',
            'component-move',
            'state-save',
            'state-load',
            'full-render',
            'template-load',
            'template-load-cached',
            'control-action'
        ];
        
        operations.forEach(op => {
            const metrics = this.getMetrics(op);
            if (metrics) {
                const target = this.benchmarks[op] || 300;
                const status = this.getStatus(metrics.avg, target);
                const trend = this.generateSparkline(metrics.recent);
                
                rows.push({
                    Operation: op.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    Target: `${target}ms`,
                    'Avg': this.formatDuration(metrics.avg, target),
                    'P95': this.formatDuration(metrics.p95, target * 1.2),
                    Count: metrics.count,
                    Trend: trend,
                    Status: status
                });
            }
        });
        
        // Display table
        console.table(rows);
        
        // Cache statistics
        console.group('%cCache Statistics', 'font-size: 14px; font-weight: bold; color: #4CAF50');
        
        const templateHitRate = this.getCacheHitRate('template');
        const schemaHitRate = this.getCacheHitRate('schema');
        
        console.log(`Template Cache Hit Rate: ${this.formatPercentage(templateHitRate)} (${this.cacheStats.template.hits}/${this.cacheStats.template.hits + this.cacheStats.template.misses})`);
        console.log(`Schema Cache Hit Rate: ${this.formatPercentage(schemaHitRate)} (${this.cacheStats.schema.hits}/${this.cacheStats.schema.hits + this.cacheStats.schema.misses})`);
        console.groupEnd();
        
        // Performance summary
        console.group('%cPerformance Summary', 'font-size: 14px; font-weight: bold; color: #FF9800');
        
        const overallHealth = this.getOverallHealth();
        console.log(`Overall Health: ${overallHealth.emoji} ${overallHealth.text}`);
        console.log(`Total Operations Tracked: ${Array.from(this.metrics.values()).reduce((sum, entries) => sum + entries.length, 0)}`);
        
        console.groupEnd();
        console.groupEnd();
        
        return rows;
    }
    
    /**
     * Get status emoji and color
     */
    getStatus(value, target) {
        if (value < target) return '✅';
        if (value < target * 1.2) return '⚠️';
        return '❌';
    }
    
    /**
     * Format duration with color
     */
    formatDuration(duration, target) {
        const rounded = Math.round(duration);
        if (duration < target) {
            return `%c${rounded}ms%c`;
        } else if (duration < target * 1.2) {
            return `%c${rounded}ms%c`;
        } else {
            return `%c${rounded}ms%c`;
        }
    }
    
    /**
     * Generate sparkline visualization
     */
    generateSparkline(values) {
        if (!values || values.length === 0) return '';
        
        const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        
        return values.map(v => {
            const index = Math.floor(((v - min) / range) * (blocks.length - 1));
            return blocks[index];
        }).join('');
    }
    
    /**
     * Get cache hit rate
     */
    getCacheHitRate(type) {
        const stats = this.cacheStats[type];
        if (!stats) return 0;
        
        const total = stats.hits + stats.misses;
        return total === 0 ? 0 : (stats.hits / total) * 100;
    }
    
    /**
     * Format percentage
     */
    formatPercentage(value) {
        return `${Math.round(value)}%`;
    }
    
    /**
     * Get overall health assessment
     */
    getOverallHealth() {
        let passing = 0;
        let total = 0;
        
        this.metrics.forEach((entries, operation) => {
            if (entries.length > 0) {
                total++;
                const metrics = this.getMetrics(operation);
                const target = this.benchmarks[operation] || 300;
                if (metrics.avg < target) {
                    passing++;
                }
            }
        });
        
        const ratio = total === 0 ? 1 : passing / total;
        
        if (ratio >= 0.9) return { emoji: '🟢', text: 'Excellent' };
        if (ratio >= 0.7) return { emoji: '🟡', text: 'Good' };
        if (ratio >= 0.5) return { emoji: '🟠', text: 'Fair' };
        return { emoji: '🔴', text: 'Needs Attention' };
    }
    
    /**
     * Update daily summary
     */
    updateDailySummary(operation, duration) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.dailySummaries.has(today)) {
            this.dailySummaries.set(today, {});
        }
        
        const todaySummary = this.dailySummaries.get(today);
        
        if (!todaySummary[operation]) {
            todaySummary[operation] = {
                min: duration,
                max: duration,
                sum: duration,
                count: 1,
                values: [duration]
            };
        } else {
            const summary = todaySummary[operation];
            
            // Ensure values array exists (for data loaded from localStorage)
            if (!summary.values) {
                summary.values = [];
            }
            
            summary.min = Math.min(summary.min, duration);
            summary.max = Math.max(summary.max, duration);
            summary.sum += duration;
            summary.count++;
            summary.values.push(duration);
            
            // Keep only last 100 values for p95 calculation
            if (summary.values.length > 100) {
                summary.values.shift();
            }
        }
        
        // Save to localStorage periodically
        this.scheduleSave();
    }
    
    /**
     * Schedule save to localStorage
     */
    scheduleSave() {
        if (this.saveTimeout) return;
        
        this.saveTimeout = setTimeout(() => {
            this.saveHistoricalData();
            this.saveTimeout = null;
        }, 5000); // Save after 5 seconds of inactivity
    }
    
    /**
     * Save historical data to localStorage
     */
    saveHistoricalData() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const dataToSave = {};
            
            // Process daily summaries
            this.dailySummaries.forEach((summary, date) => {
                dataToSave[date] = {};
                Object.entries(summary).forEach(([operation, data]) => {
                    const values = data.values.sort((a, b) => a - b);
                    dataToSave[date][operation] = {
                        min: data.min,
                        max: data.max,
                        avg: data.sum / data.count,
                        p95: values[Math.floor(values.length * 0.95)] || values[values.length - 1],
                        count: data.count
                    };
                });
            });
            
            // Save only last 7 days
            const dates = Object.keys(dataToSave).sort().slice(-7);
            const finalData = {};
            dates.forEach(date => {
                finalData[date] = dataToSave[date];
            });
            
            localStorage.setItem('mk_perf_history', JSON.stringify(finalData));
            
            // Save cache stats
            localStorage.setItem('mk_perf_cache', JSON.stringify(this.cacheStats));
            
        } catch (error) {
            console.warn('Failed to save performance data:', error);
        }
    }
    
    /**
     * Load historical data from localStorage
     */
    loadHistoricalData() {
        try {
            const historyData = localStorage.getItem('mk_perf_history');
            if (historyData) {
                const parsed = JSON.parse(historyData);
                Object.entries(parsed).forEach(([date, summary]) => {
                    // Ensure each operation has required properties
                    Object.keys(summary).forEach(operation => {
                        if (summary[operation] && !summary[operation].values) {
                            summary[operation].values = [];
                        }
                        if (summary[operation] && !summary[operation].sum) {
                            summary[operation].sum = (summary[operation].avg || 0) * (summary[operation].count || 1);
                        }
                    });
                    this.dailySummaries.set(date, summary);
                });
            }
            
            const cacheData = localStorage.getItem('mk_perf_cache');
            if (cacheData) {
                const parsed = JSON.parse(cacheData);
                Object.assign(this.cacheStats, parsed);
            }
        } catch (error) {
            console.warn('Failed to load performance data:', error);
        }
    }
    
    /**
     * Setup periodic cleanup
     */
    setupCleanup() {
        // Clean up old data daily
        setInterval(() => {
            this.cleanupOldData();
        }, 24 * 60 * 60 * 1000); // Every 24 hours
    }
    
    /**
     * Clean up old data
     */
    cleanupOldData() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        const cutoffString = cutoffDate.toISOString().split('T')[0];
        
        // Remove old daily summaries
        Array.from(this.dailySummaries.keys()).forEach(date => {
            if (date < cutoffString) {
                this.dailySummaries.delete(date);
            }
        });
        
        // Remove old metrics (older than 1 hour)
        const cutoffTime = Date.now() - (60 * 60 * 1000);
        this.metrics.forEach((entries, operation) => {
            const filtered = entries.filter(e => e.timestamp > cutoffTime);
            if (filtered.length !== entries.length) {
                this.metrics.set(operation, filtered);
            }
        });
        
        this.saveHistoricalData();
    }
    
    /**
     * Export data for analytics (opt-in)
     */
    exportAnalytics() {
        const today = new Date().toISOString().split('T')[0];
        const summary = this.dailySummaries.get(today) || {};
        
        return {
            date: today,
            operations: Object.entries(summary).reduce((acc, [op, data]) => {
                acc[op] = {
                    avg: Math.round((data.sum / data.count) || 0),
                    p95: Math.round(data.p95 || 0),
                    count: data.count || 0
                };
                return acc;
            }, {}),
            cacheRates: {
                template: Math.round(this.getCacheHitRate('template')),
                schema: Math.round(this.getCacheHitRate('schema'))
            },
            health: this.getOverallHealth().text
        };
    }
    
    /**
     * Reset all metrics
     */
    reset() {
        this.metrics.clear();
        this.cacheStats = {
            template: { hits: 0, misses: 0 },
            schema: { hits: 0, misses: 0 }
        };
        console.log('Performance metrics reset');
    }
    
    /**
     * Enable/disable monitoring
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`Performance debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// ROOT FIX: Create singleton instance and expose globally
const performanceMonitor = new PerformanceMonitor();

// ROOT FIX: Expose on window for easy access
window.mkPerf = {
    track: performanceMonitor.track.bind(performanceMonitor),
    start: performanceMonitor.start.bind(performanceMonitor),
    trackCache: performanceMonitor.trackCache.bind(performanceMonitor),
    report: performanceMonitor.report.bind(performanceMonitor),
    reset: performanceMonitor.reset.bind(performanceMonitor),
    setEnabled: performanceMonitor.setEnabled.bind(performanceMonitor),
    setDebugMode: performanceMonitor.setDebugMode.bind(performanceMonitor),
    exportAnalytics: performanceMonitor.exportAnalytics.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor)
};

// ROOT FIX: WordPress-compatible global exposure
window.performanceMonitor = performanceMonitor;
window.PerformanceMonitor = PerformanceMonitor;

console.log('✅ ROOT FIX: Performance Monitor exposed globally (WordPress-compatible)');

})(); // ROOT FIX: Close IIFE wrapper