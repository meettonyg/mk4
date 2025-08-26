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
 * @param {string|HTMLElement} elementOrId - The component element or component ID
 * @param {Object} props - The properties to apply
 */
window.updateComponentProps = function(elementOrId, props) {
    if (!elementOrId || !props || typeof props !== 'object') {
        console.warn('updateComponentProps: Invalid parameters', { elementOrId, props });
        return;
    }
    
    try {
        // ROOT FIX: Handle both element and ID inputs
        let element;
        
        if (typeof elementOrId === 'string') {
            // Find element by ID
            element = document.getElementById(elementOrId);
            if (!element) {
                // Try finding by data-component-id
                element = document.querySelector(`[data-component-id="${elementOrId}"]`);
            }
            if (!element) {
                console.warn(`updateComponentProps: Element not found for ID: ${elementOrId}`);
                return;
            }
        } else if (elementOrId.nodeType === Node.ELEMENT_NODE) {
            // Direct element passed
            element = elementOrId;
        } else {
            console.warn('updateComponentProps: Invalid element or ID type', elementOrId);
            return;
        }
        
        console.log(`🔄 ROOT FIX: Updating component props for element:`, element.id || element.className);
        
        // Update data attributes for component properties
        Object.keys(props).forEach(key => {
            if (key && props[key] !== undefined && props[key] !== null) {
                // ROOT FIX: Trim whitespace from values to prevent display issues
                const rawValue = String(props[key]);
                const value = rawValue.trim();
                element.setAttribute(`data-${key}`, value);
                console.log(`📝 ROOT FIX: Set data-${key} = "${value}"`);
            }
        });
        
        // Update component ID if provided
        if (props.id && props.id !== element.id) {
            element.id = props.id;
            element.setAttribute('data-component-id', props.id);
        }
        
        // Update component type if provided
        if (props.type) {
            element.setAttribute('data-component-type', props.type);
            element.setAttribute('data-component', props.type);
        }
        
        // Store props on element for later reference
        element._componentProps = { ...element._componentProps, ...props };
        
        // ROOT FIX: Trigger component update event for state managers
        const updateEvent = new CustomEvent('componentPropsUpdated', {
            detail: {
                componentId: element.id,
                props: props,
                element: element
            },
            bubbles: true
        });
        
        element.dispatchEvent(updateEvent);
        
        console.log(`✅ ROOT FIX: Component props updated successfully for ${element.id}`);
        
    } catch (error) {
        console.error('Failed to update component props:', error);
        console.log('Debug info:', {
            elementOrId: elementOrId,
            props: props,
            elementType: typeof elementOrId,
            isElement: elementOrId && elementOrId.nodeType === Node.ELEMENT_NODE
        });
    }
};

console.log('✅ updateComponentProps: Available globally and ready');
