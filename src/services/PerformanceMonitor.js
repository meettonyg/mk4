/**
 * Performance Monitor
 * 
 * Tracks and reports performance metrics including FPS,
 * memory usage, and bundle size.
 * 
 * @version 2.0.0
 */

export class PerformanceMonitor {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.reportingEndpoint = options.reportingEndpoint;
    this.sampleRate = options.sampleRate || 1000; // 1 second
    this.maxSamples = options.maxSamples || 60;
    
    this.metrics = {
      fps: [],
      memory: [],
      renderTime: [],
      apiCalls: [],
      longTask: [],
      measure: [],
      pageLoad: []
    };
    
    this.observers = new Map();
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    
    if (this.enabled) {
      this.init();
    }
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    console.log('📊 Initializing Performance Monitor...');
    
    // Start FPS monitoring
    this.startFPSMonitoring();
    
    // Start memory monitoring
    if (performance.memory) {
      this.startMemoryMonitoring();
    }
    
    // Setup performance observers
    this.setupPerformanceObservers();
    
    // Log initial performance
    this.logInitialPerformance();
    
    console.log('✅ Performance Monitor initialized');
  }

  /**
   * Start FPS monitoring
   */
  startFPSMonitoring() {
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      
      if (delta >= this.sampleRate) {
        const fps = Math.round((this.frameCount * 1000) / delta);
        this.recordMetric('fps', fps);
        
        this.frameCount = 0;
        this.lastFrameTime = now;
      }
      
      this.frameCount++;
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    setInterval(() => {
      if (performance.memory) {
        const memory = {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1048576),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        };
        
        this.recordMetric('memory', memory);
      }
    }, this.sampleRate);
  }

  /**
   * Setup performance observers
   */
  setupPerformanceObservers() {
    try {
      // Long task observer
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // ROOT FIX: Only warn for tasks >250ms (was 50ms)
          // Startup tasks of 100-200ms are normal and acceptable
          if (entry.duration > 250) {
            console.warn('⚠️ Long task detected:', {
              name: entry.name,
              duration: entry.duration,
              startTime: entry.startTime
            });
            
            this.recordMetric('longTask', {
              name: entry.name,
              duration: entry.duration
            });
          } else if (entry.duration > 50) {
            // Still track tasks >50ms for metrics, just don't log
            this.recordMetric('longTask', {
              name: entry.name,
              duration: entry.duration
            });
          }
        }
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longTask', longTaskObserver);
      
    } catch (err) {
      console.warn('Long task observer not supported');
    }

    try {
      // Measure observer
      const measureObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('measure', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
      
      measureObserver.observe({ entryTypes: ['measure'] });
      this.observers.set('measure', measureObserver);
      
    } catch (err) {
      console.warn('Measure observer not supported');
    }

    try {
      // Resource observer
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            this.recordMetric('apiCalls', {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize
            });
          }
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
      
    } catch (err) {
      console.warn('Resource observer not supported');
    }
  }

  /**
   * Log initial performance metrics
   */
  logInitialPerformance() {
    if (!window.performance) return;

    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0];

    const metrics = {
      // Page load metrics
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      
      // Network metrics
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseEnd - timing.requestStart,
      
      // Rendering metrics
      domProcessing: timing.domComplete - timing.domLoading,
      
      // Navigation type
      navigationType: navigation?.type || 'unknown'
    };

    console.log('📊 Initial Performance:', metrics);
    
    // Record to metrics
    this.recordMetric('pageLoad', metrics);
  }

  /**
   * Record a metric
   * 
   * @param {string} type - Metric type
   * @param {*} value - Metric value
   */
  recordMetric(type, value) {
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }
    
    this.metrics[type].push({
      value,
      timestamp: Date.now()
    });
    
    // Trim if exceeds max
    if (this.metrics[type].length > this.maxSamples) {
      this.metrics[type].shift();
    }
  }

  /**
   * Get current FPS
   * 
   * @returns {number} Current FPS
   */
  getCurrentFPS() {
    const recent = this.metrics.fps.slice(-5);
    if (recent.length === 0) return 0;
    
    const sum = recent.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / recent.length);
  }

  /**
   * Get current memory usage
   * 
   * @returns {Object} Memory metrics
   */
  getCurrentMemory() {
    const recent = this.metrics.memory.slice(-1)[0];
    return recent?.value || { used: 0, total: 0, limit: 0 };
  }

  /**
   * Get average render time
   * 
   * @returns {number} Average render time in ms
   */
  getAverageRenderTime() {
    const recent = this.metrics.renderTime.slice(-10);
    if (recent.length === 0) return 0;
    
    const sum = recent.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / recent.length);
  }

  /**
   * Get API call statistics
   * 
   * @returns {Object} API stats
   */
  getAPIStats() {
    const calls = this.metrics.apiCalls;
    if (calls.length === 0) {
      return {
        count: 0,
        averageDuration: 0,
        totalSize: 0
      };
    }
    
    const totalDuration = calls.reduce((acc, m) => acc + m.value.duration, 0);
    const totalSize = calls.reduce((acc, m) => acc + (m.value.size || 0), 0);
    
    return {
      count: calls.length,
      averageDuration: Math.round(totalDuration / calls.length),
      totalSize: Math.round(totalSize / 1024) // KB
    };
  }

  /**
   * Get performance report
   * 
   * @returns {Object} Complete performance report
   */
  getReport() {
    return {
      fps: {
        current: this.getCurrentFPS(),
        average: this.getAverageFPS(),
        min: this.getMinFPS(),
        max: this.getMaxFPS()
      },
      memory: this.getCurrentMemory(),
      renderTime: {
        average: this.getAverageRenderTime()
      },
      api: this.getAPIStats(),
      longTasks: this.metrics.longTask.length,
      timestamp: Date.now()
    };
  }

  /**
   * Get average FPS
   * 
   * @returns {number} Average FPS
   */
  getAverageFPS() {
    if (this.metrics.fps.length === 0) return 0;
    
    const sum = this.metrics.fps.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / this.metrics.fps.length);
  }

  /**
   * Get minimum FPS
   * 
   * @returns {number} Minimum FPS
   */
  getMinFPS() {
    if (this.metrics.fps.length === 0) return 0;
    return Math.min(...this.metrics.fps.map(m => m.value));
  }

  /**
   * Get maximum FPS
   * 
   * @returns {number} Maximum FPS
   */
  getMaxFPS() {
    if (this.metrics.fps.length === 0) return 0;
    return Math.max(...this.metrics.fps.map(m => m.value));
  }

  /**
   * Mark render start
   * 
   * @param {string} name - Render identifier
   */
  markRenderStart(name) {
    performance.mark(`render-${name}-start`);
  }

  /**
   * Mark render end and measure
   * 
   * @param {string} name - Render identifier
   */
  markRenderEnd(name) {
    performance.mark(`render-${name}-end`);
    performance.measure(
      `render-${name}`,
      `render-${name}-start`,
      `render-${name}-end`
    );
    
    const measure = performance.getEntriesByName(`render-${name}`)[0];
    if (measure) {
      this.recordMetric('renderTime', measure.duration);
    }
  }

  /**
   * Check if performance is degraded
   * 
   * @returns {Object} Performance status
   */
  checkPerformance() {
    const fps = this.getCurrentFPS();
    const memory = this.getCurrentMemory();
    
    const issues = [];
    
    if (fps < 30) {
      issues.push('Low FPS detected');
    }
    
    if (memory.used > memory.limit * 0.9) {
      issues.push('High memory usage');
    }
    
    if (this.metrics.longTask.length > 10) {
      issues.push('Multiple long tasks detected');
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      fps,
      memory
    };
  }

  /**
   * Report performance to backend
   */
  async reportPerformance() {
    if (!this.reportingEndpoint) return;
    
    const report = this.getReport();
    
    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });
      
      console.log('📊 Performance reported');
    } catch (error) {
      console.error('Failed to report performance:', error);
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = [];
    });
    
    console.log('🗑️ Performance metrics cleared');
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.clear();
    
    console.log('👋 Performance Monitor disposed');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor({
  enabled: true
});

// Export utility functions
export function markRenderStart(name) {
  performanceMonitor.markRenderStart(name);
}

export function markRenderEnd(name) {
  performanceMonitor.markRenderEnd(name);
}

export function getPerformanceReport() {
  return performanceMonitor.getReport();
}
