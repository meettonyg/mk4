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
export function getPluginRoot() {
    return window.guestifyData && window.guestifyData.pluginUrl ? window.guestifyData.pluginUrl : '';
}

/**
 * Generates a unique ID for components.
 * @param {string} prefix - The prefix for the ID.
 * @returns {string} A unique ID string.
 */
export function generateUniqueId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function to limit the rate at which a function gets called.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Throttles a function to ensure it's called at most once in a specified period.
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The throttle period in milliseconds.
 * @returns {Function} The throttled function.
 */
export function throttle(func, limit) {
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
