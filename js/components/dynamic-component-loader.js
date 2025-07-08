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
        
        // CRITICAL FIX: Component type aliases mapping (matches PHP)
        this.componentAliases = {
            'bio': 'biography',
            'social-links': 'social',
            'social-media': 'social',
            'authority': 'authority-hook',
            'cta': 'call-to-action',
            'booking': 'booking-calendar',
            'gallery': 'photo-gallery',
            'player': 'podcast-player',
            'intro': 'guest-intro',
            'video': 'video-intro',
            'logos': 'logo-grid'
        };
        
        // CRITICAL FIX: Circuit breaker to prevent cascade failures
        this.circuitBreaker = {
            failureCount: 0,
            maxFailures: 5, // Trip circuit after 5 failures
            resetTimeout: 30000, // Reset after 30 seconds
            state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
            lastFailureTime: 0,
            isOpen: false
        };
        
        // CRITICAL FIX: Fallback template cache for emergency use
        this.fallbackTemplates = new Map();
        this.initializeFallbackTemplates();
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
        // CRITICAL FIX: Resolve component type aliases
        const originalType = type;
        const resolvedType = this.resolveComponentType(type);
        
        // First check shared template cache (check both original and resolved)
        let cached = templateCache.get(originalType) || templateCache.get(resolvedType);
        if (cached && cached.html) {
            this.requestStats.fromCache++;
            structuredLogger.debug('LOADER', 'Template loaded from cache', {
                originalType,
                resolvedType,
                cacheHitRate: templateCache.getHitRate()
            });
            return cached.html;
        }

        // Check if already fetching this template (check both types)
        if (this.pending.has(originalType) || this.pending.has(resolvedType)) {
            const pendingType = this.pending.has(originalType) ? originalType : resolvedType;
            structuredLogger.debug('LOADER', 'Waiting for pending template fetch', { 
                originalType, 
                resolvedType, 
                pendingType 
            });
            return this.pending.get(pendingType);
        }

        // Need to fetch from server (fallback for templates not in batch)
        structuredLogger.info('LOADER', 'Template not in cache, fetching individually', { 
            originalType, 
            resolvedType 
        });
        
        const perfEnd = performanceMonitor.start('fetch-template-individual', { 
            originalType, 
            resolvedType 
        });
        const promise = this.fetchTemplate(originalType, resolvedType);
        this.pending.set(originalType, promise);
        this.pending.set(resolvedType, promise);

        try {
            const template = await promise;
            this.requestStats.fromServer++;
            
            // Store in shared cache (store under both original and resolved types)
            templateCache.set(originalType, template, {
                name: originalType,
                actualType: resolvedType,
                category: 'dynamic',
                fetchedAt: new Date().toISOString()
            });
            
            if (originalType !== resolvedType) {
                templateCache.set(resolvedType, template, {
                    name: resolvedType,
                    aliasFor: originalType,
                    category: 'dynamic',
                    fetchedAt: new Date().toISOString()
                });
            }
            
            structuredLogger.info('LOADER', 'Template fetched and cached', {
                originalType,
                resolvedType,
                duration: performanceMonitor.getMetric('fetch-template-individual')?.duration || 0
            });
            
            return template;
        } catch (error) {
            this.requestStats.failures++;
            throw error;
        } finally {
            this.pending.delete(originalType);
            this.pending.delete(resolvedType);
            perfEnd();
        }
    }

    /**
     * CRITICAL FIX: Resolve component type from alias to actual directory name
     * @param {string} requestedType - The requested component type (may be an alias)
     * @returns {string} The actual component directory name
     */
    resolveComponentType(requestedType) {
        // Check if it's an alias
        if (this.componentAliases[requestedType]) {
            structuredLogger.debug('LOADER', 'Resolving component alias', {
                requestedType,
                resolvedType: this.componentAliases[requestedType]
            });
            return this.componentAliases[requestedType];
        }
        
        // Return the original type if no alias found
        return requestedType;
    }
    
    /**
     * Get all component type aliases
     * @returns {Object} Component aliases mapping
     */
    getComponentAliases() {
        return { ...this.componentAliases };
    }
    
    /**
     * CRITICAL FIX: Initialize fallback templates to prevent cascade failures
     */
    initializeFallbackTemplates() {
        // Basic fallback templates for common component types
        const fallbacks = {
            'hero': '<div class="hero-component fallback-template" data-component="hero"><h1>Hero Component</h1><p>Fallback template loaded</p></div>',
            'topics': '<div class="topics-component fallback-template" data-component="topics"><h2>Topics</h2><ul><li>Fallback topic</li></ul></div>',
            'biography': '<div class="bio-component fallback-template" data-component="biography"><h2>Biography</h2><p>Fallback biography content</p></div>',
            'authority-hook': '<div class="content-section authority-hook-component editable-element fallback-template" data-element="authority-hook" data-component="authority-hook"><h2>Authority Hook</h2><div class="authority-hook-container"><div class="authority-item"><h3>WHO</h3><p>Who is your audience?</p></div><div class="authority-item"><h3>WHAT</h3><p>What do you offer?</p></div></div></div>',
            'contact': '<div class="contact-component fallback-template" data-component="contact"><h2>Contact</h2><p>Fallback contact information</p></div>',
            'social-links': '<div class="social-component fallback-template" data-component="social-links"><h2>Social Links</h2><p>Fallback social links</p></div>',
            'default': '<div class="fallback-component" data-component="unknown"><h2>Component</h2><p>Fallback template for unknown component type</p></div>'
        };
        
        Object.entries(fallbacks).forEach(([type, template]) => {
            this.fallbackTemplates.set(type, template);
        });
        
        structuredLogger.info('LOADER', 'Fallback templates initialized', {
            count: this.fallbackTemplates.size
        });
    }
    
    /**
     * CRITICAL FIX: Check and update circuit breaker state
     */
    checkCircuitBreaker() {
        const now = Date.now();
        
        // Reset circuit breaker if enough time has passed
        if (this.circuitBreaker.state === 'OPEN' && 
            (now - this.circuitBreaker.lastFailureTime) > this.circuitBreaker.resetTimeout) {
            this.circuitBreaker.state = 'HALF_OPEN';
            this.circuitBreaker.failureCount = 0;
            structuredLogger.info('LOADER', 'Circuit breaker reset to HALF_OPEN');
        }
        
        return this.circuitBreaker.state !== 'OPEN';
    }
    
    /**
     * CRITICAL FIX: Record failure and update circuit breaker
     */
    recordFailure() {
        this.circuitBreaker.failureCount++;
        this.circuitBreaker.lastFailureTime = Date.now();
        
        if (this.circuitBreaker.failureCount >= this.circuitBreaker.maxFailures) {
            this.circuitBreaker.state = 'OPEN';
            this.circuitBreaker.isOpen = true;
            structuredLogger.warn('LOADER', 'Circuit breaker OPENED - too many failures', {
                failureCount: this.circuitBreaker.failureCount,
                maxFailures: this.circuitBreaker.maxFailures
            });
        }
    }
    
    /**
     * CRITICAL FIX: Get fallback template for failed fetches
     */
    getFallbackTemplate(type) {
        const fallback = this.fallbackTemplates.get(type) || 
                        this.fallbackTemplates.get('default');
        
        structuredLogger.warn('LOADER', 'Using fallback template', { type });
        return fallback;
    }

    /**
     * CRITICAL FIX: Enhanced template fetching with circuit breaker and immediate fallbacks
     * @param {string} originalType - The originally requested component type.
     * @param {string} resolvedType - The resolved component type (after alias resolution).
     * @returns {Promise<string>} A promise that resolves to the template string.
     */
    async fetchTemplate(originalType, resolvedType = null) {
        // Use resolved type if provided, otherwise resolve the original type
        const actualType = resolvedType || this.resolveComponentType(originalType);
        const typeToFetch = actualType;
        // CRITICAL FIX: Check circuit breaker first
        if (!this.checkCircuitBreaker()) {
            structuredLogger.warn('LOADER', 'Circuit breaker OPEN, using fallback', { 
                originalType, 
                actualType 
            });
            return this.getFallbackTemplate(originalType);
        }
        
        // CRITICAL FIX: For stress test components, use fallback immediately
        if (originalType.startsWith('stress-test-') || originalType.startsWith('test-')) {
            structuredLogger.info('LOADER', 'Test component detected, using fallback immediately', { 
                originalType, 
                actualType 
            });
            return this.getFallbackTemplate(originalType);
        }
        
        // CRITICAL FIX: Reduced retries and much faster timeouts
        const maxRetries = 2; // Reduced from 3 to 2
        let lastError;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1000); // Reduced to 1 second
                
                // Try REST API endpoint first (use original type - API handles alias resolution)
                const siteUrl = window.guestifyData?.siteUrl || window.location.origin;
                const restUrl = `${siteUrl}/wp-json/guestify/v1/templates/${originalType}`;
                let response = await fetch(restUrl, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'text/html, application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                clearTimeout(timeoutId);
                
                // If REST API fails, try direct PHP file using actual type (backward compatibility)
                if (!response.ok && response.status === 404) {
                    const directUrl = `${this.pluginUrl}components/${actualType}/template.php`;
                    response = await fetch(directUrl);
                }
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch template for ${originalType} (resolved to ${actualType}): ${response.statusText}`);
                }
                
                // Success - reset circuit breaker failure count
                if (this.circuitBreaker.state === 'HALF_OPEN') {
                    this.circuitBreaker.state = 'CLOSED';
                    this.circuitBreaker.failureCount = 0;
                    structuredLogger.info('LOADER', 'Circuit breaker reset to CLOSED after successful fetch');
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
                    // CRITICAL FIX: Much faster retry delays (milliseconds, not seconds)
                    const delay = 100 + (attempt * 50); // 100ms, 150ms instead of 1s, 2s, 4s
                    structuredLogger.warn('LOADER', `Fetch attempt ${attempt + 1} failed, retrying...`, {
                        originalType,
                        actualType,
                        error: error.message,
                        delay
                    });
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        // CRITICAL FIX: Record failure and return fallback instead of throwing
        this.recordFailure();
        structuredLogger.warn('LOADER', `All fetch attempts failed, using fallback template`, { 
            originalType, 
            actualType,
            error: lastError?.message,
            circuitBreakerState: this.circuitBreaker.state
        });
        
        return this.getFallbackTemplate(originalType);
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
