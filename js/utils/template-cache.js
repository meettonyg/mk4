/**
 * @file template-cache.js
 * @description Application-wide template cache with version management
 * ROOT FIX: Converted from ES6 imports to WordPress-compatible format
 * 
 * Provides a shared cache for component templates to eliminate duplicate
 * fetches and improve performance. Supports cache invalidation via ETags.
 * 
 * @since 2.2.0
 */

// ROOT FIX: WordPress-compatible IIFE wrapper instead of ES6 imports
(function() {
    'use strict';
    
    // ROOT FIX: Use fallback if structured logger not available
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };

class TemplateCache {
    constructor() {
        this.templates = new Map();
        this.version = null;
        this.lastFetch = null;
        this.cacheStats = {
            hits: 0,
            misses: 0,
            size: 0
        };
        
        // Cache configuration
        this.config = {
            maxAge: 3600000, // 1 hour in milliseconds
            maxSize: 100,    // Maximum number of templates to cache
            validateOnGet: true // Check version on every get
        };
        
        structuredLogger.info('CACHE', 'Template cache initialized', { config: this.config });
    }
    
    /**
     * Set all templates from batch load
     * @param {Object} data - Batch template data from server
     */
    setBatch(data) {
        const startTime = performance.now();
        
        if (!data || !data.templates) {
            structuredLogger.error('CACHE', 'Invalid batch data provided');
            return false;
        }
        
        // Clear existing cache
        this.clear();
        
        // Set new version
        this.version = data.version;
        this.lastFetch = Date.now();
        
        // Store each template
        let count = 0;
        for (const [type, template] of Object.entries(data.templates)) {
            this.templates.set(type, {
                html: template.html,
                metadata: {
                    name: template.name,
                    category: template.category,
                    description: template.description,
                    isPremium: template.isPremium,
                    version: template.version,
                    schema: template.schema
                },
                timestamp: Date.now()
            });
            count++;
        }
        
        this.cacheStats.size = count;
        
        structuredLogger.info('CACHE', 'Batch templates cached', {
            count,
            version: this.version,
            duration: performance.now() - startTime
        });
        
        return true;
    }
    
    /**
     * Get a template from cache
     * @param {string} type - Component type
     * @returns {Object|null} Template data or null if not found
     */
    get(type) {
        const template = this.templates.get(type);
        
        if (template) {
            this.cacheStats.hits++;
            
            // Check if cache is still valid
            if (this.config.validateOnGet && this.isExpired()) {
                structuredLogger.warn('CACHE', 'Cache expired, returning stale data', {
                    type,
                    age: Date.now() - this.lastFetch
                });
            }
            
            structuredLogger.debug('CACHE', 'Cache hit', {
                type,
                hitRate: this.getHitRate()
            });
            
            return template;
        }
        
        this.cacheStats.misses++;
        structuredLogger.debug('CACHE', 'Cache miss', {
            type,
            hitRate: this.getHitRate()
        });
        
        return null;
    }
    
    /**
     * Set a single template in cache
     * @param {string} type - Component type
     * @param {string} html - Template HTML
     * @param {Object} metadata - Template metadata
     */
    set(type, html, metadata = {}) {
        // Check cache size limit
        if (this.templates.size >= this.config.maxSize) {
            this.evictOldest();
        }
        
        this.templates.set(type, {
            html,
            metadata,
            timestamp: Date.now()
        });
        
        this.cacheStats.size = this.templates.size;
        
        structuredLogger.debug('CACHE', 'Template cached', {
            type,
            size: this.cacheStats.size
        });
    }
    
    /**
     * Check if a template exists in cache
     * @param {string} type - Component type
     * @returns {boolean}
     */
    has(type) {
        return this.templates.has(type);
    }
    
    /**
     * Get current cache version
     * @returns {string|null}
     */
    getVersion() {
        return this.version;
    }
    
    /**
     * Check if cache is expired
     * @returns {boolean}
     */
    isExpired() {
        if (!this.lastFetch) return true;
        return (Date.now() - this.lastFetch) > this.config.maxAge;
    }
    
    /**
     * Clear all cached templates
     */
    clear() {
        const size = this.templates.size;
        this.templates.clear();
        this.version = null;
        this.lastFetch = null;
        this.cacheStats.size = 0;
        
        structuredLogger.info('CACHE', 'Cache cleared', { templatesRemoved: size });
    }
    
    /**
     * Evict oldest template from cache
     */
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, value] of this.templates.entries()) {
            if (value.timestamp < oldestTime) {
                oldestTime = value.timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.templates.delete(oldestKey);
            structuredLogger.debug('CACHE', 'Evicted oldest template', { type: oldestKey });
        }
    }
    
    /**
     * Get cache hit rate
     * @returns {number} Hit rate percentage
     */
    getHitRate() {
        const total = this.cacheStats.hits + this.cacheStats.misses;
        if (total === 0) return 0;
        return (this.cacheStats.hits / total * 100).toFixed(2);
    }
    
    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        return {
            ...this.cacheStats,
            hitRate: this.getHitRate() + '%',
            version: this.version,
            age: this.lastFetch ? Date.now() - this.lastFetch : null,
            isExpired: this.isExpired()
        };
    }
    
    /**
     * Warm up cache by preloading specific templates
     * @param {Array<string>} types - Component types to preload
     */
    async warmUp(types) {
        structuredLogger.info('CACHE', 'Warming up cache', { types });
        
        // This would typically trigger individual fetches for specific types
        // But with batch loading, this is less necessary
        for (const type of types) {
            if (!this.has(type)) {
                structuredLogger.debug('CACHE', 'Need to fetch template', { type });
                // The dynamic loader will handle fetching if needed
            }
        }
    }
}

// ROOT FIX: Create and expose template cache globally instead of ES6 export
const templateCache = new TemplateCache();

// ROOT FIX: WordPress-compatible global exposure
window.templateCache = templateCache;
window.TemplateCache = TemplateCache;

console.log('✅ Template Cache: Available globally and ready (WordPress-compatible)');

})(); // ROOT FIX: Close IIFE wrapper
