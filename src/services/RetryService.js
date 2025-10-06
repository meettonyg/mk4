/**
 * Retry Service
 * 
 * ROOT FIX: Centralized retry logic with exponential backoff
 * Replaces scattered retry implementations
 * 
 * @package GMKB
 * @version 2.0.0
 */

export class RetryService {
    /**
     * Default retry configuration
     */
    static defaultOptions = {
        maxRetries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        maxDelay: 10000,
        shouldRetry: (error) => {
            // Retry on network errors and 5xx server errors
            if (!error.response) return true; // Network error
            const status = error.response?.status || error.status;
            return status >= 500 && status < 600;
        },
        onRetry: null
    };

    /**
     * Execute operation with retry logic
     * 
     * @param {Function} operation - Async function to execute
     * @param {Object} options - Retry options
     * @returns {Promise} Result of the operation
     */
    static async withRetry(operation, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        let lastError;
        let delay = config.initialDelay;

        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
            try {
                // Execute the operation
                const result = await operation();
                
                // Success - return result
                return result;
                
            } catch (error) {
                lastError = error;
                
                // Check if we should retry
                if (attempt === config.maxRetries || !config.shouldRetry(error)) {
                    throw error;
                }
                
                // Calculate next delay with exponential backoff
                const nextDelay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
                
                // Call retry callback if provided
                if (config.onRetry) {
                    config.onRetry({
                        attempt: attempt + 1,
                        maxRetries: config.maxRetries,
                        delay,
                        error,
                        willRetry: attempt < config.maxRetries
                    });
                }
                
                // Log retry attempt
                console.log(`⚠️ Retry ${attempt + 1}/${config.maxRetries} after ${delay}ms`, {
                    error: error.message || error,
                    nextDelay
                });
                
                // Wait before retrying
                await this.delay(delay);
                
                // Update delay for next iteration
                delay = nextDelay;
            }
        }
        
        // All retries exhausted
        throw lastError;
    }

    /**
     * Create a delay promise
     * 
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Wrap fetch with retry logic
     * 
     * @param {string} url - URL to fetch
     * @param {Object} fetchOptions - Fetch options
     * @param {Object} retryOptions - Retry options
     * @returns {Promise<Response>} Fetch response
     */
    static async fetchWithRetry(url, fetchOptions = {}, retryOptions = {}) {
        return this.withRetry(
            async () => {
                const response = await fetch(url, fetchOptions);
                
                // Check if response is ok
                if (!response.ok) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.response = response;
                    error.status = response.status;
                    throw error;
                }
                
                return response;
            },
            retryOptions
        );
    }

    /**
     * Create a retryable version of a function
     * 
     * @param {Function} fn - Function to make retryable
     * @param {Object} options - Default retry options
     * @returns {Function} Retryable version of the function
     */
    static makeRetryable(fn, options = {}) {
        return async (...args) => {
            return this.withRetry(
                () => fn(...args),
                options
            );
        };
    }

    /**
     * Batch retry for multiple operations
     * 
     * @param {Array<Function>} operations - Array of async operations
     * @param {Object} options - Retry options
     * @returns {Promise<Array>} Results of all operations
     */
    static async batchWithRetry(operations, options = {}) {
        const results = await Promise.allSettled(
            operations.map(op => this.withRetry(op, options))
        );
        
        // Check for any failures
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
            console.error(`⚠️ Batch retry: ${failures.length}/${operations.length} operations failed`);
        }
        
        return results;
    }

    /**
     * Circuit breaker pattern for repeated failures
     */
    static circuitBreaker = {
        failures: new Map(),
        threshold: 5,
        timeout: 60000, // 1 minute
        
        /**
         * Check if circuit is open for a key
         */
        isOpen(key) {
            const record = this.failures.get(key);
            if (!record) return false;
            
            // Check if timeout has passed
            if (Date.now() - record.timestamp > this.timeout) {
                this.failures.delete(key);
                return false;
            }
            
            return record.count >= this.threshold;
        },
        
        /**
         * Record a failure
         */
        recordFailure(key) {
            const record = this.failures.get(key) || { count: 0, timestamp: Date.now() };
            record.count++;
            record.timestamp = Date.now();
            this.failures.set(key, record);
        },
        
        /**
         * Reset circuit for a key
         */
        reset(key) {
            this.failures.delete(key);
        }
    };

    /**
     * Execute with circuit breaker
     */
    static async withCircuitBreaker(key, operation, options = {}) {
        // Check if circuit is open
        if (this.circuitBreaker.isOpen(key)) {
            throw new Error(`Circuit breaker open for: ${key}. Too many failures.`);
        }
        
        try {
            const result = await this.withRetry(operation, options);
            // Success - reset circuit
            this.circuitBreaker.reset(key);
            return result;
        } catch (error) {
            // Record failure
            this.circuitBreaker.recordFailure(key);
            throw error;
        }
    }
}

// Export singleton instance
export const retryService = RetryService;

// Export convenience functions
export const withRetry = RetryService.withRetry.bind(RetryService);
export const fetchWithRetry = RetryService.fetchWithRetry.bind(RetryService);
export const makeRetryable = RetryService.makeRetryable.bind(RetryService);
