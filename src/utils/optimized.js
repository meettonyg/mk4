/**
 * Optimized Utility Functions
 * 
 * ROOT FIX: Performance-optimized utilities
 * Replaces lodash with lighter alternatives
 * 
 * @package GMKB
 * @version 2.0.0
 */

/**
 * Optimized debounce function
 */
export function debounce(func, wait, options = {}) {
    let timeout;
    let lastArgs;
    let lastThis;
    let result;
    let lastCallTime;
    let lastInvokeTime = 0;
    let leading = options.leading || false;
    let trailing = options.trailing !== false;
    let maxWait = options.maxWait;
    let maxing = 'maxWait' in options;

    function invokeFunc(time) {
        const args = lastArgs;
        const thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
    }

    function leadingEdge(time) {
        lastInvokeTime = time;
        timeout = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const result = wait - timeSinceLastCall;

        return maxing 
            ? Math.min(result, maxWait - timeSinceLastInvoke)
            : result;
    }

    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;

        return (lastCallTime === undefined || 
                timeSinceLastCall >= wait ||
                timeSinceLastCall < 0 || 
                (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        timeout = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
        timeout = undefined;

        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
    }

    function cancel() {
        if (timeout !== undefined) {
            clearTimeout(timeout);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timeout = undefined;
    }

    function flush() {
        return timeout === undefined ? result : trailingEdge(Date.now());
    }

    function debounced(...args) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);

        lastArgs = args;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
            if (timeout === undefined) {
                return leadingEdge(lastCallTime);
            }
            if (maxing) {
                timeout = setTimeout(timerExpired, wait);
                return invokeFunc(lastCallTime);
            }
        }
        if (timeout === undefined) {
            timeout = setTimeout(timerExpired, wait);
        }
        return result;
    }

    debounced.cancel = cancel;
    debounced.flush = flush;

    return debounced;
}

/**
 * Optimized throttle function
 */
export function throttle(func, wait, options = {}) {
    let leading = options.leading !== false;
    let trailing = options.trailing !== false;

    return debounce(func, wait, {
        leading,
        maxWait: wait,
        trailing
    });
}

/**
 * Deep clone using structured clone when available
 */
export function deepClone(obj) {
    // Use native structured clone if available (fastest)
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(obj);
        } catch (e) {
            // Fall through to alternative methods
        }
    }

    // For simple types
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // For dates
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    // For arrays
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }

    // For objects
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * Deep equal comparison
 */
export function deepEqual(a, b) {
    if (a === b) return true;

    if (a == null || b == null) return false;

    if (typeof a !== typeof b) return false;

    if (typeof a !== 'object') return a === b;

    // Arrays
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) return false;
        return a.every((item, index) => deepEqual(item, b[index]));
    }

    // Objects
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => deepEqual(a[key], b[key]));
}

/**
 * Generate unique ID with collision resistance
 */
export function generateUniqueId(prefix = 'id') {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    const counter = (generateUniqueId.counter = (generateUniqueId.counter || 0) + 1);
    return `${prefix}_${timestamp}_${randomPart}_${counter}`;
}

/**
 * Chunk array for batch processing
 */
export function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Group array by key
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = typeof key === 'function' ? key(item) : item[key];
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
    }, {});
}

/**
 * Pick properties from object
 */
export function pick(obj, keys) {
    return keys.reduce((result, key) => {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
        return result;
    }, {});
}

/**
 * Omit properties from object
 */
export function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}

/**
 * Memoize function results
 */
export function memoize(fn, resolver) {
    const cache = new Map();
    
    return function(...args) {
        const key = resolver ? resolver(...args) : JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = fn.apply(this, args);
        cache.set(key, result);
        
        // Limit cache size
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        
        return result;
    };
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Sleep/delay function
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback = window.requestIdleCallback || 
    function(callback, options) {
        const start = Date.now();
        return setTimeout(() => {
            callback({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
            });
        }, options?.timeout || 1);
    };

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback = window.cancelIdleCallback || 
    function(id) {
        clearTimeout(id);
    };
