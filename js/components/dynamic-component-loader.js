/**
 * @file dynamic-component-loader.js
 * @description Manages the dynamic fetching, caching, and rendering of component templates.
 * This file is a critical part of the component system, ensuring that components are loaded
 * efficiently and that their templates are cached to improve performance.
 *
 * Phase 2C Enhancement: Now uses shared template cache and batch preloading
 * to eliminate race conditions and improve performance.
 */

import {
    getPluginRoot
} from '../utils/helpers.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';
import {
    templateCache
} from '../utils/template-cache.js';
import {
    structuredLogger
} from '../utils/structured-logger.js';

/**
 * A class to manage the dynamic loading and rendering of components.
 * It handles fetching component templates from a REST API, caching them,
 * and rendering them with the provided properties.
 *
 * @class DynamicComponentLoader
 */
class DynamicComponentLoader {
    constructor() {
        // Remove local cache - now using shared templateCache
        this.pending = new Map(); // Keep pending map for request deduplication
        this.pluginUrl = getPluginRoot();
        this.requestStats = {
            fromCache: 0,
            fromServer: 0,
            failures: 0
        };
    }

    /**
     * Renders a component by fetching its template and injecting the props.
     * Caches templates to avoid redundant API calls.
     * @param {object} options - The options for rendering the component.
     * @param {string} options.type - The component type (e.g., 'hero', 'topics').
     * @param {string} options.id - The unique ID of the component instance.
     * @param {object} options.props - The properties to pass to the component.
     * @returns {Promise<HTMLElement|null>} A promise that resolves to the rendered HTML element.
     */
    async renderComponent({
        type,
        id,
        props
    }) {
        const perfEnd = performanceMonitor.start('render-component', {
            type,
            id
        });

        try {
            const template = await this.getTemplate(type);
            const element = this.createElementFromTemplate(template, id);

            if (element && typeof window.updateComponentProps === 'function') {
                window.updateComponentProps(element, props);
            }

            return element;
        } catch (error) {
            structuredLogger.error('LOADER', `Error rendering component ${type} (${id})`, error);
            return this.createErrorPlaceholder(type, id);
        } finally {
            perfEnd();
        }
    }

    /**
     * Gets a component template, from cache if available, otherwise from the server.
     * @param {string} type - The component type.
     * @returns {Promise<string>} A promise that resolves to the component's HTML template.
     */
    async getTemplate(type) {
        // First check shared template cache
        const cached = templateCache.get(type);
        if (cached && cached.html) {
            this.requestStats.fromCache++;
            structuredLogger.debug('LOADER', 'Template loaded from cache', {
                type,
                cacheHitRate: templateCache.getHitRate()
            });
            return cached.html;
        }

        // Check if already fetching this template
        if (this.pending.has(type)) {
            structuredLogger.debug('LOADER', 'Waiting for pending template fetch', { type });
            return this.pending.get(type);
        }

        // Need to fetch from server (fallback for templates not in batch)
        structuredLogger.info('LOADER', 'Template not in cache, fetching individually', { type });
        
        const perfEnd = performanceMonitor.start('fetch-template-individual', { type });
        const promise = this.fetchTemplate(type);
        this.pending.set(type, promise);

        try {
            const template = await promise;
            this.requestStats.fromServer++;
            
            // Store in shared cache
            templateCache.set(type, template, {
                name: type,
                category: 'dynamic',
                fetchedAt: new Date().toISOString()
            });
            
            structuredLogger.info('LOADER', 'Template fetched and cached', {
                type,
                duration: performanceMonitor.getMetric('fetch-template-individual')?.duration || 0
            });
            
            return template;
        } catch (error) {
            this.requestStats.failures++;
            throw error;
        } finally {
            this.pending.delete(type);
            perfEnd();
        }
    }

    /**
     * Fetches a component's template from the server via REST API.
     * Now with retry logic and better error handling.
     * @param {string} type - The component type.
     * @returns {Promise<string>} A promise that resolves to the template string.
     */
    async fetchTemplate(type) {
        const maxRetries = 3;
        let lastError;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                
                // Try REST API endpoint first
                const siteUrl = window.guestifyData?.siteUrl || window.location.origin;
                const restUrl = `${siteUrl}/wp-json/guestify/v1/templates/${type}`;
                let response = await fetch(restUrl, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'text/html, application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                clearTimeout(timeoutId);
                
                // If REST API fails, try direct PHP file (backward compatibility)
                if (!response.ok && response.status === 404) {
                    const directUrl = `${this.pluginUrl}components/${type}/template.php`;
                    response = await fetch(directUrl);
                }
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch template for ${type}: ${response.statusText}`);
                }
                
                // Handle JSON response from REST API
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    return data.html || data.template;
                }
                
                // Handle direct HTML response
                return await response.text();
                
            } catch (error) {
                lastError = error;
                
                if (attempt < maxRetries - 1) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    structuredLogger.warn('LOADER', `Fetch attempt ${attempt + 1} failed, retrying...`, {
                        type,
                        error: error.message,
                        delay
                    });
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        structuredLogger.error('LOADER', `Failed to fetch template after ${maxRetries} attempts`, lastError, { type });
        throw lastError;
    }

    /**
     * Creates an HTML element from a template string.
     * @param {string} template - The HTML template string.
     * @param {string} id - The unique ID to assign to the element.
     * @returns {HTMLElement|null} The created HTML element.
     */
    createElementFromTemplate(template, id) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template.trim();
        const element = tempDiv.firstElementChild;
        if (element) {
            element.id = id;
            element.dataset.componentId = id;
        }
        return element;
    }

    /**
     * Creates a placeholder element to display when a component fails to render.
     * @param {string} type - The component type.
     * @param {string} id - The unique ID of the component instance.
     * @returns {HTMLElement} The error placeholder element.
     */
    createErrorPlaceholder(type, id) {
        const errorElement = document.createElement('div');
        errorElement.id = id;
        errorElement.className = 'component-error-placeholder';
        errorElement.innerHTML = `
            <p><strong>Error!</strong></p>
            <p>Could not load the "${type}" component.</p>
        `;
        return errorElement;
    }
    
    /**
     * Get loader statistics
     * @returns {Object} Request statistics
     */
    getStats() {
        return {
            ...this.requestStats,
            cacheStats: templateCache.getStats(),
            pendingRequests: this.pending.size
        };
    }
    
    /**
     * Preload specific component types
     * @param {Array<string>} types - Component types to preload
     * @returns {Promise<void>}
     */
    async preloadTypes(types) {
        structuredLogger.info('LOADER', 'Preloading component types', { types });
        
        const promises = types.map(type => {
            // Check if already cached
            if (templateCache.has(type)) {
                return Promise.resolve();
            }
            
            // Fetch and cache
            return this.getTemplate(type).catch(error => {
                structuredLogger.error('LOADER', `Failed to preload ${type}`, error);
            });
        });
        
        await Promise.all(promises);
    }
}

// Export singleton instance
export const dynamicComponentLoader = new DynamicComponentLoader();
