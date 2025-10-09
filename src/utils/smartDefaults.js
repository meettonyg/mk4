/**
 * Smart Defaults System
 * 
 * Provides intelligent preset recommendations based on component type
 * and content context
 * 
 * @package Guestify
 * @version 4.0.0
 */

import { STYLE_PRESETS } from './stylePresets';

/**
 * Component category mappings
 * Groups components by their primary purpose
 */
const COMPONENT_CATEGORIES = {
  text_heavy: [
    'biography',
    'topics',
    'questions',
    'topics-questions',
    'authority-hook',
    'guest-intro'
  ],
  visual: [
    'photo-gallery',
    'logo-grid',
    'video-intro'
  ],
  interactive: [
    'call-to-action',
    'booking-calendar',
    'podcast-player',
    'social'
  ],
  data: [
    'stats',
    'contact',
    'testimonials'
  ],
  hero: [
    'hero'
  ]
};

/**
 * Preset recommendations by component category
 * Maps component categories to recommended preset IDs
 */
const PRESET_RECOMMENDATIONS = {
  text_heavy: {
    primary: 'classic',      // Best for reading
    secondary: ['elegant', 'minimal'],
    avoid: ['bold', 'compact']
  },
  visual: {
    primary: 'modern',
    secondary: ['minimal', 'spacious'],
    avoid: ['compact', 'classic']
  },
  interactive: {
    primary: 'bold',
    secondary: ['vibrant', 'modern'],
    avoid: ['minimal', 'elegant']
  },
  data: {
    primary: 'modern',
    secondary: ['compact', 'classic'],
    avoid: ['spacious', 'bold']
  },
  hero: {
    primary: 'bold',
    secondary: ['vibrant', 'modern'],
    avoid: ['compact', 'minimal']
  }
};

/**
 * Get component category from component type
 */
function getComponentCategory(componentType) {
  for (const [category, types] of Object.entries(COMPONENT_CATEGORIES)) {
    if (types.includes(componentType)) {
      return category;
    }
  }
  return 'text_heavy'; // Default fallback
}

/**
 * Get recommended presets for a component type
 * Returns array of preset IDs ordered by recommendation strength
 */
export function getRecommendedPresets(componentType) {
  const category = getComponentCategory(componentType);
  const recommendations = PRESET_RECOMMENDATIONS[category];
  
  if (!recommendations) {
    return ['modern', 'classic', 'minimal']; // Default recommendations
  }
  
  return [
    recommendations.primary,
    ...recommendations.secondary
  ];
}

/**
 * Get the top recommended preset for a component
 */
export function getTopRecommendation(componentType) {
  const category = getComponentCategory(componentType);
  const recommendations = PRESET_RECOMMENDATIONS[category];
  
  return recommendations?.primary || 'modern';
}

/**
 * Check if a preset is recommended for a component type
 */
export function isPresetRecommended(presetId, componentType) {
  const recommended = getRecommendedPresets(componentType);
  return recommended.includes(presetId);
}

/**
 * Check if a preset is the top recommendation
 */
export function isTopRecommendation(presetId, componentType) {
  return getTopRecommendation(componentType) === presetId;
}

/**
 * Get presets with recommendation flags
 * Adds metadata about which presets are recommended
 */
export function getPresetsWithRecommendations(componentType) {
  const recommended = getRecommendedPresets(componentType);
  const topRecommendation = getTopRecommendation(componentType);
  
  return Object.values(STYLE_PRESETS).map(preset => ({
    ...preset,
    isRecommended: recommended.includes(preset.id),
    isTopRecommendation: preset.id === topRecommendation,
    recommendationRank: recommended.indexOf(preset.id) + 1 // 0 if not recommended
  })).sort((a, b) => {
    // Sort recommended presets first
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    
    // Within recommended, sort by rank
    if (a.isRecommended && b.isRecommended) {
      return a.recommendationRank - b.recommendationRank;
    }
    
    // For non-recommended, maintain original order
    return 0;
  });
}

/**
 * Get explanation for why a preset is recommended
 */
export function getRecommendationReason(presetId, componentType) {
  const category = getComponentCategory(componentType);
  const recommendations = PRESET_RECOMMENDATIONS[category];
  
  if (!recommendations) return null;
  
  if (presetId === recommendations.primary) {
    const reasons = {
      text_heavy: 'Optimal for readability with comfortable spacing and typography',
      visual: 'Highlights visual content with clean, modern design',
      interactive: 'Attention-grabbing design that encourages interaction',
      data: 'Clean presentation perfect for displaying information',
      hero: 'Bold and impactful, ideal for making a strong first impression'
    };
    return reasons[category];
  }
  
  if (recommendations.secondary.includes(presetId)) {
    return 'Alternative style that works well with this component type';
  }
  
  return null;
}

/**
 * Smart defaults for component initialization
 * Returns optimal starting settings for a new component
 */
export function getSmartDefaults(componentType) {
  const topPreset = getTopRecommendation(componentType);
  const preset = STYLE_PRESETS[topPreset];
  
  if (!preset) {
    return null;
  }
  
  return {
    presetId: topPreset,
    presetName: preset.name,
    style: preset.style
  };
}

/**
 * Analyze current component settings and suggest improvements
 * This could be expanded to analyze actual content and suggest better presets
 */
export function analyzeAndSuggest(componentType, currentSettings) {
  const recommendations = getRecommendedPresets(componentType);
  const suggestions = [];
  
  // Check if using a non-recommended preset
  const category = getComponentCategory(componentType);
  const categoryRecs = PRESET_RECOMMENDATIONS[category];
  
  // Analyze spacing
  if (currentSettings.style?.spacing) {
    const { margin, padding } = currentSettings.style.spacing;
    const totalVerticalPadding = (padding?.top || 0) + (padding?.bottom || 0);
    
    if (category === 'text_heavy' && totalVerticalPadding < 40) {
      suggestions.push({
        type: 'spacing',
        severity: 'medium',
        message: 'Consider more padding for better readability',
        suggestedPresets: ['classic', 'elegant', 'spacious']
      });
    }
    
    if (category === 'interactive' && totalVerticalPadding < 50) {
      suggestions.push({
        type: 'spacing',
        severity: 'medium',
        message: 'Interactive elements benefit from generous spacing',
        suggestedPresets: ['bold', 'vibrant']
      });
    }
  }
  
  // Analyze typography (if available)
  if (currentSettings.style?.typography && category === 'text_heavy') {
    const fontSize = currentSettings.style.typography.fontSize?.value || 16;
    const lineHeight = currentSettings.style.typography.lineHeight?.value || 1.5;
    
    if (fontSize < 15) {
      suggestions.push({
        type: 'typography',
        severity: 'high',
        message: 'Small font size may hurt readability',
        suggestedPresets: ['classic', 'spacious']
      });
    }
    
    if (lineHeight < 1.5) {
      suggestions.push({
        type: 'typography',
        severity: 'medium',
        message: 'Increase line height for better readability',
        suggestedPresets: ['classic', 'elegant']
      });
    }
  }
  
  return suggestions;
}

export default {
  getRecommendedPresets,
  getTopRecommendation,
  isPresetRecommended,
  isTopRecommendation,
  getPresetsWithRecommendations,
  getRecommendationReason,
  getSmartDefaults,
  analyzeAndSuggest
};
