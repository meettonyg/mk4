/**
 * Event Bus System - DEPRECATED
 * 
 * @deprecated Since v4.0.0 - Use Pinia $subscribe or DOM CustomEvents instead
 * @willBeRemovedIn v5.0.0
 * 
 * P0 FIX #10: EventBus has been replaced with:
 * - Pinia $subscribe for store state changes
 * - DOM CustomEvents for component communication
 * 
 * Migration guide:
 * ```javascript
 * // OLD (EventBus):
 * eventBus.on('store:initialized', handler);
 * eventBus.emit('store:initialized', data);
 * 
 * // NEW (Pinia):
 * const unwatch = store.$subscribe((mutation, state) => {
 *   if (state.isInitialized) {
 *     handler(state);
 *     unwatch();
 *   }
 * });
 * 
 * // NEW (DOM CustomEvents for non-store events):
 * document.addEventListener('gmkb:event-name', handler);
 * document.dispatchEvent(new CustomEvent('gmkb:event-name', { detail: data }));
 * ```
 * 
 * @version 2.0.0
 */

if (typeof console !== 'undefined') {
  console.warn(
    '[DEPRECATED] EventBus is deprecated and will be removed in v5.0.0. ' +
    'Use Pinia $subscribe or DOM CustomEvents instead. ' +
    'See EventBus.js for migration guide.'
  );
}

/**
 * Event Bus System - Core Foundation for Event-Driven Architecture
 * 
 * This replaces all polling/timeout patterns with proper event-driven communication.
 * Ensures predictable initialization order and prevents race conditions.
 * 
 * @version 2.0.0
 * @implements Checklist Phase 1: Architectural Integrity & Race Condition Prevention
 */

class EventBus {
  constructor() {
    this.events = new Map();
    this.readyStates = new Map();
    this.eventHistory = [];
    this.debug = process.env.NODE_ENV === 'development' || window.gmkbData?.debugMode;
  }

  /**
   * Emit an event with optional data
   * Stores ready state to handle late subscribers
   * 
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data = null) {
    // Store ready state for late subscribers
    this.readyStates.set(event, { data, timestamp: Date.now() });
    
    // Log in development
    if (this.debug) {
      console.log(`[EventBus] Emitting: ${event}`, data);
      this.eventHistory.push({ type: 'emit', event, data, timestamp: Date.now() });
    }
    
    // Notify all subscribers
    if (this.events.has(event)) {
      const callbacks = this.events.get(event);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error in callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event
   * Immediately fires if system already ready (solves race conditions)
   * 
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event).add(callback);
    
    // If system already ready, fire immediately (prevents race conditions)
    if (this.readyStates.has(event)) {
      const { data, timestamp } = this.readyStates.get(event);
      if (this.debug) {
        console.log(`[EventBus] Late subscriber to ${event}, firing immediately`);
      }
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in late callback for ${event}:`, error);
      }
    }
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event only once
   * 
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  once(event, callback) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event
   * 
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   */
  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
      
      // Clean up empty event sets
      if (this.events.get(event).size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Clear all subscribers for an event
   * 
   * @param {string} event - Event name
   */
  clear(event) {
    if (event) {
      this.events.delete(event);
      this.readyStates.delete(event);
    } else {
      // Clear all if no event specified
      this.events.clear();
      this.readyStates.clear();
    }
  }

  /**
   * Wait for an event to occur (Promise-based)
   * Useful for async/await patterns
   * 
   * @param {string} event - Event name
   * @param {number} timeout - Optional timeout in milliseconds
   * @returns {Promise} Resolves with event data
   */
  waitFor(event, timeout = 0) {
    return new Promise((resolve, reject) => {
      // If already ready, resolve immediately
      if (this.readyStates.has(event)) {
        resolve(this.readyStates.get(event).data);
        return;
      }
      
      let timeoutId;
      const unsubscribe = this.on(event, (data) => {
        if (timeoutId) clearTimeout(timeoutId);
        unsubscribe();
        resolve(data);
      });
      
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          unsubscribe();
          reject(new Error(`EventBus: Timeout waiting for ${event}`));
        }, timeout);
      }
    });
  }

  /**
   * Get debug information
   * 
   * @returns {Object} Debug info
   */
  getDebugInfo() {
    return {
      activeEvents: Array.from(this.events.keys()),
      readyStates: Array.from(this.readyStates.keys()),
      subscriberCounts: Array.from(this.events.entries()).map(([event, callbacks]) => ({
        event,
        count: callbacks.size
      })),
      history: this.eventHistory.slice(-20) // Last 20 events
    };
  }
}

// Export singleton instance
const eventBus = new EventBus();

// Expose to window in development for debugging
if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.gmkbData?.debugMode)) {
  window.__eventBus = eventBus;
  window.__eventBusDebug = () => eventBus.getDebugInfo();
  console.log('[EventBus] ✅ Event bus initialized and available at window.__eventBus');
}

export default eventBus;
