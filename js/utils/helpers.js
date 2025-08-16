/**
 * @file helpers.js
 * @description Provides utility and helper functions for the Media Kit Builder.
 * This file contains common functions that are used across different modules of the application,
 * such as getting the plugin root URL, generating unique IDs, and debouncing functions.
 *
 * This version includes a fix to correctly export the `getPluginRoot` and other utility functions
 * so they can be imported by other ES modules.
 */

/**
 * Gets the root URL of the plugin.
 * It uses the `guestifyData` object, which is localized in WordPress.
 * @returns {string} The root URL of the plugin.
 */
// ROOT FIX: Convert to global object instead of ES6 exports
window.GMKBHelpers = {
    /**
     * Gets the root URL of the plugin.
     * It uses the `guestifyData` object, which is localized in WordPress.
     * @returns {string} The root URL of the plugin.
     */
    getPluginRoot() {
        return window.guestifyData && window.guestifyData.pluginUrl ? window.guestifyData.pluginUrl : '';
    },

    /**
     * Generates a unique ID for components.
     * @param {string} prefix - The prefix for the ID.
     * @returns {string} A unique ID string.
     */
    generateUniqueId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Debounce function to limit the rate at which a function gets called.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The debounce delay in milliseconds.
     * @returns {Function} The debounced function.
     */
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    },

    /**
     * Throttles a function to ensure it's called at most once in a specified period.
     * @param {Function} func - The function to throttle.
     * @param {number} limit - The throttle period in milliseconds.
     * @returns {Function} The throttled function.
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

console.log('✅ GMKBHelpers: Available globally and ready');

/**
 * ROOT FIX: Global component property update function
 * Used by dynamic component loader to update component properties
 * @param {HTMLElement} element - The component element
 * @param {Object} props - The properties to apply
 */
window.updateComponentProps = function(element, props) {
    if (!element || !props || typeof props !== 'object') {
        return;
    }
    
    try {
        // Update data attributes for component properties
        Object.keys(props).forEach(key => {
            if (key && props[key] !== undefined) {
                element.setAttribute(`data-${key}`, String(props[key]));
            }
        });
        
        // Update component ID if provided
        if (props.id) {
            element.id = props.id;
            element.setAttribute('data-component-id', props.id);
        }
        
        // Update component type if provided
        if (props.type) {
            element.setAttribute('data-component-type', props.type);
        }
        
        // Store props on element for later reference
        element._componentProps = props;
        
    } catch (error) {
        console.warn('Failed to update component props:', error);
    }
};

console.log('✅ updateComponentProps: Available globally and ready');
