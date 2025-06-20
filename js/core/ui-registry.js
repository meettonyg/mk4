/**
 * UI Registry for Reactive Component Updates
 * Provides fine-grained subscriptions for efficient UI updates
 * Part of Phase 3: Enhanced State Integration
 */

import { enhancedStateManager } from './enhanced-state-manager.js';
import { eventBus } from './event-bus.js';
import { structuredLogger } from '../utils/structured-logger.js';
import { performanceMonitor } from '../utils/performance-monitor.js';

class UIRegistry {
    constructor() {
        this.components = new Map(); // componentId -> { element, updateFn, subscriptions }
        this.subscriptions = new Map(); // subscriptionId -> { componentId, property, callback }
        this.pendingUpdates = new Set();
        this.updateFrame = null;
        this.logger = structuredLogger;
        
        // Setup state change listener
        this.setupStateListener();
        
        // Performance tracking
        this.updateStats = {
            total: 0,
            batched: 0,
            skipped: 0,
            errors: 0
        };
    }

    /**
     * Setup global state change listener
     */
    setupStateListener() {
        // Subscribe to state changes
        enhancedStateManager.subscribeGlobal((state) => {
            this.handleStateChange(state);
        });

        // Listen for specific component events
        eventBus.on('state:component-added', (event) => {
            this.handleComponentAdded(event.data);
        });

        eventBus.on('state:component-removed', (event) => {
            this.handleComponentRemoved(event.data);
        });

        eventBus.on('state:component-updated', (event) => {
            this.handleComponentUpdated(event.data);
        });
    }

    /**
     * Register a UI component for reactive updates
     */
    register(componentId, element, updateFn, options = {}) {
        if (!componentId || !element || !updateFn) {
            throw new Error('Invalid registration parameters');
        }

        const perfEnd = performanceMonitor.start('ui-register', { componentId });

        // Store component info
        this.components.set(componentId, {
            element,
            updateFn,
            options,
            subscriptions: new Set(),
            lastUpdate: null,
            updateCount: 0
        });

        // Mark element for tracking
        element.setAttribute('data-ui-registered', 'true');
        element.setAttribute('data-component-id', componentId);

        this.logger.debug('UI', `Registered component: ${componentId}`, {
            hasElement: !!element,
            options
        });

        perfEnd();

        // Return unregister function
        return () => this.unregister(componentId);
    }

    /**
     * Unregister a UI component
     */
    unregister(componentId) {
        const component = this.components.get(componentId);
        if (!component) return;

        // Clear all subscriptions
        component.subscriptions.forEach(subId => {
            this.subscriptions.delete(subId);
        });

        // Remove element attributes
        if (component.element) {
            component.element.removeAttribute('data-ui-registered');
        }

        this.components.delete(componentId);
        this.logger.debug('UI', `Unregistered component: ${componentId}`);
    }

    /**
     * Subscribe to specific component property changes
     */
    subscribeToProperty(componentId, property, callback) {
        const component = this.components.get(componentId);
        if (!component) {
            this.logger.warn('UI', `Cannot subscribe to unregistered component: ${componentId}`);
            return null;
        }

        const subscriptionId = this.generateSubscriptionId();
        
        this.subscriptions.set(subscriptionId, {
            componentId,
            property,
            callback,
            created: Date.now()
        });

        component.subscriptions.add(subscriptionId);

        this.logger.debug('UI', `Property subscription created`, {
            componentId,
            property,
            subscriptionId
        });

        // Return unsubscribe function
        return () => {
            this.subscriptions.delete(subscriptionId);
            component.subscriptions.delete(subscriptionId);
        };
    }

    /**
     * Handle global state changes
     */
    handleStateChange(state) {
        const perfEnd = performanceMonitor.start('ui-state-change');
        
        // Batch updates for next frame
        this.components.forEach((component, componentId) => {
            const componentState = state.components[componentId];
            
            if (componentState && this.shouldUpdate(component, componentState)) {
                this.pendingUpdates.add(componentId);
            }
        });

        // Schedule update if needed
        if (this.pendingUpdates.size > 0 && !this.updateFrame) {
            this.scheduleUpdate();
        }

        perfEnd();
    }

    /**
     * Check if component should update
     */
    shouldUpdate(component, newState) {
        // Skip if same reference (no change)
        if (component.lastState === newState) {
            return false;
        }

        // Check update options
        if (component.options.updateOn) {
            // Only update on specific properties
            const changedProps = this.getChangedProperties(component.lastState, newState);
            const shouldUpdate = component.options.updateOn.some(prop => 
                changedProps.has(prop)
            );
            
            if (!shouldUpdate) {
                this.updateStats.skipped++;
                return false;
            }
        }

        return true;
    }

    /**
     * Get changed properties between states
     */
    getChangedProperties(oldState, newState) {
        const changed = new Set();
        
        if (!oldState) {
            // All properties are new
            Object.keys(newState || {}).forEach(key => changed.add(key));
            return changed;
        }

        // Check for changes
        const allKeys = new Set([
            ...Object.keys(oldState || {}),
            ...Object.keys(newState || {})
        ]);

        allKeys.forEach(key => {
            if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
                changed.add(key);
            }
        });

        return changed;
    }

    /**
     * Schedule batched update
     */
    scheduleUpdate() {
        this.updateFrame = requestAnimationFrame(() => {
            this.processPendingUpdates();
            this.updateFrame = null;
        });
    }

    /**
     * Process all pending updates
     */
    processPendingUpdates() {
        const perfEnd = performanceMonitor.start('ui-batch-update', {
            count: this.pendingUpdates.size
        });

        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();

        this.updateStats.batched++;

        updates.forEach(componentId => {
            try {
                this.updateComponent(componentId);
            } catch (error) {
                this.updateStats.errors++;
                this.logger.error('UI', `Error updating component ${componentId}`, error);
            }
        });

        perfEnd();

        // Emit batch complete event
        eventBus.emit('ui:batch-update-complete', {
            updated: updates.length,
            stats: this.updateStats
        });
    }

    /**
     * Update a specific component
     */
    updateComponent(componentId) {
        const component = this.components.get(componentId);
        if (!component) return;

        const state = enhancedStateManager.getState();
        const componentState = state.components[componentId];
        
        if (!componentState) {
            // Component removed from state
            this.unregister(componentId);
            return;
        }

        const perfEnd = performanceMonitor.start('ui-component-update', { componentId });

        try {
            // Call update function
            component.updateFn(component.element, componentState, {
                previousState: component.lastState,
                updateCount: component.updateCount++
            });

            // Update tracking
            component.lastState = componentState;
            component.lastUpdate = Date.now();
            this.updateStats.total++;

            // Notify property subscribers
            this.notifyPropertySubscribers(componentId, componentState);

        } catch (error) {
            this.logger.error('UI', `Component update failed: ${componentId}`, error);
            throw error;
        } finally {
            perfEnd();
        }
    }

    /**
     * Notify property-specific subscribers
     */
    notifyPropertySubscribers(componentId, componentState) {
        const component = this.components.get(componentId);
        if (!component) return;

        component.subscriptions.forEach(subId => {
            const subscription = this.subscriptions.get(subId);
            if (!subscription) return;

            try {
                // Check if specific property changed
                const oldValue = component.lastState?.[subscription.property];
                const newValue = componentState[subscription.property];
                
                if (oldValue !== newValue) {
                    subscription.callback(newValue, oldValue, componentState);
                }
            } catch (error) {
                this.logger.error('UI', 'Property subscriber error', error, {
                    componentId,
                    property: subscription.property
                });
            }
        });
    }

    /**
     * Handle component added event
     */
    handleComponentAdded(data) {
        const { componentId, element } = data;
        
        // Auto-register if element provided
        if (element && !this.components.has(componentId)) {
            this.logger.debug('UI', `Auto-registering new component: ${componentId}`);
            
            // Default update function
            const defaultUpdateFn = (el, state) => {
                // Trigger re-render event
                eventBus.emit('ui:component-needs-render', {
                    componentId,
                    element: el,
                    state
                });
            };
            
            this.register(componentId, element, defaultUpdateFn);
        }
    }

    /**
     * Handle component removed event
     */
    handleComponentRemoved(data) {
        const { componentId } = data;
        this.unregister(componentId);
    }

    /**
     * Handle component updated event
     */
    handleComponentUpdated(data) {
        const { componentId, changes } = data;
        
        if (this.components.has(componentId)) {
            this.pendingUpdates.add(componentId);
            if (!this.updateFrame) {
                this.scheduleUpdate();
            }
        }
    }

    /**
     * Force immediate update of component
     */
    forceUpdate(componentId) {
        if (this.components.has(componentId)) {
            this.updateComponent(componentId);
        }
    }

    /**
     * Force update all components
     */
    forceUpdateAll() {
        this.components.forEach((_, componentId) => {
            this.updateComponent(componentId);
        });
    }

    /**
     * Generate unique subscription ID
     */
    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get registry statistics
     */
    getStats() {
        const components = Array.from(this.components.entries()).map(([id, comp]) => ({
            id,
            updateCount: comp.updateCount,
            lastUpdate: comp.lastUpdate,
            subscriptions: comp.subscriptions.size
        }));

        return {
            registeredComponents: this.components.size,
            activeSubscriptions: this.subscriptions.size,
            pendingUpdates: this.pendingUpdates.size,
            updateStats: this.updateStats,
            components
        };
    }

    /**
     * Debug UI registry
     */
    debug() {
        console.group('%c🎨 UI Registry Debug', 'font-size: 14px; font-weight: bold; color: #8BC34A');
        
        const stats = this.getStats();
        console.log('Overview:', {
            components: stats.registeredComponents,
            subscriptions: stats.activeSubscriptions,
            pending: stats.pendingUpdates
        });

        console.log('\nUpdate Statistics:');
        console.table(stats.updateStats);

        console.log('\nRegistered Components:');
        console.table(stats.components);

        console.groupEnd();
    }

    /**
     * Clear all registrations
     */
    clear() {
        this.components.forEach((_, componentId) => {
            this.unregister(componentId);
        });
        
        if (this.updateFrame) {
            cancelAnimationFrame(this.updateFrame);
            this.updateFrame = null;
        }
        
        this.pendingUpdates.clear();
        this.updateStats = {
            total: 0,
            batched: 0,
            skipped: 0,
            errors: 0
        };
    }
}

// Create singleton instance
export const uiRegistry = new UIRegistry();

// Expose globally for debugging
window.uiRegistry = uiRegistry;

// Export convenience methods
export const registerUI = uiRegistry.register.bind(uiRegistry);
export const unregisterUI = uiRegistry.unregister.bind(uiRegistry);
export const forceUIUpdate = uiRegistry.forceUpdate.bind(uiRegistry);
