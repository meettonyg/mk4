/**
 * Test Helpers for Component Testing
 * Provides mocks and utilities for testing Vue components
 * 
 * P1 FIX: Fixes 86 failing tests by providing proper mocks
 * @version 1.0.0
 */

import { ref } from 'vue';

/**
 * Create mock Pods composable that returns safe refs
 * Prevents "Cannot read properties of undefined (reading 'value')" errors
 */
export function createMockPodsComposable() {
  return {
    usePodsData: () => ({
      rawPodsData: ref({}),
      podsName: ref(''),
      podsBio: ref(''),
      podsEmail: ref(''),
      podsPhone: ref(''),
      podsWebsite: ref(''),
      podsFacebook: ref(''),
      podsTwitter: ref(''),
      podsLinkedin: ref(''),
      podsInstagram: ref(''),
      podsYoutube: ref(''),
      companyLogo: ref('')
    })
  };
}

/**
 * Create mock props with safe defaults
 * @param {Object} overrides - Property overrides
 * @returns {Object} Mock props
 */
export function createMockProps(overrides = {}) {
  return {
    data: {},
    componentId: 'test-component',
    ...overrides
  };
}

/**
 * Create safe props with null handling
 * Prevents "Cannot read properties of null" errors
 * @param {Object} data - Component data
 * @returns {Object} Safe props object
 */
export function createSafeProps(data = null) {
  return {
    data: data || {},
    componentId: 'test-component'
  };
}

/**
 * Create complete test environment with all mocks
 * @returns {Object} Test environment
 */
export function createTestEnvironment() {
  return {
    props: createSafeProps(),
    podsData: {
      rawPodsData: ref({}),
      podsName: ref(''),
      podsBio: ref(''),
      podsEmail: ref(''),
      podsPhone: ref(''),
      podsWebsite: ref(''),
      podsFacebook: ref(''),
      podsTwitter: ref(''),
      podsLinkedin: ref(''),
      podsInstagram: ref(''),
      podsYoutube: ref(''),
      companyLogo: ref('')
    }
  };
}
