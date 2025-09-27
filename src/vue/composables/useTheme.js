/**
 * Theme Composable - Provides reactive theme functionality
 * Generates and applies CSS variables from theme data
 */

import { computed, watch, onMounted } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';

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
  const store = useMediaKitStore();
  
  // Get theme data from window.gmkbData
  const getThemeData = (themeId) => {
    if (!window.gmkbData?.themes) {
      console.warn('No themes data available in gmkbData');
      return null;
    }
    
    return window.gmkbData.themes.find(t => 
      t.id === themeId || 
      t.slug === themeId || 
      t.name?.toLowerCase() === themeId?.toLowerCase()
    );
  };
  
  // Compute merged theme (base + customizations)
  const mergedTheme = computed(() => {
    const baseTheme = getThemeData(store.theme);
    
    if (!baseTheme) {
      console.warn(`Theme "${store.theme}" not found, using default`);
      // Return a minimal default theme
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
    }
    
    // Deep merge with customizations if they exist
    if (store.themeCustomizations && Object.keys(store.themeCustomizations).length > 0) {
      return deepMerge(baseTheme, store.themeCustomizations);
    }
    
    return baseTheme;
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
    document.documentElement.setAttribute('data-gmkb-theme', store.theme);
    
    console.log('✅ Theme applied:', store.theme);
  };
  
  // Watch for theme changes
  watch(() => store.theme, applyTheme, { immediate: true });
  watch(() => store.themeCustomizations, applyTheme, { deep: true });
  
  // Apply theme on mount
  onMounted(() => {
    applyTheme();
  });
  
  return {
    theme: computed(() => store.theme),
    mergedTheme,
    applyTheme,
    setTheme: (themeId) => {
      store.theme = themeId;
      store.hasUnsavedChanges = true;
    },
    updateCustomization: (path, value) => {
      // Use lodash-like set for nested path updates
      const keys = path.split('.');
      const last = keys.pop();
      let obj = store.themeCustomizations;
      
      for (const key of keys) {
        if (!obj[key]) obj[key] = {};
        obj = obj[key];
      }
      
      obj[last] = value;
      store.hasUnsavedChanges = true;
    },
    resetCustomizations: () => {
      store.themeCustomizations = {};
      store.hasUnsavedChanges = true;
    }
  };
}
