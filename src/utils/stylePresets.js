/**
 * Size-Based Layout Presets (Elementor Style)
 * 
 * Simple, functional spacing presets with clear size names
 * No abstract aesthetic names - just sizes with pixel values
 * 
 * @package Guestify
 * @version 4.0.0
 */

export const STYLE_PRESETS = {
  none: {
    id: 'none',
    name: 'None',
    description: 'No spacing - edge to edge content',
    value: '0px',
    style: {
      spacing: {
        margin: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
        padding: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' }
      },
      background: {
        color: '#ffffff',
        opacity: 100
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: { value: 16, unit: 'px' },
        fontWeight: '400',
        lineHeight: { value: 1.6, unit: 'unitless' },
        color: '#1e293b',
        textAlign: 'left'
      },
      border: {
        width: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
        style: 'none',
        color: '#e5e7eb',
        radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px' }
      },
      effects: {
        boxShadow: 'none'
      }
    }
  },

  small: {
    id: 'small',
    name: 'Small',
    description: 'Compact spacing - 20px padding',
    value: '20px',
    style: {
      spacing: {
        margin: { top: 16, right: 0, bottom: 16, left: 0, unit: 'px' },
        padding: { top: 20, right: 16, bottom: 20, left: 16, unit: 'px' }
      },
      background: {
        color: '#ffffff',
        opacity: 100
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: { value: 14, unit: 'px' },
        fontWeight: '400',
        lineHeight: { value: 1.5, unit: 'unitless' },
        color: '#1e293b',
        textAlign: 'left'
      },
      border: {
        width: { top: 1, right: 0, bottom: 1, left: 0, unit: 'px' },
        style: 'solid',
        color: '#e5e7eb',
        radius: { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4, unit: 'px' }
      },
      effects: {
        boxShadow: 'none'
      }
    }
  },

  medium: {
    id: 'medium',
    name: 'Medium',
    description: 'Balanced spacing - 40px padding',
    value: '40px',
    style: {
      spacing: {
        margin: { top: 32, right: 0, bottom: 32, left: 0, unit: 'px' },
        padding: { top: 40, right: 32, bottom: 40, left: 32, unit: 'px' }
      },
      background: {
        color: '#ffffff',
        opacity: 100
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: { value: 16, unit: 'px' },
        fontWeight: '400',
        lineHeight: { value: 1.6, unit: 'unitless' },
        color: '#1e293b',
        textAlign: 'left'
      },
      border: {
        width: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
        style: 'solid',
        color: '#e5e7eb',
        radius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, unit: 'px' }
      },
      effects: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }
    }
  },

  large: {
    id: 'large',
    name: 'Large',
    description: 'Spacious layout - 64px padding',
    value: '64px',
    style: {
      spacing: {
        margin: { top: 48, right: 0, bottom: 48, left: 0, unit: 'px' },
        padding: { top: 64, right: 48, bottom: 64, left: 48, unit: 'px' }
      },
      background: {
        color: '#ffffff',
        opacity: 100
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: { value: 17, unit: 'px' },
        fontWeight: '400',
        lineHeight: { value: 1.7, unit: 'unitless' },
        color: '#334155',
        textAlign: 'left'
      },
      border: {
        width: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
        style: 'none',
        color: '#e5e7eb',
        radius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px' }
      },
      effects: {
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }
    }
  },

  xlarge: {
    id: 'xlarge',
    name: 'X-Large',
    description: 'Maximum breathing room - 80px padding',
    value: '80px',
    style: {
      spacing: {
        margin: { top: 64, right: 0, bottom: 64, left: 0, unit: 'px' },
        padding: { top: 80, right: 64, bottom: 80, left: 64, unit: 'px' }
      },
      background: {
        color: '#ffffff',
        opacity: 100
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: { value: 18, unit: 'px' },
        fontWeight: '400',
        lineHeight: { value: 1.8, unit: 'unitless' },
        color: '#334155',
        textAlign: 'left'
      },
      border: {
        width: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
        style: 'none',
        color: '#e5e7eb',
        radius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16, unit: 'px' }
      },
      effects: {
        boxShadow: '0 8px 12px rgba(0,0,0,0.05)'
      }
    }
  }
};

/**
 * Get a single preset by ID
 */
export function getPreset(presetId) {
  return STYLE_PRESETS[presetId] || null;
}

/**
 * Get all presets as an array
 */
export function getAllPresets() {
  return Object.values(STYLE_PRESETS);
}

/**
 * Apply a preset to component settings
 * Merges preset styles with existing settings, preserving non-style data
 */
export function applyPresetToSettings(currentSettings, presetId) {
  const preset = getPreset(presetId);
  if (!preset) {
    console.warn(`Preset "${presetId}" not found`);
    return currentSettings;
  }

  return {
    ...currentSettings,
    style: {
      ...currentSettings.style,
      ...preset.style
    }
  };
}

export default {
  STYLE_PRESETS,
  getPreset,
  getAllPresets,
  applyPresetToSettings
};
