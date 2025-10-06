/**
 * Analytics Service
 * 
 * Tracks user interactions, feature usage, and errors
 * for product insights and debugging.
 * 
 * @version 2.0.0
 */

export class Analytics {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.endpoint = options.endpoint;
    this.batchSize = options.batchSize || 50;
    this.flushInterval = options.flushInterval || 30000; // 30 seconds
    this.queue = [];
    this.sessionId = this.generateSessionId();
    this.userId = options.userId || this.getStoredUserId();
    this.flushTimer = null;
    
    if (this.enabled) {
      this.init();
    }
  }

  /**
   * Initialize analytics
   */
  init() {
    console.log('📈 Initializing Analytics...');
    
    // Start auto-flush
    this.startAutoFlush();
    
    // Track page view
    this.trackPageView();
    
    // Setup beforeunload handler
    window.addEventListener('beforeunload', () => {
      this.flush(true); // Synchronous flush
    });
    
    console.log('✅ Analytics initialized', {
      sessionId: this.sessionId,
      userId: this.userId
    });
  }

  /**
   * Track an event
   * 
   * @param {string} event - Event name
   * @param {Object} properties - Event properties
   */
  track(event, properties = {}) {
    if (!this.enabled) return;
    
    const data = {
      event,
      properties: {
        ...properties,
        // Add context
        url: window.location.href,
        referrer: document.referrer,
        screen: {
          width: window.screen.width,
          height: window.screen.height
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };
    
    this.queue.push(data);
    
    // Flush if queue is large
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  trackPageView() {
    this.track('page_view', {
      path: window.location.pathname,
      title: document.title,
      search: window.location.search
    });
  }

  /**
   * Track component usage
   * 
   * @param {string} componentType - Component type
   * @param {string} action - Action performed
   * @param {Object} metadata - Additional metadata
   */
  trackComponent(componentType, action, metadata = {}) {
    this.track('component_action', {
      componentType,
      action,
      ...metadata
    });
  }

  /**
   * Track feature usage
   * 
   * @param {string} feature - Feature name
   * @param {Object} metadata - Additional metadata
   */
  trackFeature(feature, metadata = {}) {
    this.track('feature_used', {
      feature,
      ...metadata
    });
  }

  /**
   * Track error
   * 
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }

  /**
   * Track performance metric
   * 
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {Object} metadata - Additional metadata
   */
  trackPerformance(metric, value, metadata = {}) {
    this.track('performance', {
      metric,
      value,
      ...metadata
    });
  }

  /**
   * Track user action
   * 
   * @param {string} action - Action name
   * @param {Object} properties - Action properties
   */
  trackAction(action, properties = {}) {
    this.track('user_action', {
      action,
      ...properties
    });
  }

  /**
   * Identify user
   * 
   * @param {string} userId - User identifier
   * @param {Object} traits - User traits
   */
  identify(userId, traits = {}) {
    this.userId = userId;
    this.storeUserId(userId);
    
    this.track('identify', {
      userId,
      traits
    });
  }

  /**
   * Flush queued events
   * 
   * @param {boolean} sync - Whether to flush synchronously
   */
  async flush(sync = false) {
    if (this.queue.length === 0 || !this.endpoint) {
      return;
    }
    
    const events = [...this.queue];
    this.queue = [];
    
    console.log('📤 Flushing analytics:', events.length, 'events');
    
    try {
      if (sync) {
        // Synchronous flush using sendBeacon
        const blob = new Blob([JSON.stringify({ events })], {
          type: 'application/json'
        });
        navigator.sendBeacon(this.endpoint, blob);
      } else {
        // Asynchronous flush using fetch
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ events })
        });
      }
      
      console.log('✅ Analytics flushed');
    } catch (error) {
      console.error('❌ Analytics flush failed:', error);
      // Re-add to queue on failure
      this.queue.unshift(...events);
    }
  }

  /**
   * Start auto-flush timer
   */
  startAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop auto-flush timer
   */
  stopAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Generate session ID
   * 
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get stored user ID
   * 
   * @returns {string|null} User ID
   */
  getStoredUserId() {
    try {
      return localStorage.getItem('gmkb_user_id');
    } catch {
      return null;
    }
  }

  /**
   * Store user ID
   * 
   * @param {string} userId - User ID
   */
  storeUserId(userId) {
    try {
      localStorage.setItem('gmkb_user_id', userId);
    } catch (error) {
      console.warn('Failed to store user ID:', error);
    }
  }

  /**
   * Enable/disable analytics
   * 
   * @param {boolean} enabled - Whether to enable
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(enabled ? '✅ Analytics enabled' : '⏸️ Analytics disabled');
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = [];
    console.log('🗑️ Analytics queue cleared');
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    this.stopAutoFlush();
    this.flush(true);
    this.clear();
    console.log('👋 Analytics disposed');
  }
}

// Export singleton instance
export const analytics = new Analytics({
  enabled: true,
  endpoint: window.gmkbData?.analyticsEndpoint
});

// Export tracking functions
export function trackEvent(event, properties) {
  analytics.track(event, properties);
}

export function trackComponent(componentType, action, metadata) {
  analytics.trackComponent(componentType, action, metadata);
}

export function trackFeature(feature, metadata) {
  analytics.trackFeature(feature, metadata);
}

export function trackError(error, context) {
  analytics.trackError(error, context);
}

export function identifyUser(userId, traits) {
  analytics.identify(userId, traits);
}
