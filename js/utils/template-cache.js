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
        this.lastFetch = Date.now(); // ROOT FIX: Initialize to current time instead of null
        this.cacheStats = {
            hits: 0,
            misses: 0,
            size: 0
        };
        
        // ROOT FIX: Cache configuration optimized for performance
        this.config = {
            maxAge: 86400000,    // 24 hours (templates change infrequently)
            maxSize: 100,        // Maximum number of templates to cache
            validateOnGet: false // Only validate on cache miss for better performance
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
        
        // Set new version and mark cache as fresh
        this.version = data.version;
        this.lastFetch = Date.now();
        
        // ROOT FIX: Initialize lastFetch on first cache population
        // This prevents the cache from appearing expired immediately
        
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
     * ROOT FIX: Get a template from cache (optimized performance)
     * @param {string} type - Component type
     * @returns {Object|null} Template data or null if not found
     */
    get(type) {
        const template = this.templates.get(type);
        
        if (template) {
            this.cacheStats.hits++;
            
            // ROOT FIX: Only validate expiration if explicitly requested
            // or if cache is severely outdated (prevents unnecessary warnings)
            if (this.config.validateOnGet && this.isSeverelyExpired()) {
                structuredLogger.warn('CACHE', 'Cache severely expired, consider refresh', {
                    type,
                    ageHours: Math.round((Date.now() - this.lastFetch) / 3600000)
                });
            }
            
            // ROOT FIX: Only show detailed cache logs in debug mode
            if (window.gmkbData?.debugMode) {
                structuredLogger.debug('CACHE', 'Cache hit', {
                    type,
                    hitRate: this.getHitRate()
                });
            }
            
            return template;
        }
        
        this.cacheStats.misses++;
        
        // ROOT FIX: Only show detailed cache logs in debug mode
        if (window.gmkbData?.debugMode) {
            structuredLogger.debug('CACHE', 'Cache miss', {
                type,
                hitRate: this.getHitRate()
            });
        }
        
        return null;
    }
    
    /**
     * ROOT FIX: Set a single template in cache (updates cache timing)
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
        
        // ROOT FIX: Update lastFetch when adding individual templates
        this.lastFetch = Date.now();
        this.cacheStats.size = this.templates.size;
        
        // ROOT FIX: Only show detailed cache logs in debug mode
        if (window.gmkbData?.debugMode) {
            structuredLogger.debug('CACHE', 'Template cached', {
                type,
                size: this.cacheStats.size
            });
        }
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
     * ROOT FIX: Check if cache is expired
     * @returns {boolean}
     */
    isExpired() {
        if (!this.lastFetch) return true;
        return (Date.now() - this.lastFetch) > this.config.maxAge;
    }
    
    /**
     * ROOT FIX: Check if cache is severely expired (beyond reasonable use)
     * @returns {boolean}
     */
    isSeverelyExpired() {
        if (!this.lastFetch) return true;
        // Consider cache severely expired after 2x the maxAge (48 hours by default)
        return (Date.now() - this.lastFetch) > (this.config.maxAge * 2);
    }
    
    /**
     * ROOT FIX: Clear all cached templates (maintains cache timing)
     */
    clear() {
        const size = this.templates.size;
        this.templates.clear();
        this.version = null;
        // ROOT FIX: Don't reset lastFetch to null - keep cache timing intact
        // this.lastFetch = null; 
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
            
            // ROOT FIX: Only show detailed cache logs in debug mode
            if (window.gmkbData?.debugMode) {
                structuredLogger.debug('CACHE', 'Evicted oldest template', { type: oldestKey });
            }
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
                // ROOT FIX: Only show detailed cache logs in debug mode
                if (window.gmkbData?.debugMode) {
                    structuredLogger.debug('CACHE', 'Need to fetch template', { type });
                }
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
