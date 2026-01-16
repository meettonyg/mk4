/**
 * Safe Props Composable
 * Provides null-safe access to component props
 * 
 * P1 FIX: Prevents "Cannot read properties of null" errors in tests
 * @version 1.0.0
 */

import { computed } from 'vue';

/**
 * Create null-safe computed properties for component data
 * @param {Object} props - Component props
 * @returns {Object} Safe data object
 */
export function useSafeProps(props) {
  // Create a computed that always returns a valid object
  const safeData = computed(() => {
    return props?.data || {};
  });

  // Create a computed that checks if data exists
  const hasData = computed(() => {
    return props?.data != null && typeof props.data === 'object';
  });

  return {
    safeData,
    hasData
  };
}

/**
 * Safe property accessor with fallback
 * @param {Object} props - Component props
 * @param {string} key - Property key to access
 * @param {*} fallback - Fallback value if property doesn't exist
 * @returns {*} Property value or fallback
 */
export function useSafeProp(props, key, fallback = '') {
  return computed(() => {
    if (!props?.data) return fallback;
    return props.data[key] ?? fallback;
  });
}

/**
 * Safe array accessor with fallback
 * @param {Object} props - Component props
 * @param {string} key - Array key to access
 * @param {Array} fallback - Fallback array if property doesn't exist
 * @returns {Array} Array value or fallback
 */
export function useSafeArray(props, key, fallback = []) {
  return computed(() => {
    if (!props?.data) return fallback;
    const value = props.data[key];
    return Array.isArray(value) ? value : fallback;
  });
}

/**
 * Create null-safe Profile data ref
 * For use in tests where Pods composables may not be available
 * @param {Object} profileData - Profile data object
 * @returns {Object} Safe Pods ref
 */
export function useSafePodsData(profileData) {
  return computed(() => {
    return profileData?.value || {};
  });
}
