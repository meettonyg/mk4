/**
 * Editor Common Mixin
 * Shared methods and computed properties for all component editors
 */

import { computed } from 'vue';
import { useMediaKitStore } from '../../../../../stores/mediaKit';
import { getDefaultSettings, applyPreset as applySchemaPreset } from '../../../../../utils/componentSchema';

export function useEditorCommon(componentId) {
  const store = useMediaKitStore();

  // Get component from store
  const component = computed(() => store.components[componentId.value || componentId]);

  // Get component settings
  const componentSettings = computed(() => {
    const comp = component.value;
    if (!comp) return getDefaultSettings();
    
    // Ensure settings exist
    if (!comp.settings) {
      comp.settings = getDefaultSettings();
    }
    
    return comp.settings;
  });

  // Get preview element in DOM
  const previewElement = computed(() => {
    const id = componentId.value || componentId;
    return document.querySelector(`[data-component-id="${id}"]`);
  });

  /**
   * Update a setting at a specific path
   * @param {string} path - Dot-notation path (e.g., 'style.spacing.margin.top')
   * @param {any} value - New value
   */
  const updateSetting = (path, value) => {
    const comp = component.value;
    if (!comp) return;

    // Split path and navigate to the property
    const parts = path.split('.');
    let target = comp.settings;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) {
        target[parts[i]] = {};
      }
      target = target[parts[i]];
    }
    
    // Set the value
    const lastPart = parts[parts.length - 1];
    target[lastPart] = value;

    // Update component in store
    store.updateComponent(comp.id, { settings: comp.settings });

    // Apply CSS immediately (if ComponentStyleService is available)
    if (window.GMKB?.services?.componentStyle) {
      window.GMKB.services.componentStyle.applyStyling(comp.id, comp.settings);
    }
  };

  /**
   * Apply CSS directly to preview element
   * @param {Object} cssObject - CSS properties as object
   */
  const applyCSSToPreview = (cssObject) => {
    const element = previewElement.value;
    if (!element) return;

    Object.entries(cssObject).forEach(([property, value]) => {
      element.style[property] = value;
    });
  };

  /**
   * Reset settings to defaults
   */
  const resetToDefaults = () => {
    const comp = component.value;
    if (!comp) return;

    const defaults = getDefaultSettings();
    comp.settings = defaults;
    store.updateComponent(comp.id, { settings: defaults });

    // Reapply styles
    if (window.GMKB?.services?.componentStyle) {
      window.GMKB.services.componentStyle.applyStyling(comp.id, defaults);
    }
  };

  /**
   * Apply a preset
   * @param {string} presetType - Type of preset (spacing, typography)
   * @param {string} presetName - Name of the preset
   */
  const applyPreset = (presetType, presetName) => {
    const comp = component.value;
    if (!comp) return;

    const newSettings = applySchemaPreset(comp.settings, presetType, presetName);
    comp.settings = newSettings;
    store.updateComponent(comp.id, { settings: newSettings });

    // Reapply styles
    if (window.GMKB?.services?.componentStyle) {
      window.GMKB.services.componentStyle.applyStyling(comp.id, newSettings);
    }
  };

  return {
    // Computed
    component,
    componentSettings,
    previewElement,
    
    // Methods
    updateSetting,
    applyCSSToPreview,
    resetToDefaults,
    applyPreset
  };
}

export default {
  useEditorCommon
};
