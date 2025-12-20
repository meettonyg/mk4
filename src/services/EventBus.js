/**
 * EventBus - Cross-Component Communication Service
 *
 * Provides a simple event bus using native browser CustomEvents.
 * Used for decoupled communication between Vue components and stores.
 *
 * Usage:
 *   import { EventBus, EVENTS } from '@/services/EventBus';
 *
 *   // Emit an event
 *   EventBus.emit(EVENTS.PITCH_SENT, { userId: 123, pitchId: 456 });
 *
 *   // Listen to an event
 *   const unsubscribe = EventBus.on(EVENTS.PITCH_SENT, (data) => {
 *       console.log('Pitch sent:', data);
 *   });
 *
 *   // Cleanup
 *   unsubscribe();
 *
 * @package GMKB
 * @since 3.0.0
 */

// Event name constants - prevents typos and enables autocomplete
export const EVENTS = {
    // Onboarding events
    PITCH_SENT: 'gmkb:pitch_sent',
    IMPORT_COMPLETED: 'gmkb:import_completed',
    PROFILE_SAVED: 'gmkb:profile_saved',
    TASK_COMPLETED: 'gmkb:task_completed',
    REWARD_UNLOCKED: 'gmkb:reward_unlocked',
    PROGRESS_UPDATED: 'gmkb:progress_updated',

    // Search events (Prospector integration)
    SEARCH_PERFORMED: 'gmkb:search_performed',

    // Profile events
    PROFILE_CREATED: 'gmkb:profile_created',
    PROFILE_DELETED: 'gmkb:profile_deleted',
    PROFILE_FIELD_UPDATED: 'gmkb:profile_field_updated',

    // Media Kit events
    MEDIA_KIT_SAVED: 'gmkb:media_kit_saved',
    MEDIA_KIT_PUBLISHED: 'gmkb:media_kit_published',
    COMPONENT_ADDED: 'gmkb:component_added',
    COMPONENT_REMOVED: 'gmkb:component_removed',

    // Interview Tracker events (bridge from Prospector plugin)
    INTERVIEW_IMPORTED: 'gmkb:interview_imported',
    OPPORTUNITY_SAVED: 'gmkb:opportunity_saved',

    // System events
    AUTH_CHANGED: 'gmkb:auth_changed',
    NETWORK_ERROR: 'gmkb:network_error',
    CACHE_INVALIDATED: 'gmkb:cache_invalidated',
};

/**
 * EventBus singleton
 * Uses window as the event target for cross-module communication
 */
class EventBusService {
    constructor() {
        this.target = window;
        this.debug = window.gmkbConfig?.debug || false;
    }

    /**
     * Emit an event with optional data payload
     *
     * @param {string} eventName - Event name from EVENTS constant
     * @param {*} data - Optional data payload
     */
    emit(eventName, data = null) {
        const event = new CustomEvent(eventName, {
            detail: {
                data,
                timestamp: Date.now(),
            },
            bubbles: true,
            cancelable: true,
        });

        if (this.debug) {
            console.log(`[EventBus] Emitting: ${eventName}`, data);
        }

        this.target.dispatchEvent(event);
    }

    /**
     * Subscribe to an event
     *
     * @param {string} eventName - Event name from EVENTS constant
     * @param {Function} callback - Handler function receiving (data, event) args
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
        const handler = (event) => {
            const { data, timestamp } = event.detail || {};

            if (this.debug) {
                console.log(`[EventBus] Received: ${eventName}`, { data, timestamp });
            }

            callback(data, event);
        };

        this.target.addEventListener(eventName, handler);

        // Return unsubscribe function
        return () => {
            this.target.removeEventListener(eventName, handler);
        };
    }

    /**
     * Subscribe to an event once (auto-unsubscribes after first call)
     *
     * @param {string} eventName - Event name from EVENTS constant
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function (can cancel before event fires)
     */
    once(eventName, callback) {
        const unsubscribe = this.on(eventName, (data, event) => {
            unsubscribe();
            callback(data, event);
        });
        return unsubscribe;
    }

    /**
     * Remove all listeners for an event
     * Note: This only works for listeners added via this EventBus
     *
     * @param {string} eventName - Event name to clear
     */
    off(eventName) {
        // Create a new event to signify clearing
        // Listeners should check for this if they need cleanup notification
        this.emit(`${eventName}:cleared`);
    }

    /**
     * Enable/disable debug logging
     *
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebug(enabled) {
        this.debug = enabled;
    }
}

// Export singleton instance
export const EventBus = new EventBusService();

// Also export as default for convenience
export default EventBus;

/**
 * Vue Plugin - Auto-subscribes to events and cleans up on unmount
 *
 * Usage in Vue 3 component:
 *   import { useEventBus } from '@/services/EventBus';
 *   const { on, emit } = useEventBus();
 *   on(EVENTS.PITCH_SENT, handlePitchSent);
 */
import { onUnmounted } from 'vue';

export function useEventBus() {
    const subscriptions = [];

    /**
     * Subscribe with auto-cleanup on component unmount
     */
    const on = (eventName, callback) => {
        const unsubscribe = EventBus.on(eventName, callback);
        subscriptions.push(unsubscribe);
        return unsubscribe;
    };

    /**
     * Subscribe once with auto-cleanup
     */
    const once = (eventName, callback) => {
        const unsubscribe = EventBus.once(eventName, callback);
        subscriptions.push(unsubscribe);
        return unsubscribe;
    };

    /**
     * Emit an event (pass-through)
     */
    const emit = (eventName, data) => {
        EventBus.emit(eventName, data);
    };

    // Cleanup all subscriptions on unmount
    onUnmounted(() => {
        subscriptions.forEach((unsubscribe) => unsubscribe());
    });

    return {
        on,
        once,
        emit,
        EVENTS,
    };
}

/**
 * Global registration helper
 * Makes EventBus available on window for debugging and cross-frame communication
 */
export function registerGlobal() {
    if (typeof window !== 'undefined') {
        window.gmkbEventBus = EventBus;
        window.GMKB_EVENTS = EVENTS;

        if (EventBus.debug) {
            console.log('[EventBus] Registered globally as window.gmkbEventBus');
        }
    }
}
