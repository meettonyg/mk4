/**
 * Dynamic Component Styles Composable
 * 
 * ROOT FIX: Loads component CSS dynamically when components are added to preview
 * Solves the issue where wp_enqueue_style() only runs during initial page load
 * 
 * ARCHITECTURE:
 * - Tracks which component CSS files are already loaded
 * - Loads CSS via <link> tag injection when new components are added
 * - Uses component registry to get correct CSS file paths
 * - Prevents duplicate CSS loading
 * 
 * @package Guestify Media Kit Builder
 * @version 1.0.0
 */

import { ref, watch } from 'vue';
import { useMediaKitStore } from '@/stores/mediaKit';

// GLOBAL STATE: Track loaded CSS files across all component instances
const loadedStyles = ref(new Set());

export function useDynamicComponentStyles() {
  const store = useMediaKitStore();
  
  /**
   * Load CSS file for a specific component type
   * 
   * @param {string} componentType - Component type (e.g., 'biography', 'hero')
   * @returns {Promise<boolean>} - True if loaded successfully
   */
  const loadComponentStyles = async (componentType) => {
    // Check if already loaded
    if (loadedStyles.value.has(componentType)) {
      console.log(`⏭️  CSS already loaded for component: ${componentType}`);
      return true;
    }
    
    try {
      // Get component info from registry
      const componentInfo = window.gmkbData?.componentRegistry?.[componentType];
      
      if (!componentInfo) {
        console.warn(`⚠️ Component not found in registry: ${componentType}`);
        return false;
      }
      
      // Check if component declares a stylesheet
      if (!componentInfo.styles) {
        console.log(`ℹ️ Component ${componentType} has no stylesheet declared`);
        return true; // Not an error - some components don't need CSS
      }
      
      // Build CSS file URL
      const cssUrl = `${window.gmkbData.pluginUrl}components/${componentType}/${componentInfo.styles}`;
      
      // Check if CSS link already exists in DOM
      const existingLink = document.querySelector(`link[href*="${componentType}"]`);
      if (existingLink) {
        console.log(`✅ CSS link already exists in DOM: ${componentType}`);
        loadedStyles.value.add(componentType);
        return true;
      }
      
      // Create and inject <link> tag
      return await new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssUrl;
        
        // Add cache busting in development mode
        if (window.gmkbData.debugMode) {
          link.href += `?v=${Date.now()}`;
        }
        
        // Success handler
        link.onload = () => {
          loadedStyles.value.add(componentType);
          console.log(`✅ Dynamic CSS loaded: ${componentType} → ${componentInfo.styles}`);
          
          // Dispatch event for other systems that may need to know
          document.dispatchEvent(new CustomEvent('gmkb:component-css-loaded', {
            detail: { componentType, cssUrl }
          }));
          
          resolve(true);
        };
        
        // Error handler
        link.onerror = (error) => {
          console.error(`❌ Failed to load CSS for ${componentType}:`, error);
          reject(new Error(`CSS load failed: ${cssUrl}`));
        };
        
        // Inject into document head
        document.head.appendChild(link);
      });
      
    } catch (error) {
      console.error(`❌ Error loading styles for ${componentType}:`, error);
      return false;
    }
  };
  
  /**
   * Load CSS for multiple component types
   * 
   * @param {string[]} componentTypes - Array of component types
   * @returns {Promise<Object>} - Results object with success/failure counts
   */
  const loadMultipleComponentStyles = async (componentTypes) => {
    const results = {
      total: componentTypes.length,
      loaded: 0,
      failed: 0,
      skipped: 0
    };
    
    console.log(`📦 Loading CSS for ${componentTypes.length} components...`);
    
    // Load all CSS files in parallel
    const promises = componentTypes.map(async (type) => {
      try {
        const success = await loadComponentStyles(type);
        if (success) {
          results.loaded++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        results.failed++;
      }
    });
    
    await Promise.allSettled(promises);
    
    console.log(`✅ Dynamic CSS loading complete:`, results);
    
    return results;
  };
  
  /**
   * Get list of component types that need CSS loaded
   * Compares what's in preview vs what's already loaded
   * 
   * @returns {string[]} - Array of component types needing CSS
   */
  const getComponentsNeedingStyles = () => {
    const componentsInPreview = new Set();
    
    // Extract component types from all sections
    if (store.sections) {
      store.sections.forEach(section => {
        if (section.components) {
          section.components.forEach(compId => {
            const component = store.components[compId];
            if (component?.type) {
              componentsInPreview.add(component.type);
            }
          });
        }
      });
    }
    
    // Find components that aren't loaded yet
    const needingStyles = Array.from(componentsInPreview).filter(
      type => !loadedStyles.value.has(type)
    );
    
    return needingStyles;
  };
  
  /**
   * AUTO-LOAD: Watch store for component additions and load CSS automatically
   */
  const enableAutoLoad = () => {
    let isProcessing = false;
    
    // Watch store.components for additions
    watch(
      () => store.components,
      async (newComponents, oldComponents) => {
        // Prevent concurrent processing
        if (isProcessing) return;
        
        try {
          isProcessing = true;
          
          // Get new component types
          const newTypes = Object.values(newComponents)
            .map(comp => comp.type)
            .filter(type => type && !loadedStyles.value.has(type));
          
          // Remove duplicates
          const uniqueTypes = [...new Set(newTypes)];
          
          if (uniqueTypes.length > 0) {
            console.log(`🔄 Auto-loading CSS for ${uniqueTypes.length} new component(s):`, uniqueTypes);
            await loadMultipleComponentStyles(uniqueTypes);
          }
          
        } finally {
          isProcessing = false;
        }
      },
      { deep: true }
    );
    
    console.log('✅ Dynamic CSS auto-loading enabled');
  };
  
  /**
   * Check if CSS is loaded for a component type
   * 
   * @param {string} componentType - Component type to check
   * @returns {boolean} - True if CSS is loaded
   */
  const isStyleLoaded = (componentType) => {
    return loadedStyles.value.has(componentType);
  };
  
  /**
   * Get debug information about loaded styles
   * 
   * @returns {Object} - Debug info object
   */
  const getDebugInfo = () => {
    return {
      loadedCount: loadedStyles.value.size,
      loadedTypes: Array.from(loadedStyles.value),
      needingLoad: getComponentsNeedingStyles()
    };
  };
  
  return {
    loadComponentStyles,
    loadMultipleComponentStyles,
    getComponentsNeedingStyles,
    enableAutoLoad,
    isStyleLoaded,
    getDebugInfo,
    // Expose internal state for debugging
    loadedStyles: loadedStyles.value
  };
}

// Export for global debug commands
if (typeof window !== 'undefined') {
  window.useDynamicComponentStyles = useDynamicComponentStyles;
}
