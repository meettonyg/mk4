/**
 * Theme Style Injector Service
 * Converts theme.json configuration into CSS variables applied to DOM
 * 
 * CRITICAL SERVICE: Enables proper theme switching and customization
 * 
 * @class ThemeStyleInjector
 * @version 2.0.0
 * @author Media Kit Builder Team
 */

class ThemeStyleInjector {
  constructor() {
    /**
     * Currently applied theme ID
     * @type {string|null}
     */
    this.currentThemeId = null;

    /**
     * Cache of applied CSS variables
     * @type {Object.<string, string>}
     */
    this.appliedVariables = {};

    console.log('✅ ThemeStyleInjector initialized');
  }

  /**
   * Apply theme configuration as CSS variables to DOM
   * 
   * @param {Object} themeData - Theme configuration from theme.json
   * @param {Object} [themeData.typography] - Typography settings
   * @param {Object} [themeData.colors] - Color palette
   * @param {Object} [themeData.spacing] - Spacing values
   * @param {Object} [themeData.effects] - Visual effects
   * @param {string} themeId - Theme identifier (e.g., 'professional_clean')
   * @throws {TypeError} If themeData or themeId is invalid
   */
  applyTheme(themeData, themeId) {
    // Input validation
    if (!themeData || typeof themeData !== 'object') {
      throw new TypeError('ThemeStyleInjector.applyTheme: themeData must be a valid object');
    }

    if (!themeId || typeof themeId !== 'string') {
      throw new TypeError('ThemeStyleInjector.applyTheme: themeId must be a non-empty string');
    }

    try {
      console.log(`🎨 ThemeStyleInjector: Applying theme "${themeId}"`);

      // Get or create theme wrapper element
      const themeWrapper = this.getThemeWrapper();
      themeWrapper.setAttribute('data-gmkb-theme', themeId);

      // Convert theme.json to CSS variables
      const cssVariables = this.generateCSSVariables(themeData);

      // Apply all CSS variables to theme wrapper
      Object.entries(cssVariables).forEach(([property, value]) => {
        themeWrapper.style.setProperty(property, value);
      });

      // Update instance state
      this.currentThemeId = themeId;
      this.appliedVariables = cssVariables;

      console.log(`✅ ThemeStyleInjector: Applied ${Object.keys(cssVariables).length} CSS variables`);

      // Emit custom event for other systems
      this.emitThemeApplied(themeId, cssVariables);

    } catch (error) {
      console.error('❌ ThemeStyleInjector.applyTheme: Failed to apply theme');
      console.error('  Theme ID:', themeId);
      console.error('  Theme data:', themeData);
      console.error('  Error:', error);
      throw error; // Re-throw after logging
    }
  }

  /**
   * Get or create theme wrapper element
   * CRITICAL FIX: ONLY apply theme to preview area, NEVER to body/app
   * 
   * @returns {HTMLElement} Theme wrapper element
   * @throws {Error} If no suitable wrapper element found
   * @private
   */
  getThemeWrapper() {
    // CRITICAL: ONLY allow preview area - prevents theme bleeding into UI
    let themeWrapper = document.querySelector('#media-kit-preview')
                    || document.querySelector('[data-gmkb-theme]')
                    || document.querySelector('.gmkb-frontend-display');

    if (!themeWrapper) {
      throw new Error('ThemeStyleInjector: Preview element (#media-kit-preview) not found in DOM. Theme styles cannot be applied.');
    }

    // SECURITY: Verify we're NOT applying to body/app
    if (themeWrapper === document.body || themeWrapper.id === 'app') {
      console.error('❌ CRITICAL: Theme would apply to body/app - BLOCKED');
      throw new Error('ThemeStyleInjector: Invalid theme wrapper (body/app) - theme scope violation prevented');
    }

    return themeWrapper;
  }

  /**
   * Generate complete CSS variable object from theme configuration
   * 
   * @param {Object} themeData - Theme configuration
   * @returns {Object.<string, string>} CSS variables object
   * @private
   */
  generateCSSVariables(themeData) {
    const vars = {};

    try {
      // Process each theme section
      if (themeData.typography) {
        this.applyTypographyVariables(vars, themeData.typography);
      }

      if (themeData.colors) {
        this.applyColorVariables(vars, themeData.colors);
      }

      if (themeData.spacing) {
        this.applySpacingVariables(vars, themeData.spacing);
      }

      if (themeData.effects) {
        this.applyEffectVariables(vars, themeData.effects);
      }

    } catch (error) {
      console.error('❌ generateCSSVariables: Failed to generate variables');
      console.error('  Theme data:', themeData);
      console.error('  Error:', error);
      throw error;
    }

    return vars;
  }

  /**
   * Apply typography-related CSS variables
   * 
   * @param {Object} vars - Variables object to populate
   * @param {Object} typography - Typography configuration
   * @param {Object} [typography.primary_font] - Primary font config
   * @param {Object} [typography.heading_font] - Heading font config
   * @param {Object} [typography.line_height] - Line height values
   * @param {number} [typography.font_scale] - Font scale multiplier
   * @private
   */
  applyTypographyVariables(vars, typography) {
    if (typography.primary_font) {
      vars['--gmkb-font-primary'] = this.formatFontFamily(typography.primary_font);
    }

    if (typography.heading_font) {
      vars['--gmkb-font-heading'] = this.formatFontFamily(typography.heading_font);
    }

    if (typography.line_height) {
      if (typography.line_height.body) {
        vars['--gmkb-line-height-body'] = typography.line_height.body;
      }
      if (typography.line_height.heading) {
        vars['--gmkb-line-height-heading'] = typography.line_height.heading;
      }
    }

    if (typography.font_scale) {
      vars['--gmkb-font-scale'] = typography.font_scale;
    }
  }

  /**
   * Apply color-related CSS variables
   * 
   * @param {Object} vars - Variables object to populate
   * @param {Object} colors - Color configuration
   * @private
   */
  applyColorVariables(vars, colors) {
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        const varName = `--gmkb-color-${key.replace(/_/g, '-')}`;
        vars[varName] = value;
      }
    });
  }

  /**
   * Apply spacing-related CSS variables
   * 
   * @param {Object} vars - Variables object to populate
   * @param {Object} spacing - Spacing configuration
   * @private
   */
  applySpacingVariables(vars, spacing) {
    Object.entries(spacing).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        const varName = `--gmkb-spacing-${key.replace(/_/g, '-')}`;
        vars[varName] = value;
      }
    });
  }

  /**
   * Apply effect-related CSS variables (shadows, transitions, etc.)
   * 
   * @param {Object} vars - Variables object to populate
   * @param {Object} effects - Effects configuration
   * @private
   */
  applyEffectVariables(vars, effects) {
    Object.entries(effects).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        const varName = `--gmkb-effect-${key.replace(/_/g, '-')}`;
        vars[varName] = value;
      }
    });
  }

  /**
   * Format font family configuration into CSS font-family value
   * 
   * @param {Object} fontConfig - Font configuration
   * @param {string} fontConfig.family - Primary font family
   * @param {string} [fontConfig.fallback] - Fallback fonts
   * @returns {string} CSS font-family value
   * @private
   */
  formatFontFamily(fontConfig) {
    if (!fontConfig || !fontConfig.family) {
      return 'inherit';
    }

    return fontConfig.fallback
      ? `${fontConfig.family}, ${fontConfig.fallback}`
      : fontConfig.family;
  }

  /**
   * Emit custom event when theme is applied
   * Allows other systems to react to theme changes
   * 
   * @param {string} themeId - Applied theme ID
   * @param {Object} variables - Applied CSS variables
   * @private
   */
  emitThemeApplied(themeId, variables) {
    try {
      const event = new CustomEvent('gmkb:theme-applied', {
        detail: { themeId, variables },
        bubbles: true
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.warn('⚠️ ThemeStyleInjector: Could not emit theme-applied event', error);
      // Non-critical error - don't throw
    }
  }

  /**
   * Remove all theme styling and reset to defaults
   */
  clearTheme() {
    try {
      const themeWrapper = document.querySelector('[data-gmkb-theme]');

      if (themeWrapper) {
        // Remove theme attribute
        themeWrapper.removeAttribute('data-gmkb-theme');

        // Remove all applied CSS variables
        Object.keys(this.appliedVariables).forEach(varName => {
          themeWrapper.style.removeProperty(varName);
        });
      }

      // Reset instance state
      this.currentThemeId = null;
      this.appliedVariables = {};

      console.log('✅ ThemeStyleInjector: Theme cleared');

    } catch (error) {
      console.error('❌ ThemeStyleInjector.clearTheme: Failed to clear theme', error);
      // Don't throw - graceful degradation
    }
  }

  /**
   * Get currently applied theme ID
   * 
   * @returns {string|null} Current theme ID or null if no theme applied
   */
  getCurrentTheme() {
    return this.currentThemeId;
  }

  /**
   * Get copy of applied CSS variables
   * 
   * @returns {Object.<string, string>} Copy of applied CSS variables
   */
  getAppliedVariables() {
    return { ...this.appliedVariables };
  }
}

// Export as singleton instance
export default new ThemeStyleInjector();
