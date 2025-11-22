/**
 * Debounce Utility
 * 
 * PHASE 2 ITEM #2: Debounce function for performance optimization
 * Delays execution of a function until after a specified wait time has elapsed
 * since the last time it was invoked.
 * 
 * Use cases:
 * - Search input filtering (avoid filtering on every keystroke)
 * - Resize/scroll handlers
 * - API calls from user input
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @param {boolean} immediate - If true, trigger on leading edge instead of trailing
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((value) => {
 *   performSearch(value);
 * }, 300);
 * 
 * input.addEventListener('input', (e) => {
 *   debouncedSearch(e.target.value);
 * });
 */
export function debounce(func, wait, immediate = false) {
  let timeout;

  const debounced = function executedFunction(...args) {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };

  // FIX: Add cancel method for cleanup in Vue components
  debounced.cancel = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  // FIX: Add flush method to immediately execute pending call
  debounced.flush = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      func.apply(this, []);
    }
  };

  return debounced;
}

/**
 * Throttle Utility
 * 
 * Creates a throttled function that only invokes func at most once per every wait milliseconds
 * Unlike debounce, throttle guarantees execution at regular intervals
 * 
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to throttle invocations to
 * @returns {Function} Throttled function
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   handleScroll();
 * }, 200);
 * 
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle(func, wait) {
  let inThrottle;
  let lastTime;
  
  return function(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
}
