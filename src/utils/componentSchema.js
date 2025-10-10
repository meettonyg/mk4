/**
 * Component Settings Schema
 * Defines the universal structure for all component settings
 * NO LEGACY SUPPORT - Clean schema for new system
 */

/**
 * Default settings structure that ALL components must follow
 */
export const DEFAULT_SETTINGS = {
  style: {
    spacing: {
      margin: {
        top: 32,
        right: 0,
        bottom: 32,
        left: 0,
        unit: 'px'
      },
      padding: {
        top: 40,
        right: 20,
        bottom: 40,
        left: 20,
        unit: 'px'
      }
    },
    background: {
      color: '#ffffff',
      opacity: 100
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: {
        value: 16,
        unit: 'px'
      },
      fontWeight: '400',
      lineHeight: {
        value: 1.6,
        unit: 'unitless'
      },
      color: '#1e293b',
      textAlign: 'left'
    },
    border: {
      width: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        unit: 'px'
      },
      color: '#e5e7eb',
      style: 'solid',
      radius: {
        topLeft: 8,
        topRight: 8,
        bottomRight: 8,
        bottomLeft: 8,
        unit: 'px'
      }
    },
    effects: {
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      opacity: 100
    }
  },
  advanced: {
    layout: {
      width: {
        type: 'auto',
        value: 100,
        unit: '%'
      },
      alignment: 'left'
    },
    responsive: {
      hideOnMobile: false,
      hideOnTablet: false,
      hideOnDesktop: false
    },
    custom: {
      cssClasses: '',
      cssId: '',
      attributes: {}
    }
  }
};

/**
 * Spacing presets for quick application
 */
export const SPACING_PRESETS = {
  none: {
    margin: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
    padding: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' }
  },
  small: {
    margin: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' },
    padding: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' }
  },
  medium: {
    margin: { top: 16, right: 16, bottom: 16, left: 16, unit: 'px' },
    padding: { top: 16, right: 16, bottom: 16, left: 16, unit: 'px' }
  },
  large: {
    margin: { top: 24, right: 24, bottom: 24, left: 24, unit: 'px' },
    padding: { top: 24, right: 24, bottom: 24, left: 24, unit: 'px' }
  },
  xlarge: {
    margin: { top: 32, right: 32, bottom: 32, left: 32, unit: 'px' },
    padding: { top: 32, right: 32, bottom: 32, left: 32, unit: 'px' }
  }
};

/**
 * Typography presets
 */
export const TYPOGRAPHY_PRESETS = {
  body: {
    fontFamily: 'inherit',
    fontSize: { value: 16, unit: 'px' },
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#000000',
    textAlign: 'left'
  },
  heading1: {
    fontFamily: 'inherit',
    fontSize: { value: 32, unit: 'px' },
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#000000',
    textAlign: 'left'
  },
  heading2: {
    fontFamily: 'inherit',
    fontSize: { value: 24, unit: 'px' },
    fontWeight: 600,
    lineHeight: 1.3,
    color: '#000000',
    textAlign: 'left'
  },
  heading3: {
    fontFamily: 'inherit',
    fontSize: { value: 20, unit: 'px' },
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#000000',
    textAlign: 'left'
  },
  small: {
    fontFamily: 'inherit',
    fontSize: { value: 14, unit: 'px' },
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#000000',
    textAlign: 'left'
  }
};

/**
 * Get default settings (deep clone to prevent mutations)
 */
export function getDefaultSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

/**
 * Deep merge user settings with defaults
 * @param {Object} userSettings - User's custom settings
 * @returns {Object} Merged settings with defaults
 */
export function mergeWithDefaults(userSettings = {}) {
  const defaults = getDefaultSettings();
  
  return deepMerge(defaults, userSettings);
}

/**
 * Deep merge helper
 */
function deepMerge(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
}

/**
 * Check if value is a plain object
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Get component-specific defaults based on type
 * Components with text get typography settings, others don't
 */
export function getComponentDefaults(componentType) {
  const defaults = getDefaultSettings();
  
  // Components without text don't need typography
  const nonTextComponents = [
    'photo-gallery',
    'logo-grid',
    'video-intro',
    'podcast-player',
    'booking-calendar',
    'social'
  ];
  
  if (nonTextComponents.includes(componentType)) {
    delete defaults.style.typography;
  }
  
  return defaults;
}

/**
 * Validate settings structure
 * @param {Object} settings - Settings to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateSettings(settings) {
  const errors = [];
  
  if (!settings || typeof settings !== 'object') {
    errors.push('Settings must be an object');
    return { valid: false, errors };
  }
  
  // Validate style section
  if (!settings.style || typeof settings.style !== 'object') {
    errors.push('Settings must have a style object');
  }
  
  // Validate advanced section
  if (!settings.advanced || typeof settings.advanced !== 'object') {
    errors.push('Settings must have an advanced object');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Apply preset to settings
 */
export function applyPreset(settings, presetType, presetName) {
  const newSettings = { ...settings };
  
  switch (presetType) {
    case 'spacing':
      if (SPACING_PRESETS[presetName]) {
        newSettings.style.spacing = { ...SPACING_PRESETS[presetName] };
      }
      break;
      
    case 'typography':
      if (TYPOGRAPHY_PRESETS[presetName]) {
        newSettings.style.typography = { ...TYPOGRAPHY_PRESETS[presetName] };
      }
      break;
  }
  
  return newSettings;
}
