/**
 * @file dynamic-component-loader.js
 * @description Manages the dynamic fetching, caching, and rendering of component templates.
 * This file is a critical part of the component system, ensuring that components are loaded
 * efficiently and that their templates are cached to improve performance.
 *
 * This version includes a fix to correctly export the dynamicComponentLoader instance,
 * making it accessible to other modules.
 */

import {
    getPluginRoot
} from '../utils/helpers.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';

/**
 * A class to manage the dynamic loading and rendering of components.
 * It handles fetching component templates from a REST API, caching them,
 * and rendering them with the provided properties.
 *
 * @class DynamicComponentLoader
 */
class DynamicComponentLoader {
    constructor() {
        this.cache = new Map();
        this.pending = new Map();
        this.pluginUrl = getPluginRoot();
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
            console.error(`Error rendering component ${type} (${id}):`, error);
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
        if (this.cache.has(type)) {
            console.log(`🚀 [Cache HIT] ${type} rendered in ${performanceMonitor.getMetric('get-template-from-cache')?.duration?.toFixed(2) || 0}ms (Cache hit rate: ${(performanceMonitor.getMetric('get-template-from-cache')?.hits / performanceMonitor.getMetric('get-template-from-cache')?.total * 100 || 0).toFixed(1)}%)`);
            return this.cache.get(type);
        }

        if (this.pending.has(type)) {
            console.log(`⏳ [Cache] Waiting for ${type} template to load...`);
            return this.pending.get(type);
        }

        console.log(`📡 [Cache MISS] Fetching ${type} from server...`);
        const perfEnd = performanceMonitor.start('fetch-template', {
            type
        });
        const promise = this.fetchTemplate(type);
        this.pending.set(type, promise);

        try {
            const template = await promise;
            this.cache.set(type, template);
            console.log(`✅ [Cache] ${type} fetched and cached in ${performanceMonitor.getMetric('fetch-template')?.duration?.toFixed(2) || 0}ms (Cache hit rate: ${(performanceMonitor.getMetric('fetch-template')?.hits / performanceMonitor.getMetric('fetch-template')?.total * 100 || 0).toFixed(1)}%)`);
            return template;
        } finally {
            this.pending.delete(type);
            perfEnd();
        }
    }

    /**
     * Fetches a component's template from the server via REST API.
     * @param {string} type - The component type.
     * @returns {Promise<string>} A promise that resolves to the template string.
     */
    async fetchTemplate(type) {
        try {
            const response = await fetch(`${this.pluginUrl}/components/${type}/template.php`);
            if (!response.ok) {
                throw new Error(`Failed to fetch template for ${type}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Fetch error for component ${type}:`, error);
            throw error;
        }
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
}

// FIX: Added the 'export' keyword to make the dynamicComponentLoader instance
// available for import by other modules. This resolves the module export error.
export const dynamicComponentLoader = new DynamicComponentLoader();
