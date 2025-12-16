/**
 * Theme Store - Pinia Store for Theme Management
 * Complete theme customization state management
 */
import { defineStore } from 'pinia';
import { useMediaKitStore } from './mediaKit';
import ThemeStyleInjector from '../services/ThemeStyleInjector';
import profileBrandingService from '../services/ProfileBrandingService';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // Available themes - START EMPTY, populated from PHP in initialize()
    availableThemes: [],
    
    // Custom themes (user-created)
    customThemes: [],
    
    // Current active theme
    activeThemeId: 'professional_clean',
    
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
    
    // ROOT FIX: Add getTheme getter for backwards compatibility
    getTheme: (state) => (themeId) => {
      // First check custom themes
      const customTheme = state.customThemes.find(t => t.id === themeId);
      if (customTheme) return customTheme;
      
      // Then check available themes
      return state.availableThemes.find(t => t.id === themeId);
    },
    
    // ROOT FIX: Add currentTheme getter for consistency with test expectations
    currentTheme: (state) => {
      // First check custom themes
      const customTheme = state.customThemes.find(t => t.id === state.activeThemeId);
      if (customTheme) return customTheme;
      
      // Then check available themes
      return state.availableThemes.find(t => t.id === state.activeThemeId) || state.availableThemes[0];
    },
    
    // Get merged theme with temporary customizations
    mergedTheme: (state) => {
      // ROOT FIX: Don't use getters.activeTheme to avoid circular dependency
      // Instead, find the theme directly
      let theme = null;
      
      // First check custom themes
      if (state.customThemes && state.customThemes.length > 0) {
        theme = state.customThemes.find(t => t.id === state.activeThemeId);
      }
      
      // Then check available themes
      if (!theme && state.availableThemes && state.availableThemes.length > 0) {
        theme = state.availableThemes.find(t => t.id === state.activeThemeId);
      }
      
      // If still no theme, use the first available theme or return default
      if (!theme) {
        if (state.availableThemes && state.availableThemes.length > 0) {
          theme = state.availableThemes[0];
        } else {
          // Return default theme structure if no themes available
          return {
            colors: {
              primary: '#3b82f6',
              primaryText: '#ffffff',
              secondary: '#2563eb',
              background: '#ffffff',
              surface: '#f8fafc',
              text: '#1e293b',
              linkColor: '#3b82f6',
              linkHover: '#2563eb'
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
      }
      
      // ROOT FIX: Safely merge with null checks
      return {
        ...theme,
        colors: { ...(theme.colors || {}), ...(state.tempCustomizations.colors || {}) },
        typography: { ...(theme.typography || {}), ...(state.tempCustomizations.typography || {}) },
        spacing: { ...(theme.spacing || {}), ...(state.tempCustomizations.spacing || {}) },
        effects: { ...(theme.effects || {}), ...(state.tempCustomizations.effects || {}) }
      };
    },
    
    // Get all themes (built-in + custom)
    allThemes: (state) => {
      return [...state.availableThemes, ...state.customThemes];
    },
    
    // Generate CSS variables from current theme
    cssVariables: (state) => {
      // ROOT FIX: Use mergedTheme getter result directly without dependency
      const mergedTheme = state.mergedTheme || {};
      
      // Get the merged theme using the same logic as mergedTheme getter
      let theme = null;
      
      // First check custom themes
      if (state.customThemes && state.customThemes.length > 0) {
        theme = state.customThemes.find(t => t.id === state.activeThemeId);
      }
      
      // Then check available themes
      if (!theme && state.availableThemes && state.availableThemes.length > 0) {
        theme = state.availableThemes.find(t => t.id === state.activeThemeId);
      }
      
      // If still no theme, use the first available theme
      if (!theme && state.availableThemes && state.availableThemes.length > 0) {
        theme = state.availableThemes[0];
      }
      
      if (!theme) {
        return {};
      }
      
      // Apply customizations
      theme = {
        ...theme,
        colors: { ...(theme.colors || {}), ...(state.tempCustomizations.colors || {}) },
        typography: { ...(theme.typography || {}), ...(state.tempCustomizations.typography || {}) },
        spacing: { ...(theme.spacing || {}), ...(state.tempCustomizations.spacing || {}) },
        effects: { ...(theme.effects || {}), ...(state.tempCustomizations.effects || {}) }
      };
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
      // CRITICAL FIX: Load themes from PHP FIRST, before anything else
      if (window.gmkbData && window.gmkbData.themes && Array.isArray(window.gmkbData.themes)) {
        console.log(`[Theme Store] Loading ${window.gmkbData.themes.length} themes from server`);
        
        // ROOT FIX: Define defaults BEFORE mapping to avoid circular reference
        const defaultTypography = {
          fontFamily: "'Inter', system-ui, sans-serif",
          headingFamily: "'Inter', system-ui, sans-serif",
          baseFontSize: 16,
          headingScale: 1.25,
          lineHeight: 1.6,
          fontWeight: 400
        };
        
        const defaultSpacing = {
          baseUnit: 8,
          componentGap: 24,
          sectionPadding: 40,
          containerMaxWidth: 1200
        };
        
        const defaultEffects = {
          borderRadius: '8px',
          shadowIntensity: 'medium',
          animationSpeed: 'normal',
          gradients: false,
          blurEffects: false
        };
        
        // Process themes from PHP data
        const themesData = window.gmkbData.themes;
        this.availableThemes = themesData.map((theme, index) => {
          // Create a new object with standard property assignment for the ID.
          // This is the correct way to ensure Vue's reactivity system tracks the property.
          const newTheme = {
            id: theme.id || `theme_${index}`,
            name: theme.name || 'Unnamed Theme',
            description: theme.description || '',
            colors: { ...(theme.colors || {}) },
            typography: { ...defaultTypography, ...(theme.typography || {}) },
            spacing: { ...defaultSpacing, ...(theme.spacing || {}) },
            effects: { ...defaultEffects, ...(theme.effects || {}) },
            category: theme.category || 'custom',
            isCustom: theme.isCustom || false,
            isBuiltIn: theme.isBuiltIn !== false
          };

          console.log(`[Theme Store] Processed theme ${index}: ${newTheme.name}`, {
            id: newTheme.id,
            hasId: 'id' in newTheme,
            idEnumerable: Object.propertyIsEnumerable.call(newTheme, 'id')
          });

          return newTheme;
        });
        
        console.log(`[Theme Store] Initialized with ${this.availableThemes.length} themes`);
        
        // Debug: Log first theme to verify structure
        if (this.availableThemes.length > 0) {
          console.log('[Theme Store] First theme:', this.availableThemes[0]);
          console.log('[Theme Store] First theme ID:', this.availableThemes[0].id);
        }
      } else {
        console.warn('[Theme Store] No themes data in gmkbData, using built-in themes only');
        // CRITICAL: Must have at least one theme
        this.availableThemes = [{
          id: 'professional_clean',
          name: 'Professional Clean',
          description: 'Clean and professional design',
          category: 'professional',
          colors: {
            primary: '#3b82f6',
            primaryText: '#ffffff',
            secondary: '#2563eb',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1e293b',
            linkColor: '#3b82f6',
            linkHover: '#2563eb'
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
          },
          isBuiltIn: true
        }];
      }
      
      // ROOT FIX: Ensure store is ready before applying theme
      if (!this.availableThemes || this.availableThemes.length === 0) {
        console.error('[Theme Store] No themes available after initialization!');
        return;
      }
      
      console.log(`[Theme Store] Initialized with ${this.availableThemes.length} themes`);
      
      if (savedTheme) {
        // Validate theme exists before setting
        const themeExists = this.availableThemes.find(t => t.id === savedTheme);
        if (themeExists) {
          this.activeThemeId = savedTheme;
          console.log(`[Theme Store] Set active theme: ${savedTheme}`);
        } else {
          console.warn(`[Theme Store] Saved theme "${savedTheme}" not found in available themes:`, 
            this.availableThemes.map(t => t.id));
          console.log(`[Theme Store] Using default theme instead: ${this.availableThemes[0].id}`);
          this.activeThemeId = this.availableThemes[0].id;
        }
      } else {
        // Set first theme as default
        this.activeThemeId = this.availableThemes[0].id;
        console.log(`[Theme Store] No saved theme, using default: ${this.activeThemeId}`);
      }
      
      if (savedCustomizations) {
        this.tempCustomizations = savedCustomizations;
      }
      
      // PHASE 4: Apply theme to DOM using ThemeStyleInjector
      const activeTheme = this.availableThemes.find(t => t.id === this.activeThemeId);
      if (activeTheme) {
        try {
          ThemeStyleInjector.applyTheme(activeTheme, this.activeThemeId);
          console.log('[Theme Store] Initial theme applied via ThemeStyleInjector:', this.activeThemeId);
        } catch (error) {
          console.error('[Theme Store] Failed to apply initial theme via ThemeStyleInjector:', error);
          // Fallback to old method
          this.applyThemeToDOM();
        }
      } else {
        console.warn('[Theme Store] Could not find active theme to apply:', this.activeThemeId);
      }
      
      // ROOT FIX #2: Sync initial theme to mediaKit store
      // This ensures the default/saved theme persists on first save
      try {
        const mediaKitStore = useMediaKitStore();
        mediaKitStore.theme = this.activeThemeId;
        // DON'T call _trackChange() here - we don't want to mark as dirty on initial load
        console.log('[Theme Store] ✅ Synced initial theme to mediaKit store:', this.activeThemeId);
      } catch (error) {
        console.error('[Theme Store] ❌ Failed to sync initial theme to mediaKit store:', error);
        // Non-fatal - theme still applied to UI
      }
    },
    
    // Open theme customizer
    openCustomizer(panel = 'themes') {
      this.customizerOpen = true;
      // CRITICAL FIX: Allow specifying which panel to open
      if (panel && ['themes', 'colors', 'typography', 'spacing', 'effects', 'save'].includes(panel)) {
        this.activePanel = panel;
      } else {
        this.activePanel = 'themes';
      }
      console.log(`[Theme Store] Opened customizer on panel: ${this.activePanel}`);
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
      console.log('[Theme Store] selectTheme called with:', themeId);
      console.log('[Theme Store] Current activeThemeId:', this.activeThemeId);
      console.log('[Theme Store] All themes:', this.allThemes.map(t => ({ id: t.id, name: t.name })));
      
      const theme = this.allThemes.find(t => t.id === themeId);
      console.log('[Theme Store] Found theme:', theme);
      
      if (theme) {
        console.log('[Theme Store] Setting activeThemeId from', this.activeThemeId, 'to', themeId);
        this.activeThemeId = themeId;
        console.log('[Theme Store] activeThemeId is now:', this.activeThemeId);
        
        this.tempCustomizations = {
          colors: {},
          typography: {},
          spacing: {},
          effects: {}
        };
        this.hasUnsavedChanges = true;
        
        // PHASE 4: Use ThemeStyleInjector to apply theme as CSS variables
        try {
          ThemeStyleInjector.applyTheme(theme, themeId);
          console.log('[Theme Store] Theme applied via ThemeStyleInjector:', themeId);
        } catch (error) {
          console.error('[Theme Store] Failed to apply theme via ThemeStyleInjector:', error);
          // Fallback to old method
          this.applyThemeToDOM();
        }
        
        // ROOT FIX: Sync theme to mediaKit store immediately
        // This ensures the theme persists when the user saves
        try {
          const mediaKitStore = useMediaKitStore();
          mediaKitStore.theme = themeId;
          mediaKitStore._trackChange(); // Mark as dirty so it saves
          console.log('[Theme Store] ✅ Synced theme to mediaKit store:', themeId);
        } catch (error) {
          console.error('[Theme Store] ❌ Failed to sync theme to mediaKit store:', error);
          // Non-fatal - theme still applied to UI
        }
      } else {
        console.error('[Theme Store] Could not find theme with ID:', themeId);
      }
    },
    
    // Apply color preset
    applyColorPreset(presetName) {
      const preset = this.colorPresets[presetName];
      if (preset) {
        // CRITICAL FIX: Already using immutable update - good!
        this.tempCustomizations.colors = {
          ...this.tempCustomizations.colors,
          ...preset
        };
        this.hasUnsavedChanges = true;
        this.applyThemeToDOM();
        console.log(`[Theme Store] Applied color preset: ${presetName}`, preset);
      }
    },
    
    // Update color
    updateColor(colorKey, value) {
      // CRITICAL FIX: Use immutable update to ensure Vue reactivity
      this.tempCustomizations.colors = {
        ...this.tempCustomizations.colors,
        [colorKey]: value
      };
      this.hasUnsavedChanges = true;
      this.applyThemeToDOM();
      console.log(`[Theme Store] Updated color ${colorKey}:`, value);
    },
    
    // Update typography
    updateTypography(key, value) {
      // CRITICAL FIX: Use immutable update to ensure Vue reactivity
      this.tempCustomizations.typography = {
        ...this.tempCustomizations.typography,
        [key]: value
      };
      this.hasUnsavedChanges = true;
      this.applyThemeToDOM();
      console.log(`[Theme Store] Updated typography ${key}:`, value);
    },
    
    // Update spacing
    updateSpacing(key, value) {
      // CRITICAL FIX: Use immutable update to ensure Vue reactivity
      this.tempCustomizations.spacing = {
        ...this.tempCustomizations.spacing,
        [key]: value
      };
      this.hasUnsavedChanges = true;
      this.applyThemeToDOM();
      console.log(`[Theme Store] Updated spacing ${key}:`, value);
    },
    
    // Update effects
    updateEffects(key, value) {
      // CRITICAL FIX: Use immutable update to ensure Vue reactivity
      this.tempCustomizations.effects = {
        ...this.tempCustomizations.effects,
        [key]: value
      };
      this.hasUnsavedChanges = true;
      this.applyThemeToDOM();
      console.log(`[Theme Store] Updated effects ${key}:`, value);
    },
    
    // Reset to original theme
    resetToOriginal() {
      console.log('[Theme Store] Resetting to original theme:', this.activeThemeId);
      
      // Clear all temporary customizations
      this.tempCustomizations = {
        colors: {},
        typography: {},
        spacing: {},
        effects: {}
      };
      this.hasUnsavedChanges = true; // ROOT FIX: Keep as true so UI shows pending state
      
      // ROOT FIX: Re-apply the base theme using ThemeStyleInjector (same as selectTheme)
      const theme = this.activeTheme;
      if (theme) {
        try {
          ThemeStyleInjector.applyTheme(theme, this.activeThemeId);
          console.log('[Theme Store] Original theme re-applied via ThemeStyleInjector:', this.activeThemeId);
        } catch (error) {
          console.error('[Theme Store] Failed to re-apply theme via ThemeStyleInjector:', error);
          // Fallback to old method
          this.applyThemeToDOM();
        }
      } else {
        console.warn('[Theme Store] Could not find active theme to reset:', this.activeThemeId);
        // Fallback
        this.applyThemeToDOM();
      }
      
      // ROOT FIX: Sync reset to mediaKit store
      try {
        const mediaKitStore = useMediaKitStore();
        mediaKitStore.themeCustomizations = {
          colors: {},
          typography: {},
          spacing: {},
          effects: {}
        };
        mediaKitStore._trackChange(); // Mark as dirty so it saves
        console.log('[Theme Store] ✅ Synced theme reset to mediaKit store');
      } catch (error) {
        console.error('[Theme Store] ❌ Failed to sync theme reset to mediaKit store:', error);
      }
      
      // Dispatch event for tracking
      document.dispatchEvent(new CustomEvent('gmkb:theme-reset', {
        detail: { themeId: this.activeThemeId }
      }));
    },
    
    // Apply customizations permanently
    applyCustomizations() {
      // Update the media kit store
      const mediaKitStore = useMediaKitStore();
      mediaKitStore.theme = this.activeThemeId;
      mediaKitStore.themeCustomizations = { ...this.tempCustomizations };
      mediaKitStore._trackChange();  // Use _trackChange instead of direct flag
      
      this.hasUnsavedChanges = false;
      
      console.log('[Theme Store] Customizations applied and saved to media kit store');
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
          this.activeThemeId = 'professional_clean';
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

    /**
     * Apply profile branding colors and fonts to the current theme
     * PHASE 3: Branding Integration (2025-12-16)
     *
     * This action reads branding data from ProfileBrandingService and applies
     * it as theme customizations. Does not modify the base theme - only adds
     * customizations on top.
     *
     * @param {Object} options - Options for applying branding
     * @param {boolean} options.colors - Apply profile colors (default: true)
     * @param {boolean} options.fonts - Apply profile fonts (default: true)
     * @returns {Object} Summary of what was applied
     */
    applyProfileBranding(options = {}) {
      const { colors = true, fonts = true } = options;
      const applied = { colors: [], fonts: [] };

      // Ensure service is initialized
      if (!profileBrandingService.hasBrandingData()) {
        console.log('[Theme Store] No profile branding data available');
        return { success: false, reason: 'no_data', applied };
      }

      console.log('[Theme Store] Applying profile branding...');

      // Apply colors from profile branding
      if (colors && profileBrandingService.hasColors()) {
        const themeColors = profileBrandingService.getThemeColors();

        Object.entries(themeColors).forEach(([key, value]) => {
          if (value) {
            this.updateColor(key, value);
            applied.colors.push(key);
          }
        });

        console.log(`[Theme Store] Applied ${applied.colors.length} profile colors:`, applied.colors);
      }

      // Apply fonts from profile branding
      if (fonts && profileBrandingService.hasFonts()) {
        const themeTypography = profileBrandingService.getThemeTypography();

        if (themeTypography.primary_font) {
          const fontFamily = `'${themeTypography.primary_font.family}', ${themeTypography.primary_font.fallback}`;
          this.updateTypography('fontFamily', fontFamily);
          applied.fonts.push('fontFamily');
        }

        if (themeTypography.heading_font) {
          const headingFamily = `'${themeTypography.heading_font.family}', ${themeTypography.heading_font.fallback}`;
          this.updateTypography('headingFamily', headingFamily);
          applied.fonts.push('headingFamily');
        }

        console.log(`[Theme Store] Applied ${applied.fonts.length} profile fonts:`, applied.fonts);
      }

      // Mark as having unsaved changes
      this.hasUnsavedChanges = true;

      // Dispatch event for other systems
      document.dispatchEvent(new CustomEvent('gmkb:profile-branding-applied', {
        detail: { applied }
      }));

      console.log('[Theme Store] Profile branding applied successfully');
      return { success: true, applied };
    },

    /**
     * Get summary of available profile branding
     * Useful for UI to show what can be applied
     * @returns {Object} Summary from ProfileBrandingService
     */
    getProfileBrandingSummary() {
      return profileBrandingService.getBrandingSummary();
    },

    /**
     * Check if profile branding is available
     * @returns {boolean}
     */
    hasProfileBranding() {
      return profileBrandingService.hasBrandingData();
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
      
      // Apply special classes for effects (with correct CSS class names)
      const theme = this.mergedTheme;
      document.body.classList.toggle('gmkb-theme-gradients', theme.effects.gradients);
      document.body.classList.toggle('gmkb-theme-blur', theme.effects.blurEffects);
      
      // Dispatch event for other systems
      document.dispatchEvent(new CustomEvent('gmkb:theme-applied', {
        detail: { theme: this.mergedTheme }
      }));
    },
    
    // Save custom theme to database
    async saveCustomThemeToDatabase(theme) {
      // ROOT FIX: Use REST API instead of admin-ajax (Phase 1 compliant)
      let restUrl = window.gmkbData?.api || window.gmkbData?.restUrl || '/wp-json/';
      const nonce = window.gmkbData?.nonce || window.gmkbData?.restNonce || '';
      
      if (!restUrl) {
        console.error('REST API URL not available');
        return;
      }
      
      // FIX: Check if restUrl already contains gmkb/v1 and handle accordingly
      let endpoint;
      if (restUrl.includes('gmkb/v1')) {
        // API URL already includes the namespace, just add the endpoint
        endpoint = `${restUrl}themes/custom`;
      } else {
        // API URL is just the base REST URL, add namespace and endpoint
        if (!restUrl.endsWith('/')) restUrl += '/';
        endpoint = `${restUrl}gmkb/v1/themes/custom`;
      }
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
          },
          body: JSON.stringify(theme),
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Failed to save theme');
        }
      } catch (error) {
        console.error('Failed to save custom theme:', error);
        throw error;
      }
    },
    
    /**
     * Reset all theme customizations to active theme defaults
     * @returns {boolean} Success status
     */
    resetThemeCustomizations() {
      // NOTE: Theme store doesn't have _saveToHistory() method
      // History tracking is handled by mediaKit store
      
      this.tempCustomizations = {
        colors: {},
        typography: {},
        spacing: {},
        effects: {}
      };
      
      this.hasUnsavedChanges = true;
      
      // Reapply the active theme without customizations
      if (this.activeTheme) {
        ThemeStyleInjector.applyTheme(this.activeTheme, this.activeThemeId);
      }
      
      // Dispatch event for tracking
      document.dispatchEvent(new CustomEvent('gmkb:theme-reset', {
        detail: { themeId: this.activeThemeId }
      }));
      
      console.log(`✅ Reset customizations for theme ${this.activeThemeId}`);
      return true;
    },

    /**
     * Switch to a different theme and reset customizations
     * @param {string} themeId - Target theme ID
     * @returns {boolean} Success status
     */
    switchAndResetTheme(themeId) {
      const theme = this.availableThemes.find(t => t.id === themeId) ||
                    this.customThemes.find(t => t.id === themeId);
      
      if (!theme) {
        console.warn(`Cannot switch to theme ${themeId} - not found`);
        return false;
      }
      
      // NOTE: Theme store doesn't have _saveToHistory() method
      // History tracking is handled by mediaKit store
      
      this.activeThemeId = themeId;
      this.resetThemeCustomizations();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('gmkb:theme-switched', {
        detail: { themeId }
      }));
      
      console.log(`✅ Switched to theme ${themeId}`);
      return true;
    },

    // Load custom themes from database
    async loadCustomThemes() {
      // ROOT FIX: Custom themes endpoint doesn't exist yet in v2 API
      // Skip loading custom themes for now - only use built-in themes from PHP
      // Custom themes feature can be re-enabled once v2 API endpoint is created
      
      if (window.gmkbData?.isDevelopment) {
        console.log('[Theme Store] Custom themes not yet implemented in v2 API');
      }
      
      return; // Skip custom themes for now
      
      /* DISABLED UNTIL v2 API ENDPOINT EXISTS
      let restUrl = window.gmkbData?.api || window.gmkbData?.restUrl || '/wp-json/';
      const nonce = window.gmkbData?.restNonce || window.gmkbData?.nonce || '';
      
      if (!restUrl) {
        if (window.gmkbData?.isDevelopment) {
          console.log('[Theme Store] REST API not configured, custom themes unavailable');
        }
        return;
      }
      
      if (!nonce) {
        if (window.gmkbData?.isDevelopment) {
          console.warn('[Theme Store] No REST nonce available, cannot load custom themes');
        }
        return;
      }
      
      // FIX: Check if restUrl already contains gmkb/v1 and handle accordingly
      let endpoint;
      if (restUrl.includes('gmkb/v1')) {
        endpoint = `${restUrl}themes/custom`;
      } else {
        if (!restUrl.endsWith('/')) restUrl += '/';
        endpoint = `${restUrl}gmkb/v1/themes/custom`;
      }
      
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'X-WP-Nonce': nonce,
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin'
        });
        
        // GEMINI FIX: Handle auth errors gracefully without blocking initialization
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // Auth required but failed - user may not have permission
            if (window.gmkbData?.isDevelopment) {
              console.log('[Theme Store] Custom themes require edit_posts capability');
            }
          } else {
            if (window.gmkbData?.isDevelopment) {
              console.log(`[Theme Store] Custom themes HTTP ${response.status}`);
            }
          }
          return; // Don't block app initialization
        }
        
        const result = await response.json();
        if (result.themes && Array.isArray(result.themes)) {
          this.customThemes = result.themes;
          if (result.themes.length > 0) {
            console.log(`[Theme Store] Loaded ${result.themes.length} custom themes`);
            // Add custom themes to available themes
            result.themes.forEach(customTheme => {
              if (!this.availableThemes.find(t => t.id === customTheme.id)) {
                this.availableThemes.push(customTheme);
              }
            });
          }
        }
      } catch (error) {
        // GEMINI FIX: Silent fallback - custom themes are optional
        if (window.gmkbData?.isDevelopment) {
          console.log('[Theme Store] Custom themes not available:', error.message);
        }
      }
      */
    }
  }
});
