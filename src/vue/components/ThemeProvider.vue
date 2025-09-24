<template>
  <!-- Renderless component - no visual output -->
</template>

<script setup>
import { watch, onMounted, computed } from 'vue';
import { useThemeStore } from '../../stores/theme';

const themeStore = useThemeStore();

// Generate CSS from theme object
const generateCSSVariables = (theme) => {
  if (!theme) {
    console.warn('[ThemeProvider] No theme provided to generateCSSVariables');
    return '';
  }
  
  const vars = [];
  
  // Color variables with proper naming convention
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      vars.push(`--gmkb-color-${cssKey}: ${value}`);
    });
  }
  
  // Typography variables
  if (theme.typography) {
    vars.push(`--gmkb-font-primary: ${theme.typography.fontFamily || "'Inter', system-ui, sans-serif"}`);
    vars.push(`--gmkb-font-heading: ${theme.typography.headingFamily || theme.typography.fontFamily || "'Inter', system-ui, sans-serif"}`);
    
    const baseFontSize = theme.typography.baseFontSize || 16;
    vars.push(`--gmkb-font-size-base: ${baseFontSize}px`);
    vars.push(`--gmkb-font-size-xs: ${baseFontSize * 0.75}px`);
    vars.push(`--gmkb-font-size-sm: ${baseFontSize * 0.875}px`);
    vars.push(`--gmkb-font-size-lg: ${baseFontSize * 1.125}px`);
    vars.push(`--gmkb-font-size-xl: ${baseFontSize * 1.25}px`);
    vars.push(`--gmkb-font-size-2xl: ${baseFontSize * 1.5}px`);
    vars.push(`--gmkb-font-size-3xl: ${baseFontSize * 1.875}px`);
    vars.push(`--gmkb-font-size-4xl: ${baseFontSize * 2.25}px`);
    
    vars.push(`--gmkb-line-height-base: ${theme.typography.lineHeight || 1.6}`);
    vars.push(`--gmkb-line-height-heading: ${theme.typography.lineHeight ? theme.typography.lineHeight * 0.9 : 1.2}`);
    vars.push(`--gmkb-font-weight-normal: ${theme.typography.fontWeight || 400}`);
    vars.push(`--gmkb-font-weight-medium: ${Math.min((theme.typography.fontWeight || 400) + 100, 600)}`);
    vars.push(`--gmkb-font-weight-bold: ${Math.min((theme.typography.fontWeight || 400) + 300, 700)}`);
    
    // Heading scale
    const headingScale = theme.typography.headingScale || 1.25;
    vars.push(`--gmkb-heading-scale: ${headingScale}`);
  }
  
  // Spacing variables
  if (theme.spacing) {
    const unit = theme.spacing.baseUnit || 8;
    
    // Generate spacing scale 0-20
    for (let i = 0; i <= 20; i++) {
      vars.push(`--gmkb-space-${i}: ${unit * i * 0.25}px`);
    }
    
    // Named spacing values
    vars.push(`--gmkb-spacing-xs: ${unit * 0.5}px`);
    vars.push(`--gmkb-spacing-sm: ${unit * 0.75}px`);
    vars.push(`--gmkb-spacing-md: ${unit}px`);
    vars.push(`--gmkb-spacing-lg: ${unit * 1.5}px`);
    vars.push(`--gmkb-spacing-xl: ${unit * 2}px`);
    vars.push(`--gmkb-spacing-2xl: ${unit * 3}px`);
    vars.push(`--gmkb-spacing-3xl: ${unit * 4}px`);
    
    // Component and section spacing
    vars.push(`--gmkb-spacing-component-gap: ${theme.spacing.componentGap || 24}px`);
    vars.push(`--gmkb-spacing-section-gap: ${theme.spacing.sectionPadding || 40}px`);
    vars.push(`--gmkb-spacing-section-padding: ${theme.spacing.sectionPadding || 40}px`);
    vars.push(`--gmkb-container-max-width: ${theme.spacing.containerMaxWidth || 1200}px`);
  }
  
  // Effect variables
  if (theme.effects) {
    // Border radius
    const borderRadius = theme.effects.borderRadius || '8px';
    vars.push(`--gmkb-border-radius: ${borderRadius}`);
    vars.push(`--gmkb-border-radius-none: 0`);
    vars.push(`--gmkb-border-radius-sm: calc(${borderRadius} * 0.5)`);
    vars.push(`--gmkb-border-radius-default: ${borderRadius}`);
    vars.push(`--gmkb-border-radius-lg: calc(${borderRadius} * 1.5)`);
    vars.push(`--gmkb-border-radius-xl: calc(${borderRadius} * 2)`);
    vars.push(`--gmkb-border-radius-full: 9999px`);
    
    // Shadow variables
    const shadowIntensity = theme.effects.shadowIntensity || 'medium';
    const shadows = {
      none: 'none',
      subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      strong: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    };
    
    vars.push(`--gmkb-shadow: ${shadows[shadowIntensity] || shadows.medium}`);
    vars.push(`--gmkb-shadow-none: none`);
    vars.push(`--gmkb-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)`);
    vars.push(`--gmkb-shadow-default: ${shadows[shadowIntensity] || shadows.medium}`);
    vars.push(`--gmkb-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`);
    vars.push(`--gmkb-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`);
    vars.push(`--gmkb-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`);
    
    // Animation/transition variables
    const animationSpeed = theme.effects.animationSpeed || 'normal';
    const speeds = {
      none: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    };
    
    vars.push(`--gmkb-transition: all ${speeds[animationSpeed] || speeds.normal} ease`);
    vars.push(`--gmkb-transition-fast: all 150ms ease`);
    vars.push(`--gmkb-transition-default: all ${speeds[animationSpeed] || speeds.normal} ease`);
    vars.push(`--gmkb-transition-slow: all 500ms ease`);
  }
  
  return vars.join(';\n');
};

// Apply theme to DOM
const applyThemeToDOM = () => {
  const theme = themeStore.mergedTheme;
  
  if (!theme) {
    console.warn('[ThemeProvider] No merged theme available');
    return;
  }
  
  // Generate CSS variables
  const cssVars = generateCSSVariables(theme);
  
  // Find or create style element
  let styleEl = document.getElementById('gmkb-theme-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'gmkb-theme-styles';
    document.head.appendChild(styleEl);
  }
  
  // Apply CSS variables to :root
  styleEl.innerHTML = `:root {\n${cssVars}\n}`;
  
  // Set theme attribute on document element
  document.documentElement.setAttribute('data-gmkb-theme', themeStore.activeThemeId);
  
  // Apply special effect classes to body
  if (theme.effects) {
    document.body.classList.toggle('gmkb-theme-gradients', theme.effects.gradients === true);
    document.body.classList.toggle('gmkb-theme-blur', theme.effects.blurEffects === true);
  }
  
  // Dispatch theme applied event
  document.dispatchEvent(new CustomEvent('gmkb:theme-applied', {
    detail: { 
      theme: theme,
      themeId: themeStore.activeThemeId 
    }
  }));
  
  console.log('[ThemeProvider] Theme applied:', themeStore.activeThemeId);
};

// Watch for theme changes
watch(
  () => themeStore.mergedTheme,
  () => {
    applyThemeToDOM();
  },
  { deep: true }
);

// Watch for active theme ID changes
watch(
  () => themeStore.activeThemeId,
  () => {
    applyThemeToDOM();
  }
);

// Initialize on mount
onMounted(() => {
  console.log('[ThemeProvider] Mounted, applying initial theme');
  
  // Initialize theme store with data from window.gmkbData if available
  if (window.gmkbData?.themes) {
    // Override default themes with server-provided themes
    themeStore.availableThemes = window.gmkbData.themes.map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description || '',
      colors: theme.colors || {},
      typography: theme.typography || {},
      spacing: theme.spacing || {},
      effects: theme.effects || {}
    }));
  }
  
  // Apply initial theme
  applyThemeToDOM();
  
  // Listen for external theme change requests
  document.addEventListener('gmkb:change-theme', (event) => {
    if (event.detail?.themeId) {
      themeStore.selectTheme(event.detail.themeId);
    }
  });
});
</script>

<style>
/* Global theme effect classes */
.gmkb-theme-gradients {
  --gmkb-gradient-enabled: 1;
}

.gmkb-theme-blur {
  --gmkb-blur-enabled: 1;
}

/* Ensure theme variables are available globally */
:root {
  /* Default fallback values in case theme provider hasn't loaded yet */
  --gmkb-color-primary: #3b82f6;
  --gmkb-color-secondary: #2563eb;
  --gmkb-color-background: #ffffff;
  --gmkb-color-surface: #f8fafc;
  --gmkb-color-text: #1e293b;
  --gmkb-color-text-light: #64748b;
  --gmkb-color-border: #e2e8f0;
  --gmkb-font-primary: 'Inter', system-ui, sans-serif;
  --gmkb-font-heading: 'Inter', system-ui, sans-serif;
  --gmkb-font-size-base: 16px;
  --gmkb-line-height-base: 1.6;
  --gmkb-spacing-md: 8px;
  --gmkb-border-radius: 8px;
  --gmkb-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --gmkb-transition: all 300ms ease;
}
</style>
