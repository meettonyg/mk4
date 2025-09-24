/**
 * Vue Component Loader Service
 * 
 * Dynamically loads Vue component files on demand
 * Uses Vite's import.meta.glob for efficient component discovery
 * 
 * @package GMKB
 * @since 2.0.0
 */

// Import all Vue component renderers using Vite's glob import
const vueComponents = import.meta.glob('/components/*/[A-Z]*Renderer.vue', { eager: false });

class VueComponentLoader {
    constructor() {
        this.componentCache = new Map();
        this.loadingPromises = new Map();
        
        // Log discovered components in development
        if (import.meta.env.DEV) {
            console.log('[VueComponentLoader] Discovered Vue components:', Object.keys(vueComponents));
        }
    }

    /**
     * Load a Vue component by name
     * 
     * @param {string} componentName Component type/name
     * @return {Promise<Object>} Vue component module
     */
    async loadVueComponent(componentName) {
        // Check cache first
        if (this.componentCache.has(componentName)) {
            return this.componentCache.get(componentName);
        }

        // Check if already loading
        if (this.loadingPromises.has(componentName)) {
            return this.loadingPromises.get(componentName);
        }

        // Find matching component path
        const componentPath = this.findComponentPath(componentName);
        
        if (!componentPath) {
            console.error(`[VueComponentLoader] Component '${componentName}' not found`);
            return null;
        }

        // Create loading promise
        const loadPromise = this.loadComponent(componentPath, componentName);
        this.loadingPromises.set(componentName, loadPromise);

        try {
            const component = await loadPromise;
            this.componentCache.set(componentName, component);
            this.loadingPromises.delete(componentName);
            return component;
        } catch (error) {
            console.error(`[VueComponentLoader] Failed to load component '${componentName}':`, error);
            this.loadingPromises.delete(componentName);
            return null;
        }
    }

    /**
     * Find the path for a component
     * 
     * @param {string} componentName Component name
     * @return {string|null} Component path or null
     */
    findComponentPath(componentName) {
        // Direct match first
        let path = `/components/${componentName}/${this.formatComponentFileName(componentName)}Renderer.vue`;
        if (vueComponents[path]) {
            return path;
        }

        // Try with different naming conventions
        const variations = [
            `/components/${componentName}/${componentName}Renderer.vue`,
            `/components/${componentName}/${this.toPascalCase(componentName)}Renderer.vue`,
            `/components/${componentName.toLowerCase()}/${this.formatComponentFileName(componentName)}Renderer.vue`,
            `/components/${componentName.replace(/-/g, '_')}/${this.formatComponentFileName(componentName)}Renderer.vue`
        ];

        for (const variation of variations) {
            if (vueComponents[variation]) {
                return variation;
            }
        }

        // Search all paths for partial match
        const allPaths = Object.keys(vueComponents);
        const matchingPath = allPaths.find(path => {
            const normalizedPath = path.toLowerCase();
            const normalizedName = componentName.toLowerCase().replace(/-/g, '');
            return normalizedPath.includes(normalizedName);
        });

        return matchingPath || null;
    }

    /**
     * Load a component from path
     * 
     * @param {string} path Component path
     * @param {string} componentName Component name for logging
     * @return {Promise<Object>} Component module
     */
    async loadComponent(path, componentName) {
        const importFn = vueComponents[path];
        
        if (!importFn) {
            throw new Error(`No import function for path: ${path}`);
        }

        console.log(`[VueComponentLoader] Loading component '${componentName}' from ${path}`);
        
        const module = await importFn();
        
        // Return the default export or the module itself
        return module.default || module;
    }

    /**
     * Format component name to file name
     * 
     * @param {string} name Component name
     * @return {string} Formatted name
     */
    formatComponentFileName(name) {
        // Convert kebab-case to PascalCase
        return name.split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
    }

    /**
     * Convert string to PascalCase
     * 
     * @param {string} str String to convert
     * @return {string} PascalCase string
     */
    toPascalCase(str) {
        return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c ? c.toUpperCase() : '');
    }

    /**
     * Check if a component is available
     * 
     * @param {string} componentName Component name
     * @return {boolean} True if component exists
     */
    hasComponent(componentName) {
        return this.findComponentPath(componentName) !== null;
    }

    /**
     * Get all available component names
     * 
     * @return {Array<string>} Component names
     */
    getAvailableComponents() {
        const components = new Set();
        
        Object.keys(vueComponents).forEach(path => {
            // Extract component name from path
            const match = path.match(/\/components\/([^/]+)\//);
            if (match) {
                components.add(match[1]);
            }
        });
        
        return Array.from(components);
    }

    /**
     * Preload a component
     * 
     * @param {string} componentName Component to preload
     */
    preloadComponent(componentName) {
        this.loadVueComponent(componentName).catch(err => {
            console.warn(`[VueComponentLoader] Failed to preload '${componentName}':`, err);
        });
    }

    /**
     * Preload multiple components
     * 
     * @param {Array<string>} componentNames Components to preload
     */
    preloadComponents(componentNames) {
        componentNames.forEach(name => this.preloadComponent(name));
    }

    /**
     * Clear the component cache
     */
    clearCache() {
        this.componentCache.clear();
        console.log('[VueComponentLoader] Cache cleared');
    }

    /**
     * Get cache statistics
     * 
     * @return {Object} Cache stats
     */
    getCacheStats() {
        return {
            cached: this.componentCache.size,
            loading: this.loadingPromises.size,
            available: Object.keys(vueComponents).length
        };
    }
}

// Create and export singleton instance
const vueComponentLoader = new VueComponentLoader();

// Make globally available
if (typeof window !== 'undefined') {
    window.VueComponentLoader = vueComponentLoader;
    
    // Attach to GMKB namespace when ready
    if (window.GMKB) {
        window.GMKB.vueComponentLoader = vueComponentLoader;
    } else {
        window.addEventListener('gmkb:ready', () => {
            if (window.GMKB) {
                window.GMKB.vueComponentLoader = vueComponentLoader;
            }
        });
    }
}

export default vueComponentLoader;
