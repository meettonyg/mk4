/**
 * Retry utility for failed operations
 * Phase 6: Race Conditions & Optimization
 * 
 * @package GMKB
 * @version 2.0.0
 */

/**
 * Retry an operation with exponential backoff
 * 
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.delay - Initial delay in ms (default: 1000)
 * @param {number} options.backoff - Backoff multiplier (default: 2)
 * @param {Function} options.onRetry - Callback on each retry attempt
 * @returns {Promise} Result of the operation
 */
export async function retryOperation(operation, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry = null
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoff, attempt);

        if (onRetry) {
          onRetry(attempt + 1, maxRetries, waitTime, error);
        }

        console.log(
          `⚠️ Attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`,
          error.message
        );

        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  throw new Error(
    `Operation failed after ${maxRetries} attempts: ${lastError.message}`
  );
}

/**
 * Retry with custom predicate to determine if should retry
 * 
 * @param {Function} operation - Async function to retry
 * @param {Function} shouldRetry - Predicate function(error) => boolean
 * @param {Object} options - Retry options
 * @returns {Promise} Result of the operation
 */
export async function retryWithPredicate(operation, shouldRetry, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry = null
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoff, attempt);

        if (onRetry) {
          onRetry(attempt + 1, maxRetries, waitTime, error);
        }

        console.log(
          `⚠️ Retriable error, attempt ${attempt + 1}/${maxRetries} in ${waitTime}ms...`,
          error.message
        );

        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw new Error(
    `Operation failed after ${maxRetries} attempts: ${lastError.message}`
  );
}

/**
 * Retry only on network errors
 * 
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of the operation
 */
export async function retryOnNetworkError(operation, options = {}) {
  return retryWithPredicate(
    operation,
    (error) => {
      // Retry on network-related errors
      return (
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('timeout') ||
        error.name === 'NetworkError' ||
        error.name === 'TypeError'
      );
    },
    options
  );
}
