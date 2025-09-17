/**
 * @file template-preloader.js
 * @description Service for preloading all component templates during initialization
 * 
 * Eliminates race conditions by loading all templates in a single batch request
 * before any components are rendered. Uses the shared template cache for
 * application-wide template access.
 * 
 * @since 2.2.0
 */

import { templateCache } from '../utils/template-cache.js';
import { structuredLogger } from '../utils/structured-logger.js';
import { performanceMonitor } from '../utils/performance-monitor.js';
import { getPluginRoot } from '../utils/helpers.js';

class TemplatePreloader {
    constructor() {
        this.initialized = false;
        this.preloadPromise = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.retryDelay = 1000; // Start with 1 second
    }
    
    /**
     * Initialize and preload all templates
     * @returns {Promise<boolean>} Success status
     */
    async init() {
        if (this.initialized) {
            structuredLogger.warn('PRELOADER', 'Already initialized');
            return true;
        }
        
        if (this.preloadPromise) {
            structuredLogger.info('PRELOADER', 'Preload already in progress, waiting...');
            return this.preloadPromise;
        }
        
        this.preloadPromise = this.preloadTemplates();
        const result = await this.preloadPromise;
        this.initialized = result;
        
        return result;
    }
    
    /**
     * Preload all templates from batch endpoint
     * @returns {Promise<boolean>} Success status
     */
    async preloadTemplates() {
        const perfEnd = performanceMonitor.start('preload-templates');
        structuredLogger.info('PRELOADER', 'Starting template preload');
        
        try {
            // Check if we have a valid cached version
            const cachedVersion = templateCache.getVersion();
            const cacheValid = cachedVersion && !templateCache.isExpired();
            
            if (cacheValid) {
                structuredLogger.info('PRELOADER', 'Using cached templates', {
                    version: cachedVersion,
                    age: templateCache.getStats().age
                });
                return true;
            }
            
            // Fetch templates from batch endpoint
            // Get the site URL from guestifyData or window location
            const siteUrl = window.guestifyData?.siteUrl || window.location.origin;
            const endpoint = `${siteUrl}/wp-json/guestify/v1/templates/batch`;
            
            // Add version parameter if we have cached data
            const url = cachedVersion 
                ? `${endpoint}?version=${encodeURIComponent(cachedVersion)}`
                : endpoint;
            
            structuredLogger.debug('PRELOADER', 'Fetching templates', { url });
            
            const response = await this.fetchWithRetry(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
            }
            
            // Check if we got a 304 Not Modified
            if (response.status === 304) {
                structuredLogger.info('PRELOADER', 'Templates not modified, cache still valid');
                return true;
            }
            
            const data = await response.json();
            
            if (!data.success || !data.templates) {
                throw new Error('Invalid response format from template endpoint');
            }
            
            // Store templates in cache
            templateCache.setBatch(data);
            
            // Log results
            const stats = {
                templatesLoaded: Object.keys(data.templates).length,
                presetsAvailable: Object.keys(data.presets || {}).length,
                errors: data.errors?.length || 0,
                loadTime: data.meta?.load_time_ms || 0,
                version: data.version
            };
            
            structuredLogger.info('PRELOADER', 'Templates preloaded successfully', stats);
            
            // Warm up cache for commonly used templates
            const commonTypes = ['hero', 'biography', 'photo-gallery'];
            await templateCache.warmUp(commonTypes);
            
            return true;
            
        } catch (error) {
            structuredLogger.error('PRELOADER', 'Failed to preload templates', error);
            
            // If we have cached templates, use them even if expired
            if (templateCache.getStats().size > 0) {
                structuredLogger.warn('PRELOADER', 'Using stale cache due to fetch failure');
                return true;
            }
            
            return false;
            
        } finally {
            perfEnd();
            this.preloadPromise = null;
        }
    }
    
    /**
     * Fetch with retry logic
     * @param {string} url - URL to fetch
     * @returns {Promise<Response>} Fetch response
     */
    async fetchWithRetry(url) {
        let lastError;
        
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                return response;
                
            } catch (error) {
                lastError = error;
                
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
                    structuredLogger.warn('PRELOADER', 'Fetch failed, retrying...', {
                        attempt: attempt + 1,
                        delay,
                        error: error.message
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Force reload all templates
     * @returns {Promise<boolean>} Success status
     */
    async forceReload() {
        structuredLogger.info('PRELOADER', 'Force reloading templates');
        
        // Clear cache first
        templateCache.clear();
        this.initialized = false;
        this.retryCount = 0;
        
        // Reload
        return this.init();
    }
    
    /**
     * Get preloader status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            initialized: this.initialized,
            loading: !!this.preloadPromise,
            cacheStats: templateCache.getStats(),
            retryCount: this.retryCount
        };
    }
}

// Export singleton instance
export const templatePreloader = new TemplatePreloader();
