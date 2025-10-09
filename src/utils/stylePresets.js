/**
 * Style Presets for Component Editor
 * 
 * Pre-defined style configurations that can be applied with one click
 * 
 * @package Guestify
 * @version 4.0.0
 */

export const STYLE_PRESETS = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design with subtle shadows',
    icon: '✨',
    category: 'professional',
    style: {
      spacing: {
        margin: { top: 32, right: 0, bottom: 32, left: 0, unit: 'px' },
        padding: { top: 48, right: 32, bottom: 48, left: 32, unit: 'px' }
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
        radius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, unit: 'px' }
      },
      effects: {
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }
    }
  },

  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional design with borders and structure',
    icon: '📰',
    category: 'professional',
    style: {
      spacing: {
        margin: { top: 24, right: 0, bottom: 24, left: 0, unit: 'px' },
        padding: { top: 32, right: 24, bottom: 32, left: 24, unit: 'px' }
      },
      background: {
        color: '#f8fafc',
        opacity: 100
      },
      typography: {
        fontFamily: 'Georgia, serif',
        fontSize: { value: 16, unit: 'px' },
        fontWeight: '400',
        lineHeight: { value: 1.7, unit: 'unitless' },
        color: '#334155',
        textAlign: 'left'
      },
      border: {
        width: { top: 1, right: 1, bottom: 1, left: 1, unit: 'px' },
        style: 'solid',
        color: '#cbd5e1',
        radius: { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4, unit: 'px' }
      },
      effects: {
        boxShadow: 'none'
      }
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Less is more - clean and spacious',
    icon: '⚪',
    category: 'creative',
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
        fontSize: { value: 15, unit: 'px' },
        fontWeight: '300',
        lineHeight: { value: 1.8, unit: 'unitless' },
        color: '#475569',
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

  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Strong, attention-grabbing design',
    icon: '💪',
    category: 'creative',
    style: {
      spacing: {
        margin: { top: 40, right: 0, bottom: 40, left: 0, unit: 'px' },
        padding: { top: 56, right: 40, bottom: 56, left: 40, unit: 'px' }
      },
      background: {
        color: '#1e293b',
        opacity: 100
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: { value: 18, unit: 'px' },
        fontWeight: '700',
        lineHeight: { value: 1.5, unit: 'unitless' },
        color: '#ffffff',
        textAlign: 'left'
      },
      border: {
        width: { top: 4, right: 4, bottom: 4, left: 4, unit: 'px' },
        style: 'solid',
        color: '#3b82f6',
        radius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, unit: 'px' }
      },
      effects: {
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
      }
    }
  },

  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated and refined',
    icon: '👔',
    category: 'professional',
    style: {
      spacing: {
        margin: { top: 36, right: 0, bottom: 36, left: 0, unit: 'px' },
        padding: { top: 48, right: 40, bottom: 48, left: 40, unit: 'px' }
      },
      background: {
        color: '#f1f5f9',
        opacity: 100
      },
      typography: {
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: { value: 17, unit: 'px' },
        fontWeight: '400',
        lineHeight: { value: 1.75, unit: 'unitless' },
        color: '#0f172a',
        textAlign: 'left'
      },
      border: {
        width: { top: 0, right: 0, bottom: 2, left: 0, unit: 'px' },
        style: 'solid',
        color: '#94a3b8',
        radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px' }
      },
      effects: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }
    }
  },

  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Energetic and colorful',
    icon: '🎨',
    category: 'creative',
    style: {
      spacing: {
        margin: { top: 32, right: 0, bottom: 32, left: 0, unit: 'px' },
        padding: { top: 40, right: 32, bottom: 40, left: 32, unit: 'px' }
      },
      background: {
        color: '#f0f9ff',
        opacity: 100
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: { value: 16, unit: 'px' },
        fontWeight: '500',
        lineHeight: { value: 1.6, unit: 'unitless' },
        color: '#0c4a6e',
        textAlign: 'left'
      },
      border: {
        width: { top: 0, right: 0, bottom: 0, left: 4, unit: 'px' },
        style: 'solid',
        color: '#3b82f6',
        radius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, unit: 'px' }
      },
      effects: {
        boxShadow: '0 4px 6px rgba(59,130,246,0.1)'
      }
    }
  },

  compact: {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient and tight',
    icon: '📦',
    category: 'utility',
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
        radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px' }
      },
      effects: {
        boxShadow: 'none'
      }
    }
  },

  spacious: {
    id: 'spacious',
    name: 'Spacious',
    description: 'Generous spacing and breathing room',
    icon: '🌬️',
    category: 'utility',
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
        boxShadow: '0 10px 15px rgba(0,0,0,0.05)'
      }
    }
  }
};

/**
 * Get all presets organized by category
 */
export function getPresetsByCategory() {
  const categories = {
    professional: [],
    creative: [],
    utility: []
  };

  Object.values(STYLE_PRESETS).forEach(preset => {
    if (categories[preset.category]) {
      categories[preset.category].push(preset);
    }
  });

  return categories;
}

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
  getPresetsByCategory,
  getPreset,
  getAllPresets,
  applyPresetToSettings
};
