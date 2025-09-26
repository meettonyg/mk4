/**
 * Theme Composable
 * Provides theme management functionality
 */

import { ref, computed } from 'vue';
import { useThemeStore } from '../../stores/theme';

export function useTheme() {
  const themeStore = useThemeStore();
  
  const currentTheme = computed(() => themeStore.mergedTheme);
  const themeName = computed(() => themeStore.currentTheme);
  
  function applyTheme() {
    // Apply CSS variables from theme
    const root = document.documentElement;
    const theme = currentTheme.value;
    
    if (theme && theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--gmkb-color-${key}`, value);
      });
    }
    
    if (theme && theme.fonts) {
      Object.entries(theme.fonts).forEach(([key, value]) => {
        root.style.setProperty(`--gmkb-font-${key}`, value);
      });
    }
  }
  
  function selectTheme(themeId) {
    themeStore.selectTheme(themeId);
    applyTheme();
  }
  
  return {
    currentTheme,
    themeName,
    applyTheme,
    selectTheme
  };
}
