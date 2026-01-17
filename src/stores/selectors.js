/**
 * Store Selectors with Memoization
 * 
 * ROOT FIX: Prevents unnecessary re-renders by memoizing computed values
 * Replaces direct store access with optimized selectors
 * 
 * @package GMKB
 * @version 2.0.0
 */

import { computed } from 'vue';

/**
 * Memoization cache
 */
const memoCache = new Map();
const memoTimestamps = new Map();
const CACHE_DURATION = 100; // 100ms cache for rapid re-renders

/**
 * Generic memoization function
 */
function memoize(fn, key) {
    return (...args) => {
        const cacheKey = key + JSON.stringify(args);
        const now = Date.now();
        
        // Check if cache exists and is still valid
        if (memoCache.has(cacheKey)) {
            const timestamp = memoTimestamps.get(cacheKey);
            if (now - timestamp < CACHE_DURATION) {
                return memoCache.get(cacheKey);
            }
        }
        
        // Calculate and cache result
        const result = fn(...args);
        memoCache.set(cacheKey, result);
        memoTimestamps.set(cacheKey, now);
        
        // Cleanup old cache entries periodically
        if (memoCache.size > 100) {
            const cutoff = now - CACHE_DURATION;
            for (const [k, t] of memoTimestamps.entries()) {
                if (t < cutoff) {
                    memoCache.delete(k);
                    memoTimestamps.delete(k);
                }
            }
        }
        
        return result;
    };
}

/**
 * Create store selectors with memoization
 */
export function createStoreSelectors(store) {
    return {
        // Component selectors
        getComponentById: memoize((id) => {
            return store.components[id] || null;
        }, 'getComponentById'),
        
        getComponentsByType: memoize((type) => {
            return Object.values(store.components).filter(c => c.type === type);
        }, 'getComponentsByType'),
        
        getComponentsBySection: memoize((sectionId) => {
            const section = store.sections.find(s => s.section_id === sectionId);
            if (!section) return [];
            
            return (section.components || [])
                .map(id => store.components[id])
                .filter(Boolean);
        }, 'getComponentsBySection'),
        
        getOrphanedComponents: memoize(() => {
            const allComponentIds = new Set(Object.keys(store.components));
            const sectionComponentIds = new Set();
            
            store.sections.forEach(section => {
                (section.components || []).forEach(id => {
                    sectionComponentIds.add(id);
                });
            });
            
            return Array.from(allComponentIds)
                .filter(id => !sectionComponentIds.has(id))
                .map(id => store.components[id]);
        }, 'getOrphanedComponents'),
        
        // Section selectors
        getSectionById: memoize((id) => {
            return store.sections.find(s => s.section_id === id) || null;
        }, 'getSectionById'),
        
        getSectionsByLayout: memoize((layout) => {
            return store.sections.filter(s => s.layout === layout);
        }, 'getSectionsByLayout'),
        
        getSectionIndex: memoize((sectionId) => {
            return store.sections.findIndex(s => s.section_id === sectionId);
        }, 'getSectionIndex'),
        
        // Statistics selectors
        getComponentCount: memoize(() => {
            return Object.keys(store.components).length;
        }, 'getComponentCount'),
        
        getSectionCount: memoize(() => {
            return store.sections.length;
        }, 'getSectionCount'),
        
        getComponentTypeStats: memoize(() => {
            const stats = {};
            Object.values(store.components).forEach(component => {
                const type = component.type || 'unknown';
                stats[type] = (stats[type] || 0) + 1;
            });
            return stats;
        }, 'getComponentTypeStats'),
        
        // Profile data selectors
        getPodsField: memoize((field) => {
            return store.profileData?.[field] || null;
        }, 'getPodsField'),
        
        getPodsFieldsCount: memoize(() => {
            return store.profileData ? Object.keys(store.profileData).length : 0;
        }, 'getPodsFieldsCount'),
        
        hasPodsData: memoize(() => {
            return store.profileData && Object.keys(store.profileData).length > 0;
        }, 'hasPodsData'),
        
        // Theme selectors
        getActiveTheme: memoize(() => {
            return store.theme || 'professional_clean';
        }, 'getActiveTheme'),
        
        getThemeCustomizations: memoize(() => {
            return store.themeCustomizations || {};
        }, 'getThemeCustomizations'),
        
        // State selectors
        isDirty: memoize(() => {
            return store.isDirty || false;
        }, 'isDirty'),
        
        isLoading: memoize(() => {
            return store.isLoading || false;
        }, 'isLoading'),
        
        isSaving: memoize(() => {
            return store.isSaving || false;
        }, 'isSaving'),
        
        hasContent: memoize(() => {
            return store.sections.length > 0 || Object.keys(store.components).length > 0;
        }, 'hasContent'),
        
        // Complex selectors
        getCompleteState: memoize(() => {
            return {
                components: { ...store.components },
                sections: [...store.sections],
                layout: [...(store.layout || [])],
                globalSettings: { ...store.globalSettings },
                theme: store.theme,
                themeCustomizations: { ...store.themeCustomizations }
            };
        }, 'getCompleteState'),
        
        getExportData: memoize(() => {
            // Clean data for export (remove internal fields)
            const exportComponents = {};
            Object.entries(store.components).forEach(([id, component]) => {
                const { _internal, _temp, ...cleanComponent } = component;
                exportComponents[id] = cleanComponent;
            });
            
            return {
                version: '2.0.0',
                timestamp: Date.now(),
                components: exportComponents,
                sections: store.sections,
                layout: store.layout || [],
                globalSettings: store.globalSettings,
                theme: store.theme,
                themeCustomizations: store.themeCustomizations
            };
        }, 'getExportData')
    };
}

/**
 * Create computed selectors for Vue components
 */
export function useStoreSelectors(store) {
    const selectors = createStoreSelectors(store);
    
    // Wrap selectors in computed for reactivity
    const computedSelectors = {};
    
    Object.entries(selectors).forEach(([name, selector]) => {
        if (typeof selector === 'function') {
            // For functions, return the function itself
            computedSelectors[name] = selector;
        } else {
            // For values, wrap in computed
            computedSelectors[name] = computed(() => selector);
        }
    });
    
    return computedSelectors;
}

/**
 * Clear memoization cache
 */
export function clearSelectorCache() {
    memoCache.clear();
    memoTimestamps.clear();
    console.log('✅ Selector cache cleared');
}

/**
 * Get cache statistics
 */
export function getSelectorCacheStats() {
    return {
        cacheSize: memoCache.size,
        cacheKeys: Array.from(memoCache.keys()),
        oldestEntry: Math.min(...Array.from(memoTimestamps.values())),
        newestEntry: Math.max(...Array.from(memoTimestamps.values()))
    };
}
