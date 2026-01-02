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
  }

  /**
   * Apply section styling (PHASE 6)
   * @param {string} sectionId - Section ID
   * @param {Object} settings - Section settings
   */
  applySectionStyling(sectionId, settings) {
    if (!sectionId || typeof sectionId !== 'string') {
      console.warn('⚠️ Invalid sectionId for applySectionStyling:', sectionId);
      return;
    }

    if (!settings || typeof settings !== 'object') {
      console.warn('⚠️ Invalid settings for applySectionStyling:', settings);
      return;
    }

    try {
      // Generate CSS variables for section
      const css = this.generateSectionCSS(sectionId, settings);

      // Inject or update styles
      this.injectStyles(`section-${sectionId}`, css);
    } catch (error) {
      console.error(`Failed to apply section styles to ${sectionId}:`, error);
    }
  }

  /**
   * Generate section CSS variables (PHASE 6)
   * Section variables cascade to all components within the section
   * @param {string} sectionId - Section ID
   * @param {Object} settings - Section settings
   * @returns {string} CSS string
   */
  generateSectionCSS(sectionId, settings) {
    if (!settings || typeof settings !== 'object') {
      return '';
    }

    const { style } = settings;
    if (!style) {
      return '';
    }

    const vars = [];
    const selector = `[data-section-id="${sectionId}"]`;

    // Section-level typography variables
    if (style.typography) {
      const t = style.typography;
      if (t.fontFamily) vars.push(`--section-font-family: ${t.fontFamily}`);
      if (t.fontSize) vars.push(`--section-font-size: ${t.fontSize.value}${t.fontSize.unit}`);
      if (t.fontWeight) vars.push(`--section-font-weight: ${t.fontWeight}`);
      
      if (t.lineHeight) {
        if (typeof t.lineHeight === 'object' && t.lineHeight.value !== undefined) {
          const lineHeightValue = t.lineHeight.unit === 'unitless' 
            ? t.lineHeight.value
            : `${t.lineHeight.value}${t.lineHeight.unit}`;
          vars.push(`--section-line-height: ${lineHeightValue}`);
        } else if (typeof t.lineHeight === 'number' || typeof t.lineHeight === 'string') {
          vars.push(`--section-line-height: ${t.lineHeight}`);
        }
      }
      
      if (t.color) vars.push(`--section-color: ${t.color}`);
      if (t.textAlign) vars.push(`--section-text-align: ${t.textAlign}`);
    }

    // Section-level spacing variables
    if (style.spacing) {
      if (style.spacing.padding) {
        const p = style.spacing.padding;
        vars.push(`--section-padding: ${p.top}${p.unit} ${p.right}${p.unit} ${p.bottom}${p.unit} ${p.left}${p.unit}`);
      }
    }

    // Section-level background
    if (style.background) {
      if (style.background.color) {
        vars.push(`--section-background-color: ${style.background.color}`);
      }
    }

    if (vars.length === 0) {
      return '';
    }

    return `${selector} {\n  ${vars.join(';\n  ')};\n}`;
  }

  /**
   * Clear section styles
   * @param {string} sectionId - Section ID
   */
  clearSectionStyles(sectionId) {
    const styleKey = `section-${sectionId}`;
    const styleEl = this.styleElements.get(styleKey);
    if (styleEl) {
      styleEl.remove();
      this.styleElements.delete(styleKey);
      this.settingsCache.delete(styleKey);
      
      if (window.gmkbData?.debugMode) {
        console.log(`🗑️ Cleared section styles for ${sectionId}`);
      }
    }
  }

  /**
   * HTML decode a string to prevent double-encoding issues
   * CRITICAL FIX: Decode repeatedly until all HTML entities are removed
   * This fixes the accumulation of &amp; encoding over multiple save cycles
   * @param {string} str - String to decode
   * @returns {string} Decoded string
   */
  htmlDecode(str) {
    if (typeof str !== 'string') return str;
    
    let temp = str;
    const textarea = document.createElement('textarea');
    
    // Keep decoding while there are still HTML entities
    while (temp.includes('&amp;')) {
      textarea.innerHTML = temp;
      temp = textarea.value;
    }
    
    return temp;
  }

  /**
   * Format font family for CSS
   * Adds quotes around font names with spaces, removes HTML encoding
   * @param {string} fontFamily - Font family value from store
   * @returns {string} Properly formatted CSS font-family value
   */
  formatFontFamily(fontFamily) {
    if (!fontFamily || typeof fontFamily !== 'string') return 'inherit';
    
    // First decode any HTML entities
    const decoded = this.htmlDecode(fontFamily);
    
    // Split by comma to handle font stacks (e.g., "Roboto, sans-serif")
    const fonts = decoded.split(',').map(font => font.trim());
    
    // Process each font in the stack
    const formatted = fonts.map(font => {
      // Don't quote generic families (serif, sans-serif, monospace, cursive, fantasy)
      const genericFamilies = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'inherit'];
      if (genericFamilies.includes(font.toLowerCase())) {
        return font;
      }
      
      // If font name has spaces and isn't already quoted, add quotes
      if (font.includes(' ') && !font.startsWith("'") && !font.startsWith('"')) {
        return `'${font}'`;
      }
      
      // If already quoted, remove quotes and re-add to ensure consistency
      const unquoted = font.replace(/^['"]|['"]$/g, '');
      if (unquoted.includes(' ')) {
        return `'${unquoted}'`;
      }
      
      // Single word fonts don't need quotes
      return unquoted;
    });
    
    return formatted.join(', ');
  }

  /**
   * Apply styling to a component
   * @param {string} componentId - Component ID
   * @param {Object} settings - Component settings object
   */
  applyStyling(componentId, settings) {
    if (!componentId || !settings) {
      return;
    }

    try {
      // Generate CSS
      const css = this.generateCSS(componentId, settings);

      // Inject or update styles
      this.injectStyles(componentId, css);

      // Cache settings hash
      const settingsHash = JSON.stringify(settings);
      this.settingsCache.set(componentId, settingsHash);
    } catch (error) {
      console.error(`Failed to apply styles to ${componentId}:`, error);
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
    // Only skip if BOTH style AND advanced are missing
    // Components may have just style or just advanced settings
    if (!style && !advanced) {
      if (window.gmkbData?.debugMode) {
        console.warn(`⚠️ Missing both style and advanced settings for ${componentId}`);
      }
      return '';
    }

    // Safely default to empty objects if one is missing
    const safeStyle = style || {};
    const safeAdvanced = advanced || {};

    const rules = [];

    // PHASE 5: Higher specificity selectors (0,2,1) to beat component base styles (0,1,0)
    // Wrapper = margin only, Component root = everything else
    // ROOT FIX: Support BOTH builder (.component-wrapper) AND frontend (.gmkb-component)
    // Generate CSS for both selectors to ensure styles work everywhere
    const builderWrapperSelector = `.component-wrapper[data-component-id="${componentId}"]`;
    const builderComponentSelector = `.component-wrapper[data-component-id="${componentId}"] .component-root`;
    
    // Frontend uses different class names
    const frontendWrapperSelector = `.gmkb-component[data-component-id="${componentId}"]`;
    const frontendComponentSelector = `.gmkb-component[data-component-id="${componentId}"] .component-root`;
    
    // Combine selectors with comma for both environments
    const wrapperSelector = `${builderWrapperSelector}, ${frontendWrapperSelector}`;
    const componentSelector = `${builderComponentSelector}, ${frontendComponentSelector}`;

    // Build CSS rules
    const wrapperRules = []; // For margin only
    const componentRules = []; // For background, padding, border, typography, effects

    // Spacing (margin & padding) - Apply strategically
    if (safeStyle.spacing) {
      if (safeStyle.spacing.margin) {
        const m = safeStyle.spacing.margin;
        wrapperRules.push(`margin: ${m.top}${m.unit} ${m.right}${m.unit} ${m.bottom}${m.unit} ${m.left}${m.unit}`);
      }
      if (safeStyle.spacing.padding) {
        const p = safeStyle.spacing.padding;
        componentRules.push(`padding: ${p.top}${p.unit} ${p.right}${p.unit} ${p.bottom}${p.unit} ${p.left}${p.unit}`);
      }
    }

    // Background - Apply to component root
    if (safeStyle.background) {
      if (safeStyle.background.color) {
        // CRITICAL FIX: Use CSS variable fallback for theme support
        // If component has custom color, use it
        // If not, fall back to theme variable
        const bgColor = this.htmlDecode(safeStyle.background.color);
        
        // Only apply background if it's not the theme's default background
        // This allows theme colors to show through
        if (bgColor && bgColor !== 'transparent' && bgColor !== '#ffffff') {
          componentRules.push(`background-color: ${bgColor} !important`);
        } else {
          // CRITICAL FIX: Use surface (component bg) not background (page bg)!
          // background = page background
          // surface = component/card background
          componentRules.push(`background-color: var(--gmkb-color-surface, ${bgColor}) !important`);
        }
      }
      if (safeStyle.background.opacity !== undefined && safeStyle.background.opacity !== 100) {
        componentRules.push(`opacity: ${safeStyle.background.opacity / 100}`);
      }
    }

    // Typography (if present) - Apply to component root
    // CRITICAL FIX: Add !important to override component-specific styles
    if (safeStyle.typography) {
      const t = safeStyle.typography;
      // ROOT FIX: Format font family with proper CSS quotes
      if (t.fontFamily) {
        const fontFamily = this.formatFontFamily(t.fontFamily);
        componentRules.push(`font-family: ${fontFamily} !important`);
      }
      if (t.fontSize) componentRules.push(`font-size: ${t.fontSize.value}${t.fontSize.unit} !important`);
      if (t.fontWeight) componentRules.push(`font-weight: ${t.fontWeight} !important`);
      
      // ROOT FIX: Handle lineHeight object/value properly
      if (t.lineHeight) {
        if (typeof t.lineHeight === 'object' && t.lineHeight.value !== undefined) {
          // Object format: { value: 1.6, unit: 'unitless' }
          const lineHeightValue = t.lineHeight.unit === 'unitless' 
            ? t.lineHeight.value  // No unit for unitless
            : `${t.lineHeight.value}${t.lineHeight.unit}`; // Add unit
          componentRules.push(`line-height: ${lineHeightValue} !important`);
        } else if (typeof t.lineHeight === 'number' || typeof t.lineHeight === 'string') {
          // Simple value: 1.6 or '1.6' or '24px'
          componentRules.push(`line-height: ${t.lineHeight} !important`);
        }
        // Otherwise skip invalid lineHeight
      }
      
      // ROOT FIX: HTML decode color to prevent double-encoding
      // CRITICAL FIX: Use theme CSS variable as fallback
      if (t.color) {
        const textColor = this.htmlDecode(t.color);
        // Only apply custom color if it's different from theme defaults
        if (textColor && textColor !== '#1e293b' && textColor !== '#000000') {
          componentRules.push(`color: ${textColor} !important`);
        } else {
          // Use theme variable as fallback
          componentRules.push(`color: var(--gmkb-color-text, ${textColor}) !important`);
        }
      }
      if (t.textAlign) componentRules.push(`text-align: ${t.textAlign} !important`);
    }

    // Border - Apply to component root
    if (safeStyle.border) {
      const b = safeStyle.border;
      
      // Border width
      if (b.width) {
        const hasWidth = b.width.top || b.width.right || b.width.bottom || b.width.left;
        if (hasWidth) {
          componentRules.push(`border-width: ${b.width.top}${b.width.unit} ${b.width.right}${b.width.unit} ${b.width.bottom}${b.width.unit} ${b.width.left}${b.width.unit}`);
          // ROOT FIX: HTML decode color to prevent double-encoding
          if (b.color) componentRules.push(`border-color: ${this.htmlDecode(b.color)}`);
          if (b.style) componentRules.push(`border-style: ${b.style}`);
        }
      }
      
      // Border radius
      if (b.radius) {
        componentRules.push(`border-radius: ${b.radius.topLeft}${b.radius.unit} ${b.radius.topRight}${b.radius.unit} ${b.radius.bottomRight}${b.radius.unit} ${b.radius.bottomLeft}${b.radius.unit}`);
      }
    }

    // Effects - Apply to component root
    // CRITICAL FIX: Add !important to override component-specific styles
    if (safeStyle.effects) {
      if (safeStyle.effects.boxShadow && safeStyle.effects.boxShadow !== 'none') {
        componentRules.push(`box-shadow: ${safeStyle.effects.boxShadow} !important`);
      }
      if (safeStyle.effects.opacity !== undefined && safeStyle.effects.opacity !== 100) {
        componentRules.push(`opacity: ${safeStyle.effects.opacity / 100} !important`);
      }
    }

    // Advanced - Layout (apply to wrapper)
    if (safeAdvanced.layout) {
      const layout = safeAdvanced.layout;
      
      // Width
      if (layout.width) {
        if (layout.width.type === 'full') {
          wrapperRules.push('width: 100%');
        } else if (layout.width.type === 'custom') {
          wrapperRules.push(`width: ${layout.width.value}${layout.width.unit}`);
        }
        // 'auto' doesn't need explicit CSS
      }
      
      // Object Alignment (container positioning)
      if (layout.alignment) {
        if (layout.alignment === 'center') {
          wrapperRules.push('margin-left: auto');
          wrapperRules.push('margin-right: auto');
        } else if (layout.alignment === 'right') {
          wrapperRules.push('margin-left: auto');
        }
        // 'left' is default
      }
      
      // ROOT FIX: Text Alignment (text content alignment)
      // This is separate from object positioning
      if (layout.textAlign) {
        componentRules.push(`text-align: ${layout.textAlign} !important`);
      }
    }

    // Build final CSS rules
    // Apply wrapper rules (margin, width, alignment)
    if (wrapperRules.length > 0) {
      rules.push(`${wrapperSelector} { ${wrapperRules.join('; ')}; }`);
    }
    
    // Apply component rules (background, padding, border, typography, effects)
    if (componentRules.length > 0) {
      rules.push(`${componentSelector} { ${componentRules.join('; ')}; }`);
    }

    // Responsive visibility
    if (safeAdvanced.responsive) {
      const resp = safeAdvanced.responsive;
      
      // Mobile (max-width: 767px)
      if (resp.hideOnMobile) {
        rules.push(`@media (max-width: 767px) { ${wrapperSelector} { display: none !important; } }`);
      }
      
      // Tablet (768px - 1024px)
      if (resp.hideOnTablet) {
        rules.push(`@media (min-width: 768px) and (max-width: 1024px) { ${wrapperSelector} { display: none !important; } }`);
      }
      
      // Desktop (min-width: 1025px)
      if (resp.hideOnDesktop) {
        rules.push(`@media (min-width: 1025px) { ${wrapperSelector} { display: none !important; } }`);
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
      return;
    }

    Object.entries(components).forEach(([componentId, component]) => {
      if (component.settings) {
        this.applyStyling(componentId, component.settings);
      }
    });
  }

  /**
   * Clear all styles (for cleanup)
   */
  clearAll() {
    this.styleElements.forEach((styleEl) => {
      styleEl.remove();
    });

    this.styleElements.clear();
    this.settingsCache.clear();
  }

  /**
   * Get all component CSS as a single string
   * Used for saving to database so frontend can render styles
   * @param {Object} components - Components object from store
   * @returns {string} Combined CSS for all components
   */
  getAllCSS(components) {
    if (!components || typeof components !== 'object') {
      return '';
    }

    const cssRules = [];

    Object.entries(components).forEach(([componentId, component]) => {
      if (component.settings) {
        const css = this.generateCSS(componentId, component.settings);
        if (css) {
          cssRules.push(`/* Component: ${componentId} (${component.type || 'unknown'}) */`);
          cssRules.push(css);
          cssRules.push('');
        }
      }
    });

    return cssRules.join('\n');
  }

  /**
   * Get all section CSS as a single string
   * @param {Array} sections - Sections array from store
   * @returns {string} Combined CSS for all sections
   */
  getAllSectionCSS(sections) {
    if (!Array.isArray(sections)) {
      return '';
    }

    const cssRules = [];

    // Add layout CSS rules first (needed for frontend rendering)
    cssRules.push(this.generateLayoutCSS());
    cssRules.push('');

    sections.forEach(section => {
      // Generate section settings CSS
      if (section.settings) {
        const css = this.generateSectionCSS(section.section_id, section.settings);
        if (css) {
          cssRules.push(`/* Section: ${section.section_id} */`);
          cssRules.push(css);
          cssRules.push('');
        }
      }
    });

    return cssRules.join('\n');
  }

  /**
   * Generate layout CSS rules for frontend rendering
   * These replicate the scoped styles from SectionLayoutEnhanced.vue
   * @returns {string} CSS string with layout rules
   */
  generateLayoutCSS() {
    return `/* Layout CSS - Required for frontend grid layouts */
.layout-full-width {
  display: block;
}

.layout-two-column,
.layout-two_column {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.layout-three-column,
.layout-three_column {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.layout-main-sidebar {
  display: grid;
  grid-template-columns: 7fr 3fr;
}

.layout-sidebar-main {
  display: grid;
  grid-template-columns: 3fr 7fr;
}

/* Section column styling */
.gmkb-section__column {
  min-height: 50px;
}

/* Responsive: Stack columns on mobile */
@media (max-width: 768px) {
  .layout-two-column,
  .layout-two_column,
  .layout-three-column,
  .layout-three_column,
  .layout-main-sidebar,
  .layout-sidebar-main {
    grid-template-columns: 1fr;
  }

  .gmkb-section__column {
    width: 100%;
  }
}`;
  }

  /**
   * DEBUG: Output component settings from store
   * Usage: window.GMKB.services.componentStyle.debugSettings('component-id')
   * @param {string} componentId - Component ID to debug
   */
  debugSettings(componentId) {
    // ROOT FIX: Access store via GMKB namespace (support both old and new structure)
    const store = window.GMKB?.stores?.mediaKit || window.GMKB?.store;
    if (!store) {
      console.error('❌ Store not available. Make sure you\'re in the builder.');
      console.log('💡 TIP: Store should be at window.GMKB.stores.mediaKit or window.GMKB.store');
      console.log('💡 Current GMKB:', window.GMKB);
      return;
    }

    const component = store.components[componentId];
    if (!component) {
      console.error(`❌ Component ${componentId} not found in store`);
      console.log('Available components:', Object.keys(store.components));
      return;
    }

    console.group(`🔍 Settings Debug for ${componentId}`);
    console.log('Full Component:', component);
    console.log('Settings Object:', component.settings);
    
    if (component.settings && component.settings.style) {
      console.group('📐 Style Settings');
      console.log('Spacing:', component.settings.style.spacing);
      console.log('Background:', component.settings.style.background);
      console.log('Typography:', component.settings.style.typography);
      console.log('Border:', component.settings.style.border);
      console.log('Effects:', component.settings.style.effects);
      console.groupEnd();
    }
    
    if (component.settings && component.settings.advanced) {
      console.group('⚙️ Advanced Settings');
      console.log('Layout:', component.settings.advanced.layout);
      console.log('Responsive:', component.settings.advanced.responsive);
      console.log('Custom:', component.settings.advanced.custom);
      console.groupEnd();
    }
    
    // Output as copyable JSON
    console.group('📋 Copyable JSON');
    console.log(JSON.stringify(component.settings, null, 2));
    console.groupEnd();
    
    console.groupEnd();
    
    return component.settings;
  }

  /**
   * DEBUG: Output computed styles from DOM
   * Usage: window.GMKB.services.componentStyle.debugRendered('component-id')
   * @param {string} componentId - Component ID to debug
   */
  debugRendered(componentId) {
    const wrapper = document.querySelector(`[data-component-id="${componentId}"]`);
    const componentRoot = document.querySelector(`[data-component-id="${componentId}"] .component-root`);
    
    if (!wrapper) {
      console.error(`❌ Component wrapper [data-component-id="${componentId}"] not found in DOM`);
      return;
    }

    console.group(`🖼️ Rendered Styles for ${componentId}`);
    
    console.group('📦 Wrapper Element');
    console.log('Element:', wrapper);
    const wrapperStyles = window.getComputedStyle(wrapper);
    const marginData = {
      top: wrapperStyles.marginTop,
      right: wrapperStyles.marginRight,
      bottom: wrapperStyles.marginBottom,
      left: wrapperStyles.marginLeft
    };
    console.log('Margin:', marginData);
    console.log('Width:', wrapperStyles.width);
    console.log('Display:', wrapperStyles.display);
    console.groupEnd();
    
    if (componentRoot) {
      console.group('🎯 Component Root Element');
      console.log('Element:', componentRoot);
      const rootStyles = window.getComputedStyle(componentRoot);
      
      const paddingData = {
        top: rootStyles.paddingTop,
        right: rootStyles.paddingRight,
        bottom: rootStyles.paddingBottom,
        left: rootStyles.paddingLeft
      };
      console.log('Padding:', paddingData);
      
      const bgData = {
        color: rootStyles.backgroundColor,
        opacity: rootStyles.opacity
      };
      console.log('Background:', bgData);
      
      const typographyData = {
        fontFamily: rootStyles.fontFamily,
        fontSize: rootStyles.fontSize,
        fontWeight: rootStyles.fontWeight,
        lineHeight: rootStyles.lineHeight,
        color: rootStyles.color,
        textAlign: rootStyles.textAlign
      };
      console.log('Typography:', typographyData);
      
      const borderData = {
        width: {
          top: rootStyles.borderTopWidth,
          right: rootStyles.borderRightWidth,
          bottom: rootStyles.borderBottomWidth,
          left: rootStyles.borderLeftWidth
        },
        style: rootStyles.borderStyle,
        color: rootStyles.borderColor,
        radius: rootStyles.borderRadius
      };
      console.log('Border:', borderData);
      
      const effectsData = {
        boxShadow: rootStyles.boxShadow
      };
      console.log('Effects:', effectsData);
      
      // Output as copyable JSON
      console.group('📋 Copyable JSON');
      console.log(JSON.stringify({
        margin: marginData,
        padding: paddingData,
        background: bgData,
        typography: typographyData,
        border: borderData,
        effects: effectsData
      }, null, 2));
      console.groupEnd();
      
      console.groupEnd();
    } else {
      console.warn('⚠️ No .component-root element found. Component may not be using V2 architecture.');
    }
    
    // Show injected style tag
    const styleTag = document.getElementById(`component-styles-${componentId}`);
    if (styleTag) {
      console.group('📝 Injected CSS');
      console.log('Style Tag:', styleTag);
      console.log('CSS Content:');
      console.log(styleTag.textContent);
      console.groupEnd();
    } else {
      console.warn('⚠️ No injected style tag found for this component');
    }
    
    console.groupEnd();
    
    return {
      wrapper: wrapper,
      componentRoot: componentRoot,
      styleTag: styleTag
    };
  }

  /**
   * DEBUG: Compare settings vs rendered
   * Usage: window.GMKB.services.componentStyle.debugCompare('component-id')
   * @param {string} componentId - Component ID to debug
   */
  debugCompare(componentId) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔬 COMPREHENSIVE DEBUG: ${componentId}`);
    console.log(`${'='.repeat(80)}\n`);
    
    const settings = this.debugSettings(componentId);
    const rendered = this.debugRendered(componentId);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Debug complete. Check the groups above for details.');
    console.log('\n📝 INSTRUCTIONS:');
    console.log('1. Expand the "Settings Debug" group above to see settings from the store');
    console.log('2. Expand the "Rendered Styles" group above to see computed DOM styles');
    console.log('3. Compare the "Copyable JSON" sections to identify mismatches');
    console.log('4. Settings should match what you see in the Bio panel');
    console.log('5. Rendered should match what you see in the frontend');
    console.log('='.repeat(80) + '\n');
    
    return { settings, rendered };
  }

  /**
   * DEBUG: List all components with styles
   * Usage: window.GMKB.services.componentStyle.debugList()
   */
  debugList() {
    console.group('📋 All Components with Styles');
    
    // ROOT FIX: Access store via GMKB namespace (support both old and new structure)
    const store = window.GMKB?.stores?.mediaKit || window.GMKB?.store;
    if (!store) {
      console.error('❌ Store not available');
      console.log('💡 TIP: Store should be at window.GMKB.stores.mediaKit or window.GMKB.store');
      console.log('💡 Current GMKB:', window.GMKB);
      console.groupEnd();
      return;
    }
    
    const components = store.components;
    console.log(`Found ${Object.keys(components).length} components in store`);
    console.log(`${this.styleElements.size} have injected styles`);
    
    console.table(
      Object.entries(components).map(([id, component]) => ({
        'Component ID': id,
        'Type': component.type,
        'Has Settings': !!component.settings,
        'Has Styles': this.styleElements.has(id),
        'Visible': component.visible !== false
      }))
    );
    
    console.groupEnd();
    
    return Object.keys(components);
  }
}

// Create singleton instance
const componentStyleService = new ComponentStyleService();

// Make globally available
if (typeof window !== 'undefined') {
  if (!window.GMKB) window.GMKB = {};
  if (!window.GMKB.services) window.GMKB.services = {};
  window.GMKB.services.componentStyle = componentStyleService;
  
  // Add convenient global debug commands
  window.debugComponentSettings = (id) => componentStyleService.debugSettings(id);
  window.debugComponentRendered = (id) => componentStyleService.debugRendered(id);
  window.debugComponentCompare = (id) => componentStyleService.debugCompare(id);
  window.debugComponentList = () => componentStyleService.debugList();
  
  // Add helper to get Bio component ID
  window.debugBioComponent = () => {
    // ROOT FIX: Access store via GMKB namespace (support both old and new structure)
    const store = window.GMKB?.stores?.mediaKit || window.GMKB?.store;
    if (!store) {
      console.error('❌ Store not available');
      console.log('💡 TIP: Store should be at window.GMKB.stores.mediaKit or window.GMKB.store');
      console.log('💡 Current window.GMKB:', window.GMKB);
      return;
    }
    
    // Find biography component
    const bioComp = Object.entries(store.components).find(
      ([id, comp]) => comp.type === 'biography'
    );
    
    if (!bioComp) {
      console.error('❌ No Biography component found');
      console.log('Available components:', Object.keys(store.components));
      return;
    }
    
    const bioId = bioComp[0];
    console.log(`✅ Found Biography component: ${bioId}`);
    console.log('\nUsing this ID to run debug commands:\n');
    return componentStyleService.debugCompare(bioId);
  };
  
  console.log('\n🔧 Component Style Debug Commands Available:');
  console.log('  debugComponentList()                  - List all components');
  console.log('  debugComponentSettings("component-id") - Show settings from store');
  console.log('  debugComponentRendered("component-id") - Show computed DOM styles');
  console.log('  debugComponentCompare("component-id")  - Compare settings vs DOM');
  console.log('  debugBioComponent()                   - Quick debug for Biography component\n');
}

export default componentStyleService;
