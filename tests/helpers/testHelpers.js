/**
 * Test Helpers for Component Testing
 * Provides mocks and utilities for testing Vue components
 *
 * @version 2.0.0
 */

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
    props: createSafeProps()
  };
}
