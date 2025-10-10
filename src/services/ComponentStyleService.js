/**
 * Component Style Service
 * Applies component settings as CSS to live preview
 * CRITICAL: Never use localStorage or sessionStorage
 */

class ComponentStyleService {
  constructor() {
    // Map of componentId → <style> element
    this.styleElements = new Map();
    
    // Map of componentId → current settings hash (for change detection)
    this.settingsCache = new Map();
    
    console.log('✅ ComponentStyleService initialized');
  }

  /**
   * Apply styling to a component
   * @param {string} componentId - Component ID
   * @param {Object} settings - Component settings object
   */
  applyStyling(componentId, settings) {
    if (!componentId || !settings) {
      console.warn('⚠️ Invalid parameters for applyStyling:', { componentId, settings });
      return;
    }

    try {
      // Check if settings actually changed (optimization)
      const settingsHash = JSON.stringify(settings);
      if (this.settingsCache.get(componentId) === settingsHash) {
        // No changes, skip update
        return;
      }
      
      // Generate CSS
      const css = this.generateCSS(componentId, settings);
      
      // Inject or update styles
      this.injectStyles(componentId, css);
      
      // Cache settings hash
      this.settingsCache.set(componentId, settingsHash);
      
      if (window.gmkbData?.debugMode) {
        console.log(`🎨 Applied styles to component ${componentId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to apply styles to ${componentId}:`, error);
    }
  }

  /**
   * Generate CSS string from settings
   * @param {string} componentId - Component ID
   * @param {Object} settings - Settings object
   * @returns {string} CSS string
   */
  generateCSS(componentId, settings) {
    // CRITICAL FIX: Handle invalid settings (like empty arrays)
    if (!settings || Array.isArray(settings) || typeof settings !== 'object') {
      if (window.gmkbData?.debugMode) {
        console.warn(`⚠️ Invalid settings for ${componentId}, skipping styles`);
      }
      return '';
    }
    
    const { style, advanced } = settings;
    if (!style || !advanced) {
      if (window.gmkbData?.debugMode) {
        console.warn(`⚠️ Missing style or advanced settings for ${componentId}`);
      }
      return '';
    }

    const rules = [];

    // Base selector
    const selector = `[data-component-id="${componentId}"]`;

    // Build CSS rules
    const baseRules = [];

    // Spacing (margin & padding)
    if (style.spacing) {
      if (style.spacing.margin) {
        const m = style.spacing.margin;
        baseRules.push(`margin: ${m.top}${m.unit} ${m.right}${m.unit} ${m.bottom}${m.unit} ${m.left}${m.unit}`);
      }
      if (style.spacing.padding) {
        const p = style.spacing.padding;
        baseRules.push(`padding: ${p.top}${p.unit} ${p.right}${p.unit} ${p.bottom}${p.unit} ${p.left}${p.unit}`);
      }
    }

    // Background
    if (style.background) {
      if (style.background.color) {
        baseRules.push(`background-color: ${style.background.color}`);
      }
      if (style.background.opacity !== undefined && style.background.opacity !== 100) {
        baseRules.push(`opacity: ${style.background.opacity / 100}`);
      }
    }

    // Typography (if present)
    if (style.typography) {
      const t = style.typography;
      if (t.fontFamily) baseRules.push(`font-family: ${t.fontFamily}`);
      if (t.fontSize) baseRules.push(`font-size: ${t.fontSize.value}${t.fontSize.unit}`);
      if (t.fontWeight) baseRules.push(`font-weight: ${t.fontWeight}`);
      if (t.lineHeight) baseRules.push(`line-height: ${t.lineHeight}`);
      if (t.color) baseRules.push(`color: ${t.color}`);
      if (t.textAlign) baseRules.push(`text-align: ${t.textAlign}`);
    }

    // Border
    if (style.border) {
      const b = style.border;
      
      // Border width
      if (b.width) {
        const hasWidth = b.width.top || b.width.right || b.width.bottom || b.width.left;
        if (hasWidth) {
          baseRules.push(`border-width: ${b.width.top}${b.width.unit} ${b.width.right}${b.width.unit} ${b.width.bottom}${b.width.unit} ${b.width.left}${b.width.unit}`);
          if (b.color) baseRules.push(`border-color: ${b.color}`);
          if (b.style) baseRules.push(`border-style: ${b.style}`);
        }
      }
      
      // Border radius
      if (b.radius) {
        baseRules.push(`border-radius: ${b.radius.topLeft}${b.radius.unit} ${b.radius.topRight}${b.radius.unit} ${b.radius.bottomRight}${b.radius.unit} ${b.radius.bottomLeft}${b.radius.unit}`);
      }
    }

    // Effects
    if (style.effects) {
      if (style.effects.boxShadow && style.effects.boxShadow !== 'none') {
        baseRules.push(`box-shadow: ${style.effects.boxShadow}`);
      }
      if (style.effects.opacity !== undefined && style.effects.opacity !== 100) {
        baseRules.push(`opacity: ${style.effects.opacity / 100}`);
      }
    }

    // Advanced - Layout
    if (advanced.layout) {
      const layout = advanced.layout;
      
      // Width
      if (layout.width) {
        if (layout.width.type === 'full') {
          baseRules.push('width: 100%');
        } else if (layout.width.type === 'custom') {
          baseRules.push(`width: ${layout.width.value}${layout.width.unit}`);
        }
        // 'auto' doesn't need explicit CSS
      }
      
      // Alignment
      if (layout.alignment) {
        if (layout.alignment === 'center') {
          baseRules.push('margin-left: auto');
          baseRules.push('margin-right: auto');
        } else if (layout.alignment === 'right') {
          baseRules.push('margin-left: auto');
        }
        // 'left' is default
      }
    }

    // Build main rule
    if (baseRules.length > 0) {
      rules.push(`${selector} { ${baseRules.join('; ')}; }`);
    }

    // Responsive visibility
    if (advanced.responsive) {
      const resp = advanced.responsive;
      
      // Mobile (max-width: 767px)
      if (resp.hideOnMobile) {
        rules.push(`@media (max-width: 767px) { ${selector} { display: none !important; } }`);
      }
      
      // Tablet (768px - 1024px)
      if (resp.hideOnTablet) {
        rules.push(`@media (min-width: 768px) and (max-width: 1024px) { ${selector} { display: none !important; } }`);
      }
      
      // Desktop (min-width: 1025px)
      if (resp.hideOnDesktop) {
        rules.push(`@media (min-width: 1025px) { ${selector} { display: none !important; } }`);
      }
    }

    return rules.join('\n');
  }

  /**
   * Inject or update styles in DOM
   * @param {string} componentId - Component ID
   * @param {string} css - CSS string
   */
  injectStyles(componentId, css) {
    let styleEl = this.styleElements.get(componentId);

    if (!styleEl) {
      // Create new style element
      styleEl = document.createElement('style');
      styleEl.id = `component-styles-${componentId}`;
      styleEl.setAttribute('data-component-id', componentId);
      document.head.appendChild(styleEl);
      this.styleElements.set(componentId, styleEl);
    }

    // Update styles
    styleEl.textContent = css;
  }

  /**
   * Clear styles for a component
   * @param {string} componentId - Component ID
   */
  clearStyles(componentId) {
    const styleEl = this.styleElements.get(componentId);
    if (styleEl) {
      styleEl.remove();
      this.styleElements.delete(componentId);
      this.settingsCache.delete(componentId);
      
      if (window.gmkbData?.debugMode) {
        console.log(`🗑️ Cleared styles for component ${componentId}`);
      }
    }
  }

  /**
   * Watch component for changes and auto-apply styles
   * @param {string} componentId - Component ID
   * @param {Object} store - Pinia store instance
   */
  watchComponent(componentId, store) {
    if (!store) {
      console.warn('⚠️ Store not provided for watchComponent');
      return;
    }

    // Watch the component's settings
    store.$subscribe((mutation, state) => {
      const component = state.components[componentId];
      if (component && component.settings) {
        this.applyStyling(componentId, component.settings);
      }
    });
  }

  /**
   * Initialize all existing components with their styles
   * @param {Object} components - Components object from store
   */
  initializeAll(components) {
    if (!components || typeof components !== 'object') {
      console.warn('⚠️ Invalid components object');
      return;
    }

    let count = 0;
    Object.entries(components).forEach(([componentId, component]) => {
      if (component.settings) {
        this.applyStyling(componentId, component.settings);
        count++;
      }
    });

    console.log(`✅ Initialized ${count} component styles`);
  }

  /**
   * Clear all styles (for cleanup)
   */
  clearAll() {
    this.styleElements.forEach((styleEl, componentId) => {
      styleEl.remove();
    });
    
    this.styleElements.clear();
    this.settingsCache.clear();
    
    console.log('🗑️ Cleared all component styles');
  }
}

// Create singleton instance
const componentStyleService = new ComponentStyleService();

// Make globally available
if (typeof window !== 'undefined') {
  if (!window.GMKB) window.GMKB = {};
  if (!window.GMKB.services) window.GMKB.services = {};
  window.GMKB.services.componentStyle = componentStyleService;
}

export default componentStyleService;
