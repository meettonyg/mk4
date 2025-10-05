/**
 * Theme Composable - Provides reactive theme functionality
 * ROOT FIX: Uses theme store as single source of truth instead of window.gmkbData
 */

import { computed, watch, onMounted } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import { useThemeStore } from '../../stores/theme';

// Deep merge utility for theme customizations
function deepMerge(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Generate CSS variables from theme object
function generateCSSVariables(theme, prefix = '--gmkb') {
  const vars = [];
  
  const processValue = (key, value, currentPrefix) => {
    // Convert camelCase to kebab-case
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const varName = `${currentPrefix}-${cssKey}`;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively process nested objects
      Object.entries(value).forEach(([k, v]) => {
        processValue(k, v, varName);
      });
    } else {
      // Add the CSS variable
      vars.push(`${varName}: ${value}`);
    }
  };
  
  // Process each theme property
  Object.entries(theme).forEach(([key, value]) => {
    // Special handling for common theme properties
    if (key === 'colors') {
      Object.entries(value).forEach(([colorName, colorValue]) => {
        vars.push(`--gmkb-color-${colorName.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${colorValue}`);
      });
    } else if (key === 'typography') {
      Object.entries(value).forEach(([typeName, typeValue]) => {
        const typeCssName = typeName.replace(/([A-Z])/g, '-$1').toLowerCase();
        if (typeName.includes('font')) {
          vars.push(`--gmkb-font-${typeCssName.replace('font-', '')}: ${typeValue}`);
        } else {
          vars.push(`--gmkb-${typeCssName}: ${typeValue}`);
        }
      });
    } else if (key === 'spacing') {
      Object.entries(value).forEach(([spaceName, spaceValue]) => {
        if (spaceName === 'baseUnit') {
          // Generate space scale from base unit
          const base = parseInt(spaceValue);
          for (let i = 0; i <= 20; i++) {
            vars.push(`--gmkb-space-${i}: ${base * i * 0.25}px`);
          }
        } else {
          vars.push(`--gmkb-spacing-${spaceName.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${spaceValue}`);
        }
      });
    } else if (key === 'effects') {
      Object.entries(value).forEach(([effectName, effectValue]) => {
        vars.push(`--gmkb-${effectName.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${effectValue}`);
      });
    } else {
      // Process other properties generically
      processValue(key, value, prefix);
    }
  });
  
  return vars.join(';\n  ');
}

export function useTheme() {
  const mediaKitStore = useMediaKitStore();
  const themeStore = useThemeStore();
  
  // ROOT FIX: Get theme data from theme store, not window.gmkbData
  const getThemeData = (themeId) => {
    // Check theme store's allThemes (includes both built-in and custom)
    const theme = themeStore.allThemes.find(t => t.id === themeId);
    
    if (!theme) {
      console.warn(`Theme "${themeId}" not found in theme store`);
      return null;
    }
    
    return theme;
  };
  
  // ROOT FIX: Use theme store's computed properties instead of manual computation
  const mergedTheme = computed(() => {
    // Use theme store's mergedTheme which already handles customizations
    const storeTheme = themeStore.mergedTheme;
    
    if (storeTheme && Object.keys(storeTheme).length > 0) {
      return storeTheme;
    }
    
    // Fallback to a minimal default theme if theme store is not ready
    console.warn('Theme store not ready, using fallback theme');
    return {
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          text: '#1f2937',
          textLight: '#6b7280',
          background: '#ffffff',
          surface: '#f9fafb',
          border: '#e5e7eb'
        },
        typography: {
          fontPrimary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontHeading: 'inherit',
          fontSize: '16px',
          fontScale: 1,
          lineHeight: 1.6
        },
        spacing: {
          baseUnit: '4px',
          componentGap: '2rem',
          sectionGap: '4rem'
        },
        effects: {
          borderRadius: '0.5rem',
          shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          transitions: 'all 0.2s ease'
        }
      };
  });
  
  // Apply theme to DOM
  const applyTheme = () => {
    const theme = mergedTheme.value;
    if (!theme) return;
    
    // Generate CSS variables
    const cssVars = generateCSSVariables(theme);
    
    // Find or create style element
    let styleEl = document.getElementById('gmkb-theme-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'gmkb-theme-styles';
      document.head.appendChild(styleEl);
    }
    
    // Update styles
    styleEl.textContent = `:root {\n  ${cssVars}\n}`;
    
    // Set theme attribute on document for potential theme-specific styles
    document.documentElement.setAttribute('data-gmkb-theme', themeStore.activeThemeId);
    
    console.log('✅ Theme applied:', themeStore.activeThemeId);
  };
  
  // ROOT FIX: Watch theme store for changes, not media kit store
  watch(() => themeStore.activeThemeId, applyTheme, { immediate: true });
  watch(() => themeStore.tempCustomizations, applyTheme, { deep: true });
  
  // Apply theme on mount
  onMounted(() => {
    applyTheme();
  });
  
  return {
    theme: computed(() => themeStore.activeThemeId),
    mergedTheme,
    applyTheme,
    setTheme: (themeId) => {
      // ROOT FIX: Use theme store's selectTheme method
      themeStore.selectTheme(themeId);
    },
    updateCustomization: (path, value) => {
      // ROOT FIX: Update theme store customizations
      const keys = path.split('.');
      const [category, property] = keys;
      
      if (category === 'colors') {
        themeStore.updateColor(property, value);
      } else if (category === 'typography') {
        themeStore.updateTypography(property, value);
      } else if (category === 'spacing') {
        themeStore.updateSpacing(property, value);
      } else if (category === 'effects') {
        themeStore.updateEffects(property, value);
      }
    },
    resetCustomizations: () => {
      themeStore.resetToOriginal();
    },
    // Additional helper methods
    getThemeData,
    availableThemes: computed(() => themeStore.allThemes)
  };
}
