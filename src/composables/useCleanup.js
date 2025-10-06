/**
 * Cleanup Composable - Phase 11: Memory Leak Prevention
 * 
 * Provides automatic cleanup of watchers, intervals, timeouts, and event listeners
 * to prevent memory leaks in Vue components.
 * 
 * @version 1.0.0
 */

import { onBeforeUnmount, onUnmounted } from 'vue';

export function useCleanup() {
  const cleanupTasks = [];
  const intervals = new Set();
  const timeouts = new Set();
  const listeners = [];
  const watchers = [];
  const subscriptions = [];
  const abortControllers = new Set();

  /**
   * Register a custom cleanup task
   * @param {Function} task - Cleanup function to run on unmount
   */
  const registerCleanup = (task) => {
    if (typeof task === 'function') {
      cleanupTasks.push(task);
    }
  };

  /**
   * Add an interval for automatic cleanup
   * @param {number} id - Interval ID from setInterval
   * @returns {number} The interval ID
   */
  const addInterval = (callback, delay) => {
    const id = setInterval(callback, delay);
    intervals.add(id);
    return id;
  };

  /**
   * Add a timeout for automatic cleanup
   * @param {Function} callback - Timeout callback
   * @param {number} delay - Delay in milliseconds
   * @returns {number} The timeout ID
   */
  const addTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeouts.add(id);
    return id;
  };

  /**
   * Clear an interval and remove from tracking
   * @param {number} id - Interval ID
   */
  const removeInterval = (id) => {
    clearInterval(id);
    intervals.delete(id);
  };

  /**
   * Clear a timeout and remove from tracking
   * @param {number} id - Timeout ID
   */
  const removeTimeout = (id) => {
    clearTimeout(id);
    timeouts.delete(id);
  };

  /**
   * Add an event listener for automatic cleanup
   * @param {EventTarget} target - Event target
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   */
  const addEventListener = (target, event, handler, options) => {
    if (target && typeof target.addEventListener === 'function') {
      target.addEventListener(event, handler, options);
      listeners.push({ target, event, handler, options });
    }
  };

  /**
   * Remove an event listener and stop tracking it
   * @param {EventTarget} target - Event target
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  const removeEventListener = (target, event, handler) => {
    if (target && typeof target.removeEventListener === 'function') {
      target.removeEventListener(event, handler);
      const index = listeners.findIndex(l => 
        l.target === target && l.event === event && l.handler === handler
      );
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };

  /**
   * Add a watcher for automatic cleanup
   * @param {Function} watcherStop - Stop function returned by watch()
   */
  const addWatcher = (watcherStop) => {
    if (typeof watcherStop === 'function') {
      watchers.push(watcherStop);
    }
    return watcherStop;
  };

  /**
   * Add a subscription for automatic cleanup
   * @param {Object} subscription - Subscription object with unsubscribe method
   */
  const addSubscription = (subscription) => {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscriptions.push(subscription);
    }
    return subscription;
  };

  /**
   * Create an AbortController for automatic cleanup
   * @returns {AbortController} New abort controller
   */
  const createAbortController = () => {
    const controller = new AbortController();
    abortControllers.add(controller);
    return controller;
  };

  /**
   * Clean up all resources immediately
   */
  const cleanup = () => {
    // Run custom cleanup tasks
    cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task error:', error);
      }
    });
    
    // Clear intervals
    intervals.forEach(id => clearInterval(id));
    
    // Clear timeouts
    timeouts.forEach(id => clearTimeout(id));
    
    // Remove event listeners
    listeners.forEach(({ target, event, handler, options }) => {
      try {
        if (target && typeof target.removeEventListener === 'function') {
          target.removeEventListener(event, handler, options);
        }
      } catch (error) {
        console.error('Failed to remove event listener:', error);
      }
    });
    
    // Stop watchers
    watchers.forEach(stop => {
      try {
        stop();
      } catch (error) {
        console.error('Failed to stop watcher:', error);
      }
    });
    
    // Unsubscribe from subscriptions
    subscriptions.forEach(sub => {
      try {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      } catch (error) {
        console.error('Failed to unsubscribe:', error);
      }
    });
    
    // Abort any pending requests
    abortControllers.forEach(controller => {
      try {
        controller.abort();
      } catch (error) {
        console.error('Failed to abort:', error);
      }
    });
    
    // Clear all collections
    cleanupTasks.length = 0;
    intervals.clear();
    timeouts.clear();
    listeners.length = 0;
    watchers.length = 0;
    subscriptions.length = 0;
    abortControllers.clear();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Cleanup completed');
    }
  };

  // Automatic cleanup on component unmount
  onBeforeUnmount(() => {
    cleanup();
  });

  // Additional cleanup on unmounted (just in case)
  onUnmounted(() => {
    // Final cleanup attempt
    if (intervals.size > 0 || timeouts.size > 0 || listeners.length > 0) {
      console.warn('⚠️ Resources still active after unmount, cleaning up...');
      cleanup();
    }
  });

  return {
    registerCleanup,
    addInterval,
    addTimeout,
    removeInterval,
    removeTimeout,
    addEventListener,
    removeEventListener,
    addWatcher,
    addSubscription,
    createAbortController,
    cleanup
  };
}

/**
 * Global cleanup tracker for debugging memory leaks
 */
export class CleanupTracker {
  static instances = new Map();
  static totalResources = 0;

  static track(componentName, resourceType) {
    if (!this.instances.has(componentName)) {
      this.instances.set(componentName, {
        intervals: 0,
        timeouts: 0,
        listeners: 0,
        watchers: 0,
        subscriptions: 0
      });
    }
    
    const stats = this.instances.get(componentName);
    if (stats[resourceType] !== undefined) {
      stats[resourceType]++;
      this.totalResources++;
    }
  }

  static untrack(componentName, resourceType) {
    const stats = this.instances.get(componentName);
    if (stats && stats[resourceType] !== undefined) {
      stats[resourceType]--;
      this.totalResources--;
      
      // Remove component entry if no resources left
      const hasResources = Object.values(stats).some(count => count > 0);
      if (!hasResources) {
        this.instances.delete(componentName);
      }
    }
  }

  static getReport() {
    const report = {
      totalComponents: this.instances.size,
      totalResources: this.totalResources,
      components: {}
    };
    
    this.instances.forEach((stats, name) => {
      report.components[name] = { ...stats };
    });
    
    return report;
  }

  static reset() {
    this.instances.clear();
    this.totalResources = 0;
  }
}

// Expose tracker in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__cleanupTracker = CleanupTracker;
  console.log('[CleanupTracker] Available at window.__cleanupTracker.getReport()');
}
