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

    // V2 ARCHITECTURE: Simplified selectors - target component-root directly
    // Wrapper = margin only, Component root = everything else
    const wrapperSelector = `[data-component-id="${componentId}"]`;
    const componentSelector = `[data-component-id="${componentId}"] .component-root`;

    // Build CSS rules
    const wrapperRules = []; // For margin only
    const componentRules = []; // For background, padding, border, typography, effects

    // Spacing (margin & padding) - Apply strategically
    if (style.spacing) {
      if (style.spacing.margin) {
        const m = style.spacing.margin;
        wrapperRules.push(`margin: ${m.top}${m.unit} ${m.right}${m.unit} ${m.bottom}${m.unit} ${m.left}${m.unit}`);
      }
      if (style.spacing.padding) {
        const p = style.spacing.padding;
        componentRules.push(`padding: ${p.top}${p.unit} ${p.right}${p.unit} ${p.bottom}${p.unit} ${p.left}${p.unit}`);
      }
    }

    // Background - Apply to component root
    if (style.background) {
      if (style.background.color) {
        componentRules.push(`background-color: ${style.background.color} !important`);
      }
      if (style.background.opacity !== undefined && style.background.opacity !== 100) {
        componentRules.push(`opacity: ${style.background.opacity / 100}`);
      }
    }

    // Typography (if present) - Apply to component root
    if (style.typography) {
      const t = style.typography;
      if (t.fontFamily) componentRules.push(`font-family: ${t.fontFamily}`);
      if (t.fontSize) componentRules.push(`font-size: ${t.fontSize.value}${t.fontSize.unit}`);
      if (t.fontWeight) componentRules.push(`font-weight: ${t.fontWeight}`);
      if (t.lineHeight) componentRules.push(`line-height: ${t.lineHeight}`);
      if (t.color) componentRules.push(`color: ${t.color}`);
      if (t.textAlign) componentRules.push(`text-align: ${t.textAlign}`);
    }

    // Border - Apply to component root
    if (style.border) {
      const b = style.border;
      
      // Border width
      if (b.width) {
        const hasWidth = b.width.top || b.width.right || b.width.bottom || b.width.left;
        if (hasWidth) {
          componentRules.push(`border-width: ${b.width.top}${b.width.unit} ${b.width.right}${b.width.unit} ${b.width.bottom}${b.width.unit} ${b.width.left}${b.width.unit}`);
          if (b.color) componentRules.push(`border-color: ${b.color}`);
          if (b.style) componentRules.push(`border-style: ${b.style}`);
        }
      }
      
      // Border radius
      if (b.radius) {
        componentRules.push(`border-radius: ${b.radius.topLeft}${b.radius.unit} ${b.radius.topRight}${b.radius.unit} ${b.radius.bottomRight}${b.radius.unit} ${b.radius.bottomLeft}${b.radius.unit}`);
      }
    }

    // Effects - Apply to component root
    if (style.effects) {
      if (style.effects.boxShadow && style.effects.boxShadow !== 'none') {
        componentRules.push(`box-shadow: ${style.effects.boxShadow}`);
      }
      if (style.effects.opacity !== undefined && style.effects.opacity !== 100) {
        componentRules.push(`opacity: ${style.effects.opacity / 100}`);
      }
    }

    // Advanced - Layout (apply to wrapper)
    if (advanced.layout) {
      const layout = advanced.layout;
      
      // Width
      if (layout.width) {
        if (layout.width.type === 'full') {
          wrapperRules.push('width: 100%');
        } else if (layout.width.type === 'custom') {
          wrapperRules.push(`width: ${layout.width.value}${layout.width.unit}`);
        }
        // 'auto' doesn't need explicit CSS
      }
      
      // Alignment
      if (layout.alignment) {
        if (layout.alignment === 'center') {
          wrapperRules.push('margin-left: auto');
          wrapperRules.push('margin-right: auto');
        } else if (layout.alignment === 'right') {
          wrapperRules.push('margin-left: auto');
        }
        // 'left' is default
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
    if (advanced.responsive) {
      const resp = advanced.responsive;
      
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
