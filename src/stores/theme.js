/**
 * Theme Store - Pinia Store for Theme Management
 * Complete theme customization state management
 */
import { defineStore } from 'pinia';
import { useMediaKitStore } from './mediaKit';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // Available themes
    availableThemes: [
      {
        id: 'professional',
        name: 'Professional Clean',
        description: 'Clean and professional design',
        colors: {
          primary: '#3b82f6',
          secondary: '#2563eb',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1e293b',
          textLight: '#64748b',
          border: '#e2e8f0',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        typography: {
          fontFamily: "'Inter', system-ui, sans-serif",
          headingFamily: "'Inter', system-ui, sans-serif",
          baseFontSize: 16,
          headingScale: 1.25,
          lineHeight: 1.6,
          fontWeight: 400
        },
        spacing: {
          baseUnit: 8,
          componentGap: 24,
          sectionPadding: 40,
          containerMaxWidth: 1200
        },
        effects: {
          borderRadius: '8px',
          shadowIntensity: 'medium',
          animationSpeed: 'normal',
          gradients: false,
          blurEffects: false
        }
      },
      {
        id: 'creative',
        name: 'Creative Bold',
        description: 'Bold and creative design',
        colors: {
          primary: '#f97316',
          secondary: '#ea580c',
          background: '#fffbf5',
          surface: '#fff7ed',
          text: '#1f2937',
          textLight: '#78716c',
          border: '#fed7aa',
          success: '#84cc16',
          warning: '#fbbf24',
          error: '#dc2626'
        },
        typography: {
          fontFamily: "'Poppins', system-ui, sans-serif",
          headingFamily: "'Playfair Display', serif",
          baseFontSize: 17,
          headingScale: 1.3,
          lineHeight: 1.7,
          fontWeight: 400
        },
        spacing: {
          baseUnit: 10,
          componentGap: 32,
          sectionPadding: 48,
          containerMaxWidth: 1280
        },
        effects: {
          borderRadius: '12px',
          shadowIntensity: 'strong',
          animationSpeed: 'normal',
          gradients: true,
          blurEffects: false
        }
      },
      {
        id: 'minimal',
        name: 'Minimal Elegant',
        description: 'Minimal and elegant design',
        colors: {
          primary: '#18181b',
          secondary: '#27272a',
          background: '#ffffff',
          surface: '#fafafa',
          text: '#18181b',
          textLight: '#71717a',
          border: '#e4e4e7',
          success: '#22c55e',
          warning: '#eab308',
          error: '#f87171'
        },
        typography: {
          fontFamily: "'Helvetica Neue', system-ui, sans-serif",
          headingFamily: "'Georgia', serif",
          baseFontSize: 16,
          headingScale: 1.2,
          lineHeight: 1.5,
          fontWeight: 300
        },
        spacing: {
          baseUnit: 8,
          componentGap: 20,
          sectionPadding: 32,
          containerMaxWidth: 1100
        },
        effects: {
          borderRadius: '2px',
          shadowIntensity: 'subtle',
          animationSpeed: 'fast',
          gradients: false,
          blurEffects: false
        }
      },
      {
        id: 'dark',
        name: 'Modern Dark',
        description: 'Modern dark theme',
        colors: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
          textLight: '#94a3b8',
          border: '#334155',
          success: '#4ade80',
          warning: '#fbbf24',
          error: '#f87171'
        },
        typography: {
          fontFamily: "'Inter', system-ui, sans-serif",
          headingFamily: "'Inter', system-ui, sans-serif",
          baseFontSize: 16,
          headingScale: 1.25,
          lineHeight: 1.6,
          fontWeight: 400
        },
        spacing: {
          baseUnit: 8,
          componentGap: 24,
          sectionPadding: 40,
          containerMaxWidth: 1200
        },
        effects: {
          borderRadius: '8px',
          shadowIntensity: 'strong',
          animationSpeed: 'normal',
          gradients: true,
          blurEffects: true
        }
      }
    ],
    
    // Custom themes (user-created)
    customThemes: [],
    
    // Current active theme
    activeThemeId: 'professional',
    
    // Temporary customizations (before saving)
    tempCustomizations: {
      colors: {},
      typography: {},
      spacing: {},
      effects: {}
    },
    
    // UI State
    customizerOpen: false,
    activePanel: 'themes',
    hasUnsavedChanges: false,
    
    // Color presets for quick application
    colorPresets: {
      blue: { primary: '#3b82f6', secondary: '#2563eb' },
      green: { primary: '#10b981', secondary: '#059669' },
      purple: { primary: '#8b5cf6', secondary: '#7c3aed' },
      red: { primary: '#ef4444', secondary: '#dc2626' },
      orange: { primary: '#f97316', secondary: '#ea580c' },
      pink: { primary: '#ec4899', secondary: '#db2777' },
      teal: { primary: '#14b8a6', secondary: '#0d9488' },
      indigo: { primary: '#6366f1', secondary: '#4f46e5' }
    }
  }),

  getters: {
    // Get the currently active theme object
    activeTheme: (state) => {
      // First check custom themes
      const customTheme = state.customThemes.find(t => t.id === state.activeThemeId);
      if (customTheme) return customTheme;
      
      // Then check available themes
      return state.availableThemes.find(t => t.id === state.activeThemeId) || state.availableThemes[0];
    },
    
    // Get merged theme with temporary customizations
    mergedTheme: (state, getters) => {
      const theme = getters.activeTheme;
      if (!theme) {
        // Return default theme structure if no theme is active
        return {
          colors: {
            primary: '#3b82f6',
            secondary: '#2563eb',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1e293b',
            textLight: '#64748b',
            border: '#e2e8f0'
          },
          typography: {
            fontFamily: "'Inter', system-ui, sans-serif",
            headingFamily: "'Inter', system-ui, sans-serif",
            baseFontSize: 16,
            headingScale: 1.25,
            lineHeight: 1.6,
            fontWeight: 400
          },
          spacing: {
            baseUnit: 8,
            componentGap: 24,
            sectionPadding: 40,
            containerMaxWidth: 1200
          },
          effects: {
            borderRadius: '8px',
            shadowIntensity: 'medium',
            animationSpeed: 'normal',
            gradients: false,
            blurEffects: false
          }
        };
      }
      return {
        ...theme,
        colors: { ...theme.colors, ...state.tempCustomizations.colors },
        typography: { ...theme.typography, ...state.tempCustomizations.typography },
        spacing: { ...theme.spacing, ...state.tempCustomizations.spacing },
        effects: { ...theme.effects, ...state.tempCustomizations.effects }
      };
    },
    
    // Get all themes (built-in + custom)
    allThemes: (state) => {
      return [...state.availableThemes, ...state.customThemes];
    },
    
    // Generate CSS variables from current theme
    cssVariables: (state, getters) => {
      const theme = getters.mergedTheme;
      const vars = {};
      
      // Color variables
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        vars[`--gmkb-color-${cssKey}`] = value;
      });
      
      // Typography variables
      vars['--gmkb-font-primary'] = theme.typography.fontFamily;
      vars['--gmkb-font-heading'] = theme.typography.headingFamily;
      vars['--gmkb-font-size-base'] = `${theme.typography.baseFontSize}px`;
      vars['--gmkb-font-size-sm'] = `${theme.typography.baseFontSize * 0.875}px`;
      vars['--gmkb-font-size-lg'] = `${theme.typography.baseFontSize * 1.125}px`;
      vars['--gmkb-font-size-xl'] = `${theme.typography.baseFontSize * 1.25}px`;
      vars['--gmkb-font-size-2xl'] = `${theme.typography.baseFontSize * 1.5}px`;
      vars['--gmkb-font-size-3xl'] = `${theme.typography.baseFontSize * 1.875}px`;
      vars['--gmkb-line-height'] = theme.typography.lineHeight;
      vars['--gmkb-font-weight'] = theme.typography.fontWeight;
      vars['--gmkb-heading-scale'] = theme.typography.headingScale;
      
      // Spacing variables
      const unit = theme.spacing.baseUnit;
      vars['--gmkb-spacing-xs'] = `${unit * 0.5}px`;
      vars['--gmkb-spacing-sm'] = `${unit * 0.75}px`;
      vars['--gmkb-spacing-md'] = `${unit}px`;
      vars['--gmkb-spacing-lg'] = `${unit * 1.5}px`;
      vars['--gmkb-spacing-xl'] = `${unit * 2}px`;
      vars['--gmkb-spacing-2xl'] = `${unit * 3}px`;
      vars['--gmkb-spacing-3xl'] = `${unit * 4}px`;
      vars['--gmkb-spacing-component-gap'] = `${theme.spacing.componentGap}px`;
      vars['--gmkb-spacing-section-padding'] = `${theme.spacing.sectionPadding}px`;
      vars['--gmkb-container-max-width'] = `${theme.spacing.containerMaxWidth}px`;
      
      // Effect variables
      vars['--gmkb-border-radius'] = theme.effects.borderRadius;
      vars['--gmkb-border-radius-sm'] = `calc(${theme.effects.borderRadius} * 0.5)`;
      vars['--gmkb-border-radius-lg'] = `calc(${theme.effects.borderRadius} * 1.5)`;
      
      // Shadow variables based on intensity
      const shadows = {
        none: 'none',
        subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        strong: '0 10px 25px rgba(0, 0, 0, 0.15)'
      };
      vars['--gmkb-shadow'] = shadows[theme.effects.shadowIntensity] || shadows.medium;
      vars['--gmkb-shadow-sm'] = '0 1px 2px rgba(0, 0, 0, 0.05)';
      vars['--gmkb-shadow-lg'] = '0 20px 40px rgba(0, 0, 0, 0.2)';
      
      // Animation variables
      const speeds = {
        none: '0ms',
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      };
      vars['--gmkb-transition-speed'] = speeds[theme.effects.animationSpeed] || speeds.normal;
      
      return vars;
    }
  },

  actions: {
    // Initialize theme from saved state
    initialize(savedTheme, savedCustomizations) {
      if (savedTheme) {
        this.activeThemeId = savedTheme;
      }
      if (savedCustomizations) {
        this.tempCustomizations = savedCustomizations;
      }
      this.applyThemeToDOM();
    },
    
    // Open theme customizer
    openCustomizer() {
      this.customizerOpen = true;
      this.activePanel = 'themes';
    },
    
    // Close theme customizer
    closeCustomizer(save = false) {
      if (save && this.hasUnsavedChanges) {
        this.applyCustomizations();
      } else if (!save && this.hasUnsavedChanges) {
        // Reset temp customizations
        this.tempCustomizations = {
          colors: {},
          typography: {},
          spacing: {},
          effects: {}
        };
        this.applyThemeToDOM();
      }
      this.customizerOpen = false;
      this.hasUnsavedChanges = false;
    },
    
    // Switch active panel
    setActivePanel(panel) {
      this.activePanel = panel;
    },
    
    // Select a theme
    selectTheme(themeId) {
      const theme = this.allThemes.find(t => t.id === themeId);
      if (theme) {
        this.activeThemeId = themeId;
        this.tempCustomizations = {
          colors: {},
          typography: {},
          spacing: {},
          effects: {}
        };
        this.hasUnsavedChanges = true;
        this.applyThemeToDOM();
      }
    },
    
    // Apply color preset
    applyColorPreset(presetName) {
      const preset = this.colorPresets[presetName];
      if (preset) {
        this.tempCustomizations.colors = {
          ...this.tempCustomizations.colors,
          ...preset
        };
        this.hasUnsavedChanges = true;
        this.applyThemeToDOM();
      }
    },
    
    // Update color
    updateColor(colorKey, value) {
      this.tempCustomizations.colors[colorKey] = value;
      this.hasUnsavedChanges = true;
      this.applyThemeToDOM();
    },
    
    // Update typography
    updateTypography(key, value) {
      this.tempCustomizations.typography[key] = value;
      this.hasUnsavedChanges = true;
      this.applyThemeToDOM();
    },
    
    // Update spacing
    updateSpacing(key, value) {
      this.tempCustomizations.spacing[key] = value;
      this.hasUnsavedChanges = true;
      this.applyThemeToDOM();
    },
    
    // Update effects
    updateEffects(key, value) {
      this.tempCustomizations.effects[key] = value;
      this.hasUnsavedChanges = true;
      this.applyThemeToDOM();
    },
    
    // Reset to original theme
    resetToOriginal() {
      this.tempCustomizations = {
        colors: {},
        typography: {},
        spacing: {},
        effects: {}
      };
      this.hasUnsavedChanges = false;
      this.applyThemeToDOM();
    },
    
    // Apply customizations permanently
    applyCustomizations() {
      // Update the media kit store
      const mediaKitStore = useMediaKitStore();
      mediaKitStore.theme = this.activeThemeId;
      mediaKitStore.themeCustomizations = { ...this.tempCustomizations };
      mediaKitStore.hasUnsavedChanges = true;
      
      this.hasUnsavedChanges = false;
    },
    
    // Save as custom theme
    async saveAsCustomTheme(name, description) {
      const customTheme = {
        ...this.mergedTheme,
        id: `custom_${Date.now()}`,
        name,
        description,
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      
      this.customThemes.push(customTheme);
      this.activeThemeId = customTheme.id;
      this.tempCustomizations = {
        colors: {},
        typography: {},
        spacing: {},
        effects: {}
      };
      
      // Save to database via AJAX
      await this.saveCustomThemeToDatabase(customTheme);
      
      return customTheme;
    },
    
    // Delete custom theme
    deleteCustomTheme(themeId) {
      const index = this.customThemes.findIndex(t => t.id === themeId);
      if (index > -1) {
        this.customThemes.splice(index, 1);
        if (this.activeThemeId === themeId) {
          this.activeThemeId = 'professional';
        }
      }
    },
    
    // Export theme as JSON
    exportTheme() {
      const theme = this.mergedTheme;
      const json = JSON.stringify(theme, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-${theme.name || theme.id}-${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    },
    
    // Import theme from JSON
    importTheme(themeData) {
      if (!themeData.id || !themeData.colors) {
        throw new Error('Invalid theme data');
      }
      
      // Add as custom theme
      const customTheme = {
        ...themeData,
        id: `imported_${Date.now()}`,
        isCustom: true,
        imported: true,
        importedAt: new Date().toISOString()
      };
      
      this.customThemes.push(customTheme);
      this.selectTheme(customTheme.id);
      
      return customTheme;
    },
    
    // Apply theme CSS variables to DOM
    applyThemeToDOM() {
      const root = document.documentElement;
      const cssVars = this.cssVariables;
      
      if (!cssVars || Object.keys(cssVars).length === 0) {
        console.warn('No CSS variables to apply');
        return;
      }
      
      Object.entries(cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      
      // Apply special classes for effects
      const theme = this.mergedTheme;
      document.body.classList.toggle('theme-gradients', theme.effects.gradients);
      document.body.classList.toggle('theme-blur', theme.effects.blurEffects);
      
      // Dispatch event for other systems
      document.dispatchEvent(new CustomEvent('gmkb:theme-applied', {
        detail: { theme: this.mergedTheme }
      }));
    },
    
    // Save custom theme to database
    async saveCustomThemeToDatabase(theme) {
      if (!window.gmkbData?.ajaxUrl) {
        console.error('AJAX URL not available');
        return;
      }
      
      const formData = new FormData();
      formData.append('action', 'gmkb_save_custom_theme');
      formData.append('nonce', window.gmkbData.nonce || '');
      formData.append('theme', JSON.stringify(theme));
      
      try {
        const response = await fetch(window.gmkbData.ajaxUrl, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.data?.message || 'Failed to save theme');
        }
      } catch (error) {
        console.error('Failed to save custom theme:', error);
        throw error;
      }
    },
    
    // Load custom themes from database
    async loadCustomThemes() {
      if (!window.gmkbData?.ajaxUrl) {
        return;
      }
      
      const formData = new FormData();
      formData.append('action', 'gmkb_get_custom_themes');
      formData.append('nonce', window.gmkbData.nonce || '');
      
      try {
        const response = await fetch(window.gmkbData.ajaxUrl, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        if (result.success && result.data?.themes) {
          this.customThemes = result.data.themes;
        }
      } catch (error) {
        console.error('Failed to load custom themes:', error);
      }
    }
  }
});
