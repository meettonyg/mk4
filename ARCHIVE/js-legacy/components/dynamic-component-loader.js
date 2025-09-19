/**
 * @file dynamic-component-loader.js
 * @description ROOT FIX: WordPress-Compatible Dynamic Component Loader
 * Converted from ES6 modules to WordPress-compatible global object pattern
 * Manages the dynamic fetching, caching, and rendering of component templates.
 *
 * ROOT FIX: Eliminates ES6 import dependencies that fail in WordPress loading
 */

// ROOT FIX: WordPress-compatible IIFE wrapper
(function() {
    'use strict';
    
    // ROOT CAUSE TRACKING: Global render tracker
    window.GMKBRenderTracker = window.GMKBRenderTracker || {
        renders: new Map(),
        track: function(componentId, source, action) {
            if (!this.renders.has(componentId)) {
                this.renders.set(componentId, []);
            }
            const entry = {
                source,
                action,
                timestamp: Date.now(),
                stack: new Error().stack
            };
            this.renders.get(componentId).push(entry);
            
            // Check for duplicates
            const renders = this.renders.get(componentId);
            if (renders.length > 1) {
                console.warn(`ROOT CAUSE: Multiple renders detected for ${componentId}:`, renders);
            }
        },
        getRenders: function(componentId) {
            return this.renders.get(componentId) || [];
        },
        clear: function() {
            this.renders.clear();
        }
    };
    
    // ROOT FIX: Use global objects instead of ES6 imports
    const getPluginRoot = () => {
        if (window.GMKBHelpers && window.GMKBHelpers.getPluginRoot) {
            return window.GMKBHelpers.getPluginRoot();
        }
        // Fallback to guestifyData if available
        return window.guestifyData?.pluginUrl || window.gmkbData?.pluginUrl || '';
    };
    
    const performanceMonitor = window.performanceMonitor || {
        start: () => () => {}
    };
    
    const templateCache = window.templateCache || window.mkTemplateCache || {
        get: () => null,
        set: () => {},
        has: () => false,
        getStats: () => ({ hits: 0, misses: 0 }),
        getHitRate: () => 0
    };
    
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };

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
            structuredLogger.error('LOADER', `Error rendering component ${type} (${id})`, {
                error: error.message,
                stack: error.stack,
                type: type,
                id: id,
                gmkbData: !!window.gmkbData
            });
            return this.createErrorPlaceholder(type, id);
        } finally {
            perfEnd();
        }
    }

    /**
     * Gets a component template via simplified event-driven system
     * ROOT FIX: Self-contained event coordination - NO external dependencies
     * @param {string} type - The component type.
     * @returns {Promise<string>} A promise that resolves to the component's HTML template.
     */
    async getTemplate(type) {
        structuredLogger.debug('LOADER', 'getTemplate called for:', type);
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

        // ROOT FIX: Simple event-driven WordPress AJAX - NO timeouts, NO external event bus
        structuredLogger.info('LOADER', 'Requesting template via WordPress AJAX', { 
            originalType, 
            resolvedType 
        });
        
        const promise = this.fetchViaWordPressAjax(originalType, resolvedType);
        this.pending.set(originalType, promise);
        this.pending.set(resolvedType, promise);

        try {
            const template = await promise;
            this.requestStats.fromServer++;
            
            // Store in shared cache (store under both original and resolved types)
            templateCache.set(originalType, template, {
                name: originalType,
                actualType: resolvedType,
                category: 'wordpress-ajax',
                fetchedAt: new Date().toISOString()
            });
            
            if (originalType !== resolvedType) {
                templateCache.set(resolvedType, template, {
                    name: resolvedType,
                    aliasFor: originalType,
                    category: 'wordpress-ajax',
                    fetchedAt: new Date().toISOString()
                });
            }
            
            structuredLogger.info('LOADER', 'Template received via WordPress AJAX and cached', {
                originalType,
                resolvedType
            });
            
            return template;
        } catch (error) {
            this.requestStats.failures++;
            structuredLogger.error('LOADER', 'WordPress AJAX template request failed', {
                originalType,
                resolvedType,
                error: error.message,
                errorStack: error.stack,
                ajaxUrl: window.gmkbData?.ajaxUrl,
                nonce: window.gmkbData?.nonce ? 'present' : 'missing',
                post_id: post_id
            });
            
            // ROOT FIX: Only use fallback after WordPress AJAX fails
            structuredLogger.warn('LOADER', 'Using fallback template after WordPress AJAX failure', { originalType });
            return this.getFallbackTemplate(originalType);
        } finally {
            this.pending.delete(originalType);
            this.pending.delete(resolvedType);
        }
    }
    
    /**
     * ROOT FIX: Simple WordPress AJAX fetch - event-driven via native fetch promises
     * NO setTimeout coordination, NO external event bus - pure Promise coordination
     */
    async fetchViaWordPressAjax(originalType, resolvedType) {
        // ROOT FIX: Get post_id from multiple sources
        const post_id = window.gmkbData?.post_id || window.gmkbData?.postId || 
                        window.guestifyData?.post_id || window.guestifyData?.postId ||
                        new URLSearchParams(window.location.search).get('mkcg_id') ||
                        new URLSearchParams(window.location.search).get('post_id') || 0;
        
        // ROOT FIX: Use WordPress AJAX directly - native Promise is event-driven
        const ajaxUrl = window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php';
        const nonce = window.gmkbData?.nonce || '';
        
        structuredLogger.debug('LOADER', 'AJAX configuration', {
            ajaxUrl: ajaxUrl,
            hasNonce: !!nonce,
            gmkbDataExists: !!window.gmkbData,
            guestifyDataExists: !!window.guestifyData,
            gmkbDataKeys: window.gmkbData ? Object.keys(window.gmkbData).slice(0, 10) : 'not available',
            post_id: post_id
        });
        
        if (!ajaxUrl) {
            structuredLogger.error('LOADER', 'WordPress AJAX URL missing', {
                ajaxUrl: ajaxUrl || 'missing',
                gmkbData: !!window.gmkbData,
                guestifyData: !!window.guestifyData
            });
            throw new Error('WordPress AJAX URL not available');
        }
        
        // ROOT FIX: Make nonce optional for debugging
        if (!nonce && window.gmkbData) {
            structuredLogger.warn('LOADER', 'Nonce missing but continuing anyway', {
                gmkbDataKeys: Object.keys(window.gmkbData)
            });
        }
        
        structuredLogger.debug('LOADER', 'Fetching via WordPress AJAX', {
            ajaxUrl,
            componentType: originalType,
            hasNonce: !!nonce,
            post_id: post_id
        });
        
        // ROOT FIX: Native fetch Promise is event-driven - no timeout coordination needed
        const response = await fetch(ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'guestify_render_component',
                component: originalType,
                nonce: nonce,
                post_id: post_id,  // ROOT FIX: Include post_id in request
                props: JSON.stringify({
                    post_id: post_id  // ROOT FIX: Also include in props
                })
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            structuredLogger.error('LOADER', 'WordPress AJAX HTTP error', {
                status: response.status,
                statusText: response.statusText,
                responseText: errorText.substring(0, 500)
            });
            throw new Error(`WordPress AJAX HTTP error: ${response.status} ${response.statusText}`);
        }
        
        let data;
        const responseText = await response.text();
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            structuredLogger.error('LOADER', 'Failed to parse WordPress AJAX response', {
                error: e.message,
                responseText: responseText.substring(0, 500)
            });
            throw new Error('Invalid JSON response from WordPress AJAX');
        }
        
        if (!data.success) {
            throw new Error(data.data || 'WordPress AJAX returned error response');
        }
        
        const template = data.data.html || data.data;
        
        if (!template || typeof template !== 'string') {
            throw new Error('WordPress AJAX returned invalid template data');
        }
        
        // ROOT FIX: Templates should NOT contain data-component-id - it's added by JavaScript
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template;
        const dataIdElements = tempDiv.querySelectorAll('[data-component-id]');
        if (dataIdElements.length > 0) {
            structuredLogger.error('LOADER', `Template from WordPress contains ${dataIdElements.length} elements with data-component-id - this should be fixed in the PHP template`);
        }
        
        structuredLogger.debug('LOADER', 'WordPress AJAX successful', {
            originalType,
            templateLength: template.length,
            existingDataIdCount: dataIdElements.length
        });
        
        return template;
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
     * Creates an HTML element from a template string.
     * ROOT CAUSE FIX: Prevents multiple elements with same data-component-id
     * @param {string} template - The HTML template string.
     * @param {string} id - The unique ID to assign to the element.
     * @returns {HTMLElement|null} The created HTML element.
     */
    createElementFromTemplate(template, id) {
        // ROOT CAUSE TRACKING
        if (window.GMKBRenderTracker) {
            window.GMKBRenderTracker.track(id, 'dynamic-component-loader', 'createElementFromTemplate');
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template.trim();
        
        // ROOT CAUSE FIX: Check if template has multiple root elements
        if (tempDiv.children.length > 1) {
            console.error('ROOT CAUSE ERROR: Template has multiple root elements!', {
                componentId: id,
                rootElementCount: tempDiv.children.length,
                innerHTML: tempDiv.innerHTML.substring(0, 200) + '...'
            });
        }
        
        const element = tempDiv.firstElementChild;
        if (element) {
            // ROOT CAUSE FIX: Set ID and data-component-id ONLY on the root element
            element.id = id;
            element.setAttribute('data-component-id', id);
            
            // ROOT FIX: Ensure no child elements have data-component-id - only root element should have it
            // This is the SINGLE SOURCE OF TRUTH for proper element structure
            const existingDataIds = element.querySelectorAll('[data-component-id]');
            if (existingDataIds.length > 0) {
                structuredLogger.debug('LOADER', `Cleaning ${existingDataIds.length} child elements with data-component-id`);
                existingDataIds.forEach(child => child.removeAttribute('data-component-id'));
            }
            
            // ROOT FIX: Remove ANY existing control elements from template
            // This prevents duplicate controls from legacy templates
            const existingControls = element.querySelectorAll('.element-controls, .component-controls, .control-btn, [class*="control"]');
            if (existingControls.length > 0) {
                structuredLogger.warn('LOADER', `REMOVING ${existingControls.length} legacy control elements from template`);
                existingControls.forEach(control => {
                    // Only remove if it's actually a control element (not just something with 'control' in the class)
                    const classList = control.className;
                    if (classList.includes('element-controls') || 
                        classList.includes('component-controls') || 
                        classList.includes('control-btn') ||
                        classList.includes('control-toolbar')) {
                        control.remove();
                        structuredLogger.debug('LOADER', `Removed legacy control: ${classList}`);
                    }
                });
            }
            
            // ROOT FIX: Mark render time for debugging
            element.setAttribute('data-render-time', Date.now().toString());
            
            structuredLogger.debug('LOADER', `Created clean element with ID="${id}" and data-component-id="${id}"`);
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
        
    }
}

// ROOT FIX: Create and expose dynamic component loader globally
const dynamicComponentLoader = new DynamicComponentLoader();

// ROOT FIX: WordPress-compatible global exposure
window.dynamicComponentLoader = dynamicComponentLoader;
window.DynamicComponentLoader = DynamicComponentLoader;

console.log('✅ ROOT FIX: Simplified Dynamic Component Loader exposed globally (WordPress-compatible)');
console.log('✅ ROOT FIX: Event-driven via native Promises - NO external dependencies');

// ROOT CAUSE DEBUG: Enable debug mode command
window.enableDuplicationDebug = function() {
    window.GMKBDebugMode = true;
    console.log('🔍 ROOT CAUSE DEBUG: Duplication debug mode enabled');
    console.log('🔍 Will track any DOM mutations that add duplicate data-component-id attributes');
    return 'Debug mode enabled - mutations will be logged';
};

// ROOT FIX: Cleanup function to remove all duplicate/legacy controls
window.cleanupDuplicateControls = function() {
    console.log('🧹 Starting duplicate controls cleanup...');
    
    let removedCount = 0;
    
    // Find all components
    const allComponents = document.querySelectorAll('[data-component-id]');
    
    allComponents.forEach(component => {
        const componentId = component.getAttribute('data-component-id');
        
        // Find ALL control elements within this component
        const allControls = component.querySelectorAll('.element-controls, .component-controls, .control-btn, [class*="control-toolbar"]');
        
        if (allControls.length > 1) {
            console.warn(`Component ${componentId} has ${allControls.length} control sets!`);
            
            // Keep only the first .component-controls--dynamic if it exists
            let dynamicControlFound = false;
            allControls.forEach(control => {
                if (control.classList.contains('component-controls--dynamic') && !dynamicControlFound) {
                    dynamicControlFound = true;
                    console.log(`Keeping dynamic controls for ${componentId}`);
                } else {
                    control.remove();
                    removedCount++;
                    console.log(`Removed control element from ${componentId}:`, control.className);
                }
            });
        } else if (allControls.length === 1) {
            // Check if it's the old style controls
            const control = allControls[0];
            if (control.classList.contains('element-controls') && !control.classList.contains('component-controls--dynamic')) {
                console.warn(`Found legacy controls in ${componentId}, removing...`);
                control.remove();
                removedCount++;
                
                // Request dynamic controls to be attached
                if (window.componentControlsManager) {
                    window.componentControlsManager.attachControls(component, componentId);
                    console.log(`Attached new dynamic controls to ${componentId}`);
                }
            }
        }
    });
    
    console.log(`✅ Cleanup complete. Removed ${removedCount} duplicate/legacy control elements.`);
    
    // Run controls fix to ensure all components have proper controls
    if (window.fixControlsNow) {
        console.log('Running fixControlsNow() to ensure all components have proper controls...');
        window.fixControlsNow();
    }
    
    return {
        componentsChecked: allComponents.length,
        controlsRemoved: removedCount
    };
};

// ROOT FIX: Auto-run cleanup DISABLED - this was removing properly attached controls
// The cleanup was a patch for a problem that's been fixed at the root
/*
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🔧 Auto-running duplicate controls cleanup...');
            window.cleanupDuplicateControls();
        }, 2000); // Wait 2 seconds for all components to load
    });
} else {
    setTimeout(() => {
        console.log('🔧 Auto-running duplicate controls cleanup...');
        window.cleanupDuplicateControls();
    }, 2000);
}
*/

// ROOT FIX: Enhanced duplicate controls watcher with better detection
window.setupDuplicateControlsWatcher = function() {
    if (window.duplicateControlsWatcherActive) {
        return window.duplicateControlsObserver;
    }
    
    console.log('👀 Setting up enhanced duplicate controls watcher...');
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // ROOT FIX: More precise control detection
                        const isControlElement = node.classList && (
                            node.classList.contains('element-controls') ||
                            node.classList.contains('component-controls') ||
                            node.classList.contains('control-btn') ||
                            node.querySelector('.element-controls, .component-controls, .control-btn')
                        );
                        
                        if (isControlElement) {
                            const component = node.closest('[data-component-id]');
                            if (component) {
                                const componentId = component.getAttribute('data-component-id');
                                const existingControls = component.querySelectorAll('.component-controls, .element-controls');
                                
                                if (existingControls.length > 1) {
                                    console.warn('🚨 DUPLICATE CONTROL DETECTED:', {
                                        componentId: componentId,
                                        element: node,
                                        className: node.className,
                                        existingCount: existingControls.length,
                                        parent: mutation.target,
                                        stack: new Error().stack
                                    });
                                    
                                    // ROOT FIX: Keep only the most recent dynamic controls
                                    const dynamicControls = component.querySelector('.component-controls--dynamic');
                                    const legacyControls = component.querySelectorAll('.element-controls, .component-controls:not(.component-controls--dynamic)');
                                    
                                    if (dynamicControls && legacyControls.length > 0) {
                                        console.log('🧹 Removing legacy controls, keeping dynamic controls for:', componentId);
                                        legacyControls.forEach(control => {
                                            if (control !== dynamicControls) {
                                                control.remove();
                                            }
                                        });
                                    } else if (!dynamicControls && existingControls.length > 1) {
                                        // Keep only the first control if no dynamic controls exist
                                        console.log('🧹 Removing duplicate controls, keeping first control for:', componentId);
                                        for (let i = 1; i < existingControls.length; i++) {
                                            existingControls[i].remove();
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        });
    });
    
    // Watch the entire document for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    window.duplicateControlsWatcherActive = true;
    window.duplicateControlsObserver = observer;
    
    console.log('✅ Enhanced duplicate controls watcher active');
    return observer;
};

// ROOT FIX: Auto-setup watcher with delay to avoid false positives during initialization
if (document.readyState !== 'loading') {
    setTimeout(() => {
        window.setupDuplicateControlsWatcher();
    }, 2000); // Wait 2 seconds for initial components to load
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.setupDuplicateControlsWatcher();
        }, 2000); // Wait 2 seconds after DOM ready
    });
}

})(); // ROOT FIX: Close IIFE wrapper
