/**
 * Lazy Loading Utilities
 * 
 * ROOT FIX: Generic lazy loading patterns only
 * NO hardcoded component references
 * Components are discovered dynamically via UnifiedComponentRegistry
 * 
 * @package GMKB
 * @version 2.0.0
 */

/**
 * Empty LazyComponents object for backwards compatibility
 * Real components are loaded via UnifiedComponentRegistry
 */
export const LazyComponents = {};

/**
 * Preload critical components after initial load
 * Uses requestIdleCallback for optimal performance
 */
export function preloadCriticalComponents() {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Use requestIdleCallback if available, setTimeout as fallback
    const schedulePreload = 'requestIdleCallback' in window
        ? (fn) => requestIdleCallback(fn, { timeout: 2000 })
        : (fn) => setTimeout(fn, 2000);
    
    schedulePreload(() => {
        // Preload commonly used Vue components (not business components)
        // Business components are loaded on-demand via UnifiedComponentRegistry
        const systemComponents = [
            () => import(/* webpackPreload: true */ '../vue/components/ComponentLibraryNew.vue'),
            () => import(/* webpackPreload: true */ '../vue/components/EditorPanel.vue'),
            () => import(/* webpackPreload: true */ '../vue/components/panels/DesignPanel.vue')
        ];
        
        systemComponents.forEach(loader => {
            loader().catch(err => {
                console.warn('Failed to preload component:', err);
            });
        });
        
        console.log('✅ Critical system components preloaded');
    });
}

/**
 * Dynamic component loader with error handling
 * 
 * @deprecated Use UnifiedComponentRegistry.getVueComponent() instead
 */
export async function loadComponent(name) {
    console.warn(`loadComponent('${name}') is deprecated. Use UnifiedComponentRegistry.getVueComponent() instead.`);
    
    // Delegate to registry
    if (window.gmkbComponentRegistry) {
        return window.gmkbComponentRegistry.getVueComponent(name);
    }
    
    throw new Error(`Component registry not available. Cannot load ${name}.`);
}

/**
 * Webpack/Vite magic comments guide:
 * 
 * webpackChunkName: Names the chunk for better debugging
 * webpackPreload: Loads in parallel with parent chunk (high priority)
 * webpackPrefetch: Loads during idle time (low priority)
 * webpackMode: "lazy" (default) | "lazy-once" | "eager" | "weak"
 */
