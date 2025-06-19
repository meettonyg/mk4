/**
 * @file state.js
 * @description A simple state management object for the Media Kit Builder.
 * This file provides a centralized object to hold the application's state,
 * including the layout and component data. It's a legacy state management
 * solution that is being phased out in favor of the EnhancedStateManager.
 *
 * This version includes a fix to properly export the 'state' object, making it
 * accessible to other modules during the transition period.
 */

// FIX: Export the 'state' constant to make it available for other modules to import.
export const state = {
    layout: [],
    components: {},

    /**
     * Initializes the state from saved data.
     * @param {object} savedState - The state object loaded from storage.
     */
    initialize(savedState) {
        if (savedState && savedState.layout && savedState.components) {
            this.layout = savedState.layout;
            this.components = savedState.components;
        }
    },

    /**
     * Gets the entire state object.
     * @returns {object} The current state.
     */
    getState() {
        return {
            layout: this.layout,
            components: this.components,
        };
    },

    /**
     * Adds a component to the state.
     * @param {object} component - The component object to add.
     */
    addComponent(component) {
        this.components[component.id] = component;
        this.layout.push(component.id);
    },

    /**
     * Removes a component from the state.
     * @param {string} componentId - The ID of the component to remove.
     */
    removeComponent(componentId) {
        delete this.components[componentId];
        this.layout = this.layout.filter(id => id !== componentId);
    },

    /**
     * Updates a component's properties.
     * @param {string} componentId - The ID of the component to update.
     * @param {object} newProps - The new properties to merge.
     */
    updateComponent(componentId, newProps) {
        if (this.components[componentId]) {
            this.components[componentId].props = { ...this.components[componentId].props,
                ...newProps
            };
        }
    },

    /**
     * Gets a single component's data from the state.
     * @param {string} componentId - The ID of the component to get.
     * @returns {object|null} The component data or null if not found.
     */
    getComponent(componentId) {
        return this.components[componentId] || null;
    },

    /**
     * Moves a component in the layout array.
     * @param {string} componentId - The ID of the component to move.
     * @param {string} direction - The direction to move ('up' or 'down').
     */
    moveComponent(componentId, direction) {
        const index = this.layout.indexOf(componentId);
        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            [this.layout[index], this.layout[index - 1]] = [this.layout[index - 1], this.layout[index]];
        } else if (direction === 'down' && index < this.layout.length - 1) {
            [this.layout[index], this.layout[index + 1]] = [this.layout[index + 1], this.layout[index]];
        }
    }
};
