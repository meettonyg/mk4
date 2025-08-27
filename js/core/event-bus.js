/**
 * Centralized Event Bus
 * Manages all application events to prevent race conditions and ensure proper event coordination
 * Addresses RACE 5: DOM Ready vs Event Listener Setup
 * ROOT FIX: WordPress-compatible IIFE wrapper
 */

// ROOT FIX: WordPress-compatible IIFE wrapper
(function() {
    'use strict';
    
    // ROOT FIX: Use global objects instead of ES6 imports
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    
    const performanceMonitor = window.performanceMonitor || {
        start: () => () => {}
    };

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.eventQueue = [];
        this.isReady = false;
        this.eventHistory = [];
        this.maxHistorySize = 100;
        this.eventStats = new Map();
        this.logger = structuredLogger;
        this.priorities = {
            CRITICAL: 0,
            HIGH: 1,
            NORMAL: 2,
            LOW: 3
        };
        
        // Setup DOM ready detection
        this.setupDOMReady();
        
        // Replay queue for events fired before listeners attached
        this.replayQueue = new Map();
        this.replayTimeout = 5000; // Max time to hold events for replay
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
    }

    /**
     * Setup DOM ready detection
     */
    setupDOMReady() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.isReady = true;
            this.processQueue();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                this.isReady = true;
                this.logger.info('EVENT', 'DOM ready, processing event queue', {
                    queueSize: this.eventQueue.length
                });
                this.processQueue();
            });
        }
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor event processing time
        this.originalEmit = this.emit.bind(this);
        this.emit = (event, data, options) => {
            const perfEnd = performanceMonitor.start('event-emit', { event });
            const result = this.originalEmit(event, data, options);
            perfEnd();
            return result;
        };
    }

    /**
     * Register event listener with validation
     */
    on(event, callback, options = {}) {
        if (typeof event !== 'string' || !event) {
            throw new Error('Event name must be a non-empty string');
        }
        
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        const {
            priority = this.priorities.NORMAL,
            once = false,
            context = null,
            id = null,
            replay = true
        } = options;

        // Create listener object
        const listener = {
            callback,
            priority,
            once,
            context,
            id: id || this.generateListenerId(),
            registered: Date.now()
        };

        // Add to listeners
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        const eventListeners = this.listeners.get(event);
        eventListeners.push(listener);
        
        // Sort by priority
        eventListeners.sort((a, b) => a.priority - b.priority);

        this.logger.debug('EVENT', `Listener registered for: ${event}`, {
            id: listener.id,
            priority,
            total: eventListeners.length
        });

        // Check for replay events
        if (replay && this.replayQueue.has(event)) {
            const replayEvents = this.replayQueue.get(event);
            this.logger.info('EVENT', `Replaying ${replayEvents.length} events for: ${event}`);
            
            replayEvents.forEach(({ data, timestamp }) => {
                // Only replay recent events
                if (Date.now() - timestamp < this.replayTimeout) {
                    try {
                        callback.call(context, data);
                    } catch (error) {
                        this.logger.error('EVENT', `Replay error for ${event}`, error);
                    }
                }
            });
            
            // Clear replay queue for this event
            this.replayQueue.delete(event);
        }

        // Return unsubscribe function
        return () => this.off(event, listener.id);
    }

    /**
     * Register one-time event listener
     */
    once(event, callback, options = {}) {
        return this.on(event, callback, { ...options, once: true });
    }

    /**
     * Remove event listener
     */
    off(event, listenerIdOrCallback) {
        if (!this.listeners.has(event)) {
            return false;
        }

        const eventListeners = this.listeners.get(event);
        const sizeBefore = eventListeners.length;

        // Filter out the listener
        const filtered = eventListeners.filter(listener => {
            if (typeof listenerIdOrCallback === 'string') {
                return listener.id !== listenerIdOrCallback;
            } else if (typeof listenerIdOrCallback === 'function') {
                return listener.callback !== listenerIdOrCallback;
            }
            return true;
        });

        if (filtered.length === 0) {
            this.listeners.delete(event);
        } else {
            this.listeners.set(event, filtered);
        }

        const removed = sizeBefore - filtered.length;
        if (removed > 0) {
            this.logger.debug('EVENT', `Removed ${removed} listener(s) for: ${event}`);
        }

        return removed > 0;
    }

    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        if (event) {
            const had = this.listeners.has(event);
            this.listeners.delete(event);
            return had;
        } else {
            this.listeners.clear();
            return true;
        }
    }

    /**
     * Emit event with data
     */
    emit(event, data = {}, options = {}) {
        const {
            async = false,
            cancelable = true,
            replayable = true
        } = options;

        // Track event stats
        this.updateEventStats(event);

        // Add to history
        this.addToHistory(event, data);

        // If DOM not ready and event is queueable, queue it
        if (!this.isReady && options.queueable !== false) {
            this.eventQueue.push({ event, data, options, timestamp: Date.now() });
            this.logger.debug('EVENT', `Event queued: ${event}`, { queueSize: this.eventQueue.length });
            return true;
        }

        // Check if we have listeners
        if (!this.listeners.has(event)) {
            // Store in replay queue if replayable
            if (replayable) {
                if (!this.replayQueue.has(event)) {
                    this.replayQueue.set(event, []);
                }
                
                this.replayQueue.get(event).push({
                    data,
                    timestamp: Date.now()
                });
                
                // Cleanup old replay events
                setTimeout(() => {
                    const queue = this.replayQueue.get(event);
                    if (queue) {
                        const now = Date.now();
                        const filtered = queue.filter(item => now - item.timestamp < this.replayTimeout);
                        if (filtered.length === 0) {
                            this.replayQueue.delete(event);
                        } else {
                            this.replayQueue.set(event, filtered);
                        }
                    }
                }, this.replayTimeout);
            }
            
            this.logger.debug('EVENT', `No listeners for: ${event}`, { replayable });
            return false;
        }

        const eventListeners = [...this.listeners.get(event)];
        const eventData = {
            type: event,
            data,
            timestamp: Date.now(),
            defaultPrevented: false,
            propagationStopped: false,
            preventDefault: function() {
                if (cancelable) {
                    this.defaultPrevented = true;
                }
            },
            stopPropagation: function() {
                this.propagationStopped = true;
            }
        };

        // Execute listeners
        const executeListeners = () => {
            let executed = 0;
            
            for (const listener of eventListeners) {
                if (eventData.propagationStopped) {
                    break;
                }

                try {
                    listener.callback.call(listener.context, eventData);
                    executed++;

                    // Remove if one-time listener
                    if (listener.once) {
                        this.off(event, listener.id);
                    }
                } catch (error) {
                    this.logger.error('EVENT', `Listener error for ${event}`, error, {
                        listenerId: listener.id
                    });
                }
            }

            this.logger.debug('EVENT', `Event emitted: ${event}`, {
                listeners: eventListeners.length,
                executed,
                defaultPrevented: eventData.defaultPrevented
            });

            return !eventData.defaultPrevented;
        };

        // Execute async or sync
        if (async) {
            return Promise.resolve().then(executeListeners);
        } else {
            return executeListeners();
        }
    }

    /**
     * Emit event and wait for all async handlers
     */
    async emitAsync(event, data = {}, options = {}) {
        return this.emit(event, data, { ...options, async: true });
    }

    /**
     * Process queued events
     */
    processQueue() {
        if (this.eventQueue.length === 0) return;

        const queue = [...this.eventQueue];
        this.eventQueue = [];

        this.logger.info('EVENT', `Processing ${queue.length} queued events`);

        queue.forEach(({ event, data, options, timestamp }) => {
            // Only process recent events
            if (Date.now() - timestamp < 10000) {
                this.emit(event, data, { ...options, queueable: false });
            }
        });
    }

    /**
     * Wait for specific event
     */
    waitFor(event, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.off(event, handler);
                reject(new Error(`Timeout waiting for event: ${event}`));
            }, timeout);

            const handler = (eventData) => {
                clearTimeout(timer);
                resolve(eventData);
            };

            this.once(event, handler);
        });
    }

    /**
     * Bridge DOM events to event bus
     */
    bridgeDOMEvent(element, domEvent, busEvent, transform) {
        if (!element || !element.addEventListener) {
            throw new Error('Invalid DOM element');
        }

        const handler = (e) => {
            const data = transform ? transform(e) : { originalEvent: e };
            this.emit(busEvent || domEvent, data);
        };

        element.addEventListener(domEvent, handler);
        
        // Store for cleanup
        if (!element._eventBusBridges) {
            element._eventBusBridges = new Map();
        }
        element._eventBusBridges.set(domEvent, handler);

        // Return cleanup function
        return () => {
            element.removeEventListener(domEvent, handler);
            element._eventBusBridges.delete(domEvent);
        };
    }

    /**
     * Create namespaced event emitter
     */
    namespace(ns) {
        const self = this;
        return {
            on: (event, callback, options) => 
                self.on(`${ns}:${event}`, callback, options),
            off: (event, listenerIdOrCallback) => 
                self.off(`${ns}:${event}`, listenerIdOrCallback),
            emit: (event, data, options) => 
                self.emit(`${ns}:${event}`, data, options),
            once: (event, callback, options) => 
                self.once(`${ns}:${event}`, callback, options)
        };
    }

    /**
     * Update event statistics
     */
    updateEventStats(event) {
        if (!this.eventStats.has(event)) {
            this.eventStats.set(event, {
                count: 0,
                firstEmitted: Date.now(),
                lastEmitted: null
            });
        }

        const stats = this.eventStats.get(event);
        stats.count++;
        stats.lastEmitted = Date.now();
    }

    /**
     * Add event to history
     */
    addToHistory(event, data) {
        this.eventHistory.push({
            event,
            data,
            timestamp: Date.now()
        });

        // Trim history
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * Generate unique listener ID
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get event statistics
     */
    getStats() {
        const stats = {
            totalEvents: this.eventStats.size,
            totalListeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
            queueSize: this.eventQueue.length,
            replayQueueSize: Array.from(this.replayQueue.values()).reduce((sum, arr) => sum + arr.length, 0),
            events: {}
        };

        // Add per-event stats
        this.eventStats.forEach((eventStat, event) => {
            stats.events[event] = {
                ...eventStat,
                listeners: this.listeners.get(event)?.length || 0
            };
        });

        return stats;
    }

    /**
     * Debug event system
     */
    debug() {
        console.group('%c🚌 Event Bus Debug', 'font-size: 14px; font-weight: bold; color: #4CAF50');
        
        console.log('Status:', {
            ready: this.isReady,
            queueSize: this.eventQueue.length,
            listeners: this.listeners.size
        });

        console.log('\nEvent Listeners:');
        this.listeners.forEach((listeners, event) => {
            console.log(`  ${event}: ${listeners.length} listeners`);
        });

        console.log('\nEvent Statistics:');
        const stats = this.getStats();
        console.table(stats.events);

        console.log('\nRecent History:');
        this.eventHistory.slice(-10).forEach(item => {
            console.log(`  ${new Date(item.timestamp).toLocaleTimeString()} - ${item.event}`);
        });

        console.groupEnd();
    }

    /**
     * Clear all data (for testing)
     */
    reset() {
        this.listeners.clear();
        this.eventQueue = [];
        this.eventHistory = [];
        this.eventStats.clear();
        this.replayQueue.clear();
        this.logger.info('EVENT', 'Event bus reset');
    }
}

// ROOT FIX: Create singleton instance
const eventBus = new EventBus();

// Setup global event mappings for backward compatibility
const globalEventMappings = {
    'show-component-library': 'ui:show-component-library',
    'show-template-library': 'ui:show-template-library',
    'show-global-settings': 'ui:show-global-settings',
    'component-added': 'state:component-added',
    'component-removed': 'state:component-removed',
    'state-changed': 'state:changed'
};

// Bridge existing DOM custom events
Object.entries(globalEventMappings).forEach(([oldEvent, newEvent]) => {
    document.addEventListener(oldEvent, (e) => {
        eventBus.emit(newEvent, e.detail || {});
    });
});

// ROOT FIX: WordPress-compatible global exposure
window.eventBus = eventBus;
window.EventBus = EventBus;

// ROOT FIX: Export convenience methods as global functions
window.gmkbEventOn = eventBus.on.bind(eventBus);
window.gmkbEventOff = eventBus.off.bind(eventBus);
window.gmkbEventEmit = eventBus.emit.bind(eventBus);
window.gmkbEventOnce = eventBus.once.bind(eventBus);

// ✅ CHECKLIST COMPLIANT: Emit ready event for event-driven architecture
document.dispatchEvent(new CustomEvent('gmkb:event-bus-ready', {
    detail: { 
        eventBus: eventBus,
        timestamp: Date.now()
    }
}));

console.log('✅ ROOT FIX: Event Bus exposed globally and ready event emitted');

})(); // ROOT FIX: Close IIFE wrapper
